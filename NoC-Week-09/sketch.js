let grid = [];
let cols, rows;
let cellSize = 2;
let startImage;
let frameRateSlider;

function preload() {
  startImage = loadImage('startPattern.jpg');
}

function setup() {
  // Print the rules
  console.log("GAME OF LIFE");
  console.log("THE RULES:");
  console.log("FOR A SPACE THAT IS 'POPULATED':");
  console.log("* EACH CELL WITH ONE OR NO NEIGHBORS DIES, AS IF BY SOLITUDE.");
  console.log("* EACH CELL WITH FOUR OR NO NEIGHBORS DIES, AS IF BY OVERPOPULATION.");
  console.log("* EACH CELL WITH TWO OR THREE NEIGHBORS SURVIVES.");
  console.log("FOR A SPACE THAT IS 'EMPTY' OR 'UNPOPULATED':");
  console.log("* EACH CELL WITH THREE NEIGHBORS BECOMES POPULATED.");
  console.log();
  console.log("INSTRUCTIONS:");
  console.log("PRESS SPACE TO RESET");
  console.log("CLICK A CELL TO TOGGLE STATE");

  // Set the frame rate
  frameRate(5);

  // Resize the image to fit the grid
  let imageWidth = startImage.width;
  let imageHeight = startImage.height;

  // Create canvas based on the image dimensions
  createCanvas(imageWidth, imageHeight);

  // Initialize grid properties
  cols = width / cellSize;
  rows = height / cellSize;

  // Resize the image to fit the grid
  startImage.resize(cols, rows);

  initializeGridFromImage();

  // Setup GUI
  frameRateSlider = createSlider(1, 60, 10);
  frameRateSlider.position(10, height + 10);
}

function draw() {
  background(255);

  // Update frame rate
  frameRate(frameRateSlider.value());

  updateGrid();

  // Draw grid
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        fill(255); // White for live cells
      } else {
        fill(0); // Black for dead cells
      }
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    // Spacebar to reset the grid
    initializeGridFromImage();
  }
}

function mousePressed() {
  // Toggle cell state on mouse click
  let x = floor(mouseX / cellSize);
  let y = floor(mouseY / cellSize);
  grid[x][y] = 1 - grid[x][y];
}

function initializeGridFromImage() {
  grid = new Array(cols).fill().map(() => new Array(rows).fill(0));
  startImage.loadPixels();
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let index = (x + y * startImage.width) * 4;
      let brightness = (startImage.pixels[index] + startImage.pixels[index + 1] + startImage.pixels[index + 2]) / 3;
      grid[x][y] = brightness > 50 ? 0 : 1; // Threshold to determine live or dead cell
    }
  }
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      count += grid[col][row];
    }
  }
  count -= grid[x][y]; // Subtract the cell itself
  return count;
}

function updateGrid() {
  let next = new Array(cols).fill().map(() => new Array(rows).fill(0));

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = countNeighbors(x, y);
      let state = grid[x][y];

      if (state === 0 && neighbors === 3) {
        next[x][y] = 1; // Reproduction
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        next[x][y] = 0; // Death
      } else {
        next[x][y] = state; // Stasis
      }
    }
  }

  grid = next; // Update the grid
}
