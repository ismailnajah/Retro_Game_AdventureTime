const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

let lastTime = 0;
let lastFrameTime = 0;
const frameRate = 8; // Frames per second for animation

let tileSize = 64;
const grid_rows = Math.floor(height / tileSize ) + 4;
const grid_cols = 5;

const sprite_w = 32; // Width of a single frame
const sprite_h = 32; // Height of a single frame
const player = {
    x: width / 2 - tileSize / 2,
    y: height - tileSize - 20,
    width: tileSize,
    height: tileSize,
    speed: tileSize * 4,
    frameX: 0,
    frameY: 1,
    moving: true,
    direction: 'up',
};

function createRoadSegment(tileCount, threshold=0.5)
{
  let road = [];
  for (let i = 0; i < tileCount; i++)
    road.push(Math.random() < threshold ? 'road' : 'obstacle');
  return road;
}

let map = (() => {
  let g = [];
  for (let r = 0; r < grid_rows; r++)
    g.push(createRoadSegment(grid_cols, 1));
  return {
    x: width / 2,
    y: height / 2,
    width: grid_cols * tileSize,
    height: grid_rows * tileSize,
    tiles: g
  };
})();

function drawGrid()
{
  for (let r = 0; r < grid_rows; r++)
  {
    for (let c = 0; c < grid_cols; c++)
    {
      if (map.tiles[r][c] === 'road')
        ctx.fillStyle = '#888';
      else
        ctx.fillStyle = '#444';
      let x = c * tileSize + map.x - map.width / 2;
      let y = r * tileSize + map.y - map.height / 2;
      ctx.fillRect(x, y, tileSize, tileSize);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadAssets() {
  const [idle, walk, background] = await Promise.all([
    loadImage('assets/Idle.png'),
    loadImage('assets/Walk.png'),
    loadImage('assets/background.png'),
  ]);
  return { idle: idle, walk: walk, background: background };
}

async function startGame()
{
  assets = await loadAssets();
  console.log(assets);
  //ctx.drawImage(assets.background, 0, 0, width, height);
  // ctx.drawImage(assets.idle, 0, 0, 64, 64, player.x, player.y, player.width, player.height);
  requestAnimationFrame(gameLoop);
}

startGame();

function gameLoop()
{
  const now = Date.now();
  const delta = (now - lastTime) / 1000; // Convert to seconds
  lastTime = now;

  update(delta);
  render();

  requestAnimationFrame(gameLoop);
}

let empty = false;
function update(deltaTime)
{
  map.y += (player.speed / 2 * deltaTime);
  if (map.y > height / 2 + tileSize)
  {
    empty = !empty;
    let threshold = empty ? 1 : Math.max(0.6, 1 - Math.random());
    map.tiles.pop()
    map.tiles.unshift(createRoadSegment(grid_cols, threshold));
  }
  if (map.y >= height / 2 + tileSize)
    map.y = height / 2;
  if (player.direction === 'left') {
    player.x -= player.speed * deltaTime;
    if (player.x < map.x - map.width / 2) player.x = map.x - map.width / 2;
  } else if (player.direction === 'right') {
    player.x += player.speed * deltaTime;
    if (player.x + player.width > map.x + map.width / 2) player.x = map.x + map.width / 2 - player.width;
  }
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  update_animation_frame();
  if (player.moving) {
    ctx.drawImage(assets.walk, player.frameX * sprite_w, 1 + player.frameY * sprite_h, sprite_w, sprite_h, player.x, player.y, player.width, player.height);
  } else {
    ctx.drawImage(assets.idle, player.frameX * sprite_w, 1 + player.frameY * sprite_h, sprite_w, sprite_h, player.x, player.y, player.width, player.height);
  }
}

let previous_direction = null;
function update_animation_frame() {
  let now = Date.now();
  if (now - lastFrameTime < 1000 / frameRate && player.direction === previous_direction)
    return;
  
  previous_direction = player.direction;
  lastFrameTime = now;

  if (player.moving) {
    player.frameX = (player.frameX + 1) % 4; // Cycle through walk frames
  } else {
    player.frameX = (player.frameX + 1) % 2; // Reset to first frame of idle animation
  }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            player.direction = 'left';
            break;
        case 'ArrowRight':
            player.direction = 'right';
            break;
    }
    player.moving = player.direction !== null;
});

document.addEventListener('keyup', (e) => {
    player.moving = true;
    player.direction = 'up';
    player.frameX = 0; // Reset to first frame of idle animation
});