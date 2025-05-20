const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player properties
let player = {
  x: 50,
  y: 150, // Will be updated based on groundY
  width: 20,
  height: 30,
  velocityY: 0,
  isJumping: false,
  color: 'dodgerblue' // Player color
};

// Physics constants
const gravity = 0.5;
const jumpStrength = -10;
const groundHeight = 10; // Thickness of the ground
const groundY = canvas.height - groundHeight; // Y-coordinate of the top of the ground

// Obstacle properties
let obstacles = [];
const obstacleSpeed = 2;
const obstacleWidth = 15;
const minObstacleHeight = 20;
const maxObstacleHeight = 40;
const obstacleColor = 'darkgreen'; // Obstacle color
let frameCount = 0;

// Game state
let gameOver = false;
let gameRunning = true;
let score = 0;

function checkCollision(player, obstacle) {
  return player.x < obstacle.x + obstacle.width &&
         player.x + player.width > obstacle.x &&
         player.y < obstacle.y + obstacle.height &&
         player.y + player.height > obstacle.y;
}

function spawnObstacle() {
  const obstacleHeight = Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight;
  const obstacle = {
    x: canvas.width,
    y: groundY - obstacleHeight, // Positioned on top of the ground
    width: obstacleWidth,
    height: obstacleHeight,
    color: obstacleColor
  };
  obstacles.push(obstacle);
}

function resetGame() {
  player = {
    x: 50,
    y: groundY - player.height, // Reset player on top of the ground
    width: 20,
    height: 30,
    velocityY: 0,
    isJumping: false,
    color: 'dodgerblue' // Player color
  };
  obstacles = [];
  gameOver = false;
  gameRunning = true;
  frameCount = 0;
  score = 0; // Reset score
  spawnObstacle();
}

function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    frameCount++;
    score++; // Increment score

    // Spawn new obstacles
    if (frameCount % 120 === 0) { // Approximately every 2 seconds at 60fps
      spawnObstacle();
    }

    // Move obstacles
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].x -= obstacleSpeed;
    }

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Update player position
    if (player.isJumping) {
      player.y += player.velocityY;
      player.velocityY += gravity;
    }

    // Ground collision
    if (player.y + player.height > groundY) {
      player.y = groundY - player.height;
      player.velocityY = 0;
      player.isJumping = false;
    }

    // Collision detection
    for (let obstacle of obstacles) {
      if (checkCollision(player, obstacle)) {
        gameOver = true;
        gameRunning = false;
        break; 
      }
    }
  }

  // Draw obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }

  // Draw the player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw the ground
  ctx.fillStyle = 'dimgray';
  ctx.fillRect(0, groundY, canvas.width, groundHeight);

  // Display Game Over message if applicable
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 15);
    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 15);
  }

  // Display Score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 25);

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Handle input
document.addEventListener('keydown', function(event) {
  if (event.code === 'Space' && !player.isJumping && gameRunning) {
    player.velocityY = jumpStrength;
    player.isJumping = true;
  }
  if (event.code === 'KeyR' && gameOver) {
    resetGame();
  }
});

// Initialize player y position
player.y = groundY - player.height;

// Initial obstacle
spawnObstacle();

// Start the game loop
requestAnimationFrame(gameLoop);
