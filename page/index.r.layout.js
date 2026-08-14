import { px } from "@zos/utils"
import { align } from '@zos/ui'

import { standardKeys } from './layout.r.standard'
import { scientificKeys } from './layout.r.scientific'

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
  },

  standardKeys,
  scientificKeys,

};
