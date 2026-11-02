import de from './content/de.js?v=20261102-i18n';
import en from './content/en.js?v=20261102-i18n';
import {models, structures} from './models.js?v=20261102-kennwerte';
import {setupFullscreen} from './fullscreen.js';
import {createInterstitialControls, emptyInterstitialState} from './interstitial-controls.js?v=20261102-i18n';

const $ = id => document.getElementById(id);
const locales = {de, en};
let language = 'de';
let copy = de;
const t = key => key.split('.').reduce((object, part) => object[part], copy);
let viewer;
let structure = 'kfz';
let selected = 'kugelmodell';
let selectionRequest = 0;
let isReady = false;
let fatalError = false;
let failureKey = null;
let transparency = new Set();
let interstitialState = emptyInterstitialState();
const interstitialControls = createInterstitialControls([$('interstitial-sidebar'), $('interstitial-fullscreen')], (type, change) => {
  interstitialState[type] = {...interstitialState[type], ...change};
  viewer?.setInterstitial(type, interstitialState[type]);
  refreshInterstitialControls();
});

function refreshInterstitialControls() {
  const polyhedra = selected === 'kugelmittelpunkte';
  interstitialControls.update({settings: interstitialState, polyhedra, counts: viewer?.interstitialCounts() ?? {}, busy: !isReady}, copy.interstitials);
  const enabled = Object.values(interstitialState).some(setting => setting.enabled);
  $('interstitial-note-text').hidden = !enabled;
  let note = polyhedra ? copy.structures[structure].polyhedra : copy.interstitials.spheres;
  // Reserve the longest note at the current width, including wrapped mobile text.
  $('interstitial-note-space').textContent = polyhedra ? note + ' ' + copy.interstitials.neighbors : note;
  if (polyhedra && viewer?.hasVisibleContextAtoms()) note += ' ' + copy.interstitials.neighbors;
  $('interstitial-note-text').textContent = note;
}

function announce(message) { $('announcement').textContent = message; }
function refreshStructure() {
  const text = copy.structures[structure];
  const code = copy.codes[structure];
  document.title = `${copy.brand} · ${code}`;
  $('structure-title').textContent = text.title;
  $('fullscreen-structure').value = structure;
  $('facts-title').textContent = copy.facts.title(code);
  $('cell-counts-title').textContent = text.countsTitle ?? copy.facts.countsTitle;
  for (const element of document.querySelectorAll('[data-count]')) element.textContent = structures[structure].cellCounts[element.dataset.count];
  $('model-canvas').setAttribute('aria-label', copy.canvasLabel(code));
  for (const label of document.querySelectorAll('[data-i18n="dimension"]')) label.textContent = text.dimension ?? copy.dimension;
  $('scale-caption').textContent = text.scale ?? copy.scale;
  $('height-ratio').hidden = structure !== 'hdp';
  $('height-legend').hidden = structure !== 'hdp';
  for (const badge of document.querySelectorAll('[data-structure-code]')) badge.textContent = code;
  for (const button of document.querySelectorAll('[data-structure]')) {
    const active = button.dataset.structure === structure;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
    button.querySelector('.active-dot').hidden = !active;
  }
  // Formula markup comes only from fixed, local mathematical definitions.
  for (const element of document.querySelectorAll('[data-formula]')) {
    const formula = structures[structure].formulae[element.dataset.formula] ?? '';
    element.innerHTML = language === 'en' ? formula.replace(/(<mn>\d+),(\d+<\/mn>)/g, '$1.$2') : formula;
  }
  $('structure-facts-note').textContent = text.factsNote;
  $('structure-facts-note').hidden = !text.factsNote;
}

function setLanguage(next) {
  language = next;
  copy = locales[next];
  document.documentElement.lang = next;
  document.querySelector('meta[name="description"]').content = copy.description;
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === next));
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const element of document.querySelectorAll('[data-label]')) element.setAttribute('aria-label', t(element.dataset.label));
  $('help-content').replaceChildren();
  for (const [title, description] of copy.helpItems) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = title;
    dd.textContent = description;
    $('help-content').append(dt, dd);
  }
  for (const button of $('atom-buttons').children) button.textContent = copy.atomName(button.dataset.site, button.dataset.number);
  refreshStructure();
  showExplanation(selected);
  refreshFullscreenLabels($('viewer-panel').classList.contains('is-fullscreen'));
  refreshTransparency();
  if (failureKey) $('load-message').textContent = copy[failureKey];
  announce(failureKey ? copy[failureKey] : isReady ? copy.modelReady(copy.models[selected].name) : copy.loading);
}

for (const button of document.querySelectorAll('[data-language]')) {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.language);
    try { localStorage.setItem('gittertypen.language', language); } catch { /* Switching also works without storage. */ }
  });
}

function selectStructure(code) {
  if (!Object.hasOwn(structures, code) || structure === code) return;
  structure = code;
  $('atom-buttons').replaceChildren();
  transparency = new Set();
  for (const type of Object.keys(interstitialState)) {
    interstitialState[type] = {...interstitialState[type], index: 0, all: false};
    viewer?.setInterstitial(type, interstitialState[type]);
  }
  refreshStructure();
  if (!fatalError) selectModel(selected);
  else showExplanation(selected);
  closeMenu();
}
function setBusy(busy) {
  $('stage').setAttribute('aria-busy', String(busy));
  $('stage').dataset.interactive = String(!busy);
  for (const id of ['reset', 'zoom-in', 'zoom-out']) $(id).disabled = busy;
  $('model-canvas').style.pointerEvents = busy ? 'none' : '';
  $('model-canvas').tabIndex = busy ? -1 : 0;
  for (const button of $('atom-buttons').children) button.disabled = busy;
  isReady = !busy;
  refreshInterstitialControls();
}
function showFailure(key, fatal = false) {
  failureKey = key;
  const message = copy[key];
  fatalError = fatal;
  setBusy(true);
  $('load-state').hidden = false;
  $('load-state').classList.add('is-error');
  $('load-message').textContent = message;
  $('retry').hidden = false;
  $('dimension-label').hidden = true;
  $('height-label').hidden = true;
  $('transparency-badge').hidden = true;
  announce(message);
}
function showExplanation(key) {
  const text = copy.models[key];
  $('model-title').textContent = text.name;
  $('fullscreen-model').value = key;
  $('model-note').textContent = text.note;
  $('atom-access').hidden = !models[key].canToggleAtoms;
  refreshInterstitialControls();
}
function refreshTransparency(next = transparency) {
  transparency = new Set(next);
  const visible = selected === 'kugelmodell' && transparency.size > 0 && isReady;
  $('transparency-badge').hidden = !visible;
  $('transparency-badge').textContent = copy.transparentCount(transparency.size);
  for (const button of $('atom-buttons').children) {
    button.setAttribute('aria-pressed', String(transparency.has(button.dataset.atomId)));
  }
}
function createAtomButtons(atoms) {
  if (selected !== 'kugelmodell' || $('atom-buttons').children.length) return;
  const numbers = {};
  for (const atom of atoms) {
    const {atomId, site} = atom.userData;
    const button = document.createElement('button');
    button.type = 'button';
    numbers[site] = (numbers[site] ?? 0) + 1;
    button.dataset.site = site;
    button.dataset.number = numbers[site];
    button.textContent = copy.atomName(site, numbers[site]);
    button.dataset.atomId = atomId;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      viewer.toggleAtom(atomId);
      announce(copy.transparentCount(transparency.size));
    });
    $('atom-buttons').append(button);
  }
}
async function selectModel(key) {
  selected = key;
  failureKey = null;
  const request = ++selectionRequest;
  document.querySelector(`input[name="model"][value="${key}"]`).checked = true;
  showExplanation(key);
  setBusy(true);
  $('load-state').hidden = false;
  $('load-state').classList.remove('is-error');
  $('load-message').textContent = copy.loading;
  $('retry').hidden = true;
  $('transparency-badge').hidden = true;
  if (!viewer) return;
  try {
    const model = await viewer.select(structure, key);
    if (!model || request !== selectionRequest) return;
    createAtomButtons(model.atoms);
    setBusy(false);
    $('load-state').hidden = true;
    refreshTransparency();
    announce(copy.modelReady(copy.models[key].name));
  } catch (error) {
    if (request !== selectionRequest) return;
    console.error('Model loading failed:', error);
    showFailure('loadError');
  }
}

for (const button of document.querySelectorAll('[data-structure]')) {
  button.addEventListener('click', () => selectStructure(button.dataset.structure));
}
for (const radio of document.querySelectorAll('input[name="model"]')) {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      if (!fatalError) selectModel(radio.value);
      else { selected = radio.value; showExplanation(selected); }
      closeMenu();
    }
  });
}
const visibilityControls = {edges: ['show-edges', 'fullscreen-edges'], dimension: ['show-dimension', 'fullscreen-dimension']};
for (const [setting, ids] of Object.entries(visibilityControls)) {
  for (const id of ids) $(id).addEventListener('change', event => {
    const checked = event.target.checked;
    for (const matchingId of ids) $(matchingId).checked = checked;
    viewer?.setVisibility({[setting]: checked});
  });
}
$('reset').addEventListener('click', async () => {
  if (!isReady) return;
  await viewer.reset();
  interstitialState = emptyInterstitialState();
  refreshInterstitialControls();
  for (const ids of Object.values(visibilityControls)) for (const id of ids) $(id).checked = true;
  refreshTransparency();
  announce(copy.resetDone);
});
$('zoom-in').addEventListener('click', () => viewer?.zoom(1.2));
$('zoom-out').addEventListener('click', () => viewer?.zoom(1 / 1.2));
$('retry').addEventListener('click', () => fatalError ? location.reload() : selectModel(selected));
$('fullscreen-structure').addEventListener('change', event => selectStructure(event.target.value));
$('fullscreen-model').addEventListener('change', event => {
  if (!fatalError) selectModel(event.target.value);
});
function refreshFullscreenLabels(active) {
  $('fullscreen-text').textContent = active ? copy.fullscreen.close : copy.fullscreen.open;
  const label = active ? copy.fullscreen.close : copy.fullscreen.enter;
  $('fullscreen').setAttribute('aria-label', label);
  $('fullscreen').title = label;
}
setupFullscreen({
  panel: $('viewer-panel'), button: $('fullscreen'), dialog: $('fullscreen-dialog'),
  onChange(active) {
    $('fullscreen-selectors').hidden = !active;
    $('fullscreen-settings').hidden = !active;
    $('model-title').hidden = active;
    refreshFullscreenLabels(active);
    $('fullscreen-icon').setAttribute('href', active ? '#i-fullscreen-exit' : '#i-fullscreen');
    announce(active ? copy.fullscreen.opened : copy.fullscreen.closed);
  },
  onExitError: () => announce(copy.fullscreen.exitError)
});

const mobile = matchMedia('(max-width: 760px)');
function openMenu() {
  if (!mobile.matches) return;
  $('sidebar').classList.add('is-open');
  $('sidebar').inert = false;
  $('menu-backdrop').hidden = false;
  $('menu-open').setAttribute('aria-expanded', 'true');
  $('main').inert = true;
  document.body.style.overflow = 'hidden';
  $('menu-close').focus();
}
function closeMenu(returnFocus = true) {
  const wasOpen = $('sidebar').classList.contains('is-open');
  $('sidebar').classList.remove('is-open');
  $('sidebar').inert = mobile.matches;
  $('menu-backdrop').hidden = true;
  $('menu-open').setAttribute('aria-expanded', 'false');
  $('main').inert = false;
  document.body.style.overflow = '';
  if (wasOpen && returnFocus && mobile.matches) $('menu-open').focus();
}
$('menu-open').addEventListener('click', openMenu);
$('menu-close').addEventListener('click', () => closeMenu());
$('menu-backdrop').addEventListener('click', () => closeMenu());
mobile.addEventListener('change', () => closeMenu(false));
closeMenu(false);
$('sidebar').addEventListener('keydown', event => {
  if (!mobile.matches || !$('sidebar').classList.contains('is-open')) return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
  if (event.key !== 'Tab') return;
  const candidates = [...$('sidebar').querySelectorAll('button:not(:disabled), input')].filter(el => el.getClientRects().length);
  const first = candidates[0];
  const last = candidates.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

$('help-open').addEventListener('click', () => { closeMenu(false); $('help-dialog').showModal(); $('help-close').focus(); });
$('help-close').addEventListener('click', () => $('help-dialog').close());
$('help-dialog').addEventListener('close', () => (mobile.matches ? $('menu-open') : $('help-open')).focus());
$('help-dialog').addEventListener('click', event => {
  if (event.target !== $('help-dialog')) return;
  const rect = $('help-dialog').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('help-dialog').close();
});

let savedLanguage = 'de';
try { if (localStorage.getItem('gittertypen.language') === 'en') savedLanguage = 'en'; } catch { /* Default to German. */ }
setLanguage(savedLanguage);
try {
  const {CrystalViewer} = await import('./viewer.js?v=20261102-hdp4');
  try {
    viewer = new CrystalViewer({canvas: $('model-canvas'), stage: $('stage'), dimensionLabel: $('dimension-label'), heightLabel: $('height-label'),
      onTransparency: refreshTransparency,
      onContextLost: () => showFailure('contextLost', true)});
    viewer.setVisibility({edges: $('show-edges').checked, dimension: $('show-dimension').checked});
    await selectModel(selected);
  } catch (error) {
    console.error('Renderer initialization failed:', error);
    showFailure('graphicsError', true);
  }
} catch (error) {
  console.error('Viewer import failed:', error);
  showFailure('moduleError', true);
}
window.addEventListener('pagehide', event => { if (!event.persisted) viewer?.dispose(); });
