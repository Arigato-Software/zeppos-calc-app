import { getText } from '@zos/i18n'
import { px } from "@zos/utils"
import { align } from '@zos/ui'
import { exit } from '@zos/router'
import { showToast } from '@zos/interaction'

const globalData = getApp()._options.globalData;
const calc = globalData.calc;

// Клавиатура состоит из 3-х блоков клавиш
export const params = {
  display: {
    container: {
      x: 0,
      y: 0,
      w: px(390),
      h: px(172),
    },
    hint: {
      text: '',
      x: px(146),
      y: px(35),
      w: px(390 - 146 * 2),
      h: px(20),
      color: 0xa0b0c0,
      text_size: px(20),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
    },
    memory: {
      style: {
        text: '',
        x: px(32),
        y: px(60),
        w: px(390 - 32 * 2),
        h: px(30),
        color: 0xa0b0c0,
        text_size: px(28),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
      },
      size_max: px(28),
      size_min: px(14),
      w: px(390 - 32 * 2),
    },
    rect: {
      style: {
        x: px(15),
        y: px(92),
        w: px(390 - 15 * 2),
        h: px(80),
        radius: px(20),
        line_width: 1,
        color: 0x888888
      },
    },
    edit: {
      style: {
        text: '',
        x: px(24),
        y: px(116),
        w: px(390 - 24 * 2),
        h: px(48),
        color: 0xffffff,
        text_size: px(40),
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
      },
      size_max: px(40),
      size_min: px(20),
      w: px(390 - 24 * 2),
    },
    exp: {
      style: {
        text: '',
        x: px(27),
        y: px(94),
        w: px(390 - 27 * 2),
        h: px(30),
        color: 0xaaaaaa,
        text_size: px(24),
        align_h: align.RIGHT,
        align_v: align.CENTER_V,
      },
      size_max: px(24),
      size_min: px(12),
      w: px(390 - 27 * 2),
    },
    error: 0xff4040,
  },
  keyboard: {
    y: px(182),
    s: px(65),
    pos_x: -px(182),
    text_size: px(29),
    radius: px(20),
    indent: px(13),
    keys: [

      [
        {
          text: 'OFF',
          color: 0x404040,
          text_size: px(28),
          click: () => exit(),
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
          click: () => calc.backspace(),
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
          text: '+',
          color: 0x606060,
          click: () => calc.enterOperation("+"),
        },
        {
          text: '√',
          color: 0x606060,
          click: () => calc.sqrt(),
        },
        {
          text: 'ₓ²',
          color: 0x606060,
          text_size: px(23),
          click: () => calc.sqr(),
        },
      ],
      [
        {
          text: '?',
          color: 0x404040,
          click: () => showToast({ content: getText("help") }),
        },

        {
          indent: 1,
        },

        {
          text: 'MC',
          color: 0x606060,
          click: () => calc.memoryClear(),
        },
        {
          text: 'MS',
          color: 0x606060,
          click: () => calc.memoryStore(),
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
          text: '-',
          color: 0x606060,
          click: () => calc.enterOperation("-"),
        },
        {
          text: '%',
          color: 0x606060,
          click: () => calc.percent(),
        },
        {
          text: 'ₓʸ',
          color: 0x606060,
          click: () => calc.enterOperation("^"),
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
          click: () => calc.memorySubtract(),
        },
        {
          text: 'M+',
          color: 0x606060,
          click: () => calc.memoryAdd(),
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
          text: '×',
          color: 0x606060,
          click: () => calc.enterOperation("*"),
        },
        {
          text: '=',
          rows: 2,
          color: 0x006000,
          click: () => calc.calculate(),
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
          cols: 2,
          color: 0x606060,
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

        {
          text: '÷',
          color: 0x606060,
          click: () => calc.enterOperation("/"),
        },
        null,
        {
          text: 'mod',
          color: 0x606060,
          text_size: px(23),
          click: () => calc.enterOperation("%"),
        },

      ],

    ],
  },

};
