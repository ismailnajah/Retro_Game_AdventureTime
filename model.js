import * as THREE from 'https://unpkg.com/three@0.168.0/build/three.module.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module';
import { DRACOLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/DRACOLoader.js?module';
import * as Game from './bmoGame.js';


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
let red_button = undefined;
let blue_button = undefined;
let green_button = undefined;
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
    red_button = model.getObjectByName("Red_button");
    blue_button = model.getObjectByName("triangle_button");
    green_button = model.getObjectByName("small_button");
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

renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('touchstart', onPointerDown);


renderer.domElement.addEventListener('mouseup', onPointerUp);
renderer.domElement.addEventListener('touchend', onPointerUp);

const handlers = {
  plus_button: DPadPressed,
  Red_button: (intersect, pressed) => { keysPressed['space'] = pressed;},

  triangle_button: (intersect, pressed) => { keysPressed['g'] = pressed;},

  small_button: (intersect, pressed) => { 
    keysPressed['r'] = pressed;
    if (!gameStart && gameOver && pressed)
      restartGame();
  },
}

function handleKeys() {
  const angle = 0.1;
  const actions = {arrowup, arrowdown, arrowleft, arrowright, space, g};

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

  const z = plus_button.position.z;
  const zOffset = -0.005;

  red_button.position.z = keysPressed['space'] ?  z + zOffset : z;
  blue_button.position.z = keysPressed['g'] ? z + zOffset : z;
  green_button.position.z = keysPressed['r'] ? z + zOffset : z;


  for (const action in actions)
    onKeyEvent(action, keysPressed[action]);

  if (keysPressed['r'] && !gameStart && gameOver)
    restartGame();
  else if (keysPressed['r'] && !gameStarted)
    onStart();
}

function onKeyEvent(key, pressed) {
  if (pressed)
    player.states[player.state].onKeyDown(key);
  else
    player.states[player.state].onKeyUp(key);
}
// Raycasting for touch and mouse interaction

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function getIntersect(event) {
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
  mouse.y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0 && intersects[0].object.name in handlers)
    return intersects[0];
  return null;
}

function onPointerDown(event)
{
  const intersect = getIntersect(event);
  if (intersect)
    buttonPressed(intersect, true);
}

function onPointerUp(event)
{
  console.log("Pointer up");
  const intersect = getIntersect(event);
  if (intersect)
    buttonReleased(intersect, false);
  else
  {
    for (const key in keysPressed) {
      keysPressed[key] = false;
      console.log(`Key ${key} reset`);
    }
  }
}

function buttonPressed(intersect) {
  const objectName = intersect.object.name;
  if (handlers[objectName])
    handlers[objectName](intersect, true);
}

function buttonReleased(intersect) {
  const objectName = intersect.object.name;
  if (handlers[objectName])
    handlers[objectName](intersect, false);
}

function drawLineFromVector(direction, length, color) {
  const material = new THREE.LineBasicMaterial({ color: color });
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(direction.clone().multiplyScalar(length));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  console.log(line);
  return line;
}

function DPadPressed(intersection, down=true)
{
  const angle = 0.15;
  const localPoint = intersection.object.worldToLocal(intersection.point);
  const rotations = {
    left: () => { keysPressed['arrowleft'] = down; },
    right: () => { keysPressed['arrowright'] = down; },
    up: () => { keysPressed['arrowup'] = down; },
    down: () => { keysPressed['arrowdown'] = down; },
  }

  let region = "center";
  if (localPoint.x < -0.01)
    region = "left";
  else if (localPoint.x > 0.01)
    region = "right";
  if (localPoint.y < -0.01)
    region = "down";
  else if (localPoint.y > 0.01)
    region = "up";
  if (region !== "center")
    rotations[region]();
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