import { getText } from '@zos/i18n'

export class Calc {
    constructor() {
        this.config = {
            angle_mode: 0, // 0 - DEG, 1 - RAD, 2 - GRAD
        };
        this.expression = ""; // Строка для отображения выражения
        this.result = "";     // Строка для отображения результата
        this.currentInput = "0"; // Текущее вводимое число
        this.replacement = false; // Флаг замены вводимого значения после выполнения унарной операции
        this.memory = ""; // Память калькулятора
        this.input_error = false; // Флаг ошибки поля ввода
        this.memory_error = false; // Флаг ошибки памяти
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
            const lastNumberLength = this.expression.split(/\s+/).pop().length;
            if (lastNumberLength) {
                this.expression = this.expression.slice(0, -lastNumberLength);
            }
            this.expression += value;
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
    memoryStore() {
        const input = this.getCurrentInput();
        if (input !== "") {
            this.memory = input.toString();
            this.replacement = true;
            this.memory_error = false;
        }
    }

    // Метод MC (Memory Clear) — очищает память
    memoryClear() {
        this.memory = "";
        this.replacement = true;
        this.memory_error = false;
    }

    // Метод M+ (Memory Add) — добавляет текущее значение в память
    memoryAdd() {
        const input = this.getCurrentInput();
        if (input !== "" && !isNaN(this.memory) && !this.memory_error) {
            const memory = this.memory ? parseFloat(this.memory) : 0;
            this.memory = this.getStringValue(memory + input, false);
            this.replacement = true;
        }
    }

    // Метод M- (Memory Subtract) — вычитает текущее значение из памяти
    memorySubtract() {
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

        if (this.currentInput && !this.expression.endsWith(" ")) {
            this.replaceValue(this.trimTrailingZeros(this.currentInput));
            if (["+", "-"].includes(operation)) {
                try {
                    this.currentInput = this.getStringValue(this.evaluateExpression(this.expression));
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

    rnd() {
        const value = this.getCurrentInput();
        if (value === "") return;
        let res;
        if (value != 0) {
            const sign = Math.sign(value);
            const absValue = Math.abs(value);
            if (Number.isInteger(value)) {
                // Целое число: случайное целое от 0 до value-1
                res = sign * Math.floor(Math.random() * absValue);
            } else {
                // Дробное число: случайное дробное от 0 до value
                res = sign * Math.random() * absValue;
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
            percentValue = parseFloat(this.result) / 100;
        } else {
            const previous = this.getLastOperand();
            if (["+", "-"].includes(previous.operator)) {
                percentValue = (previous.value * parseFloat(this.currentInput)) / 100;
            } else {
                percentValue = parseFloat(this.currentInput) / 100;
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

    getLastOperand() {
        const parts = this.expression.trim().split(/\s+/);
        let operator = "";
        for (let i = parts.length - 2; i >= 0; i--) {
            if (!isNaN(parts[i])) {
                return { value: parseFloat(parts[i]), operator: operator };
            } else {
                operator = parts[i];
            }
        }
        return { value: 0, operator: operator }; // Если предыдущего числа нет, возвращаем 0
    }

    calculate() {
        try {
            if (isNaN(this.result) || isNaN(this.currentInput) || this.input_error) {
                return;
            }
            if (this.expression) {
                if (!this.currentInput) {
                    if (this.result) {
                        const tokens = this.expression.split(/\s+/);
                        if (tokens.length >= 4) {
                            tokens.pop();
                            const b = tokens.pop();
                            const op = tokens.pop();
                            this.expression = `${this.result} ${op} ${b}`;
                        } else {
                            this.expression = this.result;
                        }
                    } else {
                        this.expression = this.expression.replace(/\s[\+\-\*\/%\^]\s$/, "");
                    }
                } else {
                    this.replaceValue(this.trimTrailingZeros(this.currentInput));
                }
                this.expression += " =";
                this.result = this.getStringValue(this.evaluateExpression(this.expression));
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
        this.currentInput = "0";
        this.replacement = false;
        this.input_error = false;
    }

    lastOperand() {
        // Удаляем пробелы в конце выражения
        const tokens = this.expression.trimEnd().split(/\s+/);
        let token = "";
        do {
            token = tokens.pop();
        } while (tokens.length > 0 && isNaN(token));
        if (token !== "0") {
            tokens.push(token);
            this.expression = tokens.join(" ");
        } else {
            this.expression = tokens.join(" ") + " ";
        }
        this.currentInput = token; // Последний операнд

        if (this.currentInput === "") {
            this.currentInput = "0";
        }

        // Очищаем результат
        this.result = "";
    }

    // Метод для стирания последней введенной цифры
    backspace() {
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
        this.input_error = false;
    }

    // Метод для удаления последнего введенного числа целиком
    clearLastNumber() {
        // Если число существует, удаляем его
        if (this.currentInput && this.currentInput !== "0") {
            // Удаляем последнее число из выражения
            const tokens = this.expression.trimEnd().split(/\s+/);
            if (!isNaN(tokens.pop()) || isNaN(this.currentInput) || this.input_error) {
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

    evaluateExpression(expr) {
        const tokens = expr.split(/\s+/);
        const values = [];
        const operators = [];

        const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };

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
            } else if (["+", "-", "*", "/", "%", "^"].includes(token)) {
                while (
                    operators.length &&
                    precedence[operators[operators.length - 1]] >= precedence[token]
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
