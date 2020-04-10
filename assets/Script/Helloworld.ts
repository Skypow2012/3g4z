const {ccclass, property} = cc._decorator;
const gamePadDic = {};
let turnIdx = 0;

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
function setGamePadLoc(prefab, gamePad, padLoc) {
    // 要算子的中点，所以加上18；要算棋盘左下角的起始位置，所以加上50；
    let x = (((padLoc.trueX - 1) * 36 + 18 + 50) / 640 - 0.5) * gamePad.width;
    let y = (((padLoc.trueY - 1) * 36 + 18 + 50) / 640 - 0.5) * gamePad.width;
    
    let target = cc.instantiate(prefab);
    target.x = x;
    target.y = y;
    gamePad.addChild(target);
    gamePadDic[`${gamePad.trueX},${gamePad.trueY}`] = target;
    target.x = x;
    target.y = y;
    console.log(target, gamePad);
    return;
}

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    gamePad: cc.Node = null;
    @property([cc.Prefab])
    zis: [cc.Prefab] = [null];

    @property
    text: string = 'hello';

    start () {
        // init logic
        this.label.string = this.text;
        this.gamePad.on(cc.Node.EventType.TOUCH_START, (event) =>{
            console.log(event);
            let point = event.getLocation();
            let loc = this.gamePad.convertToNodeSpaceAR(point);
            let {x, y} = loc;
            console.log(x, y);
            console.log(x/ this.gamePad.width, y / this.gamePad.height);
            let padLoc = getGamePadLoc({
                x: x/ this.gamePad.width, 
                y: y / this.gamePad.height
            })
            let { trueX, trueY } = padLoc;
            let around = ['wei', 'shu', 'wu'];
            let nowAround = around[turnIdx++%3];
            if (trueX && trueY) {
                let prefab = null;
                for (let i = 0; i < this.zis.length; i++) {
                    const _prefab = this.zis[i];
                    if (_prefab.name === nowAround) {
                        prefab = _prefab;
                    }
                }
                setGamePadLoc(prefab, this.gamePad, padLoc);
            }
        })
    }
}
