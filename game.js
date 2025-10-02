import { animation, assetManager } from "./animation.js";
import { idleState, runningState, jumpingState, duckingState } from "./playerState.js";



const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;


let assetsManager = assetManager();
let loadAnimations = () => {
    let animations = {};
    animations['idle'] = animation('idle1', 64, 64, 12);
    animations['idle2'] = animation('idle2', 64, 64, 12);
    animations['idle3'] = animation('idle3', 64, 64, 12);
    animations['idle4'] = animation('idle4', 64, 64, 21);
    animations['walk'] = animation('walk', 64, 64, 17);
    animations['running'] = animation('run', 64, 64, 12);
    animations['jumping'] = animation('jump', 64, 64, 15);
    animations['ducking'] = animation('duck', 64, 64, 3, false);
    animations['hurt'] = animation('hurt', 64, 64, 4);
    animations['shield_out'] = animation('shield_out', 64, 64, 7);
    animations['shield_in'] = animation('shield_in', 64, 64, 7);
    animations['shield_walk'] = animation('shield_walk', 64, 64, 6);
    return animations;
};

function loadStates(player)
{
    const states = {};
    states['idle'] = idleState(player);
    states['running'] = runningState(player);
    states['jumping'] = jumpingState(player);
    states['ducking'] = duckingState(player);
    return states;
}

let player = {
    x: width / 2 - 32,
    y: height - 63 - 64,
    xVelocity: 0,
    yVelocity: 0,
    direction: 'right',
    hitbox_w: 64,
    hitbox_h: 64,
    speed: 10,
    state: 'idle',
    states: {},
}

const FPS = 24;
const FIXED_DT = 1 / FPS; // fixed timestep in seconds
let accumulator = 0;
let lastTime = performance.now();

async function startGame()
{
    assetsManager.addAsset('idle1', 'sprites/idle1_64_12.png');
    assetsManager.addAsset('idle2', 'sprites/idle2_64_12.png');
    assetsManager.addAsset('idle3', 'sprites/idle3_64_12.png');
    assetsManager.addAsset('idle4', 'sprites/idle4_64_21.png');
    assetsManager.addAsset('walk', 'sprites/walk_64_17.png');
    assetsManager.addAsset('run', 'sprites/run_64_12.png');
    assetsManager.addAsset('jump', 'sprites/jump_64_15.png');
    assetsManager.addAsset('duck', 'sprites/duck_64_3.png');
    assetsManager.addAsset('hurt', 'sprites/hurt_64_4.png');
    assetsManager.addAsset('shield_out', 'sprites/shield_out_64_7.png');
    assetsManager.addAsset('shield_in', 'sprites/shield_in_64_7.png');
    assetsManager.addAsset('shield_walk', 'sprites/shield_walk_64_6.png');
    await assetsManager.loadAssets();

    player.groundY = player.y;
    player.animations = loadAnimations();
    player.states = loadStates(player);
    requestAnimationFrame(gameLoop);    
}

function gameLoop(timestamp)
{
    let delta = (timestamp - lastTime) / 1000; // convert ms → seconds
    lastTime = timestamp;
    accumulator += delta;

    // Run updates as many times as needed to catch up
    while (accumulator >= FIXED_DT) {
        update(FIXED_DT); // always update with fixed delta
        accumulator -= FIXED_DT;
    }
    draw(); // render once per frame
    requestAnimationFrame(gameLoop);
}

function update(deltaTime)
{
    updatePlayer(deltaTime);
}

function updatePlayer(deltaTime)
{
    player.states[player.state].update();
}

function draw()
{
    ctx.clearRect(0, 0, width, height);
    drawPlayer();
}

function drawPoint(x, y)
{
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawBackground()
{
    //draw ground
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'green';
    ctx.fillRect(0, height - 64, width, height - 64);
}

function drawPlayer()
{
    drawBackground();
    ctx.save();
    let frame = player.animations[player.state].getSpriteFrame();
    ctx.translate(player.x + frame.width / 2, player.y + frame.height / 2);
    if (player.direction == 'left')
        ctx.scale(-1, 1);
    ctx.drawImage(assetsManager.getAsset(frame.sprite_name), 
            frame.x, frame.y, frame.width, frame.height, 
            -frame.width / 2 + frame.offsetX, -frame.height / 2 + frame.offsetY, frame.width, frame.height);
    ctx.restore();
}

startGame();

window.addEventListener('keydown', function(e) {
    console.log(`pressed ${e.code}`);
    player.states[player.state].onKeyDown(e.code);
});

window.addEventListener('keyup', function(e) {
    console.log(`released ${e.code}`);
    player.states[player.state].onKeyUp(e.code);
});