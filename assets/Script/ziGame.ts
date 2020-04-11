const { ccclass, property } = cc._decorator;
const gamePadDic = {};
let turnIdx = 0;
let whoWin = null;

function getGamePadLoc(loc) {
    let trueX = Math.floor((loc.x * 640 + 18) / 36) + 8;
    let trueY = Math.floor((loc.y * 640 + 18) / 36) + 8;
    console.log(trueX, trueY);
    if (trueX <= 0 || trueX >= 16) {
        trueX = null;
    }
    if (trueY <= 0 || trueY >= 16) {
        trueY = null;
    }
    let padLoc = {
        trueX,
        trueY
    }
    return padLoc;
}
function setGamePadLoc(prefab, gamePad, padLoc, voice) {
    // console.log(`${padLoc.trueX},${padLoc.trueY}`, gamePadDic[`${padLoc.trueX},${padLoc.trueY}`])
    if (whoWin) {
        return false;
    }
    if (gamePadDic[`${padLoc.trueX},${padLoc.trueY}`]) {
        return false;
    }
    // 要算子的中点，所以加上18；要算棋盘左下角的起始位置，所以加上50；
    let x = (((padLoc.trueX - 1) * 36 + 18 + 50) / 640 - 0.5) * gamePad.width;
    let y = (((padLoc.trueY - 1) * 36 + 18 + 50) / 640 - 0.5) * gamePad.width;

    let target = cc.instantiate(prefab);
    target.x = x;
    target.y = y;
    gamePad.addChild(target);
    gamePadDic[`${padLoc.trueX},${padLoc.trueY}`] = target;
    target.x = x;
    target.y = y;
    console.log(target, gamePad);
    voice.play();
    whoWin = checkIsAnyoneWin(gamePadDic);
    return true;
}
function checkIsAnyoneWin(gamePadDic) {
    for (let i = 1; i <= 15; i++) {
        for (let j = 1; j <= 15; j++) {
            if (gamePadDic[`${i},${j}`]) {
                let nameFrom = gamePadDic[`${i},${j}`].name;
                // 横向
                if (gamePadDic[`${i + 1},${j}`] && gamePadDic[`${i + 1},${j}`].name === nameFrom
                    && gamePadDic[`${i + 2},${j}`] && gamePadDic[`${i + 2},${j}`].name === nameFrom
                    && gamePadDic[`${i + 3},${j}`] && gamePadDic[`${i + 3},${j}`].name === nameFrom) {
                    return nameFrom;
                }
                // 纵向
                if (gamePadDic[`${i},${j + 1}`] && gamePadDic[`${i},${j + 1}`].name === nameFrom
                    && gamePadDic[`${i},${j + 2}`] && gamePadDic[`${i},${j + 2}`].name === nameFrom
                    && gamePadDic[`${i},${j + 3}`] && gamePadDic[`${i},${j + 3}`].name === nameFrom) {
                    return nameFrom;
                }
                // / 斜向
                if (gamePadDic[`${i + 1},${j + 1}`] && gamePadDic[`${i + 1},${j + 1}`].name === nameFrom
                    && gamePadDic[`${i + 2},${j + 2}`] && gamePadDic[`${i + 2},${j + 2}`].name === nameFrom
                    && gamePadDic[`${i + 3},${j + 3}`] && gamePadDic[`${i + 3},${j + 3}`].name === nameFrom) {
                    return nameFrom;
                }
                // \ 斜向
                if (gamePadDic[`${i + 1},${j - 1}`] && gamePadDic[`${i + 1},${j - 1}`].name === nameFrom
                    && gamePadDic[`${i + 2},${j - 2}`] && gamePadDic[`${i + 2},${j - 2}`].name === nameFrom
                    && gamePadDic[`${i + 3},${j - 3}`] && gamePadDic[`${i + 3},${j - 3}`].name === nameFrom) {
                    return nameFrom;
                }
            }
        }
    }
}

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    gamePad: cc.Node = null;
    @property([cc.Prefab])
    zis: [cc.Prefab] = [null];
    @property(cc.Node)
    textInfo: cc.Node = null;
    @property(cc.Label)
    textInfoLabel: cc.Label = null;
    @property(cc.AudioSource)
    bgm: cc.AudioSource = null;
    @property(cc.AudioSource)
    ziClickVoice: cc.AudioSource = null;
    @property(cc.AudioSource)
    btnClickVoice: cc.AudioSource = null;

    start() {
        this.bgm.play();
        this.textInfo.on(cc.Node.EventType.TOUCH_START, (event) => {
            console.log('touched', event);
            whoWin = null;
            this.textInfo.active = false;
            for (const key in gamePadDic) {
                if (gamePadDic.hasOwnProperty(key)) {
                    delete gamePadDic[key];
                }
            }
            this.gamePad.removeAllChildren();
        })
        this.gamePad.on(cc.Node.EventType.TOUCH_START, (event) => {
            console.log(event);
            let point = event.getLocation();
            let loc = this.gamePad.convertToNodeSpaceAR(point);
            let { x, y } = loc;
            console.log(x, y);
            console.log(x / this.gamePad.width, y / this.gamePad.height);
            let padLoc = getGamePadLoc({
                x: x / this.gamePad.width,
                y: y / this.gamePad.height
            })
            let { trueX, trueY } = padLoc;
            let around = ['wei', 'shu', 'wu'];
            let aroundCnDic = {
                'wei': {
                    name: '魏国',
                    color: '0a4e93',
                },
                'shu': {
                    name: '蜀国',
                    color: 'b0312e',
                },
                'wu': {
                    name: '吴国',
                    color: '2e5830',
                }
            };
            let nowAround = around[turnIdx++ % 3];
            if (trueX && trueY) {
                let prefab = null;
                for (let i = 0; i < this.zis.length; i++) {
                    const _prefab = this.zis[i];
                    if (_prefab.name === nowAround) {
                        prefab = _prefab;
                    }
                }
                if (!setGamePadLoc(prefab, this.gamePad, padLoc, this.ziClickVoice)) {
                    turnIdx--;
                } else {
                    if (whoWin) {
                        this.textInfo.active = true;
                        this.textInfoLabel.string = aroundCnDic[whoWin].name + '胜利了';
                        console.log(this.textInfo.getChildByName('info'))
                        this.textInfo.getChildByName('info').color = this.textInfo.getChildByName('info').color.fromHEX(aroundCnDic[whoWin].color);
                    }
                };
            }
        })
    }
}
