let time = 0
let appliedYear = 2025
let appliedScenario = 'realistic'

const BASE_YEAR = 1900
const BASE_CO2 = 280
const BASE_PH = 8.2
const SCENARIOS = { optimistic: 0.01, realistic: 0.02, severe: 0.03 }
const WAVE_LAYERS = 3

let yearSlider, yearDisplay, scenarioSelect, phDisplay

function setup() {
  // create canvas
  const cnv = createCanvas(windowWidth, windowHeight * 0.5)
  cnv.parent('sketch-holder')
  noStroke()

  // get ui elements
  yearSlider = select('#yearSlider')
  yearDisplay = select('#yearDisplay')
  scenarioSelect = select('#scenarioSelect')
  phDisplay = select('#phDisplay')

  // setup event listeners
  yearSlider.input(previewUI)
  scenarioSelect.changed(previewUI)
  select('#applyBtn').mousePressed(applyChanges)

  previewUI()
}

function draw() {
  // update time for smooth motion
  time = millis() * 0.001

  // compute ph based on applied year and scenario
  const co2 = computeCO2(appliedYear, appliedScenario)
  const ph = computePH(co2)

  // draw background and waves
  drawBackground()
  drawWaves(ph)

  // update ph display
  phDisplay.html(ph.toFixed(2))
}

function drawBackground() {
  // draw gradient sky/water background
  for (let y = 0; y < height; y++) {
    const t = map(y, 0, height, 0, 1)
    stroke(lerpColor(color(215, 237, 247), color(150, 210, 235), t))
    line(0, y, width, y)
  }
  noStroke()
}

function drawWaves(ph) {
  // draw layered sine waves with parallax
  const baseY = height * 0.52
  const calmness = map(ph, 7.6, 8.2, 1.3, 0.75)

  for (let layer = 0; layer < WAVE_LAYERS; layer++) {
    const depth = layer / (WAVE_LAYERS - 1)
    const amplitude = 45 * calmness * (1 - depth * 0.4)
    const wavelength = 0.015 + depth * 0.006
    const speed = 0.4 + (1 - depth) * 0.5
    const offsetY = depth * 28
    const alpha = lerp(160, 60, depth)

    // draw wave line
    noFill()
    stroke(255, alpha + 40)
    strokeWeight(2.5)
    beginShape()
    for (let x = -60; x <= width + 60; x += 8) {
      const y = baseY + offsetY + sin(x * wavelength + time * speed) * amplitude
      vertex(x, y)
    }
    endShape()

    // fill under wave
    noStroke()
    fill(255, alpha)
    beginShape()
    for (let x = -60; x <= width + 60; x += 8) {
      const y = baseY + offsetY + sin(x * wavelength + time * speed) * amplitude
      vertex(x, y)
    }
    vertex(width, height)
    vertex(0, height)
    endShape(CLOSE)
  }
}

function computeCO2(year, scenario) {
  // simple exponential growth of co2
  const t = year - BASE_YEAR
  return BASE_CO2 * Math.pow(1 + SCENARIOS[scenario], t)
}

function computePH(co2) {
  // convert co2 to ph with limits
  return constrain(BASE_PH - 0.001 * (co2 - BASE_CO2), 7.6, 8.2)
}

function previewUI() {
  // update year display while sliding
  yearDisplay.html(yearSlider.value())
}

function applyChanges() {
  // apply new year and scenario values
  appliedYear = int(yearSlider.value())
  appliedScenario = scenarioSelect.value()
}
