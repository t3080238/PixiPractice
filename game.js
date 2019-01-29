let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) { type = "canvas" }
PIXI.utils.sayHello(type);

let enemyPool = [];
let bullet = [];
let fire = [];
let enemiesContainer;
let aliveEnemy = 0;
let useBullet = 0;

const rowEnemy = 15;
const screenWidth = 1024;
const screenHeight = 768;
const bulletVy = 10;
const maxBullet = 10;
const maxFire = 10;

let left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

//Aliases 設定別名
let Application = PIXI.Application,
    resources = PIXI.loader.resources,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.TextureCache,
    Rectangle = PIXI.Rectangle,
    Container = PIXI.Container;

// Create a Pixi Application 
let app = new Application({
    width: screenWidth,         // default: 1024
    height: screenHeight,        // default: 768
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1,       // default: 1
    //backgroundColor: 0x061639
});

// Add the canvas that Pixi automatically created for you to the HTML document 
document.body.appendChild(app.view);

// load an image and run the `loadImage` function when it's done
loader
    //BallImage為別名
    //.add("BallImage", "images/PokemonBall.png")
    .add([
        "images/npc.json",
    ])
    .on("progress", loadProgressHandler)
    .load(initial);

function loadProgressHandler(loader, resource) {
    let resourceName = resource.url;
    console.log(resourceName);
    let loadPercent = loader.progress;
    console.log(loadPercent);
}

function enemy(posNum, texture) {
    this.sprite = new Sprite(texture);
    this.sprite.position.set((posNum - 1) % rowEnemy * 50 + 50, Math.floor((posNum - 1) / rowEnemy) * 50 + 50);
    this.sprite.width = 32;
    this.sprite.height = 32;
    enemiesContainer.addChild(this.sprite);
}

function creatEnemy(imageName) {
    let texture = TextureCache[imageName];
    enemiesContainer = new PIXI.Container();
    for (let i = 0; i < rowEnemy * 2 + rowEnemy / 2; i++) {
        enemyPool[i] = new enemy(i * 2 + 1, texture);
        aliveEnemy++;
    }
    app.stage.addChild(enemiesContainer);
}

function creatPlayer(imageName) {
    let texture = TextureCache[imageName];
    player = new Sprite(texture);
    player.vx = 0;
    player.vy = 0;
    app.stage.addChild(player);
    player.position.set(400, 600);
}

function creatExplore(imageName) {
    texture = TextureCache[imageName];
    explore = new Sprite(texture);
    app.stage.addChild(explore);
    explore.position.set(150, 550);
}

function creatBullet(imageName) {
    texture = TextureCache[imageName];
    for (let i = 0; i < maxBullet; i++) {
        bullet[i] = new Sprite(texture);
        bullet[i].visible = false;
        bullet[i].vx = 0;
        bullet[i].vy = 0;
        //bullet[i].position.set(-100, -100);
        app.stage.addChild(bullet[i]);
    }
}

function creatEnemyFire(imageName) {
    texture = TextureCache[imageName];
    for (let i = 0; i < maxFire; i++) {
        fire[i] = new Sprite(texture);
        bullet[i].visible = false;
        fire[i].vx = 0;
        fire[i].vy = 0;
        fire[i].x = 2000;
        fire[i].y = 1500;
        app.stage.addChild(fire[i]);
        fire[i].position.set(150, 650);
    }
}

function creatRocket(imageName) {
    texture = TextureCache[imageName];
    rocket = new Sprite(texture);
    rocket.anchor.set(1.0, 0.0);
    rocket.rotation = Math.PI / 180 * 270;
    app.stage.addChild(rocket);
}

function initial() {

    creatPlayer("player.png");
    creatEnemy("enemy.png");
    creatExplore("explore.png");
    creatBullet("bullet.png");
    creatEnemyFire("fire.png");
    creatRocket("rocket.png");

    setKeyboard();

    //Set Timer
    app.ticker.add(delta => update(delta));

}

function update() {
    rocket.position.set((window.innerWidth - 150) / 2, (window.innerHeight - 150) / 2);
    fire.x = 600;

    movePlayer();
    bulletShooting();
    enemyAttack();
    fireMove();
}

function setKeyboard() {
    let space = keyboard(32);
    space.press = () => {
        bullet[useBullet].visible = true;

        bullet[useBullet].x = player.x + (player.width - bullet[useBullet].width) / 2;
        bullet[useBullet].y = player.y - 26;
        bullet[useBullet].vx = player.vx;
        bullet[useBullet].vy = -1 * bulletVy;

        useBullet++;
        if (useBullet >= maxBullet) useBullet = 0;
    };
}

function movePlayer() {
    //按方向鍵加速
    if (left.isDown == true && player.vx > -6) {
        player.vx += -0.3;
    }
    if (up.isDown == true && player.vy > -6) {
        player.vy += -0.3;
    }
    if (right.isDown == true && player.vx < 6) {
        player.vx += 0.3;
    }
    if (down.isDown == true && player.vy < 6) {
        player.vy += 0.3;
    }

    //自動減速
    if (player.vy > 0) {
        player.vy -= 0.1;
        if (player.vy < 0) player.vy = 0;
    }
    if (player.vx > 0) {
        player.vx -= 0.1;
        if (player.vx < 0) player.vx = 0;
    }
    if (player.vy < 0) {
        player.vy += 0.1;
        if (player.vy > 0) player.vy = 0;
    }
    if (player.vx < 0) {
        player.vx += 0.1;
        if (player.vx > 0) player.vx = 0;
    }
    player.x += player.vx;
    player.y += player.vy;

    //撞牆停止
    if (player.x < 0) {
        player.x = 0;
        player.vx = 0;
    }
    if (player.x > screenWidth - player.width){
        player.x = screenWidth - player.width;
        player.vx = 0;
    } 
    if (player.y < 0){
        player.y = 0;
        player.vy = 0;
    } 
    if (player.y > screenHeight - player.height){
        player.y = screenHeight - player.height;
        player.vy = 0;
    } 
}

function bulletShooting() {
    for (let i = 0; i < maxBullet; i++) {
        if (bullet[i].visible === true) {
            bullet[i].x += bullet[i].vx;
            bullet[i].y += bullet[i].vy;
            if (bullet[i].y < -1 * bullet[i].height) bullet[i].visible = false;
        }
    }
}

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

