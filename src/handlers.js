function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add(conf._kaboom.key);
}

function collisionHandler (bullet, alien) {
    bullet.kill();
    alien.kill();
    score += 20;
    scoreText.text = scoreString + score;
    explosion(alien);
}

function enemyHitsPlayer (player, enemy) {
    explosion(enemy);
    explosion(player);
    enemy.kill();
    lifeDec();
}

function lifeDec() {
    let live = lives.getFirstAlive(true);
    if (live) live.kill();
}

function explosion (item) {
    let boom = explosions.getFirstExists(false);

    boom.reset(item.body.x, item.body.y);
    boom.play(conf._kaboom.key, 30, false, true);
}

function checkBounds(...enemyArr) {
    for (let i = 0; i < enemyArr.length; i++) {
        enemyArr[i].forEachAlive(function (item) {
            if(item.y > GAME_HEIGHT) {
                item.kill();
                lifeDec();
            }
        });
    }
}

function restart () {
    lives.callAll('revive');
    rocketEnemy.unit.removeAll();
    waveEnemy.unit.removeAll();
    invader.unit.removeAll();
    playerOne.unit.reset(400, 500);
    playerOne.unit.revive();
    stateText.visible = false;
    score = 0;
    scoreText.text = scoreString + score;
}