// ASTEROIDS & BOIDS by fl4me.boi

// Mover object
let asteroid;
let boid;
let numBoids = 30;
let flock;
let numBoidsSlider, boundarySlider, sepSlider, aliSlider, cohSlider;
let dampingSlider, topspeedSlider, maxforceSlider;
let debugCheckbox;

function setup() {
  createCanvas(windowWidth, windowHeight);
  asteroid = new Asteroid();

  // Boid sliders
  numBoidsSlider = createSlider(0, 500, 100);
  numBoidsSlider.position(10, 10);
  boundarySlider = createSlider(50, 500, 200);
  boundarySlider.position(10, 40);
  sepSlider = createSlider(0, 5, 1.5, 0.1);
  sepSlider.position(10, 70);
  aliSlider = createSlider(0, 5, 1.0, 0.1);
  aliSlider.position(10, 100);
  cohSlider = createSlider(0, 5, 1.0, 0.1);
  cohSlider.position(10, 130);

  // Asteroid sliders
  dampingSlider = createSlider(0.9, 1, 0.995, 0.001);
  dampingSlider.position(width - 150, 10);
  topspeedSlider = createSlider(1, 10, 6);
  topspeedSlider.position(width - 150, 40);
  maxforceSlider = createSlider(0.01, 1, 0.1, 0.01);
  maxforceSlider.position(width - 150, 70);

  // Debug checkbox
  debugCheckbox = createCheckbox('Show Boundary', false);
  debugCheckbox.position(10, 160);
  debugCheckbox.style('color', 'white'); // Set the text color to white

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < numBoids; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }
}

function draw() {
  background(0, 50);

  let numBoids = numBoidsSlider.value();
  let boundary = boundarySlider.value();
  let sepWeight = sepSlider.value();
  let aliWeight = aliSlider.value();
  let cohWeight = cohSlider.value();

  if (numBoids < flock.boids.length) {
    flock.boids.splice(numBoids, flock.boids.length - numBoids);
  } else if (numBoids > flock.boids.length) {
    for (let i = flock.boids.length; i < numBoids; i++) {
      let boid = new Boid(width / 2, height / 2);
      flock.addBoid(boid);
    }
  }

  flock.run(asteroid, boundary, sepWeight, aliWeight, cohWeight);

  // Update asteroid parameters
  asteroid.damping = dampingSlider.value();
  asteroid.topspeed = topspeedSlider.value();
  asteroid.maxforce = maxforceSlider.value();

  if (keyIsDown(32)) { // Spacebar
    // Make the asteroid seek the mouse position
    let mousePosition = createVector(mouseX, mouseY);
    asteroid.arrive(mousePosition);
  }

  // Update position
  asteroid.update();
  // Wrap edges
  asteroid.wrapEdges();
  // Draw asteroid
  asteroid.show();

  // Draw debug circle if checkbox is checked
  if (debugCheckbox.checked()) {
    push();
    noFill();
    let boundaryColor = map(sin(frameCount * 0.1), -1, 1, 50, 255);
    stroke(0, 50, boundaryColor);
    ellipse(asteroid.position.x, asteroid.position.y, boundary);
    pop();
  }

  // Labels for sliders
  fill(255);
  text("Number of Boids", numBoidsSlider.x * 2 + numBoidsSlider.width, 25);
  text("Boundary", boundarySlider.x * 2 + boundarySlider.width, 55);
  text("Separation", sepSlider.x * 2 + sepSlider.width, 85);
  text("Alignment", aliSlider.x * 2 + aliSlider.width, 115);
  text("Cohesion", cohSlider.x * 2 + cohSlider.width, 145);

  text("Damping", dampingSlider.x - 80, 25);
  text("Top Speed", topspeedSlider.x - 80, 55);
  text("Max Force", maxforceSlider.x - 80, 85);
}