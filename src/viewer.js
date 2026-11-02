import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {models, structures} from './models.js?v=20261102-hdp4';

const DEFAULT_TARGET = new THREE.Vector3(0, -0.12, 0);
const DEFAULT_DIRECTION = new THREE.Vector3(3, 2.15, 3.8).normalize();
const INITIAL_EXTENT = 2.8;

export class CrystalViewer {
  constructor({canvas, stage, dimensionLabel, heightLabel, onTransparency, onContextLost}) {
    this.canvas = canvas;
    this.stage = stage;
    this.dimensionLabel = dimensionLabel;
    this.heightLabel = heightLabel;
    this.onTransparency = onTransparency;
    this.onContextLost = onContextLost;
    this.cache = new Map();
    this.active = null;
    this.request = 0;
    this.pendingFrame = null;
    this.disposed = false;
    this.structure = 'kfz';
    this.transparencyByStructure = new Map();
    this.showEdges = true;
    this.showDimension = true;
    this.interstitials = {
      octahedral: {enabled: false, index: 0, all: false},
      tetrahedral: {enabled: false, index: 0, all: false}
    };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.position = new THREE.Vector3();
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 80);
    this.camera.position.copy(DEFAULT_DIRECTION).multiplyScalar(7).add(DEFAULT_TARGET);
    this.camera.lookAt(DEFAULT_TARGET);
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'low-power'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.scene.add(new THREE.HemisphereLight(0xe8f0f7, 0x687784, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-3, 5, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xc5d5e3, 0.5);
    fill.position.set(4, 1, -3);
    this.scene.add(fill);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.copy(DEFAULT_TARGET);
    this.controls.enablePan = false;
    this.controls.enableDamping = false;
    this.controls.autoRotate = false;
    this.controls.minZoom = 0.65;
    this.controls.maxZoom = 3.5;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.8;
    this.controls.touches = {ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE};
    this.controls.update();
    this.controls.addEventListener('change', () => this.scheduleRender());
    this.loader = new GLTFLoader();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    this.events = new AbortController();
    this.bindInput();
    this.resize();
  }

  resize() {
    if (this.disposed) return;
    const {width, height} = this.stage.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    // The same framing is used for every representation. Full spheres must fit on mobile too.
    const extent = structures[this.structure].viewExtent ?? INITIAL_EXTENT;
    const vertical = Math.max(extent, extent / aspect);
    this.camera.left = -vertical * aspect / 2;
    this.camera.right = vertical * aspect / 2;
    this.camera.top = vertical / 2;
    this.camera.bottom = -vertical / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.scheduleRender();
  }

  scheduleRender() {
    if (this.pendingFrame !== null || this.disposed) return;
    this.pendingFrame = requestAnimationFrame(() => {
      this.pendingFrame = null;
      this.renderer.render(this.scene, this.camera);
      this.updateLabel();
    });
  }

  updateLabel() {
    for (const [anchor, label] of [[this.active?.anchor, this.dimensionLabel], [this.active?.heightAnchor, this.heightLabel]]) {
      if (!anchor || !this.showDimension) {
        label.hidden = true;
        continue;
      }
      anchor.getWorldPosition(this.position).project(this.camera);
      const visible = Math.abs(this.position.x) < 0.96 && Math.abs(this.position.y) < 0.96 && Math.abs(this.position.z) <= 1;
      label.hidden = !visible;
      if (visible) {
        const x = (this.position.x + 1) * this.stage.clientWidth / 2;
        const y = (1 - this.position.y) * this.stage.clientHeight / 2;
        label.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      }
    }
  }

  get translucent() {
    if (!this.transparencyByStructure.has(this.structure)) this.transparencyByStructure.set(this.structure, new Set());
    return this.transparencyByStructure.get(this.structure);
  }

  async prepare(structure, key) {
    const cacheKey = `${structure}/${key}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    const definition = structures[structure];
    const task = this.loader.loadAsync(definition.assets[key].href).then(gltf => {
      const root = gltf.scene;
      const atoms = [];
      root.traverse(object => {
        if (object.userData.role === 'atom') atoms.push(object);
        if (object.userData.role === 'static_label') object.visible = false;
        if (object.userData.role === 'polyhedron_faces' && object.isMesh) object.material.depthWrite = false;
      });
      if (atoms.length !== definition.atomPositionCount) throw new Error('Unexpected atom count in fixed crystal model');
      const materialStates = new Map();
      for (const atom of atoms) {
        atom.traverse(object => {
          if (!object.isMesh) return;
          object.userData.atomRoot = atom;
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materialStates.set(material, {opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite});
          }
        });
      }
      const interstitials = Object.fromEntries(Object.keys(this.interstitials).map(type => {
        const group = root.getObjectByName('luecken_' + type);
        if (!group?.children.length) throw new Error('Missing fixed interstitial geometry');
        group.visible = false;
        return [type, group];
      }));
      return {structure, key, root, atoms, materialStates, interstitials,
        edges: root.getObjectByName('zellkanten'),
        dimension: root.getObjectByName('bemassung_a'),
        anchor: root.getObjectByName('anker_beschriftung_a'),
        heightDimension: root.getObjectByName('bemassung_c'),
        heightAnchor: root.getObjectByName('anker_beschriftung_c')};
    }).catch(error => {
      this.cache.delete(cacheKey);
      throw error;
    });
    this.cache.set(cacheKey, task);
    return task;
  }

  async select(structure, key) {
    if (!Object.hasOwn(structures, structure) || !Object.hasOwn(models, key)) throw new Error('Unknown fixed model');
    const request = ++this.request;
    const model = await this.prepare(structure, key);
    if (request !== this.request || this.disposed) return null;
    // One model root in the scene, including during rapid selection changes.
    if (this.active) this.scene.remove(this.active.root);
    this.structure = structure;
    this.active = model;
    this.scene.add(model.root);
    this.resize();
    this.applyVisibility();
    this.scheduleRender();
    this.onTransparency(this.translucent);
    return model;
  }

  applyVisibility() {
    if (this.active?.edges) this.active.edges.visible = this.showEdges;
    if (this.active?.dimension) this.active.dimension.visible = this.showDimension;
    if (this.active?.heightDimension) this.active.heightDimension.visible = this.showDimension;
    const contextPositions = new Set();
    for (const [type, setting] of Object.entries(this.interstitials)) {
      const group = this.active?.interstitials[type];
      if (!group) continue;
      group.visible = setting.enabled;
      group.children.forEach((site, index) => {
        site.visible = this.active.key !== 'kugelmittelpunkte' || setting.all || index === setting.index;
        // Adjacent octahedra may share context markers; draw each position only once.
        site.traverse(object => {
          if (object.userData.role !== 'context_atom') return;
          const position = (object.userData.positionInA ?? object.userData.fractionalPosition).join(',');
          object.visible = group.visible && site.visible && !contextPositions.has(position);
          if (object.visible) contextPositions.add(position);
        });
      });
    }
    this.scheduleRender();
  }

  setVisibility({edges = this.showEdges, dimension = this.showDimension}) {
    this.showEdges = edges;
    this.showDimension = dimension;
    this.applyVisibility();
  }

  toggleAtom(id) {
    if (!this.active || !models[this.active.key].canToggleAtoms) return;
    const atom = this.active.atoms.find(item => item.userData.atomId === id);
    if (!atom) return;
    const enable = !this.translucent.has(id);
    if (enable) this.translucent.add(id);
    else this.translucent.delete(id);
    this.setAtomTransparency(atom, enable, this.active);
    this.onTransparency(this.translucent);
    this.scheduleRender();
  }

  setInterstitial(type, setting) {
    if (!Object.hasOwn(this.interstitials, type)) return;
    this.interstitials[type] = {...this.interstitials[type], ...setting};
    this.applyVisibility();
  }

  interstitialCounts() {
    return Object.fromEntries(Object.entries(this.active?.interstitials ?? {}).map(([type, group]) => [type, group.children.length]));
  }

  hasVisibleContextAtoms() {
    return Object.values(this.active?.interstitials ?? {}).some(group => group.visible && group.children.some(site =>
      site.visible && site.children.some(child => child.userData.role === 'context_atom' && child.visible)));
  }

  setAtomTransparency(atom, transparent, model) {
    atom.traverse(object => {
      if (!object.isMesh) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const original = model.materialStates.get(material);
        material.opacity = transparent ? 0.18 : original.opacity;
        material.transparent = transparent || original.transparent;
        material.depthWrite = transparent ? false : original.depthWrite;
        material.needsUpdate = true;
      }
    });
  }

  async reset() {
    // Only the full-sphere model owns transparency; reset it even when another model is shown.
    const fullTask = this.cache.get(`${this.structure}/kugelmodell`);
    this.translucent.clear();
    if (fullTask) {
      const full = await fullTask.catch(() => null);
      if (full) for (const atom of full.atoms) this.setAtomTransparency(atom, false, full);
    }
    if (this.disposed) return;
    for (const type of Object.keys(this.interstitials)) this.interstitials[type] = {enabled: false, index: 0, all: false};
    this.setVisibility({edges: true, dimension: true});
    this.resetView();
    this.onTransparency(this.translucent);
  }

  resetView() {
    this.camera.position.copy(DEFAULT_DIRECTION).multiplyScalar(7).add(DEFAULT_TARGET);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(DEFAULT_TARGET);
    this.controls.update();
    this.scheduleRender();
  }

  zoom(factor) {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, this.controls.minZoom, this.controls.maxZoom);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.scheduleRender();
  }

  atomAt(clientX, clientY) {
    if (!this.active || !models[this.active.key].canToggleAtoms) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    this.scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.active.atoms, true)[0];
    return hit?.object.userData.atomRoot ?? null;
  }

  bindInput() {
    const options = {signal: this.events.signal};
    const pointers = new Map();
    let wasMultiTouch = false;
    this.canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY, moved: false, time: performance.now()});
      if (pointers.size > 1) wasMultiTouch = true;
    }, options);
    this.canvas.addEventListener('pointermove', event => {
      const start = pointers.get(event.pointerId);
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) start.moved = true;
    }, options);
    this.canvas.addEventListener('pointerup', event => {
      const start = pointers.get(event.pointerId);
      pointers.delete(event.pointerId);
      if (start && !start.moved && !wasMultiTouch && performance.now() - start.time < 650) {
        const atom = this.atomAt(event.clientX, event.clientY);
        if (atom) this.toggleAtom(atom.userData.atomId);
      }
      if (!pointers.size) wasMultiTouch = false;
    }, options);
    const cancelPointer = event => {
      pointers.delete(event.pointerId);
      if (!pointers.size) wasMultiTouch = false;
    };
    this.canvas.addEventListener('pointercancel', cancelPointer, options);
    this.canvas.addEventListener('lostpointercapture', cancelPointer, options);
    this.canvas.addEventListener('keydown', event => {
      if (['+', '=', '-', '−'].includes(event.key)) {
        event.preventDefault();
        this.zoom(['+', '='].includes(event.key) ? 1.15 : 1 / 1.15);
      } else if (event.key === 'Home') {
        event.preventDefault();
        this.resetView();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const offset = this.camera.position.clone().sub(this.controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        if (event.key === 'ArrowLeft') spherical.theta -= 0.12;
        if (event.key === 'ArrowRight') spherical.theta += 0.12;
        if (event.key === 'ArrowUp') spherical.phi -= 0.12;
        if (event.key === 'ArrowDown') spherical.phi += 0.12;
        spherical.makeSafe();
        this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(spherical));
        this.controls.update();
        this.scheduleRender();
      }
    }, options);
    this.canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.onContextLost();
    }, options);
  }

  dispose() {
    this.disposed = true;
    this.request++;
    cancelAnimationFrame(this.pendingFrame);
    this.events.abort();
    this.resizeObserver.disconnect();
    this.controls.dispose();
    for (const task of this.cache.values()) task.then(model => {
      const geometry = new Set();
      const materials = new Set();
      model.root.traverse(object => {
        if (object.geometry) geometry.add(object.geometry);
        if (object.material) for (const m of Array.isArray(object.material) ? object.material : [object.material]) materials.add(m);
      });
      for (const g of geometry) g.dispose();
      for (const m of materials) m.dispose();
    }).catch(() => {});
    this.renderer.dispose();
  }
}
