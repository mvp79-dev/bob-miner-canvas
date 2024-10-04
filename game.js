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

  this.background = new Image();
  this.character = {
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
  };

  function imageLoaded() {
    numLoaded++;
    if (numLoaded === numImages) {
      window.init();
    }
  }

  Object.keys(this.character).forEach((key) => {
    this.character[key].src = `media/graphics/sprites/character/${key}.png`;
    this.character[key].onload = function () {
      imageLoaded();
    };
  });

  this.background.src =
    "media/graphics/sprites/ingame/tile-water-background.jpg";
  this.background.onload = function () {
    imageLoaded();
  };

  // this.bullet.onload = function () {
  //   imageLoaded();
  // };
  // this.enemy.onload = function () {
  //   imageLoaded();
  // };
  // this.enemyBullet.onload = function () {
  //   imageLoaded();
  // };
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
  this.speed = 0.5; // Redefine speed of the background for panning

  // Implement abstract function
  this.draw = function () {
    // Pan background
    this.y += this.speed;
    //this.context.clearRect(0,0, this.canvasWidth, this.canvasHeight);
    this.context.drawImage(imageRepository.background, this.x, this.y);

    // Draw another image at the top edge of the first image
    this.context.drawImage(
      imageRepository.background,
      this.x,
      this.y - this.canvasHeight
    );

    // If the image scrolled off the screen, reset
    if (this.y >= this.canvasHeight) this.y = 0;
  };
}

Background.prototype = new Drawable();

function Character() {
  this.speed = 150;
  this.type = "character";
  this.sizeX = 150;
  this.sizeY = 160;
  this.curImage = imageRepository.character["walk-up"];
  this.curIdx = 0;
  this.maxIdx = 12;
  this.shadowOffsetX = 150;
  this.shadowOffsetY = 125;
  // this.dw =

  this.init = function (x, y, width, height) {
    // Defualt variables
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  this.sx = function () {
    return parseInt(this.curIdx % 6);
  };

  this.sy = function () {
    return parseInt(this.curIdx / 6);
  };

  this.draw = function () {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.fillStyle = "rgba(33, 33, 33, 0.5)";
    this.context.beginPath();
    this.context.ellipse(this.shadowOffsetX, this.shadowOffsetY, 100, 20, 0, 0, Math.PI*2);
    this.context.fill();

    this.context.drawImage(
      this.curImage,
      this.sx() * this.sizeX,
      this.sy() * this.sizeY,
      this.sizeX,
      this.sizeY,
      0,
      0,
      this.sizeX * 2,
      this.sizeY
    );
  };

  this.idx = function () {
    this.curIdx += 0.1;
    if (this.curIdx >= this.maxIdx) this.curIdx = 0;
  };

  this.move = function () {
    if (
      KEY_STATUS.left ||
      KEY_STATUS.right ||
      KEY_STATUS.down ||
      KEY_STATUS.up
    ) {
      this.idx();
      if (KEY_STATUS.left && KEY_STATUS.down) {
        this.curImage = imageRepository.character["walk-down-left"];
        this.shadowOffsetX = 170;
      } else if (KEY_STATUS.right && KEY_STATUS.down) {
        this.shadowOffsetX = 130;
        this.curImage = imageRepository.character["walk-down-right"];
      } else if (KEY_STATUS.left && KEY_STATUS.up) {
        this.shadowOffsetX = 170;
        this.curImage = imageRepository.character["walk-up-left"];
      } else if (KEY_STATUS.right && KEY_STATUS.up) {
        this.shadowOffsetX = 130;
        this.curImage = imageRepository.character["walk-up-right"];
      } else if (KEY_STATUS.left) {
        this.shadowOffsetX = 170;
        this.curImage = imageRepository.character["walk-left"];
      } else if (KEY_STATUS.right) {
        this.shadowOffsetX = 130;
        this.curImage = imageRepository.character["walk-right"];
      } else if (KEY_STATUS.up) {
        this.shadowOffsetX = 150;
        this.curImage = imageRepository.character["walk-up"];
      } else if (KEY_STATUS.down) {
        this.shadowOffsetX = 150;
        this.curImage = imageRepository.character["walk-down"];
      }
    }

    // Redraw the character
    if (!this.isColliding) {
      this.draw();
    } else {
      // this.alive = false;
      // game.gameOver();
    }
  };
}
Character.prototype = new Drawable();

function Game() {
  this.init = function () {
    this.canvas = document.getElementById("background");
    this.ctx = this.canvas.getContext("2d");

    this.characterCanvas = document.getElementById("character");
    this.characterCtx = this.characterCanvas.getContext("2d");

    if (this.ctx) {
      //initialize contexts.
      Background.prototype.context = this.ctx;
      Character.prototype.context = this.characterCtx;

      //initialize background
      this.background = new Background();
      this.background.init(0, 0);
      Background.prototype.canvasHeight = this.canvas.height;
      Background.prototype.canvasWidth = this.canvas.width;

      //initialize character
      this.character = new Character();
      this.characterX = 0;
      this.characterY = 0;
      Character.prototype.canvasHeight = this.characterCanvas.height;
      Character.prototype.canvasWidth = this.characterCanvas.width;
      // this.character.init(this.cha);
      this.character.init(0, 0, 150, 160);

      return true;
    } else {
      return false;
    }
  };

  this.start = function () {
    // this.character.draw();
    animate();
  };
}

function animate() {
  requestAnimFrame(animate);
  game.background.draw();
  game.character.draw();
  game.character.move();
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
