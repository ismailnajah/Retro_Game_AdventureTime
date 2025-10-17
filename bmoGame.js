import * as THREE from 'https://unpkg.com/three@0.168.0/build/three.module.js?module';
import { GLTFLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/GLTFLoader.js?module';
import { DRACOLoader } from 'https://unpkg.com/three@0.168.0/examples/jsm/loaders/DRACOLoader.js?module';
import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Marceline} from "./marceline.js";


let gameOver = false;
let gameStart = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const FPS = 24;
const FIXED_DT = 1 / FPS; // fixed timestep in seconds
let accumulator = 0;
let lastTime = performance.now();

let assets = assetsManager();

const player = new Player(width / 2, height - 60, width, height);
const boss = new Marceline(width * 0.8, height - 60, width, height);
boss.setIdleTimer();

let update = startScreenUpdate;
let draw = startScreenDraw;
let background;

async function startGame()
{
    await assets.load();
    background = new Background(width, height, assets);
    restartGame();
    requestAnimationFrame(gameLoop);
}

function onStart(e)
{
    gameStart = true;
    window.removeEventListener('keydown', onStart);
    player.setState('jakeRollIn');
    update = transitionUpdate;
    draw = transitionDraw;
}

function startScreenUpdate()
{
    player.update();
}

function startScreenMessage()
{
    ctx.fillStyle = '#181818';
    ctx.font = `${width * 0.1}px "Jersey 10", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', width / 2, height * 0.3);
}

function startScreenDraw()
{
    drawBackground(true);
    player.draw(ctx, assets);
    startScreenMessage();
}

let shouldStop = false;
function transitionUpdate()
{
    if (player.x > width)
    {
        player.x = -50;
        update = blackScreenUpdate;
        draw = blackScreenDraw;
        return;
    }
    if (shouldStop && player.x >= width * 0.2)
        player.setState('jakeRollOut');

    player.update();
    if (player.state === 'idle')
    {
        window.addEventListener('keydown', function(e) {
            player.states[player.state].onKeyDown(e.code);
        });
        window.addEventListener('keyup', function(e) {
            player.states[player.state].onKeyUp(e.code);
        });
        update = gameUpdate;
        draw = gameDraw;
    }
}

let alpha = 0;
let step = 0.05;
const blackScreenUpdate = () => {
    alpha += step;
    if (alpha >= 1)
    {
        background.showTutorial = false;
        step = -step;
    }
    if (step < 0)
        boss.update(0, player);
    if (alpha <= 0 && step < 0)
        shouldStop = true;
    if (!shouldStop) return ;

    if (player.x > width * 0.2)
        player.setState('jakeRollOut');

    player.update();
    if (player.state === 'idle')
    {
        window.addEventListener('keydown', function(e) {
            player.states[player.state].onKeyDown(e.code);
        });
        window.addEventListener('keyup', function(e) {
            player.states[player.state].onKeyUp(e.code);
        });
        update = gameUpdate;
        draw = gameDraw;
    }
}

function transitionDraw()
{
    drawBackground();
    if (Math.floor(Date.now() / 80) % 2 == 0)
        startScreenMessage();
    player.draw(ctx, assets);
}

const blackScreenDraw = () => {
    drawBackground();
    player.draw(ctx, assets);
    if (step < 0)
        boss.draw(ctx, assets);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
}

function restartGame()
{
    if (gameStart) return;
    alpha = 0;
    step = 0.05;
    player.x = width / 2;
    player.y = height - 60;
    player.reset();
    player.setState('walking');

    boss.x = width * 0.8;
    boss.y = height - 60;
    boss.reset();
    boss.setIdleTimer();

    background.reset();
    gameStart = false;
    shouldStop = false;
    update = startScreenUpdate;
    draw = startScreenDraw;
    
    window.addEventListener('keydown', onStart);
}

function gameLoop(timestamp)
{
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    accumulator += delta;

    if (!player.isDead)
    { 
        while (accumulator >= FIXED_DT) {
            update(FIXED_DT);
            accumulator -= FIXED_DT;
        }
    }
    draw();
    if (player.isDead)
        endGame();
    requestAnimationFrame(gameLoop);
}

function endGame()
{
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `${width * 0.2}px "Jersey 10", sans-serif`;
    ctx.fillText('Game Over', width / 2, height / 2);
    gameStart = false;
    gameOver = true;
}

function victoryMessage()
{
    ctx.fillStyle = '#181818';
    ctx.textAlign = 'center';
    ctx.font = `${width * 0.2}px "Jersey 10", sans-serif`;
    ctx.fillText('You Win!', width / 2, height / 2);
    ctx.font = `${width * 0.07}px "Jersey 10", sans-serif`;
    ctx.fillText('Marceline is calm again.', width / 2, height / 2 + 30);
    gameStart = false;
    gameOver = true;
}

function gameUpdate(deltaTime)
{
    if (boss.isCalm)
        player.setState('victory');
    player.update(deltaTime);
    boss.update(deltaTime, player);
}

function gameDraw()
{
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawHpBar();
    boss.drawHpBar(ctx);
    if (boss.isAttacking)
    {
        player.draw(ctx, assets);
        boss.draw(ctx, assets);
    }
    else
    {
        boss.draw(ctx, assets);
        player.draw(ctx, assets);
    }
    if (boss.isCalm)
        victoryMessage();
}

function drawBackground(moveBackground = false)
{
    ctx.clearRect(0, 0, width, height);
    if (moveBackground)
        background.update();
    background.draw(ctx, assets);
}

let flickerTimer = 0;
function drawHpBar()
{
    if (player.state === 'hurt')
        flickerTimer = 1;
    const bar = assets.get('hp_bar');
    const w = bar.width;
    ctx.save();
    ctx.scale(0.5, 0.5);
    const h = bar.height / 9;
    let hp = 8 - player.hp;

    if (flickerTimer > 0)
    {
        if (Math.floor(flickerTimer * 10) % 2 == 0)
            hp--;
        flickerTimer -= 0.05;
    }
    const y = hp * h;
    ctx.drawImage(bar, 0, y, w, h, 10, 10, w, h);
    ctx.restore()
}

startGame();


// 3D Model Interaction Code Below


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
// const canvas = document.getElementById('gameCanvas');
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
    plus_button: DPad,
    Red_button: (intersect, pressed) => { onKeyEvent('space', pressed);},
    triangle_button: (intersect, pressed) => { onKeyEvent('g', pressed);},
    small_button: (intersect, pressed) => { onKeyEvent('r', pressed); },
}

function handleKeys() {
  const angle = 0.1;

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

  if (keysPressed['r'] && !gameStart && gameOver)
    restartGame();
  else if (keysPressed['r'] && !gameStart)
    onStart();
}

function onKeyEvent(key, pressed) {
    keysPressed[key.toLowerCase()] = pressed;
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

  // this is not a full proof against draging outside the button
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
  const intersect = getIntersect(event);
  if (intersect)
    buttonReleased(intersect, false);
  else
  {
    for (const key in keysPressed)
        onKeyEvent(key, false);
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

function DPad(intersection, pressed=true)
{
  const angle = 0.15;
  const localPoint = intersection.object.worldToLocal(intersection.point);
  const rotations = {
    left: () => { onKeyEvent('arrowleft', pressed); },
    right: () => { onKeyEvent('arrowright', pressed); },
    up: () => { onKeyEvent('arrowup', pressed);},
    down: () => { onKeyEvent('arrowdown', pressed); },
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
  {
    rotations[region]();
    return ;
  }

  onKeyEvent('arrowleft', false);
  onKeyEvent('arrowright', false);
  onKeyEvent('arrowup', false);
  onKeyEvent('arrowdown', false);
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