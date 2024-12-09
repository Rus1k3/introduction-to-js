let noiseStep;
let progress;
let isReady;
let sample;
let fft;
let rot;
let stretchSlider;
let speedSlider;
let volumeSlider;
let rotateBlocksEnabled = false;
let randomStrokesEnabled = false;
let noiseLineEnabled = false;
let frequencyVisualizerEnabled = true;
let rotateButton;
let strokesButton;
let noiseButton;
let visualizerButton;

let isPlaying = false;

function soundInit() {
  isReady = true;
}

function preload() {
  soundFormats('mp3', 'wav');
  isReady = false;
  sample = loadSound('assets/audio.mp3', soundInit);
  sample.setVolume(0.5);
  noiseStep = 0.01;
  progress = 0;
  rot = 0;
}

function setup() {
  createCanvas(1024, 1024);
  stroke(255);
  noFill();
  textAlign(CENTER);
  textSize(16);
  fft = new p5.FFT();

  stretchSlider = createSlider(1, 3.5, 1.5, 0.1);
  stretchSlider.position(20, height - 80);
  let stretchLabel = createDiv('Интенсивность');
  stretchLabel.position(stretchSlider.x, stretchSlider.y - 20);
  stretchLabel.style('color', 'white');

  speedSlider = createSlider(0.1, 2, 1, 0.1);
  speedSlider.position(200, height - 80);
  let speedLabel = createDiv('Скорость воспроизведения');
  speedLabel.position(speedSlider.x - 20 , speedSlider.y - 20);
  speedLabel.style('color', 'white');

  volumeSlider = createSlider(0, 5, 0.5, 0.01);
  volumeSlider.position(380, height - 80);
  let volumeLabel = createDiv('Громкость');
  volumeLabel.position(volumeSlider.x + 20, volumeSlider.y - 20);
  volumeLabel.style('color', 'white');

  // Размещение кнопок в ряд
  rotateButton = createButton('Кубы');
  rotateButton.position(550, height - 80);
  rotateButton.mousePressed(toggleRotateBlocks);

  strokesButton = createButton('Звезда');
  strokesButton.position(610, height - 80);
  strokesButton.mousePressed(toggleRandomStrokes);

  noiseButton = createButton('Червячок');
  noiseButton.position(680, height - 80);
  noiseButton.mousePressed(toggleNoiseLine);

  // Кнопка для включения/выключения визуализатора частот
  visualizerButton = createButton('Визуализатор');
  visualizerButton.position(760, height - 80);
  visualizerButton.mousePressed(toggleFrequencyVisualizer);
}

function toggleRotateBlocks() {
  rotateBlocksEnabled = !rotateBlocksEnabled;
}

function toggleRandomStrokes() {
  randomStrokesEnabled = !randomStrokesEnabled;
}

function toggleNoiseLine() {
  noiseLineEnabled = !noiseLineEnabled;
}

function toggleFrequencyVisualizer() {
  frequencyVisualizerEnabled = !frequencyVisualizerEnabled;
}

function noiseLine(energy, stretch) {
  if (!noiseLineEnabled) return;

  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(0, 255, 100);
  strokeWeight(4);
  beginShape();
  for (let i = 0; i < 100; i++) {
    let x = map(noise(i * noiseStep + progress), 0, 1, -stretch * 50, stretch * 50);
    let y = map(noise(i * noiseStep + progress + 200), 0, 1, -stretch * 50, stretch * 50);
    vertex(x, y);
  }
  endShape();

  if (energy > 20) progress += 0.05;
  pop();
}

function rotatingBlocks(energy, stretch) {
  if (!rotateBlocksEnabled) return;

  if (energy > 200) rot += 0.01;

  let size = map(energy, 0, 255, 20, 100) * stretch;

  push();
  rectMode(CENTER);
  translate(width / 2, height / 2);
  rotate(rot);
  fill(255, 100, 0);

  for (let i = -4; i <= 4; i++) {
    rect(i * 100, 0, size, size);
  }
  pop();
}

function randomStrokes(bassEnergy, stretch) {
  if (!randomStrokesEnabled) return;

  let lineCount = map(bassEnergy, 0, 255, 2, 10);
  let length = map(bassEnergy, 0, 255, 50, 300) * stretch;

  for (let i = 0; i < lineCount; i++) {
    let angle = map(i, 0, lineCount, 0, TWO_PI);
    let x1 = cos(angle) * length;
    let y1 = sin(angle) * length;
    let x2 = cos(angle + PI) * length;
    let y2 = sin(angle + PI) * length;

    push();
    translate(width / 2, height / 2);
    stroke(255, random(100, 255), 0);
    strokeWeight(3);
    line(x1, y1, x2, y2);
    pop();
  }
}

function drawFrequencyVisualizer() {
  let spectrum = fft.analyze();

  let barWidth = width / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    let barHeight = map(spectrum[i], 0, 255, 0, height);
    let colorValue = map(spectrum[i], 0, 255, 0, 255);
    let r = colorValue;
    let g = 255 - colorValue;
    let b = 255 - colorValue;
    fill(r, g, b);
    noStroke();
    rect(i * barWidth, height - barHeight, barWidth, barHeight);
  }
}

function draw() {
  fft.analyze();

  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");

  let speed = speedSlider.value();
  let stretch = stretchSlider.value();
  let volume = volumeSlider.value();

  if (isReady && !sample.isPlaying() && isPlaying) {
    sample.loop();
  }
  sample.rate(speed);
  sample.setVolume(volume);

  background(0);

  rotatingBlocks(bass, stretch);

  randomStrokes(bass, stretch);

  noiseLine(treble, stretch);


  if (frequencyVisualizerEnabled) {
    drawFrequencyVisualizer();
  }
}

function keyPressed() {
  if (key === ' ') {
    isPlaying = !isPlaying;
    if (isPlaying && !sample.isPlaying()) {
      sample.loop();
    } else if (!isPlaying) {
      sample.stop();
    }
  }
}
