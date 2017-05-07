zombieFrenzy.screens["screen-game"] = (function() {
	var firstRun = true, paused;
	var dom = zombieFrenzy.dom;
	var overlay = dom.$("#screen-game .pause-overlay")[0];
	var game;


	function setup() {
		dom.bind("footer button.exit" , "click", exitGame);
		dom.bind("footer button.pause" , "click", pauseGame);
		dom.bind(".pause-overlay" , "click", resumeGame);
	}

	function startGame() {
			/* TODO
	- add animations
	    - player melee
	- pickups 
	    - weapons
	- add nextWaveTimerText
	- add sounds
		- gun shot
		- player damage
		- zombie death
		- player death
		- pickups
		- music
		- zombie grunts?
		- player grunts?
	 */
	 	// Game Stuff
	 	game = new Phaser.Game(1000, 800, Phaser.AUTO, 'game-canvas', { preload: preload, create: create, update: update });
		var isGameOver = false;
		var gameOverTimer = 10000;

	    // Wave Stuff
	    var wave = 1;
	    var nextWaveTimer = 3000;
	    var maxNextWaveTimer = 3000; 
		var startNextWave = false;

	    // Player Stuff
	    var player;
	    var score = 0;
	    var health = 100;
	    var maxHealth = 100;
	    var playerMoveSpeed = 150;
	    var invulnerable = false;
	    var invulnerableTimer = 2000;
	    var maxInvulnerableTimer = 2000;
	    var shoot = false;

	    // Particle Stuff
	    var emitters;
	    var emitter;

	    // Enemy Stuff
	    var zombies;
	    var zombieSpeedRange = {min:20, max:50};
	    var spawnX = 0, spawnY = 0;
	    var numZombies = 20;
	    var maxNumZombies = 100;
	    var numZombiesAlive = 20;
	    var zombieSpeed = 50;
	    var maxZombieSpeed = 100;

	    // Environment Stuff
	    var walls;

	    // Pickups
	    var pickups;
	    var pickup;
	    var healthPickup;
	    var healthPickupVal = 20;
	    var ammoPickup;
	    var ammoPickupVal = 400;

	    // Weapon Stuff
	    var spawnExtraAmmo = false;
	    var ammo = 1000;
	    var maxAmmo = 1000;
	    var bullets;
	    var bulletTime = 0;
	    var fireRate = 50;
	    var bulletSpeed = 500;
	    var bullet;

	    // HUD Stuff
	    var scoreText;
	    var healthText;
	    var waveText;
	    var numZombieText;
	    var ammoText;
	    var gameOverText;

	    // Input Stuff
	    var cursors;
	    var W_Key;
	    var A_Key;
	    var S_Key;
	    var D_Key;
	    var pointing;

	    // Sounds
	    var bloodSfx
	    var ammoPickupSfx;
	    var healthPickupSfx;
	    var music;
	    var gunSfx;
	    var gameOverSfx;

	    function preload() {
	    	game.load.image('grass', 'images/grass.png');
	        game.load.image('blood', 'images/blood.png');
	        game.load.image('zombieBlood', 'images/zombieblood.png');
	        game.load.image('pickupSparkle', 'images/pickupsparkle.png');
	        game.load.image('ammoPickup', 'images/ammopickup.png');
	        game.load.image('healthPickup', 'images/healthpickup.png');
	        game.load.image('wallH', 'images/wallH.png');
	        game.load.image('wallV', 'images/wallV.png');
	        game.load.image('bullet', 'images/bullet.png');
	        game.load.spritesheet('zombie', 'images/zombie.png', 34.69, 35); //TODO: Need to redo the sprite sheet better
	        game.load.spritesheet('player', 'images/player.png', 42, 25);
	        game.load.audio('bloodSquirt', 'audio/blood.ogg');
	        game.load.audio('ammoPickup', 'audio/ammo.ogg');
	        game.load.audio('gameOverSound', 'audio/gameOver.ogg');
	        game.load.audio('gunShot', 'audio/gun.wav');
	        game.load.audio('healthPickup', 'audio/health.ogg');
	        game.load.audio('backgroundMusic', 'audio/JungleFrentic.mp3');
	    }

	    function create() {
	    	// Audio
	    	bloodSfx = game.add.audio('bloodSquirt');
	    	bloodSfx.allowMultiple = true;
	    	ammoPickupSfx = game.add.audio('ammoPickup');
	    	healthPickupSfx = game.add.audio('healthPickup');
	    	music = game.add.audio('backgroundMusic');
	    	gunSfx = game.add.audio('gunShot');
	    	gunSfx.allowMultiple = true;
	    	gameOverSfx = game.add.audio('gameOverSound');
	    	bloodSfx.addMarker('bloodSquirt', 0, 1, 0.2);
	    	ammoPickupSfx.addMarker('ammoPickup', 0, 1, 1);
	    	healthPickupSfx.addMarker('healthPickup', 0, 1, 1);
	    	music.addMarker('backgroundMusic', 0, 360, 0.3, true);
	    	gunSfx.addMarker('gunShot', 0, 1, 0.1);
	    	gameOverSfx.addMarker('gameOverSound', 0, 1, 0.5);

	    	music.play("backgroundMusic");

	        //  Grass
	        game.add.sprite(0, 0, 'grass');

	        // Walls
	        walls = game.add.group();
	        walls.enableBody = true;
	        var wall = walls.create(700, 400, 'wallH');
	        wall.body.immovable = true;
	        wall = walls.create(150, 650, 'wallH');
	        wall.body.immovable = true;
	        wall = walls.create(400, 50, 'wallV');
	        wall.body.immovable = true;

	        // Set bullet properties
	        bullets = game.add.physicsGroup();
	        bullets.createMultiple(32, 'bullet', false);
	        bullets.setAll('checkWorldBounds', true);
	        bullets.setAll('outOfBoundsKill', true);

	        // Pickups
	        pickups = game.add.group();
	        pickups.enableBody = true;

	         // Player
	        player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
	        player.anchor.setTo(0.5, 0.5);
	        game.physics.arcade.enable(player);
	        player.body.collideWorldBounds = true;

	        //  Player animations
	        player.animations.add('walk', [0, 1, 2, 3, 4, 5, 6], 10, true);
	        player.animations.add('shoot', [7, 8, 9], 10, false);
	        player.animations.add('melee', [10, 11], 10, false);

	        // Zombies
	        zombies = game.add.group();
	        zombies.enableBody = true;

	        createEnemies();

	        // Particles
	        emitters = game.add.group();

	        // Enable the Arcade Physics system
	        game.physics.startSystem(Phaser.Physics.ARCADE);

	        // HUD stuff
	        scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });   
	        healthText = game.add.text(16, 48, 'Health: 100', { fontSize: '32px', fill: '#000' }); 
	        ammoText = game.add.text(16, 80, 'Ammo: 1000', { fontSize: '32px', fill: '#000' }); 
	        numZombieText = game.add.text(16, 112, 'Zombies: 20', { fontSize: '32px', fill: '#000' });   
	        waveText = game.add.text(16, 144, 'Wave: 1', { fontSize: '32px', fill: '#000' });


	        // Set input variables
	        pointing = game.input.activePointer;
	        cursors = game.input.keyboard.createCursorKeys();
	        W_Key = game.input.keyboard.addKey(Phaser.Keyboard.W);
	        A_Key = game.input.keyboard.addKey(Phaser.Keyboard.A);
	        S_Key = game.input.keyboard.addKey(Phaser.Keyboard.S);
	        D_Key = game.input.keyboard.addKey(Phaser.Keyboard.D);
	    }

	    function update() {
	        if(!isGameOver && !paused) {

	            updateCollision();

	            updateInvulnerability();

	            updateInput();

	            updateAmmo();

	            updateHealth();

	            updateEnemies();  
	        }

	        if(paused) {
	        	pause();
	        }

	        if(numZombiesAlive <= 0) {
	            nextWave();
	        }

	        if(health <= 0) {
	            gameOver();
	            gameOverTimer -= game.time.elapsed;
	            if(gameOverTimer <= 0) {
					game.destroy();
	        		zombieFrenzy.showScreen("screen-menu");
	            }
	        }

	        if(startNextWave) {	        	
		        nextWaveTimer -= game.time.elapsed;
		        if(nextWaveTimer <= 2000) {
		        	emitters.destroy(true, true);
		        }
		        if(nextWaveTimer <= 0) {
			        createEnemies();
			        wave++;
			        waveText.text = 'Wave: ' + wave;  
			        numZombieText.text = 'Zombies: ' + numZombiesAlive;	  
			        startNextWave = false;    
			        nextWaveTimer = maxNextWaveTimer;  	
		        }
	        }
	    } 

	    function pause() {
        	player.body.velocity.x = 0;
        	player.body.velocity.y = 0;
        	zombies.forEachAlive(function(zombie){	           
	            zombie.body.velocity.x = 0;
	            zombie.body.velocity.y = 0;
	        });    	
	    }

	    function gameOver() {
        	if(!isGameOver) {
    			gameOverSfx.play("gameOverSound");
        	}
	        gameOverText = game.add.text(game.world.centerX - 200, game.world.centerY, "GAME OVER!!!", { fontSize: '64px', fill: '#000' });
	        isGameOver = true;
	    }   

	    function nextWave() {
	    	if(zombieSpeed >= maxZombieSpeed && numZombies >= maxNumZombies) {
            	maxNumZombies += 50;
            	maxZombieSpeed += 50;
            }
	        if(numZombies < maxNumZombies) {
	            numZombies += 10;
	        } else if(zombieSpeed < maxZombieSpeed) {
	            zombieSpeed += 10;
	        }  

	        pickups.destroy(true, true);    
	        if(health < 20) {
	        	var pickup = pickups.create(game.world.randomX, game.world.randomY, 'healthPickup');
	        	pickup.data = 0;
	        }
	        if(ammo < 100) {
	        	var pickup = pickups.create(game.world.randomX, game.world.randomY, 'ammoPickup');
	    		pickup.data = 1;
	        }

	        numZombiesAlive = numZombies;

	        spawnExtraAmmo = false;

	        startNextWave = true;
	    }

	    function updateInvulnerability() {
	        if(invulnerable) {
	            invulnerableTimer -= game.time.elapsed;
	            if(invulnerableTimer <= 0) {
	                invulnerable = false;
	                invulnerableTimer = maxInvulnerableTimer;
	            }
	        }
	    }

	    function updateHealth() {
	    	if(health >= maxHealth) {
	    		health = maxHealth;
	    	}	    		
	    }

	    function updateAmmo() {
	    	if(ammo >= maxAmmo) {
	    		ammo = maxAmmo;
	    	}
	    	if(!spawnExtraAmmo) {
		    	if(ammo <= 0) {
		    		var pickup = pickups.create(game.world.randomX, game.world.randomY, 'ammoPickup');
		    		pickup.data = 1;
		    		spawnExtraAmmo = true;
		    	}	    		
	    	}
	    }

	    function updateCollision() {
	        game.physics.arcade.collide(player, walls);
	        game.physics.arcade.collide(zombies, walls);        
	        game.physics.arcade.collide(zombies, zombies);
	        game.physics.arcade.overlap(bullets, zombies, killZombieWithRifle, null, this);
	        game.physics.arcade.overlap(bullets, walls, destroyBullet, null, this);
	        game.physics.arcade.overlap(player, zombies, takeDameage, null, this);
	        game.physics.arcade.overlap(player, pickups, collectPickup, null, this);
	    }

	    function updateInput() {
	        player.body.velocity.x = 0;
	        player.body.velocity.y = 0;
	        player.rotation = game.math.angleBetweenPoints(pointing.position, player.position) - (Math.PI * 1);

	        if(pointing.isDown || cursors.right.isDown || A_Key.isDown || cursors.right.isDown || D_Key.isDown || cursors.up.isDown || W_Key.isDown || cursors.down.isDown || S_Key.isDown) {
	            
	            // Mouse Button (LMB)
	            if(pointing.isDown && ammo > 0) {
	                player.animations.play('shoot');
	                fireBullet();
	                shoot = true;
	            } else {
	                shoot = false;
	            }

	            // Keyboard Input (WASD) (Arrows)
	            if (cursors.right.isDown || A_Key.isDown) {
	                //  Move to the left
	                player.body.velocity.x = -playerMoveSpeed;
	                if(shoot) {
	                    player.animations.play('shoot');
	                } else {
	                    player.animations.play('walk');
	                }	            }
	            if (cursors.right.isDown || D_Key.isDown) {
	                //  Move to the right
	                player.body.velocity.x = playerMoveSpeed;
	                if(shoot) {
	                    player.animations.play('shoot');
	                } else {
	                    player.animations.play('walk');
	                }
	            }
	            if (cursors.up.isDown || W_Key.isDown) {
	                //  Move to the right
	                player.body.velocity.y = -playerMoveSpeed;
	                if(shoot) {
	                    player.animations.play('shoot');
	                } else {
	                    player.animations.play('walk');
	                }
	            }
	            if (cursors.down.isDown || S_Key.isDown) {
	                //  Move to the right
	                player.body.velocity.y = playerMoveSpeed;
	                if(shoot) {
	                    player.animations.play('shoot');
	                } else {
	                    player.animations.play('walk');
	                }
	            } 
	        } else {
	            // Stand still
	            player.animations.stop();
	            player.frame = 0;
	        }
	    }

	    function updateEnemies() {
	        zombies.forEachAlive(function(zombie){
	            zombie.animations.play('walk');
	            zombie.rotation = game.math.angleBetweenPoints(zombie.position, player.position);	           
	            zombie.body.velocity.x = Math.cos(zombie.rotation) * zombie.data;
	            zombie.body.velocity.y = Math.sin(zombie.rotation) * zombie.data;
	        });
	    }

	    function createEnemies() {
	        for (var i = 0; i < numZombies; i++) {
	            var rand = game.rnd.integerInRange(0, 3);
	            setRandomPositionOffScreen(rand);
	            var zombie = zombies.create(spawnX, spawnY, 'zombie');
	            zombie.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
	            zombie.anchor.setTo(0.5, 0.5);
	            zombie.data = game.rnd.integerInRange((zombieSpeed - zombieSpeedRange.min), (zombieSpeed + zombieSpeedRange.max));
	        }
	    }

	    function setRandomPositionOffScreen(rand) {
	        switch(rand) {
	            case 0:
	                // Spawn random on left
	                spawnX = (game.world.centerX) - (game.world.width / 2);
	                spawnY = game.rnd.integerInRange(0, game.world.height);
	            break;

	            case 1:
	                // Spawn random on right
	                spawnX = (game.world.centerX) + (game.world.width / 2);
	                spawnY = game.rnd.integerInRange(0, game.world.height);
	            break;

	            case 2:
	                // Spawn random on top
	                spawnY = (game.world.centerY) - (game.world.height / 2);
	                spawnX = game.rnd.integerInRange(0, game.world.width);
	            break;

	            case 3:
	                // Spawn random on bottom
	                spawnY = (game.world.centerY) + (game.world.height / 2);
	                spawnX = game.rnd.integerInRange(0, game.world.width);
	            break;

	            default:
	            break;
	        }
	    }

	    function takeDameage(player) {
	        if(!invulnerable) {
	        	emitter = game.add.emitter(player.x, player.y);
		    	emitters.add(emitter);
		        emitter.minParticleScale = 0.5;
		        emitter.maxParticleScale = 2;
		        emitter.setSize(player.width, player.height);
		        emitter.makeParticles("blood");
		        emitter.gravity.y = 0;
		        emitter.explode(500, 50);
	            health -= 10;
	            healthText.text = 'Health: ' + health;  
	            invulnerable = true;          
	        }
	    }

	    function destroyBullet(bullet) {
	        bullet.kill();
	    }

	    function collectPickup(player, pickup) {
	    	if(pickup.data == 0) {
		        score += 20;
		        scoreText.text = 'Score: ' + score;  
	    		healthPickupSfx.play("healthPickup");
	    		emitter = game.add.emitter(pickup.x, pickup.y);
		    	emitters.add(emitter);
		        emitter.minParticleScale = 0.5;
		        emitter.maxParticleScale = 2;
		        emitter.setSize(pickup.width, pickup.height);
		        emitter.makeParticles("pickupSparkle");
		        emitter.gravity.y = 0;
		        emitter.explode(500, 50);
	    		health += healthPickupVal;
	    		pickup.destroy();
	            healthText.text = 'Health: ' + health; 
	    	} else if(pickup.data == 1) {
		        score += 20;
		        scoreText.text = 'Score: ' + score; 
	    		ammoPickupSfx.play("ammoPickup");
	    		emitter = game.add.emitter(pickup.x, pickup.y);
		    	emitters.add(emitter);
		        emitter.minParticleScale = 0.5;
		        emitter.maxParticleScale = 2;
		        emitter.setSize(pickup.width, pickup.height);
		        emitter.makeParticles("pickupSparkle");
		        emitter.gravity.y = 0;
		        emitter.explode(500, 50);
	    		ammo += ammoPickupVal;
	    		pickup.destroy();	    		
	            ammoText.text = 'Ammo: ' + ammo; 
	    	}
	    }

	    function fireBullet () {
	        if ((game.time.time - fireRate) > bulletTime) {
	            bullet = bullets.getFirstExists(false);
	            if (bullet) {
	    			gunSfx.play("gunShot");
	                bullet.reset(player.x, player.y);
	                bullet.rotation = player.rotation;
	                bullet.body.velocity.x = Math.cos(bullet.rotation) * bulletSpeed;
	                bullet.body.velocity.y = Math.sin(bullet.rotation) * bulletSpeed;
	                bulletTime = game.time.time + 100;
	                ammo -= 1;
	                ammoText.text = 'Ammo: ' + ammo; 
	            }
	        }
	    }

	    function killZombieWithRifle(bullet, zombie) {
	    	bloodSfx.play("bloodSquirt");
	        emitter = game.add.emitter(bullet.x, bullet.y);
	    	emitters.add(emitter);
	        emitter.minParticleScale = 0.5;
	        emitter.maxParticleScale = 2;
	        emitter.setSize(zombie.width, zombie.height);
	        emitter.makeParticles("zombieBlood");
	        emitter.gravity.y = 0;
	        emitter.explode(500, 50);
	        zombie.kill();
	        bullet.kill();
	        numZombiesAlive--;
	        score += 10;
	        scoreText.text = 'Score: ' + score;  
	        numZombieText.text = 'Zombies: ' + numZombiesAlive; 
	    }
		paused = false;		
		overlay.style.display = "none"; 
	}

	function exitGame() {
		pauseGame();
		var confirmed = window.confirm("Do you want to return to the main menu?");
		if(confirmed) {
			zombieFrenzy.showScreen("screen-menu");
			game.destroy();
		} else {
			resumeGame();
		}
	}

	function pauseGame() {
		if(paused) {
			return;
		} 
		overlay.style.display = "block"; 
		paused = true;
	}

	function resumeGame() {
		overlay.style.display = "none"; 
		paused = false;
	}

	function run() {
		if(firstRun) {
			setup();
			firstRun = false;
		}
		startGame();
	}

	return {
		run: run
	};
})();