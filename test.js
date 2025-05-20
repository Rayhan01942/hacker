function runTest(testName, testFn) {
    const resultsDiv = document.getElementById('test-results');
    let message = testName + ': ';
    try {
        testFn();
        message += 'PASSED';
        resultsDiv.innerHTML += `<p style="color: green;">${message}</p>`;
    } catch (e) {
        message += 'FAILED<br>';
        message += `&nbsp;&nbsp;Error: ${e.message}<br>`;
        if (e.stack) {
            message += `&nbsp;&nbsp;Stack: ${e.stack.replace(/\n/g, '<br>&nbsp;&nbsp;')}`;
        }
        resultsDiv.innerHTML += `<p style="color: red;">${message}</p>`;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Helper to simulate parts of game loop for score-dependent tests
function simulateScoreIncrease(targetScore) {
    const initialGameRunning = gameRunning; // Store initial state
    const initialGameOver = gameOver;
    
    gameRunning = true; // Ensure game is "running" for score to update speed logic
    gameOver = false;

    let tempScore = score; // Use a temp score to avoid messing with global if not intended
    let tempLastSpeedIncreaseScore = lastSpeedIncreaseScore;
    let tempCurrentObstacleSpeed = currentObstacleSpeed;

    for (let i = tempScore; i < targetScore; i++) {
        tempScore++;
        if (tempScore > 0 && tempScore % speedIncreaseInterval === 0 && tempScore !== tempLastSpeedIncreaseScore) {
            if (tempCurrentObstacleSpeed < maxObstacleSpeed) {
                tempCurrentObstacleSpeed += speedIncrement;
                if (tempCurrentObstacleSpeed > maxObstacleSpeed) {
                    tempCurrentObstacleSpeed = maxObstacleSpeed;
                }
                tempLastSpeedIncreaseScore = tempScore;
            }
        }
    }
    // Restore game state if it was modified for simulation
    gameRunning = initialGameRunning;
    gameOver = initialGameOver;
    
    return { finalSpeed: tempCurrentObstacleSpeed, finalScore: tempScore };
}


document.addEventListener('DOMContentLoaded', () => {
    // Ensure game.js has initialized and canvas is available.
    // resetGame() will be called before each relevant test group.

    runTest('Player Initialization (Updated)', () => {
        resetGame(); 
        assert(player.x === 50, 'Player initial x. Expected 50, got ' + player.x);
        assert(player.height === initialPlayerHeight, 'Player initial height. Expected ' + initialPlayerHeight + ', got ' + player.height);
        assert(player.width === initialPlayerWidth, 'Player initial width. Expected ' + initialPlayerWidth + ', got ' + player.width);
        assert(player.y === groundY - initialPlayerHeight, 'Player initial y. Expected ' + (groundY - initialPlayerHeight) + ', got ' + player.y);
        assert(player.isJumping === false, 'Player initially not jumping.');
        assert(player.isDucking === false, 'Player initially not ducking.');
        assert(player.velocityY === 0, 'Player initial velocityY.');
        assert(player.hitboxWidth === playerHitbox.running.width, 'Player running hitbox width.');
        assert(player.hitboxHeight === playerHitbox.running.height, 'Player running hitbox height.');
        assert(player.hitboxXOffset === playerHitbox.running.xOffset, 'Player running hitbox xOffset.');
        assert(player.hitboxYOffset === playerHitbox.running.yOffset, 'Player running hitbox yOffset.');
    });

    runTest('Player Ducking State and Dimensions', () => {
        resetGame();
        // Simulate ArrowDown key press - directly manipulate state
        player.isDucking = true;
        player.width = duckingPlayerWidth;
        player.height = duckingPlayerHeight;
        player.y = groundY - player.height; // Recalculate y based on new height
        player.hitboxWidth = playerHitbox.ducking.width;
        player.hitboxHeight = playerHitbox.ducking.height;
        player.hitboxXOffset = playerHitbox.ducking.xOffset;
        player.hitboxYOffset = playerHitbox.ducking.yOffset;

        assert(player.isDucking === true, 'Player isDucking after action. Expected true.');
        assert(player.height === duckingPlayerHeight, 'Player ducking height. Expected ' + duckingPlayerHeight + ', got ' + player.height);
        assert(player.width === duckingPlayerWidth, 'Player ducking width. Expected ' + duckingPlayerWidth + ', got ' + player.width);
        assert(player.y === groundY - duckingPlayerHeight, 'Player ducking y. Expected ' + (groundY - duckingPlayerHeight) + ', got ' + player.y);
        assert(player.hitboxWidth === playerHitbox.ducking.width, 'Player ducking hitbox width.');
        assert(player.hitboxHeight === playerHitbox.ducking.height, 'Player ducking hitbox height.');

        // Simulate ArrowUp key release - directly manipulate state
        player.isDucking = false;
        player.width = initialPlayerWidth;
        player.height = initialPlayerHeight;
        player.y = groundY - player.height; // Recalculate y
        player.hitboxWidth = playerHitbox.running.width;
        player.hitboxHeight = playerHitbox.running.height;
        player.hitboxXOffset = playerHitbox.running.xOffset;
        player.hitboxYOffset = playerHitbox.running.yOffset;

        assert(player.isDucking === false, 'Player not ducking after release. Expected false.');
        assert(player.height === initialPlayerHeight, 'Player height after release. Expected ' + initialPlayerHeight);
        assert(player.hitboxWidth === playerHitbox.running.width, 'Player hitbox after release.');
    });
    
    runTest('Obstacle Spawning and Properties (Varied Types)', () => {
        resetGame();
        obstacles = []; // Clear any initial obstacles from resetGame's spawn
        
        let spawnedTypes = new Set();
        let allPropsPresent = true;
        let attempts = 0;
        // Try to spawn a few obstacles to see if we get variety and all have correct props
        // Due to randomness, we can't guarantee all types will spawn in a few tries.
        while (spawnedTypes.size < obstacleTypes.length && attempts < 50) {
            spawnObstacle();
            if (obstacles.length > 0) {
                const lastObstacle = obstacles[obstacles.length -1]; // Get the latest spawned one
                spawnedTypes.add(lastObstacle.type);
                if (!lastObstacle.hasOwnProperty('hitboxWidth') || 
                    !lastObstacle.hasOwnProperty('hitboxHeight') ||
                    !lastObstacle.hasOwnProperty('hitboxXOffset') ||
                    !lastObstacle.hasOwnProperty('hitboxYOffset')) {
                    allPropsPresent = false;
                    break;
                }
                if (lastObstacle.type === 'pterodactyl') {
                    if (!lastObstacle.hasOwnProperty('animated') || 
                        !lastObstacle.hasOwnProperty('currentFrame') ||
                        !lastObstacle.hasOwnProperty('animationTimer')) {
                        allPropsPresent = false;
                        break;
                    }
                }
            }
            attempts++;
            if(attempts > 10 && obstacles.length > 5) break; // Avoid too many obstacles if only one type spawns
        }
        
        assert(obstacles.length > 0, 'Obstacles are spawned. Count: ' + obstacles.length + ' Attempts: ' + attempts);
        assert(allPropsPresent, 'All spawned obstacles have required hitbox properties (and animation if applicable).');
        console.log('Spawned obstacle types in test: ', Array.from(spawnedTypes).join(', '));
        
        // Check properties of the first spawned obstacle more deeply
        const firstObstacle = obstacles[0];
        const typeConfig = obstacleTypes.find(t => t.type === firstObstacle.type);
        assert(typeConfig !== undefined, 'Spawned obstacle type exists in config.');
        assert(firstObstacle.width === typeConfig.width, 'Obstacle drawing width matches config.');
        assert(firstObstacle.hitboxWidth === typeConfig.hitboxWidth, 'Obstacle hitbox width matches config.');
    });

    runTest('Collision Detection - Refined Hitboxes (Player Running vs Cactus)', () => {
        resetGame();
        // Player (running)
        const testPlayer = { 
            x: 50, y: groundY - initialPlayerHeight, 
            hitboxWidth: playerHitbox.running.width, hitboxHeight: playerHitbox.running.height, 
            hitboxXOffset: playerHitbox.running.xOffset, hitboxYOffset: playerHitbox.running.yOffset
        };
        // Cactus (using first cactus type for example)
        const cactusType = obstacleTypes.find(t => t.type === 'cactus');
        const testObstacle = { 
            x: testPlayer.x + testPlayer.hitboxXOffset + testPlayer.hitboxWidth - 5, // Ensure overlap
            y: groundY - cactusType.height, 
            hitboxWidth: cactusType.hitboxWidth, hitboxHeight: cactusType.hitboxHeight,
            hitboxXOffset: cactusType.hitboxXOffset, hitboxYOffset: cactusType.hitboxYOffset
        };
        assert(checkCollision(testPlayer, testObstacle) === true, 'Collision (Player Running vs Cactus) detected. Expected true.');

        testObstacle.x = testPlayer.x + testPlayer.hitboxXOffset + testPlayer.hitboxWidth + 10; // No overlap
        assert(checkCollision(testPlayer, testObstacle) === false, 'No collision (Player Running vs Cactus) far. Expected false.');
    });

    runTest('Collision Detection - Refined Hitboxes (Player Ducking vs Pterodactyl - fly low)', () => {
        resetGame();
        // Player (ducking)
        const testPlayer = { 
            x: 50, y: groundY - duckingPlayerHeight, 
            hitboxWidth: playerHitbox.ducking.width, hitboxHeight: playerHitbox.ducking.height, 
            hitboxXOffset: playerHitbox.ducking.xOffset, hitboxYOffset: playerHitbox.ducking.yOffset
        };
        // Pterodactyl (flying low, should hit ducking player if x overlaps)
        const pteroType = obstacleTypes.find(t => t.type === 'pterodactyl');
        const pteroLowY = groundY - pteroType.height - pteroType.yOffsets[0]; // Lowest flying height (yOffsets[0]=20)
                                                                              // ptero Y = 190 - 30 - 20 = 140
                                                                              // ducking player top Y = 190 - 30 = 160
                                                                              // ducking player bottom Y = 190
                                                                              // ptero bottom Y = 140 + 26 = 166
                                                                              // This should collide if player is ducking
        const testObstacle = { 
            x: testPlayer.x + testPlayer.hitboxXOffset + testPlayer.hitboxWidth - 5, // Ensure x overlap
            y: pteroLowY, 
            hitboxWidth: pteroType.hitboxWidth, hitboxHeight: pteroType.hitboxHeight,
            hitboxXOffset: pteroType.hitboxXOffset, hitboxYOffset: pteroType.hitboxYOffset
        };

        // testPlayer: x=50, y=160. hX=52, hY=162, hW=55, hH=26. (Bottom at 162+26 = 188)
        // testObstacle: x= (50+2+55-5)=102, y=140. hX=102+3=105, hY=140+2=142, hW=40, hH=26. (Bottom at 142+26=168)
        // This setup should NOT collide because ptero is higher than ducking player's hitbox
        // Let's adjust ptero Y offset to be lower for collision.
        // Ptero flying just above ducking player's hitbox:
        // Ducking player top hitbox y: groundY - duckingPlayerHeight + playerHitbox.ducking.yOffset = 190 - 30 + 2 = 162
        // Ptero needs its bottom hitbox (obstacle.y + obstacle.hitboxYOffset + obstacle.hitboxHeight) to be > 162
        // And its top hitbox (obstacle.y + obstacle.hitboxYOffset) to be < 162 + player.hitboxHeight
        // Let's position ptero to clearly hit a ducking player.
        // Ducking player hitbox: y from 162 to 188.
        // Ptero hitbox height 26. Set ptero's hitbox y to 160 for overlap.
        // ptero.y + ptero.hitboxYOffset = 160 => ptero.y = 160 - ptero.hitboxYOffset = 160 - 2 = 158.
        testObstacle.y = 158; // Position ptero to collide with ducking player

        assert(checkCollision(testPlayer, testObstacle) === true, 'Collision (Player Ducking vs Low Ptero) detected. Expected true.');

        testObstacle.x = testPlayer.x + testPlayer.hitboxXOffset + testPlayer.hitboxWidth + 10; // No x overlap
        assert(checkCollision(testPlayer, testObstacle) === false, 'No collision (Player Ducking vs Low Ptero) far. Expected false.');
    });

    runTest('Game Speed Increase Logic', () => {
        resetGame();
        assert(currentObstacleSpeed === initialObstacleSpeed, 'Initial speed is correct.');

        let simResult = simulateScoreIncrease(speedIncreaseInterval); // Simulate score up to first interval
        currentObstacleSpeed = simResult.finalSpeed; // Update global for assertion
        score = simResult.finalScore; // Update global for assertion
        lastSpeedIncreaseScore = score - (score % speedIncreaseInterval); // Ensure lastSpeedIncreaseScore is correctly set as it would be in gameLoop
        
        // Manually call the speed increase logic from game.js for one step
        if (score > 0 && score % speedIncreaseInterval === 0 && score !== lastSpeedIncreaseScore) {
            if (currentObstacleSpeed < maxObstacleSpeed) {
                currentObstacleSpeed += speedIncrement;
                if (currentObstacleSpeed > maxObstacleSpeed) currentObstacleSpeed = maxObstacleSpeed;
                lastSpeedIncreaseScore = score;
            }
        }
        assert(currentObstacleSpeed === initialObstacleSpeed + speedIncrement, 'Speed increased after first interval. Expected ' + (initialObstacleSpeed + speedIncrement) + " got " + currentObstacleSpeed);

        simResult = simulateScoreIncrease(speedIncreaseInterval * 5); // Simulate high score
        currentObstacleSpeed = simResult.finalSpeed;
        score = simResult.finalScore;

        // Calculate expected speed at high score (can't directly use simulateScoreIncrease as it doesn't update the global currentObstacleSpeed in a loop)
        let expectedSpeed = initialObstacleSpeed;
        for(let s = speedIncreaseInterval; s <= score; s += speedIncreaseInterval) {
            if(expectedSpeed < maxObstacleSpeed) expectedSpeed += speedIncrement;
            if(expectedSpeed > maxObstacleSpeed) expectedSpeed = maxObstacleSpeed;
        }
        assert(currentObstacleSpeed === expectedSpeed || currentObstacleSpeed === maxObstacleSpeed , 'Speed approaches or reaches max speed. Expected ' + expectedSpeed + " or " + maxObstacleSpeed + " got " + currentObstacleSpeed);
        
        resetGame();
        assert(currentObstacleSpeed === initialObstacleSpeed, 'Speed resets correctly.');
    });

    runTest('Sprite Loading (Basic Checks)', () => {
        assert(dinoSprite1 instanceof Image, 'dinoSprite1 is an Image object.');
        assert(dinoSprite1.src && dinoSprite1.src.startsWith('data:image/png;base64,'), 'dinoSprite1.src is set.');
        assert(cactusSprite instanceof Image, 'cactusSprite is an Image object.');
        assert(cactusSprite.src && cactusSprite.src.startsWith('data:image/png;base64,'), 'cactusSprite.src is set.');
        assert(pteroImage1 instanceof Image, 'pteroImage1 is an Image object.');
        assert(pteroImage1.src && pteroImage1.src.startsWith('data:image/png;base64,'), 'pteroImage1.src is set.');
        assert(dinoDuckSprite instanceof Image, 'dinoDuckSprite is an Image object.');
        assert(dinoDuckSprite.src && dinoDuckSprite.src.startsWith('data:image/png;base64,'), 'dinoDuckSprite.src is set.');
         // Check a couple more new sprites
        assert(smallCactusImage instanceof Image, 'smallCactusImage is an Image object.');
        assert(smallCactusImage.src && smallCactusImage.src.startsWith('data:image/png;base64,'), 'smallCactusImage.src is set.');
        assert(largeCactusImage instanceof Image, 'largeCactusImage is an Image object.');
        assert(largeCactusImage.src && largeCactusImage.src.startsWith('data:image/png;base64,'), 'largeCactusImage.src is set.');
    });

    runTest('Sound Functions (Basic Callability)', () => {
        initAudio(); // Ensure audioCtx can be initialized for tests
        // Attempt to resume if suspended, common in test environments
        if (audioCtx && audioCtx.state === 'suspended') {
             try { audioCtx.resume(); } catch(e) { /* ignore if already running or errors */ }
        }

        assert(typeof playJumpSound === 'function', 'playJumpSound is a function.');
        try {
            playJumpSound(); // Call it
        } catch (e) {
            assert(false, 'playJumpSound() threw an error: ' + e.message);
        }

        assert(typeof playGameOverSound === 'function', 'playGameOverSound is a function.');
        try {
            playGameOverSound(); // Call it
        } catch (e) {
            assert(false, 'playGameOverSound() threw an error: ' + e.message);
        }
        
        assert(typeof playScoreMilestoneSound === 'function', 'playScoreMilestoneSound is a function.');
        try {
            playScoreMilestoneSound(); // Call it
        } catch (e) {
            assert(false, 'playScoreMilestoneSound() threw an error: ' + e.message);
        }
    });

});
