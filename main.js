import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { PhysicsEngine, Vector3D } from './physics.js';
import { RoundedBoxGeometry } from './RoundedBoxGeometry.js';

// Physics globals
const physicsEngine = new PhysicsEngine();
const graphicBalls = {};

// Clock for delta time calculation
const clock = new THREE.Clock();

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050507);
scene.fog = new THREE.Fog(0x050507, 40, 90);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 26, 42);
camera.lookAt(0, 1.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 18;
controls.maxDistance = 70;
controls.maxPolarAngle = Math.PI * 0.49;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 2.8, 150, Math.PI / 4, 0.55, 1);
spotlight.position.set(0, 45, 8);
spotlight.castShadow = true;
spotlight.shadow.mapSize.set(2048, 2048);
spotlight.shadow.camera.near = 1;
spotlight.shadow.camera.far = 150;
spotlight.shadow.camera.bias = -0.0005;
scene.add(spotlight);

const spotTarget = new THREE.Object3D();
spotTarget.position.set(0, 0, 0);
scene.add(spotTarget);
spotlight.target = spotTarget;

const roomFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x0d1214, roughness: 0.95, metalness: 0.05 })
);
roomFloor.rotation.x = -Math.PI / 2;
roomFloor.receiveShadow = true;
scene.add(roomFloor);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x090b11, roughness: 0.95, metalness: 0.02 });
const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
wallBack.position.set(0, 20, -60);
scene.add(wallBack);
const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
wallLeft.position.set(-60, 20, 0);
wallLeft.rotation.y = Math.PI / 2;
scene.add(wallLeft);
const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
wallRight.position.set(60, 20, 0);
wallRight.rotation.y = -Math.PI / 2;
scene.add(wallRight);

const table = createPoolTable();
scene.add(table);
createPoolBalls();

function createPoolTable() {
  const group = new THREE.Group();
  const tableLength = 36;
  const tableWidth = 18;
  const tableThickness = 1.8;
  const tableHeight = 13.5;
  const overallLength = tableLength + 6.0; // matching railWidth = 3.0 on each side
  const overallWidth = tableWidth + 6.0;

  const woodTexture = createWoodTexture();
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0x5c3524,
    roughness: 0.6,
    metalness: 0.05,
  });

  // --- Pocket hole positions ---
  const pocketCenters = [
    { x: 18.0, z: 9.0 },   // Bottom-right
    { x: 18.0, z: -9.0 },  // Top-right
    { x: -18.0, z: 9.0 },  // Bottom-left
    { x: -18.0, z: -9.0 }, // Top-left
    { x: 0, z: 9.2 },      // Bottom-middle
    { x: 0, z: -9.2 },     // Top-middle
  ];
  const holeR = 1.35;

  // Helper: create the playing surface shape with pocket cutouts built directly into its perimeter
  function createFeltShape(tableLength, tableWidth, holeR) {
    const shape = new THREE.Shape();
    const halfL = tableLength / 2;
    const halfW = tableWidth / 2;
    
    // Calculate top/bottom middle pocket intersection offset
    const dx = Math.sqrt(holeR * holeR - 0.2 * 0.2);
    
    // Semicircle arc angles for side pockets (curving into table)
    const topMiddleStartAngle = Math.atan2(0.2, -dx);
    const topMiddleEndAngle = Math.atan2(0.2, dx);
    
    const bottomMiddleStartAngle = Math.atan2(-0.2, dx);
    const bottomMiddleEndAngle = Math.atan2(-0.2, -dx);

    // Start at top-left corner pocket end
    shape.moveTo(-halfL + holeR, -halfW);
    
    // Line to top-middle pocket start
    shape.lineTo(-dx, -halfW);
    
    // Top-middle pocket arc (centered at (0, -9.2), radius 1.35)
    shape.absarc(0, -halfW - 0.2, holeR, topMiddleStartAngle, topMiddleEndAngle, true);
    
    // Line to top-right corner pocket start
    shape.lineTo(halfL - holeR, -halfW);
    
    // Top-right corner pocket arc (centered at (18, -9), radius 1.35)
    shape.absarc(halfL, -halfW, holeR, Math.PI, Math.PI / 2, true);
    
    // Line to bottom-right corner pocket start
    shape.lineTo(halfL, halfW - holeR);
    
    // Bottom-right corner pocket arc (centered at (18, 9), radius 1.35)
    shape.absarc(halfL, halfW, holeR, -Math.PI / 2, -Math.PI, true);
    
    // Line to bottom-middle pocket start
    shape.lineTo(dx, halfW);
    
    // Bottom-middle pocket arc (centered at (0, 9.2), radius 1.35)
    shape.absarc(0, halfW + 0.2, holeR, bottomMiddleStartAngle, bottomMiddleEndAngle, true);
    
    // Line to bottom-left corner pocket start
    shape.lineTo(-halfL + holeR, halfW);
    
    // Bottom-left corner pocket arc (centered at (-18, 9), radius 1.35)
    shape.absarc(-halfL, halfW, holeR, 0, -Math.PI / 2, true);
    
    // Line to top-left corner pocket start
    shape.lineTo(-halfL, -halfW + holeR);
    
    // Top-left corner pocket arc (centered at (-18, -9), radius 1.35)
    shape.absarc(-halfL, -halfW, holeR, Math.PI / 2, 0, true);

    return shape;
  }

  // Helper: create a rounded rectangle shape
  function createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const halfW = width / 2;
    const halfH = height / 2;
    shape.moveTo(-halfW + radius, -halfH);
    shape.lineTo(halfW - radius, -halfH);
    shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
    shape.lineTo(halfW, halfH - radius);
    shape.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
    shape.lineTo(-halfW + radius, halfH);
    shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
    shape.lineTo(-halfW, -halfH + radius);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);
    return shape;
  }

  // --- Wood body underneath (with 6 pocket holes punched out) ---
  const bodyHeight = 2.0;
  const bodyShape = createRoundedRectShape(overallLength, overallWidth, 0.8);
  pocketCenters.forEach(({ x, z }) => {
    const hole = new THREE.Path();
    // Slightly larger hole in the wood body so the pocket liner tube has clearance
    hole.absarc(x, z, holeR + 0.05, 0, Math.PI * 2, false);
    bodyShape.holes.push(hole);
  });

  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, {
    depth: bodyHeight,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
    curveSegments: 32
  });
  bodyGeom.rotateX(-Math.PI / 2);
  bodyGeom.computeVertexNormals();

  const mainBody = new THREE.Mesh(bodyGeom, woodMaterial);
  // Position it so the top is flushed with the bottom of the felt surface (tableHeight + 0.1)
  mainBody.position.set(0, tableHeight - 1.9, 0); 
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  group.add(mainBody);

  // --- Single dark green playing surface with 6 pocket holes ---
  const surfaceThickness = 0.5;
  const surfaceShape = createFeltShape(tableLength, tableWidth, holeR);
  const surfaceGeom = new THREE.ExtrudeGeometry(surfaceShape, {
    depth: surfaceThickness, bevelEnabled: false, curveSegments: 64,
  });
  surfaceGeom.rotateX(-Math.PI / 2);
  surfaceGeom.computeVertexNormals();

  // Solid rich dark forest green felt material (removes any texture tiling/grid issues)
  const feltMaterial = new THREE.MeshStandardMaterial({
    color: 0x073516, // deep rich dark green
    roughness: 0.82,
    metalness: 0.02,
  });

  const surface = new THREE.Mesh(surfaceGeom, feltMaterial);
  surface.position.set(0, tableHeight + 0.1, 0); // Top of surface is at tableHeight + 0.6 = 14.1
  surface.castShadow = true;
  surface.receiveShadow = true;
  group.add(surface);

  // Add the rails (cushions and wooden rail segments)
  addRailsAndCushions(group, tableHeight, woodMaterial, feltMaterial);

  // Add pocket interiors (liners)
  addPockets(group, tableHeight, pocketCenters, holeR);

  // Add table legs and cross braces
  addLegs(group, overallLength, overallWidth, tableHeight);
  addCrossBraces(group, overallLength, overallWidth, tableHeight - 5);

  return group;
}

function addRailsAndCushions(group, tableHeight, woodMaterial, feltMaterial) {
  const tableLength = 36;
  const tableWidth = 18;
  const overallLength = tableLength + 6.0;
  const overallWidth = tableWidth + 6.0;
  const holeR = 1.35;

  // Wood rails height & centering
  const railHeight = 1.6;
  const railY = tableHeight + 0.25; // starts at 13.75, top is at 15.35

  // Helper: create a rounded rectangle shape
  function createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const halfW = width / 2;
    const halfH = height / 2;
    shape.moveTo(-halfW + radius, -halfH);
    shape.lineTo(halfW - radius, -halfH);
    shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
    shape.lineTo(halfW, halfH - radius);
    shape.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
    shape.lineTo(-halfW + radius, halfH);
    shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
    shape.lineTo(-halfW, -halfH + radius);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);
    return shape;
  }

  // Helper: create the inner border path for the wood rails, curving around the pockets
  function createRailHolePath(tLength, tWidth, rad) {
    const path = new THREE.Path();
    const halfL = tLength / 2; // 18.0
    const halfW = tWidth / 2; // 9.0
    const cushionOffset = 0.4; 
    const edgeX = halfL + cushionOffset; // 18.4
    const edgeY = halfW + cushionOffset; // 9.4

    // Offsets
    const dCorner = Math.sqrt(rad * rad - cushionOffset * cushionOffset);
    const dxSide = Math.sqrt(rad * rad - 0.2 * 0.2); // Side pocket center is at 9.2, edge is 9.4 -> diff = 0.2

    // 1. Top-Left Corner
    path.moveTo(-edgeX, -halfW + dCorner);
    path.absarc(-halfL, -halfW, rad, Math.atan2(dCorner, -cushionOffset), Math.atan2(-cushionOffset, dCorner), false);

    // 2. Top-Middle Pocket
    path.lineTo(-dxSide, -edgeY);
    path.absarc(0, -9.2, rad, Math.atan2(-0.2, -dxSide), Math.atan2(-0.2, dxSide), false);

    // 3. Top-Right Corner
    path.lineTo(halfL - dCorner, -edgeY);
    path.absarc(halfL, -halfW, rad, Math.atan2(-cushionOffset, -dCorner), Math.atan2(dCorner, cushionOffset), false);

    // 4. Bottom-Right Corner
    path.lineTo(edgeX, halfW - dCorner);
    path.absarc(halfL, halfW, rad, Math.atan2(-dCorner, cushionOffset), Math.atan2(cushionOffset, -dCorner), false);

    // 5. Bottom-Middle Pocket
    path.lineTo(dxSide, edgeY);
    path.absarc(0, 9.2, rad, Math.atan2(0.2, dxSide), Math.atan2(0.2, -dxSide), false);

    // 6. Bottom-Left Corner
    path.lineTo(-halfL + dCorner, edgeY);
    path.absarc(-halfL, halfW, rad, Math.atan2(cushionOffset, dCorner), Math.atan2(-dCorner, -cushionOffset), false);

    path.lineTo(-edgeX, -halfW + dCorner);

    return path;
  }

  // 1. WOOD RAILS (Extruded shape with wood material)
  const railShape = createRoundedRectShape(overallLength, overallWidth, 0.8);
  // We curve the wood rails around the pocket at radius holeR + 0.05 = 1.4
  const railHole = createRailHolePath(tableLength, tableWidth, holeR + 0.05);
  railShape.holes.push(railHole);

  const railGeom = new THREE.ExtrudeGeometry(railShape, {
    depth: railHeight,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 32
  });
  railGeom.rotateX(-Math.PI / 2);
  railGeom.computeVertexNormals();

  const woodRailMesh = new THREE.Mesh(railGeom, woodMaterial);
  woodRailMesh.position.set(0, railY, 0);
  woodRailMesh.castShadow = true;
  woodRailMesh.receiveShadow = true;
  group.add(woodRailMesh);

  // 2. CUSHIONS (Extruded shapes with green felt material)
  const cushionHeight = 0.9;
  const cushionY = tableHeight + 0.6; // starts at 14.1 (felt top) and goes up to 15.0

  // Helper to create cushion mesh from vertices
  function createCushion(vertices) {
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0].x, vertices[0].z);
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x, vertices[i].z);
    }
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: cushionHeight,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
      bevelSegments: 3,
      curveSegments: 16
    });
    geom.rotateX(-Math.PI / 2);
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, feltMaterial);
    mesh.position.set(0, cushionY, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Left Short Cushion
  const leftCushion = createCushion([
    { x: -18.0, z: -7.65 },
    { x: -18.4, z: -7.66 },
    { x: -18.4, z: 7.66 },
    { x: -18.0, z: 7.65 }
  ]);

  // Right Short Cushion
  const rightCushion = createCushion([
    { x: 18.0, z: 7.65 },
    { x: 18.4, z: 7.66 },
    { x: 18.4, z: -7.66 },
    { x: 18.0, z: -7.65 }
  ]);

  // Bottom-Left Long Cushion
  const blCushion = createCushion([
    { x: -16.65, z: 9.0 },
    { x: -1.34, z: 9.0 },
    { x: -1.39, z: 9.4 },
    { x: -16.66, z: 9.4 }
  ]);

  // Bottom-Right Long Cushion
  const brCushion = createCushion([
    { x: 1.34, z: 9.0 },
    { x: 16.65, z: 9.0 },
    { x: 16.66, z: 9.4 },
    { x: 1.39, z: 9.4 }
  ]);

  // Top-Left Long Cushion
  const tlCushion = createCushion([
    { x: -16.65, z: -9.0 },
    { x: -16.66, z: -9.4 },
    { x: -1.39, z: -9.4 },
    { x: -1.34, z: -9.0 }
  ]);

  // Top-Right Long Cushion
  const trCushion = createCushion([
    { x: 1.34, z: -9.0 },
    { x: 1.39, z: -9.4 },
    { x: 16.66, z: -9.4 },
    { x: 16.65, z: -9.0 }
  ]);

  group.add(leftCushion, rightCushion, blCushion, brCushion, tlCushion, trCushion);
}

function addPockets(group, tableHeight, pocketCenters, holeR) {
  const pocketDepth = 3.5;
  const topY = tableHeight + 0.6; // 14.1 (felt top)

  // Pocket interior material: matte black
  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x020202,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  pocketCenters.forEach(({ x, z }) => {
    // Black Pocket Liner (starts at felt top and goes down, open at the bottom)
    const wallGeom = new THREE.CylinderGeometry(holeR, holeR * 0.85, pocketDepth, 32, 1, true);
    const wall = new THREE.Mesh(wallGeom, linerMat);
    wall.position.set(x, topY - pocketDepth / 2, z);
    wall.receiveShadow = true;
    group.add(wall);
  });
}

function addLegs(group, totalLength, totalWidth, tableHeight) {
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x412519, roughness: 0.85, metalness: 0.08 });
  const legGeo = new THREE.CylinderGeometry(1.3, 1.3, 12.5, 28);
  const legTopGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.5, 24);
  const levelerGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 16);

  // Position legs slightly inward to avoid intersecting the pocket holes
  const legPositions = [
    [totalLength / 2 - 5.5, 6.25, totalWidth / 2 - 4.0],
    [-(totalLength / 2 - 5.5), 6.25, totalWidth / 2 - 4.0],
    [totalLength / 2 - 5.5, 6.25, -(totalWidth / 2 - 4.0)],
    [-(totalLength / 2 - 5.5), 6.25, -(totalWidth / 2 - 4.0)],
  ];

  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    leg.receiveShadow = true;

    const top = new THREE.Mesh(legTopGeo, legMaterial);
    top.position.set(x, y + 7, z);
    top.castShadow = true;
    top.receiveShadow = true;

    const leveler = new THREE.Mesh(levelerGeo, new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.95 }));
    leveler.position.set(x, 0.4, z);
    group.add(leg, top, leveler);
  });
}

function addCrossBraces(group, totalLength, totalWidth, yPosition) {
  const braceMaterial = new THREE.MeshStandardMaterial({ color: 0x2b1b14, roughness: 0.9, metalness: 0.02 });
  // Long brace spans between the two short braces (total distance between leg centers is totalLength - 11)
  const longBraceLength = totalLength - 11.0;
  const longBrace = new THREE.Mesh(new THREE.BoxGeometry(longBraceLength, 0.8, 0.8), braceMaterial);
  longBrace.position.set(0, yPosition, 0);
  longBrace.castShadow = true;
  group.add(longBrace);

  // Short braces span along Z-axis connecting front/back legs
  const shortBraceLength = totalWidth - 8.0;
  const leftShort = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, shortBraceLength), braceMaterial);
  const rightShort = leftShort.clone();
  leftShort.position.set(-totalLength / 2 + 5.5, yPosition, 0);
  rightShort.position.set(totalLength / 2 - 5.5, yPosition, 0);
  leftShort.castShadow = true;
  rightShort.castShadow = true;
  group.add(leftShort, rightShort);
}

function createWoodTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#4f2e1f');
  base.addColorStop(0.5, '#632f19');
  base.addColorStop(1, '#3f1d12');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 120; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 140 + Math.random() * 300;
    const thickness = 1.2 + Math.random() * 3;
    ctx.strokeStyle = `rgba(76,44,34,${0.05 + Math.random() * 0.12})`;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + (Math.random() - 0.5) * 25);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(90,50,38,0.12)';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.7, 2.7);
  texture.anisotropy = 16;
  return texture;
}

function createFeltTexture() {
  const canvasWidth = 2048;
  const canvasHeight = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // Create radial gradient for a rich dark spotlight illumination effect
  const grad = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, 100,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
  );
  grad.addColorStop(0, '#0a4b21'); // rich dark green in center spotlight
  grad.addColorStop(0.6, '#063517'); // deep dark forest green
  grad.addColorStop(1, '#031c0c');   // very dark shadow edges
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Add fine noise to simulate premium felt texture fibers
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const alpha = 0.015 + Math.random() * 0.04;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const alpha = 0.01 + Math.random() * 0.03;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Paint ambient occlusion shadows around the table borders
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 40;
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 25;
  ctx.strokeRect(-12, -12, canvasWidth + 24, canvasHeight + 24);

  // Reset shadow for pocket drawings
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Paint radial ambient occlusion shadows inside/around the 6 pockets
  const pocketRadiusPx = 76; // matches 1.35 units in canvas space (1.35/36 * 2048 = 76.8)
  const pockets = [
    { x: 0, y: 0 },
    { x: 0, y: canvasHeight },
    { x: canvasWidth, y: 0 },
    { x: canvasWidth, y: canvasHeight },
    { x: canvasWidth / 2, y: 10 },
    { x: canvasWidth / 2, y: canvasHeight - 10 }
  ];

  pockets.forEach(p => {
    const pocketGrad = ctx.createRadialGradient(
      p.x, p.y, pocketRadiusPx * 0.4,
      p.x, p.y, pocketRadiusPx * 1.6
    );
    pocketGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    pocketGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.8)');
    pocketGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pocketGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pocketRadiusPx * 1.6, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

function createFeltBumpMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = 0.05 + Math.random() * 0.1;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

// create four simple pool balls and place them on the felt surface
function createNumberedBallTexture(ballColorHex, numberStr, isStriped = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Draw base color
  ctx.fillStyle = isStriped ? '#f4f4f4' : ballColorHex; // off-white for striped balls
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // If striped, draw the colored stripe across the equator
  if (isStriped) {
    ctx.fillStyle = ballColorHex;
    // Stripe takes up middle half of the vertical height
    ctx.fillRect(0, canvas.height / 3.5, canvas.width, canvas.height * (1.5 / 3.5));
  }

  if (numberStr !== '') {
    // Draw white circle in the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = 45;

    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw the number inside the white circle
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#111111'; // charcoal black
    ctx.fillText(numberStr, centerX, centerY);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

// create four simple pool balls and place them on the felt surface
function createPoolBalls() {
  const ballRadius = 0.6;
  const ballMass = 0.17; // typical billiard ball mass in kg
  const ballGeom = new THREE.SphereGeometry(ballRadius, 32, 32);

  // standard colors: yellow (1), blue (2), red (3), green (6)
  const ballData = [
    { id: 'cue_ball', color: '#ffffff', number: '', pos: { x: -8, z: 0 }, rot: { x: 0, y: 0, z: 0 }, isStriped: false },
    { id: 'ball_1', color: '#ffcc00', number: '1', pos: { x: -2, z: 0 }, rot: { x: 0.1, y: 0.8, z: -0.1 }, isStriped: false },
    { id: 'ball_10', color: '#0057ff', number: '10', pos: { x: 3, z: 0 }, rot: { x: 0.2, y: -1.2, z: 0.3 }, isStriped: true },
    { id: 'ball_3', color: '#ff2d00', number: '3', pos: { x: 0, z: -2.5 }, rot: { x: 0.3, y: 2.2, z: -0.2 }, isStriped: false },
    { id: 'ball_14', color: '#00a84d', number: '14', pos: { x: 0, z: 2.5 }, rot: { x: -0.2, y: 0.5, z: 0.1 }, isStriped: true },
  ];

  // approximate felt top Y: tableHeight (13.5) + felt offset (0.6) = 14.1
  const feltTopY = 14.1;

  ballData.forEach(data => {
    // 1. Add purely physical ball to the physics engine
    physicsEngine.addBall(data.id, ballMass, ballRadius, {
      x: data.pos.x,
      y: feltTopY + ballRadius, // Exact vertical position
      z: data.pos.z
    });

    // 2. Create the Three.js graphical representation
    const texture = createNumberedBallTexture(data.color, data.number, data.isStriped);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.12,  // shiny/glossy billiard ball finish
      metalness: 0.05,
    });
    const ballMesh = new THREE.Mesh(ballGeom, mat);
    
    // Initial sync
    ballMesh.position.set(data.pos.x, feltTopY + ballRadius, data.pos.z);
    ballMesh.rotation.set(data.rot.x, data.rot.y, data.rot.z);
    
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    scene.add(ballMesh);

    // 3. Store the mesh in our dictionary for future syncing
    graphicBalls[data.id] = ballMesh;
  });
}

function createCueStick() {
  const stickLength = 30;
  // A cylinder tapering from 0.3 radius (back) to 0.12 radius (tip)
  const stickGeom = new THREE.CylinderGeometry(0.3, 0.12, stickLength, 16);
  stickGeom.rotateZ(Math.PI / 2); // point along X axis

  const woodTexture = createWoodTexture();
  const stickMat = new THREE.MeshStandardMaterial({ 
    map: woodTexture, 
    roughness: 0.4,
    color: 0xe09b5c // lighter wood color
  });
  
  const stickMesh = new THREE.Mesh(stickGeom, stickMat);

  // Position it behind the cue ball, aiming at it
  const feltTopY = 14.1;
  const ballRadius = 0.6;
  
  // Cue ball is at x: -8
  stickMesh.position.set(-8 - (stickLength / 2) - 0.2, feltTopY + ballRadius + 2, 0); 
  stickMesh.rotation.z = -0.15; // tilted downwards at the ball
  
  stickMesh.castShadow = true;
  scene.add(stickMesh);
  return stickMesh;
}

const cueStick = createCueStick();

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1); // limit max delta to avoid huge jumps

  // 1. Step the physics simulation
  physicsEngine.step(dt);

  // 2. Synchronize the graphical balls with their physical counterparts
  const physBalls = physicsEngine.getBalls();
  for (let physBall of physBalls) {
    const mesh = graphicBalls[physBall.id];
    if (mesh) {
      mesh.position.set(physBall.position.x, physBall.position.y, physBall.position.z);
      
      // Integrate rotation using angular velocity
      let angularVelLength = physBall.angularVelocity.length();
      if (angularVelLength > 0.001) {
        // Create an axis vector
        let axis = new THREE.Vector3(physBall.angularVelocity.x, physBall.angularVelocity.y, physBall.angularVelocity.z);
        axis.normalize();
        
        // Calculate angle turned in this frame
        let angle = angularVelLength * dt;
        
        // Apply rotation relatively using quaternion
        let quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        mesh.quaternion.premultiply(quaternion);
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
