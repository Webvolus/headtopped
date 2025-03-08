//Sets up the canvas element which allows us to render in shapes (game canvas is 130 by 280)
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800; /* width in pixels */
canvas.height = 450;
let currentLevel = 1;



// Player Object class, This allows us to create multiple instances of players with these same classes
class Player {
    constructor(x, y, keysMapping, color) {
        //Initial x and y postion
        this.x = x;
        this.y = y;
        //Initial x and y velocity
        this.dx = 0; 
        this.dy = 0; 
        //initial dimensions of players
        this.width = 20;
        this.height = 20; 
        //checks whether the player is on solid ground
        this.grounded = false;
        this.friction = 0.9;
        this.gravity = 0.3;
        this.acceleration = 0.1;
        this.topSpeed = 5;
        this.jumpStength = 5;
        this.color = color;
        //allows us to assign each player a different set of keys (This will be done further down)
        this.keysMapping = keysMapping;
        //keeps track of whether or not a key is pressed
        this.keys = {left: false, right: false, up: false};
        //checks whether or not the right or left key is pressed
        this.isAccelerating = false;
        this.wins = 0;
        }

    //draws the player 
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Key press handling, identifies whether a key is pressed or not.
    //True means it's pressed, false means it's not
    handleKeyDown(key) {
        if (key === this.keysMapping.right) this.keys.right = true;
        if (key === this.keysMapping.left)  this.keys.left = true;
        if (key === this.keysMapping.up){
            this.keys.up = true;
        }
    }

    handleKeyUp(key) {
        if (key === this.keysMapping.right) this.keys.right = false;
        if (key === this.keysMapping.left)  this.keys.left = false;
        if (key === this.keysMapping.up){
            this.keys.up = false;
        }
    }

    //handles player movement
    move(){
        //Handles player controls NOTE: Up is Negative, Down is positive
        if (this.keys.right) {
            this.isAccelerating = true;
            if (this.dx < 0){
                this.dx *= this.friction
            }
            if (this.dx < this.topSpeed) {
                this.dx += this.acceleration;
            } else {
                this.dx = this.topSpeed;
            }
        }
        
        if (this.keys.left){
            this.isAccelerating = true;
            if (this.dx > 0){
                this.dx *= this.friction
            }
            if (this.dx > -this.topSpeed) {
                this.dx -= this.acceleration;
            } else {
                this.dx = -this.topSpeed;
            }
        }
        
        if (!this.keys.right && !this.keys.left){
            this.dx *= this.friction;
            this.isAccelerating = false;
        }

        if (this.keys.up && this.grounded) {
            this.dy = -this.jumpStength;
        }

        //adds the players speed to it's current position
        this.x += this.dx;
        this.y += this.dy;
        this.dy += this.gravity;


        //ensures the player can't leave the game canvas
        if(this.x < 0) {
            this.x = 0;
            this.dx = 0;
            removePlayer(this);
        }
        if(this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.dx = 0;
            removePlayer(this);
        }
        if(this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            removePlayer(this);

        }
        
        if(this.y <= 0) {
            this.y = 0;
            this.dy = 0;
            removePlayer(this);
        }

   
    }
};


//This assigns keys to each player
const player1Keys = {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp" };
const player2Keys = { left: "q", right: "e", up: "w" };
const player3Keys = { left: "z", right: "c", up: "x" };
const player4Keys = { left: "i", right: "p", up: "o" };

// Create players:
const player1 = new Player(0, 0, player1Keys, "black");
const player2 = new Player(50, 0, player2Keys, "red");
const player3 = new Player(80, 0, player3Keys, "green");
const player4 = new Player(110, 0, player4Keys, "purple");

//puts the players into an array, making it easier to apply effects to all of them at once
const players = [player1, player2, player3, player4]


// Create an Audio object for the sound effect
const eliminationSound = new Audio('elimination-sound.mp3');

//Allows us to remove a player if the are eliminated
function removePlayer(player) {
    const index = players.indexOf(player);
    if (index > -1) {
        players.splice(index, 1);
        // Play the elimination sound
        eliminationSound.play();
    }
}


//checks which keys are pressed
document.addEventListener("keydown", (e) => {
    players.forEach((player) => player.handleKeyDown(e.key));
});
  
document.addEventListener("keyup", (e) => {
    players.forEach((player) => player.handleKeyUp(e.key));
});

//handles player collisions, prevents players from passing through on another and allows players to push one another
function playerCollisionsX(playerA, playerB) {

    //this defines which cube is on the right because all of the code below it runs based on PlayerA being on the right and Player B on left
    if (playerA.x > playerB.x) {
        [playerA, playerB] = [playerB, playerA];
    }

    // Check if the players overlap horizontally and vertically
    if (
        playerA.x + playerA.width >= playerB.x &&
        playerA.x <= playerB.x + playerB.width &&
        playerA.y + playerA.height >= playerB.y &&
        playerA.y <= playerB.y + playerB.height
    ) {

        if (playerA.y > playerB.y) {
            [playerA, playerB] = [playerB, playerA];
        }

        if (playerA.y + playerA.height <= playerB.y + playerB.height / 2 && playerA.x + playerA.width > playerB.x + 3 && playerB.x + playerB.width - 3 > playerA.x) {
            removePlayer(playerB);
            playerA.dy = -playerA.dy / 2;
        }

        //Physics section  
        /* This section controls the physics with collisions along the x-axis*/
        if (playerA.x + playerA.width >= playerB.x && playerA.x <= playerB.x){
            //ensures the players do not overlap each other
            //if the player on the right is moving to the right the player on their right will be pushed and have the same speed as them
            if (playerA.dx > 0 && playerA.isAccelerating && !playerB.isAccelerating){
                playerB.x = playerA.x + playerA.width;
                playerB.dx = playerA.dx;
            //if the player on the left is moving to the right, then the player on the left will be pushed and have the same speed as them
            } else if (playerB.dx < 0 && playerB.isAccelerating && !playerA.isAccelerating){
                playerA.x = playerB.x - playerA.width;
                playerA.dx = playerB.dx;
            //this part handles the scenario where both players are trying to move into one-another
            } else if (playerB.isAccelerating && playerA.isAccelerating){
                /*if the player on the left is pushing the player on the right and the player on the right pushes back
                    then both players will slow down to a stop */ 
                if(playerA.dx > -playerB.dx){
                    playerB.x = playerA.x + playerA.width;
                    playerA.dx -= playerB.acceleration * 2;
                    playerB.dx = playerA.dx;
                } else if (playerB.dx < -playerA.dx){
                    playerA.x = playerB.x - playerA.width;
                    playerB.dx += playerA.acceleration * 2;
                    playerA.dx = playerB.dx;
                } else {
                    playerA.dx = 0;
                    playerB.dx = 0;
                }
            //if the players are not accelerating but still have momentum (They are sliding)
            } else if (!playerB.isAccelerating && !playerA.isAccelerating){
                //if player A is moving faster when the collision occurs then player B will move in player A's direction
                if(playerA.dx > -playerB.dx){
                    playerB.x = playerA.x + playerA.width;
                    playerB.dx = playerA.dx;
                //if player B is moving faster when the collision occurs then player A will move in player B's direction
                } else if (playerB.dx < -playerA.dx){
                    playerA.x = playerB.x - playerA.width;
                    playerA.dx = playerB.dx;
                }
            }
        /*The line that ensures the players do not overlap each other gave one of the players priority when it came to pushing one another 
            so this part cancels that out*/
        }
        

    }
    
}
function playerObstacleColisions1(playerA, obstacleB) {
    if (playerA.x + playerA.width >= obstacleB.x &&
        playerA.x <= obstacleB.x + obstacleB.width &&
        playerA.y + playerA.height >= obstacleB.y &&
        playerA.y <= obstacleB.y + obstacleB.height){
            removePlayer(playerA);
        }
}

// Global countdown variables
let countdown = 4;         // Countdown starts from 3 seconds (the 4th is "GO!")
let gameStarted = false;   // Flag to indicate if the game should start

// Countdown timer that decreases the countdown every 1 second
const countdownInterval = setInterval(() => {
  countdown--;
  if (countdown <= 0) {
    clearInterval(countdownInterval);
    gameStarted = true;  // Start the game when countdown is done
  }
}, 1000);

function countDownTimer(){
    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    // Display the countdown number or "GO!" when it reaches 0
    if (countdown > 1) {
        ctx.fillText(countdown - 1, canvas.width / 2, canvas.height / 2);
    } else {
        ctx.fillText("GO!", canvas.width / 2, canvas.height / 2);
    }
}






//This part gets messy, I create functions for each level
function level1(){
    
    const player1 = new Player(0, 0, player1Keys, "black");
    const player2 = new Player(50, 0, player2Keys, "red");
    const player3 = new Player(80, 0, player3Keys, "green");
    const player4 = new Player(110, 0, player4Keys, "purple");

    players.length = 0;
    players.push(player1, player2, player3, player4)
    players.forEach(player => {
        player.grounded = true;
    });
    
    player1.x = ((canvas.width) / 4) - 120;
    player1.y = 60;
    player2.x = ((canvas.width) / 2) - 120;
    player2.y = 60;
    player3.x = ((3 * canvas.width) / 4) - 120;
    player3.y = 60;
    player4.x = ((canvas.width)) - 120;
    player4.y = 60
    // Obstacle class (spawns on right, moves left)
    class Obstacle1 {
        constructor(x, y, width, height, speed) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speed = speed;
        }
    
        update() {
            this.x -= this.speed; // Move left
        }
    
        draw(ctx) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    // Array to hold obstacles
    let obstacle1s = [];
    
    let spawnRate = 0.005;
    let spawnRateDecrease = 0.00001; // Rate at which the spawn rate decreases
    
    
    // Function to spawn an obstacle with random size, position, and speed
    function spawnObstacle1() {
        
        const width = 25;
        const height = 10;
        
        const x = canvas.width; // Start from the right side
        const y = Math.random() * (canvas.height - height); // Random vertical position
        const speed = 3; // Random speed (1 to 3)
    
        obstacle1s.push(new Obstacle1(x, y, width, height, speed));
    }
    
    
    function gameLoop(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); /*Clears everything to allow new placement of objects*/
        
        // If the game hasn't started, display the countdown
        if (!gameStarted) {
            players.forEach(player => {
                player.draw(ctx);
            });
            countDownTimer();
        } else {
    
            // Check for collisions between players and obstacles
            players.forEach(player => {
                obstacle1s.forEach(obstacle1 => {
                    playerObstacleColisions1(player, obstacle1);
                });
            });
    
            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    // Apply collision detection once for each pair of players
                    playerCollisionsX(players[i], players[j]);
                }
            }
    
    
            spawnRate += spawnRateDecrease;
            if (Math.random() < spawnRate) spawnObstacle1(); // Randomly spawn obstacles
    
            obstacle1s.forEach(obstacle1 => {
                obstacle1.update();
                obstacle1.draw(ctx);
            });
    
            obstacle1s = obstacle1s.filter(obstacle1 => obstacle1.x + obstacle1.width > 0); // Remove off-screen obstacles
    
    
            players.forEach((player) => {
                player.move();
            });
    
            // Draw all players on the canvas
            players.forEach(player => {
                player.draw(ctx);
            });
            // Check if only one player is left
            if (players.length === 1) {
                // Display game over message
                ctx.fillStyle = "black";
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Game Over! " + players[0].color + " Wins!", canvas.width / 2, canvas.height / 2);

                setTimeout(() => {
                    level2();
                }, 3000);
                return;
            }
        }
            requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

function startCountdown(callback) {
    // Reset the countdown variables for the new level
    countdown = 4;
    gameStarted = false;
    
    const newCountdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(newCountdownInterval);
        gameStarted = true;  // Start the game when countdown ends
        if (typeof callback === "function") {
          callback();
        }
      }
    }, 1000);
  }
  

function level2(){

    const player1 = new Player(0, 0, player1Keys, "black");
    const player2 = new Player(50, 0, player2Keys, "red");
    const player3 = new Player(80, 0, player3Keys, "green");
    const player4 = new Player(110, 0, player4Keys, "purple");

    players.length = 0;
    players.push(player1, player2, player3, player4)
        
    player1.x = ((canvas.width) / 4) - 120;
    player1.y = 60;
    player2.x = ((canvas.width) / 4) - 120;
    player2.y = (3 * canvas.height / 4) - 50;
    player3.x = ((canvas.width)) - 120;
    player3.y = (3 * canvas.height / 4) - 50;
    player4.x = ((canvas.width)) - 120;
    player4.y = 60

    players.forEach(player => {
        player.jumpStength = 8;
        player.gravity = 0.25;
    });

    startCountdown();

    class Platform {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        draw(ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    // Array to hold platforms
    // Array to hold platforms
    let platforms = [];

    // Function to create and add platforms to the platforms array
    function createPlatforms() {
        //platform(x, y, width, height)
        platforms.push(new Platform(0, 400, 200, 20));
        platforms.push(new Platform(300, 300, 200, 20));
        platforms.push(new Platform(600, 200, 200, 20));
        platforms.push(new Platform(600, 400, 200, 20));
        platforms.push(new Platform(0, 200, 200, 20));
    }


    function playerPlatformCollisions(player, platform) {
        // Check if the player is above the platform and falling
        if (player.dy > 0 &&
            player.y + player.height <= platform.y &&
            player.y + player.height + player.dy >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            // Place the player on the platform
            player.y = platform.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    }

    // Call the function to create platforms
    createPlatforms();

    // Obstacle class (spawns on right, moves left)
    class Obstacle1 {
        constructor(x, y, width, height, speed) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speed = speed;
        }

        update() {
            this.y += this.speed; 
        }

        draw(ctx) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Array to hold obstacles
    let obstacle1s = [];

    let spawnRate = 0.003;
    let spawnRateDecrease = 0.00000001; // Rate at which the spawn rate decreases


    // Function to spawn an obstacle with random size, position, and speed
    function spawnObstacle1() {
        
        const minWidth = 10;
        const maxWidth = canvas.width / 4;
        const minHeight = canvas.height;
        const maxHeight = canvas.height * 2;

        const width = Math.random() * (maxWidth - minWidth) + minWidth;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        
        const y = -height; // Start from the right side
        const x = Math.random() * (canvas.width - width); 
        const speed = 1;

        obstacle1s.push(new Obstacle1(x, y, width, height, speed));
    }



    function gameLoop(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); /*Clears everything to allow new placement of objects*/
        
        // If the game hasn't started, display the countdown
        if (!gameStarted) {
            // Draw platforms
            platforms.forEach(platform => {
                platform.draw(ctx);
            });
            // Draw all players on the canvas
            players.forEach(player => {
                player.draw(ctx);
            });
            countDownTimer();
        } else {

            // Check for collisions between players and platforms
            players.forEach(player => {
                player.grounded = false; // Reset grounded state
                platforms.forEach(platform => {
                    playerPlatformCollisions(player, platform);
                });
            });

            // Check for collisions between players and obstacles
            players.forEach(player => {
                obstacle1s.forEach(obstacle1 => {
                    playerObstacleColisions1(player, obstacle1);
                });
            });

            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    // Apply collision detection once for each pair of players
                    playerCollisionsX(players[i], players[j]);
                }
            }


            players.forEach((player) => {
                player.move();
            });

            

            // Draw platforms
            platforms.forEach(platform => {
                platform.draw(ctx);
            });

            spawnRate += spawnRateDecrease;
            if (Math.random() < spawnRate) spawnObstacle1(); // Randomly spawn obstacles

            obstacle1s.forEach(obstacle1 => {
                obstacle1.update();
                obstacle1.draw(ctx);
            });

            obstacle1s = obstacle1s.filter(obstacle1 => obstacle1.y < canvas.height > 0); // Remove off-screen obstacles


            // Draw all players on the canvas
            players.forEach(player => {
                player.draw(ctx);
            });
            // Check if only one player is left
            if (players.length === 1) {
                // Display game over message
                ctx.fillStyle = "black";
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Game Over! " + players[0].color + " Wins!", canvas.width / 2, canvas.height / 2);

                setTimeout(() => {
                    level3();
                }, 3000);
                return;
            }
        }
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}


function startCountdown(callback) {
    // Reset the countdown variables for the new level
    countdown = 4;
    gameStarted = false;

    const newCountdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
        clearInterval(newCountdownInterval);
        gameStarted = true;  // Start the game when countdown ends
        if (typeof callback === "function") {
            callback();
        }
        }
}, 1000);
}

function level3(){
    
    const player1 = new Player(0, 0, player1Keys, "black");
    const player2 = new Player(50, 0, player2Keys, "red");
    const player3 = new Player(80, 0, player3Keys, "green");
    const player4 = new Player(110, 0, player4Keys, "purple");

    players.length = 0;
    players.push(player1, player2, player3, player4)

    player1.x = ((canvas.width) / 4) - 120;
    player1.y = 60;
    player2.x = ((canvas.width) / 4) + 40;
    player2.y = (3 * canvas.height / 4) - 80;
    player3.x = ((canvas.width)) - 300;
    player3.y = (3 * canvas.height / 4) - 80;
    player4.x = ((canvas.width)) - 120;
    player4.y = 60;

    startCountdown();
    
    players.forEach(player => {
        player.grounded = true;
    });
    
    class Obstacle1 {
        constructor(x, y, width, height, speedy, speedx) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.speedy = speedy;
            this.speedx = speedx;
        }
    
        update() {
            this.y += this.speedy; 
            this.x += this.speedx;
        }
    
        draw(ctx) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    // Array to hold obstacles
    let obstacle1s = [];
    
    function spawnObstacle1() {
        
        const width = canvas.width;
        const height = canvas.height;
    //Obstacle1(x, y, width, height, speedy, speedx)
        obstacle1s.push(new Obstacle1(0, -height, width, height, 0.025, 0));
        obstacle1s.push(new Obstacle1(0, height, width, height, -0.025, 0));
        obstacle1s.push(new Obstacle1(-width, 0, width, height, 0, 0.05));
        obstacle1s.push(new Obstacle1(width, 0, width, height, 0, -0.05));
    
    }
    
    
    
    function gameLoop(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); /*Clears everything to allow new placement of objects*/
        
        
        // If the game hasn't started, display the countdown
        if (!gameStarted) {
            players.forEach(player => {
                player.draw(ctx);
            });
            countDownTimer();
        } else {
            spawnObstacle1();
            obstacle1s.forEach(obstacle1 => {
                obstacle1.update();
                obstacle1.draw(ctx);
            });
    
            // Check for collisions between players and obstacles
            players.forEach(player => {
                obstacle1s.forEach(obstacle1 => {
                    playerObstacleColisions1(player, obstacle1);
                });
            });
            
    
            for (let i = 0; i < players.length; i++) {
                for (let j = i + 1; j < players.length; j++) {
                    // Apply collision detection once for each pair of players
                    playerCollisionsX(players[i], players[j]);
                }
            }
    
    
    
    
            players.forEach((player) => {
                player.move();
            });
    
            // Draw all players on the canvas
            players.forEach(player => {
                player.draw(ctx);
            });
            // Check if only one player is left
            if (players.length === 1) {
                // Display game over message
                ctx.fillStyle = "black";
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Game Over! " + players[0].color + " Wins!", canvas.width / 2, canvas.height / 2);

                setTimeout(() => {
                    level1();
                }, 3000);
                return;
            }
            
        }
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}




level1();

