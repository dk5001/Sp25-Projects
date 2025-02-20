// Moving bodies array
let movers = [];

// Liquid
let liquid;

function setup() {
  createCanvas(800, 800);

  liquid = new Liquid(0, height / 2, width, height / 2, 0.1);
}

function draw() {
  background(0, 10);

  // Update and draw liquid
  liquid.updateWave();
  liquid.show();

  for (let i = 0; i < movers.length; i++) {
    // Update the mover's liquid state
    movers[i].inLiquid = liquid.contains(movers[i]);
    
    // Is the Mover in the liquid?
    if (movers[i].inLiquid) {
      // Calculate drag force
      let dragForce = liquid.calculateDrag(movers[i]);
      // Apply drag force to Mover
      movers[i].applyForce(dragForce);
      
      // Add disturbance to liquid
      let impactForce = movers[i].velocity.mag() * 0.1;
      liquid.disturb(movers[i].position.x, impactForce);
    }

    // Gravity is scaled by mass here!
    let gravity = createVector(0, 0.1 * movers[i].mass);
    // Apply gravity
    movers[i].applyForce(gravity);

    // Update and display
    movers[i].update();
    movers[i].show();
    movers[i].checkEdges();
  }
}

function mousePressed() {
  // Create new mover at mouse x position, starting from top of canvas
  let mass = random(0.5, 5);
  movers.push(new Mover(mouseX, 80, mass));
}
