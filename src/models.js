import {fccFormulae} from './content/fcc-math.js';
import {bccFormulae} from './content/bcc-math.js';
import {hcpFormulae} from './content/hcp-math.js';

// One shared viewer and interface; each structure supplies its own verified assets.
export const models = Object.freeze({
  kugelmodell: {canToggleAtoms: true},
  kugelmittelpunkte: {canToggleAtoms: false},
  schnittmodell: {canToggleAtoms: false}
});
const assets = (code, version) => Object.fromEntries(Object.keys(models).map(key =>
  [key, new URL(`../modelle/${code}/${code}-${key}.glb?v=${version}`, import.meta.url)]));
export const structures = Object.freeze({
  kfz: {scientificCode: 'fcc', atomPositionCount: 14, cellCounts: {atoms: 4, octahedral: 4, tetrahedral: 8},
    formulae: fccFormulae, assets: assets('kfz', '20261031-luecken2')},
  krz: {scientificCode: 'bcc', atomPositionCount: 9, cellCounts: {atoms: 2, octahedral: 6, tetrahedral: 12},
    formulae: bccFormulae, assets: assets('krz', '20261031-krz1')},
  hdp: {scientificCode: 'hcp', atomPositionCount: 17, cellCounts: {atoms: 6, octahedral: 6, tetrahedral: 12},
    viewExtent: 4.4, formulae: hcpFormulae, assets: assets('hdp', '20261102-hdp4')}
});
