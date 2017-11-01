'use strict';

let playerBulletSpeed = 400;
let playerBulletDelay = 200;
let aliens;
let bullets;
let bulletTime = 0;
let cursors;
let fireButton;
let explosions;
let starField;
let score = 0;
let scoreString = '';
let scoreText;
let lives;
let rockets;
let rocketBoomDist = 100;
let waves;
let stateText;
let gameWidth = 800;
let gameHeight = 600;
let speedOfRocket = 120;
let speedOfWave = 200;
let playerSpeed = 200;
let fireDelay = 2000;
let alienSpeed = 12000;
let enemySpawnDelay = 80;
let scoreToWin = 800;

let playerOne, invader;

let game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'root', {
    preload: preload,
    create: create,
    update: update
});

class Player {
    constructor(img) {
        this.unit = game.add.sprite(400, 500, img);
        this.unit.anchor.setTo(0.5, 0.5);
        this.unit.angle = 180;
        game.physics.enable(this.unit, Phaser.Physics.ARCADE);
    }
    playerControls() {
        if (this.unit.alive) {
            this.unit.body.velocity.setTo(0, 0);

            if (cursors.left.isDown && (this.unit.x > 20)) {

                this.unit.body.velocity.x = -playerSpeed;
            }
            if (cursors.right.isDown && (this.unit.x < game.world.width - 20)) {
                this.unit.body.velocity.x = playerSpeed;
            }
            if (cursors.up.isDown && (this.unit.y > 0)) {
                this.unit.body.velocity.y = -playerSpeed;
            }
            if (cursors.down.isDown && (this.unit.y < game.world.height - 30)) {
                this.unit.body.velocity.y = playerSpeed;
            }
        }
    }
    fireBullet(bullets) {
        if (game.time.now > bulletTime && fireButton.isDown) {
            let bullet = bullets.getFirstExists(false);

            if (bullet) {
                bullet.reset(this.unit.x, this.unit.y + 8);
                bullet.body.velocity.y = -playerBulletSpeed;
                bulletTime = game.time.now + playerBulletDelay;
            }
        }
    }
}

class Enemy {
    constructor() {
        this.unit = game.add.group();
        this.unit.enableBody = true;
        this.unit.physicsBodyType = Phaser.Physics.ARCADE;
        this.unit.setAll('outOfBoundsKill', true);
        this.unit.setAll('checkWorldBounds', true);
    }
    createEnemy(img) {
        let alien = this.unit.create(game.rnd.integerInRange(0, gameWidth), 10, img);

        alien.firingTimer = 0;
        game.add.tween(alien).to( { y: gameHeight + 10 }, alienSpeed, Phaser.Easing.Linear.None, true, 0, 1000, false );
        return alien;
    }
    enemyFire (bullets) {
        this.unit.forEachAlive(function (item) {
            let bullet = bullets.getFirstExists(false);

            if (game.time.now > item.firingTimer) {
                    bullet.reset(item.body.x, item.body.y);
                    game.physics.arcade.moveToObject(bullet, playerOne.unit, speedOfRocket);
                    item.firingTimer = game.time.now + fireDelay;
            }
            if (item.y > gameHeight) {
                item.kill();
                gameOwer();
            }
        });
    }
}

class simpleEnemy extends Enemy {
    createEnemy(img , ancX, ancY) {
        let alien = super.createEnemy(img);
        let alienWalkOnX = alien.x + 50;
        alien.anchor.setTo(ancX, ancY);
        alien.body.moves = false;
        game.add.tween(alien).to( { x: alienWalkOnX }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    }
}

function preload() {
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('ship', 'assets/playerN.png');
    game.load.image('invader', 'assets/invader.png');
    game.load.image('rocketEnemy', 'assets/rocketEnemy.png');
    game.load.image('rocket', 'assets/rocket.png');
    game.load.image('waveEnemy', 'assets/waveEnemy.png');
    game.load.image('wave', 'assets/wave.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starField', 'assets/starField.jpg');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    starField = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'starField');

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    rockets = game.add.group();
    rockets.enableBody = true;
    rockets.physicsBodyType = Phaser.Physics.ARCADE;
    rockets.createMultiple(30, 'rocket');
    rockets.setAll('anchor.x', 0.1);
    rockets.setAll('anchor.y', -0.5);
    rockets.setAll('outOfBoundsKill', true);
    rockets.setAll('checkWorldBounds', true);

    waves = game.add.group();
    waves.enableBody = true;
    waves.physicsBodyType = Phaser.Physics.ARCADE;
    waves.createMultiple(30, 'wave');
    waves.setAll('anchor.x', 0.15);
    waves.setAll('anchor.y', -4);
    waves.setAll('outOfBoundsKill', true);
    waves.setAll('checkWorldBounds', true);

    playerOne = new Player('ship');
    invader = new simpleEnemy();

    scoreString = 'Score : ';
    scoreText = game.add.text(10, 0, scoreString + score, { font: '34px Arial', fill: '#6eff60' });

    lives = game.add.group();
    game.add.text(game.world.width - 100, 0, 'Lives : ', { font: '34px Arial', fill: '#6eff60' });

    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#6eff60' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (let i = 0; i < 3; i++)
    {
        let live = lives.create(game.world.width - 80 + (30 * i), 70, 'ship');
        live.anchor.setTo(0.5, 0.5);
        live.angle = 90;
        live.alpha = 0.4;
    }

    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

/*function createAliens () {
    let rnd = game.rnd.integerInRange(0, 25);

    if (rnd >= 0 && rnd < 10) {
        let alienR = aliens.create(game.rnd.integerInRange(0, gameWidth), 10, 'rocketEnemy');

        alienR.anchor.setTo(0.5, 0.5);
        alienR.body.moves = false;
        game.add.tween(alienR).to( { y: gameHeight + 10 }, alienSpeed, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }
    else if (rnd >= 10 && rnd <= 12) {
        let alienW = aliens.create(game.rnd.integerInRange(0, gameWidth), 10, 'waveEnemy');

        alienW.anchor.setTo(0.5, 0.5);
        alienW.body.moves = false;
        game.add.tween(alienW).to( { y: gameHeight + 10 }, alienSpeed, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }else{
        let alien = aliens.create(game.rnd.integerInRange(0, gameWidth), 10, 'invader');
        let alienWalkOnX = alien.x + 50;

        alien.anchor.setTo(0.5, 0.5);
        alien.body.moves = false;
        game.add.tween(alien).to( { x: alienWalkOnX }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(alien).to( { y: gameHeight + 10 }, alienSpeed, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }
}*/

function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

function update() {
    if (game.rnd.integerInRange(0, enemySpawnDelay) === 5) {
        invader.createEnemy('invader', 0.5, 0.5);
    }

    starField.tilePosition.y += 2;

    playerOne.playerControls();
    playerOne.fireBullet(bullets);

    game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
    game.physics.arcade.overlap(rockets, playerOne.unit, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(waves, playerOne.unit, enemyHitsPlayer, null, this);
    game.physics.arcade.overlap(aliens, playerOne.unit, enemyHitsPlayer, null, this);

/*    aliens.forEachAlive(function (item) {
        if (item.y > gameHeight) {
            item.kill();
            gameOwer();
        }
    });*/

    rockets.forEachAlive(function (item) {
        if (game.physics.arcade.distanceBetween (playerOne.unit, item) < rocketBoomDist) {
            explosion(item);
            item.kill();
            gameOwer();
        }
    });
}

function collisionHandler (bullet, alien) {
    bullet.kill();
    alien.kill();
    score += 20;
    scoreText.text = scoreString + score;
    explosion(alien);

    if (aliens.countLiving() === 0 && score > scoreToWin) {
        score += 1000;
        scoreText.text = scoreString + score;
        rockets.callAll('kill',this);
        waves.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
    }
}

function enemyHitsPlayer (player,bullet) {
    bullet.kill();
    gameOwer();
    explosion(player);
}

/*function enemyFires () {
    let rocket = rockets.getFirstExists(false);
    let wave = waves.getFirstExists(false);

    aliens.forEachAlive(function(item){
        switch (item.key) {
            case 'rocketEnemy':
                rocket.reset(item.body.x, item.body.y);
                game.physics.arcade.moveToObject(rocket,playerOne.unit,speedOfRocket);
                break;
            case 'waveEnemy':
                wave.reset(item.body.x, item.body.y);
                game.physics.arcade.moveToXY(wave, item.body.x, gameHeight, speedOfWave);
        }
        firingTimer = game.time.now + fireDelay;
    });
}*/

function gameOwer() {
    let live = lives.getFirstAlive(true);

    if (live) live.kill();

    if (lives.countLiving() < 1) {
        if (playerOne.unit.alive) explosion(playerOne.unit);
        playerOne.unit.kill();
        //rockets.callAll('kill');
        //waves.callAll('kill');
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart, this);
    }
}

function explosion (item) {
    let boom = explosions.getFirstExists(false);

    boom.reset(item.body.x, item.body.y);
    boom.play('kaboom', 30, false, true);
}

function restart () {
    lives.callAll('revive');
    aliens.removeAll();
    createAliens();
    playerOne.unit.revive();
    stateText.visible = false;
    score = 0;
    scoreText.text = scoreString + score;
}