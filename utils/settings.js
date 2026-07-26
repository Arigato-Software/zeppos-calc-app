import { getText } from '@zos/i18n'
import { getPackageInfo } from '@zos/app'

import Layout from '../page/settings.layout.js'
import { Settings } from '../libs/settings'

export default class SettingsScene {

    constructor(params, config){
        console.log('Settings init');

        this.page = params;
        this.config = config;
        this.settings = new Settings({
            layout: Layout.settings,
        });
        this.main = false;
    }

    build(){
        console.log('Settings build');

        this.settings.scrollBar();
        
        switch (this.page){
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

    onDestroy(){
        console.log('Settings destroy');
    }

    pageMain(){
        this.settings.title({text: getText('settings')});

        this.settings.addCheckboxGroup({
            items: [getText('vibra')],
            init: [this.config.vibra],
            click_func: (index, checked) => {
                if (index === 0){
                    this.config.vibra = checked;
                }
            },
        });

        this.settings.addHelpButton({
            click_func: () => {this.settings.openPage('about')},
        });
    }

    pageAbout(){
        const packageInfo = getPackageInfo()
        const name = packageInfo.name ?? '--';
        const version = packageInfo.version ?? '0.0.0';
        const vender = packageInfo.vender ?? '';

        this.settings.addAbout({
            title: getText('about'),
            text: `\n${name} v${version}\n` +
                  `${vender}, 2024-2026.`,
        });
    }

}