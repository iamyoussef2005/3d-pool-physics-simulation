/**
 * ============================================================================
 * LAYER: Domain Layer (Use Cases)
 * FILE: StepSimulation.js
 * PURPOSE: Application use case specifying the rule of stepping the physics
 *          simulation forward with a delta time input.
 * ============================================================================
 */
export class StepSimulation {
  constructor(physicsEngine) {
    this.physicsEngine = physicsEngine;
  }

  execute(dt) {
    this.physicsEngine.step(dt);
  }
}
