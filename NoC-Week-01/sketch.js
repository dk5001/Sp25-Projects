let walkers = [];
const NUM_WALKERS = 16; // Number of nested walkers
const SIZE_RATIO = 0.6; // Each walker will be 60% the size of its parent
const VERTICES = 8; // Number of vertices for each shape

function setup() {
  createCanvas(800, 800);
  // Create walkers, starting from largest to smallest
  let startSize = 500;
  for (let i = 0; i < NUM_WALKERS; i++) {
    walkers.push(new Walker(
      width/2, 
      height/2, 
      startSize * pow(SIZE_RATIO, i)
    ));
  }
  background(0);
}

function draw() {
  background(0, 25);
  
  // Update and show all walkers
  walkers[0].update(); // First walker moves freely
  for (let i = 1; i < walkers.length; i++) {
    walkers[i].update(walkers[i-1].x, walkers[i-1].y); // Each walker follows its parent
  }
  
  // Draw from largest to smallest
  for (let walker of walkers) {
    walker.show();
  }
}

class Walker {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.baseSize = size; // Store the original size
    this.size = size;
    this.sizeSpeed = random(0.01, 0.02);
    this.sizePhase = random(TWO_PI);
    
    // Initialize vertices with random offsets
    this.vertices = [];
    for (let i = 0; i < VERTICES; i++) {
      this.vertices.push({
        offset: random(0.6, 1.4),
        speed: random(0.01, 0.03),
        phase: random(TWO_PI)
      });
    }
  }
  
  update(parentX, parentY) {
    if (parentX === undefined) {
      // This is the main walker - move freely
      let choice = floor(random(4));
      switch(choice) {
        case 0: this.x += 2; break;
        case 1: this.x -= 2; break;
        case 2: this.y -= 2; break;
        case 3: this.y += 2; break;
      }
      // Keep main walker within canvas bounds
      this.x = constrain(this.x, 0, width);
      this.y = constrain(this.y, 0, height);
    } else {
      // This is a child walker - follow parent
      let choice = floor(random(4));
      switch(choice) {
        case 0: this.x += 1; break;
        case 1: this.x -= 1; break;
        case 2: this.y -= 1; break;
        case 3: this.y += 1; break;
      }
      
      // Constrain to parent rectangle boundaries
      let parentSize = this.size / SIZE_RATIO;
      let maxDistance = (parentSize - this.size) / 2;
      this.x = constrain(this.x, parentX - maxDistance, parentX + maxDistance);
      this.y = constrain(this.y, parentY - maxDistance, parentY + maxDistance);
    }
    
    // Update size
    this.sizePhase += this.sizeSpeed;
    let sizeVariation = map(sin(this.sizePhase), -1, 1, 0.8, 1.2); // ±20%
    this.size = this.baseSize * sizeVariation;
    
    // Update vertex offsets
    for (let v of this.vertices) {
      v.phase += v.speed;
      v.offset = map(sin(v.phase), -1, 1, 0.6, 1.4);
    }
  }
  
  show() {
    stroke(200);
    fill(255, 4);
    
    beginShape();
    for (let i = 0; i < VERTICES; i++) {
      let angle = map(i, 0, VERTICES, 0, TWO_PI);
      let radius = this.size/2 * this.vertices[i].offset;
      let vx = this.x + cos(angle) * radius;
      let vy = this.y + sin(angle) * radius;
      curveVertex(vx, vy);
      
      // Add first two points at end to close the shape smoothly
      if (i === 0) {
        let firstX = vx;
        let firstY = vy;
        if (i === VERTICES - 1) {
          curveVertex(firstX, firstY);
          curveVertex(firstX, firstY);
        }
      }
    }
    endShape(CLOSE);
  }
}
