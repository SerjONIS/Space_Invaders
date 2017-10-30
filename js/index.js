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
    game.load.image('ship', 'assets/player.png');
    game.load.image('invader', 'assets/invader.png');
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
var enemyBullets;
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

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    aliens.setAll('outOfBoundsKill', true);
    aliens.setAll('checkWorldBounds', true);

    createAliens();

    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++)
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
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

    var alien = aliens.create(getRandom(0, 600), 10, 'invader');

    alien.anchor.setTo(0.5, 0.5);
    alien.body.moves = false;

    game.add.tween(alien).to( { x: (alien.x + 50) }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    game.add.tween(alien).to( { y: 800 }, 15000, Phaser.Easing.Linear.None, true, 0, 1000, false );
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function update() {

    if (getRandom(0, 50) === 5) createAliens();

    starfield.tilePosition.y += 2;

    if (player.alive) {
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown) {
            player.body.velocity.x = 200;
        }

        if (fireButton.isDown) {
            fireBullet();
        }

        /*if (game.time.now > firingTimer) {
            enemyFires();
        }*/

        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

    aliens.forEachAlive(function (item) {
        if (item.y > 600) {
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

    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() === 0) {
        score += 1000;
        scoreText.text = scoreString + score;
        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
    }
}

function enemyHitsPlayer (player,bullet) {

    bullet.kill();
    gameOwer();

    var explosion = explosions.getFirstExists(false);

    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);
}

function enemyFires () {

    var enemyBullet = enemyBullets.getFirstExists(false);
    livingEnemies.length = 0;
    aliens.forEachAlive(function(item){
        livingEnemies.push(item);
    });

    if (enemyBullet && livingEnemies.length > 0) {

        var random = game.rnd.integerInRange(0,livingEnemies.length-1);
        var shooter = livingEnemies[random];

        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
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

    live.kill();
    if (lives.countLiving() < 1) {
        player.kill();
        enemyBullets.callAll('kill');
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
    }
}

function restart () {
    lives.callAll('revive');
    aliens.removeAll();
    createAliens();
    player.revive();
    stateText.visible = false;
}