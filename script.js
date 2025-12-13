let time = 0
let appliedYear = 2025
let appliedScenario = 'realistic'
let displayPH = 8.05

const BASE_YEAR = 1900
const BASE_CO2 = 280
const BASE_PH = 8.2
const SCENARIOS = { optimistic: 0.01, realistic: 0.02, severe: 0.03 }
const WAVE_LAYERS = 3

let yearSlider, yearDisplay, scenarioSelect, phDisplay

function setup() {
  // create canvas and attach to sketch holder
  const cnv = createCanvas(windowWidth, windowHeight * 0.5)
  cnv.parent('sketch-holder')
  noStroke()

  // get ui elements
  yearSlider = select('#yearSlider')
  yearDisplay = select('#yearDisplay')
  scenarioSelect = select('#scenarioSelect')
  phDisplay = select('#phDisplay')

  // setup event listeners for slider, scenario, and apply button
  yearSlider.input(previewUI)
  scenarioSelect.changed(previewUI)
  select('#applyBtn').mousePressed(applyChanges)

  // setup info button toggle
  const infoBtn = select('#infoBtn')
  const infoBox = select('#infoBox')
  infoBtn.mousePressed(() => {
    if (infoBox.style('display') === 'none') {
      infoBox.style('display', 'block')
    } else {
      infoBox.style('display', 'none')
    }
  })

  // initialize ui display
  previewUI()
}

function draw() {
  // update time for smooth motion
  time = millis() * 0.001

  // compute target ph based on applied year and scenario
  const co2 = computeCO2(appliedYear, appliedScenario)
  const targetPH = computePH(co2)

  // smooth transition for displayed ph
  displayPH = lerp(displayPH, targetPH, 0.02)
  const ph = displayPH

  // draw background and waves
  drawBackground()
  drawWaves(ph)

  // update ph display in ui
  phDisplay.html(ph.toFixed(2))
}

function drawBackground() {
  // draw gradient background for sky and water
  for (let y = 0; y < height; y++) {
    const t = map(y, 0, height, 0, 1)
    stroke(lerpColor(color(215, 237, 247), color(150, 210, 235), t))
    line(0, y, width, y)
  }
  noStroke()
}

function drawWaves(ph) {
  // draw layered sine waves with parallax and color based on ph
  const baseY = height * 0.52
  const calmness = map(ph, 7.6, 8.2, 2.0, 0.5) // more visible effect

  for (let layer = 0; layer < WAVE_LAYERS; layer++) {
    const depth = layer / (WAVE_LAYERS - 1)
    const amplitude = 45 * calmness * (0.6 + 0.4 * (1 - depth)) // keep upper layers visible
    const wavelength = 0.015 + depth * 0.006
    const speed = 0.4 + (1 - depth) * 0.5
    const offsetY = depth * 28
    const alpha = lerp(160, 60, depth) * 0.7

    // calculate wave color with slight variation per layer
    const baseColor = lerpColor(color(180, 220, 245), color(100, 160, 210), map(ph, 7.6, 8.2, 0, 1))
    const waveColor = lerpColor(baseColor, color(255, 255, 255), depth * 0.25)

    // draw wave line
    noFill()
    stroke(waveColor.levels[0], waveColor.levels[1], waveColor.levels[2], alpha + 40)
    strokeWeight(2.5)
    beginShape()
    for (let x = -60; x <= width + 60; x += 8) {
      const y = baseY + offsetY + sin(x * wavelength + time * speed) * amplitude
      vertex(x, y)
    }
    endShape()

    // fill area under wave
    noStroke()
    fill(waveColor.levels[0], waveColor.levels[1], waveColor.levels[2], alpha)
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
  // compute CO2 based on year and scenario using exponential growth
  const t = year - BASE_YEAR
  return BASE_CO2 * Math.pow(1 + SCENARIOS[scenario], t)
}

function computePH(co2) {
  // convert CO2 concentration to pH with limits
  return constrain(BASE_PH - 0.001 * (co2 - BASE_CO2), 7.6, 8.2)
}

function previewUI() {
  // update displayed year while sliding
  yearDisplay.html(yearSlider.value())
}

function applyChanges() {
  // apply slider and scenario values to simulation
  appliedYear = int(yearSlider.value())
  appliedScenario = scenarioSelect.value()
}