import * as PIXI from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

const app = new PIXI.Application({ width: window.innerWidth -20, height: 800 });
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0xa7afc1;

let nickname = '';
let randomizeCount = 0;
let playerPoints = 0;
let isLeverBlocked = false;

const overlayDiv = document.createElement('div');
overlayDiv.style.position = 'fixed';
overlayDiv.style.top = '0';
overlayDiv.style.left = '0';
overlayDiv.style.width = '100%';
overlayDiv.style.height = '100%';
overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlayDiv.style.display = 'flex';
overlayDiv.style.alignItems = 'center';
overlayDiv.style.justifyContent = 'center';

const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Enter your nickname';
input.style.fontSize = '20px';
input.style.padding = '10px';
input.style.border = 'none';
input.style.borderRadius = '5px';
input.style.marginRight = '10px';

const button = document.createElement('button');
button.textContent = 'Submit';
button.style.fontSize = '20px';
button.style.padding = '10px';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.backgroundColor = 'white';
button.style.color = 'black';
button.style.cursor = 'pointer';



overlayDiv.appendChild(input);
overlayDiv.appendChild(button);
document.body.appendChild(overlayDiv)
const symbols = [
    require('./assets/corn.png').default,
    require('./assets/donut.png').default,
    require('./assets/apple.png').default
];

const reels = [];
for (let i = 0; i < 3; i++) {
    const reel = new PIXI.Container();
    reel.x = 400 * i;
    app.stage.addChild(reel);
    reels.push(reel);
}
const positions = [0, 1, 2];

reels.forEach((reel) => {
    const randomPositions = positions.slice();
    for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * randomPositions.length);
        const positionIndex = randomPositions.splice(randomIndex, 1)[0];
        const symbol = PIXI.Sprite.from(symbols[positionIndex]);
        symbol.y = j * 250;
        reel.addChild(symbol);
    }
});

let isLeverDown = false;

const lever = new PIXI.Graphics();
lever.beginFill(0x1099bb);
lever.drawRect(0, 0, 40, 180);
const textStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    fill: 'white',
    letterSpacing: 8
});

const pullText = new PIXI.Text('Pull', textStyle);
pullText.position.set(5, 150);
pullText.rotation = -Math.PI / 2;
lever.addChild(pullText);
lever.beginFill(0xFFFFFF);
lever.drawRoundedRect(0, 180, 40, 40, 20);

lever.endFill();

lever.pivot.set(10, 0);
lever.x = 1250;
lever.y = 500;
app.stage.addChild(lever);

lever.interactive = true;
lever.buttonMode = true;

new TWEEN.Tween(lever)
    .to({ rotation: 3 * Math.PI / 3 }, 500)
    .start();

lever.on('pointerdown', () => {
    if (!isLeverDown && !isLeverBlocked) {
        isLeverDown = true;

        new TWEEN.Tween(lever)
            .to({ rotation: Math.PI / 3 }, 500)
            .easing(TWEEN.Easing.Back.Out)
            .start()
            .onComplete(() => {
                spinReels();
                setTimeout(() => {
                    new TWEEN.Tween(lever)
                        .to({ rotation: 3 * Math.PI / 3 }, 500)
                        .easing(TWEEN.Easing.Back.In)
                        .start()
                        .onComplete(() => {
                            isLeverDown = false;
                            isLeverBlocked = true;
                            setTimeout(() => {
                                isLeverBlocked = false;
                            }, 1500);
                        });
                }, 1000);
            });
    }
});

function randomizeSymbols() {
    reels.forEach((reel) => {
        const randomPosition = Math.floor(Math.random() * 3);
        reel.children.forEach((symbol, index) => {
            const textureIndex = (randomPosition + index) % 3;
            symbol.texture = PIXI.Texture.from(symbols[textureIndex]);
        });
    });

    if (randomizeCount % 2 === 1) {
        const winningRowIndex = Math.floor(Math.random() * reels[0].children.length);
        const textureIndex = Math.floor(Math.random() * symbols.length);

        reels.forEach((reel) => {
            reel.children[winningRowIndex].texture = PIXI.Texture.from(symbols[textureIndex]);
        });

        playerPoints++;
        updatePlayerPoints();
    }

    randomizeCount++;
}

function updatePlayerPoints() {
    if (app.stage.getChildByName('pointsText')) {
        app.stage.removeChild(app.stage.getChildByName('pointsText'));
    }

   const pointsText = new PIXI.Text(`Points: ${playerPoints}`, {
       fontFamily: 'Arial',
       fontSize: 20,
       fill: 'white',
       letterSpacing: 2,
   });
    pointsText.name = 'pointsText';
    pointsText.position.set(lever.x - 50, lever.y + 130);
    app.stage.addChild(pointsText);

    if (playerPoints > 0) {
        showWinPopup();
    }
}

function showWinPopup() {
    const winText = new PIXI.Text('WIN!', {
        fontFamily: 'Arial',
        fontSize: 50,
        fill: 'gold',
        letterSpacing: 5,
    });
    winText.position.set(app.renderer.width / 2 + 350, app.renderer.height / 2 - 50);
    app.stage.addChild(winText);

    setTimeout(() => {
        app.stage.removeChild(winText);
    }, 1500);

    const totalFireworks = 300;
    const fireworks = [];
    const colors = [0xffffff, 0x00ff00, 0xff0000, 0xffff00, 0x800080];

    for (let i = 0; i < totalFireworks; i++) {
        const firework = new PIXI.Graphics();
        const color = colors[Math.floor(Math.random() * colors.length)];

        firework.beginFill(color);
        firework.drawRect(0, 0, 5, 5);
        firework.endFill();
        firework.x = app.renderer.width / 2;
        firework.y = app.renderer.height;
        app.stage.addChild(firework);
        fireworks.push({ obj: firework, vx: 0, vy: 0 });
    }


    fireworks.forEach((fireworkData) => {
        const firework = fireworkData.obj;
        const delay = Math.random() * 500;

        setTimeout(() => {
            const explosionPower = Math.random() * 12 + 1;
            const explosionAngle = Math.random() * Math.PI * 6;

            fireworkData.vx = Math.cos(explosionAngle) * explosionPower;
            fireworkData.vy = Math.sin(explosionAngle) * explosionPower;

            const gravity = 0.1;

            const update = () => {
                fireworkData.vx *= 0.99;
                fireworkData.vy += gravity;
                firework.x += fireworkData.vx;
                firework.y += fireworkData.vy;

                if (firework.y >= app.renderer.height) {
                    firework.alpha = 0;
                    firework.visible = false;
                }
            };

            const animate = () => {
                update();
                requestAnimationFrame(animate);
            };

            animate();
        }, delay);
    });
}


function hideOverlayAndSetNickname() {
    nickname = input.value.trim();
    if (nickname !== '') {
        overlayDiv.style.display = 'none';
        input.value = '';

        const nicknameText = new PIXI.Text(`Nickname: ${nickname}`, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 'white',
            letterSpacing: 2,
        });
        nicknameText.position.set(lever.x - 50, lever.y + 100);
        app.stage.addChild(nicknameText);
    }
    updatePlayerPoints();
}

button.addEventListener('click', hideOverlayAndSetNickname);

function checkForWinningRows() {
    const rows = reels[0].children.length;
    const winningRows = [];

    for (let i = 0; i < rows; i++) {
        const symbol = reels[0].children[i].texture;
        let isWinningRow = true;

        for (let j = 1; j < reels.length; j++) {
            if (reels[j].children[i].texture !== symbol) {
                isWinningRow = false;
                break;
            }
        }

        if (isWinningRow) {
            winningRows.push(i);
        }
    }

    return winningRows;
}

const spinReels = () => {
    let symbolIndex = 0;
    let interval;

    const updateSymbols = () => {
        reels.forEach((reel) => {
            reel.children.forEach((symbol, index) => {
                const textureIndex = (symbolIndex + index) % 3;
                symbol.texture = PIXI.Texture.from(symbols[textureIndex]);
            });
        });
        symbolIndex = (symbolIndex + 1) % 3;
    };

    interval = setInterval(() => {
        updateSymbols();
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        randomizeSymbols();

        setTimeout(() => {
            const winningRowIndexes = checkForWinningRows();

            if (winningRowIndexes.length > 0) {
                const distinctWinningRows = [...new Set(winningRowIndexes)];
                if (distinctWinningRows.length === 3 || distinctWinningRows.length === 2) {
                    playerPoints += distinctWinningRows.length;
                    updatePlayerPoints();
                }

                distinctWinningRows.forEach(rowIndex => {
                    const winningRow = reels.map(reel => reel.children[rowIndex]);

                    winningRow.forEach(symbol => {
                        new TWEEN.Tween(symbol)
                            .to({ y: symbol.y - 10 }, 200)
                            .easing(TWEEN.Easing.Bounce.Out)
                            .start()
                            .onComplete(() => {
                                new TWEEN.Tween(symbol)
                                    .to({ y: symbol.y + 10 }, 200)
                                    .easing(TWEEN.Easing.Bounce.Out)
                                    .start();
                            });
                    });
                });
            }
        }, 100);
    }, 2500); 
};

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}

animate();