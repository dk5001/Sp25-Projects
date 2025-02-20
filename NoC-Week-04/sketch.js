// ASTEROIDS & BOIDS by fl4me.boi

// Mover object
let asteroid;
let boid;

function setup() {
  createCanvas(windowWidth, windowHeight);
  asteroid = new Asteroid();
  boid = new Boid();
}

function draw() {
  background(0, 5);

  // Update position
  asteroid.update();
  boid.update();
  // Wrape edges
  asteroid.wrapEdges();
  boid.checkEdges();
  // Draw ship
  asteroid.show();
  boid.display();

  // fill(0);
  // text("left right arrows to turn, z to thrust",10,height-5);

  // Turn or thrust the ship depending on what key is pressed
  if (keyIsDown(LEFT_ARROW)) {
    asteroid.turn(-0.03);
  } else if (keyIsDown(RIGHT_ARROW)) {
    asteroid.turn(0.03);
  } else if (keyIsDown(UP_ARROW)) {
    asteroid.thrust();
  }
}