import { getText } from '@zos/i18n'
import { px } from "@zos/utils"
import { align } from '@zos/ui'
import { exit } from '@zos/router'
import { showToast } from '@zos/interaction'
import * as Router from '@zos/router'

const globalData = getApp()._options.globalData;
const calc = globalData.calc;

// Клавиатура состоит из 3-х блоков клавиш
export const params = {
  display: {
    container: {
      x: 0,
      y: 0,
      w: px(480),
      h: px(140),
    },
    hint: {
      text: '',
      x: px(180),
      y: px(5),
      w: px(480 - 180 * 2),
      h: px(20),
      color: 0xa0b0c0,
      text_size: px(20),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
    },
    memory: {
      style: {
        text: '',
        x: px(130),
        y: px(25),
        w: px(480 - 130 * 2),
        h: px(30),
        color: 0xa0b0c0,
        text_size: px(28),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
      },
      size_max: px(28),
      size_min: px(14),
      w: px(480 - 130 * 2),
    },
    rect: {
      style: {
        x: px(80),
        y: px(60),
        w: px(480 - 80 * 2),
        h: px(80),
        radius: px(20),
        line_width: 1,
        color: 0x888888
      },
    },
    edit: {
      style: {
        text: '',
        x: px(92),
        y: px(88),
        w: px(480 - 92 * 2),
        h: px(48),
        color: 0xffffff,
        text_size: px(40),
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
      },
      size_max: px(40),
      size_min: px(20),
      w: px(480 - 92 * 2),
    },
    exp: {
      style: {
        text: '',
        x: px(95),
        y: px(62),
        w: px(480 - 95 * 2),
        h: px(30),
        color: 0xaaaaaa,
        text_size: px(24),
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
      },
      size_max: px(24),
      size_min: px(12),
      w: px(480 - 95 * 2),
    },
    error: 0xff4040,
  },
  keyboard: {
    y: px(150),
    s: px(80),
    pos_x: -px(224),
    text_size: px(36),
    radius: px(20),
    indent: px(16),
    keys: [

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
          indent: 1,
        },

        {
          text: 'MOD',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.enterOperation("%"),
        },

        {
          indent: 1,
        },

        {
          text: 'ₓʸ',
          color: 0x606060,
          click: () => calc.enterOperation("^"),
        },
        {
          text: '1/x',
          color: 0x606060,
          text_size: px(23),
          click: () => calc.reciprocal(),
        },
        {
          text: 'LOG',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.log(),
        },

        {
          indent: 1,
        },

        {
          text: 'SIN',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.sin(),
        },
        {
          text: 'ASIN',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.asin(),
        },
        {
          text: getText('csc'),
          color: 0x606060,
          text_size: px(20),
          click: () => calc.csc(),
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
          indent: 1,
        },

        {
          text: '%',
          color: 0x606060,
          click: () => calc.percent(),
        },

        {
          indent: 1,
        },

        {
          text: 'ₓ²',
          color: 0x606060,
          click: () => calc.sqr(),
        },

        {
          text: '√',
          color: 0x606060,
          click: () => calc.sqrt(),
        },
        {
          text: '₁₀ˣ',
          color: 0x606060,
          click: () => calc.ten(),
        },

        {
          indent: 1,
        },

        {
          text: 'COS',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.cos(),
        },
        {
          text: 'ACOS',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.acos(),
        },
        {
          text: 'SEC',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.sec(),
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
          indent: 1,
        },

        {
          text: 'RND',
          color: 0x606060,
          text_size: px(20),
          click: (rnd_base) => calc.rnd(rnd_base),
        },

        {
          indent: 1,
        },

        {
          text: 'ₓ³',
          color: 0x606060,
          click: () => calc.cube(),
        },
        {
          text: '³√',
          color: 0x606060,
          click: () => calc.cbrt(),
        },
        {
          text: 'LN',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.ln(),
        },

        {
          indent: 1,
        },

        {
          text: getText('tan'),
          color: 0x606060,
          text_size: px(20),
          click: () => calc.tan(),
        },
        {
          text: getText('atan'),
          color: 0x606060,
          text_size: px(20),
          click: () => calc.atan(),
        },
        {
          text: 'π',
          color: 0x606060,
          text_size: px(28),
          click: () => calc.pi(),
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

        {
          indent: 1,
        },

        {
          text: 'ROUND',
          color: 0x606060,
          text_size: px(20),
          click: () => calc.round(),
        },

        {
          indent: 1,
        },

        {
          text: 'n!',
          color: 0x606060,
          text_size: px(28),
          click: () => calc.fact(),
        },
        {
          text: 'e',
          color: 0x606060,
          text_size: px(28),
          click: () => calc.e(),
        },
        {
          text: 'ₑˣ',
          color: 0x606060,
          click: () => calc.exp(),
        },

        {
          indent: 1,
        },

        {
          text: getText('ctan'),
          color: 0x606060,
          text_size: px(20),
          click: () => calc.ctan(),
        },
        {
          text: getText('actan'),
          color: 0x606060,
          text_size: px(20),
          click: () => calc.actan(),
        },

      ],

    ],
  },

};
