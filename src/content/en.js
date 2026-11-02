export default {
  skip: 'Skip to model', brand: 'Crystal structures',
  language: 'Language', codes: {kfz: 'FCC', krz: 'BCC', hdp: 'HCP'},
  description: 'Explore crystal structures and interstitial sites in FCC, BCC and HCP using hard-sphere, atom-centre and cutaway models.',
  navigation: 'Unit cell, representation and display', openMenu: 'Open menu', closeMenu: 'Close menu',
  unitCell: 'Unit cell', structureSelection: 'Select unit cell', structureType: 'Crystal structure',
  fccShort: 'Face-centred cubic', bccShort: 'Body-centred cubic', hcpShort: 'Hexagonal close-packed', later: 'Coming later',
  representation: 'Representation', show: 'Show', edges: 'Cell edges', dimension: 'Dimension a',
  help: 'Controls', closeHelp: 'Close controls',
  structures: {
    kfz: {
      title: 'Face-centred cubic', factsNote: '',
      polyhedra: 'Coordination polyhedra connect atom centres. Their faces do not bound the actual void.'
    },
    hdp: {
      title: 'Hexagonal close-packed', dimension: 'Dimensions a, c', scale: 'a = basal edge length · c = height',
      factsNote: 'Ideal ABAB stacking. The hexagonal prism shown contains three primitive cells.',
      countsTitle: 'Count per prism shown',
      polyhedra: 'Regular coordination polyhedra connect atom centres. Their faces do not bound the actual void.'
    },
    krz: {
      title: 'Body-centred cubic',
      factsNote: 'Both coordination polyhedra in BCC are distorted. A sphere in an octahedral site touches only the two closest atoms. The other four are farther away.',
      polyhedra: 'Distorted coordination polyhedra connect atom centres. Their faces do not bound the actual void.'
    }
  },
  reset: 'Reset', resetAll: 'Reset view, transparency and visibility settings',
  fullscreen: {
    open: 'Full screen', close: 'Exit full screen', enter: 'Open 3D view in full screen',
    dialog: 'Full-screen 3D view', opened: 'Full screen opened. Press Escape or select Exit full screen to return.',
    closed: 'Full screen closed.', exitError: 'Press Escape to exit full screen.'
  },
  canvasLabel: code => `Rotatable model of the ${code} unit cell. Use the arrow keys to rotate, plus and minus to zoom, and Home to reset the view.`,
  loading: 'Loading model …', retry: 'Try again', zoom: 'Zoom', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
  gestures: 'Drag to rotate · Scroll or pinch to zoom', scale: 'a = edge length',
  atomList: 'Select spheres from a list', atomListHint: 'Use this list as an alternative to selecting spheres in the model. Select a sphere again to restore it.',
  fixedGeometry: 'Atom positions and radii are fixed.',
  transparentCount: count => count === 1 ? '1 transparent sphere' : `${count} transparent spheres`,
  atomName: (site, number) => site === 'body' ? 'Body-centred sphere' : `${({corner: 'Corner sphere', face: 'Face-centred sphere', basal: 'Basal face-centred sphere', middle: 'Middle-layer sphere', neighbor: 'Neighbouring sphere'})[site]} ${number}`,
  modelReady: name => `${name} loaded.`, resetDone: 'View and all spheres reset.',
  loadError: 'The model could not be loaded. Please try again.',
  graphicsError: 'The 3D view requires WebGL 2. Open the site in an up-to-date browser with hardware acceleration enabled.',
  contextLost: 'The graphics connection was lost. Please reload the page.',
  moduleError: 'The viewer could not start. Open the site using a local web server or GitHub Pages.',
  facts: {
    title: code => `${code} · Properties`, assumption: 'Ideal hard-sphere model',
    atom: 'Host atom', octahedral: 'Octahedral site', tetrahedral: 'Tetrahedral site',
    radius: 'Atomic radius', inscribedRadius: 'Maximum sphere radius',
    coordination: 'Coordination number (number of nearest neighbours)', ratio: 'Radius ratio',
    countsTitle: 'Count per unit cell', atoms: 'Atoms',
    latticeConstant: 'Lattice parameter', noExpansion: 'Interstitial sphere radii without lattice expansion.',
    heightRatio: 'Ideal axial ratio', height: 'Prism height'
  },
  interstitials: {
    title: 'Interstitial sites', octahedral: 'Octahedral sites', tetrahedral: 'Tetrahedral sites',
    all: 'Show all', previous: type => `Previous ${type} site`, next: type => `Next ${type} site`,
    allLabel: type => `Show all ${type} sites`,
    position: (index, count, all) => count > 0 ? `${all ? count : index + 1} of ${count}` : '–',
    spheres: 'Coloured spheres show the largest spheres that fit in the ideal lattice. They occupy only part of the void.',
    neighbors: 'Polyhedron vertices marked outside the cell are atom centres in neighbouring cells.'
  },
  models: {
    kugelmodell: {
      name: 'Hard-sphere model', short: 'Touching spheres',
      note: 'Click or tap a sphere to see inside. Select it again to restore it.'
    },
    kugelmittelpunkte: {
      name: 'Atom centres', short: 'Atom positions',
      note: 'The atom-centre model shows atom positions. The markers do not represent the actual atomic radii.'
    },
    schnittmodell: {
      name: 'Cutaway model', short: 'Atom fractions in the cell',
      note: 'The cutaway model shows the fraction of each atom within the unit cell.'
    }
  },
  helpItems: [
    ['Interstitial sites', 'Octahedral sites are red and tetrahedral sites are yellow. Each type can be shown independently. The hard-sphere and cutaway models show the largest spheres that fit in these sites. In the cutaway model, these spheres are also cut at the cell boundaries and the cut faces are closed.'],
    ['Coordination polyhedra', 'Use the arrows beside the count to select the previous or next polyhedron. “Show all” displays all sites of that type. Atom centres in neighbouring cells are shown where needed at the vertices of visible polyhedra. Sites on cell boundaries are shared by adjacent cells.'],
    ['Change model', 'Choose a representation on the left. On a phone, open the menu to do this. One model is shown at a time. Switching models preserves the viewing direction and zoom.'],
    ['Rotate and zoom', 'Drag with the mouse or one finger to rotate. Use the scroll wheel, pinch with two fingers, or use the plus and minus buttons beside the model to zoom.'],
    ['Look inside', 'In the hard-sphere model, click or tap a sphere to make it transparent. Select it again to restore it. The selection is preserved when you switch models.']
  ]
};
