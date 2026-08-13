import { px } from "@zos/utils"
import { align } from '@zos/ui'

import { standardKeys } from './layout.s.standard.js'
import { scientificKeys } from './layout.s.scientific.js'

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
      h: px(18),
      color: 0xa0b0c0,
      text_size: px(18),
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
        radius: px(18),
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
      size_min: px(18),
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
    radius: px(18),
    indent: px(13),
  },

  standardKeys,
  scientificKeys,

};
