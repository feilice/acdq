'use strict';

// インプットクラス
class Input {
    constructor() {
        this._keyMap = new Map();  // キー格納

        // キーが押されたら、キー値の map に true を格納
        addEventListener('keydown', (ke) => this._keyMap.set(ke.key, true));

        // キーが離されたら、キー値の map に false を格納
        addEventListener('keyup', (ke) => this._keyMap.set(ke.key, false));
    }
}
const input = new Input();  // static

// アセットローダークラス
class AssetLoader {
    constructor() {
        this._promises = [];        // 非同期処理配列
        this._assets = new Map();   // 素材配列
    }

    // 画像を追加
    async addImage(name, url) {
        const img = new Image();
        img.src = url;

        // イメージを返却
        const promise = new Promise((resolve, reject) => {
            img.addEventListener('load', (e) => {
                this._assets.set(name, img);
                resolve(img);
            });
        });

        // 非同期を追加
        this._promises.push(promise);
    }

    // 画像が全て読み込まれたら実行
    loadAll() {
        return Promise.all(this._promises).then((p) => this._assets);
    }

    // 素材をゲット
    get(name) {
        return this._assets.get(name);
    }
}
const assets = new AssetLoader();  // static

// スプライトクラス
class Sprite {
    constructor(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.img = img;    // 画像
        this.sx = sx;      // 画像切り取り位置X
        this.sy = sy;      // 画像切り取り位置Y
        this.sw = sw;      // 画像切り取り幅
        this.sh = sh;      // 画像切り取り高さ
        this.dx = dx;      // 画像描画位置X
        this.dy = dy;      // 画像描画位置Y
        this.dw = dw;      // 画像描画幅
        this.dh = dh;      // 画像描画高さ
    }
}

// テキストクラス
class TextActor {
    constructor(font, color, name, x, y) {
        this.font = font;       // 文字サイズ
        this.color = color;     // 文字色
        this.name = name;       // 本文
        this.x = x;             // 文字開始位置X
        this.y = y;             // 文字開始位置Y
    }

    // 更新処理
    upate() {
    }

    // 描画処理
    draw(ctx) {
        ctx.font = this.font;           // 文字サイズを指定
        ctx.fillStyle = this.color;     // 文字色を指定
        ctx.fillText(this.name, this.x, this.y);
    }
}

// メッセージテキストクラス
class MessegeText {
    constructor(name, messes, o = {}) { // o はオプション
        this.nFont = (typeof o.nFont !== 'undefined') ?  o.nFont : '32px serif';  // キャラ名フォント
            this.nColor = (typeof o.nColor !== 'undefined') ?  o.nColor : 'white';    // キャラ名色
            this.nX = (typeof o.nX !== 'undefined') ?  o.nX : 35;                     // キャラ名X
            this.nY = (typeof o.nY !== 'undefined') ?  o.nY : 450;                    // キャラ名Y
            this.mFont = (typeof o.mFont !== 'undefined') ?  o.mFont : '28px serif';  // メッセージフォント
            this.mColor = (typeof o.mColor !== 'undefined') ?  o.mColor : 'white';    // メッセージ色
            this.mX = (typeof o.mX !== 'undefined') ?  o.mX : 35;                     // メッセージX
            this.mY = (typeof o.mY !== 'undefined') ?  o.mY : 500;                    // メッセージY
            this.messesSpace = (typeof o.messesSpace !== 'undefined') ?  o.messesSpace : 30;  // メッセージ間の間隔(縦)

            this.name = name;       // キャラ名
            this.messes = messes;   // メッセージ配列
            this._count = 0;        // カウンター

            this.yukkuri = false;   // 文字を出し終わっているか
            this.yukkuriPace = 5;   // 文字を出す間隔
            this.yukkuriCount = this.messes.map(m => 0);   // 文字を出す数
            this.yukkuriMesses = this.messes.map(m => ''); // ゆっくりメッセージ
    }

    // 更新処理
    update() {
        // ゆっくり表示が終わっているならリターン
        if (this.yukkuri) { return; }

        // カウンタを加算
        this._count++;

        // カウンタがしきい値になったら文字を表示
        if(this._count > this.yukkuriPace) {
            // カウンタをリセット
            this._count = 0;

            // 戻り値が false だった場合、ゆっくり処理終了
            if(!this._yukkuri()) { this.yukkuri = true; }
        }
    }

    // 描画処理
    draw(ctx) {
        // キャラ名を描画
        ctx.font = this.nFont;
        ctx.fillStyle = this.nColor;
        ctx.fillText(this.name, this.nX, this.nY);

        // メッセージを描画
        ctx.font = this.mFont;
        ctx.fillStyle = this.mColor;

        for(let i = 0; i < this.yukkuriMesses.length; i++) {
            ctx.fillText(this.yukkuriMesses[i],
                this.mX, this.mY + this.messesSpace * i);
        }
    }

    // ゆっくり文字を出す
    _yukkuri() {
        // 処理が行われたか確認
        let flag = false;

        // メッセージ配列を確認
        for(let i = 0; i < this.messes.length; i++) {
            // messes の長さが yukkuri と同じでないなら先頭から yukkuri + 1 文字取得
            if(this.yukkuriMesses[i].length != this.messes[i].length) {
                this.yukkuriCount[i]++;
                this.yukkuriMesses[i] = this.messes[i].slice(0, this.yukkuriCount[i]);

                // 処理フラグを立てる
                flag = true;
            }
            // 処理フラグが true の場合 return
            if(flag) {return flag;}
        }
        return flag;
    }
}

// アクタークラス
class Actor {
    constructor(sprite) {
        this.sprite = sprite;  // キャラ見た目

        this.tag = [];         // キャラクター情報
        this.active = true;    // アクティブ
    }

    // 更新処理
    update() {}

    // 描画処理
    draw(ctx) {
        // アクティブでなかったら、グレーにする
        if(!this.active) {ctx.fillter = 'brightness(0.5)'}

        ctx.drawImage(this.sprite.img,
            this.sprite.sx, this.sprite.sy,
            this.sprite.sw, this.sprite.sh,
            this.sprite.dx, this.sprite.dy,
            this.sprite.dw, this.sprite.dh);
        
        // フィルターをリセット
        ctx.fillter = 'none';
    }
}

// シーンクラス
class Scene {
    constructor() {
        this.actors = [];  // アクター配列

        const haikei = assets.get('haikei-01');
        const messegeWind = assets.get('messegeWind-01');
        const reimu = assets.get('reimu-01');
        const marisa = assets.get('marisa-01');

        this.dialogueCount = 0;          // セリフカウンタ
        this.scenario = new Scenario();  // シナリオ

        // 背景を追加
        this.actors.push(new Actor(new Sprite(haikei,
            0, 0, haikei.width, haikei.height,
            0, 0, game.screenWidth, game.screenHeight)));

        // 霊夢を追加
        this.actors.push(new Actor(new Sprite(reimu,
            0, 0, reimu.width, reimu.height,
            0, 50, reimu.width / 1.5, reimu.height / 1.5)));

        // 魔理沙
        this.actors.push(new Actor(new Sprite(marisa,
            0, 0, marisa.width, marisa.height,
            450, 50, marisa.width / 1.5, marisa.height / 1.5)));

        // メッセージウィンド
        this.actors.push(new Actor(new Sprite(messegeWind,
            0, 0, messegeWind.width, messegeWind.height,
            20, 150, messegeWind.width / 2.5, messegeWind.height / 2.5)));
        
        // 霊夢のセリフ
        this.actors.push(this.scenario.getScenario(this.dialogueCount));

        // クリック時のイベントを追加
        addEventListener('click', (e) => this._chegeDialogue());
    }

    // アクター追加
    addActor(actor) {
        this.actors.push(actor);
    }

    // 更新処理
    update() {
        const ctx = game.canvas.getContext('2d');
        this._update();
        this._draw(ctx);
    }

    // アクター更新
    _update() {
        // キャラクター更新
        this.actors.forEach(actor => {
            actor.update();
        });
    }

    // アクター描画
    _draw(ctx) {
        // キャラクター更新処理
        this.actors.forEach(actor => {
            actor.draw(ctx);
        });
    }

    // セリフを入れ替える
    _chegeDialogue() {
        // カウントアップ
        this.dialogueCount++;

        // カウントが配列の長さ以上なら、0に戻す
        if(this.dialogueCount >= this.scenario.scenarios.length) {
            this.dialogueCount = 0;
        }

        // 配列の末尾を削除
        this.actors.pop();

        // 配列の末尾に新しいセリフを追加
        this.actors.push(this.scenario.getScenario(this.dialogueCount));
    }
}

// ゲームクラス
class Game {
    constructor(width, height) {
        const fps = 60;         // fps
        this._fpsTime = 1000 / fps * 0.9;   // fpsTime
        this._prevTime = 0;     // 前回の実行時間

        this.scene;
        this.screenWidth = width;
        this.screenHeight = height;

        this.canvas = document.getElementById('canvas');
        this.canvas.width = width;      // キャンバス幅
        this.canvas.height = height;    // キャンバス高さ
    }

    // ゲームループ
    _loop(timestamp) {
        const elapsedSec = timestamp - this._prevTime;  // 経過時間
        if(elapsedSec <= this._fpsTime) {
            requestAnimationFrame(this._loop.bind(this));
            return;
        }

        // 前回の実行時間を保持
        this._prevTime = timestamp;

        // シーン処理を実行
        this.scene.update();

        requestAnimationFrame(this._loop.bind(this));
    }

    // スタート処理
    start() {
        this.scene = new Scene();
        requestAnimationFrame(this._loop.bind(this));
    }
}

// ゲームオブジェクトを作成
const game = new Game(800, 600);

// 画像の読み込み開始
assets.addImage('haikei-01', 'img/haikei_001_book.jpg');
assets.addImage('messegeWind-01', 'img/item_001.png');
assets.addImage('reimu-01', 'img/kyara_01_01.png');
assets.addImage('marisa-01', 'img/kyara_02_01.png');

// 画像の読み込み完了したらゲームを開始
assets.loadAll().then(a => {
    game.start();
});