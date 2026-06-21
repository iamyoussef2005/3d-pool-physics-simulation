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
