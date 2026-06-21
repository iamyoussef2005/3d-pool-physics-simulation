/**
 * ============================================================================
 * LAYER: Infrastructure Layer (Graphics Details)
 * FILE: SceneManager.js
 * PURPOSE: Manages the WebGL setup, perspective camera, ambient & spotlights, 
 *          room mesh rendering bounds, window resizing, and OrbitControls.
 * ============================================================================
 */
import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

export class SceneManager {
     constructor(container) {
       this.container = container;
       this.scene = new THREE.Scene();
       this.scene.background = new THREE.Color(0x050507);
       this.scene.fog = new THREE.Fog(0x050507, 40, 90);

       this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
       this.camera.position.set(0, 26, 42);
       this.camera.lookAt(0, 1.5, 0);

       this.renderer = new THREE.WebGLRenderer({ antialias: true });
       this.renderer.setSize(window.innerWidth, window.innerHeight);
       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
       this.renderer.shadowMap.enabled = true;
       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
       this.container.appendChild(this.renderer.domElement);

       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
       this.controls.enableDamping = true;
       this.controls.dampingFactor = 0.07;
       this.controls.minDistance = 18;
       this.controls.maxDistance = 70;
       this.controls.maxPolarAngle = Math.PI * 0.49;

       this.setupLights();
       this.setupRoom();
       this.setupResizeListener();
     }

     setupLights() {
       this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
       this.scene.add(this.ambientLight);

       this.spotlight = new THREE.SpotLight(0xffffff, 2.8, 150, Math.PI / 4, 0.55, 1);
       this.spotlight.position.set(0, 45, 8);
       this.spotlight.castShadow = true;
       this.spotlight.shadow.mapSize.set(2048, 2048);
       this.spotlight.shadow.camera.near = 1;
       this.spotlight.shadow.camera.far = 150;
       this.spotlight.shadow.camera.bias = -0.0005;
       this.scene.add(this.spotlight);

       this.spotTarget = new THREE.Object3D();
       this.spotTarget.position.set(0, 0, 0);
       this.scene.add(this.spotTarget);
       this.spotlight.target = this.spotTarget;
     }

     setupRoom() {
       const roomFloor = new THREE.Mesh(
         new THREE.PlaneGeometry(120, 120),
         new THREE.MeshStandardMaterial({ color: 0x0d1214, roughness: 0.95, metalness: 0.05 })
       );
       roomFloor.rotation.x = -Math.PI / 2;
       roomFloor.receiveShadow = true;
       this.scene.add(roomFloor);

       const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x090b11, roughness: 0.95, metalness: 0.02 });
       const wallBack = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
       wallBack.position.set(0, 20, -60);
       this.scene.add(wallBack);

       const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
       wallLeft.position.set(-60, 20, 0);
       wallLeft.rotation.y = Math.PI / 2;
       this.scene.add(wallLeft);

       const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), wallMaterial);
       wallRight.position.set(60, 20, 0);
       wallRight.rotation.y = -Math.PI / 2;
       this.scene.add(wallRight);
     }

     setupResizeListener() {
       window.addEventListener('resize', () => this.onWindowResize());
     }

     onWindowResize() {
       this.camera.aspect = window.innerWidth / window.innerHeight;
       this.camera.updateProjectionMatrix();
       this.renderer.setSize(window.innerWidth, window.innerHeight);
     }

     updateControls() {
       this.controls.update();
     }

     render() {
       this.renderer.render(this.scene, this.camera);
     }

     addToScene(object) {
       this.scene.add(object);
     }

     getScene() {
       return this.scene;
     }

     getCamera() {
       return this.camera;
     }
   }
