/**
 * ml - Machine learning tools
 * @version v6.0.0
 * @link https://github.com/mljs/ml
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ML = {}));
}(this, (function (exports) { 'use strict';

  const toString$1 = Object.prototype.toString;
  function isAnyArray(object) {
    return toString$1.call(object).endsWith('Array]');
  }

  function max(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var _options$fromIndex = options.fromIndex,
        fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex,
        _options$toIndex = options.toIndex,
        toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;

    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
      throw new Error('fromIndex must be a positive integer smaller than length');
    }

    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
      throw new Error('toIndex must be an integer greater than fromIndex and at most equal to length');
    }

    var maxValue = input[fromIndex];

    for (var i = fromIndex + 1; i < toIndex; i++) {
      if (input[i] > maxValue) maxValue = input[i];
    }

    return maxValue;
  }

  function min(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var _options$fromIndex = options.fromIndex,
        fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex,
        _options$toIndex = options.toIndex,
        toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;

    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
      throw new Error('fromIndex must be a positive integer smaller than length');
    }

    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
      throw new Error('toIndex must be an integer greater than fromIndex and at most equal to length');
    }

    var minValue = input[fromIndex];

    for (var i = fromIndex + 1; i < toIndex; i++) {
      if (input[i] < minValue) minValue = input[i];
    }

    return minValue;
  }

  function rescale(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    } else if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var output;

    if (options.output !== undefined) {
      if (!isAnyArray(options.output)) {
        throw new TypeError('output option must be an array if specified');
      }

      output = options.output;
    } else {
      output = new Array(input.length);
    }

    var currentMin = min(input);
    var currentMax = max(input);

    if (currentMin === currentMax) {
      throw new RangeError('minimum and maximum input values are equal. Cannot rescale a constant array');
    }

    var _options$min = options.min,
        minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min,
        _options$max = options.max,
        maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;

    if (minValue >= maxValue) {
      throw new RangeError('min option must be smaller than max option');
    }

    var factor = (maxValue - minValue) / (currentMax - currentMin);

    for (var i = 0; i < input.length; i++) {
      output[i] = (input[i] - currentMin) * factor + minValue;
    }

    return output;
  }

  const indent = ' '.repeat(2);
  const indentData = ' '.repeat(4);
  function inspectMatrix() {
    return inspectMatrixWithOptions(this);
  }
  function inspectMatrixWithOptions(matrix, options = {}) {
    const {
      maxRows = 15,
      maxColumns = 10,
      maxNumSize = 8
    } = options;
    return `${matrix.constructor.name} {
${indent}[
${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize)}
${indent}]
${indent}rows: ${matrix.rows}
${indent}columns: ${matrix.columns}
}`;
  }

  function inspectData(matrix, maxRows, maxColumns, maxNumSize) {
    const {
      rows,
      columns
    } = matrix;
    const maxI = Math.min(rows, maxRows);
    const maxJ = Math.min(columns, maxColumns);
    const result = [];

    for (let i = 0; i < maxI; i++) {
      let line = [];

      for (let j = 0; j < maxJ; j++) {
        line.push(formatNumber(matrix.get(i, j), maxNumSize));
      }

      result.push(`${line.join(' ')}`);
    }

    if (maxJ !== columns) {
      result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
    }

    if (maxI !== rows) {
      result.push(`... ${rows - maxRows} more rows`);
    }

    return result.join(`\n${indentData}`);
  }

  function formatNumber(num, maxNumSize) {
    const numStr = String(num);

    if (numStr.length <= maxNumSize) {
      return numStr.padEnd(maxNumSize, ' ');
    }

    const precise = num.toPrecision(maxNumSize - 2);

    if (precise.length <= maxNumSize) {
      return precise;
    }

    const exponential = num.toExponential(maxNumSize - 2);
    const eIndex = exponential.indexOf('e');
    const e = exponential.slice(eIndex);
    return exponential.slice(0, maxNumSize - e.length) + e;
  }

  function installMathOperations(AbstractMatrix, Matrix) {
    AbstractMatrix.prototype.add = function add(value) {
      if (typeof value === 'number') return this.addS(value);
      return this.addM(value);
    };

    AbstractMatrix.prototype.addS = function addS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.addM = function addM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.add = function add(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.add(value);
    };

    AbstractMatrix.prototype.sub = function sub(value) {
      if (typeof value === 'number') return this.subS(value);
      return this.subM(value);
    };

    AbstractMatrix.prototype.subS = function subS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.subM = function subM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.sub = function sub(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sub(value);
    };

    AbstractMatrix.prototype.subtract = AbstractMatrix.prototype.sub;
    AbstractMatrix.prototype.subtractS = AbstractMatrix.prototype.subS;
    AbstractMatrix.prototype.subtractM = AbstractMatrix.prototype.subM;
    AbstractMatrix.subtract = AbstractMatrix.sub;

    AbstractMatrix.prototype.mul = function mul(value) {
      if (typeof value === 'number') return this.mulS(value);
      return this.mulM(value);
    };

    AbstractMatrix.prototype.mulS = function mulS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.mulM = function mulM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.mul = function mul(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.mul(value);
    };

    AbstractMatrix.prototype.multiply = AbstractMatrix.prototype.mul;
    AbstractMatrix.prototype.multiplyS = AbstractMatrix.prototype.mulS;
    AbstractMatrix.prototype.multiplyM = AbstractMatrix.prototype.mulM;
    AbstractMatrix.multiply = AbstractMatrix.mul;

    AbstractMatrix.prototype.div = function div(value) {
      if (typeof value === 'number') return this.divS(value);
      return this.divM(value);
    };

    AbstractMatrix.prototype.divS = function divS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.divM = function divM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.div = function div(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.div(value);
    };

    AbstractMatrix.prototype.divide = AbstractMatrix.prototype.div;
    AbstractMatrix.prototype.divideS = AbstractMatrix.prototype.divS;
    AbstractMatrix.prototype.divideM = AbstractMatrix.prototype.divM;
    AbstractMatrix.divide = AbstractMatrix.div;

    AbstractMatrix.prototype.mod = function mod(value) {
      if (typeof value === 'number') return this.modS(value);
      return this.modM(value);
    };

    AbstractMatrix.prototype.modS = function modS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.modM = function modM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.mod = function mod(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.mod(value);
    };

    AbstractMatrix.prototype.modulus = AbstractMatrix.prototype.mod;
    AbstractMatrix.prototype.modulusS = AbstractMatrix.prototype.modS;
    AbstractMatrix.prototype.modulusM = AbstractMatrix.prototype.modM;
    AbstractMatrix.modulus = AbstractMatrix.mod;

    AbstractMatrix.prototype.and = function and(value) {
      if (typeof value === 'number') return this.andS(value);
      return this.andM(value);
    };

    AbstractMatrix.prototype.andS = function andS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.andM = function andM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.and = function and(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.and(value);
    };

    AbstractMatrix.prototype.or = function or(value) {
      if (typeof value === 'number') return this.orS(value);
      return this.orM(value);
    };

    AbstractMatrix.prototype.orS = function orS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.orM = function orM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.or = function or(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.or(value);
    };

    AbstractMatrix.prototype.xor = function xor(value) {
      if (typeof value === 'number') return this.xorS(value);
      return this.xorM(value);
    };

    AbstractMatrix.prototype.xorS = function xorS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.xorM = function xorM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.xor = function xor(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.xor(value);
    };

    AbstractMatrix.prototype.leftShift = function leftShift(value) {
      if (typeof value === 'number') return this.leftShiftS(value);
      return this.leftShiftM(value);
    };

    AbstractMatrix.prototype.leftShiftS = function leftShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.leftShiftM = function leftShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.leftShift = function leftShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.leftShift(value);
    };

    AbstractMatrix.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
      if (typeof value === 'number') return this.signPropagatingRightShiftS(value);
      return this.signPropagatingRightShiftM(value);
    };

    AbstractMatrix.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.signPropagatingRightShift(value);
    };

    AbstractMatrix.prototype.rightShift = function rightShift(value) {
      if (typeof value === 'number') return this.rightShiftS(value);
      return this.rightShiftM(value);
    };

    AbstractMatrix.prototype.rightShiftS = function rightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> value);
        }
      }

      return this;
    };

    AbstractMatrix.prototype.rightShiftM = function rightShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.rightShift = function rightShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.rightShift(value);
    };

    AbstractMatrix.prototype.zeroFillRightShift = AbstractMatrix.prototype.rightShift;
    AbstractMatrix.prototype.zeroFillRightShiftS = AbstractMatrix.prototype.rightShiftS;
    AbstractMatrix.prototype.zeroFillRightShiftM = AbstractMatrix.prototype.rightShiftM;
    AbstractMatrix.zeroFillRightShift = AbstractMatrix.rightShift;

    AbstractMatrix.prototype.not = function not() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, ~this.get(i, j));
        }
      }

      return this;
    };

    AbstractMatrix.not = function not(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.not();
    };

    AbstractMatrix.prototype.abs = function abs() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.abs(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.abs = function abs(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.abs();
    };

    AbstractMatrix.prototype.acos = function acos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acos(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.acos = function acos(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.acos();
    };

    AbstractMatrix.prototype.acosh = function acosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acosh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.acosh = function acosh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.acosh();
    };

    AbstractMatrix.prototype.asin = function asin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asin(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.asin = function asin(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.asin();
    };

    AbstractMatrix.prototype.asinh = function asinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asinh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.asinh = function asinh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.asinh();
    };

    AbstractMatrix.prototype.atan = function atan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atan(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.atan = function atan(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.atan();
    };

    AbstractMatrix.prototype.atanh = function atanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atanh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.atanh = function atanh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.atanh();
    };

    AbstractMatrix.prototype.cbrt = function cbrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cbrt(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.cbrt = function cbrt(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cbrt();
    };

    AbstractMatrix.prototype.ceil = function ceil() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.ceil(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.ceil = function ceil(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.ceil();
    };

    AbstractMatrix.prototype.clz32 = function clz32() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.clz32(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.clz32 = function clz32(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.clz32();
    };

    AbstractMatrix.prototype.cos = function cos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cos(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.cos = function cos(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cos();
    };

    AbstractMatrix.prototype.cosh = function cosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cosh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.cosh = function cosh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cosh();
    };

    AbstractMatrix.prototype.exp = function exp() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.exp(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.exp = function exp(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.exp();
    };

    AbstractMatrix.prototype.expm1 = function expm1() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.expm1(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.expm1 = function expm1(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.expm1();
    };

    AbstractMatrix.prototype.floor = function floor() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.floor(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.floor = function floor(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.floor();
    };

    AbstractMatrix.prototype.fround = function fround() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.fround(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.fround = function fround(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.fround();
    };

    AbstractMatrix.prototype.log = function log() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.log = function log(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log();
    };

    AbstractMatrix.prototype.log1p = function log1p() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log1p(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.log1p = function log1p(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log1p();
    };

    AbstractMatrix.prototype.log10 = function log10() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log10(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.log10 = function log10(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log10();
    };

    AbstractMatrix.prototype.log2 = function log2() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log2(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.log2 = function log2(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log2();
    };

    AbstractMatrix.prototype.round = function round() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.round(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.round = function round(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.round();
    };

    AbstractMatrix.prototype.sign = function sign() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sign(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.sign = function sign(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sign();
    };

    AbstractMatrix.prototype.sin = function sin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sin(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.sin = function sin(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sin();
    };

    AbstractMatrix.prototype.sinh = function sinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sinh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.sinh = function sinh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sinh();
    };

    AbstractMatrix.prototype.sqrt = function sqrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sqrt(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.sqrt = function sqrt(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sqrt();
    };

    AbstractMatrix.prototype.tan = function tan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tan(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.tan = function tan(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.tan();
    };

    AbstractMatrix.prototype.tanh = function tanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tanh(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.tanh = function tanh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.tanh();
    };

    AbstractMatrix.prototype.trunc = function trunc() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.trunc(this.get(i, j)));
        }
      }

      return this;
    };

    AbstractMatrix.trunc = function trunc(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.trunc();
    };

    AbstractMatrix.pow = function pow(matrix, arg0) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.pow(arg0);
    };

    AbstractMatrix.prototype.pow = function pow(value) {
      if (typeof value === 'number') return this.powS(value);
      return this.powM(value);
    };

    AbstractMatrix.prototype.powS = function powS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.pow(this.get(i, j), value));
        }
      }

      return this;
    };

    AbstractMatrix.prototype.powM = function powM(matrix) {
      matrix = Matrix.checkMatrix(matrix);

      if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
        }
      }

      return this;
    };
  }

  /**
   * @private
   * Check that a row index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */
  function checkRowIndex(matrix, index, outer) {
    let max = outer ? matrix.rows : matrix.rows - 1;

    if (index < 0 || index > max) {
      throw new RangeError('Row index out of range');
    }
  }
  /**
   * @private
   * Check that a column index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */

  function checkColumnIndex(matrix, index, outer) {
    let max = outer ? matrix.columns : matrix.columns - 1;

    if (index < 0 || index > max) {
      throw new RangeError('Column index out of range');
    }
  }
  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */

  function checkRowVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }

    if (vector.length !== matrix.columns) {
      throw new RangeError('vector size must be the same as the number of columns');
    }

    return vector;
  }
  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */

  function checkColumnVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }

    if (vector.length !== matrix.rows) {
      throw new RangeError('vector size must be the same as the number of rows');
    }

    return vector;
  }
  function checkIndices(matrix, rowIndices, columnIndices) {
    return {
      row: checkRowIndices(matrix, rowIndices),
      column: checkColumnIndices(matrix, columnIndices)
    };
  }
  function checkRowIndices(matrix, rowIndices) {
    if (typeof rowIndices !== 'object') {
      throw new TypeError('unexpected type for row indices');
    }

    let rowOut = rowIndices.some(r => {
      return r < 0 || r >= matrix.rows;
    });

    if (rowOut) {
      throw new RangeError('row indices are out of range');
    }

    if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);
    return rowIndices;
  }
  function checkColumnIndices(matrix, columnIndices) {
    if (typeof columnIndices !== 'object') {
      throw new TypeError('unexpected type for column indices');
    }

    let columnOut = columnIndices.some(c => {
      return c < 0 || c >= matrix.columns;
    });

    if (columnOut) {
      throw new RangeError('column indices are out of range');
    }

    if (!Array.isArray(columnIndices)) columnIndices = Array.from(columnIndices);
    return columnIndices;
  }
  function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
    if (arguments.length !== 5) {
      throw new RangeError('expected 4 arguments');
    }

    checkNumber('startRow', startRow);
    checkNumber('endRow', endRow);
    checkNumber('startColumn', startColumn);
    checkNumber('endColumn', endColumn);

    if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix.rows || endRow < 0 || endRow >= matrix.rows || startColumn < 0 || startColumn >= matrix.columns || endColumn < 0 || endColumn >= matrix.columns) {
      throw new RangeError('Submatrix indices are out of range');
    }
  }
  function newArray$1(length, value = 0) {
    let array = [];

    for (let i = 0; i < length; i++) {
      array.push(value);
    }

    return array;
  }

  function checkNumber(name, value) {
    if (typeof value !== 'number') {
      throw new TypeError(`${name} must be a number`);
    }
  }

  function checkNonEmpty(matrix) {
    if (matrix.isEmpty()) {
      throw new Error('Empty matrix has no elements to index');
    }
  }

  function sumByRow(matrix) {
    let sum = newArray$1(matrix.rows);

    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[i] += matrix.get(i, j);
      }
    }

    return sum;
  }
  function sumByColumn(matrix) {
    let sum = newArray$1(matrix.columns);

    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[j] += matrix.get(i, j);
      }
    }

    return sum;
  }
  function sumAll(matrix) {
    let v = 0;

    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        v += matrix.get(i, j);
      }
    }

    return v;
  }
  function productByRow(matrix) {
    let sum = newArray$1(matrix.rows, 1);

    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[i] *= matrix.get(i, j);
      }
    }

    return sum;
  }
  function productByColumn(matrix) {
    let sum = newArray$1(matrix.columns, 1);

    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[j] *= matrix.get(i, j);
      }
    }

    return sum;
  }
  function productAll(matrix) {
    let v = 1;

    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        v *= matrix.get(i, j);
      }
    }

    return v;
  }
  function varianceByRow(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];

    for (let i = 0; i < rows; i++) {
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;

      for (let j = 0; j < cols; j++) {
        x = matrix.get(i, j) - mean[i];
        sum1 += x;
        sum2 += x * x;
      }

      if (unbiased) {
        variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
      } else {
        variance.push((sum2 - sum1 * sum1 / cols) / cols);
      }
    }

    return variance;
  }
  function varianceByColumn(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];

    for (let j = 0; j < cols; j++) {
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;

      for (let i = 0; i < rows; i++) {
        x = matrix.get(i, j) - mean[j];
        sum1 += x;
        sum2 += x * x;
      }

      if (unbiased) {
        variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
      } else {
        variance.push((sum2 - sum1 * sum1 / rows) / rows);
      }
    }

    return variance;
  }
  function varianceAll(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const size = rows * cols;
    let sum1 = 0;
    let sum2 = 0;
    let x = 0;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        x = matrix.get(i, j) - mean;
        sum1 += x;
        sum2 += x * x;
      }
    }

    if (unbiased) {
      return (sum2 - sum1 * sum1 / size) / (size - 1);
    } else {
      return (sum2 - sum1 * sum1 / size) / size;
    }
  }
  function centerByRow(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean[i]);
      }
    }
  }
  function centerByColumn(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean[j]);
      }
    }
  }
  function centerAll(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean);
      }
    }
  }
  function getScaleByRow(matrix) {
    const scale = [];

    for (let i = 0; i < matrix.rows; i++) {
      let sum = 0;

      for (let j = 0; j < matrix.columns; j++) {
        sum += Math.pow(matrix.get(i, j), 2) / (matrix.columns - 1);
      }

      scale.push(Math.sqrt(sum));
    }

    return scale;
  }
  function scaleByRow(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale[i]);
      }
    }
  }
  function getScaleByColumn(matrix) {
    const scale = [];

    for (let j = 0; j < matrix.columns; j++) {
      let sum = 0;

      for (let i = 0; i < matrix.rows; i++) {
        sum += Math.pow(matrix.get(i, j), 2) / (matrix.rows - 1);
      }

      scale.push(Math.sqrt(sum));
    }

    return scale;
  }
  function scaleByColumn(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale[j]);
      }
    }
  }
  function getScaleAll(matrix) {
    const divider = matrix.size - 1;
    let sum = 0;

    for (let j = 0; j < matrix.columns; j++) {
      for (let i = 0; i < matrix.rows; i++) {
        sum += Math.pow(matrix.get(i, j), 2) / divider;
      }
    }

    return Math.sqrt(sum);
  }
  function scaleAll(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale);
      }
    }
  }

  class AbstractMatrix {
    static from1DArray(newRows, newColumns, newData) {
      let length = newRows * newColumns;

      if (length !== newData.length) {
        throw new RangeError('data length does not match given dimensions');
      }

      let newMatrix = new Matrix$2(newRows, newColumns);

      for (let row = 0; row < newRows; row++) {
        for (let column = 0; column < newColumns; column++) {
          newMatrix.set(row, column, newData[row * newColumns + column]);
        }
      }

      return newMatrix;
    }

    static rowVector(newData) {
      let vector = new Matrix$2(1, newData.length);

      for (let i = 0; i < newData.length; i++) {
        vector.set(0, i, newData[i]);
      }

      return vector;
    }

    static columnVector(newData) {
      let vector = new Matrix$2(newData.length, 1);

      for (let i = 0; i < newData.length; i++) {
        vector.set(i, 0, newData[i]);
      }

      return vector;
    }

    static zeros(rows, columns) {
      return new Matrix$2(rows, columns);
    }

    static ones(rows, columns) {
      return new Matrix$2(rows, columns).fill(1);
    }

    static rand(rows, columns, options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        random = Math.random
      } = options;
      let matrix = new Matrix$2(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix.set(i, j, random());
        }
      }

      return matrix;
    }

    static randInt(rows, columns, options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        min = 0,
        max = 1000,
        random = Math.random
      } = options;
      if (!Number.isInteger(min)) throw new TypeError('min must be an integer');
      if (!Number.isInteger(max)) throw new TypeError('max must be an integer');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let interval = max - min;
      let matrix = new Matrix$2(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          let value = min + Math.round(random() * interval);
          matrix.set(i, j, value);
        }
      }

      return matrix;
    }

    static eye(rows, columns, value) {
      if (columns === undefined) columns = rows;
      if (value === undefined) value = 1;
      let min = Math.min(rows, columns);
      let matrix = this.zeros(rows, columns);

      for (let i = 0; i < min; i++) {
        matrix.set(i, i, value);
      }

      return matrix;
    }

    static diag(data, rows, columns) {
      let l = data.length;
      if (rows === undefined) rows = l;
      if (columns === undefined) columns = rows;
      let min = Math.min(l, rows, columns);
      let matrix = this.zeros(rows, columns);

      for (let i = 0; i < min; i++) {
        matrix.set(i, i, data[i]);
      }

      return matrix;
    }

    static min(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new Matrix$2(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }

      return result;
    }

    static max(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new this(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }

      return result;
    }

    static checkMatrix(value) {
      return AbstractMatrix.isMatrix(value) ? value : new Matrix$2(value);
    }

    static isMatrix(value) {
      return value != null && value.klass === 'Matrix';
    }

    get size() {
      return this.rows * this.columns;
    }

    apply(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          callback.call(this, i, j);
        }
      }

      return this;
    }

    to1DArray() {
      let array = [];

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          array.push(this.get(i, j));
        }
      }

      return array;
    }

    to2DArray() {
      let copy = [];

      for (let i = 0; i < this.rows; i++) {
        copy.push([]);

        for (let j = 0; j < this.columns; j++) {
          copy[i].push(this.get(i, j));
        }
      }

      return copy;
    }

    toJSON() {
      return this.to2DArray();
    }

    isRowVector() {
      return this.rows === 1;
    }

    isColumnVector() {
      return this.columns === 1;
    }

    isVector() {
      return this.rows === 1 || this.columns === 1;
    }

    isSquare() {
      return this.rows === this.columns;
    }

    isEmpty() {
      return this.rows === 0 || this.columns === 0;
    }

    isSymmetric() {
      if (this.isSquare()) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j <= i; j++) {
            if (this.get(i, j) !== this.get(j, i)) {
              return false;
            }
          }
        }

        return true;
      }

      return false;
    }

    isEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isEchelonForm = true;
      let checked = false;

      while (i < this.rows && isEchelonForm) {
        j = 0;
        checked = false;

        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isEchelonForm = false;
            checked = true;
          }
        }

        i++;
      }

      return isEchelonForm;
    }

    isReducedEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isReducedEchelonForm = true;
      let checked = false;

      while (i < this.rows && isReducedEchelonForm) {
        j = 0;
        checked = false;

        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isReducedEchelonForm = false;
            checked = true;
          }
        }

        for (let k = j + 1; k < this.rows; k++) {
          if (this.get(i, k) !== 0) {
            isReducedEchelonForm = false;
          }
        }

        i++;
      }

      return isReducedEchelonForm;
    }

    echelonForm() {
      let result = this.clone();
      let h = 0;
      let k = 0;

      while (h < result.rows && k < result.columns) {
        let iMax = h;

        for (let i = h; i < result.rows; i++) {
          if (result.get(i, k) > result.get(iMax, k)) {
            iMax = i;
          }
        }

        if (result.get(iMax, k) === 0) {
          k++;
        } else {
          result.swapRows(h, iMax);
          let tmp = result.get(h, k);

          for (let j = k; j < result.columns; j++) {
            result.set(h, j, result.get(h, j) / tmp);
          }

          for (let i = h + 1; i < result.rows; i++) {
            let factor = result.get(i, k) / result.get(h, k);
            result.set(i, k, 0);

            for (let j = k + 1; j < result.columns; j++) {
              result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
            }
          }

          h++;
          k++;
        }
      }

      return result;
    }

    reducedEchelonForm() {
      let result = this.echelonForm();
      let m = result.columns;
      let n = result.rows;
      let h = n - 1;

      while (h >= 0) {
        if (result.maxRow(h) === 0) {
          h--;
        } else {
          let p = 0;
          let pivot = false;

          while (p < n && pivot === false) {
            if (result.get(h, p) === 1) {
              pivot = true;
            } else {
              p++;
            }
          }

          for (let i = 0; i < h; i++) {
            let factor = result.get(i, p);

            for (let j = p; j < m; j++) {
              let tmp = result.get(i, j) - factor * result.get(h, j);
              result.set(i, j, tmp);
            }
          }

          h--;
        }
      }

      return result;
    }

    set() {
      throw new Error('set method is unimplemented');
    }

    get() {
      throw new Error('get method is unimplemented');
    }

    repeat(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        rows = 1,
        columns = 1
      } = options;

      if (!Number.isInteger(rows) || rows <= 0) {
        throw new TypeError('rows must be a positive integer');
      }

      if (!Number.isInteger(columns) || columns <= 0) {
        throw new TypeError('columns must be a positive integer');
      }

      let matrix = new Matrix$2(this.rows * rows, this.columns * columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix.setSubMatrix(this, this.rows * i, this.columns * j);
        }
      }

      return matrix;
    }

    fill(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, value);
        }
      }

      return this;
    }

    neg() {
      return this.mulS(-1);
    }

    getRow(index) {
      checkRowIndex(this, index);
      let row = [];

      for (let i = 0; i < this.columns; i++) {
        row.push(this.get(index, i));
      }

      return row;
    }

    getRowVector(index) {
      return Matrix$2.rowVector(this.getRow(index));
    }

    setRow(index, array) {
      checkRowIndex(this, index);
      array = checkRowVector(this, array);

      for (let i = 0; i < this.columns; i++) {
        this.set(index, i, array[i]);
      }

      return this;
    }

    swapRows(row1, row2) {
      checkRowIndex(this, row1);
      checkRowIndex(this, row2);

      for (let i = 0; i < this.columns; i++) {
        let temp = this.get(row1, i);
        this.set(row1, i, this.get(row2, i));
        this.set(row2, i, temp);
      }

      return this;
    }

    getColumn(index) {
      checkColumnIndex(this, index);
      let column = [];

      for (let i = 0; i < this.rows; i++) {
        column.push(this.get(i, index));
      }

      return column;
    }

    getColumnVector(index) {
      return Matrix$2.columnVector(this.getColumn(index));
    }

    setColumn(index, array) {
      checkColumnIndex(this, index);
      array = checkColumnVector(this, array);

      for (let i = 0; i < this.rows; i++) {
        this.set(i, index, array[i]);
      }

      return this;
    }

    swapColumns(column1, column2) {
      checkColumnIndex(this, column1);
      checkColumnIndex(this, column2);

      for (let i = 0; i < this.rows; i++) {
        let temp = this.get(i, column1);
        this.set(i, column1, this.get(i, column2));
        this.set(i, column2, temp);
      }

      return this;
    }

    addRowVector(vector) {
      vector = checkRowVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[j]);
        }
      }

      return this;
    }

    subRowVector(vector) {
      vector = checkRowVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[j]);
        }
      }

      return this;
    }

    mulRowVector(vector) {
      vector = checkRowVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[j]);
        }
      }

      return this;
    }

    divRowVector(vector) {
      vector = checkRowVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[j]);
        }
      }

      return this;
    }

    addColumnVector(vector) {
      vector = checkColumnVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[i]);
        }
      }

      return this;
    }

    subColumnVector(vector) {
      vector = checkColumnVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[i]);
        }
      }

      return this;
    }

    mulColumnVector(vector) {
      vector = checkColumnVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[i]);
        }
      }

      return this;
    }

    divColumnVector(vector) {
      vector = checkColumnVector(this, vector);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[i]);
        }
      }

      return this;
    }

    mulRow(index, value) {
      checkRowIndex(this, index);

      for (let i = 0; i < this.columns; i++) {
        this.set(index, i, this.get(index, i) * value);
      }

      return this;
    }

    mulColumn(index, value) {
      checkColumnIndex(this, index);

      for (let i = 0; i < this.rows; i++) {
        this.set(i, index, this.get(i, index) * value);
      }

      return this;
    }

    max() {
      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(0, 0);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
          }
        }
      }

      return v;
    }

    maxIndex() {
      checkNonEmpty(this);
      let v = this.get(0, 0);
      let idx = [0, 0];

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }

      return idx;
    }

    min() {
      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(0, 0);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
          }
        }
      }

      return v;
    }

    minIndex() {
      checkNonEmpty(this);
      let v = this.get(0, 0);
      let idx = [0, 0];

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }

      return idx;
    }

    maxRow(row) {
      checkRowIndex(this, row);

      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(row, 0);

      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
        }
      }

      return v;
    }

    maxRowIndex(row) {
      checkRowIndex(this, row);
      checkNonEmpty(this);
      let v = this.get(row, 0);
      let idx = [row, 0];

      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }

      return idx;
    }

    minRow(row) {
      checkRowIndex(this, row);

      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(row, 0);

      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
        }
      }

      return v;
    }

    minRowIndex(row) {
      checkRowIndex(this, row);
      checkNonEmpty(this);
      let v = this.get(row, 0);
      let idx = [row, 0];

      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }

      return idx;
    }

    maxColumn(column) {
      checkColumnIndex(this, column);

      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(0, column);

      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
        }
      }

      return v;
    }

    maxColumnIndex(column) {
      checkColumnIndex(this, column);
      checkNonEmpty(this);
      let v = this.get(0, column);
      let idx = [0, column];

      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }

      return idx;
    }

    minColumn(column) {
      checkColumnIndex(this, column);

      if (this.isEmpty()) {
        return NaN;
      }

      let v = this.get(0, column);

      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
        }
      }

      return v;
    }

    minColumnIndex(column) {
      checkColumnIndex(this, column);
      checkNonEmpty(this);
      let v = this.get(0, column);
      let idx = [0, column];

      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }

      return idx;
    }

    diag() {
      let min = Math.min(this.rows, this.columns);
      let diag = [];

      for (let i = 0; i < min; i++) {
        diag.push(this.get(i, i));
      }

      return diag;
    }

    norm(type = 'frobenius') {
      let result = 0;

      if (type === 'max') {
        return this.max();
      } else if (type === 'frobenius') {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            result = result + this.get(i, j) * this.get(i, j);
          }
        }

        return Math.sqrt(result);
      } else {
        throw new RangeError(`unknown norm type: ${type}`);
      }
    }

    cumulativeSum() {
      let sum = 0;

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          sum += this.get(i, j);
          this.set(i, j, sum);
        }
      }

      return this;
    }

    dot(vector2) {
      if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
      let vector1 = this.to1DArray();

      if (vector1.length !== vector2.length) {
        throw new RangeError('vectors do not have the same size');
      }

      let dot = 0;

      for (let i = 0; i < vector1.length; i++) {
        dot += vector1[i] * vector2[i];
      }

      return dot;
    }

    mmul(other) {
      other = Matrix$2.checkMatrix(other);
      let m = this.rows;
      let n = this.columns;
      let p = other.columns;
      let result = new Matrix$2(m, p);
      let Bcolj = new Float64Array(n);

      for (let j = 0; j < p; j++) {
        for (let k = 0; k < n; k++) {
          Bcolj[k] = other.get(k, j);
        }

        for (let i = 0; i < m; i++) {
          let s = 0;

          for (let k = 0; k < n; k++) {
            s += this.get(i, k) * Bcolj[k];
          }

          result.set(i, j, s);
        }
      }

      return result;
    }

    strassen2x2(other) {
      other = Matrix$2.checkMatrix(other);
      let result = new Matrix$2(2, 2);
      const a11 = this.get(0, 0);
      const b11 = other.get(0, 0);
      const a12 = this.get(0, 1);
      const b12 = other.get(0, 1);
      const a21 = this.get(1, 0);
      const b21 = other.get(1, 0);
      const a22 = this.get(1, 1);
      const b22 = other.get(1, 1); // Compute intermediate values.

      const m1 = (a11 + a22) * (b11 + b22);
      const m2 = (a21 + a22) * b11;
      const m3 = a11 * (b12 - b22);
      const m4 = a22 * (b21 - b11);
      const m5 = (a11 + a12) * b22;
      const m6 = (a21 - a11) * (b11 + b12);
      const m7 = (a12 - a22) * (b21 + b22); // Combine intermediate values into the output.

      const c00 = m1 + m4 - m5 + m7;
      const c01 = m3 + m5;
      const c10 = m2 + m4;
      const c11 = m1 - m2 + m3 + m6;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      return result;
    }

    strassen3x3(other) {
      other = Matrix$2.checkMatrix(other);
      let result = new Matrix$2(3, 3);
      const a00 = this.get(0, 0);
      const a01 = this.get(0, 1);
      const a02 = this.get(0, 2);
      const a10 = this.get(1, 0);
      const a11 = this.get(1, 1);
      const a12 = this.get(1, 2);
      const a20 = this.get(2, 0);
      const a21 = this.get(2, 1);
      const a22 = this.get(2, 2);
      const b00 = other.get(0, 0);
      const b01 = other.get(0, 1);
      const b02 = other.get(0, 2);
      const b10 = other.get(1, 0);
      const b11 = other.get(1, 1);
      const b12 = other.get(1, 2);
      const b20 = other.get(2, 0);
      const b21 = other.get(2, 1);
      const b22 = other.get(2, 2);
      const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
      const m2 = (a00 - a10) * (-b01 + b11);
      const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
      const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
      const m5 = (a10 + a11) * (-b00 + b01);
      const m6 = a00 * b00;
      const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
      const m8 = (-a00 + a20) * (b02 - b12);
      const m9 = (a20 + a21) * (-b00 + b02);
      const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
      const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
      const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
      const m13 = (a02 - a22) * (b11 - b21);
      const m14 = a02 * b20;
      const m15 = (a21 + a22) * (-b20 + b21);
      const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
      const m17 = (a02 - a12) * (b12 - b22);
      const m18 = (a11 + a12) * (-b20 + b22);
      const m19 = a01 * b10;
      const m20 = a12 * b21;
      const m21 = a10 * b02;
      const m22 = a20 * b01;
      const m23 = a22 * b22;
      const c00 = m6 + m14 + m19;
      const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
      const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
      const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
      const c11 = m2 + m4 + m5 + m6 + m20;
      const c12 = m14 + m16 + m17 + m18 + m21;
      const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
      const c21 = m12 + m13 + m14 + m15 + m22;
      const c22 = m6 + m7 + m8 + m9 + m23;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(0, 2, c02);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      result.set(1, 2, c12);
      result.set(2, 0, c20);
      result.set(2, 1, c21);
      result.set(2, 2, c22);
      return result;
    }

    mmulStrassen(y) {
      y = Matrix$2.checkMatrix(y);
      let x = this.clone();
      let r1 = x.rows;
      let c1 = x.columns;
      let r2 = y.rows;
      let c2 = y.columns;

      if (c1 !== r2) {
        // eslint-disable-next-line no-console
        console.warn(`Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`);
      } // Put a matrix into the top left of a matrix of zeros.
      // `rows` and `cols` are the dimensions of the output matrix.


      function embed(mat, rows, cols) {
        let r = mat.rows;
        let c = mat.columns;

        if (r === rows && c === cols) {
          return mat;
        } else {
          let resultat = AbstractMatrix.zeros(rows, cols);
          resultat = resultat.setSubMatrix(mat, 0, 0);
          return resultat;
        }
      } // Make sure both matrices are the same size.
      // This is exclusively for simplicity:
      // this algorithm can be implemented with matrices of different sizes.


      let r = Math.max(r1, r2);
      let c = Math.max(c1, c2);
      x = embed(x, r, c);
      y = embed(y, r, c); // Our recursive multiplication function.

      function blockMult(a, b, rows, cols) {
        // For small matrices, resort to naive multiplication.
        if (rows <= 512 || cols <= 512) {
          return a.mmul(b); // a is equivalent to this
        } // Apply dynamic padding.


        if (rows % 2 === 1 && cols % 2 === 1) {
          a = embed(a, rows + 1, cols + 1);
          b = embed(b, rows + 1, cols + 1);
        } else if (rows % 2 === 1) {
          a = embed(a, rows + 1, cols);
          b = embed(b, rows + 1, cols);
        } else if (cols % 2 === 1) {
          a = embed(a, rows, cols + 1);
          b = embed(b, rows, cols + 1);
        }

        let halfRows = parseInt(a.rows / 2, 10);
        let halfCols = parseInt(a.columns / 2, 10); // Subdivide input matrices.

        let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
        let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
        let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
        let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
        let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
        let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1); // Compute intermediate values.

        let m1 = blockMult(AbstractMatrix.add(a11, a22), AbstractMatrix.add(b11, b22), halfRows, halfCols);
        let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
        let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
        let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
        let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
        let m6 = blockMult(AbstractMatrix.sub(a21, a11), AbstractMatrix.add(b11, b12), halfRows, halfCols);
        let m7 = blockMult(AbstractMatrix.sub(a12, a22), AbstractMatrix.add(b21, b22), halfRows, halfCols); // Combine intermediate values into the output.

        let c11 = AbstractMatrix.add(m1, m4);
        c11.sub(m5);
        c11.add(m7);
        let c12 = AbstractMatrix.add(m3, m5);
        let c21 = AbstractMatrix.add(m2, m4);
        let c22 = AbstractMatrix.sub(m1, m2);
        c22.add(m3);
        c22.add(m6); // Crop output to the desired size (undo dynamic padding).

        let resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
        resultat = resultat.setSubMatrix(c11, 0, 0);
        resultat = resultat.setSubMatrix(c12, c11.rows, 0);
        resultat = resultat.setSubMatrix(c21, 0, c11.columns);
        resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
        return resultat.subMatrix(0, rows - 1, 0, cols - 1);
      }

      return blockMult(x, y, r, c);
    }

    scaleRows(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        min = 0,
        max = 1
      } = options;
      if (!Number.isFinite(min)) throw new TypeError('min must be a number');
      if (!Number.isFinite(max)) throw new TypeError('max must be a number');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let newMatrix = new Matrix$2(this.rows, this.columns);

      for (let i = 0; i < this.rows; i++) {
        const row = this.getRow(i);

        if (row.length > 0) {
          rescale(row, {
            min,
            max,
            output: row
          });
        }

        newMatrix.setRow(i, row);
      }

      return newMatrix;
    }

    scaleColumns(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        min = 0,
        max = 1
      } = options;
      if (!Number.isFinite(min)) throw new TypeError('min must be a number');
      if (!Number.isFinite(max)) throw new TypeError('max must be a number');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let newMatrix = new Matrix$2(this.rows, this.columns);

      for (let i = 0; i < this.columns; i++) {
        const column = this.getColumn(i);

        if (column.length) {
          rescale(column, {
            min: min,
            max: max,
            output: column
          });
        }

        newMatrix.setColumn(i, column);
      }

      return newMatrix;
    }

    flipRows() {
      const middle = Math.ceil(this.columns / 2);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < middle; j++) {
          let first = this.get(i, j);
          let last = this.get(i, this.columns - 1 - j);
          this.set(i, j, last);
          this.set(i, this.columns - 1 - j, first);
        }
      }

      return this;
    }

    flipColumns() {
      const middle = Math.ceil(this.rows / 2);

      for (let j = 0; j < this.columns; j++) {
        for (let i = 0; i < middle; i++) {
          let first = this.get(i, j);
          let last = this.get(this.rows - 1 - i, j);
          this.set(i, j, last);
          this.set(this.rows - 1 - i, j, first);
        }
      }

      return this;
    }

    kroneckerProduct(other) {
      other = Matrix$2.checkMatrix(other);
      let m = this.rows;
      let n = this.columns;
      let p = other.rows;
      let q = other.columns;
      let result = new Matrix$2(m * p, n * q);

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < p; k++) {
            for (let l = 0; l < q; l++) {
              result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
            }
          }
        }
      }

      return result;
    }

    kroneckerSum(other) {
      other = Matrix$2.checkMatrix(other);

      if (!this.isSquare() || !other.isSquare()) {
        throw new Error('Kronecker Sum needs two Square Matrices');
      }

      let m = this.rows;
      let n = other.rows;
      let AxI = this.kroneckerProduct(Matrix$2.eye(n, n));
      let IxB = Matrix$2.eye(m, m).kroneckerProduct(other);
      return AxI.add(IxB);
    }

    transpose() {
      let result = new Matrix$2(this.columns, this.rows);

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          result.set(j, i, this.get(i, j));
        }
      }

      return result;
    }

    sortRows(compareFunction = compareNumbers) {
      for (let i = 0; i < this.rows; i++) {
        this.setRow(i, this.getRow(i).sort(compareFunction));
      }

      return this;
    }

    sortColumns(compareFunction = compareNumbers) {
      for (let i = 0; i < this.columns; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
      }

      return this;
    }

    subMatrix(startRow, endRow, startColumn, endColumn) {
      checkRange(this, startRow, endRow, startColumn, endColumn);
      let newMatrix = new Matrix$2(endRow - startRow + 1, endColumn - startColumn + 1);

      for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
        }
      }

      return newMatrix;
    }

    subMatrixRow(indices, startColumn, endColumn) {
      if (startColumn === undefined) startColumn = 0;
      if (endColumn === undefined) endColumn = this.columns - 1;

      if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
        throw new RangeError('Argument out of range');
      }

      let newMatrix = new Matrix$2(indices.length, endColumn - startColumn + 1);

      for (let i = 0; i < indices.length; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          if (indices[i] < 0 || indices[i] >= this.rows) {
            throw new RangeError(`Row index out of range: ${indices[i]}`);
          }

          newMatrix.set(i, j - startColumn, this.get(indices[i], j));
        }
      }

      return newMatrix;
    }

    subMatrixColumn(indices, startRow, endRow) {
      if (startRow === undefined) startRow = 0;
      if (endRow === undefined) endRow = this.rows - 1;

      if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
        throw new RangeError('Argument out of range');
      }

      let newMatrix = new Matrix$2(endRow - startRow + 1, indices.length);

      for (let i = 0; i < indices.length; i++) {
        for (let j = startRow; j <= endRow; j++) {
          if (indices[i] < 0 || indices[i] >= this.columns) {
            throw new RangeError(`Column index out of range: ${indices[i]}`);
          }

          newMatrix.set(j - startRow, i, this.get(j, indices[i]));
        }
      }

      return newMatrix;
    }

    setSubMatrix(matrix, startRow, startColumn) {
      matrix = Matrix$2.checkMatrix(matrix);

      if (matrix.isEmpty()) {
        return this;
      }

      let endRow = startRow + matrix.rows - 1;
      let endColumn = startColumn + matrix.columns - 1;
      checkRange(this, startRow, endRow, startColumn, endColumn);

      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          this.set(startRow + i, startColumn + j, matrix.get(i, j));
        }
      }

      return this;
    }

    selection(rowIndices, columnIndices) {
      let indices = checkIndices(this, rowIndices, columnIndices);
      let newMatrix = new Matrix$2(rowIndices.length, columnIndices.length);

      for (let i = 0; i < indices.row.length; i++) {
        let rowIndex = indices.row[i];

        for (let j = 0; j < indices.column.length; j++) {
          let columnIndex = indices.column[j];
          newMatrix.set(i, j, this.get(rowIndex, columnIndex));
        }
      }

      return newMatrix;
    }

    trace() {
      let min = Math.min(this.rows, this.columns);
      let trace = 0;

      for (let i = 0; i < min; i++) {
        trace += this.get(i, i);
      }

      return trace;
    }

    clone() {
      let newMatrix = new Matrix$2(this.rows, this.columns);

      for (let row = 0; row < this.rows; row++) {
        for (let column = 0; column < this.columns; column++) {
          newMatrix.set(row, column, this.get(row, column));
        }
      }

      return newMatrix;
    }

    sum(by) {
      switch (by) {
        case 'row':
          return sumByRow(this);

        case 'column':
          return sumByColumn(this);

        case undefined:
          return sumAll(this);

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    product(by) {
      switch (by) {
        case 'row':
          return productByRow(this);

        case 'column':
          return productByColumn(this);

        case undefined:
          return productAll(this);

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    mean(by) {
      const sum = this.sum(by);

      switch (by) {
        case 'row':
          {
            for (let i = 0; i < this.rows; i++) {
              sum[i] /= this.columns;
            }

            return sum;
          }

        case 'column':
          {
            for (let i = 0; i < this.columns; i++) {
              sum[i] /= this.rows;
            }

            return sum;
          }

        case undefined:
          return sum / this.size;

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    variance(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }

      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        unbiased = true,
        mean = this.mean(by)
      } = options;

      if (typeof unbiased !== 'boolean') {
        throw new TypeError('unbiased must be a boolean');
      }

      switch (by) {
        case 'row':
          {
            if (!Array.isArray(mean)) {
              throw new TypeError('mean must be an array');
            }

            return varianceByRow(this, unbiased, mean);
          }

        case 'column':
          {
            if (!Array.isArray(mean)) {
              throw new TypeError('mean must be an array');
            }

            return varianceByColumn(this, unbiased, mean);
          }

        case undefined:
          {
            if (typeof mean !== 'number') {
              throw new TypeError('mean must be a number');
            }

            return varianceAll(this, unbiased, mean);
          }

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    standardDeviation(by, options) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }

      const variance = this.variance(by, options);

      if (by === undefined) {
        return Math.sqrt(variance);
      } else {
        for (let i = 0; i < variance.length; i++) {
          variance[i] = Math.sqrt(variance[i]);
        }

        return variance;
      }
    }

    center(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }

      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      const {
        center = this.mean(by)
      } = options;

      switch (by) {
        case 'row':
          {
            if (!Array.isArray(center)) {
              throw new TypeError('center must be an array');
            }

            centerByRow(this, center);
            return this;
          }

        case 'column':
          {
            if (!Array.isArray(center)) {
              throw new TypeError('center must be an array');
            }

            centerByColumn(this, center);
            return this;
          }

        case undefined:
          {
            if (typeof center !== 'number') {
              throw new TypeError('center must be a number');
            }

            centerAll(this, center);
            return this;
          }

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    scale(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }

      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }

      let scale = options.scale;

      switch (by) {
        case 'row':
          {
            if (scale === undefined) {
              scale = getScaleByRow(this);
            } else if (!Array.isArray(scale)) {
              throw new TypeError('scale must be an array');
            }

            scaleByRow(this, scale);
            return this;
          }

        case 'column':
          {
            if (scale === undefined) {
              scale = getScaleByColumn(this);
            } else if (!Array.isArray(scale)) {
              throw new TypeError('scale must be an array');
            }

            scaleByColumn(this, scale);
            return this;
          }

        case undefined:
          {
            if (scale === undefined) {
              scale = getScaleAll(this);
            } else if (typeof scale !== 'number') {
              throw new TypeError('scale must be a number');
            }

            scaleAll(this, scale);
            return this;
          }

        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    toString(options) {
      return inspectMatrixWithOptions(this, options);
    }

  }
  AbstractMatrix.prototype.klass = 'Matrix';

  if (typeof Symbol !== 'undefined') {
    AbstractMatrix.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspectMatrix;
  }

  function compareNumbers(a, b) {
    return a - b;
  } // Synonyms


  AbstractMatrix.random = AbstractMatrix.rand;
  AbstractMatrix.randomInt = AbstractMatrix.randInt;
  AbstractMatrix.diagonal = AbstractMatrix.diag;
  AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
  AbstractMatrix.identity = AbstractMatrix.eye;
  AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
  AbstractMatrix.prototype.tensorProduct = AbstractMatrix.prototype.kroneckerProduct;
  class Matrix$2 extends AbstractMatrix {
    constructor(nRows, nColumns) {
      super();

      if (Matrix$2.isMatrix(nRows)) {
        // eslint-disable-next-line no-constructor-return
        return nRows.clone();
      } else if (Number.isInteger(nRows) && nRows >= 0) {
        // Create an empty matrix
        this.data = [];

        if (Number.isInteger(nColumns) && nColumns >= 0) {
          for (let i = 0; i < nRows; i++) {
            this.data.push(new Float64Array(nColumns));
          }
        } else {
          throw new TypeError('nColumns must be a positive integer');
        }
      } else if (Array.isArray(nRows)) {
        // Copy the values from the 2D array
        const arrayData = nRows;
        nRows = arrayData.length;
        nColumns = nRows ? arrayData[0].length : 0;

        if (typeof nColumns !== 'number') {
          throw new TypeError('Data must be a 2D array with at least one element');
        }

        this.data = [];

        for (let i = 0; i < nRows; i++) {
          if (arrayData[i].length !== nColumns) {
            throw new RangeError('Inconsistent array dimensions');
          }

          this.data.push(Float64Array.from(arrayData[i]));
        }
      } else {
        throw new TypeError('First argument must be a positive number or an array');
      }

      this.rows = nRows;
      this.columns = nColumns;
    }

    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }

    removeRow(index) {
      checkRowIndex(this, index);
      this.data.splice(index, 1);
      this.rows -= 1;
      return this;
    }

    addRow(index, array) {
      if (array === undefined) {
        array = index;
        index = this.rows;
      }

      checkRowIndex(this, index, true);
      array = Float64Array.from(checkRowVector(this, array));
      this.data.splice(index, 0, array);
      this.rows += 1;
      return this;
    }

    removeColumn(index) {
      checkColumnIndex(this, index);

      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns - 1);

        for (let j = 0; j < index; j++) {
          newRow[j] = this.data[i][j];
        }

        for (let j = index + 1; j < this.columns; j++) {
          newRow[j - 1] = this.data[i][j];
        }

        this.data[i] = newRow;
      }

      this.columns -= 1;
      return this;
    }

    addColumn(index, array) {
      if (typeof array === 'undefined') {
        array = index;
        index = this.columns;
      }

      checkColumnIndex(this, index, true);
      array = checkColumnVector(this, array);

      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns + 1);
        let j = 0;

        for (; j < index; j++) {
          newRow[j] = this.data[i][j];
        }

        newRow[j++] = array[i];

        for (; j < this.columns + 1; j++) {
          newRow[j] = this.data[i][j - 1];
        }

        this.data[i] = newRow;
      }

      this.columns += 1;
      return this;
    }

  }
  installMathOperations(AbstractMatrix, Matrix$2);

  class BaseView extends AbstractMatrix {
    constructor(matrix, rows, columns) {
      super();
      this.matrix = matrix;
      this.rows = rows;
      this.columns = columns;
    }

  }

  class MatrixColumnView extends BaseView {
    constructor(matrix, column) {
      checkColumnIndex(matrix, column);
      super(matrix, matrix.rows, 1);
      this.column = column;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.column, value);
      return this;
    }

    get(rowIndex) {
      return this.matrix.get(rowIndex, this.column);
    }

  }

  class MatrixColumnSelectionView extends BaseView {
    constructor(matrix, columnIndices) {
      columnIndices = checkColumnIndices(matrix, columnIndices);
      super(matrix, matrix.rows, columnIndices.length);
      this.columnIndices = columnIndices;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
    }

  }

  class MatrixFlipColumnView extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.rows, matrix.columns);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
    }

  }

  class MatrixFlipRowView extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.rows, matrix.columns);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
    }

  }

  class MatrixRowView extends BaseView {
    constructor(matrix, row) {
      checkRowIndex(matrix, row);
      super(matrix, 1, matrix.columns);
      this.row = row;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.row, columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.row, columnIndex);
    }

  }

  class MatrixRowSelectionView extends BaseView {
    constructor(matrix, rowIndices) {
      rowIndices = checkRowIndices(matrix, rowIndices);
      super(matrix, rowIndices.length, matrix.columns);
      this.rowIndices = rowIndices;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
    }

  }

  class MatrixSelectionView extends BaseView {
    constructor(matrix, rowIndices, columnIndices) {
      let indices = checkIndices(matrix, rowIndices, columnIndices);
      super(matrix, indices.row.length, indices.column.length);
      this.rowIndices = indices.row;
      this.columnIndices = indices.column;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rowIndices[rowIndex], this.columnIndices[columnIndex], value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rowIndices[rowIndex], this.columnIndices[columnIndex]);
    }

  }

  class MatrixSubView extends BaseView {
    constructor(matrix, startRow, endRow, startColumn, endColumn) {
      checkRange(matrix, startRow, endRow, startColumn, endColumn);
      super(matrix, endRow - startRow + 1, endColumn - startColumn + 1);
      this.startRow = startRow;
      this.startColumn = startColumn;
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.startRow + rowIndex, this.startColumn + columnIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(this.startRow + rowIndex, this.startColumn + columnIndex);
    }

  }

  class MatrixTransposeView$1 extends BaseView {
    constructor(matrix) {
      super(matrix, matrix.columns, matrix.rows);
    }

    set(rowIndex, columnIndex, value) {
      this.matrix.set(columnIndex, rowIndex, value);
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.matrix.get(columnIndex, rowIndex);
    }

  }

  class WrapperMatrix1D extends AbstractMatrix {
    constructor(data, options = {}) {
      const {
        rows = 1
      } = options;

      if (data.length % rows !== 0) {
        throw new Error('the data length is not divisible by the number of rows');
      }

      super();
      this.rows = rows;
      this.columns = data.length / rows;
      this.data = data;
    }

    set(rowIndex, columnIndex, value) {
      let index = this._calculateIndex(rowIndex, columnIndex);

      this.data[index] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      let index = this._calculateIndex(rowIndex, columnIndex);

      return this.data[index];
    }

    _calculateIndex(row, column) {
      return row * this.columns + column;
    }

  }

  class WrapperMatrix2D extends AbstractMatrix {
    constructor(data) {
      super();
      this.data = data;
      this.rows = data.length;
      this.columns = data[0].length;
    }

    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }

  }

  function wrap(array, options) {
    if (Array.isArray(array)) {
      if (array[0] && Array.isArray(array[0])) {
        return new WrapperMatrix2D(array);
      } else {
        return new WrapperMatrix1D(array, options);
      }
    } else {
      throw new Error('the argument is not an array');
    }
  }

  class LuDecomposition$1 {
    constructor(matrix) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);
      let lu = matrix.clone();
      let rows = lu.rows;
      let columns = lu.columns;
      let pivotVector = new Float64Array(rows);
      let pivotSign = 1;
      let i, j, k, p, s, t, v;
      let LUcolj, kmax;

      for (i = 0; i < rows; i++) {
        pivotVector[i] = i;
      }

      LUcolj = new Float64Array(rows);

      for (j = 0; j < columns; j++) {
        for (i = 0; i < rows; i++) {
          LUcolj[i] = lu.get(i, j);
        }

        for (i = 0; i < rows; i++) {
          kmax = Math.min(i, j);
          s = 0;

          for (k = 0; k < kmax; k++) {
            s += lu.get(i, k) * LUcolj[k];
          }

          LUcolj[i] -= s;
          lu.set(i, j, LUcolj[i]);
        }

        p = j;

        for (i = j + 1; i < rows; i++) {
          if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
            p = i;
          }
        }

        if (p !== j) {
          for (k = 0; k < columns; k++) {
            t = lu.get(p, k);
            lu.set(p, k, lu.get(j, k));
            lu.set(j, k, t);
          }

          v = pivotVector[p];
          pivotVector[p] = pivotVector[j];
          pivotVector[j] = v;
          pivotSign = -pivotSign;
        }

        if (j < rows && lu.get(j, j) !== 0) {
          for (i = j + 1; i < rows; i++) {
            lu.set(i, j, lu.get(i, j) / lu.get(j, j));
          }
        }
      }

      this.LU = lu;
      this.pivotVector = pivotVector;
      this.pivotSign = pivotSign;
    }

    isSingular() {
      let data = this.LU;
      let col = data.columns;

      for (let j = 0; j < col; j++) {
        if (data.get(j, j) === 0) {
          return true;
        }
      }

      return false;
    }

    solve(value) {
      value = Matrix$2.checkMatrix(value);
      let lu = this.LU;
      let rows = lu.rows;

      if (rows !== value.rows) {
        throw new Error('Invalid matrix dimensions');
      }

      if (this.isSingular()) {
        throw new Error('LU matrix is singular');
      }

      let count = value.columns;
      let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
      let columns = lu.columns;
      let i, j, k;

      for (k = 0; k < columns; k++) {
        for (i = k + 1; i < columns; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }

      for (k = columns - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / lu.get(k, k));
        }

        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }

      return X;
    }

    get determinant() {
      let data = this.LU;

      if (!data.isSquare()) {
        throw new Error('Matrix must be square');
      }

      let determinant = this.pivotSign;
      let col = data.columns;

      for (let j = 0; j < col; j++) {
        determinant *= data.get(j, j);
      }

      return determinant;
    }

    get lowerTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix$2(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i > j) {
            X.set(i, j, data.get(i, j));
          } else if (i === j) {
            X.set(i, j, 1);
          } else {
            X.set(i, j, 0);
          }
        }
      }

      return X;
    }

    get upperTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix$2(rows, columns);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i <= j) {
            X.set(i, j, data.get(i, j));
          } else {
            X.set(i, j, 0);
          }
        }
      }

      return X;
    }

    get pivotPermutationVector() {
      return Array.from(this.pivotVector);
    }

  }

  function hypotenuse(a, b) {
    let r = 0;

    if (Math.abs(a) > Math.abs(b)) {
      r = b / a;
      return Math.abs(a) * Math.sqrt(1 + r * r);
    }

    if (b !== 0) {
      r = a / b;
      return Math.abs(b) * Math.sqrt(1 + r * r);
    }

    return 0;
  }

  class QrDecomposition$1 {
    constructor(value) {
      value = WrapperMatrix2D.checkMatrix(value);
      let qr = value.clone();
      let m = value.rows;
      let n = value.columns;
      let rdiag = new Float64Array(n);
      let i, j, k, s;

      for (k = 0; k < n; k++) {
        let nrm = 0;

        for (i = k; i < m; i++) {
          nrm = hypotenuse(nrm, qr.get(i, k));
        }

        if (nrm !== 0) {
          if (qr.get(k, k) < 0) {
            nrm = -nrm;
          }

          for (i = k; i < m; i++) {
            qr.set(i, k, qr.get(i, k) / nrm);
          }

          qr.set(k, k, qr.get(k, k) + 1);

          for (j = k + 1; j < n; j++) {
            s = 0;

            for (i = k; i < m; i++) {
              s += qr.get(i, k) * qr.get(i, j);
            }

            s = -s / qr.get(k, k);

            for (i = k; i < m; i++) {
              qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
            }
          }
        }

        rdiag[k] = -nrm;
      }

      this.QR = qr;
      this.Rdiag = rdiag;
    }

    solve(value) {
      value = Matrix$2.checkMatrix(value);
      let qr = this.QR;
      let m = qr.rows;

      if (value.rows !== m) {
        throw new Error('Matrix row dimensions must agree');
      }

      if (!this.isFullRank()) {
        throw new Error('Matrix is rank deficient');
      }

      let count = value.columns;
      let X = value.clone();
      let n = qr.columns;
      let i, j, k, s;

      for (k = 0; k < n; k++) {
        for (j = 0; j < count; j++) {
          s = 0;

          for (i = k; i < m; i++) {
            s += qr.get(i, k) * X.get(i, j);
          }

          s = -s / qr.get(k, k);

          for (i = k; i < m; i++) {
            X.set(i, j, X.get(i, j) + s * qr.get(i, k));
          }
        }
      }

      for (k = n - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / this.Rdiag[k]);
        }

        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
          }
        }
      }

      return X.subMatrix(0, n - 1, 0, count - 1);
    }

    isFullRank() {
      let columns = this.QR.columns;

      for (let i = 0; i < columns; i++) {
        if (this.Rdiag[i] === 0) {
          return false;
        }
      }

      return true;
    }

    get upperTriangularMatrix() {
      let qr = this.QR;
      let n = qr.columns;
      let X = new Matrix$2(n, n);
      let i, j;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (i < j) {
            X.set(i, j, qr.get(i, j));
          } else if (i === j) {
            X.set(i, j, this.Rdiag[i]);
          } else {
            X.set(i, j, 0);
          }
        }
      }

      return X;
    }

    get orthogonalMatrix() {
      let qr = this.QR;
      let rows = qr.rows;
      let columns = qr.columns;
      let X = new Matrix$2(rows, columns);
      let i, j, k, s;

      for (k = columns - 1; k >= 0; k--) {
        for (i = 0; i < rows; i++) {
          X.set(i, k, 0);
        }

        X.set(k, k, 1);

        for (j = k; j < columns; j++) {
          if (qr.get(k, k) !== 0) {
            s = 0;

            for (i = k; i < rows; i++) {
              s += qr.get(i, k) * X.get(i, j);
            }

            s = -s / qr.get(k, k);

            for (i = k; i < rows; i++) {
              X.set(i, j, X.get(i, j) + s * qr.get(i, k));
            }
          }
        }
      }

      return X;
    }

  }

  class SingularValueDecomposition {
    constructor(value, options = {}) {
      value = WrapperMatrix2D.checkMatrix(value);

      if (value.isEmpty()) {
        throw new Error('Matrix must be non-empty');
      }

      let m = value.rows;
      let n = value.columns;
      const {
        computeLeftSingularVectors = true,
        computeRightSingularVectors = true,
        autoTranspose = false
      } = options;
      let wantu = Boolean(computeLeftSingularVectors);
      let wantv = Boolean(computeRightSingularVectors);
      let swapped = false;
      let a;

      if (m < n) {
        if (!autoTranspose) {
          a = value.clone(); // eslint-disable-next-line no-console

          console.warn('Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose');
        } else {
          a = value.transpose();
          m = a.rows;
          n = a.columns;
          swapped = true;
          let aux = wantu;
          wantu = wantv;
          wantv = aux;
        }
      } else {
        a = value.clone();
      }

      let nu = Math.min(m, n);
      let ni = Math.min(m + 1, n);
      let s = new Float64Array(ni);
      let U = new Matrix$2(m, nu);
      let V = new Matrix$2(n, n);
      let e = new Float64Array(n);
      let work = new Float64Array(m);
      let si = new Float64Array(ni);

      for (let i = 0; i < ni; i++) si[i] = i;

      let nct = Math.min(m - 1, n);
      let nrt = Math.max(0, Math.min(n - 2, m));
      let mrc = Math.max(nct, nrt);

      for (let k = 0; k < mrc; k++) {
        if (k < nct) {
          s[k] = 0;

          for (let i = k; i < m; i++) {
            s[k] = hypotenuse(s[k], a.get(i, k));
          }

          if (s[k] !== 0) {
            if (a.get(k, k) < 0) {
              s[k] = -s[k];
            }

            for (let i = k; i < m; i++) {
              a.set(i, k, a.get(i, k) / s[k]);
            }

            a.set(k, k, a.get(k, k) + 1);
          }

          s[k] = -s[k];
        }

        for (let j = k + 1; j < n; j++) {
          if (k < nct && s[k] !== 0) {
            let t = 0;

            for (let i = k; i < m; i++) {
              t += a.get(i, k) * a.get(i, j);
            }

            t = -t / a.get(k, k);

            for (let i = k; i < m; i++) {
              a.set(i, j, a.get(i, j) + t * a.get(i, k));
            }
          }

          e[j] = a.get(k, j);
        }

        if (wantu && k < nct) {
          for (let i = k; i < m; i++) {
            U.set(i, k, a.get(i, k));
          }
        }

        if (k < nrt) {
          e[k] = 0;

          for (let i = k + 1; i < n; i++) {
            e[k] = hypotenuse(e[k], e[i]);
          }

          if (e[k] !== 0) {
            if (e[k + 1] < 0) {
              e[k] = 0 - e[k];
            }

            for (let i = k + 1; i < n; i++) {
              e[i] /= e[k];
            }

            e[k + 1] += 1;
          }

          e[k] = -e[k];

          if (k + 1 < m && e[k] !== 0) {
            for (let i = k + 1; i < m; i++) {
              work[i] = 0;
            }

            for (let i = k + 1; i < m; i++) {
              for (let j = k + 1; j < n; j++) {
                work[i] += e[j] * a.get(i, j);
              }
            }

            for (let j = k + 1; j < n; j++) {
              let t = -e[j] / e[k + 1];

              for (let i = k + 1; i < m; i++) {
                a.set(i, j, a.get(i, j) + t * work[i]);
              }
            }
          }

          if (wantv) {
            for (let i = k + 1; i < n; i++) {
              V.set(i, k, e[i]);
            }
          }
        }
      }

      let p = Math.min(n, m + 1);

      if (nct < n) {
        s[nct] = a.get(nct, nct);
      }

      if (m < p) {
        s[p - 1] = 0;
      }

      if (nrt + 1 < p) {
        e[nrt] = a.get(nrt, p - 1);
      }

      e[p - 1] = 0;

      if (wantu) {
        for (let j = nct; j < nu; j++) {
          for (let i = 0; i < m; i++) {
            U.set(i, j, 0);
          }

          U.set(j, j, 1);
        }

        for (let k = nct - 1; k >= 0; k--) {
          if (s[k] !== 0) {
            for (let j = k + 1; j < nu; j++) {
              let t = 0;

              for (let i = k; i < m; i++) {
                t += U.get(i, k) * U.get(i, j);
              }

              t = -t / U.get(k, k);

              for (let i = k; i < m; i++) {
                U.set(i, j, U.get(i, j) + t * U.get(i, k));
              }
            }

            for (let i = k; i < m; i++) {
              U.set(i, k, -U.get(i, k));
            }

            U.set(k, k, 1 + U.get(k, k));

            for (let i = 0; i < k - 1; i++) {
              U.set(i, k, 0);
            }
          } else {
            for (let i = 0; i < m; i++) {
              U.set(i, k, 0);
            }

            U.set(k, k, 1);
          }
        }
      }

      if (wantv) {
        for (let k = n - 1; k >= 0; k--) {
          if (k < nrt && e[k] !== 0) {
            for (let j = k + 1; j < n; j++) {
              let t = 0;

              for (let i = k + 1; i < n; i++) {
                t += V.get(i, k) * V.get(i, j);
              }

              t = -t / V.get(k + 1, k);

              for (let i = k + 1; i < n; i++) {
                V.set(i, j, V.get(i, j) + t * V.get(i, k));
              }
            }
          }

          for (let i = 0; i < n; i++) {
            V.set(i, k, 0);
          }

          V.set(k, k, 1);
        }
      }

      let pp = p - 1;
      let eps = Number.EPSILON;

      while (p > 0) {
        let k, kase;

        for (k = p - 2; k >= -1; k--) {
          if (k === -1) {
            break;
          }

          const alpha = Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));

          if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
            e[k] = 0;
            break;
          }
        }

        if (k === p - 2) {
          kase = 4;
        } else {
          let ks;

          for (ks = p - 1; ks >= k; ks--) {
            if (ks === k) {
              break;
            }

            let t = (ks !== p ? Math.abs(e[ks]) : 0) + (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);

            if (Math.abs(s[ks]) <= eps * t) {
              s[ks] = 0;
              break;
            }
          }

          if (ks === k) {
            kase = 3;
          } else if (ks === p - 1) {
            kase = 1;
          } else {
            kase = 2;
            k = ks;
          }
        }

        k++;

        switch (kase) {
          case 1:
            {
              let f = e[p - 2];
              e[p - 2] = 0;

              for (let j = p - 2; j >= k; j--) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;

                if (j !== k) {
                  f = -sn * e[j - 1];
                  e[j - 1] = cs * e[j - 1];
                }

                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                    V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                    V.set(i, j, t);
                  }
                }
              }

              break;
            }

          case 2:
            {
              let f = e[k - 1];
              e[k - 1] = 0;

              for (let j = k; j < p; j++) {
                let t = hypotenuse(s[j], f);
                let cs = s[j] / t;
                let sn = f / t;
                s[j] = t;
                f = -sn * e[j];
                e[j] = cs * e[j];

                if (wantu) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                    U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                    U.set(i, j, t);
                  }
                }
              }

              break;
            }

          case 3:
            {
              const scale = Math.max(Math.abs(s[p - 1]), Math.abs(s[p - 2]), Math.abs(e[p - 2]), Math.abs(s[k]), Math.abs(e[k]));
              const sp = s[p - 1] / scale;
              const spm1 = s[p - 2] / scale;
              const epm1 = e[p - 2] / scale;
              const sk = s[k] / scale;
              const ek = e[k] / scale;
              const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
              const c = sp * epm1 * (sp * epm1);
              let shift = 0;

              if (b !== 0 || c !== 0) {
                if (b < 0) {
                  shift = 0 - Math.sqrt(b * b + c);
                } else {
                  shift = Math.sqrt(b * b + c);
                }

                shift = c / (b + shift);
              }

              let f = (sk + sp) * (sk - sp) + shift;
              let g = sk * ek;

              for (let j = k; j < p - 1; j++) {
                let t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                let cs = f / t;
                let sn = g / t;

                if (j !== k) {
                  e[j - 1] = t;
                }

                f = cs * s[j] + sn * e[j];
                e[j] = cs * e[j] - sn * s[j];
                g = sn * s[j + 1];
                s[j + 1] = cs * s[j + 1];

                if (wantv) {
                  for (let i = 0; i < n; i++) {
                    t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                    V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                    V.set(i, j, t);
                  }
                }

                t = hypotenuse(f, g);
                if (t === 0) t = Number.MIN_VALUE;
                cs = f / t;
                sn = g / t;
                s[j] = t;
                f = cs * e[j] + sn * s[j + 1];
                s[j + 1] = -sn * e[j] + cs * s[j + 1];
                g = sn * e[j + 1];
                e[j + 1] = cs * e[j + 1];

                if (wantu && j < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                    U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                    U.set(i, j, t);
                  }
                }
              }

              e[p - 2] = f;
              break;
            }

          case 4:
            {
              if (s[k] <= 0) {
                s[k] = s[k] < 0 ? -s[k] : 0;

                if (wantv) {
                  for (let i = 0; i <= pp; i++) {
                    V.set(i, k, -V.get(i, k));
                  }
                }
              }

              while (k < pp) {
                if (s[k] >= s[k + 1]) {
                  break;
                }

                let t = s[k];
                s[k] = s[k + 1];
                s[k + 1] = t;

                if (wantv && k < n - 1) {
                  for (let i = 0; i < n; i++) {
                    t = V.get(i, k + 1);
                    V.set(i, k + 1, V.get(i, k));
                    V.set(i, k, t);
                  }
                }

                if (wantu && k < m - 1) {
                  for (let i = 0; i < m; i++) {
                    t = U.get(i, k + 1);
                    U.set(i, k + 1, U.get(i, k));
                    U.set(i, k, t);
                  }
                }

                k++;
              }
              p--;
              break;
            }
          // no default
        }
      }

      if (swapped) {
        let tmp = V;
        V = U;
        U = tmp;
      }

      this.m = m;
      this.n = n;
      this.s = s;
      this.U = U;
      this.V = V;
    }

    solve(value) {
      let Y = value;
      let e = this.threshold;
      let scols = this.s.length;
      let Ls = Matrix$2.zeros(scols, scols);

      for (let i = 0; i < scols; i++) {
        if (Math.abs(this.s[i]) <= e) {
          Ls.set(i, i, 0);
        } else {
          Ls.set(i, i, 1 / this.s[i]);
        }
      }

      let U = this.U;
      let V = this.rightSingularVectors;
      let VL = V.mmul(Ls);
      let vrows = V.rows;
      let urows = U.rows;
      let VLU = Matrix$2.zeros(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;

          for (let k = 0; k < scols; k++) {
            sum += VL.get(i, k) * U.get(j, k);
          }

          VLU.set(i, j, sum);
        }
      }

      return VLU.mmul(Y);
    }

    solveForDiagonal(value) {
      return this.solve(Matrix$2.diag(value));
    }

    inverse() {
      let V = this.V;
      let e = this.threshold;
      let vrows = V.rows;
      let vcols = V.columns;
      let X = new Matrix$2(vrows, this.s.length);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < vcols; j++) {
          if (Math.abs(this.s[j]) > e) {
            X.set(i, j, V.get(i, j) / this.s[j]);
          }
        }
      }

      let U = this.U;
      let urows = U.rows;
      let ucols = U.columns;
      let Y = new Matrix$2(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;

          for (let k = 0; k < ucols; k++) {
            sum += X.get(i, k) * U.get(j, k);
          }

          Y.set(i, j, sum);
        }
      }

      return Y;
    }

    get condition() {
      return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }

    get norm2() {
      return this.s[0];
    }

    get rank() {
      let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
      let r = 0;
      let s = this.s;

      for (let i = 0, ii = s.length; i < ii; i++) {
        if (s[i] > tol) {
          r++;
        }
      }

      return r;
    }

    get diagonal() {
      return Array.from(this.s);
    }

    get threshold() {
      return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
    }

    get leftSingularVectors() {
      return this.U;
    }

    get rightSingularVectors() {
      return this.V;
    }

    get diagonalMatrix() {
      return Matrix$2.diag(this.s);
    }

  }

  function inverse(matrix, useSVD = false) {
    matrix = WrapperMatrix2D.checkMatrix(matrix);

    if (useSVD) {
      return new SingularValueDecomposition(matrix).inverse();
    } else {
      return solve(matrix, Matrix$2.eye(matrix.rows));
    }
  }
  function solve(leftHandSide, rightHandSide, useSVD = false) {
    leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
    rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);

    if (useSVD) {
      return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
    } else {
      return leftHandSide.isSquare() ? new LuDecomposition$1(leftHandSide).solve(rightHandSide) : new QrDecomposition$1(leftHandSide).solve(rightHandSide);
    }
  }

  function determinant(matrix) {
    matrix = Matrix$2.checkMatrix(matrix);

    if (matrix.isSquare()) {
      if (matrix.columns === 0) {
        return 1;
      }

      let a, b, c, d;

      if (matrix.columns === 2) {
        // 2 x 2 matrix
        a = matrix.get(0, 0);
        b = matrix.get(0, 1);
        c = matrix.get(1, 0);
        d = matrix.get(1, 1);
        return a * d - b * c;
      } else if (matrix.columns === 3) {
        // 3 x 3 matrix
        let subMatrix0, subMatrix1, subMatrix2;
        subMatrix0 = new MatrixSelectionView(matrix, [1, 2], [1, 2]);
        subMatrix1 = new MatrixSelectionView(matrix, [1, 2], [0, 2]);
        subMatrix2 = new MatrixSelectionView(matrix, [1, 2], [0, 1]);
        a = matrix.get(0, 0);
        b = matrix.get(0, 1);
        c = matrix.get(0, 2);
        return a * determinant(subMatrix0) - b * determinant(subMatrix1) + c * determinant(subMatrix2);
      } else {
        // general purpose determinant using the LU decomposition
        return new LuDecomposition$1(matrix).determinant;
      }
    } else {
      throw Error('determinant can only be calculated for a square matrix');
    }
  }

  function xrange(n, exception) {
    let range = [];

    for (let i = 0; i < n; i++) {
      if (i !== exception) {
        range.push(i);
      }
    }

    return range;
  }

  function dependenciesOneRow(error, matrix, index, thresholdValue = 10e-10, thresholdError = 10e-10) {
    if (error > thresholdError) {
      return new Array(matrix.rows + 1).fill(0);
    } else {
      let returnArray = matrix.addRow(index, [0]);

      for (let i = 0; i < returnArray.rows; i++) {
        if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
          returnArray.set(i, 0, 0);
        }
      }

      return returnArray.to1DArray();
    }
  }

  function linearDependencies(matrix, options = {}) {
    const {
      thresholdValue = 10e-10,
      thresholdError = 10e-10
    } = options;
    matrix = Matrix$2.checkMatrix(matrix);
    let n = matrix.rows;
    let results = new Matrix$2(n, n);

    for (let i = 0; i < n; i++) {
      let b = Matrix$2.columnVector(matrix.getRow(i));
      let Abis = matrix.subMatrixRow(xrange(n, i)).transpose();
      let svd = new SingularValueDecomposition(Abis);
      let x = svd.solve(b);
      let error = Matrix$2.sub(b, Abis.mmul(x)).abs().max();
      results.setRow(i, dependenciesOneRow(error, x, i, thresholdValue, thresholdError));
    }

    return results;
  }

  function pseudoInverse(matrix, threshold = Number.EPSILON) {
    matrix = Matrix$2.checkMatrix(matrix);

    if (matrix.isEmpty()) {
      // with a zero dimension, the pseudo-inverse is the transpose, since all 0xn and nx0 matrices are singular
      // (0xn)*(nx0)*(0xn) = 0xn
      // (nx0)*(0xn)*(nx0) = nx0
      return matrix.transpose();
    }

    let svdSolution = new SingularValueDecomposition(matrix, {
      autoTranspose: true
    });
    let U = svdSolution.leftSingularVectors;
    let V = svdSolution.rightSingularVectors;
    let s = svdSolution.diagonal;

    for (let i = 0; i < s.length; i++) {
      if (Math.abs(s[i]) > threshold) {
        s[i] = 1.0 / s[i];
      } else {
        s[i] = 0.0;
      }
    }

    return V.mmul(Matrix$2.diag(s).mmul(U.transpose()));
  }

  function covariance$1(xMatrix, yMatrix = xMatrix, options = {}) {
    xMatrix = new Matrix$2(xMatrix);
    let yIsSame = false;

    if (typeof yMatrix === 'object' && !Matrix$2.isMatrix(yMatrix) && !Array.isArray(yMatrix)) {
      options = yMatrix;
      yMatrix = xMatrix;
      yIsSame = true;
    } else {
      yMatrix = new Matrix$2(yMatrix);
    }

    if (xMatrix.rows !== yMatrix.rows) {
      throw new TypeError('Both matrices must have the same number of rows');
    }

    const {
      center = true
    } = options;

    if (center) {
      xMatrix = xMatrix.center('column');

      if (!yIsSame) {
        yMatrix = yMatrix.center('column');
      }
    }

    const cov = xMatrix.transpose().mmul(yMatrix);

    for (let i = 0; i < cov.rows; i++) {
      for (let j = 0; j < cov.columns; j++) {
        cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
      }
    }

    return cov;
  }

  function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
    xMatrix = new Matrix$2(xMatrix);
    let yIsSame = false;

    if (typeof yMatrix === 'object' && !Matrix$2.isMatrix(yMatrix) && !Array.isArray(yMatrix)) {
      options = yMatrix;
      yMatrix = xMatrix;
      yIsSame = true;
    } else {
      yMatrix = new Matrix$2(yMatrix);
    }

    if (xMatrix.rows !== yMatrix.rows) {
      throw new TypeError('Both matrices must have the same number of rows');
    }

    const {
      center = true,
      scale = true
    } = options;

    if (center) {
      xMatrix.center('column');

      if (!yIsSame) {
        yMatrix.center('column');
      }
    }

    if (scale) {
      xMatrix.scale('column');

      if (!yIsSame) {
        yMatrix.scale('column');
      }
    }

    const sdx = xMatrix.standardDeviation('column', {
      unbiased: true
    });
    const sdy = yIsSame ? sdx : yMatrix.standardDeviation('column', {
      unbiased: true
    });
    const corr = xMatrix.transpose().mmul(yMatrix);

    for (let i = 0; i < corr.rows; i++) {
      for (let j = 0; j < corr.columns; j++) {
        corr.set(i, j, corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1)));
      }
    }

    return corr;
  }

  class EigenvalueDecomposition {
    constructor(matrix, options = {}) {
      const {
        assumeSymmetric = false
      } = options;
      matrix = WrapperMatrix2D.checkMatrix(matrix);

      if (!matrix.isSquare()) {
        throw new Error('Matrix is not a square matrix');
      }

      if (matrix.isEmpty()) {
        throw new Error('Matrix must be non-empty');
      }

      let n = matrix.columns;
      let V = new Matrix$2(n, n);
      let d = new Float64Array(n);
      let e = new Float64Array(n);
      let value = matrix;
      let i, j;
      let isSymmetric = false;

      if (assumeSymmetric) {
        isSymmetric = true;
      } else {
        isSymmetric = matrix.isSymmetric();
      }

      if (isSymmetric) {
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            V.set(i, j, value.get(i, j));
          }
        }

        tred2(n, e, d, V);
        tql2(n, e, d, V);
      } else {
        let H = new Matrix$2(n, n);
        let ort = new Float64Array(n);

        for (j = 0; j < n; j++) {
          for (i = 0; i < n; i++) {
            H.set(i, j, value.get(i, j));
          }
        }

        orthes(n, H, ort, V);
        hqr2(n, e, d, V, H);
      }

      this.n = n;
      this.e = e;
      this.d = d;
      this.V = V;
    }

    get realEigenvalues() {
      return Array.from(this.d);
    }

    get imaginaryEigenvalues() {
      return Array.from(this.e);
    }

    get eigenvectorMatrix() {
      return this.V;
    }

    get diagonalMatrix() {
      let n = this.n;
      let e = this.e;
      let d = this.d;
      let X = new Matrix$2(n, n);
      let i, j;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          X.set(i, j, 0);
        }

        X.set(i, i, d[i]);

        if (e[i] > 0) {
          X.set(i, i + 1, e[i]);
        } else if (e[i] < 0) {
          X.set(i, i - 1, e[i]);
        }
      }

      return X;
    }

  }

  function tred2(n, e, d, V) {
    let f, g, h, i, j, k, hh, scale;

    for (j = 0; j < n; j++) {
      d[j] = V.get(n - 1, j);
    }

    for (i = n - 1; i > 0; i--) {
      scale = 0;
      h = 0;

      for (k = 0; k < i; k++) {
        scale = scale + Math.abs(d[k]);
      }

      if (scale === 0) {
        e[i] = d[i - 1];

        for (j = 0; j < i; j++) {
          d[j] = V.get(i - 1, j);
          V.set(i, j, 0);
          V.set(j, i, 0);
        }
      } else {
        for (k = 0; k < i; k++) {
          d[k] /= scale;
          h += d[k] * d[k];
        }

        f = d[i - 1];
        g = Math.sqrt(h);

        if (f > 0) {
          g = -g;
        }

        e[i] = scale * g;
        h = h - f * g;
        d[i - 1] = f - g;

        for (j = 0; j < i; j++) {
          e[j] = 0;
        }

        for (j = 0; j < i; j++) {
          f = d[j];
          V.set(j, i, f);
          g = e[j] + V.get(j, j) * f;

          for (k = j + 1; k <= i - 1; k++) {
            g += V.get(k, j) * d[k];
            e[k] += V.get(k, j) * f;
          }

          e[j] = g;
        }

        f = 0;

        for (j = 0; j < i; j++) {
          e[j] /= h;
          f += e[j] * d[j];
        }

        hh = f / (h + h);

        for (j = 0; j < i; j++) {
          e[j] -= hh * d[j];
        }

        for (j = 0; j < i; j++) {
          f = d[j];
          g = e[j];

          for (k = j; k <= i - 1; k++) {
            V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
          }

          d[j] = V.get(i - 1, j);
          V.set(i, j, 0);
        }
      }

      d[i] = h;
    }

    for (i = 0; i < n - 1; i++) {
      V.set(n - 1, i, V.get(i, i));
      V.set(i, i, 1);
      h = d[i + 1];

      if (h !== 0) {
        for (k = 0; k <= i; k++) {
          d[k] = V.get(k, i + 1) / h;
        }

        for (j = 0; j <= i; j++) {
          g = 0;

          for (k = 0; k <= i; k++) {
            g += V.get(k, i + 1) * V.get(k, j);
          }

          for (k = 0; k <= i; k++) {
            V.set(k, j, V.get(k, j) - g * d[k]);
          }
        }
      }

      for (k = 0; k <= i; k++) {
        V.set(k, i + 1, 0);
      }
    }

    for (j = 0; j < n; j++) {
      d[j] = V.get(n - 1, j);
      V.set(n - 1, j, 0);
    }

    V.set(n - 1, n - 1, 1);
    e[0] = 0;
  }

  function tql2(n, e, d, V) {
    let g, h, i, j, k, l, m, p, r, dl1, c, c2, c3, el1, s, s2;

    for (i = 1; i < n; i++) {
      e[i - 1] = e[i];
    }

    e[n - 1] = 0;
    let f = 0;
    let tst1 = 0;
    let eps = Number.EPSILON;

    for (l = 0; l < n; l++) {
      tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
      m = l;

      while (m < n) {
        if (Math.abs(e[m]) <= eps * tst1) {
          break;
        }

        m++;
      }

      if (m > l) {

        do {
          g = d[l];
          p = (d[l + 1] - g) / (2 * e[l]);
          r = hypotenuse(p, 1);

          if (p < 0) {
            r = -r;
          }

          d[l] = e[l] / (p + r);
          d[l + 1] = e[l] * (p + r);
          dl1 = d[l + 1];
          h = g - d[l];

          for (i = l + 2; i < n; i++) {
            d[i] -= h;
          }

          f = f + h;
          p = d[m];
          c = 1;
          c2 = c;
          c3 = c;
          el1 = e[l + 1];
          s = 0;
          s2 = 0;

          for (i = m - 1; i >= l; i--) {
            c3 = c2;
            c2 = c;
            s2 = s;
            g = c * e[i];
            h = c * p;
            r = hypotenuse(p, e[i]);
            e[i + 1] = s * r;
            s = e[i] / r;
            c = p / r;
            p = c * d[i] - s * g;
            d[i + 1] = h + s * (c * g + s * d[i]);

            for (k = 0; k < n; k++) {
              h = V.get(k, i + 1);
              V.set(k, i + 1, s * V.get(k, i) + c * h);
              V.set(k, i, c * V.get(k, i) - s * h);
            }
          }

          p = -s * s2 * c3 * el1 * e[l] / dl1;
          e[l] = s * p;
          d[l] = c * p;
        } while (Math.abs(e[l]) > eps * tst1);
      }

      d[l] = d[l] + f;
      e[l] = 0;
    }

    for (i = 0; i < n - 1; i++) {
      k = i;
      p = d[i];

      for (j = i + 1; j < n; j++) {
        if (d[j] < p) {
          k = j;
          p = d[j];
        }
      }

      if (k !== i) {
        d[k] = d[i];
        d[i] = p;

        for (j = 0; j < n; j++) {
          p = V.get(j, i);
          V.set(j, i, V.get(j, k));
          V.set(j, k, p);
        }
      }
    }
  }

  function orthes(n, H, ort, V) {
    let low = 0;
    let high = n - 1;
    let f, g, h, i, j, m;
    let scale;

    for (m = low + 1; m <= high - 1; m++) {
      scale = 0;

      for (i = m; i <= high; i++) {
        scale = scale + Math.abs(H.get(i, m - 1));
      }

      if (scale !== 0) {
        h = 0;

        for (i = high; i >= m; i--) {
          ort[i] = H.get(i, m - 1) / scale;
          h += ort[i] * ort[i];
        }

        g = Math.sqrt(h);

        if (ort[m] > 0) {
          g = -g;
        }

        h = h - ort[m] * g;
        ort[m] = ort[m] - g;

        for (j = m; j < n; j++) {
          f = 0;

          for (i = high; i >= m; i--) {
            f += ort[i] * H.get(i, j);
          }

          f = f / h;

          for (i = m; i <= high; i++) {
            H.set(i, j, H.get(i, j) - f * ort[i]);
          }
        }

        for (i = 0; i <= high; i++) {
          f = 0;

          for (j = high; j >= m; j--) {
            f += ort[j] * H.get(i, j);
          }

          f = f / h;

          for (j = m; j <= high; j++) {
            H.set(i, j, H.get(i, j) - f * ort[j]);
          }
        }

        ort[m] = scale * ort[m];
        H.set(m, m - 1, scale * g);
      }
    }

    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        V.set(i, j, i === j ? 1 : 0);
      }
    }

    for (m = high - 1; m >= low + 1; m--) {
      if (H.get(m, m - 1) !== 0) {
        for (i = m + 1; i <= high; i++) {
          ort[i] = H.get(i, m - 1);
        }

        for (j = m; j <= high; j++) {
          g = 0;

          for (i = m; i <= high; i++) {
            g += ort[i] * V.get(i, j);
          }

          g = g / ort[m] / H.get(m, m - 1);

          for (i = m; i <= high; i++) {
            V.set(i, j, V.get(i, j) + g * ort[i]);
          }
        }
      }
    }
  }

  function hqr2(nn, e, d, V, H) {
    let n = nn - 1;
    let low = 0;
    let high = nn - 1;
    let eps = Number.EPSILON;
    let exshift = 0;
    let norm = 0;
    let p = 0;
    let q = 0;
    let r = 0;
    let s = 0;
    let z = 0;
    let iter = 0;
    let i, j, k, l, m, t, w, x, y;
    let ra, sa, vr, vi;
    let notlast, cdivres;

    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        d[i] = H.get(i, i);
        e[i] = 0;
      }

      for (j = Math.max(i - 1, 0); j < nn; j++) {
        norm = norm + Math.abs(H.get(i, j));
      }
    }

    while (n >= low) {
      l = n;

      while (l > low) {
        s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));

        if (s === 0) {
          s = norm;
        }

        if (Math.abs(H.get(l, l - 1)) < eps * s) {
          break;
        }

        l--;
      }

      if (l === n) {
        H.set(n, n, H.get(n, n) + exshift);
        d[n] = H.get(n, n);
        e[n] = 0;
        n--;
        iter = 0;
      } else if (l === n - 1) {
        w = H.get(n, n - 1) * H.get(n - 1, n);
        p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
        q = p * p + w;
        z = Math.sqrt(Math.abs(q));
        H.set(n, n, H.get(n, n) + exshift);
        H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
        x = H.get(n, n);

        if (q >= 0) {
          z = p >= 0 ? p + z : p - z;
          d[n - 1] = x + z;
          d[n] = d[n - 1];

          if (z !== 0) {
            d[n] = x - w / z;
          }

          e[n - 1] = 0;
          e[n] = 0;
          x = H.get(n, n - 1);
          s = Math.abs(x) + Math.abs(z);
          p = x / s;
          q = z / s;
          r = Math.sqrt(p * p + q * q);
          p = p / r;
          q = q / r;

          for (j = n - 1; j < nn; j++) {
            z = H.get(n - 1, j);
            H.set(n - 1, j, q * z + p * H.get(n, j));
            H.set(n, j, q * H.get(n, j) - p * z);
          }

          for (i = 0; i <= n; i++) {
            z = H.get(i, n - 1);
            H.set(i, n - 1, q * z + p * H.get(i, n));
            H.set(i, n, q * H.get(i, n) - p * z);
          }

          for (i = low; i <= high; i++) {
            z = V.get(i, n - 1);
            V.set(i, n - 1, q * z + p * V.get(i, n));
            V.set(i, n, q * V.get(i, n) - p * z);
          }
        } else {
          d[n - 1] = x + p;
          d[n] = x + p;
          e[n - 1] = z;
          e[n] = -z;
        }

        n = n - 2;
        iter = 0;
      } else {
        x = H.get(n, n);
        y = 0;
        w = 0;

        if (l < n) {
          y = H.get(n - 1, n - 1);
          w = H.get(n, n - 1) * H.get(n - 1, n);
        }

        if (iter === 10) {
          exshift += x;

          for (i = low; i <= n; i++) {
            H.set(i, i, H.get(i, i) - x);
          }

          s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
          x = y = 0.75 * s;
          w = -0.4375 * s * s;
        }

        if (iter === 30) {
          s = (y - x) / 2;
          s = s * s + w;

          if (s > 0) {
            s = Math.sqrt(s);

            if (y < x) {
              s = -s;
            }

            s = x - w / ((y - x) / 2 + s);

            for (i = low; i <= n; i++) {
              H.set(i, i, H.get(i, i) - s);
            }

            exshift += s;
            x = y = w = 0.964;
          }
        }

        iter = iter + 1;
        m = n - 2;

        while (m >= l) {
          z = H.get(m, m);
          r = x - z;
          s = y - z;
          p = (r * s - w) / H.get(m + 1, m) + H.get(m, m + 1);
          q = H.get(m + 1, m + 1) - z - r - s;
          r = H.get(m + 2, m + 1);
          s = Math.abs(p) + Math.abs(q) + Math.abs(r);
          p = p / s;
          q = q / s;
          r = r / s;

          if (m === l) {
            break;
          }

          if (Math.abs(H.get(m, m - 1)) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H.get(m - 1, m - 1)) + Math.abs(z) + Math.abs(H.get(m + 1, m + 1))))) {
            break;
          }

          m--;
        }

        for (i = m + 2; i <= n; i++) {
          H.set(i, i - 2, 0);

          if (i > m + 2) {
            H.set(i, i - 3, 0);
          }
        }

        for (k = m; k <= n - 1; k++) {
          notlast = k !== n - 1;

          if (k !== m) {
            p = H.get(k, k - 1);
            q = H.get(k + 1, k - 1);
            r = notlast ? H.get(k + 2, k - 1) : 0;
            x = Math.abs(p) + Math.abs(q) + Math.abs(r);

            if (x !== 0) {
              p = p / x;
              q = q / x;
              r = r / x;
            }
          }

          if (x === 0) {
            break;
          }

          s = Math.sqrt(p * p + q * q + r * r);

          if (p < 0) {
            s = -s;
          }

          if (s !== 0) {
            if (k !== m) {
              H.set(k, k - 1, -s * x);
            } else if (l !== m) {
              H.set(k, k - 1, -H.get(k, k - 1));
            }

            p = p + s;
            x = p / s;
            y = q / s;
            z = r / s;
            q = q / p;
            r = r / p;

            for (j = k; j < nn; j++) {
              p = H.get(k, j) + q * H.get(k + 1, j);

              if (notlast) {
                p = p + r * H.get(k + 2, j);
                H.set(k + 2, j, H.get(k + 2, j) - p * z);
              }

              H.set(k, j, H.get(k, j) - p * x);
              H.set(k + 1, j, H.get(k + 1, j) - p * y);
            }

            for (i = 0; i <= Math.min(n, k + 3); i++) {
              p = x * H.get(i, k) + y * H.get(i, k + 1);

              if (notlast) {
                p = p + z * H.get(i, k + 2);
                H.set(i, k + 2, H.get(i, k + 2) - p * r);
              }

              H.set(i, k, H.get(i, k) - p);
              H.set(i, k + 1, H.get(i, k + 1) - p * q);
            }

            for (i = low; i <= high; i++) {
              p = x * V.get(i, k) + y * V.get(i, k + 1);

              if (notlast) {
                p = p + z * V.get(i, k + 2);
                V.set(i, k + 2, V.get(i, k + 2) - p * r);
              }

              V.set(i, k, V.get(i, k) - p);
              V.set(i, k + 1, V.get(i, k + 1) - p * q);
            }
          }
        }
      }
    }

    if (norm === 0) {
      return;
    }

    for (n = nn - 1; n >= 0; n--) {
      p = d[n];
      q = e[n];

      if (q === 0) {
        l = n;
        H.set(n, n, 1);

        for (i = n - 1; i >= 0; i--) {
          w = H.get(i, i) - p;
          r = 0;

          for (j = l; j <= n; j++) {
            r = r + H.get(i, j) * H.get(j, n);
          }

          if (e[i] < 0) {
            z = w;
            s = r;
          } else {
            l = i;

            if (e[i] === 0) {
              H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
            } else {
              x = H.get(i, i + 1);
              y = H.get(i + 1, i);
              q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
              t = (x * s - z * r) / q;
              H.set(i, n, t);
              H.set(i + 1, n, Math.abs(x) > Math.abs(z) ? (-r - w * t) / x : (-s - y * t) / z);
            }

            t = Math.abs(H.get(i, n));

            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H.set(j, n, H.get(j, n) / t);
              }
            }
          }
        }
      } else if (q < 0) {
        l = n - 1;

        if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
          H.set(n - 1, n - 1, q / H.get(n, n - 1));
          H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
        } else {
          cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
          H.set(n - 1, n - 1, cdivres[0]);
          H.set(n - 1, n, cdivres[1]);
        }

        H.set(n, n - 1, 0);
        H.set(n, n, 1);

        for (i = n - 2; i >= 0; i--) {
          ra = 0;
          sa = 0;

          for (j = l; j <= n; j++) {
            ra = ra + H.get(i, j) * H.get(j, n - 1);
            sa = sa + H.get(i, j) * H.get(j, n);
          }

          w = H.get(i, i) - p;

          if (e[i] < 0) {
            z = w;
            r = ra;
            s = sa;
          } else {
            l = i;

            if (e[i] === 0) {
              cdivres = cdiv(-ra, -sa, w, q);
              H.set(i, n - 1, cdivres[0]);
              H.set(i, n, cdivres[1]);
            } else {
              x = H.get(i, i + 1);
              y = H.get(i + 1, i);
              vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
              vi = (d[i] - p) * 2 * q;

              if (vr === 0 && vi === 0) {
                vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
              }

              cdivres = cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
              H.set(i, n - 1, cdivres[0]);
              H.set(i, n, cdivres[1]);

              if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                H.set(i + 1, n - 1, (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x);
                H.set(i + 1, n, (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x);
              } else {
                cdivres = cdiv(-r - y * H.get(i, n - 1), -s - y * H.get(i, n), z, q);
                H.set(i + 1, n - 1, cdivres[0]);
                H.set(i + 1, n, cdivres[1]);
              }
            }

            t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));

            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H.set(j, n - 1, H.get(j, n - 1) / t);
                H.set(j, n, H.get(j, n) / t);
              }
            }
          }
        }
      }
    }

    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        for (j = i; j < nn; j++) {
          V.set(i, j, H.get(i, j));
        }
      }
    }

    for (j = nn - 1; j >= low; j--) {
      for (i = low; i <= high; i++) {
        z = 0;

        for (k = low; k <= Math.min(j, high); k++) {
          z = z + V.get(i, k) * H.get(k, j);
        }

        V.set(i, j, z);
      }
    }
  }

  function cdiv(xr, xi, yr, yi) {
    let r, d;

    if (Math.abs(yr) > Math.abs(yi)) {
      r = yi / yr;
      d = yr + r * yi;
      return [(xr + r * xi) / d, (xi - r * xr) / d];
    } else {
      r = yr / yi;
      d = yi + r * yr;
      return [(r * xr + xi) / d, (r * xi - xr) / d];
    }
  }

  class CholeskyDecomposition$1 {
    constructor(value) {
      value = WrapperMatrix2D.checkMatrix(value);

      if (!value.isSymmetric()) {
        throw new Error('Matrix is not symmetric');
      }

      let a = value;
      let dimension = a.rows;
      let l = new Matrix$2(dimension, dimension);
      let positiveDefinite = true;
      let i, j, k;

      for (j = 0; j < dimension; j++) {
        let d = 0;

        for (k = 0; k < j; k++) {
          let s = 0;

          for (i = 0; i < k; i++) {
            s += l.get(k, i) * l.get(j, i);
          }

          s = (a.get(j, k) - s) / l.get(k, k);
          l.set(j, k, s);
          d = d + s * s;
        }

        d = a.get(j, j) - d;
        positiveDefinite &= d > 0;
        l.set(j, j, Math.sqrt(Math.max(d, 0)));

        for (k = j + 1; k < dimension; k++) {
          l.set(j, k, 0);
        }
      }

      this.L = l;
      this.positiveDefinite = Boolean(positiveDefinite);
    }

    isPositiveDefinite() {
      return this.positiveDefinite;
    }

    solve(value) {
      value = WrapperMatrix2D.checkMatrix(value);
      let l = this.L;
      let dimension = l.rows;

      if (value.rows !== dimension) {
        throw new Error('Matrix dimensions do not match');
      }

      if (this.isPositiveDefinite() === false) {
        throw new Error('Matrix is not positive definite');
      }

      let count = value.columns;
      let B = value.clone();
      let i, j, k;

      for (k = 0; k < dimension; k++) {
        for (j = 0; j < count; j++) {
          for (i = 0; i < k; i++) {
            B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
          }

          B.set(k, j, B.get(k, j) / l.get(k, k));
        }
      }

      for (k = dimension - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          for (i = k + 1; i < dimension; i++) {
            B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
          }

          B.set(k, j, B.get(k, j) / l.get(k, k));
        }
      }

      return B;
    }

    get lowerTriangularMatrix() {
      return this.L;
    }

  }

  class nipals {
    constructor(X, options = {}) {
      X = WrapperMatrix2D.checkMatrix(X);
      let {
        Y
      } = options;
      const {
        scaleScores = false,
        maxIterations = 1000,
        terminationCriteria = 1e-10
      } = options;
      let u;

      if (Y) {
        if (Array.isArray(Y) && typeof Y[0] === 'number') {
          Y = Matrix$2.columnVector(Y);
        } else {
          Y = WrapperMatrix2D.checkMatrix(Y);
        }

        if (Y.rows !== X.rows) {
          throw new Error('Y should have the same number of rows as X');
        }

        u = Y.getColumnVector(0);
      } else {
        u = X.getColumnVector(0);
      }

      let diff = 1;
      let t, q, w, tOld;

      for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
        w = X.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
        w = w.div(w.norm());
        t = X.mmul(w).div(w.transpose().mmul(w).get(0, 0));

        if (counter > 0) {
          diff = t.clone().sub(tOld).pow(2).sum();
        }

        tOld = t.clone();

        if (Y) {
          q = Y.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          q = q.div(q.norm());
          u = Y.mmul(q).div(q.transpose().mmul(q).get(0, 0));
        } else {
          u = t;
        }
      }

      if (Y) {
        let p = X.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
        p = p.div(p.norm());
        let xResidual = X.clone().sub(t.clone().mmul(p.transpose()));
        let residual = u.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
        let yResidual = Y.clone().sub(t.clone().mulS(residual.get(0, 0)).mmul(q.transpose()));
        this.t = t;
        this.p = p.transpose();
        this.w = w.transpose();
        this.q = q;
        this.u = u;
        this.s = t.transpose().mmul(t);
        this.xResidual = xResidual;
        this.yResidual = yResidual;
        this.betas = residual;
      } else {
        this.w = w.transpose();
        this.s = t.transpose().mmul(t).sqrt();

        if (scaleScores) {
          this.t = t.clone().div(this.s.get(0, 0));
        } else {
          this.t = t;
        }

        this.xResidual = X.sub(t.mmul(w.transpose()));
      }
    }

  }

  var MatrixLib = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AbstractMatrix: AbstractMatrix,
    'default': Matrix$2,
    Matrix: Matrix$2,
    wrap: wrap,
    WrapperMatrix1D: WrapperMatrix1D,
    WrapperMatrix2D: WrapperMatrix2D,
    solve: solve,
    inverse: inverse,
    determinant: determinant,
    linearDependencies: linearDependencies,
    pseudoInverse: pseudoInverse,
    covariance: covariance$1,
    correlation: correlation,
    SingularValueDecomposition: SingularValueDecomposition,
    SVD: SingularValueDecomposition,
    EigenvalueDecomposition: EigenvalueDecomposition,
    EVD: EigenvalueDecomposition,
    CholeskyDecomposition: CholeskyDecomposition$1,
    CHO: CholeskyDecomposition$1,
    LuDecomposition: LuDecomposition$1,
    LU: LuDecomposition$1,
    QrDecomposition: QrDecomposition$1,
    QR: QrDecomposition$1,
    Nipals: nipals,
    NIPALS: nipals,
    MatrixColumnView: MatrixColumnView,
    MatrixColumnSelectionView: MatrixColumnSelectionView,
    MatrixFlipColumnView: MatrixFlipColumnView,
    MatrixFlipRowView: MatrixFlipRowView,
    MatrixRowView: MatrixRowView,
    MatrixRowSelectionView: MatrixRowSelectionView,
    MatrixSelectionView: MatrixSelectionView,
    MatrixSubView: MatrixSubView,
    MatrixTransposeView: MatrixTransposeView$1
  });

  function sum(input) {
    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var sumValue = 0;

    for (var i = 0; i < input.length; i++) {
      sumValue += input[i];
    }

    return sumValue;
  }

  function mean$1(input) {
    return sum(input) / input.length;
  }

  /**
   * @private
   * return an array of probabilities of each class
   * @param {Array} array - contains the classes
   * @param {number} numberOfClasses
   * @return {Matrix} - rowVector of probabilities.
   */

  function toDiscreteDistribution(array, numberOfClasses) {
    let counts = new Array(numberOfClasses).fill(0);

    for (let i = 0; i < array.length; ++i) {
      counts[array[i]] += 1 / array.length;
    }

    return Matrix$2.rowVector(counts);
  }
  /**
   * @private
   * Retrieves the impurity of array of predictions
   * @param {Array} array - predictions.
   * @return {number} Gini impurity
   */

  function giniImpurity(array) {
    if (array.length === 0) {
      return 0;
    }

    let probabilities = toDiscreteDistribution(array, getNumberOfClasses(array)).getRow(0);
    let sum = 0.0;

    for (let i = 0; i < probabilities.length; ++i) {
      sum += probabilities[i] * probabilities[i];
    }

    return 1 - sum;
  }
  /**
   * @private
   * Return the number of classes given the array of predictions.
   * @param {Array} array - predictions.
   * @return {number} Number of classes.
   */

  function getNumberOfClasses(array) {
    return array.filter(function (val, i, arr) {
      return arr.indexOf(val) === i;
    }).map(val => val + 1).reduce((a, b) => Math.max(a, b));
  }
  /**
   * @private
   * Calculates the Gini Gain of an array of predictions and those predictions splitted by a feature.
   * @param {Array} array - Predictions
   * @param {object} splitted - Object with elements "greater" and "lesser" that contains an array of predictions splitted.
   * @return {number} - Gini Gain.
   */

  function giniGain(array, splitted) {
    let splitsImpurity = 0.0;
    let splits = ['greater', 'lesser'];

    for (let i = 0; i < splits.length; ++i) {
      let currentSplit = splitted[splits[i]];
      splitsImpurity += giniImpurity(currentSplit) * currentSplit.length / array.length;
    }

    return giniImpurity(array) - splitsImpurity;
  }
  /**
   * @private
   * Calculates the squared error of a predictions values.
   * @param {Array} array - predictions values
   * @return {number} squared error.
   */

  function squaredError(array) {
    let l = array.length;

    if (l === 0) {
      return 0.0;
    }

    let m = mean$1(array);
    let error = 0.0;

    for (let i = 0; i < l; ++i) {
      let currentElement = array[i];
      error += (currentElement - m) * (currentElement - m);
    }

    return error;
  }
  /**
   * @private
   * Calculates the sum of squared error of the two arrays that contains the splitted values.
   * @param {Array} array - this argument is no necessary but is used to fit with the main interface.
   * @param {object} splitted - Object with elements "greater" and "lesser" that contains an array of predictions splitted.
   * @return {number} - sum of squared errors.
   */

  function regressionError(array, splitted) {
    let error = 0.0;
    let splits = ['greater', 'lesser'];

    for (let i = 0; i < splits.length; ++i) {
      let currentSplit = splitted[splits[i]];
      error += squaredError(currentSplit);
    }

    return error;
  }
  /**
   * @private
   * Split the training set and values from a given column of the training set if is less than a value
   * @param {Matrix} X - Training set.
   * @param {Array} y - Training values.
   * @param {number} column - Column to split.
   * @param {number} value - value to split the Training set and values.
   * @return {object} - Object that contains the splitted values.
   */

  function matrixSplitter(X, y, column, value) {
    let lesserX = [];
    let greaterX = [];
    let lesserY = [];
    let greaterY = [];

    for (let i = 0; i < X.rows; ++i) {
      if (X.get(i, column) < value) {
        lesserX.push(X.getRow(i));
        lesserY.push(y[i]);
      } else {
        greaterX.push(X.getRow(i));
        greaterY.push(y[i]);
      }
    }

    return {
      greaterX: greaterX,
      greaterY: greaterY,
      lesserX: lesserX,
      lesserY: lesserY
    };
  }
  /**
   * @private
   * Calculates the mean between two values
   * @param {number} a
   * @param {number} b
   * @return {number}
   */

  function mean(a, b) {
    return (a + b) / 2;
  }
  /**
   * @private
   * Returns a list of tuples that contains the i-th element of each array.
   * @param {Array} a
   * @param {Array} b
   * @return {Array} list of tuples.
   */

  function zip(a, b) {
    if (a.length !== b.length) {
      throw new TypeError(`Error on zip: the size of a: ${a.length} is different from b: ${b.length}`);
    }

    let ret = new Array(a.length);

    for (let i = 0; i < a.length; ++i) {
      ret[i] = [a[i], b[i]];
    }

    return ret;
  }

  const gainFunctions = {
    gini: giniGain,
    regression: regressionError
  };
  const splitFunctions = {
    mean: mean
  };
  class TreeNode {
    /**
     * @private
     * Constructor for a tree node given the options received on the main classes (DecisionTreeClassifier, DecisionTreeRegression)
     * @param {object|TreeNode} options for loading
     * @constructor
     */
    constructor(options) {
      // options parameters
      this.kind = options.kind;
      this.gainFunction = options.gainFunction;
      this.splitFunction = options.splitFunction;
      this.minNumSamples = options.minNumSamples;
      this.maxDepth = options.maxDepth;
    }
    /**
     * @private
     * Function that retrieve the best feature to make the split.
     * @param {Matrix} XTranspose - Training set transposed
     * @param {Array} y - labels or values (depending of the decision tree)
     * @return {object} - return tree values, the best gain, column and the split value.
     */


    bestSplit(XTranspose, y) {
      // Depending in the node tree class, we set the variables to check information gain (to classify)
      // or error (for regression)
      let bestGain = this.kind === 'classifier' ? -Infinity : Infinity;
      let check = this.kind === 'classifier' ? (a, b) => a > b : (a, b) => a < b;
      let maxColumn;
      let maxValue;

      for (let i = 0; i < XTranspose.rows; ++i) {
        let currentFeature = XTranspose.getRow(i);
        let splitValues = this.featureSplit(currentFeature, y);

        for (let j = 0; j < splitValues.length; ++j) {
          let currentSplitVal = splitValues[j];
          let splitted = this.split(currentFeature, y, currentSplitVal);
          let gain = gainFunctions[this.gainFunction](y, splitted);

          if (check(gain, bestGain)) {
            maxColumn = i;
            maxValue = currentSplitVal;
            bestGain = gain;
          }
        }
      }

      return {
        maxGain: bestGain,
        maxColumn: maxColumn,
        maxValue: maxValue
      };
    }
    /**
     * @private
     * Makes the split of the training labels or values from the training set feature given a split value.
     * @param {Array} x - Training set feature
     * @param {Array} y - Training set value or label
     * @param {number} splitValue
     * @return {object}
     */


    split(x, y, splitValue) {
      let lesser = [];
      let greater = [];

      for (let i = 0; i < x.length; ++i) {
        if (x[i] < splitValue) {
          lesser.push(y[i]);
        } else {
          greater.push(y[i]);
        }
      }

      return {
        greater: greater,
        lesser: lesser
      };
    }
    /**
     * @private
     * Calculates the possible points to split over the tree given a training set feature and corresponding labels or values.
     * @param {Array} x - Training set feature
     * @param {Array} y - Training set value or label
     * @return {Array} possible split values.
     */


    featureSplit(x, y) {
      let splitValues = [];
      let arr = zip(x, y);
      arr.sort(function (a, b) {
        return a[0] - b[0];
      });

      for (let i = 1; i < arr.length; ++i) {
        if (arr[i - 1][1] !== arr[i][1]) {
          splitValues.push(splitFunctions[this.splitFunction](arr[i - 1][0], arr[i][0]));
        }
      }

      return splitValues;
    }
    /**
     * @private
     * Calculate the predictions of a leaf tree node given the training labels or values
     * @param {Array} y
     */


    calculatePrediction(y) {
      if (this.kind === 'classifier') {
        this.distribution = toDiscreteDistribution(y, getNumberOfClasses(y));

        if (this.distribution.columns === 0) {
          throw new TypeError('Error on calculate the prediction');
        }
      } else {
        this.distribution = mean$1(y);
      }
    }
    /**
     * @private
     * Train a node given the training set and labels, because it trains recursively, it also receive
     * the current depth of the node, parent gain to avoid infinite recursion and boolean value to check if
     * the training set is transposed.
     * @param {Matrix} X - Training set (could be transposed or not given transposed).
     * @param {Array} y - Training labels or values.
     * @param {number} currentDepth - Current depth of the node.
     * @param {number} parentGain - parent node gain or error.
     */


    train(X, y, currentDepth, parentGain) {
      if (X.rows <= this.minNumSamples) {
        this.calculatePrediction(y);
        return;
      }

      if (parentGain === undefined) parentGain = 0.0;
      let XTranspose = X.transpose();
      let split = this.bestSplit(XTranspose, y);
      this.splitValue = split.maxValue;
      this.splitColumn = split.maxColumn;
      this.gain = split.maxGain;
      let splittedMatrix = matrixSplitter(X, y, this.splitColumn, this.splitValue);

      if (currentDepth < this.maxDepth && this.gain > 0.01 && this.gain !== parentGain && splittedMatrix.lesserX.length > 0 && splittedMatrix.greaterX.length > 0) {
        this.left = new TreeNode(this);
        this.right = new TreeNode(this);
        let lesserX = new Matrix$2(splittedMatrix.lesserX);
        let greaterX = new Matrix$2(splittedMatrix.greaterX);
        this.left.train(lesserX, splittedMatrix.lesserY, currentDepth + 1, this.gain);
        this.right.train(greaterX, splittedMatrix.greaterY, currentDepth + 1, this.gain);
      } else {
        this.calculatePrediction(y);
      }
    }
    /**
     * @private
     * Calculates the prediction of a given element.
     * @param {Array} row
     * @return {number|Array} prediction
     *          * if a node is a classifier returns an array of probabilities of each class.
     *          * if a node is for regression returns a number with the prediction.
     */


    classify(row) {
      if (this.right && this.left) {
        if (row[this.splitColumn] < this.splitValue) {
          return this.left.classify(row);
        } else {
          return this.right.classify(row);
        }
      }

      return this.distribution;
    }
    /**
     * @private
     * Set the parameter of the current node and their children.
     * @param {object} node - parameters of the current node and the children.
     */


    setNodeParameters(node) {
      if (node.distribution !== undefined) {
        this.distribution = node.distribution.constructor === Array ? new Matrix$2(node.distribution) : node.distribution;
      } else {
        this.distribution = undefined;
        this.splitValue = node.splitValue;
        this.splitColumn = node.splitColumn;
        this.gain = node.gain;
        this.left = new TreeNode(this);
        this.right = new TreeNode(this);

        if (node.left !== {}) {
          this.left.setNodeParameters(node.left);
        }

        if (node.right !== {}) {
          this.right.setNodeParameters(node.right);
        }
      }
    }

  }

  const defaultOptions$h = {
    gainFunction: 'gini',
    splitFunction: 'mean',
    minNumSamples: 3,
    maxDepth: Infinity
  };
  class DecisionTreeClassifier {
    /**
     * Create new Decision Tree Classifier with CART implementation with the given options
     * @param {object} options
     * @param {string} [options.gainFunction="gini"] - gain function to get the best split, "gini" the only one supported.
     * @param {string} [options.splitFunction="mean"] - given two integers from a split feature, get the value to split, "mean" the only one supported.
     * @param {number} [options.minNumSamples=3] - minimum number of samples to create a leaf node to decide a class.
     * @param {number} [options.maxDepth=Infinity] - Max depth of the tree.
     * @param {object} model - for load purposes.
     * @constructor
     */
    constructor(options, model) {
      if (options === true) {
        this.options = model.options;
        this.root = new TreeNode(model.options);
        this.root.setNodeParameters(model.root);
      } else {
        this.options = Object.assign({}, defaultOptions$h, options);
        this.options.kind = 'classifier';
      }
    }
    /**
     * Train the decision tree with the given training set and labels.
     * @param {Matrix|MatrixTransposeView|Array} trainingSet
     * @param {Array} trainingLabels
     */


    train(trainingSet, trainingLabels) {
      this.root = new TreeNode(this.options);
      trainingSet = Matrix$2.checkMatrix(trainingSet);
      this.root.train(trainingSet, trainingLabels, 0, null);
    }
    /**
     * Predicts the output given the matrix to predict.
     * @param {Matrix|MatrixTransposeView|Array} toPredict
     * @return {Array} predictions
     */


    predict(toPredict) {
      toPredict = Matrix$2.checkMatrix(toPredict);
      let predictions = new Array(toPredict.rows);

      for (let i = 0; i < toPredict.rows; ++i) {
        predictions[i] = this.root.classify(toPredict.getRow(i)).maxRowIndex(0)[1];
      }

      return predictions;
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      return {
        options: this.options,
        root: this.root,
        name: 'DTClassifier'
      };
    }
    /**
     * Load a Decision tree classifier with the given model.
     * @param {object} model
     * @return {DecisionTreeClassifier}
     */


    static load(model) {
      if (model.name !== 'DTClassifier') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      return new DecisionTreeClassifier(true, model);
    }

  }

  const defaultOptions$g = {
    gainFunction: 'regression',
    splitFunction: 'mean',
    minNumSamples: 3,
    maxDepth: Infinity
  };
  class DecisionTreeRegression {
    /**
     * Create new Decision Tree Regression with CART implementation with the given options.
     * @param {object} options
     * @param {string} [options.gainFunction="regression"] - gain function to get the best split, "regression" the only one supported.
     * @param {string} [options.splitFunction="mean"] - given two integers from a split feature, get the value to split, "mean" the only one supported.
     * @param {number} [options.minNumSamples=3] - minimum number of samples to create a leaf node to decide a class.
     * @param {number} [options.maxDepth=Infinity] - Max depth of the tree.
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        this.options = model.options;
        this.root = new TreeNode(model.options);
        this.root.setNodeParameters(model.root);
      } else {
        this.options = Object.assign({}, defaultOptions$g, options);
        this.options.kind = 'regression';
      }
    }
    /**
     * Train the decision tree with the given training set and values.
     * @param {Matrix|MatrixTransposeView|Array} trainingSet
     * @param {Array} trainingValues
     */


    train(trainingSet, trainingValues) {
      this.root = new TreeNode(this.options);

      if (typeof trainingSet[0] !== 'undefined' && trainingSet[0].length === undefined) {
        trainingSet = Matrix$2.columnVector(trainingSet);
      } else {
        trainingSet = Matrix$2.checkMatrix(trainingSet);
      }

      this.root.train(trainingSet, trainingValues, 0);
    }
    /**
     * Predicts the values given the matrix to predict.
     * @param {Matrix|MatrixTransposeView|Array} toPredict
     * @return {Array} predictions
     */


    predict(toPredict) {
      if (typeof toPredict[0] !== 'undefined' && toPredict[0].length === undefined) {
        toPredict = Matrix$2.columnVector(toPredict);
      }

      toPredict = Matrix$2.checkMatrix(toPredict);
      let predictions = new Array(toPredict.rows);

      for (let i = 0; i < toPredict.rows; ++i) {
        predictions[i] = this.root.classify(toPredict.getRow(i));
      }

      return predictions;
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      return {
        options: this.options,
        root: this.root,
        name: 'DTRegression'
      };
    }
    /**
     * Load a Decision tree regression with the given model.
     * @param {object} model
     * @return {DecisionTreeRegression}
     */


    static load(model) {
      if (model.name !== 'DTRegression') {
        throw new RangeError(`Invalid model:${model.name}`);
      }

      return new DecisionTreeRegression(true, model);
    }

  }

  const SMALLEST_UNSAFE_INTEGER = 0x20000000000000;
  const LARGEST_SAFE_INTEGER = SMALLEST_UNSAFE_INTEGER - 1;
  const UINT32_MAX = -1 >>> 0;
  const UINT32_SIZE = UINT32_MAX + 1;
  const INT32_SIZE = UINT32_SIZE / 2;
  const INT32_MAX = INT32_SIZE - 1;
  const UINT21_SIZE = 1 << 21;
  const UINT21_MAX = UINT21_SIZE - 1;
  /**
   * Returns a value within [-0x80000000, 0x7fffffff]
   */

  function int32(engine) {
    return engine.next() | 0;
  }

  function add(distribution, addend) {
    if (addend === 0) {
      return distribution;
    } else {
      return engine => distribution(engine) + addend;
    }
  }
  /**
   * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
   */


  function int53(engine) {
    const high = engine.next() | 0;
    const low = engine.next() >>> 0;
    return (high & UINT21_MAX) * UINT32_SIZE + low + (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0);
  }
  /**
   * Returns a value within [-0x20000000000000, 0x20000000000000]
   */


  function int53Full(engine) {
    while (true) {
      const high = engine.next() | 0;

      if (high & 0x400000) {
        if ((high & 0x7fffff) === 0x400000 && (engine.next() | 0) === 0) {
          return SMALLEST_UNSAFE_INTEGER;
        }
      } else {
        const low = engine.next() >>> 0;
        return (high & UINT21_MAX) * UINT32_SIZE + low + (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0);
      }
    }
  }
  /**
   * Returns a value within [0, 0xffffffff]
   */


  function uint32(engine) {
    return engine.next() >>> 0;
  }
  /**
   * Returns a value within [0, 0x1fffffffffffff]
   */


  function uint53(engine) {
    const high = engine.next() & UINT21_MAX;
    const low = engine.next() >>> 0;
    return high * UINT32_SIZE + low;
  }
  /**
   * Returns a value within [0, 0x20000000000000]
   */


  function uint53Full(engine) {
    while (true) {
      const high = engine.next() | 0;

      if (high & UINT21_SIZE) {
        if ((high & UINT21_MAX) === 0 && (engine.next() | 0) === 0) {
          return SMALLEST_UNSAFE_INTEGER;
        }
      } else {
        const low = engine.next() >>> 0;
        return (high & UINT21_MAX) * UINT32_SIZE + low;
      }
    }
  }

  function isPowerOfTwoMinusOne(value) {
    return (value + 1 & value) === 0;
  }

  function bitmask(masking) {
    return engine => engine.next() & masking;
  }

  function downscaleToLoopCheckedRange(range) {
    const extendedRange = range + 1;
    const maximum = extendedRange * Math.floor(UINT32_SIZE / extendedRange);
    return engine => {
      let value = 0;

      do {
        value = engine.next() >>> 0;
      } while (value >= maximum);

      return value % extendedRange;
    };
  }

  function downscaleToRange(range) {
    if (isPowerOfTwoMinusOne(range)) {
      return bitmask(range);
    } else {
      return downscaleToLoopCheckedRange(range);
    }
  }

  function isEvenlyDivisibleByMaxInt32(value) {
    return (value | 0) === 0;
  }

  function upscaleWithHighMasking(masking) {
    return engine => {
      const high = engine.next() & masking;
      const low = engine.next() >>> 0;
      return high * UINT32_SIZE + low;
    };
  }

  function upscaleToLoopCheckedRange(extendedRange) {
    const maximum = extendedRange * Math.floor(SMALLEST_UNSAFE_INTEGER / extendedRange);
    return engine => {
      let ret = 0;

      do {
        const high = engine.next() & UINT21_MAX;
        const low = engine.next() >>> 0;
        ret = high * UINT32_SIZE + low;
      } while (ret >= maximum);

      return ret % extendedRange;
    };
  }

  function upscaleWithinU53(range) {
    const extendedRange = range + 1;

    if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
      const highRange = (extendedRange / UINT32_SIZE | 0) - 1;

      if (isPowerOfTwoMinusOne(highRange)) {
        return upscaleWithHighMasking(highRange);
      }
    }

    return upscaleToLoopCheckedRange(extendedRange);
  }

  function upscaleWithinI53AndLoopCheck(min, max) {
    return engine => {
      let ret = 0;

      do {
        const high = engine.next() | 0;
        const low = engine.next() >>> 0;
        ret = (high & UINT21_MAX) * UINT32_SIZE + low + (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0);
      } while (ret < min || ret > max);

      return ret;
    };
  }
  /**
   * Returns a Distribution to return a value within [min, max]
   * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
   * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
   */


  function integer(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);

    if (min < -SMALLEST_UNSAFE_INTEGER || !isFinite(min)) {
      throw new RangeError(`Expected min to be at least ${-SMALLEST_UNSAFE_INTEGER}`);
    } else if (max > SMALLEST_UNSAFE_INTEGER || !isFinite(max)) {
      throw new RangeError(`Expected max to be at most ${SMALLEST_UNSAFE_INTEGER}`);
    }

    const range = max - min;

    if (range <= 0 || !isFinite(range)) {
      return () => min;
    } else if (range === UINT32_MAX) {
      if (min === 0) {
        return uint32;
      } else {
        return add(int32, min + INT32_SIZE);
      }
    } else if (range < UINT32_MAX) {
      return add(downscaleToRange(range), min);
    } else if (range === LARGEST_SAFE_INTEGER) {
      return add(uint53, min);
    } else if (range < LARGEST_SAFE_INTEGER) {
      return add(upscaleWithinU53(range), min);
    } else if (max - 1 - min === LARGEST_SAFE_INTEGER) {
      return add(uint53Full, min);
    } else if (min === -SMALLEST_UNSAFE_INTEGER && max === SMALLEST_UNSAFE_INTEGER) {
      return int53Full;
    } else if (min === -SMALLEST_UNSAFE_INTEGER && max === LARGEST_SAFE_INTEGER) {
      return int53;
    } else if (min === -LARGEST_SAFE_INTEGER && max === SMALLEST_UNSAFE_INTEGER) {
      return add(int53, 1);
    } else if (max === SMALLEST_UNSAFE_INTEGER) {
      return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
    } else {
      return upscaleWithinI53AndLoopCheck(min, max);
    }
  }
  // has 2**x chars, for faster uniform distribution


  const DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

  function string(pool = DEFAULT_STRING_POOL) {
    const poolLength = pool.length;

    if (!poolLength) {
      throw new Error("Expected pool not to be an empty string");
    }

    const distribution = integer(0, poolLength - 1);
    return (engine, length) => {
      let result = "";

      for (let i = 0; i < length; ++i) {
        const j = distribution(engine);
        result += pool.charAt(j);
      }

      return result;
    };
  }

  const LOWER_HEX_POOL = "0123456789abcdef";
  string(LOWER_HEX_POOL);
  string(LOWER_HEX_POOL.toUpperCase());

  (() => {
    try {
      if ("x".repeat(3) === "xxx") {
        return (pattern, count) => pattern.repeat(count);
      }
    } catch (_) {// nothing to do here
    }

    return (pattern, count) => {
      let result = "";

      while (count > 0) {
        if (count & 1) {
          result += pattern;
        }

        count >>= 1;
        pattern += pattern;
      }

      return result;
    };
  })();
  /**
   * An int32-producing Engine that uses `Math.random()`
   */


  const nativeMath = {
    next() {
      return Math.random() * UINT32_SIZE | 0;
    }

  }; // tslint:disable:unified-signatures
  /**
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
   */


  const I32Array = (() => {
    try {
      const buffer = new ArrayBuffer(4);
      const view = new Int32Array(buffer);
      view[0] = INT32_SIZE;

      if (view[0] === -INT32_SIZE) {
        return Int32Array;
      }
    } catch (_) {// nothing to do here
    }

    return Array;
  })();
  /**
   * Returns an array of random int32 values, based on current time
   * and a random number engine
   *
   * @param engine an Engine to pull random values from, default `nativeMath`
   * @param length the length of the Array, minimum 1, default 16
   */

  function createEntropy(engine = nativeMath, length = 16) {
    const array = [];
    array.push(new Date().getTime() | 0);

    for (let i = 1; i < length; ++i) {
      array[i] = engine.next() | 0;
    }

    return array;
  }
  /**
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
   */


  const imul = (() => {
    try {
      if (Math.imul(UINT32_MAX, 5) === -5) {
        return Math.imul;
      }
    } catch (_) {// nothing to do here
    }

    const UINT16_MAX = 0xffff;
    return (a, b) => {
      const ah = a >>> 16 & UINT16_MAX;
      const al = a & UINT16_MAX;
      const bh = b >>> 16 & UINT16_MAX;
      const bl = b & UINT16_MAX; // the shift by 0 fixes the sign on the high part
      // the final |0 converts the unsigned value into a signed value

      return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
    };
  })();

  const ARRAY_SIZE = 624;
  const ARRAY_MAX = ARRAY_SIZE - 1;
  const M = 397;
  const ARRAY_SIZE_MINUS_M = ARRAY_SIZE - M;
  const A = 0x9908b0df;
  /**
   * An Engine that is a pseudorandom number generator using the Mersenne
   * Twister algorithm based on the prime 2**19937 − 1
   *
   * See http://en.wikipedia.org/wiki/Mersenne_twister
   */

  class MersenneTwister19937 {
    /**
     * MersenneTwister19937 should not be instantiated directly.
     * Instead, use the static methods `seed`, `seedWithArray`, or `autoSeed`.
     */
    constructor() {
      this.data = new I32Array(ARRAY_SIZE);
      this.index = 0; // integer within [0, 624]

      this.uses = 0;
    }
    /**
     * Returns a MersenneTwister19937 seeded with an initial int32 value
     * @param initial the initial seed value
     */


    static seed(initial) {
      return new MersenneTwister19937().seed(initial);
    }
    /**
     * Returns a MersenneTwister19937 seeded with zero or more int32 values
     * @param source A series of int32 values
     */


    static seedWithArray(source) {
      return new MersenneTwister19937().seedWithArray(source);
    }
    /**
     * Returns a MersenneTwister19937 seeded with the current time and
     * a series of natively-generated random values
     */


    static autoSeed() {
      return MersenneTwister19937.seedWithArray(createEntropy());
    }
    /**
     * Returns the next int32 value of the sequence
     */


    next() {
      if ((this.index | 0) >= ARRAY_SIZE) {
        refreshData(this.data);
        this.index = 0;
      }

      const value = this.data[this.index];
      this.index = this.index + 1 | 0;
      this.uses += 1;
      return temper(value) | 0;
    }
    /**
     * Returns the number of times that the Engine has been used.
     *
     * This can be provided to an unused MersenneTwister19937 with the same
     * seed, bringing it to the exact point that was left off.
     */


    getUseCount() {
      return this.uses;
    }
    /**
     * Discards one or more items from the engine
     * @param count The count of items to discard
     */


    discard(count) {
      if (count <= 0) {
        return this;
      }

      this.uses += count;

      if ((this.index | 0) >= ARRAY_SIZE) {
        refreshData(this.data);
        this.index = 0;
      }

      while (count + this.index > ARRAY_SIZE) {
        count -= ARRAY_SIZE - this.index;
        refreshData(this.data);
        this.index = 0;
      }

      this.index = this.index + count | 0;
      return this;
    }

    seed(initial) {
      let previous = 0;
      this.data[0] = previous = initial | 0;

      for (let i = 1; i < ARRAY_SIZE; i = i + 1 | 0) {
        this.data[i] = previous = imul(previous ^ previous >>> 30, 0x6c078965) + i | 0;
      }

      this.index = ARRAY_SIZE;
      this.uses = 0;
      return this;
    }

    seedWithArray(source) {
      this.seed(0x012bd6aa);
      seedWithArray(this.data, source);
      return this;
    }

  }

  function refreshData(data) {
    let k = 0;
    let tmp = 0;

    for (; (k | 0) < ARRAY_SIZE_MINUS_M; k = k + 1 | 0) {
      tmp = data[k] & INT32_SIZE | data[k + 1 | 0] & INT32_MAX;
      data[k] = data[k + M | 0] ^ tmp >>> 1 ^ (tmp & 0x1 ? A : 0);
    }

    for (; (k | 0) < ARRAY_MAX; k = k + 1 | 0) {
      tmp = data[k] & INT32_SIZE | data[k + 1 | 0] & INT32_MAX;
      data[k] = data[k - ARRAY_SIZE_MINUS_M | 0] ^ tmp >>> 1 ^ (tmp & 0x1 ? A : 0);
    }

    tmp = data[ARRAY_MAX] & INT32_SIZE | data[0] & INT32_MAX;
    data[ARRAY_MAX] = data[M - 1] ^ tmp >>> 1 ^ (tmp & 0x1 ? A : 0);
  }

  function temper(value) {
    value ^= value >>> 11;
    value ^= value << 7 & 0x9d2c5680;
    value ^= value << 15 & 0xefc60000;
    return value ^ value >>> 18;
  }

  function seedWithArray(data, source) {
    let i = 1;
    let j = 0;
    const sourceLength = source.length;
    let k = Math.max(sourceLength, ARRAY_SIZE) | 0;
    let previous = data[0] | 0;

    for (; (k | 0) > 0; --k) {
      data[i] = previous = (data[i] ^ imul(previous ^ previous >>> 30, 0x0019660d)) + (source[j] | 0) + (j | 0) | 0;
      i = i + 1 | 0;
      ++j;

      if ((i | 0) > ARRAY_MAX) {
        data[0] = data[ARRAY_MAX];
        i = 1;
      }

      if (j >= sourceLength) {
        j = 0;
      }
    }

    for (k = ARRAY_MAX; (k | 0) > 0; --k) {
      data[i] = previous = (data[i] ^ imul(previous ^ previous >>> 30, 0x5d588b65)) - i | 0;
      i = i + 1 | 0;

      if ((i | 0) > ARRAY_MAX) {
        data[0] = data[ARRAY_MAX];
        i = 1;
      }
    }

    data[0] = INT32_SIZE;
  }

  function checkFloat(n) {
    return n > 0.0 && n <= 1.0;
  }
  /**
   * Select n with replacement elements on the training set and values, where n is the size of the training set.
   * @ignore
   * @param {Matrix} trainingSet
   * @param {Array} trainingValue
   * @param {number} seed - seed for the random selection, must be a 32-bit integer.
   * @return {object} with new X and y.
   */

  function examplesBaggingWithReplacement(trainingSet, trainingValue, seed) {
    let engine;
    let distribution = integer(0, trainingSet.rows - 1);

    if (seed === undefined) {
      engine = MersenneTwister19937.autoSeed();
    } else if (Number.isInteger(seed)) {
      engine = MersenneTwister19937.seed(seed);
    } else {
      throw new RangeError(`Expected seed must be undefined or integer not ${seed}`);
    }

    let Xr = new Array(trainingSet.rows);
    let yr = new Array(trainingSet.rows);
    let oob = new Array(trainingSet.rows).fill(0);
    let oobN = trainingSet.rows;

    for (let i = 0; i < trainingSet.rows; ++i) {
      let index = distribution(engine);
      Xr[i] = trainingSet.getRow(index);
      yr[i] = trainingValue[index];

      if (oob[index]++ === 0) {
        oobN--;
      }
    }

    let Xoob = new Array(oobN);
    let ioob = new Array(oobN); // run backwards to have ioob filled in increasing order

    for (let i = trainingSet.rows - 1; i >= 0 && oobN > 0; --i) {
      if (oob[i] === 0) {
        Xoob[--oobN] = trainingSet.getRow(i);
        ioob[oobN] = i;
      }
    }

    return {
      X: new Matrix$2(Xr),
      y: yr,
      Xoob: new Matrix$2(Xoob),
      ioob,
      seed: engine.next()
    };
  }
  /**
   * selects n features from the training set with or without replacement, returns the new training set and the indexes used.
   * @ignore
   * @param {Matrix} trainingSet
   * @param {number} n - features.
   * @param {boolean} replacement
   * @param {number} seed - seed for the random selection, must be a 32-bit integer.
   * @return {object}
   */

  function featureBagging(trainingSet, n, replacement, seed) {
    if (trainingSet.columns < n) {
      throw new RangeError('N should be less or equal to the number of columns of X');
    }

    let distribution = integer(0, trainingSet.columns - 1);
    let engine;

    if (seed === undefined) {
      engine = MersenneTwister19937.autoSeed();
    } else if (Number.isInteger(seed)) {
      engine = MersenneTwister19937.seed(seed);
    } else {
      throw new RangeError(`Expected seed must be undefined or integer not ${seed}`);
    }

    let toRet = new Matrix$2(trainingSet.rows, n);
    let usedIndex;
    let index;

    if (replacement) {
      usedIndex = new Array(n);

      for (let i = 0; i < n; ++i) {
        index = distribution(engine);
        usedIndex[i] = index;
        toRet.setColumn(i, trainingSet.getColumn(index));
      }
    } else {
      usedIndex = new Set();
      index = distribution(engine);

      for (let i = 0; i < n; ++i) {
        while (usedIndex.has(index)) {
          index = distribution(engine);
        }

        toRet.setColumn(i, trainingSet.getColumn(index));
        usedIndex.add(index);
      }

      usedIndex = Array.from(usedIndex);
    }

    return {
      X: toRet,
      usedIndex: usedIndex,
      seed: engine.next()
    };
  }
  /**
   * collects and combines the individual results from the tree predictions on Out-Of-Bag data
   * @ignore
   * @param {{index: {Array},predicted: {Array}}[]} oob: array of individual tree predictions
   * @param {array} y: true labels
   * @param {(predictions:{Array})=>{number}} aggregate: aggregation function
   * @return {Array}
   */

  const collectOOB = (oob, y, aggregate) => {
    const res = Array(y.length);

    for (let i = 0; i < y.length; i++) {
      const all = [];

      for (let j = 0; j < oob.length; j++) {
        const o = oob[j];

        if (o.index[0] === i) {
          all.push(o.predicted[0]);
          o.index = o.index.slice(1);
          o.predicted = o.predicted.slice(1);
        }
      }

      res[i] = {
        true: y[i],
        all: all,
        predicted: aggregate(all)
      };
    }

    return res;
  };

  /**
   * @class RandomForestBase
   */

  class RandomForestBase {
    /**
     * Create a new base random forest for a classifier or regression model.
     * @constructor
     * @param {object} options
     * @param {number|String} [options.maxFeatures] - the number of features used on each estimator.
     *        * if is an integer it selects maxFeatures elements over the sample features.
     *        * if is a float between (0, 1), it takes the percentage of features.
     * @param {boolean} [options.replacement] - use replacement over the sample features.
     * @param {number} [options.seed] - seed for feature and samples selection, must be a 32-bit integer.
     * @param {number} [options.nEstimators] - number of estimator to use.
     * @param {object} [options.treeOptions] - options for the tree classifier, see [ml-cart]{@link https://mljs.github.io/decision-tree-cart/}
     * @param {boolean} [options.isClassifier] - boolean to check if is a classifier or regression model (used by subclasses).
     * @param {boolean} [options.useSampleBagging] - use bagging over training samples.
     * @param {boolean} [options.noOOB] - don't calculate Out-Of-Bag predictions.
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        this.replacement = model.replacement;
        this.maxFeatures = model.maxFeatures;
        this.nEstimators = model.nEstimators;
        this.treeOptions = model.treeOptions;
        this.isClassifier = model.isClassifier;
        this.seed = model.seed;
        this.n = model.n;
        this.indexes = model.indexes;
        this.useSampleBagging = model.useSampleBagging;
        this.noOOB = true;
        let Estimator = this.isClassifier ? DecisionTreeClassifier : DecisionTreeRegression;
        this.estimators = model.estimators.map(est => Estimator.load(est));
      } else {
        this.replacement = options.replacement;
        this.maxFeatures = options.maxFeatures;
        this.nEstimators = options.nEstimators;
        this.treeOptions = options.treeOptions;
        this.isClassifier = options.isClassifier;
        this.seed = options.seed;
        this.useSampleBagging = options.useSampleBagging;
        this.noOOB = options.noOOB;
      }
    }
    /**
     * Train the decision tree with the given training set and labels.
     * @param {Matrix|Array} trainingSet
     * @param {Array} trainingValues
     */


    train(trainingSet, trainingValues) {
      let currentSeed = this.seed;
      trainingSet = Matrix$2.checkMatrix(trainingSet);
      this.maxFeatures = this.maxFeatures || trainingSet.columns;

      if (checkFloat(this.maxFeatures)) {
        this.n = Math.floor(trainingSet.columns * this.maxFeatures);
      } else if (Number.isInteger(this.maxFeatures)) {
        if (this.maxFeatures > trainingSet.columns) {
          throw new RangeError(`The maxFeatures parameter should be less than ${trainingSet.columns}`);
        } else {
          this.n = this.maxFeatures;
        }
      } else {
        throw new RangeError(`Cannot process the maxFeatures parameter ${this.maxFeatures}`);
      }

      let Estimator;

      if (this.isClassifier) {
        Estimator = DecisionTreeClassifier;
      } else {
        Estimator = DecisionTreeRegression;
      }

      this.estimators = new Array(this.nEstimators);
      this.indexes = new Array(this.nEstimators);
      let oobResults = new Array(this.nEstimators);

      for (let i = 0; i < this.nEstimators; ++i) {
        let res = this.useSampleBagging ? examplesBaggingWithReplacement(trainingSet, trainingValues, currentSeed) : {
          X: trainingSet,
          y: trainingValues,
          seed: currentSeed,
          Xoob: undefined,
          yoob: [],
          ioob: []
        };
        let X = res.X;
        let y = res.y;
        currentSeed = res.seed;
        let {
          Xoob,
          ioob
        } = res;
        res = featureBagging(X, this.n, this.replacement, currentSeed);
        X = res.X;
        currentSeed = res.seed;
        this.indexes[i] = res.usedIndex;
        this.estimators[i] = new Estimator(this.treeOptions);
        this.estimators[i].train(X, y);

        if (!this.noOOB && this.useSampleBagging) {
          let xoob = new MatrixColumnSelectionView(Xoob, this.indexes[i]);
          oobResults[i] = {
            index: ioob,
            predicted: this.estimators[i].predict(xoob)
          };
        }
      }

      if (!this.noOOB && this.useSampleBagging && oobResults.length > 0) {
        this.oobResults = collectOOB(oobResults, trainingValues, this.selection.bind(this));
      }
    }
    /**
     * Method that returns the way the algorithm generates the predictions, for example, in classification
     * you can return the mode of all predictions retrieved by the trees, or in case of regression you can
     * use the mean or the median.
     * @abstract
     * @param {Array} values - predictions of the estimators.
     * @return {number} prediction.
     */
    // eslint-disable-next-line no-unused-vars


    selection(values) {
      throw new Error("Abstract method 'selection' not implemented!");
    }
    /**
     * Predicts the output given the matrix to predict.
     * @param {Matrix|Array} toPredict
     * @return {Array} predictions
     */


    predict(toPredict) {
      const predictionValues = this.predictionValues(toPredict);
      let predictions = new Array(predictionValues.rows);

      for (let i = 0; i < predictionValues.rows; ++i) {
        predictions[i] = this.selection(predictionValues.getRow(i));
      }

      return predictions;
    }

    predictionValues(toPredict) {
      let predictionValues = new Array(this.nEstimators);
      toPredict = Matrix$2.checkMatrix(toPredict);

      for (let i = 0; i < this.nEstimators; ++i) {
        let X = new MatrixColumnSelectionView(toPredict, this.indexes[i]); // get features for estimator

        predictionValues[i] = this.estimators[i].predict(X);
      }

      return predictionValues = new MatrixTransposeView$1(new WrapperMatrix2D(predictionValues));
    }
    /**
     * Returns the Out-Of-Bag predictions.
     * @return {Array} predictions
     */


    predictOOB() {
      if (!this.oobResults || this.oobResults.length === 0) {
        throw new Error('No Out-Of-Bag results found. Did you forgot to train first?');
      }

      return this.oobResults.map(v => v.predicted);
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      return {
        indexes: this.indexes,
        n: this.n,
        replacement: this.replacement,
        maxFeatures: this.maxFeatures,
        nEstimators: this.nEstimators,
        treeOptions: this.treeOptions,
        isClassifier: this.isClassifier,
        seed: this.seed,
        estimators: this.estimators.map(est => est.toJSON()),
        useSampleBagging: this.useSampleBagging
      };
    }

  }

  const defaultOptions$f = {
    maxFeatures: 1.0,
    replacement: true,
    nEstimators: 50,
    seed: 42,
    useSampleBagging: true,
    noOOB: false
  };
  /**
   * @class RandomForestClassifier
   * @augments RandomForestBase
   */

  class RandomForestClassifier extends RandomForestBase {
    /**
     * Create a new base random forest for a classifier or regression model.
     * @constructor
     * @param {object} options
     * @param {number} [options.maxFeatures=1.0] - the number of features used on each estimator.
     *        * if is an integer it selects maxFeatures elements over the sample features.
     *        * if is a float between (0, 1), it takes the percentage of features.
     * @param {boolean} [options.replacement=true] - use replacement over the sample features.
     * @param {number} [options.seed=42] - seed for feature and samples selection, must be a 32-bit integer.
     * @param {number} [options.nEstimators=50] - number of estimator to use.
     * @param {object} [options.treeOptions={}] - options for the tree classifier, see [ml-cart]{@link https://mljs.github.io/decision-tree-cart/}
     * @param {boolean} [options.useSampleBagging=true] - use bagging over training samples.
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        super(true, model.baseModel);
      } else {
        options = Object.assign({}, defaultOptions$f, options);
        options.isClassifier = true;
        super(options);
      }
    }
    /**
     * retrieve the prediction given the selection method.
     * @param {Array} values - predictions of the estimators.
     * @return {number} prediction
     */


    selection(values) {
      return mode$1(values);
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      let baseModel = super.toJSON();
      return {
        baseModel: baseModel,
        name: 'RFClassifier'
      };
    }
    /**
     * Returns the confusion matrix
     * Make sure to run train first.
     * @return {object} - Current model.
     */


    getConfusionMatrix() {
      if (!this.oobResults) {
        throw new Error('No Out-Of-Bag results available.');
      }

      const labels = new Set();
      const matrix = this.oobResults.reduce((p, v) => {
        labels.add(v.true);
        labels.add(v.predicted);
        const x = p[v.predicted] || {};
        x[v.true] = (x[v.true] || 0) + 1;
        p[v.predicted] = x;
        return p;
      }, {});
      const sortedLabels = [...labels].sort();
      return sortedLabels.map(v => sortedLabels.map(w => (matrix[v] || {})[w] || 0));
    }
    /**
     * Load a Decision tree classifier with the given model.
     * @param {object} model
     * @return {RandomForestClassifier}
     */


    static load(model) {
      if (model.name !== 'RFClassifier') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      return new RandomForestClassifier(true, model);
    }
    /**
     * Predicts the probability of a label given the matrix to predict.
     * @param {Matrix|Array} toPredict
     * @param {number} label
     * @return {Array} predictions
     */


    predictProbability(toPredict, label) {
      const predictionValues = this.predictionValues(toPredict);
      let predictions = new Array(predictionValues.rows);

      for (let i = 0; i < predictionValues.rows; ++i) {
        const pvs = predictionValues.getRow(i);
        const l = pvs.length;
        const roundFactor = Math.pow(10, 6);
        predictions[i] = Math.round(pvs.reduce((p, v) => {
          if (v === label) {
            p += roundFactor / l;
          }

          return p;
        })) / roundFactor;
      }

      return predictions;
    }

  }
  /**
   * Return the most repeated element on the array.
   * @param {Array} arr
   * @return {number} mode
   */

  function mode$1(arr) {
    return arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop();
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getAugmentedNamespace(n) {
  	if (n.__esModule) return n;
  	var a = Object.defineProperty({}, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var medianQuickselect_min = createCommonjsModule(function (module) {
    (function () {
      function a(d) {
        for (var e = 0, f = d.length - 1, g = void 0, h = void 0, i = void 0, j = c(e, f); !0;) {
          if (f <= e) return d[j];
          if (f == e + 1) return d[e] > d[f] && b(d, e, f), d[j];

          for (g = c(e, f), d[g] > d[f] && b(d, g, f), d[e] > d[f] && b(d, e, f), d[g] > d[e] && b(d, g, e), b(d, g, e + 1), h = e + 1, i = f; !0;) {
            do h++; while (d[e] > d[h]);

            do i--; while (d[i] > d[e]);

            if (i < h) break;
            b(d, h, i);
          }

          b(d, e, i), i <= j && (e = h), i >= j && (f = i - 1);
        }
      }

      var b = function b(d, e, f) {
        var _ref;

        return _ref = [d[f], d[e]], d[e] = _ref[0], d[f] = _ref[1], _ref;
      },
          c = function c(d, e) {
        return ~~((d + e) / 2);
      };

      module.exports ? module.exports = a : window.median = a;
    })();
  });

  function median(input) {
    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    return medianQuickselect_min(input.slice());
  }

  const selectionMethods = {
    mean: mean$1,
    median: median
  };
  const defaultOptions$e = {
    maxFeatures: 1.0,
    replacement: false,
    nEstimators: 50,
    treeOptions: {},
    selectionMethod: 'mean',
    seed: 42,
    useSampleBagging: true,
    noOOB: false
  };
  /**
   * @class RandomForestRegression
   * @augments RandomForestBase
   */

  class RandomForestRegression extends RandomForestBase {
    /**
     * Create a new base random forest for a classifier or regression model.
     * @constructor
     * @param {object} options
     * @param {number} [options.maxFeatures=1.0] - the number of features used on each estimator.
     *        * if is an integer it selects maxFeatures elements over the sample features.
     *        * if is a float between (0, 1), it takes the percentage of features.
     * @param {boolean} [options.replacement=true] - use replacement over the sample features.
     * @param {number} [options.seed=42] - seed for feature and samples selection, must be a 32-bit integer.
     * @param {number} [options.nEstimators=50] - number of estimator to use.
     * @param {object} [options.treeOptions={}] - options for the tree classifier, see [ml-cart]{@link https://mljs.github.io/decision-tree-cart/}
     * @param {string} [options.selectionMethod="mean"] - the way to calculate the prediction from estimators, "mean" and "median" are supported.
     * @param {boolean} [options.useSampleBagging=true] - use bagging over training samples.
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        super(true, model.baseModel);
        this.selectionMethod = model.selectionMethod;
      } else {
        options = Object.assign({}, defaultOptions$e, options);

        if (!(options.selectionMethod === 'mean' || options.selectionMethod === 'median')) {
          throw new RangeError(`Unsupported selection method ${options.selectionMethod}`);
        }

        options.isClassifier = false;
        super(options);
        this.selectionMethod = options.selectionMethod;
      }
    }
    /**
     * retrieve the prediction given the selection method.
     * @param {Array} values - predictions of the estimators.
     * @return {number} prediction
     */


    selection(values) {
      return selectionMethods[this.selectionMethod](values);
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      let baseModel = super.toJSON();
      return {
        baseModel: baseModel,
        selectionMethod: this.selectionMethod,
        name: 'RFRegression'
      };
    }
    /**
     * Load a Decision tree classifier with the given model.
     * @param {object} model
     * @return {RandomForestRegression}
     */


    static load(model) {
      if (model.name !== 'RFRegression') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      return new RandomForestRegression(true, model);
    }

  }

  /**
   * Creates new PCA (Principal Component Analysis) from the dataset
   * @param {Matrix} dataset - dataset or covariance matrix.
   * @param {Object} [options]
   * @param {boolean} [options.isCovarianceMatrix=false] - true if the dataset is a covariance matrix.
   * @param {string} [options.method='SVD'] - select which method to use: SVD (default), covarianceMatrirx or NIPALS.
   * @param {number} [options.nCompNIPALS=2] - number of components to be computed with NIPALS.
   * @param {boolean} [options.center=true] - should the data be centered (subtract the mean).
   * @param {boolean} [options.scale=false] - should the data be scaled (divide by the standard deviation).
   * @param {boolean} [options.ignoreZeroVariance=false] - ignore columns with zero variance if `scale` is `true`.
   * */

  class PCA {
    constructor(dataset, options = {}) {
      if (dataset === true) {
        const model = options;
        this.center = model.center;
        this.scale = model.scale;
        this.means = model.means;
        this.stdevs = model.stdevs;
        this.U = Matrix$2.checkMatrix(model.U);
        this.S = model.S;
        this.R = model.R;
        this.excludedFeatures = model.excludedFeatures || [];
        return;
      }

      dataset = new Matrix$2(dataset);
      const {
        isCovarianceMatrix = false,
        method = 'SVD',
        nCompNIPALS = 2,
        center = true,
        scale = false,
        ignoreZeroVariance = false
      } = options;
      this.center = center;
      this.scale = scale;
      this.means = null;
      this.stdevs = null;
      this.excludedFeatures = [];

      if (isCovarianceMatrix) {
        // User provided a covariance matrix instead of dataset.
        this._computeFromCovarianceMatrix(dataset);

        return;
      }

      this._adjust(dataset, ignoreZeroVariance);

      switch (method) {
        case 'covarianceMatrix':
          {
            // User provided a dataset but wants us to compute and use the covariance matrix.
            const covarianceMatrix = new MatrixTransposeView$1(dataset).mmul(dataset).div(dataset.rows - 1);

            this._computeFromCovarianceMatrix(covarianceMatrix);

            break;
          }

        case 'NIPALS':
          {
            this._computeWithNIPALS(dataset, nCompNIPALS);

            break;
          }

        case 'SVD':
          {
            const svd = new SingularValueDecomposition(dataset, {
              computeLeftSingularVectors: false,
              computeRightSingularVectors: true,
              autoTranspose: true
            });
            this.U = svd.rightSingularVectors;
            const singularValues = svd.diagonal;
            const eigenvalues = [];

            for (const singularValue of singularValues) {
              eigenvalues.push(singularValue * singularValue / (dataset.rows - 1));
            }

            this.S = eigenvalues;
            break;
          }

        default:
          {
            throw new Error(`unknown method: ${method}`);
          }
      }
    }
    /**
     * Load a PCA model from JSON
     * @param {Object} model
     * @return {PCA}
     */


    static load(model) {
      if (typeof model.name !== 'string') {
        throw new TypeError('model must have a name property');
      }

      if (model.name !== 'PCA') {
        throw new RangeError(`invalid model: ${model.name}`);
      }

      return new PCA(true, model);
    }
    /**
     * Project the dataset into the PCA space
     * @param {Matrix} dataset
     * @param {Object} options
     * @return {Matrix} dataset projected in the PCA space
     */


    predict(dataset, options = {}) {
      const {
        nComponents = this.U.columns
      } = options;
      dataset = new Matrix$2(dataset);

      if (this.center) {
        dataset.subRowVector(this.means);

        if (this.scale) {
          for (let i of this.excludedFeatures) {
            dataset.removeColumn(i);
          }

          dataset.divRowVector(this.stdevs);
        }
      }

      let predictions = dataset.mmul(this.U);
      return predictions.subMatrix(0, predictions.rows - 1, 0, nComponents - 1);
    }
    /**
     * Calculates the inverse PCA transform
     * @param {Matrix} dataset
     * @return {Matrix} dataset projected in the PCA space
     */


    invert(dataset) {
      dataset = Matrix$2.checkMatrix(dataset);
      let inverse = dataset.mmul(this.U.transpose());

      if (this.center) {
        if (this.scale) {
          inverse.mulRowVector(this.stdevs);
        }

        inverse.addRowVector(this.means);
      }

      return inverse;
    }
    /**
     * Returns the proportion of variance for each component
     * @return {[number]}
     */


    getExplainedVariance() {
      let sum = 0;

      for (const s of this.S) {
        sum += s;
      }

      return this.S.map(value => value / sum);
    }
    /**
     * Returns the cumulative proportion of variance
     * @return {[number]}
     */


    getCumulativeVariance() {
      let explained = this.getExplainedVariance();

      for (let i = 1; i < explained.length; i++) {
        explained[i] += explained[i - 1];
      }

      return explained;
    }
    /**
     * Returns the Eigenvectors of the covariance matrix
     * @returns {Matrix}
     */


    getEigenvectors() {
      return this.U;
    }
    /**
     * Returns the Eigenvalues (on the diagonal)
     * @returns {[number]}
     */


    getEigenvalues() {
      return this.S;
    }
    /**
     * Returns the standard deviations of the principal components
     * @returns {[number]}
     */


    getStandardDeviations() {
      return this.S.map(x => Math.sqrt(x));
    }
    /**
     * Returns the loadings matrix
     * @return {Matrix}
     */


    getLoadings() {
      return this.U.transpose();
    }
    /**
     * Export the current model to a JSON object
     * @return {Object} model
     */


    toJSON() {
      return {
        name: 'PCA',
        center: this.center,
        scale: this.scale,
        means: this.means,
        stdevs: this.stdevs,
        U: this.U,
        S: this.S,
        excludedFeatures: this.excludedFeatures
      };
    }

    _adjust(dataset, ignoreZeroVariance) {
      if (this.center) {
        const mean = dataset.mean('column');
        const stdevs = this.scale ? dataset.standardDeviation('column', {
          mean
        }) : null;
        this.means = mean;
        dataset.subRowVector(mean);

        if (this.scale) {
          for (let i = 0; i < stdevs.length; i++) {
            if (stdevs[i] === 0) {
              if (ignoreZeroVariance) {
                dataset.removeColumn(i);
                stdevs.splice(i, 1);
                this.excludedFeatures.push(i);
                i--;
              } else {
                throw new RangeError(`Cannot scale the dataset (standard deviation is zero at index ${i}`);
              }
            }
          }

          this.stdevs = stdevs;
          dataset.divRowVector(stdevs);
        }
      }
    }

    _computeFromCovarianceMatrix(dataset) {
      const evd = new EigenvalueDecomposition(dataset, {
        assumeSymmetric: true
      });
      this.U = evd.eigenvectorMatrix;
      this.U.flipRows();
      this.S = evd.realEigenvalues;
      this.S.reverse();
    }

    _computeWithNIPALS(dataset, nCompNIPALS) {
      this.U = new Matrix$2(nCompNIPALS, dataset.columns);
      this.S = [];
      let x = dataset;

      for (let i = 0; i < nCompNIPALS; i++) {
        let dc = new nipals(x);
        this.U.setRow(i, dc.w.transpose());
        this.S.push(Math.pow(dc.s.get(0, 0), 2));
        x = dc.xResidual;
      }

      this.U = this.U.transpose(); // to be compatible with API
    }

  }

  function squaredEuclidean$4(p, q) {
    let d = 0;

    for (let i = 0; i < p.length; i++) {
      d += (p[i] - q[i]) * (p[i] - q[i]);
    }

    return d;
  }
  function euclidean$2(p, q) {
    return Math.sqrt(squaredEuclidean$4(p, q));
  }

  var euclidean$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    squaredEuclidean: squaredEuclidean$4,
    euclidean: euclidean$2
  });

  /**
   * Computes a distance/similarity matrix given an array of data and a distance/similarity function.
   * @param {Array} data An array of data
   * @param {function} distanceFn  A function that accepts two arguments and computes a distance/similarity between them
   * @return {Array<Array>} The distance/similarity matrix. The matrix is square and has a size equal to the length of
   * the data array
   */
  function distanceMatrix(data, distanceFn) {
    const result = getMatrix(data.length); // Compute upper distance matrix

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j <= i; j++) {
        result[i][j] = distanceFn(data[i], data[j]);
        result[j][i] = result[i][j];
      }
    }

    return result;
  }

  function getMatrix(size) {
    const matrix = [];

    for (let i = 0; i < size; i++) {
      const row = [];
      matrix.push(row);

      for (let j = 0; j < size; j++) {
        row.push(0);
      }
    }

    return matrix;
  }

  var heap$1 = createCommonjsModule(function (module, exports) {
    // Generated by CoffeeScript 1.8.0
    (function () {
      var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;

      floor = Math.floor, min = Math.min;
      /*
      Default comparison function to be used
       */

      defaultCmp = function (x, y) {
        if (x < y) {
          return -1;
        }

        if (x > y) {
          return 1;
        }

        return 0;
      };
      /*
      Insert item x in list a, and keep it sorted assuming a is sorted.
      
      If x is already in a, insert it to the right of the rightmost x.
      
      Optional args lo (default 0) and hi (default a.length) bound the slice
      of a to be searched.
       */


      insort = function (a, x, lo, hi, cmp) {
        var mid;

        if (lo == null) {
          lo = 0;
        }

        if (cmp == null) {
          cmp = defaultCmp;
        }

        if (lo < 0) {
          throw new Error('lo must be non-negative');
        }

        if (hi == null) {
          hi = a.length;
        }

        while (lo < hi) {
          mid = floor((lo + hi) / 2);

          if (cmp(x, a[mid]) < 0) {
            hi = mid;
          } else {
            lo = mid + 1;
          }
        }

        return [].splice.apply(a, [lo, lo - lo].concat(x)), x;
      };
      /*
      Push item onto heap, maintaining the heap invariant.
       */


      heappush = function (array, item, cmp) {
        if (cmp == null) {
          cmp = defaultCmp;
        }

        array.push(item);
        return _siftdown(array, 0, array.length - 1, cmp);
      };
      /*
      Pop the smallest item off the heap, maintaining the heap invariant.
       */


      heappop = function (array, cmp) {
        var lastelt, returnitem;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        lastelt = array.pop();

        if (array.length) {
          returnitem = array[0];
          array[0] = lastelt;

          _siftup(array, 0, cmp);
        } else {
          returnitem = lastelt;
        }

        return returnitem;
      };
      /*
      Pop and return the current smallest value, and add the new item.
      
      This is more efficient than heappop() followed by heappush(), and can be
      more appropriate when using a fixed size heap. Note that the value
      returned may be larger than item! That constrains reasonable use of
      this routine unless written as part of a conditional replacement:
          if item > array[0]
            item = heapreplace(array, item)
       */


      heapreplace = function (array, item, cmp) {
        var returnitem;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        returnitem = array[0];
        array[0] = item;

        _siftup(array, 0, cmp);

        return returnitem;
      };
      /*
      Fast version of a heappush followed by a heappop.
       */


      heappushpop = function (array, item, cmp) {
        var _ref;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        if (array.length && cmp(array[0], item) < 0) {
          _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];

          _siftup(array, 0, cmp);
        }

        return item;
      };
      /*
      Transform list into a heap, in-place, in O(array.length) time.
       */


      heapify = function (array, cmp) {
        var i, _i, _len, _ref1, _results, _results1;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        _ref1 = function () {
          _results1 = [];

          for (var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--) {
            _results1.push(_j);
          }

          return _results1;
        }.apply(this).reverse();

        _results = [];

        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];

          _results.push(_siftup(array, i, cmp));
        }

        return _results;
      };
      /*
      Update the position of the given item in the heap.
      This function should be called every time the item is being modified.
       */


      updateItem = function (array, item, cmp) {
        var pos;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        pos = array.indexOf(item);

        if (pos === -1) {
          return;
        }

        _siftdown(array, 0, pos, cmp);

        return _siftup(array, pos, cmp);
      };
      /*
      Find the n largest elements in a dataset.
       */


      nlargest = function (array, n, cmp) {
        var elem, result, _i, _len, _ref;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        result = array.slice(0, n);

        if (!result.length) {
          return result;
        }

        heapify(result, cmp);
        _ref = array.slice(n);

        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          elem = _ref[_i];
          heappushpop(result, elem, cmp);
        }

        return result.sort(cmp).reverse();
      };
      /*
      Find the n smallest elements in a dataset.
       */


      nsmallest = function (array, n, cmp) {
        var elem, los, result, _i, _j, _len, _ref, _ref1, _results;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        if (n * 10 <= array.length) {
          result = array.slice(0, n).sort(cmp);

          if (!result.length) {
            return result;
          }

          los = result[result.length - 1];
          _ref = array.slice(n);

          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            elem = _ref[_i];

            if (cmp(elem, los) < 0) {
              insort(result, elem, 0, null, cmp);
              result.pop();
              los = result[result.length - 1];
            }
          }

          return result;
        }

        heapify(array, cmp);
        _results = [];

        for (_j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? ++_j : --_j) {
          _results.push(heappop(array, cmp));
        }

        return _results;
      };

      _siftdown = function (array, startpos, pos, cmp) {
        var newitem, parent, parentpos;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        newitem = array[pos];

        while (pos > startpos) {
          parentpos = pos - 1 >> 1;
          parent = array[parentpos];

          if (cmp(newitem, parent) < 0) {
            array[pos] = parent;
            pos = parentpos;
            continue;
          }

          break;
        }

        return array[pos] = newitem;
      };

      _siftup = function (array, pos, cmp) {
        var childpos, endpos, newitem, rightpos, startpos;

        if (cmp == null) {
          cmp = defaultCmp;
        }

        endpos = array.length;
        startpos = pos;
        newitem = array[pos];
        childpos = 2 * pos + 1;

        while (childpos < endpos) {
          rightpos = childpos + 1;

          if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
            childpos = rightpos;
          }

          array[pos] = array[childpos];
          pos = childpos;
          childpos = 2 * pos + 1;
        }

        array[pos] = newitem;
        return _siftdown(array, startpos, pos, cmp);
      };

      Heap = function () {
        Heap.push = heappush;
        Heap.pop = heappop;
        Heap.replace = heapreplace;
        Heap.pushpop = heappushpop;
        Heap.heapify = heapify;
        Heap.updateItem = updateItem;
        Heap.nlargest = nlargest;
        Heap.nsmallest = nsmallest;

        function Heap(cmp) {
          this.cmp = cmp != null ? cmp : defaultCmp;
          this.nodes = [];
        }

        Heap.prototype.push = function (x) {
          return heappush(this.nodes, x, this.cmp);
        };

        Heap.prototype.pop = function () {
          return heappop(this.nodes, this.cmp);
        };

        Heap.prototype.peek = function () {
          return this.nodes[0];
        };

        Heap.prototype.contains = function (x) {
          return this.nodes.indexOf(x) !== -1;
        };

        Heap.prototype.replace = function (x) {
          return heapreplace(this.nodes, x, this.cmp);
        };

        Heap.prototype.pushpop = function (x) {
          return heappushpop(this.nodes, x, this.cmp);
        };

        Heap.prototype.heapify = function () {
          return heapify(this.nodes, this.cmp);
        };

        Heap.prototype.updateItem = function (x) {
          return updateItem(this.nodes, x, this.cmp);
        };

        Heap.prototype.clear = function () {
          return this.nodes = [];
        };

        Heap.prototype.empty = function () {
          return this.nodes.length === 0;
        };

        Heap.prototype.size = function () {
          return this.nodes.length;
        };

        Heap.prototype.clone = function () {
          var heap;
          heap = new Heap();
          heap.nodes = this.nodes.slice(0);
          return heap;
        };

        Heap.prototype.toArray = function () {
          return this.nodes.slice(0);
        };

        Heap.prototype.insert = Heap.prototype.push;
        Heap.prototype.top = Heap.prototype.peek;
        Heap.prototype.front = Heap.prototype.peek;
        Heap.prototype.has = Heap.prototype.contains;
        Heap.prototype.copy = Heap.prototype.clone;
        return Heap;
      }();

      (function (root, factory) {
        {
          return module.exports = factory();
        }
      })(this, function () {
        return Heap;
      });
    }).call(commonjsGlobal);
  });

  var heap = heap$1;

  class Cluster {
    constructor() {
      this.children = [];
      this.height = 0;
      this.size = 1;
      this.index = -1;
      this.isLeaf = false;
    }
    /**
     * Creates an array of clusters where the maximum height is smaller than the threshold
     * @param {number} threshold
     * @return {Array<Cluster>}
     */


    cut(threshold) {
      if (typeof threshold !== 'number') {
        throw new TypeError('threshold must be a number');
      }

      if (threshold < 0) {
        throw new RangeError('threshold must be a positive number');
      }

      let list = [this];
      const ans = [];

      while (list.length > 0) {
        const aux = list.shift();

        if (threshold >= aux.height) {
          ans.push(aux);
        } else {
          list = list.concat(aux.children);
        }
      }

      return ans;
    }
    /**
     * Merge the leaves in the minimum way to have `groups` number of clusters.
     * @param {number} groups - Them number of children the first level of the tree should have.
     * @return {Cluster}
     */


    group(groups) {
      if (!Number.isInteger(groups) || groups < 1) {
        throw new RangeError('groups must be a positive integer');
      }

      const heap$1 = new heap((a, b) => {
        return b.height - a.height;
      });
      heap$1.push(this);

      while (heap$1.size() < groups) {
        var first = heap$1.pop();

        if (first.children.length === 0) {
          break;
        }

        first.children.forEach(child => heap$1.push(child));
      }

      var root = new Cluster();
      root.children = heap$1.toArray();
      root.height = this.height;
      return root;
    }
    /**
     * Traverses the tree depth-first and calls the provided callback with each individual node
     * @param {function} cb - The callback to be called on each node encounter
     */


    traverse(cb) {
      function visit(root, callback) {
        callback(root);

        if (root.children) {
          for (const child of root.children) {
            visit(child, callback);
          }
        }
      }

      visit(this, cb);
    }
    /**
     * Returns a list of indices for all the leaves of this cluster.
     * The list is ordered in such a way that a dendrogram could be drawn without crossing branches.
     * @returns {Array<number>}
     */


    indices() {
      const result = [];
      this.traverse(cluster => {
        if (cluster.isLeaf) {
          result.push(cluster.index);
        }
      });
      return result;
    }

  }

  function singleLink(dKI, dKJ) {
    return Math.min(dKI, dKJ);
  }

  function completeLink(dKI, dKJ) {
    return Math.max(dKI, dKJ);
  }

  function averageLink(dKI, dKJ, dIJ, ni, nj) {
    const ai = ni / (ni + nj);
    const aj = nj / (ni + nj);
    return ai * dKI + aj * dKJ;
  }

  function weightedAverageLink(dKI, dKJ) {
    return (dKI + dKJ) / 2;
  }

  function centroidLink(dKI, dKJ, dIJ, ni, nj) {
    const ai = ni / (ni + nj);
    const aj = nj / (ni + nj);
    const b = -(ni * nj) / (ni + nj) ** 2;
    return ai * dKI + aj * dKJ + b * dIJ;
  }

  function medianLink(dKI, dKJ, dIJ) {
    return dKI / 2 + dKJ / 2 - dIJ / 4;
  }

  function wardLink(dKI, dKJ, dIJ, ni, nj, nk) {
    const ai = (ni + nk) / (ni + nj + nk);
    const aj = (nj + nk) / (ni + nj + nk);
    const b = -nk / (ni + nj + nk);
    return ai * dKI + aj * dKJ + b * dIJ;
  }

  function wardLink2(dKI, dKJ, dIJ, ni, nj, nk) {
    const ai = (ni + nk) / (ni + nj + nk);
    const aj = (nj + nk) / (ni + nj + nk);
    const b = -nk / (ni + nj + nk);
    return Math.sqrt(ai * dKI * dKI + aj * dKJ * dKJ + b * dIJ * dIJ);
  }
  /**
   * Continuously merge nodes that have the least dissimilarity
   * @param {Array<Array<number>>} data - Array of points to be clustered
   * @param {object} [options]
   * @param {Function} [options.distanceFunction]
   * @param {string} [options.method] - Default: `'complete'`
   * @param {boolean} [options.isDistanceMatrix] - Is the input already a distance matrix?
   * @constructor
   */


  function agnes(data, options = {}) {
    const {
      distanceFunction = euclidean$2,
      method = 'complete',
      isDistanceMatrix = false
    } = options;
    let updateFunc;

    if (!isDistanceMatrix) {
      data = distanceMatrix(data, distanceFunction);
    }

    let distanceMatrix$1 = new Matrix$2(data);
    const numLeaves = distanceMatrix$1.rows; // allows to use a string or a given function

    if (typeof method === 'string') {
      switch (method.toLowerCase()) {
        case 'single':
          updateFunc = singleLink;
          break;

        case 'complete':
          updateFunc = completeLink;
          break;

        case 'average':
        case 'upgma':
          updateFunc = averageLink;
          break;

        case 'wpgma':
          updateFunc = weightedAverageLink;
          break;

        case 'centroid':
        case 'upgmc':
          updateFunc = centroidLink;
          break;

        case 'median':
        case 'wpgmc':
          updateFunc = medianLink;
          break;

        case 'ward':
          updateFunc = wardLink;
          break;

        case 'ward2':
          updateFunc = wardLink2;
          break;

        default:
          throw new RangeError(`unknown clustering method: ${method}`);
      }
    } else if (typeof method !== 'function') {
      throw new TypeError('method must be a string or function');
    }

    let clusters = [];

    for (let i = 0; i < numLeaves; i++) {
      const cluster = new Cluster();
      cluster.isLeaf = true;
      cluster.index = i;
      clusters.push(cluster);
    }

    for (let n = 0; n < numLeaves - 1; n++) {
      const [row, column, distance] = getSmallestDistance(distanceMatrix$1);
      const cluster1 = clusters[row];
      const cluster2 = clusters[column];
      const newCluster = new Cluster();
      newCluster.size = cluster1.size + cluster2.size;
      newCluster.children.push(cluster1, cluster2);
      newCluster.height = distance;
      const newClusters = [newCluster];
      const newDistanceMatrix = new Matrix$2(distanceMatrix$1.rows - 1, distanceMatrix$1.rows - 1);

      const previous = newIndex => getPreviousIndex(newIndex, Math.min(row, column), Math.max(row, column));

      for (let i = 1; i < newDistanceMatrix.rows; i++) {
        const prevI = previous(i);
        const prevICluster = clusters[prevI];
        newClusters.push(prevICluster);

        for (let j = 0; j < i; j++) {
          if (j === 0) {
            const dKI = distanceMatrix$1.get(row, prevI);
            const dKJ = distanceMatrix$1.get(prevI, column);
            const val = updateFunc(dKI, dKJ, distance, cluster1.size, cluster2.size, prevICluster.size);
            newDistanceMatrix.set(i, j, val);
            newDistanceMatrix.set(j, i, val);
          } else {
            // Just copy distance from previous matrix
            const val = distanceMatrix$1.get(prevI, previous(j));
            newDistanceMatrix.set(i, j, val);
            newDistanceMatrix.set(j, i, val);
          }
        }
      }

      clusters = newClusters;
      distanceMatrix$1 = newDistanceMatrix;
    }

    return clusters[0];
  }

  function getSmallestDistance(distance) {
    let smallest = Infinity;
    let smallestI = 0;
    let smallestJ = 0;

    for (let i = 1; i < distance.rows; i++) {
      for (let j = 0; j < i; j++) {
        if (distance.get(i, j) < smallest) {
          smallest = distance.get(i, j);
          smallestI = i;
          smallestJ = j;
        }
      }
    }

    return [smallestI, smallestJ, smallest];
  }

  function getPreviousIndex(newIndex, prev1, prev2) {
    newIndex -= 1;
    if (newIndex >= prev1) newIndex++;
    if (newIndex >= prev2) newIndex++;
    return newIndex;
  }

  // export * from './birch';
  // export * './cure';
  // export * from './chameleon';

  var index$5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    agnes: agnes
  });

  const defaultOptions$d = {
    distanceFunction: squaredEuclidean$4
  };
  function nearestVector(listVectors, vector, options = defaultOptions$d) {
    const distanceFunction = options.distanceFunction || defaultOptions$d.distanceFunction;
    const similarityFunction = options.similarityFunction || defaultOptions$d.similarityFunction;
    let vectorIndex = -1;

    if (typeof similarityFunction === 'function') {
      // maximum similarity
      let maxSim = Number.MIN_VALUE;

      for (let j = 0; j < listVectors.length; j++) {
        const sim = similarityFunction(vector, listVectors[j]);

        if (sim > maxSim) {
          maxSim = sim;
          vectorIndex = j;
        }
      }
    } else if (typeof distanceFunction === 'function') {
      // minimum distance
      let minDist = Number.MAX_VALUE;

      for (let i = 0; i < listVectors.length; i++) {
        const dist = distanceFunction(vector, listVectors[i]);

        if (dist < minDist) {
          minDist = dist;
          vectorIndex = i;
        }
      }
    } else {
      throw new Error("A similarity or distance function it's required");
    }

    return vectorIndex;
  }

  /**
   * Calculates the distance matrix for a given array of points
   * @ignore
   * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
   * @param {function} distance - Distance function to use between the points
   * @return {Array<Array<number>>} - matrix with the distance values
   */

  function calculateDistanceMatrix(data, distance) {
    var distanceMatrix = new Array(data.length);

    for (var i = 0; i < data.length; ++i) {
      for (var j = i; j < data.length; ++j) {
        if (!distanceMatrix[i]) {
          distanceMatrix[i] = new Array(data.length);
        }

        if (!distanceMatrix[j]) {
          distanceMatrix[j] = new Array(data.length);
        }

        const dist = distance(data[i], data[j]);
        distanceMatrix[i][j] = dist;
        distanceMatrix[j][i] = dist;
      }
    }

    return distanceMatrix;
  }
  /**
   * Updates the cluster identifier based in the new data
   * @ignore
   * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
   * @param {Array<Array<number>>} centers - the K centers in format [x,y,z,...]
   * @param {Array <number>} clusterID - the cluster identifier for each data dot
   * @param {function} distance - Distance function to use between the points
   * @return {Array} the cluster identifier for each data dot
   */

  function updateClusterID(data, centers, clusterID, distance) {
    for (var i = 0; i < data.length; i++) {
      clusterID[i] = nearestVector(centers, data[i], {
        distanceFunction: distance
      });
    }

    return clusterID;
  }
  /**
   * Update the center values based in the new configurations of the clusters
   * @ignore
   * @param {Array<Array<number>>} prevCenters - Centroids from the previous iteration
   * @param {Array <Array <number>>} data - the [x,y,z,...] points to cluster
   * @param {Array <number>} clusterID - the cluster identifier for each data dot
   * @param {number} K - Number of clusters
   * @return {Array} he K centers in format [x,y,z,...]
   */

  function updateCenters(prevCenters, data, clusterID, K) {
    const nDim = data[0].length; // copy previous centers

    var centers = new Array(K);
    var centersLen = new Array(K);

    for (var i = 0; i < K; i++) {
      centers[i] = new Array(nDim);
      centersLen[i] = 0;

      for (var j = 0; j < nDim; j++) {
        centers[i][j] = 0;
      }
    } // add the value for all dimensions of the point


    for (var l = 0; l < data.length; l++) {
      centersLen[clusterID[l]]++;

      for (var dim = 0; dim < nDim; dim++) {
        centers[clusterID[l]][dim] += data[l][dim];
      }
    } // divides by length


    for (var id = 0; id < K; id++) {
      for (var d = 0; d < nDim; d++) {
        if (centersLen[id]) {
          centers[id][d] /= centersLen[id];
        } else {
          centers[id][d] = prevCenters[id][d];
        }
      }
    }

    return centers;
  }
  /**
   * The centers have moved more than the tolerance value?
   * @ignore
   * @param {Array<Array<number>>} centers - the K centers in format [x,y,z,...]
   * @param {Array<Array<number>>} oldCenters - the K old centers in format [x,y,z,...]
   * @param {function} distanceFunction - Distance function to use between the points
   * @param {number} tolerance - Allowed distance for the centroids to move
   * @return {boolean}
   */

  function hasConverged(centers, oldCenters, distanceFunction, tolerance) {
    for (var i = 0; i < centers.length; i++) {
      if (distanceFunction(centers[i], oldCenters[i]) > tolerance) {
        return false;
      }
    }

    return true;
  }

  const LOOP = 8;
  const FLOAT_MUL = 1 / 16777216;
  const sh1 = 15;
  const sh2 = 18;
  const sh3 = 11;

  function multiply_uint32(n, m) {
    n >>>= 0;
    m >>>= 0;
    const nlo = n & 0xffff;
    const nhi = n - nlo;
    return (nhi * m >>> 0) + nlo * m >>> 0;
  }

  class XSadd {
    constructor(seed = Date.now()) {
      this.state = new Uint32Array(4);
      this.init(seed);
      this.random = this.getFloat.bind(this);
    }
    /**
     * Returns a 32-bit integer r (0 <= r < 2^32)
     */


    getUint32() {
      this.nextState();
      return this.state[3] + this.state[2] >>> 0;
    }
    /**
     * Returns a floating point number r (0.0 <= r < 1.0)
     */


    getFloat() {
      return (this.getUint32() >>> 8) * FLOAT_MUL;
    }

    init(seed) {
      if (!Number.isInteger(seed)) {
        throw new TypeError('seed must be an integer');
      }

      this.state[0] = seed;
      this.state[1] = 0;
      this.state[2] = 0;
      this.state[3] = 0;

      for (let i = 1; i < LOOP; i++) {
        this.state[i & 3] ^= i + multiply_uint32(1812433253, this.state[i - 1 & 3] ^ this.state[i - 1 & 3] >>> 30 >>> 0) >>> 0;
      }

      this.periodCertification();

      for (let i = 0; i < LOOP; i++) {
        this.nextState();
      }
    }

    periodCertification() {
      if (this.state[0] === 0 && this.state[1] === 0 && this.state[2] === 0 && this.state[3] === 0) {
        this.state[0] = 88; // X

        this.state[1] = 83; // S

        this.state[2] = 65; // A

        this.state[3] = 68; // D
      }
    }

    nextState() {
      let t = this.state[0];
      t ^= t << sh1;
      t ^= t >>> sh2;
      t ^= this.state[3] << sh3;
      this.state[0] = this.state[1];
      this.state[1] = this.state[2];
      this.state[2] = this.state[3];
      this.state[3] = t;
    }

  }

  const PROB_TOLERANCE = 0.00000001;

  function randomChoice(values, options = {}, random = Math.random) {
    const {
      size = 1,
      replace = false,
      probabilities
    } = options;
    let valuesArr;
    let cumSum;

    if (typeof values === 'number') {
      valuesArr = getArray(values);
    } else {
      valuesArr = values.slice();
    }

    if (probabilities) {
      if (!replace) {
        throw new Error('choice with probabilities and no replacement is not implemented');
      } // check input is sane


      if (probabilities.length !== valuesArr.length) {
        throw new Error('the length of probabilities option should be equal to the number of choices');
      }

      cumSum = [probabilities[0]];

      for (let i = 1; i < probabilities.length; i++) {
        cumSum[i] = cumSum[i - 1] + probabilities[i];
      }

      if (Math.abs(1 - cumSum[cumSum.length - 1]) > PROB_TOLERANCE) {
        throw new Error(`probabilities should sum to 1, but instead sums to ${cumSum[cumSum.length - 1]}`);
      }
    }

    if (replace === false && size > valuesArr.length) {
      throw new Error('size option is too large');
    }

    const result = [];

    for (let i = 0; i < size; i++) {
      const index = randomIndex(valuesArr.length, random, cumSum);
      result.push(valuesArr[index]);

      if (!replace) {
        valuesArr.splice(index, 1);
      }
    }

    return result;
  }

  function getArray(n) {
    const arr = [];

    for (let i = 0; i < n; i++) {
      arr.push(i);
    }

    return arr;
  }

  function randomIndex(n, random, cumSum) {
    const rand = random();

    if (!cumSum) {
      return Math.floor(rand * n);
    } else {
      let idx = 0;

      while (rand > cumSum[idx]) {
        idx++;
      }

      return idx;
    }
  }

  // tslint:disable-next-line
  /**
   * @classdesc Random class
   */

  class Random {
    /**
     * @param [seedOrRandom=Math.random] - Control the random number generator used by the Random class instance. Pass a random number generator function with a uniform distribution over the half-open interval [0, 1[. If seed will pass it to ml-xsadd to create a seeded random number generator. If undefined will use Math.random.
     */
    constructor(seedOrRandom = Math.random) {
      if (typeof seedOrRandom === 'number') {
        const xsadd = new XSadd(seedOrRandom);
        this.randomGenerator = xsadd.random;
      } else {
        this.randomGenerator = seedOrRandom;
      }
    }

    choice(values, options) {
      if (typeof values === 'number') {
        return randomChoice(values, options, this.randomGenerator);
      }

      return randomChoice(values, options, this.randomGenerator);
    }
    /**
     * Draw a random number from a uniform distribution on [0,1)
     * @return The random number
     */


    random() {
      return this.randomGenerator();
    }
    /**
     * Draw a random integer from a uniform distribution on [low, high). If only low is specified, the number is drawn on [0, low)
     * @param low - The lower bound of the uniform distribution interval.
     * @param high - The higher bound of the uniform distribution interval.
     */


    randInt(low, high) {
      if (high === undefined) {
        high = low;
        low = 0;
      }

      return low + Math.floor(this.randomGenerator() * (high - low));
    }
    /**
     * Draw several random number from a uniform distribution on [0, 1)
     * @param size - The number of number to draw
     * @return - The list of drawn numbers.
     */


    randomSample(size) {
      const result = [];

      for (let i = 0; i < size; i++) {
        result.push(this.random());
      }

      return result;
    }

  }

  /**
   * Choose K different random points from the original data
   * @ignore
   * @param {Array<Array<number>>} data - Points in the format to cluster [x,y,z,...]
   * @param {number} K - number of clusters
   * @param {number} seed - seed for random number generation
   * @return {Array<Array<number>>} - Initial random points
   */

  function random(data, K, seed) {
    const random = new Random(seed);
    return random.choice(data, {
      size: K
    });
  }
  /**
   * Chooses the most distant points to a first random pick
   * @ignore
   * @param {Array<Array<number>>} data - Points in the format to cluster [x,y,z,...]
   * @param {number} K - number of clusters
   * @param {Array<Array<number>>} distanceMatrix - matrix with the distance values
   * @param {number} seed - seed for random number generation
   * @return {Array<Array<number>>} - Initial random points
   */

  function mostDistant(data, K, distanceMatrix, seed) {
    const random = new Random(seed);
    var ans = new Array(K); // chooses a random point as initial cluster

    ans[0] = Math.floor(random.random() * data.length);

    if (K > 1) {
      // chooses the more distant point
      var maxDist = {
        dist: -1,
        index: -1
      };

      for (var l = 0; l < data.length; ++l) {
        if (distanceMatrix[ans[0]][l] > maxDist.dist) {
          maxDist.dist = distanceMatrix[ans[0]][l];
          maxDist.index = l;
        }
      }

      ans[1] = maxDist.index;

      if (K > 2) {
        // chooses the set of points that maximises the min distance
        for (var k = 2; k < K; ++k) {
          var center = {
            dist: -1,
            index: -1
          };

          for (var m = 0; m < data.length; ++m) {
            // minimum distance to centers
            var minDistCent = {
              dist: Number.MAX_VALUE,
              index: -1
            };

            for (var n = 0; n < k; ++n) {
              if (distanceMatrix[n][m] < minDistCent.dist && ans.indexOf(m) === -1) {
                minDistCent = {
                  dist: distanceMatrix[n][m],
                  index: m
                };
              }
            }

            if (minDistCent.dist !== Number.MAX_VALUE && minDistCent.dist > center.dist) {
              center = Object.assign({}, minDistCent);
            }
          }

          ans[k] = center.index;
        }
      }
    }

    return ans.map(index => data[index]);
  } // Implementation inspired from scikit

  function kmeanspp(X, K, options = {}) {
    X = new Matrix$2(X);
    const nSamples = X.rows;
    const random = new Random(options.seed); // Set the number of trials

    const centers = [];
    const localTrials = options.localTrials || 2 + Math.floor(Math.log(K)); // Pick the first center at random from the dataset

    const firstCenterIdx = random.randInt(nSamples);
    centers.push(X.getRow(firstCenterIdx)); // Init closest distances

    let closestDistSquared = new Matrix$2(1, X.rows);

    for (let i = 0; i < X.rows; i++) {
      closestDistSquared.set(0, i, squaredEuclidean$4(X.getRow(i), centers[0]));
    }

    let cumSumClosestDistSquared = [cumSum(closestDistSquared.getRow(0))];
    const factor = 1 / cumSumClosestDistSquared[0][nSamples - 1];
    let probabilities = Matrix$2.mul(closestDistSquared, factor); // Iterate over the remaining centers

    for (let i = 1; i < K; i++) {
      const candidateIdx = random.choice(nSamples, {
        replace: true,
        size: localTrials,
        probabilities: probabilities[0]
      });
      const candidates = X.selection(candidateIdx, range(X.columns));
      const distanceToCandidates = euclideanDistances(candidates, X);
      let bestCandidate;
      let bestPot;
      let bestDistSquared;

      for (let j = 0; j < localTrials; j++) {
        const newDistSquared = Matrix$2.min(closestDistSquared, [distanceToCandidates.getRow(j)]);
        const newPot = newDistSquared.sum();

        if (bestCandidate === undefined || newPot < bestPot) {
          bestCandidate = candidateIdx[j];
          bestPot = newPot;
          bestDistSquared = newDistSquared;
        }
      }

      centers[i] = X.getRow(bestCandidate);
      closestDistSquared = bestDistSquared;
      cumSumClosestDistSquared = [cumSum(closestDistSquared.getRow(0))];
      probabilities = Matrix$2.mul(closestDistSquared, 1 / cumSumClosestDistSquared[0][nSamples - 1]);
    }

    return centers;
  }

  function euclideanDistances(A, B) {
    const result = new Matrix$2(A.rows, B.rows);

    for (let i = 0; i < A.rows; i++) {
      for (let j = 0; j < B.rows; j++) {
        result.set(i, j, squaredEuclidean$4(A.getRow(i), B.getRow(j)));
      }
    }

    return result;
  }

  function range(l) {
    let r = [];

    for (let i = 0; i < l; i++) {
      r.push(i);
    }

    return r;
  }

  function cumSum(arr) {
    let cumSum = [arr[0]];

    for (let i = 1; i < arr.length; i++) {
      cumSum[i] = cumSum[i - 1] + arr[i];
    }

    return cumSum;
  }

  const distanceSymbol = Symbol('distance');
  class KMeansResult {
    /**
     * Result of the kmeans algorithm
     * @param {Array<number>} clusters - the cluster identifier for each data dot
     * @param {Array<Array<object>>} centroids - the K centers in format [x,y,z,...], the error and size of the cluster
     * @param {boolean} converged - Converge criteria satisfied
     * @param {number} iterations - Current number of iterations
     * @param {function} distance - (*Private*) Distance function to use between the points
     * @constructor
     */
    constructor(clusters, centroids, converged, iterations, distance) {
      this.clusters = clusters;
      this.centroids = centroids;
      this.converged = converged;
      this.iterations = iterations;
      this[distanceSymbol] = distance;
    }
    /**
     * Allows to compute for a new array of points their cluster id
     * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
     * @return {Array<number>} - cluster id for each point
     */


    nearest(data) {
      const clusterID = new Array(data.length);
      const centroids = this.centroids.map(function (centroid) {
        return centroid.centroid;
      });
      return updateClusterID(data, centroids, clusterID, this[distanceSymbol]);
    }
    /**
     * Returns a KMeansResult with the error and size of the cluster
     * @ignore
     * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
     * @return {KMeansResult}
     */


    computeInformation(data) {
      var enrichedCentroids = this.centroids.map(function (centroid) {
        return {
          centroid: centroid,
          error: 0,
          size: 0
        };
      });

      for (var i = 0; i < data.length; i++) {
        enrichedCentroids[this.clusters[i]].error += this[distanceSymbol](data[i], this.centroids[this.clusters[i]]);
        enrichedCentroids[this.clusters[i]].size++;
      }

      for (var j = 0; j < this.centroids.length; j++) {
        if (enrichedCentroids[j].size) {
          enrichedCentroids[j].error /= enrichedCentroids[j].size;
        } else {
          enrichedCentroids[j].error = null;
        }
      }

      return new KMeansResult(this.clusters, enrichedCentroids, this.converged, this.iterations, this[distanceSymbol]);
    }

  }

  const defaultOptions$c = {
    maxIterations: 100,
    tolerance: 1e-6,
    withIterations: false,
    initialization: 'kmeans++',
    distanceFunction: squaredEuclidean$4
  };
  /**
   * Each step operation for kmeans
   * @ignore
   * @param {Array<Array<number>>} centers - K centers in format [x,y,z,...]
   * @param {Array<Array<number>>} data - Points [x,y,z,...] to cluster
   * @param {Array<number>} clusterID - Cluster identifier for each data dot
   * @param {number} K - Number of clusters
   * @param {object} [options] - Option object
   * @param {number} iterations - Current number of iterations
   * @return {KMeansResult}
   */

  function step$1(centers, data, clusterID, K, options, iterations) {
    clusterID = updateClusterID(data, centers, clusterID, options.distanceFunction);
    var newCenters = updateCenters(centers, data, clusterID, K);
    var converged = hasConverged(newCenters, centers, options.distanceFunction, options.tolerance);
    return new KMeansResult(clusterID, newCenters, converged, iterations, options.distanceFunction);
  }
  /**
   * Generator version for the algorithm
   * @ignore
   * @param {Array<Array<number>>} centers - K centers in format [x,y,z,...]
   * @param {Array<Array<number>>} data - Points [x,y,z,...] to cluster
   * @param {Array<number>} clusterID - Cluster identifier for each data dot
   * @param {number} K - Number of clusters
   * @param {object} [options] - Option object
   */


  function* kmeansGenerator(centers, data, clusterID, K, options) {
    var converged = false;
    var stepNumber = 0;
    var stepResult;

    while (!converged && stepNumber < options.maxIterations) {
      stepResult = step$1(centers, data, clusterID, K, options, ++stepNumber);
      yield stepResult.computeInformation(data);
      converged = stepResult.converged;
      centers = stepResult.centroids;
    }
  }
  /**
   * K-means algorithm
   * @param {Array<Array<number>>} data - Points in the format to cluster [x,y,z,...]
   * @param {number} K - Number of clusters
   * @param {object} [options] - Option object
   * @param {number} [options.maxIterations = 100] - Maximum of iterations allowed
   * @param {number} [options.tolerance = 1e-6] - Error tolerance
   * @param {boolean} [options.withIterations = false] - Store clusters and centroids for each iteration
   * @param {function} [options.distanceFunction = squaredDistance] - Distance function to use between the points
   * @param {number} [options.seed] - Seed for random initialization.
   * @param {string|Array<Array<number>>} [options.initialization = 'kmeans++'] - K centers in format [x,y,z,...] or a method for initialize the data:
   *  * You can either specify your custom start centroids, or select one of the following initialization method:
   *  * `'kmeans++'` will use the kmeans++ method as described by http://ilpubs.stanford.edu:8090/778/1/2006-13.pdf
   *  * `'random'` will choose K random different values.
   *  * `'mostDistant'` will choose the more distant points to a first random pick
   * @return {KMeansResult} - Cluster identifier for each data dot and centroids with the following fields:
   *  * `'clusters'`: Array of indexes for the clusters.
   *  * `'centroids'`: Array with the resulting centroids.
   *  * `'iterations'`: Number of iterations that took to converge
   */


  function kmeans(data, K, options) {
    options = Object.assign({}, defaultOptions$c, options);

    if (K <= 0 || K > data.length || !Number.isInteger(K)) {
      throw new Error('K should be a positive integer smaller than the number of points');
    }

    var centers;

    if (Array.isArray(options.initialization)) {
      if (options.initialization.length !== K) {
        throw new Error('The initial centers should have the same length as K');
      } else {
        centers = options.initialization;
      }
    } else {
      switch (options.initialization) {
        case 'kmeans++':
          centers = kmeanspp(data, K, options);
          break;

        case 'random':
          centers = random(data, K, options.seed);
          break;

        case 'mostDistant':
          centers = mostDistant(data, K, calculateDistanceMatrix(data, options.distanceFunction), options.seed);
          break;

        default:
          throw new Error(`Unknown initialization method: "${options.initialization}"`);
      }
    } // infinite loop until convergence


    if (options.maxIterations === 0) {
      options.maxIterations = Number.MAX_VALUE;
    }

    var clusterID = new Array(data.length);

    if (options.withIterations) {
      return kmeansGenerator(centers, data, clusterID, K, options);
    } else {
      var converged = false;
      var stepNumber = 0;
      var stepResult;

      while (!converged && stepNumber < options.maxIterations) {
        stepResult = step$1(centers, data, clusterID, K, options, ++stepNumber);
        converged = stepResult.converged;
        centers = stepResult.centroids;
      }

      return stepResult.computeInformation(data);
    }
  }

  /**
   * @private
   * Function that retuns an array of matrices of the cases that belong to each class.
   * @param {Matrix} X - dataset
   * @param {Array} y - predictions
   * @return {Array}
   */

  function separateClasses(X, y) {
    var features = X.columns;
    var classes = 0;
    var totalPerClasses = new Array(10000); // max upperbound of classes

    for (var i = 0; i < y.length; i++) {
      if (totalPerClasses[y[i]] === undefined) {
        totalPerClasses[y[i]] = 0;
        classes++;
      }

      totalPerClasses[y[i]]++;
    }

    var separatedClasses = new Array(classes);
    var currentIndex = new Array(classes);

    for (i = 0; i < classes; ++i) {
      separatedClasses[i] = new Matrix$2(totalPerClasses[i], features);
      currentIndex[i] = 0;
    }

    for (i = 0; i < X.rows; ++i) {
      separatedClasses[y[i]].setRow(currentIndex[y[i]], X.getRow(i));
      currentIndex[y[i]]++;
    }

    return separatedClasses;
  }

  class GaussianNB {
    /**
     * Constructor for the Gaussian Naive Bayes classifier, the parameters here is just for loading purposes.
     * @constructor
     * @param {boolean} reload
     * @param {object} model
     */
    constructor(reload, model) {
      if (reload) {
        this.means = model.means;
        this.calculateProbabilities = model.calculateProbabilities;
      }
    }
    /**
     * Function that trains the classifier with a matrix that represents the training set and an array that
     * represents the label of each row in the training set. the labels must be numbers between 0 to n-1 where
     * n represents the number of classes.
     *
     * WARNING: in the case that one class, all the cases in one or more features have the same value, the
     * Naive Bayes classifier will not work well.
     * @param {Matrix|Array} trainingSet
     * @param {Matrix|Array} trainingLabels
     */


    train(trainingSet, trainingLabels) {
      var C1 = Math.sqrt(2 * Math.PI); // constant to precalculate the squared root

      trainingSet = Matrix$2.checkMatrix(trainingSet);

      if (trainingSet.rows !== trainingLabels.length) {
        throw new RangeError('the size of the training set and the training labels must be the same.');
      }

      var separatedClasses = separateClasses(trainingSet, trainingLabels);
      var calculateProbabilities = new Array(separatedClasses.length);
      this.means = new Array(separatedClasses.length);

      for (var i = 0; i < separatedClasses.length; ++i) {
        var means = separatedClasses[i].mean('column');
        var std = separatedClasses[i].standardDeviation('column', {
          mean: means
        });
        var logPriorProbability = Math.log(separatedClasses[i].rows / trainingSet.rows);
        calculateProbabilities[i] = new Array(means.length + 1);
        calculateProbabilities[i][0] = logPriorProbability;

        for (var j = 1; j < means.length + 1; ++j) {
          var currentStd = std[j - 1];
          calculateProbabilities[i][j] = [1 / (C1 * currentStd), -2 * currentStd * currentStd];
        }

        this.means[i] = means;
      }

      this.calculateProbabilities = calculateProbabilities;
    }
    /**
     * function that predicts each row of the dataset (must be a matrix).
     *
     * @param {Matrix|Array} dataset
     * @return {Array}
     */


    predict(dataset) {
      dataset = Matrix$2.checkMatrix(dataset);

      if (dataset.rows === this.calculateProbabilities[0].length) {
        throw new RangeError('the dataset must have the same features as the training set');
      }

      var predictions = new Array(dataset.rows);

      for (var i = 0; i < predictions.length; ++i) {
        predictions[i] = getCurrentClass(dataset.getRow(i), this.means, this.calculateProbabilities);
      }

      return predictions;
    }
    /**
     * Function that export the NaiveBayes model.
     * @return {object}
     */


    toJSON() {
      return {
        modelName: 'NaiveBayes',
        means: this.means,
        calculateProbabilities: this.calculateProbabilities
      };
    }
    /**
     * Function that create a GaussianNB classifier with the given model.
     * @param {object} model
     * @return {GaussianNB}
     */


    static load(model) {
      if (model.modelName !== 'NaiveBayes') {
        throw new RangeError('The current model is not a Multinomial Naive Bayes, current model:', model.name);
      }

      return new GaussianNB(true, model);
    }

  }
  /**
   * @private
   * Function the retrieves a prediction with one case.
   *
   * @param {Array} currentCase
   * @param {Array} mean - Precalculated means of each class trained
   * @param {Array} classes - Precalculated value of each class (Prior probability and probability function of each feature)
   * @return {number}
   */

  function getCurrentClass(currentCase, mean, classes) {
    var maxProbability = 0;
    var predictedClass = -1; // going through all precalculated values for the classes

    for (var i = 0; i < classes.length; ++i) {
      var currentProbability = classes[i][0]; // initialize with the prior probability

      for (var j = 1; j < classes[0][1].length + 1; ++j) {
        currentProbability += calculateLogProbability(currentCase[j - 1], mean[i][j - 1], classes[i][j][0], classes[i][j][1]);
      }

      currentProbability = Math.exp(currentProbability);

      if (currentProbability > maxProbability) {
        maxProbability = currentProbability;
        predictedClass = i;
      }
    }

    return predictedClass;
  }
  /**
   * @private
   * function that retrieves the probability of the feature given the class.
   * @param {number} value - value of the feature.
   * @param {number} mean - mean of the feature for the given class.
   * @param {number} C1 - precalculated value of (1 / (sqrt(2*pi) * std)).
   * @param {number} C2 - precalculated value of (2 * std^2) for the denominator of the exponential.
   * @return {number}
   */


  function calculateLogProbability(value, mean, C1, C2) {
    value = value - mean;
    return Math.log(C1 * Math.exp(value * value / C2));
  }

  class MultinomialNB {
    /**
     * Constructor for Multinomial Naive Bayes, the model parameter is for load purposes.
     * @constructor
     * @param {object} model - for load purposes.
     */
    constructor(model) {
      if (model) {
        this.conditionalProbability = Matrix$2.checkMatrix(model.conditionalProbability);
        this.priorProbability = Matrix$2.checkMatrix(model.priorProbability);
      }
    }
    /**
     * Train the classifier with the current training set and labels, the labels must be numbers between 0 and n.
     * @param {Matrix|Array} trainingSet
     * @param {Array} trainingLabels
     */


    train(trainingSet, trainingLabels) {
      trainingSet = Matrix$2.checkMatrix(trainingSet);

      if (trainingSet.rows !== trainingLabels.length) {
        throw new RangeError('the size of the training set and the training labels must be the same.');
      }

      var separateClass = separateClasses(trainingSet, trainingLabels);
      this.priorProbability = new Matrix$2(separateClass.length, 1);

      for (var i = 0; i < separateClass.length; ++i) {
        this.priorProbability.set(i, 0, Math.log(separateClass[i].rows / trainingSet.rows));
      }

      var features = trainingSet.columns;
      this.conditionalProbability = new Matrix$2(separateClass.length, features);

      for (i = 0; i < separateClass.length; ++i) {
        var classValues = Matrix$2.checkMatrix(separateClass[i]);
        var total = classValues.sum();
        var divisor = total + features;
        this.conditionalProbability.setRow(i, Matrix$2.rowVector(classValues.sum('column')).add(1).div(divisor).apply(matrixLog));
      }
    }
    /**
     * Retrieves the predictions for the dataset with the current model.
     * @param {Matrix|Array} dataset
     * @return {Array} - predictions from the dataset.
     */


    predict(dataset) {
      dataset = Matrix$2.checkMatrix(dataset);
      var predictions = new Array(dataset.rows);

      for (var i = 0; i < dataset.rows; ++i) {
        var currentElement = dataset.getRowVector(i);
        const v = Matrix$2.columnVector(this.conditionalProbability.clone().mulRowVector(currentElement).sum('row'));
        predictions[i] = v.add(this.priorProbability).maxIndex()[0];
      }

      return predictions;
    }
    /**
     * Function that saves the current model.
     * @return {object} - model in JSON format.
     */


    toJSON() {
      return {
        name: 'MultinomialNB',
        priorProbability: this.priorProbability,
        conditionalProbability: this.conditionalProbability
      };
    }
    /**
     * Creates a new MultinomialNB from the given model
     * @param {object} model
     * @return {MultinomialNB}
     */


    static load(model) {
      if (model.name !== 'MultinomialNB') {
        throw new RangeError(`${model.name} is not a Multinomial Naive Bayes`);
      }

      return new MultinomialNB(model);
    }

  }

  function matrixLog(i, j) {
    this.set(i, j, Math.log(this.get(i, j)));
  }

  var index$4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GaussianNB: GaussianNB,
    MultinomialNB: MultinomialNB
  });

  /*
   * Original code from:
   *
   * k-d Tree JavaScript - V 1.01
   *
   * https://github.com/ubilabs/kd-tree-javascript
   *
   * @author Mircea Pricop <pricop@ubilabs.net>, 2012
   * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
   * @author Ubilabs http://ubilabs.net, 2012
   * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
   */
  function Node(obj, dimension, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = dimension;
  }

  class KDTree {
    constructor(points, metric) {
      // If points is not an array, assume we're loading a pre-built tree
      if (!Array.isArray(points)) {
        this.dimensions = points.dimensions;
        this.root = points;
        restoreParent(this.root);
      } else {
        this.dimensions = new Array(points[0].length);

        for (var i = 0; i < this.dimensions.length; i++) {
          this.dimensions[i] = i;
        }

        this.root = buildTree(points, 0, null, this.dimensions);
      }

      this.metric = metric;
    } // Convert to a JSON serializable structure; this just requires removing
    // the `parent` property


    toJSON() {
      const result = toJSONImpl(this.root);
      result.dimensions = this.dimensions;
      return result;
    }

    nearest(point, maxNodes, maxDistance) {
      const metric = this.metric;
      const dimensions = this.dimensions;
      var i;
      const bestNodes = new BinaryHeap(function (e) {
        return -e[1];
      });

      function nearestSearch(node) {
        const dimension = dimensions[node.dimension];
        const ownDistance = metric(point, node.obj);
        const linearPoint = {};
        var bestChild, linearDistance, otherChild, i;

        function saveNode(node, distance) {
          bestNodes.push([node, distance]);

          if (bestNodes.size() > maxNodes) {
            bestNodes.pop();
          }
        }

        for (i = 0; i < dimensions.length; i += 1) {
          if (i === node.dimension) {
            linearPoint[dimensions[i]] = point[dimensions[i]];
          } else {
            linearPoint[dimensions[i]] = node.obj[dimensions[i]];
          }
        }

        linearDistance = metric(linearPoint, node.obj);

        if (node.right === null && node.left === null) {
          if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
            saveNode(node, ownDistance);
          }

          return;
        }

        if (node.right === null) {
          bestChild = node.left;
        } else if (node.left === null) {
          bestChild = node.right;
        } else {
          if (point[dimension] < node.obj[dimension]) {
            bestChild = node.left;
          } else {
            bestChild = node.right;
          }
        }

        nearestSearch(bestChild);

        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance);
        }

        if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
          if (bestChild === node.left) {
            otherChild = node.right;
          } else {
            otherChild = node.left;
          }

          if (otherChild !== null) {
            nearestSearch(otherChild);
          }
        }
      }

      if (maxDistance) {
        for (i = 0; i < maxNodes; i += 1) {
          bestNodes.push([null, maxDistance]);
        }
      }

      if (this.root) {
        nearestSearch(this.root);
      }

      const result = [];

      for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
        if (bestNodes.content[i][0]) {
          result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
        }
      }

      return result;
    }

  }

  function toJSONImpl(src) {
    const dest = new Node(src.obj, src.dimension, null);
    if (src.left) dest.left = toJSONImpl(src.left);
    if (src.right) dest.right = toJSONImpl(src.right);
    return dest;
  }

  function buildTree(points, depth, parent, dimensions) {
    const dim = depth % dimensions.length;

    if (points.length === 0) {
      return null;
    }

    if (points.length === 1) {
      return new Node(points[0], dim, parent);
    }

    points.sort((a, b) => a[dimensions[dim]] - b[dimensions[dim]]);
    const median = Math.floor(points.length / 2);
    const node = new Node(points[median], dim, parent);
    node.left = buildTree(points.slice(0, median), depth + 1, node, dimensions);
    node.right = buildTree(points.slice(median + 1), depth + 1, node, dimensions);
    return node;
  }

  function restoreParent(root) {
    if (root.left) {
      root.left.parent = root;
      restoreParent(root.left);
    }

    if (root.right) {
      root.right.parent = root;
      restoreParent(root.right);
    }
  } // Binary heap implementation from:
  // http://eloquentjavascript.net/appendix2.html


  class BinaryHeap {
    constructor(scoreFunction) {
      this.content = [];
      this.scoreFunction = scoreFunction;
    }

    push(element) {
      // Add the new element to the end of the array.
      this.content.push(element); // Allow it to bubble up.

      this.bubbleUp(this.content.length - 1);
    }

    pop() {
      // Store the first element so we can return it later.
      var result = this.content[0]; // Get the element at the end of the array.

      var end = this.content.pop(); // If there are any elements left, put the end element at the
      // start, and let it sink down.

      if (this.content.length > 0) {
        this.content[0] = end;
        this.sinkDown(0);
      }

      return result;
    }

    peek() {
      return this.content[0];
    }

    size() {
      return this.content.length;
    }

    bubbleUp(n) {
      // Fetch the element that has to be moved.
      var element = this.content[n]; // When at 0, an element can not go up any further.

      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        const parentN = Math.floor((n + 1) / 2) - 1;
        const parent = this.content[parentN]; // Swap the elements if the parent is greater.

        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent; // Update 'n' to continue at the new position.

          n = parentN;
        } else {
          // Found a parent that is less, no need to move it further.
          break;
        }
      }
    }

    sinkDown(n) {
      // Look up the target element and its score.
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) * 2;
        var child1N = child2N - 1; // This is used to store the new position of the element,
        // if any.

        var swap = null; // If the first child exists (is inside the array)...

        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          var child1Score = this.scoreFunction(child1); // If the score is less than our element's, we need to swap.

          if (child1Score < elemScore) {
            swap = child1N;
          }
        } // Do the same checks for the other child.


        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);

          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        } // If the element needs to be moved, swap it, and continue.


        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        } else {
          // Otherwise, we are done.
          break;
        }
      }
    }

  }

  class KNN {
    /**
     * @param {Array} dataset
     * @param {Array} labels
     * @param {object} options
     * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
     * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
     */
    constructor(dataset, labels, options = {}) {
      if (dataset === true) {
        const model = labels;
        this.kdTree = new KDTree(model.kdTree, options);
        this.k = model.k;
        this.classes = new Set(model.classes);
        this.isEuclidean = model.isEuclidean;
        return;
      }

      const classes = new Set(labels);
      const {
        distance = euclidean$2,
        k = classes.size + 1
      } = options;
      const points = new Array(dataset.length);

      for (var i = 0; i < points.length; ++i) {
        points[i] = dataset[i].slice();
      }

      for (i = 0; i < labels.length; ++i) {
        points[i].push(labels[i]);
      }

      this.kdTree = new KDTree(points, distance);
      this.k = k;
      this.classes = classes;
      this.isEuclidean = distance === euclidean$2;
    }
    /**
     * Create a new KNN instance with the given model.
     * @param {object} model
     * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
     * @return {KNN}
     */


    static load(model, distance = euclidean$2) {
      if (model.name !== 'KNN') {
        throw new Error(`invalid model: ${model.name}`);
      }

      if (!model.isEuclidean && distance === euclidean$2) {
        throw new Error('a custom distance function was used to create the model. Please provide it again');
      }

      if (model.isEuclidean && distance !== euclidean$2) {
        throw new Error('the model was created with the default distance function. Do not load it with another one');
      }

      return new KNN(true, model, distance);
    }
    /**
     * Return a JSON containing the kd-tree model.
     * @return {object} JSON KNN model.
     */


    toJSON() {
      return {
        name: 'KNN',
        kdTree: this.kdTree,
        k: this.k,
        classes: Array.from(this.classes),
        isEuclidean: this.isEuclidean
      };
    }
    /**
     * Predicts the output given the matrix to predict.
     * @param {Array} dataset
     * @return {Array} predictions
     */


    predict(dataset) {
      if (Array.isArray(dataset)) {
        if (typeof dataset[0] === 'number') {
          return getSinglePrediction(this, dataset);
        } else if (Array.isArray(dataset[0]) && typeof dataset[0][0] === 'number') {
          const predictions = new Array(dataset.length);

          for (var i = 0; i < dataset.length; i++) {
            predictions[i] = getSinglePrediction(this, dataset[i]);
          }

          return predictions;
        }
      }

      throw new TypeError('dataset to predict must be an array or a matrix');
    }

  }

  function getSinglePrediction(knn, currentCase) {
    var nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
    var pointsPerClass = {};
    var predictedClass = -1;
    var maxPoints = -1;
    var lastElement = nearestPoints[0][0].length - 1;

    for (var element of knn.classes) {
      pointsPerClass[element] = 0;
    }

    for (var i = 0; i < nearestPoints.length; ++i) {
      var currentClass = nearestPoints[i][0][lastElement];
      var currentPoints = ++pointsPerClass[currentClass];

      if (currentPoints > maxPoints) {
        predictedClass = currentClass;
        maxPoints = currentPoints;
      }
    }

    return predictedClass;
  }

  /**
   * @private
   * Function that given vector, returns its norm
   * @param {Vector} X
   * @return {number} Norm of the vector
   */

  function norm$1(X) {
    return Math.sqrt(X.clone().apply(pow2array).sum());
  }
  /**
   * @private
   * Function that pow 2 each element of a Matrix or a Vector,
   * used in the apply method of the Matrix object
   * @param {number} i - index i.
   * @param {number} j - index j.
   * @return {Matrix} The Matrix object modified at the index i, j.
   * */

  function pow2array(i, j) {
    this.set(i, j, this.get(i, j) ** 2);
  }
  /**
   * @private
   * Function that initialize an array of matrices.
   * @param {Array} array
   * @param {boolean} isMatrix
   * @return {Array} array with the matrices initialized.
   */

  function initializeMatrices(array, isMatrix) {
    if (isMatrix) {
      for (let i = 0; i < array.length; ++i) {
        for (let j = 0; j < array[i].length; ++j) {
          let elem = array[i][j];
          array[i][j] = elem !== null ? new Matrix$2(array[i][j]) : undefined;
        }
      }
    } else {
      for (let i = 0; i < array.length; ++i) {
        array[i] = new Matrix$2(array[i]);
      }
    }

    return array;
  }

  /**
   * @class PLS
   */

  class PLS {
    /**
     * Constructor for Partial Least Squares (PLS)
     * @param {object} options
     * @param {number} [options.latentVectors] - Number of latent vector to get (if the algorithm doesn't find a good model below the tolerance)
     * @param {number} [options.tolerance=1e-5]
     * @param {boolean} [options.scale=true] - rescale dataset using mean.
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        this.meanX = model.meanX;
        this.stdDevX = model.stdDevX;
        this.meanY = model.meanY;
        this.stdDevY = model.stdDevY;
        this.PBQ = Matrix$2.checkMatrix(model.PBQ);
        this.R2X = model.R2X;
        this.scale = model.scale;
        this.scaleMethod = model.scaleMethod;
        this.tolerance = model.tolerance;
      } else {
        let {
          tolerance = 1e-5,
          scale = true
        } = options;
        this.tolerance = tolerance;
        this.scale = scale;
        this.latentVectors = options.latentVectors;
      }
    }
    /**
     * Fits the model with the given data and predictions, in this function is calculated the
     * following outputs:
     *
     * T - Score matrix of X
     * P - Loading matrix of X
     * U - Score matrix of Y
     * Q - Loading matrix of Y
     * B - Matrix of regression coefficient
     * W - Weight matrix of X
     *
     * @param {Matrix|Array} trainingSet
     * @param {Matrix|Array} trainingValues
     */


    train(trainingSet, trainingValues) {
      trainingSet = Matrix$2.checkMatrix(trainingSet);
      trainingValues = Matrix$2.checkMatrix(trainingValues);

      if (trainingSet.length !== trainingValues.length) {
        throw new RangeError('The number of X rows must be equal to the number of Y rows');
      }

      this.meanX = trainingSet.mean('column');
      this.stdDevX = trainingSet.standardDeviation('column', {
        mean: this.meanX,
        unbiased: true
      });
      this.meanY = trainingValues.mean('column');
      this.stdDevY = trainingValues.standardDeviation('column', {
        mean: this.meanY,
        unbiased: true
      });

      if (this.scale) {
        trainingSet = trainingSet.clone().subRowVector(this.meanX).divRowVector(this.stdDevX);
        trainingValues = trainingValues.clone().subRowVector(this.meanY).divRowVector(this.stdDevY);
      }

      if (this.latentVectors === undefined) {
        this.latentVectors = Math.min(trainingSet.rows - 1, trainingSet.columns);
      }

      let rx = trainingSet.rows;
      let cx = trainingSet.columns;
      let ry = trainingValues.rows;
      let cy = trainingValues.columns;
      let ssqXcal = trainingSet.clone().mul(trainingSet).sum(); // for the r²

      let sumOfSquaresY = trainingValues.clone().mul(trainingValues).sum();
      let tolerance = this.tolerance;
      let n = this.latentVectors;
      let T = Matrix$2.zeros(rx, n);
      let P = Matrix$2.zeros(cx, n);
      let U = Matrix$2.zeros(ry, n);
      let Q = Matrix$2.zeros(cy, n);
      let B = Matrix$2.zeros(n, n);
      let W = P.clone();
      let k = 0;
      let t;
      let w;
      let q;
      let p;

      while (norm$1(trainingValues) > tolerance && k < n) {
        let transposeX = trainingSet.transpose();
        let transposeY = trainingValues.transpose();
        let tIndex = maxSumColIndex(trainingSet.clone().mul(trainingSet));
        let uIndex = maxSumColIndex(trainingValues.clone().mul(trainingValues));
        let t1 = trainingSet.getColumnVector(tIndex);
        let u = trainingValues.getColumnVector(uIndex);
        t = Matrix$2.zeros(rx, 1);

        while (norm$1(t1.clone().sub(t)) > tolerance) {
          w = transposeX.mmul(u);
          w.div(norm$1(w));
          t = t1;
          t1 = trainingSet.mmul(w);
          q = transposeY.mmul(t1);
          q.div(norm$1(q));
          u = trainingValues.mmul(q);
        }

        t = t1;
        let num = transposeX.mmul(t);
        let den = t.transpose().mmul(t).get(0, 0);
        p = num.div(den);
        let pnorm = norm$1(p);
        p.div(pnorm);
        t.mul(pnorm);
        w.mul(pnorm);
        num = u.transpose().mmul(t);
        den = t.transpose().mmul(t).get(0, 0);
        let b = num.div(den).get(0, 0);
        trainingSet.sub(t.mmul(p.transpose()));
        trainingValues.sub(t.clone().mul(b).mmul(q.transpose()));
        T.setColumn(k, t);
        P.setColumn(k, p);
        U.setColumn(k, u);
        Q.setColumn(k, q);
        W.setColumn(k, w);
        B.set(k, k, b);
        k++;
      }

      k--;
      T = T.subMatrix(0, T.rows - 1, 0, k);
      P = P.subMatrix(0, P.rows - 1, 0, k);
      U = U.subMatrix(0, U.rows - 1, 0, k);
      Q = Q.subMatrix(0, Q.rows - 1, 0, k);
      W = W.subMatrix(0, W.rows - 1, 0, k);
      B = B.subMatrix(0, k, 0, k);
      this.ssqYcal = sumOfSquaresY;
      this.E = trainingSet;
      this.F = trainingValues;
      this.T = T;
      this.P = P;
      this.U = U;
      this.Q = Q;
      this.W = W;
      this.B = B;
      this.PBQ = P.mmul(B).mmul(Q.transpose());
      this.R2X = t.transpose().mmul(t).mmul(p.transpose().mmul(p)).div(ssqXcal).get(0, 0);
    }
    /**
     * Predicts the behavior of the given dataset.
     * @param {Matrix|Array} dataset - data to be predicted.
     * @return {Matrix} - predictions of each element of the dataset.
     */


    predict(dataset) {
      let X = Matrix$2.checkMatrix(dataset);

      if (this.scale) {
        X = X.subRowVector(this.meanX).divRowVector(this.stdDevX);
      }

      let Y = X.mmul(this.PBQ);
      Y = Y.mulRowVector(this.stdDevY).addRowVector(this.meanY);
      return Y;
    }
    /**
     * Returns the explained variance on training of the PLS model
     * @return {number}
     */


    getExplainedVariance() {
      return this.R2X;
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      return {
        name: 'PLS',
        R2X: this.R2X,
        meanX: this.meanX,
        stdDevX: this.stdDevX,
        meanY: this.meanY,
        stdDevY: this.stdDevY,
        PBQ: this.PBQ,
        tolerance: this.tolerance,
        scale: this.scale
      };
    }
    /**
     * Load a PLS model from a JSON Object
     * @param {object} model
     * @return {PLS} - PLS object from the given model
     */


    static load(model) {
      if (model.name !== 'PLS') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      return new PLS(true, model);
    }

  }
  /**
   * @private
   * Function that returns the index where the sum of each
   * column vector is maximum.
   * @param {Matrix} data
   * @return {number} index of the maximum
   */

  function maxSumColIndex(data) {
    return Matrix$2.rowVector(data.sum('column')).maxIndex()[0];
  }

  /**
   * @class KOPLS
   */

  class KOPLS {
    /**
     * Constructor for Kernel-based Orthogonal Projections to Latent Structures (K-OPLS)
     * @param {object} options
     * @param {number} [options.predictiveComponents] - Number of predictive components to use.
     * @param {number} [options.orthogonalComponents] - Number of Y-Orthogonal components.
     * @param {Kernel} [options.kernel] - Kernel object to apply, see [ml-kernel](https://github.com/mljs/kernel).
     * @param {object} model - for load purposes.
     */
    constructor(options, model) {
      if (options === true) {
        this.trainingSet = new Matrix$2(model.trainingSet);
        this.YLoadingMat = new Matrix$2(model.YLoadingMat);
        this.SigmaPow = new Matrix$2(model.SigmaPow);
        this.YScoreMat = new Matrix$2(model.YScoreMat);
        this.predScoreMat = initializeMatrices(model.predScoreMat, false);
        this.YOrthLoadingVec = initializeMatrices(model.YOrthLoadingVec, false);
        this.YOrthEigen = model.YOrthEigen;
        this.YOrthScoreMat = initializeMatrices(model.YOrthScoreMat, false);
        this.toNorm = initializeMatrices(model.toNorm, false);
        this.TURegressionCoeff = initializeMatrices(model.TURegressionCoeff, false);
        this.kernelX = initializeMatrices(model.kernelX, true);
        this.kernel = model.kernel;
        this.orthogonalComp = model.orthogonalComp;
        this.predictiveComp = model.predictiveComp;
      } else {
        if (options.predictiveComponents === undefined) {
          throw new RangeError('no predictive components found!');
        }

        if (options.orthogonalComponents === undefined) {
          throw new RangeError('no orthogonal components found!');
        }

        if (options.kernel === undefined) {
          throw new RangeError('no kernel found!');
        }

        this.orthogonalComp = options.orthogonalComponents;
        this.predictiveComp = options.predictiveComponents;
        this.kernel = options.kernel;
      }
    }
    /**
     * Train the K-OPLS model with the given training set and labels.
     * @param {Matrix|Array} trainingSet
     * @param {Matrix|Array} trainingValues
     */


    train(trainingSet, trainingValues) {
      trainingSet = Matrix$2.checkMatrix(trainingSet);
      trainingValues = Matrix$2.checkMatrix(trainingValues); // to save and compute kernel with the prediction dataset.

      this.trainingSet = trainingSet.clone();
      let kernelX = this.kernel.compute(trainingSet);
      let Identity = Matrix$2.eye(kernelX.rows, kernelX.rows, 1);
      let temp = kernelX;
      kernelX = new Array(this.orthogonalComp + 1);

      for (let i = 0; i < this.orthogonalComp + 1; i++) {
        kernelX[i] = new Array(this.orthogonalComp + 1);
      }

      kernelX[0][0] = temp;
      let result = new SingularValueDecomposition(trainingValues.transpose().mmul(kernelX[0][0]).mmul(trainingValues), {
        computeLeftSingularVectors: true,
        computeRightSingularVectors: false
      });
      let YLoadingMat = result.leftSingularVectors;
      let Sigma = result.diagonalMatrix;
      YLoadingMat = YLoadingMat.subMatrix(0, YLoadingMat.rows - 1, 0, this.predictiveComp - 1);
      Sigma = Sigma.subMatrix(0, this.predictiveComp - 1, 0, this.predictiveComp - 1);
      let YScoreMat = trainingValues.mmul(YLoadingMat);
      let predScoreMat = new Array(this.orthogonalComp + 1);
      let TURegressionCoeff = new Array(this.orthogonalComp + 1);
      let YOrthScoreMat = new Array(this.orthogonalComp);
      let YOrthLoadingVec = new Array(this.orthogonalComp);
      let YOrthEigen = new Array(this.orthogonalComp);
      let YOrthScoreNorm = new Array(this.orthogonalComp);
      let SigmaPow = Matrix$2.pow(Sigma, -0.5); // to avoid errors, check infinity

      SigmaPow.apply(function (i, j) {
        if (this.get(i, j) === Infinity) {
          this.set(i, j, 0);
        }
      });

      for (let i = 0; i < this.orthogonalComp; ++i) {
        predScoreMat[i] = kernelX[0][i].transpose().mmul(YScoreMat).mmul(SigmaPow);
        let TpiPrime = predScoreMat[i].transpose();
        TURegressionCoeff[i] = inverse(TpiPrime.mmul(predScoreMat[i])).mmul(TpiPrime).mmul(YScoreMat);
        result = new SingularValueDecomposition(TpiPrime.mmul(Matrix$2.sub(kernelX[i][i], predScoreMat[i].mmul(TpiPrime))).mmul(predScoreMat[i]), {
          computeLeftSingularVectors: true,
          computeRightSingularVectors: false
        });
        let CoTemp = result.leftSingularVectors;
        let SoTemp = result.diagonalMatrix;
        YOrthLoadingVec[i] = CoTemp.subMatrix(0, CoTemp.rows - 1, 0, 0);
        YOrthEigen[i] = SoTemp.get(0, 0);
        YOrthScoreMat[i] = Matrix$2.sub(kernelX[i][i], predScoreMat[i].mmul(TpiPrime)).mmul(predScoreMat[i]).mmul(YOrthLoadingVec[i]).mul(Math.pow(YOrthEigen[i], -0.5));
        let toiPrime = YOrthScoreMat[i].transpose();
        YOrthScoreNorm[i] = Matrix$2.sqrt(toiPrime.mmul(YOrthScoreMat[i]));
        YOrthScoreMat[i] = YOrthScoreMat[i].divRowVector(YOrthScoreNorm[i]);
        let ITo = Matrix$2.sub(Identity, YOrthScoreMat[i].mmul(YOrthScoreMat[i].transpose()));
        kernelX[0][i + 1] = kernelX[0][i].mmul(ITo);
        kernelX[i + 1][i + 1] = ITo.mmul(kernelX[i][i]).mmul(ITo);
      }

      let lastScoreMat = predScoreMat[this.orthogonalComp] = kernelX[0][this.orthogonalComp].transpose().mmul(YScoreMat).mmul(SigmaPow);
      let lastTpPrime = lastScoreMat.transpose();
      TURegressionCoeff[this.orthogonalComp] = inverse(lastTpPrime.mmul(lastScoreMat)).mmul(lastTpPrime).mmul(YScoreMat);
      this.YLoadingMat = YLoadingMat;
      this.SigmaPow = SigmaPow;
      this.YScoreMat = YScoreMat;
      this.predScoreMat = predScoreMat;
      this.YOrthLoadingVec = YOrthLoadingVec;
      this.YOrthEigen = YOrthEigen;
      this.YOrthScoreMat = YOrthScoreMat;
      this.toNorm = YOrthScoreNorm;
      this.TURegressionCoeff = TURegressionCoeff;
      this.kernelX = kernelX;
    }
    /**
     * Predicts the output given the matrix to predict.
     * @param {Matrix|Array} toPredict
     * @return {{y: Matrix, predScoreMat: Array<Matrix>, predYOrthVectors: Array<Matrix>}} predictions
     */


    predict(toPredict) {
      let KTestTrain = this.kernel.compute(toPredict, this.trainingSet);
      let temp = KTestTrain;
      KTestTrain = new Array(this.orthogonalComp + 1);

      for (let i = 0; i < this.orthogonalComp + 1; i++) {
        KTestTrain[i] = new Array(this.orthogonalComp + 1);
      }

      KTestTrain[0][0] = temp;
      let YOrthScoreVector = new Array(this.orthogonalComp);
      let predScoreMat = new Array(this.orthogonalComp);
      let i;

      for (i = 0; i < this.orthogonalComp; ++i) {
        predScoreMat[i] = KTestTrain[i][0].mmul(this.YScoreMat).mmul(this.SigmaPow);
        YOrthScoreVector[i] = Matrix$2.sub(KTestTrain[i][i], predScoreMat[i].mmul(this.predScoreMat[i].transpose())).mmul(this.predScoreMat[i]).mmul(this.YOrthLoadingVec[i]).mul(Math.pow(this.YOrthEigen[i], -0.5));
        YOrthScoreVector[i] = YOrthScoreVector[i].divRowVector(this.toNorm[i]);
        let scoreMatPrime = this.YOrthScoreMat[i].transpose();
        KTestTrain[i + 1][0] = Matrix$2.sub(KTestTrain[i][0], YOrthScoreVector[i].mmul(scoreMatPrime).mmul(this.kernelX[0][i].transpose()));
        let p1 = Matrix$2.sub(KTestTrain[i][0], KTestTrain[i][i].mmul(this.YOrthScoreMat[i]).mmul(scoreMatPrime));
        let p2 = YOrthScoreVector[i].mmul(scoreMatPrime).mmul(this.kernelX[i][i]);
        let p3 = p2.mmul(this.YOrthScoreMat[i]).mmul(scoreMatPrime);
        KTestTrain[i + 1][i + 1] = p1.sub(p2).add(p3);
      }

      predScoreMat[i] = KTestTrain[i][0].mmul(this.YScoreMat).mmul(this.SigmaPow);
      let prediction = predScoreMat[i].mmul(this.TURegressionCoeff[i]).mmul(this.YLoadingMat.transpose());
      return {
        prediction: prediction,
        predScoreMat: predScoreMat,
        predYOrthVectors: YOrthScoreVector
      };
    }
    /**
     * Export the current model to JSON.
     * @return {object} - Current model.
     */


    toJSON() {
      return {
        name: 'K-OPLS',
        YLoadingMat: this.YLoadingMat,
        SigmaPow: this.SigmaPow,
        YScoreMat: this.YScoreMat,
        predScoreMat: this.predScoreMat,
        YOrthLoadingVec: this.YOrthLoadingVec,
        YOrthEigen: this.YOrthEigen,
        YOrthScoreMat: this.YOrthScoreMat,
        toNorm: this.toNorm,
        TURegressionCoeff: this.TURegressionCoeff,
        kernelX: this.kernelX,
        trainingSet: this.trainingSet,
        orthogonalComp: this.orthogonalComp,
        predictiveComp: this.predictiveComp
      };
    }
    /**
     * Load a K-OPLS with the given model.
     * @param {object} model
     * @param {Kernel} kernel - kernel used on the model, see [ml-kernel](https://github.com/mljs/kernel).
     * @return {KOPLS}
     */


    static load(model, kernel) {
      if (model.name !== 'K-OPLS') {
        throw new RangeError(`Invalid model: ${model.name}`);
      }

      if (!kernel) {
        throw new RangeError('You must provide a kernel for the model!');
      }

      model.kernel = kernel;
      return new KOPLS(true, model);
    }

  }

  /**
   *  Constructs a confusion matrix
   * @class ConfusionMatrix
   * @example
   * const CM = new ConfusionMatrix([[13, 2], [10, 5]], ['cat', 'dog'])
   * @param {Array<Array<number>>} matrix - The confusion matrix, a 2D Array. Rows represent the actual label and columns
   *     the predicted label.
   * @param {Array<any>} labels - Labels of the confusion matrix, a 1D Array
   */
  class ConfusionMatrix {
    constructor(matrix, labels) {
      if (matrix.length !== matrix[0].length) {
        throw new Error('Confusion matrix must be square');
      }

      if (labels.length !== matrix.length) {
        throw new Error('Confusion matrix and labels should have the same length');
      }

      this.labels = labels;
      this.matrix = matrix;
    }
    /**
     * Construct confusion matrix from the predicted and actual labels (classes). Be sure to provide the arguments in
     * the correct order!
     * @param {Array<any>} actual  - The predicted labels of the classification
     * @param {Array<any>} predicted     - The actual labels of the classification. Has to be of same length as
     *     predicted.
     * @param {object} [options] - Additional options
     * @param {Array<any>} [options.labels] - The list of labels that should be used. If not provided the distinct set
     *     of labels present in predicted and actual is used. Labels are compared using the strict equality operator
     *     '==='
     * @return {ConfusionMatrix} - Confusion matrix
     */


    static fromLabels(actual, predicted, options = {}) {
      if (predicted.length !== actual.length) {
        throw new Error('predicted and actual must have the same length');
      }

      let distinctLabels;

      if (options.labels) {
        distinctLabels = new Set(options.labels);
      } else {
        distinctLabels = new Set([...actual, ...predicted]);
      }

      distinctLabels = Array.from(distinctLabels);

      if (options.sort) {
        distinctLabels.sort(options.sort);
      } // Create confusion matrix and fill with 0's


      const matrix = Array.from({
        length: distinctLabels.length
      });

      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(matrix.length);
        matrix[i].fill(0);
      }

      for (let i = 0; i < predicted.length; i++) {
        const actualIdx = distinctLabels.indexOf(actual[i]);
        const predictedIdx = distinctLabels.indexOf(predicted[i]);

        if (actualIdx >= 0 && predictedIdx >= 0) {
          matrix[actualIdx][predictedIdx]++;
        }
      }

      return new ConfusionMatrix(matrix, distinctLabels);
    }
    /**
     * Get the confusion matrix
     * @return {Array<Array<number> >}
     */


    getMatrix() {
      return this.matrix;
    }

    getLabels() {
      return this.labels;
    }
    /**
     * Get the total number of samples
     * @return {number}
     */


    getTotalCount() {
      let predicted = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        for (let j = 0; j < this.matrix.length; j++) {
          predicted += this.matrix[i][j];
        }
      }

      return predicted;
    }
    /**
     * Get the total number of true predictions
     * @return {number}
     */


    getTrueCount() {
      let count = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        count += this.matrix[i][i];
      }

      return count;
    }
    /**
     * Get the total number of false predictions.
     * @return {number}
     */


    getFalseCount() {
      return this.getTotalCount() - this.getTrueCount();
    }
    /**
     * Get the number of true positive predictions.
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getTruePositiveCount(label) {
      const index = this.getIndex(label);
      return this.matrix[index][index];
    }
    /**
     * Get the number of true negative predictions
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getTrueNegativeCount(label) {
      const index = this.getIndex(label);
      let count = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        for (let j = 0; j < this.matrix.length; j++) {
          if (i !== index && j !== index) {
            count += this.matrix[i][j];
          }
        }
      }

      return count;
    }
    /**
     * Get the number of false positive predictions.
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalsePositiveCount(label) {
      const index = this.getIndex(label);
      let count = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        if (i !== index) {
          count += this.matrix[i][index];
        }
      }

      return count;
    }
    /**
     * Get the number of false negative predictions.
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalseNegativeCount(label) {
      const index = this.getIndex(label);
      let count = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        if (i !== index) {
          count += this.matrix[index][i];
        }
      }

      return count;
    }
    /**
     * Get the number of real positive samples.
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getPositiveCount(label) {
      return this.getTruePositiveCount(label) + this.getFalseNegativeCount(label);
    }
    /**
     * Get the number of real negative samples.
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getNegativeCount(label) {
      return this.getTrueNegativeCount(label) + this.getFalsePositiveCount(label);
    }
    /**
     * Get the index in the confusion matrix that corresponds to the given label
     * @param {any} label - The label to search for
     * @throws if the label is not found
     * @return {number}
     */


    getIndex(label) {
      const index = this.labels.indexOf(label);
      if (index === -1) throw new Error('The label does not exist');
      return index;
    }
    /**
     * Get the true positive rate a.k.a. sensitivity. Computes the ratio between the number of true positive predictions and the total number of positive samples.
     * {@link https://en.wikipedia.org/wiki/Sensitivity_and_specificity}
     * @param {any} label - The label that should be considered "positive"
     * @return {number} - The true positive rate [0-1]
     */


    getTruePositiveRate(label) {
      return this.getTruePositiveCount(label) / this.getPositiveCount(label);
    }
    /**
     * Get the true negative rate a.k.a. specificity. Computes the ration between the number of true negative predictions and the total number of negative samples.
     * {@link https://en.wikipedia.org/wiki/Sensitivity_and_specificity}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getTrueNegativeRate(label) {
      return this.getTrueNegativeCount(label) / this.getNegativeCount(label);
    }
    /**
     * Get the positive predictive value a.k.a. precision. Computes TP / (TP + FP)
     * {@link https://en.wikipedia.org/wiki/Positive_and_negative_predictive_values}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getPositivePredictiveValue(label) {
      const TP = this.getTruePositiveCount(label);
      return TP / (TP + this.getFalsePositiveCount(label));
    }
    /**
     * Negative predictive value
     * {@link https://en.wikipedia.org/wiki/Positive_and_negative_predictive_values}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getNegativePredictiveValue(label) {
      const TN = this.getTrueNegativeCount(label);
      return TN / (TN + this.getFalseNegativeCount(label));
    }
    /**
     * False negative rate a.k.a. miss rate.
     * {@link https://en.wikipedia.org/wiki/Type_I_and_type_II_errors#False_positive_and_false_negative_rates}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalseNegativeRate(label) {
      return 1 - this.getTruePositiveRate(label);
    }
    /**
     * False positive rate a.k.a. fall-out rate.
     * {@link https://en.wikipedia.org/wiki/Type_I_and_type_II_errors#False_positive_and_false_negative_rates}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalsePositiveRate(label) {
      return 1 - this.getTrueNegativeRate(label);
    }
    /**
     * False discovery rate (FDR)
     * {@link https://en.wikipedia.org/wiki/False_discovery_rate}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalseDiscoveryRate(label) {
      const FP = this.getFalsePositiveCount(label);
      return FP / (FP + this.getTruePositiveCount(label));
    }
    /**
     * False omission rate (FOR)
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getFalseOmissionRate(label) {
      const FN = this.getFalseNegativeCount(label);
      return FN / (FN + this.getTruePositiveCount(label));
    }
    /**
     * F1 score
     * {@link https://en.wikipedia.org/wiki/F1_score}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getF1Score(label) {
      const TP = this.getTruePositiveCount(label);
      return 2 * TP / (2 * TP + this.getFalsePositiveCount(label) + this.getFalseNegativeCount(label));
    }
    /**
     * Matthews correlation coefficient (MCC)
     * {@link https://en.wikipedia.org/wiki/Matthews_correlation_coefficient}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getMatthewsCorrelationCoefficient(label) {
      const TP = this.getTruePositiveCount(label);
      const TN = this.getTrueNegativeCount(label);
      const FP = this.getFalsePositiveCount(label);
      const FN = this.getFalseNegativeCount(label);
      return (TP * TN - FP * FN) / Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN));
    }
    /**
     * Informedness
     * {@link https://en.wikipedia.org/wiki/Youden%27s_J_statistic}
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getInformedness(label) {
      return this.getTruePositiveRate(label) + this.getTrueNegativeRate(label) - 1;
    }
    /**
     * Markedness
     * @param {any} label - The label that should be considered "positive"
     * @return {number}
     */


    getMarkedness(label) {
      return this.getPositivePredictiveValue(label) + this.getNegativePredictiveValue(label) - 1;
    }
    /**
     * Get the confusion table.
     * @param {any} label - The label that should be considered "positive"
     * @return {Array<Array<number> >} - The 2x2 confusion table. [[TP, FN], [FP, TN]]
     */


    getConfusionTable(label) {
      return [[this.getTruePositiveCount(label), this.getFalseNegativeCount(label)], [this.getFalsePositiveCount(label), this.getTrueNegativeCount(label)]];
    }
    /**
     * Get total accuracy.
     * @return {number} - The ratio between the number of true predictions and total number of classifications ([0-1])
     */


    getAccuracy() {
      let correct = 0;
      let incorrect = 0;

      for (let i = 0; i < this.matrix.length; i++) {
        for (let j = 0; j < this.matrix.length; j++) {
          if (i === j) correct += this.matrix[i][j];else incorrect += this.matrix[i][j];
        }
      }

      return correct / (correct + incorrect);
    }
    /**
     * Returns the element in the confusion matrix that corresponds to the given actual and predicted labels.
     * @param {any} actual - The true label
     * @param {any} predicted - The predicted label
     * @return {number} - The element in the confusion matrix
     */


    getCount(actual, predicted) {
      const actualIndex = this.getIndex(actual);
      const predictedIndex = this.getIndex(predicted);
      return this.matrix[actualIndex][predictedIndex];
    }
    /**
     * Compute the general prediction accuracy
     * @deprecated Use getAccuracy
     * @return {number} - The prediction accuracy ([0-1]
     */


    get accuracy() {
      return this.getAccuracy();
    }
    /**
     * Compute the number of predicted observations
     * @deprecated Use getTotalCount
     * @return {number}
     */


    get total() {
      return this.getTotalCount();
    }

  }

  var lib = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      factory() ;
    })(commonjsGlobal, function () {

      function createCommonjsModule(fn, module) {
        return module = {
          exports: {}
        }, fn(module, module.exports), module.exports;
      }

      var runtime = createCommonjsModule(function (module) {
        /**
         * Copyright (c) 2014-present, Facebook, Inc.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */
        !function (global) {
          var Op = Object.prototype;
          var hasOwn = Op.hasOwnProperty;
          var undefined$1; // More compressible than void 0.

          var $Symbol = typeof Symbol === "function" ? Symbol : {};
          var iteratorSymbol = $Symbol.iterator || "@@iterator";
          var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
          var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
          var runtime = global.regeneratorRuntime;

          if (runtime) {
            {
              // If regeneratorRuntime is defined globally and we're in a module,
              // make the exports object identical to regeneratorRuntime.
              module.exports = runtime;
            } // Don't bother evaluating the rest of this file if the runtime was
            // already defined globally.

            return;
          } // Define the runtime globally (as expected by generated code) as either
          // module.exports (if we're in a module) or a new, empty object.


          runtime = global.regeneratorRuntime = module.exports;

          function wrap(innerFn, outerFn, self, tryLocsList) {
            // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
            var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
            var generator = Object.create(protoGenerator.prototype);
            var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
            // .throw, and .return methods.

            generator._invoke = makeInvokeMethod(innerFn, self, context);
            return generator;
          }

          runtime.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
          // record like context.tryEntries[i].completion. This interface could
          // have been (and was previously) designed to take a closure to be
          // invoked without arguments, but in all the cases we care about we
          // already have an existing method we want to call, so there's no need
          // to create a new function object. We can even get away with assuming
          // the method takes exactly one argument, since that happens to be true
          // in every case, so we don't have to touch the arguments object. The
          // only additional allocation required is the completion record, which
          // has a stable shape and so hopefully should be cheap to allocate.

          function tryCatch(fn, obj, arg) {
            try {
              return {
                type: "normal",
                arg: fn.call(obj, arg)
              };
            } catch (err) {
              return {
                type: "throw",
                arg: err
              };
            }
          }

          var GenStateSuspendedStart = "suspendedStart";
          var GenStateSuspendedYield = "suspendedYield";
          var GenStateExecuting = "executing";
          var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
          // breaking out of the dispatch switch statement.

          var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
          // .constructor.prototype properties for functions that return Generator
          // objects. For full spec compliance, you may wish to configure your
          // minifier not to mangle the names of these two functions.

          function Generator() {}

          function GeneratorFunction() {}

          function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
          // don't natively support it.


          var IteratorPrototype = {};

          IteratorPrototype[iteratorSymbol] = function () {
            return this;
          };

          var getProto = Object.getPrototypeOf;
          var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

          if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
            // This environment has a native %IteratorPrototype%; use it instead
            // of the polyfill.
            IteratorPrototype = NativeIteratorPrototype;
          }

          var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
          GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
          GeneratorFunctionPrototype.constructor = GeneratorFunction;
          GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
          // Iterator interface in terms of a single ._invoke method.

          function defineIteratorMethods(prototype) {
            ["next", "throw", "return"].forEach(function (method) {
              prototype[method] = function (arg) {
                return this._invoke(method, arg);
              };
            });
          }

          runtime.isGeneratorFunction = function (genFun) {
            var ctor = typeof genFun === "function" && genFun.constructor;
            return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
          };

          runtime.mark = function (genFun) {
            if (Object.setPrototypeOf) {
              Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
            } else {
              genFun.__proto__ = GeneratorFunctionPrototype;

              if (!(toStringTagSymbol in genFun)) {
                genFun[toStringTagSymbol] = "GeneratorFunction";
              }
            }

            genFun.prototype = Object.create(Gp);
            return genFun;
          }; // Within the body of any async function, `await x` is transformed to
          // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
          // `hasOwn.call(value, "__await")` to determine if the yielded value is
          // meant to be awaited.


          runtime.awrap = function (arg) {
            return {
              __await: arg
            };
          };

          function AsyncIterator(generator) {
            function invoke(method, arg, resolve, reject) {
              var record = tryCatch(generator[method], generator, arg);

              if (record.type === "throw") {
                reject(record.arg);
              } else {
                var result = record.arg;
                var value = result.value;

                if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
                  return Promise.resolve(value.__await).then(function (value) {
                    invoke("next", value, resolve, reject);
                  }, function (err) {
                    invoke("throw", err, resolve, reject);
                  });
                }

                return Promise.resolve(value).then(function (unwrapped) {
                  // When a yielded Promise is resolved, its final value becomes
                  // the .value of the Promise<{value,done}> result for the
                  // current iteration. If the Promise is rejected, however, the
                  // result for this iteration will be rejected with the same
                  // reason. Note that rejections of yielded Promises are not
                  // thrown back into the generator function, as is the case
                  // when an awaited Promise is rejected. This difference in
                  // behavior between yield and await is important, because it
                  // allows the consumer to decide what to do with the yielded
                  // rejection (swallow it and continue, manually .throw it back
                  // into the generator, abandon iteration, whatever). With
                  // await, by contrast, there is no opportunity to examine the
                  // rejection reason outside the generator function, so the
                  // only option is to throw it from the await expression, and
                  // let the generator function handle the exception.
                  result.value = unwrapped;
                  resolve(result);
                }, reject);
              }
            }

            var previousPromise;

            function enqueue(method, arg) {
              function callInvokeWithMethodAndArg() {
                return new Promise(function (resolve, reject) {
                  invoke(method, arg, resolve, reject);
                });
              }

              return previousPromise = // If enqueue has been called before, then we want to wait until
              // all previous Promises have been resolved before calling invoke,
              // so that results are always delivered in the correct order. If
              // enqueue has not been called before, then it is important to
              // call invoke immediately, without waiting on a callback to fire,
              // so that the async generator function has the opportunity to do
              // any necessary setup in a predictable way. This predictability
              // is why the Promise constructor synchronously invokes its
              // executor callback, and why async functions synchronously
              // execute code before the first await. Since we implement simple
              // async functions in terms of async generators, it is especially
              // important to get this right, even though it requires care.
              previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
            } // Define the unified helper method that is used to implement .next,
            // .throw, and .return (see defineIteratorMethods).


            this._invoke = enqueue;
          }

          defineIteratorMethods(AsyncIterator.prototype);

          AsyncIterator.prototype[asyncIteratorSymbol] = function () {
            return this;
          };

          runtime.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
          // AsyncIterator objects; they just return a Promise for the value of
          // the final result produced by the iterator.

          runtime.async = function (innerFn, outerFn, self, tryLocsList) {
            var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
            return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
            : iter.next().then(function (result) {
              return result.done ? result.value : iter.next();
            });
          };

          function makeInvokeMethod(innerFn, self, context) {
            var state = GenStateSuspendedStart;
            return function invoke(method, arg) {
              if (state === GenStateExecuting) {
                throw new Error("Generator is already running");
              }

              if (state === GenStateCompleted) {
                if (method === "throw") {
                  throw arg;
                } // Be forgiving, per 25.3.3.3.3 of the spec:
                // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


                return doneResult();
              }

              context.method = method;
              context.arg = arg;

              while (true) {
                var delegate = context.delegate;

                if (delegate) {
                  var delegateResult = maybeInvokeDelegate(delegate, context);

                  if (delegateResult) {
                    if (delegateResult === ContinueSentinel) continue;
                    return delegateResult;
                  }
                }

                if (context.method === "next") {
                  // Setting context._sent for legacy support of Babel's
                  // function.sent implementation.
                  context.sent = context._sent = context.arg;
                } else if (context.method === "throw") {
                  if (state === GenStateSuspendedStart) {
                    state = GenStateCompleted;
                    throw context.arg;
                  }

                  context.dispatchException(context.arg);
                } else if (context.method === "return") {
                  context.abrupt("return", context.arg);
                }

                state = GenStateExecuting;
                var record = tryCatch(innerFn, self, context);

                if (record.type === "normal") {
                  // If an exception is thrown from innerFn, we leave state ===
                  // GenStateExecuting and loop back for another invocation.
                  state = context.done ? GenStateCompleted : GenStateSuspendedYield;

                  if (record.arg === ContinueSentinel) {
                    continue;
                  }

                  return {
                    value: record.arg,
                    done: context.done
                  };
                } else if (record.type === "throw") {
                  state = GenStateCompleted; // Dispatch the exception by looping back around to the
                  // context.dispatchException(context.arg) call above.

                  context.method = "throw";
                  context.arg = record.arg;
                }
              }
            };
          } // Call delegate.iterator[context.method](context.arg) and handle the
          // result, either by returning a { value, done } result from the
          // delegate iterator, or by modifying context.method and context.arg,
          // setting context.delegate to null, and returning the ContinueSentinel.


          function maybeInvokeDelegate(delegate, context) {
            var method = delegate.iterator[context.method];

            if (method === undefined$1) {
              // A .throw or .return when the delegate iterator has no .throw
              // method always terminates the yield* loop.
              context.delegate = null;

              if (context.method === "throw") {
                if (delegate.iterator.return) {
                  // If the delegate iterator has a return method, give it a
                  // chance to clean up.
                  context.method = "return";
                  context.arg = undefined$1;
                  maybeInvokeDelegate(delegate, context);

                  if (context.method === "throw") {
                    // If maybeInvokeDelegate(context) changed context.method from
                    // "return" to "throw", let that override the TypeError below.
                    return ContinueSentinel;
                  }
                }

                context.method = "throw";
                context.arg = new TypeError("The iterator does not provide a 'throw' method");
              }

              return ContinueSentinel;
            }

            var record = tryCatch(method, delegate.iterator, context.arg);

            if (record.type === "throw") {
              context.method = "throw";
              context.arg = record.arg;
              context.delegate = null;
              return ContinueSentinel;
            }

            var info = record.arg;

            if (!info) {
              context.method = "throw";
              context.arg = new TypeError("iterator result is not an object");
              context.delegate = null;
              return ContinueSentinel;
            }

            if (info.done) {
              // Assign the result of the finished delegate to the temporary
              // variable specified by delegate.resultName (see delegateYield).
              context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

              context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
              // exception, let the outer generator proceed normally. If
              // context.method was "next", forget context.arg since it has been
              // "consumed" by the delegate iterator. If context.method was
              // "return", allow the original .return call to continue in the
              // outer generator.

              if (context.method !== "return") {
                context.method = "next";
                context.arg = undefined$1;
              }
            } else {
              // Re-yield the result returned by the delegate method.
              return info;
            } // The delegate iterator is finished, so forget it and continue with
            // the outer generator.


            context.delegate = null;
            return ContinueSentinel;
          } // Define Generator.prototype.{next,throw,return} in terms of the
          // unified ._invoke helper method.


          defineIteratorMethods(Gp);
          Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
          // @@iterator function is called on it. Some browsers' implementations of the
          // iterator prototype chain incorrectly implement this, causing the Generator
          // object to not be returned from this call. This ensures that doesn't happen.
          // See https://github.com/facebook/regenerator/issues/274 for more details.

          Gp[iteratorSymbol] = function () {
            return this;
          };

          Gp.toString = function () {
            return "[object Generator]";
          };

          function pushTryEntry(locs) {
            var entry = {
              tryLoc: locs[0]
            };

            if (1 in locs) {
              entry.catchLoc = locs[1];
            }

            if (2 in locs) {
              entry.finallyLoc = locs[2];
              entry.afterLoc = locs[3];
            }

            this.tryEntries.push(entry);
          }

          function resetTryEntry(entry) {
            var record = entry.completion || {};
            record.type = "normal";
            delete record.arg;
            entry.completion = record;
          }

          function Context(tryLocsList) {
            // The root entry object (effectively a try statement without a catch
            // or a finally block) gives us a place to store values thrown from
            // locations where there is no enclosing try statement.
            this.tryEntries = [{
              tryLoc: "root"
            }];
            tryLocsList.forEach(pushTryEntry, this);
            this.reset(true);
          }

          runtime.keys = function (object) {
            var keys = [];

            for (var key in object) {
              keys.push(key);
            }

            keys.reverse(); // Rather than returning an object with a next method, we keep
            // things simple and return the next function itself.

            return function next() {
              while (keys.length) {
                var key = keys.pop();

                if (key in object) {
                  next.value = key;
                  next.done = false;
                  return next;
                }
              } // To avoid creating an additional object, we just hang the .value
              // and .done properties off the next function object itself. This
              // also ensures that the minifier will not anonymize the function.


              next.done = true;
              return next;
            };
          };

          function values(iterable) {
            if (iterable) {
              var iteratorMethod = iterable[iteratorSymbol];

              if (iteratorMethod) {
                return iteratorMethod.call(iterable);
              }

              if (typeof iterable.next === "function") {
                return iterable;
              }

              if (!isNaN(iterable.length)) {
                var i = -1,
                    next = function next() {
                  while (++i < iterable.length) {
                    if (hasOwn.call(iterable, i)) {
                      next.value = iterable[i];
                      next.done = false;
                      return next;
                    }
                  }

                  next.value = undefined$1;
                  next.done = true;
                  return next;
                };

                return next.next = next;
              }
            } // Return an iterator with no values.


            return {
              next: doneResult
            };
          }

          runtime.values = values;

          function doneResult() {
            return {
              value: undefined$1,
              done: true
            };
          }

          Context.prototype = {
            constructor: Context,
            reset: function (skipTempReset) {
              this.prev = 0;
              this.next = 0; // Resetting context._sent for legacy support of Babel's
              // function.sent implementation.

              this.sent = this._sent = undefined$1;
              this.done = false;
              this.delegate = null;
              this.method = "next";
              this.arg = undefined$1;
              this.tryEntries.forEach(resetTryEntry);

              if (!skipTempReset) {
                for (var name in this) {
                  // Not sure about the optimal order of these conditions:
                  if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                    this[name] = undefined$1;
                  }
                }
              }
            },
            stop: function () {
              this.done = true;
              var rootEntry = this.tryEntries[0];
              var rootRecord = rootEntry.completion;

              if (rootRecord.type === "throw") {
                throw rootRecord.arg;
              }

              return this.rval;
            },
            dispatchException: function (exception) {
              if (this.done) {
                throw exception;
              }

              var context = this;

              function handle(loc, caught) {
                record.type = "throw";
                record.arg = exception;
                context.next = loc;

                if (caught) {
                  // If the dispatched exception was caught by a catch block,
                  // then let that catch block handle the exception normally.
                  context.method = "next";
                  context.arg = undefined$1;
                }

                return !!caught;
              }

              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];
                var record = entry.completion;

                if (entry.tryLoc === "root") {
                  // Exception thrown outside of any try block that could handle
                  // it, so set the completion value of the entire function to
                  // throw the exception.
                  return handle("end");
                }

                if (entry.tryLoc <= this.prev) {
                  var hasCatch = hasOwn.call(entry, "catchLoc");
                  var hasFinally = hasOwn.call(entry, "finallyLoc");

                  if (hasCatch && hasFinally) {
                    if (this.prev < entry.catchLoc) {
                      return handle(entry.catchLoc, true);
                    } else if (this.prev < entry.finallyLoc) {
                      return handle(entry.finallyLoc);
                    }
                  } else if (hasCatch) {
                    if (this.prev < entry.catchLoc) {
                      return handle(entry.catchLoc, true);
                    }
                  } else if (hasFinally) {
                    if (this.prev < entry.finallyLoc) {
                      return handle(entry.finallyLoc);
                    }
                  } else {
                    throw new Error("try statement without catch or finally");
                  }
                }
              }
            },
            abrupt: function (type, arg) {
              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];

                if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                  var finallyEntry = entry;
                  break;
                }
              }

              if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
                // Ignore the finally entry if control is not jumping to a
                // location outside the try/catch block.
                finallyEntry = null;
              }

              var record = finallyEntry ? finallyEntry.completion : {};
              record.type = type;
              record.arg = arg;

              if (finallyEntry) {
                this.method = "next";
                this.next = finallyEntry.finallyLoc;
                return ContinueSentinel;
              }

              return this.complete(record);
            },
            complete: function (record, afterLoc) {
              if (record.type === "throw") {
                throw record.arg;
              }

              if (record.type === "break" || record.type === "continue") {
                this.next = record.arg;
              } else if (record.type === "return") {
                this.rval = this.arg = record.arg;
                this.method = "return";
                this.next = "end";
              } else if (record.type === "normal" && afterLoc) {
                this.next = afterLoc;
              }

              return ContinueSentinel;
            },
            finish: function (finallyLoc) {
              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];

                if (entry.finallyLoc === finallyLoc) {
                  this.complete(entry.completion, entry.afterLoc);
                  resetTryEntry(entry);
                  return ContinueSentinel;
                }
              }
            },
            "catch": function (tryLoc) {
              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                var entry = this.tryEntries[i];

                if (entry.tryLoc === tryLoc) {
                  var record = entry.completion;

                  if (record.type === "throw") {
                    var thrown = record.arg;
                    resetTryEntry(entry);
                  }

                  return thrown;
                }
              } // The context.catch method must only be called with a location
              // argument that corresponds to a known catch block.


              throw new Error("illegal catch attempt");
            },
            delegateYield: function (iterable, resultName, nextLoc) {
              this.delegate = {
                iterator: values(iterable),
                resultName: resultName,
                nextLoc: nextLoc
              };

              if (this.method === "next") {
                // Deliberately forget the last sent value so that we don't
                // accidentally pass it on to the delegate.
                this.arg = undefined$1;
              }

              return ContinueSentinel;
            }
          };
        }( // In sloppy mode, unbound `this` refers to the global object, fallback to
        // Function constructor if we're in global strict mode. That is sadly a form
        // of indirect eval which violates Content Security Policy.
        function () {
          return this;
        }() || Function("return this")());
      });
      /**
       * Copyright (c) 2014-present, Facebook, Inc.
       *
       * This source code is licensed under the MIT license found in the
       * LICENSE file in the root directory of this source tree.
       */
      // This method of obtaining a reference to the global object needs to be
      // kept identical to the way it is obtained in runtime.js

      var g = function () {
        return this;
      }() || Function("return this")(); // Use `getOwnPropertyNames` because not all browsers support calling
      // `hasOwnProperty` on the global `self` object in a worker. See #183.


      var hadRuntime = g.regeneratorRuntime && Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0; // Save the old regeneratorRuntime in case it needs to be restored later.

      var oldRuntime = hadRuntime && g.regeneratorRuntime; // Force reevalutation of runtime.js.

      g.regeneratorRuntime = undefined;
      var runtimeModule = runtime;

      if (hadRuntime) {
        // Restore the original runtime.
        g.regeneratorRuntime = oldRuntime;
      } else {
        // Remove the global property added by runtime.js.
        try {
          delete g.regeneratorRuntime;
        } catch (e) {
          g.regeneratorRuntime = undefined;
        }
      }

      var regenerator = runtimeModule;
      var defaultOptions = {
        mode: 'index'
      };
      module.exports = /*#__PURE__*/regenerator.mark(function _callee(M, N, options) {
        var a, c, b, p, x, y, z, i, twiddle;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                twiddle = function twiddle() {
                  var i, j, k;
                  j = 1;

                  while (p[j] <= 0) {
                    j++;
                  }

                  if (p[j - 1] === 0) {
                    for (i = j - 1; i !== 1; i--) {
                      p[i] = -1;
                    }

                    p[j] = 0;
                    x = z = 0;
                    p[1] = 1;
                    y = j - 1;
                  } else {
                    if (j > 1) {
                      p[j - 1] = 0;
                    }

                    do {
                      j++;
                    } while (p[j] > 0);

                    k = j - 1;
                    i = j;

                    while (p[i] === 0) {
                      p[i++] = -1;
                    }

                    if (p[i] === -1) {
                      p[i] = p[k];
                      z = p[k] - 1;
                      x = i - 1;
                      y = k - 1;
                      p[k] = -1;
                    } else {
                      if (i === p[0]) {
                        return 0;
                      } else {
                        p[j] = p[i];
                        z = p[i] - 1;
                        p[i] = 0;
                        x = j - 1;
                        y = i - 1;
                      }
                    }
                  }

                  return 1;
                };

                options = Object.assign({}, defaultOptions, options);
                a = new Array(N);
                c = new Array(M);
                b = new Array(N);
                p = new Array(N + 2); // init a and b

                for (i = 0; i < N; i++) {
                  a[i] = i;
                  if (i < N - M) b[i] = 0;else b[i] = 1;
                } // init c


                for (i = 0; i < M; i++) {
                  c[i] = N - M + i;
                } // init p


                for (i = 0; i < p.length; i++) {
                  if (i === 0) p[i] = N + 1;else if (i <= N - M) p[i] = 0;else if (i <= N) p[i] = i - N + M;else p[i] = -2;
                }

                if (!(options.mode === 'index')) {
                  _context.next = 20;
                  break;
                }

                _context.next = 12;
                return c.slice();

              case 12:
                if (!twiddle()) {
                  _context.next = 18;
                  break;
                }

                c[z] = a[x];
                _context.next = 16;
                return c.slice();

              case 16:
                _context.next = 12;
                break;

              case 18:
                _context.next = 33;
                break;

              case 20:
                if (!(options.mode === 'mask')) {
                  _context.next = 32;
                  break;
                }

                _context.next = 23;
                return b.slice();

              case 23:
                if (!twiddle()) {
                  _context.next = 30;
                  break;
                }

                b[x] = 1;
                b[y] = 0;
                _context.next = 28;
                return b.slice();

              case 28:
                _context.next = 23;
                break;

              case 30:
                _context.next = 33;
                break;

              case 32:
                throw new Error('Invalid mode');

              case 33:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      });
    });
  });

  /**
   * get folds indexes
   * @param {Array} features
   * @param {Number} k - number of folds, a
   */
  function getFolds(features, k = 5) {
    let N = features.length;
    let allIdx = new Array(N);

    for (let i = 0; i < N; i++) {
      allIdx[i] = i;
    }

    let l = Math.floor(N / k); // create random k-folds

    let current = [];
    let folds = [];

    while (allIdx.length) {
      let randi = Math.floor(Math.random() * allIdx.length);
      current.push(allIdx[randi]);
      allIdx.splice(randi, 1);

      if (current.length === l) {
        folds.push(current);
        current = [];
      }
    } // we push the remaining to the last fold so that the total length is
    // preserved. Otherwise the Q2 will fail.


    if (current.length) current.forEach(e => folds[k - 1].push(e));
    folds = folds.slice(0, k);
    let foldsIndex = folds.map((x, idx) => ({
      testIndex: x,
      trainIndex: [].concat(...folds.filter((el, idx2) => idx2 !== idx))
    }));
    return foldsIndex;
  }

  /**
   * A function to sample a dataset maintaining classes equilibrated
   * @param {Array} classVector - an array containing class or group information
   * @param {Number} fraction - a fraction of the class to sample
   * @return {Object} - an object with indexes
   */
  function sampleAClass(classVector, fraction) {
    // sort the vector
    let classVectorSorted = JSON.parse(JSON.stringify(classVector));
    let result = Array.from(Array(classVectorSorted.length).keys()).sort((a, b) => classVectorSorted[a] < classVectorSorted[b] ? -1 : classVectorSorted[b] < classVectorSorted[a] | 0);
    classVectorSorted.sort((a, b) => a < b ? -1 : b < a | 0); // counts the class elements

    let counts = {};
    classVectorSorted.forEach(x => counts[x] = (counts[x] || 0) + 1); // pick a few per class

    let indexOfSelected = [];
    Object.keys(counts).forEach((e, i) => {
      let shift = [];
      Object.values(counts).reduce((a, c, item) => shift[item] = a + c, 0);
      let arr = [...Array(counts[e]).keys()];
      let r = [];

      for (let j = 0; j < Math.floor(counts[e] * fraction); j++) {
        let n = arr[Math.floor(Math.random() * arr.length)];
        r.push(n);
        let ind = arr.indexOf(n);
        arr.splice(ind, 1);
      }

      if (i === 0) {
        indexOfSelected = indexOfSelected.concat(r);
      } else {
        indexOfSelected = indexOfSelected.concat(r.map(x => x + shift[i - 1]));
      }
    }); // sort back the index

    let trainIndex = [];
    indexOfSelected.forEach(e => trainIndex.push(result[e]));
    let testIndex = [];
    let mask = [];
    classVector.forEach((el, idx) => {
      if (trainIndex.includes(idx)) {
        mask.push(true);
      } else {
        mask.push(false);
        testIndex.push(idx);
      }
    });
    return {
      trainIndex,
      testIndex,
      mask
    };
  }

  /**
   * Performs a leave-one-out cross-validation (LOO-CV) of the given samples. In LOO-CV, 1 observation is used as the
   * validation set while the rest is used as the training set. This is repeated once for each observation. LOO-CV is a
   * special case of LPO-CV. @see leavePout
   * @param {function} Classifier - The classifier's constructor to use for the cross validation. Expect ml-classifier
   *     api.
   * @param {Array} features - The features for all samples of the data-set
   * @param {Array} labels - The classification class of all samples of the data-set
   * @param {object} classifierOptions - The classifier options with which the classifier should be instantiated.
   * @return {ConfusionMatrix} - The cross-validation confusion matrix
   */

  function leaveOneOut(Classifier, features, labels, classifierOptions) {
    if (typeof labels === 'function') {
      let callback = labels;
      labels = features;
      features = Classifier;
      return leavePOut(features, labels, 1, callback);
    }

    return leavePOut(Classifier, features, labels, classifierOptions, 1);
  }
  /**
   * Performs a leave-p-out cross-validation (LPO-CV) of the given samples. In LPO-CV, p observations are used as the
   * validation set while the rest is used as the training set. This is repeated as many times as there are possible
   * ways to combine p observations from the set (unordered without replacement). Be aware that for relatively small
   * data-set size this can require a very large number of training and testing to do!
   * @param {function} Classifier - The classifier's constructor to use for the cross validation. Expect ml-classifier
   *     api.
   * @param {Array} features - The features for all samples of the data-set
   * @param {Array} labels - The classification class of all samples of the data-set
   * @param {object} classifierOptions - The classifier options with which the classifier should be instantiated.
   * @param {number} p - The size of the validation sub-samples' set
   * @return {ConfusionMatrix} - The cross-validation confusion matrix
   */

  function leavePOut(Classifier, features, labels, classifierOptions, p) {
    let callback;

    if (typeof classifierOptions === 'function') {
      callback = classifierOptions;
      p = labels;
      labels = features;
      features = Classifier;
    }

    check(features, labels);
    const distinct = getDistinct(labels);
    const confusionMatrix = initMatrix(distinct.length, distinct.length);
    let N = features.length;
    let gen = lib(p, N);
    let allIdx = new Array(N);

    for (let i = 0; i < N; i++) {
      allIdx[i] = i;
    }

    for (const testIdx of gen) {
      let trainIdx = allIdx.slice();

      for (let i = testIdx.length - 1; i >= 0; i--) {
        trainIdx.splice(testIdx[i], 1);
      }

      if (callback) {
        validateWithCallback(features, labels, testIdx, trainIdx, confusionMatrix, distinct, callback);
      } else {
        validate(Classifier, features, labels, classifierOptions, testIdx, trainIdx, confusionMatrix, distinct);
      }
    }

    return new ConfusionMatrix(confusionMatrix, distinct);
  }
  /**
   * Performs k-fold cross-validation (KF-CV). KF-CV separates the data-set into k random equally sized partitions, and
   * uses each as a validation set, with all other partitions used in the training set. Observations left over from if k
   * does not divide the number of observations are left out of the cross-validation process.
   * @param {function} Classifier - The classifier's to use for the cross validation. Expect ml-classifier api.
   * @param {Array} features - The features for all samples of the data-set
   * @param {Array} labels - The classification class of all samples of the data-set
   * @param {object} classifierOptions - The classifier options with which the classifier should be instantiated.
   * @param {number} k - The number of partitions to create
   * @return {ConfusionMatrix} - The cross-validation confusion matrix
   */

  function kFold(Classifier, features, labels, classifierOptions, k) {
    let callback;

    if (typeof classifierOptions === 'function') {
      callback = classifierOptions;
      k = labels;
      labels = features;
      features = Classifier;
    }

    check(features, labels);
    const distinct = getDistinct(labels);
    const confusionMatrix = initMatrix(distinct.length, distinct.length);
    let folds = getFolds(features, k);

    for (let i = 0; i < folds.length; i++) {
      let testIdx = folds[i].testIndex;
      let trainIdx = folds[i].trainIndex;

      if (callback) {
        validateWithCallback(features, labels, testIdx, trainIdx, confusionMatrix, distinct, callback);
      } else {
        validate(Classifier, features, labels, classifierOptions, testIdx, trainIdx, confusionMatrix, distinct);
      }
    }

    return new ConfusionMatrix(confusionMatrix, distinct);
  }

  function check(features, labels) {
    if (features.length !== labels.length) {
      throw new Error('features and labels should have the same length');
    }
  }

  function initMatrix(rows, columns) {
    return new Array(rows).fill(0).map(() => new Array(columns).fill(0));
  }

  function getDistinct(arr) {
    let s = new Set();

    for (let i = 0; i < arr.length; i++) {
      s.add(arr[i]);
    }

    return Array.from(s);
  }

  function validate(Classifier, features, labels, classifierOptions, testIdx, trainIdx, confusionMatrix, distinct) {
    const {
      testFeatures,
      trainFeatures,
      testLabels,
      trainLabels
    } = getTrainTest(features, labels, testIdx, trainIdx);
    let classifier;

    if (Classifier.prototype.train) {
      classifier = new Classifier(classifierOptions);
      classifier.train(trainFeatures, trainLabels);
    } else {
      classifier = new Classifier(trainFeatures, trainLabels, classifierOptions);
    }

    let predictedLabels = classifier.predict(testFeatures);
    updateConfusionMatrix(confusionMatrix, testLabels, predictedLabels, distinct);
  }

  function validateWithCallback(features, labels, testIdx, trainIdx, confusionMatrix, distinct, callback) {
    const {
      testFeatures,
      trainFeatures,
      testLabels,
      trainLabels
    } = getTrainTest(features, labels, testIdx, trainIdx);
    const predictedLabels = callback(trainFeatures, trainLabels, testFeatures);
    updateConfusionMatrix(confusionMatrix, testLabels, predictedLabels, distinct);
  }

  function updateConfusionMatrix(confusionMatrix, testLabels, predictedLabels, distinct) {
    for (let i = 0; i < predictedLabels.length; i++) {
      const actualIdx = distinct.indexOf(testLabels[i]);
      const predictedIdx = distinct.indexOf(predictedLabels[i]);

      if (actualIdx < 0 || predictedIdx < 0) {
        // eslint-disable-next-line no-console
        console.warn(`ignore unknown predicted label ${predictedLabels[i]}`);
      }

      confusionMatrix[actualIdx][predictedIdx]++;
    }
  }

  function getTrainTest(features, labels, testIdx, trainIdx) {
    return {
      testFeatures: testIdx.map(function (index) {
        return features[index];
      }),
      trainFeatures: trainIdx.map(function (index) {
        return features[index];
      }),
      testLabels: testIdx.map(function (index) {
        return labels[index];
      }),
      trainLabels: trainIdx.map(function (index) {
        return labels[index];
      })
    };
  }

  var index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    leaveOneOut: leaveOneOut,
    leavePOut: leavePOut,
    kFold: kFold,
    getTrainTest: getTrainTest,
    sampleAClass: sampleAClass,
    getFolds: getFolds
  });

  /**
   * OPLS loop
   * @param {Array} x a matrix with features
   * @param {Array} y an array of labels (dependent variable)
   * @param {Object} options an object with options
   * @return {Object} an object with model (filteredX: err,
      loadingsXOrtho: pOrtho,
      scoresXOrtho: tOrtho,
      weightsXOrtho: wOrtho,
      weightsPred: w,
      loadingsXpred: p,
      scoresXpred: t,
      loadingsY:)
   */

  function OPLSNipals(x, y, options = {}) {
    const {
      numberOSC = 100
    } = options;
    let X = Matrix$2.checkMatrix(x);
    let Y = Matrix$2.checkMatrix(y);
    let u = Y.getColumnVector(0);
    let diff = 1;
    let t, c, w, uNew;

    for (let i = 0; i < numberOSC && diff > 1e-10; i++) {
      w = u.transpose().mmul(X).div(u.transpose().mmul(u).get(0, 0));
      w = w.transpose().div(norm$1(w));
      t = X.mmul(w).div(w.transpose().mmul(w).get(0, 0)); // t_h paso 3
      // calc loading

      c = t.transpose().mmul(Y).div(t.transpose().mmul(t).get(0, 0)); // calc new u and compare with one in previus iteration (stop criterion)

      uNew = Y.mmul(c.transpose());
      uNew = uNew.div(c.transpose().mmul(c).get(0, 0));

      if (i > 0) {
        diff = uNew.clone().sub(u).pow(2).sum() / uNew.clone().pow(2).sum();
      }

      u = uNew.clone();
    } // calc loadings


    let p = t.transpose().mmul(X).div(t.transpose().mmul(t).get(0, 0));
    let wOrtho = p.clone().sub(w.transpose().mmul(p.transpose()).div(w.transpose().mmul(w).get(0, 0)).mmul(w.transpose()));
    wOrtho.div(norm$1(wOrtho)); // orthogonal scores

    let tOrtho = X.mmul(wOrtho.transpose()).div(wOrtho.mmul(wOrtho.transpose()).get(0, 0)); // orthogonal loadings

    let pOrtho = tOrtho.transpose().mmul(X).div(tOrtho.transpose().mmul(tOrtho).get(0, 0)); // filtered data

    let err = X.clone().sub(tOrtho.mmul(pOrtho));
    return {
      filteredX: err,
      weightsXOrtho: wOrtho,
      loadingsXOrtho: pOrtho,
      scoresXOrtho: tOrtho,
      weightsXPred: w,
      loadingsXpred: p,
      scoresXpred: t,
      loadingsY: c
    };
  }

  /**
   * Get total sum of square
   * @param {Array} x an array
   * @return {Number} - the sum of the squares
   */

  function tss(x) {
    return Matrix$2.mul(x, x).sum();
  }

  /**
   * Creates new OPLS (orthogonal partial latent structures) from features and labels.
   * @param {Matrix} data - matrix containing data (X).
   * @param {Array} labels - 1D Array containing metadata (Y).
   * @param {Object} [options]
   * @param {number} [options.nComp = 3] - number of latent structures computed.
   * @param {boolean} [options.center = true] - should the data be centered (subtract the mean).
   * @param {boolean} [options.scale = false] - should the data be scaled (divide by the standard deviation).
   * @param {Array} [options.cvFolds = []] - allows to provide folds as 2D array for testing purpose.
   * */

  class OPLS {
    constructor(data, labels, options = {}) {
      if (data === true) {
        const opls = options;
        this.center = opls.center;
        this.scale = opls.scale;
        this.means = opls.means;
        this.meansY = opls.meansY;
        this.stdevs = opls.stdevs;
        this.stdevs = opls.stdevsY;
        this.model = opls.model;
        this.tCV = opls.tCV;
        this.tOrthCV = opls.tOrthCV;
        this.yHatCV = opls.yHatCV;
        this.mode = opls.mode;
        return;
      }

      let features = data.clone(); // set default values
      // cvFolds allows to define folds for testing purpose

      const {
        nComp = 3,
        center = true,
        scale = true,
        cvFolds = []
      } = options;
      let group;

      if (typeof labels[0] === 'number') {
        // numeric labels: OPLS regression is used
        this.mode = 'regression';
        group = Matrix$2.from1DArray(labels.length, 1, labels);
      } else if (typeof labels[0] === 'string') {
        // non-numeric labels: OPLS-DA is used
        this.mode = 'discriminantAnalysis';
        group = labels;
        throw new Error('discriminant analysis is not yet supported');
      } // check types of features and labels


      if (features.constructor.name !== 'Matrix') {
        throw new TypeError('features must be of class Matrix');
      } // getting center and scale the features (all)


      this.center = center;

      if (this.center) {
        this.means = features.mean('column');
        this.meansY = group.mean('column');
      } else {
        this.stdevs = null;
      }

      this.scale = scale;

      if (this.scale) {
        this.stdevs = features.standardDeviation('column');
        this.stdevsY = group.standardDeviation('column');
      } else {
        this.means = null;
      } // check and remove for features with sd = 0 TODO here
      // check opls.R line 70


      let folds;

      if (cvFolds.length > 0) {
        folds = cvFolds;
      } else {
        folds = getFolds(labels, 5);
      }

      let Q2 = [];
      this.model = [];
      this.tCV = [];
      this.tOrthCV = [];
      this.yHatCV = [];
      let oplsCV = [];
      let modelNC = []; // this code could be made more efficient by reverting the order of the loops
      // this is a legacy loop to be consistent with R code from MetaboMate package
      // this allows for having statistic (R2) from CV to decide wether to continue
      // with more latent structures

      let nc;

      for (nc = 0; nc < nComp; nc++) {
        let yHatk = new Matrix$2(group.rows, 1);
        let tPredk = new Matrix$2(group.rows, 1);
        let tOrthk = new Matrix$2(group.rows, 1);
        let oplsk = [];
        let f = 0;

        for (let fold of folds) {
          let trainTest = this._getTrainTest(features, group, fold);

          let testXk = trainTest.testFeatures;
          let Xk = trainTest.trainFeatures;
          let Yk = trainTest.trainLabels; // determine center and scale of training set

          let dataCenter = Xk.mean('column');
          let dataSD = Xk.standardDeviation('column'); // center and scale training set

          if (center) {
            Xk.center('column');
            Yk.center('column');
          }

          if (scale) {
            Xk.scale('column');
            Yk.scale('column');
          } // perform opls


          if (nc === 0) {
            oplsk[f] = OPLSNipals(Xk, Yk);
          } else {
            oplsk[f] = OPLSNipals(oplsCV[nc - 1][f].filteredX, Yk);
          } // store model for next component


          oplsCV[nc] = oplsk;
          let plsCV = new nipals(oplsk[f].filteredX, {
            Y: Yk
          }); // scaling the test dataset with respect to the train

          testXk.center('column', {
            center: dataCenter
          });
          testXk.scale('column', {
            scale: dataSD
          });
          let Eh = testXk; // removing the orthogonal components from PLS

          let scores;

          for (let idx = 0; idx < nc + 1; idx++) {
            scores = Eh.mmul(oplsCV[idx][f].weightsXOrtho.transpose()); // ok

            Eh.sub(scores.mmul(oplsCV[idx][f].loadingsXOrtho));
          } // prediction


          let tPred = Eh.mmul(plsCV.w.transpose()); // this should be summed over ncomp (pls_prediction.R line 23)

          let yHat = tPred.mmul(plsCV.betas); // ok
          // adding all prediction from all folds

          for (let i = 0; i < fold.testIndex.length; i++) {
            yHatk.setRow(fold.testIndex[i], [yHat.get(i, 0)]);
            tPredk.setRow(fold.testIndex[i], [tPred.get(i, 0)]);
            tOrthk.setRow(fold.testIndex[i], [scores.get(i, 0)]);
          }

          f++;
        } // end of loop over folds


        this.tCV.push(tPredk);
        this.tOrthCV.push(tOrthk);
        this.yHatCV.push(yHatk); // calculate Q2y for all the prediction (all folds)
        // ROC for DA is not implemented (check opls.R line 183) TODO

        if (this.mode === 'regression') {
          let tssy = tss(group.center('column').scale('column'));
          let press = tss(group.clone().sub(yHatk));
          let Q2y = 1 - press / tssy;
          Q2.push(Q2y);
        } else if (this.mode === 'discriminantAnalysis') {
          throw new Error('discriminant analysis is not yet supported');
        } // calculate the R2y for the complete data


        if (nc === 0) {
          modelNC = this._predictAll(features, group);
        } else {
          modelNC = this._predictAll(modelNC.xRes, group, options = {
            scale: false,
            center: false
          });
        } // adding the predictive statistics from CV


        modelNC.Q2y = Q2; // store the model for each component

        this.model.push(modelNC); // console.warn(`OPLS iteration over # of Components: ${nc + 1}`);
      } // end of loop over nc
      // store scores from CV


      let tCV = this.tCV;
      let tOrthCV = this.tOrthCV;
      let m = this.model[nc - 1];
      let XOrth = m.XOrth;
      let FeaturesCS = features.center('column').scale('column');
      let labelsCS = group.center('column').scale('column');
      let Xres = FeaturesCS.clone().sub(XOrth);
      let plsCall = new nipals(Xres, {
        Y: labelsCS
      });
      let E = Xres.clone().sub(plsCall.t.mmul(plsCall.p));
      let R2x = this.model.map(x => x.R2x);
      let R2y = this.model.map(x => x.R2y);
      this.output = {
        Q2y: Q2,
        R2x,
        R2y,
        tPred: m.plsC.t,
        pPred: m.plsC.p,
        wPred: m.plsC.w,
        betasPred: m.plsC.betas,
        Qpc: m.plsC.q,
        tCV,
        tOrthCV,
        tOrth: m.tOrth,
        pOrth: m.pOrth,
        wOrth: m.wOrth,
        XOrth,
        yHat: m.totalPred,
        Yres: m.plsC.yResidual,
        E
      };
    }
    /**
     * get access to all the computed elements
     * Mainly for debug and testing
     * @return {Object} output object
     */


    getLogs() {
      return this.output;
    }

    getScores() {
      let scoresX = this.tCV.map(x => x.to1DArray());
      let scoresY = this.tOrthCV.map(x => x.to1DArray());
      return {
        scoresX,
        scoresY
      };
    }
    /**
     * Load an OPLS model from JSON
     * @param {Object} model
     * @return {OPLS}
     */


    static load(model) {
      if (typeof model.name !== 'string') {
        throw new TypeError('model must have a name property');
      }

      if (model.name !== 'OPLS') {
        throw new RangeError(`invalid model: ${model.name}`);
      }

      return new OPLS(true, [], model);
    }
    /**
     * Export the current model to a JSON object
     * @return {Object} model
     */


    toJSON() {
      return {
        name: 'OPLS',
        center: this.center,
        scale: this.scale,
        means: this.means,
        stdevs: this.stdevs,
        model: this.model,
        tCV: this.tCV,
        tOrthCV: this.tOrthCV,
        yHatCV: this.yHatCV
      };
    }
    /**
     * Predict scores for new data
     * @param {Matrix} features - a matrix containing new data
     * @param {Object} [options]
     * @param {Array} [options.trueLabel] - an array with true values to compute confusion matrix
     * @param {Number} [options.nc] - the number of components to be used
     * @return {Object} - predictions
     */


    predict(newData, options = {}) {
      let {
        trueLabels = [],
        nc = 1
      } = options;
      let labels = [];

      if (trueLabels.length > 0) {
        trueLabels = Matrix$2.from1DArray(trueLabels.length, 1, trueLabels);
        labels = trueLabels.clone();
      }

      let features = newData.clone(); // scaling the test dataset with respect to the train

      if (this.center) {
        features.center('column', {
          center: this.means
        });

        if (labels.rows > 0 && this.mode === 'regression') {
          labels.center('column', {
            center: this.meansY
          });
        }
      }

      if (this.scale) {
        features.scale('column', {
          scale: this.stdevs
        });

        if (labels.rows > 0 && this.mode === 'regression') {
          labels.scale('column', {
            scale: this.stdevsY
          });
        }
      }

      let Eh = features.clone(); // removing the orthogonal components from PLS

      let tOrth;
      let wOrth;
      let pOrth;
      let yHat;
      let tPred;

      for (let idx = 0; idx < nc; idx++) {
        wOrth = this.model[idx].wOrth.transpose();
        pOrth = this.model[idx].pOrth;
        tOrth = Eh.mmul(wOrth);
        Eh.sub(tOrth.mmul(pOrth)); // prediction

        tPred = Eh.mmul(this.model[idx].plsC.w.transpose()); // this should be summed over ncomp (pls_prediction.R line 23)

        yHat = tPred.mmul(this.model[idx].plsC.betas);
      }

      if (labels.rows > 0) {
        if (this.mode === 'regression') {
          let tssy = tss(labels);
          let press = tss(labels.clone().sub(yHat));
          let Q2y = 1 - press / tssy;
          return {
            tPred,
            tOrth,
            yHat,
            Q2y
          };
        } else if (this.mode === 'discriminantAnalysis') {
          let confusionMatrix = [];
          confusionMatrix = ConfusionMatrix.fromLabels(trueLabels.to1DArray(), yHat.to1DArray());
          return {
            tPred,
            tOrth,
            yHat,
            confusionMatrix
          };
        }
      } else {
        return {
          tPred,
          tOrth,
          yHat
        };
      }
    }

    _predictAll(features, labels, options = {}) {
      // cannot use the global this.center here
      // since it is used in the NC loop and
      // centering and scaling should only be
      // performed once
      const {
        center = true,
        scale = true
      } = options;

      if (center) {
        features.center('column');
        labels.center('column');
      }

      if (scale) {
        features.scale('column');
        labels.scale('column'); // reevaluate tssy and tssx after scaling
        // must be global because re-used for next nc iteration
        // tssx is only evaluate the first time

        this.tssy = tss(labels);
        this.tssx = tss(features);
      }

      let oplsC = OPLSNipals(features, labels);
      let plsC = new nipals(oplsC.filteredX, {
        Y: labels
      });
      let tPred = oplsC.filteredX.mmul(plsC.w.transpose());
      let yHat = tPred.mmul(plsC.betas);
      let rss = tss(labels.clone().sub(yHat));
      let R2y = 1 - rss / this.tssy;
      let xEx = plsC.t.mmul(plsC.p);
      let rssx = tss(xEx);
      let R2x = rssx / this.tssx;
      return {
        R2y,
        R2x,
        xRes: oplsC.filteredX,
        tOrth: oplsC.scoresXOrtho,
        pOrth: oplsC.loadingsXOrtho,
        wOrth: oplsC.weightsXOrtho,
        tPred: tPred,
        totalPred: yHat,
        XOrth: oplsC.scoresXOrtho.mmul(oplsC.loadingsXOrtho),
        oplsC,
        plsC
      };
    }
    /**
     *
     * @param {*} X - dataset matrix object
     * @param {*} group - labels matrix object
     * @param {*} index - train and test index (output from getFold())
     */


    _getTrainTest(X, group, index) {
      let testFeatures = new Matrix$2(index.testIndex.length, X.columns);
      let testLabels = new Matrix$2(index.testIndex.length, 1);
      index.testIndex.forEach((el, idx) => {
        testFeatures.setRow(idx, X.getRow(el));
        testLabels.setRow(idx, group.getRow(el));
      });
      let trainFeatures = new Matrix$2(index.trainIndex.length, X.columns);
      let trainLabels = new Matrix$2(index.trainIndex.length, 1);
      index.trainIndex.forEach((el, idx) => {
        trainFeatures.setRow(idx, X.getRow(el));
        trainLabels.setRow(idx, group.getRow(el));
      });
      return {
        trainFeatures,
        testFeatures,
        trainLabels,
        testLabels
      };
    }

  }

  var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(MatrixLib);

  function logistic(val) {
    return 1 / (1 + Math.exp(-val));
  }

  function expELU(val, param) {
    return val < 0 ? param * (Math.exp(val) - 1) : val;
  }

  function softExponential(val, param) {
    if (param < 0) {
      return -Math.log(1 - param * (val + param)) / param;
    }

    if (param > 0) {
      return (Math.exp(param * val) - 1) / param + param;
    }

    return val;
  }

  function softExponentialPrime(val, param) {
    if (param < 0) {
      return 1 / (1 - param * (param + val));
    } else {
      return Math.exp(param * val);
    }
  }

  const ACTIVATION_FUNCTIONS = {
    tanh: {
      activation: Math.tanh,
      derivate: val => 1 - val * val
    },
    identity: {
      activation: val => val,
      derivate: () => 1
    },
    logistic: {
      activation: logistic,
      derivate: val => logistic(val) * (1 - logistic(val))
    },
    arctan: {
      activation: Math.atan,
      derivate: val => 1 / (val * val + 1)
    },
    softsign: {
      activation: val => val / (1 + Math.abs(val)),
      derivate: val => 1 / ((1 + Math.abs(val)) * (1 + Math.abs(val)))
    },
    relu: {
      activation: val => val < 0 ? 0 : val,
      derivate: val => val < 0 ? 0 : 1
    },
    softplus: {
      activation: val => Math.log(1 + Math.exp(val)),
      derivate: val => 1 / (1 + Math.exp(-val))
    },
    bent: {
      activation: val => (Math.sqrt(val * val + 1) - 1) / 2 + val,
      derivate: val => val / (2 * Math.sqrt(val * val + 1)) + 1
    },
    sinusoid: {
      activation: Math.sin,
      derivate: Math.cos
    },
    sinc: {
      activation: val => val === 0 ? 1 : Math.sin(val) / val,
      derivate: val => val === 0 ? 0 : Math.cos(val) / val - Math.sin(val) / (val * val)
    },
    gaussian: {
      activation: val => Math.exp(-(val * val)),
      derivate: val => -2 * val * Math.exp(-(val * val))
    },
    'parametric-relu': {
      activation: (val, param) => val < 0 ? param * val : val,
      derivate: (val, param) => val < 0 ? param : 1
    },
    'exponential-elu': {
      activation: expELU,
      derivate: (val, param) => val < 0 ? expELU(val, param) + param : 1
    },
    'soft-exponential': {
      activation: softExponential,
      derivate: softExponentialPrime
    }
  };

  class Layer {
    /**
       * @private
       * Create a new layer with the given options
       * @param {object} options
       * @param {number} [options.inputSize] - Number of conections that enter the neurons.
       * @param {number} [options.outputSize] - Number of conections that leave the neurons.
       * @param {number} [options.regularization] - Regularization parameter.
       * @param {number} [options.epsilon] - Learning rate parameter.
       * @param {string} [options.activation] - Activation function parameter from the FeedForwardNeuralNetwork class.
       * @param {number} [options.activationParam] - Activation parameter if needed.
       */
    constructor(options) {
      this.inputSize = options.inputSize;
      this.outputSize = options.outputSize;
      this.regularization = options.regularization;
      this.epsilon = options.epsilon;
      this.activation = options.activation;
      this.activationParam = options.activationParam;
      var selectedFunction = ACTIVATION_FUNCTIONS[options.activation];
      var params = selectedFunction.activation.length;
      var actFunction = params > 1 ? val => selectedFunction.activation(val, options.activationParam) : selectedFunction.activation;
      var derFunction = params > 1 ? val => selectedFunction.derivate(val, options.activationParam) : selectedFunction.derivate;

      this.activationFunction = function (i, j) {
        this.set(i, j, actFunction(this.get(i, j)));
      };

      this.derivate = function (i, j) {
        this.set(i, j, derFunction(this.get(i, j)));
      };

      if (options.model) {
        // load model
        this.W = require$$0$1.Matrix.checkMatrix(options.W);
        this.b = require$$0$1.Matrix.checkMatrix(options.b);
      } else {
        // default constructor
        this.W = require$$0$1.Matrix.rand(this.inputSize, this.outputSize);
        this.b = require$$0$1.Matrix.zeros(1, this.outputSize);
        this.W.apply(function (i, j) {
          this.set(i, j, this.get(i, j) / Math.sqrt(options.inputSize));
        });
      }
    }
    /**
       * @private
       * propagate the given input through the current layer.
       * @param {Matrix} X - input.
       * @return {Matrix} output at the current layer.
       */


    forward(X) {
      var z = X.mmul(this.W).addRowVector(this.b);
      z.apply(this.activationFunction);
      this.a = z.clone();
      return z;
    }
    /**
       * @private
       * apply backpropagation algorithm at the current layer
       * @param {Matrix} delta - delta values estimated at the following layer.
       * @param {Matrix} a - 'a' values from the following layer.
       * @return {Matrix} the new delta values for the next layer.
       */


    backpropagation(delta, a) {
      this.dW = a.transpose().mmul(delta);
      this.db = require$$0$1.Matrix.rowVector(delta.sum('column'));
      var aCopy = a.clone();
      return delta.mmul(this.W.transpose()).mul(aCopy.apply(this.derivate));
    }
    /**
       * @private
       * Function that updates the weights at the current layer with the derivatives.
       */


    update() {
      this.dW.add(this.W.clone().mul(this.regularization));
      this.W.add(this.dW.mul(-this.epsilon));
      this.b.add(this.db.mul(-this.epsilon));
    }
    /**
       * @private
       * Export the current layer to JSON.
       * @return {object} model
       */


    toJSON() {
      return {
        model: 'Layer',
        inputSize: this.inputSize,
        outputSize: this.outputSize,
        regularization: this.regularization,
        epsilon: this.epsilon,
        activation: this.activation,
        W: this.W,
        b: this.b
      };
    }
    /**
       * @private
       * Creates a new Layer with the given model.
       * @param {object} model
       * @return {Layer}
       */


    static load(model) {
      if (model.model !== 'Layer') {
        throw new RangeError('the current model is not a Layer model');
      }

      return new Layer(model);
    }

  }

  class OutputLayer extends Layer {
    constructor(options) {
      super(options);

      this.activationFunction = function (i, j) {
        this.set(i, j, Math.exp(this.get(i, j)));
      };
    }

    static load(model) {
      if (model.model !== 'Layer') {
        throw new RangeError('the current model is not a Layer model');
      }

      return new OutputLayer(model);
    }

  }

  class FeedForwardNeuralNetworks {
    /**
     * Create a new Feedforward neural network model.
     * @class FeedForwardNeuralNetworks
     * @param {object} [options]
     * @param {Array} [options.hiddenLayers=[10]] - Array that contains the sizes of the hidden layers.
     * @param {number} [options.iterations=50] - Number of iterations at the training step.
     * @param {number} [options.learningRate=0.01] - Learning rate of the neural net (also known as epsilon).
     * @param {number} [options.regularization=0.01] - Regularization parameter af the neural net.
     * @param {string} [options.activation='tanh'] - activation function to be used. (options: 'tanh'(default),
     * 'identity', 'logistic', 'arctan', 'softsign', 'relu', 'softplus', 'bent', 'sinusoid', 'sinc', 'gaussian').
     * (single-parametric options: 'parametric-relu', 'exponential-relu', 'soft-exponential').
     * @param {number} [options.activationParam=1] - if the selected activation function needs a parameter.
     */
    constructor(options) {
      options = options || {};

      if (options.model) {
        // load network
        this.hiddenLayers = options.hiddenLayers;
        this.iterations = options.iterations;
        this.learningRate = options.learningRate;
        this.regularization = options.regularization;
        this.dicts = options.dicts;
        this.activation = options.activation;
        this.activationParam = options.activationParam;
        this.model = new Array(options.layers.length);

        for (var i = 0; i < this.model.length - 1; ++i) {
          this.model[i] = Layer.load(options.layers[i]);
        }

        this.model[this.model.length - 1] = OutputLayer.load(options.layers[this.model.length - 1]);
      } else {
        // default constructor
        this.hiddenLayers = options.hiddenLayers || [10];
        this.iterations = options.iterations || 50;
        this.learningRate = options.learningRate || 0.01;
        this.regularization = options.regularization || 0.01;
        this.activation = options.activation || 'tanh';
        this.activationParam = options.activationParam || 1;

        if (!(this.activation in Object.keys(ACTIVATION_FUNCTIONS))) {
          this.activation = 'tanh';
        }
      }
    }
    /**
     * @private
     * Function that build and initialize the neural net.
     * @param {number} inputSize - total of features to fit.
     * @param {number} outputSize - total of labels of the prediction set.
     */


    buildNetwork(inputSize, outputSize) {
      var size = 2 + (this.hiddenLayers.length - 1);
      this.model = new Array(size); // input layer

      this.model[0] = new Layer({
        inputSize: inputSize,
        outputSize: this.hiddenLayers[0],
        activation: this.activation,
        activationParam: this.activationParam,
        regularization: this.regularization,
        epsilon: this.learningRate
      }); // hidden layers

      for (var i = 1; i < this.hiddenLayers.length; ++i) {
        this.model[i] = new Layer({
          inputSize: this.hiddenLayers[i - 1],
          outputSize: this.hiddenLayers[i],
          activation: this.activation,
          activationParam: this.activationParam,
          regularization: this.regularization,
          epsilon: this.learningRate
        });
      } // output layer


      this.model[size - 1] = new OutputLayer({
        inputSize: this.hiddenLayers[this.hiddenLayers.length - 1],
        outputSize: outputSize,
        activation: this.activation,
        activationParam: this.activationParam,
        regularization: this.regularization,
        epsilon: this.learningRate
      });
    }
    /**
     * Train the neural net with the given features and labels.
     * @param {Matrix|Array} features
     * @param {Matrix|Array} labels
     */


    train(features, labels) {
      features = require$$0$1.Matrix.checkMatrix(features);
      this.dicts = dictOutputs(labels);
      var inputSize = features.columns;
      var outputSize = Object.keys(this.dicts.inputs).length;

      if (!this.model) {
        this.buildNetwork(inputSize, outputSize);
      }

      for (var i = 0; i < this.iterations; ++i) {
        var probabilities = this.propagate(features);
        this.backpropagation(features, labels, probabilities);
      }
    }
    /**
     * @private
     * Propagate the input(training set) and retrives the probabilities of each class.
     * @param {Matrix} X
     * @return {Matrix} probabilities of each class.
     */


    propagate(X) {
      var input = X;

      for (var i = 0; i < this.model.length; ++i) {
        input = this.model[i].forward(input);
      } // get probabilities


      return input.divColumnVector(input.sum('row'));
    }
    /**
     * @private
     * Function that applies the backpropagation algorithm on each layer of the network
     * in order to fit the features and labels.
     * @param {Matrix} features
     * @param {Array} labels
     * @param {Matrix} probabilities - probabilities of each class of the feature set.
     */


    backpropagation(features, labels, probabilities) {
      for (var i = 0; i < probabilities.rows; ++i) {
        probabilities.set(i, this.dicts.inputs[labels[i]], probabilities.get(i, this.dicts.inputs[labels[i]]) - 1);
      } // remember, the last delta doesn't matter


      var delta = probabilities;

      for (i = this.model.length - 1; i >= 0; --i) {
        var a = i > 0 ? this.model[i - 1].a : features;
        delta = this.model[i].backpropagation(delta, a);
      }

      for (i = 0; i < this.model.length; ++i) {
        this.model[i].update();
      }
    }
    /**
     * Predict the output given the feature set.
     * @param {Array|Matrix} features
     * @return {Array}
     */


    predict(features) {
      features = require$$0$1.Matrix.checkMatrix(features);
      var outputs = new Array(features.rows);
      var probabilities = this.propagate(features);

      for (var i = 0; i < features.rows; ++i) {
        outputs[i] = this.dicts.outputs[probabilities.maxRowIndex(i)[1]];
      }

      return outputs;
    }
    /**
     * Export the current model to JSON.
     * @return {object} model
     */


    toJSON() {
      var model = {
        model: 'FNN',
        hiddenLayers: this.hiddenLayers,
        iterations: this.iterations,
        learningRate: this.learningRate,
        regularization: this.regularization,
        activation: this.activation,
        activationParam: this.activationParam,
        dicts: this.dicts,
        layers: new Array(this.model.length)
      };

      for (var i = 0; i < this.model.length; ++i) {
        model.layers[i] = this.model[i].toJSON();
      }

      return model;
    }
    /**
     * Load a Feedforward Neural Network with the current model.
     * @param {object} model
     * @return {FeedForwardNeuralNetworks}
     */


    static load(model) {
      if (model.model !== 'FNN') {
        throw new RangeError('the current model is not a feed forward network');
      }

      return new FeedForwardNeuralNetworks(model);
    }

  }
  /**
   * @private
   * Method that given an array of labels(predictions), returns two dictionaries, one to transform from labels to
   * numbers and other in the reverse way
   * @param {Array} array
   * @return {object}
   */


  function dictOutputs(array) {
    var inputs = {};
    var outputs = {};
    var index = 0;

    for (var i = 0; i < array.length; i += 1) {
      if (inputs[array[i]] === undefined) {
        inputs[array[i]] = index;
        outputs[index] = array[i];
        index++;
      }
    }

    return {
      inputs: inputs,
      outputs: outputs
    };
  }

  var FeedForwardNeuralNetwork = FeedForwardNeuralNetworks;

  function NodeSquare(x, y, weights, som) {
    this.x = x;
    this.y = y;
    this.weights = weights;
    this.som = som;
    this.neighbors = {};
  }

  NodeSquare.prototype.adjustWeights = function adjustWeights(target, learningRate, influence) {
    for (var i = 0, ii = this.weights.length; i < ii; i++) {
      this.weights[i] += learningRate * influence * (target[i] - this.weights[i]);
    }
  };

  NodeSquare.prototype.getDistance = function getDistance(otherNode) {
    return Math.max(Math.abs(this.x - otherNode.x), Math.abs(this.y - otherNode.y));
  };

  NodeSquare.prototype.getDistanceTorus = function getDistanceTorus(otherNode) {
    var distX = Math.abs(this.x - otherNode.x),
        distY = Math.abs(this.y - otherNode.y);
    return Math.max(Math.min(distX, this.som.gridDim.x - distX), Math.min(distY, this.som.gridDim.y - distY));
  };

  NodeSquare.prototype.getNeighbors = function getNeighbors(xy) {
    if (!this.neighbors[xy]) {
      this.neighbors[xy] = new Array(2); // left or bottom neighbor

      var v;

      if (this[xy] > 0) {
        v = this[xy] - 1;
      } else if (this.som.torus) {
        v = this.som.gridDim[xy] - 1;
      }

      if (typeof v !== 'undefined') {
        var x, y;

        if (xy === 'x') {
          x = v;
          y = this.y;
        } else {
          x = this.x;
          y = v;
        }

        this.neighbors[xy][0] = this.som.nodes[x][y];
      } // top or right neighbor


      var w;

      if (this[xy] < this.som.gridDim[xy] - 1) {
        w = this[xy] + 1;
      } else if (this.som.torus) {
        w = 0;
      }

      if (typeof w !== 'undefined') {
        if (xy === 'x') {
          x = w;
          y = this.y;
        } else {
          x = this.x;
          y = w;
        }

        this.neighbors[xy][1] = this.som.nodes[x][y];
      }
    }

    return this.neighbors[xy];
  };

  NodeSquare.prototype.getPos = function getPos(xy, element) {
    var neighbors = this.getNeighbors(xy),
        distance = this.som.distance,
        bestNeighbor,
        direction;

    if (neighbors[0]) {
      if (neighbors[1]) {
        var dist1 = distance(element, neighbors[0].weights),
            dist2 = distance(element, neighbors[1].weights);

        if (dist1 < dist2) {
          bestNeighbor = neighbors[0];
          direction = -1;
        } else {
          bestNeighbor = neighbors[1];
          direction = 1;
        }
      } else {
        bestNeighbor = neighbors[0];
        direction = -1;
      }
    } else {
      bestNeighbor = neighbors[1];
      direction = 1;
    }

    var simA = 1 - distance(element, this.weights),
        simB = 1 - distance(element, bestNeighbor.weights);
    var factor = (simA - simB) / (2 - simA - simB);
    return 0.5 + 0.5 * factor * direction;
  };

  NodeSquare.prototype.getPosition = function getPosition(element) {
    return [this.getPos('x', element), this.getPos('y', element)];
  };

  var nodeSquare = NodeSquare;

  function NodeHexagonal(x, y, weights, som) {
    nodeSquare.call(this, x, y, weights, som);
    this.hX = x - Math.floor(y / 2);
    this.z = 0 - this.hX - y;
  }

  NodeHexagonal.prototype = new nodeSquare();
  NodeHexagonal.prototype.constructor = NodeHexagonal;

  NodeHexagonal.prototype.getDistance = function getDistanceHexagonal(otherNode) {
    return Math.max(Math.abs(this.hX - otherNode.hX), Math.abs(this.y - otherNode.y), Math.abs(this.z - otherNode.z));
  };

  NodeHexagonal.prototype.getDistanceTorus = function getDistanceTorus(otherNode) {
    var distX = Math.abs(this.hX - otherNode.hX),
        distY = Math.abs(this.y - otherNode.y),
        distZ = Math.abs(this.z - otherNode.z);
    return Math.max(Math.min(distX, this.som.gridDim.x - distX), Math.min(distY, this.som.gridDim.y - distY), Math.min(distZ, this.som.gridDim.z - distZ));
  };

  NodeHexagonal.prototype.getPosition = function getPosition() {
    throw new Error('Unimplemented : cannot get position of the points for hexagonal grid');
  };

  var nodeHexagonal = NodeHexagonal;

  var defaultOptions$b = {
    fields: 3,
    randomizer: Math.random,
    distance: squareEuclidean,
    iterations: 10,
    learningRate: 0.1,
    gridType: 'rect',
    torus: true,
    method: 'random'
  };

  function SOM(x, y, options, reload) {
    this.x = x;
    this.y = y;
    options = options || {};
    this.options = {};

    for (var i in defaultOptions$b) {
      if (options.hasOwnProperty(i)) {
        this.options[i] = options[i];
      } else {
        this.options[i] = defaultOptions$b[i];
      }
    }

    if (typeof this.options.fields === 'number') {
      this.numWeights = this.options.fields;
    } else if (Array.isArray(this.options.fields)) {
      this.numWeights = this.options.fields.length;
      var converters = getConverters(this.options.fields);
      this.extractor = converters.extractor;
      this.creator = converters.creator;
    } else {
      throw new Error('Invalid fields definition');
    }

    if (this.options.gridType === 'rect') {
      this.nodeType = nodeSquare;
      this.gridDim = {
        x: x,
        y: y
      };
    } else {
      this.nodeType = nodeHexagonal;
      var hx = this.x - Math.floor(this.y / 2);
      this.gridDim = {
        x: hx,
        y: this.y,
        z: -(0 - hx - this.y)
      };
    }

    this.torus = this.options.torus;
    this.distanceMethod = this.torus ? 'getDistanceTorus' : 'getDistance';
    this.distance = this.options.distance;
    this.maxDistance = getMaxDistance(this.distance, this.numWeights);

    if (reload === true) {
      // For model loading
      this.done = true;
      return;
    }

    if (!(x > 0 && y > 0)) {
      throw new Error('x and y must be positive');
    }

    this.times = {
      findBMU: 0,
      adjust: 0
    };
    this.randomizer = this.options.randomizer;
    this.iterationCount = 0;
    this.iterations = this.options.iterations;
    this.startLearningRate = this.learningRate = this.options.learningRate;
    this.mapRadius = Math.floor(Math.max(x, y) / 2);
    this.algorithmMethod = this.options.method;

    this._initNodes();

    this.done = false;
  }

  SOM.load = function loadModel(model, distance) {
    if (model.name === 'SOM') {
      var x = model.data.length,
          y = model.data[0].length;

      if (distance) {
        model.options.distance = distance;
      } else if (model.options.distance) {
        model.options.distance = eval('(' + model.options.distance + ')');
      }

      var som = new SOM(x, y, model.options, true);
      som.nodes = new Array(x);

      for (var i = 0; i < x; i++) {
        som.nodes[i] = new Array(y);

        for (var j = 0; j < y; j++) {
          som.nodes[i][j] = new som.nodeType(i, j, model.data[i][j], som);
        }
      }

      return som;
    } else {
      throw new Error('expecting a SOM model');
    }
  };

  SOM.prototype.export = function exportModel(includeDistance) {
    if (!this.done) {
      throw new Error('model is not ready yet');
    }

    var model = {
      name: 'SOM'
    };
    model.options = {
      fields: this.options.fields,
      gridType: this.options.gridType,
      torus: this.options.torus
    };
    model.data = new Array(this.x);

    for (var i = 0; i < this.x; i++) {
      model.data[i] = new Array(this.y);

      for (var j = 0; j < this.y; j++) {
        model.data[i][j] = this.nodes[i][j].weights;
      }
    }

    if (includeDistance) {
      model.options.distance = this.distance.toString();
    }

    return model;
  };

  SOM.prototype._initNodes = function initNodes() {
    var now = Date.now(),
        i,
        j,
        k;
    this.nodes = new Array(this.x);

    for (i = 0; i < this.x; i++) {
      this.nodes[i] = new Array(this.y);

      for (j = 0; j < this.y; j++) {
        var weights = new Array(this.numWeights);

        for (k = 0; k < this.numWeights; k++) {
          weights[k] = this.randomizer();
        }

        this.nodes[i][j] = new this.nodeType(i, j, weights, this);
      }
    }

    this.times.initNodes = Date.now() - now;
  };

  SOM.prototype.setTraining = function setTraining(trainingSet) {
    if (this.trainingSet) {
      throw new Error('training set has already been set');
    }

    var now = Date.now();
    var convertedSet = trainingSet;
    var i,
        l = trainingSet.length;

    if (this.extractor) {
      convertedSet = new Array(l);

      for (i = 0; i < l; i++) {
        convertedSet[i] = this.extractor(trainingSet[i]);
      }
    }

    this.numIterations = this.iterations * l;

    if (this.algorithmMethod === 'random') {
      this.timeConstant = this.numIterations / Math.log(this.mapRadius);
    } else {
      this.timeConstant = l / Math.log(this.mapRadius);
    }

    this.trainingSet = convertedSet;
    this.times.setTraining = Date.now() - now;
  };

  SOM.prototype.trainOne = function trainOne() {
    if (this.done) {
      return false;
    } else if (this.numIterations-- > 0) {
      var neighbourhoodRadius, trainingValue, trainingSetFactor;

      if (this.algorithmMethod === 'random') {
        // Pick a random value of the training set at each step
        neighbourhoodRadius = this.mapRadius * Math.exp(-this.iterationCount / this.timeConstant);
        trainingValue = getRandomValue(this.trainingSet, this.randomizer);

        this._adjust(trainingValue, neighbourhoodRadius);

        this.learningRate = this.startLearningRate * Math.exp(-this.iterationCount / this.numIterations);
      } else {
        // Get next input vector
        trainingSetFactor = -Math.floor(this.iterationCount / this.trainingSet.length);
        neighbourhoodRadius = this.mapRadius * Math.exp(trainingSetFactor / this.timeConstant);
        trainingValue = this.trainingSet[this.iterationCount % this.trainingSet.length];

        this._adjust(trainingValue, neighbourhoodRadius);

        if ((this.iterationCount + 1) % this.trainingSet.length === 0) {
          this.learningRate = this.startLearningRate * Math.exp(trainingSetFactor / Math.floor(this.numIterations / this.trainingSet.length));
        }
      }

      this.iterationCount++;
      return true;
    } else {
      this.done = true;
      return false;
    }
  };

  SOM.prototype._adjust = function adjust(trainingValue, neighbourhoodRadius) {
    var now = Date.now(),
        x,
        y,
        dist,
        influence;

    var bmu = this._findBestMatchingUnit(trainingValue);

    var now2 = Date.now();
    this.times.findBMU += now2 - now;
    var radiusLimit = Math.floor(neighbourhoodRadius);
    var xMin = bmu.x - radiusLimit,
        xMax = bmu.x + radiusLimit,
        yMin = bmu.y - radiusLimit,
        yMax = bmu.y + radiusLimit;

    for (x = xMin; x <= xMax; x++) {
      var theX = x;

      if (x < 0) {
        theX += this.x;
      } else if (x >= this.x) {
        theX -= this.x;
      }

      for (y = yMin; y <= yMax; y++) {
        var theY = y;

        if (y < 0) {
          theY += this.y;
        } else if (y >= this.y) {
          theY -= this.y;
        }

        dist = bmu[this.distanceMethod](this.nodes[theX][theY]);

        if (dist < neighbourhoodRadius) {
          influence = Math.exp(-dist / (2 * neighbourhoodRadius));
          this.nodes[theX][theY].adjustWeights(trainingValue, this.learningRate, influence);
        }
      }
    }

    this.times.adjust += Date.now() - now2;
  };

  SOM.prototype.train = function train(trainingSet) {
    if (!this.done) {
      this.setTraining(trainingSet);

      while (this.trainOne()) {}
    }
  };

  SOM.prototype.getConvertedNodes = function getConvertedNodes() {
    var result = new Array(this.x);

    for (var i = 0; i < this.x; i++) {
      result[i] = new Array(this.y);

      for (var j = 0; j < this.y; j++) {
        var node = this.nodes[i][j];
        result[i][j] = this.creator ? this.creator(node.weights) : node.weights;
      }
    }

    return result;
  };

  SOM.prototype._findBestMatchingUnit = function findBestMatchingUnit(candidate) {
    var bmu,
        lowest = Infinity,
        dist;

    for (var i = 0; i < this.x; i++) {
      for (var j = 0; j < this.y; j++) {
        dist = this.distance(this.nodes[i][j].weights, candidate);

        if (dist < lowest) {
          lowest = dist;
          bmu = this.nodes[i][j];
        }
      }
    }

    return bmu;
  };

  SOM.prototype.predict = function predict(data, computePosition) {
    if (typeof data === 'boolean') {
      computePosition = data;
      data = null;
    }

    if (!data) {
      data = this.trainingSet;
    }

    if (Array.isArray(data) && (Array.isArray(data[0]) || typeof data[0] === 'object')) {
      // predict a dataset
      var self = this;
      return data.map(function (element) {
        return self._predict(element, computePosition);
      });
    } else {
      // predict a single element
      return this._predict(data, computePosition);
    }
  };

  SOM.prototype._predict = function _predict(element, computePosition) {
    if (!Array.isArray(element)) {
      element = this.extractor(element);
    }

    var bmu = this._findBestMatchingUnit(element);

    var result = [bmu.x, bmu.y];

    if (computePosition) {
      result[2] = bmu.getPosition(element);
    }

    return result;
  }; // As seen in http://www.scholarpedia.org/article/Kohonen_network


  SOM.prototype.getQuantizationError = function getQuantizationError() {
    var fit = this.getFit(),
        l = fit.length,
        sum = 0;

    for (var i = 0; i < l; i++) {
      sum += fit[i];
    }

    return sum / l;
  };

  SOM.prototype.getFit = function getFit(dataset) {
    if (!dataset) {
      dataset = this.trainingSet;
    }

    var l = dataset.length,
        bmu,
        result = new Array(l);

    for (var i = 0; i < l; i++) {
      bmu = this._findBestMatchingUnit(dataset[i]);
      result[i] = Math.sqrt(this.distance(dataset[i], bmu.weights));
    }

    return result;
  };

  function getConverters(fields) {
    var l = fields.length,
        normalizers = new Array(l),
        denormalizers = new Array(l);

    for (var i = 0; i < l; i++) {
      normalizers[i] = getNormalizer(fields[i].range);
      denormalizers[i] = getDenormalizer(fields[i].range);
    }

    return {
      extractor: function extractor(value) {
        var result = new Array(l);

        for (var i = 0; i < l; i++) {
          result[i] = normalizers[i](value[fields[i].name]);
        }

        return result;
      },
      creator: function creator(value) {
        var result = {};

        for (var i = 0; i < l; i++) {
          result[fields[i].name] = denormalizers[i](value[i]);
        }

        return result;
      }
    };
  }

  function getNormalizer(minMax) {
    return function normalizer(value) {
      return (value - minMax[0]) / (minMax[1] - minMax[0]);
    };
  }

  function getDenormalizer(minMax) {
    return function denormalizer(value) {
      return minMax[0] + value * (minMax[1] - minMax[0]);
    };
  }

  function squareEuclidean(a, b) {
    var d = 0;

    for (var i = 0, ii = a.length; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]);
    }

    return d;
  }

  function getRandomValue(arr, randomizer) {
    return arr[Math.floor(randomizer() * arr.length)];
  }

  function getMaxDistance(distance, numWeights) {
    var zero = new Array(numWeights),
        one = new Array(numWeights);

    for (var i = 0; i < numWeights; i++) {
      zero[i] = 0;
      one[i] = 1;
    }

    return distance(zero, one);
  }

  var src$3 = SOM;

  function maybeToPrecision(value, digits) {
    if (value < 0) {
      value = 0 - value;

      if (typeof digits === 'number') {
        return `- ${value.toPrecision(digits)}`;
      } else {
        return `- ${value.toString()}`;
      }
    } else {
      if (typeof digits === 'number') {
        return value.toPrecision(digits);
      } else {
        return value.toString();
      }
    }
  }

  function checkArraySize(x, y) {
    if (!isAnyArray(x) || !isAnyArray(y)) {
      throw new TypeError('x and y must be arrays');
    }

    if (x.length !== y.length) {
      throw new RangeError('x and y arrays must have the same length');
    }
  }

  class BaseRegression {
    constructor() {
      if (new.target === BaseRegression) {
        throw new Error('BaseRegression must be subclassed');
      }
    }

    predict(x) {
      if (typeof x === 'number') {
        return this._predict(x);
      } else if (isAnyArray(x)) {
        const y = [];

        for (let i = 0; i < x.length; i++) {
          y.push(this._predict(x[i]));
        }

        return y;
      } else {
        throw new TypeError('x must be a number or array');
      }
    }

    _predict() {
      throw new Error('_predict must be implemented');
    }

    train() {// Do nothing for this package
    }

    toString() {
      return '';
    }

    toLaTeX() {
      return '';
    }
    /**
     * Return the correlation coefficient of determination (r) and chi-square.
     * @param {Array<number>} x
     * @param {Array<number>} y
     * @return {object}
     */


    score(x, y) {
      if (!isAnyArray(x) || !isAnyArray(y) || x.length !== y.length) {
        throw new Error('x and y must be arrays of the same length');
      }

      const n = x.length;
      const y2 = new Array(n);

      for (let i = 0; i < n; i++) {
        y2[i] = this._predict(x[i]);
      }

      let xSum = 0;
      let ySum = 0;
      let chi2 = 0;
      let rmsd = 0;
      let xSquared = 0;
      let ySquared = 0;
      let xY = 0;

      for (let i = 0; i < n; i++) {
        xSum += y2[i];
        ySum += y[i];
        xSquared += y2[i] * y2[i];
        ySquared += y[i] * y[i];
        xY += y2[i] * y[i];

        if (y[i] !== 0) {
          chi2 += (y[i] - y2[i]) * (y[i] - y2[i]) / y[i];
        }

        rmsd += (y[i] - y2[i]) * (y[i] - y2[i]);
      }

      const r = (n * xY - xSum * ySum) / Math.sqrt((n * xSquared - xSum * xSum) * (n * ySquared - ySum * ySum));
      return {
        r: r,
        r2: r * r,
        chi2: chi2,
        rmsd: Math.sqrt(rmsd / n)
      };
    }

  }

  class PolynomialRegression extends BaseRegression {
    constructor(x, y, degree) {
      super();

      if (x === true) {
        this.degree = y.degree;
        this.powers = y.powers;
        this.coefficients = y.coefficients;
      } else {
        checkArraySize(x, y);
        regress$3(this, x, y, degree);
      }
    }

    _predict(x) {
      let y = 0;

      for (let k = 0; k < this.powers.length; k++) {
        y += this.coefficients[k] * Math.pow(x, this.powers[k]);
      }

      return y;
    }

    toJSON() {
      return {
        name: 'polynomialRegression',
        degree: this.degree,
        powers: this.powers,
        coefficients: this.coefficients
      };
    }

    toString(precision) {
      return this._toFormula(precision, false);
    }

    toLaTeX(precision) {
      return this._toFormula(precision, true);
    }

    _toFormula(precision, isLaTeX) {
      let sup = '^';
      let closeSup = '';
      let times = ' * ';

      if (isLaTeX) {
        sup = '^{';
        closeSup = '}';
        times = '';
      }

      let fn = '';
      let str = '';

      for (let k = 0; k < this.coefficients.length; k++) {
        str = '';

        if (this.coefficients[k] !== 0) {
          if (this.powers[k] === 0) {
            str = maybeToPrecision(this.coefficients[k], precision);
          } else {
            if (this.powers[k] === 1) {
              str = `${maybeToPrecision(this.coefficients[k], precision) + times}x`;
            } else {
              str = `${maybeToPrecision(this.coefficients[k], precision) + times}x${sup}${this.powers[k]}${closeSup}`;
            }
          }

          if (this.coefficients[k] > 0 && k !== this.coefficients.length - 1) {
            str = ` + ${str}`;
          } else if (k !== this.coefficients.length - 1) {
            str = ` ${str}`;
          }
        }

        fn = str + fn;
      }

      if (fn.charAt(0) === '+') {
        fn = fn.slice(1);
      }

      return `f(x) = ${fn}`;
    }

    static load(json) {
      if (json.name !== 'polynomialRegression') {
        throw new TypeError('not a polynomial regression model');
      }

      return new PolynomialRegression(true, json);
    }

  }

  function regress$3(pr, x, y, degree) {
    const n = x.length;
    let powers;

    if (Array.isArray(degree)) {
      powers = degree;
      degree = powers.length;
    } else {
      degree++;
      powers = new Array(degree);

      for (let k = 0; k < degree; k++) {
        powers[k] = k;
      }
    }

    const F = new Matrix$2(n, degree);
    const Y = new Matrix$2([y]);

    for (let k = 0; k < degree; k++) {
      for (let i = 0; i < n; i++) {
        if (powers[k] === 0) {
          F.set(i, k, 1);
        } else {
          F.set(i, k, Math.pow(x[i], powers[k]));
        }
      }
    }

    const FT = new MatrixTransposeView$1(F);
    const A = FT.mmul(F);
    const B = FT.mmul(new MatrixTransposeView$1(Y));
    pr.degree = degree - 1;
    pr.powers = powers;
    pr.coefficients = solve(A, B).to1DArray();
  }

  class SimpleLinearRegression extends BaseRegression {
    constructor(x, y) {
      super();

      if (x === true) {
        this.slope = y.slope;
        this.intercept = y.intercept;
        this.coefficients = [y.intercept, y.slope];
      } else {
        checkArraySize(x, y);
        regress$2(this, x, y);
      }
    }

    toJSON() {
      return {
        name: 'simpleLinearRegression',
        slope: this.slope,
        intercept: this.intercept
      };
    }

    _predict(x) {
      return this.slope * x + this.intercept;
    }

    computeX(y) {
      return (y - this.intercept) / this.slope;
    }

    toString(precision) {
      let result = 'f(x) = ';

      if (this.slope !== 0) {
        const xFactor = maybeToPrecision(this.slope, precision);
        result += `${xFactor === '1' ? '' : `${xFactor} * `}x`;

        if (this.intercept !== 0) {
          const absIntercept = Math.abs(this.intercept);
          const operator = absIntercept === this.intercept ? '+' : '-';
          result += ` ${operator} ${maybeToPrecision(absIntercept, precision)}`;
        }
      } else {
        result += maybeToPrecision(this.intercept, precision);
      }

      return result;
    }

    toLaTeX(precision) {
      return this.toString(precision);
    }

    static load(json) {
      if (json.name !== 'simpleLinearRegression') {
        throw new TypeError('not a SLR model');
      }

      return new SimpleLinearRegression(true, json);
    }

  }

  function regress$2(slr, x, y) {
    const n = x.length;
    let xSum = 0;
    let ySum = 0;
    let xSquared = 0;
    let xY = 0;

    for (let i = 0; i < n; i++) {
      xSum += x[i];
      ySum += y[i];
      xSquared += x[i] * x[i];
      xY += x[i] * y[i];
    }

    const numerator = n * xY - xSum * ySum;
    slr.slope = numerator / (n * xSquared - xSum * xSum);
    slr.intercept = 1 / n * ySum - slr.slope * (1 / n) * xSum;
    slr.coefficients = [slr.intercept, slr.slope];
  }

  class ExponentialRegression extends BaseRegression {
    constructor(x, y) {
      super();

      if (x === true) {
        this.A = y.A;
        this.B = y.B;
      } else {
        checkArraySize(x, y);
        regress$1(this, x, y);
      }
    }

    _predict(input) {
      return this.B * Math.exp(input * this.A);
    }

    toJSON() {
      return {
        name: 'exponentialRegression',
        A: this.A,
        B: this.B
      };
    }

    toString(precision) {
      return `f(x) = ${maybeToPrecision(this.B, precision)} * e^(${maybeToPrecision(this.A, precision)} * x)`;
    }

    toLaTeX(precision) {
      if (this.A >= 0) {
        return `f(x) = ${maybeToPrecision(this.B, precision)}e^{${maybeToPrecision(this.A, precision)}x}`;
      } else {
        return `f(x) = \\frac{${maybeToPrecision(this.B, precision)}}{e^{${maybeToPrecision(-this.A, precision)}x}}`;
      }
    }

    static load(json) {
      if (json.name !== 'exponentialRegression') {
        throw new TypeError('not a exponential regression model');
      }

      return new ExponentialRegression(true, json);
    }

  }

  function regress$1(er, x, y) {
    const n = x.length;
    const yl = new Array(n);

    for (let i = 0; i < n; i++) {
      yl[i] = Math.log(y[i]);
    }

    const linear = new SimpleLinearRegression(x, yl);
    er.A = linear.slope;
    er.B = Math.exp(linear.intercept);
  }

  class PowerRegression extends BaseRegression {
    constructor(x, y) {
      super();

      if (x === true) {
        // reloading model
        this.A = y.A;
        this.B = y.B;
      } else {
        checkArraySize(x, y);
        regress(this, x, y);
      }
    }

    _predict(newInputs) {
      return this.A * Math.pow(newInputs, this.B);
    }

    toJSON() {
      return {
        name: 'powerRegression',
        A: this.A,
        B: this.B
      };
    }

    toString(precision) {
      return `f(x) = ${maybeToPrecision(this.A, precision)} * x^${maybeToPrecision(this.B, precision)}`;
    }

    toLaTeX(precision) {
      let latex = '';

      if (this.B >= 0) {
        latex = `f(x) = ${maybeToPrecision(this.A, precision)}x^{${maybeToPrecision(this.B, precision)}}`;
      } else {
        latex = `f(x) = \\frac{${maybeToPrecision(this.A, precision)}}{x^{${maybeToPrecision(-this.B, precision)}}}`;
      }

      latex = latex.replace(/e([+-]?[0-9]+)/g, 'e^{$1}');
      return latex;
    }

    static load(json) {
      if (json.name !== 'powerRegression') {
        throw new TypeError('not a power regression model');
      }

      return new PowerRegression(true, json);
    }

  }

  function regress(pr, x, y) {
    const n = x.length;
    const xl = new Array(n);
    const yl = new Array(n);

    for (let i = 0; i < n; i++) {
      xl[i] = Math.log(x[i]);
      yl[i] = Math.log(y[i]);
    }

    const linear = new SimpleLinearRegression(xl, yl);
    pr.A = Math.exp(linear.intercept);
    pr.B = linear.slope;
  }

  class MultivariateLinearRegression {
    constructor(x, y, options = {}) {
      const {
        intercept = true,
        statistics = true
      } = options;
      this.statistics = statistics;

      if (x === true) {
        this.weights = y.weights;
        this.inputs = y.inputs;
        this.outputs = y.outputs;
        this.intercept = y.intercept;
      } else {
        x = new Matrix$2(x);
        y = new Matrix$2(y);

        if (intercept) {
          x.addColumn(new Array(x.rows).fill(1));
        }

        let xt = x.transpose();
        const xx = xt.mmul(x);
        const xy = xt.mmul(y);
        const invxx = new SingularValueDecomposition(xx).inverse();
        const beta = xy.transpose().mmul(invxx).transpose();
        this.weights = beta.to2DArray();
        this.inputs = x.columns;
        this.outputs = y.columns;
        if (intercept) this.inputs--;
        this.intercept = intercept;

        if (statistics) {
          /*
           * Let's add some basic statistics about the beta's to be able to interpret them.
           * source: http://dept.stat.lsa.umich.edu/~kshedden/Courses/Stat401/Notes/401-multreg.pdf
           * validated against Excel Regression AddIn
           * test: "datamining statistics test"
           */
          const fittedValues = x.mmul(beta);
          const residuals = y.clone().addM(fittedValues.neg());
          const variance = residuals.to2DArray().map(ri => Math.pow(ri[0], 2)).reduce((a, b) => a + b) / (y.rows - x.columns);
          this.stdError = Math.sqrt(variance);
          this.stdErrorMatrix = pseudoInverse(xx).mul(variance);
          this.stdErrors = this.stdErrorMatrix.diagonal().map(d => Math.sqrt(d));
          this.tStats = this.weights.map((d, i) => this.stdErrors[i] === 0 ? 0 : d[0] / this.stdErrors[i]);
        }
      }
    }

    predict(x) {
      if (Array.isArray(x)) {
        if (typeof x[0] === 'number') {
          return this._predict(x);
        } else if (Array.isArray(x[0])) {
          const y = new Array(x.length);

          for (let i = 0; i < x.length; i++) {
            y[i] = this._predict(x[i]);
          }

          return y;
        }
      } else if (Matrix$2.isMatrix(x)) {
        const y = new Matrix$2(x.rows, this.outputs);

        for (let i = 0; i < x.rows; i++) {
          y.setRow(i, this._predict(x.getRow(i)));
        }

        return y;
      }

      throw new TypeError('x must be a matrix or array of numbers');
    }

    _predict(x) {
      const result = new Array(this.outputs);

      if (this.intercept) {
        for (let i = 0; i < this.outputs; i++) {
          result[i] = this.weights[this.inputs][i];
        }
      } else {
        result.fill(0);
      }

      for (let i = 0; i < this.inputs; i++) {
        for (let j = 0; j < this.outputs; j++) {
          result[j] += this.weights[i][j] * x[i];
        }
      }

      return result;
    }

    score() {
      throw new Error('score method is not implemented yet');
    }

    toJSON() {
      return {
        name: 'multivariateLinearRegression',
        weights: this.weights,
        inputs: this.inputs,
        outputs: this.outputs,
        intercept: this.intercept,
        summary: this.statistics ? {
          regressionStatistics: {
            standardError: this.stdError,
            observations: this.outputs
          },
          variables: this.weights.map((d, i) => {
            return {
              label: i === this.weights.length - 1 ? 'Intercept' : `X Variable ${i + 1}`,
              coefficients: d,
              standardError: this.stdErrors[i],
              tStat: this.tStats[i]
            };
          })
        } : undefined
      };
    }

    static load(model) {
      if (model.name !== 'multivariateLinearRegression') {
        throw new Error('not a MLR model');
      }

      return new MultivariateLinearRegression(true, model);
    }

  }

  var require$$0 = /*@__PURE__*/getAugmentedNamespace(euclidean$3);

  const {
    squaredEuclidean: squaredEuclidean$3
  } = require$$0;
  const defaultOptions$a = {
    sigma: 1
  };

  class GaussianKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$a, options);
      this.sigma = options.sigma;
      this.divisor = 2 * options.sigma * options.sigma;
    }

    compute(x, y) {
      const distance = squaredEuclidean$3(x, y);
      return Math.exp(-distance / this.divisor);
    }

  }

  var gaussianKernel = GaussianKernel;

  const defaultOptions$9 = {
    degree: 1,
    constant: 1,
    scale: 1
  };

  class PolynomialKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$9, options);
      this.degree = options.degree;
      this.constant = options.constant;
      this.scale = options.scale;
    }

    compute(x, y) {
      var sum = 0;

      for (var i = 0; i < x.length; i++) {
        sum += x[i] * y[i];
      }

      return Math.pow(this.scale * sum + this.constant, this.degree);
    }

  }

  var polynomialKernel = PolynomialKernel;

  const defaultOptions$8 = {
    alpha: 0.01,
    constant: -Math.E
  };

  class SigmoidKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$8, options);
      this.alpha = options.alpha;
      this.constant = options.constant;
    }

    compute(x, y) {
      var sum = 0;

      for (var i = 0; i < x.length; i++) {
        sum += x[i] * y[i];
      }

      return Math.tanh(this.alpha * sum + this.constant);
    }

  }

  var sigmoidKernel = SigmoidKernel;

  const defaultOptions$7 = {
    sigma: 1,
    degree: 1
  };

  class ANOVAKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$7, options);
      this.sigma = options.sigma;
      this.degree = options.degree;
    }

    compute(x, y) {
      var sum = 0;
      var len = Math.min(x.length, y.length);

      for (var i = 1; i <= len; ++i) {
        sum += Math.pow(Math.exp(-this.sigma * Math.pow(Math.pow(x[i - 1], i) - Math.pow(y[i - 1], i), 2)), this.degree);
      }

      return sum;
    }

  }

  var anovaKernel = ANOVAKernel;

  const {
    squaredEuclidean: squaredEuclidean$2
  } = require$$0;
  const defaultOptions$6 = {
    sigma: 1
  };

  class CauchyKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$6, options);
      this.sigma = options.sigma;
    }

    compute(x, y) {
      return 1 / (1 + squaredEuclidean$2(x, y) / (this.sigma * this.sigma));
    }

  }

  var cauchyKernel = CauchyKernel;

  const {
    euclidean: euclidean$1
  } = require$$0;
  const defaultOptions$5 = {
    sigma: 1
  };

  class ExponentialKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$5, options);
      this.sigma = options.sigma;
      this.divisor = 2 * options.sigma * options.sigma;
    }

    compute(x, y) {
      const distance = euclidean$1(x, y);
      return Math.exp(-distance / this.divisor);
    }

  }

  var exponentialKernel = ExponentialKernel;

  class HistogramIntersectionKernel {
    compute(x, y) {
      var min = Math.min(x.length, y.length);
      var sum = 0;

      for (var i = 0; i < min; ++i) {
        sum += Math.min(x[i], y[i]);
      }

      return sum;
    }

  }

  var histogramIntersectionKernel = HistogramIntersectionKernel;

  const {
    euclidean
  } = require$$0;
  const defaultOptions$4 = {
    sigma: 1
  };

  class LaplacianKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$4, options);
      this.sigma = options.sigma;
    }

    compute(x, y) {
      const distance = euclidean(x, y);
      return Math.exp(-distance / this.sigma);
    }

  }

  var laplacianKernel = LaplacianKernel;

  const {
    squaredEuclidean: squaredEuclidean$1
  } = require$$0;
  const defaultOptions$3 = {
    constant: 1
  };

  class MultiquadraticKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$3, options);
      this.constant = options.constant;
    }

    compute(x, y) {
      return Math.sqrt(squaredEuclidean$1(x, y) + this.constant * this.constant);
    }

  }

  var multiquadraticKernel = MultiquadraticKernel;

  const {
    squaredEuclidean
  } = require$$0;
  const defaultOptions$2 = {
    constant: 1
  };

  class RationalQuadraticKernel {
    constructor(options) {
      options = Object.assign({}, defaultOptions$2, options);
      this.constant = options.constant;
    }

    compute(x, y) {
      const distance = squaredEuclidean(x, y);
      return 1 - distance / (distance + this.constant);
    }

  }

  var rationalQuadraticKernel = RationalQuadraticKernel;

  const {
    Matrix: Matrix$1,
    MatrixTransposeView
  } = require$$0$1;
  const kernelType = {
    gaussian: gaussianKernel,
    rbf: gaussianKernel,
    polynomial: polynomialKernel,
    poly: polynomialKernel,
    anova: anovaKernel,
    cauchy: cauchyKernel,
    exponential: exponentialKernel,
    histogram: histogramIntersectionKernel,
    min: histogramIntersectionKernel,
    laplacian: laplacianKernel,
    multiquadratic: multiquadraticKernel,
    rational: rationalQuadraticKernel,
    sigmoid: sigmoidKernel,
    mlp: sigmoidKernel
  };

  class Kernel {
    constructor(type, options) {
      this.kernelType = type;
      if (type === 'linear') return;

      if (typeof type === 'string') {
        type = type.toLowerCase();
        var KernelConstructor = kernelType[type];

        if (KernelConstructor) {
          this.kernelFunction = new KernelConstructor(options);
        } else {
          throw new Error(`unsupported kernel type: ${type}`);
        }
      } else if (typeof type === 'object' && typeof type.compute === 'function') {
        this.kernelFunction = type;
      } else {
        throw new TypeError('first argument must be a valid kernel type or instance');
      }
    }

    compute(inputs, landmarks) {
      inputs = Matrix$1.checkMatrix(inputs);

      if (landmarks === undefined) {
        landmarks = inputs;
      } else {
        landmarks = Matrix$1.checkMatrix(landmarks);
      }

      if (this.kernelType === 'linear') {
        return inputs.mmul(new MatrixTransposeView(landmarks));
      }

      const kernelMatrix = new Matrix$1(inputs.rows, landmarks.rows);

      if (inputs === landmarks) {
        // fast path, matrix is symmetric
        for (let i = 0; i < inputs.rows; i++) {
          for (let j = i; j < inputs.rows; j++) {
            const value = this.kernelFunction.compute(inputs.getRow(i), inputs.getRow(j));
            kernelMatrix.set(i, j, value);
            kernelMatrix.set(j, i, value);
          }
        }
      } else {
        for (let i = 0; i < inputs.rows; i++) {
          for (let j = 0; j < landmarks.rows; j++) {
            kernelMatrix.set(i, j, this.kernelFunction.compute(inputs.getRow(i), landmarks.getRow(j)));
          }
        }
      }

      return kernelMatrix;
    }

  }

  var kernel = Kernel;

  class TheilSenRegression extends BaseRegression {
    /**
     * Theil–Sen estimator
     * https://en.wikipedia.org/wiki/Theil%E2%80%93Sen_estimator
     * @param {Array<number>|boolean} x
     * @param {Array<number>|object} y
     * @constructor
     */
    constructor(x, y) {
      super();

      if (x === true) {
        // loads the model
        this.slope = y.slope;
        this.intercept = y.intercept;
        this.coefficients = y.coefficients;
      } else {
        // creates the model
        checkArraySize(x, y);
        theilSen(this, x, y);
      }
    }

    toJSON() {
      return {
        name: 'TheilSenRegression',
        slope: this.slope,
        intercept: this.intercept
      };
    }

    _predict(input) {
      return this.slope * input + this.intercept;
    }

    computeX(input) {
      return (input - this.intercept) / this.slope;
    }

    toString(precision) {
      var result = 'f(x) = ';

      if (this.slope) {
        var xFactor = maybeToPrecision(this.slope, precision);
        result += `${Math.abs(xFactor - 1) < 1e-5 ? '' : `${xFactor} * `}x`;

        if (this.intercept) {
          var absIntercept = Math.abs(this.intercept);
          var operator = absIntercept === this.intercept ? '+' : '-';
          result += ` ${operator} ${maybeToPrecision(absIntercept, precision)}`;
        }
      } else {
        result += maybeToPrecision(this.intercept, precision);
      }

      return result;
    }

    toLaTeX(precision) {
      return this.toString(precision);
    }

    static load(json) {
      if (json.name !== 'TheilSenRegression') {
        throw new TypeError('not a Theil-Sen model');
      }

      return new TheilSenRegression(true, json);
    }

  }

  function theilSen(regression, x, y) {
    let len = x.length;
    let slopes = new Array(len * len);
    let count = 0;

    for (let i = 0; i < len; ++i) {
      for (let j = i + 1; j < len; ++j) {
        if (x[i] !== x[j]) {
          slopes[count++] = (y[j] - y[i]) / (x[j] - x[i]);
        }
      }
    }

    slopes.length = count;
    let medianSlope = median(slopes);
    let cuts = new Array(len);

    for (let i = 0; i < len; ++i) {
      cuts[i] = y[i] - medianSlope * x[i];
    }

    regression.slope = medianSlope;
    regression.intercept = median(cuts);
    regression.coefficients = [regression.intercept, regression.slope];
  }

  /**
   * @class RobustPolynomialRegression
   * @param {Array<number>} x
   * @param {Array<number>} y
   * @param {number} degree - polynomial degree
   */

  class RobustPolynomialRegression extends BaseRegression {
    constructor(x, y, degree) {
      super();

      if (x === true) {
        this.degree = y.degree;
        this.powers = y.powers;
        this.coefficients = y.coefficients;
      } else {
        checkArraySize(x, y);
        robustPolynomial(this, x, y, degree);
      }
    }

    toJSON() {
      return {
        name: 'robustPolynomialRegression',
        degree: this.degree,
        powers: this.powers,
        coefficients: this.coefficients
      };
    }

    _predict(x) {
      return predict(x, this.powers, this.coefficients);
    }
    /**
     * Display the formula
     * @param {number} precision - precision for the numbers
     * @return {string}
     */


    toString(precision) {
      return this._toFormula(precision, false);
    }
    /**
     * Display the formula in LaTeX format
     * @param {number} precision - precision for the numbers
     * @return {string}
     */


    toLaTeX(precision) {
      return this._toFormula(precision, true);
    }

    _toFormula(precision, isLaTeX) {
      let sup = '^';
      let closeSup = '';
      let times = ' * ';

      if (isLaTeX) {
        sup = '^{';
        closeSup = '}';
        times = '';
      }

      let fn = '';
      let str = '';

      for (let k = 0; k < this.coefficients.length; k++) {
        str = '';

        if (this.coefficients[k] !== 0) {
          if (this.powers[k] === 0) {
            str = maybeToPrecision(this.coefficients[k], precision);
          } else {
            if (this.powers[k] === 1) {
              str = `${maybeToPrecision(this.coefficients[k], precision) + times}x`;
            } else {
              str = `${maybeToPrecision(this.coefficients[k], precision) + times}x${sup}${this.powers[k]}${closeSup}`;
            }
          }

          if (this.coefficients[k] > 0 && k !== this.coefficients.length - 1) {
            str = ` + ${str}`;
          } else if (k !== this.coefficients.length - 1) {
            str = ` ${str}`;
          }
        }

        fn = str + fn;
      }

      if (fn.charAt(0) === '+') {
        fn = fn.slice(1);
      }

      return `f(x) = ${fn}`;
    }

    static load(json) {
      if (json.name !== 'robustPolynomialRegression') {
        throw new TypeError('not a RobustPolynomialRegression model');
      }

      return new RobustPolynomialRegression(true, json);
    }

  }

  function robustPolynomial(regression, x, y, degree) {
    let powers = Array(degree).fill(0).map((_, index) => index);
    const tuples = getRandomTuples(x, y, degree);
    var min;

    for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      var coefficients = calcCoefficients(tuple, powers);
      var residuals = x.slice();

      for (var j = 0; j < x.length; j++) {
        residuals[j] = y[j] - predict(x[j], powers, coefficients);
        residuals[j] = {
          residual: residuals[j] * residuals[j],
          coefficients
        };
      }

      var median = residualsMedian(residuals);

      if (!min || median.residual < min.residual) {
        min = median;
      }
    }

    regression.degree = degree;
    regression.powers = powers;
    regression.coefficients = min.coefficients;
  }
  /**
   * @ignore
   * @param {Array<number>} x
   * @param {Array<number>} y
   * @param {number} degree
   * @return {Array<{x:number,y:number}>}
   */


  function getRandomTuples(x, y, degree) {
    var len = Math.floor(x.length / degree);
    var tuples = new Array(len);

    for (var i = 0; i < x.length; i++) {
      var pos = Math.floor(Math.random() * len);
      var counter = 0;

      while (counter < x.length) {
        if (!tuples[pos]) {
          tuples[pos] = [{
            x: x[i],
            y: y[i]
          }];
          break;
        } else if (tuples[pos].length < degree) {
          tuples[pos].push({
            x: x[i],
            y: y[i]
          });
          break;
        } else {
          counter++;
          pos = (pos + 1) % len;
        }
      }

      if (counter === x.length) {
        return tuples;
      }
    }

    return tuples;
  }
  /**
   * @ignore
   * @param {{x:number,y:number}} tuple
   * @param {Array<number>} powers
   * @return {Array<number>}
   */


  function calcCoefficients(tuple, powers) {
    var X = tuple.slice();
    var Y = tuple.slice();

    for (var i = 0; i < X.length; i++) {
      Y[i] = [tuple[i].y];
      X[i] = new Array(powers.length);

      for (var j = 0; j < powers.length; j++) {
        X[i][j] = Math.pow(tuple[i].x, powers[j]);
      }
    }

    return solve(X, Y).to1DArray();
  }

  function predict(x, powers, coefficients) {
    let y = 0;

    for (let k = 0; k < powers.length; k++) {
      y += coefficients[k] * Math.pow(x, powers[k]);
    }

    return y;
  }

  function residualsMedian(residuals) {
    residuals.sort((a, b) => a.residual - b.residual);
    var l = residuals.length;
    var half = Math.floor(l / 2);
    return l % 2 === 0 ? residuals[half - 1] : residuals[half];
  }

  function checkOptions$1(data, parameterizedFunction, options) {
    let {
      timeout,
      minValues,
      maxValues,
      initialValues,
      weights = 1,
      damping = 1e-2,
      dampingStepUp = 11,
      dampingStepDown = 9,
      maxIterations = 100,
      errorTolerance = 1e-7,
      centralDifference = false,
      gradientDifference = 10e-2,
      improvementThreshold = 1e-3
    } = options;

    if (damping <= 0) {
      throw new Error('The damping option must be a positive number');
    } else if (!data.x || !data.y) {
      throw new Error('The data parameter must have x and y elements');
    } else if (!isAnyArray(data.x) || data.x.length < 2 || !isAnyArray(data.y) || data.y.length < 2) {
      throw new Error('The data parameter elements must be an array with more than 2 points');
    } else if (data.x.length !== data.y.length) {
      throw new Error('The data parameter elements must have the same size');
    }

    let parameters = initialValues || new Array(parameterizedFunction.length).fill(1);
    let nbPoints = data.y.length;
    let parLen = parameters.length;
    maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
    minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

    if (maxValues.length !== minValues.length) {
      throw new Error('minValues and maxValues must be the same size');
    }

    if (!isAnyArray(parameters)) {
      throw new Error('initialValues must be an array');
    }

    if (typeof gradientDifference === 'number') {
      gradientDifference = new Array(parameters.length).fill(gradientDifference);
    } else if (isAnyArray(gradientDifference)) {
      if (gradientDifference.length !== parLen) {
        gradientDifference = new Array(parLen).fill(gradientDifference[0]);
      }
    } else {
      throw new Error('gradientDifference should be a number or array with length equal to the number of parameters');
    }

    let filler;

    if (typeof weights === 'number') {
      let value = 1 / weights ** 2;

      filler = () => value;
    } else if (isAnyArray(weights)) {
      if (weights.length < data.x.length) {
        let value = 1 / weights[0] ** 2;

        filler = () => value;
      } else {
        filler = i => 1 / weights[i] ** 2;
      }
    } else {
      throw new Error('weights should be a number or array with length equal to the number of data points');
    }

    let checkTimeout;

    if (timeout !== undefined) {
      if (typeof timeout !== 'number') {
        throw new Error('timeout should be a number');
      }

      let endTime = Date.now() + timeout * 1000;

      checkTimeout = () => Date.now() > endTime;
    } else {
      checkTimeout = () => false;
    }

    let weightSquare = new Array(data.x.length);

    for (let i = 0; i < nbPoints; i++) {
      weightSquare[i] = filler(i);
    }

    return {
      checkTimeout,
      minValues,
      maxValues,
      parameters,
      weightSquare,
      damping,
      dampingStepUp,
      dampingStepDown,
      maxIterations,
      errorTolerance,
      centralDifference,
      gradientDifference,
      improvementThreshold
    };
  }

  /**
   * the sum of the weighted squares of the errors (or weighted residuals) between the data.y
   * and the curve-fit function.
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} parameters - Array of current parameter values
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @param {Array} weightSquare - Square of weights
   * @return {number}
   */
  function errorCalculation(data, parameters, parameterizedFunction, weightSquare) {
    let error = 0;
    const func = parameterizedFunction(parameters);

    for (let i = 0; i < data.x.length; i++) {
      error += Math.pow(data.y[i] - func(data.x[i]), 2) / weightSquare[i];
    }

    return error;
  }

  /**
   * Difference of the matrix function over the parameters
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} evaluatedData - Array of previous evaluated function values
   * @param {Array<number>} params - Array of previous parameter values
   * @param {number|array} gradientDifference - The step size to approximate the jacobian matrix
   * @param {boolean} centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
   * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
   * @return {Matrix}
   */

  function gradientFunction(data, evaluatedData, params, gradientDifference, paramFunction, centralDifference) {
    const nbParams = params.length;
    const nbPoints = data.x.length;
    let ans = Matrix$2.zeros(nbParams, nbPoints);
    let rowIndex = 0;

    for (let param = 0; param < nbParams; param++) {
      if (gradientDifference[param] === 0) continue;
      let delta = gradientDifference[param];
      let auxParams = params.slice();
      auxParams[param] += delta;
      let funcParam = paramFunction(auxParams);

      if (!centralDifference) {
        for (let point = 0; point < nbPoints; point++) {
          ans.set(rowIndex, point, (evaluatedData[point] - funcParam(data.x[point])) / delta);
        }
      } else {
        auxParams = params.slice();
        auxParams[param] -= delta;
        delta *= 2;
        let funcParam2 = paramFunction(auxParams);

        for (let point = 0; point < nbPoints; point++) {
          ans.set(rowIndex, point, (funcParam2(data.x[point]) - funcParam(data.x[point])) / delta);
        }
      }

      rowIndex++;
    }

    return ans;
  }

  /**
   * Matrix function over the samples
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} evaluatedData - Array of previous evaluated function values
   * @return {Matrix}
   */

  function matrixFunction(data, evaluatedData) {
    const m = data.x.length;
    let ans = new Matrix$2(m, 1);

    for (let point = 0; point < m; point++) {
      ans.set(point, 0, data.y[point] - evaluatedData[point]);
    }

    return ans;
  }
  /**
   * Iteration for Levenberg-Marquardt
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} params - Array of previous parameter values
   * @param {number} damping - Levenberg-Marquardt parameter
   * @param {number|array} gradientDifference - The step size to approximate the jacobian matrix
   * @param {boolean} centralDifference - If true the jacobian matrix is approximated by central differences otherwise by forward differences
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @return {Array<number>}
   */


  function step(data, params, damping, gradientDifference, parameterizedFunction, centralDifference, weights) {
    let value = damping;
    let identity = Matrix$2.eye(params.length, params.length, value);
    const func = parameterizedFunction(params);
    let evaluatedData = new Float64Array(data.x.length);

    for (let i = 0; i < data.x.length; i++) {
      evaluatedData[i] = func(data.x[i]);
    }

    let gradientFunc = gradientFunction(data, evaluatedData, params, gradientDifference, parameterizedFunction, centralDifference);
    let residualError = matrixFunction(data, evaluatedData);
    let inverseMatrix = inverse(identity.add(gradientFunc.mmul(gradientFunc.transpose().scale('row', {
      scale: weights
    }))));
    let jacobianWeigthResidualError = gradientFunc.mmul(residualError.scale('row', {
      scale: weights
    }));
    let perturbations = inverseMatrix.mmul(jacobianWeigthResidualError);
    return {
      perturbations,
      jacobianWeigthResidualError
    };
  }

  /**
   * Curve fitting algorithm
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @param {object} [options] - Options object
   * @param {number|array} [options.weights = 1] - weighting vector, if the length does not match with the number of data points, the vector is reconstructed with first value.
   * @param {number} [options.damping = 1e-2] - Levenberg-Marquardt parameter, small values of the damping parameter λ result in a Gauss-Newton update and large
  values of λ result in a gradient descent update
   * @param {number} [options.dampingStepDown = 9] - factor to reduce the damping (Levenberg-Marquardt parameter) when there is not an improvement when updating parameters.
   * @param {number} [options.dampingStepUp = 11] - factor to increase the damping (Levenberg-Marquardt parameter) when there is an improvement when updating parameters.
   * @param {number} [options.improvementThreshold = 1e-3] - the threshold to define an improvement through an update of parameters
   * @param {number|array} [options.gradientDifference = 10e-2] - The step size to approximate the jacobian matrix
   * @param {boolean} [options.centralDifference = false] - If true the jacobian matrix is approximated by central differences otherwise by forward differences
   * @param {Array<number>} [options.minValues] - Minimum allowed values for parameters
   * @param {Array<number>} [options.maxValues] - Maximum allowed values for parameters
   * @param {Array<number>} [options.initialValues] - Array of initial parameter values
   * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
   * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point.
   * @param {number} [options.timeout] - maximum time running before throw in seconds.
   * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
   */

  function levenbergMarquardt(data, parameterizedFunction, options = {}) {
    let {
      checkTimeout,
      minValues,
      maxValues,
      parameters,
      weightSquare,
      damping,
      dampingStepUp,
      dampingStepDown,
      maxIterations,
      errorTolerance,
      centralDifference,
      gradientDifference,
      improvementThreshold
    } = checkOptions$1(data, parameterizedFunction, options);
    let error = errorCalculation(data, parameters, parameterizedFunction, weightSquare);
    let converged = error <= errorTolerance;
    let iteration = 0;

    for (; iteration < maxIterations && !converged; iteration++) {
      let previousError = error;
      let {
        perturbations,
        jacobianWeigthResidualError
      } = step(data, parameters, damping, gradientDifference, parameterizedFunction, centralDifference, weightSquare);

      for (let k = 0; k < parameters.length; k++) {
        parameters[k] = Math.min(Math.max(minValues[k], parameters[k] - perturbations.get(k, 0)), maxValues[k]);
      }

      error = errorCalculation(data, parameters, parameterizedFunction, weightSquare);
      if (isNaN(error)) break;
      let improvementMetric = (previousError - error) / perturbations.transpose().mmul(perturbations.mulS(damping).add(jacobianWeigthResidualError)).get(0, 0);

      if (improvementMetric > improvementThreshold) {
        damping = Math.max(damping / dampingStepDown, 1e-7);
      } else {
        error = previousError;
        damping = Math.min(damping * dampingStepUp, 1e7);
      }

      if (checkTimeout()) {
        throw new Error(`The execution time is over to ${options.timeout} seconds`);
      }

      converged = error <= errorTolerance;
    }

    return {
      parameterValues: parameters,
      parameterError: error,
      iterations: iteration
    };
  }

  /**
   *
   * @private
   * @param {Array of arrays} collection
   */
  function sortCollectionSet(collection) {
    let objectCollection = collection.map((value, index) => {
      let key = BigInt(0);
      value.forEach(item => key |= BigInt(1) << BigInt(item));
      return {
        value,
        index,
        key
      };
    }).sort((a, b) => {
      if (a.key - b.key < 0) return -1;
      return 1;
    });
    let sorted = [];
    let indices = [];
    let key;

    for (let set of objectCollection) {
      if (set.key !== key) {
        key = set.key;
        indices.push([]);
        sorted.push(set.value);
      }

      indices[indices.length - 1].push(set.index);
    }

    let result = {
      values: sorted,
      indices: indices
    };
    return result;
  }

  /**
   * (Combinatorial Subspace Least Squares) - subfunction for the FC-NNLS
   * @private
   * @param {Matrix} XtX
   * @param {Matrix} XtY
   * @param {Array} Pset
   * @param {Numbers} l
   * @param {Numbers} p
   */

  function cssls(XtX, XtY, Pset, l, p) {
    // Solves the set of equation XtX*K = XtY for the variables in Pset
    // if XtX (or XtX(vars,vars)) is singular, performs the svd and find pseudoinverse, otherwise (even if ill-conditioned) finds inverse with LU decomposition and solves the set of equation
    // it is consistent with matlab results for ill-conditioned matrices (at least consistent with test 'ill-conditionned square X rank 2, Y 3x1' in cssls.test)
    let K = Matrix$2.zeros(l, p);

    if (Pset === null) {
      let choXtX = new CholeskyDecomposition$1(XtX);

      if (choXtX.isPositiveDefinite() === true) {
        K = choXtX.solve(XtY);
      } else {
        let luXtX = new LuDecomposition$1(XtX);

        if (luXtX.isSingular() === false) {
          K = luXtX.solve(Matrix$2.eye(l)).mmul(XtY);
        } else {
          K = solve(XtX, XtY, {
            useSVD: true
          });
        }
      }
    } else {
      let sortedPset = sortCollectionSet(Pset).values;
      let sortedEset = sortCollectionSet(Pset).indices;

      if (sortedPset.length === 1 && sortedPset[0].length === 0 && sortedEset[0].length === p) {
        return K;
      } else if (sortedPset.length === 1 && sortedPset[0].length === l && sortedEset[0].length === p) {
        let choXtX = new CholeskyDecomposition$1(XtX);

        if (choXtX.isPositiveDefinite() === true) {
          K = choXtX.solve(XtY);
        } else {
          let luXtX = new LuDecomposition$1(XtX);

          if (luXtX.isSingular() === false) {
            K = luXtX.solve(Matrix$2.eye(l)).mmul(XtY);
          } else {
            K = solve(XtX, XtY, {
              useSVD: true
            });
          }
        }
      } else {
        for (let k = 0; k < sortedPset.length; k++) {
          let cols2Solve = sortedEset[k];
          let vars = sortedPset[k];
          let L;
          let choXtX = new CholeskyDecomposition$1(XtX.selection(vars, vars));

          if (choXtX.isPositiveDefinite() === true) {
            L = choXtX.solve(XtY.selection(vars, cols2Solve));
          } else {
            let luXtX = new LuDecomposition$1(XtX.selection(vars, vars));

            if (luXtX.isSingular() === false) {
              L = luXtX.solve(Matrix$2.eye(vars.length)).mmul(XtY.selection(vars, cols2Solve));
            } else {
              L = solve(XtX.selection(vars, vars), XtY.selection(vars, cols2Solve), {
                useSVD: true
              });
            }
          }

          for (let i = 0; i < L.rows; i++) {
            for (let j = 0; j < L.columns; j++) {
              K.set(vars[i], cols2Solve[j], L.get(i, j));
            }
          }
        }
      }
    }

    return K;
  }

  function initialisation(X, Y) {
    let n = X.rows;
    let l = X.columns;
    let p = Y.columns;
    let iter = 0;
    if (Y.rows !== n) throw new Error('ERROR: matrix size not compatible');
    let W = Matrix$2.zeros(l, p); // precomputes part of pseudoinverse

    let XtX = X.transpose().mmul(X);
    let XtY = X.transpose().mmul(Y);
    let K = cssls(XtX, XtY, null, l, p); // K is lxp

    let Pset = [];

    for (let j = 0; j < p; j++) {
      Pset[j] = [];

      for (let i = 0; i < l; i++) {
        if (K.get(i, j) > 0) {
          Pset[j].push(i);
        } else {
          K.set(i, j, 0);
        } //This is our initial solution, it's the solution found by overwriting the unconstrained least square solution

      }
    }

    let Fset = [];

    for (let j = 0; j < p; j++) {
      if (Pset[j].length !== l) {
        Fset.push(j);
      }
    }

    let D = K.clone();
    return {
      n,
      l,
      p,
      iter,
      W,
      XtX,
      XtY,
      K,
      Pset,
      Fset,
      D
    };
  }

  /**
   * Computes the set difference A\B
   * @private
   * @param {A} set A as an array
   * @param {B} set B as an array
   */
  function setDifference(A, B) {
    let C = [];

    for (let i of A) {
      if (!B.includes(i)) C.push(i);
    }

    return C;
  }

  function optimality(iter, maxIter, XtX, XtY, Fset, Pset, W, K, l, p, D) {
    if (iter === maxIter) {
      throw new Error('Maximum number of iterations exceeded');
    } // Check solution for optimality


    let V = XtY.subMatrixColumn(Fset).subtract(XtX.mmul(K.subMatrixColumn(Fset)));

    for (let j = 0; j < Fset.length; j++) {
      W.setColumn(Fset[j], V.subMatrixColumn([j]));
    }

    let Jset = [];
    let fullSet = [];

    for (let i = 0; i < l; i++) {
      fullSet.push(i);
    }

    for (let j = 0; j < Fset.length; j++) {
      let notPset = setDifference(fullSet, Pset[Fset[j]]);

      if (notPset.length === 0) {
        Jset.push(Fset[j]);
      } else if (W.selection(notPset, [Fset[j]]).max() <= 0) {
        Jset.push(Fset[j]);
      }
    }

    Fset = setDifference(Fset, Jset); // For non-optimal solutions, add the appropriate variables to Pset

    if (Fset.length !== 0) {
      for (let j = 0; j < Fset.length; j++) {
        for (let i = 0; i < l; i++) {
          if (Pset[Fset[j]].includes(i)) W.set(i, Fset[j], -Infinity);
        }

        Pset[Fset[j]].push(W.subMatrixColumn(Fset).maxColumnIndex(j)[0]);
      }

      for (let j = 0; j < Fset.length; j++) {
        D.setColumn(Fset[j], K.getColumn(Fset[j]));
      }
    }

    for (let j = 0; j < p; j++) {
      Pset[j].sort((a, b) => a - b);
    }

    return {
      Pset,
      Fset,
      W
    };
  }

  /**
   * Returns a new array based on extraction of specific indices of an array
   * @private
   * @param {Array} vector
   * @param {Array} indices
   */
  function selection(vector, indices) {
    let u = []; //new Float64Array(indices.length);

    for (let i = 0; i < indices.length; i++) {
      u[i] = vector[indices[i]];
    }

    return u;
  }

  /**
   * Fast Combinatorial Non-negative Least Squares with multiple Right Hand Side
   * @param {Matrix|number[][]} X
   * @param {Matrix|number[][]} Y
   * @param {object} [options={}]
   * @param {number} [options.maxIterations] if empty maxIterations is set at 3 times the number of columns of X
   * @returns {Matrix} K
   */

  function fcnnls(X, Y, options = {}) {
    X = Matrix$2.checkMatrix(X);
    Y = Matrix$2.checkMatrix(Y);
    let {
      l,
      p,
      iter,
      W,
      XtX,
      XtY,
      K,
      Pset,
      Fset,
      D
    } = initialisation(X, Y);
    const {
      maxIterations = X.columns * 3
    } = options; // Active set algorithm for NNLS main loop

    while (Fset.length > 0) {
      // Solves for the passive variables (uses subroutine below)
      let L = cssls(XtX, XtY.subMatrixColumn(Fset), selection(Pset, Fset), l, Fset.length);

      for (let i = 0; i < l; i++) {
        for (let j = 0; j < Fset.length; j++) {
          K.set(i, Fset[j], L.get(i, j));
        }
      } // Finds any infeasible solutions


      let infeasIndex = [];

      for (let j = 0; j < Fset.length; j++) {
        for (let i = 0; i < l; i++) {
          if (L.get(i, j) < 0) {
            infeasIndex.push(j);
            break;
          }
        }
      }

      let Hset = selection(Fset, infeasIndex); // Makes infeasible solutions feasible (standard NNLS inner loop)

      if (Hset.length > 0) {
        let m = Hset.length;
        let alpha = Matrix$2.ones(l, m);

        while (m > 0 && iter < maxIterations) {
          iter++;
          alpha.mul(Infinity); // Finds indices of negative variables in passive set

          let hRowColIdx = [[], []]; // Indexes work in pairs, each pair reprensents a single element, first array is row index, second array is column index

          let negRowColIdx = [[], []]; // Same as before

          for (let j = 0; j < m; j++) {
            for (let i = 0; i < Pset[Hset[j]].length; i++) {
              if (K.get(Pset[Hset[j]][i], Hset[j]) < 0) {
                hRowColIdx[0].push(Pset[Hset[j]][i]); // i

                hRowColIdx[1].push(j);
                negRowColIdx[0].push(Pset[Hset[j]][i]); // i

                negRowColIdx[1].push(Hset[j]);
              } // Compared to matlab, here we keep the row/column indexing (we are not taking the linear indexing)

            }
          }

          for (let k = 0; k < hRowColIdx[0].length; k++) {
            // could be hRowColIdx[1].length as well
            alpha.set(hRowColIdx[0][k], hRowColIdx[1][k], D.get(negRowColIdx[0][k], negRowColIdx[1][k]) / (D.get(negRowColIdx[0][k], negRowColIdx[1][k]) - K.get(negRowColIdx[0][k], negRowColIdx[1][k])));
          }

          let alphaMin = [];
          let minIdx = [];

          for (let j = 0; j < m; j++) {
            alphaMin[j] = alpha.minColumn(j);
            minIdx[j] = alpha.minColumnIndex(j)[0];
          }

          alphaMin = Matrix$2.rowVector(alphaMin);

          for (let i = 0; i < l; i++) {
            alpha.setSubMatrix(alphaMin, i, 0);
          }

          let E = new Matrix$2(l, m);
          E = D.subMatrixColumn(Hset).subtract(alpha.subMatrix(0, l - 1, 0, m - 1).mul(D.subMatrixColumn(Hset).subtract(K.subMatrixColumn(Hset))));

          for (let j = 0; j < m; j++) {
            D.setColumn(Hset[j], E.subMatrixColumn([j]));
          }

          let idx2zero = [minIdx, Hset];

          for (let k = 0; k < m; k++) {
            D.set(idx2zero[0][k], idx2zero[1][k], 0);
          }

          for (let j = 0; j < m; j++) {
            Pset[Hset[j]].splice(Pset[Hset[j]].findIndex(item => item === minIdx[j]), 1);
          }

          L = cssls(XtX, XtY.subMatrixColumn(Hset), selection(Pset, Hset), l, m);

          for (let j = 0; j < m; j++) {
            K.setColumn(Hset[j], L.subMatrixColumn([j]));
          }

          Hset = [];

          for (let j = 0; j < K.columns; j++) {
            for (let i = 0; i < l; i++) {
              if (K.get(i, j) < 0) {
                Hset.push(j);
                break;
              }
            }
          }

          m = Hset.length;
        }
      }

      let newParam = optimality(iter, maxIterations, XtX, XtY, Fset, Pset, W, K, l, p, D);
      Pset = newParam.Pset;
      Fset = newParam.Fset;
      W = newParam.W;
    }

    return K;
  }

  /**
   * Fast Combinatorial Non-negative Least Squares with single Right Hand Side
   * @param {Matrix|number[][]} X
   * @param {number[]} y
   * @param {object} [options={}]
   * @param {boolean} [maxIterations] if true or empty maxIterations is set at 3 times the number of columns of X
   * @returns {Array} k
   */

  function fcnnlsVector(X, y, options = {}) {
    if (Array.isArray(y) === false) {
      throw new TypeError('y must be a 1D Array');
    }

    let Y = Matrix$2.columnVector(y);
    let K = fcnnls(X, Y, options);
    let k = K.to1DArray();
    return k;
  }

  var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fcnnls: fcnnls,
    fcnnlsVector: fcnnlsVector
  });

  var binarySearch = function (haystack, needle, comparator, low, high) {
    var mid, cmp;
    if (low === undefined) low = 0;else {
      low = low | 0;
      if (low < 0 || low >= haystack.length) throw new RangeError("invalid lower bound");
    }
    if (high === undefined) high = haystack.length - 1;else {
      high = high | 0;
      if (high < low || high >= haystack.length) throw new RangeError("invalid upper bound");
    }

    while (low <= high) {
      // The naive `low + high >>> 1` could fail for array lengths > 2**31
      // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`
      // works for array lengths <= 2**32-1 which is also Javascript's max array
      // length.
      mid = low + (high - low >>> 1);
      cmp = +comparator(haystack[mid], needle, mid, haystack); // Too low.

      if (cmp < 0.0) low = mid + 1; // Too high.
      else if (cmp > 0.0) high = mid - 1; // Key found.
        else return mid;
    } // Key not found.


    return ~low;
  };

  function assertNumber$3(number) {
    if (typeof number !== 'number') {
      throw new TypeError('Expected a number');
    }
  }

  var ascending$3 = (left, right) => {
    assertNumber$3(left);
    assertNumber$3(right);

    if (Number.isNaN(left)) {
      return -1;
    }

    if (Number.isNaN(right)) {
      return 1;
    }

    return left - right;
  };

  const largestPrime = 0x7fffffff;
  const primeNumbers = [// chunk #0
  largestPrime, // 2^31-1
  // chunk #1
  5, 11, 23, 47, 97, 197, 397, 797, 1597, 3203, 6421, 12853, 25717, 51437, 102877, 205759, 411527, 823117, 1646237, 3292489, 6584983, 13169977, 26339969, 52679969, 105359939, 210719881, 421439783, 842879579, 1685759167, // chunk #2
  433, 877, 1759, 3527, 7057, 14143, 28289, 56591, 113189, 226379, 452759, 905551, 1811107, 3622219, 7244441, 14488931, 28977863, 57955739, 115911563, 231823147, 463646329, 927292699, 1854585413, // chunk #3
  953, 1907, 3821, 7643, 15287, 30577, 61169, 122347, 244703, 489407, 978821, 1957651, 3915341, 7830701, 15661423, 31322867, 62645741, 125291483, 250582987, 501165979, 1002331963, 2004663929, // chunk #4
  1039, 2081, 4177, 8363, 16729, 33461, 66923, 133853, 267713, 535481, 1070981, 2141977, 4283963, 8567929, 17135863, 34271747, 68543509, 137087021, 274174111, 548348231, 1096696463, // chunk #5
  31, 67, 137, 277, 557, 1117, 2237, 4481, 8963, 17929, 35863, 71741, 143483, 286973, 573953, 1147921, 2295859, 4591721, 9183457, 18366923, 36733847, 73467739, 146935499, 293871013, 587742049, 1175484103, // chunk #6
  599, 1201, 2411, 4831, 9677, 19373, 38747, 77509, 155027, 310081, 620171, 1240361, 2480729, 4961459, 9922933, 19845871, 39691759, 79383533, 158767069, 317534141, 635068283, 1270136683, // chunk #7
  311, 631, 1277, 2557, 5119, 10243, 20507, 41017, 82037, 164089, 328213, 656429, 1312867, 2625761, 5251529, 10503061, 21006137, 42012281, 84024581, 168049163, 336098327, 672196673, 1344393353, // chunk #8
  3, 7, 17, 37, 79, 163, 331, 673, 1361, 2729, 5471, 10949, 21911, 43853, 87719, 175447, 350899, 701819, 1403641, 2807303, 5614657, 11229331, 22458671, 44917381, 89834777, 179669557, 359339171, 718678369, 1437356741, // chunk #9
  43, 89, 179, 359, 719, 1439, 2879, 5779, 11579, 23159, 46327, 92657, 185323, 370661, 741337, 1482707, 2965421, 5930887, 11861791, 23723597, 47447201, 94894427, 189788857, 379577741, 759155483, 1518310967, // chunk #10
  379, 761, 1523, 3049, 6101, 12203, 24407, 48817, 97649, 195311, 390647, 781301, 1562611, 3125257, 6250537, 12501169, 25002389, 50004791, 100009607, 200019221, 400038451, 800076929, 1600153859, // chunk #11
  13, 29, 59, 127, 257, 521, 1049, 2099, 4201, 8419, 16843, 33703, 67409, 134837, 269683, 539389, 1078787, 2157587, 4315183, 8630387, 17260781, 34521589, 69043189, 138086407, 276172823, 552345671, 1104691373, // chunk #12
  19, 41, 83, 167, 337, 677, 1361, 2729, 5471, 10949, 21911, 43853, 87719, 175447, 350899, 701819, 1403641, 2807303, 5614657, 11229331, 22458671, 44917381, 89834777, 179669557, 359339171, 718678369, 1437356741, // chunk #13
  53, 107, 223, 449, 907, 1823, 3659, 7321, 14653, 29311, 58631, 117269, 234539, 469099, 938207, 1876417, 3752839, 7505681, 15011389, 30022781, 60045577, 120091177, 240182359, 480364727, 960729461, 1921458943];
  primeNumbers.sort(ascending$3);
  function nextPrime(value) {
    let index = binarySearch(primeNumbers, value, ascending$3);

    if (index < 0) {
      index = ~index;
    }

    return primeNumbers[index];
  }

  const FREE = 0;
  const FULL = 1;
  const REMOVED = 2;
  const defaultInitialCapacity = 150;
  const defaultMinLoadFactor = 1 / 6;
  const defaultMaxLoadFactor = 2 / 3;
  class HashTable {
    constructor(options = {}) {
      if (options instanceof HashTable) {
        this.table = options.table.slice();
        this.values = options.values.slice();
        this.state = options.state.slice();
        this.minLoadFactor = options.minLoadFactor;
        this.maxLoadFactor = options.maxLoadFactor;
        this.distinct = options.distinct;
        this.freeEntries = options.freeEntries;
        this.lowWaterMark = options.lowWaterMark;
        this.highWaterMark = options.maxLoadFactor;
        return;
      }

      const initialCapacity = options.initialCapacity === undefined ? defaultInitialCapacity : options.initialCapacity;

      if (initialCapacity < 0) {
        throw new RangeError(`initial capacity must not be less than zero: ${initialCapacity}`);
      }

      const minLoadFactor = options.minLoadFactor === undefined ? defaultMinLoadFactor : options.minLoadFactor;
      const maxLoadFactor = options.maxLoadFactor === undefined ? defaultMaxLoadFactor : options.maxLoadFactor;

      if (minLoadFactor < 0 || minLoadFactor >= 1) {
        throw new RangeError(`invalid minLoadFactor: ${minLoadFactor}`);
      }

      if (maxLoadFactor <= 0 || maxLoadFactor >= 1) {
        throw new RangeError(`invalid maxLoadFactor: ${maxLoadFactor}`);
      }

      if (minLoadFactor >= maxLoadFactor) {
        throw new RangeError(`minLoadFactor (${minLoadFactor}) must be smaller than maxLoadFactor (${maxLoadFactor})`);
      }

      let capacity = initialCapacity; // User wants to put at least capacity elements. We need to choose the size based on the maxLoadFactor to
      // avoid the need to rehash before this capacity is reached.
      // actualCapacity * maxLoadFactor >= capacity

      capacity = capacity / maxLoadFactor | 0;
      capacity = nextPrime(capacity);
      if (capacity === 0) capacity = 1;
      this.table = newArray(capacity);
      this.values = newArray(capacity);
      this.state = newArray(capacity);
      this.minLoadFactor = minLoadFactor;

      if (capacity === largestPrime) {
        this.maxLoadFactor = 1;
      } else {
        this.maxLoadFactor = maxLoadFactor;
      }

      this.distinct = 0;
      this.freeEntries = capacity;
      this.lowWaterMark = 0;
      this.highWaterMark = chooseHighWaterMark(capacity, this.maxLoadFactor);
    }

    clone() {
      return new HashTable(this);
    }

    get size() {
      return this.distinct;
    }

    get(key) {
      const i = this.indexOfKey(key);
      if (i < 0) return 0;
      return this.values[i];
    }

    set(key, value) {
      let i = this.indexOfInsertion(key);

      if (i < 0) {
        i = -i - 1;
        this.values[i] = value;
        return false;
      }

      if (this.distinct > this.highWaterMark) {
        const newCapacity = chooseGrowCapacity(this.distinct + 1, this.minLoadFactor, this.maxLoadFactor);
        this.rehash(newCapacity);
        return this.set(key, value);
      }

      this.table[i] = key;
      this.values[i] = value;
      if (this.state[i] === FREE) this.freeEntries--;
      this.state[i] = FULL;
      this.distinct++;

      if (this.freeEntries < 1) {
        const newCapacity = chooseGrowCapacity(this.distinct + 1, this.minLoadFactor, this.maxLoadFactor);
        this.rehash(newCapacity);
      }

      return true;
    }

    remove(key, noRehash) {
      const i = this.indexOfKey(key);
      if (i < 0) return false;
      this.state[i] = REMOVED;
      this.distinct--;
      if (!noRehash) this.maybeShrinkCapacity();
      return true;
    }

    delete(key, noRehash) {
      const i = this.indexOfKey(key);
      if (i < 0) return false;
      this.state[i] = FREE;
      this.distinct--;
      if (!noRehash) this.maybeShrinkCapacity();
      return true;
    }

    maybeShrinkCapacity() {
      if (this.distinct < this.lowWaterMark) {
        const newCapacity = chooseShrinkCapacity(this.distinct, this.minLoadFactor, this.maxLoadFactor);
        this.rehash(newCapacity);
      }
    }

    containsKey(key) {
      return this.indexOfKey(key) >= 0;
    }

    indexOfKey(key) {
      const table = this.table;
      const state = this.state;
      const length = this.table.length;
      const hash = key & 0x7fffffff;
      let i = hash % length;
      let decrement = hash % (length - 2);
      if (decrement === 0) decrement = 1;

      while (state[i] !== FREE && (state[i] === REMOVED || table[i] !== key)) {
        i -= decrement;
        if (i < 0) i += length;
      }

      if (state[i] === FREE) return -1;
      return i;
    }

    containsValue(value) {
      return this.indexOfValue(value) >= 0;
    }

    indexOfValue(value) {
      const values = this.values;
      const state = this.state;

      for (var i = 0; i < state.length; i++) {
        if (state[i] === FULL && values[i] === value) {
          return i;
        }
      }

      return -1;
    }

    indexOfInsertion(key) {
      const table = this.table;
      const state = this.state;
      const length = table.length;
      const hash = key & 0x7fffffff;
      let i = hash % length;
      let decrement = hash % (length - 2);
      if (decrement === 0) decrement = 1;

      while (state[i] === FULL && table[i] !== key) {
        i -= decrement;
        if (i < 0) i += length;
      }

      if (state[i] === REMOVED) {
        const j = i;

        while (state[i] !== FREE && (state[i] === REMOVED || table[i] !== key)) {
          i -= decrement;
          if (i < 0) i += length;
        }

        if (state[i] === FREE) i = j;
      }

      if (state[i] === FULL) {
        return -i - 1;
      }

      return i;
    }

    ensureCapacity(minCapacity) {
      if (this.table.length < minCapacity) {
        const newCapacity = nextPrime(minCapacity);
        this.rehash(newCapacity);
      }
    }

    rehash(newCapacity) {
      const oldCapacity = this.table.length;
      if (newCapacity <= this.distinct) throw new Error('Unexpected');
      const oldTable = this.table;
      const oldValues = this.values;
      const oldState = this.state;
      const newTable = newArray(newCapacity);
      const newValues = newArray(newCapacity);
      const newState = newArray(newCapacity);
      this.lowWaterMark = chooseLowWaterMark(newCapacity, this.minLoadFactor);
      this.highWaterMark = chooseHighWaterMark(newCapacity, this.maxLoadFactor);
      this.table = newTable;
      this.values = newValues;
      this.state = newState;
      this.freeEntries = newCapacity - this.distinct;

      for (var i = 0; i < oldCapacity; i++) {
        if (oldState[i] === FULL) {
          var element = oldTable[i];
          var index = this.indexOfInsertion(element);
          newTable[index] = element;
          newValues[index] = oldValues[i];
          newState[index] = FULL;
        }
      }
    }

    forEachKey(callback) {
      for (var i = 0; i < this.state.length; i++) {
        if (this.state[i] === FULL) {
          if (!callback(this.table[i])) return false;
        }
      }

      return true;
    }

    forEachValue(callback) {
      for (var i = 0; i < this.state.length; i++) {
        if (this.state[i] === FULL) {
          if (!callback(this.values[i])) return false;
        }
      }

      return true;
    }

    forEachPair(callback) {
      for (var i = 0; i < this.state.length; i++) {
        if (this.state[i] === FULL) {
          if (!callback(this.table[i], this.values[i])) return false;
        }
      }

      return true;
    }

  }

  function chooseLowWaterMark(capacity, minLoad) {
    return capacity * minLoad | 0;
  }

  function chooseHighWaterMark(capacity, maxLoad) {
    return Math.min(capacity - 2, capacity * maxLoad | 0);
  }

  function chooseGrowCapacity(size, minLoad, maxLoad) {
    return nextPrime(Math.max(size + 1, 4 * size / (3 * minLoad + maxLoad) | 0));
  }

  function chooseShrinkCapacity(size, minLoad, maxLoad) {
    return nextPrime(Math.max(size + 1, 4 * size / (minLoad + 3 * maxLoad) | 0));
  }

  function newArray(size) {
    return Array(size).fill(0);
  }

  /* eslint-disable no-eval */
  class SparseMatrix {
    constructor(rows, columns, options = {}) {
      if (rows instanceof SparseMatrix) {
        // clone
        const other = rows;

        this._init(other.rows, other.columns, other.elements.clone(), other.threshold);

        return;
      }

      if (Array.isArray(rows)) {
        const matrix = rows;
        rows = matrix.length;
        options = columns || {};
        columns = matrix[0].length;

        this._init(rows, columns, new HashTable(options), options.threshold);

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            let value = matrix[i][j];
            if (this.threshold && Math.abs(value) < this.threshold) value = 0;

            if (value !== 0) {
              this.elements.set(i * columns + j, matrix[i][j]);
            }
          }
        }
      } else {
        this._init(rows, columns, new HashTable(options), options.threshold);
      }
    }

    _init(rows, columns, elements, threshold) {
      this.rows = rows;
      this.columns = columns;
      this.elements = elements;
      this.threshold = threshold || 0;
    }

    static eye(rows = 1, columns = rows) {
      const min = Math.min(rows, columns);
      const matrix = new SparseMatrix(rows, columns, {
        initialCapacity: min
      });

      for (let i = 0; i < min; i++) {
        matrix.set(i, i, 1);
      }

      return matrix;
    }

    clone() {
      return new SparseMatrix(this);
    }

    to2DArray() {
      const copy = new Array(this.rows);

      for (let i = 0; i < this.rows; i++) {
        copy[i] = new Array(this.columns);

        for (let j = 0; j < this.columns; j++) {
          copy[i][j] = this.get(i, j);
        }
      }

      return copy;
    }

    isSquare() {
      return this.rows === this.columns;
    }

    isSymmetric() {
      if (!this.isSquare()) return false;
      let symmetric = true;
      this.forEachNonZero((i, j, v) => {
        if (this.get(j, i) !== v) {
          symmetric = false;
          return false;
        }

        return v;
      });
      return symmetric;
    }
    /**
     * Search for the wither band in the main diagonals
     * @return {number}
     */


    bandWidth() {
      let min = this.columns;
      let max = -1;
      this.forEachNonZero((i, j, v) => {
        let diff = i - j;
        min = Math.min(min, diff);
        max = Math.max(max, diff);
        return v;
      });
      return max - min;
    }
    /**
     * Test if a matrix is consider banded using a threshold
     * @param {number} width
     * @return {boolean}
     */


    isBanded(width) {
      let bandWidth = this.bandWidth();
      return bandWidth <= width;
    }

    get cardinality() {
      return this.elements.size;
    }

    get size() {
      return this.rows * this.columns;
    }

    get(row, column) {
      return this.elements.get(row * this.columns + column);
    }

    set(row, column, value) {
      if (this.threshold && Math.abs(value) < this.threshold) value = 0;

      if (value === 0) {
        this.elements.remove(row * this.columns + column);
      } else {
        this.elements.set(row * this.columns + column, value);
      }

      return this;
    }

    mmul(other) {
      if (this.columns !== other.rows) {
        // eslint-disable-next-line no-console
        console.warn('Number of columns of left matrix are not equal to number of rows of right matrix.');
      }

      const m = this.rows;
      const p = other.columns;
      const result = new SparseMatrix(m, p);
      this.forEachNonZero((i, j, v1) => {
        other.forEachNonZero((k, l, v2) => {
          if (j === k) {
            result.set(i, l, result.get(i, l) + v1 * v2);
          }

          return v2;
        });
        return v1;
      });
      return result;
    }

    kroneckerProduct(other) {
      const m = this.rows;
      const n = this.columns;
      const p = other.rows;
      const q = other.columns;
      const result = new SparseMatrix(m * p, n * q, {
        initialCapacity: this.cardinality * other.cardinality
      });
      this.forEachNonZero((i, j, v1) => {
        other.forEachNonZero((k, l, v2) => {
          result.set(p * i + k, q * j + l, v1 * v2);
          return v2;
        });
        return v1;
      });
      return result;
    }

    forEachNonZero(callback) {
      this.elements.forEachPair((key, value) => {
        const i = key / this.columns | 0;
        const j = key % this.columns;
        let r = callback(i, j, value);
        if (r === false) return false; // stop iteration

        if (this.threshold && Math.abs(r) < this.threshold) r = 0;

        if (r !== value) {
          if (r === 0) {
            this.elements.remove(key, true);
          } else {
            this.elements.set(key, r);
          }
        }

        return true;
      });
      this.elements.maybeShrinkCapacity();
      return this;
    }

    getNonZeros() {
      const cardinality = this.cardinality;
      const rows = new Array(cardinality);
      const columns = new Array(cardinality);
      const values = new Array(cardinality);
      let idx = 0;
      this.forEachNonZero((i, j, value) => {
        rows[idx] = i;
        columns[idx] = j;
        values[idx] = value;
        idx++;
        return value;
      });
      return {
        rows,
        columns,
        values
      };
    }

    setThreshold(newThreshold) {
      if (newThreshold !== 0 && newThreshold !== this.threshold) {
        this.threshold = newThreshold;
        this.forEachNonZero((i, j, v) => v);
      }

      return this;
    }
    /**
     * @return {SparseMatrix} - New transposed sparse matrix
     */


    transpose() {
      let trans = new SparseMatrix(this.columns, this.rows, {
        initialCapacity: this.cardinality
      });
      this.forEachNonZero((i, j, value) => {
        trans.set(j, i, value);
        return value;
      });
      return trans;
    }

    isEmpty() {
      return this.rows === 0 || this.columns === 0;
    }

  }
  SparseMatrix.prototype.klass = 'Matrix';
  SparseMatrix.identity = SparseMatrix.eye;
  SparseMatrix.prototype.tensorProduct = SparseMatrix.prototype.kroneckerProduct;
  /*
   Add dynamically instance and static methods for mathematical operations
   */

  let inplaceOperator = `
(function %name%(value) {
    if (typeof value === 'number') return this.%name%S(value);
    return this.%name%M(value);
})
`;
  let inplaceOperatorScalar = `
(function %name%S(value) {
    this.forEachNonZero((i, j, v) => v %op% value);
    return this;
})
`;
  let inplaceOperatorMatrix = `
(function %name%M(matrix) {
    matrix.forEachNonZero((i, j, v) => {
        this.set(i, j, this.get(i, j) %op% v);
        return v;
    });
    return this;
})
`;
  let staticOperator = `
(function %name%(matrix, value) {
    var newMatrix = new SparseMatrix(matrix);
    return newMatrix.%name%(value);
})
`;
  let inplaceMethod = `
(function %name%() {
    this.forEachNonZero((i, j, v) => %method%(v));
    return this;
})
`;
  let staticMethod = `
(function %name%(matrix) {
    var newMatrix = new SparseMatrix(matrix);
    return newMatrix.%name%();
})
`;
  const operators = [// Arithmetic operators
  ['+', 'add'], ['-', 'sub', 'subtract'], ['*', 'mul', 'multiply'], ['/', 'div', 'divide'], ['%', 'mod', 'modulus'], // Bitwise operators
  ['&', 'and'], ['|', 'or'], ['^', 'xor'], ['<<', 'leftShift'], ['>>', 'signPropagatingRightShift'], ['>>>', 'rightShift', 'zeroFillRightShift']];

  for (const operator of operators) {
    for (let i = 1; i < operator.length; i++) {
      SparseMatrix.prototype[operator[i]] = eval(fillTemplateFunction(inplaceOperator, {
        name: operator[i],
        op: operator[0]
      }));
      SparseMatrix.prototype[`${operator[i]}S`] = eval(fillTemplateFunction(inplaceOperatorScalar, {
        name: `${operator[i]}S`,
        op: operator[0]
      }));
      SparseMatrix.prototype[`${operator[i]}M`] = eval(fillTemplateFunction(inplaceOperatorMatrix, {
        name: `${operator[i]}M`,
        op: operator[0]
      }));
      SparseMatrix[operator[i]] = eval(fillTemplateFunction(staticOperator, {
        name: operator[i]
      }));
    }
  }

  let methods = [['~', 'not']];
  ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'log', 'log1p', 'log10', 'log2', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'].forEach(function (mathMethod) {
    methods.push([`Math.${mathMethod}`, mathMethod]);
  });

  for (const method of methods) {
    for (let i = 1; i < method.length; i++) {
      SparseMatrix.prototype[method[i]] = eval(fillTemplateFunction(inplaceMethod, {
        name: method[i],
        method: method[0]
      }));
      SparseMatrix[method[i]] = eval(fillTemplateFunction(staticMethod, {
        name: method[i]
      }));
    }
  }

  function fillTemplateFunction(template, values) {
    for (const i in values) {
      template = template.replace(new RegExp(`%${i}%`, 'g'), values[i]);
    }

    return template;
  }

  function additiveSymmetric(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) * (a[i] + b[i]) / (a[i] * b[i]);
    }

    return 2 * d;
  }

  function avg(a, b) {
    var ii = a.length;
    var max = 0;
    var ans = 0;
    var aux = 0;

    for (var i = 0; i < ii; i++) {
      aux = Math.abs(a[i] - b[i]);
      ans += aux;

      if (max < aux) {
        max = aux;
      }
    }

    return (max + ans) / 2;
  }

  function bhattacharyya(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.sqrt(a[i] * b[i]);
    }

    return -Math.log(ans);
  }

  function canberra(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.abs(a[i] - b[i]) / (a[i] + b[i]);
    }

    return ans;
  }

  function chebyshev(a, b) {
    var ii = a.length;
    var max = 0;
    var aux = 0;

    for (var i = 0; i < ii; i++) {
      aux = Math.abs(a[i] - b[i]);

      if (max < aux) {
        max = aux;
      }
    }

    return max;
  }

  function clark(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += Math.sqrt((a[i] - b[i]) * (a[i] - b[i]) / ((a[i] + b[i]) * (a[i] + b[i])));
    }

    return 2 * d;
  }

  function czekanowskiSimilarity(a, b) {
    var up = 0;
    var down = 0;

    for (var i = 0; i < a.length; i++) {
      up += Math.min(a[i], b[i]);
      down += a[i] + b[i];
    }

    return 2 * up / down;
  }

  function czekanowskiDistance(a, b) {
    return 1 - czekanowskiSimilarity(a, b);
  }

  function dice$1(a, b) {
    var ii = a.length;
    var p = 0;
    var q1 = 0;
    var q2 = 0;

    for (var i = 0; i < ii; i++) {
      p += a[i] * a[i];
      q1 += b[i] * b[i];
      q2 += (a[i] - b[i]) * (a[i] - b[i]);
    }

    return q2 / (p + q1);
  }

  function divergence(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) / ((a[i] + b[i]) * (a[i] + b[i]));
    }

    return 2 * d;
  }

  function fidelity(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.sqrt(a[i] * b[i]);
    }

    return ans;
  }

  function gower(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.abs(a[i] - b[i]);
    }

    return ans / ii;
  }

  function harmonicMean(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += a[i] * b[i] / (a[i] + b[i]);
    }

    return 2 * ans;
  }

  function hellinger(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.sqrt(a[i] * b[i]);
    }

    return 2 * Math.sqrt(1 - ans);
  }

  function innerProduct(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += a[i] * b[i];
    }

    return ans;
  }

  function intersection$1(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.min(a[i], b[i]);
    }

    return 1 - ans;
  }

  function jaccard$1(a, b) {
    var ii = a.length;
    var p1 = 0;
    var p2 = 0;
    var q1 = 0;
    var q2 = 0;

    for (var i = 0; i < ii; i++) {
      p1 += a[i] * b[i];
      p2 += a[i] * a[i];
      q1 += b[i] * b[i];
      q2 += (a[i] - b[i]) * (a[i] - b[i]);
    }

    return q2 / (p2 + q1 - p1);
  }

  function jeffreys(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += (a[i] - b[i]) * Math.log(a[i] / b[i]);
    }

    return ans;
  }

  function jensenDifference(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += (a[i] * Math.log(a[i]) + b[i] * Math.log(b[i])) / 2 - (a[i] + b[i]) / 2 * Math.log((a[i] + b[i]) / 2);
    }

    return ans;
  }

  function jensenShannon(a, b) {
    var ii = a.length;
    var p = 0;
    var q = 0;

    for (var i = 0; i < ii; i++) {
      p += a[i] * Math.log(2 * a[i] / (a[i] + b[i]));
      q += b[i] * Math.log(2 * b[i] / (a[i] + b[i]));
    }

    return (p + q) / 2;
  }

  function kdivergence(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += a[i] * Math.log(2 * a[i] / (a[i] + b[i]));
    }

    return ans;
  }

  function kulczynski$1(a, b) {
    var ii = a.length;
    var up = 0;
    var down = 0;

    for (var i = 0; i < ii; i++) {
      up += Math.abs(a[i] - b[i]);
      down += Math.min(a[i], b[i]);
    }

    return up / down;
  }

  function kullbackLeibler(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += a[i] * Math.log(a[i] / b[i]);
    }

    return ans;
  }

  function kumarHassebrook(a, b) {
    var ii = a.length;
    var p = 0;
    var p2 = 0;
    var q2 = 0;

    for (var i = 0; i < ii; i++) {
      p += a[i] * b[i];
      p2 += a[i] * a[i];
      q2 += b[i] * b[i];
    }

    return p / (p2 + q2 - p);
  }

  function kumarJohnson(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.pow(a[i] * a[i] - b[i] * b[i], 2) / (2 * Math.pow(a[i] * b[i], 1.5));
    }

    return ans;
  }

  function lorentzian(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.log(Math.abs(a[i] - b[i]) + 1);
    }

    return ans;
  }

  function manhattan(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += Math.abs(a[i] - b[i]);
    }

    return d;
  }

  function matusita(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += Math.sqrt(a[i] * b[i]);
    }

    return Math.sqrt(2 - 2 * ans);
  }

  function minkowski(a, b, p) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += Math.pow(Math.abs(a[i] - b[i]), p);
    }

    return Math.pow(d, 1 / p);
  }

  function motyka$1(a, b) {
    var ii = a.length;
    var up = 0;
    var down = 0;

    for (var i = 0; i < ii; i++) {
      up += Math.min(a[i], b[i]);
      down += a[i] + b[i];
    }

    return 1 - up / down;
  }

  function neyman(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) / a[i];
    }

    return d;
  }

  function pearson$1(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) / b[i];
    }

    return d;
  }

  function probabilisticSymmetric(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) / (a[i] + b[i]);
    }

    return 2 * d;
  }

  function ruzicka(a, b) {
    var ii = a.length;
    var up = 0;
    var down = 0;

    for (var i = 0; i < ii; i++) {
      up += Math.min(a[i], b[i]);
      down += Math.max(a[i], b[i]);
    }

    return up / down;
  }

  function soergel(a, b) {
    var ii = a.length;
    var up = 0;
    var down = 0;

    for (var i = 0; i < ii; i++) {
      up += Math.abs(a[i] - b[i]);
      down += Math.max(a[i], b[i]);
    }

    return up / down;
  }

  function sorensen(a, b) {
    var ii = a.length;
    var up = 0;
    var down = 0;

    for (var i = 0; i < ii; i++) {
      up += Math.abs(a[i] - b[i]);
      down += a[i] + b[i];
    }

    return up / down;
  }

  function squared(a, b) {
    var i = 0;
    var ii = a.length;
    var d = 0;

    for (; i < ii; i++) {
      d += (a[i] - b[i]) * (a[i] - b[i]) / (a[i] + b[i]);
    }

    return d;
  }

  function squaredChord$1(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += (Math.sqrt(a[i]) - Math.sqrt(b[i])) * (Math.sqrt(a[i]) - Math.sqrt(b[i]));
    }

    return ans;
  }

  function taneja(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += (a[i] + b[i]) / 2 * Math.log((a[i] + b[i]) / (2 * Math.sqrt(a[i] * b[i])));
    }

    return ans;
  }

  function tanimoto$1(a, b, bitvector) {
    if (bitvector) {
      var inter = 0;
      var union = 0;

      for (var j = 0; j < a.length; j++) {
        inter += a[j] && b[j];
        union += a[j] || b[j];
      }

      if (union === 0) {
        return 1;
      }

      return inter / union;
    } else {
      var ii = a.length;
      var p = 0;
      var q = 0;
      var m = 0;

      for (var i = 0; i < ii; i++) {
        p += a[i];
        q += b[i];
        m += Math.min(a[i], b[i]);
      }

      return 1 - (p + q - 2 * m) / (p + q - m);
    }
  }

  function tanimoto(a, b, bitvector) {
    if (bitvector) {
      return 1 - tanimoto$1(a, b, bitvector);
    } else {
      var ii = a.length;
      var p = 0;
      var q = 0;
      var m = 0;

      for (var i = 0; i < ii; i++) {
        p += a[i];
        q += b[i];
        m += Math.min(a[i], b[i]);
      }

      return (p + q - 2 * m) / (p + q - m);
    }
  }

  function topsoe(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += a[i] * Math.log(2 * a[i] / (a[i] + b[i])) + b[i] * Math.log(2 * b[i] / (a[i] + b[i]));
    }

    return ans;
  }

  function waveHedges(a, b) {
    var ii = a.length;
    var ans = 0;

    for (var i = 0; i < ii; i++) {
      ans += 1 - Math.min(a[i], b[i]) / Math.max(a[i], b[i]);
    }

    return ans;
  }

  var distances = /*#__PURE__*/Object.freeze({
    __proto__: null,
    euclidean: euclidean$2,
    squaredEuclidean: squaredEuclidean$4,
    additiveSymmetric: additiveSymmetric,
    avg: avg,
    bhattacharyya: bhattacharyya,
    canberra: canberra,
    chebyshev: chebyshev,
    clark: clark,
    czekanowski: czekanowskiDistance,
    dice: dice$1,
    divergence: divergence,
    fidelity: fidelity,
    gower: gower,
    harmonicMean: harmonicMean,
    hellinger: hellinger,
    innerProduct: innerProduct,
    intersection: intersection$1,
    jaccard: jaccard$1,
    jeffreys: jeffreys,
    jensenDifference: jensenDifference,
    jensenShannon: jensenShannon,
    kdivergence: kdivergence,
    kulczynski: kulczynski$1,
    kullbackLeibler: kullbackLeibler,
    kumarHassebrook: kumarHassebrook,
    kumarJohnson: kumarJohnson,
    lorentzian: lorentzian,
    manhattan: manhattan,
    matusita: matusita,
    minkowski: minkowski,
    motyka: motyka$1,
    neyman: neyman,
    pearson: pearson$1,
    probabilisticSymmetric: probabilisticSymmetric,
    ruzicka: ruzicka,
    soergel: soergel,
    sorensen: sorensen,
    squared: squared,
    squaredChord: squaredChord$1,
    taneja: taneja,
    tanimoto: tanimoto,
    topsoe: topsoe,
    waveHedges: waveHedges
  });

  function assertNumber$2(number) {
    if (typeof number !== 'number') {
      throw new TypeError('Expected a number');
    }
  }

  var ascending$2 = (left, right) => {
    assertNumber$2(left);
    assertNumber$2(right);

    if (Number.isNaN(left)) {
      return -1;
    }

    if (Number.isNaN(right)) {
      return 1;
    }

    return left - right;
  };

  /**
   * Function that creates the tree
   * @param {Array<Array<number>>} spectrum
   * @param {object} [options]
   * @return {Tree|null}
   * left and right have the same structure than the parent,
   * or are null if they are leaves
   */

  function createTree(spectrum, options = {}) {
    var X = spectrum[0];
    const {
      minWindow = 0.16,
      threshold = 0.01,
      from = X[0],
      to = X[X.length - 1]
    } = options;
    return mainCreateTree(spectrum[0], spectrum[1], from, to, minWindow, threshold);
  }

  function mainCreateTree(X, Y, from, to, minWindow, threshold) {
    if (to - from < minWindow) {
      return null;
    } // search first point


    var start = binarySearch(X, from, ascending$2);

    if (start < 0) {
      start = ~start;
    } // stop at last point


    var sum = 0;
    var center = 0;

    for (var i = start; i < X.length; i++) {
      if (X[i] >= to) {
        break;
      }

      sum += Y[i];
      center += X[i] * Y[i];
    }

    if (sum < threshold) {
      return null;
    }

    center /= sum;

    if (center - from < 1e-6 || to - center < 1e-6) {
      return null;
    }

    if (center - from < minWindow / 4) {
      return mainCreateTree(X, Y, center, to, minWindow, threshold);
    } else {
      if (to - center < minWindow / 4) {
        return mainCreateTree(X, Y, from, center, minWindow, threshold);
      } else {
        return new Tree(sum, center, mainCreateTree(X, Y, from, center, minWindow, threshold), mainCreateTree(X, Y, center, to, minWindow, threshold));
      }
    }
  }

  class Tree {
    constructor(sum, center, left, right) {
      this.sum = sum;
      this.center = center;
      this.left = left;
      this.right = right;
    }

  }

  /**
   * Similarity between two nodes
   * @param {Tree|Array<Array<number>>} a - tree A node
   * @param {Tree|Array<Array<number>>} b - tree B node
   * @param {object} [options]
   * @return {number} similarity measure between tree nodes
   */

  function getSimilarity(a, b, options = {}) {
    const {
      alpha = 0.1,
      beta = 0.33,
      gamma = 0.001
    } = options;

    if (a === null || b === null) {
      return 0;
    }

    if (Array.isArray(a)) {
      a = createTree(a);
    }

    if (Array.isArray(b)) {
      b = createTree(b);
    }

    var C = alpha * Math.min(a.sum, b.sum) / Math.max(a.sum, b.sum) + (1 - alpha) * Math.exp(-gamma * Math.abs(a.center - b.center));
    return beta * C + (1 - beta) * (getSimilarity(a.left, b.left, options) + getSimilarity(a.right, b.right, options)) / 2;
  }

  function treeSimilarity(A, B, options = {}) {
    return getSimilarity(A, B, options);
  }
  function getFunction(options = {}) {
    return (A, B) => getSimilarity(A, B, options);
  }

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    treeSimilarity: treeSimilarity,
    getFunction: getFunction,
    createTree: createTree
  });

  function cosine(a, b) {
    var ii = a.length;
    var p = 0;
    var p2 = 0;
    var q2 = 0;

    for (var i = 0; i < ii; i++) {
      p += a[i] * b[i];
      p2 += a[i] * a[i];
      q2 += b[i] * b[i];
    }

    return p / (Math.sqrt(p2) * Math.sqrt(q2));
  }

  function dice(a, b) {
    return 1 - dice$1(a, b);
  }

  function intersection(a, b) {
    return 1 - intersection$1(a, b);
  }

  function jaccard(a, b) {
    return 1 - jaccard$1(a, b);
  }

  function kulczynski(a, b) {
    return 1 / kulczynski$1(a, b);
  }

  function motyka(a, b) {
    return 1 - motyka$1(a, b);
  }

  function pearson(a, b) {
    var avgA = mean$1(a);
    var avgB = mean$1(b);
    var newA = new Array(a.length);
    var newB = new Array(b.length);

    for (var i = 0; i < newA.length; i++) {
      newA[i] = a[i] - avgA;
      newB[i] = b[i] - avgB;
    }

    return cosine(newA, newB);
  }

  function squaredChord(a, b) {
    return 1 - squaredChord$1(a, b);
  }

  var similarities = /*#__PURE__*/Object.freeze({
    __proto__: null,
    tree: index$1,
    cosine: cosine,
    czekanowski: czekanowskiSimilarity,
    dice: dice,
    intersection: intersection,
    jaccard: jaccard,
    kulczynski: kulczynski,
    motyka: motyka,
    pearson: pearson,
    squaredChord: squaredChord,
    tanimoto: tanimoto$1
  });

  function zeroInsteadOfNegative(X) {
    let rows = X.rows;
    let columns = X.columns;
    let newMatrix = new Matrix$2(X);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (newMatrix.get(r, c) < 0) {
          newMatrix.set(r, c, 0);
        }
      }
    }

    return newMatrix;
  }

  function checkMatrixS(data, originalMatrix) {
    let {
      A,
      S
    } = data; //check if is there at least one element cero

    let indices = [];
    let sum = S.sum('row');

    for (let i = 0; i < sum.length; i++) {
      if (sum[i] === 0) {
        indices.push(i);
        continue;
      } else {
        for (let j = 0; j < S.columns; j++) {
          if (isNaN(S.get(i, j))) {
            indices.push(i);
            break;
          }
        }
      }
    } // if there than just one zero or NaN element
    // run a NMF with the residual matrix Y - A*B


    if (indices.length > 0) {
      let temp = fastExtractNMF(originalMatrix.clone().subM(A.mmul(S)), indices.length);

      for (let i = 0; i < indices.length; i++) {
        for (let j = 0; j < S.columns; j++) {
          S.set(indices[i], j, temp.S.get(i, j));
        }

        for (let j = 0; j < A.rows; j++) {
          A.set(j, indices[i], temp.A.get(j, i));
        }
      }
    }

    return Object.assign({}, data, {
      A,
      S
    });
  }

  function fastExtractNMF(residual, r) {
    if (r <= 0) return {
      A: [],
      S: []
    };
    const {
      columns,
      rows
    } = residual;
    let A = Matrix$2.zeros(rows, r);
    let S = Matrix$2.zeros(r, columns);

    for (let i = 0; i < r; i++) {
      residual = zeroInsteadOfNegative(residual);
      if (residual.sum() === 0) continue;
      let res2 = Matrix$2.pow(residual, 2).sum('column'); //find the max of the first column

      let maxIndex = 0;

      for (let j = 1; j < res2.length; j++) {
        if (res2[maxIndex] < res2[j]) maxIndex = j;
      }

      if (res2[maxIndex] > 0) {
        let sqrtMaxValue = Math.sqrt(res2[maxIndex]);

        for (let j = 0; j < rows; j++) {
          let value = residual.get(j, maxIndex) / sqrtMaxValue;
          A.set(j, i, value);
        }

        let temp = A.getColumnVector(i).transpose().mmul(residual);

        for (let j = 0; j < columns; j++) {
          S.set(i, j, Math.max(temp.get(0, j), 0));
        }

        let subtracting = A.getColumnVector(i).mmul(S.getRowVector(i));
        residual = residual.sub(subtracting);
      }
    }

    return {
      A,
      S
    };
  }

  function normBy(x, by = 'column') {
    let norms = Matrix$2.mul(x, x).sum(by);
    let length = norms.length;

    for (let i = 0; i < length; i++) {
      norms[i] = Math.sqrt(norms[i]);
    }

    return by === 'row' ? Matrix$2.from1DArray(length, 1, norms) : Matrix$2.from1DArray(1, length, norms);
  }

  function normProj(X, normLimits) {
    let norms;
    let r = X.rows;
    let c = X.columns;

    if (normLimits.rows === r) {
      norms = normBy(X, 'row'); //select rows with norm > 0 then multiply twise by the min

      for (let i = 0; i < r; i++) {
        if (norms.get(i, 0) <= 0) continue;

        for (let j = 0; j < c; j++) {
          let value = X.get(i, j) * Math.min(norms.get(i, 0), normLimits.get(i, 0) / norms.get(i, 0));
          X.set(i, j, value);
        }
      }
    } else {
      norms = normBy(X, 'column');

      for (let i = 0; i < c; i++) {
        if (norms.get(0, i) <= 0) continue;

        for (let j = 0; j < r; j++) {
          let value = X.get(j, i) * Math.min(norms.get(0, i), normLimits.get(0, i) / norms.get(0, i));
          X.set(j, i, value);
        }
      }
    }

    return X;
  }

  function updateMatrixA(Ainit, S, originalMatrix, options) {
    let {
      maxFBIteration,
      toleranceFB,
      normConstrained = false,
      lambda
    } = options;
    let St = S.transpose();
    let H = S.mmul(St);
    let YSt = originalMatrix.mmul(St);
    let evd = new EigenvalueDecomposition(H, {
      assumeSymmetric: true
    });
    let L = Math.max(...evd.realEigenvalues);
    let A = Ainit;
    let prevA = A.clone();
    let t = 1;

    let gradient = a => a.mmul(H).sub(YSt);

    let proximal;

    if (normConstrained) {
      let normLimits = normBy(Ainit, 'column');

      proximal = (x, threshold) => normProj(zeroInsteadOfNegative(x.subS(threshold)), normLimits);
    } else {
      proximal = (x, threshold) => zeroInsteadOfNegative(x.subS(threshold));
    }

    for (let i = 0; i < maxFBIteration; i++) {
      let tNext = (1 + Math.sqrt(1 + 4 * t * t)) / 2;
      let w = (t - 1) / tNext;
      t = tNext;
      let B = Matrix$2.mul(A, w + 1).sub(Matrix$2.mul(prevA, w));
      prevA = A.clone();
      A = proximal(B.sub(gradient(B).divS(L)), lambda / L);

      if (Matrix$2.sub(prevA, A).norm() / A.norm() < toleranceFB) {
        break;
      }
    }

    return A;
  }

  function getMax(array = []) {
    let max = Number.MIN_SAFE_INTEGER;

    for (let i = 0; i < array.length; i++) {
      if (max < array[i]) max = array[i];
    }

    return max;
  }

  function updateMatrixS(A, Sinit, originalMatrix, lambda, options) {
    let {
      maxFBIteration,
      toleranceFB
    } = options;
    let At = A.transpose();
    let H = At.mmul(A);
    let AtY = At.mmul(originalMatrix);
    let evd = new EigenvalueDecomposition(H, {
      assumeSymmetric: true
    });
    let L = getMax(evd.realEigenvalues);
    let t = 1;
    let S = Sinit.clone();
    let prevS = S.clone();

    let gradient = s => H.mmul(s).sub(AtY);

    let proximal = (x, threshold) => zeroInsteadOfNegative(x.subS(threshold));

    for (let i = 0; i < maxFBIteration; i++) {
      let tNext = (1 + Math.sqrt(1 + 4 * t * t)) / 2;
      let w = (t - 1) / tNext;
      t = tNext; // R = S_k + w [S_k - S_(k-1)] = (1 + w) .* S_k - w .* S_(k-1)

      let R = Matrix$2.mul(S, 1 + w).sub(Matrix$2.mul(prevS, w));
      prevS = S.clone();
      S = proximal(R.sub(gradient(R).divS(L)), lambda / L);

      if (Matrix$2.sub(prevS, S).norm() / S.norm() < toleranceFB) {
        break;
      }
    }

    return S;
  }

  function initialize(originalMatrix, options = {}) {
    const {
      rank,
      randGenerator,
      maxInitFBIteration,
      toleranceFBInit,
      maxFBIteration,
      toleranceFB,
      normConstrained
    } = options;
    let result = {};
    let rows = originalMatrix.rows;
    result.A = Matrix$2.rand(rows, rank, {
      random: randGenerator
    });

    for (let iter = 0; iter < maxInitFBIteration; iter++) {
      //select columns with sum positive from A
      let sumC = result.A.sum('column');

      for (let i = 0; i < sumC.length; i++) {
        while (sumC[i] === 0) {
          sumC[i] = 0;

          for (let j = 0; j < rows; j++) {
            result.A.set(j, i, randGenerator());
            sumC[i] += result.A.get(j, i);
          }
        }
      } //resolve the system of equation Lx = D for x, then select just non negative values;


      result.S = zeroInsteadOfNegative(solve(result.A, originalMatrix)); //select rows with positive sum by row

      let sumR = result.S.sum('row');
      let positiveSumRowIndexS = [];
      let positiveSumRowS = [];

      for (let i = 0; i < sumR.length; i++) {
        if (sumR[i] > 0) {
          positiveSumRowIndexS.push(i);
          positiveSumRowS.push(result.S.getRow(i));
        }
      }

      positiveSumRowS = Matrix$2.checkMatrix(positiveSumRowS); // solve the system of linear equation xL = D for x. knowing that D/L = (L'\D')'.

      let candidateA = zeroInsteadOfNegative(solve(positiveSumRowS.transpose(), originalMatrix.transpose())); //then, set the columns of A with an index equal to the row index with sum > 0 into S
      //this step complete the last transpose of D/L = (L'\D')'.

      for (let i = 0; i < positiveSumRowIndexS.length; i++) {
        let colCandidate = candidateA.getRow(i);

        for (let j = 0; j < rows; j++) {
          result.A.set(j, positiveSumRowIndexS[i], colCandidate[j]);
        }
      }

      let prevS = result.S.clone();
      result.S = updateMatrixS(result.A, result.S, originalMatrix, 0, {
        maxFBIteration,
        toleranceFB
      });
      result = checkMatrixS(result, originalMatrix);
      result.A = updateMatrixA(result.A, result.S, originalMatrix, 0);

      if (Matrix$2.sub(prevS, result.S).norm() / result.S.norm() < toleranceFBInit) {
        break;
      }
    }

    return result;
  }

  function normalize$1(data, options) {
    const {
      normOnA
    } = options;
    let DS = normBy(data.S.transpose(), 'column');
    let DA = normBy(data.A, 'column');
    let D = Matrix$2.mul(DS, DA);
    let onS, onA;

    if (normOnA) {
      onS = (index, c) => data.S.get(index, c) * D.get(0, index) / DS.get(0, index);

      onA = (index, r) => data.A.get(r, index) / DA.get(0, index);
    } else {
      onS = (index, c) => data.S.get(index, c) / DS.get(0, index);

      onA = (index, r) => data.A.get(r, index) * D.get(0, index) / DA.get(0, index);
    }

    const sColumns = data.S.columns;
    const aRows = data.A.rows;

    for (let index = 0; index < D.columns; index++) {
      let valueForS, valueForA;

      if (D.get(0, index) > 0) {
        valueForS = onS;
        valueForA = onA;
      } else {
        valueForA = () => 0;

        valueForS = () => 0;
      }

      for (let c = 0; c < sColumns; c++) {
        data.S.set(index, c, valueForS(index, c));
      }

      for (let r = 0; r < aRows; r++) {
        data.A.set(r, index, valueForA(index, r));
      }
    }

    return data;
  }

  function getMedians(X, by) {
    let medians = [];
    let rows = X.rows;
    let columns = X.columns;

    switch (by) {
      case 'column':
        for (let i = 0; i < columns; i++) {
          medians.push(medianQuickselect_min(X.getColumn(i)));
        }

        medians = Matrix$2.from1DArray(1, columns, medians);
        break;

      default:
        for (let i = 0; i < rows; i++) {
          medians.push(medianQuickselect_min(X.getRow(i)));
        }

        medians = Matrix$2.from1DArray(rows, 1, medians);
    }

    return medians;
  }

  function dimMADstd(X, by) {
    let medians = getMedians(X, by);
    let matrix = X.clone();
    matrix = by === 'column' ? matrix.subRowVector(medians.to1DArray()) : matrix.subColumnVector(medians.to1DArray());
    return Matrix$2.mul(getMedians(matrix.abs(), by), 1.4826);
  }

  function updateLambda(data, originalMatrix, options = {}) {
    let {
      refinementBeginning,
      tauMAD
    } = options;
    let {
      iteration,
      lambda,
      A,
      S
    } = data;
    if (refinementBeginning <= iteration) return lambda;
    let sigmaResidue;

    if (options.lambdaInf !== undefined) {
      sigmaResidue = options.lambdaInf / options.tauMAD;
    } else if (options.addStd !== undefined) {
      sigmaResidue = options.addStd;
    } else {
      let alY = Matrix$2.sub(originalMatrix, A.mmul(S)).to1DArray();
      let result = dimMADstd(Matrix$2.from1DArray(1, alY.length, alY), 'row');
      sigmaResidue = result.get(0, 0);
    }

    let nextLambda = Math.max(tauMAD * sigmaResidue, lambda - 1 / (refinementBeginning - iteration));
    return nextLambda;
  }

  /**
   * Performing non-negative matrix factorization solving argmin_(A >= 0, S >= 0) 1 / 2 * ||Y - AS||_2^2 + lambda * ||S||_1
   * @param {Matrix||Array<Array>} originalMatrix - Matrix to be separated.
   * @param {Number} rank - The maximum number of linearly independent column/row vectors in the matrix.
   * @param {Object} [options = {}] - Options of ngmca factorization method.
   * @param {Number} [options.maximumIteration = 500] - Maximum number of iterations.
   * @param {Number} [options.maxFBIteration = 80] - Maximum number of iterations of the Forward-Backward subroutine.
   * @param {Object} [options.randGenerator = Math.random] - Random number generator for the subroutine of initialization.
   * @param {Number} [options.maxInitFBIteration = 50] - Maximum number of iterations of the Forward-Backward subroutine at the initialization.
   * @param {Number} [options.toleranceFB = 1e-5] - relative difference tolerance for convergence of the Forward-Backward sub-iterations.
   * @param {Number} [options.toleranceFBInit = 0] - relative difference tolerance for convergence of the Forward-Backward sub-iterations at the initialization.
   * @param {Number} [options.phaseRatio = 0.8] - transition between decreasing thresholding phase and refinement phase in percent of the iterations.
   * @param {Number} [options.tauMAD = 1] - constant coefficient for the final threshold computation.
   * @param {Boolean} [options.useTranspose = false] - if true the originalMatrix is transposed.
   */

  function nGMCA(originalMatrix, rank, options = {}) {
    const {
      maximumIteration = 500,
      maxFBIteration = 80,
      maxInitFBIteration = 50,
      toleranceFBInit = 0,
      toleranceFB = 0.00001,
      phaseRatio = 0.8,
      randGenerator = Math.random,
      tauMAD = 1,
      useTranspose = false
    } = options;
    let {
      normConstrained = false
    } = options;
    originalMatrix = Matrix$2.checkMatrix(originalMatrix);
    if (useTranspose) originalMatrix = originalMatrix.transpose();
    let refinementBeginning = Math.floor(phaseRatio * maximumIteration);
    let data = initialize(originalMatrix, {
      rank,
      randGenerator,
      maxInitFBIteration,
      toleranceFBInit,
      maxFBIteration,
      toleranceFB
    });
    data = normalize$1(data, {
      normOnA: true
    });
    data.lambda = data.A.transpose().mmul(data.A.mmul(data.S).sub(originalMatrix)).abs().max();

    for (let iter = 0; iter < maximumIteration; iter++) {
      data.iteration = iter;
      data.S = updateMatrixS(data.A, data.S, originalMatrix, data.lambda, options);
      data = checkMatrixS(data, originalMatrix);
      data = normalize$1(data, {
        normOnA: false
      });
      if (iter > refinementBeginning) normConstrained = true;
      data.A = updateMatrixA(data.A, data.S, originalMatrix, {
        maxFBIteration,
        toleranceFB,
        normConstrained,
        lambda: 0
      });
      data = normalize$1(data, {
        normOnA: true
      });
      data.lambda = updateLambda(data, originalMatrix, {
        refinementBeginning,
        tauMAD
      });
    }

    if (useTranspose) {
      let temp = data.A.transpose();
      data.A = data.S.transpose();
      data.S = temp;
    }

    return data;
  }

  var acc = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = (pred.tn[i] + pred.tp[i]) / (l - 1);
    }

    return result;
  }; // Error rate


  var err = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fn[i] + pred.fp[i] / (l - 1);
    }

    return result;
  }; // False positive rate


  var fpr = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fp[i] / pred.nNeg;
    }

    return result;
  }; // True positive rate


  var tpr = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.tp[i] / pred.nPos;
    }

    return result;
  }; // False negative rate


  var fnr = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fn[i] / pred.nPos;
    }

    return result;
  }; // True negative rate


  var tnr = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.tn[i] / pred.nNeg;
    }

    return result;
  }; // Positive predictive value


  var ppv = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fp[i] + pred.tp[i] !== 0 ? pred.tp[i] / (pred.fp[i] + pred.tp[i]) : 0;
    }

    return result;
  }; // Negative predictive value


  var npv = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fn[i] + pred.tn[i] !== 0 ? pred.tn[i] / (pred.fn[i] + pred.tn[i]) : 0;
    }

    return result;
  }; // Prediction conditioned fallout


  var pcfall = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fp[i] + pred.tp[i] !== 0 ? 1 - pred.tp[i] / (pred.fp[i] + pred.tp[i]) : 1;
    }

    return result;
  }; // Prediction conditioned miss


  var pcmiss = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.fn[i] + pred.tn[i] !== 0 ? 1 - pred.tn[i] / (pred.fn[i] + pred.tn[i]) : 1;
    }

    return result;
  }; // Lift value


  var lift = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.nPosPred[i] !== 0 ? pred.tp[i] / pred.nPos / (pred.nPosPred[i] / pred.nSamples) : 0;
    }

    return result;
  }; // Rate of positive predictions


  var rpp = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.nPosPred[i] / pred.nSamples;
    }

    return result;
  }; // Rate of negative predictions


  var rnp = pred => {
    const l = pred.cutoffs.length;
    const result = new Array(l);

    for (var i = 0; i < l; i++) {
      result[i] = pred.nNegPred[i] / pred.nSamples;
    }

    return result;
  }; // Threshold


  var threshold = pred => {
    const clone = pred.cutoffs.slice();
    clone[0] = clone[1]; // Remove the infinite value

    return clone;
  };

  var measures = {
    acc: acc,
    err: err,
    fpr: fpr,
    tpr: tpr,
    fnr: fnr,
    tnr: tnr,
    ppv: ppv,
    npv: npv,
    pcfall: pcfall,
    pcmiss: pcmiss,
    lift: lift,
    rpp: rpp,
    rnp: rnp,
    threshold: threshold
  };

  class Performance {
    /**
     *
     * @param prediction - The prediction matrix
     * @param target - The target matrix (values: truthy for same class, falsy for different class)
     * @param options
     *
     * @option    all    True if the entire matrix must be used. False to ignore the diagonal and lower part (default is false, for similarity/distance matrices)
     * @option    max    True if the max value corresponds to a perfect match (like in similarity matrices), false if it is the min value (default is false, like in distance matrices. All values will be multiplied by -1)
     */
    constructor(prediction, target, options) {
      options = options || {};

      if (prediction.length !== target.length || prediction[0].length !== target[0].length) {
        throw new Error('dimensions of prediction and target do not match');
      }

      const rows = prediction.length;
      const columns = prediction[0].length;
      const isDistance = !options.max;
      const predP = [];

      if (options.all) {
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < columns; j++) {
            predP.push({
              pred: prediction[i][j],
              targ: target[i][j]
            });
          }
        }
      } else {
        if (rows < 3 || rows !== columns) {
          throw new Error('When "all" option is false, the prediction matrix must be square and have at least 3 columns');
        }

        for (var i = 0; i < rows - 1; i++) {
          for (var j = i + 1; j < columns; j++) {
            predP.push({
              pred: prediction[i][j],
              targ: target[i][j]
            });
          }
        }
      }

      if (isDistance) {
        predP.sort((a, b) => a.pred - b.pred);
      } else {
        predP.sort((a, b) => b.pred - a.pred);
      }

      const cutoffs = this.cutoffs = [isDistance ? Number.MIN_VALUE : Number.MAX_VALUE];
      const fp = this.fp = [0];
      const tp = this.tp = [0];
      var nPos = 0;
      var nNeg = 0;
      var currentPred = predP[0].pred;
      var nTp = 0;
      var nFp = 0;

      for (var i = 0; i < predP.length; i++) {
        if (predP[i].pred !== currentPred) {
          cutoffs.push(currentPred);
          fp.push(nFp);
          tp.push(nTp);
          currentPred = predP[i].pred;
        }

        if (predP[i].targ) {
          nPos++;
          nTp++;
        } else {
          nNeg++;
          nFp++;
        }
      }

      cutoffs.push(currentPred);
      fp.push(nFp);
      tp.push(nTp);
      const l = cutoffs.length;
      const fn = this.fn = new Array(l);
      const tn = this.tn = new Array(l);
      const nPosPred = this.nPosPred = new Array(l);
      const nNegPred = this.nNegPred = new Array(l);

      for (var i = 0; i < l; i++) {
        fn[i] = nPos - tp[i];
        tn[i] = nNeg - fp[i];
        nPosPred[i] = tp[i] + fp[i];
        nNegPred[i] = tn[i] + fn[i];
      }

      this.nPos = nPos;
      this.nNeg = nNeg;
      this.nSamples = nPos + nNeg;
    }
    /**
     * Computes a measure from the prediction object.
     *
     * Many measures are available and can be combined :
     * To create a ROC curve, you need fpr and tpr
     * To create a DET curve, you need fnr and fpr
     * To create a Lift chart, you need rpp and lift
     *
     * Possible measures are : threshold (Threshold), acc (Accuracy), err (Error rate),
     * fpr (False positive rate), tpr (True positive rate), fnr (False negative rate), tnr (True negative rate), ppv (Positive predictive value),
     * npv (Negative predictive value), pcfall (Prediction-conditioned fallout), pcmiss (Prediction-conditioned miss), lift (Lift value), rpp (Rate of positive predictions), rnp (Rate of negative predictions)
     *
     * @param measure - The short name of the measure
     *
     * @return [number]
     */


    getMeasure(measure) {
      if (typeof measure !== 'string') {
        throw new Error('No measure specified');
      }

      if (!measures[measure]) {
        throw new Error(`The specified measure (${measure}) does not exist`);
      }

      return measures[measure](this);
    }
    /**
     * Returns the area under the ROC curve
     */


    getAURC() {
      const l = this.cutoffs.length;
      const x = new Array(l);
      const y = new Array(l);

      for (var i = 0; i < l; i++) {
        x[i] = this.fp[i] / this.nNeg;
        y[i] = this.tp[i] / this.nPos;
      }

      var auc = 0;

      for (i = 1; i < l; i++) {
        auc += 0.5 * (x[i] - x[i - 1]) * (y[i] + y[i - 1]);
      }

      return auc;
    }
    /**
     * Returns the area under the DET curve
     */


    getAUDC() {
      const l = this.cutoffs.length;
      const x = new Array(l);
      const y = new Array(l);

      for (var i = 0; i < l; i++) {
        x[i] = this.fn[i] / this.nPos;
        y[i] = this.fp[i] / this.nNeg;
      }

      var auc = 0;

      for (i = 1; i < l; i++) {
        auc += 0.5 * (x[i] + x[i - 1]) * (y[i] - y[i - 1]);
      }

      return auc;
    }

    getDistribution(options) {
      options = options || {};
      var cutLength = this.cutoffs.length;
      var cutLow = options.xMin || Math.floor(this.cutoffs[cutLength - 1] * 100) / 100;
      var cutHigh = options.xMax || Math.ceil(this.cutoffs[1] * 100) / 100;
      var interval = options.interval || Math.floor((cutHigh - cutLow) / 20 * 10000000 - 1) / 10000000; // Trick to avoid the precision problem of float numbers

      var xLabels = [];
      var interValues = [];
      var intraValues = [];
      var interCumPercent = [];
      var intraCumPercent = [];
      var nTP = this.tp[cutLength - 1],
          currentTP = 0;
      var nFP = this.fp[cutLength - 1],
          currentFP = 0;

      for (var i = cutLow, j = cutLength - 1; i <= cutHigh; i += interval) {
        while (this.cutoffs[j] < i) j--;

        xLabels.push(i);
        var thisTP = nTP - currentTP - this.tp[j];
        var thisFP = nFP - currentFP - this.fp[j];
        currentTP += thisTP;
        currentFP += thisFP;
        interValues.push(thisFP);
        intraValues.push(thisTP);
        interCumPercent.push(100 - (nFP - this.fp[j]) / nFP * 100);
        intraCumPercent.push(100 - (nTP - this.tp[j]) / nTP * 100);
      }

      return {
        xLabels: xLabels,
        interValues: interValues,
        intraValues: intraValues,
        interCumPercent: interCumPercent,
        intraCumPercent: intraCumPercent
      };
    }

  }

  Performance.names = {
    acc: 'Accuracy',
    err: 'Error rate',
    fpr: 'False positive rate',
    tpr: 'True positive rate',
    fnr: 'False negative rate',
    tnr: 'True negative rate',
    ppv: 'Positive predictive value',
    npv: 'Negative predictive value',
    pcfall: 'Prediction-conditioned fallout',
    pcmiss: 'Prediction-conditioned miss',
    lift: 'Lift value',
    rpp: 'Rate of positive predictions',
    rnp: 'Rate of negative predictions',
    threshold: 'Threshold'
  };
  var src$2 = Performance;

  var defaultOptions$1 = {
    size: 1,
    value: 0
  };
  /**
   * Case when the entry is an array
   * @param data
   * @param options
   * @returns {Array}
   */

  function arrayCase(data, options) {
    var len = data.length;

    if (typeof options.size === 'number') {
      options.size = [options.size, options.size];
    }

    var cond = len + options.size[0] + options.size[1];
    var output;

    if (options.output) {
      if (options.output.length !== cond) {
        throw new RangeError('Wrong output size');
      }

      output = options.output;
    } else {
      output = new Array(cond);
    }

    var i;

    if (options.value === 'circular') {
      for (i = 0; i < cond; i++) {
        if (i < options.size[0]) {
          output[i] = data[(len - options.size[0] % len + i) % len];
        } else if (i < options.size[0] + len) {
          output[i] = data[i - options.size[0]];
        } else {
          output[i] = data[(i - options.size[0]) % len];
        }
      }
    } else if (options.value === 'replicate') {
      for (i = 0; i < cond; i++) {
        if (i < options.size[0]) output[i] = data[0];else if (i < options.size[0] + len) output[i] = data[i - options.size[0]];else output[i] = data[len - 1];
      }
    } else if (options.value === 'symmetric') {
      if (options.size[0] > len || options.size[1] > len) {
        throw new RangeError('expanded value should not be bigger than the data length');
      }

      for (i = 0; i < cond; i++) {
        if (i < options.size[0]) output[i] = data[options.size[0] - 1 - i];else if (i < options.size[0] + len) output[i] = data[i - options.size[0]];else output[i] = data[2 * len + options.size[0] - i - 1];
      }
    } else {
      for (i = 0; i < cond; i++) {
        if (i < options.size[0]) output[i] = options.value;else if (i < options.size[0] + len) output[i] = data[i - options.size[0]];else output[i] = options.value;
      }
    }

    return output;
  }
  /**
   * Case when the entry is a matrix
   * @param data
   * @param options
   * @returns {Array}
   */


  function matrixCase(data, options) {
    // var row = data.length;
    // var col = data[0].length;
    if (options.size[0] === undefined) {
      options.size = [options.size, options.size, options.size, options.size];
    }

    throw new Error('matrix not supported yet, sorry');
  }
  /**
   * Pads and array
   * @param {Array <number>} data
   * @param {object} options
   */


  function padArray(data, options) {
    options = Object.assign({}, defaultOptions$1, options);

    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) return matrixCase(data, options);else return arrayCase(data, options);
    } else {
      throw new TypeError('data should be an array');
    }
  }

  var src$1 = padArray;

  /**
   * Factorial of a number
   * @ignore
   * @param n
   * @return {number}
   */

  function factorial(n) {
    let r = 1;

    while (n > 0) r *= n--;

    return r;
  }

  const defaultOptions = {
    windowSize: 5,
    derivative: 1,
    polynomial: 2,
    pad: 'none',
    padValue: 'replicate'
  };
  /**
   * Savitzky-Golay filter
   * @param {Array <number>} data
   * @param {number} h
   * @param {Object} options
   * @returns {Array}
   */

  function savitzkyGolay(data, h, options) {
    options = Object.assign({}, defaultOptions, options);

    if (options.windowSize % 2 === 0 || options.windowSize < 5 || !Number.isInteger(options.windowSize)) {
      throw new RangeError('Invalid window size (should be odd and at least 5 integer number)');
    }

    if (options.derivative < 0 || !Number.isInteger(options.derivative)) {
      throw new RangeError('Derivative should be a positive integer');
    }

    if (options.polynomial < 1 || !Number.isInteger(options.polynomial)) {
      throw new RangeError('Polynomial should be a positive integer');
    }

    let C, norm;
    let step = Math.floor(options.windowSize / 2);

    if (options.pad === 'pre') {
      data = src$1(data, {
        size: step,
        value: options.padValue
      });
    }

    let ans = new Array(data.length - 2 * step);

    if (options.windowSize === 5 && options.polynomial === 2 && (options.derivative === 1 || options.derivative === 2)) {
      if (options.derivative === 1) {
        C = [-2, -1, 0, 1, 2];
        norm = 10;
      } else {
        C = [2, -1, -2, -1, 2];
        norm = 7;
      }
    } else {
      let J = Matrix$2.ones(options.windowSize, options.polynomial + 1);
      let inic = -(options.windowSize - 1) / 2;

      for (let i = 0; i < J.rows; i++) {
        for (let j = 0; j < J.columns; j++) {
          if (inic + 1 !== 0 || j !== 0) J.set(i, j, Math.pow(inic + i, j));
        }
      }

      let Jtranspose = new MatrixTransposeView$1(J);
      let Jinv = inverse(Jtranspose.mmul(J));
      C = Jinv.mmul(Jtranspose);
      C = C.getRow(options.derivative);
      norm = 1 / factorial(options.derivative);
    }

    let det = norm * Math.pow(h, options.derivative);

    for (let k = step; k < data.length - step; k++) {
      let d = 0;

      for (let l = 0; l < C.length; l++) d += C[l] * data[l + k - step] / det;

      ans[k - step] = d;
    }

    if (options.pad === 'post') {
      ans = src$1(ans, {
        size: step,
        value: options.padValue
      });
    }

    return ans;
  }

  // auxiliary file to create the 256 look at table elements
  var ans = new Array(256);

  for (var i = 0; i < 256; i++) {
    var num = i;
    var c = 0;

    while (num) {
      num = num & num - 1;
      c++;
    }

    ans[i] = c;
  }

  var creator = ans;

  /**
   * Count the number of true values in an array
   * @param {Array} arr
   * @return {number}
   */


  function count(arr) {
    var c = 0;

    for (var i = 0; i < arr.length; i++) {
      c += creator[arr[i] & 0xff] + creator[arr[i] >> 8 & 0xff] + creator[arr[i] >> 16 & 0xff] + creator[arr[i] >> 24 & 0xff];
    }

    return c;
  }
  /**
   * Logical AND operation
   * @param {Array} arr1
   * @param {Array} arr2
   * @return {Array}
   */


  function and(arr1, arr2) {
    var ans = new Array(arr1.length);

    for (var i = 0; i < arr1.length; i++) ans[i] = arr1[i] & arr2[i];

    return ans;
  }
  /**
   * Logical OR operation
   * @param {Array} arr1
   * @param {Array} arr2
   * @return {Array}
   */


  function or(arr1, arr2) {
    var ans = new Array(arr1.length);

    for (var i = 0; i < arr1.length; i++) ans[i] = arr1[i] | arr2[i];

    return ans;
  }
  /**
   * Logical XOR operation
   * @param {Array} arr1
   * @param {Array} arr2
   * @return {Array}
   */


  function xor(arr1, arr2) {
    var ans = new Array(arr1.length);

    for (var i = 0; i < arr1.length; i++) ans[i] = arr1[i] ^ arr2[i];

    return ans;
  }
  /**
   * Logical NOT operation
   * @param {Array} arr
   * @return {Array}
   */


  function not(arr) {
    var ans = new Array(arr.length);

    for (var i = 0; i < ans.length; i++) ans[i] = ~arr[i];

    return ans;
  }
  /**
   * Gets the n value of array arr
   * @param {Array} arr
   * @param {number} n
   * @return {boolean}
   */


  function getBit(arr, n) {
    var index = n >> 5; // Same as Math.floor(n/32)

    var mask = 1 << 31 - n % 32;
    return Boolean(arr[index] & mask);
  }
  /**
   * Sets the n value of array arr to the value val
   * @param {Array} arr
   * @param {number} n
   * @param {boolean} val
   * @return {Array}
   */


  function setBit(arr, n, val) {
    var index = n >> 5; // Same as Math.floor(n/32)

    var mask = 1 << 31 - n % 32;
    if (val) arr[index] = mask | arr[index];else arr[index] = ~mask & arr[index];
    return arr;
  }
  /**
   * Translates an array of numbers to a string of bits
   * @param {Array} arr
   * @returns {string}
   */


  function toBinaryString(arr) {
    var str = '';

    for (var i = 0; i < arr.length; i++) {
      var obj = (arr[i] >>> 0).toString(2);
      str += '00000000000000000000000000000000'.substr(obj.length) + obj;
    }

    return str;
  }
  /**
   * Creates an array of numbers based on a string of bits
   * @param {string} str
   * @returns {Array}
   */


  function parseBinaryString(str) {
    var len = str.length / 32;
    var ans = new Array(len);

    for (var i = 0; i < len; i++) {
      ans[i] = parseInt(str.substr(i * 32, 32), 2) | 0;
    }

    return ans;
  }
  /**
   * Translates an array of numbers to a hex string
   * @param {Array} arr
   * @returns {string}
   */


  function toHexString(arr) {
    var str = '';

    for (var i = 0; i < arr.length; i++) {
      var obj = (arr[i] >>> 0).toString(16);
      str += '00000000'.substr(obj.length) + obj;
    }

    return str;
  }
  /**
   * Creates an array of numbers based on a hex string
   * @param {string} str
   * @returns {Array}
   */


  function parseHexString(str) {
    var len = str.length / 8;
    var ans = new Array(len);

    for (var i = 0; i < len; i++) {
      ans[i] = parseInt(str.substr(i * 8, 8), 16) | 0;
    }

    return ans;
  }
  /**
   * Creates a human readable string of the array
   * @param {Array} arr
   * @returns {string}
   */


  function toDebug(arr) {
    var binary = toBinaryString(arr);
    var str = '';

    for (var i = 0; i < arr.length; i++) {
      str += '0000'.substr((i * 32).toString(16).length) + (i * 32).toString(16) + ':';

      for (var j = 0; j < 32; j += 4) {
        str += ' ' + binary.substr(i * 32 + j, 4);
      }

      if (i < arr.length - 1) str += '\n';
    }

    return str;
  }

  var src = {
    count: count,
    and: and,
    or: or,
    xor: xor,
    not: not,
    getBit: getBit,
    setBit: setBit,
    toBinaryString: toBinaryString,
    parseBinaryString: parseBinaryString,
    toHexString: toHexString,
    parseHexString: parseHexString,
    toDebug: toDebug
  };

  const GAUSSIAN_EXP_FACTOR = -4 * Math.LN2;
  const ROOT_PI_OVER_LN2 = Math.sqrt(Math.PI / Math.LN2);
  const ROOT_THREE = Math.sqrt(3);
  const ROOT_2LN2 = Math.sqrt(2 * Math.LN2);
  const ROOT_2LN2_MINUS_ONE = Math.sqrt(2 * Math.LN2) - 1;

  // https://en.wikipedia.org/wiki/Error_function#Inverse_functions
  // This code yields to a good approximation
  // If needed a better implementation using polynomial can be found on https://en.wikipedia.org/wiki/Error_function#Inverse_functions
  function erfinv(x) {
    let a = 0.147;
    if (x === 0) return 0;
    let ln1MinusXSqrd = Math.log(1 - x * x);
    let lnEtcBy2Plus2 = ln1MinusXSqrd / 2 + 2 / (Math.PI * a);
    let firstSqrt = Math.sqrt(lnEtcBy2Plus2 ** 2 - ln1MinusXSqrd / a);
    let secondSqrt = Math.sqrt(firstSqrt - lnEtcBy2Plus2);
    return secondSqrt * (x > 0 ? 1 : -1);
  }

  class Gaussian {
    /**
     * @param {object} [options = {}]
     * @param {number} [options.height=4*LN2/(PI*FWHM)] Define the height of the peak, by default area=1 (normalized)
     * @param {number} [options.fwhm = 500] - Full Width at Half Maximum in the number of points in FWHM.
     * @param {number} [options.sd] - Standard deviation, if it's defined options.fwhm will be ignored and the value will be computed sd * Math.sqrt(8 * Math.LN2);
     */
    constructor(options = {}) {
      this.fwhm = options.sd ? Gaussian.widthToFWHM(2 * options.sd) : options.fwhm ? options.fwhm : 500;
      this.height = options.height === undefined ? Math.sqrt(-GAUSSIAN_EXP_FACTOR / Math.PI) / this.fwhm : options.height;
    }
    /**
     * Calculate a gaussian shape
     * @param {object} [options = {}]
     * @param {number} [options.factor = 6] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
     * @param {number} [options.length = fwhm * factor + 1] - total number of points to calculate
     * @return {Float64Array} y values
     */


    getData(options = {}) {
      let {
        length,
        factor = this.getFactor()
      } = options;

      if (!length) {
        length = Math.min(Math.ceil(this.fwhm * factor), Math.pow(2, 25) - 1);
        if (length % 2 === 0) length++;
      }

      const center = (length - 1) / 2;
      const data = new Float64Array(length);

      for (let i = 0; i <= center; i++) {
        data[i] = this.fct(i - center) * this.height;
        data[length - 1 - i] = data[i];
      }

      return data;
    }
    /**
     * Return a parameterized function of a gaussian shape (see README for equation).
     * @param {number} x - x value to calculate.
     * @returns {number} - the y value of gaussian with the current parameters.
     */


    fct(x) {
      return Gaussian.fct(x, this.fwhm);
    }
    /**
     * Calculate the number of times FWHM allows to reach a specific area coverage
     * @param {number} [area=0.9999]
     * @returns {number}
     */


    getFactor(area = 0.9999) {
      return Gaussian.getFactor(area);
    }
    /**
     * Calculate the area of the shape.
     * @returns {number} - returns the area.
     */


    getArea() {
      return Gaussian.getArea(this.fwhm, {
        height: this.height
      });
    }
    /**
     * Compute the value of Full Width at Half Maximum (FWHM) from the width between the inflection points.
     * //https://mathworld.wolfram.com/GaussianFunction.html
     * @param {number} width - Width between the inflection points
     * @returns {number} fwhm
     */


    widthToFWHM(width) {
      //https://mathworld.wolfram.com/GaussianFunction.html
      return Gaussian.widthToFWHM(width);
    }
    /**
     * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
     * //https://mathworld.wolfram.com/GaussianFunction.html
     * @param {number} fwhm - Full Width at Half Maximum.
     * @returns {number} width
     */


    fwhmToWidth(fwhm = this.fwhm) {
      return Gaussian.fwhmToWidth(fwhm);
    }
    /**
     * set a new full width at half maximum
     * @param {number} fwhm - full width at half maximum
     */


    setFWHM(fwhm) {
      this.fwhm = fwhm;
    }
    /**
     * set a new height
     * @param {number} height - The maximal intensity of the shape.
     */


    setHeight(height) {
      this.height = height;
    }

  }
  /**
   * Return a parameterized function of a gaussian shape (see README for equation).
   * @param {number} x - x value to calculate.
   * @param {number} fwhm - full width half maximum
   * @returns {number} - the y value of gaussian with the current parameters.
   */

  Gaussian.fct = function fct(x, fwhm = 500) {
    return Math.exp(GAUSSIAN_EXP_FACTOR * Math.pow(x / fwhm, 2));
  };
  /**
   * Compute the value of Full Width at Half Maximum (FWHM) from the width between the inflection points.
   * //https://mathworld.wolfram.com/GaussianFunction.html
   * @param {number} width - Width between the inflection points
   * @returns {number} fwhm
   */


  Gaussian.widthToFWHM = function widthToFWHM(width) {
    return width * ROOT_2LN2;
  };
  /**
   * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
   * //https://mathworld.wolfram.com/GaussianFunction.html
   * @param {number} fwhm - Full Width at Half Maximum.
   * @returns {number} width
   */


  Gaussian.fwhmToWidth = function fwhmToWidth(fwhm) {
    return fwhm / ROOT_2LN2;
  };
  /**
   * Calculate the area of a specific shape.
   * @param {number} fwhm - Full width at half maximum.
   * @param {object} [options = {}] - options.
   * @param {number} [options.height = 1] - Maximum y value of the shape.
   * @returns {number} - returns the area of the specific shape and parameters.
   */


  Gaussian.getArea = function getArea(fwhm, options = {}) {
    let {
      height = 1
    } = options;
    return height * ROOT_PI_OVER_LN2 * fwhm / 2;
  };
  /**
   * Calculate the number of times FWHM allows to reach a specific area coverage.
   * @param {number} [area=0.9999]
   * @returns {number}
   */


  Gaussian.getFactor = function getFactor(area = 0.9999) {
    return Math.sqrt(2) * erfinv(area);
  };

  class Lorentzian {
    /**
     * @param {object} [options = {}]
     * @param {number} [options.height=2/(PI*FWHM)] Define the height of the peak, by default area=1 (normalized)
     * @param {number} [options.fwhm = 500] - Full Width at Half Maximum in the number of points in FWHM.
     * @param {number} [options.sd] - Standard deviation, if it's defined options.fwhm will be ignored and the value will be computed sd * Math.sqrt(8 * Math.LN2);
     */
    constructor(options = {}) {
      this.fwhm = options.fwhm === undefined ? 500 : options.fwhm;
      this.height = options.height === undefined ? 2 / Math.PI / this.fwhm : options.height;
    }
    /**
     * Calculate a lorentzian shape
     * @param {object} [options = {}]
     * @param {number} [options.factor = Math.tan(Math.PI * (0.9999 - 0.5))] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
     * @param {number} [options.length = fwhm * factor + 1] - total number of points to calculate
     * @return {Float64Array} y values
     */


    getData(options = {}) {
      let {
        length,
        factor = this.getFactor()
      } = options;

      if (!length) {
        length = Math.min(Math.ceil(this.fwhm * factor), Math.pow(2, 25) - 1);
        if (length % 2 === 0) length++;
      }

      const center = (length - 1) / 2;
      const data = new Float64Array(length);

      for (let i = 0; i <= center; i++) {
        data[i] = this.fct(i - center) * this.height;
        data[length - 1 - i] = data[i];
      }

      return data;
    }
    /**
     * Return a parameterized function of a lorentzian shape (see README for equation).
     * @param {number} x - x value to calculate.
     * @returns {number} - the y value of lorentzian with the current parameters.
     */


    fct(x) {
      return Lorentzian.fct(x, this.fwhm);
    }
    /**
     * Calculate the number of times FWHM allows to reach a specific area coverage
     * @param {number} [area=0.9999]
     * @returns {number}
     */


    getFactor(area = 0.9999) {
      return Lorentzian.getFactor(area);
    }
    /**
     * Calculate the area of the shape.
     * @returns {number} - returns the area.
     */


    getArea() {
      return Lorentzian.getArea(this.fwhm, {
        height: this.height
      });
    }
    /**
     * Compute the value of width between the inflection points of a specific shape from Full Width at Half Maximum (FWHM).
     * //https://mathworld.wolfram.com/LorentzianFunction.html
     * @param {number} [fwhm] - Full Width at Half Maximum.
     * @returns {number} width between the inflection points
     */


    fwhmToWidth(fwhm = this.fwhm) {
      return Lorentzian.fwhmToWidth(fwhm);
    }
    /**
     * Compute the value of Full Width at Half Maximum (FWHM) of a specific shape from the width between the inflection points.
     * //https://mathworld.wolfram.com/LorentzianFunction.html
     * @param {number} [width] Width between the inflection points
     * @returns {number} fwhm
     */


    widthToFWHM(width) {
      return Lorentzian.widthToFWHM(width);
    }
    /**
     * set a new full width at half maximum
     * @param {number} fwhm - full width at half maximum
     */


    setFWHM(fwhm) {
      this.fwhm = fwhm;
    }
    /**
     * set a new height
     * @param {number} height - The maximal intensity of the shape.
     */


    setHeight(height) {
      this.height = height;
    }

  }
  /**
   * Return a parameterized function of a gaussian shape (see README for equation).
   * @param {number} x - x value to calculate.
   * @param {number} fwhm - full width half maximum
   * @returns {number} - the y value of gaussian with the current parameters.
   */

  Lorentzian.fct = function fct(x, fwhm) {
    const squareFWHM = fwhm * fwhm;
    return squareFWHM / (4 * Math.pow(x, 2) + squareFWHM);
  };
  /**
   * Compute the value of width between the inflection points of a specific shape from Full Width at Half Maximum (FWHM).
   * //https://mathworld.wolfram.com/LorentzianFunction.html
   * @param {number} [fwhm] - Full Width at Half Maximum.
   * @returns {number} width between the inflection points
   */


  Lorentzian.fwhmToWidth = function fwhmToWidth(fwhm) {
    return fwhm / ROOT_THREE;
  };
  /**
   * Compute the value of Full Width at Half Maximum (FWHM) of a specific shape from the width between the inflection points.
   * //https://mathworld.wolfram.com/LorentzianFunction.html
   * @param {number} [width] Width between the inflection points
   * @returns {number} fwhm
   */


  Lorentzian.widthToFWHM = function widthToFWHM(width) {
    return width * ROOT_THREE;
  };
  /**
   * Calculate the area of a specific shape.
   * @param {number} fwhm - Full width at half maximum.
   * @param {*} [options = {}] - options.
   * @param {number} [options.height = 1] - Maximum y value of the shape.
   * @returns {number} - returns the area of the specific shape and parameters.
   */


  Lorentzian.getArea = function getArea(fwhm, options = {}) {
    let {
      height = 1
    } = options;
    return height * Math.PI * fwhm / 2;
  };
  /**
   * Calculate the number of times FWHM allows to reach a specific area coverage
   * @param {number} [area=0.9999]
   * @returns {number}
   */


  Lorentzian.getFactor = function getFactor(area = 0.9999) {
    return 2 * Math.tan(Math.PI * (area - 0.5));
  };

  class PseudoVoigt {
    /**
     * @param {object} [options={}]
     * @param {number} [options.height=1/(mu*FWHM/sqrt(4*LN2/PI)+(1-mu)*fwhm*PI*0.5)] Define the height of the peak, by default area=1 (normalized)
     * @param {number} [options.fwhm=500] - Full Width at Half Maximum in the number of points in FWHM.
     * @param {number} [options.mu=0.5] - ratio of gaussian contribution.
     */
    constructor(options = {}) {
      this.mu = options.mu === undefined ? 0.5 : options.mu;
      this.fwhm = options.fwhm === undefined ? 500 : options.fwhm;
      this.height = options.height === undefined ? 1 / (this.mu / Math.sqrt(-GAUSSIAN_EXP_FACTOR / Math.PI) * this.fwhm + (1 - this.mu) * this.fwhm * Math.PI / 2) : options.height;
    }
    /**
     * Calculate a linear combination of gaussian and lorentzian function width an same full width at half maximum
     * @param { object } [options = {}]
     * @param { number } [options.factor = 2 * Math.tan(Math.PI * (0.9999 - 0.5))] - Number of time to take fwhm in the calculation of the length.Default covers 99.99 % of area.
     * @param { number } [options.length = fwhm * factor + 1] - total number of points to calculate
     * @return { object } - { fwhm, data<Float64Array>} - An with the number of points at half maximum and the array of y values covering the 99.99 % of the area.
     */


    getData(options = {}) {
      let {
        length,
        factor = this.getFactor()
      } = options;

      if (!length) {
        length = Math.ceil(this.fwhm * factor);
        if (length % 2 === 0) length++;
      }

      const center = (length - 1) / 2;
      let data = new Float64Array(length);

      for (let i = 0; i <= center; i++) {
        data[i] = this.fct(i - center) * this.height;
        data[length - 1 - i] = data[i];
      }

      return data;
    }
    /**
     * Return a parameterized function of a linear combination of Gaussian and Lorentzian shapes where the full width at half maximum are the same for both kind of shapes (see README for equation).
     * @param {number} [x] x value to calculate.
     * @returns {number} - the y value of a pseudo voigt with the current parameters.
     */


    fct(x) {
      return PseudoVoigt.fct(x, this.fwhm, this.mu);
    }
    /**
     * Calculate the number of times FWHM allows to reach a specific area coverage
     * @param {number} [area=0.9999] - required area to be coverage
     * @param {number} [mu=this.mu] - ratio of gaussian contribution.
     * @returns {number}
     */


    getFactor(area = 0.9999, mu = this.mu) {
      return PseudoVoigt.getFactor(area, mu);
    }
    /**
     * Calculate the area of the shape.
     * @returns {number} - returns the area.
     */


    getArea() {
      return PseudoVoigt.getArea(this.fwhm, {
        height: this.height,
        mu: this.mu
      });
    }
    /**
     * Compute the value of Full Width at Half Maximum (FMHM) from width between the inflection points.
     * @param {number} width - width between the inflection points
     * @param {number} [mu = 0.5] - ratio of gaussian contribution.
     * @returns {number} Full Width at Half Maximum (FMHM).
     */


    widthToFWHM(width, mu) {
      return PseudoVoigt.widthToFWHM(width, mu);
    }
    /**
     * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
     * @param {number} fwhm - Full Width at Half Maximum.
     * @param {number} [mu] - ratio of gaussian contribution.
     * @returns {number} width between the inflection points.
     */


    fwhmToWidth(fwhm = this.fwhm, mu = this.mu) {
      return PseudoVoigt.fwhmToWidth(fwhm, mu);
    }
    /**
     * set a new full width at half maximum
     * @param {number} fwhm - full width at half maximum
     */


    setFWHM(fwhm) {
      this.fwhm = fwhm;
    }
    /**
     * set a new height
     * @param {number} height - The maximal intensity of the shape.
     */


    setHeight(height) {
      this.height = height;
    }
    /**
     * set a new mu
     * @param {number} mu - ratio of gaussian contribution.
     */


    setMu(mu) {
      this.mu = mu;
    }

  }
  /**
   * Return a parameterized function of a gaussian shape (see README for equation).
   * @param {number} x - x value to calculate.
   * @param {number} fwhm - full width half maximum
   * @param {number} [mu=0.5] - ratio of gaussian contribution.
   * @returns {number} - the y value of gaussian with the current parameters.
   */

  PseudoVoigt.fct = function fct(x, fwhm, mu = 0.5) {
    return (1 - mu) * Lorentzian.fct(x, fwhm) + mu * Gaussian.fct(x, fwhm);
  };
  /**
   * Compute the value of Full Width at Half Maximum (FMHM) from width between the inflection points.
   * @param {number} width - width between the inflection points
   * @param {number} [mu = 0.5] - ratio of gaussian contribution.
   * @returns {number} Full Width at Half Maximum (FMHM).
   */


  PseudoVoigt.widthToFWHM = function widthToFWHM(width, mu = 0.5) {
    return width * (mu * ROOT_2LN2_MINUS_ONE + 1);
  };
  /**
   * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
   * @param {number} fwhm - Full Width at Half Maximum.
   * @param {number} [mu = 0.5] - ratio of gaussian contribution.
   * @returns {number} width between the inflection points.
   */


  PseudoVoigt.fwhmToWidth = function fwhmToWidth(fwhm, mu = 0.5) {
    return fwhm / (mu * ROOT_2LN2_MINUS_ONE + 1);
  };
  /**
   * Calculate the area of a specific shape.
   * @param {number} fwhm - Full width at half maximum.
   * @param {*} [options = {}] - options.
   * @param {number} [options.height = 1] - Maximum y value of the shape.
   * @param {number} [options.mu = 0.5] - ratio of gaussian contribution.
   * @returns {number} - returns the area of the specific shape and parameters.
   */


  PseudoVoigt.getArea = function getArea(fwhm, options = {}) {
    let {
      height = 1,
      mu = 0.5
    } = options;
    return fwhm * height * (mu * ROOT_PI_OVER_LN2 + (1 - mu) * Math.PI) / 2;
  };
  /**
   * Calculate the number of times FWHM allows to reach a specific area coverage
   * @param {number} [area=0.9999] - required area to be coverage
   * @param {number} [mu=this.mu] - ratio of gaussian contribution.
   * @returns {number}
   */


  PseudoVoigt.getFactor = function getFactor(area = 0.9999, mu = 0.5) {
    return mu < 1 ? Lorentzian.getFactor(area) : Gaussian.getFactor(area);
  };

  let axis = ['x', 'y'];
  class Gaussian2D {
    /**
     * @param {object} [options = {}]
     * @param {number} [options.height=4*LN2/(PI*xFWHM*yFWHM)] Define the height of the peak, by default area=1 (normalized).
     * @param {number} [options.fwhm = 500] - Full Width at Half Maximum in the number of points in FWHM used if x or y has not the fwhm property.
     * @param {object} [options.x] - Options for x axis.
     * @param {number} [options.x.fwhm = fwhm] - Full Width at Half Maximum in the number of points in FWHM for x axis.
     * @param {number} [options.x.sd] - Standard deviation for x axis, if it's defined options.x.fwhm will be ignored and the value will be computed sd * Math.sqrt(8 * Math.LN2);
     * @param {object} [options.y] - Options for y axis.
     * @param {number} [options.y.fwhm = fwhm] - Full Width at Half Maximum in the number of points in FWHM for y axis.
     * @param {number} [options.y.sd] - Standard deviation for y axis, if it's defined options.y.fwhm will be ignored and the value will be computed sd * Math.sqrt(8 * Math.LN2);
     */
    constructor(options = {}) {
      let {
        fwhm: globalFWHM = 500
      } = options;

      for (let i of axis) {
        let fwhm;

        if (!options[i]) {
          fwhm = globalFWHM;
        } else {
          fwhm = options[i].sd ? Gaussian2D.widthToFWHM(2 * options[i].sd) : options[i].fwhm || globalFWHM;
        }

        this[i] = {
          fwhm
        };
      }

      this.height = options.height === undefined ? -GAUSSIAN_EXP_FACTOR / Math.PI / this.x.fwhm / this.y.fwhm : options.height;
    }
    /**
     * Calculate a Gaussian2D shape
     * @param {object} [options = {}]
     * @param {number} [options.factor] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
     * @param {object} [options.x] - parameter for x axis.
     * @param {number} [options.x.length=fwhm*factor+1] - length on x axis.
     * @param {number} [options.x.factor=factor] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
     * @param {object} [options.y] - parameter for y axis.
     * @param {number} [options.y.length=fwhm*factor+1] - length on y axis.
     * @param {number} [options.y.factor=factor] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
     * @return {Array<Float64Array>} - z values.
     */


    getData(options = {}) {
      let {
        x = {},
        y = {},
        factor = this.getFactor(),
        length
      } = options;
      let xLength = x.length || length;

      if (!xLength) {
        let {
          factor: xFactor = factor
        } = x;
        xLength = Math.min(Math.ceil(this.x.fwhm * xFactor), Math.pow(2, 25) - 1);
        if (xLength % 2 === 0) xLength++;
      }

      let yLength = y.length || length;

      if (!yLength) {
        let {
          factor: yFactor = factor
        } = y;
        yLength = Math.min(Math.ceil(this.y.fwhm * yFactor), Math.pow(2, 25) - 1);
        if (yLength % 2 === 0) yLength++;
      }

      const xCenter = (xLength - 1) / 2;
      const yCenter = (yLength - 1) / 2;
      const data = new Array(xLength);

      for (let i = 0; i < xLength; i++) {
        data[i] = new Array(yLength);
      }

      for (let i = 0; i < xLength; i++) {
        for (let j = 0; j < yLength; j++) {
          data[i][j] = this.fct(i - xCenter, j - yCenter) * this.height;
        }
      }

      return data;
    }
    /**
     * Return the intensity value of a 2D gaussian shape (see README for equation).
     * @param {number} x - x value to calculate.
     * @param {number} y - y value to calculate.
     * @returns {number} - the z value of bi-dimensional gaussian with the current parameters.
     */


    fct(x, y) {
      return Gaussian2D.fct(x, y, this.x.fwhm, this.y.fwhm);
    }
    /**
     * Calculate the number of times FWHM allows to reach a specific volume coverage.
     * @param {number} [volume=0.9999]
     * @returns {number}
     */


    getFactor(volume = 0.9999) {
      return Gaussian2D.getFactor(volume);
    }
    /**
     * Calculate the volume of the shape.
     * @returns {number} - returns the volume.
     */


    getVolume() {
      return Gaussian2D.getVolume(this.x.fwhm, this.y.fwhm, {
        height: this.height
      });
    }
    /**
     * Compute the value of Full Width at Half Maximum (FWHM) from the width between the inflection points.
     * //https://mathworld.wolfram.com/Gaussian2DFunction.html
     * @param {number} width - Width between the inflection points
     * @returns {number} fwhm
     */


    widthToFWHM(width) {
      //https://mathworld.wolfram.com/Gaussian2DFunction.html
      return Gaussian2D.widthToFWHM(width);
    }
    /**
     * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
     * //https://mathworld.wolfram.com/Gaussian2DFunction.html
     * @param {number} fwhm - Full Width at Half Maximum.
     * @returns {number} width
     */


    fwhmToWidth(fwhm = this.x.fwhm) {
      return Gaussian2D.fwhmToWidth(fwhm);
    }
    /**
     * set a new full width at half maximum
     * @param {number} fwhm - full width at half maximum
     * @param {string|Array<string>} axisLabel - label of axis, if it is undefined fwhm is set to both axis.
     */


    setFWHM(fwhm, axisLabel) {
      if (!axisLabel) axisLabel = axis;
      if (!Array.isArray(axisLabel)) axisLabel = [axisLabel];

      for (let i of axisLabel) {
        let axisName = i.toLowerCase();

        if (axisName !== 'y' && axisName !== 'x') {
          throw new Error('axis label should be x or y');
        }

        this[axisName].fwhm = fwhm;
      }
    }
    /**
     * set a new height
     * @param {number} height - The maximal intensity of the shape.
     */


    setHeight(height) {
      this.height = height;
    }

  }
  /**
   * Return a parameterized function of a Gaussian2D shape (see README for equation).
   * @param {number} x - x value to calculate.
   * @param {number} y - y value to calculate.
   * @param {number} fwhmX - full width half maximum in the x axis.
   * @param {number} fwhmY - full width half maximum in the y axis.
   * @returns {number} - the z value of bi-dimensional gaussian with the current parameters.
   */

  Gaussian2D.fct = function fct(x, y, xFWHM = 500, yFWHM = 500) {
    return Math.exp(GAUSSIAN_EXP_FACTOR * (Math.pow(x / xFWHM, 2) + Math.pow(y / yFWHM, 2)));
  };
  /**
   * Compute the value of Full Width at Half Maximum (FWHM) from the width between the inflection points.
   * //https://mathworld.wolfram.com/Gaussian2DFunction.html
   * @param {number} width - Width between the inflection points
   * @returns {number} fwhm
   */


  Gaussian2D.widthToFWHM = function widthToFWHM(width) {
    return width * ROOT_2LN2;
  };
  /**
   * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
   * //https://mathworld.wolfram.com/Gaussian2DFunction.html
   * @param {number} fwhm - Full Width at Half Maximum.
   * @returns {number} width
   */


  Gaussian2D.fwhmToWidth = function fwhmToWidth(fwhm) {
    return fwhm / ROOT_2LN2;
  };
  /**
   * Calculate the volume of a specific shape.
   * @param {number} xFWHM - Full width at half maximum for x axis.
   * @param {number} yFWHM - Full width at half maximum for y axis.
   * @param {object} [options = {}] - options.
   * @param {number} [options.height = 1] - Maximum z value of the shape.
   * @returns {number} - returns the area of the specific shape and parameters.
   */


  Gaussian2D.getVolume = function getVolume(xFWHM, yFWHM, options = {}) {
    let {
      height = 1
    } = options;
    return height * Math.PI * xFWHM * yFWHM / Math.LN2 / 4;
  };
  /**@TODO look for a better factor
   * Calculate the number of times FWHM allows to reach a specific volume coverage.
   * @param {number} [volume=0.9999]
   * @returns {number}
   */


  Gaussian2D.getFactor = function getFactor(volume = 0.9999) {
    return Math.sqrt(2) * erfinv(volume);
  };

  function getShapeGenerator(options) {
    let {
      kind = 'Gaussian',
      options: shapeOptions
    } = options;

    switch (kind.toLowerCase().replace(/[^a-z^0-9]/g, '')) {
      case 'gaussian':
        return new Gaussian(shapeOptions);

      case 'lorentzian':
        return new Lorentzian(shapeOptions);

      case 'pseudovoigt':
        return new PseudoVoigt(shapeOptions);

      case 'gaussian2d':
        return new Gaussian2D(shapeOptions);

      default:
        throw new Error(`Unknown kind: ${kind}`);
    }
  }

  /**
   * Apply Savitzky Golay algorithm
   * @param {array} [ys] Array of y values
   * @param {array|number} [xs] Array of X or deltaX
   * @param {object} [options={}]
   * @param {number} [options.windowSize=9]
   * @param {number} [options.derivative=0]
   * @param {number} [options.polynomial=3]
   * @return {array} Array containing the new ys (same length)
   */
  function SavitzkyGolay(ys, xs, options = {}) {
    let {
      windowSize = 9,
      derivative = 0,
      polynomial = 3
    } = options;

    if (windowSize % 2 === 0 || windowSize < 5 || !Number.isInteger(windowSize)) {
      throw new RangeError('Invalid window size (should be odd and at least 5 integer number)');
    }

    if (windowSize > ys.length) {
      throw new RangeError(`Window size is higher than the data length ${windowSize}>${ys.length}`);
    }

    if (derivative < 0 || !Number.isInteger(derivative)) {
      throw new RangeError('Derivative should be a positive integer');
    }

    if (polynomial < 1 || !Number.isInteger(polynomial)) {
      throw new RangeError('Polynomial should be a positive integer');
    }

    if (polynomial >= 6) {
      // eslint-disable-next-line no-console
      console.warn('You should not use polynomial grade higher than 5 if you are' + ' not sure that your data arises from such a model. Possible polynomial oscillation problems');
    }

    let half = Math.floor(windowSize / 2);
    let np = ys.length;
    let ans = new Array(np);
    let weights = fullWeights(windowSize, polynomial, derivative);
    let hs = 0;
    let constantH = true;

    if (Array.isArray(xs)) {
      constantH = false;
    } else {
      hs = Math.pow(xs, derivative);
    } //For the borders


    for (let i = 0; i < half; i++) {
      let wg1 = weights[half - i - 1];
      let wg2 = weights[half + i + 1];
      let d1 = 0;
      let d2 = 0;

      for (let l = 0; l < windowSize; l++) {
        d1 += wg1[l] * ys[l];
        d2 += wg2[l] * ys[np - windowSize + l];
      }

      if (constantH) {
        ans[half - i - 1] = d1 / hs;
        ans[np - half + i] = d2 / hs;
      } else {
        hs = getHs(xs, half - i - 1, half, derivative);
        ans[half - i - 1] = d1 / hs;
        hs = getHs(xs, np - half + i, half, derivative);
        ans[np - half + i] = d2 / hs;
      }
    } //For the internal points


    let wg = weights[half];

    for (let i = windowSize; i <= np; i++) {
      let d = 0;

      for (let l = 0; l < windowSize; l++) d += wg[l] * ys[l + i - windowSize];

      if (!constantH) hs = getHs(xs, i - half - 1, half, derivative);
      ans[i - half - 1] = d / hs;
    }

    return ans;
  }

  function getHs(h, center, half, derivative) {
    let hs = 0;
    let count = 0;

    for (let i = center - half; i < center + half; i++) {
      if (i >= 0 && i < h.length - 1) {
        hs += h[i + 1] - h[i];
        count++;
      }
    }

    return Math.pow(hs / count, derivative);
  }

  function GramPoly(i, m, k, s) {
    let Grampoly = 0;

    if (k > 0) {
      Grampoly = (4 * k - 2) / (k * (2 * m - k + 1)) * (i * GramPoly(i, m, k - 1, s) + s * GramPoly(i, m, k - 1, s - 1)) - (k - 1) * (2 * m + k) / (k * (2 * m - k + 1)) * GramPoly(i, m, k - 2, s);
    } else {
      if (k === 0 && s === 0) {
        Grampoly = 1;
      } else {
        Grampoly = 0;
      }
    }

    return Grampoly;
  }

  function GenFact(a, b) {
    let gf = 1;

    if (a >= b) {
      for (let j = a - b + 1; j <= a; j++) {
        gf *= j;
      }
    }

    return gf;
  }

  function Weight(i, t, m, n, s) {
    let sum = 0;

    for (let k = 0; k <= n; k++) {
      //console.log(k);
      sum += (2 * k + 1) * (GenFact(2 * m, k) / GenFact(2 * m + k + 1, k + 1)) * GramPoly(i, m, k, 0) * GramPoly(t, m, k, s);
    }

    return sum;
  }
  /**
   *
   * @param m  Number of points
   * @param n  Polynomial grade
   * @param s  Derivative
   */


  function fullWeights(m, n, s) {
    let weights = new Array(m);
    let np = Math.floor(m / 2);

    for (let t = -np; t <= np; t++) {
      weights[t + np] = new Array(m);

      for (let j = -np; j <= np; j++) {
        weights[t + np][j + np] = Weight(j, t, np, n, s);
      }
    }

    return weights;
  }
  /*function entropy(data,h,options){
      var trend = SavitzkyGolay(data,h,trendOptions);
      var copy = new Array(data.length);
      var sum = 0;
      var max = 0;
      for(var i=0;i<data.length;i++){
          copy[i] = data[i]-trend[i];
      }

      sum/=data.length;
      console.log(sum+" "+max);
      console.log(stat.array.standardDeviation(copy));
      console.log(Math.abs(stat.array.mean(copy))/stat.array.standardDeviation(copy));
      return sum;

  }



  function guessWindowSize(data, h){
      console.log("entropy "+entropy(data,h,trendOptions));
      return 5;
  }
  */

  /**
   * Global spectra deconvolution
   * @param {object} data - Object data with x and y arrays
   * @param {Array<number>} [data.x] - Independent variable
   * @param {Array<number>} [data.y] - Dependent variable
   * @param {object} [options={}] - Options object
   * @param {object} [options.shape={}] - Object that specified the kind of shape to calculate the FWHM instead of width between inflection points. see https://mljs.github.io/peak-shape-generator/#inflectionpointswidthtofwhm
   * @param {object} [options.shape.kind='gaussian']
   * @param {object} [options.shape.options={}]
   * @param {object} [options.sgOptions] - Options object for Savitzky-Golay filter. See https://github.com/mljs/savitzky-golay-generalized#options
   * @param {number} [options.sgOptions.windowSize = 9] - points to use in the approximations
   * @param {number} [options.sgOptions.polynomial = 3] - degree of the polynomial to use in the approximations
   * @param {number} [options.minMaxRatio = 0.00025] - Threshold to determine if a given peak should be considered as a noise
   * @param {number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
   * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.
   * @param {number} [options.noiseLevel = 0] - Noise threshold in spectrum units
   * @param {boolean} [options.maxCriteria = true] - Peaks are local maximum(true) or minimum(false)
   * @param {boolean} [options.smoothY = true] - Select the peak intensities from a smoothed version of the independent variables
   * @param {boolean} [options.realTopDetection = false] - Use a quadratic optimizations with the peak and its 3 closest neighbors
   * to determine the true x,y values of the peak?
   * @param {number} [options.heightFactor = 0] - Factor to multiply the calculated height (usually 2)
   * @param {number} [options.derivativeThreshold = -1] - Filters based on the amplitude of the first derivative
   * @return {Array<object>}
   */

  function gsd(data, options = {}) {
    let {
      noiseLevel,
      sgOptions = {
        windowSize: 9,
        polynomial: 3
      },
      shape = {},
      smoothY = true,
      heightFactor = 0,
      broadRatio = 0.0,
      maxCriteria = true,
      minMaxRatio = 0.00025,
      derivativeThreshold = -1,
      realTopDetection = false
    } = options;
    let {
      y: yIn,
      x
    } = data;
    const y = yIn.slice();
    let equalSpaced = isEqualSpaced(x);

    if (noiseLevel === undefined) {
      noiseLevel = equalSpaced ? getNoiseLevel(y) : 0;
    }

    const yCorrection = {
      m: 1,
      b: noiseLevel
    };

    if (!maxCriteria) {
      yCorrection.m = -1;
      yCorrection.b *= -1;
    }

    for (let i = 0; i < y.length; i++) {
      y[i] = yCorrection.m * y[i] - yCorrection.b;
    }

    for (let i = 0; i < y.length; i++) {
      if (y[i] < 0) {
        y[i] = 0;
      }
    } // If the max difference between delta x is less than 5%, then,
    // we can assume it to be equally spaced variable


    let yData = y;
    let dY, ddY;
    const {
      windowSize,
      polynomial
    } = sgOptions;

    if (equalSpaced) {
      if (smoothY) {
        yData = SavitzkyGolay(y, x[1] - x[0], {
          windowSize,
          polynomial,
          derivative: 0
        });
      }

      dY = SavitzkyGolay(y, x[1] - x[0], {
        windowSize,
        polynomial,
        derivative: 1
      });
      ddY = SavitzkyGolay(y, x[1] - x[0], {
        windowSize,
        polynomial,
        derivative: 2
      });
    } else {
      if (smoothY) {
        yData = SavitzkyGolay(y, x, {
          windowSize,
          polynomial,
          derivative: 0
        });
      }

      dY = SavitzkyGolay(y, x, {
        windowSize,
        polynomial,
        derivative: 1
      });
      ddY = SavitzkyGolay(y, x, {
        windowSize,
        polynomial,
        derivative: 2
      });
    }

    const xData = x;
    const dX = x[1] - x[0];
    let maxDdy = 0;
    let maxY = 0;

    for (let i = 0; i < yData.length; i++) {
      if (Math.abs(ddY[i]) > maxDdy) {
        maxDdy = Math.abs(ddY[i]);
      }

      if (Math.abs(yData[i]) > maxY) {
        maxY = Math.abs(yData[i]);
      }
    }

    let lastMax = null;
    let lastMin = null;
    let minddY = [];
    let intervalL = [];
    let intervalR = [];
    let broadMask = []; // By the intermediate value theorem We cannot find 2 consecutive maximum or minimum

    for (let i = 1; i < yData.length - 1; ++i) {
      // filter based on derivativeThreshold
      // console.log('pasa', y[i], dY[i], ddY[i]);
      if (Math.abs(dY[i]) > derivativeThreshold) {
        // Minimum in first derivative
        if (dY[i] < dY[i - 1] && dY[i] <= dY[i + 1] || dY[i] <= dY[i - 1] && dY[i] < dY[i + 1]) {
          lastMin = {
            x: xData[i],
            index: i
          };

          if (dX > 0 && lastMax !== null) {
            intervalL.push(lastMax);
            intervalR.push(lastMin);
          }
        } // Maximum in first derivative


        if (dY[i] >= dY[i - 1] && dY[i] > dY[i + 1] || dY[i] > dY[i - 1] && dY[i] >= dY[i + 1]) {
          lastMax = {
            x: xData[i],
            index: i
          };

          if (dX < 0 && lastMin !== null) {
            intervalL.push(lastMax);
            intervalR.push(lastMin);
          }
        }
      } // Minimum in second derivative


      if (ddY[i] < ddY[i - 1] && ddY[i] < ddY[i + 1]) {
        minddY.push(i);
        broadMask.push(Math.abs(ddY[i]) <= broadRatio * maxDdy);
      }
    }

    let widthProcessor = shape.kind ? getShapeGenerator(shape.kind, shape.options).widthToFWHM : x => x;
    let signals = [];
    let lastK = -1;
    let possible, frequency, distanceJ, minDistance, gettingCloser;

    for (let j = 0; j < minddY.length; ++j) {
      frequency = xData[minddY[j]];
      possible = -1;
      let k = lastK + 1;
      minDistance = Number.MAX_VALUE;
      distanceJ = 0;
      gettingCloser = true;

      while (possible === -1 && k < intervalL.length && gettingCloser) {
        distanceJ = Math.abs(frequency - (intervalL[k].x + intervalR[k].x) / 2); // Still getting closer?

        if (distanceJ < minDistance) {
          minDistance = distanceJ;
        } else {
          gettingCloser = false;
        }

        if (distanceJ < Math.abs(intervalL[k].x - intervalR[k].x) / 2) {
          possible = k;
          lastK = k;
        }

        ++k;
      }

      if (possible !== -1) {
        if (Math.abs(yData[minddY[j]]) > minMaxRatio * maxY) {
          let width = Math.abs(intervalR[possible].x - intervalL[possible].x);
          signals.push({
            index: minddY[j],
            x: frequency,
            y: (yData[minddY[j]] + yCorrection.b) / yCorrection.m,
            width: widthProcessor(width),
            soft: broadMask[j]
          });
          signals[signals.length - 1].left = intervalL[possible];
          signals[signals.length - 1].right = intervalR[possible];

          if (heightFactor) {
            let yLeft = yData[intervalL[possible].index];
            let yRight = yData[intervalR[possible].index];
            signals[signals.length - 1].height = heightFactor * (signals[signals.length - 1].y - (yLeft + yRight) / 2);
          }
        }
      }
    }

    if (realTopDetection) {
      determineRealTop(signals, xData, yData);
    } // Correct the values to fit the original spectra data


    for (let j = 0; j < signals.length; j++) {
      signals[j].base = noiseLevel;
    }

    signals.sort(function (a, b) {
      return a.x - b.x;
    });
    return signals;
  }

  const isEqualSpaced = x => {
    let tmp;
    let maxDx = 0;
    let minDx = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < x.length - 1; ++i) {
      tmp = Math.abs(x[i + 1] - x[i]);

      if (tmp < minDx) {
        minDx = tmp;
      }

      if (tmp > maxDx) {
        maxDx = tmp;
      }
    }

    return (maxDx - minDx) / maxDx < 0.05;
  };

  const getNoiseLevel = y => {
    let mean = 0;
    let stddev = 0;
    let length = y.length;

    for (let i = 0; i < length; ++i) {
      mean += y[i];
    }

    mean /= length;
    let averageDeviations = new Array(length);

    for (let i = 0; i < length; ++i) {
      averageDeviations[i] = Math.abs(y[i] - mean);
    }

    averageDeviations.sort((a, b) => a - b);

    if (length % 2 === 1) {
      stddev = averageDeviations[(length - 1) / 2] / 0.6745;
    } else {
      stddev = 0.5 * (averageDeviations[length / 2] + averageDeviations[length / 2 - 1]) / 0.6745;
    }

    return stddev;
  };

  const determineRealTop = (peakList, x, y) => {
    let alpha, beta, gamma, p, currentPoint;

    for (let j = 0; j < peakList.length; j++) {
      currentPoint = peakList[j].index; // peakList[j][2];
      // The detected peak could be moved 1 or 2 units to left or right.

      if (y[currentPoint - 1] >= y[currentPoint - 2] && y[currentPoint - 1] >= y[currentPoint]) {
        currentPoint--;
      } else {
        if (y[currentPoint + 1] >= y[currentPoint] && y[currentPoint + 1] >= y[currentPoint + 2]) {
          currentPoint++;
        } else {
          if (y[currentPoint - 2] >= y[currentPoint - 3] && y[currentPoint - 2] >= y[currentPoint - 1]) {
            currentPoint -= 2;
          } else {
            if (y[currentPoint + 2] >= y[currentPoint + 1] && y[currentPoint + 2] >= y[currentPoint + 3]) {
              currentPoint += 2;
            }
          }
        }
      } // interpolation to a sin() function


      if (y[currentPoint - 1] > 0 && y[currentPoint + 1] > 0 && y[currentPoint] >= y[currentPoint - 1] && y[currentPoint] >= y[currentPoint + 1] && (y[currentPoint] !== y[currentPoint - 1] || y[currentPoint] !== y[currentPoint + 1])) {
        alpha = 20 * Math.log10(y[currentPoint - 1]);
        beta = 20 * Math.log10(y[currentPoint]);
        gamma = 20 * Math.log10(y[currentPoint + 1]);
        p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma); // console.log(alpha, beta, gamma, `p: ${p}`);
        // console.log(x[currentPoint]+" "+tmp+" "+currentPoint);

        peakList[j].x = x[currentPoint] + (x[currentPoint] - x[currentPoint - 1]) * p;
        peakList[j].y = y[currentPoint] - 0.25 * (y[currentPoint - 1] - y[currentPoint + 1]) * p;
      }
    }
  };

  /*!
   * assign-symbols <https://github.com/jonschlinkert/assign-symbols>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Licensed under the MIT License.
   */

  const toString = Object.prototype.toString;
  const isEnumerable = Object.prototype.propertyIsEnumerable;
  const getSymbols = Object.getOwnPropertySymbols;

  var assignSymbols = (target, ...args) => {
    if (!isObject(target)) {
      throw new TypeError('expected the first argument to be an object');
    }

    if (args.length === 0 || typeof Symbol !== 'function' || typeof getSymbols !== 'function') {
      return target;
    }

    for (let arg of args) {
      let names = getSymbols(arg);

      for (let key of names) {
        if (isEnumerable.call(arg, key)) {
          target[key] = arg[key];
        }
      }
    }

    return target;
  };

  function isObject(val) {
    return typeof val === 'function' || toString.call(val) === '[object Object]' || Array.isArray(val);
  }

  /*!
   * assign-deep <https://github.com/jonschlinkert/assign-deep>
   *
   * Copyright (c) 2017-present, Jon Schlinkert.
   * Released under the MIT License.
   */
  var assignDeep = createCommonjsModule(function (module) {

    const toString = Object.prototype.toString;

    const isValidKey = key => {
      return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
    };

    const assign = module.exports = (target, ...args) => {
      let i = 0;
      if (isPrimitive(target)) target = args[i++];
      if (!target) target = {};

      for (; i < args.length; i++) {
        if (isObject(args[i])) {
          for (const key of Object.keys(args[i])) {
            if (isValidKey(key)) {
              if (isObject(target[key]) && isObject(args[i][key])) {
                assign(target[key], args[i][key]);
              } else {
                target[key] = args[i][key];
              }
            }
          }

          assignSymbols(target, args[i]);
        }
      }

      return target;
    };

    function isObject(val) {
      return typeof val === 'function' || toString.call(val) === '[object Object]';
    }

    function isPrimitive(val) {
      return typeof val === 'object' ? val === null : typeof val !== 'function';
    }
  });

  /**
   * This function calculates the spectrum as a sum of linear combination of gaussian and lorentzian functions. The pseudo voigt
   * parameters are divided in 4 batches. 1st: centers; 2nd: heights; 3th: widths; 4th: mu's ;
   * @param t Ordinate value
   * @param p Lorentzian parameters
   * @returns {*}
   */

  function sumOfGaussianLorentzians(p) {
    return function (t) {
      let nL = p.length / 4;
      let result = 0;

      for (let i = 0; i < nL; i++) {
        result += p[i + nL] * PseudoVoigt.fct(t - p[i], p[i + nL * 2], p[i + nL * 3]);
      }

      return result;
    };
  }

  /**
   * This function calculates the spectrum as a sum of gaussian functions. The Gaussian
   * parameters are divided in 3 batches. 1st: centers; 2nd: height; 3th: widths;
   * @param t Ordinate values
   * @param p Gaussian parameters
   * @returns {*}
   */

  function sumOfGaussians(p) {
    return function (t) {
      let nL = p.length / 3;
      let result = 0;

      for (let i = 0; i < nL; i++) {
        result += p[i + nL] * Gaussian.fct(t - p[i], p[i + nL * 2]);
      }

      return result;
    };
  }

  /**
   * This function calculates the spectrum as a sum of lorentzian functions. The Lorentzian
   * parameters are divided in 3 batches. 1st: centers; 2nd: heights; 3th: widths;
   * @param t Ordinate values
   * @param p Lorentzian parameters
   * @returns {*}
   */

  function sumOfLorentzians(p) {
    return function (t) {
      let nL = p.length / 3;
      let result = 0;

      for (let i = 0; i < nL; i++) {
        result += p[i + nL] * Lorentzian.fct(t - p[i], p[i + nL * 2]);
      }

      return result;
    };
  }

  function checkInput(data, peaks, options) {
    let {
      shape = {
        kind: 'gaussian'
      },
      optimization = {
        kind: 'lm'
      }
    } = options;

    if (typeof shape.kind !== 'string') {
      throw new Error('kind should be a string');
    }

    let kind = shape.kind.toLowerCase().replace(/[^a-z]/g, '');
    let paramsFunc;
    let defaultParameters;

    switch (kind) {
      case 'gaussian':
        paramsFunc = sumOfGaussians;
        defaultParameters = {
          x: {
            init: peak => peak.x,
            max: peak => peak.x + peak.width * 2,
            min: peak => peak.x - peak.width * 2,
            gradientDifference: peak => peak.width * 2e-3
          },
          y: {
            init: peak => peak.y,
            max: () => 1.5,
            min: () => 0,
            gradientDifference: () => 1e-3
          },
          width: {
            init: peak => peak.width,
            max: peak => peak.width * 4,
            min: peak => peak.width * 0.25,
            gradientDifference: peak => peak.width * 2e-3
          }
        };
        break;

      case 'lorentzian':
        paramsFunc = sumOfLorentzians;
        defaultParameters = {
          x: {
            init: peak => peak.x,
            max: peak => peak.x + peak.width * 2,
            min: peak => peak.x - peak.width * 2,
            gradientDifference: peak => peak.width * 2e-3
          },
          y: {
            init: peak => peak.y,
            max: () => 1.5,
            min: () => 0,
            gradientDifference: () => 1e-3
          },
          width: {
            init: peak => peak.width,
            max: peak => peak.width * 4,
            min: peak => peak.width * 0.25,
            gradientDifference: peak => peak.width * 2e-3
          }
        };
        break;

      case 'pseudovoigt':
        paramsFunc = sumOfGaussianLorentzians;
        defaultParameters = {
          x: {
            init: peak => peak.x,
            max: peak => peak.x + peak.width * 2,
            min: peak => peak.x - peak.width * 2,
            gradientDifference: peak => peak.width * 2e-3
          },
          y: {
            init: peak => peak.y,
            max: () => 1.5,
            min: () => 0,
            gradientDifference: () => 1e-3
          },
          width: {
            init: peak => peak.width,
            max: peak => peak.width * 4,
            min: peak => peak.width * 0.25,
            gradientDifference: peak => peak.width * 2e-3
          },
          mu: {
            init: peak => peak.mu !== undefined ? peak.mu : 0.5,
            min: () => 0,
            max: () => 1,
            gradientDifference: () => 0.01
          }
        };
        break;

      default:
        throw new Error('kind of shape is not supported');
    }

    let x = data.x;
    let maxY = max(data.y);
    let y = new Array(x.length);

    for (let i = 0; i < x.length; i++) {
      y[i] = data.y[i] / maxY;
    }

    for (let i = 0; i < peaks.length; i++) {
      peaks[i].y /= maxY;
    }

    let parameters = assignDeep({}, optimization.parameters, defaultParameters);

    for (let key in parameters) {
      for (let par in parameters[key]) {
        if (!Array.isArray(parameters[key][par])) {
          parameters[key][par] = [parameters[key][par]];
        }

        if (parameters[key][par].length !== 1 && parameters[key][par].length !== peaks.length) {
          throw new Error(`The length of ${key}-${par} is not correct`);
        }

        for (let index = 0; index < parameters[key][par].length; index++) {
          if (typeof parameters[key][par][index] === 'number') {
            let value = parameters[key][par][index];

            parameters[key][par][index] = () => value;
          }
        }
      }
    }

    optimization.parameters = parameters;
    return {
      y,
      x,
      maxY,
      peaks,
      paramsFunc,
      optimization
    };
  }

  const LEVENBERG_MARQUARDT = 1;
  function selectMethod(optimizationOptions = {}) {
    let {
      kind,
      options
    } = optimizationOptions;
    kind = getKind(kind);

    switch (kind) {
      case LEVENBERG_MARQUARDT:
        return {
          algorithm: levenbergMarquardt,
          optimizationOptions: checkOptions(kind, options)
        };

      default:
        throw new Error(`Unknown kind algorithm`);
    }
  }

  function checkOptions(kind, options = {}) {
    // eslint-disable-next-line default-case
    switch (kind) {
      case LEVENBERG_MARQUARDT:
        return Object.assign({}, lmOptions, options);
    }
  }

  function getKind(kind) {
    if (typeof kind !== 'string') return kind;

    switch (kind.toLowerCase().replace(/[^a-z]/g, '')) {
      case 'lm':
      case 'levenbergmarquardt':
        return LEVENBERG_MARQUARDT;

      default:
        throw new Error(`Unknown kind algorithm`);
    }
  }

  const lmOptions = {
    damping: 1.5,
    maxIterations: 100,
    errorTolerance: 1e-8
  };

  // const STATE_MIN = 1;
  // const STATE_MAX = 2;
  // const STATE_GRADIENT_DIFFERENCE = 3;
  // const X = 0;
  // const Y = 1;
  // const WIDTH = 2;
  // const MU = 3;
  // const keys = ['x', 'y', 'width', 'mu'];

  /**
   * Fits a set of points to the sum of a set of bell functions.
   * @param {object} data - An object containing the x and y data to be fitted.
   * @param {array} peaks - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
   * @param {object} [options = {}]
   * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
   * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
   * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
   * @param {object} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
   * @param {object} [options.optimization.parameters] - options of each parameter to be optimized e.g. For a gaussian shape
   *  it could have x, y and with properties, each of which could contain init, min, max and gradientDifference, those options will define the guess,
   *  the min and max value of the parameter (search space) and the step size to approximate the jacobian matrix respectively. Those options could be a number,
   *  array of numbers, callback, or array of callbacks. Each kind of shape has default parameters so it could be undefined.
   * @param {object} [options.optimization.parameters.x] - options for x parameter.
   * @param {number|callback|array<number|callback>} [options.optimization.parameters.x.init] - definition of the starting point of the parameter (the guess),
   *  if it is a callback the method pass the peak as the unique input, if it is an array the first element define the guess of the first peak and so on.
   * @param {number|callback|array<number|callback>} [options.optimization.parameters.x.min] - definition of the lower limit of the parameter,
   *  if it is a callback the method pass the peak as the unique input, if it is an array the first element define the min of the first peak and so on.
   * @param {number|callback|array<number|callback>} [options.optimization.parameters.x.max] - definition of the upper limit of the parameter,
   *  if it is a callback the method pass the peak as the unique input, if it is an array the first element define the max of the first peak and so on.
   * @param {number|callback|array<number|callback>} [options.optimization.parameters.x.gradientDifference] - definition of  the step size to approximate the jacobian matrix of the parameter,
   *  if it is a callback the method pass the peak as the unique input, if it is an array the first element define the gradientDifference of the first peak and so on.
   * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
   * @param {number} [options.optimization.options.timeout] - maximum time running before break in seconds.
   * @param {number} [options.optimization.options.damping=1.5]
   * @param {number} [options.optimization.options.maxIterations=100]
   * @param {number} [options.optimization.options.errorTolerance=1e-8]
   * @returns {object} - A object with fitting error and the list of optimized parameters { parameters: [ {x, y, width} ], error } if the kind of shape is pseudoVoigt mu parameter is optimized.
   */

  function optimize(data, peakList, options = {}) {
    const {
      y,
      x,
      maxY,
      peaks,
      paramsFunc,
      optimization
    } = checkInput(data, peakList, options);
    let parameters = optimization.parameters;
    let nbShapes = peaks.length;
    let parameterKey = Object.keys(parameters);
    let nbParams = nbShapes * parameterKey.length;
    let pMin = new Float64Array(nbParams);
    let pMax = new Float64Array(nbParams);
    let pInit = new Float64Array(nbParams);
    let gradientDifference = new Float64Array(nbParams);

    for (let i = 0; i < nbShapes; i++) {
      let peak = peaks[i];

      for (let k = 0; k < parameterKey.length; k++) {
        let key = parameterKey[k];
        let init = parameters[key].init;
        let min = parameters[key].min;
        let max = parameters[key].max;
        let gradientDifferenceValue = parameters[key].gradientDifference;
        pInit[i + k * nbShapes] = init[i % init.length](peak);
        pMin[i + k * nbShapes] = min[i % min.length](peak);
        pMax[i + k * nbShapes] = max[i % max.length](peak);
        gradientDifference[i + k * nbShapes] = gradientDifferenceValue[i % gradientDifferenceValue.length](peak);
      }
    }

    let {
      algorithm,
      optimizationOptions
    } = selectMethod(optimization);
    optimizationOptions.minValues = pMin;
    optimizationOptions.maxValues = pMax;
    optimizationOptions.initialValues = pInit;
    optimizationOptions.gradientDifference = gradientDifference;
    let pFit = algorithm({
      x,
      y
    }, paramsFunc, optimizationOptions);
    let {
      parameterError: error,
      iterations
    } = pFit;
    let result = {
      error,
      iterations,
      peaks
    };

    for (let i = 0; i < nbShapes; i++) {
      pFit.parameterValues[i + nbShapes] *= maxY;

      for (let k = 0; k < parameterKey.length; k++) {
        // we modify the optimized parameters
        peaks[i][parameterKey[k]] = pFit.parameterValues[i + k * nbShapes];
      }
    }

    return result;
  }

  /**
   * Returns the closest index of a `target` in an ordered array
   * @param {array<Number>} array
   * @param {number} target
   */
  function xFindClosestIndex(array, target) {
    let low = 0;
    let high = array.length - 1;
    let middle = 0;

    while (high - low > 1) {
      middle = low + (high - low >> 1);

      if (array[middle] < target) {
        low = middle;
      } else if (array[middle] > target) {
        high = middle;
      } else {
        return middle;
      }
    }

    if (low < array.length - 1) {
      if (Math.abs(target - array[low]) < Math.abs(array[low + 1] - target)) {
        return low;
      } else {
        return low + 1;
      }
    } else {
      return low;
    }
  }

  /**
   * Returns an object with {fromIndex, toIndex} for a specific from / to
   * @param {array} x
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   */

  function xGetFromToIndex(x, options = {}) {
    let {
      fromIndex,
      toIndex,
      from,
      to
    } = options;

    if (fromIndex === undefined) {
      if (from !== undefined) {
        fromIndex = xFindClosestIndex(x, from);
      } else {
        fromIndex = 0;
      }
    }

    if (toIndex === undefined) {
      if (to !== undefined) {
        toIndex = xFindClosestIndex(x, to);
      } else {
        toIndex = x.length - 1;
      }
    }

    if (fromIndex > toIndex) [fromIndex, toIndex] = [toIndex, fromIndex];
    return {
      fromIndex,
      toIndex
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }
  /**
   * Fill an array with sequential numbers
   * @param {Array<number>} [input] - optional destination array (if not provided a new array will be created)
   * @param {object} [options={}]
   * @param {number} [options.from=0] - first value in the array
   * @param {number} [options.to=10] - last value in the array
   * @param {number} [options.size=input.length] - size of the array (if not provided calculated from step)
   * @param {number} [options.step] - if not provided calculated from size
   * @return {Array<number>}
   */


  function sequentialFill() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (_typeof(input) === 'object' && !isAnyArray(input)) {
      options = input;
      input = [];
    }

    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    var _options = options,
        _options$from = _options.from,
        from = _options$from === void 0 ? 0 : _options$from,
        _options$to = _options.to,
        to = _options$to === void 0 ? 10 : _options$to,
        _options$size = _options.size,
        size = _options$size === void 0 ? input.length : _options$size,
        step = _options.step;

    if (size !== 0 && step) {
      throw new Error('step is defined by the array size');
    }

    if (!size) {
      if (step) {
        size = Math.floor((to - from) / step) + 1;
      } else {
        size = to - from + 1;
      }
    }

    if (!step && size) {
      step = (to - from) / (size - 1);
    }

    if (Array.isArray(input)) {
      // only works with normal array
      input.length = 0;

      for (var i = 0; i < size; i++) {
        input.push(from);
        from += step;
      }
    } else {
      if (input.length !== size) {
        throw new Error('sequentialFill typed array must have the correct length');
      }

      for (var _i = 0; _i < size; _i++) {
        input[_i] = from;
        from += step;
      }
    }

    return input;
  }

  function variance(values) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!isAnyArray(values)) {
      throw new TypeError('input must be an array');
    }

    var _options$unbiased = options.unbiased,
        unbiased = _options$unbiased === void 0 ? true : _options$unbiased,
        _options$mean = options.mean,
        mean = _options$mean === void 0 ? mean$1(values) : _options$mean;
    var sqrError = 0;

    for (var i = 0; i < values.length; i++) {
      var x = values[i] - mean;
      sqrError += x * x;
    }

    if (unbiased) {
      return sqrError / (values.length - 1);
    } else {
      return sqrError / values.length;
    }
  }

  function standardDeviation(values) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return Math.sqrt(variance(values, options));
  }

  /**
   * Group peaks based on factor and add group property in peaks
   * @param {array} peakList
   * @param {number} factor
   */
  function groupPeaks(peakList, factor = 1) {
    if (peakList.length === 0) return [];
    let peaks = peakList.sort((a, b) => a.x - b.x);
    let previousPeak = {
      x: Number.NEGATIVE_INFINITY,
      width: 1
    };
    let currentGroup = [previousPeak];
    let groups = [];

    for (let peak of peaks) {
      if ((peak.x - previousPeak.x) / (peak.width + previousPeak.width) <= factor / 2) {
        currentGroup.push(peak);
      } else {
        currentGroup = [peak];
        groups.push(currentGroup);
      }

      peak.group = groups.length - 1;
      previousPeak = peak;
    }

    return groups;
  }

  /**
   * Optimize the position (x), max intensity (y), full width at half maximum (width)
   * and the ratio of gaussian contribution (mu) if it's required. It supports three kind of shapes: gaussian, lorentzian and pseudovoigt
   * @param {object} data - An object containing the x and y data to be fitted.
   * @param {Array} peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
   * @param {object} [options = {}] -
   * @param {number} [options.factorWidth = 1] - times of width to group peaks.
   * @param {number} [options.factorLimits = 2] - times of width to use to optimize peaks
   * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
   * @param {string} [options.shape.kind='gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
   * @param {string} [options.shape.options={}] - options depending the kind of shape
   * @param {object} [options.optimization={}] - it's specify the kind and options of the algorithm use to optimize parameters.
   * @param {string} [options.optimization.kind='lm'] - kind of algorithm. By default it's levenberg-marquardt.
   * @param {object} [options.optimization.options={}] - options for the specific kind of algorithm.
   * @param {number} [options.optimization.options.timeout=10] - maximum time running before break in seconds.
   */

  function optimizePeaks(data, peakList, options = {}) {
    const {
      factorWidth = 1,
      factorLimits = 2,
      shape = {
        kind: 'gaussian'
      },
      optimization = {
        kind: 'lm',
        options: {
          timeout: 10
        }
      }
    } = options;

    if (data.x[0] > data.x[1]) {
      data.x.reverse();
      data.y.reverse();
    }

    let groups = groupPeaks(peakList, factorWidth);
    let results = [];

    for (const peaks of groups) {
      const firstPeak = peaks[0];
      const lastPeak = peaks[peaks.length - 1];
      const from = firstPeak.x - firstPeak.width * factorLimits;
      const to = lastPeak.x + lastPeak.width * factorLimits;
      const {
        fromIndex,
        toIndex
      } = xGetFromToIndex(data.x, {
        from,
        to
      }); // Multiple peaks

      const currentRange = {
        x: data.x.slice(fromIndex, toIndex),
        y: data.y.slice(fromIndex, toIndex)
      };

      if (currentRange.x.length > 5) {
        let {
          peaks: optimizedPeaks
        } = optimize(currentRange, peaks, {
          shape,
          optimization
        });
        results = results.concat(optimizedPeaks);
      } else {
        results = results.concat(peaks);
      }
    }

    return results;
  }

  /**
   * This function try to join the peaks that seems to belong to a broad signal in a single broad peak.
   * @param {Array} peakList - A list of initial parameters to be optimized. e.g. coming from a peak picking [{x, y, width}].
   * @param {object} [options = {}] - options
   * @param {number} [options.width=0.25] - width limit to join peaks.
   * @param {object} [options.shape={}] - it's specify the kind of shape used to fitting.
   * @param {string} [options.shape.kind = 'gaussian'] - kind of shape; lorentzian, gaussian and pseudovoigt are supported.
   * @param {object} [options.optimization = {}] - it's specify the kind and options of the algorithm use to optimize parameters.
   * @param {string} [options.optimization.kind = 'lm'] - kind of algorithm. By default it's levenberg-marquardt.
   * @param {number} [options.optimization.options.timeout = 10] - maximum time running before break in seconds.
   * @param {object} [options.optimization.options = {}] - options for the specific kind of algorithm.
   */

  function joinBroadPeaks(peakList, options = {}) {
    let {
      width = 0.25,
      shape = {
        kind: 'gaussian'
      },
      optimization = {
        kind: 'lm',
        timeout: 10
      }
    } = options;
    let broadLines = []; // Optimize the possible broad lines

    let max = 0;
    let maxI = 0;
    let count = 1;

    for (let i = peakList.length - 1; i >= 0; i--) {
      if (peakList[i].soft) {
        broadLines.push(peakList.splice(i, 1)[0]);
      }
    } // Push a feke peak


    broadLines.push({
      x: Number.MAX_VALUE
    });
    let candidates = {
      x: [broadLines[0].x],
      y: [broadLines[0].y]
    };
    let indexes = [0];

    for (let i = 1; i < broadLines.length; i++) {
      if (Math.abs(broadLines[i - 1].x - broadLines[i].x) < width) {
        candidates.x.push(broadLines[i].x);
        candidates.y.push(broadLines[i].y);

        if (broadLines[i].y > max) {
          max = broadLines[i].y;
          maxI = i;
        }

        indexes.push(i);
        count++;
      } else {
        if (count > 2) {
          let fitted = optimize(candidates, [{
            x: broadLines[maxI].x,
            y: max,
            width: Math.abs(candidates.x[0] - candidates.x[candidates.x.length - 1])
          }], {
            shape,
            optimization
          });
          let {
            peaks: peak
          } = fitted;
          peak[0].index = Math.floor(indexes.reduce((a, b) => a + b, 0) / indexes.length);
          peak[0].soft = false;
          peakList.push(peak[0]);
        } else {
          // Put back the candidates to the signals list
          indexes.forEach(index => {
            peakList.push(broadLines[index]);
          });
        }

        candidates = {
          x: [broadLines[i].x],
          y: [broadLines[i].y]
        };
        indexes = [i];
        max = broadLines[i].y;
        maxI = i;
        count = 1;
      }
    }

    peakList.sort(function (a, b) {
      return a.x - b.x;
    });
    return peakList;
  }

  /**
   * This method will allow to enlarge peaks and prevent overlap between peaks
   * Because peaks may not be symmetric after we add 2 properties, from and to.
   * @param {Array} peakList
   * @param {object} [options={}]
   * @param {number} [options.factor=2]
   * @param {boolean} [options.overlap=false] by default we don't allow overlap
   * @return {Array} peakList
   */
  function broadenPeaks(peakList, options = {}) {
    const {
      factor = 2,
      overlap = false
    } = options;

    for (let peak of peakList) {
      if (!peak.right || !peak.left) {
        peak.from = peak.x - peak.width / 2 * factor;
        peak.to = peak.x + peak.width / 2 * factor;
      } else {
        peak.from = peak.x - (peak.x - peak.left.x) * factor;
        peak.to = peak.x + (peak.right.x - peak.x) * factor;
      }
    }

    if (!overlap) {
      for (let i = 0; i < peakList.length - 1; i++) {
        let peak = peakList[i];
        let nextPeak = peakList[i + 1];

        if (peak.to > nextPeak.from) {
          peak.to = nextPeak.from = (peak.to + nextPeak.from) / 2;
        }
      }
    }

    for (let peak of peakList) {
      peak.width = peak.to - peak.from;
    }

    return peakList;
  }

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    gsd: gsd,
    optimizePeaks: optimizePeaks,
    joinBroadPeaks: joinBroadPeaks,
    broadenPeaks: broadenPeaks
  });

  function mode(input) {
    if (!isAnyArray(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var maxValue = 0;
    var maxCount = 0;
    var count = 0;
    var counts = {};

    for (var i = 0; i < input.length; ++i) {
      var element = input[i];
      count = counts[element];

      if (count) {
        counts[element]++;
        count++;
      } else {
        counts[element] = count = 1;
      }

      if (count > maxCount) {
        maxCount = count;
        maxValue = input[i];
      }
    }

    return maxValue;
  }

  function norm(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$algorithm = options.algorithm,
        algorithm = _options$algorithm === void 0 ? 'absolute' : _options$algorithm,
        _options$sumValue = options.sumValue,
        sumValue = _options$sumValue === void 0 ? 1 : _options$sumValue,
        _options$maxValue = options.maxValue,
        maxValue = _options$maxValue === void 0 ? 1 : _options$maxValue;

    if (!isAnyArray(input)) {
      throw new Error('input must be an array');
    }

    var output;

    if (options.output !== undefined) {
      if (!isAnyArray(options.output)) {
        throw new TypeError('output option must be an array if specified');
      }

      output = options.output;
    } else {
      output = new Array(input.length);
    }

    if (input.length === 0) {
      throw new Error('input must not be empty');
    }

    switch (algorithm.toLowerCase()) {
      case 'absolute':
        {
          var absoluteSumValue = absoluteSum(input) / sumValue;
          if (absoluteSumValue === 0) return input.slice(0);

          for (var i = 0; i < input.length; i++) {
            output[i] = input[i] / absoluteSumValue;
          }

          return output;
        }

      case 'max':
        {
          var currentMaxValue = max(input);
          if (currentMaxValue === 0) return input.slice(0);
          var factor = maxValue / currentMaxValue;

          for (var _i = 0; _i < input.length; _i++) {
            output[_i] = input[_i] * factor;
          }

          return output;
        }

      case 'sum':
        {
          var sumFactor = sum(input) / sumValue;
          if (sumFactor === 0) return input.slice(0);

          for (var _i2 = 0; _i2 < input.length; _i2++) {
            output[_i2] = input[_i2] / sumFactor;
          }

          return output;
        }

      default:
        throw new Error("norm: unknown algorithm: ".concat(algorithm));
    }
  }

  function absoluteSum(input) {
    var sumValue = 0;

    for (var i = 0; i < input.length; i++) {
      sumValue += Math.abs(input[i]);
    }

    return sumValue;
  }

  /**
   * Merge abscissa values if the ordinate value is in a list of centroids
   * @param {object} originalPoints
   * @param {Array<number>} originalPoints.x
   * @param {Array<number>} originalPoints.y
   * @param {Array<number>} centroids
   * @param {object} [options]
   * @param {number} [options.window = 0.01] - has to be a positive number
   * @return {{x: Array<number>, y: Array<number>}}
   */
  function mergeByCentroids(originalPoints, centroids, options = {}) {
    const {
      window = 0.01
    } = options;
    let mergedPoints = {
      x: centroids.slice(),
      y: new Array(centroids.length).fill(0)
    };
    let originalIndex = 0;
    let mergedIndex = 0;

    while (originalIndex < originalPoints.x.length && mergedIndex < centroids.length) {
      let diff = originalPoints.x[originalIndex] - centroids[mergedIndex];

      if (Math.abs(diff) < window) {
        mergedPoints.y[mergedIndex] += originalPoints.y[originalIndex++];
      } else if (diff < 0) {
        originalIndex++;
      } else {
        mergedIndex++;
      }
    }

    return mergedPoints;
  }

  function assertNumber$1(number) {
    if (typeof number !== 'number') {
      throw new TypeError('Expected a number');
    }
  }

  var ascending$1 = (left, right) => {
    assertNumber$1(left);
    assertNumber$1(right);

    if (Number.isNaN(left)) {
      return -1;
    }

    if (Number.isNaN(right)) {
      return 1;
    }

    return left - right;
  };

  var descending$1 = (left, right) => {
    assertNumber$1(left);
    assertNumber$1(right);

    if (Number.isNaN(left)) {
      return 1;
    }

    if (Number.isNaN(right)) {
      return -1;
    }

    return right - left;
  };

  /**
   *
   * @param {object} points
   * @param {Array<number>} originalPoints.x
   * @param {Array<number>} originalPoints.y
   * @param {*} options
   * @return {{x: Array<number>, y: Array<number>}}
   */

  function closestX(points, options) {
    const {
      x,
      y
    } = points;
    const {
      target = x[0],
      reverse = false
    } = options;
    let index;

    if (reverse) {
      index = binarySearch(x, target, descending$1);
    } else {
      index = binarySearch(x, target, ascending$1);
    }

    if (index >= 0) {
      return {
        x: x[index],
        y: y[index]
      };
    } else {
      index = ~index;

      if (index !== 0 && Math.abs(x[index] - target) > 0.5 || index === x.length) {
        return {
          x: x[index - 1],
          y: y[index - 1]
        };
      } else {
        return {
          x: x[index],
          y: y[index]
        };
      }
    }
  }

  /**
   *
   * @param {object} points
   * @param {Array<number>} points.x
   * @param {Array<number>} points.y
   * @param {object} [options]
   * @param {boolean} [options.unbiased = true] - if true, divide by (n-1); if false, divide by n.
   * @return {number}
   */

  function covariance(points, options = {}) {
    const {
      x,
      y
    } = points;
    const {
      unbiased = true
    } = options;
    const meanX = mean$1(x);
    const meanY = mean$1(y);
    let error = 0;

    for (let i = 0; i < x.length; i++) {
      error += (x[i] - meanX) * (y[i] - meanY);
    }

    if (unbiased) {
      return error / (x.length - 1);
    } else {
      return error / x.length;
    }
  }

  /**
   * Merge abscissas values on similar ordinates and weight the group of abscissas
   * @param {object} points
   * @param {Array<number>} points.x - sorted abscissas values
   * @param {Array<number>} points.y - ordinates values
   * @param {object} [options]
   * @param {number} [options.groupWidth = 0.001] - window for abscissas to merge
   * @return {{x: Array<number>, y: Array<number>}}
   */
  function maxMerge(points, options = {}) {
    const {
      x,
      y
    } = points;
    const {
      groupWidth = 0.001
    } = options;
    let merged = {
      x: [],
      y: []
    };
    let maxAbscissa = {
      x: [],
      y: []
    };
    let size = 0;
    let index = 0;

    while (index < x.length) {
      if (size === 0 || x[index] - merged.x[size - 1] > groupWidth) {
        maxAbscissa.x.push(x[index]);
        maxAbscissa.y.push(y[index]);
        merged.x.push(x[index]);
        merged.y.push(y[index]);
        index++;
        size++;
      } else {
        if (y[index] > maxAbscissa.y[size - 1]) {
          maxAbscissa.x[size - 1] = x[index];
          maxAbscissa.y[size - 1] = y[index];
        }

        merged.x[size - 1] = x[index];
        merged.y[size - 1] += y[index];
        index++;
      }
    }

    merged.x = maxAbscissa.x.slice();
    return merged;
  }

  function assertNumber(number) {
    if (typeof number !== 'number') {
      throw new TypeError('Expected a number');
    }
  }

  var ascending = (left, right) => {
    assertNumber(left);
    assertNumber(right);

    if (Number.isNaN(left)) {
      return -1;
    }

    if (Number.isNaN(right)) {
      return 1;
    }

    return left - right;
  };

  var descending = (left, right) => {
    assertNumber(left);
    assertNumber(right);

    if (Number.isNaN(left)) {
      return 1;
    }

    if (Number.isNaN(right)) {
      return -1;
    }

    return right - left;
  };

  /**
   * @param {object} points
   * @param {Array<number>} points.x - sorted abscissas values
   * @param {Array<number>} points.y - ordinates values
   * @param {object} [options]
   * @param {object} [options.from = {index: 0}]
   * @param {object} [options.to = {index: x.length-1}]
   * @param {boolean} [options.reverse = false]
   * @return {{index: number, value: number}}
   */

  function maxY(points, options = {}) {
    const {
      x,
      y
    } = points;
    let {
      from = {
        index: 0
      },
      to = {
        index: x.length
      },
      reverse = false
    } = options;

    if (from.value !== undefined && from.index === undefined) {
      from.index = calculateIndex(from.value, x, reverse);
    }

    if (to.value !== undefined && to.index === undefined) {
      to.index = calculateIndex(to.value, x, reverse);
    }

    let currentMax = Number.MIN_VALUE;
    let currentIndex;

    for (let i = from.index; i < to.index; i++) {
      if (currentMax < y[i]) {
        currentMax = y[i];
        currentIndex = i;
      }
    }

    return {
      index: currentIndex,
      value: currentMax
    };
  }
  /**
   * @param {number} value
   * @param {Array<number>} x
   * @param {boolean} reverse
   * @return {number} index of the value in the array
   */

  function calculateIndex(value, x, reverse) {
    let index;

    if (reverse) {
      index = binarySearch(x, value, descending);
    } else {
      index = binarySearch(x, value, ascending);
    }

    if (index < 0) {
      throw new Error(`the value ${value} doesn't belongs to the abscissa value`);
    }

    return index;
  }

  function sortX(points, options = {}) {
    const {
      x,
      y
    } = points;
    const {
      reverse = false
    } = options;
    let sortFunc;

    if (!reverse) {
      sortFunc = (a, b) => a.x - b.x;
    } else {
      sortFunc = (a, b) => b.x - a.x;
    }

    let grouped = x.map((val, index) => ({
      x: val,
      y: y[index]
    })).sort(sortFunc);
    let response = {
      x: x.slice(),
      y: y.slice()
    };

    for (let i = 0; i < x.length; i++) {
      response.x[i] = grouped[i].x;
      response.y[i] = grouped[i].y;
    }

    return response;
  }

  /**
   * In place modification of the 2 arrays to make X unique and sum the Y if X has the same value
   * @param {object} [points={}] : Object of points contains property x (an array) and y (an array)
   * @return points
   */
  function uniqueX(points = {}) {
    const {
      x,
      y
    } = points;
    if (x.length < 2) return;

    if (x.length !== y.length) {
      throw new Error('The X and Y arrays mush have the same length');
    }

    let current = x[0];
    let counter = 0;

    for (let i = 1; i < x.length; i++) {
      if (current !== x[i]) {
        counter++;
        current = x[i];
        x[counter] = x[i];

        if (i !== counter) {
          y[counter] = 0;
        }
      }

      if (i !== counter) {
        y[counter] += y[i];
      }
    }

    x.length = counter + 1;
    y.length = counter + 1;
  }

  /**
   * Merge abscissas values on similar ordinates and weight the group of abscissas
   * @param {object} points
   * @param {Array<number>} points.x - sorted abscissas values
   * @param {Array<number>} points.y - ordinates values
   * @param {object} [options]
   * @param {number} [options.groupWidth = 0.001] - window for abscissas to merge
   * @return {{x: Array<number>, y: Array<number>}}
   */
  function weightedMerge(points, options = {}) {
    const {
      x,
      y
    } = points;
    const {
      groupWidth = 0.001
    } = options;
    let merged = {
      x: [],
      y: []
    };
    let weightedAbscissa = {
      x: [],
      y: []
    };
    let size = 0;
    let index = 0;

    while (index < x.length) {
      if (size === 0 || x[index] - merged.x[size - 1] > groupWidth) {
        weightedAbscissa.x.push(x[index] * y[index]);
        weightedAbscissa.y.push(y[index]);
        merged.x.push(x[index]);
        merged.y.push(y[index]);
        index++;
        size++;
      } else {
        weightedAbscissa.x[size - 1] += x[index] * y[index];
        weightedAbscissa.y[size - 1] += y[index];
        merged.x[size - 1] = x[index];
        merged.y[size - 1] += y[index];
        index++;
      }
    }

    for (let i = 0; i < merged.x.length; i++) {
      merged.x[i] = weightedAbscissa.x[i] / weightedAbscissa.y[i];
    }

    return merged;
  }

  /**
   * Normalize an array of zones:
   * - ensure than from < to
   * - merge overlapping zones
   *
   * The method will always check if from if lower than to and will swap if required.
   * @param {Array} [zones=[]]
   * @param {object} [options={}]
   * @param {number} [options.from=Number.NEGATIVE_INFINITY] Specify min value of a zone
   * @param {number} [options.to=Number.POSITIVE_INFINITY] Specify max value of a zone
   */
  function normalize(zones = [], options = {}) {
    if (zones.length === 0) return [];
    let {
      from = Number.NEGATIVE_INFINITY,
      to = Number.POSITIVE_INFINITY
    } = options;
    if (from > to) [from, to] = [to, from];
    zones = JSON.parse(JSON.stringify(zones)).map(zone => zone.from > zone.to ? {
      from: zone.to,
      to: zone.from
    } : zone);
    zones = zones.sort((a, b) => {
      if (a.from !== b.from) return a.from - b.from;
      return a.to - b.to;
    });
    zones.forEach(zone => {
      if (from > zone.from) zone.from = from;
      if (to < zone.to) zone.to = to;
    });
    zones = zones.filter(zone => zone.from <= zone.to);
    if (zones.length === 0) return [];
    let currentZone = zones[0];
    let result = [currentZone];

    for (let i = 1; i < zones.length; i++) {
      let zone = zones[i];

      if (zone.from <= currentZone.to) {
        currentZone.to = zone.to;
      } else {
        currentZone = zone;
        result.push(currentZone);
      }
    }

    return result;
  }

  /**
   * Convert an array of exclusions and keep only from / to
   *
   * The method will always check if from if lower than to and will swap if required.
   * @param {Array} [exclusions=[]]
   * @param {object} [options={}]
   * @param {number} [options.from=Number.NEGATIVE_INFINITY] Specify min value of zones (after inversion)
   * @param {number} [options.to=Number.POSITIVE_INFINITY] Specify max value of zones (after inversion)
   */

  function invert(exclusions = [], options = {}) {
    let {
      from = Number.NEGATIVE_INFINITY,
      to = Number.POSITIVE_INFINITY
    } = options;
    if (from > to) [from, to] = [to, from];
    exclusions = normalize(exclusions, {
      from,
      to
    });
    if (exclusions.length === 0) return [{
      from,
      to
    }];
    let zones = [];

    for (let i = 0; i < exclusions.length; i++) {
      let exclusion = exclusions[i];
      let nextExclusion = exclusions[i + 1];

      if (i === 0) {
        if (exclusion.from > from) {
          zones.push({
            from,
            to: exclusion.from
          });
        }
      }

      if (i === exclusions.length - 1) {
        if (exclusion.to < to) {
          zones.push({
            from: exclusion.to,
            to
          });
        }
      } else {
        zones.push({
          from: exclusion.to,
          to: nextExclusion.from
        });
      }
    }

    return zones;
  }

  /**
   * Add the number of points per zone to reach a specified total
   * @param {Array} [zones=[]]
   * @param {number} [numberOfPoints] Total number of points to distribute between zones
   * @param {object} [options={}]
   * @param {number} [options.from=Number.NEGATIVE_INFINITY] Specify min value of a zone
   * @param {number} [options.to=Number.POSITIVE_INFINITY] Specify max value of a zone
   */

  function zonesWithPoints(zones, numberOfPoints, options = {}) {
    if (zones.length === 0) return zones;
    zones = normalize(zones, options);
    const totalSize = zones.reduce((previous, current) => {
      return previous + (current.to - current.from);
    }, 0);
    let unitsPerPoint = totalSize / numberOfPoints;
    let currentTotal = 0;

    for (let i = 0; i < zones.length - 1; i++) {
      let zone = zones[i];
      zone.numberOfPoints = Math.min(Math.round((zone.to - zone.from) / unitsPerPoint), numberOfPoints - currentTotal);
      currentTotal += zone.numberOfPoints;
    }

    zones[zones.length - 1].numberOfPoints = numberOfPoints - currentTotal;
    return zones;
  }

  /**
   * function that retrieves the getEquallySpacedData with the variant "slot"
   *
   * @param {Array<number>} x
   * @param {Array<number>} y
   * @param {number} from - Initial point
   * @param {number} to - Final point
   * @param {number} numberOfPoints
   * @return {Array} - Array of y's equally spaced with the variant "slot"
   */
  function equallySpacedSlot(x, y, from, to, numberOfPoints) {
    let xLength = x.length;
    let step = (to - from) / (numberOfPoints > 1 ? numberOfPoints - 1 : 1);
    let halfStep = step / 2;
    let lastStep = x[x.length - 1] - x[x.length - 2];
    let start = from - halfStep;
    let output = new Array(numberOfPoints); // Init main variables

    let min = start;
    let max = start + step;
    let previousX = -Number.MAX_VALUE;
    let previousY = 0;
    let nextX = x[0];
    let nextY = y[0];
    let frontOutsideSpectra = 0;
    let backOutsideSpectra = true;
    let currentValue = 0; // for slot algorithm

    let currentPoints = 0;
    let i = 1; // index of input

    let j = 0; // index of output

    main: while (true) {
      if (previousX >= nextX) throw new Error('x must be an increasing serie');

      while (previousX - max > 0) {
        // no overlap with original point, just consume current value
        if (backOutsideSpectra) {
          currentPoints++;
          backOutsideSpectra = false;
        }

        output[j] = currentPoints <= 0 ? 0 : currentValue / currentPoints;
        j++;

        if (j === numberOfPoints) {
          break main;
        }

        min = max;
        max += step;
        currentValue = 0;
        currentPoints = 0;
      }

      if (previousX > min) {
        currentValue += previousY;
        currentPoints++;
      }

      if (previousX === -Number.MAX_VALUE || frontOutsideSpectra > 1) {
        currentPoints--;
      }

      previousX = nextX;
      previousY = nextY;

      if (i < xLength) {
        nextX = x[i];
        nextY = y[i];
        i++;
      } else {
        nextX += lastStep;
        nextY = 0;
        frontOutsideSpectra++;
      }
    }

    return output;
  }

  /**
   * Function that calculates the integral of the line between two
   * x-coordinates, given the slope and intercept of the line.
   * @param {number} x0
   * @param {number} x1
   * @param {number} slope
   * @param {number} intercept
   * @return {number} integral value.
   */
  function integral(x0, x1, slope, intercept) {
    return 0.5 * slope * x1 * x1 + intercept * x1 - (0.5 * slope * x0 * x0 + intercept * x0);
  }

  /**
   * function that retrieves the getEquallySpacedData with the variant "smooth"
   *
   * @param {Array<number>} x
   * @param {Array<number>} y
   * @param {number} from - Initial point
   * @param {number} to - Final point
   * @param {number} numberOfPoints
   * @return {Array} - Array of y's equally spaced with the variant "smooth"
   */

  function equallySpacedSmooth(x, y, from, to, numberOfPoints) {
    let xLength = x.length;
    let step = (to - from) / (numberOfPoints > 1 ? numberOfPoints - 1 : 1);
    let halfStep = step / 2;
    let output = new Array(numberOfPoints);
    let initialOriginalStep = x[1] - x[0];
    let lastOriginalStep = x[xLength - 1] - x[xLength - 2]; // Init main variables

    let min = from - halfStep;
    let max = from + halfStep;
    let previousX = Number.MIN_VALUE;
    let previousY = 0;
    let nextX = x[0] - initialOriginalStep;
    let nextY = 0;
    let currentValue = 0;
    let slope = 0;
    let intercept = 0;
    let sumAtMin = 0;
    let sumAtMax = 0;
    let i = 0; // index of input

    let j = 0; // index of output

    function getSlope(x0, y0, x1, y1) {
      return (y1 - y0) / (x1 - x0);
    }

    let add = 0;

    main: while (true) {
      if (previousX <= min && min <= nextX) {
        add = integral(0, min - previousX, slope, previousY);
        sumAtMin = currentValue + add;
      }

      while (nextX - max >= 0) {
        // no overlap with original point, just consume current value
        add = integral(0, max - previousX, slope, previousY);
        sumAtMax = currentValue + add;
        output[j++] = (sumAtMax - sumAtMin) / step;

        if (j === numberOfPoints) {
          break main;
        }

        min = max;
        max += step;
        sumAtMin = sumAtMax;
      }

      currentValue += integral(previousX, nextX, slope, intercept);
      previousX = nextX;
      previousY = nextY;

      if (i < xLength) {
        nextX = x[i];
        nextY = y[i];
        i++;
      } else if (i === xLength) {
        nextX += lastOriginalStep;
        nextY = 0;
      }

      slope = getSlope(previousX, previousY, nextX, nextY);
      intercept = -slope * previousX + previousY;
    }

    return output;
  }

  /**
   * Function that returns a Number array of equally spaced numberOfPoints
   * containing a representation of intensities of the spectra arguments x
   * and y.
   *
   * The options parameter contains an object in the following form:
   * from: starting point
   * to: last point
   * numberOfPoints: number of points between from and to
   * variant: "slot" or "smooth" - smooth is the default option
   *
   * The slot variant consist that each point in the new array is calculated
   * averaging the existing points between the slot that belongs to the current
   * value. The smooth variant is the same but takes the integral of the range
   * of the slot and divide by the step size between two points in the new array.
   *
   * If exclusions zone are present, zones are ignored !
   * @param {object} [arrayXY={}] - object containing 2 properties x and y (both an array)
   * @param {object} [options={}]
   * @param {number} [options.from=x[0]]
   * @param {number} [options.to=x[x.length-1]]
   * @param {string} [options.variant='smooth']
   * @param {number} [options.numberOfPoints=100]
   * @param {Array} [options.exclusions=[]] array of from / to that should be skipped for the generation of the points
   * @param {Array} [options.zones=[]] array of from / to that should be kept
   * @return {object<x: Array, y:Array>} new object with x / y array with the equally spaced data.
   */

  function equallySpaced(arrayXY = {}, options = {}) {
    let {
      x,
      y
    } = arrayXY;
    let xLength = x.length;
    let reverse = false;

    if (x.length > 1 && x[0] > x[1]) {
      x = x.slice().reverse();
      y = y.slice().reverse();
      reverse = true;
    }

    let {
      from = x[0],
      to = x[xLength - 1],
      variant = 'smooth',
      numberOfPoints = 100,
      exclusions = [],
      zones = []
    } = options;

    if (xLength !== y.length) {
      throw new RangeError("the x and y vector doesn't have the same size.");
    }

    if (typeof from !== 'number' || isNaN(from)) {
      throw new RangeError("'from' option must be a number");
    }

    if (typeof to !== 'number' || isNaN(to)) {
      throw new RangeError("'to' option must be a number");
    }

    if (typeof numberOfPoints !== 'number' || isNaN(numberOfPoints)) {
      throw new RangeError("'numberOfPoints' option must be a number");
    }

    if (numberOfPoints < 2) {
      throw new RangeError("'numberOfPoints' option must be greater than 1");
    }

    if (zones.length === 0) {
      zones = invert(exclusions, {
        from,
        to
      });
    }

    zones = zonesWithPoints(zones, numberOfPoints, {
      from,
      to
    });
    let xResult = [];
    let yResult = [];

    for (let zone of zones) {
      let zoneResult = processZone(x, y, zone.from, zone.to, zone.numberOfPoints, variant);
      xResult = xResult.concat(zoneResult.x);
      yResult = yResult.concat(zoneResult.y);
    }

    if (reverse) {
      if (from < to) {
        return {
          x: xResult.reverse(),
          y: yResult.reverse()
        };
      } else {
        return {
          x: xResult,
          y: yResult
        };
      }
    } else {
      if (from < to) {
        return {
          x: xResult,
          y: yResult
        };
      } else {
        return {
          x: xResult.reverse(),
          y: yResult.reverse()
        };
      }
    }
  }

  function processZone(x, y, from, to, numberOfPoints, variant) {
    if (numberOfPoints < 1) {
      throw new RangeError('the number of points must be at least 1');
    }

    let output = variant === 'slot' ? equallySpacedSlot(x, y, from, to, numberOfPoints) : equallySpacedSmooth(x, y, from, to, numberOfPoints);
    return {
      x: sequentialFill({
        from,
        to,
        size: numberOfPoints
      }),
      y: output
    };
  }

  function getZones(from, to, exclusions = []) {
    if (from > to) {
      [from, to] = [to, from];
    } // in exclusions from and to have to be defined


    exclusions = exclusions.filter(exclusion => exclusion.from !== undefined && exclusion.to !== undefined);
    exclusions = JSON.parse(JSON.stringify(exclusions)); // we ensure that from before to

    exclusions.forEach(exclusion => {
      if (exclusion.from > exclusion.to) {
        [exclusion.to, exclusion.from] = [exclusion.from, exclusion.to];
      }
    });
    exclusions.sort((a, b) => a.from - b.from); // we will rework the exclusions in order to remove overlap and outside range (from / to)

    exclusions.forEach(exclusion => {
      if (exclusion.from < from) exclusion.from = from;
      if (exclusion.to > to) exclusion.to = to;
    });

    for (let i = 0; i < exclusions.length - 1; i++) {
      if (exclusions[i].to > exclusions[i + 1].from) {
        exclusions[i].to = exclusions[i + 1].from;
      }
    }

    exclusions = exclusions.filter(exclusion => exclusion.from < exclusion.to);

    if (!exclusions || exclusions.length === 0) {
      return [{
        from,
        to
      }];
    }

    let zones = [];
    let currentFrom = from;

    for (let exclusion of exclusions) {
      if (currentFrom < exclusion.from) {
        zones.push({
          from: currentFrom,
          to: exclusion.from
        });
      }

      currentFrom = exclusion.to;
    }

    if (currentFrom < to) {
      zones.push({
        from: currentFrom,
        to: to
      });
    }

    return zones;
  }

  /**
   * Filter an array x/y based on various criteria
   * x points are expected to be sorted
   *
   * @param {object} points
   * @param {object} [options={}]
   * @param {array} [options.from]
   * @param {array} [options.to]
   * @param {array} [options.exclusions=[]]
   * @return {{x: Array<number>, y: Array<number>}}
   */

  function filterX(points, options = {}) {
    const {
      x,
      y
    } = points;
    const {
      from = x[0],
      to = x[x.length - 1],
      exclusions = []
    } = options;
    let zones = getZones(from, to, exclusions);
    let currentZoneIndex = 0;
    let newX = [];
    let newY = [];
    let position = 0;

    while (position < x.length) {
      if (x[position] <= zones[currentZoneIndex].to && x[position] >= zones[currentZoneIndex].from) {
        newX.push(x[position]);
        newY.push(y[position]);
      } else {
        if (x[position] > zones[currentZoneIndex].to) {
          currentZoneIndex++;
          if (!zones[currentZoneIndex]) break;
        }
      }

      position++;
    }

    return {
      x: newX,
      y: newY
    };
  }

  /* eslint-disable import/newline-after-import */
  const {
    Matrix,
    SVD,
    EVD,
    CholeskyDecomposition,
    LuDecomposition,
    QrDecomposition
  } = MatrixLib;
  const Array$1 = {
    min,
    max,
    median,
    mean: mean$1,
    mode,
    normed: norm,
    rescale,
    sequentialFill,
    standardDeviation,
    sum,
    variance
  };
  const ArrayXY = {
    centroidsMerge: mergeByCentroids,
    closestX,
    covariance,
    maxMerge,
    maxY,
    sortX,
    uniqueX,
    weightedMerge,
    equallySpaced,
    filterX
  };

  exports.Array = Array$1;
  exports.ArrayXY = ArrayXY;
  exports.BitArray = src;
  exports.CholeskyDecomposition = CholeskyDecomposition;
  exports.ConfusionMatrix = ConfusionMatrix;
  exports.CrossValidation = index$3;
  exports.DecisionTreeClassifier = DecisionTreeClassifier;
  exports.DecisionTreeRegression = DecisionTreeRegression;
  exports.Distance = distances;
  exports.EVD = EVD;
  exports.ExponentialRegression = ExponentialRegression;
  exports.FCNNLS = index$2;
  exports.FNN = FeedForwardNeuralNetwork;
  exports.GSD = index;
  exports.HClust = index$5;
  exports.HashTable = HashTable;
  exports.KMeans = kmeans;
  exports.KNN = KNN;
  exports.KOPLS = KOPLS;
  exports.Kernel = kernel;
  exports.LuDecomposition = LuDecomposition;
  exports.Matrix = Matrix;
  exports.MatrixLib = MatrixLib;
  exports.MultivariateLinearRegression = MultivariateLinearRegression;
  exports.NaiveBayes = index$4;
  exports.OPLS = OPLS;
  exports.OPLSNipals = OPLSNipals;
  exports.PCA = PCA;
  exports.PLS = PLS;
  exports.Performance = src$2;
  exports.PolynomialRegression = PolynomialRegression;
  exports.PowerRegression = PowerRegression;
  exports.QrDecomposition = QrDecomposition;
  exports.Random = Random;
  exports.RandomForestClassifier = RandomForestClassifier;
  exports.RandomForestRegression = RandomForestRegression;
  exports.RobustPolynomialRegression = RobustPolynomialRegression;
  exports.SOM = src$3;
  exports.SVD = SVD;
  exports.Similarity = similarities;
  exports.SimpleLinearRegression = SimpleLinearRegression;
  exports.SparseMatrix = SparseMatrix;
  exports.TheilSenRegression = TheilSenRegression;
  exports.XSadd = XSadd;
  exports.binarySearch = binarySearch;
  exports.distanceMatrix = distanceMatrix;
  exports.levenbergMarquardt = levenbergMarquardt;
  exports.nGMCA = nGMCA;
  exports.padArray = src$1;
  exports.savitzkyGolay = savitzkyGolay;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ml.js.map
