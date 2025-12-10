let yearSlider, yearDisplay, scenarioSelect, phDisplay, coralStatus;

let planktonParticles = [];
const numPlankton = 150;

let bubbles = [];
const numBubbles = 50;

const co2Base = 280;
const phBase = 8.2;

let waveOffset = 0;
let waveLayers = 3;

function setup() {
  createCanvas(windowWidth, windowHeight / 2);
  noStroke();

  yearSlider = select('#yearSlider');
  yearDisplay = select('#yearDisplay');
  scenarioSelect = select('#scenarioSelect');
  phDisplay = select('#phDisplay');
  coralStatus = select('#coralStatus');

  yearSlider.input(updateSimulation);
  scenarioSelect.changed(updateSimulation);

  // plankton initialization
  for (let i = 0; i < numPlankton; i++) {
    planktonParticles.push({
      x: random(width),
      y: random(height / 2),
      speed: random(0.2, 0.8),
      size: random(3, 7),
      offset: random(TWO_PI)
    });
  }

  // bubble initialization
  for (let i = 0; i < numBubbles; i++) {
    bubbles.push({
      x: random(width),
      y: random(height / 2, height),
      speed: random(0.3, 1),
      size: random(5, 12),
      alpha: random(50, 100)
    });
  }

  updateSimulation();
}

function draw() {
  let year = parseInt(yearSlider.value());
  let scenario = scenarioSelect.value();
  let ph = calculatePH(year, scenario);

  // background gradient
  let topColor = color(204, 231, 240);
  let bottomColor = color(135, 200, 232);
  setGradient(0, 0, width, height, topColor, bottomColor);

  drawWaves(ph);
  drawCoral(ph);
  drawPlankton(ph);
  drawBubbles();
}

function updateSimulation() {
  let year = parseInt(yearSlider.value());
  yearDisplay.html(year);
  let ph = calculatePH(year, scenarioSelect.value());
  phDisplay.html(ph.toFixed(2));
}

function calculatePH(year, scenario) {
  let co2;
  if (scenario === 'optimistic') {
    co2 = co2Base * Math.pow(1.01, year - 1900);
  } else if (scenario === 'realistic') {
    co2 = co2Base * Math.pow(1.02, year - 1900);
  } else {
    co2 = co2Base * Math.pow(1.03, year - 1900);
  }
  let deltaCO2 = co2 - co2Base;
  let ph = phBase - 0.001 * deltaCO2;
  return constrain(ph, 7.6, 8.2);
}

function setGradient(x, y, w, h, c1, c2) {
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

// waves
function drawWaves(ph) {
  waveOffset += 0.02;
  let baseY = height * 0.6;

  for (let layer = 0; layer < waveLayers; layer++) {
    let alpha = map(layer, 0, waveLayers - 1, 80, 50);
    let waveHeight = map(ph, 7.6, 8.2, 40, 15) * (1 - layer * 0.2);

    // base wave
    fill(255, 255, 255, alpha);
    beginShape();
    for (let x = 0; x <= width; x += 5) {
      let y = baseY + layer * 10 + sin(x * 0.02 + waveOffset + layer) * waveHeight;
      vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);

    // highlight on top
    noFill();
    stroke(255, 255, 255, alpha + 50);
    strokeWeight(2);
    beginShape();
    for (let x = 0; x <= width; x += 5) {
      let y = baseY + layer * 10 + sin(x * 0.02 + waveOffset + layer) * waveHeight;
      vertex(x, y);
    }
    endShape();
    strokeWeight(1);
  }
}

// coral
function drawCoral(ph) {
  let coralX = width / 2;
  let coralY = height * 0.7;
  if (ph < 7.9) {
    coralStatus.html('coral status: bleached');
    fill(255, 200, 210);
  } else {
    coralStatus.html('coral status: healthy');
    fill(255, 165, 120);
  }
  for (let i = 0; i < 5; i++) {
    triangle(
      coralX - 40 + i * 15, coralY,
      coralX + i * 10, coralY - 50 - i * 10,
      coralX + 40 - i * 10, coralY
    );
  }
}

// plankton
function drawPlankton(ph) {
  for (let p of planktonParticles) {
    p.y += p.speed;
    p.x += sin(frameCount * 0.01 + p.offset) * 0.5;
    if (p.y > height / 2) p.y = 0;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;

    let alpha = map(ph, 7.6, 8.2, 80, 200);
    // soft glow
    for (let r = 0; r < 3; r++) {
      fill(255, 255, 255, alpha / (r + 2));
      ellipse(p.x, p.y, p.size + r * 3);
    }
  }
}

// floating bubbles
function drawBubbles() {
  for (let b of bubbles) {
    b.y -= b.speed;
    if (b.y < 0) {
      b.y = height;
      b.x = random(width);
    }

    fill(255, 255, 255, b.alpha);
    ellipse(b.x, b.y, b.size);
  }
}
