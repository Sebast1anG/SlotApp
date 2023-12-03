import * as PIXI from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

const app = new PIXI.Application({ width: window.innerWidth, height: 800 });
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0xa7afc1;

let nickname = '';
let randomizeCount = 0;
let playerPoints = 0;

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
    if (!isLeverDown) {
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
                winningRowIndexes.forEach(rowIndex => {
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