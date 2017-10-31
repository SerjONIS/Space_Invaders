var game = new Phaser.Game(800, 600, Phaser.AUTO, 'root', {
    preload: preload,
    create: create,
    update: update
});

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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
    game.load.image('starfield', 'assets/starfield.png');
}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var rockets;
var waves;
var firingTimer = 0;
var stateText;
var livingEnemies = [];



function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

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

    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    player.angle = 180;
    game.physics.enable(player, Phaser.Physics.ARCADE);

    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    aliens.setAll('outOfBoundsKill', true);
    aliens.setAll('checkWorldBounds', true);

    scoreString = 'Score : ';
    scoreText = game.add.text(10, 0, scoreString + score, { font: '34px Arial', fill: '#fff' });

    lives = game.add.group();
    game.add.text(game.world.width - 100, 0, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++)
    {
        var ship = lives.create(game.world.width - 80 + (30 * i), 70, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createAliens () {
    var rnd = getRandom(0, 25);

    if (rnd >= 0 && rnd < 10) {
        var alienR = aliens.create(getRandom(0, 600), 10, 'rocketEnemy');

        alienR.anchor.setTo(0.5, 0.5);
        alienR.body.moves = false;
        game.add.tween(alienR).to( { y: 800 }, 15000, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }
    else if (rnd >= 10 && rnd <= 12) {
        var alienW = aliens.create(getRandom(0, 600), 10, 'waveEnemy');

        alienW.anchor.setTo(0.5, 0.5);
        alienW.body.moves = false;
        game.add.tween(alienW).to( { y: 800 }, 15000, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }else{
        var alien = aliens.create(getRandom(0, 600), 10, 'invader');

        alien.anchor.setTo(0.5, 0.5);
        alien.body.moves = false;
        game.add.tween(alien).to( { x: (alien.x + 50) }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(alien).to( { y: 800 }, 15000, Phaser.Easing.Linear.None, true, 0, 1000, false );
    }
}

function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

function update() {
    if (getRandom(0, 80) === 5) createAliens();

    starfield.tilePosition.y += 2;

    if (player.alive) {
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
        }
        if (cursors.right.isDown) {
            player.body.velocity.x = 200;
        }
        if (cursors.up.isDown) {
            player.body.velocity.y = -200;
        }
        if (cursors.down.isDown) {
            player.body.velocity.y = 200;
        }
        if (fireButton.isDown) {
            fireBullet();
        }
        if (game.time.now > firingTimer) {
            enemyFires();
        }
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(rockets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(waves, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(aliens, player, enemyHitsPlayer, null, this);
    }

    aliens.forEachAlive(function (item) {
        if (item.y > 600) {
            item.kill();
            gameOwer();
        }
    });

    rockets.forEachAlive(function (item) {
        if (game.physics.arcade.distanceBetween (player, item) < 100) {
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

    if (aliens.countLiving() === 0 && score === 800) {
        score += 1000;
        scoreText.text = scoreString + score;
        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
    }
    enemyFires ();
}

function enemyHitsPlayer (player,bullet) {
    bullet.kill();
    gameOwer();
    explosion(player);
}

function enemyFires () {
    var rocket = rockets.getFirstExists(false);
    var wave = waves.getFirstExists(false);

    livingEnemies.length = 0;
    aliens.forEachAlive(function(item){
        livingEnemies.push(item);
    });

    if (livingEnemies.length > 0) {

        var random = game.rnd.integerInRange(0,livingEnemies.length-1);
        var shooter = livingEnemies[random];

        switch (shooter.key) {
            case 'rocketEnemy':
                rocket.reset(shooter.body.x, shooter.body.y);
                game.physics.arcade.moveToObject(rocket,player,120);
                break;
            case 'waveEnemy':
                wave.reset(shooter.body.x, shooter.body.y);
                game.physics.arcade.moveToXY(wave, shooter.body.x, 800, 200);
        }
        firingTimer = game.time.now + 2000;
    }
}

function fireBullet () {
    if (game.time.now > bulletTime) {
        var bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }
}

function gameOwer() {
    var live = lives.getFirstAlive(true);

    if (live) live.kill();

    if (lives.countLiving() < 1) {
        if (player.alive) explosion(player);
        player.kill();
        rockets.callAll('kill');
        waves.callAll('kill');
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart, this);
    }
}

function explosion (item) {
    var boom = explosions.getFirstExists(false);

    boom.reset(item.body.x, item.body.y);
    boom.play('kaboom', 30, false, true);
}

function restart () {
    lives.callAll('revive');
    aliens.removeAll();
    createAliens();
    player.revive();
    stateText.visible = false;
}