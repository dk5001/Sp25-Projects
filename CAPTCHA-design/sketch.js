let gridSize = 3; // Number of rows and columns
let tileSize; // Size of each tile
let selectedTiles = []; // Array to store selected tiles
let tileImages = []; // Array to store the loaded images
let displayedImages = []; // Array to store 9 images displayed in the grid
let imageNames = []; // Array to store the names of images for weights lookup
let categories = ["Calm/Neutral", "Confident/Positive", "Chaotic/Negative"]; // Categories from weights.json
let scores = { "Calm/Neutral": 0, "Confident/Positive": 0, "Chaotic/Negative": 0 }; // Scoring system
let weights; // Object to store the weights from JSON file

// Application state variables
let appState = "SELECTION"; // Can be "SELECTION" or "RATIONAL_TEST"
let captchaTitle = "Choose the most rational state";
let headerColor = [100, 100, 100]; // Initial gray color for header
let interactionsLocked = false; // Flag to lock interactions

// Selection tracking
let selectionTime = 0; // Time when the last selection was made
let selectedCol = -1; // Store the column of the selected tile
let selectedRow = -1; // Store the row of the selected tile
let selectionCount = 0; // Count how many tiles are selected
let selectedImage = null; // The currently selected image

// Webcam variables
let capture; // Webcam capture
let showingWebcam = false; // Flag to track if webcam is currently shown

let userSelectionData = {}; // Object to store user selections
let rationalTestStartTime = 0;  // When the RATIONAL_TEST state began
let faceCaptured = false;       // Flag to ensure we only capture once
let jsonFilename = "";          // Store filename to use for both JSON and image

function preload() {
  weights = loadJSON('weights.json');

  // Dynamically load all images with two-digit padding in the folder
  for (let i = 1; i <= 15; i++) {
    // Adjust this number based on the total images in your folder
    let paddedIndex = String(i).padStart(2, "0"); // Ensure two-digit padding
    let imgPath = `images/img${paddedIndex}.png`;
    let imageName = `img${paddedIndex}.png`;
    imageNames.push(imageName);
    tileImages.push(loadImage(imgPath));
  }
}

function setup() {
  createCanvas(400, 500);
  tileSize = width / gridSize;

  // Initialize webcam
  capture = createCapture(VIDEO);
  capture.size(tileSize, tileSize);
  capture.hide(); // Hide the default video element

  // Randomly select 9 images from the loaded images and track their names
  let shuffledIndices = shuffle([...Array(tileImages.length).keys()]);
  displayedImages = shuffledIndices.slice(0, gridSize * gridSize).map(i => tileImages[i]);
  
  // Keep track of the selected image names
  let displayedImageNames = shuffledIndices.slice(0, gridSize * gridSize).map(i => imageNames[i]);
  
  // Store the mapping between grid positions and image names
  imageNameGrid = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    imageNameGrid.push(displayedImageNames[i]);
  }

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
  fill(headerColor[0], headerColor[1], headerColor[2]);
  rect(0, 0, width, 80);

  // Draw captcha instructions
  fill(255);
  textSize(18);
  textAlign(CENTER, TOP);
  text(captchaTitle, width/2, 20);

  // Check if we need to transition states
  if (appState === "SELECTION" && selectionCount === 1 && selectionTime > 0 && millis() - selectionTime > 3000) {
    transitionToRationalTest();
  }

    // Check if we should capture the webcam image (3 seconds after RATIONAL_TEST begins)
  if (appState === "RATIONAL_TEST" && !faceCaptured && 
      rationalTestStartTime > 0 && millis() - rationalTestStartTime > 3000) {
    captureUserFace();
    faceCaptured = true;
  }

  // Get the selected image (if any)
  if (selectionCount === 1 && selectedCol >= 0 && selectedRow >= 0) {
    let selectedImgIndex = selectedCol + selectedRow * gridSize;
    selectedImage = displayedImages[selectedImgIndex];
  }

  // Draw grid based on current state
  drawGrid();

  // Draw skip button (only in selection state)
  if (appState === "SELECTION" && !interactionsLocked) {
    drawSkipButton();
  }

  // Display countdown timer if only one tile is selected
  if (selectionCount === 1 && selectionTime > 0 && !showingWebcam) {
    let timeLeft = 3 - floor((millis() - selectionTime) / 1000);
    if (timeLeft >= 0) {
      fill(0);
      textAlign(CENTER, TOP);
      textSize(16);
      text(`Scanning in ${timeLeft}...`, width / 2, height - 450);
    }
  }
}

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i * tileSize;
      let y = j * tileSize + 80; // Offset for header
      
      if (appState === "RATIONAL_TEST" && selectedTiles[i][j]) {
        // Draw webcam footage in selected tile
        drawWebcamTile(x, y);
      } else if (appState === "RATIONAL_TEST") {
        // Draw selected image in all non-selected tiles
        image(selectedImage, x, y, tileSize, tileSize);
      } 
      // else if (appState === "SELECTION" && selectionCount === 1 && selectedImage) {
      //   // In selection state with one tile selected, show selected image in all tiles
      //   image(selectedImage, x, y, tileSize, tileSize);
      // } 
      else {
        // Normal display when no selection
        let imgIndex = i + j * gridSize;
        image(displayedImages[imgIndex], x, y, tileSize, tileSize);
      }

      // Draw selection overlay
      if (selectedTiles[i][j]) {
        if (appState === "RATIONAL_TEST") {
          fill(255, 0, 0, 100); // Red for rational test state
        } else {
          fill(100, 0, 0, 100); // Darker red for selection state
        }
        rect(x, y, tileSize, tileSize);
      }

       // Draw grid lines
       stroke(255);
       strokeWeight(2);
       noFill();
       rect(x, y, tileSize, tileSize);
    }
  }
}

function drawWebcamTile(x, y) {
  // Draw zoomed-in webcam footage in the selected tile
  capture.loadPixels();
  
  // Convert to grayscale
  for (let k = 0; k < capture.pixels.length; k += 4) {
    let r = capture.pixels[k];
    let g = capture.pixels[k + 1];
    let b = capture.pixels[k + 2];
    let gray = (r + g + b) / 3;
    capture.pixels[k] = gray;
    capture.pixels[k + 1] = gray;
    capture.pixels[k + 2] = gray;
  }
  capture.updatePixels();
  
  // Draw mirrored webcam
  let zoomedTileSize = tileSize / 2;
  push();
  translate(x + tileSize, y);
  scale(-1, 1);
  image(capture, 0, 0, tileSize, tileSize, 
        capture.width / 2 - zoomedTileSize / 2, 
        capture.height / 2 - zoomedTileSize / 2, 
        zoomedTileSize, zoomedTileSize);
  pop();
}

function drawSkipButton() {
  fill(10, 10, 10, 150); // Semi-transparent black for button
  rect(width - 110, height - 40, 100, 30, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("SHUFFLE", width - 60, height - 25);
}

function transitionToRationalTest() {
  appState = "RATIONAL_TEST";
  showingWebcam = true;
  captchaTitle = "ARE YOU RATIONAL?";
  headerColor = [255, 0, 0]; // Change to red
  interactionsLocked = true;
  rationalTestStartTime = millis(); // Record the start time
  faceCaptured = false; // Reset face capture flag
  console.log("Transitioning to rational test");

  // Create a unique filename base to use for both JSON and image
  jsonFilename = 'user_selection_' + Date.now();
  
  // Save the JSON data immediately
  saveUserSelectionData();
}

function captureUserFace() {
  // Create a copy of the current webcam frame
  let faceImage = createImage(capture.width, capture.height);
  faceImage.copy(capture, 0, 0, capture.width, capture.height, 0, 0, capture.width, capture.height);
  
  // Save the image with the same base filename as the JSON
  faceImage.save(jsonFilename + '.png');
  console.log("User face captured and saved");
}

function saveUserSelectionData() {
  // Create an object to store the data
  userSelectionData = {
    timestamp: Date.now(),
    selectedImage: "",
    // selectedPosition: { row: selectedRow, col: selectedCol },
    weights: {},
    scores: {},
    faceCaptureFile: jsonFilename + '.png'  // Add reference to the image file
  };
  
  // Get the image name for the selected tile
  if (selectedRow >= 0 && selectedCol >= 0) {
    let imgIndex = selectedCol + selectedRow * gridSize;
    let imageName = imageNameGrid[imgIndex];
    userSelectionData.selectedImage = imageName;
    
    // Store the weights of the selected image
    if (weights[imageName]) {
      userSelectionData.weights = weights[imageName];
    }
  }
  
  // Store current scores
  userSelectionData.scores = JSON.parse(JSON.stringify(scores));
  
  // Save the data to a JSON file
  saveJSON(userSelectionData, 'user_selection_' + Date.now() + '.json');
  console.log("User selection data saved:", userSelectionData);
}

function mousePressed() {
  // If interactions are locked, ignore all mouse presses
  if (interactionsLocked) {
    return;
  }
  
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

    // Update counts and tracking variables
    updateSelectionCount();
    
    // Reset webcam transition if multiple tiles are selected
    if (selectionCount !== 1) {
      selectionTime = 0;
      showingWebcam = false;
    } else {
      // Start timer for webcam transition if exactly one tile is selected
      selectionTime = millis();
      selectedCol = col;
      selectedRow = row;
    }

    // Update scores based on selection logic
    updateScores(col, row);
  }
}

function updateSelectionCount() {
  selectionCount = 0;
  selectedCol = -1;
  selectedRow = -1;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (selectedTiles[i][j]) {
        selectionCount++;
        selectedCol = i;
        selectedRow = j;
      }
    }
  }
}

function updateScores(col, row) {
  // Get the image name for the selected tile
  let imgIndex = col + row * gridSize;
  let imageName = imageNameGrid[imgIndex];
  
  if (selectedTiles[col][row]) {
    // Add weights from the selected image
    if (weights[imageName]) {
      for (let category in weights[imageName]) {
        scores[category] += weights[imageName][category];
      }
    }
  } else {
    // Subtract weights if deselected
    if (weights[imageName]) {
      for (let category in weights[imageName]) {
        scores[category] = Math.max(0, scores[category] - weights[imageName][category]);
      }
    }
  }
}

function saveResults() {
  // In a real implementation, this would save the results to a database
  console.log("User selections:", selectedTiles);
  console.log("Final scores:", scores);

  // Determine the dominant category based on highest score
  let dominantCategory = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );

  console.log("User categorized as:", dominantCategory);

  // Reset for next captcha
  resetCaptcha();
}

function resetCaptcha() {
  // Reset to initial state
  appState = "SELECTION";
  
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
  
  // Reset all tracking variables
  selectionTime = 0;
  showingWebcam = false;
  rationalTestStartTime = 0;
  faceCaptured = false;
  selectionCount = 0;
  selectedCol = -1;
  selectedRow = -1;
  selectedImage = null;

  // Reset UI elements
  captchaTitle = "Choose the most rational state";
  headerColor = [100, 100, 100]; // Reset to grey
  interactionsLocked = false;

  // Reshuffle images for new CAPTCHA
  let shuffledIndices = shuffle([...Array(tileImages.length).keys()]);
  displayedImages = shuffledIndices.slice(0, gridSize * gridSize).map(i => tileImages[i]);
  
  let displayedImageNames = shuffledIndices.slice(0, gridSize * gridSize).map(i => imageNames[i]);
  imageNameGrid = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    imageNameGrid.push(displayedImageNames[i]);
  }
}

// function keyPressed() {
//   if (key === "s") {
//     img.save();
//     console.log("image saved");
//   }
// }
