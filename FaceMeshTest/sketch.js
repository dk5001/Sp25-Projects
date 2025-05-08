
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
  console.log("Face data:", faces);
  if (!capturedImage || !capturedFace) { 
    console.log("No captured image or no faces detected.");
    return;
  }
  
  console.log("Isolating detected face...");
  // Create a new graphics buffer
  let buffer = createGraphics(width, height);
  
  // Draw the captured image to the buffer
  buffer.image(capturedImage, 0, 0, width, height);
  
  // Create a mask from the face mesh
  let maskBuffer = createGraphics(width, height);
  maskBuffer.fill(255);
  maskBuffer.noStroke();
  
  // Get the first face
  let face = capturedFace;
  
  // Begin shape for the face mask
  maskBuffer.beginShape();

  console.log("Number of face keypoints:", face.keypoints.length);

  // Use all points for a blob
  for (let i = 0; i < face.keypoints.length; i++) {
    let keypoint = face.keypoints[i];
    maskBuffer.vertex(keypoint.x, keypoint.y);
  }
  
  // // Use the face contour points to create a boundary
  // // Face contour indices (adjust these based on your model)
  // // These are approximate indices for facemesh contour
  // const contourIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  
  // // Use more points for a smoother shape or all points for a blob
  // for (let i = 0; i < face.keypoints.length; i++) {
  //   let keypoint = face.keypoints[i];
  //   maskBuffer.vertex(keypoint.x, keypoint.y);
  // }
  
  maskBuffer.endShape(CLOSE);
  
  // Apply the mask to the buffer
  buffer.loadPixels();
  maskBuffer.loadPixels();

  // Display the mask for debugging
  image(maskBuffer, 0, 0, width/2, height/2);
  console.log("Displaying mask");
  // Early return to just see the mask
  // return;
  console.log("Mask dimensions:", maskBuffer.width, maskBuffer.height);
  console.log("Is mask created properly?", maskBuffer !== null && maskBuffer.width > 0);
  
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
    
    // Check if this pixel is white in the mask (use a threshold)
    if (maskBuffer.pixels[index] > 200) {  // Check if R value is close to 255
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