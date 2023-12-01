import * as PIXI from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

const app = new PIXI.Application({ width: window.innerWidth, height: 800 });
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0xa7afc1;

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
      .to({ rotation:Math.PI / 3 }, 500)
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
        reels.forEach((reel) => {
            const randomPosition = Math.floor(Math.random() * 3);
            reel.children.forEach((symbol, index) => {
                const textureIndex = (randomPosition + index) % 3;
                symbol.texture = PIXI.Texture.from(symbols[textureIndex]);
            });
        });
    }, 2500);
};


window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    lever.emit('pointerdown');
  }
});

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
}

animate();
