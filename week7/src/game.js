export default function game() {
    let player, texture, explore;
    let enemy = [];
    let bullet = [];
    let fire = [];
    let rocket = [];
    let particle = [];
    let enemiesContainer;
    let aliveEnemyNum = 0, totalEnemeNum = 0;
    let useBullet = 0, useFire = 0;
    let attackTimer = 0;
    let bulletTimer = 0;
    let state;
    let containerWidth = 0;
    let loseText, pressEnterText, winText;

    const rowEnemy = 13;
    const screenWidth = 1024;
    const screenHeight = 768;
    const bulletVy = 10;
    const maxBullet = 10;
    const maxFire = 20;
    const attackFrame = 30;
    const atuoShootFrame = 12;
    const fireSpeed = 3;
    const play = "play", pause = "pause", dead = "dead", stop = "stop";
    const maxParticle = 200;

    let left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        space = keyboard(32);

    let app = new PIXI.Application({
        width: screenWidth,
        height: screenHeight,
        antialias: true,
        transparent: false,
        resolution: 1,
    });

    document.body.appendChild(app.view);

    // 載入圖片
    PIXI.loader
        .add([
            "images/npc.json",
        ])
        .load(initial);

    function creatEnemy(imageName) {
        let texture = PIXI.TextureCache[imageName];
        enemiesContainer = new PIXI.Container();
        for (let i = 0; i < rowEnemy * 2 + rowEnemy / 2; i++) {
            enemy[i] = new PIXI.Sprite(texture);
            enemy[i].position.set((i * 2) % rowEnemy * 50 + 50, Math.floor((i * 2) / rowEnemy) * 50 + 50);
            enemy[i].width = 32;
            enemy[i].height = 32;
            enemiesContainer.addChild(enemy[i]);
            aliveEnemyNum++;
        }
        totalEnemeNum = aliveEnemyNum;
        enemiesContainer.vx = 1;
        app.stage.addChild(enemiesContainer);
        containerWidth = enemiesContainer.width;
    }

    function creatPlayer(imageName) {
        let texture = PIXI.TextureCache[imageName];
        player = new PIXI.Sprite(texture);
        player.vx = 0;
        player.vy = 0;
        app.stage.addChild(player);
        player.position.set((screenWidth - player.width) / 2, screenHeight - 100);
    }

    function creatExplore(imageName) {
        texture = PIXI.TextureCache[imageName];
        explore = new PIXI.Sprite(texture);
        explore.visible = false;
        app.stage.addChild(explore);
        explore.position.set(150, 550);
    }

    function creatBullet(imageName) {
        texture = PIXI.TextureCache[imageName];
        for (let i = 0; i < maxBullet; i++) {
            bullet[i] = new PIXI.Sprite(texture);
            bullet[i].visible = false;
            bullet[i].vx = 0;
            bullet[i].vy = 0;
            bullet[i].position.set(-100, -100);
            app.stage.addChild(bullet[i]);
        }
    }

    function creatEnemyFire(imageName) {
        texture = PIXI.TextureCache[imageName];
        for (let i = 0; i < maxFire; i++) {
            fire[i] = new PIXI.Sprite(texture);
            fire[i].visible = false;
            fire[i].vx = 0;
            fire[i].vy = 0;
            fire[i].x = 2000;
            fire[i].y = 1500;
            app.stage.addChild(fire[i]);
        }
    }

    function creatRocket(imageName) {
        texture = PIXI.TextureCache[imageName];
        for (let i = 0; i < 18; i++) {
            rocket[i] = new PIXI.Sprite(texture);
            rocket[i].anchor.set(0.5, 0.5);
            if (i < 12 && i >= 6) {
                rocket[i].rotation = Math.PI / 180 * 60 * i + 30;
            }
            else {
                rocket[i].rotation = Math.PI / 180 * 60 * i;
            }
            rocket[i].position.set(screenWidth / 2, screenHeight / 2);
            rocket[i].visible = false;
            app.stage.addChild(rocket[i]);
        }
    }

    function creatParticles() {
        for (let i = 0; i < maxParticle; i++) {
            particle[i] = new PIXI.Graphics();
            particle[i].beginFill(0xf0cf57);
            particle[i].drawCircle(0, 0, 5);
            particle[i].endFill();
            particle[i].x = -100;
            particle[i].y = -100;
            particle[i].vx = 0;
            particle[i].vy = 0;
            app.stage.addChild(particle[i]);
        }
    }

    function creatText() {
        let style1 = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 72,
            fill: "white",
            stroke: '#ff3300',
            strokeThickness: 6
        });

        let style2 = new PIXI.TextStyle({
            fontFamily: "微軟正黑體",
            fontSize: 48,
            fill: "white"
        });

        let style3 = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 72,
            fill: "#f0cf57",
            stroke: '#ff3300',
            strokeThickness: 3
        });

        loseText = new PIXI.Text("You Lose", style1);
        loseText.position.set((screenWidth - loseText.width) / 2, (screenHeight - loseText.height) / 2);
        loseText.visible = false;
        app.stage.addChild(loseText);

        pressEnterText = new PIXI.Text("按Enter鍵重新遊戲", style2);
        pressEnterText.position.set((screenWidth - pressEnterText.width) / 2, (screenHeight) * 2 / 3);
        pressEnterText.visible = false;
        app.stage.addChild(pressEnterText);

        winText = new PIXI.Text("You Win", style3);
        winText.position.set((screenWidth - winText.width) / 2, (screenHeight - winText.height) / 2);
        winText.visible = false;
        app.stage.addChild(winText);
    }

    function replayGame() {
        enemy.forEach(function (ene) {
            ene.visible = true;
        })
        enemiesContainer.x = 0;
        enemiesContainer.vy = 1;
        aliveEnemyNum = totalEnemeNum;

        player.visible = true;
        player.position.set((screenWidth - player.width) / 2, screenHeight - 100);
        player.vx = 0;
        player.vy = 0;

        fire.forEach(function (fir) {
            fir.visible = false;
            fir.vx = 0;
            fir.vy = 0;
            fir.x = 2000;
            fir.y = 1500;
        });

        bullet.forEach(function (bul) {
            bul.visible = false;
            bul.vx = 0;
            bul.vy = 0;
            bul.position.set(-100, -100);
        });

        rocket.forEach(function (roc) {
            roc.position.set(screenWidth / 2, screenHeight / 2);
            roc.visible = false;
        });

        particle.forEach(function (par) {
            par.visible = false;
            par.vx = 0;
            par.vy = 0;
        });

        explore.visible = false;
        loseText.visible = false;
        pressEnterText.visible = false;
        winText.visible = false;

        state = play;
        attackTimer = 0;
    }

    function initial() {
        creatPlayer("player.png");
        creatEnemy("enemy.png");
        creatExplore("explore.png");
        creatBullet("bullet.png");
        creatEnemyFire("fire.png");
        creatRocket("rocket.png");
        setKeyboard();
        creatParticles();
        creatText();

        //Set Timer
        app.ticker.add(delta => update(delta));
        state = play;
    }

    function update() {
        if (state !== pause && state !== stop) {
            movePlayer();
            enemyMoveAttack();
            bulletShooting();
            fireMove();
            bulletAttackHitTest();
            fireAttackHitTest();
            enemyPlayerHitTest();
            fireBulletHitTest();
            if (state === dead) {
                showPlayerDead();
            }
        }
        showPlayerWin();
    }

    function setKeyboard() {
        //空白建射擊
        let keySpace = keyboard(32);
        //Ctrl 或 P 暫停
        let keyCtrl = keyboard(17);
        let keyP = keyboard(80);
        //Enter重新開始
        let keyEnter = keyboard(13);

        keySpace.press = () => {
            if (state === play) {
                bulletTimer = 0;
                bulletShoot();
            }
        };

        keyCtrl.press = () => {
            if (state === play) state = pause;
            else if (state === pause) state = play;
        };

        keyP.press = () => {
            if (state === play) state = pause;
            else if (state === pause) state = play;
        };

        keyEnter.press = () => {
            replayGame();
        };
    }

    function bulletShoot() {
        bullet[useBullet].visible = true;
        bullet[useBullet].x = player.x + (player.width - bullet[useBullet].width) / 2;
        bullet[useBullet].y = player.y - 18;
        bullet[useBullet].vx = player.vx;
        bullet[useBullet].vy = -1 * bulletVy;
        useBullet++;
        if (useBullet >= maxBullet) useBullet = 0;
    }

    function movePlayer() {
        if (state === dead) return;
        //按方向鍵加速
        /*if (left.isDown === true && player.vx > -6) {
            player.vx += -0.3;
        }*/
        player.vx += (left.isDown === true && player.vx > -6) ? -0.3 : 0;

        /*if (up.isDown === true && player.vy > -6) {
            player.vy += -0.3;
        }*/
        player.vy += (up.isDown === true && player.vy > -6) ? -0.3 : 0;

        /*if (right.isDown === true && player.vx < 6) {
            player.vx += 0.3;
        }*/
        player.vx += (right.isDown === true && player.vx < 6) ? 0.3 : 0;

        /*if (down.isDown === true && player.vy < 6) {
            player.vy += 0.3;
        }*/
        player.vy += (down.isDown === true && player.vy < 6) ? 0.3 : 0;

        //自動減速
        if (player.vy > 0) {
            player.vy -= 0.1;

            //if (player.vy < 0) player.vy = 0;
            player.vy = (player.vy < 0) ? 0 : player.vy;
        }
        if (player.vx > 0) {
            player.vx -= 0.1;

            //if (player.vx < 0) player.vx = 0;
            player.vx = (player.vx < 0) ? 0 : player.vx;
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
        if (player.x > screenWidth - player.width) {
            player.x = screenWidth - player.width;
            player.vx = 0;
        }
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
        if (player.y > screenHeight - player.height) {
            player.y = screenHeight - player.height;
            player.vy = 0;
        }

        //自動射擊
        if (space.isDown === true) {
            bulletTimer++;
            if (bulletTimer > atuoShootFrame) {
                bulletShoot();
                bulletTimer = 0;
            }
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

    function enemyMoveAttack() {
        //Enemy Move
        enemiesContainer.x += enemiesContainer.vx;
        if (enemiesContainer.x + containerWidth > screenWidth - 100) {
            enemiesContainer.vx = -1;
        }
        else if (enemiesContainer.x < 1) {
            enemiesContainer.vx = 1;
        }

        //Enemy Attack
        attackTimer++;

        if (attackTimer >= attackFrame) {
            if (aliveEnemyNum > 0 && state === play) {
                let randEnemy;
                do {
                    randEnemy = randomInt(0, totalEnemeNum - 1);
                } while (enemy[randEnemy].visible === false);

                fire[useFire].x = enemy[randEnemy].getGlobalPosition().x + 7;
                fire[useFire].y = enemy[randEnemy].y + 30;

                let distX = player.x + player.width / 2 - fire[useFire].x - fire[useFire].width / 2
                let distY = player.y + player.height / 2 - fire[useFire].y - fire[useFire].height / 2

                fire[useFire].vx = distX * fireSpeed / Math.sqrt(distX * distX + distY * distY);
                fire[useFire].vy = distY * fireSpeed / Math.sqrt(distX * distX + distY * distY);;
                fire[useFire].visible = true;
                useFire++;
                if (useFire >= maxFire) useFire = 0;
                attackTimer = 0;
            }
        }
    }

    function fireMove() {
        for (let i = 0; i < maxFire; i++) {
            if (fire[i].visible === true) {
                fire[i].x += fire[i].vx;
                fire[i].y += fire[i].vy;
            }
        }
    }
    function bulletAttackHitTest() {
        bullet.forEach(function (bul) {
            enemy.forEach(function (ene) {
                if (ene.visible === true) {
                    if (hitTestRectangle(bul, ene) === true) {
                        ene.visible = false;
                        bul.visible = false;
                        bul.position.set(-100, -100);
                        aliveEnemyNum--;
                    }
                }
            })
        })
    }

    function fireBulletHitTest() {
        bullet.forEach(function (bul) {
            if (bul.visible === true) {
                fire.forEach(function (fir) {
                    if (hitTestRectangle(bul, fir) === true) {
                        fir.visible = false;
                        bul.visible = false;
                        fir.position.set(2000, 1500);
                        bul.position.set(-100, -100);
                    }
                })
            }
        })
    }

    function fireAttackHitTest() {
        if (state === dead) return;
        fire.forEach(function (fir) {
            if (fir.visible === true) {
                if (hitTestRectangle(fir, player) === true) {
                    fir.visible = false;
                    playerDead();
                }
            }
        })
    }

    function enemyPlayerHitTest() {
        if (state === dead) return;
        enemy.forEach(function (ene) {
            if (ene.visible === true) {
                if (hitTestRectangle(ene, player) === true) {
                    playerDead();
                }
            }
        })
    }

    function playerDead() {
        explore.anchor.set(0.5, 0.5);
        explore.position.set(player.x + player.width / 2, player.y + player.height / 2);
        explore.visible = true;
        player.visible = false;
        attackTimer = 0;
        state = dead;
    }

    function showPlayerDead() {
        if (attackTimer % 40 === 20) {
            explore.rotation = Math.PI / 180 * 90;
        }
        if (attackTimer % 40 === 0) {
            explore.rotation = Math.PI / 180 * 0;
        }
        if (attackTimer > 180) {
            explore.visible = false;
            loseText.visible = true;
            winText.visible = false;
            enemy.forEach(function (ene) {
                ene.visible = false;
            });
        }
        if (attackTimer > 240) {
            pressEnterText.visible = true;
            fire.forEach(function (fir) {
                fir.visible = false;
            });
            state = stop;
        }
    }

    function showPlayerWin() {
        if (aliveEnemyNum <= 0 && state !== dead && state !== stop) {
            attackTimer++;
            if (attackTimer > 300) {
                player.visible = false;
                state = pause;
                winText.visible = true;
                fire.forEach(function (fir) {
                    fir.visible = false;
                });
                bullet.forEach(function (bul) {
                    bul.visible = false;
                });
                rocketMove();
            }
            if (attackTimer === 360) {
                pressEnterText.visible = true;
            }
            else if (attackTimer > 360) {
                playParticles();
            }
        }
    }

    function playParticles() {
        particle[attackTimer % maxParticle].x = screenWidth / 2;
        particle[attackTimer % maxParticle].y = screenHeight / 2;
        let ranSpeed = Math.floor(Math.random() * 10 + 1);
        let ranDegree = Math.floor(Math.random() * 360);
        particle[attackTimer % maxParticle].vx = ranSpeed * Math.cos(ranDegree / (2 * Math.PI));
        particle[attackTimer % maxParticle].vy = ranSpeed * Math.sin(ranDegree / (2 * Math.PI));
        particle[attackTimer % maxParticle].visible = true;

        particle.forEach(function (par) {
            par.x += par.vx;
            par.y += par.vy;
        });
    }

    function rocketMove() {
        for (let i = 0; i < 6; i++) {
            rocket[i].visible = true;
            rocket[i].x += 8 * Math.cos(i * Math.PI / 3);
            rocket[i].y += 8 * Math.sin(i * Math.PI / 3);
        }
        if (attackTimer > 320) {
            for (let i = 6; i < 12; i++) {
                rocket[i].visible = true;
                rocket[i].x += 8 * Math.cos(i * Math.PI / 3 - Math.PI / 2);
                rocket[i].y += 8 * Math.sin(i * Math.PI / 3 - Math.PI / 2);
            }
        }
        if (attackTimer > 340) {
            for (let i = 12; i < 18; i++) {
                rocket[i].visible = true;
                rocket[i].x += 8 * Math.cos(i * Math.PI / 3);
                rocket[i].y += 8 * Math.sin(i * Math.PI / 3);
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

        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function hitTestRectangle(r1, r2) {
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

        hit = false;

        //中心座標
        r1.centerX = r1.getGlobalPosition().x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.getGlobalPosition().x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;

        //半邊長
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;

        //計算兩者距離
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;

        //計算兩者半邊和
        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;

        //若x和y的距離小於半邊寬高和，則為碰撞到
        if (Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights) {
            return true;
        }
        return false;
    };
}