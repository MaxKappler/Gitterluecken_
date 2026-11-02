// Ideal BCC: 4R = sqrt(3)*a; the octahedral radius is limited by TWO close atoms.
// See modelle/krz/README.md and the independent geometry report.
const atom = '<mi>R</mi>';
const octa = '<msub><mi>r</mi><mi mathvariant="normal">O</mi></msub>';
const tetra = '<msub><mi>r</mi><mi mathvariant="normal">T</mi></msub>';
const root = n => `<msqrt><mn>${n}</mn></msqrt>`;
const fraction = (n, d) => `<mfrac><mrow>${n}</mrow><mrow>${d}</mrow></mfrac>`;
const math = body => `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mstyle displaystyle="true">${body}</mstyle></math>`;
const approx = value => math(`<mo>≈</mo><mn>${value}</mn><mi>a</mi>`);

export const bccFormulae = Object.freeze({
  atomRadius: math(`${atom}<mo>=</mo>${fraction(root(3), '<mn>4</mn>')}<mi>a</mi>`),
  atomRadiusApprox: approx('0,4330'),
  coordination: math('<mi>Z</mi><mo>=</mo><mn>8</mn>'),
  octaRadius: math(`${octa}<mo>=</mo>${fraction(`<mn>2</mn><mo>−</mo>${root(3)}`, '<mn>4</mn>')}<mi>a</mi>`),
  octaRadiusApprox: approx('0,06699'),
  tetraRadius: math(`${tetra}<mo>=</mo>${fraction(`${root(5)}<mo>−</mo>${root(3)}`, '<mn>4</mn>')}<mi>a</mi>`),
  tetraRadiusApprox: approx('0,1260'),
  octaRatio: math(`${fraction(octa, atom)}<mo>=</mo>${fraction('<mn>2</mn>', root(3))}<mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,1547</mn>`),
  tetraRatio: math(`${fraction(tetra, atom)}<mo>=</mo><msqrt>${fraction('<mn>5</mn>', '<mn>3</mn>')}</msqrt><mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,2910</mn>`)
});
