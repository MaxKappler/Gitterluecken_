// Ideal HCP only: a=2R, c/a=sqrt(8/3). See modelle/hdp/README.md.
const atom = '<mi>R</mi>';
const octa = '<msub><mi>r</mi><mi mathvariant="normal">O</mi></msub>';
const tetra = '<msub><mi>r</mi><mi mathvariant="normal">T</mi></msub>';
const root = n => `<msqrt><mn>${n}</mn></msqrt>`;
const fraction = (n, d) => `<mfrac><mrow>${n}</mrow><mrow>${d}</mrow></mfrac>`;
const math = body => `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mstyle displaystyle="true">${body}</mstyle></math>`;
const approx = value => math(`<mo>≈</mo><mn>${value}</mn><mi>a</mi>`);
export const hcpFormulae = Object.freeze({
  atomRadius: math(`${atom}<mo>=</mo>${fraction('<mi>a</mi>', '<mn>2</mn>')}`),
  atomRadiusApprox: math('<mo>=</mo><mn>0,5</mn><mi>a</mi>'),
  coordination: math('<mi>Z</mi><mo>=</mo><mn>12</mn>'),
  octaRadius: math(`${octa}<mo>=</mo>${fraction(`${root(2)}<mo>−</mo><mn>1</mn>`, '<mn>2</mn>')}<mi>a</mi>`),
  octaRadiusApprox: approx('0,2071'),
  tetraRadius: math(`${tetra}<mo>=</mo>${fraction(`${root(6)}<mo>−</mo><mn>2</mn>`, '<mn>4</mn>')}<mi>a</mi>`),
  tetraRadiusApprox: approx('0,1124'),
  octaRatio: math(`${fraction(octa, atom)}<mo>=</mo>${root(2)}<mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,4142</mn>`),
  tetraRatio: math(`${fraction(tetra, atom)}<mo>=</mo><msqrt>${fraction('<mn>3</mn>', '<mn>2</mn>')}</msqrt><mo>−</mo><mn>1</mn><mo>≈</mo><mn>0,2247</mn>`),
  heightRatio: math(`${fraction('<mi>c</mi>', '<mi>a</mi>')}<mo>=</mo><msqrt>${fraction('<mn>8</mn>', '<mn>3</mn>')}</msqrt><mo>≈</mo><mn>1,6330</mn>`)
});
