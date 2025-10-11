import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Marceline} from "./marceline.js";


document.addEventListener('contextmenu', event => event.preventDefault());
function setupControl(button, key)
{
    button.addEventListener('touchstart', (e) => {
    button.classList.remove('button');
    button.classList.add('buttonPressed');
    if (!gameStarted)
        onStart();
    player.states[player.state].onKeyDown(key);
    });

    button.addEventListener('touchend', (e) => {
        button.classList.remove('buttonPressed');
        button.classList.add('button');
        player.states[player.state].onKeyUp(key);
    });

    button.addEventListener('mousedown', (e) => {
        button.classList.remove('button');
        button.classList.add('buttonPressed');
        if (!gameStarted)
            onStart();
        player.states[player.state].onKeyDown(key);
    });

    button.addEventListener('mouseup', (e) => {
        button.classList.remove('buttonPressed');
        button.classList.add('button');
        player.states[player.state].onKeyUp(key);
    });
}

const redButton = document.getElementById('redCircle');
const blueButton = document.getElementById('blueButton');
setupControl(redButton, 'Space');
setupControl(blueButton, 'KeyG');

const keys = {
    'upArrow': 'ArrowUp',
    'downArrow': 'ArrowDown',
    'leftArrow': 'ArrowLeft',
    'rightArrow': 'ArrowRight'
};
for (let arrow of document.getElementsByClassName('arrow'))
{
    setupControl(arrow, keys[arrow.id]);
}



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

const player = new Player(width / 2, height - 60, width, height);
const boss = new Marceline(width * 0.8, height - 60, width, height);

let gameStarted = false;
// let update = startScreenUpdate;
// let draw = startScreenDraw;
let update = gameUpdate;
let draw = gameDraw;
let background;

async function startGame()
{
    await assets.load();
    background = new Background(width, height, assets);
    // player.setState('walking');
    player.maxHeight = height * 0.3;

    // window.addEventListener('keydown', onStart);
    requestAnimationFrame(gameLoop);
}

function onStart(e)
{
    gameStarted = true;
    window.removeEventListener('keydown', onStart);
    player.setState('jakeRollIn');
    update = transitionUpdate;
    draw = transitionDraw;
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
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', width / 2, height / 2);
}

function gameUpdate(deltaTime)
{
    player.update(deltaTime);
    boss.update(deltaTime, player);
}

function gameDraw()
{
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawHpBar();
    boss.draw(ctx, assets);
    player.draw(ctx, assets);
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