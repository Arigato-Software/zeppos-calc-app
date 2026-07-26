import { getText } from '@zos/i18n'
import * as Styles from 'zosLoader:./index.[pf].layout.js'
import { setWakeUpRelaunch } from '@zos/display'
import { LocalStorage } from '@zos/storage'
import SettingsScene from '../utils/settings.js';

Page({
  onInit(params) {
    setWakeUpRelaunch({ relaunch: true }); // Чтобы страница не закрывалась когда потухнет экран
    const localStorage = new LocalStorage();
    const storage = JSON.parse(localStorage.getItem('calc', '{}'));
    config = {
        vibra: true,
        ...storage
    }
    this.scene = new SettingsScene(params, config);
  },

  build() {
    this.scene?.build?.();
  },

  onDestroy() {
    const localStorage = new LocalStorage();
    localStorage.setItem('calc', JSON.stringify(this.scene.config));
    this.scene?.onDestroy?.();
  }

})
