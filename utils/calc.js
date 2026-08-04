import { getText } from '@zos/i18n'

export class Calc {
    constructor() {
        this.config = {
            angle_mode: 0, // 0 - DEG, 1 - RAD, 2 - GRAD
            precision: -1,  // -1 - авто/макс, или 0, 1, 2, 3... (количество знаков)
        };
        this.expression = ""; // Строка для отображения выражения
        this.result = ""; // Строка для отображения результата
        this.currentInput = "0"; // Текущее вводимое число
        this.replacement = false; // Флаг замены вводимого значения после выполнения унарной операции
        this.rnd_base = ""; // База для генерации случайного числа
        this.memory = ""; // Память калькулятора
        this.input_error = false; // Флаг ошибки поля ввода
        this.memory_error = false; // Флаг ошибки памяти
        this.operations = ["+", "-", "*", "/", "%", "^"]; // Список операций (в коде еще встречается внутри регулярок!)
        this.precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 }; // приоритеты операций
    }

    trimTrailingZeros(numberString) {
        // Проверяем, является ли строка числом с дробной частью
        if (numberString.includes(".")) {
            // Удаляем все незначимые нули в конце дробной части
            numberString = numberString.replace(/\.?0+$/, "");
            if (numberString.endsWith(".")) numberString = numberString.slice(0, -1);
            if (parseFloat(numberString) == 0) numberString = "0";
        }
        if (numberString === "-0") numberString = "0";
        return numberString;
    }

    getStringValue(value, input = true) {
        if (Math.abs(value) > 999999999999999) {
            if (input) {
                this.input_error = true;
            } else {
                this.memory_error = true;
            }
            return getText('overflow');
        }

        // Исправляем погрешности близкие к целым числам
        const rounded = Math.round(value);
        if (Math.abs(value - rounded) < 1e-10) {
            value = rounded;
        }

        // Если пользователь задал конкретную точность (знаков после запятой)
        if (this.config.precision > -1) {
            value = parseFloat(value.toFixed(this.config.precision));
        }

        // Округляем результат до заданной точности
        const prec = 14;
        if (value.toString().indexOf('e') > -1) {
            value = this.trimTrailingZeros(value.toFixed(prec - 1));
        } else if (Math.abs(value).toString().length > prec + 1) {
            value = this.trimTrailingZeros(value.toPrecision(prec));
            if (Math.abs(value).toString().length == prec + 1) {
                value = value.toString();
                // Исправляем неточность вычислений
                if (value.endsWith("01") || value.endsWith("02")) {
                    for (let i = value.length - 2; i >= 0; i--) {
                        if (!["-", ".", "0"].includes(value[i])) {
                            value = value.slice(0, i + 1);
                            break;
                        }
                    }
                } else if (value.endsWith("9") || value.endsWith("98")) {
                    for (let i = value.length - 2; i >= 0; i--) {
                        if (!["-", ".", "9"].includes(value[i])) {
                            value = value.slice(0, i) + (parseInt(value[i]) + 1).toString();
                            break;
                        }
                    }
                }
            }
        }
        return value.toString();
    }

    getCurrentInput() {
        const input = this.currentInput || this.result || "";
        return !isNaN(input) && input !== "" && !this.input_error ? parseFloat(input) : "";
    }

    replaceValue(value) {
        this.currentInput = value;
        if (!this.input_error) {
            const trimmedExpr = this.expression.trimEnd();
            // Если выражение заканчивается на ), добавляем неявное умножение
            if (trimmedExpr.endsWith(")")) {
                this.expression = trimmedExpr + " * " + value;
            } else {
                const lastNumberLength = this.expression.split(/\s+/).pop().length;
                if (lastNumberLength) {
                    this.expression = this.expression.slice(0, -lastNumberLength);
                }
                this.expression += value;
            }
        }
    }

    toRadians(value) {
        switch (this.config.angle_mode) {
            case 1: return value; // RAD
            case 2: return value * (Math.PI / 200); // GRAD
            default: return value * (Math.PI / 180); // DEG
        }
    }

    fromRadians(value) {
        switch (this.config.angle_mode) {
            case 1: return value; // RAD
            case 2: return value * (200 / Math.PI); // GRAD
            default: return value * (180 / Math.PI); // DEG
        }
    }

    cleanResult(value) {
        if (Math.abs(value) < 1e-10) return 0;
        return value;
    }

    // Метод MR (Memory Recall) — выводит значение из памяти в currentInput
    memoryRecall() {
        if (this.memory && !isNaN(this.memory) && !this.input_error && !this.memory_error) {
            if (this.result) this.clear();
            this.replaceValue(this.getStringValue(parseFloat(this.memory)));
            this.replacement = true;
        }
    }

    // Метод MS (Memory Store) — сохраняет текущий ввод в память
    memoryStore(rnd_base) {
        this.rnd_base = rnd_base;
        const input = this.getCurrentInput();
        if (input !== "") {
            this.memory = input.toString();
            this.replacement = true;
            this.memory_error = false;
        }
    }

    // Метод MC (Memory Clear) — очищает память
    memoryClear(rnd_base) {
        this.rnd_base = rnd_base;
        this.memory = "";
        this.replacement = true;
        this.memory_error = false;
    }

    // Метод M+ (Memory Add) — добавляет текущее значение в память
    memoryAdd(rnd_base) {
        this.rnd_base = rnd_base;
        const input = this.getCurrentInput();
        if (input !== "" && !isNaN(this.memory) && !this.memory_error) {
            const memory = this.memory ? parseFloat(this.memory) : 0;
            this.memory = this.getStringValue(memory + input, false);
            this.replacement = true;
        }
    }

    // Метод M- (Memory Subtract) — вычитает текущее значение из памяти
    memorySubtract(rnd_base) {
        this.rnd_base = rnd_base;
        const input = this.getCurrentInput();
        if (input !== "" && !isNaN(this.memory) && !this.memory_error) {
            const memory = this.memory ? parseFloat(this.memory) : 0;
            this.memory = this.getStringValue(memory - input, false);
            this.replacement = true;
        }
    }

    enterDigit(digit) {
        if (isNaN(this.currentInput) || isNaN(this.result) || this.input_error) return;
        if (this.result) this.clear();
        // Если выражение заканчивается на ), добавляем неявное умножение
        if (this.expression.trimEnd().endsWith(")")) {
            this.expression += "* ";
        }
        if (this.replacement || this.currentInput === "0" || this.currentInput === "-0") {
            if (!this.replacement && this.currentInput === "-0") digit = `-${digit}`;
            this.replaceValue(digit);
            this.replacement = false;
            return;
        }
        if (this.currentInput.length < 15 || this.currentInput.length < 16 && this.currentInput.startsWith("-")) {
            this.currentInput += digit;
            this.expression += digit;
        }
    }

    enterDecimal() {
        if (isNaN(this.currentInput) || isNaN(this.result) || this.input_error) return;
        if (this.result) this.clear();
        // Если выражение заканчивается на ), добавляем неявное умножение
        if (this.expression.trimEnd().endsWith(")")) {
            this.expression += "* ";
        }
        if (this.replacement || this.currentInput === "0") {
            this.replaceValue("0.");
            this.replacement = false;
            return;
        }
        if (!this.currentInput.includes(".")) {
            if (!this.expression) {
                this.expression = "0";
            }
            this.currentInput += ".";
            this.expression += ".";
        }
    }

    toggleSign() {
        if (isNaN(this.currentInput) || isNaN(this.result) || this.input_error) return;

        const lastChar = this.expression.trimEnd().slice(-1);

        // Если выражение заканчивается на ), ищем парную ( и меняем знак перед ней
        if (lastChar === ")") {
            let depth = 0;
            let openIndex = -1;

            // Идем справа налево, чтобы найти парную открывающую скобку
            for (let i = this.expression.length - 1; i >= 0; i--) {
                if (this.expression[i] === ')') {
                    depth++;
                } else if (this.expression[i] === '(') {
                    depth--;
                    if (depth === 0) {
                        openIndex = i;
                        break;
                    }
                }
            }

            if (openIndex !== -1) {
                let prefix = this.expression.substring(0, openIndex);

                if (prefix.endsWith("-")) {
                    // Убираем минус и пробелы между ним и скобкой
                    prefix = prefix.slice(0, -1);
                } else {
                    // Добавляем минус перед скобкой
                    prefix += "-";
                }
                this.expression = prefix + this.expression.substring(openIndex);
                return;
            }
        }

        if (this.replacement && this.expression.endsWith(" ")) {
            this.replaceValue("-0");
            this.replacement = false;
            return;
        }
        if (this.result && this.expression.endsWith("=")) {
            this.result = this.result.startsWith("-")
                ? this.result.slice(1)
                : "-" + this.result;
            return;
        }
        if (this.result) this.clear();

        // Меняем знак текущего числа
        this.currentInput = this.currentInput.startsWith("-")
            ? this.currentInput.slice(1)
            : "-" + this.currentInput;

        // Обновляем выражение
        this.replaceValue(this.currentInput);
    }

    enterOperation(operation) {
        if (this.input_error) return;
        if (this.result) {
            if (isNaN(this.result)) return;
            this.currentInput = this.result;
            this.expression = this.result;
        } else {
            if (isNaN(this.currentInput)) return;
        }

        const lastChar = this.expression.trimEnd().slice(-1);
        if (this.currentInput && (!this.expression.endsWith(" ") || lastChar === "(" || lastChar === ")")) {
            if (lastChar !== ")") {
                this.replaceValue(this.trimTrailingZeros(this.currentInput));
            } else {
                this.expression = this.expression.trimEnd();
            }
            if (["+", "-"].includes(operation)) {
                try {
                    this.currentInput = this.getStringValue(this.evaluateExpression(this.getExpressionToEval()));
                } catch (error) {
                    this.input_error = true;
                    this.currentInput = getText("error");
                }
            }
            this.expression += ` ${operation} `;
        } else if (this.expression) {
            this.expression = this.expression.trimEnd().replace(/[\+\-\*\/%\^]$/, operation) + " ";
        }

        this.result = "";
        this.replacement = true;
    }

    openBracket() {
        if (this.input_error) return;

        // Если предыдущее вычисление завершено, начинаем новое выражение
        if (this.result) {
            this.clear();
        }

        // Проверяем число открытых скобок — не более 9
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        if (openCount - closeCount >= 9) {
            return;
        }

        // Определяем, пустое ли выражение и начат ли ввод нового числа
        const isExpressionEmpty = !this.expression || this.expression.trim() === "";
        const isNewNumber = this.currentInput === "0" || this.currentInput === "-0" || this.replacement;

        const lastChar = this.expression.trimEnd().slice(-1);

        // Если до скобки была операция или другая открывающая скобка
        if (isExpressionEmpty && isNewNumber || ["(", ...this.operations].includes(lastChar) || this.currentInput === "-0") {
            if (this.currentInput === "-0") {
                this.expression = this.expression.slice(0, -1);
            }
            this.expression += "( ";
            this.currentInput = "0";
            this.replacement = true;
        }
        // Если до скобки было число (или закрывающая скобка)
        else {
            // Фиксируем текущее число в выражении, если оно еще не зафиксировано
            if (this.currentInput && !this.replacement) {
                this.replaceValue(this.trimTrailingZeros(this.currentInput));
            }
            // Добавляем неявное умножение
            this.expression = this.expression.trimEnd() + " * ( ";
            this.currentInput = "0";
            this.replacement = true;
        }
    }

    closeBracket() {
        if (this.input_error) return;

        // Проверяем количество открытых скобок
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        if (openCount - closeCount <= 0) {
            return;
        }

        const trimmedExpr = this.expression.trimEnd();
        const lastChar = trimmedExpr.slice(-1);

        // Если закрывающая скобка идет сразу после открывающей — отменяем ввод
        if (lastChar === "(") {
            // Удаляем последнюю открывающую скобку
            this.expression = trimmedExpr.replace(/\(\s*$/, "");
            if (this.expression.slice(-1) === "-") {
                this.expression = this.expression.slice(0, -1);
            }
            this.currentInput = "0";
            this.replacement = true;
            return;
        }

        // Фиксируем текущее число, если оно еще не зафиксировано
        if (this.currentInput && !isNaN(this.currentInput) && lastChar !== ")") {
            this.replaceValue(this.trimTrailingZeros(this.currentInput));
        }

        // Добавляем закрывающую скобку
        this.expression = this.expression.trimEnd() + " ) ";

        // Проверяем, получилось ли ( число ) — если да, упрощаем
        const simplified = this.expression.replace(/\(\s*([\d.\-]+)\s*\)/g, "$1");
        if (simplified !== this.expression) {
            this.expression = simplified.trimEnd();
            // Берем последний токен из упрощенного выражения
            const tokens = this.expression.split(/\s+/);
            this.currentInput = tokens[tokens.length - 1];
        } else {
            // Вычисляем значение
            try {
                this.currentInput = this.getStringValue(this.evaluateExpression(this.getExpressionToEval(true)));
            } catch (error) {
                this.input_error = true;
                this.currentInput = getText("error");
            }
        }
        this.replacement = true;
    }

    // Метод для вычисления квадратного корня
    sqrt() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value >= 0) {
            res = this.getStringValue(Math.sqrt(value));
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    sqr() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(value * value);
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    exp() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(Math.exp(value));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    ln() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value > 0) {
            res = this.getStringValue(Math.log(value));
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    e() {
        if (!this.input_error) {
            if (this.result) this.clear();
            const res = this.getStringValue(Math.E);
            this.replaceValue(res);
            this.replacement = true;
        }
    }

    cbrt() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(Math.cbrt(value));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    cube() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(value * value * value);
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    ten() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(Math.pow(10, value));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    log() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value > 0) {
            res = this.getStringValue(Math.log10(value));
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    pi() {
        if (!this.input_error) {
            if (this.result) this.clear();
            const res = this.getStringValue(Math.PI);
            this.replaceValue(res);
            this.replacement = true;
        }
    }

    fact() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (Number.isInteger(value) && value >= 0) {
            if (value > 170) {
                this.input_error = true;
                res = getText('overflow');
            } else {

                res = 1;
                for (let i = 2; i <= value; i++) {
                    res *= i;
                }
                res = this.getStringValue(res);
            }
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    rnd(rnd_base) {
        const value = rnd_base !== "" ? parseFloat(rnd_base) : this.getCurrentInput();
        if (value === "") return;
        let res;
        if (rnd_base === "") {
            rnd_base = this.currentInput || this.result || "";
        }
        if (this.result) this.clear();
        this.rnd_base = rnd_base;
        if (value != 0) {
            const sign = Math.sign(value);
            const absValue = Math.abs(value);
            const isFloat = this.rnd_base.includes(".");
            if (isFloat) {
                // Дробное число: случайное дробное от 0 до value
                res = sign * Math.random() * absValue;
            } else {
                // Целое число: случайное целое от 0 до value-1
                res = sign * Math.floor(Math.random() * absValue);
            }
        } else res = 0;
        res = this.getStringValue(res);
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    sin() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(this.cleanResult(Math.sin(this.toRadians(value))));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    asin() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value >= -1 && value <= 1) {
            res = this.getStringValue(this.fromRadians(Math.asin(value)));
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    tan() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        const radians = this.toRadians(value);
        // Проверка: тангенс не определен при cos(x) ≈ 0 (±90°, ±270° и т.д.)
        if (parseFloat(this.getStringValue(Math.abs(Math.cos(radians)))) < 1e-10) {
            this.input_error = true;
            res = getText("error");
        } else {
            res = this.getStringValue(this.cleanResult(Math.tan(radians)));
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    atan() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(this.fromRadians(Math.atan(value)));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    round() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(Math.sign(value) * Math.round(Math.abs(value)));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    cos() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(this.cleanResult(Math.cos(this.toRadians(value))));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    acos() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value >= -1 && value <= 1) {
            res = this.getStringValue(this.fromRadians(Math.acos(value)));
        } else {
            this.input_error = true;
            res = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    ctan() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        const radians = this.toRadians(value);
        if (parseFloat(this.getStringValue(Math.abs(Math.sin(radians)))) < 1e-10) {
            this.input_error = true;
            res = getText("error");
        } else {
            res = this.getStringValue(this.cleanResult(1 / Math.tan(radians)));
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    actan() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const res = this.getStringValue(this.fromRadians(Math.PI / 2 - Math.atan(value)));
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    sec() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const radians = this.toRadians(value);
        const cosVal = Math.cos(radians);
        let res;
        if (Math.abs(cosVal) < 1e-10) {
            this.input_error = true;
            res = getText("error");
        } else {
            res = this.getStringValue(this.cleanResult(1 / cosVal));
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    csc() {
        const value = this.getCurrentInput();
        if (value === "") return;
        const radians = this.toRadians(value);
        const sinVal = Math.sin(radians);
        let res;
        if (Math.abs(sinVal) < 1e-10) {
            this.input_error = true;
            res = getText("error");
        } else {
            res = this.getStringValue(this.cleanResult(1 / sinVal));
        }
        if (this.currentInput) {
            this.replaceValue(res);
        } else {
            this.result = res;
        }
        this.replacement = true;
    }

    reciprocal() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let reciprocalValue;
        if (value != 0) {
            reciprocalValue = this.getStringValue(1 / value);
        } else {
            this.input_error = true;
            reciprocalValue = getText("error");
        }
        if (this.currentInput) {
            this.replaceValue(reciprocalValue);
        } else {
            this.result = reciprocalValue;
        }
        this.replacement = true;
    }

    // Метод для вычисления процента
    percent() {
        const value = this.getCurrentInput();
        if (value === "") return;

        let percentValue = 0;
        if (this.result) {
            percentValue = value / 100;
        } else {
            try {
                const last = this.getLastOperation();
                if (["+", "-"].includes(last.operation)) {
                    percentValue = (last.value * value) / 100;
                } else {
                    percentValue = value / 100;
                }
            } catch (error) {
                this.input_error = true;
                this.currentInput = getText("error");
                return;
            }
        }
        percentValue = this.getStringValue(percentValue);

        if (this.currentInput) {
            // Заменяем currentInput на вычисленный процент
            this.replaceValue(percentValue);
            this.replacement = true;
        } else {
            this.result = percentValue;
        }
    }

    getLastOperation() {
        const parts = this.expression.trim().split(/\s+/);
        for (let i = parts.length - 1; i >= 0; i--) {
            if (this.operations.includes(parts[i])) {
                const exp = parts.slice(0, i).join(' ');
                const value = this.evaluateExpression(this.getExpressionToEval(false, exp));
                return { value, operation: parts[i] };
            }
        }
        return { value: 0, operation: "" };
    }

    getRepeatData() {
        const tokens = this.expression.trim().split(/\s+/);

        // Исключаем "=" из конца массива, если он есть
        if (tokens[tokens.length - 1] === "=") {
            tokens.pop();
        }

        const operators = [];
        let balance = 0;

        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            if (t === ')') balance--;
            else if (t === '(' || t === '-(') balance++;
            else if (balance === 0 && this.precedence[t] !== undefined) {
                operators.push({ index: i, op: t, priority: this.precedence[t] });
            }
        }

        if (operators.length === 0) {
            return { op: "", term: "" };
        }

        const lastOp = operators[operators.length - 1];
        let cutIndex = lastOp.index;

        // Идем справа налево от последнего оператора
        for (let i = operators.length - 2; i >= 0; i--) {
            const curr = operators[i];

            if (curr.priority < lastOp.priority) {
                // Нашли оператор более низкого приоритета -> группируем всё от него до конца
                cutIndex = curr.index;
                break;
            } else if (curr.priority > lastOp.priority) {
                // Нашли оператор более высокого приоритета -> оставляем только последнюю операцию
                break;
            }
            // Если приоритет такой же, ничего не делаем и идем дальше влево. 
            // Если до конца цикла не встретим более низкий приоритет, 
            // cutIndex так и останется lastOp.index (оставляем только последнюю операцию).
        }

        return {
            op: tokens[cutIndex],
            term: tokens.slice(cutIndex + 1).join(" ")
        };
    }

    calculate() {
        try {
            if (isNaN(this.result) || isNaN(this.currentInput) || this.input_error) {
                return;
            }
            if (this.expression) {
                if (!this.currentInput) {
                    if (this.result) {
                        const repeat = this.getRepeatData();
                        this.expression = `${this.result} ${repeat.op} ${repeat.term}`;
                    } else {
                        this.expression = this.expression.replace(/\s[\+\-\*\/%\^]\s$/, "");
                    }
                } else if (this.expression.trimEnd().slice(-1) !== ")") {
                    this.replaceValue(this.trimTrailingZeros(this.currentInput));
                }
                const openCount = (this.expression.match(/\(/g) || []).length;
                const closeCount = (this.expression.match(/\)/g) || []).length;
                const openBracket = openCount - closeCount;
                for (let i = 0; i < openBracket; ++i) {
                    this.closeBracket();
                }
                this.expression = this.expression.trim() + " =";
                this.result = this.getStringValue(this.evaluateExpression(this.expression));
            } else {
                this.expression = "0 =";
                this.result = "0";
            }
        } catch (error) {
            this.input_error = true;
            this.result = getText("error");
        }
        this.currentInput = "";
        this.replacement = false;
    }

    // Метод для сброса
    clear() {
        this.expression = "";
        this.result = "";
        this.rnd_base = "";
        this.currentInput = "0";
        this.replacement = false;
        this.input_error = false;
    }

    lastOperand() {
        // Удаляем пробелы в конце выражения
        const tokens = this.expression.trimEnd().split(/\s+/);
        let token = tokens.pop();
        const count = tokens.length;
        if (count > 0 && isNaN(token)) {
            token = tokens.pop();
        }
        if (token !== "0" && count > 0) {
            tokens.push(token);
            this.expression = tokens.join(" ");
        } else {
            this.expression = tokens.join(" ") + " ";
        }
        this.currentInput = token; // Последний операнд

        if (isNaN(this.currentInput) || this.currentInput === "" || this.currentInput === " ") {
            this.currentInput = "0";
            this.expression += " ";
        }
        // Очищаем результат
        this.result = "";
    }

    // Метод для стирания последней введенной цифры
    backspace(rnd_base) {
        if (rnd_base !== "") {
            this.replacement = false;
            this.clearLastNumber();
            return;
        }
        if (this.input_error) {
            this.lastOperand();
            this.replacement = false;
            this.input_error = false;
        } else if (!this.currentInput || isNaN(this.currentInput) || this.replacement || this.currentInput === "0") {
            this.clearLastNumber();
        } else {
            // Удаляем последнюю цифру из currentInput
            if (this.currentInput === "-0" || this.currentInput.length == 1) {
                this.clearLastNumber();
            } else if (this.currentInput.length == 2 && this.currentInput.startsWith("-")) {
                this.replaceValue("-0");
            } else {
                this.currentInput = this.currentInput.slice(0, -1);
                this.expression = this.expression.slice(0, -1);
            }
        }
        if (this.expression.trim() === "") {
            this.expression = "";
        }
        this.input_error = false;
    }

    // Метод для удаления последнего введенного числа целиком
    clearLastNumber() {
        // Если число существует, удаляем его
        if (!this.replacement && this.currentInput && this.currentInput !== "0") {
            // Удаляем последнее число из выражения
            const tokens = this.expression.trimEnd().split(/\s+/);
            const lastToken = tokens.pop();
            if (!isNaN(lastToken) || isNaN(this.currentInput) || this.input_error) {
                this.expression = tokens.join(" ") + " ";
            }
            // Очищаем currentInput
            this.currentInput = "0";
        } else {
            this.lastOperand();
        }
        this.replacement = false;
        this.input_error = false;
    }

    getExpressionToEval(bracket = false, exp = null) {
        const trimmedExpr = exp ? exp.trimEnd() : this.expression.trimEnd();

        // Если выражение заканчивается на ), берем всю последнюю скобку целиком
        if (bracket) {
            let balance = 1;
            let openPos = -1;
            for (let i = trimmedExpr.length - 2; i >= 0; i--) {
                if (trimmedExpr[i] === ')') balance++;
                else if (trimmedExpr[i] === '(') {
                    balance--;
                    if (balance === 0) {
                        openPos = i;
                        break;
                    }
                }
            }

            // Проверяем наличие унарного минуса строго перед '(' (пробелов нет)
            let start = openPos;
            if (openPos > 0 && trimmedExpr[openPos - 1] === "-") {
                start = openPos - 1;
            }

            // Возвращаем подстроку ВМЕСТЕ с возможным минусом и скобками.
            // evaluateExpression сам корректно вычислит -(выражение)
            return trimmedExpr.substring(start).trim();
        }

        // Иначе берем кусок после последней незакрытой (
        let balance = 0;
        let lastOpenParen = -1;
        for (let i = trimmedExpr.length - 1; i >= 0; i--) {
            if (trimmedExpr[i] === ')') balance++;
            else if (trimmedExpr[i] === '(') {
                balance--;
                if (balance < 0) {
                    lastOpenParen = i;
                    break;
                }
            }
        }
        return trimmedExpr.substring(lastOpenParen + 1).trim();
    }

    evaluateExpression(expr) {
        // Рекурсивно сворачиваем все скобки
        let openPos;
        while ((openPos = expr.lastIndexOf("(")) !== -1) {
            const closePos = expr.indexOf(")", openPos);

            if (closePos === -1) throw new Error("Error");

            // Извлекаем выражение внутри скобок
            const innerExpr = expr.substring(openPos + 1, closePos).trim();

            // Вызываем рекурсивно
            let innerResult = this.evaluateExpression(innerExpr);

            // Ищем унарный минус строго перед '('
            let replaceStart = openPos;
            if (openPos > 0 && expr[openPos - 1] === "-") {
                innerResult = -innerResult;
                replaceStart = openPos - 1;
            }

            // Меняем в expr блок "(...)" или "-(...)" на результат
            const before = expr.substring(0, replaceStart);
            const after = expr.substring(closePos + 1);
            expr = before + innerResult + after;
        }

        const tokens = expr.split(/\s+/);
        const values = [];
        const operators = [];

        const applyOperator = () => {
            const b = values.pop();
            const a = values.pop();
            const op = operators.pop();
            let value = NaN;
            switch (op) {
                case "+": value = a + b; break;
                case "-": value = a - b; break;
                case "*": value = a * b; break;
                case "/":
                    if (b === 0) throw new Error("Error");
                    value = a / b;
                    break;
                case "%":
                    if (b === 0) throw new Error("Error");
                    value = a % b;
                    break;
                case "^": value = Math.pow(a, b); break;
            }
            if (isNaN(value)) throw new Error("Error");
            values.push(value);
        };

        for (const token of tokens) {
            if (!isNaN(parseFloat(token))) {
                values.push(parseFloat(token));
            } else if (this.operations.includes(token)) {
                while (
                    operators.length &&
                    this.precedence[operators[operators.length - 1]] >= this.precedence[token]
                ) {
                    applyOperator();
                }
                operators.push(token);
            }
        }

        while (operators.length) {
            applyOperator();
        }

        return values[0];
    }
}
