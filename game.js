import { animation, assetManager } from "./animation.js";
import * as playerState from "./playerState.js";



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
    animations['jumping'] = animation('jump', 64, 64, 5, false);
    animations['falling'] = animation('fall', 64, 64, 5, false);
    animations['landing'] = animation('land', 64, 64, 5, false);
    animations['ducking'] = animation('duck', 64, 64, 3, false);
    animations['hurt'] = animation('hurt', 64, 64, 4);
    animations['hardHit'] = animation('hard_hit', 64, 64, 13);
    animations['shieldOut'] = animation('shield_out', 64, 64, 7, false);
    animations['shieldIn'] = animation('shield_in', 64, 64, 7, false);
    animations['shieldWalk'] = animation('shield_walk', 64, 64, 6);
    animations['die'] = animation('die', 64, 64, 18, false, 0, 4);
    return animations;
};

function loadStates(player)
{
    const states = {};
    states['idle']    = playerState.idleState(player);
    states['running'] = playerState.runningState(player);
    states['jumping'] = playerState.jumpingState(player);
    states['falling'] = playerState.fallingState(player);
    states['landing'] = playerState.landingState(player);
    states['ducking'] = playerState.duckingState(player);
    states['shieldOut'] = playerState.shieldOutState(player);
    states['shieldIn'] = playerState.shieldInState(player);
    states['shieldWalk'] = playerState.shieldWalkState(player);
    states['hurt'] = playerState.hurtState(player);
    states['die'] = playerState.dieState(player);
    return states;
}

let projectiles = [];

let player = {
    hp: 1,
    x: width / 2 - 32,
    y: height - 63 - 64,
    xVelocity: 0,
    yVelocity: 0,
    direction: 'right',
    speed: 8,
    
    hardHit: true,
    hurtTimer: 0,
    isShielded: false,
    isDead: false,
    
    state: 'idle',
    states: {},
    
    hitbox_w: 64,
    hitbox_h: 64, // depending on the current frame of animation
    animations: {},
    animation_id: 'idle',
    setAnimationId: function(id) {
        if (this.animation_id !== id) {
            this.animation_id = id;
            this.animations[id].reset();
        }
    }
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
    assetsManager.addAsset('jump', 'sprites/jump_64_5.png');
    assetsManager.addAsset('fall', 'sprites/fall_64_5.png');
    assetsManager.addAsset('land', 'sprites/land_64_5.png');
    assetsManager.addAsset('duck', 'sprites/duck_64_3.png');
    assetsManager.addAsset('hurt', 'sprites/hurt_64_4.png');
    assetsManager.addAsset('hard_hit', 'sprites/hard_hit_64_13.png');
    assetsManager.addAsset('shield_out', 'sprites/shield_out_64_7.png');
    assetsManager.addAsset('shield_in', 'sprites/shield_in_64_7.png');
    assetsManager.addAsset('shield_walk', 'sprites/shield_walk_64_6.png');
    assetsManager.addAsset('die', 'sprites/die_64_18.png');
    await assetsManager.loadAssets();

    player.groundY = player.y;
    player.animations = loadAnimations();
    player.states = loadStates(player);
    requestAnimationFrame(gameLoop);    
}

function gameLoop(timestamp)
{
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    accumulator += delta;

    if (player.isDead)
    {
        endGame();
        return;
    }

    while (accumulator >= FIXED_DT) {
        update(FIXED_DT);
        accumulator -= FIXED_DT;
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame()
{
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.fillText('Game Over', width / 2 - 150, height / 2);
    //blur effect
}

function update(deltaTime)
{
    updateProjectiles(deltaTime);
    updatePlayer(deltaTime);
}

function collides(a, b)
{
    return a.x < b.x + 10 && a.x + a.hitbox_w > b.x - 10 &&
           a.y < b.y + 10 && a.y + a.hitbox_h > b.y - 10;
}

function checkCollisions()
{
    for (let p of projectiles)
    {
        if (collides(player, p))
        {
            if (player.state != 'hurt' && !player.isShielded)
            {
                player.state = 'hurt';
                player.hurtTimer = 1;
                player.hp -= 1;
                player.hardHit = Math.random() < 0.3;
                player.states[player.state].enter();
            }
            p.x = -100; // move projectile out of screen        
        }
    }
}

function updatePlayer(deltaTime)
{
    if (player.state !== 'die')
        checkCollisions();

    if (player.hp <= 0 && player.state != 'die')
    {
        player.state = 'die';
        player.states[player.state].enter();
    }
    player.states[player.state].update();
    player.animations[player.animation_id].update();
}

function updateProjectiles(deltaTime)
{
    if (Math.random() < 0.02)
    {
        let direction = 'right';
        let speed = 200 + Math.random() * 100;
        let projectile = {
            x: direction == 'left' ? -10 : width + 10,
            y: height - 64 - 32,
            xVelocity: direction == 'left' ? speed : -speed,
            yVelocity: 0
        };
        projectiles.push(projectile);
    }
    
    for (let projectile of projectiles)
    {
        projectile.x += projectile.xVelocity * deltaTime;
        projectile.y += projectile.yVelocity * deltaTime;
    }
    if (projectiles.length > 10)
        projectiles.splice(0, projectiles.length - 10);
}

function drawProjectiles()
{
    for (let projectile of projectiles)
    {
        drawPoint(projectile.x, projectile.y);
    }
}

function draw()
{
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawHpBar();
    drawPlayer();
    drawProjectiles();
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

function drawHpBar()
{
    const barWidth = 200;
    const barHeight = 20;
    const x = 20;
    const y = 20;
    ctx.fillStyle = 'black';
    ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, (player.hp / 5) * barWidth, barHeight);
}

function drawPlayer()
{
    if (player.hurtTimer > 0) {
        player.hurtTimer -= 0.1;
        if (player.hurtTimer < 0) 
            player.hurtTimer = 0;
        if (Math.floor(player.hurtTimer * 10) % 2 == 0)
            return;
    }
    ctx.save();
    let frame = player.animations[player.animation_id].getSpriteFrame();
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
    // console.log(`pressed ${e.code}`);
    player.states[player.state].onKeyDown(e.code);
});

window.addEventListener('keyup', function(e) {
    // console.log(`released ${e.code}`);
    player.states[player.state].onKeyUp(e.code);
});