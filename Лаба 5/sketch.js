let music;

let output = [];
let startX;
let startY;
let endY;
let spectrumWidth;
let speed = 1;
let fft;

function preload(){
    music = loadSound('assets/parsRadio_loop.mp3');
}

function setup(){
   createCanvas(800, 800);
    startX = width / 5;
    endY = height / 5;
    startY = height - endY;
    spectrumWidth = (width / 5) * 3;
    fft = new p5.FFT();
}

function draw(){
    background(0);
    stroke(255);
    strokeWeight(2);

    if(frameCount % 45 == 0) 
        addWave();
    
    for (let i = 0; i < output.length; i++){
        let tmp = output[i];
        noFill();
        beginShape();
        for(let j = 0; j < tmp.length; j++){
            tmp[j].y -= speed;
            vertex(tmp[j].x, tmp[j].y);
        }
        endShape();
        
        if(tmp[0].y < endY)
            output.splice(i, 1);
    }
}

function addWave(){
    let tmp = fft.waveform();
    let small_scale = 3, bigScale = 40;
    let wape_output = [];
    let x, y;
    for(let i = 0; i < tmp.length; i++){
        if (i % 20 == 0) { 
            x = map(i, 0, 1024, startX, startX + spectrumWidth);
            
            if(i < 1024 * 1/4 || i > 1024 * 3/4)
                y = map(tmp[i], -1, 1, -small_scale, small_scale);
            else
                y = map(tmp[i], -1, 1, -bigScale, bigScale);
                
            wape_output.push({x: x, y: startY + y});
        }
    }

    let smoothedWave = smoothWave(wape_output);
    output.push(smoothedWave);
}

function smoothWave(wave){
    let smoothed = [];
    for (let i = 1; i < wave.length - 1; i++){
        let prev = wave[i - 1];
        let next = wave[i + 1];
        let smoothedX = (prev.x + wave[i].x + next.x) / 3;
        let smoothedY = (prev.y + wave[i].y + next.y) / 3;
        smoothed.push({x: smoothedX, y: smoothedY});
    }
    smoothed.unshift(wave[0]);
    smoothed.push(wave[wave.length - 1]);

    return smoothed;
}

function mousePressed(){
    music.loop();
}
