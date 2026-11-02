export default {
  skip: 'Zum Modell', brand: 'Gittertypen',
  language: 'Sprache', codes: {kfz: 'kfz', krz: 'krz', hdp: 'hdp'},
  description: 'Kristallstrukturen und Gitterlücken interaktiv verstehen: kfz, krz und hdp als Kugelmodell, Kugelmittelpunktmodell und Schnittmodell.',
  navigation: 'Elementarzelle, Darstellung und Anzeige', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen',
  unitCell: 'Elementarzelle', structureSelection: 'Elementarzelle auswählen', structureType: 'Gittertyp',
  fccShort: 'Flächenzentriert', bccShort: 'Raumzentriert', hcpShort: 'Hexagonal', later: 'Folgt',
  representation: 'Darstellung', show: 'Einblenden', edges: 'Zellkanten', dimension: 'Bemaßung a',
  help: 'Bedienung', closeHelp: 'Bedienung schließen',
  structures: {
    kfz: {
      title: 'Kubisch flächenzentriert', factsNote: '',
      polyhedra: 'Koordinationspolyeder verbinden Atommittelpunkte; ihre Flächen begrenzen nicht den tatsächlichen Zwischenraum.'
    },
    hdp: {
      title: 'Hexagonal dichteste Packung', dimension: 'Bemaßung a, c', scale: 'a = Basiskante · c = Höhe',
      factsNote: 'Ideale ABAB-Packung. Das dargestellte große Prisma umfasst drei primitive Zellen.',
      countsTitle: 'Anzahl pro dargestelltem Prisma',
      polyhedra: 'Regelmäßige Koordinationspolyeder verbinden Atommittelpunkte; ihre Flächen begrenzen nicht den tatsächlichen Zwischenraum.'
    },
    krz: {
      title: 'Kubisch raumzentriert',
      factsNote: 'krz: Beide Koordinationspolyeder sind verzerrt. Die Oktaederlückenkugel berührt nur die zwei näheren Atome; vier weitere liegen weiter entfernt.',
      polyhedra: 'Verzerrte Koordinationspolyeder verbinden Atommittelpunkte; ihre Flächen begrenzen nicht den tatsächlichen Zwischenraum.'
    }
  },
  reset: 'Zurücksetzen', resetAll: 'Ansicht, Transparenz und Einblendungen zurücksetzen',
  fullscreen: {
    open: 'Vollbild', close: 'Vollbild verlassen', enter: '3D-Ansicht im Vollbild öffnen',
    dialog: '3D-Ansicht im Vollbild', opened: 'Vollbild geöffnet. Mit Escape oder der Schaltfläche Vollbild verlassen zurückkehren.',
    closed: 'Vollbild geschlossen.', exitError: 'Bitte verlasse das Vollbild mit der Escape-Taste.'
  },
  canvasLabel: code => `Drehbares Modell der ${code}-Elementarzelle. Pfeiltasten drehen, Plus und Minus zoomen, Pos1 setzt die Ansicht zurück.`,
  loading: 'Modell wird geladen …', retry: 'Erneut versuchen', zoom: 'Zoom', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern',
  gestures: 'Ziehen zum Drehen · Scrollen oder Aufziehen zum Zoomen', scale: 'a = Kantenlänge',
  atomList: 'Kugeln per Liste auswählen', atomListHint: 'Alternative zum Anklicken im Modell. Erneutes Auswählen stellt die Kugel wieder her.',
  fixedGeometry: 'Atompositionen und Radien sind fest vorgegeben.',
  transparentCount: count => count === 1 ? '1 Kugel transparent' : `${count} Kugeln transparent`,
  atomName: (site, number) => site === 'body' ? 'Zentralkugel' : `${({corner: 'Eckkugel', face: 'Flächenkugel', basal: 'Basismittelkugel', middle: 'Mittelschichtkugel', neighbor: 'Nachbarkugel'})[site]} ${number}`,
  modelReady: name => `${name} geladen.`, resetDone: 'Ansicht und alle Kugeln zurückgesetzt.',
  loadError: 'Das Modell konnte nicht geladen werden. Bitte versuche es erneut.',
  graphicsError: 'Die 3D-Ansicht benötigt WebGL 2. Bitte öffne die Seite in einem aktuellen Browser mit aktivierter Grafikbeschleunigung.',
  contextLost: 'Die Grafikverbindung wurde unterbrochen. Bitte lade die Ansicht erneut.',
  moduleError: 'Der Viewer konnte nicht gestartet werden. Bitte lade die Seite über einen lokalen Webserver oder GitHub Pages.',
  facts: {
    title: code => `${code} · Kennwerte`, assumption: 'Ideales Hartkugelmodell',
    atom: 'Gitteratom', octahedral: 'Oktaederlücke', tetrahedral: 'Tetraederlücke',
    radius: 'Atomradius', inscribedRadius: 'Maximaler Kugelradius',
    coordination: 'Koordinationszahl (Anzahl nächster Nachbarn)', ratio: 'Radienverhältnis',
    countsTitle: 'Anzahl pro Elementarzelle', atoms: 'Atome',
    latticeConstant: 'Gitterkonstante', noExpansion: 'Lückenradien ohne Gitteraufweitung.',
    heightRatio: 'Ideales Höhenverhältnis', height: 'Prismenhöhe'
  },
  interstitials: {
    title: 'Gitterlücken', octahedral: 'Oktaederlücken', tetrahedral: 'Tetraederlücken',
    all: 'Alle anzeigen', previous: type => `Vorherige ${type === 'octahedral' ? 'Oktaederlücke' : 'Tetraederlücke'}`,
    allLabel: type => `Alle ${type === 'octahedral' ? 'Oktaederpositionen' : 'Tetraederpositionen'} anzeigen`,
    next: type => `Nächste ${type === 'octahedral' ? 'Oktaederlücke' : 'Tetraederlücke'}`,
    position: (index, count, all) => count > 0 ? `${all ? count : index + 1} von ${count}` : '–',
    spheres: 'Farbige Kugeln: maximal passende Kugeln im idealen Gitter, nicht der gesamte Zwischenraum.',
    neighbors: 'Die markierten Polyederecken außerhalb der Zelle zeigen Atommittelpunkte aus Nachbarzellen.'
  },
  models: {
    kugelmodell: {
      name: 'Kugelmodell', short: 'Berührende Kugeln',
      note: 'Kugeln anklicken oder antippen, um ins Innere zu sehen. Erneutes Anklicken stellt sie wieder her.'
    },
    kugelmittelpunkte: {
      name: 'Kugelmittelpunkte', short: 'Positionen der Atome',
      note: 'Das Kugelmittelpunktmodell zeigt nicht die tatsächlichen Atomradien, sondern dient der Darstellung der Atompositionen'
    },
    schnittmodell: {
      name: 'Schnittmodell', short: 'Atomanteile in der Zelle',
      note: 'Das Schnittmodell zeigt anschaulich die Anteile der Atome pro Elementarzelle.'
    }
  },
  helpItems: [
    ['Gitterlücken', 'Oktaederlücken sind rot, Tetraederlücken gelb. Beide Typen lassen sich unabhängig einblenden. Im Kugel- und Schnittmodell erscheinen maximal passende Kugeln; im Schnittmodell werden auch diese an den Zellgrenzen geschlossen abgeschnitten.'],
    ['Koordinationspolyeder', 'Die Pfeiltasten neben der Zählung wechseln zum vorherigen oder nächsten Polyeder. „Alle anzeigen“ zeigt alle Positionen eines Typs. An den Ecken der sichtbaren Polyeder werden bei Bedarf Atommittelpunkte aus Nachbarzellen ergänzt. Lückenplätze auf Zellgrenzen werden zwischen den angrenzenden Zellen geteilt.'],
    ['Modell wechseln', 'Wähle links eine Darstellung aus. Auf dem Smartphone öffnest du dafür das Menü. Es ist immer nur ein Modell sichtbar; Blickrichtung und Zoom bleiben beim Wechsel erhalten.'],
    ['Drehen und zoomen', 'Mit gedrückter Maustaste oder einem Finger ziehen. Zum Zoomen das Mausrad, zwei Finger oder die Plus- und Minustasten neben dem Modell verwenden.'],
    ['Ins Innere sehen', 'Im Kugelmodell schaltet ein Klick oder Antippen eine einzelne Kugel transparent. Ein zweites Mal stellt sie wieder her. Die Auswahl bleibt beim Modellwechsel erhalten.']
  ]
};
