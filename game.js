document.addEventListener("DOMContentLoaded", function () {
  // Create background halves
  const topHalf = document.createElement("div");
  topHalf.id = "top-half";
  topHalf.classList.add("background-half");
  topHalf.style.backgroundImage =
    "url('media/graphics/sprites/ui/horizon.png')";

  const bottomHalf = document.createElement("div");
  bottomHalf.id = "bottom-half";
  bottomHalf.classList.add("background-half");
  bottomHalf.style.backgroundImage =
    "url('media/graphics/sprites/ui/foreground.png')";

  // Create logo container
  const logoContainer = document.createElement("div");
  logoContainer.id = "logo-container";
  const logoImage = document.createElement("img");
  logoImage.src = "media/graphics/sprites/ui/title.png";
  logoImage.alt = "Game Logo";
  logoContainer.appendChild(logoImage);

  // Append elements to the body
  document.body.appendChild(topHalf);
  document.body.appendChild(bottomHalf);
  document.body.appendChild(logoContainer);

  // Create Play button
  const playButton = document.createElement("button");
  playButton.id = "play-button";
  playButton.textContent = "PLAY";

  const logoContainerBottomPosition = 10; // Example value; adjust based on actual layout
  playButton.style.bottom = `${logoContainerBottomPosition}%`;

  // Append Play button to the body
  document.body.appendChild(playButton);

  // Event listener for the Play button
  playButton.addEventListener("click", function () {
    // Logic to transition to the main game scene goes here
    console.log("Play button clicked. Transition to the main game scene.");

    document.getElementById("top-half").style.display = "none";
    document.getElementById("bottom-half").style.display = "none";
    document.getElementById("logo-container").style.display = "none";
    playButton.style.display = "none";

    document.getElementById("background").style.display = "block";
    document.getElementById("character").style.display = "block";
    document.getElementById("status").style.display = "block";

    init();
  });
});

var game = new Game();
function init() {
  if (game.init()) game.start();
}

var imageRepository = new (function () {
  var numImages = 5;
  var numLoaded = 0;

  this.background = {
    "tile-water-1": new Image(),
    "tile-water-2": new Image(),
  };

  this.control = new Image();
  (this.island = new Image()),
    (this.character = {
      "walk-up": new Image(),
      "walk-down": new Image(),
      "walk-left": new Image(),
      "walk-right": new Image(),
      "walk-up-left": new Image(),
      "walk-down-left": new Image(),
      "walk-up-right": new Image(),
      "walk-down-right": new Image(),
      "work-up": new Image(),
      "work-down": new Image(),
    });

  this.particles = {
    ruby: new Image(),
    emerald: new Image(),
    amethyst: new Image(),
    money: new Image(),
  };
  this.status = {
    ruby: new Image(),
    emerald: new Image(),
    amethyst: new Image(),
    money: new Image(),
  };

  this.jewel = {
    "amethyst-mine": new Image(),
    "emerald-mine": new Image(),
    "ruby-mine": new Image(),
  };

  function imageLoaded() {
    numLoaded++;
    if (numLoaded === numImages) {
      window.init();
    }
  }

  this.island.onload = function () {
    imageLoaded();
  };

  this.control.onload = function () {
    imageLoaded();
  };

  Object.keys(this.character).forEach((key) => {
    this.character[key].src = `media/graphics/sprites/character/${key}.png`;
    this.character[key].onload = function () {
      imageLoaded();
    };
  });

  Object.keys(this.background).forEach((key) => {
    this.background[key].src = `media/graphics/sprites/ingame/${key}.png`;
    this.background[key].onload = function () {
      imageLoaded();
    };
  });

  Object.keys(this.jewel).forEach((key) => {
    this.jewel[key].src = `media/graphics/sprites/ingame/${key}.png`;
    this.jewel[key].onload = function () {
      imageLoaded();
    };
  });

  Object.keys(this.particles).forEach((key) => {
    this.particles[
      key
    ].src = `media/graphics/sprites/ingame/${key}-gem-particle.png`;
    this.particles[key].onload = function () {
      imageLoaded();
    };
  });

  Object.keys(this.status).forEach((key) => {
    this.status[key].src = `media/graphics/sprites/ui/${key}-gem.png`;
    this.status[key].onload = function () {
      imageLoaded();
    };
  });

  this.island.src = "media/graphics/sprites/ingame/island.png";
  this.control.src = "media/graphics/sprites/ui/control.png";
})();

function Drawable() {
  this.init = function (x, y, width, height) {
    // Defualt variables
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.collidableWith = "";
  this.isColliding = false;
  this.type = "";

  // Define abstract function to be implemented in child objects
  this.draw = function () {};
  this.move = function () {};
  this.isCollidableWith = function (object) {
    return this.collidableWith === object.type;
  };
}

function Background() {
  this.speed = 0; // Redefine speed of the background for panning
  this.acc = 0;
  this.tileSizeX = 720;
  this.tileSizeY = 720;
  this.tileResetX = game.viewSizeX % this.tileSizeX;
  this.tileResetX = game.viewSizeX % this.tileSizeY;

  this.drawTile = function (tileName, direction = 1) {
    let tileCountX =
      parseInt(game.viewSizeX / imageRepository.background[tileName].width) + 1;
    let tileCountY =
      parseInt(game.viewSizeY / imageRepository.background[tileName].height) +
      1;

    for (let offsetX = -2 * tileCountX; offsetX < 2 * tileCountX; offsetX++)
      for (let offsetY = -2 * tileCountY; offsetY < 2 * tileCountY; offsetY++) {
        this.context.drawImage(
          imageRepository.background[tileName],
          0,
          0,
          imageRepository.background[tileName].width,
          imageRepository.background[tileName].height,
          direction * offsetX * this.tileSizeX +
            direction * this.x -
            game.characterX,
          direction * offsetY * this.tileSizeY +
            direction * this.y -
            game.characterY,
          imageRepository.background[tileName].width,
          imageRepository.background[tileName].height
        );
      }
  };

  this.draw = function () {
    this.x += this.speed;
    this.y += this.speed;
    this.acc += 0.001;
    this.context.clearRect(0, 0, game.viewSizeX, game.viewSizeY);
    this.drawTile("tile-water-2", -1);
    this.drawTile("tile-water-1", 1);
    this.speed = 0.5 * Math.sin(this.acc);
  };
}
Background.prototype = new Drawable();

function Character() {
  this.speed = 4;
  this.type = "character";
  this.shadowOffsetY = 0;
  this.shadowOffsetX = 0;

  this.moveImage = imageRepository.character["walk-up"];
  this.workImage = imageRepository.character["work-up"];
  this.curMoveIdx = 0;
  this.curWorkIdx = 0;
  this.maxMoveIdx = 12;
  this.maxWorkIdx = 6;

  this.init = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  this.moveSx = function () {
    return parseInt(this.curMoveIdx % 6);
  };

  this.moveSy = function () {
    return parseInt(this.curMoveIdx / 6);
  };

  this.workSx = function () {
    return parseInt(this.curWorkIdx % 6);
  };

  this.workSy = function () {
    return parseInt(this.curWorkIdx / 6);
  };

  this.moveIdx = function () {
    this.curMoveIdx += 0.1;
    if (this.curMoveIdx >= this.maxMoveIdx) this.curMoveIdx = 0;
  };

  this.workIdx = function () {
    this.curWorkIdx += 0.1;
    if (this.curWorkIdx >= this.maxWorkIdx) this.curWorkIdx = 0;
  };

  this.draw = function () {
    this.context.clearRect(0, 0, game.viewSizeX, game.viewSizeY);
    this.context.fillStyle = "rgba(33, 33, 33, 0.5)";
    this.context.beginPath();
    this.context.ellipse(
      this.shadowOffsetX +
        game.characterX -
        game.viewPosX +
        game.characterWidth / 2,
      this.shadowOffsetY +
        game.characterY -
        game.viewPosY +
        game.characterHeight,
      game.characterWidth / 2 + 30,
      50,
      0,
      0,
      Math.PI * 2
    );
    this.context.fill();

    //draw character
    if (game.mining) {
      this.workImage = this.moveImage.src.includes("down")
        ? imageRepository.character["work-down"]
        : imageRepository.character["work-up"];
      this.workIdx();
      this.work();
    } else {
      this.move();
    }
    //draw shadow

    //draw control
    if (game.control) {
      this.context.fillStyle = "rgba(255, 0, 0, 0.5)";
      this.context.beginPath();
      this.context.arc(
        game.controlX + game.controlOffsetX,
        game.controlY + game.controlOffsetY,
        30,
        0,
        Math.PI * 2
      );

      this.context.drawImage(
        imageRepository.control,
        game.controlX - imageRepository.control.width / 2,
        game.controlY - imageRepository.control.height / 2
      );
      this.context.fill();
    }
  };

  this.move = function () {
    if (
      KEY_STATUS.left ||
      KEY_STATUS.right ||
      KEY_STATUS.down ||
      KEY_STATUS.up ||
      game.control
    ) {
      this.moveIdx();
      if ((KEY_STATUS.left && KEY_STATUS.down) || game.direction == "DL") {
        this.moveImage = imageRepository.character["walk-down-left"];
        this.shadowOffsetX =
          this.shadowOffsetX < 30 ? this.shadowOffsetX + 1 : 30;

        if (game.movableLeft && game.movableDown) {
          game.characterX -= this.speed;
          game.characterY += this.speed;
          game.viewPosX -= this.speed;
          game.viewPosY += this.speed;
        }
      } else if (
        (KEY_STATUS.right && KEY_STATUS.down) ||
        game.direction == "DR"
      ) {
        this.moveImage = imageRepository.character["walk-down-right"];
        this.shadowOffsetX =
          this.shadowOffsetX > -30 ? this.shadowOffsetX - 1 : -30;

        if (game.movableRight && game.movableDown) {
          game.characterX += this.speed;
          game.characterY += this.speed;
          game.viewPosX += this.speed;
          game.viewPosY += this.speed;
        }
      } else if ((KEY_STATUS.left && KEY_STATUS.up) || game.direction == "UL") {
        this.moveImage = imageRepository.character["walk-up-left"];

        if (game.movableLeft && game.movableUp) {
          game.characterX -= this.speed;
          game.characterY -= this.speed;
          game.viewPosX -= this.speed;
          game.viewPosY -= this.speed;
        }
        this.shadowOffsetX =
          this.shadowOffsetX < 30 ? this.shadowOffsetX + 1 : 30;
      } else if (
        (KEY_STATUS.right && KEY_STATUS.up) ||
        game.direction == "UR"
      ) {
        this.moveImage = imageRepository.character["walk-up-right"];
        this.shadowOffsetX =
          this.shadowOffsetX > -30 ? this.shadowOffsetX - 1 : -30;

        if (game.movableRight && game.movableUp) {
          game.characterX += this.speed;
          game.characterY -= this.speed;
          game.viewPosX += this.speed;
          game.viewPosY -= this.speed;
        }
      } else if (KEY_STATUS.left || game.direction == "L") {
        this.moveImage = imageRepository.character["walk-left"];
        this.shadowOffsetX =
          this.shadowOffsetX < 30 ? this.shadowOffsetX + 1 : 30;

        if (game.movableLeft) {
          game.characterX -= this.speed;
          game.viewPosX -= this.speed;
        }
      } else if (KEY_STATUS.right || game.direction == "R") {
        this.moveImage = imageRepository.character["walk-right"];
        this.shadowOffsetX =
          this.shadowOffsetX > -30 ? this.shadowOffsetX - 1 : -30;
        if (game.movableRight) {
          game.characterX += this.speed;
          game.viewPosX += this.speed;
        }
      } else if (KEY_STATUS.up || game.direction == "U") {
        this.moveImage = imageRepository.character["walk-up"];
        if (game.movableUp) {
          game.characterY -= this.speed;
          game.viewPosY -= this.speed;
        }
      } else if (KEY_STATUS.down || game.direction == "D") {
        this.moveImage = imageRepository.character["walk-down"];

        if (game.movableDown) {
          game.characterY += this.speed;
          game.viewPosY += this.speed;
        }
      } else this.shadowOffsetX = 0;
    }

    this.context.drawImage(
      this.moveImage,
      this.moveSx() * 150,
      this.moveSy() * 160,
      150,
      160,
      game.characterX - game.viewPosX - 75,
      game.characterY - game.viewPosY - 80,
      game.characterWidth + 150,
      game.characterHeight + 160
    );
  };

  this.work = function () {
    this.context.drawImage(
      this.workImage,
      this.workSx() * 187,
      // this.workSy() * 160,
      0,
      187,
      188,
      game.characterX - game.viewPosX - 187 / 2,
      game.characterY - game.viewPosY - 188 / 2,
      game.characterWidth + 187,
      game.characterHeight + 188
    );
  };
}
Character.prototype = new Drawable();

function Islands() {
  const respawnDelay = 8000; // Delay for jewel respawn (in milliseconds)
  this.jewelMoveSpeed = 0;
  this.touchedJewelId = null;

  // Fade-out properties
  this.fadeOutDuration = 250; // Duration for fade-out in milliseconds
  this.fadeOutStartTime = null; // Tracks when fade-out starts

  this.drawParticles = function () {
    if (game.curMintJewel !== null) {
      if (game.curMintJewel.pieces.length == 0) {
        game.curMintJewel = null;
        return;
      } else {
      }

      game.curMintJewel.pieces.forEach((piece, id) => {
        piece.speed += 0.05;
        let dx = 0;
        let dy = 0;
        if (
          Math.abs(piece.x - piece.motion[piece.curMotionId].targetX) > 5 &&
          Math.abs(piece.y - piece.motion[piece.curMotionId].targetY) > 5
        ) {
          dx =
            ((piece.motion[piece.curMotionId].targetX - piece.x) / 50) *
            Math.log(piece.speed);
          dy =
            ((piece.motion[piece.curMotionId].targetY - piece.y) / 50) *
            Math.log(piece.speed);
        } else {
          console.log(
            "complete:",
            piece.motion[piece.curMotionId],
            piece.motion.length
          );
          if (piece.curMotionId === piece.motion.length - 1) {
            // game.curMintJewel.index += 1;
            game.curMintJewel.pieces.splice(id, 1);
            game.ownedJewel[game.curMintJewel.type] += 1;
          } else {
            piece.curMotionId++;
          }
        }

        piece.x += dx;
        piece.y += dy;

        this.context.drawImage(
          imageRepository.particles[game.curMintJewel.type],
          0,
          0,
          imageRepository.particles[game.curMintJewel.type].width,
          imageRepository.particles[game.curMintJewel.type].height,
          piece.x,
          piece.y,
          // game.viewSizeX / 2,
          // game.viewSizeY / 2,
          piece.width,
          piece.height
        );
        
        this.context.font = "bold 60px Arial";
        this.context.fillStyle = "black";
        this.context.strokeStyle = "white";
        this.context.lineWidth = 5;
        this.context.strokeText(
          "+" + game.curMintJewel.pieces.length,
          game.curMintJewel.pieces[0].x,
          game.curMintJewel.pieces[0].y
        );
        this.context.fillText(
          "+" + game.curMintJewel.pieces.length,
          game.curMintJewel.pieces[0].x,
          game.curMintJewel.pieces[0].y
        );
      });
    }
  };

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
      // Helper function to calculate the distance between two points
      const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      };

      // Modified function to respawn a jewel after removal, now with position condition
      const respawnJewel = (x, y, lifecycle) => {
        const checkAndRespawn = () => {
          // Calculate the distance between the character and the jewel's respawn point
          const distance = calculateDistance(
            game.characterX,
            game.characterY,
            x,
            y
          );

          // Only respawn if the character is farther than 500 units away
          if (distance > 500) {
            island.jewels.push(
              game.initJewel(
                x,
                y,
                0.5 * game.jewelWidth,
                0.5 * game.jewelHeight,
                lifecycle
              )
            );
          } else {
            // If the character is too close, check again after a short delay
            setTimeout(checkAndRespawn, 1000); // Re-check every second
          }
        };

        // Start the respawn process after the initial respawn delay
        setTimeout(checkAndRespawn, respawnDelay);
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
          (!collision.up ||
            !collision.down ||
            !collision.left ||
            !collision.right) &&
          !jewel.isFadingOut
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
              jewel.touched = false;
              this.touchedJewelId = null;
              this.jewelMoveSpeed = 0;
              game.mining = false;
              // game.ownedJewel[island.jewelType.split("-")[0]] += parseInt(
              //   Math.random() * 3 + 8
              // );

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

        // Draw the jewel
        if (jewel.isFadingOut) {
          const elapsedTime = Date.now() - this.fadeOutStartTime;
          const fadeOutProgress = elapsedTime / this.fadeOutDuration;
          jewel.fadeOutAlpha = Math.max(0, 1 - fadeOutProgress); // Calculate current alpha

          // Remove the jewel after it fades out
          if (jewel.fadeOutAlpha === 0) {
            const removedJewelPosition = {
              x: jewel.x,
              y: jewel.y,
              lifecycle: jewel.lifecycle,
            }; // Store position
            island.jewels.splice(i, 1); // Remove the jewel
            this.touchedJewelId = null;
            this.jewelMoveSpeed = 0;
            game.mining = false;
            // Respawn the jewel after a delay
            respawnJewel(
              removedJewelPosition.x,
              removedJewelPosition.y,
              removedJewelPosition.lifecycle
            );
            game.curMintJewel = {
              type: island.jewelType.split("-")[0],
              index: 0,
              pieces: Array(parseInt(Math.random() * 4 + 8))
                .fill()
                .map((_, i) => {
                  let size = parseInt(Math.random() * 50 + 50);
                  return {
                    x:
                      island.x -
                      game.viewPosX +
                      jewel.x +
                      game.jewelWidth -
                      jewel.width / 2,
                    y:
                      island.y -
                      game.viewPosY +
                      jewel.y +
                      game.jewelHeight -
                      jewel.height / 2,
                    speed: 1,
                    width: size,
                    height: size,
                    amount: 1,
                    curMotionId: 0,
                    motion: [
                      {
                        targetX:
                          parseInt(
                            (Math.random() * 100 + 200) *
                              (Math.random() * 2 - 1)
                          ) +
                          island.x -
                          game.viewPosX +
                          jewel.x +
                          game.jewelWidth -
                          jewel.width / 2,
                        targetY:
                          parseInt(
                            (Math.random() * 100 + 200) *
                              (Math.random() * 2 - 1)
                          ) +
                          island.y -
                          game.viewPosY +
                          jewel.y +
                          game.jewelHeight -
                          jewel.height / 2,
                      },
                      {
                        targetX: game.viewSizeX / 2,
                        targetY: game.viewSizeY / 2,
                      },
                      {
                        type: "linear",
                        targetX: 0,
                        targetY:
                          Object.keys(game.ownedJewel).indexOf(
                            island.jewelType.split("-")[0]
                          ) * 100,
                        delay: 3000,
                      },
                    ],
                  };
                }),
            };
            return; // Skip the rest of the loop for this jewel since it's removed
          }
        }

        jewel.width =
          jewel.width < game.jewelWidth
            ? (jewel.width += game.jewelWidth * 0.005)
            : game.jewelWidth;
        jewel.height =
          jewel.height < game.jewelHeight
            ? (jewel.height += game.jewelHeight * 0.005)
            : game.jewelHeight;
        let x =
          i === this.touchedJewelId
            ? island.x -
              game.viewPosX +
              jewel.x +
              15 * Math.sin(this.jewelMoveSpeed)
            : island.x -
              game.viewPosX +
              jewel.x +
              game.jewelWidth / 2 -
              jewel.width / 2;
        let y =
          island.y -
          game.viewPosY +
          jewel.y +
          game.jewelHeight / 2 -
          jewel.height / 2;

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
      this.drawParticles();
    });

    // Allow character to move even while touching a jewel or during fade-out
    game.character.move();
  };
}
Islands.prototype = new Drawable();

function Status() {
  this.showScoreAlpha = 1;
  this.showScoreY = 0;

  this.init = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };
  this.mintJewelMotion = [
    {
      type: "linear",
      targetX: game.viewSizeX / 2,
      targetY: game.viewSizeY / 2,
      delay: 3000,
    },
  ];
  this.curMotionId = 0;
  this.oneComplete = false;

  this.drawJewelStatus = function (jewel, x, y) {
    this.context.globalAlpha = 1;
    this.context.drawImage(
      imageRepository.status[jewel],
      0,
      0,
      imageRepository.status[jewel].width,
      imageRepository.status[jewel].height,
      x,
      y,
      100,
      100
    );

    this.context.font = "bold 60px Arial";
    this.context.fillStyle = "black";
    this.context.strokeStyle = "white";
    this.context.lineWidth = 5;
    this.context.strokeText(game.ownedJewel[jewel], x + 100, y + 70);
    this.context.fillText(game.ownedJewel[jewel], x + 100, y + 70);
    // console.log("fill", game.ownedJewel[jewel]);
  };

  this.drawMint = function () {
    if (game.curMintJewel) {
      this.showScoreAlpha -= 0.01;
      this.showScoreY += 1;
      this.context.globalAlpha = this.showScoreAlpha;
      this.context.drawImage(
        imageRepository.status[game.curMintJewel.type],
        0,
        0,
        imageRepository.status[game.curMintJewel.type].width,
        imageRepository.status[game.curMintJewel.type].height,
        game.characterX - game.viewPosX + game.characterWidth / 4,
        game.characterY -
          game.viewPosY -
          game.characterHeight -
          this.showScoreY,
        100,
        100
      );

      this.context.globalAlpha = 1;
    }
  };

  this.draw = function () {
    // this.context.beginPath();
    this.context.fillStyle = "red";
    this.context.clearRect(0, 0, game.viewSizeX, game.viewSizeY);
    Object.keys(game.ownedJewel).forEach((key, index) => {
      this.drawJewelStatus(key, 0, 100 * index);
    });
    // this.drawMint();
  };
}
Status.prototype = new Drawable();

function Game() {
  this.SizeX = 5000;
  this.SizeY = 5000;
  this.characterX = Math.random() * 1000;
  this.characterY = Math.random() * 1000;
  this.characterWidth = 150;
  this.characterHeight = 160;
  this.viewSize = 1200;
  this.viewPosX = 0;
  this.viewPosY = 0;
  this.movableUp = true;
  this.movableDown = true;
  this.movableLeft = true;
  this.movableRight = true;
  this.controlOffsetX = 0;
  this.controlOffsetY = 0;
  this.control = false;
  this.controlAngle = 0;
  this.controlRadius = 0;
  this.direction = null;
  this.jewelWidth = 250;
  this.jewelHeight = 300;
  this.mining = false;
  this.curMintJewel = null;
  this.ownedJewel = {
    ruby: 0,
    emerald: 0,
    amethyst: 0,
    money: 0,
  };

  this.initJewel = function (x, y, width, height, lifecycle) {
    return {
      x: x,
      y: y,
      width: width,
      height: height,
      lifecycle: lifecycle, // Total lifecycle time in milliseconds
      touched: false, // Tracks if the jewel was touched
      touchedTime: null, // Time when it was first touched
      touchElapsedTime: 0, // Total time jewel has been touched
    };
  };
  this.generateJewelArray = function (
    numJewels,
    xRange,
    yRange,
    minLifecycle,
    maxLifecycle
  ) {
    const jewels = [];

    // Helper function to check if two jewels overlap
    const isOverlapping = (x1, y1, x2, y2, width, height) => {
      return (
        x1 < x2 + width &&
        x1 + width > x2 &&
        y1 < y2 + height &&
        y1 + height > y2
      );
    };

    for (let i = 0; i < numJewels; i++) {
      let x, y, isValidPosition;

      do {
        // Generate random x and y positions within bounds
        x = Math.floor(Math.random() * (xRange - this.jewelWidth));
        y = Math.floor(Math.random() * (yRange - this.jewelHeight));

        // Check if the new jewel overlaps with any existing jewels
        isValidPosition = jewels.every(
          (jewel) =>
            !isOverlapping(
              x,
              y,
              jewel.x,
              jewel.y,
              this.jewelWidth,
              this.jewelHeight
            )
        );
      } while (!isValidPosition); // Retry if overlapping occurs

      // Random lifecycle between minLifecycle and maxLifecycle (in milliseconds)
      const lifecycle =
        Math.random() * (maxLifecycle - minLifecycle) + minLifecycle;

      // Add the new jewel with random position and lifecycle
      jewels.push(
        this.initJewel(x, y, this.jewelWidth, this.jewelHeight, lifecycle)
      );
    }

    return jewels;
  };
  this.islandData = [
    {
      id: 1,
      x: 0,
      y: 0,
      width: 1800,
      height: 1800,
      jewelType: "ruby-mine",
      jewels: (initialJewels = this.generateJewelArray(
        8,
        1800,
        1800,
        2000,
        4000
      )),
    },
  ];

  this.viewSizeX = this.viewSize;
  this.viewSizeY = this.viewSize;

  this.init = function () {
    this.canvas = document.getElementById("background");
    this.ctx = this.canvas.getContext("2d");

    this.characterCanvas = document.getElementById("character");
    this.characterCtx = this.characterCanvas.getContext("2d");

    this.statusCanvas = document.getElementById("status");
    this.statusCtx = this.statusCanvas.getContext("2d");

    if (this.ctx && this.characterCtx && this.statusCtx) {
      // Initialize contexts
      Background.prototype.context = this.ctx;
      Character.prototype.context = this.characterCtx;
      Status.prototype.context = this.statusCtx;

      // Initialize background
      this.background = new Background();
      this.background.init(0, 0);
      Background.prototype.canvasHeight = this.canvas.height;
      Background.prototype.canvasWidth = this.canvas.width;
      // Initialize character
      this.character = new Character();
      Character.prototype.canvasHeight = this.characterCanvas.height;
      Character.prototype.canvasWidth = this.characterCanvas.width;
      Character.prototype.sizeX = 150;
      Character.prototype.sizeY = 160;

      this.character.init(0, 0, 150, 160);

      // Make the canvas responsive
      this.islands = new Islands();
      Islands.prototype.data = this.islandData;
      Islands.prototype.context = this.ctx;

      this.status = new Status();
      Status.prototype.canvasHeight = this.statusCanvas.height;
      Status.prototype.canvasWidth = this.statusCanvas.width;

      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());
      window.addEventListener("mousedown", (e) => this.mouseDown(e));
      window.addEventListener("mouseup", (e) => this.mouseUp(e));
      window.addEventListener("mousemove", (e) => this.mouseMove(e));

      return true;
    } else {
      return false;
    }
  };

  this.mouseDown = function (e) {
    this.control = true;
    this.controlX = (e.clientX / this.canvas.width) * this.viewSizeX;
    this.controlY = (e.clientY / this.canvas.height) * this.viewSizeY;

    // Reset control angle and radius when mouse is pressed
    this.controlOffsetX = 0;
    this.controlOffsetY = 0;
    this.controlAngle = 0;
    this.controlRadius = 0;
  };

  this.mouseUp = function (e) {
    this.control = false;
    this.direction = "";
  };

  this.mouseMove = function (e) {
    if (this.control) {
      let controlOffsetX =
        (e.clientX / this.canvas.width) * this.viewSizeX - this.controlX;
      let controlOffsetY =
        (e.clientY / this.canvas.height) * this.viewSizeY - this.controlY;

      // Calculate angle of movement
      this.controlAngle = Math.atan2(controlOffsetY, controlOffsetX);

      if (this.controlAngle < 0) {
        this.controlAngle += 2 * Math.PI;
      }

      // Now divide the angle into 8 equal sections
      let section = Math.floor(this.controlAngle / ((2 * Math.PI) / 8)); // Each section is π/4 radians

      // Do something based on the section (0 through 7)
      switch (section) {
        case 0:
          // Movement is to the right (0 to π/4)
          this.direction = "R";
          break;
        case 1:
          // Movement is in the upper-right direction (π/4 to π/2)
          this.direction = "DR";
          break;
        case 2:
          // Movement is upwards (π/2 to 3π/4)
          this.direction = "D";
          break;
        case 3:
          // Movement is in the upper-left direction (3π/4 to π)
          this.direction = "DL";
          break;
        case 4:
          // Movement is to the left (π to 5π/4)
          this.direction = "L";
          break;
        case 5:
          // Movement is in the lower-left direction (5π/4 to 3π/2)
          this.direction = "UL";
          break;
        case 6:
          // Movement is downwards (3π/2 to 7π/4)
          this.direction = "U";
          break;
        case 7:
          // Movement is in the lower-right direction (7π/4 to 2π)
          this.direction = "UR";
          break;
      }

      let distance = Math.sqrt(
        controlOffsetX * controlOffsetX + controlOffsetY * controlOffsetY
      );
      this.controlRadius = distance > 0 ? 85 : 0;

      this.controlOffsetX = this.controlRadius * Math.cos(this.controlAngle);
      this.controlOffsetY = this.controlRadius * Math.sin(this.controlAngle);
    } else {
      this.controlAngle = 0;
      this.controlRadius = 0;
    }
  };

  this.resizeCanvas = function () {
    // Get the current window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.characterCanvas.width = window.innerWidth;
    this.characterCanvas.height = window.innerHeight;

    this.statusCanvas.width = window.innerWidth;
    this.statusCanvas.height = window.innerHeight;

    if (this.canvas.width > this.canvas.height) {
      this.viewSizeX =
        (this.canvas.width * this.viewSizeY) / this.canvas.height;
      this.viewSizeY = this.viewSize;
    } else {
      this.viewSizeY =
        (this.canvas.height * this.viewSizeX) / this.canvas.width;
      this.viewSizeX = this.viewSize;
    }

    this.viewPosX = this.characterX - this.viewSizeX / 2;
    this.viewPosY = this.characterY - this.viewSizeY / 2;

    let ratioX =
      Math.min(this.viewSizeX, this.canvas.width) /
      Math.max(this.viewSizeX, this.canvas.width);
    let ratioY =
      Math.min(this.viewSizeY, this.canvas.height) /
      Math.max(this.viewSizeY, this.canvas.height);

    Background.prototype.canvasHeight = this.canvas.height;
    Background.prototype.canvasWidth = this.canvas.width;

    Character.prototype.canvasHeight = this.characterCanvas.height;
    Character.prototype.canvasWidth = this.characterCanvas.width;
    Character.prototype.drawX = this.viewSizeX / 2 - Character.prototype.sizeX;
    Character.prototype.drawY = this.viewSizeY / 2 - Character.prototype.sizeY;

    Status.prototype.canvasHeight = this.statusCanvas.height;
    Status.prototype.canvasWidth = this.statusCanvas.width;

    this.ctx.scale(ratioX, ratioY);
    this.characterCtx.scale(ratioX, ratioY);
    this.statusCtx.scale(ratioX, ratioY);
  };

  this.start = function () {
    animate();
  };
}

function animate() {
  requestAnimFrame(animate);
  game.background.draw();
  game.islands.draw();
  game.character.draw();
  game.status.draw();

  // console.log(game.ownedJewel);
}

function checkCollision(x1, y1, x2, y2, w1, w2, h1, h2) {
  let centerX1 = x1 + w1 / 2;
  let centerY1 = y1 + h1 / 2;
  let centerX2 = x2 + w2 / 2;
  let centerY2 = y2 + h2 / 2;

  let minDistance = Math.min(w1, h1) / 2 + Math.min(w2, h2) / 2;
  let dx = centerX1 - centerX2;
  let dy = centerY1 - centerY2;
  let distance = Math.sqrt(dx * dx + dy * dy);

  let right = true;
  let down = true;
  let up = true;
  let left = true;

  if (distance < minDistance) {
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        left = false;
      } else {
        right = false;
      }
    } else {
      if (dy > 0) {
        up = false;
      } else {
        down = false;
      }
    }
  }

  return { up, down, left, right };
}

// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: "space",
  37: "left",
  38: "up",
  39: "right",
  40: "down",
};

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};

for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function (e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = e.keyCode ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
};

/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function (e) {
  var keyCode = e.keyCode ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
};

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();
