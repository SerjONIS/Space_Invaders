'use strict';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
let conf;
let game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'root');

class LoadJSON{
    preload(){
        game.load.json('constAndScript', 'config.json');
    }

    create(){
        conf = game.cache.getJSON('constAndScript');
        game.state.start('Boot');
    }
}

class Boot {
    preload() {
        game.load.script(conf._const.key, conf._const.url);
        game.load.script(conf._classes.key, conf._classes.url);
        game.load.script(conf._handlers.key, conf._handlers.url);
    }
    create() {
        game.state.start('MainState');
    }
}

class MainState {
    preload() {
        game.load.image(conf._bullet.key, conf._bullet.url);
        game.load.image(conf._ship.key, conf._ship.url);
        game.load.image(conf._invader.key, conf._invader.url);
        game.load.image(conf._rocketEnemy.key, conf._rocketEnemy.url);
        game.load.image(conf._rocket.key, conf._rocket.url);
        game.load.image(conf._waveEnemy.key, conf._waveEnemy.url);
        game.load.image(conf._wave.key, conf._wave.url);
        game.load.spritesheet(conf._kaboom.key, conf._kaboom.url, 128, 128);
        game.load.image(conf._starField.key, conf._starField.url);
    }
    create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        starField = game.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, conf._starField.key);

        playerOne = new Player( conf._ship.key );
        invader = new Enemy( conf._invader.key );
        rocketEnemy = new Enemy( conf._rocketEnemy.key );
        waveEnemy = new Enemy( conf._waveEnemy.key );
        bullets = new Ammo ( conf._bullet.key, 0.5, 1 );
        rockets = new Rockets( conf._rocket.key, 0.1, -0.5 );   //свойство Anchor
        waves = new Waves( conf._wave.key, 0.15, -4 );

        UI.winText(WIN_TEXT_COLOR);
        UI.lives(LIVE_COLOR, PLAYER_LIFES);
        UI.score(SCORE_COLOR);

        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }
    update() {
        UI.win(WIN_MASSAGE, SCORE_TO_WIN);
        UI.lose(LOSE_MASSAGE);

        starField.tilePosition.y += 2;

        if ( (game.rnd.integerInRange(0, ENEMY_SPAWN_DELAY) === 5)) {
            let rnd = game.rnd.integerInRange(0, 30);
            if(rnd >= 20) invader.create(INVADER_WALK_DIST);
            if(rnd >= 5 && rnd < 20) rocketEnemy.create();
            if(rnd < 5) waveEnemy.create();
        }

        playerOne.playerControls();
        playerOne.fireBullet(bullets);

        rocketEnemy.fire(rockets);
        waveEnemy.fire(waves);

        rockets.detonate();

        game.physics.arcade.overlap(bullets.unit, [invader.unit, rocketEnemy.unit, waveEnemy.unit], collisionHandler, null, this);
        game.physics.arcade.overlap(waves.unit, playerOne.unit, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(playerOne.unit, [invader.unit, rocketEnemy.unit, waveEnemy.unit], enemyHitsPlayer, null, this);

        checkBounds(invader.unit, rocketEnemy.unit, waveEnemy.unit);
    }
}

game.state.add('LoadJSON', LoadJSON);
game.state.add('Boot', Boot);
game.state.add('MainState', MainState);
game.state.start('LoadJSON');





