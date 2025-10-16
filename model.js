import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


camera.position.set(0, 0, 400);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(0, 100, 50);
scene.add(directionalLight2);

function fitCameraToObject(camera, object, offset = 0.9) {
  const box = new THREE.Box3().setFromObject(object);

  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y);
  const fitHeightDistance = maxSize / (2 * Math.tan((camera.fov * Math.PI / 180) / 2));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
  const direction = new THREE.Vector3(0, 0, -1);
  
  camera.position.copy(center).addScaledVector(direction, -distance);
  camera.lookAt(center);
}


const loader = new GLTFLoader();
let plus_button = undefined;
let bmo_body = undefined;
let bmo_screen = undefined;

const canvas = document.getElementById('gameCanvas');
const gameTexture = new THREE.CanvasTexture(canvas);
gameTexture.needsUpdate = true;

loader.load(
  '3D_models/bmo.glb', // path to your model
  (gltf) => {
    const model = gltf.scene;
    model.children = model.children.filter(child => child.name !== "eyes");
    console.log(model.children);
    // showBoundingBox(model, 0x0000ff);
    bmo_body = model.children.find(child => child.name === "Body");
    // showBoundingBox(bmo_body, 0xff0000);
    plus_button = model.getObjectByName("plus_button");
    bmo_screen = model.getObjectByName("screen2");
    gameTexture.repeat.set(1, -1); // Flip the texture vertically
    gameTexture.offset.set(0, 1); 
    fitCameraToObject(camera, bmo_body);
    if (bmo_screen) {
      bmo_screen.material = new THREE.MeshBasicMaterial({ map: gameTexture});
    }
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
  fitCameraToObject(camera, bmo_body);
});

const keysPressed = {};

window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});



function handleKeys() {
  const angle = 0.08;
  if (!plus_button) return;
  if (keysPressed['arrowup'] || keysPressed['w'])
    plus_button.rotation.x = -angle;
  else if (keysPressed['arrowdown'] || keysPressed['s'])
    plus_button.rotation.x = angle;
  else
    plus_button.rotation.x = 0;

  if (keysPressed['arrowleft'] || keysPressed['a'])
    plus_button.rotation.y = -angle;
  else if (keysPressed['arrowright'] || keysPressed['d'])
    plus_button.rotation.y = angle;
  else
    plus_button.rotation.y = 0;
}

let touches = {}

window.addEventListener('touchstart', (e) => {
  touches = e.touches;
})

window.addEventListener('touchend', (e) => { touches = e.touches; });

function handleTouch()
{
}

function showBoundingBox(object, color = 0x00ff00) {
  // Remove previous bounding box if it exists
  if (object.userData.bboxHelper) {
    object.remove(object.userData.bboxHelper);
  }

  // Create a new BoxHelper around the object
  const boxHelper = new THREE.BoxHelper(object, color);
  object.userData.bboxHelper = boxHelper; // store reference for easy cleanup

  // Add it to the same scene (or object’s parent)
  if (object.parent) {
    object.parent.add(boxHelper);
  } else {
    scene.add(boxHelper);
  }

  return boxHelper;
}


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  handleKeys();
  handleTouch();
  gameTexture.needsUpdate = true;
}

animate();