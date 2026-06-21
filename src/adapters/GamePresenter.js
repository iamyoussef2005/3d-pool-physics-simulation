/**
 * ============================================================================
 * LAYER: Interface Adapters Layer (Presenters)
 * FILE: GamePresenter.js
 * PURPOSE: Orchestrates the game rendering loop. Triggers the physics step use case,
 *          obtains physical state, and instructs the graphics engine to update positions.
 * ============================================================================
 */
export class GamePresenter {
  constructor(sceneManager, ballGraphics, stepSimulationUseCase, physicsEngine, clock) {
    this.sceneManager = sceneManager;
    this.ballGraphics = ballGraphics;
    this.stepSimulationUseCase = stepSimulationUseCase;
    this.physicsEngine = physicsEngine;
    this.clock = clock;
  }

  start() {
    const animate = () => {
      requestAnimationFrame(animate);

      const dt = Math.min(this.clock.getDelta(), 0.1); // limit max delta to avoid huge jumps

      // 1. Step the physics simulation using the use case
      this.stepSimulationUseCase.execute(dt);

      // 2. Synchronize the graphical balls with their physical counterparts
      const physBalls = this.physicsEngine.getBalls();
      for (let physBall of physBalls) {
        this.ballGraphics.syncBall(
          physBall.id,
          physBall.position,
          physBall.angularVelocity,
          dt
        );
      }

      // 3. Render frame
      this.sceneManager.updateControls();
      this.sceneManager.render();
    };

    animate();
  }
}
