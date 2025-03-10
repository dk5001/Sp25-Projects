class Flock {

    constructor() {
      // An array for all the boids
      this.boids = []; // Initialize the array
    }
  
    run() {
      for (let boid of this.boids) {
        boid.run(this.boids, asteroid);  // Passing the entire list of boids to each boid individually
      }
    }
  
    addBoid(b) {
      this.boids.push(b);
    }
  }