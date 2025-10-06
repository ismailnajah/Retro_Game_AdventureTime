import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const FPS = 24;
const FIXED_DT = 1 / FPS; // fixed timestep in seconds
let accumulator = 0;
let lastTime = performance.now();

let assets = assetsManager();

let projectiles = [];

console.log(canvas.width, canvas.height);
const player = new Player(width / 2, height - 60);

let gameStarted = false;
let update = startScreenUpdate;
let draw = startScreenDraw;
// let update = gameUpdate;
// let draw = gameDraw;
let background;

async function startGame()
{
    await assets.load();
    background = new Background(width, height, assets);
    player.setState('walking');
    player.maxHeight = height * 0.3;

    window.addEventListener('keydown', function onStart(e) {
        gameStarted = true;
        window.removeEventListener('keydown', onStart);
        player.setState('jakeRollIn');
        update = transitionUpdate;
        draw = transitionDraw;
    });
    requestAnimationFrame(gameLoop);
}

function startScreenUpdate()
{
    player.update();
}

function startScreenDraw()
{
    drawBackground(true);
    player.draw(ctx, assets);
    ctx.fillStyle = '#181818';
    ctx.font = `${width * 0.1}px "Jersey 10", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', width / 2, height * 0.3);
}

let shouldStop = false;
function transitionUpdate()
{
    if (player.x > width)
    {
        player.x = -10;
        shouldStop = true;
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

window.addEventListener('keydown', function(e) {
    player.states[player.state].onKeyDown(e.code);
});
window.addEventListener('keyup', function(e) {
    player.states[player.state].onKeyUp(e.code);
});

function transitionDraw()
{
    drawBackground();
    player.draw(ctx, assets);
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
    ctx.fillText('Game Over', width / 2, height / 2);
}

function gameUpdate(deltaTime)
{
    updateProjectiles(deltaTime);
    checkCollisions();
    player.update(deltaTime);
}

function collidesWith(a, b)
{
    return a.x < b.x + 10 && a.x + a.width > b.x - 10 &&
           a.y < b.y + 10 && a.y + a.height > b.y - 10;
}

function checkCollisions()
{
    if (player.state == 'die')
        return;
    const player_hitbox = player.getHitbox();
    for (let p of projectiles)
    {
        if (collidesWith(player_hitbox, p))
        {
            if (player.state != 'hurt' && !player.isShielded)
            {
                player.state = 'hurt';
                player.hardHit = Math.random() < 0.3;
                player.states[player.state].enter();
            }
            p.x = -100;   
        }
    }
}

function updateProjectiles(deltaTime)
{
    if (Math.random() < 0.02)
    {
        let speed = 200 + Math.random() * 100;
        let projectile = {
            x: width + 10,
            y: height - 80 + Math.random() * 30,
            xVelocity: -speed,
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

function gameDraw()
{
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawHpBar();
    player.draw(ctx, assets);
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
    const h = bar.height / 9; // include empty part
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