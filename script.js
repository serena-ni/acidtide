/* constant */

const BASE_YEAR = 1900;
const BASE_CO2 = 280;
const BASE_PH = 8.2;

const SCENARIOS = {
  optimistic: 0.010,
  realistic: 0.020,
  worst: 0.030
};

const NUM_PLANKTON = 140;
const NUM_BUBBLES = 45;
const WAVE_LAYERS = 3;

/* state */

let yearSlider, yearDisplay, scenarioSelect, phDisplay, coralStatus;
let plankton = [];
let bubbles = [];
let time = 0;

/* setup */

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight * 0.5);
  cnv.parent(document.body);
  noStroke();

  yearSlider = select('#yearSlider');
  yearDisplay = select('#yearDisplay');
  scenarioSelect = select('#scenarioSelect');
  phDisplay = select('#phDisplay');
  coralStatus = select('#coralStatus');

  yearSlider.input(updateUI);
  scenarioSelect.changed(updateUI);

  for (let i = 0; i < NUM_PLANKTON; i++) {
    plankton.push({
      x: random(width),
      y: random(height * 0.5),
      speed: random(0.15, 0.45),
      size: random(3, 6),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < NUM_BUBBLES; i++) {
    bubbles.push({
      x: random(width),
      y: random(height, height * 0.6),
      speed: random(0.25, 0.6),
      size: random(5, 11),
      alpha: random(50, 90)
    });
  }

  updateUI();
}

/* draw loop */

function draw() {
  time += deltaTime * 0.001; // time-based motion

  const year = int(yearSlider.value());
  const scenario = scenarioSelect.value();

  const co2 = computeCO2(year, scenario);
  const ph = computePH(co2);

  drawBackground();
  drawWaves(ph);
  drawCoral(ph);
  drawPlankton(ph);
  drawBubbles();
}

/* science */

function computeCO2(year, scenario) {
  const t = year - BASE_YEAR;
  return BASE_CO2 * Math.pow(1 + SCENARIOS[scenario], t);
}

function computePH(co2) {
  return constrain(BASE_PH - 0.001 * (co2 - BASE_CO2), 7.6, 8.2);
}

/* visuals */

function drawBackground() {
  for (let y = 0; y < height; y++) {
    const t = map(y, 0, height, 0, 1);
    stroke(lerpColor(
      color(215, 237, 247),
      color(150, 210, 235),
      t
    ));
    line(0, y, width, y);
  }
  noStroke();
}

/* waves */
function drawWaves(ph) {
  const baseY = height * 0.52;
  const calmness = map(ph, 7.6, 8.2, 1.25, 0.75);

  for (let layer = 0; layer < WAVE_LAYERS; layer++) {
    const depth = layer / (WAVE_LAYERS - 1);
    const amplitude = 34 * calmness * (1 - depth * 0.4);
    const wavelength = 0.02 + depth * 0.005;

    // parallax: farther waves move slower
    const speed = 0.6 + (1 - depth) * 0.6;

    // fade into horizon
    const alpha = lerp(140, 60, depth);
    const offsetY = lerp(0, 26, depth);

    // wave body
    fill(255, 255, 255, alpha);
    beginShape();
    for (let x = -40; x <= width + 40; x += 6) {
      const y =
        baseY +
        offsetY +
        sin(x * wavelength + time * speed + layer) * amplitude;
      vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    // crest highlight (also fades)
    noFill();
    stroke(255, 255, 255, alpha + 40);
    strokeWeight(2);
    beginShape();
    for (let x = -40; x <= width + 40; x += 6) {
      const y =
        baseY +
        offsetY +
        sin(x * wavelength + time * speed + layer) * amplitude;
      vertex(x, y);
    }
    endShape();
    noStroke();
  }
}

/* coral */
function drawCoral(ph) {
  const cx = width / 2;
  const cy = height * 0.72;

  let health = map(ph, 7.6, 8.2, 0, 1);
  health = constrain(health, 0, 1);

  coralStatus.html(
    health < 0.45 ? 'coral status: bleached' : 'coral status: healthy'
  );

  fill(
    lerp(255, 255, health),
    lerp(200, 165, health),
    lerp(210, 120, health)
  );

  for (let i = 0; i < 5; i++) {
    triangle(
      cx - 40 + i * 16,
      cy,
      cx + i * 10,
      cy - 50 - i * 8 * health,
      cx + 40 - i * 10,
      cy
    );
  }
}

/* plankton */
function drawPlankton(ph) {
  const glow = map(ph, 7.6, 8.2, 80, 200);

  for (let p of plankton) {
    p.y += p.speed;
    p.x += sin(time + p.phase) * 0.3;

    if (p.y > height * 0.5) p.y = 0;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;

    for (let r = 0; r < 3; r++) {
      fill(255, glow / (r + 2));
      ellipse(p.x, p.y, p.size + r * 3);
    }
  }
}

/* bubbles */
function drawBubbles() {
  for (let b of bubbles) {
    b.y -= b.speed;
    if (b.y < 0) {
      b.y = height;
      b.x = random(width);
    }
    fill(255, b.alpha);
    ellipse(b.x, b.y, b.size);
  }
}

/* UI */

function updateUI() {
  const year = int(yearSlider.value());
  const ph = computePH(computeCO2(year, scenarioSelect.value()));

  yearDisplay.html(year);
  phDisplay.html(ph.toFixed(2));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 0.5);
}
