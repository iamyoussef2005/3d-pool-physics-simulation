/**
 * ============================================================================
 * LAYER: Domain Layer (Entities)
 * FILE: PhysicsEngine.js
 * PURPOSE: Core simulation manager computing movements, sliding friction (kinetic),
 *          rolling resistance, and numerical integration (Euler) for billiard balls.
 * ============================================================================
 */
import { Vector3D } from './Vector3D.js';
import { PhysBall } from './PhysBall.js';

// The core simulation engine managing the physical world
export class PhysicsEngine {
  constructor() {
    this.balls = [];
    this.gravity = 9.81; // Keep positive for magnitude calculations
    this.mu_k = 0.2;     // Kinetic (Sliding) friction coefficient (from report)
    this.mu_r = 0.01;    // Rolling resistance coefficient
    this.sleepThreshold = 0.0001; // Threshold from the report
  }

  addBall(id, mass, radius, position) {
    const ball = new PhysBall(id, mass, radius, position);
    this.balls.push(ball);
    return ball;
  }

  // Basic Simulation Loop - Numeric Integration
  step(dt) {
    for (let ball of this.balls) {
      // 1. Calculate contact point velocity (V_c = v + w x r)
      // Radius vector from center of mass to contact point with table (y is up)
      let rc = new Vector3D(0, -ball.radius, 0);
      
      // w x rc
      let w_cross_rc = ball.angularVelocity.clone().cross(rc);
      
      // V_c = v + (w x rc) (ignoring y component since motion is on x-z plane)
      let vc = new Vector3D(
        ball.velocity.x + w_cross_rc.x,
        0,
        ball.velocity.z + w_cross_rc.z
      );

      let vc_len = vc.length();
      let v_len = new Vector3D(ball.velocity.x, 0, ball.velocity.z).length();
      let w_len = ball.angularVelocity.length();

      // Check if the ball should be put to sleep
      if (v_len < this.sleepThreshold && w_len < this.sleepThreshold && ball.acceleration.length() === 0) {
        ball.isSleeping = true;
        ball.velocity = new Vector3D(0, 0, 0);
        ball.angularVelocity = new Vector3D(0, 0, 0);
        continue; // Skip physics processing for sleeping balls
      } else {
        ball.isSleeping = false;
      }

      // Reset accelerations
      ball.acceleration = new Vector3D(0, 0, 0);
      let angularAcceleration = new Vector3D(0, 0, 0);

      // Moment of inertia for a solid sphere: I = 2/5 * m * r^2
      let I = (2.0 / 5.0) * ball.mass * (ball.radius * ball.radius);

      if (vc_len > 0.05) {
        // --- SLIDING STATE ---
        // Friction opposes contact point velocity
        let u = vc.clone().normalize();
        
        // f_k = mu_k * m * g
        let fk_mag = this.mu_k * ball.mass * this.gravity;
        let fk = new Vector3D(-u.x * fk_mag, 0, -u.z * fk_mag);
        
        // Linear acceleration: a = F_k / m
        ball.acceleration.x = fk.x / ball.mass;
        ball.acceleration.z = fk.z / ball.mass;

        // Torque: tau = rc x F_k
        let tau = rc.clone().cross(fk);
        
        // Angular acceleration: alpha = tau / I
        angularAcceleration.x = tau.x / I;
        angularAcceleration.y = tau.y / I;
        angularAcceleration.z = tau.z / I;

      } else if (v_len > 0.005) {
        // --- PURE ROLLING STATE ---
        // Rolling resistance opposes linear velocity
        let u = new Vector3D(ball.velocity.x, 0, ball.velocity.z).normalize();
        
        let fr_mag = this.mu_r * ball.mass * this.gravity;
        let fr = new Vector3D(-u.x * fr_mag, 0, -u.z * fr_mag);
        
        ball.acceleration.x = fr.x / ball.mass;
        ball.acceleration.z = fr.z / ball.mass;

        // In pure rolling, angular velocity is locked to linear velocity
        // w_x = v_z / R, w_z = -v_x / R
        ball.angularVelocity.x = ball.velocity.z / ball.radius;
        ball.angularVelocity.z = -ball.velocity.x / ball.radius;
        ball.angularVelocity.y *= 0.98; // Gradual dampening of vertical spin
      }

      // Numerical Integration (Euler Method)
      
      // Linear Integration
      ball.velocity.x += ball.acceleration.x * dt;
      ball.velocity.y += ball.acceleration.y * dt;
      ball.velocity.z += ball.acceleration.z * dt;

      // Ensure we don't accidentally reverse velocity due to over-integration of friction
      let new_v_len = new Vector3D(ball.velocity.x, 0, ball.velocity.z).length();
      if (new_v_len < this.sleepThreshold && ball.acceleration.length() > 0) {
          ball.velocity = new Vector3D(0,0,0);
          ball.angularVelocity = new Vector3D(0,0,0);
          ball.acceleration = new Vector3D(0,0,0);
      }

      ball.position.x += ball.velocity.x * dt;
      ball.position.y += ball.velocity.y * dt;
      ball.position.z += ball.velocity.z * dt;

      // Angular Integration
      if (vc_len > 0.05) {
        ball.angularVelocity.x += angularAcceleration.x * dt;
        ball.angularVelocity.y += angularAcceleration.y * dt;
        ball.angularVelocity.z += angularAcceleration.z * dt;
      }
    }
  }

  getBalls() {
    return this.balls;
  }
}
