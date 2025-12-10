let yearSlider, yearDisplay, scenarioSelect, phDisplay, coralStatus;

let planktonParticles = [];
const numPlankton = 150;

// ocean chemistry
const co2Base = 280; 
const phBase = 8.2;  

// wave parameters
let waveOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight/2);
  noStroke();

  // DOM elements
  yearSlider = select('#yearSlider');
  yearDisplay = select('#yearDisplay');
  scenarioSelect = select('#scenarioSelect');
  phDisplay = select('#phDisplay');
  coralStatus = select('#coralStatus');

  yearSlider.input(updateSimulation);
  scenarioSelect.changed(updateSimulation);

  // plankton initialization
  for(let i=0; i<numPlankton; i++){
    planktonParticles.push({
      x: random(width),
      y: random(height/2),
      speed: random(0.2, 0.8),
      size: random(3,7),
      offset: random(TWO_PI)
    });
  }

  updateSimulation();
}

function draw() {
  let year = parseInt(yearSlider.value());
  let scenario = scenarioSelect.value();
  let ph = calculatePH(year, scenario);

  // dynamic ocean gradient based on pH
  let colorFactor = map(ph, 7.6, 8.2, 50, 255);
  setGradient(0, 0, width, height, color(0, 50, 150), color(0, 119, 182 + colorFactor*0.5));

  // subtle animated waves
  drawWaves(ph);

  // draw coral
  drawCoral(ph);

  // draw plankton
  drawPlankton(ph);
}

function updateSimulation(){
  let year = parseInt(yearSlider.value());
  yearDisplay.html(year);
  let ph = calculatePH(year, scenarioSelect.value());
  phDisplay.html(ph.toFixed(2));
}

function calculatePH(year, scenario){
  let co2;
  if(scenario == 'optimistic'){
    co2 = co2Base * Math.pow(1.01, year-1900);
  } else if(scenario == 'realistic'){
    co2 = co2Base * Math.pow(1.02, year-1900);
  } else {
    co2 = co2Base * Math.pow(1.03, year-1900);
  }
  let deltaCO2 = co2 - co2Base;
  let ph = phBase - 0.001 * deltaCO2;
  return constrain(ph, 7.6, 8.2);
}

// gradient background
function setGradient(x, y, w, h, c1, c2){
  for(let i=y;i<=y+h;i++){
    let inter = map(i, y, y+h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x+w, i);
  }
}

// animated waves
function drawWaves(ph){
  waveOffset += 0.02;
  let waveAmplitude = map(ph, 7.6, 8.2, 30, 10);
  fill(0, 150, 200, 100);
  beginShape();
  for(let x=0; x<=width; x+=10){
    let y = height*0.6 + sin(x*0.02 + waveOffset)*waveAmplitude;
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

// draw coral using triangles
function drawCoral(ph){
  let coralX = width/2;
  let coralY = height*0.7;
  if(ph < 7.9){
    coralStatus.html('coral status: bleached');
    fill(255, 230, 230);
  } else {
    coralStatus.html('coral status: healthy');
    fill(255, 150, 100);
  }
  // simple coral made of overlapping triangles
  for(let i=0; i<5; i++){
    triangle(coralX - 40 + i*15, coralY,
             coralX + i*10, coralY - 50 - i*10,
             coralX + 40 - i*10, coralY);
  }
}

// draw plankton as small circles with smooth motion
function drawPlankton(ph){
  for(let p of planktonParticles){
    p.y += p.speed;
    p.x += sin(frameCount*0.01 + p.offset)*0.5; // subtle side drift
    if(p.y > height/2) p.y = 0;
    if(p.x < 0) p.x = width;
    if(p.x > width) p.x = 0;

    let alpha = map(ph, 7.6, 8.2, 50, 200);
    fill(255, 255, 255, alpha);
    ellipse(p.x, p.y, p.size);
  }
}
