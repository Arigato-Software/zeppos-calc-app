import { getText } from '@zos/i18n'
import { getPackageInfo } from '@zos/app'
import { Buzzer } from '@zos/sensor'

import Layout from '../page/settings.layout.js'
import { Settings } from '../libs/settings'

export default class SettingsScene {

    constructor(params, config) {
        console.log('Settings init');

        this.page = params;
        this.config = config;
        this.settings = new Settings({
            layout: Layout.settings,
        });
        this.main = false;
    }

    build() {
        console.log('Settings build');

        this.settings.scrollBar();

        switch (this.page) {
            case 'trigonometry':
                this.pageTrigonometry();
                break;
            case 'precision':
                this.pagePrecision();
                break;
            case 'buttonFeedback':
                this.pageButtonFeedback();
                break;
            case 'reset':
                this.pageReset();
                break;
            case 'about':
                this.pageAbout();
                break;
            default:
                this.pageMain();
                this.main = true;
        }

        this.settings.addFooter();

        this.settings.homeButton();
    }

    onDestroy() {
        console.log('Settings destroy');
    }

    pageMain() {
        this.settings.title({ text: getText('settings') });

        this.settings.addLink({
            text: getText('trigonometry'),
            click_func: () => {this.settings.openPage('trigonometry')},
        });

        this.settings.addLink({
            text: getText('precision'),
            click_func: () => {this.settings.openPage('precision')},
        });

        this.settings.addLink({
            text: getText('buttonFeedback'),
            click_func: () => { this.settings.openPage('buttonFeedback') },
        });

        this.settings.addLink({
            text: getText('reset_title'),
            click_func: () => {this.settings.openPage('reset')},
        });

        this.settings.addHelpButton({
            click_func: () => { this.settings.openPage('about') },
        });
    }

    pageTrigonometry() {
        this.settings.title({ text: getText('trigonometry') });

        const items = [
            getText('deg'),
            getText('rad'),
            getText('grad'),
        ]

        this.settings.addRadioGroup({
            items,
            init: [this.config.angle_mode],
            click_func: (index) => {
                this.config.angle_mode = index;
            },
        });
    }

    pagePrecision() {
        this.settings.title({ text: getText('precision') });

        const items = [
            getText('precision_max'),
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
        ]

        const prec = this.config.precision + 1 < items.length ? this.config.precision + 1 : -1
        this.settings.addRadioGroup({
            items,
            init: [prec],
            click_func: (index) => {
                this.config.precision = index - 1;
            },
        });
    }

    pageButtonFeedback() {
        this.settings.title({ text: getText('buttonFeedback') });

        const items = [
            getText('bf_none'),
            getText('bf_vibration'),
        ]

        try {
            new Buzzer();
            items.push(getText('bf_tap'));
            items.push(getText('bf_beep'));
        } catch (e) { }

        this.settings.addRadioGroup({
            items,
            init: [this.config.button_feedback],
            click_func: (index) => {
                this.config.button_feedback = index;
            },
        });
    }

    pageReset(){
        this.settings.showDialog({
            title: getText('reset_title'),
            text: getText('reset_text'),
            ok_func: () => {
                this.config = {};
            },
        });
    }

    pageAbout() {
        const packageInfo = getPackageInfo()
        const name = packageInfo.name ?? '--';
        const version = packageInfo.version ?? '0.0.0';
        const vender = packageInfo.vender ?? '';

        this.settings.addAbout({
            title: getText('about_title'),
            text: `\n${name}\nv${version}\n` +
                `${vender},\n2024-2026.`,
        });
    }

}