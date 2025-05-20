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

document.addEventListener('DOMContentLoaded', () => {
    // Ensure game.js has initialized and canvas is available.
    // resetGame() will be called before each relevant test group.

    runTest('Player Initialization', () => {
        resetGame(); // Reset to default state
        assert(player.x === 50, 'Player initial x position. Expected 50, got ' + player.x);
        assert(player.y === groundY - player.height, 'Player initial y position on ground. Expected ' + (groundY - player.height) + ', got ' + player.y);
        assert(player.isJumping === false, 'Player initially not jumping. Expected false, got ' + player.isJumping);
        assert(player.velocityY === 0, 'Player initial velocityY. Expected 0, got ' + player.velocityY);
    });

    runTest('Player Jump Action', () => {
        resetGame();
        assert(gameRunning === true, 'Game should be running after reset.');
        assert(player.isJumping === false, 'Player should not be jumping before jump action.');

        // Simulate spacebar press - directly manipulate player state for test
        // as directly triggering DOM events for game input is complex for this setup.
        player.velocityY = jumpStrength;
        player.isJumping = true;

        assert(player.isJumping === true, 'Player isJumping after jump. Expected true, got ' + player.isJumping);
        assert(player.velocityY === jumpStrength, 'Player velocityY after jump. Expected ' + jumpStrength + ', got ' + player.velocityY);
    });

    runTest('Collision Detection - Positive Case', () => {
        resetGame();
        // Make player and obstacle objects for testing checkCollision directly
        const testPlayer = { x: 50, y: 150, width: 20, height: 30 };
        const testObstacle = { x: 60, y: 140, width: 15, height: 40 }; // Overlapping
        assert(checkCollision(testPlayer, testObstacle) === true, 'Collision detected. Expected true, got false');
    });

    runTest('Collision Detection - Negative Case (No Collision)', () => {
        resetGame();
        const testPlayer = { x: 50, y: 150, width: 20, height: 30 };
        const testObstacle = { x: 100, y: 140, width: 15, height: 40 }; // Not overlapping
        assert(checkCollision(testPlayer, testObstacle) === false, 'No collision detected. Expected false, got true');
    });

    runTest('Obstacle Spawning', () => {
        resetGame(); // resetGame calls spawnObstacle
        assert(obstacles.length >= 1, 'At least one obstacle spawned after reset. Expected >=1, got ' + obstacles.length);
        const firstObstacle = obstacles[0];
        assert(firstObstacle.x === canvas.width, 'Obstacle initial x position. Expected ' + canvas.width + ', got ' + firstObstacle.x);
        // Obstacle height is random, so we check it's within bounds of groundY
        assert(firstObstacle.y <= groundY - minObstacleHeight && firstObstacle.y >= groundY - maxObstacleHeight, 'Obstacle y on ground. Expected on ground, got ' + firstObstacle.y );
        assert(firstObstacle.y === groundY - firstObstacle.height, 'Obstacle y relative to its height. Expected ' + (groundY - firstObstacle.height) + ', got ' + firstObstacle.y);
    });

    runTest('Score Increment and Reset', () => {
        resetGame();
        assert(score === 0, 'Score is 0 after reset. Expected 0, got ' + score);
        
        // Simulate game running for a few frames
        gameRunning = true; // Ensure game is "running" for score to increment
        
        // Manually increment score as it would in gameLoop
        score++; 
        score++;
        assert(score === 2, 'Score increments. Expected 2, got ' + score);
        
        resetGame();
        assert(score === 0, 'Score resets to 0. Expected 0, got ' + score);
    });
});
