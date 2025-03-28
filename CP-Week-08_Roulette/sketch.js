let teeth = [];
let numTeeth = 24;
let bitingTooth;
let gameOver = false;
let jawColor;
let tongueColor;

function setup() {
  createCanvas(360, 640); // Mobile compatible aspect ratio 9:16
  jawColor = color(50, 150, 50); // Green for the crocodile
  tongueColor = color(255, 100, 100); // Reddish for the tongue
  
  // Initialize the game
  resetGame();
}

function draw() {
  // gameOver = true; // For testing

  if (gameOver) {
    background(255, 0, 0); // Red background when bitten
    
    // Draw text
    textSize(35);
    textAlign(CENTER, CENTER);
    fill(255);
    text("YOU GOT BITTEN!", width/2, height/2);
    
    // Draw "Play Again" button
    drawPlayAgainButton();
  } else {
    background(100, 200, 255); // Blue background

    textSize(27);
    textAlign(CENTER, TOP);
    fill(255);
    text("PICK ANY TOOTH", width/2, 20);
    text("AND PASS IT ON", width/2, 60);
    
    // Draw the crocodile's mouth
    drawCrocodileMouth();
    
    // Draw all remaining teeth
    for (let tooth of teeth) {
      if (tooth.active) {
        tooth.display();
      }
    }
  }
}

function mousePressed() {
  if (gameOver) {
    // Check if "Play Again" button is clicked
    let buttonX = width/2;
    let buttonY = height/2 + 100;
    let buttonWidth = 200;
    let buttonHeight = 60;
    
    if (mouseX > buttonX - buttonWidth/2 && mouseX < buttonX + buttonWidth/2 &&
        mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2) {
      resetGame();
    }
  } else {
    // Check if any tooth is clicked
    for (let tooth of teeth) {
      if (tooth.active && tooth.contains(mouseX, mouseY)) {
        tooth.active = false;
        
        // Check if this was the biting tooth
        if (tooth.index === bitingTooth) {
          gameOver = true;
        }
        break;
      }
    }
  }
}

function resetGame() {
  // Reset game state
  gameOver = false;
  teeth = [];
  
  // Create teeth in an arc
  let arcRadiusX = 150; 
  let arcRadiusY = 400; 
  let centerX = width/2;
  let centerY = height - 100; // Adjusted for new canvas size
  let startAngle = PI + PI/32;
  let endAngle = 2 * PI - PI/32;
  
  for (let i = 0; i < numTeeth; i++) {
    let angle = map(i, 0, numTeeth - 1, startAngle, endAngle);
    let x = centerX + arcRadiusX * cos(angle);
    let y = centerY + arcRadiusY * sin(angle);
    
    teeth.push(new Tooth(x, y, 20, i)); // Adjusted tooth size
  }
  
  // Randomly select the biting tooth
  bitingTooth = floor(random(numTeeth));
}

function drawCrocodileMouth() {
  // Draw the lower jaw
  fill(jawColor);
  stroke(0);
  strokeWeight(2);
  
  // beginShape();
  // vertex(50, height - 20); // Adjusted for new canvas size
  // vertex(100, height - 150); // Adjusted for new canvas size
  // vertex(width/2 - 100, height - 200); // Adjusted for new canvas size
  // vertex(width/2, height - 220); // Adjusted for new canvas size
  // vertex(width/2 + 100, height - 200); // Adjusted for new canvas size
  // vertex(width - 100, height - 150); // Adjusted for new canvas size
  // vertex(width - 50, height - 20); // Adjusted for new canvas size
  // endShape(CLOSE);
  // Draw the lower jaw as a vertically long semicircle
  let jawRadiusX = 150; 
  let jawRadiusY = 400;  
  let jawCenterX = width / 2;
  let jawCenterY = height - 100; // Adjusted for new canvas size
  let jawStartAngle = PI;
  let jawEndAngle = 2 * PI;

  beginShape();
  for (let angle = jawStartAngle; angle <= jawEndAngle; angle += 0.01) {
    let x = jawCenterX + jawRadiusX * cos(angle);
    let y = jawCenterY + jawRadiusY * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
  
  // Draw the tongue
  fill(tongueColor);
  noStroke();
  ellipse(width/2, height - 150, 100, 50); // Adjusted for new canvas size
}

function drawPlayAgainButton() {
  let buttonX = width/2;
  let buttonY = height/2 + 80;
  let buttonWidth = 200;
  let buttonHeight = 60;
  
  fill(0, 150, 0);
  stroke(255);
  strokeWeight(3);
  rectMode(CENTER);
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
  
  fill(255);
  noStroke();
  textSize(24);
  text("Play Again", buttonX, buttonY + 8);
}

class Tooth {
  constructor(x, y, size, index) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.index = index;
    this.active = true;
  }
  
  display() {
    // Draw tooth
    fill(255);
    stroke(0);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);
  }
  
  contains(px, py) {
    // Check if point is inside the tooth
    let d = dist(px, py, this.x, this.y);
    return d < this.size/2;
  }
}
