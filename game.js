const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Web Audio API setup
let audioCtx; // Initialize once globally

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
        }
    }
}

function playSound(frequency, duration, type = 'sine', volume = 0.1) {
    initAudio(); // Ensure AudioContext is initialized
    if (!audioCtx) return; // Exit if AudioContext couldn't be initialized

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.error("AudioContext resume failed on playSound:", e));
    }
    
    if (audioCtx.state === 'running') {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type; 
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); 
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration); 
    }
}

function playJumpSound() {
    playSound(800, 0.05, 'square', 0.05); 
}

function playGameOverSound() {
    playSound(200, 0.3, 'sawtooth', 0.1); 
}

function playScoreMilestoneSound() {
    playSound(1200, 0.1, 'triangle', 0.08); 
}

// Image loading
let imagesToLoad = 8; 
let imagesLoaded = 0;

function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === imagesToLoad) {
    console.log("All images loaded!");
  }
}

const dinoSprite1 = new Image();
dinoSprite1.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAYAAAAUufgQAAAAz0lEQVRoQ+2XwQoCMQwE/z907YQUKi4KrqKL+OgnHMTO0LnbM9+MJvudbHkYwMFgMBl/SgDkcNht9H8GgLgJKJtAIB8GHQ7C94YoF0Er4PcAFFYAnT8VpAIAuL2R0YwCADgEsBfBmYvrKKAkAvj79L/ucwWgzrZLuYvB0IYCAJgFgGUCaBUAqgRgEgGUAuD7e6vN/58AWQDgLQJYAEDaBKADADQJwLoAGPLA718C0AXAegTQKoBwCmAXAGgSwJ8CWAfC83YDAwODwfAfD3gGg6l9508AAAAASUVORK5CYII='; // 40x60
dinoSprite1.onload = onImageLoad;

const dinoSprite2 = new Image(); 
dinoSprite2.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAYAAAAUufgQAAAA0ElEQVRoQ+2XwQoCMQxF/z907YQUKi4KrqKL+OgnHMTO0LnbM9+MJvudbHkYwMFgMBl/SgDkcNht9H8GgLgJKJtAIB8GHQ7C94YoF0Er4PcAFFYAnT8VpAIAuL2R0YwCADgEsBfBmYvrKKAkAvj79L/ucwWgzrZLuYvB0IYCAJgFgGUCaBUAqgRgEgGUAuD7e6vN/58AWQDgLQJYAEDaBKADADQJwLoAGPLA718C0AXAegTQKoBwCmAXAGgSwJ8CWAcz4udvAQYDAYPBL/wBivZf7xMc8/0AAAAASUVORK5CYII='; // 40x60
dinoSprite2.onload = onImageLoad;

const cactusSprite = new Image();
cactusSprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAu0lEQVRIie2WsQ7CIAyG/cMcQJDBJINB5hZ+l0lMyHiQJl5MJvYJdBIkF2AQTILDEf5jMvGNKOKPlrR/9FVEUURE/vMMKDFPSFMyT8QT0lQzPPMNMOYpYc4T0pQZ86zANAD4XAW4n0B29GgBzgMgEwD7G5B+6gxgBgCeBvB2AIAZAPy6AJgBwBGAvQUApgDQ9gA8CgA8CoBfKADVnmrNl5kZAMSAcQDIG4CtAXgKkLzL+wLxFBFxZ0wAEyPz10kAAAAASUVORK5CYII='; // 20x40
cactusSprite.onload = onImageLoad;

const dinoDuckSprite = new Image();
dinoDuckSprite.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAeCAYAAAB5TjYqAAAAWElEQVRYR+3TsQkAMAwDQeH/p7cZKIiA3YWH6uq6JgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECPwBxGZAZzxM03yAAAAAElFTkSuQmCC'; // 59x30 purple
dinoDuckSprite.onload = onImageLoad;

const smallCactusImage = new Image();
smallCactusImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAeCAYAAADRckUKAAAAKElEQVQ4y2NkgID/UDwRwwEjcxgYgAJGFgYGNkYGBkYgAE0kAQCRpAGN9g0ovAAAAABJRU5ErkJggg=='; // 15x30 green
smallCactusImage.onload = onImageLoad;

const largeCactusImage = new Image();
largeCactusImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAyCAYAAACdSOpQAAAAKElEQVRYR+3NMQEAAAgDoC85W7gMx7AIwUDAAAAAAAAAAAAAAACAZwTSAAAGPzRWAAAAAElFTkSuQmCC'; // 25x50 green
largeCactusImage.onload = onImageLoad;

const pteroImage1 = new Image();
pteroImage1.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAeCAYAAAAZIM+FAAAAMElEQVRYR+3OAREAMAwDsez/t90REiQSHxcAAAAAAAAAAAAAAADgxYm0AAABgZ0s6AAAAABJRU5ErkJggg=='; // 46x30 gray
pteroImage1.onload = onImageLoad;

const pteroImage2 = new Image();
pteroImage2.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAeCAYAAAAZIM+FAAAAMElEQVRYR+3NMQIAAMAgDsX/n10REiQSHxcAAAAAAAAAAAAAAADgxYm0AAAB43Q1NQAAAABJRU5ErkJggg=='; // 46x30 gray
pteroImage2.onload = onImageLoad;


// Player properties
const initialPlayerWidth = 40; 
const initialPlayerHeight = 60; 
const duckingPlayerWidth = 59;   
const duckingPlayerHeight = 30;  

const playerHitbox = {
    running: { width: 36, height: 56, xOffset: 2, yOffset: 2 },
    ducking: { width: 55, height: 26, xOffset: 2, yOffset: 2 }
};

let player = {
  x: 50,
  y: 150, 
  width: initialPlayerWidth,    
  height: initialPlayerHeight,  
  hitboxWidth: playerHitbox.running.width,
  hitboxHeight: playerHitbox.running.height,
  hitboxXOffset: playerHitbox.running.xOffset,
  hitboxYOffset: playerHitbox.running.yOffset,
  velocityY: 0,
  isJumping: false,
  isDucking: false,
  sprite1: dinoSprite1,
  sprite2: dinoSprite2,
  duckSprite: dinoDuckSprite,
  currentFrame: 0,
  animationTimer: 0
};

// Animation constants
const animationSpeed = 10; 

// Physics constants
const gravity = 0.5;
const jumpStrength = -10;
const groundHeight = 10; 
const groundY = canvas.height - groundHeight; 

// Obstacle properties
let obstacles = [];
const initialObstacleSpeed = 2;
let currentObstacleSpeed = initialObstacleSpeed;
const maxObstacleSpeed = 6;
const speedIncreaseInterval = 100; 
const speedIncrement = 0.25;
let lastSpeedIncreaseScore = 0;
let lastScoreMilestoneSoundScore = 0; 
let frameCount = 0;

const obstacleTypes = [
    { 
        type: 'cactus', sprite: cactusSprite, width: 20, height: 40, yOffset: 0,
        hitboxWidth: 16, hitboxHeight: 38, hitboxXOffset: 2, hitboxYOffset: 1
    },
    { 
        type: 'small_cactus', sprite: smallCactusImage, width: 15, height: 30, yOffset: 0,
        hitboxWidth: 12, hitboxHeight: 28, hitboxXOffset: 1.5, hitboxYOffset: 1
    },
    { 
        type: 'large_cactus', sprite: largeCactusImage, width: 25, height: 50, yOffset: 0,
        hitboxWidth: 21, hitboxHeight: 48, hitboxXOffset: 2, hitboxYOffset: 1
    },
    { 
        type: 'pterodactyl', 
        sprite1: pteroImage1, 
        sprite2: pteroImage2, 
        width: 46, 
        height: 30, 
        yOffsets: [20, 45, 70], 
        animated: true,
        animationSpeed: 15,
        hitboxWidth: 40, hitboxHeight: 26, hitboxXOffset: 3, hitboxYOffset: 2
    }
];

// Game state
let gameOver = false;
let gameRunning = true;
let score = 0;

function checkCollision(player, obstacle) {
    const playerHitboxX = player.x + player.hitboxXOffset;
    const playerHitboxY = player.y + player.hitboxYOffset;
    const obstacleHitboxX = obstacle.x + obstacle.hitboxXOffset;
    const obstacleHitboxY = obstacle.y + obstacle.hitboxYOffset;

    return playerHitboxX < obstacleHitboxX + obstacle.hitboxWidth &&
           playerHitboxX + player.hitboxWidth > obstacleHitboxX &&
           playerHitboxY < obstacleHitboxY + obstacle.hitboxHeight &&
           playerHitboxY + player.hitboxHeight > obstacleHitboxY;
}

function spawnObstacle() {
    const typeIndex = Math.floor(Math.random() * obstacleTypes.length);
    const typeConfig = obstacleTypes[typeIndex];

    const obstacle = {
        x: canvas.width,
        width: typeConfig.width, 
        height: typeConfig.height, 
        hitboxWidth: typeConfig.hitboxWidth,
        hitboxHeight: typeConfig.hitboxHeight,
        hitboxXOffset: typeConfig.hitboxXOffset,
        hitboxYOffset: typeConfig.hitboxYOffset,
        type: typeConfig.type,
        animated: !!typeConfig.animated
    };

    if (typeConfig.type === 'pterodactyl') {
        obstacle.sprite1 = typeConfig.sprite1;
        obstacle.sprite2 = typeConfig.sprite2;
        obstacle.currentFrame = 0;
        obstacle.animationTimer = 0;
        obstacle.animationSpeed = typeConfig.animationSpeed;
        const yOffsetIndex = Math.floor(Math.random() * typeConfig.yOffsets.length);
        const chosenYOffset = typeConfig.yOffsets[yOffsetIndex];
        obstacle.y = groundY - obstacle.height - chosenYOffset;
    } else { 
        obstacle.sprite = typeConfig.sprite;
        obstacle.y = groundY - obstacle.height; 
    }
    obstacles.push(obstacle);
}

function resetGame() {
  player.x = 50;
  player.isJumping = false;
  player.isDucking = false;
  player.velocityY = 0;
  
  player.width = initialPlayerWidth;
  player.height = initialPlayerHeight;
  player.y = groundY - player.height; 

  player.hitboxWidth = playerHitbox.running.width;
  player.hitboxHeight = playerHitbox.running.height;
  player.hitboxXOffset = playerHitbox.running.xOffset;
  player.hitboxYOffset = playerHitbox.running.yOffset;
  
  player.currentFrame = 0;
  player.animationTimer = 0;

  obstacles = [];
  gameOver = false;
  gameRunning = true;
  frameCount = 0;
  score = 0; 
  currentObstacleSpeed = initialObstacleSpeed; 
  lastSpeedIncreaseScore = 0; 
  lastScoreMilestoneSoundScore = 0; 
  spawnObstacle();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    frameCount++;
    score++; 

    // Update game speed
    if (score > 0 && score % speedIncreaseInterval === 0 && score !== lastSpeedIncreaseScore) {
        if (currentObstacleSpeed < maxObstacleSpeed) {
            currentObstacleSpeed += speedIncrement;
            if (currentObstacleSpeed > maxObstacleSpeed) {
                currentObstacleSpeed = maxObstacleSpeed;
            }
            lastSpeedIncreaseScore = score; 
        }
    }

    // Play score milestone sound
    if (score > 0 && score % 100 === 0 && score !== lastScoreMilestoneSoundScore) {
        playScoreMilestoneSound();
        lastScoreMilestoneSoundScore = score;
    }

    // Update player animation
    if (!player.isJumping && !player.isDucking && gameRunning) { 
        player.animationTimer++;
        if (player.animationTimer > animationSpeed) {
            player.animationTimer = 0;
            player.currentFrame = (player.currentFrame === 0) ? 1 : 0;
        }
    } else if (player.isJumping || player.isDucking) {
        player.currentFrame = 0; 
        player.animationTimer = 0; 
    }

    // Spawn new obstacles
    if (frameCount % 120 === 0) { 
      spawnObstacle();
    }

    // Move obstacles
    for (let i = 0; i < obstacles.length; i++) {
      obstacles[i].x -= currentObstacleSpeed;
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
        if (gameRunning) { 
            playGameOverSound();
        }
        gameOver = true;
        gameRunning = false;
        break; 
      }
    }
  }

  // Draw obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    let spriteToDraw = obstacle.sprite; 

    if (obstacle.animated) {
        if (gameRunning) { 
            obstacle.animationTimer++;
            if (obstacle.animationTimer > obstacle.animationSpeed) {
                obstacle.animationTimer = 0;
                obstacle.currentFrame = (obstacle.currentFrame === 0) ? 1 : 0;
            }
        }
        spriteToDraw = (obstacle.currentFrame === 0) ? obstacle.sprite1 : obstacle.sprite2;
    }
    
    if (spriteToDraw && spriteToDraw.complete && spriteToDraw.naturalHeight !== 0) {
      ctx.drawImage(spriteToDraw, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }

  // Draw the player
  let spriteToDraw;
  if (player.isDucking) {
    spriteToDraw = player.duckSprite;
  } else {
    spriteToDraw = (player.currentFrame === 0) ? player.sprite1 : player.sprite2;
  }
  
  if (spriteToDraw && spriteToDraw.complete && spriteToDraw.naturalHeight !== 0) {
    ctx.drawImage(spriteToDraw, player.x, player.y, player.width, player.height);
  }

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

  requestAnimationFrame(gameLoop);
}

// Handle input
document.addEventListener('keydown', function(event) {
    initAudio(); 
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.error("AudioContext resume failed on keydown:", e));
    }

  if (event.code === 'Space' && !player.isJumping && !player.isDucking && gameRunning) {
    player.velocityY = jumpStrength;
    player.isJumping = true;
    playJumpSound();
  }
  if (event.code === 'ArrowDown' && !player.isJumping && gameRunning) {
    if (!player.isDucking) { 
        player.isDucking = true;
        player.width = duckingPlayerWidth;
        player.height = duckingPlayerHeight;
        player.y = groundY - player.height;
        player.hitboxWidth = playerHitbox.ducking.width;
        player.hitboxHeight = playerHitbox.ducking.height;
        player.hitboxXOffset = playerHitbox.ducking.xOffset;
        player.hitboxYOffset = playerHitbox.ducking.yOffset;
    }
  }
  if (event.code === 'KeyR' && gameOver) {
    resetGame();
  }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowDown' && player.isDucking) {
        player.isDucking = false;
        player.width = initialPlayerWidth;
        player.height = initialPlayerHeight;
        player.y = groundY - player.height;
        player.hitboxWidth = playerHitbox.running.width;
        player.hitboxHeight = playerHitbox.running.height;
        player.hitboxXOffset = playerHitbox.running.xOffset;
        player.hitboxYOffset = playerHitbox.running.yOffset;
    }
});

// Initialize player y position
player.y = groundY - player.height;

// Initial obstacle
spawnObstacle();

// Start the game loop
requestAnimationFrame(gameLoop);
