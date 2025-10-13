import { assetsManager } from "./assets.js";
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Marceline} from "./marceline.js";

document.addEventListener('contextmenu', event => event.preventDefault());
function setupControl(button, key)
{
    button.addEventListener('touchstart', (e) => {
        button.classList.toggle('button-clicked');
        if (!gameStarted)
            onStart();
        else
            player.states[player.state].onKeyDown(key);
    });

    button.addEventListener('touchend', (e) => {
        button.classList.toggle('button-clicked');
        player.states[player.state].onKeyUp(key);
    });

    button.addEventListener('mousedown', (e) => {
        button.classList.toggle('button-clicked');
        if (!gameStarted)
            onStart();
        player.states[player.state].onKeyDown(key);
    });

    button.addEventListener('mouseup', (e) => {
        button.classList.toggle('button-clicked');
        player.states[player.state].onKeyUp(key);
    });
}

function endClick()
{
    for(let button of document.getElementsByClassName('button-clicked'))
        button.classList.toggle('button-clicked');

    player.states[player.state].onKeyUp('Space');
    player.states[player.state].onKeyUp('KeyG');
    player.states[player.state].onKeyUp('ArrowUp');
    player.states[player.state].onKeyUp('ArrowDown');
    player.states[player.state].onKeyUp('ArrowLeft');
    player.states[player.state].onKeyUp('ArrowRight');
}

window.addEventListener('keydown', function(e) {
    player.states[player.state].onKeyDown(e.code);
});
window.addEventListener('keyup', function(e) {
    player.states[player.state].onKeyUp(e.code);
});
document.addEventListener('touchend', endClick);
document.addEventListener('mouseup', endClick);

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

const player = new Player(width / 2, height - 60, width, height);
const boss = new Marceline(width * 0.8, height - 60, width, height);
boss.setIdleTimer();

let gameStarted = false;
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
    if (gameStarted) return;
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
    gameStarted = false;
    shouldStop = false;
    update = startScreenUpdate;
    draw = startScreenDraw;
    
    window.addEventListener('keydown', onStart);
}

const greenButton = document.getElementById('greenCircle');
greenButton.addEventListener('touchstart', (e) => {
    greenButton.classList.toggle('button-clicked');
    restartGame();
});

greenButton.addEventListener('mousedown', (e) => {
    greenButton.classList.toggle('button-clicked');
    restartGame();
});

greenButton.addEventListener('touchend', (e) => greenButton.classList.toggle('button-clicked'));
greenButton.addEventListener('mouseup', (e) => greenButton.classList.toggle('button-clicked'));


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
    gameStarted = false;
}

function victoryMessage()
{
    ctx.fillStyle = '#181818';
    ctx.textAlign = 'center';
    ctx.font = `${width * 0.2}px "Jersey 10", sans-serif`;
    ctx.fillText('You Win!', width / 2, height / 2);
    ctx.font = `${width * 0.07}px "Jersey 10", sans-serif`;
    ctx.fillText('Marceline is calm again.', width / 2, height / 2 + 30);
    gameStarted = false;
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
    // player.draw(ctx, assets);
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