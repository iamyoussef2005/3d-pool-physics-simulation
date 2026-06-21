import * as THREE from '../vendor/three.module.js';

export class CueGraphics {
  constructor(scene, initialCueBallPos = { x: -8, y: 14.1 + 0.6, z: 0 }) {
    this.scene = scene;
    this.mesh = this.createCueStick(initialCueBallPos);
  }

  getMesh() {
    return this.mesh;
  }

  createCueStick(cueBallPos) {
    const stickLength = 30;
    // A cylinder tapering from 0.3 radius (back) to 0.12 radius (tip)
    const stickGeom = new THREE.CylinderGeometry(0.3, 0.12, stickLength, 16);
    stickGeom.rotateZ(Math.PI / 2); // point along X axis

    const woodTexture = this.createWoodTexture();
    const stickMat = new THREE.MeshStandardMaterial({ 
      map: woodTexture, 
      roughness: 0.4,
      color: 0xe09b5c // lighter wood color
    });
    
    const stickMesh = new THREE.Mesh(stickGeom, stickMat);
    
    stickMesh.position.set(cueBallPos.x - (stickLength / 2) - 0.2, cueBallPos.y + 2, cueBallPos.z); 
    stickMesh.rotation.z = -0.15; // tilted downwards at the ball
    
    stickMesh.castShadow = true;
    this.scene.add(stickMesh);
    return stickMesh;
  }

  createWoodTexture() {
    const size = 512;
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

    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const length = 70 + Math.random() * 150;
      const thickness = 1.0 + Math.random() * 2;
      ctx.strokeStyle = `rgba(76,44,34,${0.05 + Math.random() * 0.12})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (Math.random() - 0.5) * 15);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(90,50,38,0.12)';
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.7, 2.7);
    texture.anisotropy = 8;
    return texture;
  }
}
