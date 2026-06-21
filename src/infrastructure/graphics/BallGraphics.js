import * as THREE from '../vendor/three.module.js';

export class BallGraphics {
  constructor(scene) {
    this.scene = scene;
    this.ballRadius = 0.6;
    this.ballGeom = new THREE.SphereGeometry(this.ballRadius, 32, 32);
    this.graphicBalls = {};
  }

  createBall(id, color, number, isStriped, initialPos, initialRot) {
    const texture = this.createNumberedBallTexture(color, number, isStriped);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.12,  // shiny/glossy billiard ball finish
      metalness: 0.05,
    });
    const ballMesh = new THREE.Mesh(this.ballGeom, mat);
    
    // Initial sync
    ballMesh.position.set(initialPos.x, initialPos.y, initialPos.z);
    ballMesh.rotation.set(initialRot.x, initialRot.y, initialRot.z);
    
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    this.scene.add(ballMesh);

    this.graphicBalls[id] = ballMesh;
    return ballMesh;
  }

  syncBall(id, position, angularVelocity, dt) {
    const mesh = this.graphicBalls[id];
    if (!mesh) return;

    mesh.position.set(position.x, position.y, position.z);

    // Integrate rotation using angular velocity
    const wLength = Math.sqrt(
      angularVelocity.x * angularVelocity.x +
      angularVelocity.y * angularVelocity.y +
      angularVelocity.z * angularVelocity.z
    );

    if (wLength > 0.001) {
      // Create an axis vector
      const axis = new THREE.Vector3(angularVelocity.x, angularVelocity.y, angularVelocity.z);
      axis.normalize();
      
      // Calculate angle turned in this frame
      const angle = wLength * dt;
      
      // Apply rotation relatively using quaternion
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      mesh.quaternion.premultiply(quaternion);
    }
  }

  createNumberedBallTexture(ballColorHex, numberStr, isStriped = false) {
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
}
