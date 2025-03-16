let gridSize = 3; // Number of rows and columns
let tileSize; // Size of each tile
let selectedTiles = []; // Array to store selected tiles
let tileImages = []; // Array to store the loaded images
let displayedImages = []; // Array to store 9 images displayed in the grid
let categories = ["Traffic Lights", "Cars", "Empty"]; // Example categories
let scores = { TrafficLights: 0, Cars: 0, Empty: 0 }; // Scoring system
let captchaTitle = "Select all squares with traffic lights";
let captchaSubtitle = "If there are none, click skip";

let img;

function preload() {
  // Dynamically load all images with two-digit padding in the folder
  for (let i = 1; i <= 15; i++) {
    // Adjust this number based on the total images in your folder
    let paddedIndex = String(i).padStart(2, "0"); // Ensure two-digit padding
    let imgPath = `images/img${paddedIndex}.png`;
    tileImages.push(loadImage(imgPath));
  }
}

function setup() {
  createCanvas(400, 500);
  tileSize = width / gridSize;

  // Randomly select 9 images from the loaded images
  displayedImages = shuffle(tileImages).slice(0, gridSize * gridSize);

  // Initialize selectedTiles array
  for (let i = 0; i < gridSize; i++) {
    selectedTiles[i] = [];
    for (let j = 0; j < gridSize; j++) {
      selectedTiles[i][j] = false;
    }
  }
}

function draw() {
  background(220);

  // Draw header
  fill(59, 130, 246);
  rect(0, 0, width, 80);

  // Draw captcha instructions
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(captchaTitle, 20, 20);
  textSize(14);
  text(captchaSubtitle, 20, 50);

  // Draw the grid with images
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i * tileSize;
      let y = j * tileSize + 80; // Offset for header

      // Draw the image
      let imgIndex = i + j * gridSize;
      image(displayedImages[imgIndex], x, y, tileSize, tileSize);

      // Draw selection overlay
      if (selectedTiles[i][j]) {
        fill(100, 200, 100, 100); // Semi-transparent green for selected tiles
        rect(x, y, tileSize, tileSize);
      }

      // Draw grid lines
      stroke(255);
      strokeWeight(2);
      noFill();
      rect(x, y, tileSize, tileSize);
    }
  }

  // Draw skip button
  fill(59, 130, 246);
  rect(width - 100, height - 40, 80, 30, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("SKIP", width - 60, height - 25);

  // Display scoring information (hidden from user in real CAPTCHA)
  fill(0);
  textSize(12);
  textAlign(LEFT, TOP);
  text("Debug - Scores:", 10, height - 70);
  let yOffset = height - 55;
  for (let category in scores) {
    text(`${category}: ${scores[category]}`, 10, yOffset);
    yOffset += 15;
  }
}

function mousePressed() {
  // Check if skip button was clicked
  if (
    mouseX > width - 100 &&
    mouseX < width - 20 &&
    mouseY > height - 40 &&
    mouseY < height - 10
  ) {
    console.log("Skip clicked");
    saveResults();
    return;
  }

  // Calculate grid position with offset for header
  let col = floor(mouseX / tileSize);
  let row = floor((mouseY - 80) / tileSize);

  if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
    // Toggle selection state
    selectedTiles[col][row] = !selectedTiles[col][row];

    // Update scores based on selection logic
    updateScores(col, row);
  }
}

function updateScores(col, row) {
  // Example scoring logic based on categories
  // In a real implementation, you would have predefined categories for each image
  let imgIndex = col + row * gridSize;

  if (selectedTiles[col][row]) {
    // This is where you would implement your actual scoring logic
    // For example, if image 0, 3, and 7 contain traffic lights:
    if ([0, 3, 7].includes(imgIndex)) {
      scores.TrafficLights++;
    } else if ([1, 4, 8].includes(imgIndex)) {
      scores.Cars++;
    }
  } else {
    // If deselected, reduce the score
    if ([0, 3, 7].includes(imgIndex)) {
      scores.TrafficLights = Math.max(0, scores.TrafficLights - 1);
    } else if ([1, 4, 8].includes(imgIndex)) {
      scores.Cars = Math.max(0, scores.Cars - 1);
    }
  }
}

function saveResults() {
  // In a real implementation, this would save the results to a database
  console.log("User selections:", selectedTiles);
  console.log("Final scores:", scores);

  // Determine the dominant category
  let dominantCategory = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );

  console.log("User categorized as:", dominantCategory);

  // Reset for next captcha
  resetCaptcha();
}

function resetCaptcha() {
  // Reset selections
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      selectedTiles[i][j] = false;
    }
  }

  // Reset scores
  for (let category in scores) {
    scores[category] = 0;
  }
}

// function keyPressed() {
//   if (key === "s") {
//     img.save();
//     console.log("image saved");
//   }
// }
