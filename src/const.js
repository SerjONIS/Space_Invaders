let bulletTime = 0;
let cursors;
let fireButton;
let explosions;
let starField;
let score = 0;
let scoreString = '';
let scoreText;
let lives;
let stateText;

const SPEED_OF_ROCKET = 120;
const SPEED_OF_WAVE = 200;
const PLAYER_SPEED = 200;
const FIRE_DELAY = 3000;
const ALIEN_SPEED = 12000;
const ENEMY_SPAWN_DELAY = 80;
const SCORE_TO_WIN = 800;
const PLAYER_BULLETS_SPEED = 400;
const PLAYER_BULLET_DELAY = 200;
const ROCKET_BOOM_DIST = 100;
const INVADER_WALK_DIST = 50;
const PLAYER_SCREEN_BOUNDS = 30;
const ENEMY_SPAWN_HEIGHT = 10;