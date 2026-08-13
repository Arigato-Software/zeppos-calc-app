import { params } from 'zosLoader:./index.[pf].layout.js'
import { setWakeUpRelaunch } from '@zos/display'
import { UI } from '../utils/ui'

Page({
  onInit() {
    setWakeUpRelaunch({ relaunch: true }); // Чтобы страница не закрывалась когда потухнет экран
  },

  build() {

    this.ui = new UI(params);
    this.ui.load();

  },

  onDestroy() {
    this.ui.save();
  }

})
