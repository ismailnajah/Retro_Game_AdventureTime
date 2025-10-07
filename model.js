import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const light = new THREE.HemisphereLight(0xffffff, 0x444444);
// light.position.set(0, 20, 20);
// scene.add(light);


const screenHeight = 5;
camera.position.set(0, 0, 400);



const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -200;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(5, 20, 7.5);
// scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(0, 100, 50);
scene.add(directionalLight2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.update();

const loader = new GLTFLoader();
loader.load(
  '3D_models/bmo.glb', // path to your model
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1000, 1000, 1000);
    model.position.set(0, 0, 0);
    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



const moveSpeed = 0.05;
const keysPressed = {};

window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

function handleCameraMovement() {
  const direction = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  // Get the forward & right directions based on camera rotation
  camera.getWorldDirection(forward);
  forward.y = 0; // keep horizontal
  forward.normalize();

  right.crossVectors(camera.up, forward).normalize();

  if (keysPressed['arrowup'] || keysPressed['w']) {
    camera.position.addScaledVector(forward, moveSpeed);
  }
  if (keysPressed['arrowdown'] || keysPressed['s']) {
    camera.position.addScaledVector(forward, -moveSpeed);
  }
  if (keysPressed['arrowleft'] || keysPressed['a']) {
    camera.position.addScaledVector(right, moveSpeed);
  }
  if (keysPressed['arrowright'] || keysPressed['d']) {
    camera.position.addScaledVector(right, -moveSpeed);
  }
}


const canvas = document.getElementById('gameCanvas');
const texture = new THREE.CanvasTexture(canvas);
const factor = 0.275; 
const planeForCanvas = new THREE.PlaneGeometry(canvas.width * factor, canvas.height * factor);
const materialForCanvas = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
const canvasMesh = new THREE.Mesh(planeForCanvas, materialForCanvas);
canvasMesh.position.set(0, 71, 35);
scene.add(canvasMesh);


// Animation loop
function animate() {
  requestAnimationFrame(animate);
//   handleCameraMovement();
//   controls.update();
  renderer.render(scene, camera);
  texture.needsUpdate = true;
}
animate();