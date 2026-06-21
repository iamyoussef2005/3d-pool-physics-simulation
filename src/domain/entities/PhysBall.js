/**
 * ============================================================================
 * LAYER: Domain Layer (Entities)
 * FILE: PhysBall.js
 * PURPOSE: Represents the physical state and kinematics of a billiard ball.
 *          Contains mass, radius, position, velocity, and angular velocity.
 * ============================================================================
 */
import { Vector3D } from './Vector3D.js';

// Represents a purely physical ball in the simulation
export class PhysBall {
  constructor(id, mass, radius, position) {
    this.id = id;
    this.mass = mass;
    this.radius = radius;
    this.isSleeping = false;
    
    // Linear motion vectors
    this.position = new Vector3D(position.x, position.y, position.z);
    this.velocity = new Vector3D(0, 0, 0);
    this.acceleration = new Vector3D(0, 0, 0);
    
    // Rotational motion vector (for later implementation of spin/torque)
    this.angularVelocity = new Vector3D(0, 0, 0);
  }
}
