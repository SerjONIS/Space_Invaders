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

    if (score > SCORE_TO_WIN) {
        score += 1000;
        scoreText.text = scoreString + score;
        rockets.unit.callAll('kill',this);
        waves.unit.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart,this);
    }
}

function enemyHitsPlayer (player, enemy) {
    explosion(enemy);
    enemy.kill();
    gameOwer();
}

function gameOwer() {
    let live = lives.getFirstAlive(true);

    if (live) live.kill();

    if (lives.countLiving() < 1) {
        if (playerOne.unit.alive) explosion(playerOne.unit);
        playerOne.unit.kill();
        rockets.unit.callAll('kill');
        waves.unit.callAll('kill');
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(restart, this);
    }
}

function explosion (item) {
    let boom = explosions.getFirstExists(false);

    boom.reset(item.body.x, item.body.y);
    boom.play(conf._kaboom.key, 30, false, true);
}

function restart () {
    lives.callAll('revive');
    rocketEnemy.unit.removeAll();
    waveEnemy.unit.removeAll();
    invader.unit.removeAll();
    playerOne.unit.revive();
    stateText.visible = false;
    score = 0;
    scoreText.text = scoreString + score;
}