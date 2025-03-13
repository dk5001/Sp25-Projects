// ASTEROIDS & BOIDS by fl4me.boi

// Mover object
let asteroid;
let boid;
let numBoids = 30;
let flock;
let numBoidsSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  asteroid = new Asteroid();

  numBoidsSlider = createSlider(0, 500, 100);
  numBoidsSlider.position(10, 10);

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
  if (numBoids < flock.boids.length) {
    flock.boids.splice(numBoids, flock.boids.length - numBoids);
  } else if (numBoids > flock.boids.length) {
    for (let i = flock.boids.length; i < numBoids; i++) {
      let boid = new Boid(width / 2, height / 2);
      flock.addBoid(boid);
    }
  }

  flock.run(asteroid);

  // Make the asteroid seek the mouse position
  let mousePosition = createVector(mouseX, mouseY);
  asteroid.arrive(mousePosition);

  // Update position
  asteroid.update();
  // Wrap edges
  asteroid.wrapEdges();
  // Draw ship
  asteroid.show();

  // fill(0);
  // text("left right arrows to turn, z to thrust",10,height-5);

  // // Turn or thrust the ship depending on what key is pressed
  // if (keyIsDown(LEFT_ARROW)) {
  //   asteroid.turn(-0.03);
  // } else if (keyIsDown(RIGHT_ARROW)) {
  //   asteroid.turn(0.03);
  // } else if (keyIsDown(UP_ARROW)) {
  //   asteroid.thrust();
  // }
}