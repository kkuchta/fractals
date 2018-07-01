const PNGImage = require('pngjs-image');
const BG = require('bignumber.js');

// Upper left to lower right on the coordinate plain
const MIN = { x: new BG(-2), y: new BG(-1) };
const MAX = { x: new BG(1), y: new BG(1) };

// Number of positions to calculation along each axis - effectively the resolution
const WIDTH_IN_POINTS = 1000
const HEIGHT_IN_POINTS = 1000
let image = PNGImage.createImage(WIDTH_IN_POINTS, HEIGHT_IN_POINTS);

const MAX_ITERATIONS = 100;

// BigNumber gets kinda crazy without this.
const MAX_PRECISION = 100;
BG.config({ POW_PRECISION: MAX_PRECISION, DECIMAL_PLACES: MAX_PRECISION })

// a and b are elements of the complex number a + bi.  They make up the 'C' in
// the mandelbrot equation z^2 + c
function getEscapeCount(c) {

  // = (a + bi)^2
  // = a^2 - b^2 + 2abi
  // so
  // newA = (a^2 - b^2)
  // newB = 2abi
  //const newA = a.exponentiatedBy(2).minus(b.exponentiatedBy(2));
  //const newB = a.times(2).times(b);
  //console.log(` --- Examining ${c.a}, ${c.b} ---`);

  let z = { a: BG(0), b: BG(0) };
  for (let i = 0; i < MAX_ITERATIONS; i++) {

    // If a^2 + b^z > 2^2, we've escaped
    const modZ = z.a.exponentiatedBy(2).plus(z.b.exponentiatedBy(2));
    if (modZ.isGreaterThan(4)) {
      return i;
    }

    // = (a + bi)^2
    // = a^2 - b^2 + 2abi
    // so
    // newA = (a^2 - b^2)
    // newB = 2abi
    const zSquared = {
      a: z.a.exponentiatedBy(2).minus(z.b.exponentiatedBy(2)),
      b: z.a.times(2).times(z.b)
    }

    // z^2 + c
    // Adding 2 complex numbers just adds their components
    z = {
      a: zSquared.a.plus(c.a).dp(MAX_PRECISION),
      b: zSquared.b.plus(c.b).dp(MAX_PRECISION)
    };
    //console.log("New z = ", z.a.toFixed(), z.b.toFixed());
  }
  return -1;
}

for (let y = 0; y < HEIGHT_IN_POINTS; y++) {
  const fractalY = MIN.y.plus((MAX.y.minus(MIN.y)).dividedBy(HEIGHT_IN_POINTS).times(y));

  const row = [];
  for (let x = 0; x < WIDTH_IN_POINTS; x++) {
    const fractalX = MIN.x.plus((MAX.x.minus(MIN.x)).dividedBy(WIDTH_IN_POINTS).times(x));
    //process.stdout.write(` (${fractalX.toFixed(10)}, ${fractalY.toFixed(10)})`);
    const escapeCount = getEscapeCount({a: fractalX, b: fractalY})
    //row.push([fractalX.toFixed(2), fractalY.toFixed(2), escapeCount]);
    const value = escapeCount == -1 ? 255 : 0;
    const color = { red: value, green: value, blue: value, alpha: 200 };
    image.setAt(x, y, color);
    //process.stdout.write(` ${escapeCount} `)
    //process.stdout.write(` (${fractalX.toFixed(2)}, ${fractalY.toFixed(2)})=${escapeCount} `);
  }
  //process.stdout.write("\n");
}

image.writeImage('./out.png', function (err) {
    if (err) throw err;
    console.log('Written to the file');
});
