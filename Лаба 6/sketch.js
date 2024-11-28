let noiseStep;
let progress;
let isReady;
let sample;
let fft;
let rot;
let speedSlider;
let rangeSlider;
let rotateBlocksEnabled = false;
let randomStrokesEnabled = true;
let noiseLineEnabled = false;

let rotateButton;
let strokesButton;
let noiseButton;

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
  textSize(32);
  fft = new p5.FFT();

  speedSlider = createSlider(0.1, 2, 1, 0.1);
  speedSlider.position(20, height - 40);

  rangeSlider = createSlider(50, 300, 150, 10);
  rangeSlider.position(20, height - 70);

  rotateButton = createButton('Переключить кубы');
  rotateButton.position(20, height - 100);
  rotateButton.mousePressed(toggleRotateBlocks);

  strokesButton = createButton('Переключить звуздочку');
  strokesButton.position(180, height - 100);
  strokesButton.mousePressed(toggleRandomStrokes);

  noiseButton = createButton('Переключить червячка');
  noiseButton.position(350, height - 100);
  noiseButton.mousePressed(toggleNoiseLine);
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

function noiseLine(energy, range) {
  if (!noiseLineEnabled) return;

  push();
  translate(width / 2, height / 2);
  noFill();
  stroke(0, 255, 100);
  strokeWeight(4);
  beginShape();
  for (let i = 0; i < 100; i++) {
    let x = map(noise(i * noiseStep + progress), 0, 1, -range, range);
    let y = map(noise(i * noiseStep + progress + 200), 0, 1, -range, range);
    vertex(x, y);
  }
  endShape();

  if (energy > 20) progress += 0.05;
  pop();
}

function rotatingBlocks(energy) {
  if (!rotateBlocksEnabled) return;

  if (energy > 200) rot += 0.01;

  let tmp = map(energy, 0, 255, 20, 100);

  push();
  rectMode(CENTER);
  translate(width / 2, height / 2);
  rotate(rot);
  fill(255, 100, 0);

  let incr = width / 9;

  for (let i = 0; i < 10; i++) rect(i * incr - width / 2, 0, tmp, tmp);

  pop();
}

function randomStrokes(bassEnergy) {
  if (!randomStrokesEnabled) return;

  let lineCount = map(bassEnergy, 0, 255, 2, 10);
  let lineSpacing = map(bassEnergy, 0, 255, 50, 200);

  for (let i = 0; i < lineCount; i++) {
    let angle = map(i, 0, lineCount, 0, TWO_PI);
    let length = map(bassEnergy, 0, 255, 50, 300);
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

function draw() {
  fft.analyze();

  let bass = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");

  let speed = speedSlider.value();
  let range = rangeSlider.value();

  if (isReady && !sample.isPlaying() && isPlaying) {
    sample.loop();
  }
  sample.rate(speed);

  background(0);

  rotatingBlocks(bass);

  randomStrokes(bass);

  noiseLine(treble, range);
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
