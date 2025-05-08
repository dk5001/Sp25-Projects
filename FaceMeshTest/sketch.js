
let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let faceDetected = false;
let captureTimer = 0;
let capturedImage = null;
let showCaptured = false;
let isolatedFace = false;
let capturedFace = null;
let copiedPixels = 0;

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  if (showCaptured && capturedImage) {
    // Display the captured image
    image(capturedImage, 0, 0, width, height);
  } else {
    // Draw the webcam video
    image(video, 0, 0, width, height);
    
    // Draw face points if needed (you can comment this out if not needed)
    drawFacePoints();
    
    // Check if it's time to capture
    if (faceDetected && !capturedImage && millis() - captureTimer > 2000) {
      capturedImage = video.get(); // Capture current frame
      capturedFace = faces.length > 0 ? {...faces[0]} : null; // Deep copy of face data
      showCaptured = true;
      console.log("Image captured! Face data stored:", capturedFace !== null);
    }
  }
}

// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;

  // Check if a face is detected
  if (!faceDetected && faces.length > 0) {
    faceDetected = true;
    captureTimer = millis(); // Start the timer
    console.log("Face detected! Will capture in 2 seconds...");
  }
}

function drawFacePoints() {
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 5); // Smaller circles for visualization
    }
  }
}

function mousePressed() {
  console.log("Mouse pressed!");
  
  if (showCaptured && capturedImage && !isolatedFace) {
    console.log("Attempting to isolate face...");
    isolateFace();
    isolatedFace = true;
  } else {
    console.log("Cannot isolate face. Conditions not met:");
    console.log("- showCaptured:", showCaptured);
    console.log("- capturedImage exists:", capturedImage !== null);
    console.log("- !isolatedFace:", !isolatedFace);
  }
}

function isolateFace() {
  if (!capturedImage || !capturedFace) { 
    console.log("No captured image or no faces detected.");
    return;
  }
  
  console.log("Isolating detected face...");
  let buffer = createGraphics(width, height);
  buffer.image(capturedImage, 0, 0, width, height);
  
  let maskBuffer = createGraphics(width, height);
  maskBuffer.fill(255);
  maskBuffer.noStroke();
  
  // Get the face
  let face = capturedFace;
  
  // Calculate face bounds 
  let minX = width, maxX = 0, minY = height, maxY = 0;
  
  // Find bounding box of face points
  for (let i = 0; i < face.keypoints.length; i++) {
    let keypoint = face.keypoints[i];
    if (keypoint.x < minX) minX = keypoint.x;
    if (keypoint.x > maxX) maxX = keypoint.x;
    if (keypoint.y < minY) minY = keypoint.y;
    if (keypoint.y > maxY) maxY = keypoint.y;
  }
  
  // Create an elliptical mask that properly covers the face
  let centerX = (minX + maxX) / 2;
  let centerY = (minY + maxY) / 2;
  let faceWidth = (maxX - minX) * 1.2; // Add margin
  let faceHeight = (maxY - minY) * 1.3; // Add margin
  
  // Draw an ellipse for the face
  maskBuffer.ellipse(centerX, centerY, faceWidth, faceHeight);
  
  // Apply the mask
  buffer.loadPixels();
  maskBuffer.loadPixels();

  // For debugging
  // image(maskBuffer, 0, 0, width/2, height/2);
  
  // Create a new image with black background
  let maskedImage = createImage(width, height);
  maskedImage.loadPixels();
  
  // Fill with black
  for (let i = 0; i < maskedImage.pixels.length; i++) {
    maskedImage.pixels[i] = 0;
  }
  
  // Reset counter before the loop
  copiedPixels = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = 4 * (y * width + x);
      
      // Check if this pixel is white in the mask
      if (maskBuffer.pixels[index] > 200) {
        // Copy the pixel from the original image
        maskedImage.pixels[index] = buffer.pixels[index];       // R
        maskedImage.pixels[index + 1] = buffer.pixels[index + 1]; // G
        maskedImage.pixels[index + 2] = buffer.pixels[index + 2]; // B
        maskedImage.pixels[index + 3] = 255;                    // A
        copiedPixels++;
      }
    }
  }

  console.log("Copied pixels:", copiedPixels);
  
  maskedImage.updatePixels();
  capturedImage = maskedImage;
  console.log("Face isolation complete with " + copiedPixels + " pixels copied");
}

/*function isolateFace() {
  if (!capturedImage) return;
  
  console.log("Creating simple mask...");
  
  // Create a new image with black background
  let maskedImage = createImage(width, height);
  maskedImage.loadPixels();
  
  // Fill with black
  for (let i = 0; i < maskedImage.pixels.length; i++) {
    maskedImage.pixels[i] = 0;
  }
  
  // Create a simple circular mask in the center
  let centerX = width/2;
  let centerY = height/2;
  let radius = 100;
  
  capturedImage.loadPixels();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check if pixel is within circle
      let d = dist(x, y, centerX, centerY);
      if (d < radius) {
        let index = 4 * (y * width + x);
        // Copy pixel from captured image
        maskedImage.pixels[index] = capturedImage.pixels[index];
        maskedImage.pixels[index+1] = capturedImage.pixels[index+1];
        maskedImage.pixels[index+2] = capturedImage.pixels[index+2];
        maskedImage.pixels[index+3] = 255;
      }
    }
  }
  
  maskedImage.updatePixels();
  capturedImage = maskedImage;
  console.log("Simple mask applied!");
}*/