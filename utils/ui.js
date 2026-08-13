import { getText } from '@zos/i18n'
import { createWidget, widget, prop, getTextLayout } from '@zos/ui'
import { onKey, KEY_UP, KEY_DOWN, KEY_SELECT, KEY_SHORTCUT, KEY_EVENT_CLICK, KEY_EVENT_LONG_PRESS, onDigitalCrown, KEY_HOME } from '@zos/interaction'
import { Vibrator, Buzzer } from '@zos/sensor'
import { LocalStorage } from '@zos/storage'
import { Scrolling, SCROLL_MODE_HORIZONTAL } from '../libs/scrolling'

const globalData = getApp()._options.globalData;
const calc = globalData.calc;

export class UI {

    constructor(params) {
        this.params = params;
        this.interval = null;
        this.vibrator = new Vibrator();
        this.buzzer = null;
        try {
            this.buzzer = new Buzzer();
        } catch (e) {
            console.log('Buzzer init failed (simulator/device limitation)');
        }
        this.load();

        // Выбор раскладки
        switch (calc.config.calc_mode) {
            case 0: this.params.keyboard.keys = this.params.standardKeys; break;
            case 1: this.params.keyboard.keys = this.params.scientificKeys; break;
            default: this.params.keyboard.keys = [];
        }
        delete this.params.standardKeys;
        delete this.params.scientificKeys;

        this.keyboardShow();
        this.displayShow();
    }

    validateStorageValue(key, def = '') {
        const value = this.storage[key];
        if (typeof value === 'object' || value === null || Array.isArray(value)) {
            this.storage[key] = def;
        }
        if (typeof value === 'number') {
            this.storage[key] = this.storage[key].toString();
        }
    }

    load() {
        const localStorage = new LocalStorage();
        const storage = JSON.parse(localStorage.getItem('calc', '{}'));
        this.storage = {
            pos_x: this.params.keyboard.pos_x,
            expression: '',
            result: '',
            currentInput: '0',
            replacement: false,
            rnd_base: '',
            memory: '',
            input_error: false,
            memory_error: false,
            button_feedback: 1,
            angle_mode: 1, // 0 - DEG, 1 - RAD, 2 - GRAD
            precision: -1,  // -1 - авто/макс, или 0, 1, 2, 3... (количество знаков)
            calc_mode: 0,   // 0 - обычный, 1 - инженерный
            ...storage
        };
        this.validateStorageValue('currentInput', '0');
        this.validateStorageValue('expression');
        this.validateStorageValue('result');
        this.validateStorageValue('rnd_base');
        this.validateStorageValue('memory');
        calc.config = this.storage;
        calc.expression = this.storage.expression;
        let val = this.storage.result;
        calc.result = val.trim() !== "" && !isNaN(Number(val)) && Number(val) != 0 ? calc.getStringValue(parseFloat(val)) : val;
        val = this.storage.currentInput;
        calc.currentInput = val.trim() !== "" && !isNaN(Number(val)) && Number(val) != 0 ? calc.getStringValue(parseFloat(val)) : val;
        calc.replacement = this.storage.replacement;
        calc.rnd_base = this.storage.rnd_base;
        calc.memory = this.storage.memory;
        calc.input_error = this.storage.input_error;
        calc.memory_error = this.storage.memory_error;
    }

    save() {
        this.storage.expression = calc.expression;
        this.storage.result = calc.result;
        this.storage.currentInput = calc.currentInput;
        this.storage.replacement = calc.replacement;
        this.storage.rnd_base = calc.rnd_base;
        this.storage.memory = calc.memory;
        this.storage.input_error = calc.input_error;
        this.storage.memory_error = calc.memory_error;
        const localStorage = new LocalStorage();
        localStorage.setItem('calc', JSON.stringify(this.storage));
    }

    showText(elem, text, param) {
        let size = param.size_max;
        for (; size >= param.size_min; size--) {
            const style = {
                text_size: size,
                text_width: 666,
                wrapped: 0,
            };
            const { width } = getTextLayout(text, style);
            if (width <= param.w) break;
        }
        elem.setProperty(prop.MORE, { text_size: size });
        elem.setProperty(prop.TEXT, text);
    }

    formatExpression(expression) {
        let exp = expression.replace(/\*/g, "×").replace(/\//g, "÷").replace(/%/g, "mod");
        if (calc.rnd_base !== "") {
            exp = exp.split(" ").slice(0, -1).join(" ") + ` rnd(${calc.rnd_base})`;
        }
        return exp;
    }

    showEdit() {
        this.showText(this.edit, calc.result !== "" ? calc.result : calc.currentInput, this.params.display.edit);
        this.showText(this.exp, this.formatExpression(calc.expression), this.params.display.exp);
        this.showText(this.memory, calc.memory, this.params.display.memory);
        const text = calc.memory !== "" ? getText("memory") : "";
        this.hint.setProperty(prop.TEXT, text);
        this.edit.setProperty(prop.MORE, { color: calc.input_error ? this.params.display.error : this.params.display.edit.style.color });
        this.memory.setProperty(prop.MORE, { color: calc.memory_error ? this.params.display.error : this.params.display.memory.style.color });

        // Считаем количество открытых скобок
        if (this.openBracketButton) {
            const openCount = (calc.expression.match(/\(/g) || []).length;
            const closeCount = (calc.expression.match(/\)/g) || []).length;
            const openBracket = openCount - closeCount;
            const subscripts = ['', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
            const subscriptChar = subscripts[openBracket] ?? '';
            this.openBracketButton.setProperty(prop.TEXT, `(${subscriptChar}`);
        }
    }

    displayShow() {
        const container = createWidget(widget.VIEW_CONTAINER, {
            scroll_enable: false,
            ...this.params.display.container
        });
        container.createWidget(widget.STROKE_RECT, this.params.display.rect.style);
        this.hint = container.createWidget(widget.TEXT, this.params.display.hint);
        this.memory = container.createWidget(widget.TEXT, this.params.display.memory.style);
        this.edit = container.createWidget(widget.TEXT, this.params.display.edit.style);
        this.exp = container.createWidget(widget.TEXT, this.params.display.exp.style);
        this.showEdit();
    }

    keyboardShow() {

        // Рассчитываем ширину первого ряда клавиш клавиатуры
        const xIndent = Math.floor(this.params.keyboard.s - this.params.keyboard.indent / 2);
        let keyboardWidth = 2 * xIndent;
        for (const key of this.params.keyboard.keys[0]) {
            if (key.hasOwnProperty('indent')) {
                keyboardWidth += this.params.keyboard.indent * key.indent;
            } else {
                keyboardWidth += this.params.keyboard.s * (key.cols ?? 1);
            }
        }

        const scrolling = new Scrolling({
            mode: SCROLL_MODE_HORIZONTAL,
            step_x: this.params.keyboard.indent,
            scroll_complete_func: (info) => { this.storage.pos_x = info.x },
            container: {
                y: this.params.keyboard.y,
                w: keyboardWidth,
                pos_x: this.storage.pos_x,
            },
        });

        onKey({
            callback: (key, keyEvent) => {
                switch (keyEvent) {
                    case KEY_EVENT_CLICK:
                        if (key === KEY_SELECT || key === KEY_SHORTCUT) {
                            this.click((rnd_base) => {
                                if (calc.input_error) {
                                    calc.backspace(rnd_base);
                                } else {
                                    calc.calculate();
                                }
                            });
                            return true;
                        }
                        if (key === KEY_UP) {
                            this.click(() => calc.enterOperation("+"));
                        }
                        if (key === KEY_DOWN) {
                            this.click(() => calc.enterOperation("-"));
                        }
                        break;
                    case KEY_EVENT_LONG_PRESS:
                        if (key === KEY_SELECT || key === KEY_SHORTCUT) {
                            this.click(() => calc.clear());
                            return true;
                        }
                        break;
                }
                return false;
            },
        });

        onDigitalCrown({
            callback: (key, degree) => {
                if (key === KEY_HOME) {
                    if (Math.sign(degree) > 0) {
                        this.click(() => calc.enterOperation("+"));
                    }
                    if (Math.sign(degree) < 0) {
                        this.click(() => calc.enterOperation("-"));
                    }
                }
            },
        });

        let y = 0;
        for (const row of this.params.keyboard.keys) {
            let x = xIndent;
            for (const key of row) {
                let w = this.params.keyboard.s;
                if (key) {
                    if (key.hasOwnProperty('indent')) {
                        w = this.params.keyboard.indent * key.indent;
                    } else {
                        w *= key.cols ?? 1;
                        const h = this.params.keyboard.s * (key.rows ?? 1);
                        const param = {
                            x: x + 2,
                            y: y + 2,
                            w: w - 4,
                            h: h - 4,
                            click_func: () => this.click(key.click ?? null),
                            longpress_func: () => this.click(key.longpress ?? null),
                        };
                        if (key.src) {
                            param.normal_src = `${key.src}_normal.png`;
                            param.press_src = `${key.src}_press.png`;
                        } else {
                            param.radius = this.params.keyboard.radius;
                            param.normal_color = key.color;
                            param.press_color = key.color + 0x404040;
                            param.text_size = key.text_size ?? this.params.keyboard.text_size;
                            param.text = key.text;
                        }
                        const button = scrolling.container.createWidget(widget.BUTTON, param);
                        scrolling.setScrolling(button);
                        if (param.text === "(") {
                            this.openBracketButton = button;
                        }
                    }
                }
                x += w;
            }
            y += this.params.keyboard.s;
        }

    }

    click(callback) {
        this.buttonFeedback();
        if (callback) {
            const rnd_base = calc.rnd_base;
            calc.rnd_base = "";
            callback(rnd_base);
            this.showEdit();
        }
    }

    buttonFeedback() {
        switch (this.storage.button_feedback) {
            case 1:
                const types = this.vibrator.getType();
                this.vibrator.start([{ type: types.CONTINUOUS, duration: 20 }]);
                break;
            case 2:
                this.vibrator.start({ mode: 17 });
                break;
            case 3:
                if (this.buzzer) {
                    const alarmType = this.buzzer.getSourceType()['REMIND_2'];
                    if (this.buzzer.isEnabled()) {
                        this.buzzer.start(alarmType);
                    }
                }
                break;
        }
    }

}