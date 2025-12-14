let time = 0
let appliedYear = 2025
let appliedScenario = 'realistic'
let displayPH = 8.05

const BASE_YEAR = 1950
const BASE_CO2 = 280
const BASE_PH = 8.2

// ppm increase per year
const SCENARIOS = {
  optimistic: 0.4,
  realistic: 0.8,
  severe: 1.6
}

const WAVE_LAYERS = 3

let yearSlider, yearDisplay, scenarioSelect, phDisplay

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight * 0.5)
  cnv.parent('sketch-holder')
  noStroke()

  yearSlider = select('#yearSlider')
  yearDisplay = select('#yearDisplay')
  scenarioSelect = select('#scenarioSelect')
  phDisplay = select('#phDisplay')

  yearSlider.input(previewUI)
  scenarioSelect.changed(previewUI)
  select('#applyBtn').mousePressed(applyChanges)

  const infoBtn = select('#infoBtn')
  const infoBox = select('#infoBox')
  infoBtn.mousePressed(() => {
    infoBox.style(
      'display',
      infoBox.style('display') === 'none' ? 'block' : 'none'
    )
  })

  previewUI()
}

function draw() {
  // wrapped time prevents phase blow-up
  time = (time + 0.01) % TWO_PI

  // scenario-dependent pH
  const co2 = computeCO2(appliedYear, appliedScenario)
  const targetPH = computePH(co2)

  displayPH = lerp(displayPH, targetPH, 0.02)
  const ph = displayPH

  drawBackground()
  drawWaves(ph)

  phDisplay.html(ph.toFixed(2))
}

function drawBackground() {
  for (let y = 0; y < height; y++) {
    const t = map(y, 0, height, 0, 1)
    stroke(lerpColor(color(215, 237, 247), color(135, 195, 225), t))
    line(0, y, width, y)
  }
  noStroke()
}

function drawWaves(ph) {
  const baseY = height * 0.52

  // bounded roughness tied to pH
  const calmness = map(ph, 7.65, 8.2, 1.25, 0.9)

  for (let layer = 0; layer < WAVE_LAYERS; layer++) {
    const depth = layer / (WAVE_LAYERS - 1)

    const amplitude = 42 * calmness * (1 - depth * 0.35)
    const wavelength = 0.014 + depth * 0.006
    const speed = 0.6 - depth * 0.25
    const offsetY = depth * 30

    // keep layers visible
    const alpha = lerp(190, 120, depth)

    const baseColor = lerpColor(
      color(170, 215, 240),
      color(85, 145, 195),
      map(ph, 8.2, 7.65, 0, 1)
    )

    beginShape()
    noStroke()
    fill(
      red(baseColor),
      green(baseColor),
      blue(baseColor),
      alpha
    )

    for (let x = -60; x <= width + 60; x += 8) {
      const y =
        baseY +
        offsetY +
        sin(x * wavelength + time * speed + layer * 2.5) * amplitude
      vertex(x, y)
    }

    vertex(width, height)
    vertex(0, height)
    endShape(CLOSE)
  }
}

// linear, bounded CO2 growth
function computeCO2(year, scenario) {
  const years = constrain(year - BASE_YEAR, 0, 200)
  return BASE_CO2 + years * SCENARIOS[scenario]
}

// visible pH response, no clamping collapse
function computePH(co2) {
  return constrain(
    BASE_PH - 0.0018 * (co2 - BASE_CO2),
    7.65,
    8.2
  )
}

function previewUI() {
  yearDisplay.html(yearSlider.value())
}

function applyChanges() {
  appliedYear = int(yearSlider.value())
  appliedScenario = scenarioSelect.value()
}
