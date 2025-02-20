let W = 800; // Canvas width and height
let Counter = 0;
let Angle = 0;
let sounds = []; // Array to hold our sound objects
let soundFiles = [
  'sounds/sound1.wav',
  'sounds/sound2.wav', 
  'sounds/sound3.wav',
  'sounds/sound4.wav'
]; // Sound files from sounds folder
let soundsLoaded = false;
let currentArea = -1; // Track which area mouse is in

function preload() {
  // Load sound files with error handling
  soundFiles.forEach((file, index) => {
    loadSound(file, 
      // Success callback
      (sound) => {
        sounds[index] = sound;
        // Check if all sounds are loaded
        if (sounds.filter(s => s !== undefined).length === soundFiles.length) {
          soundsLoaded = true;
          console.log('All sounds loaded successfully');
          initializeSounds();
        }
      },
      // Error callback
      (err) => {
        console.error('Error loading sound:', file, err);
      }
    );
  });
}

function initializeSounds() {
  // Don't loop the sounds, just play them when needed
  sounds.forEach(sound => {
    if (sound) {
      sound.setVolume(1);  // Set volume to full
    }
  });
}

function setup() {
  createCanvas(W, 500);
  colorMode(RGB, 255);
  fill(255, 50);
}

function draw() {
  Counter++;
  
  // Only process sounds if they're loaded
  if (soundsLoaded) {
    // Determine which area the mouse is in
    let area = getMouseArea();
    
    // If mouse moved to a new area, update sounds
    if (area !== currentArea) {
      updateSounds(area);
      currentArea = area;
    }
    
    // Set background color based on area
    let colors = [
      [255, 0, 0],    // Red for top-left
      [255, 255, 0],  // Yellow for top-right
      [0, 255, 0],    // Green for bottom-left
      [0, 0, 255]     // Blue for bottom-right
    ];
    
    let currentColor = area >= 0 ? colors[area] : [0, 0, 0];
    background(currentColor[0], currentColor[1], currentColor[2], 10);
  } else {
    // Show loading screen
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    text('Loading sounds...', width/2, height/2);
  }
  
  // Draw parameter indicators in corners
  drawParameterZones();
  
  // Calculate target position based on mouse
  let targetX = mouseX;
  let targetY = mouseY;
  
  // Draw the tree at the mouse position
  Angle = (PI + sin(Counter * 0.02)) / 7;
  for (let j = 0; j < TWO_PI; j += TWO_PI/8) {
    Tree(7, targetX, targetY, j, 45);
  }
  
  // Apply feedback effect
  copy(10, 10, W-20, height-20, 0, 0, W, height);
}

function getMouseArea() {
  if (mouseX < W/2 && mouseY < height/2) return 0;  // top-left
  if (mouseX >= W/2 && mouseY < height/2) return 1; // top-right
  if (mouseX < W/2 && mouseY >= height/2) return 2; // bottom-left
  if (mouseX >= W/2 && mouseY >= height/2) return 3; // bottom-right
  return -1; // outside canvas
}

function updateSounds(activeArea) {
  if (!soundsLoaded) return;
  
  // Stop all sounds first
  sounds.forEach(sound => {
    if (sound && sound.isPlaying()) {
      sound.stop();
    }
  });
  
  // Play the sound for the active area
  if (activeArea >= 0 && activeArea < sounds.length) {
    sounds[activeArea].play();
  }
}

function Tree(step, x, y, rad, lengs) {
  if (step > 0) {
    let inf = 20 - step; // influence of noise
    let n = noise((x + Counter)/W, (y - Counter)/W) * inf;
    stroke(255, 255);
    line(x, y, 
         x + cos(rad) * lengs + cos(n) * inf,
         y + sin(rad) * lengs + sin(n) * inf);
    let newX = x + cos(rad) * lengs + cos(n) * inf;
    let newY = y + sin(rad) * lengs + sin(n) * inf;
    step--;
    lengs *= 0.9;
    Tree(step, newX, newY, rad + Angle, lengs);
    Tree(step, newX, newY, rad - Angle, lengs);
  }
}

function drawParameterZones() {
  noStroke();
  textAlign(CENTER, CENTER);
  
  // Top left - Area 1
  fill(255, 0, 0, 2);
  rect(0, 0, W/2, height/2);
  
  // Top right - Area 2
  fill(255, 255, 0, 2);
  rect(W/2, 0, W/2, height/2);
  
  // Bottom left - Area 3
  fill(0, 255, 0, 2);
  rect(0, height/2, W/2, height/2);
  
  // Bottom right - Area 4
  fill(0, 0, 255, 2);
  rect(W/2, height/2, W/2, height/2);
}

// Remove unused functions
function windowClosed() {
  if (soundsLoaded) {
    sounds.forEach(sound => {
      if (sound) sound.stop();
    });
  }
}

// function keyPressed() {
//   s1 = loadSound('sounds/sound1.wav');
//   if (key === '1') {
//     s1.play();
//   }
// }

// function mousePressed() {
//   if (song.isPlaying()) {
//     // .isPlaying() returns a boolean
//     song.stop();
//     background(255, 0, 0);
//   } else {
//     song.play();
//     background(0, 255, 0);
//   }
// }