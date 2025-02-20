// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

class Liquid {
    constructor(x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.c = c;
      
      // Add wave properties
      this.wavePoints = [];
      this.waveCount = 40; // Number of points to create wave
      this.dampening = 0.9; // Wave dampening
      this.tension = 0.05; // Wave tension
      
      // Initialize wave points
      for (let i = 0; i < this.waveCount; i++) {
        this.wavePoints[i] = {
          x: this.x + (i * (this.w / (this.waveCount - 1))),
          y: this.y,
          velocity: 0
        };
      }
    }
  
    // Is the Mover in the Liquid?
    contains(mover) {
      let pos = mover.position;
      return (
        pos.x > this.x &&
        pos.x < this.x + this.w &&
        pos.y > this.y &&
        pos.y < this.y + this.h
      );
    }
  
    // Calculate drag force
    calculateDrag(mover) {
      // Magnitude is coefficient * speed squared
      let speed = mover.velocity.mag();
      let dragMagnitude = this.c * speed * speed;
  
      // Direction is inverse of velocity
      let dragForce = mover.velocity.copy();
      dragForce.mult(-1);
  
      // Scale according to magnitude
      dragForce.setMag(dragMagnitude);
      return dragForce;
    }
  
    // Add disturbance to wave when mover hits
    disturb(moverX, force) {
      for (let i = 0; i < this.waveCount; i++) {
        let distance = abs(moverX - this.wavePoints[i].x);
        if (distance < 50) { // Affect points within 50 pixels
          let influence = force * (1 - distance / 50);
          this.wavePoints[i].velocity += influence;
        }
      }
    }
    
    // Update wave physics
    updateWave() {
      for (let i = 0; i < this.waveCount; i++) {
        // Update point position based on velocity
        this.wavePoints[i].y += this.wavePoints[i].velocity;
        
        // Calculate force from neighboring points
        let force = 0;
        if (i > 0) {
          force += this.tension * (this.wavePoints[i-1].y - this.wavePoints[i].y);
        }
        if (i < this.waveCount-1) {
          force += this.tension * (this.wavePoints[i+1].y - this.wavePoints[i].y);
        }
        
        // Apply force and dampening
        this.wavePoints[i].velocity += force;
        this.wavePoints[i].velocity *= this.dampening;
        
        // Keep points near original position
        let targetY = this.y;
        this.wavePoints[i].y += (targetY - this.wavePoints[i].y) * 0.05;
      }
    }
  
    show() {
      noStroke();
      fill(0, 0, 0, 20); // This will give a semi-transparent light blue
      
      // Draw water using curved shape
      beginShape();
      // Start with left bottom corner
      vertex(this.x, height);
      
      // Draw curved top edge using wave points
      for (let i = 0; i < this.waveCount; i++) {
        curveVertex(this.wavePoints[i].x, this.wavePoints[i].y);
      }
      
      // Complete shape
      vertex(this.x + this.w, height);
      endShape(CLOSE);
    }
  }
  