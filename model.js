import * as THREE from 'https://unpkg.com/three@0.168.0/build/three.module.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module';
import { DRACOLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/DRACOLoader.js?module';


const model_path = "3D_models/bmo_fixed_textures.glb";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xff5599, 5);
directionalLight1.position.set(-50, -20, 10);
scene.add(directionalLight1);
const directionalLight2 = new THREE.DirectionalLight(0x5599ff, 5);
directionalLight2.position.set(50, 20, 10);
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 5);
directionalLight3.position.set(0, 100, 100);
scene.add(directionalLight3);

// ---------------------------------------------------------------
// respnonsive model fitting
function fitCameraToObject(camera, object, offsetH = 1.2, offsetW = 1.1) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const aspect = window.innerWidth / window.innerHeight;
  let distance;

  if (aspect > 0.75)
    distance = (size.y / 2) / Math.tan(fov / 2) * offsetH;
  else
    distance = size.x / (2 * Math.tan(fov / 2) * aspect) * offsetW;

  // Position camera
  const dir = new THREE.Vector3(0, 0, 1);
  camera.position.copy(center.clone().addScaledVector(dir, distance));
  camera.lookAt(center);
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
}

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  fitCameraToObject(camera, bmo_body);
});
//---------------------------------------------------------------  

// load model
let model = null;
let plus_button = undefined;
let bmo_body = undefined;
let bmo_screen = undefined;
const canvas = document.getElementById('gameCanvas');
const gameTexture = new THREE.CanvasTexture(canvas);
gameTexture.needsUpdate = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Google-hosted Draco
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
  model_path,
  (gltf) => {
    model = gltf.scene;
    model.children = model.children.filter(child => child.name !== "eyes");
    console.log(model.children);
    model.scale.set(1000, 1000, 1000);
    model.updateWorldMatrix(true, true);
    bmo_body = model.getObjectByName("Body");
    plus_button = model.getObjectByName("plus_button");
    bmo_screen = model.getObjectByName("screen");
    gameTexture.repeat.set(-1, 1);
    gameTexture.offset.set(0, 0);
    gameTexture.center = new THREE.Vector2(0.5, 0.5);
    gameTexture.rotation = -Math.PI / 2;
    if (bmo_screen) 
      bmo_screen.material = new THREE.MeshBasicMaterial({ map: gameTexture});
    fitCameraToObject(camera, bmo_body);
    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

//---------------------------------------------------------------
// handle keyboard input and touch events
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

// Raycasting for touch and mouse interaction

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('touchstart', onPointerDown);

function onPointerDown(event)
{
  event.preventDefault();
  let x, y;
  if (event.touches && event.touches.length > 0) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = - (y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0)
    controls(intersects[0]);
}

function controlPressFeedBack(intersection)
{
  const point = intersection.point;
  const button = intersection.object;
  const xAxis = new THREE.Vector3(button.position.x - point.x, button.position.y - point.y, 0).normalize();
  const yAxis = new THREE.Vector3().crossVectors(xAxis, new THREE.Vector3(0, 1, 0)).normalize();

  const yline = drawLineFromVector(yAxis, 2, 0xff0000);
  scene.add(yline);
  const xline = drawLineFromVector(xAxis, 2, 0x0000ff);
  scene.add(xline);

  // button.rotateOnAxis(yAxis, 0.1);
}

function controls(intersect) {
  console.log(intersect)
  if (intersect.object.name === "plus_button") {
    controlPressFeedBack(intersect);
  }
}

// ---------------------------------------------------------------

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  handleKeys();
  gameTexture.needsUpdate = true;
}

animate();