import * as THREE from './infrastructure/vendor/three.module.js';
import { PhysicsEngine } from './domain/entities/PhysicsEngine.js';
import { StepSimulation } from './domain/usecases/StepSimulation.js';
import { SceneManager } from './infrastructure/graphics/SceneManager.js';
import { TableGraphics } from './infrastructure/graphics/TableGraphics.js';
import { BallGraphics } from './infrastructure/graphics/BallGraphics.js';
import { CueGraphics } from './infrastructure/graphics/CueGraphics.js';
import { GamePresenter } from './adapters/GamePresenter.js';
import { GameController } from './adapters/GameController.js';

// Get DOM container for Canvas rendering
const container = document.getElementById('canvas-container');

// 1. Initialize Scene/Graphics Environment (Infrastructure)
const sceneManager = new SceneManager(container);

// 2. Initialize Physics Engine (Domain)
const physicsEngine = new PhysicsEngine();

// 3. Initialize Use Cases (Domain Rules)
const stepSimulationUseCase = new StepSimulation(physicsEngine);

// 4. Initialize Table and add Mesh to Scene
const tableGraphics = new TableGraphics();
sceneManager.addToScene(tableGraphics.getMesh());

// 5. Initialize Ball Graphics manager
const ballGraphics = new BallGraphics(sceneManager.getScene());

// Define physical attributes and initial states of pool balls
const ballRadius = 0.6;
const ballMass = 0.17; // standard billiard ball mass in kg
const feltTopY = 14.1;  // approximate height of the felt surface top

const ballData = [
  { id: 'cue_ball', color: '#ffffff', number: '', pos: { x: -8, z: 0 }, rot: { x: 0, y: 0, z: 0 }, isStriped: false },
  { id: 'ball_1', color: '#ffcc00', number: '1', pos: { x: -2, z: 0 }, rot: { x: 0.1, y: 0.8, z: -0.1 }, isStriped: false },
  { id: 'ball_10', color: '#0057ff', number: '10', pos: { x: 3, z: 0 }, rot: { x: 0.2, y: -1.2, z: 0.3 }, isStriped: true },
  { id: 'ball_3', color: '#ff2d00', number: '3', pos: { x: 0, z: -2.5 }, rot: { x: 0.3, y: 2.2, z: -0.2 }, isStriped: false },
  { id: 'ball_14', color: '#00a84d', number: '14', pos: { x: 0, z: 2.5 }, rot: { x: -0.2, y: 0.5, z: 0.1 }, isStriped: true },
];

// Instantiating balls in both domain (physics) and infrastructure (graphics)
ballData.forEach(data => {
  // Add purely physical entity to Physics Engine
  physicsEngine.addBall(data.id, ballMass, ballRadius, {
    x: data.pos.x,
    y: feltTopY + ballRadius,
    z: data.pos.z
  });

  // Create corresponding 3D sphere mesh
  ballGraphics.createBall(
    data.id,
    data.color,
    data.number,
    data.isStriped,
    { x: data.pos.x, y: feltTopY + ballRadius, z: data.pos.z },
    data.rot
  );
});

// 6. Create Cue Stick (Infrastructure) and position behind cue ball
const cueGraphics = new CueGraphics(sceneManager.getScene(), {
  x: -8,
  y: feltTopY + ballRadius,
  z: 0
});

// Clock for delta time calculations
const clock = new THREE.Clock();

// 7. Instantiate Adapters (Interface adapters)
const gameController = new GameController(sceneManager);
const gamePresenter = new GamePresenter(
  sceneManager,
  ballGraphics,
  stepSimulationUseCase,
  physicsEngine,
  clock
);

// 8. Start loop orchestration
gamePresenter.start();
