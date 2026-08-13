import { getText } from '@zos/i18n'
import { px } from "@zos/utils"
import { exit } from '@zos/router'
import * as Router from '@zos/router'

const globalData = getApp()._options.globalData;
const calc = globalData.calc;

export const standardKeys = [
    
    [
        {
            text: 'OFF',
            color: 0x404040,
            text_size: px(28),
            click: (rnd_base) => {
                calc.rnd_base = rnd_base;
                exit();
            },
        },

        {
            indent: 1,
        },

        {
            text: 'C',
            color: 0x600000,
            click: () => calc.clear(),
        },
        {
            text: '←',
            color: 0x000060,
            click: (rnd_base) => calc.backspace(rnd_base),
            longpress: () => calc.clearLastNumber(),
        },

        {
            indent: 1,
        },

        {
            text: '7',
            color: 0x404040,
            click: () => calc.enterDigit('7'),
        },
        {
            text: '8',
            color: 0x404040,
            click: () => calc.enterDigit('8'),
        },
        {
            text: '9',
            color: 0x404040,
            click: () => calc.enterDigit('9'),
        },

        {
            indent: 1,
        },

        {
            text: '×',
            color: 0x606060,
            click: () => calc.enterOperation("*"),
        },
        {
            text: '÷',
            color: 0x606060,
            click: () => calc.enterOperation("/"),
        },
        {
            text: '√',
            color: 0x606060,
            click: () => calc.sqrt(),
        },
    ],
    [
        {
            src: 'settings',
            color: 0x404040,
            click: (rnd_base) => {
                calc.rnd_base = rnd_base;
                Router.push({ url: 'page/settings' });
            }
        },

        {
            indent: 1,
        },

        {
            text: 'MC',
            color: 0x606060,
            click: (rnd_base) => calc.memoryClear(rnd_base),
        },
        {
            text: 'MS',
            color: 0x606060,
            click: (rnd_base) => calc.memoryStore(rnd_base),
        },

        {
            indent: 1,
        },

        {
            text: '4',
            color: 0x404040,
            click: () => calc.enterDigit('4'),
        },
        {
            text: '5',
            color: 0x404040,
            click: () => calc.enterDigit('5'),
        },
        {
            text: '6',
            color: 0x404040,
            click: () => calc.enterDigit('6'),
        },

        {
            indent: 1,
        },

        {
            text: '+',
            color: 0x606060,
            click: () => calc.enterOperation("+"),
        },
        {
            text: '-',
            color: 0x606060,
            click: () => calc.enterOperation("-"),
        },
        {
            text: '%',
            color: 0x606060,
            click: () => calc.percent(),
        },
    ],
    [
        null,

        {
            indent: 1,
        },

        {
            text: 'M-',
            color: 0x606060,
            click: (rnd_base) => calc.memorySubtract(rnd_base),
        },
        {
            text: 'M+',
            color: 0x606060,
            click: (rnd_base) => calc.memoryAdd(rnd_base),
        },

        {
            indent: 1,
        },

        {
            text: '1',
            color: 0x404040,
            click: () => calc.enterDigit('1'),
        },
        {
            text: '2',
            color: 0x404040,
            click: () => calc.enterDigit('2'),
        },
        {
            text: '3',
            color: 0x404040,
            click: () => calc.enterDigit('3'),
        },

        {
            indent: 1,
        },

        {
            text: '=',
            rows: 2,
            color: 0x006000,
            click: () => calc.calculate(),
        },
        {
            text: '(',
            color: 0x606060,
            click: () => calc.openBracket(),
        },
        {
            text: '1/x',
            color: 0x606060,
            text_size: px(23),
            click: () => calc.reciprocal(),
        },
    ],
    [
        null,

        {
            indent: 1,
        },

        {
            text: 'MR',
            color: 0x606060,
            cols: 2,
            click: () => calc.memoryRecall(),
        },

        {
            indent: 1,
        },

        {
            text: '+/-',
            color: 0x404040,
            click: () => calc.toggleSign(),
        },
        {
            text: '0',
            color: 0x404040,
            click: () => calc.enterDigit('0'),
        },
        {
            text: '.',
            color: 0x404040,
            click: () => calc.enterDecimal(),
        },

        {
            indent: 1,
        },

        null,
        {
            text: ')',
            color: 0x606060,
            click: () => calc.closeBracket(),
        },
    ],

];