function Islands() {
  const respawnDelay = 8000; // Delay for jewel respawn (in milliseconds)
  this.jewelMoveSpeed = 0;
  this.touchedJewelId = null;

  // Fade-out properties
  this.fadeOutDuration = 1000; // Duration for fade-out in milliseconds
  this.fadeOutStartTime = null; // Tracks when fade-out starts

  // Method to draw islands and handle jewel lifecycle
  this.draw = function () {
    this.data.forEach((island) => {
      // Draw the island
      this.context.drawImage(
        imageRepository.island,
        0,
        0,
        imageRepository.island.width,
        imageRepository.island.height,
        island.x - game.viewPosX,
        island.y - game.viewPosY,
        imageRepository.island.width,
        imageRepository.island.height
      );

      // Initialize movement flags
      let movementFlags = {
        movableUp: true,
        movableDown: true,
        movableLeft: true,
        movableRight: true,
      };

      // Helper function to update movement flags
      const updateMovementFlags = (collision) => {
        const { up, down, left, right } = collision;
        movementFlags.movableRight =
          movementFlags.movableRight &&
          right &&
          island.x + island.width > game.characterX + game.characterWidth;
        movementFlags.movableDown =
          movementFlags.movableDown &&
          down &&
          island.y + island.height > game.characterY + game.characterHeight;
        movementFlags.movableLeft =
          movementFlags.movableLeft && left && island.x <= game.characterX;
        movementFlags.movableUp =
          movementFlags.movableUp && up && island.y < game.characterY;
      };

      // Helper function to respawn a jewel after removal
      const respawnJewel = (x, y, lifecycle) => {
        setTimeout(() => {
          island.jewels.push(game.initJewel(x, y, 0.5 * game.jewelWidth, 0.5 * game.jewelHeight, lifecycle)); // Push new jewel to the same position
        }, respawnDelay);
      };

      // Process jewels and check collisions
      island.jewels.forEach((jewel, i) => {
        const jewelX = island.x + jewel.x;
        const jewelY = island.y + jewel.y;

        // Check collision with character
        const collision = checkCollision(
          game.characterX,
          game.characterY,
          jewelX,
          jewelY,
          game.characterWidth,
          game.jewelWidth,
          game.characterHeight,
          game.jewelHeight
        );

        // Update movement flags based on collisions
        updateMovementFlags(collision);

        // Handle jewel touching logic
        if (
          !collision.up ||
          !collision.down ||
          !collision.left ||
          !collision.right
        ) {
          game.mining = true;
          this.touchedJewelId = i;
          this.jewelMoveSpeed += 0.04;
          if (!jewel.touched) {
            jewel.touched = true;
            jewel.touchStartTime = Date.now(); // Start tracking touch time
            jewel.totalTouchedTime = jewel.totalTouchedTime || 0; // Initialize total touch time
          } else {
            // Accumulate the touch time
            let currentTouchTime = Date.now() - jewel.touchStartTime;
            jewel.totalTouchedTime += currentTouchTime;
            jewel.touchStartTime = Date.now(); // Reset start time for the next check

            // Remove the jewel if it has been touched for longer than its lifecycle
            if (jewel.totalTouchedTime >= jewel.lifecycle) {
              jewel.fadeOutAlpha = 1; // Start fade-out with full opacity
              jewel.isFadingOut = true; // Set fading out state
              this.touchedJewelId = null;
              this.jewelMoveSpeed = 0;
              game.mining = false;
              game.ownedJewel[island.jewelType.split("-")[0]] += parseInt(Math.random() * 3 + 10);

              // Start fade out process
              this.fadeOutStartTime = Date.now();
              return; // Skip the rest of the loop for this jewel since it's marked for fade out
            }
          }
        } else {
          // If the jewel was touched but is no longer being touched, stop tracking
          if (jewel.touched) {
            jewel.touched = false;
            let currentTouchTime = Date.now() - jewel.touchStartTime;
            jewel.totalTouchedTime += currentTouchTime; // Accumulate total touch time

            this.jewelMoveSpeed = 0;
            this.touchedJewelId = null;
            game.mining = false;
          }
        }

        // Draw the jewel with fade-out effect if applicable
        if (jewel.isFadingOut) {
          const elapsedTime = Date.now() - this.fadeOutStartTime;
          const fadeOutProgress = elapsedTime / this.fadeOutDuration;
          jewel.fadeOutAlpha = Math.max(0, 1 - fadeOutProgress); // Calculate current alpha

          // Remove the jewel after it fades out
          if (jewel.fadeOutAlpha === 0) {
            island.jewels.splice(i, 1); // Remove the jewel after fading out
            return; // Skip the rest of the loop for this jewel since it's removed
          }
        } else {
          jewel.width = jewel.width < game.jewelWidth ? jewel.width += game.jewelWidth * 0.005 : game.jewelWidth;
        }

        let x =
          i === this.touchedJewelId
            ? island.x -
              game.viewPosX +
              jewel.x +
              15 * Math.sin(this.jewelMoveSpeed)
            : island.x - game.viewPosX + jewel.x + game.jewelWidth / 2 - jewel.width / 2;
        let y = island.y - game.viewPosY + jewel.y + game.jewelHeight / 2 - jewel.height / 2;

        // Set the global alpha value for the context before drawing
        this.context.globalAlpha = jewel.isFadingOut ? jewel.fadeOutAlpha : 1;

        this.context.drawImage(
          imageRepository.jewel[island.jewelType],
          0,
          0,
          imageRepository.jewel[island.jewelType].width,
          imageRepository.jewel[island.jewelType].height,
          x,
          y,
          jewel.width,
          jewel.height
        );

        // Reset the alpha for subsequent drawings
        this.context.globalAlpha = 1;
      });

      // Update game's movement flags based on the results of collisions
      Object.assign(game, movementFlags);
    });
  };
}

Islands.prototype = new Drawable();
