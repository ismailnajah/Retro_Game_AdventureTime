import { animation, assetManager } from "./animation.js";



const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;


let assetsManager = assetManager();
let animations = () => {
    animations['idle1'] = animation('idle1', 64, 64, 12);
    animations['idle2'] = animation('idle2', 64, 64, 12);
    animations['idle3'] = animation('idle3', 64, 64, 12);
    animations['idle4'] = animation('idle4', 64, 64, 21);
    animations['walk'] = animation('walk', 64, 64, 17);
    animations['run'] = animation('run', 64, 64, 12);
    animations['jump'] = animation('jump', 64, 64, 15);
    animations['duck'] = animation('duck', 64, 64, 6);
    animations['hurt'] = animation('hurt', 64, 64, 4);
    animations['shield_out'] = animation('shield_out', 64, 64, 7);
    animations['shield_in'] = animation('shield_in', 64, 64, 7);
    animations['shield_walk'] = animation('shield_walk', 64, 64, 6);
    return animations;
};

let player = {
    x: width / 2 - 32,
    y: height / 2 - 32,
    hitbox_w: 64,
    hitbox_h: 64,
    speed: 200,
    state: 'idle',
    moving: false,
    shield: false,
    direction: 'right',
    anim_id: 'duck',
    anim: animations(),
}

const FPS = 12;
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
    assetsManager.addAsset('duck', 'sprites/duck_64_6.png');
    assetsManager.addAsset('hurt', 'sprites/hurt_64_4.png');
    assetsManager.addAsset('shield_out', 'sprites/shield_out_64_7.png');
    assetsManager.addAsset('shield_in', 'sprites/shield_in_64_7.png');
    assetsManager.addAsset('shield_walk', 'sprites/shield_walk_64_6.png');
    await assetsManager.loadAssets();
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
    updateAnimationFrame();
}

function updateAnimationFrame()
{
    updateIdleAnimation();    
}

function updateIdleAnimation()
{
    let finished = player.anim[player.anim_id].update();
    // if (finished)
    // {
    //     if (player.anim_id === 'idle1')
    //         player.anim_id = Math.random() < 0.05 ? 'idle' + (Math.floor(Math.random() * 3) + 2) : 'idle1';
    //     else
    //         player.anim_id = 'idle1';
    // }

}

function draw()
{
    ctx.clearRect(0, 0, width, height);
    drawPlayer();
}

function drawPlayer()
{
    ctx.save();
    if (player.direction == 'right')
        ctx.setTransform(-1, 0, 0, 1, width, 0);
    let frame = player.anim[player.anim_id].getSpriteFrame();
    ctx.drawImage(assetsManager.getAsset(frame.sprite_name), frame.x, frame.y, frame.width, frame.height, player.x + frame.offsetX, player.y + frame.offsetY, frame.width, frame.height);
    ctx.restore();
}

startGame();