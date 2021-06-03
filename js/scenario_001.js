'use strict';

// シナリオクラス
class Scenario {
    constructor() {
        this.scenarios = [
            {
                name:'霊夢',
                messes:['適当になんかしゃべって',
                'ノベルゲームのイメージ']
            },
            {
                name:'魔理沙',
                messes:['画面をクリックするとメッセージが進むぜ',
                'メッセージは配列で渡せるぞ！'
                ]
            },
            {
                name:'霊夢',
                messes:['とりあえずファーストコミット！',
                '思ってたよりソースコードがひどかったから',
                '修正がひつようそう']
            }
        ]
    }

    // シナリオゲット
    getScenario(number) {
        const scenario = this.scenarios[number];
        return new MessegeText(scenario.name,
            scenario.messes,
            scenario.o);
    }
}