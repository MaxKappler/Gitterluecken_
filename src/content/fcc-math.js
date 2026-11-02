// Exact FCC hard-sphere geometry, independent of the selected visual representation.
// R = sqrt(2)*a/4; r_O = a/2 - R; r_T = sqrt(3)*a/4 - R.
// See pruefung/kfz-kennwerte.md for the derivation and sources.
// Native MathML supplies real stacked fractions and accessible mathematical structure.
const atom = '<mi>R</mi>';
const octa = '<msub><mi>r</mi><mi mathvariant="normal">O</mi></msub>';
const tetra = '<msub><mi>r</mi><mi mathvariant="normal">T</mi></msub>';
const root = number => `<msqrt><mn>${number}</mn></msqrt>`;
const fraction = (numerator, denominator) => `<mfrac><mrow>${numerator}</mrow><mrow>${denominator}</mrow></mfrac>`;
const math = body => `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mstyle displaystyle="true">${body}</mstyle></math>`;
const approx = value => math(`<mo>≈</mo><mn>${value}</mn><mi>a</mi>`);

export const fccFormulae = Object.freeze({
  atomRadius: math(`${atom}<mo>=</mo>${fraction(root(2), '<mn>4</mn>')}<mi>a</mi>`),
  atomRadiusApprox: approx('0,3536'),
  coordination: math('<mi>Z</mi><mo>=</mo><mn>12</mn>'),
  octaRadius: math(`${octa}<mo>=</mo>${fraction(`<mn>2</mn><mo>−</mo>${root(2)}`, '<mn>4</mn>')}<mi>a</mi>`),
  octaRadiusApprox: approx('0,1464'),
  tetraRadius: math(`${tetra}<mo>=</mo>${fraction(`${root(3)}<mo>−</mo>${root(2)}`, '<mn>4</mn>')}<mi>a</mi>`),
  tetraRadiusApprox: approx('0,07946'),
  octaRatio: math(`${fraction(octa, atom)}<mo>=</mo>${root(2)}<mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,4142</mn>`),
  tetraRatio: math(`${fraction(tetra, atom)}<mo>=</mo><msqrt>${fraction('<mn>3</mn>', '<mn>2</mn>')}</msqrt><mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,2247</mn>`)
});
