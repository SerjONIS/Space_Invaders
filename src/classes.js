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

            if (cursors.left.isDown && (this.unit.x > PLAYER_SCREEN_BOUNDS)) {

                this.unit.body.velocity.x = -PLAYER_SPEED;
            }
            if (cursors.right.isDown && (this.unit.x < game.world.width - PLAYER_SCREEN_BOUNDS)) {
                this.unit.body.velocity.x = PLAYER_SPEED;
            }
            if (cursors.up.isDown && (this.unit.y > 0)) {
                this.unit.body.velocity.y = -PLAYER_SPEED;
            }
            if (cursors.down.isDown && (this.unit.y < game.world.height - PLAYER_SCREEN_BOUNDS)) {
                this.unit.body.velocity.y = PLAYER_SPEED;
            }
        }
    }
    fireBullet(bullets) {
        let bullet = bullets.unit.getFirstExists(false);
        if (game.time.now > bulletTime && fireButton.isDown) {

            if (bullet) {
                bullet.reset(this.unit.x, this.unit.y);
                bullet.body.velocity.y = -PLAYER_BULLETS_SPEED;
                bulletTime = game.time.now + PLAYER_BULLET_DELAY;
            }
        }
    }
}

class Enemy {
    constructor(img) {
        this.unit = game.add.group();
        this.unit.enableBody = true;
        this.unit.physicsBodyType = Phaser.Physics.ARCADE;
        this.unit.setAll('outOfBoundsKill', true);
        this.unit.setAll('checkWorldBounds', true);
        this.img = img;
    }
    create(walk = 0) {
        let alien = this.unit.create(game.rnd.integerInRange(0, gameWidth), ENEMY_SPAWN_HEIGHT, this.img);

        alien.anchor.setTo(0.5, 0.5);
        alien.body.moves = false;
        alien.firingTimer = game.time.now;
        let alienWalkOnX = alien.x + walk;
        game.add.tween(alien).to( { x: alienWalkOnX }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(alien).to( { y: gameHeight + ENEMY_SPAWN_HEIGHT }, ALIEN_SPEED, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }
    fire(bullets) {
        let bullet = bullets.unit.getFirstExists(false);
        this.unit.forEachAlive(function (item) {
            if (game.time.now > item.firingTimer) {
                bullet.reset(item.body.x, item.body.y);
                bullets.fly(bullet, item);
                item.firingTimer = game.time.now + FIRE_DELAY;
            }
        });
    }
}

class Ammo {
    constructor(img, ancX, ancY) {
        this.unit = game.add.group();
        this.unit.enableBody = true;
        this.unit.physicsBodyType = Phaser.Physics.ARCADE;
        this.unit.createMultiple(30, img);
        this.unit.setAll('anchor.x', ancX);
        this.unit.setAll('anchor.y', ancY);
        this.unit.setAll('outOfBoundsKill', true);
        this.unit.setAll('checkWorldBounds', true);
    }
}

class Rockets extends Ammo {
    fly(bullet) {
        game.physics.arcade.moveToObject(bullet, playerOne.unit, SPEED_OF_ROCKET);
    }
}

class Waves extends Ammo {
    fly(bullet, item) {
        game.physics.arcade.moveToXY(bullet, item.x, gameHeight, SPEED_OF_WAVE);
    }
}

class Handler {
    static start() {
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 0, scoreString + score, { font: '34px Arial', fill: '#6eff60' });

        lives = game.add.group();
        game.add.text(game.world.width - 100, 0, 'Lives : ', { font: '34px Arial', fill: '#6eff60' });

        stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#6eff60' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        for (let i = 0; i < 3; i++)
        {
            let live = lives.create(game.world.width - 80 + (30 * i), 70, conf._ship.key);
            live.anchor.setTo(0.5, 0.5);
            live.angle = 90;
            live.alpha = 0.4;
        }

        explosions = game.add.group();
        explosions.createMultiple(30, conf._kaboom.key);
        explosions.forEach(setupInvader, this);
    }
}