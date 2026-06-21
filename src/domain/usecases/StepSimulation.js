export class StepSimulation {
  constructor(physicsEngine) {
    this.physicsEngine = physicsEngine;
  }

  execute(dt) {
    this.physicsEngine.step(dt);
  }
}
