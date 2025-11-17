var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS((exports, module) => {
  module.exports = function() {
    return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS((exports) => {
  var toSJISFunction;
  var CODEWORDS_COUNT = [
    0,
    26,
    44,
    70,
    100,
    134,
    172,
    196,
    242,
    292,
    346,
    404,
    466,
    532,
    581,
    655,
    733,
    815,
    901,
    991,
    1085,
    1156,
    1258,
    1364,
    1474,
    1588,
    1706,
    1828,
    1921,
    2051,
    2185,
    2323,
    2465,
    2611,
    2761,
    2876,
    3034,
    3196,
    3362,
    3532,
    3706
  ];
  exports.getSymbolSize = function getSymbolSize(version) {
    if (!version)
      throw new Error('"version" cannot be null or undefined');
    if (version < 1 || version > 40)
      throw new Error('"version" should be in range from 1 to 40');
    return version * 4 + 17;
  };
  exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
    return CODEWORDS_COUNT[version];
  };
  exports.getBCHDigit = function(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  };
  exports.setToSJISFunction = function setToSJISFunction(f) {
    if (typeof f !== "function") {
      throw new Error('"toSJISFunc" is not a valid function.');
    }
    toSJISFunction = f;
  };
  exports.isKanjiModeEnabled = function() {
    return typeof toSJISFunction !== "undefined";
  };
  exports.toSJIS = function toSJIS(kanji) {
    return toSJISFunction(kanji);
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS((exports) => {
  exports.L = { bit: 1 };
  exports.M = { bit: 0 };
  exports.Q = { bit: 3 };
  exports.H = { bit: 2 };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "l":
      case "low":
        return exports.L;
      case "m":
      case "medium":
        return exports.M;
      case "q":
      case "quartile":
        return exports.Q;
      case "h":
      case "high":
        return exports.H;
      default:
        throw new Error("Unknown EC Level: " + string);
    }
  }
  exports.isValid = function isValid(level) {
    return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
  };
  exports.from = function from(value, defaultValue) {
    if (exports.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS((exports, module) => {
  function BitBuffer() {
    this.buffer = [];
    this.length = 0;
  }
  BitBuffer.prototype = {
    get: function(index) {
      const bufIndex = Math.floor(index / 8);
      return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
    },
    put: function(num, length) {
      for (let i = 0;i < length; i++) {
        this.putBit((num >>> length - i - 1 & 1) === 1);
      }
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(bit) {
      const bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[bufIndex] |= 128 >>> this.length % 8;
      }
      this.length++;
    }
  };
  module.exports = BitBuffer;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS((exports, module) => {
  function BitMatrix(size) {
    if (!size || size < 1) {
      throw new Error("BitMatrix size must be defined and greater than 0");
    }
    this.size = size;
    this.data = new Uint8Array(size * size);
    this.reservedBit = new Uint8Array(size * size);
  }
  BitMatrix.prototype.set = function(row, col, value, reserved) {
    const index = row * this.size + col;
    this.data[index] = value;
    if (reserved)
      this.reservedBit[index] = true;
  };
  BitMatrix.prototype.get = function(row, col) {
    return this.data[row * this.size + col];
  };
  BitMatrix.prototype.xor = function(row, col, value) {
    this.data[row * this.size + col] ^= value;
  };
  BitMatrix.prototype.isReserved = function(row, col) {
    return this.reservedBit[row * this.size + col];
  };
  module.exports = BitMatrix;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS((exports) => {
  var getSymbolSize = require_utils().getSymbolSize;
  exports.getRowColCoords = function getRowColCoords(version) {
    if (version === 1)
      return [];
    const posCount = Math.floor(version / 7) + 2;
    const size = getSymbolSize(version);
    const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    const positions = [size - 7];
    for (let i = 1;i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }
    positions.push(6);
    return positions.reverse();
  };
  exports.getPositions = function getPositions(version) {
    const coords = [];
    const pos = exports.getRowColCoords(version);
    const posLength = pos.length;
    for (let i = 0;i < posLength; i++) {
      for (let j = 0;j < posLength; j++) {
        if (i === 0 && j === 0 || i === 0 && j === posLength - 1 || i === posLength - 1 && j === 0) {
          continue;
        }
        coords.push([pos[i], pos[j]]);
      }
    }
    return coords;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS((exports) => {
  var getSymbolSize = require_utils().getSymbolSize;
  var FINDER_PATTERN_SIZE = 7;
  exports.getPositions = function getPositions(version) {
    const size = getSymbolSize(version);
    return [
      [0, 0],
      [size - FINDER_PATTERN_SIZE, 0],
      [0, size - FINDER_PATTERN_SIZE]
    ];
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS((exports) => {
  exports.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  var PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  exports.isValid = function isValid(mask) {
    return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
  };
  exports.from = function from(value) {
    return exports.isValid(value) ? parseInt(value, 10) : undefined;
  };
  exports.getPenaltyN1 = function getPenaltyN1(data) {
    const size = data.size;
    let points = 0;
    let sameCountCol = 0;
    let sameCountRow = 0;
    let lastCol = null;
    let lastRow = null;
    for (let row = 0;row < size; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;
      for (let col = 0;col < size; col++) {
        let module2 = data.get(row, col);
        if (module2 === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5)
            points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module2;
          sameCountCol = 1;
        }
        module2 = data.get(col, row);
        if (module2 === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5)
            points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module2;
          sameCountRow = 1;
        }
      }
      if (sameCountCol >= 5)
        points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5)
        points += PenaltyScores.N1 + (sameCountRow - 5);
    }
    return points;
  };
  exports.getPenaltyN2 = function getPenaltyN2(data) {
    const size = data.size;
    let points = 0;
    for (let row = 0;row < size - 1; row++) {
      for (let col = 0;col < size - 1; col++) {
        const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
        if (last === 4 || last === 0)
          points++;
      }
    }
    return points * PenaltyScores.N2;
  };
  exports.getPenaltyN3 = function getPenaltyN3(data) {
    const size = data.size;
    let points = 0;
    let bitsCol = 0;
    let bitsRow = 0;
    for (let row = 0;row < size; row++) {
      bitsCol = bitsRow = 0;
      for (let col = 0;col < size; col++) {
        bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
        if (col >= 10 && (bitsCol === 1488 || bitsCol === 93))
          points++;
        bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
        if (col >= 10 && (bitsRow === 1488 || bitsRow === 93))
          points++;
      }
    }
    return points * PenaltyScores.N3;
  };
  exports.getPenaltyN4 = function getPenaltyN4(data) {
    let darkCount = 0;
    const modulesCount = data.data.length;
    for (let i = 0;i < modulesCount; i++)
      darkCount += data.data[i];
    const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
    return k * PenaltyScores.N4;
  };
  function getMaskAt(maskPattern, i, j) {
    switch (maskPattern) {
      case exports.Patterns.PATTERN000:
        return (i + j) % 2 === 0;
      case exports.Patterns.PATTERN001:
        return i % 2 === 0;
      case exports.Patterns.PATTERN010:
        return j % 3 === 0;
      case exports.Patterns.PATTERN011:
        return (i + j) % 3 === 0;
      case exports.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case exports.Patterns.PATTERN101:
        return i * j % 2 + i * j % 3 === 0;
      case exports.Patterns.PATTERN110:
        return (i * j % 2 + i * j % 3) % 2 === 0;
      case exports.Patterns.PATTERN111:
        return (i * j % 3 + (i + j) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + maskPattern);
    }
  }
  exports.applyMask = function applyMask(pattern, data) {
    const size = data.size;
    for (let col = 0;col < size; col++) {
      for (let row = 0;row < size; row++) {
        if (data.isReserved(row, col))
          continue;
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };
  exports.getBestMask = function getBestMask(data, setupFormatFunc) {
    const numPatterns = Object.keys(exports.Patterns).length;
    let bestPattern = 0;
    let lowerPenalty = Infinity;
    for (let p = 0;p < numPatterns; p++) {
      setupFormatFunc(p);
      exports.applyMask(p, data);
      const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
      exports.applyMask(p, data);
      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p;
      }
    }
    return bestPattern;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS((exports) => {
  var ECLevel = require_error_correction_level();
  var EC_BLOCKS_TABLE = [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    1,
    2,
    2,
    4,
    1,
    2,
    4,
    4,
    2,
    4,
    4,
    4,
    2,
    4,
    6,
    5,
    2,
    4,
    6,
    6,
    2,
    5,
    8,
    8,
    4,
    5,
    8,
    8,
    4,
    5,
    8,
    11,
    4,
    8,
    10,
    11,
    4,
    9,
    12,
    16,
    4,
    9,
    16,
    16,
    6,
    10,
    12,
    18,
    6,
    10,
    17,
    16,
    6,
    11,
    16,
    19,
    6,
    13,
    18,
    21,
    7,
    14,
    21,
    25,
    8,
    16,
    20,
    25,
    8,
    17,
    23,
    25,
    9,
    17,
    23,
    34,
    9,
    18,
    25,
    30,
    10,
    20,
    27,
    32,
    12,
    21,
    29,
    35,
    12,
    23,
    34,
    37,
    12,
    25,
    34,
    40,
    13,
    26,
    35,
    42,
    14,
    28,
    38,
    45,
    15,
    29,
    40,
    48,
    16,
    31,
    43,
    51,
    17,
    33,
    45,
    54,
    18,
    35,
    48,
    57,
    19,
    37,
    51,
    60,
    19,
    38,
    53,
    63,
    20,
    40,
    56,
    66,
    21,
    43,
    59,
    70,
    22,
    45,
    62,
    74,
    24,
    47,
    65,
    77,
    25,
    49,
    68,
    81
  ];
  var EC_CODEWORDS_TABLE = [
    7,
    10,
    13,
    17,
    10,
    16,
    22,
    28,
    15,
    26,
    36,
    44,
    20,
    36,
    52,
    64,
    26,
    48,
    72,
    88,
    36,
    64,
    96,
    112,
    40,
    72,
    108,
    130,
    48,
    88,
    132,
    156,
    60,
    110,
    160,
    192,
    72,
    130,
    192,
    224,
    80,
    150,
    224,
    264,
    96,
    176,
    260,
    308,
    104,
    198,
    288,
    352,
    120,
    216,
    320,
    384,
    132,
    240,
    360,
    432,
    144,
    280,
    408,
    480,
    168,
    308,
    448,
    532,
    180,
    338,
    504,
    588,
    196,
    364,
    546,
    650,
    224,
    416,
    600,
    700,
    224,
    442,
    644,
    750,
    252,
    476,
    690,
    816,
    270,
    504,
    750,
    900,
    300,
    560,
    810,
    960,
    312,
    588,
    870,
    1050,
    336,
    644,
    952,
    1110,
    360,
    700,
    1020,
    1200,
    390,
    728,
    1050,
    1260,
    420,
    784,
    1140,
    1350,
    450,
    812,
    1200,
    1440,
    480,
    868,
    1290,
    1530,
    510,
    924,
    1350,
    1620,
    540,
    980,
    1440,
    1710,
    570,
    1036,
    1530,
    1800,
    570,
    1064,
    1590,
    1890,
    600,
    1120,
    1680,
    1980,
    630,
    1204,
    1770,
    2100,
    660,
    1260,
    1860,
    2220,
    720,
    1316,
    1950,
    2310,
    750,
    1372,
    2040,
    2430
  ];
  exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
    switch (errorCorrectionLevel) {
      case ECLevel.L:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
      case ECLevel.M:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
      case ECLevel.Q:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
      case ECLevel.H:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
      default:
        return;
    }
  };
  exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
    switch (errorCorrectionLevel) {
      case ECLevel.L:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
      case ECLevel.M:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
      case ECLevel.Q:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
      case ECLevel.H:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
      default:
        return;
    }
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS((exports) => {
  var EXP_TABLE = new Uint8Array(512);
  var LOG_TABLE = new Uint8Array(256);
  (function initTables() {
    let x = 1;
    for (let i = 0;i < 255; i++) {
      EXP_TABLE[i] = x;
      LOG_TABLE[x] = i;
      x <<= 1;
      if (x & 256) {
        x ^= 285;
      }
    }
    for (let i = 255;i < 512; i++) {
      EXP_TABLE[i] = EXP_TABLE[i - 255];
    }
  })();
  exports.log = function log(n) {
    if (n < 1)
      throw new Error("log(" + n + ")");
    return LOG_TABLE[n];
  };
  exports.exp = function exp(n) {
    return EXP_TABLE[n];
  };
  exports.mul = function mul(x, y) {
    if (x === 0 || y === 0)
      return 0;
    return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS((exports) => {
  var GF = require_galois_field();
  exports.mul = function mul(p1, p2) {
    const coeff = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0;i < p1.length; i++) {
      for (let j = 0;j < p2.length; j++) {
        coeff[i + j] ^= GF.mul(p1[i], p2[j]);
      }
    }
    return coeff;
  };
  exports.mod = function mod(divident, divisor) {
    let result = new Uint8Array(divident);
    while (result.length - divisor.length >= 0) {
      const coeff = result[0];
      for (let i = 0;i < divisor.length; i++) {
        result[i] ^= GF.mul(divisor[i], coeff);
      }
      let offset = 0;
      while (offset < result.length && result[offset] === 0)
        offset++;
      result = result.slice(offset);
    }
    return result;
  };
  exports.generateECPolynomial = function generateECPolynomial(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0;i < degree; i++) {
      poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
    }
    return poly;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS((exports, module) => {
  var Polynomial = require_polynomial();
  function ReedSolomonEncoder(degree) {
    this.genPoly = undefined;
    this.degree = degree;
    if (this.degree)
      this.initialize(this.degree);
  }
  ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
    this.degree = degree;
    this.genPoly = Polynomial.generateECPolynomial(this.degree);
  };
  ReedSolomonEncoder.prototype.encode = function encode(data) {
    if (!this.genPoly) {
      throw new Error("Encoder not initialized");
    }
    const paddedData = new Uint8Array(data.length + this.degree);
    paddedData.set(data);
    const remainder = Polynomial.mod(paddedData, this.genPoly);
    const start = this.degree - remainder.length;
    if (start > 0) {
      const buff = new Uint8Array(this.degree);
      buff.set(remainder, start);
      return buff;
    }
    return remainder;
  };
  module.exports = ReedSolomonEncoder;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS((exports) => {
  exports.isValid = function isValid(version) {
    return !isNaN(version) && version >= 1 && version <= 40;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS((exports) => {
  var numeric = "[0-9]+";
  var alphanumeric = "[A-Z $%*+\\-./:]+";
  var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|" + "[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|" + "[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|" + "[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  kanji = kanji.replace(/u/g, "\\u");
  var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + `)(?:.|[\r
]))+`;
  exports.KANJI = new RegExp(kanji, "g");
  exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
  exports.BYTE = new RegExp(byte, "g");
  exports.NUMERIC = new RegExp(numeric, "g");
  exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
  var TEST_KANJI = new RegExp("^" + kanji + "$");
  var TEST_NUMERIC = new RegExp("^" + numeric + "$");
  var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  exports.testKanji = function testKanji(str) {
    return TEST_KANJI.test(str);
  };
  exports.testNumeric = function testNumeric(str) {
    return TEST_NUMERIC.test(str);
  };
  exports.testAlphanumeric = function testAlphanumeric(str) {
    return TEST_ALPHANUMERIC.test(str);
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS((exports) => {
  var VersionCheck = require_version_check();
  var Regex = require_regex();
  exports.NUMERIC = {
    id: "Numeric",
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };
  exports.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };
  exports.BYTE = {
    id: "Byte",
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };
  exports.KANJI = {
    id: "Kanji",
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };
  exports.MIXED = {
    bit: -1
  };
  exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
    if (!mode.ccBits)
      throw new Error("Invalid mode: " + mode);
    if (!VersionCheck.isValid(version)) {
      throw new Error("Invalid version: " + version);
    }
    if (version >= 1 && version < 10)
      return mode.ccBits[0];
    else if (version < 27)
      return mode.ccBits[1];
    return mode.ccBits[2];
  };
  exports.getBestModeForData = function getBestModeForData(dataStr) {
    if (Regex.testNumeric(dataStr))
      return exports.NUMERIC;
    else if (Regex.testAlphanumeric(dataStr))
      return exports.ALPHANUMERIC;
    else if (Regex.testKanji(dataStr))
      return exports.KANJI;
    else
      return exports.BYTE;
  };
  exports.toString = function toString(mode) {
    if (mode && mode.id)
      return mode.id;
    throw new Error("Invalid mode");
  };
  exports.isValid = function isValid(mode) {
    return mode && mode.bit && mode.ccBits;
  };
  function fromString(string) {
    if (typeof string !== "string") {
      throw new Error("Param is not a string");
    }
    const lcStr = string.toLowerCase();
    switch (lcStr) {
      case "numeric":
        return exports.NUMERIC;
      case "alphanumeric":
        return exports.ALPHANUMERIC;
      case "kanji":
        return exports.KANJI;
      case "byte":
        return exports.BYTE;
      default:
        throw new Error("Unknown mode: " + string);
    }
  }
  exports.from = function from(value, defaultValue) {
    if (exports.isValid(value)) {
      return value;
    }
    try {
      return fromString(value);
    } catch (e) {
      return defaultValue;
    }
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/version.js
var require_version = __commonJS((exports) => {
  var Utils = require_utils();
  var ECCode = require_error_correction_code();
  var ECLevel = require_error_correction_level();
  var Mode = require_mode();
  var VersionCheck = require_version_check();
  var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  var G18_BCH = Utils.getBCHDigit(G18);
  function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
    for (let currentVersion = 1;currentVersion <= 40; currentVersion++) {
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
        return currentVersion;
      }
    }
    return;
  }
  function getReservedBitsCount(mode, version) {
    return Mode.getCharCountIndicator(mode, version) + 4;
  }
  function getTotalBitsFromDataArray(segments, version) {
    let totalBits = 0;
    segments.forEach(function(data) {
      const reservedBits = getReservedBitsCount(data.mode, version);
      totalBits += reservedBits + data.getBitsLength();
    });
    return totalBits;
  }
  function getBestVersionForMixedData(segments, errorCorrectionLevel) {
    for (let currentVersion = 1;currentVersion <= 40; currentVersion++) {
      const length = getTotalBitsFromDataArray(segments, currentVersion);
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
        return currentVersion;
      }
    }
    return;
  }
  exports.from = function from(value, defaultValue) {
    if (VersionCheck.isValid(value)) {
      return parseInt(value, 10);
    }
    return defaultValue;
  };
  exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
    if (!VersionCheck.isValid(version)) {
      throw new Error("Invalid QR Code version");
    }
    if (typeof mode === "undefined")
      mode = Mode.BYTE;
    const totalCodewords = Utils.getSymbolTotalCodewords(version);
    const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (mode === Mode.MIXED)
      return dataTotalCodewordsBits;
    const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
    switch (mode) {
      case Mode.NUMERIC:
        return Math.floor(usableBits / 10 * 3);
      case Mode.ALPHANUMERIC:
        return Math.floor(usableBits / 11 * 2);
      case Mode.KANJI:
        return Math.floor(usableBits / 13);
      case Mode.BYTE:
      default:
        return Math.floor(usableBits / 8);
    }
  };
  exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
    let seg;
    const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
    if (Array.isArray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl);
      }
      if (data.length === 0) {
        return 1;
      }
      seg = data[0];
    } else {
      seg = data;
    }
    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
  };
  exports.getEncodedBits = function getEncodedBits(version) {
    if (!VersionCheck.isValid(version) || version < 7) {
      throw new Error("Invalid QR Code version");
    }
    let d = version << 12;
    while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
    }
    return version << 12 | d;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS((exports) => {
  var Utils = require_utils();
  var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
  var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
  var G15_BCH = Utils.getBCHDigit(G15);
  exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
    const data = errorCorrectionLevel.bit << 3 | mask;
    let d = data << 10;
    while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
      d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
    }
    return (data << 10 | d) ^ G15_MASK;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS((exports, module) => {
  var Mode = require_mode();
  function NumericData(data) {
    this.mode = Mode.NUMERIC;
    this.data = data.toString();
  }
  NumericData.getBitsLength = function getBitsLength(length) {
    return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
  };
  NumericData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  NumericData.prototype.getBitsLength = function getBitsLength() {
    return NumericData.getBitsLength(this.data.length);
  };
  NumericData.prototype.write = function write(bitBuffer) {
    let i, group, value;
    for (i = 0;i + 3 <= this.data.length; i += 3) {
      group = this.data.substr(i, 3);
      value = parseInt(group, 10);
      bitBuffer.put(value, 10);
    }
    const remainingNum = this.data.length - i;
    if (remainingNum > 0) {
      group = this.data.substr(i);
      value = parseInt(group, 10);
      bitBuffer.put(value, remainingNum * 3 + 1);
    }
  };
  module.exports = NumericData;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS((exports, module) => {
  var Mode = require_mode();
  var ALPHA_NUM_CHARS = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    " ",
    "$",
    "%",
    "*",
    "+",
    "-",
    ".",
    "/",
    ":"
  ];
  function AlphanumericData(data) {
    this.mode = Mode.ALPHANUMERIC;
    this.data = data;
  }
  AlphanumericData.getBitsLength = function getBitsLength(length) {
    return 11 * Math.floor(length / 2) + 6 * (length % 2);
  };
  AlphanumericData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  AlphanumericData.prototype.getBitsLength = function getBitsLength() {
    return AlphanumericData.getBitsLength(this.data.length);
  };
  AlphanumericData.prototype.write = function write(bitBuffer) {
    let i;
    for (i = 0;i + 2 <= this.data.length; i += 2) {
      let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
      value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
      bitBuffer.put(value, 11);
    }
    if (this.data.length % 2) {
      bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
    }
  };
  module.exports = AlphanumericData;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS((exports, module) => {
  var Mode = require_mode();
  function ByteData(data) {
    this.mode = Mode.BYTE;
    if (typeof data === "string") {
      this.data = new TextEncoder().encode(data);
    } else {
      this.data = new Uint8Array(data);
    }
  }
  ByteData.getBitsLength = function getBitsLength(length) {
    return length * 8;
  };
  ByteData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  ByteData.prototype.getBitsLength = function getBitsLength() {
    return ByteData.getBitsLength(this.data.length);
  };
  ByteData.prototype.write = function(bitBuffer) {
    for (let i = 0, l = this.data.length;i < l; i++) {
      bitBuffer.put(this.data[i], 8);
    }
  };
  module.exports = ByteData;
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS((exports, module) => {
  var Mode = require_mode();
  var Utils = require_utils();
  function KanjiData(data) {
    this.mode = Mode.KANJI;
    this.data = data;
  }
  KanjiData.getBitsLength = function getBitsLength(length) {
    return length * 13;
  };
  KanjiData.prototype.getLength = function getLength() {
    return this.data.length;
  };
  KanjiData.prototype.getBitsLength = function getBitsLength() {
    return KanjiData.getBitsLength(this.data.length);
  };
  KanjiData.prototype.write = function(bitBuffer) {
    let i;
    for (i = 0;i < this.data.length; i++) {
      let value = Utils.toSJIS(this.data[i]);
      if (value >= 33088 && value <= 40956) {
        value -= 33088;
      } else if (value >= 57408 && value <= 60351) {
        value -= 49472;
      } else {
        throw new Error("Invalid SJIS character: " + this.data[i] + `
` + "Make sure your charset is UTF-8");
      }
      value = (value >>> 8 & 255) * 192 + (value & 255);
      bitBuffer.put(value, 13);
    }
  };
  module.exports = KanjiData;
});

// node_modules/.bun/dijkstrajs@1.0.3/node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS((exports, module) => {
  var dijkstra = {
    single_source_shortest_paths: function(graph, s, d) {
      var predecessors = {};
      var costs = {};
      costs[s] = 0;
      var open = dijkstra.PriorityQueue.make();
      open.push(s, 0);
      var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
      while (!open.empty()) {
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;
        adjacent_nodes = graph[u] || {};
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            cost_of_e = adjacent_nodes[v];
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
            cost_of_s_to_v = costs[v];
            first_visit = typeof costs[v] === "undefined";
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }
      if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
        var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
        throw new Error(msg);
      }
      return predecessors;
    },
    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      var predecessor;
      while (u) {
        nodes.push(u);
        predecessor = predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },
    find_path: function(graph, s, d) {
      var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
      return dijkstra.extract_shortest_path_from_predecessor_list(predecessors, d);
    },
    PriorityQueue: {
      make: function(opts) {
        var T = dijkstra.PriorityQueue, t = {}, key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t[key] = T[key];
          }
        }
        t.queue = [];
        t.sorter = opts.sorter || T.default_sorter;
        return t;
      },
      default_sorter: function(a, b) {
        return a.cost - b.cost;
      },
      push: function(value, cost) {
        var item = { value, cost };
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  if (typeof module !== "undefined") {
    module.exports = dijkstra;
  }
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS((exports) => {
  var Mode = require_mode();
  var NumericData = require_numeric_data();
  var AlphanumericData = require_alphanumeric_data();
  var ByteData = require_byte_data();
  var KanjiData = require_kanji_data();
  var Regex = require_regex();
  var Utils = require_utils();
  var dijkstra = require_dijkstra();
  function getStringByteLength(str) {
    return unescape(encodeURIComponent(str)).length;
  }
  function getSegments(regex, mode, str) {
    const segments = [];
    let result;
    while ((result = regex.exec(str)) !== null) {
      segments.push({
        data: result[0],
        index: result.index,
        mode,
        length: result[0].length
      });
    }
    return segments;
  }
  function getSegmentsFromString(dataStr) {
    const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
    const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
    let byteSegs;
    let kanjiSegs;
    if (Utils.isKanjiModeEnabled()) {
      byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
      kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
    } else {
      byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
      kanjiSegs = [];
    }
    const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
    return segs.sort(function(s1, s2) {
      return s1.index - s2.index;
    }).map(function(obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length
      };
    });
  }
  function getSegmentBitsLength(length, mode) {
    switch (mode) {
      case Mode.NUMERIC:
        return NumericData.getBitsLength(length);
      case Mode.ALPHANUMERIC:
        return AlphanumericData.getBitsLength(length);
      case Mode.KANJI:
        return KanjiData.getBitsLength(length);
      case Mode.BYTE:
        return ByteData.getBitsLength(length);
    }
  }
  function mergeSegments(segs) {
    return segs.reduce(function(acc, curr) {
      const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);
  }
  function buildNodes(segs) {
    const nodes = [];
    for (let i = 0;i < segs.length; i++) {
      const seg = segs[i];
      switch (seg.mode) {
        case Mode.NUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: Mode.BYTE, length: seg.length }
          ]);
          break;
        case Mode.ALPHANUMERIC:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode.BYTE, length: seg.length }
          ]);
          break;
        case Mode.KANJI:
          nodes.push([
            seg,
            { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break;
        case Mode.BYTE:
          nodes.push([
            { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }
    return nodes;
  }
  function buildGraph(nodes, version) {
    const table = {};
    const graph = { start: {} };
    let prevNodeIds = ["start"];
    for (let i = 0;i < nodes.length; i++) {
      const nodeGroup = nodes[i];
      const currentNodeIds = [];
      for (let j = 0;j < nodeGroup.length; j++) {
        const node = nodeGroup[j];
        const key = "" + i + j;
        currentNodeIds.push(key);
        table[key] = { node, lastCount: 0 };
        graph[key] = {};
        for (let n = 0;n < prevNodeIds.length; n++) {
          const prevNodeId = prevNodeIds[n];
          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId])
              table[prevNodeId].lastCount = node.length;
            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
          }
        }
      }
      prevNodeIds = currentNodeIds;
    }
    for (let n = 0;n < prevNodeIds.length; n++) {
      graph[prevNodeIds[n]].end = 0;
    }
    return { map: graph, table };
  }
  function buildSingleSegment(data, modesHint) {
    let mode;
    const bestMode = Mode.getBestModeForData(data);
    mode = Mode.from(modesHint, bestMode);
    if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
      throw new Error('"' + data + '"' + " cannot be encoded with mode " + Mode.toString(mode) + `.
 Suggested mode is: ` + Mode.toString(bestMode));
    }
    if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
      mode = Mode.BYTE;
    }
    switch (mode) {
      case Mode.NUMERIC:
        return new NumericData(data);
      case Mode.ALPHANUMERIC:
        return new AlphanumericData(data);
      case Mode.KANJI:
        return new KanjiData(data);
      case Mode.BYTE:
        return new ByteData(data);
    }
  }
  exports.fromArray = function fromArray(array) {
    return array.reduce(function(acc, seg) {
      if (typeof seg === "string") {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }
      return acc;
    }, []);
  };
  exports.fromString = function fromString(data, version) {
    const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
    const nodes = buildNodes(segs);
    const graph = buildGraph(nodes, version);
    const path = dijkstra.find_path(graph.map, "start", "end");
    const optimizedSegs = [];
    for (let i = 1;i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }
    return exports.fromArray(mergeSegments(optimizedSegs));
  };
  exports.rawSplit = function rawSplit(data) {
    return exports.fromArray(getSegmentsFromString(data, Utils.isKanjiModeEnabled()));
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS((exports) => {
  var Utils = require_utils();
  var ECLevel = require_error_correction_level();
  var BitBuffer = require_bit_buffer();
  var BitMatrix = require_bit_matrix();
  var AlignmentPattern = require_alignment_pattern();
  var FinderPattern = require_finder_pattern();
  var MaskPattern = require_mask_pattern();
  var ECCode = require_error_correction_code();
  var ReedSolomonEncoder = require_reed_solomon_encoder();
  var Version = require_version();
  var FormatInfo = require_format_info();
  var Mode = require_mode();
  var Segments = require_segments();
  function setupFinderPattern(matrix, version) {
    const size = matrix.size;
    const pos = FinderPattern.getPositions(version);
    for (let i = 0;i < pos.length; i++) {
      const row = pos[i][0];
      const col = pos[i][1];
      for (let r = -1;r <= 7; r++) {
        if (row + r <= -1 || size <= row + r)
          continue;
        for (let c = -1;c <= 7; c++) {
          if (col + c <= -1 || size <= col + c)
            continue;
          if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix.set(row + r, col + c, true, true);
          } else {
            matrix.set(row + r, col + c, false, true);
          }
        }
      }
    }
  }
  function setupTimingPattern(matrix) {
    const size = matrix.size;
    for (let r = 8;r < size - 8; r++) {
      const value = r % 2 === 0;
      matrix.set(r, 6, value, true);
      matrix.set(6, r, value, true);
    }
  }
  function setupAlignmentPattern(matrix, version) {
    const pos = AlignmentPattern.getPositions(version);
    for (let i = 0;i < pos.length; i++) {
      const row = pos[i][0];
      const col = pos[i][1];
      for (let r = -2;r <= 2; r++) {
        for (let c = -2;c <= 2; c++) {
          if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
            matrix.set(row + r, col + c, true, true);
          } else {
            matrix.set(row + r, col + c, false, true);
          }
        }
      }
    }
  }
  function setupVersionInfo(matrix, version) {
    const size = matrix.size;
    const bits = Version.getEncodedBits(version);
    let row, col, mod;
    for (let i = 0;i < 18; i++) {
      row = Math.floor(i / 3);
      col = i % 3 + size - 8 - 3;
      mod = (bits >> i & 1) === 1;
      matrix.set(row, col, mod, true);
      matrix.set(col, row, mod, true);
    }
  }
  function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
    const size = matrix.size;
    const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
    let i, mod;
    for (i = 0;i < 15; i++) {
      mod = (bits >> i & 1) === 1;
      if (i < 6) {
        matrix.set(i, 8, mod, true);
      } else if (i < 8) {
        matrix.set(i + 1, 8, mod, true);
      } else {
        matrix.set(size - 15 + i, 8, mod, true);
      }
      if (i < 8) {
        matrix.set(8, size - i - 1, mod, true);
      } else if (i < 9) {
        matrix.set(8, 15 - i - 1 + 1, mod, true);
      } else {
        matrix.set(8, 15 - i - 1, mod, true);
      }
    }
    matrix.set(size - 8, 8, 1, true);
  }
  function setupData(matrix, data) {
    const size = matrix.size;
    let inc = -1;
    let row = size - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = size - 1;col > 0; col -= 2) {
      if (col === 6)
        col--;
      while (true) {
        for (let c = 0;c < 2; c++) {
          if (!matrix.isReserved(row, col - c)) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (data[byteIndex] >>> bitIndex & 1) === 1;
            }
            matrix.set(row, col - c, dark);
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || size <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
  function createData(version, errorCorrectionLevel, segments) {
    const buffer = new BitBuffer;
    segments.forEach(function(data) {
      buffer.put(data.mode.bit, 4);
      buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
      data.write(buffer);
    });
    const totalCodewords = Utils.getSymbolTotalCodewords(version);
    const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
    if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(0);
    }
    const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
    for (let i = 0;i < remainingByte; i++) {
      buffer.put(i % 2 ? 17 : 236, 8);
    }
    return createCodewords(buffer, version, errorCorrectionLevel);
  }
  function createCodewords(bitBuffer, version, errorCorrectionLevel) {
    const totalCodewords = Utils.getSymbolTotalCodewords(version);
    const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
    const dataTotalCodewords = totalCodewords - ecTotalCodewords;
    const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
    const blocksInGroup2 = totalCodewords % ecTotalBlocks;
    const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
    const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
    const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
    const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
    const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
    const rs = new ReedSolomonEncoder(ecCount);
    let offset = 0;
    const dcData = new Array(ecTotalBlocks);
    const ecData = new Array(ecTotalBlocks);
    let maxDataSize = 0;
    const buffer = new Uint8Array(bitBuffer.buffer);
    for (let b = 0;b < ecTotalBlocks; b++) {
      const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
      dcData[b] = buffer.slice(offset, offset + dataSize);
      ecData[b] = rs.encode(dcData[b]);
      offset += dataSize;
      maxDataSize = Math.max(maxDataSize, dataSize);
    }
    const data = new Uint8Array(totalCodewords);
    let index = 0;
    let i, r;
    for (i = 0;i < maxDataSize; i++) {
      for (r = 0;r < ecTotalBlocks; r++) {
        if (i < dcData[r].length) {
          data[index++] = dcData[r][i];
        }
      }
    }
    for (i = 0;i < ecCount; i++) {
      for (r = 0;r < ecTotalBlocks; r++) {
        data[index++] = ecData[r][i];
      }
    }
    return data;
  }
  function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
    let segments;
    if (Array.isArray(data)) {
      segments = Segments.fromArray(data);
    } else if (typeof data === "string") {
      let estimatedVersion = version;
      if (!estimatedVersion) {
        const rawSegments = Segments.rawSplit(data);
        estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
      }
      segments = Segments.fromString(data, estimatedVersion || 40);
    } else {
      throw new Error("Invalid data");
    }
    const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
    if (!bestVersion) {
      throw new Error("The amount of data is too big to be stored in a QR Code");
    }
    if (!version) {
      version = bestVersion;
    } else if (version < bestVersion) {
      throw new Error(`
` + `The chosen QR Code version cannot contain this amount of data.
` + "Minimum version required to store current data is: " + bestVersion + `.
`);
    }
    const dataBits = createData(version, errorCorrectionLevel, segments);
    const moduleCount = Utils.getSymbolSize(version);
    const modules = new BitMatrix(moduleCount);
    setupFinderPattern(modules, version);
    setupTimingPattern(modules);
    setupAlignmentPattern(modules, version);
    setupFormatInfo(modules, errorCorrectionLevel, 0);
    if (version >= 7) {
      setupVersionInfo(modules, version);
    }
    setupData(modules, dataBits);
    if (isNaN(maskPattern)) {
      maskPattern = MaskPattern.getBestMask(modules, setupFormatInfo.bind(null, modules, errorCorrectionLevel));
    }
    MaskPattern.applyMask(maskPattern, modules);
    setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
    return {
      modules,
      version,
      errorCorrectionLevel,
      maskPattern,
      segments
    };
  }
  exports.create = function create(data, options) {
    if (typeof data === "undefined" || data === "") {
      throw new Error("No input text");
    }
    let errorCorrectionLevel = ECLevel.M;
    let version;
    let mask;
    if (typeof options !== "undefined") {
      errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
      version = Version.from(options.version);
      mask = MaskPattern.from(options.maskPattern);
      if (options.toSJISFunc) {
        Utils.setToSJISFunction(options.toSJISFunc);
      }
    }
    return createSymbol(data, version, errorCorrectionLevel, mask);
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS((exports) => {
  function hex2rgba(hex) {
    if (typeof hex === "number") {
      hex = hex.toString();
    }
    if (typeof hex !== "string") {
      throw new Error("Color should be defined as hex string");
    }
    let hexCode = hex.slice().replace("#", "").split("");
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error("Invalid hex color: " + hex);
    }
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
        return [c, c];
      }));
    }
    if (hexCode.length === 6)
      hexCode.push("F", "F");
    const hexValue = parseInt(hexCode.join(""), 16);
    return {
      r: hexValue >> 24 & 255,
      g: hexValue >> 16 & 255,
      b: hexValue >> 8 & 255,
      a: hexValue & 255,
      hex: "#" + hexCode.slice(0, 6).join("")
    };
  }
  exports.getOptions = function getOptions(options) {
    if (!options)
      options = {};
    if (!options.color)
      options.color = {};
    const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
    const width = options.width && options.width >= 21 ? options.width : undefined;
    const scale = options.scale || 4;
    return {
      width,
      scale: width ? 4 : scale,
      margin,
      color: {
        dark: hex2rgba(options.color.dark || "#000000ff"),
        light: hex2rgba(options.color.light || "#ffffffff")
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    };
  };
  exports.getScale = function getScale(qrSize, opts) {
    return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
  };
  exports.getImageWidth = function getImageWidth(qrSize, opts) {
    const scale = exports.getScale(qrSize, opts);
    return Math.floor((qrSize + opts.margin * 2) * scale);
  };
  exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
    const size = qr.modules.size;
    const data = qr.modules.data;
    const scale = exports.getScale(size, opts);
    const symbolSize = Math.floor((size + opts.margin * 2) * scale);
    const scaledMargin = opts.margin * scale;
    const palette = [opts.color.light, opts.color.dark];
    for (let i = 0;i < symbolSize; i++) {
      for (let j = 0;j < symbolSize; j++) {
        let posDst = (i * symbolSize + j) * 4;
        let pxColor = opts.color.light;
        if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          const iSrc = Math.floor((i - scaledMargin) / scale);
          const jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
        }
        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS((exports) => {
  var Utils = require_utils2();
  function clearCanvas(ctx, canvas, size) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!canvas.style)
      canvas.style = {};
    canvas.height = size;
    canvas.width = size;
    canvas.style.height = size + "px";
    canvas.style.width = size + "px";
  }
  function getCanvasElement() {
    try {
      return document.createElement("canvas");
    } catch (e) {
      throw new Error("You need to specify a canvas element");
    }
  }
  exports.render = function render(qrData, canvas, options) {
    let opts = options;
    let canvasEl = canvas;
    if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
      opts = canvas;
      canvas = undefined;
    }
    if (!canvas) {
      canvasEl = getCanvasElement();
    }
    opts = Utils.getOptions(opts);
    const size = Utils.getImageWidth(qrData.modules.size, opts);
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(size, size);
    Utils.qrToImageData(image.data, qrData, opts);
    clearCanvas(ctx, canvasEl, size);
    ctx.putImageData(image, 0, 0);
    return canvasEl;
  };
  exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
    let opts = options;
    if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
      opts = canvas;
      canvas = undefined;
    }
    if (!opts)
      opts = {};
    const canvasEl = exports.render(qrData, canvas, opts);
    const type = opts.type || "image/png";
    const rendererOpts = opts.rendererOpts || {};
    return canvasEl.toDataURL(type, rendererOpts.quality);
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS((exports) => {
  var Utils = require_utils2();
  function getColorAttrib(color, attrib) {
    const alpha = color.a / 255;
    const str = attrib + '="' + color.hex + '"';
    return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
  }
  function svgCmd(cmd, x, y) {
    let str = cmd + x;
    if (typeof y !== "undefined")
      str += " " + y;
    return str;
  }
  function qrToPath(data, size, margin) {
    let path = "";
    let moveBy = 0;
    let newRow = false;
    let lineLength = 0;
    for (let i = 0;i < data.length; i++) {
      const col = Math.floor(i % size);
      const row = Math.floor(i / size);
      if (!col && !newRow)
        newRow = true;
      if (data[i]) {
        lineLength++;
        if (!(i > 0 && col > 0 && data[i - 1])) {
          path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
          moveBy = 0;
          newRow = false;
        }
        if (!(col + 1 < size && data[i + 1])) {
          path += svgCmd("h", lineLength);
          lineLength = 0;
        }
      } else {
        moveBy++;
      }
    }
    return path;
  }
  exports.render = function render(qrData, options, cb) {
    const opts = Utils.getOptions(options);
    const size = qrData.modules.size;
    const data = qrData.modules.data;
    const qrcodesize = size + opts.margin * 2;
    const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
    const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
    const viewBox = 'viewBox="' + "0 0 " + qrcodesize + " " + qrcodesize + '"';
    const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
    const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + `</svg>
`;
    if (typeof cb === "function") {
      cb(null, svgTag);
    }
    return svgTag;
  };
});

// node_modules/.bun/qrcode@1.5.4/node_modules/qrcode/lib/browser.js
var require_browser = __commonJS((exports) => {
  var canPromise = require_can_promise();
  var QRCode = require_qrcode();
  var CanvasRenderer = require_canvas();
  var SvgRenderer = require_svg_tag();
  function renderCanvas(renderFunc, canvas, text, opts, cb) {
    const args = [].slice.call(arguments, 1);
    const argsNum = args.length;
    const isLastArgCb = typeof args[argsNum - 1] === "function";
    if (!isLastArgCb && !canPromise()) {
      throw new Error("Callback required as last argument");
    }
    if (isLastArgCb) {
      if (argsNum < 2) {
        throw new Error("Too few arguments provided");
      }
      if (argsNum === 2) {
        cb = text;
        text = canvas;
        canvas = opts = undefined;
      } else if (argsNum === 3) {
        if (canvas.getContext && typeof cb === "undefined") {
          cb = opts;
          opts = undefined;
        } else {
          cb = opts;
          opts = text;
          text = canvas;
          canvas = undefined;
        }
      }
    } else {
      if (argsNum < 1) {
        throw new Error("Too few arguments provided");
      }
      if (argsNum === 1) {
        text = canvas;
        canvas = opts = undefined;
      } else if (argsNum === 2 && !canvas.getContext) {
        opts = text;
        text = canvas;
        canvas = undefined;
      }
      return new Promise(function(resolve, reject) {
        try {
          const data = QRCode.create(text, opts);
          resolve(renderFunc(data, canvas, opts));
        } catch (e) {
          reject(e);
        }
      });
    }
    try {
      const data = QRCode.create(text, opts);
      cb(null, renderFunc(data, canvas, opts));
    } catch (e) {
      cb(e);
    }
  }
  exports.create = QRCode.create;
  exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
  exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
  exports.toString = renderCanvas.bind(null, function(data, _, opts) {
    return SvgRenderer.render(data, opts);
  });
});

// node_modules/.bun/@photostructure+tz-lookup@11.3.0/node_modules/@photostructure/tz-lookup/tz.js
var require_tz = __commonJS((exports, module) => {
  function tzlookup(Y, W) {
    var X = "XKXJXJXIXIXSXSXRXRXQXQXP##U;U;U;#$UZUZUZUZUZXHXGXGXTXTXXXXXYXYXZXZY#Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUXVXVXWXKXJXJXIXIXSXSU:U$#%#&V,#'U;#(#)UZUZUZUZUZ#*UZXGXGVPVPVP#+YIYIYIYI#,W@W@W@W@W@W@Y&X/X/X/X/X/XVXWVTUV#-T,T,#.U:U:#/#0#1#2#3U;U;U;UZUZUZUZ#4#5YJYJXGYJ#6#7#8YIYIYI#9X1#:W@W@W@#;X/X/#<#=#>#?#@VTVT#A#B#CT,T,#D#E#F#G#H#IV,#J#K#L#MUZUZUZUZX9X9#N#OYJ#P#Q#R#SYI#T#U#VX1#W#XW@W@#Y#ZX/$#$$$%$&$'$($)$*$+$,T,T,$-$.$/U$$0$1$2$3$4$5$6$7UZUZXLXLXH$8$9$:$;$<$=$>YI$?$@$A$B$C$D$E$FW6$G$H$I$J$K$LW;$MT+T+T+XJXIXIXSVB$N$O$P$Q$R$S$T$U$V$WV7XMXLXLXHY6$X$Y$Z%#%$%%%&%'%(%)VR%*%+%,%-%.%/%0%1%2%3%4W;XVT+XKXJXJXIXIXSXSUC%5%6%7TN%8%9%:%;U0XMXMX3X3XH%<%=%>%?%@%A%B%C%D%E%F%G%HX+%I%J%KWX%L%M%N%OXUXVXVXWXKXJXJXIXIXSXSUC%P%Q%RTN%SUUXOX4XNXMXMXLX3X8%T%US2%V%W%X%Y%Z&#&$&%&&&'WXWXWXWXWX&(&)X(XUXUXVXVXW&*ZCZCXIXIXSXSXR&+&,&-&.&/&0UTXNXNXMXMXLXL&1&2&3S2&4T(&5&6WT&7&8&9&:&;&<&=&>&?&@&AX(X(XUX(XVXVXWXKZCZCZCXIXSXSXRUK&B&C&D&E&F&G&HXNXMXMXLX6&I&J&K&L&M&N&O&P&Q&R&SWHW?W?&T&U&V&W&X&YY'X(ZUXUXVZYXWXKXJXJXIXIXSXSXRXRXQXQ&Z'#'$'%'&''XMXMXLX6'(')'*'+','-'.'/'0'1VQXZW?'2Y$'3'4'5'6WGZPZ9'7'8ZH'9XWXKXJZEZEXIXSXSXRXRXQXQZ?':';'<'='>'?XMXLUWXH'@'A'B'C'D'E'F'G'HXZXZZ1W*Y$'I'J'K'L'M'NW8Z9'O'P'QZWZDZDXJZEXIXSXSXRXRXQXQZ?'R'S'TUG'U'V'W'XXLXHXHXGSS'Y'Z(#($(%XYZ0XZ(&Y#Y$Y$W7('((()W8(*ZS(+ZA(,(-(.(/ZTZE(0(1XSXRXRXQXQXPUBUB(2(3(4(5(6(7XLXHX;XGXGSP(8(9(:(;(<Z2XZY#Y#Y$Z-Y%(=(>(?(@(A(B(CZA(D(E(FZLZT(GZV(HXSXRXRXQXQXPXPUB(I(J(K(L(MXLV3XHXHX;XG(N(O(P(Q(RZ*(SZ2Y#Y#Y$Y$Y%Y%XEXE(T(UX>X>ZN(VZ=(WXJXJZVZVZ@(XZQXRZ:XQXPXPV1(Y(Z)#V3V3XLXLXHXHXGXGT*)$)%)&Z*Z*XZXZY#Y#Y$Y$Y%Y%XEXE)')()))*XV)+XWZ6XJXJXIXIXSXSXRXRXQXQXPXPV1),)-).V3XMXLXLXHX;XGXGXTSG)/SGXYXYXZXZY#Y#Y$Y$Y%Y%XE)0)1)2)3XFXCZ6Z6Z8XJXJXIXIXSXSXRXRXQXQXPXPTR)4)5T0XMXMXLXLXHX;XGXGXTXTXXXXXYXYXZXZY#Z/Y$Y$Y%Y%Y&Y&Y')6)7XDXVZ6Z6XKXJXJXIXIXSXSXRXRXQXQXPXP)8)9):X<XMXMXLXLXHXHXGXGXTXTXXSGSGZ/Z/XZZ/Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUXVZ6Z6XKXJXJXIXIXSXSXRXRXQXQXPXPV+);)<X<XMX:X:X:XHXHXGXGXTXTXXXXXYXYXZXZY#Y#Y$Y$Y%Y%Y&Y&Y'Y'XUXUVIZ6XWXKXJXJXIXIXSXSXRXRXQXQXPXPVLVL)=)>T;T;XLXLXHXHXGXGXTXTVMVMVMVM)?VJVJVG)@VOVFVFVFVHVHVHVHVH)AVKXWXKXJXJXIXIXSXSXRXRXQXQXPXPVLVLT;T;T;T;)BVL)CY()DVNVNVN)EVMVMVM)FVJVJ)G)HVO)I)J)K)L)M)N)O)P)QVKVKVKVKVKVKXIXSXSXRXRXQXQXPXPVLVLT;T;T;T;)RVL)SY()TVNVNVN)UVMVMVM)VVJVJ)W)XVOVOVO)YXEXEXEXEXE)ZVKVKVKVKVKVKVKVKVKVKVKVKVKVKVK*#*$*%*&*'*(*)***+*,*-*.*/*0*1*2*3*4*5*6*7*8*9*:*;*<*=*>*?*@*A*B*CVKVKXPXPV,*CXNXNU;UZ*BTH*CTHTHV,THV,V,*BV,*CU;*CV>V>*CUZ*DUZUZUZTV*DVP*DVPXXY#W@YIY#XJT,UVT,XSXS*B*CU$U$*C*D*DTH*ETHTH*ETHTH*EV,THTHV,*E*F*GUZ*GUZ*HUZUZV4XHVPVPYJ*GYJYJ*G*HXXXX*HYIYIX1YI*H*HW@X1*IW@*I*J*KX/*KX/*L*L*MX.*N*N*OWZWZ*OWZWZWZXVXVWZ*OVTVTVTUV*NUVUVUVUVT,UVT,*MVC*NVC*NU:VC*OU:U:*OU:U$*OU$U$*O*PU$U$THV,U$V,V,*OV,*P*PU;*Q*RU;U;*RU;U;U;U;*RX9XHXHX7XGXGX7YBYJ*PYJ*QYWYWYW*Q*QY9Y9*R*RYIYIYIYIYI*RYIYIYI*R*S*S*TX1X1X1X1*T*U*UW@*VW@*VX/*W*XX/X/*XX/X/*XX/*Y*Y*ZW>+#+#WZ+$WE+$+%WEWE+%+&WE+'VTVTW;+'VTVT+'VTXKUVXKT+UVUVT+UV+%T,UVT,VE+%XSV5+%VB+&VB+&+'VB+(+(V.+)+*V.VD+*VDVD+*VDVDV,+*V@++U;++U;V@V@++V@V@++U*+,U*XNXNU*V7YBYBXH++YBYB++YBXGYJYB+++++,+-+.YW+.+/+0+0+1+2+3YIYI+3YI+3+4+5+6+6X1+7X1X1X1+7+8X1+8+9+:+:+;+<+=+=+>+?+@W@W@W@+@+@+AW6W6W6+A+BW)X/X/+B+CX/+CX/X.X.X.X.+CX.WEWUXUWE+BXUW;W;W;W;T+VB+A+B+C+C+D+E+F+F+GTYTYV.VD+G+HVDVDTN+HV@V@+H+I+IV@V@V@V@V@V@+IV@+I+J+K+KV7+LV7+L+MYKYK+M+NYK+O+O+P+Q+R+R+S+T+U+U+V+W+X+X+Y+Z,#,#,$,%,&,&,',(,),),*,+VV,+,,,-,.VR,.VRVR,.,/,0X+,0,1,2X*X*,2X*X*,2,3X*X*,3,4X*,5,5,6WXWX,6,7,8,9X.,9X.,:WUXUWUWEWZ,9,:WZ,:,;UC,<,<TYTYTYTY,<TYTN,<,=,>,?,?,@UUUU,@UUUUUU,@U0XNXNXH,@XHY@,@,A,BYD,B,CYDYD,C,DYOYO,D,EYO,F,F,G,H,I,I,JY;Y;,J,KY;,L,L,M,N,O,O,PVW,Q,Q,R,S,T,T,U,V,W,W,X,YX+X+,YWXWX,Y,ZWXWX,Z-#WXWXWX-#WX-$-$X.-%Y'X.X(X(X(-$WEXUXUUC-$-%-&-&TY-'-(-(TN-)TNTN-)TN-*XH-*XHS<-*-+S<-,-,---.-/YOY,T(T(Y,-.-/S;-/-0S;-1-1-2-3-4-4X&-5X&X&-5X&X&-5-6-7-8-8-9-:-;-;-<-=->WXWWWXWW-=X(X(X(ZJZCXKZCV?-<XRUK-<-=UK->->-?-@-ATNTN-AUMTN-AUM-B-BUT-CUTXHX5XHSC-B-C-DT$S2S2-D-E-ET(-F-G-GS;-HS;S;-HS;-I-I-JWT-KX&-K-L-M-MW<-NW<-N-O-PW?W?-PW?W?-P-QW?-R-R-S-T-U-UWX-V-WWXWX-WWXWXWX-W-XWXX(-XX(UK-XUKXQ-X-YUNUNUNUMUN-Y-YU1-ZV=-Z.#.$.%.%V2.&.'VAT-.'.(XH.(X6.).)T$.*T$.*S4.+S4.+.,S4T#.,T#T#T#SZ.,SZSZ.,SJ.-SJ.-SJSJ....WT./.0WTWT.0VQ.0WH.1WHW?.1W?Y$.1X0X0X0.1.2.3.4.4WX.5.6.6X#WX.7.7Y&WGY&XP.7XPXP.7UFXPTQTFTFV$.7TF.7.8TKTK.8TK.9TAXNU/XNXH.8XHS7.8.9.:.;.;.<.=.>.>.?.@SM.@.ASM.B.BSZ.C.DSJSJ.D.ESJ.E.FS1.F.GS1.H.H.ISWSWW?W?W?.IW?.IW?.J.J.K.L.M.MW3W3W3.M.N.OWGZBXUZ9Z9XUXUZ9ZRZHZH.MZHTQV$Z?XP.LTF.MTFTF.MTF.NTK.N.O.P.P.Q.R.S.SXMTBTBSD.SXHXHS/.SXGXG.SSMXGT'.SSB.T.U.U.V.WSL.W.X.Y.ZSH.Z/#/$S1/$SYSW/$SWSWXYW?W7Y$W7/#/$W7/%W7W7W7/%/%/&/'WFWG/'WF/(ZPZP/(/)Z9ZRXUZRZRZFXVXVZHZHXVZWZ?UBXPUB/%/&/'UB/'/(/)/*/*V0/+V0TB/+TB/,U(U(U(/,U(UWU(UWSN/+SN/,/,/-/./////0SQ/1/1/2S@S@/2/3/4XYY#Z1Z+Z+W7WOW7/3/3WF/4WFWFW8WF/4W8/4W8/5ZSZ7ZS/5ZKZWXVXVZWZWZ>Z>Z>Z<ZZ/3/3ZT/4/5ZEXIZVZVZIZIZVZV/3/4UB/5/5/6UA/7/7/8TTTT/8/9/:/;/;/<T?/=/=XLT?XLSP/=SPSPSQ/=/>/?/?S@/@/AS@Z.ST/AZ0Z0/AZ*/AW7Y%Y%/AWFY&Y&WF/AXEXE/A/B/CX@/C/DX@X>/DZSX>XUZS/DZSZSZAXV/DZAXWZ>XWZ=Z=ZX/CZXZVZV/CZVZVZVZV/CUB/CUB/DUAUA/D/E/E/F/G/H/HV3/IV3V3/IV3V3XT/IXTT*/ISPT*/J/J/KSE/L/L/M/NSTSTZ*XYZ*XZZ2Z4Z2/LX@/MX@X@X>/MX>Z;Z;ZN/MZXZXZ6XKZ@ZQXSXSXOV1V1/K/K/L/MT2/M/N/O/PT*/P/Q/R/R/SSG/T/TST/UXX/UX@/VX=X@X>X=/VX>X>/V/WX>X>/W/XZNZNZMXVV1/WV1/X/X/Y/Z0#0#0$0%0&SG0&SGSGXE0&XEXE0&X=Y'X=X=0&X=0'XFXF0'0(0(0)0*T1T70*0+T7Y'0+Y'Y'0+0,XBXBXOTRXOV+0+0,0-0.0.XNT6X<V+0.XOV+T;0.XNXNV+V+T;T;0-T;T;T;XZXZ0-VJY$Y$VGVOXVXV0,VKXLXL0,VLXH0,VL0-0-SG0.SG0.VM0/VM0/VJ00VJ00VG01VGVGVOVGVO0001VOVO0102VOVO020304XE0405XEXE0506XEXE0607XEXE0708XEXE0809XEXE09VK0:VK0:VL0;VLVL0;VL0<0<SG0=SG0=VM0>VM0>VJ0?VJ0?VG0@VGVGVOVGVO0?XE0@XE0@VK0AVK0AVLVKVKVLVLVKVKT;T;VKVKT;T;VKVKT;T;VKVKT;T;VKVK0<VLVKVKVLVLVKVKVL0;VKVKY(Y(VKVK0:SGVKVKVNVNVKVKVNVNVKVKVNVNVKVK07VMVKVKVMVMVKVKVMVMVKVKVMVMVKVK04VJVKVKVJVJVKVKVJVJVKVK02VGVKVKVGVOVKVKVOVOVKVKVOVOVKVKVOVOVKVK0.XEVKVKXEXEVKVKXEXEVKVKXEXEVKVKXEXEVKVKXEXEVKVK0)VKVKVKXPXPV,U;XQXQU$THU$THU$THV,U;V,U;V,U;V,U;U;U;U;UZU;U;UZUZV>UZV>V>TVTVUZUZXXXXVPYIT,TWT,TWTWU:VCU:U$U$THTHU$U$THTHU$THU$THU$THTHTHV,V,THTHV,V,THTHV,U;V,U;V,V,THV,V,U;V,U;UZUZUZV4UZV4UZUZYJYJYWYWYJYJ/IY9YJYJY9YI/HYIYIYIYIX1/HX1X1W@X1X1X1W@X1X1W@X/W@X/W@W@W@X/W@X/X/X/Y'X/X.X.X/X.X/X.X/X/X.X.X/X/X.X.X.X.X.WZX/X/X.WZX/X/WZWZX/XUWZWZWZVTVTVTVTVTVTUVT,TWT,TWT,TWT,TWVCU:VCVCVCU:VCVCU:U:VCU:THTHU$U$THTHU$U$THTHU$THV,U;T>T>T>T>V,U;U;U;T>U;T>U;U;U;U;U;U;V@U;U;V@V@U;XNU*XNYJYJ/*YWYWYW/*YWYW/*/+/,YWY9/,Y9Y9Y9/,/-YIYI/-YIYIYIYI/-YIYIYIX1YIYIX1X1YIYIX1X1/*X1X1X1X1X1X1/*X1X1/*X1W@W@X1W@X1W@X1W@W@X/W@X/W@W6W6W6X/X/W6X/X/X/X//%X.X.X/W>X//$X/W>X.X.W>W>WZWZW>X,W>X,X.X.WZWZX,WZX,WEX.X.WZWZWZWEWZWZWEWEWZVTWEWEVTVTWEW;WEW;W;W;W;VTW;W;VTVTW;VTUVT,XJXJVBU=U=V5.NVBV5VBV5V5VBVBU'U'VBVBU'U'TXTXVBTXVBVBU$V.U$V.U$V.U$.IV.V.V<V.V..HV..IV,V,VDV,V,U;V,U;V@U;V@V@V@V@U;V@V@U;V@V@U;V@V@V@V@V@U*U*Y6.BY6Y6.BYB.C.DXGXGY).DYJ.D.E.F.FYW.GYW.G.HY.Y..H.IY..J.J.K.L.M.M.NZ'Z'.N.OZ'Z'.OYX.P.Q.Q.R.SYI.S.T.U.V.V.WYGYG.WYI.X.YYIY>YI.Y.Y.Z/#/$/$/%/&/'YI/'/(/)/)X1/*/+/+X1/,X1X1X1/,WRX1X1WRVRX1X1WLWL/*/+VRVRWLWLVRVR/*X)/+/,X)X)/,X)/,WKVR/-WKWKW%/-X)X)X)/-X)W@X)W@/,/-/.//WJ///0/1W@/1W@W@W@W@/1W6W@W@W6W6W6X/W)W)W6W6W6W)W)X/W)/.X/X//.X/X/X.X.X.X.WUX.WUWEWEW;W;VBVB/+VBVBUCXRUC/*UCUCUCVB/*/+/,U$U$/,/-UCUCUC/-TYTYUCTYU$V<U$V<V<V.V<V.TY/*TYTYTNTN/*TN/*TNTN/+/+TZ/,/-V@V@/-/.V@U;V@V@V@/-/.//TDTDV@TD/.UPUP//U0U0U0U)TD/.V7V7V7V7U)UO/-YBYB/.YBYB/./////0YK/1/1/2/3/4YK/4YK/5Y.Y./5Y.Y./5/6/7/7/8/9/:/:/;/</=/=Z'/>/?Z'Z'/?/@/@/A/B/C/C/D/E/F/F/G/HY?/H/IY?Y?/I/JY1Y1/J/KY1/L/L/MY?Y?/MYI/N/OY?Y?Y?/OY?Y?/O/PYIYI/P/Q/Q/R/SZ&/S/TYIYI/T/UYIYI/UYSZ&/V/V/WWMWM/W/XYI/YVXVXVX/Y/YX1WMVV/Y/ZVVVVVXVV/Z0#X1WRVVWRWRVRWRWRVVVVWSWSVRVRWSWSW%/WVRVRW%W%VRVRW%W@W%W%VRVR/UX+W@W@W5W5W@W@W5X*W5W5X+W5W6W6X*X*W6W6/QX*/QW)W)W)W)W)X*X*W)W)/P/QX*WXWXWX/PWXWXWXWXWXWX/PX/X//PX//PX.X.X.WX/PWXWX/PWX/Q/RX.WUX.WUX.WUX./QWZW;WZWZWEWZWEWEUC/OUC/PTGTG/P/QUC/QUCTY/QTY/RTY/RTNTNTNTN/RTN/STZTZ/S/TTN/TTN/U/UUU/VUUV@/V/W/X/X/YUUUU/YUUUUUU/YU0XNXNYDYDYD/YYDYD/YYDYD/YYD/Z/ZYD0#YDYKYK0#0$YK0$YKYK0$YO0%0&0&0'YOYO0'0(0)0*0*0+0,0-0-0.Y,Y,0.0/000101020304Y,04Y,05Y;Y;05Y;XXYTY;Y;YT04Y;Y;YI04Y;05YIYI0506Y;06Y;07YIYI0708VUVUW#VU0708090:W#W#0:XYVUVUVWVUWVWVWV09VWVW090:WVWS0:WVWSWSWVVRVW09VW0:WV0:0;0<0<VR0=0>VRVR0>0?0?0@0A0B0B0CW/W/VRVR0C0DVRX+X+X+0CX+X+X+X+X*WXWXX*X*WXWXX*X*WXX*X*X*X*0@X*WX0@WXWXWXWX0@0@0AWP0BWX0B0C0DWPWP0DWWX(0DX(X(0D0E0F0GUC0GXRV?0GV&0HU20HTY0I0JV&0J0K0LTYTYTP0LTY0LTYTNTY0LTNTN0LUU0MUU0MUU0NUUXHY@XHS<0M0NS<S<YD0N0O0PS<0PS2S20PT)0QT)YO0QT)YE0QT)S2T(0QT(T(T(0Q0RY,XXT(T(T(S;Y;Y;XX0Q0Q0R0S0T0T0U0VVS0V0WW+0X0X0YVYVYVSVYWT0YVYVYWTVY0XX&0YX&0Y0ZVY1#X&1#X&X&1#VW1$1%1%1&W:W:W:W:1&W:W:W:W:1&1&1'W:1(1(1)1*1+1+1,W<W<W<1,W<1-X+X+W<W?X+WXWXWX1+W?W?W?WXWXW?WXWWWW1*1+V?1+UKUKU2U21+U2TO1+TO1,UKUQUK1,1,UJ1-1.1.TN1/10UQUQ10UN101112UQ12XPUQXP12UUXPUUXPUUU1U1UUUUUU11UU1112UTX5S<1213S<S<SC13SCSCSCT$T$S2T$S4S2S2S4S2S2T(S2T(S2T(S2S2T(T(T#T(T(1-T(S;T(S;T(S;1,1-1.WTS;1.S;S;1.1/WTWT1/X&10X&1011WTWTX&X&11X&1112W.1313X&WHWH13W<X&14X&W<WHXZW<W<W<131314W?W?W<14W?W?14W=W?1515WX1617WXWX17181819W?1:WXWX1:W?W?WX1:X01:1;1<W?1<X0X0X0WXWXX0WX1;WX1<WXWXWXWX1<WXWX1<WXWXWX1<1=WX1=WX1>1>1?X#X(UK1?XQUN1?UNUNUNUN1?UNUNUN1?UNU-UM1?1@TJ1@TCU-1AU1U1TMTMU1UTU1U1XOXOV=TFU<1>U<XOUTU+U1V'V'1=XOXOV21=XOXOV*1=XNTK1=T.US1>1>SCT$T$XHT$S?1>SCT$T$T$T$T$S?T$T$S4T$S4T$S4T$S4S2S2S4S4S2S2S219S2T#T#T#SZT(SZSZT(SJSZSJSZSJSZSJ15SJSJSJSJSJSJ1515WTSJWT15WTS3S3WT1516VQWTWTVQVQWTWTWTWHWHWHVQWHW?13W?Y$W,13Y$X0X0131415X-W$X-X-14W$15W$1516W$17W$17W$1818W3X-19WXWXW3WX18WXY&Y&Y&WGWXWG17WGWGWG17U-XPXP1718U&UFV$TFV$TFXOXO1718TF18TF19XN19TKV;TK19TKTK191:S?1;S?1;S7S>S4S4S41;S>S>1;SDS>1;1<S>S4S4S41<1<T%T%T%1<1=S/S/T%1=1>S01>T#T%T#1>T#1?SM1?T&1@1AT#T#SM1AT#SZSM1ASM1A1BSBSZSZ1BSZ1BSZSZ1CSZSZS5S5SJSJS5SHSJ1ASHSHSJ1ASJS1SJSHSHSH1@1AS1S11AVQ1B1CS1SWS1S1VQVQVQSWVQVQSWSW1@W*1AW*W?X0W?X0Y$X0W?W$X0W$X01?1?1@1AWN1AW$W$W$WNWNW$W3WN1@WN1AY&Y&W3WGWXWGY&WGWXWGW3WBZHZGZHZHV$V$TFXOXOTFU.U.TF1;TFTFTFTFTFUGTKU/TKTETKTKUGUGTETEUGTEU/17U/V%V%TLV%TLU/U/TEV0V%TLV0TBXMXM14XMSX14SXSX14S015S01516S0XGSM1617SBSSSBSN17SBSBSNS9S5S5S516S5S5SLS5SBS9S915S5S515SQSHSHSQ1515SQSQSQSQSQSQ15S1S1SHS114SI15SISISY15SYS1S1S1SWS1SWSWSWW$13W7WA13WAWAWA13WA1415W7WB15WOW(WB1516WBWG16WBWBWFWOWFWG15WFWFWFWFWFW8W8ZPW8W8ZPY'W8W8U.U.1213U.U.13UBUB13UBUBTFTFUBUBTFUGTFUGUBUBUBU%U%UGU%UGUGV0UGUGUGV0UGV0TBU(TBU(1,U(1-U(U(U(1-U(SN1-S9S91-1.1/10S910S9SLSLSLSLSQ1/SLSPSL1/SQSLSQSLSQSQSQSQ1.SQ1/SQ1/SQSQ1/SI10S@10SYS@11SYSY11SYSWSWSYXY1011S@S@W7WOW7W7WOWOWO10WOWFW7W7WFW8WFW8W8ZSW8ZSW8ZSW8ZSZ7Z7Z7ZAZZXKZZZ5Z<XJZOXJZOXJZ5ZOXJZTZOXJ1'V/UBUBV/U%V/1'UBUAUBUAUG1&UAV)V)UGV)TTV)1%UAUAUGV0TTTTV0V0TTTTTBTBTTT/T/U(T/U(TTT/TTV3T/0X0YT?U(U(T?T?0X0Y0Z1#T?1#T?T?1#1$UEUESPSPSP1$SQSQSQSRSPSRSRSR0Z1#SRSR1#1$SRSRSR1$SR1%1%ST1&STZ.Z.XYZ3Z3Z*Z3Z*W7W7Z,Y%W71#Y&Y&WFW-WFW-W8W8Y'X@W8Y'X@X@Y'X@XEX@Y'W8X@X@W8ZSY'X>ZSZSX>X>ZAZAZSZSZAZAZ;Z;Z=Z=Z=ZXZTXIXIZVZVZVZVZ@UBUA0OUAV10OV10PUAUAUA0PUAT=0PT=TTTTUATITTTTTITIT=0NT=TITITI0NTI0NV3V3V30NV30OV30OT?0PT?SPSPT*T*SPSP0OT*T*SET*SESRSRSE0NSR0N0OSFSFSF0O0PSFSTSFSF0OSTSTSTSF0O0PSTXEX@XEX@XEX@XEX@X@0NX@X@Z;XVZNZNV1T10M0NT30NT70O0OT=T2T20O0P0Q0RT=T=0R0S0S0T0UV3T2T=T20U0U0V0WV3T*SET*SET*T*T*SGT*SGSGSGSESESE0T0TSGSGSGSGSG0T0USGST0UST0USGSGSGXEX@XEX@XEX=XEX=X=X>X=XFX>X>XFXFX>X>XF0QX>X>0Q0RX>XUXFXU0QT80R0S0ST50T0UT4T2T90UT2T2T20UT90UT7T70U0V0WT0T20W0X0Y0YV3UR0Z0Z1#T0T0URURT0XN0ZSGSGSGXEXEXEXA0YX=XAY'X=XFX=0YX=0YX=0ZXFXFXD0ZXFXF0ZXFV1V1V10Z0ZT7T7T7V10ZTRTRT0T00ZT0T10ZT1T1X=0ZY'Y'XDXDXBXB0YXDXBXBTR0YTRT60Y0ZT6T6V+T6V+V+T6T60YT60YT1T6T6V+T;V+V+XNX<T;XNT;T;V+T;VMVJVMVJVHVKVHVKXLXLT;VLXHXHVLY(VLY(VLY(Y(SGY(SGY(SGY(SGVNVMVNVMVNVMVNVMVMVJVMVJVMVJVMVJVJVGVJVGVJVGVJVGVFVFVOVOVFVFVOVOVFVFVOVOVFVFVOVOVFVFVOXEVFVFXEXEVOXEVOXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVHXEXEVHVKXEVKXEVKXEVKT;VLT;VLT;VLT;VLVLY(VLY(VLY(VLY(Y(SGY(SGY(SGY(SGVNVMVNVMVNVMVNVMVMVJVMVJVMVJVMVJVJVGVJVGVJVGVJVGVOXEVOXEVOXEVOXEXEVKXEVKXEVKXEVKXOVLVKVLT;VLT;VLVLY(VLY(Y(SGY(SGVNVMVNVMVMVJVMVJVJVGVJVGVOXEVOXEXEVKXEVKYJYJ/U/VYJYJ/VYIYIX1YIYIYJYJYJ/UYJ/UYJYW/UY9Y9Y9XTY9/UYFY9Y9/UY9YW/UY9Y9Y9Y9/U/VY9/VYIYIYIYI/VYIYIYI/VY>YIX1X1X1X1X1/U/VX1X1X)X)X/X//UW6X/W>X/X/VBVBU=VBU$V<U$V<V.VDV.VDV./QV.V.Y6Y6Y6/QYBYB/QYB/Q/RY6Y6Y:/RYBYBY)Y.Y)/RYJYJYJ/RYJY5Y5Y5Y5/QY5Y5/QYWYWYWYWYWY5YWY5Y5/P/QY5Y5/Q/RY5/RY5Y5YW/R/S/TY./TY./UYWYFYWYWYFY9YXYXYWYWYWYNYN/RYN/S/SYWY5Z'YWXTZ'Z'XTY=/RY=/RZ%Y=/SY9/SYXYXYNYNYN/SYN/SYNYN/S/TYXYI/TYIYIYI/TYIYN/UZ%Z%/UZ%Z%Z%Z%/U/U/VZ'/W/W/XYGYG/XYGYGYG/XYGYGYGYIYIYGYIYG/WYGYGYIYI/WYI/WY>/XYI/XY>Y>Y>Y>Y>Y>/XY>Y>YIY>Y>YP/WYPYIYIYI/WYIYIYI/WYI/WYIYIYZYZYZ/W/W/X/Y/Z/Z0#YPYPYP0#YP0$Y>X10$X1YP0$0%0&X1X10&X10&0'0(0)0)X1X1X1X10)X1WRX1X1VRVRX1WLVR0(0(0)0*X)WLX)WLWKX)X)WKWKX)X)WKX)WKWKWLWKWK0&VR0'0'WKW%W%X)X)X)0'WK0'WKWK0'WJ0(WJWK0(W%W%W%0(W%W%0(0)W@W@0)WJW%WJWJW@WJW@W@0(W@W60(W6W6W6X/X/WXWXX/X/WXWXVBVB0&0'0'UCUCUCU$U$VBU$VBVB0&0'VBVB0'TSU$U$0'U$U$U$U$0'UCUCUC0'TNTN0'UX0'TNTYTN0'TNTNTNTN0'TNTNV@V@TZTZ0&TZTNTN0&TZ0'0(TZ0(TZTZ0(V@TZ0)V@V@UU0)V@UUV@UUUU0(UU0)V@V@UPUPUPU0UPU0U*V70'V7Y6Y6XGYBYBYBYKYKYB0%YK0&YBYBYKYKYBYBYB0%YBY)0%0&YK0&YKYKY)Y)0&0'0'0(0)Y.0)0*YKYK0*Y.0+0,YKYKYK0,0,0-YK0.Y.Y.0.Y.Y.0.0/00Y.00Y.0101YM02YM02Y.0304Y.Y.04050506YO070708YOYOY.08090:0:0;Z$Z$YO0;YOYO0;0<0=0>Z'Z'0>Z'YM0>0?0@0@0A0B0CZ'Z'0C0DZ'Z'0D0EZ$0EZ$0F0FY/0G0H0H0I0J0K0KY20L0M0M0NY2Y20N0OY20P0P0Q0RY-0RY10SY10S0TZ'0U0U0VY?Y?0V0WY?Y?0WYGY?Y?YGYGY?Y?0V0WY1Y1Y?0WY1Y10W0XY10Y0YY?Y40Z0Z1#1$1%1%1&1'Y?1'Y?Y?Y?YIYIY?1'Y?1'Y?Y?1'1(Y?Y?Y?1(YTYT1(Y?YTYTY?Y?YTYI1'1(Y?Y?YIYI1(YIYI1(1)1*1*1+1,1-Z&Z&YIZ&Y?Y?1,1-1-YIYIYIYI1-YI1.Z&1.1/YI1/YS101111YSWMWMYS11YSWM11X1WMWM1112YIYIWMWMY+12Y+Y+YIY+VXVXVUVUX1X110WMX1X1X110X1X110X1VX1011VU11VUVUVUW%W%11W%X+X+11X+X*11X*X*W6W611W)11W)WX1212WXWXWXW)WXWXWXWX11WXWX11X/WXWXX/X.X.X.WXX.WXWXX.X.WXWXWXWX1.WX1.X.1/X.WUWUX(1/UCTGTGTGTGTGUCUCTGTGUCUCTGTGTYTY1+TYTYTYTGTYTGTGTGTG1*TY1*TNTNTNTN1*TNTZTNTZTN1*TZTZ1*TZTZ1*1+1,1,1-1.U31.1/1011U311U312U31213UUV@V@V@1313V@14UU1415UUUUV@V@1516V@16UUUU16UUUUUU16U0U0U0YDYD1617YDYD1718YKYK18YK1819YDYD19YD1:YD1:YDYDYD1:1;YDYD1;1<YDYDYK1<YK1=1=YO1>YOYKYKYK1>1>YO1?YOYOYOYO1?Z(Z(YOZ(1>1?Z(Z(YRYR1?YRZ(Z(YOYO1>1?YOYL1?Y-YRY-Y-1?Y-1@1@1A1B1CY-1C1DYUYYYYY,Y,1C1DY,Y,1DY11E1FY1Y11F1GYVYV1G1HYVYV1HYV1H1I1J1KY1Y11KXXYVYV1KY;YVXXY;Y;Y,1JY,Y;Y,Y,Y,1J1JY;1KY;YTYIXXXXYIYI1JYIX%X%Y;Y;X%X%X%1IX%1IX%X%1IX21J1KY;1KY;1L1LYI1MX%YIYI1M1N1NW#1O1PW#W#W#1P1P1QX&X&1Q1RX&X&1RW#X&X&1R1SVWVWVWVWX&1SVWVW1S1TWVWV1TWVWVWV1T1UVW1UVWVWWVX$WV1U1U1VVWVWWVWVVWWV1UVR1VVRVRVRVR1VVRVR1V1W1W1X1YW'1Y1ZW'W'X$1Z2#2$2$2%2&2'2'W/2(W/W/W/2(W:2(2)2*W'W'W'W'X+2)W'W'W'W'2)W'W'W'W'X+X+X*X*WXWXX*WXWXWXWXWXWX2&WX2&2'WP2'WPWPWPWPWP2'2(WX2(WXWXWXWX2(WP2(2)WPWP2)WW2*WWX(WEX(WEUCUCUC2)2)TYV&V&UC2)UCUCV&V&2)V&UCUC2)2*UCUC2*2+V?2+V?V?TY2+V&TYV&2+V&V&V&2+V&2,V&2,V&V&U22,U2U22,2-U2U22-TYTOTPTYTNTNTNTNTN2,TN2,2-TN2.2.2/TNUUTN2/TN20TN20TN2121YDYD22YDYD22YDYDYDS2S22122S<S<22S223S2S2S2S<S2S2T)22T)22T)23T)YOYOYEYET)T)S2T)21T(T(T(Y,21Y,22Y;Y;2223WI23WIWIY;Y;23Y;Y;23242525W+WIW&W+W+25W+XX25W92626W+27282829S;W929Y;W+W+292:W+W+W+2:W+2;2;2<2=VY2=VYVYVYWT2=WTWT2=X&2>2?VY2?2@X&VY2@VYVYX&X&2@X&2@X&VY2AX&2AX&X&2A2BX&2CX&W:2CW:2CW:W:W:VW2CW:W:W:2CW:W:X&2CX&X&W:W:W:W<W:2BW:W:2BW:W:W:W:W:2B2CW/W/2CW<W:W<W<W<2BW<W<W<W<W<W<W?W:W:W:2A2AW<2BW<2B2CW<2DW<2D2E2FW?W?2FW?WW2FWWX(2FX(X(X(V?U2V?2FUKU2UKUKTOV#TOTOTOTOTO2DUKUQUKUK2CTNTOUJTO2C2D2EUJUQUQUQTNTN2DTNUQ2DUQUQTNTN2DTNUQUNUQUNUQUQ2CUQUQ2CUQUQ2CUQUNUQ2CXPUJXP2CUUXPXPUUUTUUUTUUUTUUUTUUU1U1U1X5SCSCSCS<S<SCSCSCS2SCT$2=S;T(S;S;2=2>2?VSWTWTWTS;WTS;S;WTWTS;WTVYVYWTWTWC2;WT2<X&X&WTX&WTWTWT2;WT2;WTWT2;WQ2<2=X&X&2=X&WQX&W.W.X&2<W.2=W.2=W.WH2=X&2>XZX&2>X&2?X&W<X&W<2>W?W?W?W<2>W<2?2?W?W?W?W<W?W<W<W?2>W?2?W?2?W?W?W=WXW=W=W=W=W?W?W=W=2=W=2=W=W=2>W?X'2>2?W?W?W?2?2?2@2AW,2AW,W?W,X'X'2AW?W?W?W?2AW?W?W,2AW?W?2AW?W,2AW,2BW?X0W?X0X0WX2AWX2AWXX0X0WXWXWX2AWXWXW$WXWXWXWX2@WXWX2@WXWXWX2@WXWXX#Y&X#WXX#2?X#X#Y&2?X(UKUKUK2?UKUN2?UNUN2?UNUNUMUMUNU-UMTJ2>TJUM2>UMTJUM2>U-TCTCV=V=V=U<V'U<U<V'V2XOV2V2V*XOXO2:VAV:V:2:V6U@2;U,U,U#UIXHSCXH2:2:S?S?S?S2T#T#T#S;29SJSJSJS3SJS3XYWTSJWTSJSJS3S3WTWTVQ26WT26VQVQW?W,W?W,W,X025X0WXWXX0X-X0X0W$W$23X-W$W$W$W$X0W$X022X0W$X-22W$W$W$X-W$22W$22W$W$WXWXW$WXW$W$Y%WX20W$X-W$20W3X-W3WX20WXWXX#X#Y&WGUN2/XPU-U-V=U&U&V=V=2.2/TK2/TKTKTUU@2/TKTFTKTKTKTKTK2.TKUIUIV;V9V(V(2-TKXHS?XHS6S?S?2,2-2-S?S7S7S?S4S?S4S4S4S>S4XH2+XHSDS>S4S>S/SDS>2*SXS4T%S4T%S4S4S4T%S4S4S/S/T%T%2'T%S02'S0S0S/S0S/2'T#T#2'T#T#T#T#2'2'SMSMSM2'T&SOT&S02'S0SOT&SMT&SM2&SMSMSMSMSBSM2&2&SB2'SZSM2'SMSBSZSZ2'SZ2'SZ2(SZSZSZSZS5SJSJSJSHSJS3SJS1S12%S1S12%S3S1S1S3VQS3S3S12$S1SAVQVQ2$XYW?W?2$W*W?W*W*W*W$W$2#Y%W$W$W$WN1ZW$WNWNW$1ZW$W$X01ZX0W$X-W3WNW3WNW3W3W3TKTKTF1XU/XNU/V%TLTLTLTBSX1VSXSX1VS0S/S01VS0XGS01V1W1X1Y1YSM1ZSMSMSMSBSBSMSB1Y1ZSSSSSNSNS5S5S51YS9SLS9SL1XS5SQSQSHSH1XSQSQSQSLSQSQSQSQ1WSQSISQ1W1WSISISISI1W1XSYW$W$WA1XW$W$W$WAWAWA1WWAW71WW7W71WW7W7W7WO1WWOWOY&W(WB1W1WWBWBWBWBWBWF1WWGWGWGWFXOU.UBU.U.U.1UU.U.U.1UUBUBU.UBUBTBU(TB1TT/U(T/U(U(U(U(1SSNS9SNS9S91R1S1TS9S9SL1TSP1TXTSP1TSPSPSPS9SLSLSL1SSLSLSLSLSLSLSQSQ1RSQ1S1S1TSQ1USQS:SQ1USISI1US@1US@S:S@1USY1V1WS@SYS@S@SYSY1VSYS@SYS@S@SYXY1UXYWOWF1UWFUBV/UBUBV/V/V/UAUGUGUG1SV)V)V)1ST/T?T/T?1RV3V3V3U(V-1RT?V-V-T?1R1RT?T?T?T?1RT?UET?1RT?T?1R1S1T1UV-V-1UXLSPSPSP1USQ1USR1VSRSR1VSQSQS@SRSRS@S@1US@SRSRSR1U1U1VST1WS8STS8STS8ST1VS8WFWF1VWFUBUB1V1W1WUA1XUAV1UAV1UAUAUA1WUAUAUA1WT=1WTITITITITI1WTI1WV3V3V3TIV3TI1W1WV3V3V3T?T?V31WV3T?V3V31VSPT*T*SRSRSE1VSRSRSRSFSRSFSFSFSE1TSESESFSFSE1TSTS8ST1T1TSTSFSTSFSF1TSFX@X>X@X>V1V1V1T8T4T4T8T4T3T7T3T71PT7T7T7T71PT7T7T1T1T11PT:T21PT2T41PT4T41PT2T1T2T2T2T21P1PT=1QT=1QTIT=TITIV3V3V3T=T=T=1PT2T2T21PT=T21P1QT2V3V3V31PV3V3V3SE1PSG1QSE1QSESGSG1QSG1R1RSGSUSGSGSGSG1RSGSVSGSGX>X>XFXFX>X>XFXF1O1PXFXFV1T8V1T8V1T8V1T51NT5T5T5V1T5V1T5V1T5T71MT5T51MT71MT21NT2T2T2T21NT9T2T91NT21N1OT01OT0T0T01OT0T0T01O1P1QURT21Q1R1S1SURURUR1SV3UR1T1T1UURV3T01UT0T01UURT01VSG1VSGSGXEXEXA1V1VXFXFXFXD1VXDXDXDXD1VXD1V1WXDXD1WXDXDXDV11WV11X1XT7T7T7V1T7V1T1T0T01WT0T7T7T1T11VXDXDXDXDXDXDXBTR1UTRT6T1T1T61UT1T11U1VT6T6V+T6T1T1T6T6YW1TYWYW1TY91UY9YJYJ1U1VYJYJYJYWYWYWYJ1UYWY9Y9Y9YWYFYWYFYFY9YFY9YWY9Y9Y9Y9Y9Y91QY9Y9YIYIY9Y9YIYIYIYIY9YI1NY>Y>Y>1N1OX)X)X)1OX)X)X/X/X/W6VDVDV.VDY6Y6Y61M1MYBYB1N1N1OY6Y6YBYBY6Y6Y:Y:YBYB1M1N1O1PYJ1PYWYWY5YWY5Y5YJYW1OYWY.1OY.Y.1OY5Y.1PY5Y51PY.Y5Y5Y51P1PYWY51QYWYWYWY5YWYWY.Y.Y5Y5Z'Y5Z'Z'1NZ'1NZ'1O1PYXYXYNYNYNYNYN1OYWYWY5YWZ'Y=Z'Z'Z%1MZ%Z%Y=Z%Y=Y=Y9Y9YXYXYNYN1KYNYN1KYNYNYXYIYXYXYIYIYX1JYIYI1JYIYXYXYNYNYNYIYNYNZ%Z%Y=Z%Z%Z%Z%YGZ'1FZ'Z'Z%Z%1FYG1FYGZ'YGZ%1FYGYG1FYGYGYGYNYNZ%YGYGYIYGYGYGYIYG1DYGYIYIYI1CY>Y>Y>Y>Y>YIYIYIYIY>1BY>Y>Y>1BY>Y>Y>1BYIYIYI1BYIYIYZ1BYIYZ1BYZ1B1CYSYP1C1DYIYIYP1DYIYIYIYIYI1DYIYIYI1DYZYZ1DYPYZYP1DYPYPYPYP1DYPX1X1X1Y>Y>1CYPYPX1YPYPYPYP1B1CYP1CYP1DX1X11DX11DYIYIYIYP1DYI1EYIYIYI1EX1X11EX1X11EX1X1X11EX1WRVR1EVRVRX1X1X11EX1X1X)X)X11DX)X)WKWK1DWKW%W%VR1DW%WKW%W%X)X)X)WJX)WKWKWKWJWJ1AWJWKWJWKWJWKW%W%W%W%1?W%W%WJWJWJW@W@W@1>W@WJWJ1>WJW@1>W@W6W@W@1>W6VBVBVB1>VBVB1>1?VB1?UCUCVBVBUCUCVBVBUC1>VBVB1>UCU$U$TSTYU$U$TYTYUCTGUC1<TY1<TYTY1<1=TNTN1=TNTNTNTN1=TNTN1=TZ1>1?TZTZULTZ1>UL1?1@TZTZTNTNTZ1?TZTZ1?V@TZV@V@V@TZTZ1>UPUUUPUU1>UUUPUU1>UUUUTDTDTDV7YBYBY81=1=Y8YK1>YBYB1>YKYK1>YK1?1?1@1AY0YK1AYKYK1A1BY0Y01B1CY0Y0Y)Y)1C1D1D1E1FY.1F1G1H1I1IY0YK1JY0Y01JY0Y0Y.1J1K1K1LYKYK1LY.1M1N1N1OZ)Z)YK1O1P1Q1QZ)1RZ)1R1S1T1UY.Y.1U1VY.1VY.1WY.Y.Y.1WY.1W1X1Y1Y1Z2#YMY.YMY.Y.1ZYMYMYMYMYMY.YM1YY.1ZY.1Z2#Z)Z)2#2$Z)Z)2$2%2&Z$2&Y.Z$2'Z)Z)Z)2'Z)Z)2'2(YO2(YOYOZ)2(2)2*2*YOYOYOY.Y.Y.2*2*2+2,2-Z$2-Z$Z$2-Z$Z$Z$2-2.Z$Z$2.2/YOYO2/2021222223YAYA2324Z(Z(YAYAZ(Z(Z'Z'2324YMZ'YMYMYMYMYM23YMYM232424Z'YMYMZ'Z'2425YMYM2526YM2627Y/2728Y/Y/Z'Z'Y/Y/2728Y/Y/28Z'Y/Y/Z$28Z$Z$Z$28292:2:Y/2;2<Y22<Y2Y22<2=Y2Y2YA2=YAYA2=2>Z(Z(2>2?Z(Z(Z(Z(2?2@Y2Y2Y22@Z(Z(Z(2@Z(2@2A2BY/Y/2B2CY/2C2D2E2E2FY2Y22F2GY2Y2Y2Y12GY1Y2Y22G2HY2Y22H2I2IY-2JY-Y22JY12KY1Y1Y-2KZ'2KZ'Z'2KYGYGYG2KY?Z'2LYGYG2LY?YGYGY?Y?Z'Z'2KY?2KY?Y?Y?YGYGY?YGY?Y?2JY?Y?Y?2J2KY?Y?Y?2KY?Y?Y1Y1Y?2JY4Y4Y4Y4Y12JY?Y?2J2K2KY?Y42LY4Y4Y42LY42LY?Y?2LY?2M2NY?Y?2NY1YGYGYG2NYGYGY?Y?2M2NY?Y?YIY?Y?Y?YIYIY?Y?Y?2LY?Y?2L2MY?Y?2MY?Y?Y?Y?Y?Y?2MY?Y?2MY?YIYIY?2MYIYIY?YIY?2LY?YIYIYIYIYSYIYI2KZ&2K2LZ&Z&YS2LYSYS2LYSYSYSYSYSZ&2LYSYSZ&Z&Y?2KY?Y?2KYIYIYIY?2K2L2M2MZ&Z&Z&YI2MYIYIZ&Z&Z&YI2LYIYIYI2LYSYSYSYSYS2L2MYSYS2MYSZ&WM2MWMYPYPYSYSYPYPYP2L2L2MYIY+Y+WMY+Y+Y+VXY+Y+WM2KWMWMX1X1VVVV2JX1VVX1VXVX2J2KVU2KVUVUVXVX2KVUW%W%VRVRX+X+2JX+2J2KX*X*2KW)W)W)W)W)X*W)2J2KWXWXW)W)2KWXWX2KWXWX2KX/X/X/WXWXWXX.WXWXWXX.2IX.X.X.X(WUX(X(2HTY2ITYTY2ITYTYTYTYTY2ITNTZTNTZ2H2ITN2J2JTZU3U3TZTZ2J2KTZ2KUUUU2KV@UUUUTNTNTNU32J2K2LU3TN2LTN2MTNU3TN2MU3U3U8U3TN2LTNTN2LU52MTNU3UUU3UUU32LU32MU3UUUUUU2L2MUUUUV@V@V@2M2MV@V@V@V@UUUUUUV@V@V@UUV@2KUUUUV@V@UUUUV@V@UUUU2IUUUUUU2IUUUUUUUUUPUUUPYD2HY@Y@Y@2HY@Y@2H2IY@Y@YDYD2IYDYKYK2IYKYD2IYDYDYKYKYDYDY@2HY@2IY@2IY@YDY@2IY@YDYKYKYDYDYKYKYD2HYKYK2H2IYKYK2I2J2JYO2K2LYK2LYKYKYOYO2LYO2LYOYKXTYKYKYK2L2LYOYKYOYKYOYKXT2KYOYOYOZ(2KZ(Z(YRYR2KYRYRYRZ(2KZ(2KZ(Z(2K2L2M2N2N2O2P2QY1Y1Y-Y-Y-2PY-Y-YLYLYL2PYL2PYY2QYL2QYYYYYYYYYY2QY-Y-2QY-2Q2RYUYU2R2SYYY,2SY,Y,Y,2SY1Y1Y12S2T2UYVY1Y1YVYVY12TYVYV2T2UYVYVYUYVYUYVYVYVYVY,YVYV2SYVY1Y12SY1Y1Y12SY12SYVYVYVYV2SYVYV2S2TYVYV2TY;2UY;Y,Y,Y,Y;Y,2TY,Y,Y,Y;Y;Y;Y;Y;Y,Y,YIYIYI2RX%X%Y;X%YIYIX%X%Y;2PY;2QY;2QY;Y;2Q2R2SX&2SX&X&X&Y;X&Y;X&YIYIX%YIX%X%2QX%YIYI2QYIYI2QYIW#X2W#X2W#X2X22PX2W#W#X2W#W#W#2OW#2O2PX&X&2P2QX&X&2QX&X&X&X&W#X&2QW#W#2QW#WVWVVWVWWVWV2P2QVWVWX&X&VWVW2PVWVWVW2PVW2PWV2QWVVW2QVWVWWVWVVWWVVW2PVWVWWVX$WV2P2P2QVW2RWVWV2RWVVRVR2RVRWS2RWSVRVRVRVR2RVRVR2RX$X$W'W'W'2QVRW'W'VRVRW'W'W'W'2P2QVRW'W'W'W'2PW'W'2P2Q2RX$X$X$2R2S2S2T2UW/X$2U2V2W2W2X2Y2Z2Z3#W'3$3$3%W'W'W/3%WV3&WV3&WVW/W/W/3&W/3&3'3(3)3)3*3+3,3,3-W'W'3-3.W'W'VRVRW'W'3-WXWPWPWXWX3-WPWX3-3.WPWX3.WPWPWPWPWP3.3.3/30WWWXWXWX30WXWXWX30WX30WPWP30X.WPX.WPWPWP303031WWWWUCUCUC31UCTYUCV&UC30UC3131V&V&V&UC31XRV?3132V?V?V?32V?V?V?32V?U2V?U2V?V?TYTY31TY31TYV&V&TYTYV&TYV&TYV&30V&TYV&TYV&V&U23/V&V&U2U2V&TY3.U23.3/TPTP3/TNTNTNTN3/TNTNUUUU3/30TNUUTNUUTNTNTN3/3/UUUUUUUUUU3/UU3/UU30UU30UUTNUUTNUUUUUU3/YDYDYDYDYDS<3/3/YD30S<S<30S<S<S<S2S<30S2S230S230S2S2S2S230S231S2S2S231S231T)T)T)T(31T(Y;Y;3132Y,32Y,Y,32Y;Y,XX32Y;Y,Y;W032WI33Y;Y;W0W0Y;Y;3233Y;33343535W+W+W+W0W035WI35363738W&W&3839393:3;W23;W+3<W+3<3=VSVSW+W+VSVSW13<S;3=3=3>W93?Y;Y;3?3@Y;Y;Y;W+Y;3?W+W+W+W+W+3?W+3?VYVY3?Y;W+W+3?3@VYVY3@VYVYVY3@3AVYVYWTVYWTWTX&X&3@X&3@X&VY3AX&X&3AX&3AX&X&X&VY3A3B3C3CX&3DX&3DX&VY3EVYVYVY3E3EX&3F3G3GVWX&X&VWVWVW3GVWVW3GVW3GVWX&VWX&X&X&W:VWVWW:W:3E3FW:W:W:3FW:W:W:W:X&3FW/3FW:W:3FW:W:W:W:W:W:3FW:W:3F3GW:W<3GW<W:W<W<W<W:3FW:W:W:3F3G3H3HW<W<W<W<3HW<3I3IW?3JW?W<3JW<W<W<3J3K3LW<3LW<3M3MW?W?W?W?W?3MW?WWWWWW3MWWY'X(Y'V?U2V?V?TOTOUQUQV#3JV#V#UQUJUQ3JTO3JTOUQ3JUQUQUQUJ3JUJUJUJTNUJ3JTNTNUJ3JUQUQ3JUQ3J3KUJUJUNUQUN3K3KTNUJUJTN3KXPTNT(S;T(3K3KVSWTVSS;S;S;3K3KWTWTWTWC3KWCWCWCWCWT3KWTWTWT3KWT3KWTWTVZWQ3KWQWQWQWTWQWQWQW.W.X&X&WHX&X&3HW.3IW.W.W.WH3H3IWHWHWHX&3IX&3IXZWHWH3IW:3J3KX&3KX&X&W<W<W<W?W<W<W<3JW<W?W?W?3IW?W?W?W?W?3IW=3IW=W?W?W?W=W?W?3H3IW?W?W=3IW=W=W=W=3IW=W?W?3IW?X'X'W?W?W?W?W?3HW,W,3H3I3IW?W,W,3I3J3KW,3K3LW?W,X'X'W?W?W?W?W?X0W,3JW,W,3JW?W,W?W,W,3JW?W,W?W,W,X0WXWXWX3HWXX0X0WXWXW$W$WXWXWX3GWXWX3GWXWXWX3GWXWXX#X#X#X#Y&X#X(UKUKT@3EUKUKUNUNUN3DUNUNUM3DUM3EUMUM3ETJTJ3ETJTCV*3EV*V:T-T-T-3EV8T.3ET.XHSCXH3ET$T$3ES?S;S;SJSJ3DWTVQVQWTWTVQVQ3CX0W,X0X03CW$W$W$W$X0W$X-X-3B3CW$3CW$W$W$3CW$W$W$W$X-W$W3W3X-W33A3BWXWXUN3BUNU-U&V=U&V=V=V=V=UFT<T<3@T<3@TUTKTKTFTFTF3@3@V(TKTKS?S?3@S6S?3@3A3BS?S?S?3BS>S>XHSDSDSDSDSXS/T%S/S/T%3?S0S03?S0S0S0T%T#T%T%T#T#SMSMT#SMSMSMSOT%SO3<SOT&SOT&T#SMSMSMSM3:SMSBSMSBSMSB39SBSBSBSMSBSMSB38SZSZSZSZSZ38SZ38SZSZSZS3S3S1S1S3S3S1S1S3S3SASASASA35SWW?W?W?W*34W$W$W$W$W$WNWNW$WNW$WNX0W$X0W$TKTKTF3131S/S/S/S/S/S/S0S/S/S/S0S03/S030SOSOSO30S030S0S0303132SOT&T&T&32T&32T&XGSMSMXTSSSBSBSSSBS530S5S5S5S530S530SQSQSQSQSQSQ3030SI31SISQSQ31SISISYSYSY3031SISYWAW$WAWAWAWAW730W730W7W7WA30W731WBWBWOWBWB30WBWBW(WBW(30WBWBWFWFU.U.UBU.U.U.U.UBU(U(3-U(U(U(U(3-S9S9S93-S93-XTSPSPSL3-SL3-SLSLSL3-SLSPSP3-SLSPSPS9S93-SLSQSISQ3-SQ3-3.SKSQSQSQ3.SKSKSK3.S:S:3.S:SQS@SQS@3-S@SKSKSK3-3.3/3/SYSYSYS@3/S@S@3/SYS@SYSYSY3/SY3/S@S@S@3/WFWFWFUG3/V)V)V)V)V)3/V33/V3V3V-V-T?3/V-V-3/UET?3/T?T?3/UET?UET?UET?T?V-U(3.V-3.U(V-V-V-V-3.V-V-V-V-UE3-V-UEUESP3-SPSQSQSQ3-SQSR3-SRSR3-SQ3.3/S@S@SR3/SRS8S8S8SRSRSR3.S8S8S83.ST3.ST3/S83/STSTW7WFW7WFUBUBUB3.UBV1V1V1V1UAV1V1V1V1V1UAUAUA3+T7UAUAT7T73*TITITITITITI3*TTTT3*V3TIV33*V3TI3*TIV3V3T?T?T?SPSPT*T*SF3(SESFSESFSESFSFSFSG3'S8S83'STSF3'SFSFSFSF3'SFT73'T7T7T7T=T73'T13'T1T1T:3'T:T2T1T1T4T1T1T23&3'T2T2T23'T=T=3'T=3'3(T=T=T=3(T=TIT=3(T=T2T23(3)V33)T2T2T2T2T2V3V3T2V33(V3SE3(3)SGSESGSGSGSESESE3(SGSGSG3(3(SUSUSUSGSGSUSUSGSG3'SV3'XFXFXFXF3'XFXFT5T8T5T5T73&T73'T5T53'3(3(3)T93*T9T2T9T2T2T2T23)T2T2T7T7T2T23(T0T2T0T7T0T23'T0T0T7T0T7T0T23&3'URUR3'URUR3'UR3(URT23(T23)T2T23)T2T23)T2UR3)URURURV3V3V33)V3V3URURURV3URURV3V33'V33'URT0T0URUR3'URURURT0T03&SUSGSGXEX=XAX=X=3%X=XFXF3%XDXDX=XD3%XDXFXF3%XDXFXFXDXDXF3$XD3%V1T7V1T7V1T7V1T7T7T7V1T7T7T0T72Z2ZXDX=XDTRTRTRT1T62YT6T62YT6T6T6T62YT6T6Y9Y92Y2ZY9Y92ZY92ZY9Y9Y9YJYJ2ZYIYJYJ2Z3#YJYWYWYWY9Y9YIYIYIY>Y>Y>2X2YX1X)2Y2ZX)X)2ZX1X)X)Y62Z3#YBY6Y63#YBYBYB3#YBYBY63#Y6Y63#Y6Y6Y)3#Y)Y)3#Y.3$Y.Y)Y)Y)3$3$Y.3%Y.YJ3%YWYWYJYJ3%YJY5Y5Y.Y.Y5Y5Y.3$Y.3$Y.Y.3$Y.Y.Y.Y5Y5Y.Y.Y53#Y5Y53#YWYWYWY.Z'Y.Z'Y.2Z3#3$3$Z'Y.Y.Z'Z'3$Z'YNYN3$3%YNZ%Z%Z%YNYN3$YNYXYX3$3%YX3%YXYI3%YIYIYIZ'Z%Z'Z'Z'YGZ'YGZ'YGZ'Z'Z%Z%YGYGYGZ%YGYGYG2XYGYG2X2YYIYIY>YIY>Y>Y>Y>YPYPYPYP2WYP2WYIYZYZYIYIYZYZYI2VYIYIYZYPYZ2VYPYP2VYPYI2VYIYI2VYPYIYIYPYP2VYIYIYIYPYPYIYIYI2UYZYPYPYPYP2TYPYPYP2T2UX1Y>Y>YPYPYP2TYPYI2TYPYPYPYPYP2TX12TX1YPYPX1X12TX1YPYIYIYIYP2SX1X12SX1X1X1YIYIYI2S2SX12TX12TYIX12UX1X12UX1WLWLVRWLX1X12T2UX1X)X)X)WKWKWKW%W%W%VRW%WKWJWKWKWJWJW%WJ2PW@W@W@WJWJW%WJ2OW@W6W6W@W62OW6VB2OVBUC2O2PUCUC2PVBUCUCUCUC2PUC2PVBUCUCVBVBUCUC2OTGTGTGTNTN2OTYUY2OUYUYTNTNUYTNVD2NTNTNTNTZTN2NTZTZULTZTN2MTNTNUL2MTNTN2MULTNULTNTNTN2MULUL2MTNV@V@TZ2MV@V@2MV@UPUP2MUPUUUP2MUPUUUPUU2MY8YKY8YKY8Y8Y82LY<Y<YKYKYB2KYBYKY0Y02KY02KY0YK2LY02LY0Y02LY)2M2NY0Y02N2O2O2PYK2QY)Y)2Q2R2R2SY0Y02S2TY0Y0Y)Y)2T2UY)2UY)2V2V2W2XY.2X2YY)2Z2ZY.3#Y.3#Y.Y.Y.Y)Y)3#3$3$Y.3%Y.3%3&3'3(Y.Y.3(Y.Y0Y03(3)Y0Y0YKYK3(Y0YK3)Y0YC3)3*Y.Y.YCY.3)3*YKYK3*3+YKYKY.Y.3+Y.3+3,YKYK3,YKYKYKYKYKYK3,YKYKZ)YKYKZ)Z)3+YK3+YK3,3,YK3-YKZ)Z)3-Z)YKZ)YK3-YK3-YK3.3.YO3/YOYKYK3/30YOYO30YO3031YKYK31Y.323333Z'34Z'34Z'35Z'Y.Y.3536Y.Y.Y.36Y.3637YM3738YMYMY.Y.Y.YMY.37YMYM37YMY.YM37YMYMYMYK37YK3838Y.39Y.393:3;3<3<3=3>Z)3>3?Z)Z)3?3@Z)Z)3@Y.3A3BY.Y.Z$Y.3AZ$Z)Z)Y.Y.Y.Z$Z$Z$Z$3@3@YO3AYOZ)Z)YO3AZ)YO3AYO3AYOYOYOZ)Z)3A3B3BYOYOYO3B3CYOYOZ)YO3CYO3C3DY.3EY.Y.Y.3EY.Y.Z$Z$Z$Z$Z$YOZ$Z$YOYOY.3BZ$Z$Y.3B3CZ$YMYMZ$Z$YMZ$Z$Z$YOZ$YOYOZ$Z$YOYOZ$Z$YOYOZ$Z$3>3?YOYAYO3?YAYA3?YAZ$Z$3?Z$Z$Z$Z$YAYO3>3?3@3@YA3A3BYMZ'YMYMZ'Z'3AZ'YMYMZ$YMYMYM3@YMYMYM3@3AZ'Z'YMYM3@3AYMYM3AZ'3B3CYMYM3C3DYMYM3DY/YMYMY/Y/YM3CY/Y/Z'Z'Y/Y/3BZ'Y/Y/Z'Z'Y/Y/Z'Z'Y/Y/Z'Z'Y/Y/Z$3?Z$Z$3?3@Z$Y2Z$Z$Z$3@3@Y23AY23AY/Y/Y/3AY/3B3CY/Y/3CY/Y23CY2Y23C3DY2Y23D3EY2Y23EZ$YAYA3E3FYA3G3GY23HY2YAYAYAZ(3GZ(Z(Z(Z(Z(YRZ(Z(Z(YRYRY2Y23EY2Z(Z(YRZ(Y2Z(Z(Z(Z(Z(3C3DZ(Z(Z(3DY/Y/3DY23DY2Y2Y2Y/Y/Y/3D3DY2Y2Y23DY2Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/3B3C3C3D3E3FY23F3GY1Y2Y2Y23GY23GY23H3HY2Y-Y-Y23H3I3JZ(Y-Z(Y-Z(Y-Z(3IY2Y23IY13IY1Y1Y1Y1Y1Y-3IZ'YGZ'3IYGYG3IYGZ'Y?Z'Y?Y?Y?Z'Y?YG3GY?Y?Z'Z'Z'3GZ'Z'Z'Y?Y?Y?Y23FY?Y?Y13FY?Y?3FY?Y?Y?Y1Y1Y?Y?3EY?3EY4Y1Y13EY?Y4Y4Y?Y?Y43E3EY?3FY?Y?Y?3FY?Y43FY4Y4Y43FY43GY4Y43GY43GY?Y1Y13G3H3IY13IY1Y1Y1YGY?Y?Y?3HYGY?Y?YGY?Y?Y?Y?YIY?Y?YIYIY?Y?3EYI3FY?YIYIYI3FY?Y?Y?3FY?Y?YTYTYIY?Y?Y?Y?YIY?3DYI3DZ&Z&YIYI3DYIYSYSZ&YS3C3DYSYS3DYSYSYS3DZ&Z&Z&Y?Y?Y?YI3C3DYIYIYIYI3DYIY?Y?Y?3D3DYIYIYIYI3DZ&Z&YIZ&YIYIZ&Z&YIYIYI3BYSYSZ&YSZ&YSYSYSYSZ&YSYS3@YSZ&Z&WMWM3?X1X1X1Z&Z&Y+Y+3>3?Y+Y+WM3?WMWMX1X13?X1VXVXVXVUVX3>VUVUVX3>VUVU3>VUVUVU3>X+3?X+W6W63?X*W6W63?X*W6W)W)W)3>3?WXWX3?WXWXWXW)W)W)WXWXX/WX3>X/X/3>X/WXWXWX3>UCTYUC3>UC3>UCTYTGTGTYTYTY3=TYTNTZTZTZ3=TZTZTZ3=3=U3U4U3TZTZ3=3>TZTZTZ3>TZV@3>V@TZTZ3>3?TZ3?3@UUTN3@TNU33@3AU3U33AU3U3U33AU3TNU33AU33BU33BU83CU8TNU6TNTNU8U8TN3BTN3BTNTNUUUU3BUU3BUUUUUUU>U>U>3B3B3C3D3EV@UU3EUU3EV@3FV@3F3G3H3IV@V@3I3J3JUUUUUUYD3J3KY@YDYDY@3KYDYD3KY@YDYDY@Y@Y@3JY@3K3KYK3LYDYDYKYDYDY@YDY@YDY@YDY@YDYDYDY@YDYDYD3HYD3H3IYDYD3IYK3JYDYKYK3JYD3J3KYDYDYKYDYDYD3J3KYKYKYKYOYKYKYOYO3JYOYKYKYK3JYOYO3JYO3JYO3KYOYKYKYK3KYKYOYKYK3J3KYOYOZ(YRZ(Z(Z(YRZ(3JYRYR3JYRZ(3JZ(Z(YRYR3J3KYRYLYRYLZ(3JZ(Z(3JYLZ(YLZ(3JYR3K3KY-3LY-YR3LYRYRY-Y-YRY-Y-3KY-3LYLYL3LYYY-Y-3LY-Y-Y-3L3M3MYY3NYYYY3NYYYYY-Y-3NYUY-3NYUYU3NYUYUYUYUYUYYYUYUYU3M3NYUYUY,Y,Y1Y13MY1YV3MYVYV3MY1YVYVYVYVY-Y-Y1Y1Y13LY1Y13LY13L3M3NYVYVYVY,Y,Y1Y1Y13MY1Y13MY1YV3MYVYVYVY1YVYVY1Y1YV3LY1Y13LY1YVYVYV3LY,3LY,3MY,3MY,Y,YIYIYIX%X%X23LX2Y;X2X2X2X2X2Y;3KX2X23K3LX2X23LX2Y;Y;Y;3LX&X&Y;X&X%X%X%W#W#YIW#3JYIYIYIW#X2X23IW#3IW#X&X&3IW#X&X&W#W#3IW#X2X2W#X23HW#X2X&W#X&X&X&W#W#3GW#W#W#3GW#WVWVVW3GWVWV3GWVVWVWX&X&VWVW3FVWWVWV3FWVVWWVVW3F3FWVVWWVVW3FVWVWWV3FWV3GWVWVVW3GWVWV3GWVVW3GVWVW3GWVVWVWVRVRWS3G3GVRVRVRVRVR3G3H3HX$3IX$VRVR3I3JW'W'3J3KW'W'3KW'3K3LW'W'VRVR3L3M3MX$X$X$VRX$X$X$3L3MW/W/X$X$3M3N3N3OX$X$3O3PW/W/X$W/3PW/X$X$X$3PW/3PW/W/3PW/W/W/X$X$3P3QX$3QX$X$W/3Q3R3S3SX$X$3TW/3TW'W'3TW/W'W'W'W'W/W/W/3S3T3U3U3VW'3WW/W/3WW/WVW/3WW/3WW/WVWVW/W/3WW/3WX$X$X$3W3XX$X$X$X$3XX$X$X$X$3X3XW'X$3YW'W'3Y3Z3ZX$4#W'4#4$W'W'W'4$W'W'4$4%W'W'VRVR4%4&VRVR4&4'WXWXWX4'WXWXWXWP4&4'4(WPWX4(WXWP4(WPWPWPWP4(WWWWWPWPWP4(4(4)WWWW4)WWWWWWWX4)WXWXWXWP4)WP4)WXWPWPWXWX4)X.WPWPWP4)WW4)WWWW4)WWWWWW4)V&UCV&UCV&UC4)4)4*UCV&V&V&UCV&UCUCV?V?UCUC4(4)UCUCV?V?4(4)V?V?4)4*4+V&4+TYTYTYV&TYV&TY4*TYV&TY4*U2U2U24*U2U2U2TP4*TPTP4*TY4+TY4+TNTNTNTN4+TNTNTN4+TNU?4+UUU?UUTN4+TNUUTNUU4+UUUUUU4+UUUUUU4+4,TNUU4,UU4,UUTNUUYDYD4,YDYDYDS<S<YDYDYD4+YD4+S<S<S<S<S<4+4+4,S<4-S2S24-S24-S2S<S2S2T)S2S2S2T)S2T)S2S2S2T)S2T)T)T)T)T(T)T(4(Y;Y;Y;Y;Y;4(Y;Y,4(Y,Y,4(XXY,XXY;Y;Y;4(W0W04(W04(4)WIWIY;Y;W+W+Y;Y;4(Y;Y;Y;Y;4(W+4(W+W+Y;W+W+W+W+W+4'W+4'WIWIWIW&4'W&W&4'4(W&W&W&W&W&4(W&W&4(W+W9W&W9W9W&4'W9W9W9W9W94'W9W94'4(W94(W94)W&4)4*W+4*W+W9W+4*4+VS4,W+W+4,W+W9W9W14,4,W9W9W9W9W9W9W24+W2W2VSW9VSW94+Y;Y;W+W+4*Y;W+W+Y;Y;Y;4*W+4*W+W+W+VY4*VYY;Y;4*Y;Y;Y;W+4*Y;Y;VYVY4)VYVYVYY;Y;VY4)Y;Y;4)VYX&X&4)X&VYX&VY4)X&X&VYVYX&X&VYX&4'X&VYX&4'X&X&X&VY4'VY4(4(X&4)X&X&X&VYX&4(X&VYVYX&X&VY4(VYX&VYVYVYX&VYVYVYX&VYX&VY4%4&VY4&X&4'X&X&VWX&X&VWVW4&4'VWVW4'4(4(4)X&VWVWVWVWW:VWVWW:W:4'WV4(4)X&W:X&X&4(W/4)4*4*W:W:W:W:W:4*W<W:W:W<W<W:4)W<W<W<W<W:W<W:W:W:4(4(4)W:W:4)4*4+W<W:W<W<W<4*W<W<W<W<4*W<W<W<4*W<W<W?W?4*W?W?W?W<W?4)W?4*W<W?W?4*W?W<W<W<4*W?W?4*W?W<W<W<4*W<4*W<W?W<W?W?W?W<W?W?W?WWWWWWX(TNTN4'TNUJUJUQUJTOTOTO4&TO4&TO4'UJTNUJ4'UJ4'UJUJTNTN4'TNUQUQ4'UN4'4(UJUJTNTNUJ4(UNUQUNUQTNTN4'UJTN4'TNTNS;S;T(S;W9W9S;4&S;4&S;WT4&WTWTWT4&4'WCVY4'WTWTWTWTVZ4'VZ4'VZWTVZVZWQWQWQW.WHW.4&W.4&W.W.W.4&W.WH4&WHWHWH4&W.W.W.4&W.4'WHW:W:4'W<X&W<X&X&W<W<4&W<4&W<X&W<W<W<W<4&W<W?4&W?W?W?W?4&W?4&W?W?W?4&W?W?4&W=W?W=4&WXW=W=W=W=4&W?W?4&W?W,W?4&W?W?W?4&W?W?W,W,W?W,W,W?W,W,W?W?4$W,4$4%W,W,W,W,4%W,W?4%W?W?4%W,W?W,W?W?W,W,W?W?W,W,4#4$4%4&X0WXX04&WXWX4&4'WXWX4'WXWXWX4'4(UKUK4(UNUQUQ4(UNUMTJ4(TJ4(TJTJTJUMTJTJTJTJTJTC4'V:VAV:4'4'4(4)4*V8V8V8T.SC4)SCT$T$T$S?4)WTWT4)WTW,W,W,X04(X-W$W$X-X-W$4(X-X-4(W$X-X-4(4)W$X-4)X-WX4)4*WX4*W44+4,4,U-UNU-T<T<TK4,TUTUTKTU4+TKTFTKV(V(TKTKS6S6S64*S?S?4*S6S6S6S?S?S6S?S?S?S?S?S7S74'4(S0S0S/S04(S0SOT&SOT&SB4'SBSBSMSBSMSB4&SZSZSZSBSZ4&SZSB4&SZSB4&SWSWSWX0W$X0W$TFTFTF4%S/S/SXS/S0SO4$SO4$SO4%SOSOT&SOT&S0SOS0S0SOSO4#4$SO4$4%4&S0SOS0S0T&T&T&4%T&4%T&T&S5S5S54%S5S5S54%SHSHSQSHSQ4$SQSISISI4$SI4$SISQSISQSQSQSISISISI4#4#SY4$SYWAWAW7W7WAWAW7WAWAWA3Z4#4#4$W7W74$W(WBWBW(WB4$W(U(U(T/4$U(U(V-U(S9S9SPSPS9S9S9SPSPSLSPSLSL3XSLSL3XSL3Y3ZSLSLSPSP3Y3Z4#SL4#SI4$SISISISI4$SQ4$4%SKSQ4%SQ4&SK4&SKSK4&S:SQS:SISI4&SKSKSKSK4&4&S:S:4'S@4'S@S@SISYSISYSYSYS@4&SYSY4&SY4&SYS@SYSYS@S@S@WOWF4%WFUGV)V)V)V)4$V)TTV3T/V3V3V-V-4#4$V-V-4$4%4%4&T?T?T?4&T?T?V-U(V-V-U(U(U(4%V-V-UE4%V-V-4%V-SPSQSPSQ4$SQSRSQ4$SQSRSRSQSQSRSQSRSRSR4#SQSQSRSQS@S@SR3ZSR3ZSRSRS8S83ZS83ZS8ST4#ST4#STSTS8S84#S8UB4#V1V14#T3T3T7UAUAUA4#TITI4#TITTTTTT4#TITIV3V3TI3ZTIV33ZSRSFSFSGSFSGSGS83YSTS8SF3YSFSFSFSF3YSG3YT3T7T7T23YT2T2T:T:T1T:T:T2T:T2T13WT1T13WT2T1T2T2T2T23WT=T=T23WT23WT2T23WT=T=T=3WTIT=TI3W3XT=3Y3YV3V3V33YV3V3V3T=3YT2T23YV3V3V3SESE3YSGSESESE3YSESGSGSGSGSG3X3YSG3YSG3ZSGSVSVSVX>X>X>XF3X3YXFXFT5T53YT53Y3ZT7T73ZT5T74#T5T54#T5T94#T9T9T2T24#T2T9T2T9T23Z4#T0T04#T2T0T0T24#T0T04#V34$URT2URT2URV3V34#4$T2UR4$UR4$URURURT2T2T24$T24$T2T24$T2T04%T2T2T2URURUR4$URV3V34$4%V3V34%V3T2T2T0T04$URT0UR4$SUSGSUX?X?XFX?XFXF4#XFX=XDX=XDXD3ZXDXDXFXF3Z4#4#XDXDXDT74#T7T7X=XDX=XD3Z4#T6T64#4$T6T6T64$T6T6YW4$YWYW4$4%YW4&Y9Y94&Y94&4'Y9Y9YJYIYIYIYJYJYIYIYJYJYIYIX14$X1X14$X1X)X)X1X14$4%X1X1X)X)X1X1X)4$Y64$YBYBY64$YBYBY64$YBYBYBYB4$YBY64$Y6Y6YBYB4$YBY)4$Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.3ZY)Y.Y.Y)Y.3ZY.3ZY.Y.Y.YJYWYWYWYJYJ3Y3ZY5Y5Y53ZY.3ZY.Y.3ZY.Y.Y.YWYWY53ZY5YWY5Y5Y.Z'Y.Z'Y.Y.Y.3X3XZ'3YZ'3YZ'Y.Y.Z'Z'3YZ'3Y3ZZ%Z%YNYNZ%Z%YNYNZ%Z%YN3XYNYN3XYX3YYXYXYIYXYXYIYI3XYIYGYIYGYGY>Y>YIYIY>Y>YIYIY>YPY>Y>YIYIYIYZYZYZYIYZYZYPYZYZYPYP3QYPYIY>YIYIY>Y>YIYIYPYIYIYIYIYIYIYPYZYPYPYPYPX13LX1YP3LYPX1YPYPYP3LYPYP3L3MYPYP3M3N3NX1YPYPX1X13NX13NX1X1X1YI3NYIYIYI3NYI3OYIYI3OX13OX1X1X13O3PYIYI3PYIX1X13PX1WRWRX13PX1X13P3QX)X)3Q3RW@W@W@W@W@3R3RW6W6W6VBVBVB3RVBVB3RVBVBVBVB3RVBVB3RVBVBUCVBUCVBVB3Q3RUCTGTGTGTYTNTYTYUY3PUYUYVDVD3P3QULUL3QULULULTNTNTZTZULUL3OUL3PTNTN3PTNTNULUL3PTNV@V@TZTZV@V@3OTZUPUP3O3PUUUUUU3PUP3PUUUUY8Y8Y8Y<YBYBYBYKYKY0YK3NYK3NYKYKYKY0YKYKY0Y)Y0Y0Y)Y)3LY)Y0Y)Y0Y03KY0Y0Y0Y03K3L3M3M3NYK3OY03OYKYKY0Y03O3PYK3PYKYK3PY)Y0Y03P3QY0Y0Y)Y)3Q3R3RY)Y0Y03RY)Y03SY)Y)3S3T3T3UY0Y03U3VY0Y0Y)Y)Y)3V3V3WY)3XY)Y)3X3YY)Y)3YY.Y.Y.3YY.Y)3YY)Y)Y)3YY)Y)3Y3Z4#Y.4#Y.Y.Y.4#Y.Y.Y.Y)4#4$4%Y)Y)4%4&Y)4&Y)4'4'4(4)4*4*Y.4+Y.Y04+4,4-4-Y.Y)4.4.4/Y0Y0Y)4/Y0Y0Y.Y.4/Y.YK4/YKYK4/40YKYK4041YKY0Y0Y0YKYKY0YCY040YCYC40YCY040414242YC4344YCYC44YC44Y.45Y.Y.Y.4546YK46YKYK4647YKYK47Y.YKYKYKYKYKZ)Z)Z)Z)46YKYKYK46YK46YKYK4647484949YKYKYKZ)Z)494:Z)Z)YKYKYK49YOYOYKYOYK4949YOYOYOYOYO49YOYK494:YOYKYOYOYO49YOYOYOY.Y.YKYKY.Y.YK48Y.Y.48Y.YK48494:4:Y.Y.Y.4:Z'4;Z'Y.4;Y.4<Y.4<4=Z'Y.4=Y.Y.Y.Y.YMYMY.YM4<YMY.Y.Y.4<4<4=YMYM4=YMYMYM4=Y.4>Y.Y.4>4?4@Y.Y.Y.YMYMYMY.Y.Y.YMYMYM4=4>4?Y.4?Y.Y.Y.YKY.4?Y.4?Y.4@Y.4@Y.4A4BY.Y.4BY.4B4CZ)Z)4C4DZ)Z)Y.Y.Y.4DY.Y.4DY.4DZ)Z)Z)Z)4DZ)4E4E4FZ)4GY.Y.4GZ)Y.Y.4GZ)Y.Y.4GY.Z)4GZ)Z)4GZ$4HZ$Z)4HZ)4IZ$Z$4IYOZ)Z)Z)YO4HYOYOYO4H4IYOZ)Z)4I4JYO4J4KYOYOZ)4KZ)Z)4KYOYOYO4KZ)YOYOYOZ)YOYOYOYO4JYO4J4KYOYOY.4KY.4L4L4MZ$Z$Z$Z$4MZ$Y.Z$Z$Z$4LZ$Y.Y.Y.Y.4L4MY.Y.Y.4MZ$Z$YOYAZ$Z$YA4LYO4LYO4MYAYA4MYAZ$Z$4MZ$YO4MYOYOYOYOYOZ(YOYOZ(4L4LYA4M4NYO4NYAYA4NYAYAYAZ'Z'YMYMYMYM4MYMYMYM4M4NYMYM4NYMZ'Z'4N4OZ'Z'YM4OZ'Z'4O4PYM4PYMYM4PZ'4Q4RYMYMYM4R4RYM4S4TYMYMY/Y/YMY/4SY/Z'Z'Y/Y/Z$4RZ$Z$4R4S4T4U4UZ$Y2Y2Z$4U4VY2Z$Y2Y2Y2Z$Y2Y2Y24TY/Z$Y/4TY/Z$4UZ$4UZ$4V4V4WY2Y2Y/Y/Y24W4W4XY2Y2Y/4XY2Y24X4YY2Y24Y4ZY2Y24Z5#Y2Y2Z$Z$Z$5#Z$YA5#YAYAY2YAYAYAYAYAZ(Y2Y24YY24YY2Z(Z(YA4YZ(Z(Y2Y24YY2Z(4YZ(YR4YZ(YRYRZ(Z(YR4YY2Y24YY2Y/Y/4YY/Y/Y2Y2Y2Y/Y/4XY24X4YY2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/4WY/4X4XY?Y?Y?4X4Y4ZY2Y?Y?4ZY?Y2Y14ZY1Y24ZY2Y1Y2Y2Y2Y-Y2Y2Y24Y4YY-Y-Y-Y2Y24YY2Y2Y24YY2Y-Y1Y-4YY1Y14YY1Z(Z(Z(Y-Y24XY2Y2Y2Y1Y1Y1Y-Y14WY1Z'YGZ'Z'YGYGZ'4VYGYG4V4WZ'Z'Z'Y?Y2Y?4VY1Y14VY1Y14VY?Y1Y14V4WY4Y4Y4Y4Y14WY44WY44XY4Y?Y4Y4Y4Y?Y4Y?Y4Y?Y4Y4Y4Y?4U4VY44VY4Y4Y44VY44WY44WY4Y4Y4Y4Y44WY14WY1Y1Y?Y?Y?4WY?Y?4WY1Y14WY1Y1Y?4WY1Y1YGYGY?Y?YIYI4VYIY?4VY?Y?4V4WY?Y?Y?YTYTYT4VYIY?YIYIYIZ&Z&YIYI4UYIYIYIYSYSYIYIYSYSYIYIYSYI4RZ&Z&Z&Y?Y?YIYIY?YIYIYI4PYI4Q4RY?Y?Y?4RY?YI4RYIYIYI4RYIYIYIYSYSYSYS4QYSYPX1X1X1Z&Z&Y+Y+4OY+Y+Y+X14OWMWMX1X1X14OVXVXVU4OVXVXVUVUVXVX4NVUX+X+4NX+4NX+X+X+X*4NX*X*4NX*X*X*WX4NWXWX4N4OWXWXW)W)4O4PWXX/WX4PX/X/4PX/WXX.X.X.UCTY4OTY4OTYUCTYTNTNTY4OTZTZ4OTZTZTZTZ4OTN4OTNTNTZTZ4OTZTZTZ4OTZTZ4O4PV@4P4QV@V@TZTZTZ4QTZTZ4Q4R4RV@TZV@TZTZ4RUU4RU44SU9U44SU9U94SU3U3U34SU3U3U3TNU3TNU3TNU3TNU3TNU3TNU3TNU8TN4P4PU8U8TNTNU7TN4PTN4PTNTNUUUU4PUU4PUUUUUUU>U>U>UUU>4OU>U>UUUU4OUUU>U>UUUUU>UUUUUUV@UUV@4M4MV@4NV@4NV@4OV@V@4OV@V@UUUU4OUUV@V@UUUU4NUUUUUUV@V@V@4NV@V@4NUU4NUUUUUUYDYD4NY@4NY@Y@Y@YDYDY@Y@YDYDY@Y@YDYD4LYD4LYDYDYDYDYK4LYK4L4MYDYDYDYD4MYDY*4MY*Y*4MYKYDYDYKYK4M4N4NYKYDYDYDYKYDYDYKYK4M4NYKYK4N4OYK4OYKYKYOYOYKYKYO4NYKYKYK4NYKYKYOYOYKYKYKYO4MYO4MYOYKYOYKYKYKYOYO4LYO4M4MYO4NYOYRYRZ(YRYRYRZ(YR4LYRZ(YRZ(YRZ(Z(YRYR4KYRZ(4KZ(Z(Z(YRZ(4KZ(Y-YRYRYRYRYR4JY-Y-YRY-4IY-Y-Y-YR4IYRY-Y-Y-Y-YVY-YVY-Y-YLYLYLYYYLY-Y-Y-YYY-YYYYY-Y-YYY-YLYYYLYYYLYYYLYYYYYU4A4BY-Y-YU4BY-YUYUYUYUY-YUYUYUYUY,Y,YUYUY,Y,4>Y14?4@YV4@YVY14@Y1Y1Y1Y1Y1YV4@Y1Y14@Y1Y1Y1Y14@Y1Y14@YVY14@YVYVY1Y1Y14@Y1Y14@Y1YV4@YVYVY1Y1YVYVY1Y1YVYVYVY;Y;Y;4=Y;4>Y;Y,Y;Y;Y;Y,4=Y,4>X2X2Y;X2Y;4=Y;Y;4=Y;Y;Y;Y;X2Y;Y;X2X24<X2Y;X&4<4=W#YIW#W#W#W#4<W#W#W#4<4=4=W#X&X&W#W#4=4>X2W#4>W#W#W#X&X&W#W#4=W#4=WVVWVWWVWVVWVWVWVW4<VW4<WV4=WVWVWVVWWV4<WVVWWVVWWVVW4<WVWVWVX$WV4;WVWVWVWVVWVWWVWVVW4:VW4:VW4;WVWV4;WVVRVR4;4<WSVRVRVRVR4;VR4<4<4=X$X$VRVRVR4=4=X$X$X$VRVRW'W'VRVRW'W'W'W'W'4;W'W'4;4<X$W'X$4<W'4<W'W'VRVR4<4=VRX$VRX$4<X$X$X$4<X$X$X$X$X$X$4<X$X$4<X$4<4=W/W/4=4>W/W/X$X$4>4?X$4?W/W/4?4@W/W/4@4AW/W/X$W/W/W/X$X$X$W/X$4?W/W/4?W/W/W/X$W/W/W/X$X$W/X$4=4>X$X$W/4>4?4@W/X$4@4AX$X$4AX$4AX$X$X$X$X$4A4BW/W/4B4CW/W/W'W'X$X$4B4CW'4CW'W'4CW'W'W'4CX$4DW'4DW'4EW'4E4F4G4HW/W/WVWVWVW/WVW/4F4GWVWVW/W/W/4GW'4GX$X$X$4GX$X$W'4G4H4IX$X$4IX$X$4I4JW'W'W'W'4J4J4KX$X$W'W'4K4LW'W'4L4MX$X$X$4M4MX$W'W'X$4M4NW'4N4OW'W'4O4PW'4QX$4Q4RW'4RW'W'W'W'4RW'W'4RW'W'W'W'4RW'W'4RW'W'W'WXWX4R4SWXWXWX4SWXWP4SWPWX4SWPWPWX4SWXWPWXWX4SWPWPWPWW4SWP4SWWWWWP4S4T4UWPWPWWWWWPWW4T4UWXX.WX4UWX4UWPWPWXWX4UWPWXWXWXX.WPWP4TWWWP4TWWWWWP4T4UWWUCV&UCV&V&V&4TV&UC4TUCUC4TV&V&V&4T4UV?V?4UV?V?V?UCUCV?4UUCUC4U4VUC4VV?V&4VV&V&V&4VV&U2U24V4W4X4YV&TYV&TY4X4YU2U24Y4ZU2U24Z5#TP5$TYTY5$TY5$TYTPTP5$TNTYTNUUUUTNUUTNTNU?U?U?UUU?U?TN4YUUUUTNUUUUUUTNUU4XUUTNUUTNTNUUUU4WUUTNTNTN4WTN4WTNTN4WYDY@YDYDYD4WYDYDS=4WS=4W4XS<S<S<S2S<4XS2S24XS2S<S2S<S<S2S24WS24WS2S<S2Y;Y;Y,Y,Y;Y;Y,Y,Y,Y;Y,Y,4TY,Y,Y,Y;Y;Y;Y,W0W04S4TWI4TWIWIW0W0WIWIY;Y;4SW+Y;4SW+W+Y;Y;W+Y;4RW+W+W+W04RWIWI4R4SW&W&4S4TW&W&4T4UW&W+W&W&W&4UW&W&4UW+W&4UW&W9W9W9W9W24T4UW2W2W9W9W9VSW9W24TW2W9W2W9W9W&W+W&W+W&W&4R4SW94SW9W9W9W+VSVSW+W+VS4RVS4RVSVS4R4SVSVS4SW94TW9W14TS;W9W9W24TW24TVS4UVSY;Y;Y;W+Y;Y;W+4TW+W+W+4TW+4TVYVYY;Y;4TY;Y;4TVYVYW+VYW+VYVY4SVYVY4SVYVYVY4SX&4TX&X&X&VYX&VYX&VYX&VYVY4R4SVYVYVY4SVY4SVYVYVYX&4SX&4SX&VYX&VYVYVY4S4S4TVYVY4T4UVY4VVYVY4VVYX&X&4VX&VYX&VY4VVWVWX&4VVWVW4VX&VWVWX&4VVWVW4VVWX&4VX&X&4VVWVWVWWVWVW:WVW:4UW:W:4UW:W:W:W/W/4UW/W:4UW:W:4UW/4VW:W:W:4VW:4VW<4WW<4WW<4XW<W:W<W:W<W:4WW:W:4WW<W:W<W:W:W:4WW:W:W:4WW:4W4X4Y4YW<4ZW<W<W?W<4ZW<4ZW<W<W<W?4ZW?W<W?W<W?W<W?W<W<4XW?W<W?W<4XW<4YW?W?4YW?W<W<4Y4Z4ZW?W<W?TNTN4Z5#TOTOUQTOUQUQ4ZUQ4ZUQTOUQ4ZTN5#TN5#TN5$5%TNTNUJTNUN5$UNUN5$TNUJ5%TNTN5%TNUJ5%UJ5&TNTN5&UJTN5&TNUUW9VS5&VSS;S;S;WT5%WTWTWTVY5%WCVY5%X&VYVYWC5%WTWTWTWTWTVZWTVZWTVZW.WHW.WHW.WHW.4ZW.4ZW.5#5#WH5$WHWHWH5$W.5$W.W.W.W.W.W.WHX&W<X&W<W<W<4ZW<4ZW<X&X&W<W<W<W?W<W<W<W?W?W?W?4XW?4XW?W=W?W=W?4XW=W=4XW=WXWXW=4X4X4YW?W?W?W?W,W?W?W?W?W,W,W,W?W,W?W?W,W?W?W?W,W,W?W,W,W,W,W,W?W?W?4RW?W?4RW,W?W,W,W,W,4R4RW?4SW?W,4SW,W,4SW?4TW?WXWX4T4UWXWXWX4UWXWX4U4VWXWX4VWXWXWX4VX#4VWXX#WXT@T@T@4V4V4WUNUNUMTJUMTJUMTJUMTJ4UTJTCTCVAVAV:V:T-T-T-4TT-T-4TUHUHUDUDUD4SV6V6V6SCT$4ST$T$T$S?S?WTWTWTVQX0X04QX0X-4QW$4RX-4R4SW$W$4SW$4TX-X-4TX-W$4TW$W$WX4TWXWX4T4U4V4W4WW4W4W4W4W4WXWXW4W4WXWXUNUNUNU-T<T<TKTKTF4STF4TS6S64TS6S?S6S6S6T%T%S0S0T%T%S0S0S/S/S/S0SB4PSBSB4PSZ4QSZSB4QSBSB4Q4RSBSBSASASASWTFTK4QTKS0SOS0SOS0SOS0SOS0SOS0S04NSOS04OSOSO4OSO4OT&SOT&SO4OSOSO4OT&T&T&T&4OT&4PT&4PT&4Q4Q4RSLSLS5S54R4SSQ4SSQSISISI4SSISQ4SSQSQSI4SSISYSISISISY4RSYSYSYWAWA4R4SWAWA4S4T4TWYWYWYWYWY4T4UWBW(WBWBW(4TWBWB4TU(4UU(SLS94US9SPSPSLSLSLSLSPSLSLSLSLSPS94RS94S4S4TSLSLS9SLSLSLSQSI4S4T4TSISQSISISISKSISQSQ4SSKSQ4SSQSKSQSK4SSK4SSKSQSQSKSKSKS:SQ4RSQS:SISISI4RSKS@SKS@4Q4RS:S:S:4RS:S:4RS@S@S@SYSYS@4RSYSY4RSYS@S@4RSYWOWFWFWFV)4QV)TTT?V-V-V-V-V-4PV-T?V-T?4PV-UEUEUEV-4OT?T?4OT?T?T?4OUET?T?U(V-V-V-V-V-UEUEV-V-UEUE4LSQSRSRSQSRSRSRSR4KSRSRS@S@SR4K4KSRSRSRS8S84KS84KS8STS8S8S8ST4KST4KSTST4KS84L4MUBV1V1V14LUAT3T3UA4LTITITITI4LTITTTT4LTTTITITI4L4LSRSFSRS8S8S84LSFSFSF4L4LSGSGSGT3T3T7T3T2T=T2T2T14JT1T14JT2T1T2T2T2T24JT2T=T24JT24JT2T24JT=4KT=4KTIT=TIT=T=T=4KV3V34KV34KV3T2T2T24KT2V3T2T24K4LT=T=4L4MT24MV3V3SESESESGSESESE4LSG4LSUSU4LSUSUSUSGSG4LSU4LSUSUSUX>4LXFXF4LXFXFXFT5T5T7T5T74KT7T7T5T54KT7T5T5T74K4K4LT7T7T5T54LT7T2T2T9T2T2T24K4LT24LT2T04L4MT04NT2T2T0T04MT0T0T0T2T24MV34MURURURURV3UR4MV3V34MV3T2T2T24M4MURT2URT24MT2T2T24MT24NT2T24NT2T2T2T04NURUR4NURV3V3V34NV3V34NV34NURURURURURT04NSGSUSG4NXFXF4N4OXD4OXDXDXFXF4O4PXFXF4PXDXD4PXDXD4PT0T7T74P4QT6T6T1T1T6T6T14PT6T64PT1T6T6T14PT6T6YWY9YW4PY9Y9YWYWY9Y94OY9YW4OYWYW4OY9YWYWYWYWYWY9YW4NY9Y9X1X1X14NX1X14N4OX)4OX)X)4OX)X)X)4O4PX)X)Y6Y64P4Q4Q4R4SYB4S4TYBYBYBYB4T4U4UY6Y6Y6YBYB4U4VY.Y.4VY.Y)Y)Y.Y.4UY.4VY.4VY.4WY.YJYJ4W4XYJYJ4XYJY5Y5Y.Y.Y54WY.Y.4WY.Y.Y.YWYWY54WY.Y.Y.Z'Y.Z'Y.Z'4UZ'Z'Z'Y.Z'Y.4UY.4UY.Z'YNYNZ%Z%YNYNZ%4TYX4TYNYNYXYX4TYX4TYNYNYN4T4U4VYI4V4WYZYPYPX1X1X1YP4VYPX1YPYPYP4VYPYP4V4WYPYP4WYPYPYP4W4X4XX14YX1X1X1YPYPX1X14XX1YPYP4XX14X4YYIYIYIYIYI4YYI4YYIX1YIYIYI4Y4YX1X1X1YI4YX1X1YIYIX1YIYIYIX14XX1X1WR4XX1X1X1X)4W4XX)X)4XX)X)X)WJWJW@4X4XWJW@W@W64XW6W6W@W@W@W6VBVBVB4WVBVB4WVBVBVBVB4WVBVB4W4XVBVBVB4XVBVB4XVB4XTNUY4Y4Y4ZVDTN4ZTNTNTN4ZUL5#5$ULUL5$UL5$5%TNTNTNULTN5%5%TNTNTN5%5&TZTZUPUPUP5&UPUP5&UPUUUPUUUPUPUP5%UPY0Y0YK5%YK5%YKYKY0Y)Y05%Y)Y)Y0Y0Y0Y05$5%5%5&YKYK5&YKYKYKY0Y05&5'Y0Y05'Y05'5(YK5)Y0Y0Y05)5)5*YKYK5*Y05+Y05+Y0YKYKY)Y)5+Y)Y)Y)5+5,5,5-Y0Y0Y)Y)5-5.Y)Y05.5/Y)Y)Y0Y)Y)Y)Y)Y0Y0Y)Y0Y05,Y0Y0Y0Y0Y)Y05,Y05,Y0Y0Y)Y)5,Y0Y)5,Y0Y05,Y)5-5.Y)Y)Y.Y.Y)5-Y)Y)Y.Y.Y)Y.Y)5,Y)Y)Y)5,Y.Y.5,5-Y.Y.Y)Y)Y.Y.Y.Y.5,Y.Y)Y.Y)Y)Y.5+Y)5,Y)Y)Y)5,Y)5,5-Y.Y)Y.Y.Y.Y.Y.5,Y.5,Y.Y.Y.Y)5,Y)Y)5,5-Y.Y.5-Y.Y.Y.5-Y0Y0Y0Y)5-Y05.Y)Y)Y)5.Y)5.Y)5/Y)5/Y)Y)Y.Y.5/Y.Y)Y)Y)5/Y.Y.5/Y.5/50Y.Y.50Y.51Y.51Y)52Y)Y052535454Y)Y)Y)54Y)55565657Y)585859Y05:Y)Y)5:Y)5:5;Y)Y.Y.Y.Y0Y.Y0Y0YKYKY0Y0YK59Y0Y059Y0Y059YKYKYKY0YKY0Y0YCY058YCYC58YCY0Y0Y058YK58YKYK5859YKYK59YCYCYCYCYC595:YCYCYC5:YCYC5:YKYCYC5:5;5;Y.YCY.YK5;YK5<Y.Y.5<Y.5<Y.YKYK5<5=5>YK5>5?YKYKY.Y.5?5@Z)Z)YKYKYK5?Z)Z)Z)5?YKYK5?5@5AZ)5A5BYKYK5BZ)Z)5CZ)YK5C5D5D5EYKYKZ)Z)YKYKZ)Z)YKYKYKYKYOYOYKYOYK5BZ)Z)YOYOYOYO5AYOYKYK5A5BYKYOYKYK5AYOYOYOY.5AYKYKY.Y.5AY.YK5A5B5CYKYK5CY.5CY.Y.Y.5CY.Y.Y.Y.Z'5CZ'5CZ'5DZ'Y.Z'5DZ'5DZ'Y.Y.Y.5DY.5EY.Y.Y.Z'5DZ'5EZ'5EYMYMYMY.Y.Y.5EY.Y.YMYMY.Y.YMYMY.YMYMYMY.Y.5BY.YMY.YMYMY.5A5BZ'Y.5BY.5C5CZ'Z'Z'YKYKYK5CYK5C5DY.YK5DYK5E5E5F5GY.YKYKYK5GYK5GYKYKYKY.5GY.5GY.YKY.5GY.YK5HY.Y.5HY.Y.Y.Y.5H5HZ)Z)Z)5H5IZ)Z)5I5JZ)Z)Z)5JZ)Z)Y.Y.Y.5JY.Y.5JY.5J5KZ)Z)Z)Y.Z)Z)5JZ)Z)Z)Y.Y.5JY.Y.Y.5JY.Z)Y.Z)Z)Y.Z)Z)Z)5H5IZ)Z)Y.Y.Z)Y.Y.Y.Z)5HY.Y.Z$Z$5GZ$5HZ$Z)Z$Z)5H5HZ$5IZ#Z$Z$Z$YOZ)Z)Z)YOZ)Z)YOYOZ)Z)YOZ)Z)Z)Z)YOZ)Z)Z)5D5DZ)5E5FZ)YO5FYOZ)Z)Z)5F5FYO5GYOYO5GYOYOZ)5GYOYOZ)Z)Z)5GZ)YO5GYOY.Y.Y.5G5GZ$Z$Z$Y.Y.Z$Z$5FZ$Z$Z$Y.Z$Y.5FY.5FY.Z$Y.Y.Y.5FY.Y.5FZ$Y.Y.Y.Z$YAZ$YAYAYOYOYOYA5CYA5D5EYAYA5EYAZ$Z$YAYAYOYOYO5DYAYAZ(5D5DYAYAYA5D5EYOYOYAYA5E5FYOYO5FYO5FYA5G5HYMYMZ$YMYMYMYMZ$YMYMZ$5FYMYM5FYMZ'Z'YMYMZ'YMYMYMZ'Z'YM5DZ'Z'5D5EZ'Z'5EZ'YM5EYMYM5EZ'YM5FYM5FYMYMZ'Z'5FZ'YMYMYMY/YMYMYM5E5EY/Y/Y/5EY/Y/Y/YMY/Y/Y/YM5DZ$Z$Z$Z$Z$5DZ$Z$5DY2Z$Y2Z$Z$Y2Y2Z$Z$Z$Z$5BZ$Z$Z$5BZ$Z$5BY2Y25BYMZ$YMZ$5BZ$5C5C5DZ$5EZ$5EZ$5FZ$5FZ$Y25FY/Y2Y2Y/Y/Y2Y2Y/Y/Y25EY25EY2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y25CY/Y/5C5DY/Y/5D5EY/5EY2Y25EY/Y2Y25E5FY2Y2Z$5FYAYAZ$5F5G5HY2Y25HY25HY2YAYAYAYAYA5HY2Y25HY2Z(Z(5H5IZ(Z(5IZ(5IZ(YR5JY2Y25JY2Y/Y/5J5KY25KY2Y2Y/Y2Y2Y25JY2Y2Y2Y/Y/Y/5JY/Y?Y?Y?Y/Y?5IY?Y/Y/Y/5IY?Y?5I5J5J5KY2Y2Y?Y?Y2Y?Y2Y1Y1Y1Y2Y1Y1Y1Y2Y2Y25HY25HY-Y-Y2Y25HY2Y2Y2Y25HY-Y1Y-Y-Y1Y15G5HY25HY2Y1Y-Y-Y-Y15GYGZ'5HY?5HY?Y?5HY?Y?Y?Y2Y1Y1Y1Y?Y?Y15GY?Y?5GY1Y?Y?Y4Y4Y?Y?5FY?5FY4Y1Y4Y?Y?Y4Y4Y45EY4Y4Y4Y?Y4Y4Y?Y?Y4Y?5CY?5DY?Y?Y?Y45DY45DY45EY45EY4Y?Y4Y4Y?Y?5DY?5EY?Y?5EY?Y15EY?Y1Y15EY1Y1Y1Y?5EY1Y1YIYIY?5E5EYIY?YIYIYIY?Y?YIYIY?Y?YIYI5C5DYIYIZ&Z&YSZ&Z&Z&YIYIY?5BY?5B5C5DYIYI5DYIY?YIYIYIY?YI5CYIYIYIYI5CYSYSZ&Z&Z&Z&5BY+X1X1WMWMX1X1VVVVVX5@VUVU5@VUVUVUVRX+VR5@5@5AX+X+5AW6X*X*W65A5B5CW)W)WXWXW)W)WX5BW)W)5BW)WXW)WXWXW)W)WXWXWX5@WXWX5@5AWXWXUCUCUC5A5A5BUCUC5BTNTNTNTZTZ5B5CTZTZ5C5DTN5DTN5ETZTZ5E5FTZTZ5F5GTZTZ5G5HTZ5HTZ5ITZTZ5IV@TZV@V@V@TZTZTZ5HTZTZ5H5ITZTZ5I5JTZ5JTZ5KTZTZ5KUUU4U45K5L5LU9U9U9U4U4U95L5LU35MU35M5NU3U3TNU85NU8TNU8U8U8TNU7TNU7TN5LTNTNU3UU5LUU5LUUU3UUU>UUU>5L5LUUU>U>5LUU5MUUTZTZTZ5MTZ5M5NV@5NV@5OV@5OV@V@V@5OUUV@V@5OUUV@5PV@UUUUUUV@V@V@5OV@UU5OUUUU5OUUUU5O5PY@Y@YD5P5QY@Y@Y@Y@5Q5QYDYDYDYDYDYD5QYD5QYDYD5QYKYDYDY@YD5QYDY*5QY*Y*YKYKY*Y*YK5P5Q5RYKYK5RYKYD5RYDYDYKYK5R5SYKYKYDYDYKYK5R5SYKYK5SYKYKYOYKYOYOYO5RYOYKYK5R5SYKYO5SYO5SYOYKYOYOYOYO5SYO5SYOYOYOYO5S5T5T5UYOYO5U5VZ(5W5WYRZ(5X5XYRZ(Z(5XYLZ(5YYRYRYR5YYRYRYRY-YRY-YRY-YY5WYY5X5XYUYUYUY-Y-YUYUY1Y15WY1Y-5WY-Y-5W5XY-Y-YVYV5XY1YVY1Y1Y1YVY1YVYVY1Y15V5WY1Y15W5X5XYVYVYV5XYVYVYVY1Y1Y15XY1Y1YV5X5XYVYVYV5XY;5YY;Y,5YY,5ZY,Y;Y,Y;5YY;Y,Y;X2X2Y;Y;X2X2Y;Y;X2X2Y;X2Y;Y;5V5WX&X&5WX&W#W#5WW#W#W#X&X&5VW#X&X&X&5VX&X&W#W#X&X&W#W#5U5VX2X25VW#W#W#5V5WWVWVVWVWX&VWX&X&5UWVVWVWVWVWVWWV5TWV5UWVVWWVVWVWWVWV5TW/5TWVVW5UWVWV5UWVVW5UVWVW5UWVVWVWWS5UWSWSVRVRWS5UVRVRVR5UX$5UX$X$5U5V5WX$5W5XX$X$VRX$X$X$5W5XX$X$W'W'W'5XW'W'5X5Y5YX$X$X$5YW'X$W'VRVR5Y5ZW'5ZW'W'VRVRW'W'5Y5ZX$X$VRVRX$X$X$X$X$5YX$X$5YW/W/5YW/W/X$X$W/W/X$X$W/W/X$X$W/W/X$5VX$5W5WW/W/W/X$X$X$5WX$X$5WX$X$X$W/5WX$5W5X5Y5YW/5ZW/X$X$X$5ZX$X$W/W/W'W'X$5YW'W'5YX$W/W/W/5YW/5YW/X$5Y5ZX$X$W/X$W/W/X$X$5Y5ZX$X$5ZX$5ZX$X$X$X$X$X$5ZX$X$X$5ZW/5ZW'W'5Z6#W'W'W/6#W/W/6#6$6%W'W'W/W'6%W/6%6&6'X$X$6'X$6'W'W'W'6'W'6(W'6(W'X$W'X$X$W'6(W'W'6(W'W'6(W'W'X$W'W'W'WV6'WVWV6'W/WVWVW/6'W:W:W'6'W'X$6'W'X$W'W'W'6'6(X$6(X$X$6(6)X$X$X$X$6)X$X$X$X$W'X$X$6(6)W'W'6)6*X$6*X$X$W'W'6*W'W'6*X$X$6*W'X$X$W'W'6*6+W'W'X$X$X$X$X$W'X$X$W'6)X$X$6)6*X$6*6+6,6,6-W'W'6-X$W'W'6-X$W'6.6.X$6/W'W'6/W'W'X$X$W'W'6.W'W'W'6.6/W'W'W'6/W'W'6/60W'W'VRVR6061VRW'61W'WX61WXWP61WXWPWPWX6162WP62WPWPWP62WP63WPWXWPWXWPWX62WPWP62WPWW6363WW64WWWPWPWP64WP64WWWW64WWWWWWWP64656666WWWWWWWXX.WXX.WXWXWX6565WPWPWPWP65WPWPWPWP65WPWPWP65WWWW65WWWW65V&66V&UC66UC6767V&V&V&UC67V?V?6768V?V?6869V?V?UC69V?V?696:V?V?6:6;V?V?UCUC6;6<UCV&6<V&6<V&6=6>TYTYV&V&TYTY6=TYV&6=TYTY6=TYTYTYV&V&U26=V&V&6=6>V&V&U26>V&V&6>U2TYTY6>6?TYTY6?TY6?6@TPTP6@TYTP6ATP6ATPTPTYTNTYTNTNUUTNUUTNUUTNUUUUUUUU6>TNTNTN6>TNUUTNUUY@6=Y@6>YDYDY7Y7S=S=6=S=S<S<S<6=S<S=6=S<S<6=S<S<S2S26=S2S<S2S<S<S<S2S<S2Y;Y,Y,Y,W0W06:6;W0W06;W06;W0WIWI6;6<W+W+Y;Y;Y;6<Y;Y;6<Y;6<W0WI6=W+W+W&W&6<W+W&W&6<W+W&W&W+W+W&W&W&W+W&6;6;W+6<W+W&W&6<W+W&W+W+W+W&W96;W9W9W9W2W2W9W9W2W969W9W9W9W&W&W&W9W&W+W9W+6768W969W+W+696:VS6:VSVSW+W+VSVSW+W+VSW+68W9W1W168W9W9W968W9W1W96869W2W2W9VS69VS69VSVSVSY;Y;W+69W+VYW+69W+69VYVYY;Y;69W+Y;Y;69VYVY69VYVY69Y;VYVYX&X&VYX&VYX&VYX&VY67VYX&67X&X&X&VYVYVY67VY67VYVY67X&X&X&67X&VYX&VY67VY68X&X&68X&X&X&6869VY69VYVYX&X&69X&696:VYVYVYVYWC6:6:X&VY6;X&X&6;X&VWVWX&X&VWVWX&X&VW69X&6:VWVW6:VWX&6:X&X&6:VWVWVW6:6;W:6<WVWV6<W:W/W/W:6<6<6=W:6>W/W/6>W/6>6?W:W:6?W:6@W:6@W<6A6BW:6BW:W:W:W:W:6BW:W<W<W<W:6AW:W:6A6BW:6CW:W:W:W<6BW:W<W<6BW<W<W<W:W:W:6BW<W<6BW<W<W<6BW<W:W<W:W<W<W?W<W<W<6@W<W<W<W<6@6A6AW?W<W?W<6AW<W<W<W<6A6B6BW?W?W?W<W<W<6BW<W<6BW?W<6BW<W?V#TNV#V#TNTN6ATNTOUQ6AUQUQUQ6AUQTNTN6ATN6ATNUJUJTN6AUJ6BUJ6BUJUJ6BTN6CTNUNUQUNUNTNTNUJ6B6BTNUJUJTNTNUJUJTNTN6A6BUJ6BUJUJ6BTNUJUJ6BTN6CUUW9VSW9VSS;WTS;WTVY6AVYVY6AX&VYVYWCWTWTWTW.WHW.W.W.W.W.6?W.6?W.W.W.WH6?WH6?6@W.W.6@6AW.W.WH6AW.W.W<W<X&6AX&6AX&X&W?W?W?6AW?6AW?W=W=W=W?W?W=W=6@W=W=6@W=W=W=W=W?W=W=W=W=W?W,W,W?W?W,W,W?W?W,W,W,6<W,6<W,6=W,W?6=W?W,6=W,W,6=W?W?W?W,W?W,W?WXWXWXX06;X0X0X0WXWX6;6<WXWX6<W4WXWXW4W4WXWXW4WXWX6:6;X#WXWXX#X#T@T@T@6:UN6:UNUN6:UNUNUN6:6;TCTCT-6;UH6<UHUH6<UHUDUHUDV6SCT$6;T$X06;6<W$X-X-6<6=W$6=W$X-X-X-6=W$6=6>6?W$X-X-W$6?W$6?W$W$6?X-6@X-W$W$W$6@WXWXWX6@WX6@WX6AWXWXWDWXWX6@WXWX6@WXWXWX6@6AW4W4TF6ATF6BTFTKTFTKS6S6S?S?SZSZSB6@SZSZ6@SZSBSZSBSZ6?SZSBSBSB6?SBSB6?SZ6@SZTFTFTF6@S0SOS06@6@6AS0S06ASO6BSO6BT&SOSOSOSOSO6BSOSO6BT&T&SMT&6B6BSM6CSM6CSM6DSMSMSM6DSMS5S5S56DS5S56DSLS5S56D6E6ESQ6FSQ6FSISISISISISQ6F6FSI6G6HSISISI6HSISYSYSYWAWAWA6GWA6G6H6I6IWA6J6KWAWA6KWYWAWY6KWYWYWYWYW7WYW7W7W76IW(6JW(U(U(T/U(T/6IT/T/SL6ISL6JS9S9S96JS9SLSLSLS9S96ISLS9S9SLSLSQSQSQ6H6HSISISISQ6HSQSQSQSKSKSKSQ6GSQSKSQSKSQ6GSQ6GSQSK6GS:6HS:6HSKSKSKS:SKS:S:SK6GSKS:S:6GS:S@6G6HS@S@S@SYS@6HSYSY6HSYS@6HS@S@V)TT6HTTV-V-V-6HT?V-T?6HV-V-V-6H6H6IT?T?6IUET?T?6ISQ6J6KSR6KSRSR6K6LSR6MSR6MSRSRS8S86MS8STS8S8S8S8S8S86LS86L6MSTS8S8S86M6MSTSTSTSTS8STST6L6MT3T3UA6MTITIT=TI6MTITTTT6MV3TIV3TIV3SRSR6L6MS86MS8S8STST6MSTSG6MSGSGT16MT1T16MT26NT2T26NT26O6OT=6P6QT26QT2T2T=T=6Q6RT26RT2T=6RTIT=6ST=6ST=T=V3V36SV36S6T6UT2T26U6VV3T2T2T26V6VV36WV3T=6WT2T26WT=6XT=T26XV3V3SESGSESGSGSGSU6W6WSGSUSUSGSGSG6W6WSUSUSUX>6WXFXF6WXFXFXFT5T56W6XT76XT7T7T7T5T7T7T76WT76XT5T5T56X6XT7T7T7T2T2T26XT2T26XT2T26XT0T06XT2T06YT2T26YT2T0T2T06YT2T2T2T0T2T26X6Y6Y6ZURURUR6ZURUR6ZV37#7$7$UR7%URT27%T2URT2URT27%T2UR7%UR7%URT2URT2T27%T27%T0T0T07%UR7&URV37&URURV3V37&V3UR7&URURURURT0URSG7%SG7&XFXFXD7&7&XF7'7(7(7)XDXDXFXFXD7)XFXF7)XFXFXF7)XFXD7)XDXD7)7*T7T7T1T1T6T6T1T1T6T6T1T1T6T6T1T1T6T6T1T1T6T67%YWYWYWY9Y97%Y9Y9Y9YW7%Y9Y97%Y9YWY9YWY9X1X1X1X)7#7$X)X)X1X1X)X)7#7$X)X)7$X)X)X)X1X17$7%X1X1X17%Y6Y6YB7%7%YB7&YBY6Y6Y67&Y67&YBYB7&YBYBYBY6Y67&YBY6Y6YBYBYBYBY6Y6YBYB7$YB7$7%Y6Y6Y67%Y6Y67%Y6Y6Y6Y)Y.Y)Y)Y)Y)Y)7$Y)7$Y)Y.Y)Y.Y)Y.Y)Y.Y.Y.YJ6ZYWYW6ZYWYWYWYJYJYWYJY5Y56YY.Y.6YY.Y.Y5YWY5Y5Y.Y.6XZ'Y.6X6YZ'6YZ'Y.6Z6ZYNZ%Z%YXYXYNYNYNYX6YYXYN6YYNYNYX6YYXYX6YYI6ZYIYX6ZYXYI6Z7#YZYZYPYP7#YPYP7#7$X1YP7$YPYI7$7%YIYI7%7&YIYI7&YPYPYPX17&X1X1YPYPX1X1YPYPYP7%7%X1X1X1YPX17%X1YPX1X1X1X1YIYIYIYIX1YIYIYI6ZYI7#YI7#YIX1YIYIYIX1YI6ZX1X1YIYIX16ZX1YIX1YIX1X1WRX1X1X1X16XX1X16XX)X1X)X)X)WJW@W@W@WJWJ6V6WW@W@W6W@VBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUCVBVBUCUC6OTNUY6P6PTNTNTNVDVDVD6PVDVD6PTNVDVDTNTNULULTN6OTN6OTNTNULULTNULTN6N6OUL6OULTNTNULULTNTNULULTN6N6N6OTNTNV@6OTZTZV@V@TZTZUPUP6N6OUPUP6OUPUPUPUUUPY0Y06NY0YK6NYKYK6NY)Y0Y)Y0Y0Y06NY0Y06NYKY0Y0YKYKY0Y06M6N6NYKYKYK6N6OYKYK6O6PYKYKY0Y06PY0YK6PYKYKY0Y0YKY06OY0YKY0Y0Y0YKYKYK6NYKYK6N6OYKYKY0Y06OY0YK6OYK6PYKY0YKY0Y06OY06PY)Y)Y0Y0Y)6OY0Y0Y)Y)Y)6OY)6OY0Y0Y06O6PY06P6QY0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y06NY)Y0Y)Y)Y)6NY)6NY0Y0Y0Y)Y)6NY0Y)Y)6NY)Y06NY06OY)Y)6OY)Y)Y)Y)6OY)Y.Y)Y)Y.Y)Y.6NY)Y)6N6OY)Y)6OY)Y.Y.Y)6OY.Y.Y)Y.Y)6NY)Y)Y)Y)Y)Y.Y)Y)Y.6MY)6MY.Y.Y.Y.6MY.6MY.6NY.Y)Y.Y)Y)Y)6MY.Y.6MY.Y.Y.Y.Y)Y.Y.Y0Y)Y0Y0Y)Y)6KY)Y06K6LY)Y)Y)Y)Y.Y)Y.Y)6KY)Y)6KY.Y)Y.Y)6K6KY.6LY.Y)Y)Y)6L6LY.Y.Y.Y)Y)Y)6L6LY.Y.Y.Y.Y.6LY)6L6MY.Y.Y0Y0Y0Y)Y0Y)6LY)Y06LY06MY0Y06M6N6N6OY)Y)6OY)Y)Y)Y)Y)6O6P6PY.Y)6QY.Y.6QY.Y)6QY)6RY.Y.6RY.Y)6RY)6S6SY)Y06TY)Y)6TY)6TY)6U6V6VY)Y0Y0Y)6VY)Y.6V6WY.Y.YK6WYKYKY0Y06WY0Y06WYKYKY0YCY0Y0YCYC6VYCY0Y0Y06VY0Y0YKYK6U6VYKYK6V6WYK6X6X6YY06Z6Z7#YKYK7#7$YKYKYCYC7$7%YCYC7%YKYCYCYC7%YCY.Y.Y.YC7$YCY.Y.Y.7$Y.YK7$YKYKY.Y.7$Y.YK7$YK7%Y.7%Y.7&YK7&YKYKYK7&YKYKYK7&YKYK7&Y.YKYK7&Y.7'7(7(7)YKYKYKYK7)7*7*7+YKYKYKZ)YKYKZ)Z)7*Z)YK7*YKZ)Z)Z)Z)7*Z)YKYKYK7)Z)7*Z)Z)Z)Z)7*Z)7*YKYK7*YKYKYKZ)Z)YKYK7)YKYKYKYKYOYKYKYOYO7(YOYKYKYO7(YKYKYOYOYOYKYOYOY.Y.Y.7&7&Y.YKYKYK7&YKY.YKYKYK7&7&Y.Y.Y.YKYK7&YKYKY.YKY.7%Y.Y.Y.Y.Z'7%Z'7%Z'Y.Z'Y.7%Y.Y.Y.7%Y.7&Y.Z'Y.Y.7%Z'7&Z'7&Z'Z'Z'Z'Z'7&Z'7&Z'Y.Y.Y.YMYMYMY.Y.Y.7%Y.Y.YM7%Y.7%Y.Z'Y.Y.Y.7%Y.Y.Y.7%7%Z'7&7'7'Z'7(Z'YKYKYK7(YKYKYKY.YKYK7'Y.YK7'7(Y.7(Y.7)Y.YK7)YKY.7)Y.Y.Y.YKY.Y.Y.7(Y.7)Y.7)Y.YKYKYKYKYK7)YK7)YKY.7)Y.YK7*7*Y.YK7+Y.Y.7+7,Y.Y.Y.7,YK7,Z)Z)Z)7,Z)7-Y.Y.7-7.Y.Y.Z)Z)7-Z)Z)Z)Y.7-Z)Z)Y.7-Z)Z)7-Y.Z)Z)Y.Y.Z)Z)7,7-Z)Z)Z)Z)Y.Y.Z)Z)7,Z)Y.Y.Z)Z)Y.Y.Z)7+Y.Y.7+Z)7+Z$Z)7,Z)7,Z)7-Z)Z)7-Z$Z$Z$7-Z$7-Z#Z#Z#7-Z#7.Z#7.YOZ)Z)Z)Z)7.Z)YOZ)7.7/Z)Z)7/Z)Z)YO7/YOZ)Z)Z)YOZ)Z)7.YO7.YOYOYOYOZ)YO7.Z)YO7.YOZ)Z)YOYOZ)Z)7-7.Y.7.7/Z$Y.7/Z$Z$7/70Z$Z$Y.70Y.7171Z$Z$Z$7172Y.Z$72Z$Z$Z$YOYA72YA72YAYOYOYA72YOYO7273YO74YO74YO75YAYAZ(75YO7576YA76YAYOYOYAYAYO76YO76YOYO76YAYO77YOYO777878YAYO79YOYOYO7979YAYAYAYMYMZ$Z$YMYMZ$YMYMZ'YMYMZ'Z'76Z'Z'Z'7677Z'Z'77787879YMYM79YMYMYM79Z'7:Z'7:Z'YM7;Z'Z'YM7;YMYMYM7;YM7;Y/Y/Y/7;Y/Y/YMYMZ$Z$Z$Z$Z$7:7:Y27;Y27;7<Y2Y2Z$Z$7<Z$Z$7<7=Y2YMYMZ$YMY/Y/7<Y/Z$Y/Z$Z$7;Y/Z$Z$Y/Y/7;Y/Z$7;Z$Y/Z$Y/Z$Z$Z$Z$Z$7:Z$7:Z$Y2Y/Y/Z$Y279Y/Y2Y/Y/Y/Y279Y279Y2Y2797:Y2Y27:7;Y2Y27;Y/Y2Y27;Y2Y2Y2Y/Y/7;Y/Y/Y/7;Y/Y/Y/Y/7;Y/7;7<Y2Z$Z$7<Z$YAYA7<YA7<7=YAYAZ$7=YAYAYAY27=Y27=Y2YAYAYAYAZ(7=7=Y27>7?Z(Z(Z(7?Z(Z(YR7?Z(Z(YRZ(Z(Z(Z(7>7>Z(YRZ(Y/Y/Y/7>Y/Y/Y/Y27=7>Y2Y2Y27>Y2Y27>7?Y2Y2Y/Y/Y/7?Y/7?Y?Y?Y/7?Y/7@Y?Y?7@7AY?Y?7AY?Y/Y/Y2Y27@7AY2Y2Y2Y27A7BY27BY-Y-Y2Y27BY2Y2Y2Y27BY1Y1Y-Y-Y1Y17AY1Y27AY2Y1YGYGZ'Z'Z'7@Z'YGYG7@Y?Y?YGYGY?Y?Y?Y?Y?7?Y?Y?7?7@7@Y?Y4Y47@Y4Y1Y4Y?Y?Y4Y4Y?Y?Y4Y?Y47>Y4Y?Y?Y?Y4Y?Y4Y?Y4Y?Y4Y?7<Y?7<Y?Y4Y?7<Y?Y17=Y17=Y1Y17=7>Y?Y1Y?Y?Y1Y17=Y1Y1Y1Y?Y?Y1Y1YIYI7<7=YIYIY?Y?Y?7<Y?Y?7<YIY?Y?YIYI7<YI7<YI7=YIYIYIY?Y?YIYI7<7=YIYIY?YIY?YI7<YIYIYIYI7<Z&Y+Y+Y+VX7;VUVU7;7<VUVUVRX+VRX+VRVR7;7<7<X+X+X+X*W6X*W6W6W6W67;W67;X*X*7;X*X*X*7;7<WXWXW)W)WXW)7;7<WXWX7<X/WXWXX/X/WX7<UCTYUC7<UCUCUCTYUC7;TYTYTY7;TYTYTZTZTNTNTZTZTNTNTZTZU3U37879U3U3TNU379U3797:TNTN7:TZU3U3TZTZU3U3797:U3U3TZTZU3U3TZTZ797:TZTZV@V@TZ79TZ7:7:V@7;V@7;7<V@V@TZTZTZ7<TZTZ7<7=TZTZ7=7>TZTZ7>7?TZTZ7?7@7@V@7AV@7AV@V@V@TZTZUUUUTNU4TNU9U4U4U9U9TNU9TNU9U47=U9U9U4U37=U37=U3U9U3TNTNTN7=TNU37=U37=U87>U8U7U7TNU7U3UUU3UUU3UUU3UUUUUUU>7;U>7;U>U>V@7;V@7<V@7<V@7=TZTZTZ7=7=V@7>V@TZ7>TZ7?TZV@TZV@7>V@TZV@TZV@TZV@V@7=V@7>UUUU7>7?7?UU7@UUV@V@V@UU7?UUUUUUV@UUUUUUYD7>YDY@7>YDY@Y@YDYDYDY@YD7=Y@Y@Y@YD7=YDY@7=Y@YDYDYDYDYKYD7<YDYDYKYKYDYKY@YDYDYDYKYKY*Y*YKYKYK79YKYKYDYDYKYD78YK78YKYKYKYDYKYDYKYKYKYDYDYKYKYDYDYKYKYDYKYKYK7475YKYK75YKYOYOYK75YK75YK76YKYKYHYKYOYO75YO75YOYKYOYOYOYO75YO75YOYOYOYO75YQ75YOYQYOYQYQ757676YOYOYO76YRZ(Z(YRYR76YR76YRZ(YRYRYRZ(76YRYRZ(76Z(YRZ(Z(Z(YLZ(7575YLZ(Z(YR75YRY-YYYYYY75YUYUYYYUYY7475YU75Y1Y-7676Y1Y-Y-Y1Y1Y-Y-Y1Y1Y-Y1YV7475Y17576YVYVY1Y1YVYVY1Y1Y17575YVYVYVY1Y1757676YVYVYVY1Y176YVYVY1YVYV75YVYVYVY;Y;75Y;Y,Y;Y,Y,Y,Y,Y,74Y,74Y,Y,Y,74Y,Y;Y;Y;Y;X&Y;73X&X&73X&X&X&W#W#X&73W#7374X&74W#X&W#X&74X&X&7475X&X&X2W#X2X2W#W#W#74W#W#7475VWWVVW75VWVWVW75VW75VWVW75WVWVW/WVWV75WVWVWVVWWVWVWV74757576VWVWWVWVVWWVWSVRWSWS74VRWS75VRVR75X$75X$X$X$VRVR7576VR76X$X$76X$X$X$VRVR7677VR77X$X$7778X$X$VRX$X$X$W'77W'X$7778X$X$78X$X$X$W'X$X$X$W'X$X$X$VRVRW'W'VRVR75VRW'VRW'W'VRVRVR7474X$75X$X$75W/W/75X$W/W/X$X$W/W/X$X$X$74X$74X$X$X$X$W/W/X$X$7374X$X$74W/X$X$W/W/X$X$X$73X$X$7374X$X$747575X$W/W/X$75X$76X$X$W/W/W'W'X$75W'W'75X$W/W/7576W/W/W/7676X$X$X$76X$X$X$W/76W/W/76X$W/W/X$X$W/X$X$X$75X$X$X$X$75X$X$W'W'W/W/W/74W/W/W'W'73W'W'W'7374W/W/7475W/W/75W/W/W/W/W/W'W'W'W'W'74W/W/W/W'W'W/W/7373W'74W'X$X$74X$W/W/W/W'X$X$W'W'72W'W'W'7273X$X$W'737475X$X$X$W'W'X$X$X$WV73WV74W/W/74WVW/W/7475W'X$W'X$X$74X$W'W'W'W'74W'W'X$W'X$73X$X$73X$X$X$X$W'X$X$X$X$7273X$X$73W'73W'W'W'W'W'X$X$W'W'72W'W'W'727373W'X$X$W'W'W'73W'W'737474W'X$757576X$X$X$X$W'X$X$X$7576X$7677W'X$X$X$777778W'W'7879W'W'X$X$X$79X$797:W'7:X$W'W'X$X$W'X$X$X$W'W'X$X$787979W'W'W'W'79W'W'X$797:W'X$7:X$7;7;W'7<W'VRVRW'W'VRVRW'W'VRVRW'7:W'7:W'W'7:VRW'W'VRW'W'W'WXWXWX79WXWX79WXWXWXWX79WXWXWXWP78WPWPWPWPWP78WPWXWPWPWPWX77WPWPWPWPWW77WW77WWWWWPWPWP777778WWWWWPWPWP78WP7879WW79WWWWWWWPWPWP79WP79WWWW797:WWWW7:WWWWWWWX7:WPWPWXWP7:7;WP7;WP7<WPWPWP7<WPWP7<7=WW7=WWWWUCV&UCV&UC7<UC7=UCUCUC7=UC7=UCUCUCV&V&V&UCUC7<7=UCUC7=V?UCUCV?V?UCUCV?V?UC7;V?V?UCUC7;V?UCUCV?V?UCUCV?V?UC79V?V?79UCV?V?UC79V&V&79UCV&V&797:V&V&V?V&V?7:V?V&7:U2V&V&7:7;V&V&7;TYV&V&TYTY7:TYTYTYV&7:U2U27:7;U2U27;U2U2U2U27;U2U27;7<U2U2TYTYTPTPTYTYTPTPTYTY7:TYTP7:TPTPTP7:TPTP7:TYTP7;TYTY7;TYTPTYTPTPUUUU7:UUTNUU7:UU7:YDY@YDY@YDY@7:7:S=S<7;S<7;7<S=S=S=7<S<S2S27<7=7=S2S<S<W0W07=7>W07>7?WIW0W07?W0WIW0WIWIY;Y;W+7>7>W+W+W+Y;Y;W+7>Y;Y;7>Y;W0W0WIW0W0W0WIWIW+W+7<7=W+W+7=7>7>W&W&W+W+W+7>W+7>W+W+W+W&W&W&W+W&W9W&W9W9W9W9W2W97;W9W9W+W+7;W+7;W+W9W+VS7;VSVSW+W+7;W+VSW+VSW+W9W9W17:W1W17:W9W1W1W1W9W9W9W2W2W9W9W9W2W9W9W977W9VSW9VS7677W+W+W+VYW+VYW+76W+VY76W+W+W+Y;Y;Y;76VY76VYVYY;Y;VYY;X&75X&X&7576X&X&VYVY767777X&VYVY77X&78X&X&X&VYX&VY7778X&X&X&VYX&X&X&7778X&X&X&78X&X&VYVYX&X&VY7777X&78X&VYX&VYVY7778VYVYVYVYWCVYX&X&77X&X&X&VYX&VY76VY77VWVWX&VWX&76X&X&VWVW76VWX&X&X&7676VWVWVWW:76W:W:76WVW:WVW:76W:W:7677W:W:7778W:7979W/W:7:W/W/7:W/7:W/W:7;W/W/7;W/W:7;W:W:7;W/W:W/W:W:W/W:W/W:W/W/W:W<W:W<W:78W:W:W<W<78W<78W<W:W:W:78W<W<7879W:W:W<W<W:W:W<W<78W<78W<W:W<W:W:78W<78W<W<W<W:W<W:W<77W<W<W<W:W<W:W:76W?W?W?W<W<W<7676W?W?W?76W?W<W<W<W?W<W<W<W<W<75W<75W?W?W<W?W?W?W<W<W<74W<W<W<W?W<73W<W<73TNV#74TO7475UQ75UQ767777TNUJ78UJ78UJUJTNTN78TN78TNUJ79UJTNUJ79TNTN79TN79TNTNTNTNTNUJ79797:UJ7;UJ7;UJUJ7;TN7<TNUJ7<UJUJ7<7=UJUJTNUUTN7=TN7=UUUU7=X&VYVYX&X&7=7>W.W.W.7>W.WHW.W.7=WH7>WHWHWH7>7?WHWH7?7@WHWH7@W.WHW.W.W.WH7?WHW.W<W<7?W<X&7?X&W<W?7?W?7@W?W=W?W=7?W=W?W?7?WXW=7@W,W?W,7@W?W?7@W?7@W?W?W?W?W?7@W?W,7@W,7A7AW?W?W?WX7A7B7CWXWXWX7CWX7CW4W47CW4W4W4WXWXWXX#WXX#X#X#7AUNUNUNUQUQ7A7BUQ7B7CUNTJTJTCTCTJTJTCTJT-T-UHUHUHUHUH7@UHUH7@UHSC7@SCT$X0X0X07@7@W$W$W$7@X-W$W$X-X-7@X-7@X-X-X-X-X-7@X-X-X-X-7@X-X-7@7AX-W$X-W$X-X-W$X-W$7?W$W$X-X-7?X-W$7?W$7@W$X-W$X-WXW4WXW4WXWXWX7>WX7>WX7?WX7?WXWXWDWD7?WDWX7?W4W47?W4W4W47?TK7@TK7@TKTFTKSZ7@SB7A7ASZSB7BSB7BSBSBSB7BSBSBSZSZ7BSZSB7BSBSBTF7BTF7CS0SOS0S0S0SOS0S0SOSO7A7BSOSO7BSOS0SOS0SOSO7ASOSOSOSOSO7A7A7BT&T&T&SM7BSMT&7BT&7CT&7CT&7DT&7D7ESMT&SMSMSM7DSMT&SMS5S57D7ES5S5SLSLS5S5S57D7DS5SQ7ES5SQS5SQ7DSQSQSQSQ7D7ESI7ESISQSQSQSISQSISQ7DSQSQ7DSQSQSQSISISYSYWAWAWAWYWAWAWA7BWY7BWYWY7BWYWYWYWAWA7BWAWY7BWYWYWAWA7BWYWAWAWYWYWAWYWAWYW(W(W(WBW(WBWBWB7>U(T/U(SLSLSL7>SL7>SLSLS9S97>7?S97?7@SLSQSQSQ7@SISI7@SISQ7@SQSI7@SKSKSKSKSK7@SKSKSKSQSKSQS:SQS:SQS:SQS:SI7=SI7>SKSKSKS:S:S:S:S@SKSKS@S@SKSKS@S@S@7:S@S@7:SYS@7;S@S@S@SYV)7:V)V)V-V-V-7:7:UET?7;V-V-T?T?V-V-7:T?V-7:7;T?UEUE7;UESRSQSR7;SR7;SRSR7;SQSRSRSR7;SRSRS@S@SRSRS@S@7:S@SR7:SRSRSRS8SRSRS8S8STS8S8S8S8STSTST77ST7778STSTS8S87879S879STSTUAUAUA79UAUA79UAUATITITIT=TIT=TI777879V3SFSRSFSFSRSR78SRS8S8S878STST78STSGSFSGSGT177T17878T279T279T2T1T2T2T2T279T279T2T2T2T=T279T279T2T2T=T=79T=T2T=T2T27879T2T2T=T=79T=T279T2T=T=79T=7:T=TIT=T=T=T=T=7979V37:V37:V37;7<V3V37<V3T2T2T=T2T2T27;V37;V3V3V3T2T27;V3T2T2T2V37:V3V3V3T=T=7:7;T=T=7;T=T27;T2T2T2T27;V3SGSGSUSUSGSGSGSUSGSG797:SG7:SGSUX>X>7:7;X>X>7;7<T77<T7T7T5T57<7=7=7>T7T7T7T5T7T5T7T5T7T7T5T57<7=T77=T7T7T2T2T9T9T2T2T9T9T2T0T0T0T0T2T0T0797:T0T0T2T27:T2T07:T0T0URURT2URV3V3URV3T278T2URURV3URURURV3UR77V3V377V3UR77URURV3V3URV3T2URT2UR75UR76UR7677URUR77URT278T2T2T2URT2URT2T276T0T0T0T2T276T276URT2URT2UR76URV3V3UR7676V3UR777778URURSUSUSG78SGSUSUSU77XDXDXDXFXF77XF7778XDXD78XF79XF79XFXDXDXFXDXDXDXFXFXD78XFXF7879XFXF79XF797:XDXD7:7;T7T7T0T0T7T0YWY9YWYWYWY9YWYWY9Y9YWYWY9Y9YWY9X1X1X)X)X1X1X)X)X)X1X)X)X1X1X)X)X1X)X)X)X1X1X)X)X1X1X)X)X1X1X1X)Y6Y6YBYBY6YBY6YBY6YBYBYBY6Y6YBYBY6Y6YBYBY6YBYBYBY6YBYBYBY6YBY6Y6YBYBY6Y6YBYBY6Y6Y6YBY6Y6YBYBY6Y6Y)Y.Y)Y.Y)Y.Y)Y.YJYJYWYWYJYJYWYWY5Y5Y.Y.Y.Y5Y.Y.Y.Y.Y.Z'Z'Z'Y.Z'Y.Y.Y.Z'Z'Z'Y.Z'Z'Z'Y.Z'YNYNZ%Z%YNYXYNYXYXYXYNYNYXYIYXYXYIYIYXYIYXYXYXYIYXYXYXYIYPYPYZYZYPYPYZYPYZYZYZYPYPYPX1X1YPYPYPX1YPYIYPYPYIYPYIYIYPYPYIYIYIYPYIYIYPYPYIYIYPYPYPYIYPYPX1X1YPX1X1X1YPYPX1X1YPX1YPX1YIYIYIX1YIX1YIX1YIYIYIX1YIYIX1X1X1YIX1YIX1X1X1X)X1X)X)X)WJWJW@W@WJWJW@W@UYTNUYUYUYTNUYUYUYTNUYTNVDVDVDTNVDVDTNTNULULTNULTNULTNTNTNULULULTNULULULULULTNULULULTNULULULTNTNULULTNTNV@V@TZV@UPUPUPUUUPUPUUUUUPUPUUUUY0Y0YKY0Y0Y0YKY0Y0Y)Y0Y0Y0Y0YKYKY0YKYKYKY0Y0YKYKY0Y0YKYKY0YKYKYKY0Y0YKY0Y0Y0Y0YKY0Y0YKYKY0Y0YKY0Y0Y0YKY0Y0Y0YKY0YKYKYKY0Y0Y0YKYKY0Y0YKYKY0Y0YKY0Y0Y0YKYKY0Y0YKY0YKY0YKY0Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y0Y)Y0Y0Y0Y)Y)Y0Y0Y)Y)Y0Y0Y)Y)Y0Y)Y0Y)Y0Y)Y0Y)Y0Y0Y)Y)Y0Y0Y0Y)Y0Y0Y0Y)Y0Y)Y0Y)Y0Y0Y)Y)Y0Y)Y)Y)Y.Y.Y.Y)Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y.Y.Y)Y)Y)Y.Y)Y.Y)Y)Y.Y.Y)Y)Y)Y.Y.Y.Y)Y)Y)Y.Y)Y)Y)Y.Y.Y.Y)Y)Y.Y.Y)Y)Y.Y.Y)Y)Y0Y0Y0Y)Y)Y)Y0Y)Y0Y0Y)Y.Y)Y)Y)Y)Y)Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y.Y.Y)Y.Y.Y.Y.Y)Y)Y)Y)Y)Y.Y.Y)Y.Y.Y.Y0Y0Y0Y)Y0Y)Y0Y0Y0Y0Y0Y)Y0Y0Y0Y)Y0Y)Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y)Y)Y0Y)Y)Y)Y)Y.Y)Y.Y.Y.Y)Y.Y)Y)Y)Y.Y)Y.Y.Y.Y.Y)Y)Y.Y.Y.Y)Y.Y)Y)Y.Y.Y)Y.Y)Y.Y)Y.Y)Y.Y)Y.Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y)Y0Y)Y0Y)Y)Y)Y0Y0Y)Y)Y0Y0Y)Y)Y)Y0Y)Y)Y)Y.Y)Y.Y.Y.Y)Y.Y.Y.Y0Y0YKYKYKY0YKYKY0Y0YKYKY0Y0Y0YCY0YCY0Y0Y0Y0Y0YKY0Y0YKYKY0Y0YKYCY0YCYCYCYKYCYKYCYCYCY0Y0YCYCY0YCY0YCY0YCYCYCYKYKYCYCYKYKYCYCYKYKYCYCYKYCYCYCYCYKYCYCYKYCYCYCYKYKYCY.YCY.YCY.YCY.Y.Y.YKYKYKY.YKYKYKY.YKY.YKY.YKY.Y.Y.YKYKY.YKY.Y.Y.Y.Y.YKY.YKYKYKY.YKYKYKY.Y.YKYKY.Y.YKYKY.Y.YKY.YKY.YKYKY.YKYKYKYKY.YKYKY.Y.YKY.YKYKYKZ)YKYKZ)Z)Z)Z)Z)YKZ)Z)Z)YKYKZ)Z)Z)YKZ)YKZ)Z)Z)Z)YKYKZ)YKZ)YKYKZ)Z)Z)Z)Z)YKZ)Z)Z)YKZ)YKYKYKZ)Z)YKYKYKYOYKYOYOYKYOYOY.Y.YKY.Y.Y.YKYKYKY.YKYKYKY.YKY.YKY.Y.Y.YKYKY.Y.Y.Y.YKY.Y.Z'Z'Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Y.Y.Z'Y.Y.Y.Z'Y.Z'Z'Z'Z'Z'Y.Z'Y.Z'Y.Z'Y.Z'Y.Y.Y.Z'Y.Z'YMY.YMYMY.Z'Z'Z'Y.Z'Z'Z'Y.Y.Y.Z'Y.Y.Y.Z'Z'Z'YMYMZ'Z'YMYMY.Y.Y.Z'Y.Z'Z'Z'YKYKYKY.YKY.Y.Y.YKY.Y.Y.YKY.YKY.YKY.YKY.YKY.YKY.YKYKYKY.YKY.Y.Y.YKY.YKY.YKY.YKY.YKY.YKY.YKYKYKY.YKY.Y.Y.YKY.YKY.Y.Y.YKY.YKY.YKY.Y.Y.Z)Y.Y.Y.Y.Z)Y.Y.Z)Z)Y.Y.Z)Y.YKYKZ)Z)Z)Z)Y.Y.Z)Y.Z)Z)Y.Y.Z)Z)Y.Z)Z)Z)Y.Z)Z)Z)Y.Y.Y.Z)Y.Y.Y.Z)Y.Y.Z)Y.Y.Y.Y.Z)Y.Y.Z)Z)Z)Z)Y3Y3Y.Y.Z)Z)Y.Y.Z)Z)Z)Z$Z)Z$Z$Z$Z)Z$Z)Z$Z)Z$Z)Z$Z)Z$Z)Z$Z$Z$Z#Z$Z#Z$Z)Z#Z#Z#Z#Z#Z)Z#Z)Z#Z)Z)Z)Z)YOZ)YOZ)YOYOYOZ)YOYOZ)Z)YOYOZ)Z)YOYOZ)YOZ)YOZ)Z)Z)YOZ)YOYOYOYOZ)YOYOZ)Z)Z)YOZ)Z)YOYOZ)YOYOYOY.Y.Y.Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Z$Y.Y.Y.Z$Z$Z$Y.Z$Z$Z$Y.Y.Y.Z$Y.Y.Z$Z$Y.Z$Z$Z$YOYAYAYAYOYAYOYOYAYAYAYOYAYAYOYOYAYAYOYAYOYAYOYAYOYOYOYAYOYAYOYOYAYAZ(Z(YOYAYAYAYOYAYAYAYAYAYOYOYOYAYOYOYOYAYOYOYAYAYOYOYOYAYOYOYOYOYAYAYOYOYAYOYAYAYOYAYAYAYOYOYOYAYAYAYOYOYOYAZ'Z'YMZ'Z'Z'YMYMZ'Z'YMYMZ'Z'YMYMZ'Z'YMZ'YMZ'YMYMZ'Z'YMYMZ'Z'YMYMYMYMYMZ'Z'Z'YMZ'YMZ'YMYMZ'Z'YMZ'Z'Z'YMYMYMYMY/YMYMYMYMY/Y/YMY/Y/Z$Z$Y2Y2Z$Z$Z$Y2Z$Y2Y2Y2Z$Z$Y2Y2Z$Z$Y2Y2Z$Z$Y2Y2Z$Y2Z$Y2Z$Y2Y2Y2Z$Y/Z$Y/Z$Y/Z$Z$Z$Y/Z$Z$Z$Y/Y/Y/Z$Z$Z$Y2Z$Z$Z$Y2Y2Y/Y2Y2Y2Y/Y2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y2Y2Y/Y/Y/Y2Y/Y/Y2Y2Y/Y/Y2Y/Y/Y/Y/Y2Y/Y/Y2Y2Y/Y2Y2Y2Y/Y2Y2Y2Z$Z$Z$YAYAYAZ$Z$Z$Z$YAYAZ$Z$YAYAZ$YAZ$YAYAY2Y2Y2Y2Y2YAY2YAZ(Z(Z(Y2Z(Z(Z(Z(Y2Y2Y2Y2Y2Z(Y2Z(Z(Z(YRYRZ(YRYRYRYRYRZ(Z(Z(YRYRY/Y/Y2Y2Y/Y/Y/Y2Y/Y/Y2Y2Y2Y/Y2Y2Y/Y/Y2Y2Y/Y2Y2Y2Y/Y/Y/Y?Y/Y/Y?Y?Y/Y?Y/Y?Y/Y?Y/Y/Y?Y?Y2Y2Y?Y2Y2Y2Y2Y?Y2Y2Y/Y/Y2Y2Y/Y2Y2Y2Y2Y2Y2Y-Y2Y2Y-Y-Y2Y-Y-Y-Y2Y2Y-Y-Y2Y2Y2Y1Y-Y1Y-Y-Y2Y2Y2Y1YGYGZ'YGYGYGY?Y?Y?Y?Y1Y1Y?Y?Y1Y1Y?Y1Y1Y1Y?Y?Y4Y4Y4Y4Y1Y4Y4Y?Y4Y4Y4Y?Y?Y?Y4Y?Y4Y?Y?Y?Y1Y1Y1Y?Y1Y?Y1Y?Y1Y1Y?Y?Y?Y1Y?Y?Y1Y1Y?Y1Y1Y1Y?YIY?Y?YIYIY?YIYIYIY?Y?YIYIY?YIYIYIY?YIY?YIY?YIY?Y?Y?YIYIYIY?YIYIYIY?Y?YIYIY?YIYIYIZ&Z&VXVXVXVUVXVXVUVUVXVUVUVUVRVRX+X+VRX+X+X+VRVRVRX+W6W6W6X*W6W6X*X*W6W6X*X*W)W)WXWXW)W)WXW)WXX/WXWXX/X/WXWXX/X/WXWXWXX/WXX/UCTYUCTYUCTYTYTYTYTNTYTYTZTZU3U3TZTZU3U3TNU3TNU3TNU3TNTNU3U3TNTNTZTZU3U3TZTZU3U3TZTZU3U3TZTZTZV@TZTZV@V@TZTZTZV@TZV@V@V@TZV@TZV@TZV@TZV@TZTZTZV@TZTZV@V@TZTZTZUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZTZUUUUTZV@TZV@TZV@TZV@TZV@TZV@U4U4U9U9U4U3U4U3U4U3U9U3TNTNU3U3TNTNU3U3TNTNTNU8TNU8U8U8UUUUU>U>UUUUU>U>V@UUV@UUV@UUV@UUV@UUV@V@V@V@V@UUTZV@V@V@TZV@TZV@TZTZTZV@TZTZTZV@TZV@V@V@TZV@TZV@V@UUV@UUUUUUV@UUUUUUV@V@UUUUV@UUV@UUV@UUV@UUV@UUV@V@UUUUYDYDYDY@YDYDY@Y@YDYDYDY@Y@YDYDYDY@YDYDYDYKYKYDYDYKYKYKYDYDYKYDYKYKYKYDYKYKYKYDYDYKYKYDYDYKYKYDYDYOYOYKYOYKYKYKYHYHYHYKYHYOYOYKYOYKYOYKYOYOYOYOYQYOYQYOYQYOYOYQYQYOYOYQYQYQYQYOYOYQYQYOYOYQYQYQYOYRYRZ(Z(YRYRZ(YRZ(YRZ(Z(YRYRZ(YRYRYRZ(YRZ(YLZ(YLYLYLZ(YLYRY-Y-Y-YYYYYUYUYYYUYYYUYYYUYUYUY1Y1Y-Y1Y1Y1Y-Y1Y-Y1Y-Y-YVYVY1Y1YVYVYVY1Y1Y1YVYVY1Y1YVY1Y1YVYVYVY1Y1YVYVY1Y1Y1YVY1YVYVYVY1YVYVYVY1Y1YVYVY1YVYVYVY;Y;Y,Y;Y,Y;Y,Y,Y,Y,Y,Y;Y,Y,Y,Y;Y;Y;X&X&Y;X&X&X&W#W#X&W#W#W#W#X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&W#W#X&X&WVWVVWVWVWWVVWWVVWWVVWWVWVWVWVW/WVWVVWVWVWWVVWVWWVWVVWWVVWWVVWVWWVWVVWWVVRVRWSVRVRVRWSWSVRVRVRX$VRX$X$X$VRVRVRX$VRX$X$X$VRVRVRX$VRX$VRVRX$VRX$X$VRVRX$X$VRVRX$X$VRVRX$X$VRVRX$X$W'W'X$X$W'X$X$X$W'W'X$X$W'W'X$X$VRVRW'VRVRVRX$X$VRX$VRX$VRX$X$X$X$X$W/W/X$X$W/X$X$X$X$W/W/W/X$W/X$X$W/W/X$X$W/W/X$W/W/W/X$W/X$X$X$X$W/W/X$X$W/W/X$X$W/W/X$X$W/W/X$X$W/W/W/W/X$W/W/W/X$W/W'W'X$X$W'X$X$X$W/W/W/X$W/X$X$X$W/X$X$X$W/W/W/X$W/X$X$X$X$X$W/W/X$X$W/W/X$X$W/X$X$X$W'W'W/W/W/W'W/W/W'W'W/X$W/W/X$X$W/W/X$X$W/W/X$W/W/W/W/X$W/W/W'W'W/W/W/W/W/W'W/W/W/W'W/W'W'W'X$X$X$W/W'X$W'X$W'W'X$X$W'W'X$W'W'X$W'X$W'X$W'W'X$X$W'X$WVWVWVW/W/W/WVWVW/W/WVWVW/W/W:W:W/W/W:W:X$W'X$W'W'W'X$X$X$W'X$X$W'X$X$X$X$W'W'W'W'X$W'X$X$X$X$W'X$X$W'W'X$W'X$X$X$W'X$X$W'W'X$W'X$W'X$X$W'W'X$X$W'W'X$X$W'W'X$X$W'W'X$W'X$W'X$X$W'W'W'X$W'X$X$X$X$X$X$W'X$X$W'W'X$X$W'W'X$X$W'W'X$W'X$W'X$X$X$W'X$X$W'W'X$X$W'X$W'W'X$W'X$X$X$W'X$X$W'W'X$W'W'W'X$X$W'W'X$X$X$W'X$X$W'W'X$W'X$W'X$X$W'W'X$W'W'W'X$W'W'W'W'W'X$X$X$X$W'W'W'W'X$X$X$X$W'W'W'VRW'W'VRVRW'W'VRVRW'VRWXWXWPWPWPWPWPWXWXWPWPWPWXWXWPWPWXWPWXWXWXWXWPWPWPWPWWWWWPWPWWWWWPWWWPWWWPWPWPWWWPWWWWWWWPWPWWWPWPWPWWWWWPWWWWWWWPWPWWWWWPWWWPWWWPWPWPWWWPWPWWWWWPWWWWWWWPWWWWWWWXWXWPWPWXWPWPWPWPWXWPWPWPWWWPWWWPWPWPWWWPWPWWWPWPWPWPWWWPWPWWWWWPWWWWWWV&V&UCV&UCV&UCV&UCV&V&V&UCV&UCUCUCUCV?V?UCUCV?V?UCUCV?V?UCUCV?V?UCUCV?V?UCUCUCV?UCUCV?V?UCUCV&V&UCUCV&V&UCUCV&V&UCV&V&V&V?V&V?V&V?V?U2U2U2V&U2U2V&V&U2U2V&TYV&V&V&V&V&TYV&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2V&V&U2U2TYTYTPTYTYTPTPTPTPTYTPTPTYTYTPTYTYTYTPTYTPTYTPTPUUUUTNUUTNTNUUUUY@YDY@YDY@YDY@YDS<S=S<S=S=S=S<S<S<S=S=S=S<S=S<S<S=S=S<S<S<S2S<S<S2S2S<S2S2S2S<S2W0W0WIWIW0WIWIWIW0W0W0WIWIW0WIWIWIW0WIW0Y;Y;W+W+Y;Y;Y;W+W+Y;W+W+W+Y;W+W+W+W+W&W&W+W+W&W+W+W+W+W&W+W+W&W+W&W&W&W+W+W+W&W+W&W+W&W+W9W+W9W9W9W+W9W+W9W+W9W9VSW+VSW+W+W+VSW+W9W9W1W9W1W1W1W9W9W9W9VSY;Y;W+Y;Y;Y;W+W+W+W+W+VYY;Y;W+W+Y;VYY;VYY;Y;VYY;X&VYX&X&VYVYX&X&VYVYX&X&VYVYVYX&VYX&X&X&X&X&VYX&VYVYVYX&X&X&VYX&VYVYVYX&VYVYX&X&VYX&VYVYX&X&VYX&X&VYVYVYVYX&VYVYVYX&VYX&VYX&VYVYX&X&X&VYX&X&VYVYVYX&VYVYVYX&VYX&VYX&VYVYX&VWX&X&VWVWX&VWX&X&X&VWX&VWVWVWW:WVW:W:WVWVW:WVWVWVW:WVWVWVWVW:WVWVW:W:W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W/W:W:W:W/W:W:W/W/W:W/W:W/W:W:W/W/W:W/W:W<W:W:W:W<W:W<W:W<W:W:W:W<W<W<W<W<W:W:W<W<W:W<W<W<W:W<W:W<W:W<W:W:W:W<W:W:W:W<W:W<W<W<W<W<W<W?W<W<W?W?W<W<W<W?W<W?W<W?W<W?W?W?W<W<W<W?W<W<W<W?W<W?W<W?TNTNV#TNTNTNV#TNTOUQTOUQTOTOTOUQUQUQTOUQTOUQTOTOUQUQTOUQUJTNUJUJUJTNUJTNTNTNUJTNTNTNUJTNUJTNUJUJUJTNTNTNTNTNUJUJTNTNUJTNUJTNTNTNUJTNUJTNTNTNUJUJTNTNUJTNUJTNUJUJTNTNUJTNTNTNUJTNUJTNUJUJUJTNUJUJTNTNUJUJTNTNUJTNTNUUTNUUTNUUUUUUX&X&VYVYX&X&VYVYX&X&VYX&W.W.W.WHW.W.W.WHW.WHWHWHW.WHW.W.WHWHW.WHWHWHW.W.WHWHW.W.WHWHWHW.WHW.WHW.X&W<X&X&X&W<W<W<W?W?W?W=W?W=W=W=W?W=W?W=WXWXW=W=W=WXW=W=W,W?W,W,W,W?W,W?W,W,W,W?W?W?W,W,W,W,W,W?W,W?W,W?W,W,W?W,WXX0X0X0WXWXX0X0WXX0X0X0WXW4W4W4WXWXWXW4WXW4W4W4T@UNUNUNUNUQUNUNUQUQUNUQUQUQUNUNUQUNUQUNUHUHUDUDUHUHUDUDSCT$SCT$X0X0X0W$X0X0X0W$X-X-W$W$W$X-W$X-W$X-W$X-X-X-X-W$X-X-X-W$X-X-W$W$X-W$W$W$W$X-W$W$W$X-W$W$X-X-W$X-W$X-W$X-WXWXWXWDWXWDWDWDWXWDWXWDWXWXWXWDWDWDWXWDWXWXWXW4WXW4W4W4TFTKTKTKTKTKTFTKTFTKTFTFSZSZSZSBSZSZSBSBSZSZSBSBSZSZSBSZSZSZSBSZSZSZSBSBSZSZSBSBSBSZSBSBTFTKTFTKTFTKTFTKSOSOS0S0SOSOS0S0SOSOS0S0SOT&SOSOSOT&SOT&SOSOSOT&SOSOT&T&T&T&T&SMT&T&T&SMT&SMT&SMT&SMT&SMT&SMT&T&T&SMSMSMT&SMT&SMT&SMT&SMS5SLSLSLSLS5SLSLS5SQS5SQS5S5SQSQSQS5SQSQS5SQS5SQSQSISISISQSQSQSISQSISQSQSQSISQSQSISISQSQWAWAWYWYWAWAWYWYWAWYWYWYWAWAWYWAWYWAWYWYWYWAWYWYT/U(T/U(SLS9SLS9SLS9SLSLS9S9S9SLS9S9SLSLS9S9S9SLS9SLSLSLSQSISQSISQSISQSISQSISQSISQSQSQSKSKSKSQSKSISISISKSISKSISKS@SYS@S@SYSYS@SYSYSYS@S@V)TTV)TTV-V-V-T?T?V-T?T?T?UET?T?V-T?T?T?V-T?T?T?V-V-T?T?UEUET?T?SQSQSRSQSRSQSRSRSQSQSQSRSQSRSRSRS@S@SRS@S@S@SRS@S8S8S8STSTS8STSTS8S8S8STS8S8S8STS8S8STSTS8S8STSTUAUAUAT3UAUAT3UATTTTTTV3TTTTV3V3TTV3V3V3SFSRSFSRS8STS8S8SFSTSFSTT1T1T2T2T1T2T1T1T1T1T2T2T2T2T1T2T1T2T1T2T2T2T=T=T2T=T2T2T=T=T2T=T2T=T2T2T2T=T2T=T2T=T2T2T=T=T2T=T=T=T2T=T=T=T2T=TITIT=TIT=TIT=T=T=V3T=T=V3V3T=V3T=V3T=V3T=V3T=V3T=V3T=T2V3V3T2T2V3V3T2V3T2T2V3V3T2V3V3V3T2T2T2V3T2V3V3V3T=T=T2T2T=T=T2T2T=T=T2T=T=T=T2T=T2V3V3V3SGSGSGSUSGSUSUSUSGSUSGSUX>XFXFXFXFX>XFXFX>X>XFXFX>XFXFXFT5T5T7T5T7T5T7T7T5T5T7T5T5T5T7T5T5T5T7T5T5T5T7T7T5T5T5T7T5T5T7T7T0T2T0T0T2T2T0T2T0T2T0T0T0T2T0T0URURT2URURV3URURV3URURURV3V3URV3T2URT2URT2T2T2URT2T2T2URT2URURURT2URT2T2T2URT2T2T2T2T0T0T0T2T0T0T2URT2URT2URURURURV3URV3V3V3URURURV3URURURV3URURV3V3URURSGSUSUSUXFXFXDXDXFXFXDXFXDXFXDXFXFXFXDXFXFXFXDXFXDXFXDXDXFXFXDXFXDXFXDXDXFXFXDXDXFXFXDXFXFXFXDXFXDXFXDXDXFXFXDXDT7T0T7T7T0T0T7T7", T = ["Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Ciudad_Juarez", "America/Costa_Rica", "America/Coyhaique", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza", "America/Glace_Bay", "America/Goose_Bay", "America/Grand_Turk", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida", "America/Mexico_City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau", "America/New_York", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/New_Salem", "America/Nuuk", "America/Ojinaga", "America/Panama", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Rio_Branco", "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Rothera", "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Chita", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley", "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Etc/GMT", "Etc/GMT+1", "Etc/GMT+10", "Etc/GMT+11", "Etc/GMT+12", "Etc/GMT+2", "Etc/GMT+3", "Etc/GMT+4", "Etc/GMT+5", "Etc/GMT+6", "Etc/GMT+7", "Etc/GMT+8", "Etc/GMT+9", "Etc/GMT-1", "Etc/GMT-10", "Etc/GMT-11", "Etc/GMT-12", "Etc/GMT-2", "Etc/GMT-3", "Etc/GMT-4", "Etc/GMT-5", "Etc/GMT-6", "Etc/GMT-7", "Etc/GMT-8", "Etc/GMT-9", "Etc/UTC", "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad", "Europe/Kirov", "Europe/Kyiv", "Europe/Lisbon", "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Vaduz", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zurich", "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion", "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kanton", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis"];
    if (W = +W, !(-90 <= (Y = +Y) && Y <= 90 && -180 <= W && W <= 180))
      throw new RangeError("invalid coordinates");
    if (90 <= Y)
      return "Etc/GMT";
    for (var V = -1, S = 48 * (180 + W) / 360.00000000000006, U = 24 * (90 - Y) / 180.00000000000003, Z = 0 | S, $ = 0 | U, K = 96 * $ + 2 * Z, K = 56 * X.charCodeAt(K) + X.charCodeAt(K + 1) - 1995;K + T.length < 3136; )
      K = 56 * X.charCodeAt(K = 8 * (V = V + K + 1) + 4 * ($ = 0 | (U = 2 * (U - $) % 2)) + 2 * (Z = 0 | (S = 2 * (S - Z) % 2)) + 2304) + X.charCodeAt(K + 1) - 1995;
    return T[K + T.length - 3136];
  }
  typeof module != "undefined" && (module.exports = tzlookup);
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/fbdifflib.js
var require_fbdifflib = __commonJS((exports, module) => {
  var floor = Math.floor;
  var max = Math.max;
  var min = Math.min;
  var _calculateRatio = function(matches, length) {
    if (length) {
      return 2 * matches / length;
    } else {
      return 1;
    }
  };
  var _arrayCmp = function(a, b) {
    var i, la, lb, _i, _ref, _ref1;
    _ref = [a.length, b.length], la = _ref[0], lb = _ref[1];
    for (i = _i = 0, _ref1 = min(la, lb);0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      if (a[i] < b[i]) {
        return -1;
      }
      if (a[i] > b[i]) {
        return 1;
      }
    }
    return la - lb;
  };
  var _has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };
  var SequenceMatcher = function() {
    function SequenceMatcher2(isjunk, a, b, autojunk) {
      this.isjunk = isjunk;
      if (a == null) {
        a = "";
      }
      if (b == null) {
        b = "";
      }
      this.autojunk = autojunk != null ? autojunk : true;
      this.a = this.b = null;
      this.setSeqs(a, b);
    }
    SequenceMatcher2.prototype.setSeqs = function(a, b) {
      this.setSeq1(a);
      return this.setSeq2(b);
    };
    SequenceMatcher2.prototype.setSeq1 = function(a) {
      if (a === this.a) {
        return;
      }
      this.a = a;
      return this.matchingBlocks = this.opcodes = null;
    };
    SequenceMatcher2.prototype.setSeq2 = function(b) {
      if (b === this.b) {
        return;
      }
      this.b = b;
      this.matchingBlocks = this.opcodes = null;
      this.fullbcount = null;
      return this._chainB();
    };
    SequenceMatcher2.prototype._chainB = function() {
      var b, b2j, elt, i, idxs, indices, isjunk, junk, n, ntest, popular, _i, _j, _len, _len1, _ref;
      b = this.b;
      this.b2j = b2j = {};
      for (i = _i = 0, _len = b.length;_i < _len; i = ++_i) {
        elt = b[i];
        indices = _has(b2j, elt) ? b2j[elt] : b2j[elt] = [];
        indices.push(i);
      }
      junk = {};
      isjunk = this.isjunk;
      if (isjunk) {
        _ref = Object.keys(b2j);
        for (_j = 0, _len1 = _ref.length;_j < _len1; _j++) {
          elt = _ref[_j];
          if (isjunk(elt)) {
            junk[elt] = true;
            delete b2j[elt];
          }
        }
      }
      popular = {};
      n = b.length;
      if (this.autojunk && n >= 200) {
        ntest = floor(n / 100) + 1;
        for (elt in b2j) {
          idxs = b2j[elt];
          if (idxs.length > ntest) {
            popular[elt] = true;
            delete b2j[elt];
          }
        }
      }
      this.isbjunk = function(b2) {
        return _has(junk, b2);
      };
      return this.isbpopular = function(b2) {
        return _has(popular, b2);
      };
    };
    SequenceMatcher2.prototype.findLongestMatch = function(alo, ahi, blo, bhi) {
      var a, b, b2j, besti, bestj, bestsize, i, isbjunk, j, j2len, k, newj2len, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      _ref = [this.a, this.b, this.b2j, this.isbjunk], a = _ref[0], b = _ref[1], b2j = _ref[2], isbjunk = _ref[3];
      _ref1 = [alo, blo, 0], besti = _ref1[0], bestj = _ref1[1], bestsize = _ref1[2];
      j2len = {};
      for (i = _i = alo;alo <= ahi ? _i < ahi : _i > ahi; i = alo <= ahi ? ++_i : --_i) {
        newj2len = {};
        _ref2 = _has(b2j, a[i]) ? b2j[a[i]] : [];
        for (_j = 0, _len = _ref2.length;_j < _len; _j++) {
          j = _ref2[_j];
          if (j < blo) {
            continue;
          }
          if (j >= bhi) {
            break;
          }
          k = newj2len[j] = (j2len[j - 1] || 0) + 1;
          if (k > bestsize) {
            _ref3 = [i - k + 1, j - k + 1, k], besti = _ref3[0], bestj = _ref3[1], bestsize = _ref3[2];
          }
        }
        j2len = newj2len;
      }
      while (besti > alo && bestj > blo && !isbjunk(b[bestj - 1]) && a[besti - 1] === b[bestj - 1]) {
        _ref4 = [besti - 1, bestj - 1, bestsize + 1], besti = _ref4[0], bestj = _ref4[1], bestsize = _ref4[2];
      }
      while (besti + bestsize < ahi && bestj + bestsize < bhi && !isbjunk(b[bestj + bestsize]) && a[besti + bestsize] === b[bestj + bestsize]) {
        bestsize++;
      }
      while (besti > alo && bestj > blo && isbjunk(b[bestj - 1]) && a[besti - 1] === b[bestj - 1]) {
        _ref5 = [besti - 1, bestj - 1, bestsize + 1], besti = _ref5[0], bestj = _ref5[1], bestsize = _ref5[2];
      }
      while (besti + bestsize < ahi && bestj + bestsize < bhi && isbjunk(b[bestj + bestsize]) && a[besti + bestsize] === b[bestj + bestsize]) {
        bestsize++;
      }
      return [besti, bestj, bestsize];
    };
    SequenceMatcher2.prototype.getMatchingBlocks = function() {
      var ahi, alo, bhi, blo, i, i1, i2, j, j1, j2, k, k1, k2, la, lb, matchingBlocks, nonAdjacent, queue, x, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4;
      if (this.matchingBlocks) {
        return this.matchingBlocks;
      }
      _ref = [this.a.length, this.b.length], la = _ref[0], lb = _ref[1];
      queue = [[0, la, 0, lb]];
      matchingBlocks = [];
      while (queue.length) {
        _ref1 = queue.pop(), alo = _ref1[0], ahi = _ref1[1], blo = _ref1[2], bhi = _ref1[3];
        _ref2 = x = this.findLongestMatch(alo, ahi, blo, bhi), i = _ref2[0], j = _ref2[1], k = _ref2[2];
        if (k) {
          matchingBlocks.push(x);
          if (alo < i && blo < j) {
            queue.push([alo, i, blo, j]);
          }
          if (i + k < ahi && j + k < bhi) {
            queue.push([i + k, ahi, j + k, bhi]);
          }
        }
      }
      matchingBlocks.sort(_arrayCmp);
      i1 = j1 = k1 = 0;
      nonAdjacent = [];
      for (_i = 0, _len = matchingBlocks.length;_i < _len; _i++) {
        _ref3 = matchingBlocks[_i], i2 = _ref3[0], j2 = _ref3[1], k2 = _ref3[2];
        if (i1 + k1 === i2 && j1 + k1 === j2) {
          k1 += k2;
        } else {
          if (k1) {
            nonAdjacent.push([i1, j1, k1]);
          }
          _ref4 = [i2, j2, k2], i1 = _ref4[0], j1 = _ref4[1], k1 = _ref4[2];
        }
      }
      if (k1) {
        nonAdjacent.push([i1, j1, k1]);
      }
      nonAdjacent.push([la, lb, 0]);
      return this.matchingBlocks = nonAdjacent;
    };
    SequenceMatcher2.prototype.getOpcodes = function() {
      var ai, answer, bj, i, j, size, tag, _i, _len, _ref, _ref1, _ref2;
      if (this.opcodes) {
        return this.opcodes;
      }
      i = j = 0;
      this.opcodes = answer = [];
      _ref = this.getMatchingBlocks();
      for (_i = 0, _len = _ref.length;_i < _len; _i++) {
        _ref1 = _ref[_i], ai = _ref1[0], bj = _ref1[1], size = _ref1[2];
        tag = "";
        if (i < ai && j < bj) {
          tag = "replace";
        } else if (i < ai) {
          tag = "delete";
        } else if (j < bj) {
          tag = "insert";
        }
        if (tag) {
          answer.push([tag, i, ai, j, bj]);
        }
        _ref2 = [ai + size, bj + size], i = _ref2[0], j = _ref2[1];
        if (size) {
          answer.push(["equal", ai, i, bj, j]);
        }
      }
      return answer;
    };
    SequenceMatcher2.prototype.getGroupedOpcodes = function(n) {
      var codes, group, groups, i1, i2, j1, j2, nn, tag, _i, _len, _ref, _ref1, _ref2, _ref3;
      if (n == null) {
        n = 3;
      }
      codes = this.getOpcodes();
      if (!codes.length) {
        codes = [["equal", 0, 1, 0, 1]];
      }
      if (codes[0][0] === "equal") {
        _ref = codes[0], tag = _ref[0], i1 = _ref[1], i2 = _ref[2], j1 = _ref[3], j2 = _ref[4];
        codes[0] = [tag, max(i1, i2 - n), i2, max(j1, j2 - n), j2];
      }
      if (codes[codes.length - 1][0] === "equal") {
        _ref1 = codes[codes.length - 1], tag = _ref1[0], i1 = _ref1[1], i2 = _ref1[2], j1 = _ref1[3], j2 = _ref1[4];
        codes[codes.length - 1] = [tag, i1, min(i2, i1 + n), j1, min(j2, j1 + n)];
      }
      nn = n + n;
      groups = [];
      group = [];
      for (_i = 0, _len = codes.length;_i < _len; _i++) {
        _ref2 = codes[_i], tag = _ref2[0], i1 = _ref2[1], i2 = _ref2[2], j1 = _ref2[3], j2 = _ref2[4];
        if (tag === "equal" && i2 - i1 > nn) {
          group.push([tag, i1, min(i2, i1 + n), j1, min(j2, j1 + n)]);
          groups.push(group);
          group = [];
          _ref3 = [max(i1, i2 - n), max(j1, j2 - n)], i1 = _ref3[0], j1 = _ref3[1];
        }
        group.push([tag, i1, i2, j1, j2]);
      }
      if (group.length && !(group.length === 1 && group[0][0] === "equal")) {
        groups.push(group);
      }
      return groups;
    };
    SequenceMatcher2.prototype.ratio = function() {
      var match, matches, _i, _len, _ref;
      matches = 0;
      _ref = this.getMatchingBlocks();
      for (_i = 0, _len = _ref.length;_i < _len; _i++) {
        match = _ref[_i];
        matches += match[2];
      }
      return _calculateRatio(matches, this.a.length + this.b.length);
    };
    SequenceMatcher2.prototype.quickRatio = function() {
      var avail, elt, fullbcount, matches, numb, _i, _j, _len, _len1, _ref, _ref1;
      if (!this.fullbcount) {
        this.fullbcount = fullbcount = {};
        _ref = this.b;
        for (_i = 0, _len = _ref.length;_i < _len; _i++) {
          elt = _ref[_i];
          fullbcount[elt] = (fullbcount[elt] || 0) + 1;
        }
      }
      fullbcount = this.fullbcount;
      avail = {};
      matches = 0;
      _ref1 = this.a;
      for (_j = 0, _len1 = _ref1.length;_j < _len1; _j++) {
        elt = _ref1[_j];
        if (_has(avail, elt)) {
          numb = avail[elt];
        } else {
          numb = fullbcount[elt] || 0;
        }
        avail[elt] = numb - 1;
        if (numb > 0) {
          matches++;
        }
      }
      return _calculateRatio(matches, this.a.length + this.b.length);
    };
    SequenceMatcher2.prototype.realQuickRatio = function() {
      var la, lb, _ref;
      _ref = [this.a.length, this.b.length], la = _ref[0], lb = _ref[1];
      return _calculateRatio(min(la, lb), la + lb);
    };
    return SequenceMatcher2;
  }();
  module.exports = SequenceMatcher;
});

// node_modules/.bun/heap@0.2.7/node_modules/heap/lib/heap.js
var require_heap = __commonJS((exports, module) => {
  (function() {
    var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;
    floor = Math.floor, min = Math.min;
    defaultCmp = function(x, y) {
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    };
    insort = function(a, x, lo, hi, cmp) {
      var mid;
      if (lo == null) {
        lo = 0;
      }
      if (cmp == null) {
        cmp = defaultCmp;
      }
      if (lo < 0) {
        throw new Error("lo must be non-negative");
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
    heappush = function(array, item, cmp) {
      if (cmp == null) {
        cmp = defaultCmp;
      }
      array.push(item);
      return _siftdown(array, 0, array.length - 1, cmp);
    };
    heappop = function(array, cmp) {
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
    heapreplace = function(array, item, cmp) {
      var returnitem;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      returnitem = array[0];
      array[0] = item;
      _siftup(array, 0, cmp);
      return returnitem;
    };
    heappushpop = function(array, item, cmp) {
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
    heapify = function(array, cmp) {
      var i, _i, _j, _len, _ref, _ref1, _results, _results1;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      _ref1 = function() {
        _results1 = [];
        for (var _j2 = 0, _ref2 = floor(array.length / 2);0 <= _ref2 ? _j2 < _ref2 : _j2 > _ref2; 0 <= _ref2 ? _j2++ : _j2--) {
          _results1.push(_j2);
        }
        return _results1;
      }.apply(this).reverse();
      _results = [];
      for (_i = 0, _len = _ref1.length;_i < _len; _i++) {
        i = _ref1[_i];
        _results.push(_siftup(array, i, cmp));
      }
      return _results;
    };
    updateItem = function(array, item, cmp) {
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
    nlargest = function(array, n, cmp) {
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
      for (_i = 0, _len = _ref.length;_i < _len; _i++) {
        elem = _ref[_i];
        heappushpop(result, elem, cmp);
      }
      return result.sort(cmp).reverse();
    };
    nsmallest = function(array, n, cmp) {
      var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;
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
        for (_i = 0, _len = _ref.length;_i < _len; _i++) {
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
      for (i = _j = 0, _ref1 = min(n, array.length);0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        _results.push(heappop(array, cmp));
      }
      return _results;
    };
    _siftdown = function(array, startpos, pos, cmp) {
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
    _siftup = function(array, pos, cmp) {
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
    Heap = function() {
      Heap2.push = heappush;
      Heap2.pop = heappop;
      Heap2.replace = heapreplace;
      Heap2.pushpop = heappushpop;
      Heap2.heapify = heapify;
      Heap2.updateItem = updateItem;
      Heap2.nlargest = nlargest;
      Heap2.nsmallest = nsmallest;
      function Heap2(cmp) {
        this.cmp = cmp != null ? cmp : defaultCmp;
        this.nodes = [];
      }
      Heap2.prototype.push = function(x) {
        return heappush(this.nodes, x, this.cmp);
      };
      Heap2.prototype.pop = function() {
        return heappop(this.nodes, this.cmp);
      };
      Heap2.prototype.peek = function() {
        return this.nodes[0];
      };
      Heap2.prototype.contains = function(x) {
        return this.nodes.indexOf(x) !== -1;
      };
      Heap2.prototype.replace = function(x) {
        return heapreplace(this.nodes, x, this.cmp);
      };
      Heap2.prototype.pushpop = function(x) {
        return heappushpop(this.nodes, x, this.cmp);
      };
      Heap2.prototype.heapify = function() {
        return heapify(this.nodes, this.cmp);
      };
      Heap2.prototype.updateItem = function(x) {
        return updateItem(this.nodes, x, this.cmp);
      };
      Heap2.prototype.clear = function() {
        return this.nodes = [];
      };
      Heap2.prototype.empty = function() {
        return this.nodes.length === 0;
      };
      Heap2.prototype.size = function() {
        return this.nodes.length;
      };
      Heap2.prototype.clone = function() {
        var heap;
        heap = new Heap2;
        heap.nodes = this.nodes.slice(0);
        return heap;
      };
      Heap2.prototype.toArray = function() {
        return this.nodes.slice(0);
      };
      Heap2.prototype.insert = Heap2.prototype.push;
      Heap2.prototype.top = Heap2.prototype.peek;
      Heap2.prototype.front = Heap2.prototype.peek;
      Heap2.prototype.has = Heap2.prototype.contains;
      Heap2.prototype.copy = Heap2.prototype.clone;
      return Heap2;
    }();
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        return define([], factory);
      } else if (typeof exports === "object") {
        return module.exports = factory();
      } else {
        return root.Heap = factory();
      }
    })(this, function() {
      return Heap;
    });
  }).call(exports);
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_arrayMap.js
var require__arrayMap = __commonJS((exports, module) => {
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  module.exports = arrayMap;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isArray.js
var require_isArray = __commonJS((exports, module) => {
  var isArray = Array.isArray;
  module.exports = isArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_freeGlobal.js
var require__freeGlobal = __commonJS((exports, module) => {
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  module.exports = freeGlobal;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_root.js
var require__root = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  module.exports = root;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Symbol.js
var require__Symbol = __commonJS((exports, module) => {
  var root = require__root();
  var Symbol2 = root.Symbol;
  module.exports = Symbol2;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getRawTag.js
var require__getRawTag = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  module.exports = getRawTag;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_objectToString.js
var require__objectToString = __commonJS((exports, module) => {
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  module.exports = objectToString;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseGetTag.js
var require__baseGetTag = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var getRawTag = require__getRawTag();
  var objectToString = require__objectToString();
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  module.exports = baseGetTag;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS((exports, module) => {
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  module.exports = isObjectLike;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isSymbol.js
var require_isSymbol = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isObjectLike = require_isObjectLike();
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  module.exports = isSymbol;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isKey.js
var require__isKey = __commonJS((exports, module) => {
  var isArray = require_isArray();
  var isSymbol = require_isSymbol();
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  module.exports = isKey;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isObject.js
var require_isObject = __commonJS((exports, module) => {
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  module.exports = isObject;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isFunction.js
var require_isFunction = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isObject = require_isObject();
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  module.exports = isFunction;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_coreJsData.js
var require__coreJsData = __commonJS((exports, module) => {
  var root = require__root();
  var coreJsData = root["__core-js_shared__"];
  module.exports = coreJsData;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isMasked.js
var require__isMasked = __commonJS((exports, module) => {
  var coreJsData = require__coreJsData();
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  module.exports = isMasked;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_toSource.js
var require__toSource = __commonJS((exports, module) => {
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + "";
      } catch (e) {}
    }
    return "";
  }
  module.exports = toSource;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsNative.js
var require__baseIsNative = __commonJS((exports, module) => {
  var isFunction = require_isFunction();
  var isMasked = require__isMasked();
  var isObject = require_isObject();
  var toSource = require__toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  module.exports = baseIsNative;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getValue.js
var require__getValue = __commonJS((exports, module) => {
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  module.exports = getValue;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getNative.js
var require__getNative = __commonJS((exports, module) => {
  var baseIsNative = require__baseIsNative();
  var getValue = require__getValue();
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  module.exports = getNative;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_nativeCreate.js
var require__nativeCreate = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var nativeCreate = getNative(Object, "create");
  module.exports = nativeCreate;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hashClear.js
var require__hashClear = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  module.exports = hashClear;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hashDelete.js
var require__hashDelete = __commonJS((exports, module) => {
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = hashDelete;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hashGet.js
var require__hashGet = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }
  module.exports = hashGet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hashHas.js
var require__hashHas = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }
  module.exports = hashHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hashSet.js
var require__hashSet = __commonJS((exports, module) => {
  var nativeCreate = require__nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
    return this;
  }
  module.exports = hashSet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Hash.js
var require__Hash = __commonJS((exports, module) => {
  var hashClear = require__hashClear();
  var hashDelete = require__hashDelete();
  var hashGet = require__hashGet();
  var hashHas = require__hashHas();
  var hashSet = require__hashSet();
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  module.exports = Hash;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_listCacheClear.js
var require__listCacheClear = __commonJS((exports, module) => {
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  module.exports = listCacheClear;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/eq.js
var require_eq = __commonJS((exports, module) => {
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  module.exports = eq;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js
var require__assocIndexOf = __commonJS((exports, module) => {
  var eq = require_eq();
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  module.exports = assocIndexOf;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js
var require__listCacheDelete = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  module.exports = listCacheDelete;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_listCacheGet.js
var require__listCacheGet = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }
  module.exports = listCacheGet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_listCacheHas.js
var require__listCacheHas = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  module.exports = listCacheHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_listCacheSet.js
var require__listCacheSet = __commonJS((exports, module) => {
  var assocIndexOf = require__assocIndexOf();
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  module.exports = listCacheSet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_ListCache.js
var require__ListCache = __commonJS((exports, module) => {
  var listCacheClear = require__listCacheClear();
  var listCacheDelete = require__listCacheDelete();
  var listCacheGet = require__listCacheGet();
  var listCacheHas = require__listCacheHas();
  var listCacheSet = require__listCacheSet();
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  module.exports = ListCache;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Map.js
var require__Map = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Map = getNative(root, "Map");
  module.exports = Map;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js
var require__mapCacheClear = __commonJS((exports, module) => {
  var Hash = require__Hash();
  var ListCache = require__ListCache();
  var Map = require__Map();
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      hash: new Hash,
      map: new (Map || ListCache),
      string: new Hash
    };
  }
  module.exports = mapCacheClear;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isKeyable.js
var require__isKeyable = __commonJS((exports, module) => {
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  module.exports = isKeyable;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getMapData.js
var require__getMapData = __commonJS((exports, module) => {
  var isKeyable = require__isKeyable();
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  module.exports = getMapData;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js
var require__mapCacheDelete = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = mapCacheDelete;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js
var require__mapCacheGet = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  module.exports = mapCacheGet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js
var require__mapCacheHas = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  module.exports = mapCacheHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js
var require__mapCacheSet = __commonJS((exports, module) => {
  var getMapData = require__getMapData();
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  module.exports = mapCacheSet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_MapCache.js
var require__MapCache = __commonJS((exports, module) => {
  var mapCacheClear = require__mapCacheClear();
  var mapCacheDelete = require__mapCacheDelete();
  var mapCacheGet = require__mapCacheGet();
  var mapCacheHas = require__mapCacheHas();
  var mapCacheSet = require__mapCacheSet();
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  module.exports = MapCache;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/memoize.js
var require_memoize = __commonJS((exports, module) => {
  var MapCache = require__MapCache();
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }
  memoize.Cache = MapCache;
  module.exports = memoize;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_memoizeCapped.js
var require__memoizeCapped = __commonJS((exports, module) => {
  var memoize = require_memoize();
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  module.exports = memoizeCapped;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stringToPath.js
var require__stringToPath = __commonJS((exports, module) => {
  var memoizeCapped = require__memoizeCapped();
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  module.exports = stringToPath;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseToString.js
var require__baseToString = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var arrayMap = require__arrayMap();
  var isArray = require_isArray();
  var isSymbol = require_isSymbol();
  var INFINITY = 1 / 0;
  var symbolProto = Symbol2 ? Symbol2.prototype : undefined;
  var symbolToString = symbolProto ? symbolProto.toString : undefined;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray(value)) {
      return arrayMap(value, baseToString) + "";
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  module.exports = baseToString;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/toString.js
var require_toString = __commonJS((exports, module) => {
  var baseToString = require__baseToString();
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  module.exports = toString;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_castPath.js
var require__castPath = __commonJS((exports, module) => {
  var isArray = require_isArray();
  var isKey = require__isKey();
  var stringToPath = require__stringToPath();
  var toString = require_toString();
  function castPath(value, object) {
    if (isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }
  module.exports = castPath;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_toKey.js
var require__toKey = __commonJS((exports, module) => {
  var isSymbol = require_isSymbol();
  var INFINITY = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  module.exports = toKey;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseGet.js
var require__baseGet = __commonJS((exports, module) => {
  var castPath = require__castPath();
  var toKey = require__toKey();
  function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0, length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : undefined;
  }
  module.exports = baseGet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stackClear.js
var require__stackClear = __commonJS((exports, module) => {
  var ListCache = require__ListCache();
  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }
  module.exports = stackClear;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stackDelete.js
var require__stackDelete = __commonJS((exports, module) => {
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  module.exports = stackDelete;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stackGet.js
var require__stackGet = __commonJS((exports, module) => {
  function stackGet(key) {
    return this.__data__.get(key);
  }
  module.exports = stackGet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stackHas.js
var require__stackHas = __commonJS((exports, module) => {
  function stackHas(key) {
    return this.__data__.has(key);
  }
  module.exports = stackHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_stackSet.js
var require__stackSet = __commonJS((exports, module) => {
  var ListCache = require__ListCache();
  var Map = require__Map();
  var MapCache = require__MapCache();
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  module.exports = stackSet;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Stack.js
var require__Stack = __commonJS((exports, module) => {
  var ListCache = require__ListCache();
  var stackClear = require__stackClear();
  var stackDelete = require__stackDelete();
  var stackGet = require__stackGet();
  var stackHas = require__stackHas();
  var stackSet = require__stackSet();
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  module.exports = Stack;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js
var require__setCacheAdd = __commonJS((exports, module) => {
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  module.exports = setCacheAdd;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_setCacheHas.js
var require__setCacheHas = __commonJS((exports, module) => {
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  module.exports = setCacheHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_SetCache.js
var require__SetCache = __commonJS((exports, module) => {
  var MapCache = require__MapCache();
  var setCacheAdd = require__setCacheAdd();
  var setCacheHas = require__setCacheHas();
  function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache;
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  module.exports = SetCache;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_arraySome.js
var require__arraySome = __commonJS((exports, module) => {
  function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  module.exports = arraySome;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_cacheHas.js
var require__cacheHas = __commonJS((exports, module) => {
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  module.exports = cacheHas;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_equalArrays.js
var require__equalArrays = __commonJS((exports, module) => {
  var SetCache = require__SetCache();
  var arraySome = require__arraySome();
  var cacheHas = require__cacheHas();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache : undefined;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue2, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  module.exports = equalArrays;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Uint8Array.js
var require__Uint8Array = __commonJS((exports, module) => {
  var root = require__root();
  var Uint8Array2 = root.Uint8Array;
  module.exports = Uint8Array2;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_mapToArray.js
var require__mapToArray = __commonJS((exports, module) => {
  function mapToArray(map) {
    var index = -1, result = Array(map.size);
    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  module.exports = mapToArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_setToArray.js
var require__setToArray = __commonJS((exports, module) => {
  function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  module.exports = setToArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_equalByTag.js
var require__equalByTag = __commonJS((exports, module) => {
  var Symbol2 = require__Symbol();
  var Uint8Array2 = require__Uint8Array();
  var eq = require_eq();
  var equalArrays = require__equalArrays();
  var mapToArray = require__mapToArray();
  var setToArray = require__setToArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var symbolProto = Symbol2 ? Symbol2.prototype : undefined;
  var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        return object == other + "";
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  module.exports = equalByTag;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_arrayPush.js
var require__arrayPush = __commonJS((exports, module) => {
  function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  module.exports = arrayPush;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseGetAllKeys.js
var require__baseGetAllKeys = __commonJS((exports, module) => {
  var arrayPush = require__arrayPush();
  var isArray = require_isArray();
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }
  module.exports = baseGetAllKeys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_arrayFilter.js
var require__arrayFilter = __commonJS((exports, module) => {
  function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  module.exports = arrayFilter;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/stubArray.js
var require_stubArray = __commonJS((exports, module) => {
  function stubArray() {
    return [];
  }
  module.exports = stubArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getSymbols.js
var require__getSymbols = __commonJS((exports, module) => {
  var arrayFilter = require__arrayFilter();
  var stubArray = require_stubArray();
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  module.exports = getSymbols;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseTimes.js
var require__baseTimes = __commonJS((exports, module) => {
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  module.exports = baseTimes;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js
var require__baseIsArguments = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  module.exports = baseIsArguments;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isArguments.js
var require_isArguments = __commonJS((exports, module) => {
  var baseIsArguments = require__baseIsArguments();
  var isObjectLike = require_isObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  module.exports = isArguments;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS((exports, module) => {
  function stubFalse() {
    return false;
  }
  module.exports = stubFalse;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS((exports, module) => {
  var root = require__root();
  var stubFalse = require_stubFalse();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer = moduleExports ? root.Buffer : undefined;
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
  var isBuffer = nativeIsBuffer || stubFalse;
  module.exports = isBuffer;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isIndex.js
var require__isIndex = __commonJS((exports, module) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  module.exports = isIndex;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isLength.js
var require_isLength = __commonJS((exports, module) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  module.exports = isLength;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js
var require__baseIsTypedArray = __commonJS((exports, module) => {
  var baseGetTag = require__baseGetTag();
  var isLength = require_isLength();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  module.exports = baseIsTypedArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseUnary.js
var require__baseUnary = __commonJS((exports, module) => {
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  module.exports = baseUnary;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_nodeUtil.js
var require__nodeUtil = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {}
  }();
  module.exports = nodeUtil;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS((exports, module) => {
  var baseIsTypedArray = require__baseIsTypedArray();
  var baseUnary = require__baseUnary();
  var nodeUtil = require__nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  module.exports = isTypedArray;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js
var require__arrayLikeKeys = __commonJS((exports, module) => {
  var baseTimes = require__baseTimes();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isBuffer = require_isBuffer();
  var isIndex = require__isIndex();
  var isTypedArray = require_isTypedArray();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = arrayLikeKeys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isPrototype.js
var require__isPrototype = __commonJS((exports, module) => {
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  module.exports = isPrototype;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_overArg.js
var require__overArg = __commonJS((exports, module) => {
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  module.exports = overArg;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_nativeKeys.js
var require__nativeKeys = __commonJS((exports, module) => {
  var overArg = require__overArg();
  var nativeKeys = overArg(Object.keys, Object);
  module.exports = nativeKeys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseKeys.js
var require__baseKeys = __commonJS((exports, module) => {
  var isPrototype = require__isPrototype();
  var nativeKeys = require__nativeKeys();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = baseKeys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  var isFunction = require_isFunction();
  var isLength = require_isLength();
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  module.exports = isArrayLike;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/keys.js
var require_keys = __commonJS((exports, module) => {
  var arrayLikeKeys = require__arrayLikeKeys();
  var baseKeys = require__baseKeys();
  var isArrayLike = require_isArrayLike();
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }
  module.exports = keys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getAllKeys.js
var require__getAllKeys = __commonJS((exports, module) => {
  var baseGetAllKeys = require__baseGetAllKeys();
  var getSymbols = require__getSymbols();
  var keys = require_keys();
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }
  module.exports = getAllKeys;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_equalObjects.js
var require__equalObjects = __commonJS((exports, module) => {
  var getAllKeys = require__getAllKeys();
  var COMPARE_PARTIAL_FLAG = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && (("constructor" in object) && ("constructor" in other)) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  module.exports = equalObjects;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_DataView.js
var require__DataView = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var DataView = getNative(root, "DataView");
  module.exports = DataView;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Promise.js
var require__Promise = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Promise2 = getNative(root, "Promise");
  module.exports = Promise2;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_Set.js
var require__Set = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Set2 = getNative(root, "Set");
  module.exports = Set2;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_WeakMap.js
var require__WeakMap = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var WeakMap2 = getNative(root, "WeakMap");
  module.exports = WeakMap2;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getTag.js
var require__getTag = __commonJS((exports, module) => {
  var DataView = require__DataView();
  var Map = require__Map();
  var Promise2 = require__Promise();
  var Set2 = require__Set();
  var WeakMap2 = require__WeakMap();
  var baseGetTag = require__baseGetTag();
  var toSource = require__toSource();
  var mapTag = "[object Map]";
  var objectTag = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag = "[object Set]";
  var weakMapTag = "[object WeakMap]";
  var dataViewTag = "[object DataView]";
  var dataViewCtorString = toSource(DataView);
  var mapCtorString = toSource(Map);
  var promiseCtorString = toSource(Promise2);
  var setCtorString = toSource(Set2);
  var weakMapCtorString = toSource(WeakMap2);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2) != setTag || WeakMap2 && getTag(new WeakMap2) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  module.exports = getTag;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsEqualDeep.js
var require__baseIsEqualDeep = __commonJS((exports, module) => {
  var Stack = require__Stack();
  var equalArrays = require__equalArrays();
  var equalByTag = require__equalByTag();
  var equalObjects = require__equalObjects();
  var getTag = require__getTag();
  var isArray = require_isArray();
  var isBuffer = require_isBuffer();
  var isTypedArray = require_isTypedArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var objectTag = "[object Object]";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack);
      return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  module.exports = baseIsEqualDeep;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsEqual.js
var require__baseIsEqual = __commonJS((exports, module) => {
  var baseIsEqualDeep = require__baseIsEqualDeep();
  var isObjectLike = require_isObjectLike();
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  module.exports = baseIsEqual;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIsMatch.js
var require__baseIsMatch = __commonJS((exports, module) => {
  var Stack = require__Stack();
  var baseIsEqual = require__baseIsEqual();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack;
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  module.exports = baseIsMatch;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_isStrictComparable.js
var require__isStrictComparable = __commonJS((exports, module) => {
  var isObject = require_isObject();
  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }
  module.exports = isStrictComparable;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_getMatchData.js
var require__getMatchData = __commonJS((exports, module) => {
  var isStrictComparable = require__isStrictComparable();
  var keys = require_keys();
  function getMatchData(object) {
    var result = keys(object), length = result.length;
    while (length--) {
      var key = result[length], value = object[key];
      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }
  module.exports = getMatchData;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_matchesStrictComparable.js
var require__matchesStrictComparable = __commonJS((exports, module) => {
  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue && (srcValue !== undefined || (key in Object(object)));
    };
  }
  module.exports = matchesStrictComparable;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseMatches.js
var require__baseMatches = __commonJS((exports, module) => {
  var baseIsMatch = require__baseIsMatch();
  var getMatchData = require__getMatchData();
  var matchesStrictComparable = require__matchesStrictComparable();
  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }
  module.exports = baseMatches;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/get.js
var require_get = __commonJS((exports, module) => {
  var baseGet = require__baseGet();
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }
  module.exports = get;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseHasIn.js
var require__baseHasIn = __commonJS((exports, module) => {
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  module.exports = baseHasIn;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_hasPath.js
var require__hasPath = __commonJS((exports, module) => {
  var castPath = require__castPath();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isIndex = require__isIndex();
  var isLength = require_isLength();
  var toKey = require__toKey();
  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);
    var index = -1, length = path.length, result = false;
    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
  }
  module.exports = hasPath;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/hasIn.js
var require_hasIn = __commonJS((exports, module) => {
  var baseHasIn = require__baseHasIn();
  var hasPath = require__hasPath();
  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }
  module.exports = hasIn;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseMatchesProperty.js
var require__baseMatchesProperty = __commonJS((exports, module) => {
  var baseIsEqual = require__baseIsEqual();
  var get = require_get();
  var hasIn = require_hasIn();
  var isKey = require__isKey();
  var isStrictComparable = require__isStrictComparable();
  var matchesStrictComparable = require__matchesStrictComparable();
  var toKey = require__toKey();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function(object) {
      var objValue = get(object, path);
      return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    };
  }
  module.exports = baseMatchesProperty;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/identity.js
var require_identity = __commonJS((exports, module) => {
  function identity(value) {
    return value;
  }
  module.exports = identity;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseProperty.js
var require__baseProperty = __commonJS((exports, module) => {
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }
  module.exports = baseProperty;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_basePropertyDeep.js
var require__basePropertyDeep = __commonJS((exports, module) => {
  var baseGet = require__baseGet();
  function basePropertyDeep(path) {
    return function(object) {
      return baseGet(object, path);
    };
  }
  module.exports = basePropertyDeep;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/property.js
var require_property = __commonJS((exports, module) => {
  var baseProperty = require__baseProperty();
  var basePropertyDeep = require__basePropertyDeep();
  var isKey = require__isKey();
  var toKey = require__toKey();
  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }
  module.exports = property;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseIteratee.js
var require__baseIteratee = __commonJS((exports, module) => {
  var baseMatches = require__baseMatches();
  var baseMatchesProperty = require__baseMatchesProperty();
  var identity = require_identity();
  var isArray = require_isArray();
  var property = require_property();
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == "object") {
      return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
    }
    return property(value);
  }
  module.exports = baseIteratee;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_createBaseFor.js
var require__createBaseFor = __commonJS((exports, module) => {
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  module.exports = createBaseFor;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseFor.js
var require__baseFor = __commonJS((exports, module) => {
  var createBaseFor = require__createBaseFor();
  var baseFor = createBaseFor();
  module.exports = baseFor;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseForOwn.js
var require__baseForOwn = __commonJS((exports, module) => {
  var baseFor = require__baseFor();
  var keys = require_keys();
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }
  module.exports = baseForOwn;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_createBaseEach.js
var require__createBaseEach = __commonJS((exports, module) => {
  var isArrayLike = require_isArrayLike();
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }
  module.exports = createBaseEach;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseEach.js
var require__baseEach = __commonJS((exports, module) => {
  var baseForOwn = require__baseForOwn();
  var createBaseEach = require__createBaseEach();
  var baseEach = createBaseEach(baseForOwn);
  module.exports = baseEach;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseMap.js
var require__baseMap = __commonJS((exports, module) => {
  var baseEach = require__baseEach();
  var isArrayLike = require_isArrayLike();
  function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function(value, key, collection2) {
      result[++index] = iteratee(value, key, collection2);
    });
    return result;
  }
  module.exports = baseMap;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseSortBy.js
var require__baseSortBy = __commonJS((exports, module) => {
  function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }
  module.exports = baseSortBy;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_compareAscending.js
var require__compareAscending = __commonJS((exports, module) => {
  var isSymbol = require_isSymbol();
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
      var othIsDefined = other !== undefined, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
      if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
        return 1;
      }
      if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }
  module.exports = compareAscending;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_compareMultiple.js
var require__compareMultiple = __commonJS((exports, module) => {
  var compareAscending = require__compareAscending();
  function compareMultiple(object, other, orders) {
    var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == "desc" ? -1 : 1);
      }
    }
    return object.index - other.index;
  }
  module.exports = compareMultiple;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/_baseOrderBy.js
var require__baseOrderBy = __commonJS((exports, module) => {
  var arrayMap = require__arrayMap();
  var baseGet = require__baseGet();
  var baseIteratee = require__baseIteratee();
  var baseMap = require__baseMap();
  var baseSortBy = require__baseSortBy();
  var baseUnary = require__baseUnary();
  var compareMultiple = require__compareMultiple();
  var identity = require_identity();
  var isArray = require_isArray();
  function baseOrderBy(collection, iteratees, orders) {
    if (iteratees.length) {
      iteratees = arrayMap(iteratees, function(iteratee) {
        if (isArray(iteratee)) {
          return function(value) {
            return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
          };
        }
        return iteratee;
      });
    } else {
      iteratees = [identity];
    }
    var index = -1;
    iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
    var result = baseMap(collection, function(value, key, collection2) {
      var criteria = arrayMap(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return { criteria, index: ++index, value };
    });
    return baseSortBy(result, function(object, other) {
      return compareMultiple(object, other, orders);
    });
  }
  module.exports = baseOrderBy;
});

// node_modules/.bun/lodash@4.17.21/node_modules/lodash/orderBy.js
var require_orderBy = __commonJS((exports, module) => {
  var baseOrderBy = require__baseOrderBy();
  var isArray = require_isArray();
  function orderBy(collection, iteratees, orders, guard) {
    if (collection == null) {
      return [];
    }
    if (!isArray(iteratees)) {
      iteratees = iteratees == null ? [] : [iteratees];
    }
    orders = guard ? undefined : orders;
    if (!isArray(orders)) {
      orders = orders == null ? [] : [orders];
    }
    return baseOrderBy(collection, iteratees, orders);
  }
  module.exports = orderBy;
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/native_utils.js
var require_native_utils = __commonJS((exports, module) => {
  function _intersect(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0)
      return [];
    if (arr1.length < 100 && arr2.length < 100) {
      return arr1.filter((item) => arr2.includes(item));
    }
    const set = new Set(arr2);
    return arr1.filter((item) => set.has(item));
  }
  function _intersectWith(arr1, arr2, comparator) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0)
      return [];
    return arr1.filter((a) => arr2.some((b) => comparator(a, b)));
  }
  function _difference(arr1, arr2) {
    if (!arr1)
      return [];
    if (!arr2 || arr2.length === 0)
      return arr1.slice();
    if (arr1.length < 100 && arr2.length < 100) {
      return arr1.filter((item) => !arr2.includes(item));
    }
    const set = new Set(arr2);
    return arr1.filter((item) => !set.has(item));
  }
  function _differenceWith(arr1, arr2, comparator) {
    if (!arr1)
      return [];
    if (!arr2 || arr2.length === 0)
      return arr1.slice();
    return arr1.filter((a) => !arr2.some((b) => comparator(a, b)));
  }
  function _uniq(arr) {
    if (!arr || arr.length === 0)
      return [];
    if (arr.length === 1)
      return arr.slice();
    return [...new Set(arr)];
  }
  function _uniqWith(arr, comparator) {
    if (!arr || arr.length === 0)
      return [];
    if (arr.length === 1)
      return arr.slice();
    const result = [];
    outer:
      for (let i = 0;i < arr.length; i++) {
        const current = arr[i];
        for (let j = 0;j < result.length; j++) {
          if (comparator(current, result[j])) {
            continue outer;
          }
        }
        result.push(current);
      }
    return result;
  }
  function _partialRight(func) {
    const boundArgs = Array.prototype.slice.call(arguments, 1);
    return function() {
      const args = Array.prototype.slice.call(arguments);
      return func.apply(this, args.concat(boundArgs));
    };
  }
  function _forEach(obj, callback) {
    if (!obj)
      return;
    if (Array.isArray(obj)) {
      for (let i = 0;i < obj.length; i++) {
        callback(obj[i], i);
      }
    } else {
      const keys = Object.keys(obj);
      for (let i = 0;i < keys.length; i++) {
        callback(obj[keys[i]], keys[i]);
      }
    }
  }
  module.exports = {
    _intersect,
    _intersectWith,
    _difference,
    _differenceWith,
    _uniq,
    _uniqWith,
    _partialRight,
    _forEach,
    _isArray: Array.isArray
  };
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/iLeven.js
var require_iLeven = __commonJS((exports, module) => {
  var collator;
  try {
    collator = typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined" ? Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (err) {
    if (typeof console !== undefined)
      console.warn("Collator could not be initialized and wouldn't be used");
  }
  module.exports = function leven(a, b, options) {
    var arr = [];
    var charCodeCache = [];
    var useCollator = options && collator && options.useCollator;
    var subcost = 1;
    if (options && options.subcost && typeof options.subcost === "number")
      subcost = options.subcost;
    if (a === b) {
      return 0;
    }
    var achars = Array.from(a);
    var bchars = Array.from(b);
    var aLen = achars.length;
    var bLen = bchars.length;
    if (aLen === 0) {
      return bLen;
    }
    if (bLen === 0) {
      return aLen;
    }
    var bCharCode;
    var ret;
    var tmp;
    var tmp2;
    var i = 0;
    var j = 0;
    while (i < aLen) {
      charCodeCache[i] = achars[i].codePointAt(0);
      arr[i] = ++i;
    }
    if (!useCollator) {
      while (j < bLen) {
        bCharCode = bchars[j].codePointAt(0);
        tmp = j++;
        ret = j;
        for (i = 0;i < aLen; i++) {
          tmp2 = bCharCode === charCodeCache[i] ? tmp : tmp + subcost;
          tmp = arr[i];
          ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
        }
      }
    } else {
      while (j < bLen) {
        bCharCode = bchars[j].codePointAt(0);
        tmp = j++;
        ret = j;
        for (i = 0;i < aLen; i++) {
          tmp2 = collator.compare(String.fromCodePoint(bCharCode), String.fromCodePoint(charCodeCache[i])) === 0 ? tmp : tmp + subcost;
          tmp = arr[i];
          ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
        }
      }
    }
    return ret;
  };
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/wildcardLeven.js
var require_wildcardLeven = __commonJS((exports, module) => {
  var collator;
  try {
    collator = typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined" ? Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (err) {
    if (typeof console !== undefined)
      console.warn("Collator could not be initialized and wouldn't be used");
  }
  module.exports = function leven(a, b, options, regLeven) {
    var arr = [];
    var charCodeCache = [];
    var useCollator = options && collator && options.useCollator;
    var subcost = 1;
    if (options && options.subcost && typeof options.subcost === "number")
      subcost = options.subcost;
    if (a === b) {
      return 0;
    }
    var aLen = a.length;
    var bLen = b.length;
    if (aLen === 0) {
      return bLen;
    }
    if (bLen === 0) {
      return aLen;
    }
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (options && options.wildcards && typeof options.wildcards === "string" && options.wildcards.length > 0) {
      var wildchar;
      var wildcode;
      if (options.full_process === false && options.processed !== true) {
        wildchar = options.wildcards[0];
        wildcode = wildchar.charCodeAt(0);
        var pattern = "[" + escapeRegExp(options.wildcards) + "]";
        a = a.replace(new RegExp(pattern, "g"), wildchar);
        b = b.replace(new RegExp(pattern, "g"), wildchar);
        if (a === b)
          return 0;
      } else {
        wildchar = options.wildcards[0].toLowerCase();
        wildcode = wildchar.charCodeAt(0);
      }
      var bCharCode;
      var ret;
      var tmp;
      var tmp2;
      var i = 0;
      var j = 0;
      while (i < aLen) {
        charCodeCache[i] = a.charCodeAt(i);
        arr[i] = ++i;
      }
      if (!useCollator) {
        while (j < bLen) {
          bCharCode = b.charCodeAt(j);
          tmp = j++;
          ret = j;
          for (i = 0;i < aLen; i++) {
            tmp2 = bCharCode === charCodeCache[i] || bCharCode === wildcode || charCodeCache[i] === wildcode ? tmp : tmp + subcost;
            tmp = arr[i];
            ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
          }
        }
      } else {
        while (j < bLen) {
          bCharCode = b.charCodeAt(j);
          tmp = j++;
          ret = j;
          for (i = 0;i < aLen; i++) {
            tmp2 = collator.compare(String.fromCharCode(bCharCode), String.fromCharCode(charCodeCache[i])) === 0 || bCharCode === wildcode || charCodeCache[i] === wildcode ? tmp : tmp + subcost;
            tmp = arr[i];
            ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
          }
        }
      }
      return ret;
    } else {
      return regLeven(a, b, options);
    }
  };
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/leven.js
var require_leven = __commonJS((exports, module) => {
  var collator;
  try {
    collator = typeof Intl !== "undefined" && typeof Intl.Collator !== "undefined" ? Intl.Collator("generic", { sensitivity: "base" }) : null;
  } catch (err) {
    if (typeof console !== undefined)
      console.warn("Collator could not be initialized and wouldn't be used");
  }
  module.exports = function leven(a, b, options) {
    var arr = [];
    var charCodeCache = [];
    var useCollator = options && collator && options.useCollator;
    var subcost = 1;
    if (options && options.subcost && typeof options.subcost === "number")
      subcost = options.subcost;
    if (a === b) {
      return 0;
    }
    var aLen = a.length;
    var bLen = b.length;
    if (aLen === 0) {
      return bLen;
    }
    if (bLen === 0) {
      return aLen;
    }
    var bCharCode;
    var ret;
    var tmp;
    var tmp2;
    var i = 0;
    var j = 0;
    while (i < aLen) {
      charCodeCache[i] = a.charCodeAt(i);
      arr[i] = ++i;
    }
    if (!useCollator) {
      while (j < bLen) {
        bCharCode = b.charCodeAt(j);
        tmp = j++;
        ret = j;
        for (i = 0;i < aLen; i++) {
          tmp2 = bCharCode === charCodeCache[i] ? tmp : tmp + subcost;
          tmp = arr[i];
          ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
        }
      }
    } else {
      while (j < bLen) {
        bCharCode = b.charCodeAt(j);
        tmp = j++;
        ret = j;
        for (i = 0;i < aLen; i++) {
          tmp2 = collator.compare(String.fromCharCode(bCharCode), String.fromCharCode(charCodeCache[i])) === 0 ? tmp : tmp + subcost;
          tmp = arr[i];
          ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
        }
      }
    }
    return ret;
  };
});

// node_modules/.bun/setimmediate@1.0.5/node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS((exports) => {
  (function(global2, undefined2) {
    if (global2.setImmediate) {
      return;
    }
    var nextHandle = 1;
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global2.document;
    var registerImmediate;
    function setImmediate2(callback) {
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      var args = new Array(arguments.length - 1);
      for (var i = 0;i < args.length; i++) {
        args[i] = arguments[i + 1];
      }
      var task = { callback, args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }
    function clearImmediate(handle) {
      delete tasksByHandle[handle];
    }
    function run(task) {
      var callback = task.callback;
      var args = task.args;
      switch (args.length) {
        case 0:
          callback();
          break;
        case 1:
          callback(args[0]);
          break;
        case 2:
          callback(args[0], args[1]);
          break;
        case 3:
          callback(args[0], args[1], args[2]);
          break;
        default:
          callback.apply(undefined2, args);
          break;
      }
    }
    function runIfPresent(handle) {
      if (currentlyRunningATask) {
        setTimeout(runIfPresent, 0, handle);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunningATask = true;
          try {
            run(task);
          } finally {
            clearImmediate(handle);
            currentlyRunningATask = false;
          }
        }
      }
    }
    function installNextTickImplementation() {
      registerImmediate = function(handle) {
        process.nextTick(function() {
          runIfPresent(handle);
        });
      };
    }
    function canUsePostMessage() {
      if (global2.postMessage && !global2.importScripts) {
        var postMessageIsAsynchronous = true;
        var oldOnMessage = global2.onmessage;
        global2.onmessage = function() {
          postMessageIsAsynchronous = false;
        };
        global2.postMessage("", "*");
        global2.onmessage = oldOnMessage;
        return postMessageIsAsynchronous;
      }
    }
    function installPostMessageImplementation() {
      var messagePrefix = "setImmediate$" + Math.random() + "$";
      var onGlobalMessage = function(event) {
        if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
          runIfPresent(+event.data.slice(messagePrefix.length));
        }
      };
      if (global2.addEventListener) {
        global2.addEventListener("message", onGlobalMessage, false);
      } else {
        global2.attachEvent("onmessage", onGlobalMessage);
      }
      registerImmediate = function(handle) {
        global2.postMessage(messagePrefix + handle, "*");
      };
    }
    function installMessageChannelImplementation() {
      var channel = new MessageChannel;
      channel.port1.onmessage = function(event) {
        var handle = event.data;
        runIfPresent(handle);
      };
      registerImmediate = function(handle) {
        channel.port2.postMessage(handle);
      };
    }
    function installReadyStateChangeImplementation() {
      var html = doc.documentElement;
      registerImmediate = function(handle) {
        var script = doc.createElement("script");
        script.onreadystatechange = function() {
          runIfPresent(handle);
          script.onreadystatechange = null;
          html.removeChild(script);
          script = null;
        };
        html.appendChild(script);
      };
    }
    function installSetTimeoutImplementation() {
      registerImmediate = function(handle) {
        setTimeout(runIfPresent, 0, handle);
      };
    }
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
    if ({}.toString.call(global2.process) === "[object process]") {
      installNextTickImplementation();
    } else if (canUsePostMessage()) {
      installPostMessageImplementation();
    } else if (global2.MessageChannel) {
      installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
      installReadyStateChangeImplementation();
    } else {
      installSetTimeoutImplementation();
    }
    attachTo.setImmediate = setImmediate2;
    attachTo.clearImmediate = clearImmediate;
  })(typeof self === "undefined" ? typeof global === "undefined" ? exports : global : self);
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/utils.js
var require_utils3 = __commonJS((exports, module) => {
  module.exports = function(_uniq, _uniqWith, _partialRight) {
    var module2 = {};
    var wildLeven = require_wildcardLeven();
    var leven = require_leven();
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function validate(str) {
      if ((typeof str === "string" || str instanceof String) && str.length > 0)
        return true;
      else
        return false;
    }
    module2.validate = validate;
    module2.process_and_sort = function process_and_sort(str) {
      if (!validate(str))
        return "";
      return str.match(/\S+/g).sort().join(" ").trim();
    };
    module2.tokenize = function unique_tokens(str, options) {
      if (options && options.wildcards && _uniqWith && _partialRight) {
        var partWild = _partialRight(wildLeven, options, leven);
        var wildCompare = function(a, b) {
          return partWild(a, b) === 0;
        };
        return _uniqWith(str.match(/\S+/g), wildCompare);
      } else
        return _uniq(str.match(/\S+/g));
    };
    const alphaNumUnicode = /[^\p{L}\p{N}]/gu;
    module2.full_process = function full_process(str, options) {
      if (!(str instanceof String) && typeof str !== "string")
        return "";
      var processedtext;
      if (options && typeof options === "object" && options.wildcards && typeof options.wildcards === "string" && options.wildcards.length > 0) {
        var wildcards = options.wildcards.toLowerCase();
        str = str.toLowerCase();
        if (options.force_ascii) {
          var pattern = "[^\x00 -|" + escapeRegExp(wildcards) + "]";
          str = str.replace(new RegExp(pattern, "g"), "");
          var wildpattern = "[" + escapeRegExp(wildcards) + "]";
          var wildchar = wildcards[0];
          str = str.replace(new RegExp(wildpattern, "g"), wildchar);
          var alphanumPat = "[^A-Za-z0-9" + escapeRegExp(wildcards) + "]";
          str = str.replace(new RegExp(alphanumPat, "g"), " ");
          str = str.replace(/_/g, " ");
          processedtext = str.trim();
        } else {
          var upattern = "[^\\p{L}\\p{N}|" + escapeRegExp(wildcards) + "]";
          str = str.replace(new RegExp(upattern, "gu"), " ");
          var wildpattern = "[" + escapeRegExp(wildcards) + "]";
          var wildchar = wildcards[0];
          str = str.replace(new RegExp(wildpattern, "g"), wildchar);
          processedtext = str.trim();
        }
      } else {
        if (options && (options.force_ascii || options === true)) {
          str = str.replace(/[^\x00-\x7F]/g, "");
          processedtext = str.replace(/\W|_/g, " ").toLowerCase().trim();
        } else {
          processedtext = str.replace(alphaNumUnicode, " ").toLowerCase().trim();
        }
      }
      if (options && options.collapseWhitespace) {
        processedtext = processedtext.replace(/\s+/g, " ");
      }
      return processedtext;
    };
    module2.clone_and_set_option_defaults = function(options) {
      if (options && options.isAClone)
        return options;
      var optclone = { isAClone: true };
      if (options) {
        var i, keys = Object.keys(options);
        for (i = 0;i < keys.length; i++) {
          optclone[keys[i]] = options[keys[i]];
        }
      }
      if (!(optclone.full_process === false))
        optclone.full_process = true;
      if (!(optclone.force_ascii === true))
        optclone.force_ascii = false;
      if (!(optclone.normalize === false) && optclone.astral === true) {
        optclone.normalize = true;
      }
      if (!(optclone.collapseWhitespace === false))
        optclone.collapseWhitespace = true;
      return optclone;
    };
    module2.isCustomFunc = function(func) {
      if (typeof func === "function" && (func.name === "token_set_ratio" || func.name === "partial_token_set_ratio" || func.name === "token_sort_ratio" || func.name === "partial_token_sort_ratio" || func.name === "QRatio" || func.name === "WRatio" || func.name === "distance" || func.name === "partial_ratio")) {
        return false;
      } else {
        return true;
      }
    };
    return module2;
  };
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/lib/process.js
var require_process = __commonJS((exports, module) => {
  module.exports = function(_clone_and_set_option_defaults, _isArray, QRatio, extract) {
    module = {};
    module.dedupe = function dedupe(contains_dupes, options_p) {
      var options = _clone_and_set_option_defaults(options_p);
      if (!(_isArray(contains_dupes) || typeof contains_dupes === "object")) {
        throw new Error("contains_dupes must be an array or object");
        return;
      }
      if (Object.keys(contains_dupes).length === 0) {
        if (typeof console !== undefined)
          console.warn("contains_dupes is empty");
        return [];
      }
      if (options.limit) {
        if (typeof console !== undefined)
          console.warn("options.limit will be ignored in dedupe");
        options.limit = 0;
      }
      if (!options.cutoff || typeof options.cutoff !== "number") {
        if (typeof console !== undefined)
          console.warn("Using default cutoff of 70");
        options.cutoff = 70;
      }
      if (!options.scorer) {
        options.scorer = QRatio;
        if (typeof console !== undefined)
          console.log("Using default scorer 'ratio' for dedupe");
      }
      var processor;
      if (options.processor && typeof options.processor === "function") {
        processor = options.processor;
      } else
        processor = function(x) {
          return x;
        };
      var uniqueItems = {};
      for (var i in contains_dupes) {
        var item = processor(contains_dupes[i]);
        if (typeof item !== "string" && item instanceof String === false) {
          throw new Error("Each processed item in dedupe must be a string.");
        }
        var matches = extract(item, contains_dupes, options);
        if (options.returnObjects) {
          if (matches.length === 1) {
            if (options.keepmap)
              uniqueItems[processor(matches[0].choice)] = { item: matches[0].choice, key: matches[0].key, matches };
            else
              uniqueItems[processor(matches[0].choice)] = { item: matches[0].choice, key: matches[0].key };
          } else {
            matches = matches.sort(function(a, b) {
              var pa = processor(a.choice);
              var pb = processor(b.choice);
              var aLen = pa.length;
              var bLen = pb.length;
              if (aLen === bLen) {
                if (pa < pb)
                  return -1;
                else
                  return 1;
              } else
                return bLen - aLen;
            });
            if (options.keepmap)
              uniqueItems[processor(matches[0].choice)] = { item: matches[0].choice, key: matches[0].key, matches };
            else
              uniqueItems[processor(matches[0].choice)] = { item: matches[0].choice, key: matches[0].key };
          }
        } else {
          if (matches.length === 1) {
            if (options.keepmap)
              uniqueItems[processor(matches[0][0])] = [matches[0][0], matches[0][2], matches];
            else
              uniqueItems[processor(matches[0][0])] = [matches[0][0], matches[0][2]];
          } else {
            matches = matches.sort(function(a, b) {
              var pa = processor(a[0]);
              var pb = processor(b[0]);
              var aLen = pa.length;
              var bLen = pb.length;
              if (aLen === bLen) {
                if (pa < pb)
                  return -1;
                else
                  return 1;
              } else
                return bLen - aLen;
            });
            if (options.keepmap)
              uniqueItems[processor(matches[0][0])] = [matches[0][0], matches[0][2], matches];
            else
              uniqueItems[processor(matches[0][0])] = [matches[0][0], matches[0][2]];
          }
        }
      }
      var uniqueVals = [];
      for (var u in uniqueItems) {
        uniqueVals.push(uniqueItems[u]);
      }
      return uniqueVals;
    };
    return module;
  };
});

// node_modules/.bun/fuzzball@2.2.3/node_modules/fuzzball/fuzzball.js
var require_fuzzball = __commonJS((exports, module) => {
  (function() {
    var SequenceMatcher = require_fbdifflib();
    var Heap = require_heap();
    var orderBy = require_orderBy();
    var nativeUtils = require_native_utils();
    var _intersect = nativeUtils._intersect;
    var _intersectWith = nativeUtils._intersectWith;
    var _difference = nativeUtils._difference;
    var _differenceWith = nativeUtils._differenceWith;
    var _uniq = nativeUtils._uniq;
    var _uniqWith = nativeUtils._uniqWith;
    var _partialRight = nativeUtils._partialRight;
    var _forEach = nativeUtils._forEach;
    var _isArray = nativeUtils._isArray;
    var iLeven = require_iLeven();
    var wildleven = require_wildcardLeven();
    var leven = require_leven();
    if (typeof setImmediate !== "function") {
      require_setImmediate();
    }
    var utils = require_utils3()(_uniq, _uniqWith, _partialRight);
    var validate = utils.validate;
    var process_and_sort = utils.process_and_sort;
    var tokenize = utils.tokenize;
    var full_process = utils.full_process;
    var clone_and_set_option_defaults = utils.clone_and_set_option_defaults;
    var isCustomFunc = utils.isCustomFunc;
    var processing = require_process()(clone_and_set_option_defaults, _isArray, QRatio, extract);
    var dedupe = processing.dedupe;
    function distance(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (typeof options.subcost === "undefined")
        options.subcost = 1;
      if (options.astral)
        return iLeven(str1, str2, options);
      else
        return wildleven(str1, str2, options, leven);
    }
    function QRatio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      return _ratio(str1, str2, options);
    }
    function partial_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      return _partial_ratio(str1, str2, options);
    }
    function token_set_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      return _token_set(str1, str2, options);
    }
    function partial_token_set_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      options.partial = true;
      return _token_set(str1, str2, options);
    }
    function token_sort_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      if (!options.proc_sorted) {
        str1 = process_and_sort(str1);
        str2 = process_and_sort(str2);
      }
      return _ratio(str1, str2, options);
    }
    function partial_token_sort_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      options.partial = true;
      if (!options.proc_sorted) {
        str1 = process_and_sort(str1);
        str2 = process_and_sort(str2);
      }
      return _partial_ratio(str1, str2, options);
    }
    function token_similarity_sort_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      return _token_similarity_sort_ratio(str1, str2, options);
    }
    function partial_token_similarity_sort_ratio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      options.partial = true;
      return _token_similarity_sort_ratio(str1, str2, options);
    }
    function WRatio(str1, str2, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      str1 = options.normalize ? str1.normalize() : str1;
      str2 = options.normalize ? str2.normalize() : str2;
      str1 = options.full_process ? full_process(str1, options) : str1;
      str2 = options.full_process ? full_process(str2, options) : str2;
      options.full_process = false;
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      var try_partial = true;
      var unbase_scale = 0.95;
      var partial_scale = 0.9;
      var base = _ratio(str1, str2, options);
      var len_ratio = Math.max(str1.length, str2.length) / Math.min(str1.length, str2.length);
      if (len_ratio < 1.5)
        try_partial = false;
      if (len_ratio > 8)
        partial_scale = 0.6;
      if (try_partial) {
        var partial = _partial_ratio(str1, str2, options) * partial_scale;
        var ptsor = partial_token_sort_ratio(str1, str2, options) * unbase_scale * partial_scale;
        var ptser = partial_token_set_ratio(str1, str2, options) * unbase_scale * partial_scale;
        return Math.round(Math.max(base, partial, ptsor, ptser));
      } else {
        var tsor = token_sort_ratio(str1, str2, options) * unbase_scale;
        var tser = token_set_ratio(str1, str2, options) * unbase_scale;
        return Math.round(Math.max(base, tsor, tser));
      }
    }
    function extract(query, choices, options_p) {
      var options = clone_and_set_option_defaults(options_p);
      var numchoices;
      if (_isArray(choices)) {
        numchoices = choices.length;
      } else if (!(choices instanceof Object)) {
        throw new Error("Invalid choices");
      } else
        numchoices = Object.keys(choices).length;
      if (!choices || numchoices === 0) {
        if (typeof console !== undefined)
          console.warn("No choices");
        return [];
      }
      if (options.processor && typeof options.processor !== "function") {
        throw new Error("Invalid Processor");
      }
      if (!options.processor)
        options.processor = function(x) {
          return x;
        };
      if (options.scorer && typeof options.scorer !== "function") {
        throw new Error("Invalid Scorer");
      }
      if (!options.scorer) {
        options.scorer = QRatio;
      }
      var isCustom = isCustomFunc(options.scorer);
      if (!options.cutoff || typeof options.cutoff !== "number") {
        options.cutoff = -1;
      }
      var pre_processor = function(choice, force_ascii) {
        return choice;
      };
      if (options.full_process) {
        pre_processor = full_process;
        if (!isCustom)
          options.processed = true;
      }
      var normalize = false;
      if (!isCustom) {
        if (options.astral && options.normalize) {
          options.normalize = false;
          if (String.prototype.normalize) {
            normalize = true;
            query = query.normalize();
          } else {
            if (typeof console !== undefined)
              console.warn("Normalization not supported in your environment");
          }
        }
        query = pre_processor(query, options);
        options.full_process = false;
        if (query.length === 0) {
          if (typeof console !== undefined)
            console.warn("Processed query is empty string");
        }
      }
      var results = [];
      var anyblank = false;
      var tsort = false;
      var tset = false;
      if (options.scorer.name === "token_sort_ratio" || options.scorer.name === "partial_token_sort_ratio") {
        var proc_sorted_query = process_and_sort(query);
        tsort = true;
      } else if (options.scorer.name === "token_set_ratio" || options.scorer.name === "partial_token_set_ratio") {
        var query_tokens = tokenize(query, options);
        tset = true;
      }
      var result, mychoice, cmpHeap, cmpSort;
      if (options.returnObjects) {
        cmpHeap = function(a, b) {
          return a.score - b.score;
        };
        cmpSort = function(a, b) {
          return b.score - a.score;
        };
      } else {
        cmpHeap = function(a, b) {
          return a[1] - b[1];
        };
        cmpSort = function(a, b) {
          return b[1] - a[1];
        };
      }
      _forEach(choices, function(value, key) {
        options.tokens = undefined;
        options.proc_sorted = false;
        if (tsort) {
          options.proc_sorted = true;
          if (value && value.proc_sorted)
            mychoice = value.proc_sorted;
          else {
            mychoice = pre_processor(normalize ? options.processor(value).normalize() : options.processor(value), options);
            mychoice = process_and_sort(mychoice);
          }
          result = options.scorer(proc_sorted_query, mychoice, options);
        } else if (tset) {
          mychoice = "x";
          if (value && value.tokens) {
            options.tokens = [query_tokens, value.tokens];
            if (options.trySimple)
              mychoice = pre_processor(options.processor(value), options);
          } else {
            mychoice = pre_processor(normalize ? options.processor(value).normalize() : options.processor(value), options);
            options.tokens = [query_tokens, tokenize(mychoice, options)];
          }
          result = options.scorer(query, mychoice, options);
        } else if (isCustom) {
          mychoice = options.processor(value);
          result = options.scorer(query, mychoice, options);
        } else {
          mychoice = pre_processor(normalize ? options.processor(value).normalize() : options.processor(value), options);
          if (typeof mychoice !== "string" || mychoice.length === 0)
            anyblank = true;
          result = options.scorer(query, mychoice, options);
        }
        if (result > options.cutoff) {
          if (options.returnObjects)
            results.push({ choice: value, score: result, key });
          else
            results.push([value, result, key]);
        }
      });
      if (anyblank) {
        if (typeof console !== undefined)
          console.log("One or more choices were empty. (post-processing if applied)");
      }
      if (options.limit && typeof options.limit === "number" && options.limit > 0 && options.limit < numchoices && !options.unsorted) {
        results = Heap.nlargest(results, options.limit, cmpHeap);
      } else if (!options.unsorted) {
        results = results.sort(cmpSort);
      }
      return results;
    }
    function extractAsync(query, choices, options_p, callback) {
      var options = clone_and_set_option_defaults(options_p);
      var abortController;
      if (typeof options_p.abortController === "object") {
        abortController = options_p.abortController;
      }
      var cancelToken;
      if (typeof options_p.cancelToken === "object") {
        cancelToken = options_p.cancelToken;
      }
      var loopOffset = 256;
      if (typeof options.asyncLoopOffset === "number") {
        if (options.asyncLoopOffset < 1)
          loopOffset = 1;
        else
          loopOffset = options.asyncLoopOffset;
      }
      var isArray = false;
      var numchoices;
      if (choices && choices.length && _isArray(choices)) {
        numchoices = choices.length;
        isArray = true;
      } else if (!(choices instanceof Object)) {
        callback(new Error("Invalid choices"));
        return;
      } else
        numchoices = Object.keys(choices).length;
      if (!choices || numchoices === 0) {
        if (typeof console !== undefined)
          console.warn("No choices");
        callback(null, []);
        return;
      }
      if (options.processor && typeof options.processor !== "function") {
        callback(new Error("Invalid Processor"));
        return;
      }
      if (!options.processor)
        options.processor = function(x) {
          return x;
        };
      if (options.scorer && typeof options.scorer !== "function") {
        callback(new Error("Invalid Scorer"));
        return;
      }
      if (!options.scorer) {
        options.scorer = QRatio;
      }
      var isCustom = isCustomFunc(options.scorer);
      if (!options.cutoff || typeof options.cutoff !== "number") {
        options.cutoff = -1;
      }
      var pre_processor = function(choice, force_ascii) {
        return choice;
      };
      if (options.full_process) {
        pre_processor = full_process;
        if (!isCustom)
          options.processed = true;
      }
      var normalize = false;
      if (!isCustom) {
        if (options.astral && options.normalize) {
          options.normalize = false;
          if (String.prototype.normalize) {
            normalize = true;
            query = query.normalize();
          } else {
            if (typeof console !== undefined)
              console.warn("Normalization not supported in your environment");
          }
        }
        query = pre_processor(query, options);
        options.full_process = false;
        if (query.length === 0) {
          if (typeof console !== undefined)
            console.warn("Processed query is empty string");
        }
      }
      var results = [];
      var anyblank = false;
      var tsort = false;
      var tset = false;
      if (options.scorer.name === "token_sort_ratio" || options.scorer.name === "partial_token_sort_ratio") {
        var proc_sorted_query = process_and_sort(query);
        tsort = true;
      } else if (options.scorer.name === "token_set_ratio" || options.scorer.name === "partial_token_set_ratio") {
        var query_tokens = tokenize(query, options);
        tset = true;
      }
      var idx, mychoice, result, cmpHeap, cmpSort;
      if (options.returnObjects) {
        cmpHeap = function(a, b) {
          return a.score - b.score;
        };
        cmpSort = function(a, b) {
          return b.score - a.score;
        };
      } else {
        cmpHeap = function(a, b) {
          return a[1] - b[1];
        };
        cmpSort = function(a, b) {
          return b[1] - a[1];
        };
      }
      var keys = Object.keys(choices);
      isArray ? searchLoop(0) : searchLoop(keys[0], 0);
      function searchLoop(c, i) {
        if (isArray || choices.hasOwnProperty(c)) {
          options.tokens = undefined;
          options.proc_sorted = false;
          if (tsort) {
            options.proc_sorted = true;
            if (choices[c] && choices[c].proc_sorted)
              mychoice = choices[c].proc_sorted;
            else {
              mychoice = pre_processor(normalize ? options.processor(choices[c]).normalize() : options.processor(choices[c]), options);
              mychoice = process_and_sort(mychoice);
            }
            result = options.scorer(proc_sorted_query, mychoice, options);
          } else if (tset) {
            mychoice = "x";
            if (choices[c] && choices[c].tokens) {
              options.tokens = [query_tokens, choices[c].tokens];
              if (options.trySimple)
                mychoice = pre_processor(options.processor(choices[c]), options);
            } else {
              mychoice = pre_processor(normalize ? options.processor(choices[c]).normalize() : options.processor(choices[c]), options);
              options.tokens = [query_tokens, tokenize(mychoice, options)];
            }
            result = options.scorer(query, mychoice, options);
          } else if (isCustom) {
            mychoice = options.processor(choices[c]);
            result = options.scorer(query, mychoice, options);
          } else {
            mychoice = pre_processor(normalize ? options.processor(choices[c]).normalize() : options.processor(choices[c]), options);
            if (typeof mychoice !== "string" || mychoice.length === 0)
              anyblank = true;
            result = options.scorer(query, mychoice, options);
          }
          if (isArray)
            idx = parseInt(c);
          else
            idx = c;
          if (result > options.cutoff) {
            if (options.returnObjects)
              results.push({ choice: choices[c], score: result, key: idx });
            else
              results.push([choices[c], result, idx]);
          }
        }
        if (abortController && abortController.signal.aborted === true) {
          callback(new Error("aborted"));
          return;
        }
        if (cancelToken && cancelToken.canceled === true) {
          callback(new Error("canceled"));
          return;
        }
        if (isArray && c < choices.length - 1) {
          if (c % loopOffset === 0) {
            setImmediate(function() {
              searchLoop(c + 1);
            });
          } else {
            searchLoop(c + 1);
          }
        } else if (i < keys.length - 1) {
          if (i % loopOffset === 0) {
            setImmediate(function() {
              searchLoop(keys[i + 1], i + 1);
            });
          } else {
            searchLoop(keys[i + 1], i + 1);
          }
        } else {
          if (anyblank) {
            if (typeof console !== undefined)
              console.log("One or more choices were empty. (post-processing if applied)");
          }
          if (options.limit && typeof options.limit === "number" && options.limit > 0 && options.limit < numchoices && !options.unsorted) {
            results = Heap.nlargest(results, options.limit, cmpHeap);
          } else if (!options.unsorted) {
            results = results.sort(cmpSort);
          }
          callback(null, results);
        }
      }
    }
    function _cosineSim(v1, v2, options) {
      var keysV1 = Object.keys(v1);
      var keysV2 = Object.keys(v2);
      var intersection = _intersect(keysV1, keysV2);
      var prods = intersection.map(function(x) {
        return v1[x] * v2[x];
      });
      var numerator = prods.reduce(function(acc, x) {
        return acc + x;
      }, 0);
      var v1Prods = keysV1.map(function(x) {
        return Math.pow(v1[x], 2);
      });
      var v1sum = v1Prods.reduce(function(acc, x) {
        return acc + x;
      }, 0);
      var v2Prods = keysV2.map(function(x) {
        return Math.pow(v2[x], 2);
      });
      var v2sum = v2Prods.reduce(function(acc, x) {
        return acc + x;
      }, 0);
      var denominator = Math.sqrt(v1sum) * Math.sqrt(v2sum);
      return numerator / denominator;
    }
    var WILDCARD_KEY = "%*SuperUniqueWildcardKey*%";
    function _getCharacterCounts(str, options) {
      var normalString = str;
      if (options.astral) {
        var charArray = Array.from(normalString);
      } else {
        var charArray = normalString.split("");
      }
      var charCounts = {};
      if (options.wildcards) {
        for (var i = 0;i < charArray.length; i++) {
          var char = charArray[i];
          if (options.wildcards.indexOf(char) > -1) {
            if (charCounts[WILDCARD_KEY]) {
              charCounts[WILDCARD_KEY] += 1;
            } else {
              charCounts[WILDCARD_KEY] = 1;
            }
          } else if (charCounts[char]) {
            charCounts[char] += 1;
          } else {
            charCounts[char] = 1;
          }
        }
      } else {
        for (var i = 0;i < charArray.length; i++) {
          var char = charArray[i];
          if (charCounts[char]) {
            charCounts[char] += 1;
          } else {
            charCounts[char] = 1;
          }
        }
      }
      return charCounts;
    }
    function _token_similarity_sort(sorted1, sorted2, options) {
      var oldSorted2 = sorted2;
      var charCounts1 = sorted1.reduce(function(acc, str) {
        acc[str] = _getCharacterCounts(str, options);
        return acc;
      }, {});
      var charCounts2 = oldSorted2.reduce(function(acc, str) {
        acc[str] = _getCharacterCounts(str, options);
        return acc;
      }, {});
      var newSorted2 = [];
      var i = 0;
      while (oldSorted2.length && i < sorted1.length) {
        var sim = orderBy(oldSorted2, function(x) {
          return _cosineSim(charCounts1[sorted1[i]], charCounts2[x]);
        }, "desc")[0];
        newSorted2.push(sim);
        i++;
        oldSorted2 = oldSorted2.filter(function(token) {
          return token !== sim;
        });
      }
      return newSorted2.concat(oldSorted2);
    }
    function _order_token_lists(str1, tokens1, str2, tokens2) {
      var first = tokens1;
      var second = tokens2;
      if (tokens1.length > tokens2.length) {
        first = tokens2;
        second = tokens1;
      } else if (tokens1.length === tokens2.length) {
        if (str1.length > str2.length) {
          first = tokens2;
          second = tokens1;
        } else {
          var sortedStrings = [str1, str2].sort();
          if (sortedStrings[0] === str2) {
            first = tokens2;
            second = tokens1;
          }
        }
      }
      return [first, second];
    }
    function _token_similarity_sort_ratio(str1, str2, options) {
      if (!options.tokens) {
        var tokens1 = tokenize(str1, options);
        var tokens2 = tokenize(str2, options);
      } else {
        var tokens1 = options.tokens[0];
        var tokens2 = options.tokens[1];
      }
      var sorted1 = tokens1.sort();
      var sorted2 = tokens2.sort();
      var orderedTokenLists = _order_token_lists(str1, sorted1, str2, sorted2);
      var first = orderedTokenLists[0];
      var second = orderedTokenLists[1];
      const newSecond = _token_similarity_sort(first, second, options);
      if (!options.partial) {
        return _ratio(first.join(" "), newSecond.join(" "), options);
      } else {
        return _partial_ratio(first.join(" "), newSecond.join(" "), options);
      }
    }
    function _token_set(str1, str2, options) {
      if (!options.tokens) {
        var tokens1 = tokenize(str1, options);
        var tokens2 = tokenize(str2, options);
      } else {
        var tokens1 = options.tokens[0];
        var tokens2 = options.tokens[1];
      }
      if (options.wildcards) {
        var partWild = _partialRight(wildleven, options, leven);
        var wildCompare = function(a, b) {
          return partWild(a, b) === 0;
        };
        var intersection = _intersectWith(tokens1, tokens2, wildCompare);
        var diff1to2 = _differenceWith(tokens1, tokens2, wildCompare);
        var diff2to1 = _differenceWith(tokens2, tokens1, wildCompare);
      } else {
        var intersection = _intersect(tokens1, tokens2);
        var diff1to2 = _difference(tokens1, tokens2);
        var diff2to1 = _difference(tokens2, tokens1);
      }
      var sorted_sect = intersection.sort().join(" ");
      var sorted_1to2List = diff1to2.sort();
      var sorted_2to1List = diff2to1.sort();
      if (options.sortBySimilarity) {
        var orderedTokenLists = _order_token_lists(str1, sorted_1to2List, str2, sorted_2to1List);
        var first = orderedTokenLists[0];
        var second = orderedTokenLists[1];
        var sorted_1to2 = first.join(" ");
        var sorted_2to1 = _token_similarity_sort(first, second, options).join(" ");
      } else {
        var sorted_1to2 = sorted_1to2List.join(" ");
        var sorted_2to1 = sorted_2to1List.join(" ");
      }
      var combined_1to2 = sorted_sect + " " + sorted_1to2;
      var combined_2to1 = sorted_sect + " " + sorted_2to1;
      sorted_sect = sorted_sect.trim();
      combined_1to2 = combined_1to2.trim();
      combined_2to1 = combined_2to1.trim();
      var ratio_func = _ratio;
      if (options.partial) {
        ratio_func = _partial_ratio;
        if (sorted_sect.length > 0)
          return 100;
      }
      var pairwise = [
        ratio_func(sorted_sect, combined_1to2, options),
        ratio_func(sorted_sect, combined_2to1, options),
        ratio_func(combined_1to2, combined_2to1, options)
      ];
      if (options.trySimple) {
        pairwise.push(ratio_func(str1, str2, options));
      }
      return Math.max.apply(null, pairwise);
    }
    function _ratio(str1, str2, options) {
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      if (options.ratio_alg && options.ratio_alg === "difflib") {
        var m = new SequenceMatcher(null, str1, str2, options.autojunk);
        var r = m.ratio();
        return Math.round(100 * r);
      }
      if (typeof options.subcost === "undefined")
        options.subcost = 2;
      var levdistance, lensum;
      if (options.astral) {
        levdistance = iLeven(str1, str2, options);
        lensum = Array.from(str1).length + Array.from(str2).length;
      } else {
        if (!options.wildcards) {
          levdistance = leven(str1, str2, options);
          lensum = str1.length + str2.length;
        } else {
          levdistance = wildleven(str1, str2, options, leven);
          lensum = str1.length + str2.length;
        }
      }
      return Math.round(100 * ((lensum - levdistance) / lensum));
    }
    function _partial_ratio(str1, str2, options) {
      if (!validate(str1))
        return 0;
      if (!validate(str2))
        return 0;
      if (str1.length <= str2.length) {
        var shorter = str1;
        var longer = str2;
      } else {
        var shorter = str2;
        var longer = str1;
      }
      var m = new SequenceMatcher(null, shorter, longer, options.autojunk);
      var blocks = m.getMatchingBlocks();
      var scores = [];
      for (var b = 0;b < blocks.length; b++) {
        var long_start = blocks[b][1] - blocks[b][0] > 0 ? blocks[b][1] - blocks[b][0] : 0;
        var long_end = long_start + shorter.length;
        var long_substr = longer.substring(long_start, long_end);
        var r = _ratio(shorter, long_substr, options);
        if (r > 99.5)
          return 100;
        else
          scores.push(r);
      }
      return Math.max.apply(null, scores);
    }
    if (!Object.keys) {
      Object.keys = function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"), dontEnums = [
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "constructor"
        ], dontEnumsLength = dontEnums.length;
        return function(obj) {
          if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
            throw new TypeError("Object.keys called on non-object");
          }
          var result = [], prop, i;
          for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
              result.push(prop);
            }
          }
          if (hasDontEnumBug) {
            for (i = 0;i < dontEnumsLength; i++) {
              if (hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
              }
            }
          }
          return result;
        };
      }();
    }
    var extractAsPromised = undefined;
    if (typeof Promise !== "undefined") {
      extractAsPromised = function(query, choices, options) {
        return new Promise(function(resolve, reject) {
          extractAsync(query, choices, options, function(err, response) {
            if (err)
              reject(err);
            else
              resolve(response);
          });
        });
      };
    }
    var fuzzball = {
      distance,
      ratio: QRatio,
      partial_ratio,
      token_set_ratio,
      token_sort_ratio,
      partial_token_set_ratio,
      partial_token_sort_ratio,
      token_similarity_sort_ratio,
      partial_token_similarity_sort_ratio,
      WRatio,
      full_process,
      extract,
      extractAsync,
      extractAsPromised,
      process_and_sort,
      unique_tokens: tokenize,
      dedupe
    };
    module.exports = fuzzball;
  })();
});

// node_modules/.bun/country-locale-map@1.9.11/node_modules/country-locale-map/countries-intl.json
var require_countries_intl = __commonJS((exports, module) => {
  module.exports = [{ name: "Afghanistan", alpha2: "AF", alpha3: "AFG", numeric: "004", locales: ["ps-AF", "fa-AF", "uz-Arab-AF"], default_locale: "ps-AF", currency: "AFN", latitude: "33.93911", longitude: "67.709953", currency_name: "Afghani", languages: ["ps", "uz", "tk"], capital: "Kabul", emoji: "🇦🇫", emojiU: "U+1F1E6 U+1F1EB", fips: "AF", internet: "AF", continent: "Asia", region: "South Asia" }, { name: "Albania", alpha2: "AL", alpha3: "ALB", numeric: "008", locales: ["sq-AL"], default_locale: "sq-AL", currency: "ALL", latitude: "41.153332", longitude: "20.168331", currency_name: "Lek", languages: ["sq"], capital: "Tirana", emoji: "🇦🇱", emojiU: "U+1F1E6 U+1F1F1", fips: "AL", internet: "AL", continent: "Europe", region: "South East Europe" }, { name: "Algeria", alpha2: "DZ", alpha3: "DZA", numeric: "012", locales: ["ar-DZ", "kab-DZ"], default_locale: "ar-DZ", currency: "DZD", latitude: "28.033886", longitude: "1.659626", currency_name: "Algerian Dinar", languages: ["ar"], capital: "Algiers", emoji: "🇩🇿", emojiU: "U+1F1E9 U+1F1FF", fips: "AG", internet: "DZ", continent: "Africa", region: "Northern Africa" }, { name: "American Samoa", alpha2: "AS", alpha3: "ASM", numeric: "016", locales: ["en-AS"], default_locale: "en-AS", currency: "USD", latitude: "-14.270972", longitude: "-170.132217", currency_name: "US Dollar", languages: ["en", "sm"], capital: "Pago Pago", emoji: "🇦🇸", emojiU: "U+1F1E6 U+1F1F8", fips: "AQ", internet: "AS", continent: "Oceania", region: "Pacific" }, { name: "Andorra", alpha2: "AD", alpha3: "AND", numeric: "020", locales: ["ca"], default_locale: "ca", currency: "EUR", latitude: "42.546245", longitude: "1.601554", currency_name: "Euro", languages: ["ca"], capital: "Andorra la Vella", emoji: "🇦🇩", emojiU: "U+1F1E6 U+1F1E9", fips: "AN", internet: "AD", continent: "Europe", region: "South West Europe" }, { name: "Angola", alpha2: "AO", alpha3: "AGO", numeric: "024", locales: ["pt"], default_locale: "pt", currency: "AOA", latitude: "-11.202692", longitude: "17.873887", currency_name: "Kwanza", languages: ["pt"], capital: "Luanda", emoji: "🇦🇴", emojiU: "U+1F1E6 U+1F1F4", fips: "AO", internet: "AO", continent: "Africa", region: "Southern Africa" }, { name: "Anguilla", alpha2: "AI", alpha3: "AIA", numeric: "660", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "18.220554", longitude: "-63.068615", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "The Valley", emoji: "🇦🇮", emojiU: "U+1F1E6 U+1F1EE", fips: "AV", internet: "AI", continent: "Americas", region: "West Indies" }, { name: "Antarctica", alpha2: "AQ", alpha3: "ATA", numeric: "010", locales: ["en-US"], default_locale: "en-US", currency: "USD", latitude: "-75.250973", longitude: "-0.071389", currency_name: "US Dollar", languages: [], capital: "", emoji: "🇦🇶", emojiU: "U+1F1E6 U+1F1F6", fips: "AY", internet: "AQ", continent: "Antarctica", region: "Antarctica" }, { name: "Antigua and Barbuda", alpha2: "AG", alpha3: "ATG", numeric: "028", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "17.060816", longitude: "-61.796428", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Saint John's", emoji: "🇦🇬", emojiU: "U+1F1E6 U+1F1EC", fips: "AC", internet: "AG", continent: "Americas", region: "West Indies" }, { name: "Argentina", alpha2: "AR", alpha3: "ARG", numeric: "032", locales: ["es-AR"], default_locale: "es-AR", currency: "ARS", latitude: "-38.416097", longitude: "-63.616672", currency_name: "Argentine Peso", languages: ["es", "gn"], capital: "Buenos Aires", emoji: "🇦🇷", emojiU: "U+1F1E6 U+1F1F7", fips: "AR", internet: "AR", continent: "Americas", region: "South America" }, { name: "Armenia", alpha2: "AM", alpha3: "ARM", numeric: "051", locales: ["hy-AM"], default_locale: "hy-AM", currency: "AMD", latitude: "40.069099", longitude: "45.038189", currency_name: "Armenian Dram", languages: ["hy", "ru"], capital: "Yerevan", emoji: "🇦🇲", emojiU: "U+1F1E6 U+1F1F2", fips: "AM", internet: "AM", continent: "Asia", region: "South West Asia" }, { name: "Aruba", alpha2: "AW", alpha3: "ABW", numeric: "533", locales: ["nl"], default_locale: "nl", currency: "AWG", latitude: "12.52111", longitude: "-69.968338", currency_name: "Aruban Florin", languages: ["nl", "pa"], capital: "Oranjestad", emoji: "🇦🇼", emojiU: "U+1F1E6 U+1F1FC", fips: "AA", internet: "AW", continent: "Americas", region: "West Indies" }, { name: "Australia", alpha2: "AU", alpha3: "AUS", numeric: "036", locales: ["en-AU"], default_locale: "en-AU", currency: "AUD", latitude: "-25.274398", longitude: "133.775136", currency_name: "Australian Dollar", languages: ["en"], capital: "Canberra", emoji: "🇦🇺", emojiU: "U+1F1E6 U+1F1FA", fips: "AS", internet: "AU", continent: "Oceania", region: "Pacific" }, { name: "Austria", alpha2: "AT", alpha3: "AUT", numeric: "040", locales: ["de-AT"], default_locale: "de-AT", currency: "EUR", latitude: "47.516231", longitude: "14.550072", currency_name: "Euro", languages: ["de"], capital: "Vienna", emoji: "🇦🇹", emojiU: "U+1F1E6 U+1F1F9", fips: "AU", internet: "AT", continent: "Europe", region: "Central Europe" }, { name: "Azerbaijan", alpha2: "AZ", alpha3: "AZE", numeric: "031", locales: ["az-Cyrl-AZ", "az-Latn-AZ"], default_locale: "az-Cyrl-AZ", currency: "AZN", latitude: "40.143105", longitude: "47.576927", currency_name: "Azerbaijan Manat", languages: ["az"], capital: "Baku", emoji: "🇦🇿", emojiU: "U+1F1E6 U+1F1FF", fips: "AJ", internet: "AZ", continent: "Asia", region: "South West Asia" }, { name: "Bahamas", alpha2: "BS", alpha3: "BHS", numeric: "044", locales: ["en"], default_locale: "en", currency: "BSD", latitude: "25.03428", longitude: "-77.39628", currency_name: "Bahamian Dollar", languages: ["en"], capital: "Nassau", emoji: "🇧🇸", emojiU: "U+1F1E7 U+1F1F8", fips: "BF", internet: "BS", continent: "Americas", region: "West Indies" }, { name: "Bahrain", alpha2: "BH", alpha3: "BHR", numeric: "048", locales: ["ar-BH"], default_locale: "ar-BH", currency: "BHD", latitude: "25.930414", longitude: "50.637772", currency_name: "Bahraini Dinar", languages: ["ar"], capital: "Manama", emoji: "🇧🇭", emojiU: "U+1F1E7 U+1F1ED", fips: "BA", internet: "BH", continent: "Asia", region: "South West Asia" }, { name: "Bangladesh", alpha2: "BD", alpha3: "BGD", numeric: "050", locales: ["bn-BD"], default_locale: "bn-BD", currency: "BDT", latitude: "23.684994", longitude: "90.356331", currency_name: "Taka", languages: ["bn"], capital: "Dhaka", emoji: "🇧🇩", emojiU: "U+1F1E7 U+1F1E9", fips: "BG", internet: "BD", continent: "Asia", region: "South Asia" }, { name: "Barbados", alpha2: "BB", alpha3: "BRB", numeric: "052", locales: ["en"], default_locale: "en", currency: "BBD", latitude: "13.193887", longitude: "-59.543198", currency_name: "Barbados Dollar", languages: ["en"], capital: "Bridgetown", emoji: "🇧🇧", emojiU: "U+1F1E7 U+1F1E7", fips: "BB", internet: "BB", continent: "Americas", region: "West Indies" }, { name: "Belarus", alpha2: "BY", alpha3: "BLR", numeric: "112", locales: ["be-BY"], default_locale: "be-BY", currency: "BYN", latitude: "53.709807", longitude: "27.953389", currency_name: "Belarusian Ruble", languages: ["be", "ru"], capital: "Minsk", emoji: "🇧🇾", emojiU: "U+1F1E7 U+1F1FE", fips: "BO", internet: "BY", continent: "Europe", region: "Eastern Europe" }, { name: "Belgium", alpha2: "BE", alpha3: "BEL", numeric: "056", locales: ["nl-BE", "en-BE", "fr-BE", "de-BE"], default_locale: "nl-BE", currency: "EUR", latitude: "50.503887", longitude: "4.469936", currency_name: "Euro", languages: ["nl", "fr", "de"], capital: "Brussels", emoji: "🇧🇪", emojiU: "U+1F1E7 U+1F1EA", fips: "BE", internet: "BE", continent: "Europe", region: "Western Europe" }, { name: "Belize", alpha2: "BZ", alpha3: "BLZ", numeric: "084", locales: ["en-BZ"], default_locale: "en-BZ", currency: "BZD", latitude: "17.189877", longitude: "-88.49765", currency_name: "Belize Dollar", languages: ["en", "es"], capital: "Belmopan", emoji: "🇧🇿", emojiU: "U+1F1E7 U+1F1FF", fips: "BH", internet: "BZ", continent: "Americas", region: "Central America" }, { name: "Benin", alpha2: "BJ", alpha3: "BEN", numeric: "204", locales: ["fr-BJ"], default_locale: "fr-BJ", currency: "XOF", latitude: "9.30769", longitude: "2.315834", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Porto-Novo", emoji: "🇧🇯", emojiU: "U+1F1E7 U+1F1EF", fips: "BN", internet: "BJ", continent: "Africa", region: "Western Africa" }, { name: "Bermuda", alpha2: "BM", alpha3: "BMU", numeric: "060", locales: ["en"], default_locale: "en", currency: "BMD", latitude: "32.321384", longitude: "-64.75737", currency_name: "Bermudian Dollar", languages: ["en"], capital: "Hamilton", emoji: "🇧🇲", emojiU: "U+1F1E7 U+1F1F2", fips: "BD", internet: "BM", continent: "Americas", region: "West Indies" }, { name: "Bhutan", alpha2: "BT", alpha3: "BTN", numeric: "064", locales: ["dz"], default_locale: "dz", currency: "BTN", latitude: "27.514162", longitude: "90.433601", currency_name: "Ngultrum", languages: ["dz"], capital: "Thimphu", emoji: "🇧🇹", emojiU: "U+1F1E7 U+1F1F9", fips: "BT", internet: "BT", continent: "Asia", region: "South Asia" }, { name: "Bolivia", alpha2: "BO", alpha3: "BOL", numeric: "068", locales: ["es-BO"], default_locale: "es-BO", currency: "BOB", latitude: "-16.290154", longitude: "-63.588653", currency_name: "Bolivia", languages: ["es", "ay", "qu"], capital: "Sucre", emoji: "🇧🇴", emojiU: "U+1F1E7 U+1F1F4", fips: "BL", internet: "BO", continent: "Americas", region: "South America", alternate_names: ["Plurinational State of Bolivia"] }, { name: "Bonaire", alpha2: "BQ", alpha3: "BES", numeric: "535", locales: ["nl"], default_locale: "nl", currency: "USD", currency_name: "US Dollar", languages: ["nl"], capital: "Kralendijk", emoji: "🇧🇶", emojiU: "U+1F1E7 U+1F1F6", fips: "BQ", internet: "BQ", continent: "Americas", region: "West Indies", alternate_names: ["Bonaire, Sint Eustatius and Saba"] }, { name: "Bosnia and Herzegovina", alpha2: "BA", alpha3: "BIH", numeric: "070", locales: ["bs-BA", "sr-Cyrl-BA", "sr-Latn-BA"], default_locale: "bs-BA", currency: "BAM", latitude: "43.915886", longitude: "17.679076", currency_name: "Convertible Mark", languages: ["bs", "hr", "sr"], capital: "Sarajevo", emoji: "🇧🇦", emojiU: "U+1F1E7 U+1F1E6", fips: "BK", internet: "BA", continent: "Europe", region: "South East Europe" }, { name: "Botswana", alpha2: "BW", alpha3: "BWA", numeric: "072", locales: ["en-BW"], default_locale: "en-BW", currency: "BWP", latitude: "-22.328474", longitude: "24.684866", currency_name: "Pula", languages: ["en", "tn"], capital: "Gaborone", emoji: "🇧🇼", emojiU: "U+1F1E7 U+1F1FC", fips: "BC", internet: "BW", continent: "Africa", region: "Southern Africa" }, { name: "Bouvet Island", alpha2: "BV", alpha3: "BVT", numeric: "074", locales: ["no"], default_locale: "no", currency: "NOK", latitude: "-54.423199", longitude: "3.413194", currency_name: "Norwegian Krone", languages: ["no", "nb", "nn"], capital: "", emoji: "🇧🇻", emojiU: "U+1F1E7 U+1F1FB", fips: "BV", internet: "BV", continent: "Atlantic Ocean", region: "South Atlantic Ocean" }, { name: "Brazil", alpha2: "BR", alpha3: "BRA", numeric: "076", locales: ["pt-BR"], default_locale: "pt-BR", currency: "BRL", latitude: "-14.235004", longitude: "-51.92528", currency_name: "Brazilian Real", languages: ["pt"], capital: "Brasília", emoji: "🇧🇷", emojiU: "U+1F1E7 U+1F1F7", fips: "BR", internet: "BR", continent: "Americas", region: "South America" }, { name: "British Indian Ocean Territory", alpha2: "IO", alpha3: "IOT", numeric: "086", locales: ["en"], default_locale: "en", currency: "USD", latitude: "-6.343194", longitude: "71.876519", currency_name: "US Dollar", languages: ["en"], capital: "Diego Garcia", emoji: "🇮🇴", emojiU: "U+1F1EE U+1F1F4", fips: "IO", internet: "IO", continent: "Asia", region: "South Asia" }, { name: "Brunei Darussalam", alpha2: "BN", alpha3: "BRN", numeric: "096", locales: ["ms-BN"], default_locale: "ms-BN", currency: "BND", latitude: "4.535277", longitude: "114.727669", currency_name: "Brunei Dollar", languages: ["ms"], capital: "Bandar Seri Begawan", emoji: "🇧🇳", emojiU: "U+1F1E7 U+1F1F3", fips: "BX", internet: "BN", continent: "Asia", region: "South East Asia" }, { name: "Bulgaria", alpha2: "BG", alpha3: "BGR", numeric: "100", locales: ["bg-BG"], default_locale: "bg-BG", currency: "BGN", latitude: "42.733883", longitude: "25.48583", currency_name: "Bulgarian Lev", languages: ["bg"], capital: "Sofia", emoji: "🇧🇬", emojiU: "U+1F1E7 U+1F1EC", fips: "BU", internet: "BG", continent: "Europe", region: "South East Europe" }, { name: "Burkina Faso", alpha2: "BF", alpha3: "BFA", numeric: "854", locales: ["fr-BF"], default_locale: "fr-BF", currency: "XOF", latitude: "12.238333", longitude: "-1.561593", currency_name: "CFA Franc BCEAO", languages: ["fr", "ff"], capital: "Ouagadougou", emoji: "🇧🇫", emojiU: "U+1F1E7 U+1F1EB", fips: "UV", internet: "BF", continent: "Africa", region: "Western Africa" }, { name: "Burundi", alpha2: "BI", alpha3: "BDI", numeric: "108", locales: ["fr-BI"], default_locale: "fr-BI", currency: "BIF", latitude: "-3.373056", longitude: "29.918886", currency_name: "Burundi Franc", languages: ["fr", "rn"], capital: "Bujumbura", emoji: "🇧🇮", emojiU: "U+1F1E7 U+1F1EE", fips: "BY", internet: "BI", continent: "Africa", region: "Central Africa" }, { name: "Cabo Verde", alpha2: "CV", alpha3: "CPV", numeric: "132", locales: ["kea-CV"], default_locale: "kea-CV", currency: "CVE", latitude: "16.002082", longitude: "-24.013197", currency_name: "Cabo Verde Escudo", languages: ["pt"], capital: "Praia", emoji: "🇨🇻", emojiU: "U+1F1E8 U+1F1FB", fips: "CV", internet: "CV", continent: "Africa", region: "Western Africa" }, { name: "Cambodia", alpha2: "KH", alpha3: "KHM", numeric: "116", locales: ["km-KH"], default_locale: "km-KH", currency: "KHR", latitude: "12.565679", longitude: "104.990963", currency_name: "Riel", languages: ["km"], capital: "Phnom Penh", emoji: "🇰🇭", emojiU: "U+1F1F0 U+1F1ED", fips: "CB", internet: "KH", continent: "Asia", region: "South East Asia" }, { name: "Cameroon", alpha2: "CM", alpha3: "CMR", numeric: "120", locales: ["fr-CM"], default_locale: "fr-CM", currency: "XAF", latitude: "7.369722", longitude: "12.354722", currency_name: "CFA Franc BEAC", languages: ["en", "fr"], capital: "Yaoundé", emoji: "🇨🇲", emojiU: "U+1F1E8 U+1F1F2", fips: "CM", internet: "CM", continent: "Africa", region: "Western Africa" }, { name: "Canada", alpha2: "CA", alpha3: "CAN", numeric: "124", locales: ["en-CA", "fr-CA"], default_locale: "en-CA", currency: "CAD", latitude: "56.130366", longitude: "-106.346771", currency_name: "Canadian Dollar", languages: ["en", "fr"], capital: "Ottawa", emoji: "🇨🇦", emojiU: "U+1F1E8 U+1F1E6", fips: "CA", internet: "CA", continent: "Americas", region: "North America" }, { name: "Cayman Islands", alpha2: "KY", alpha3: "CYM", numeric: "136", locales: ["en"], default_locale: "en", currency: "KYD", latitude: "19.513469", longitude: "-80.566956", currency_name: "Cayman Islands Dollar", languages: ["en"], capital: "George Town", emoji: "🇰🇾", emojiU: "U+1F1F0 U+1F1FE", fips: "CJ", internet: "KY", continent: "Americas", region: "West Indies" }, { name: "Central African Republic", alpha2: "CF", alpha3: "CAF", numeric: "140", locales: ["fr-CF", "sg-CF"], default_locale: "fr-CF", currency: "XAF", latitude: "6.611111", longitude: "20.939444", currency_name: "CFA Franc BEAC", languages: ["fr", "sg"], capital: "Bangui", emoji: "🇨🇫", emojiU: "U+1F1E8 U+1F1EB", fips: "CT", internet: "CF", continent: "Africa", region: "Central Africa" }, { name: "Chad", alpha2: "TD", alpha3: "TCD", numeric: "148", locales: ["fr-TD"], default_locale: "fr-TD", currency: "XAF", latitude: "15.454166", longitude: "18.732207", currency_name: "CFA Franc BEAC", languages: ["fr", "ar"], capital: "N'Djamena", emoji: "🇹🇩", emojiU: "U+1F1F9 U+1F1E9", fips: "CD", internet: "TD", continent: "Africa", region: "Central Africa" }, { name: "Chile", alpha2: "CL", alpha3: "CHL", numeric: "152", locales: ["es-CL"], default_locale: "es-CL", currency: "CLP", latitude: "-35.675147", longitude: "-71.542969", currency_name: "Chilean Peso", languages: ["es"], capital: "Santiago", emoji: "🇨🇱", emojiU: "U+1F1E8 U+1F1F1", fips: "CI", internet: "CL", continent: "Americas", region: "South America" }, { name: "China", alpha2: "CN", alpha3: "CHN", numeric: "156", locales: ["zh-CN", "zh-Hans-CN", "ii-CN", "bo-CN"], default_locale: "zh-CN", currency: "CNY", latitude: "35.86166", longitude: "104.195397", currency_name: "Yuan Renminbi", languages: ["zh"], capital: "Beijing", emoji: "🇨🇳", emojiU: "U+1F1E8 U+1F1F3", fips: "CH", internet: "CN", continent: "Asia", region: "East Asia" }, { name: "Christmas Island", alpha2: "CX", alpha3: "CXR", numeric: "162", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-10.447525", longitude: "105.690449", currency_name: "Australian Dollar", languages: ["en"], capital: "Flying Fish Cove", emoji: "🇨🇽", emojiU: "U+1F1E8 U+1F1FD", fips: "KT", internet: "CX", continent: "Asia", region: "South East Asia" }, { name: "Cocos Islands", alpha2: "CC", alpha3: "CCK", numeric: "166", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-12.164165", longitude: "96.870956", currency_name: "Australian Dollar", languages: ["en"], capital: "West Island", emoji: "🇨🇨", emojiU: "U+1F1E8 U+1F1E8", fips: "CK", internet: "CC", continent: "Asia", region: "South East Asia", alternate_names: ["Cocos Keeling Islands"] }, { name: "Colombia", alpha2: "CO", alpha3: "COL", numeric: "170", locales: ["es-CO"], default_locale: "es-CO", currency: "COP", latitude: "4.570868", longitude: "-74.297333", currency_name: "Colombian Peso", languages: ["es"], capital: "Bogotá", emoji: "🇨🇴", emojiU: "U+1F1E8 U+1F1F4", fips: "CO", internet: "CO", continent: "Americas", region: "South America" }, { name: "Comoros", alpha2: "KM", alpha3: "COM", numeric: "174", locales: ["fr-KM"], default_locale: "fr-KM", currency: "KMF", latitude: "-11.875001", longitude: "43.872219", currency_name: "Comorian Franc ", languages: ["ar", "fr"], capital: "Moroni", emoji: "🇰🇲", emojiU: "U+1F1F0 U+1F1F2", fips: "CN", internet: "KM", continent: "Africa", region: "Indian Ocean" }, { name: "Democratic Republic of the Congo", alpha2: "CD", alpha3: "COD", numeric: "180", locales: ["fr-CD"], default_locale: "fr-CD", currency: "CDF", latitude: "-4.038333", longitude: "21.758664", currency_name: "Congolese Franc", languages: ["fr", "ln", "kg", "sw", "lu"], capital: "Kinshasa", emoji: "🇨🇩", emojiU: "U+1F1E8 U+1F1E9", fips: "CG", internet: "ZR", continent: "Africa", region: "Central Africa" }, { name: "Congo", alpha2: "CG", alpha3: "COG", numeric: "178", locales: ["fr-CG"], default_locale: "fr-CG", currency: "XAF", latitude: "-0.228021", longitude: "15.827659", currency_name: "CFA Franc BEAC", languages: ["fr", "ln"], capital: "Brazzaville", emoji: "🇨🇬", emojiU: "U+1F1E8 U+1F1EC", fips: "CF", internet: "CG", continent: "Africa", region: "Central Africa" }, { name: "Cook Islands", alpha2: "CK", alpha3: "COK", numeric: "184", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-21.236736", longitude: "-159.777671", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Avarua", emoji: "🇨🇰", emojiU: "U+1F1E8 U+1F1F0", fips: "CW", internet: "CK", continent: "Oceania", region: "Pacific" }, { name: "Costa Rica", alpha2: "CR", alpha3: "CRI", numeric: "188", locales: ["es-CR"], default_locale: "es-CR", currency: "CRC", latitude: "9.748917", longitude: "-83.753428", currency_name: "Costa Rican Colon", languages: ["es"], capital: "San José", emoji: "🇨🇷", emojiU: "U+1F1E8 U+1F1F7", fips: "CS", internet: "CR", continent: "Americas", region: "Central America" }, { name: "Croatia", alpha2: "HR", alpha3: "HRV", numeric: "191", locales: ["hr-HR"], default_locale: "hr-HR", currency: "EUR", latitude: "45.1", longitude: "15.2", currency_name: "Euro", languages: ["hr"], capital: "Zagreb", emoji: "🇭🇷", emojiU: "U+1F1ED U+1F1F7", fips: "HR", internet: "HR", continent: "Europe", region: "South East Europe" }, { name: "Cuba", alpha2: "CU", alpha3: "CUB", numeric: "192", locales: ["es"], default_locale: "es", currency: "CUC", latitude: "21.521757", longitude: "-77.781167", currency_name: "Peso Convertible", languages: ["es"], capital: "Havana", emoji: "🇨🇺", emojiU: "U+1F1E8 U+1F1FA", fips: "CU", internet: "CU", continent: "Americas", region: "West Indies" }, { name: "Curaçao", alpha2: "CW", alpha3: "CUW", numeric: "531", locales: ["nl"], default_locale: "nl", currency: "ANG", currency_name: "Netherlands Antillean Guilder", languages: ["nl", "pa", "en"], capital: "Willemstad", emoji: "🇨🇼", emojiU: "U+1F1E8 U+1F1FC", fips: "UC", internet: "CW", continent: "Americas", region: "West Indies" }, { name: "Cyprus", alpha2: "CY", alpha3: "CYP", numeric: "196", locales: ["el-CY"], default_locale: "el-CY", currency: "EUR", latitude: "35.126413", longitude: "33.429859", currency_name: "Euro", languages: ["el", "tr", "hy"], capital: "Nicosia", emoji: "🇨🇾", emojiU: "U+1F1E8 U+1F1FE", fips: "CY", internet: "CY", continent: "Asia", region: "South West Asia" }, { name: "Czechia", alpha2: "CZ", alpha3: "CZE", numeric: "203", locales: ["cs-CZ"], default_locale: "cs-CZ", currency: "CZK", latitude: "49.817492", longitude: "15.472962", currency_name: "Czech Koruna", languages: ["cs", "sk"], capital: "Prague", emoji: "🇨🇿", emojiU: "U+1F1E8 U+1F1FF", fips: "EZ", internet: "CZ", continent: "Europe", region: "Central Europe" }, { name: "Côte d'Ivoire", alpha2: "CI", alpha3: "CIV", numeric: "384", locales: ["fr-CI"], default_locale: "fr-CI", currency: "CZK", latitude: "7.539989", longitude: "-5.54708", currency_name: "Czech Koruna", languages: ["fr"], capital: "Yamoussoukro", emoji: "🇨🇮", emojiU: "U+1F1E8 U+1F1EE", fips: "IV", internet: "CI", continent: "Africa", region: "Western Africa" }, { name: "Denmark", alpha2: "DK", alpha3: "DNK", numeric: "208", locales: ["da-DK"], default_locale: "da-DK", currency: "DKK", latitude: "56.26392", longitude: "9.501785", currency_name: "Danish Krone", languages: ["da"], capital: "Copenhagen", emoji: "🇩🇰", emojiU: "U+1F1E9 U+1F1F0", fips: "DA", internet: "DK", continent: "Europe", region: "Northern Europe" }, { name: "Djibouti", alpha2: "DJ", alpha3: "DJI", numeric: "262", locales: ["fr-DJ", "so-DJ"], default_locale: "fr-DJ", currency: "DJF", latitude: "11.825138", longitude: "42.590275", currency_name: "Djibouti Franc", languages: ["fr", "ar"], capital: "Djibouti", emoji: "🇩🇯", emojiU: "U+1F1E9 U+1F1EF", fips: "DJ", internet: "DJ", continent: "Africa", region: "Eastern Africa" }, { name: "Dominica", alpha2: "DM", alpha3: "DMA", numeric: "212", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "15.414999", longitude: "-61.370976", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Roseau", emoji: "🇩🇲", emojiU: "U+1F1E9 U+1F1F2", fips: "DO", internet: "DM", continent: "Americas", region: "West Indies" }, { name: "Dominican Republic", alpha2: "DO", alpha3: "DOM", numeric: "214", locales: ["es-DO"], default_locale: "es-DO", currency: "DOP", latitude: "18.735693", longitude: "-70.162651", currency_name: "Dominican Peso", languages: ["es"], capital: "Santo Domingo", emoji: "🇩🇴", emojiU: "U+1F1E9 U+1F1F4", fips: "DR", internet: "DO", continent: "Americas", region: "West Indies" }, { name: "Ecuador", alpha2: "EC", alpha3: "ECU", numeric: "218", locales: ["es-EC"], default_locale: "es-EC", currency: "USD", latitude: "-1.831239", longitude: "-78.183406", currency_name: "US Dollar", languages: ["es"], capital: "Quito", emoji: "🇪🇨", emojiU: "U+1F1EA U+1F1E8", fips: "EC", internet: "EC", continent: "Americas", region: "South America" }, { name: "Egypt", alpha2: "EG", alpha3: "EGY", numeric: "818", locales: ["ar-EG"], default_locale: "ar-EG", currency: "EGP", latitude: "26.820553", longitude: "30.802498", currency_name: "Egyptian Pound", languages: ["ar"], capital: "Cairo", emoji: "🇪🇬", emojiU: "U+1F1EA U+1F1EC", fips: "EG", internet: "EG", continent: "Africa", region: "Northern Africa" }, { name: "El Salvador", alpha2: "SV", alpha3: "SLV", numeric: "222", locales: ["es-SV"], default_locale: "es-SV", currency: "USD", latitude: "13.794185", longitude: "-88.89653", currency_name: "US Dollar", languages: ["es"], capital: "San Salvador", emoji: "🇸🇻", emojiU: "U+1F1F8 U+1F1FB", fips: "ES", internet: "SV", continent: "Americas", region: "Central America" }, { name: "Equatorial Guinea", alpha2: "GQ", alpha3: "GNQ", numeric: "226", locales: ["fr-GQ", "es-GQ"], default_locale: "fr-GQ", currency: "XAF", latitude: "1.650801", longitude: "10.267895", currency_name: "CFA Franc BEAC", languages: ["es", "fr"], capital: "Malabo", emoji: "🇬🇶", emojiU: "U+1F1EC U+1F1F6", fips: "EK", internet: "GQ", continent: "Africa", region: "Western Africa" }, { name: "Eritrea", alpha2: "ER", alpha3: "ERI", numeric: "232", locales: ["ti-ER"], default_locale: "ti-ER", currency: "ERN", latitude: "15.179384", longitude: "39.782334", currency_name: "Nakfa", languages: ["ti", "ar", "en"], capital: "Asmara", emoji: "🇪🇷", emojiU: "U+1F1EA U+1F1F7", fips: "ER", internet: "ER", continent: "Africa", region: "Eastern Africa" }, { name: "Estonia", alpha2: "EE", alpha3: "EST", numeric: "233", locales: ["et-EE"], default_locale: "et-EE", currency: "EUR", latitude: "58.595272", longitude: "25.013607", currency_name: "Euro", languages: ["et"], capital: "Tallinn", emoji: "🇪🇪", emojiU: "U+1F1EA U+1F1EA", fips: "EN", internet: "EE", continent: "Europe", region: "Eastern Europe" }, { name: "Eswatini", alpha2: "SZ", alpha3: "SWZ", numeric: "748", locales: ["en"], default_locale: "en", currency: "EUR", latitude: "-26.522503", longitude: "31.465866", currency_name: "Euro", languages: ["en", "ss"], capital: "Lobamba", emoji: "🇸🇿", emojiU: "U+1F1F8 U+1F1FF", fips: "WZ", internet: "SZ", continent: "Africa", region: "Southern Africa" }, { name: "Ethiopia", alpha2: "ET", alpha3: "ETH", numeric: "231", locales: ["am-ET", "om-ET", "so-ET", "ti-ET"], default_locale: "am-ET", currency: "ETB", latitude: "9.145", longitude: "40.489673", currency_name: "Ethiopian Birr", languages: ["am"], capital: "Addis Ababa", emoji: "🇪🇹", emojiU: "U+1F1EA U+1F1F9", fips: "ET", internet: "ET", continent: "Africa", region: "Eastern Africa" }, { name: "Falkland Islands", alpha2: "FK", alpha3: "FLK", numeric: "238", locales: ["en"], default_locale: "en", currency: "DKK", latitude: "-51.796253", longitude: "-59.523613", currency_name: "Danish Krone", languages: ["en"], capital: "Stanley", emoji: "🇫🇰", emojiU: "U+1F1EB U+1F1F0", fips: "FA", internet: "FK", continent: "Americas", region: "South America", alternate_names: ["Malvinas Falkland Islands"] }, { name: "Faroe Islands", alpha2: "FO", alpha3: "FRO", numeric: "234", locales: ["fo-FO"], default_locale: "fo-FO", currency: "DKK", latitude: "61.892635", longitude: "-6.911806", currency_name: "Danish Krone", languages: ["fo"], capital: "Tórshavn", emoji: "🇫🇴", emojiU: "U+1F1EB U+1F1F4", fips: "FO", internet: "FO", continent: "Europe", region: "Northern Europe" }, { name: "Fiji", alpha2: "FJ", alpha3: "FJI", numeric: "242", locales: ["en"], default_locale: "en", currency: "FJD", latitude: "-16.578193", longitude: "179.414413", currency_name: "Fiji Dollar", languages: ["en", "fj", "hi", "ur"], capital: "Suva", emoji: "🇫🇯", emojiU: "U+1F1EB U+1F1EF", fips: "FJ", internet: "FJ", continent: "Oceania", region: "Pacific" }, { name: "Finland", alpha2: "FI", alpha3: "FIN", numeric: "246", locales: ["fi-FI", "sv-FI"], default_locale: "fi-FI", currency: "EUR", latitude: "61.92411", longitude: "25.748151", currency_name: "Euro", languages: ["fi", "sv"], capital: "Helsinki", emoji: "🇫🇮", emojiU: "U+1F1EB U+1F1EE", fips: "FI", internet: "FI", continent: "Europe", region: "Northern Europe" }, { name: "France", alpha2: "FR", alpha3: "FRA", numeric: "250", locales: ["fr-FR"], default_locale: "fr-FR", currency: "EUR", latitude: "46.227638", longitude: "2.213749", currency_name: "Euro", languages: ["fr"], capital: "Paris", emoji: "🇫🇷", emojiU: "U+1F1EB U+1F1F7", fips: "FR", internet: "FR", continent: "Europe", region: "Western Europe" }, { name: "French Guiana", alpha2: "GF", alpha3: "GUF", numeric: "254", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "3.933889", longitude: "-53.125782", currency_name: "Euro", languages: ["fr"], capital: "Cayenne", emoji: "🇬🇫", emojiU: "U+1F1EC U+1F1EB", fips: "FG", internet: "GF", continent: "Americas", region: "South America" }, { name: "French Polynesia", alpha2: "PF", alpha3: "PYF", numeric: "258", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-17.679742", longitude: "-149.406843", currency_name: "CFP Franc", languages: ["fr"], capital: "Papeetē", emoji: "🇵🇫", emojiU: "U+1F1F5 U+1F1EB", fips: "FP", internet: "PF", continent: "Oceania", region: "Pacific" }, { name: "French Southern Territories", alpha2: "TF", alpha3: "ATF", numeric: "260", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "-49.280366", longitude: "69.348557", currency_name: "Euro", languages: ["fr"], capital: "Port-aux-Français", emoji: "🇹🇫", emojiU: "U+1F1F9 U+1F1EB", fips: "FS", internet: "--", continent: "Indian Ocean", region: "Southern Indian Ocean" }, { name: "Gabon", alpha2: "GA", alpha3: "GAB", numeric: "266", locales: ["fr-GA"], default_locale: "fr-GA", currency: "XAF", latitude: "-0.803689", longitude: "11.609444", currency_name: "CFA Franc BEAC", languages: ["fr"], capital: "Libreville", emoji: "🇬🇦", emojiU: "U+1F1EC U+1F1E6", fips: "GB", internet: "GA", continent: "Africa", region: "Western Africa" }, { name: "Gambia", alpha2: "GM", alpha3: "GMB", numeric: "270", locales: ["en"], default_locale: "en", currency: "GMD", latitude: "13.443182", longitude: "-15.310139", currency_name: "Dalasi", languages: ["en"], capital: "Banjul", emoji: "🇬🇲", emojiU: "U+1F1EC U+1F1F2", fips: "GA", internet: "GM", continent: "Africa", region: "Western Africa" }, { name: "Georgia", alpha2: "GE", alpha3: "GEO", numeric: "268", locales: ["ka-GE"], default_locale: "ka-GE", currency: "GEL", latitude: "42.315407", longitude: "43.356892", currency_name: "Lari", languages: ["ka"], capital: "Tbilisi", emoji: "🇬🇪", emojiU: "U+1F1EC U+1F1EA", fips: "GG", internet: "GE", continent: "Asia", region: "South West Asia" }, { name: "Germany", alpha2: "DE", alpha3: "DEU", numeric: "276", locales: ["de-DE"], default_locale: "de-DE", currency: "EUR", latitude: "51.165691", longitude: "10.451526", currency_name: "Euro", languages: ["de"], capital: "Berlin", emoji: "🇩🇪", emojiU: "U+1F1E9 U+1F1EA", fips: "GM", internet: "DE", continent: "Europe", region: "Western Europe" }, { name: "Ghana", alpha2: "GH", alpha3: "GHA", numeric: "288", locales: ["ak-GH", "ee-GH", "ha-Latn-GH"], default_locale: "ak-GH", currency: "GHS", latitude: "7.946527", longitude: "-1.023194", currency_name: "Ghana Cedi", languages: ["en"], capital: "Accra", emoji: "🇬🇭", emojiU: "U+1F1EC U+1F1ED", fips: "GH", internet: "GH", continent: "Africa", region: "Western Africa" }, { name: "Gibraltar", alpha2: "GI", alpha3: "GIB", numeric: "292", locales: ["en"], default_locale: "en", currency: "GIP", latitude: "36.137741", longitude: "-5.345374", currency_name: "Gibraltar Pound", languages: ["en"], capital: "Gibraltar", emoji: "🇬🇮", emojiU: "U+1F1EC U+1F1EE", fips: "GI", internet: "GI", continent: "Europe", region: "South West Europe" }, { name: "Greece", alpha2: "GR", alpha3: "GRC", numeric: "300", locales: ["el-GR"], default_locale: "el-GR", currency: "EUR", latitude: "39.074208", longitude: "21.824312", currency_name: "Euro", languages: ["el"], capital: "Athens", emoji: "🇬🇷", emojiU: "U+1F1EC U+1F1F7", fips: "GR", internet: "GR", continent: "Europe", region: "South East Europe" }, { name: "Greenland", alpha2: "GL", alpha3: "GRL", numeric: "304", locales: ["kl-GL"], default_locale: "kl-GL", currency: "DKK", latitude: "71.706936", longitude: "-42.604303", currency_name: "Danish Krone", languages: ["kl"], capital: "Nuuk", emoji: "🇬🇱", emojiU: "U+1F1EC U+1F1F1", fips: "GL", internet: "GL", continent: "Americas", region: "North America" }, { name: "Grenada", alpha2: "GD", alpha3: "GRD", numeric: "308", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "12.262776", longitude: "-61.604171", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "St. George's", emoji: "🇬🇩", emojiU: "U+1F1EC U+1F1E9", fips: "GJ", internet: "GD", continent: "Americas", region: "West Indies" }, { name: "Guadeloupe", alpha2: "GP", alpha3: "GLP", numeric: "312", locales: ["fr-GP"], default_locale: "fr-GP", currency: "EUR", latitude: "16.995971", longitude: "-62.067641", currency_name: "Euro", languages: ["fr"], capital: "Basse-Terre", emoji: "🇬🇵", emojiU: "U+1F1EC U+1F1F5", fips: "GP", internet: "GP", continent: "Americas", region: "West Indies" }, { name: "Guam", alpha2: "GU", alpha3: "GUM", numeric: "316", locales: ["en-GU"], default_locale: "en-GU", currency: "USD", latitude: "13.444304", longitude: "144.793731", currency_name: "US Dollar", languages: ["en", "ch", "es"], capital: "Hagåtña", emoji: "🇬🇺", emojiU: "U+1F1EC U+1F1FA", fips: "GQ", internet: "GU", continent: "Oceania", region: "Pacific" }, { name: "Guatemala", alpha2: "GT", alpha3: "GTM", numeric: "320", locales: ["es-GT"], default_locale: "es-GT", currency: "GTQ", latitude: "15.783471", longitude: "-90.230759", currency_name: "Quetzal", languages: ["es"], capital: "Guatemala City", emoji: "🇬🇹", emojiU: "U+1F1EC U+1F1F9", fips: "GT", internet: "GT", continent: "Americas", region: "Central America" }, { name: "Guernsey", alpha2: "GG", alpha3: "GGY", numeric: "831", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "49.465691", longitude: "-2.585278", currency_name: "Pound Sterling", languages: ["en", "fr"], capital: "St. Peter Port", emoji: "🇬🇬", emojiU: "U+1F1EC U+1F1EC", fips: "GK", internet: "GG", continent: "Europe", region: "Western Europe" }, { name: "Guinea", alpha2: "GN", alpha3: "GIN", numeric: "324", locales: ["fr-GN"], default_locale: "fr-GN", currency: "GNF", latitude: "9.945587", longitude: "-9.696645", currency_name: "Guinean Franc", languages: ["fr", "ff"], capital: "Conakry", emoji: "🇬🇳", emojiU: "U+1F1EC U+1F1F3", fips: "GV", internet: "GN", continent: "Africa", region: "Western Africa" }, { name: "Guinea-Bissau", alpha2: "GW", alpha3: "GNB", numeric: "624", locales: ["pt-GW"], default_locale: "pt-GW", currency: "XOF", latitude: "11.803749", longitude: "-15.180413", currency_name: "CFA Franc BCEAO", languages: ["pt"], capital: "Bissau", emoji: "🇬🇼", emojiU: "U+1F1EC U+1F1FC", fips: "PU", internet: "GW", continent: "Africa", region: "Western Africa" }, { name: "Guyana", alpha2: "GY", alpha3: "GUY", numeric: "328", locales: ["en"], default_locale: "en", currency: "GYD", latitude: "4.860416", longitude: "-58.93018", currency_name: "Guyana Dollar", languages: ["en"], capital: "Georgetown", emoji: "🇬🇾", emojiU: "U+1F1EC U+1F1FE", fips: "GY", internet: "GY", continent: "Americas", region: "South America" }, { name: "Haiti", alpha2: "HT", alpha3: "HTI", numeric: "332", locales: ["fr"], default_locale: "fr", currency: "USD", latitude: "18.971187", longitude: "-72.285215", currency_name: "US Dollar", languages: ["fr", "ht"], capital: "Port-au-Prince", emoji: "🇭🇹", emojiU: "U+1F1ED U+1F1F9", fips: "HA", internet: "HT", continent: "Americas", region: "West Indies" }, { name: "Heard Island and McDonald Islands", alpha2: "HM", alpha3: "HMD", numeric: "334", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-53.08181", longitude: "73.504158", currency_name: "Australian Dollar", languages: ["en"], capital: "", emoji: "🇭🇲", emojiU: "U+1F1ED U+1F1F2", fips: "HM", internet: "HM", continent: "Indian Ocean", region: "Southern Indian Ocean" }, { name: "Holy See", alpha2: "VA", alpha3: "VAT", numeric: "336", locales: ["it"], default_locale: "it", currency: "EUR", latitude: "41.902916", longitude: "12.453389", currency_name: "Euro", languages: ["it", "la"], capital: "Vatican City", emoji: "🇻🇦", emojiU: "U+1F1FB U+1F1E6", fips: "VT", internet: "VA", continent: "Europe", region: "Southern Europe" }, { name: "Honduras", alpha2: "HN", alpha3: "HND", numeric: "340", locales: ["es-HN"], default_locale: "es-HN", currency: "HNL", latitude: "15.199999", longitude: "-86.241905", currency_name: "Lempira", languages: ["es"], capital: "Tegucigalpa", emoji: "🇭🇳", emojiU: "U+1F1ED U+1F1F3", fips: "HO", internet: "HN", continent: "Americas", region: "Central America" }, { name: "Hong Kong", alpha2: "HK", alpha3: "HKG", numeric: "344", locales: ["yue-Hant-HK", "zh-Hans-HK", "zh-Hant-HK", "en-HK"], default_locale: "en-HK", currency: "HKD", latitude: "22.396428", longitude: "114.109497", currency_name: "Hong Kong Dollar", languages: ["zh", "en"], capital: "City of Victoria", emoji: "🇭🇰", emojiU: "U+1F1ED U+1F1F0", fips: "HK", internet: "HK", continent: "Asia", region: "East Asia" }, { name: "Hungary", alpha2: "HU", alpha3: "HUN", numeric: "348", locales: ["hu-HU"], default_locale: "hu-HU", currency: "HUF", latitude: "47.162494", longitude: "19.503304", currency_name: "Forint", languages: ["hu"], capital: "Budapest", emoji: "🇭🇺", emojiU: "U+1F1ED U+1F1FA", fips: "HU", internet: "HU", continent: "Europe", region: "Central Europe" }, { name: "Iceland", alpha2: "IS", alpha3: "ISL", numeric: "352", locales: ["is-IS"], default_locale: "is-IS", currency: "ISK", latitude: "64.963051", longitude: "-19.020835", currency_name: "Iceland Krona", languages: ["is"], capital: "Reykjavik", emoji: "🇮🇸", emojiU: "U+1F1EE U+1F1F8", fips: "IC", internet: "IS", continent: "Europe", region: "Northern Europe" }, { name: "India", alpha2: "IN", alpha3: "IND", numeric: "356", locales: ["as-IN", "bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN", "kok-IN", "ml-IN", "mr-IN", "ne-IN", "or-IN", "pa-Guru-IN", "ta-IN", "te-IN", "bo-IN", "ur-IN"], default_locale: "hi-IN", currency: "INR", latitude: "20.593684", longitude: "78.96288", currency_name: "Indian Rupee", languages: ["hi", "en"], capital: "New Delhi", emoji: "🇮🇳", emojiU: "U+1F1EE U+1F1F3", fips: "IN", internet: "IN", continent: "Asia", region: "South Asia" }, { name: "Indonesia", alpha2: "ID", alpha3: "IDN", numeric: "360", locales: ["id-ID"], default_locale: "id-ID", currency: "IDR", latitude: "-0.789275", longitude: "113.921327", currency_name: "Rupiah", languages: ["id"], capital: "Jakarta", emoji: "🇮🇩", emojiU: "U+1F1EE U+1F1E9", fips: "ID", internet: "ID", continent: "Asia", region: "South East Asia" }, { name: "Iran", alpha2: "IR", alpha3: "IRN", numeric: "364", locales: ["fa-IR"], default_locale: "fa-IR", currency: "XDR", latitude: "32.427908", longitude: "53.688046", currency_name: "SDR (Special Drawing Right)", languages: ["fa"], capital: "Tehran", emoji: "🇮🇷", emojiU: "U+1F1EE U+1F1F7", fips: "IR", internet: "IR", continent: "Asia", region: "South West Asia", alternate_names: ["Islamic Republic of Iran"] }, { name: "Iraq", alpha2: "IQ", alpha3: "IRQ", numeric: "368", locales: ["ar-IQ"], default_locale: "ar-IQ", currency: "IQD", latitude: "33.223191", longitude: "43.679291", currency_name: "Iraqi Dinar", languages: ["ar", "ku"], capital: "Baghdad", emoji: "🇮🇶", emojiU: "U+1F1EE U+1F1F6", fips: "IZ", internet: "IQ", continent: "Asia", region: "South West Asia" }, { name: "Ireland", alpha2: "IE", alpha3: "IRL", numeric: "372", locales: ["en-IE", "ga-IE"], default_locale: "en-IE", currency: "EUR", latitude: "53.41291", longitude: "-8.24389", currency_name: "Euro", languages: ["ga", "en"], capital: "Dublin", emoji: "🇮🇪", emojiU: "U+1F1EE U+1F1EA", fips: "EI", internet: "IE", continent: "Europe", region: "Western Europe" }, { name: "Isle of Man", alpha2: "IM", alpha3: "IMN", numeric: "833", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "54.236107", longitude: "-4.548056", currency_name: "Pound Sterling", languages: ["en", "gv"], capital: "Douglas", emoji: "🇮🇲", emojiU: "U+1F1EE U+1F1F2", fips: "IM", internet: "IM", continent: "Europe", region: "Western Europe" }, { name: "Israel", alpha2: "IL", alpha3: "ISR", numeric: "376", locales: ["en-IL", "he-IL"], default_locale: "he-IL", currency: "ILS", latitude: "31.046051", longitude: "34.851612", currency_name: "New Israeli Sheqel", languages: ["he", "ar"], capital: "Jerusalem", emoji: "🇮🇱", emojiU: "U+1F1EE U+1F1F1", fips: "IS", internet: "IL", continent: "Asia", region: "South West Asia" }, { name: "Italy", alpha2: "IT", alpha3: "ITA", numeric: "380", locales: ["it-IT"], default_locale: "it-IT", currency: "EUR", latitude: "41.87194", longitude: "12.56738", currency_name: "Euro", languages: ["it"], capital: "Rome", emoji: "🇮🇹", emojiU: "U+1F1EE U+1F1F9", fips: "IT", internet: "IT", continent: "Europe", region: "Southern Europe" }, { name: "Jamaica", alpha2: "JM", alpha3: "JAM", numeric: "388", locales: ["en-JM"], default_locale: "en-JM", currency: "JMD", latitude: "18.109581", longitude: "-77.297508", currency_name: "Jamaican Dollar", languages: ["en"], capital: "Kingston", emoji: "🇯🇲", emojiU: "U+1F1EF U+1F1F2", fips: "JM", internet: "JM", continent: "Americas", region: "West Indies" }, { name: "Japan", alpha2: "JP", alpha3: "JPN", numeric: "392", locales: ["ja-JP"], default_locale: "ja-JP", currency: "JPY", latitude: "36.204824", longitude: "138.252924", currency_name: "Yen", languages: ["ja"], capital: "Tokyo", emoji: "🇯🇵", emojiU: "U+1F1EF U+1F1F5", fips: "JA", internet: "JP", continent: "Asia", region: "East Asia" }, { name: "Jersey", alpha2: "JE", alpha3: "JEY", numeric: "832", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "49.214439", longitude: "-2.13125", currency_name: "Pound Sterling", languages: ["en", "fr"], capital: "Saint Helier", emoji: "🇯🇪", emojiU: "U+1F1EF U+1F1EA", fips: "JE", internet: "JE", continent: "Europe", region: "Western Europe" }, { name: "Jordan", alpha2: "JO", alpha3: "JOR", numeric: "400", locales: ["ar-JO"], default_locale: "ar-JO", currency: "JOD", latitude: "30.585164", longitude: "36.238414", currency_name: "Jordanian Dinar", languages: ["ar"], capital: "Amman", emoji: "🇯🇴", emojiU: "U+1F1EF U+1F1F4", fips: "JO", internet: "JO", continent: "Asia", region: "South West Asia" }, { name: "Kazakhstan", alpha2: "KZ", alpha3: "KAZ", numeric: "398", locales: ["kk-Cyrl-KZ"], default_locale: "kk-Cyrl-KZ", currency: "KZT", latitude: "48.019573", longitude: "66.923684", currency_name: "Tenge", languages: ["kk", "ru"], capital: "Astana", emoji: "🇰🇿", emojiU: "U+1F1F0 U+1F1FF", fips: "KZ", internet: "KZ", continent: "Asia", region: "Central Asia" }, { name: "Kenya", alpha2: "KE", alpha3: "KEN", numeric: "404", locales: ["ebu-KE", "guz-KE", "kln-KE", "kam-KE", "ki-KE", "luo-KE", "luy-KE", "mas-KE", "mer-KE", "om-KE", "saq-KE", "so-KE", "sw-KE", "dav-KE", "teo-KE"], default_locale: "ebu-KE", currency: "KES", latitude: "-0.023559", longitude: "37.906193", currency_name: "Kenyan Shilling", languages: ["en", "sw"], capital: "Nairobi", emoji: "🇰🇪", emojiU: "U+1F1F0 U+1F1EA", fips: "KE", internet: "KE", continent: "Africa", region: "Eastern Africa" }, { name: "Kiribati", alpha2: "KI", alpha3: "KIR", numeric: "296", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-3.370417", longitude: "-168.734039", currency_name: "Australian Dollar", languages: ["en"], capital: "South Tarawa", emoji: "🇰🇮", emojiU: "U+1F1F0 U+1F1EE", fips: "KR", internet: "KI", continent: "Oceania", region: "Pacific" }, { name: "North Korea", alpha2: "KP", alpha3: "PRK", numeric: "408", locales: ["ko"], default_locale: "ko", currency: "KPW", latitude: "40.339852", longitude: "127.510093", currency_name: "North Korean Won", languages: ["ko"], capital: "Pyongyang", emoji: "🇰🇵", emojiU: "U+1F1F0 U+1F1F5", fips: "KN", internet: "KP", continent: "Asia", region: "East Asia", alternate_names: ["Democratic People's Republic of Korea"] }, { name: "South Korea", alpha2: "KR", alpha3: "KOR", numeric: "410", locales: ["ko-KR"], default_locale: "ko-KR", currency: "KRW", latitude: "35.907757", longitude: "127.766922", currency_name: "Won", languages: ["ko"], capital: "Seoul", emoji: "🇰🇷", emojiU: "U+1F1F0 U+1F1F7", fips: "KS", internet: "KR", continent: "Asia", region: "East Asia", alternate_names: ["Republic of Korea"] }, { name: "Kuwait", alpha2: "KW", alpha3: "KWT", numeric: "414", locales: ["ar-KW"], default_locale: "ar-KW", currency: "KWD", latitude: "29.31166", longitude: "47.481766", currency_name: "Kuwaiti Dinar", languages: ["ar"], capital: "Kuwait City", emoji: "🇰🇼", emojiU: "U+1F1F0 U+1F1FC", fips: "KU", internet: "KW", continent: "Asia", region: "South West Asia" }, { name: "Kyrgyzstan", alpha2: "KG", alpha3: "KGZ", numeric: "417", locales: ["ky"], default_locale: "ky", currency: "KGS", latitude: "41.20438", longitude: "74.766098", currency_name: "Som", languages: ["ky", "ru"], capital: "Bishkek", emoji: "🇰🇬", emojiU: "U+1F1F0 U+1F1EC", fips: "KG", internet: "KG", continent: "Asia", region: "Central Asia" }, { name: "Lao People's Democratic Republic", alpha2: "LA", alpha3: "LAO", numeric: "418", locales: ["lo"], default_locale: "lo", currency: "LAK", latitude: "19.85627", longitude: "102.495496", currency_name: "Lao Kip", languages: ["lo"], capital: "Vientiane", emoji: "🇱🇦", emojiU: "U+1F1F1 U+1F1E6", fips: "LA", internet: "LA", continent: "Asia", region: "South East Asia" }, { name: "Latvia", alpha2: "LV", alpha3: "LVA", numeric: "428", locales: ["lv-LV"], default_locale: "lv-LV", currency: "EUR", latitude: "56.879635", longitude: "24.603189", currency_name: "Euro", languages: ["lv"], capital: "Riga", emoji: "🇱🇻", emojiU: "U+1F1F1 U+1F1FB", fips: "LG", internet: "LV", continent: "Europe", region: "Eastern Europe" }, { name: "Lebanon", alpha2: "LB", alpha3: "LBN", numeric: "422", locales: ["ar-LB"], default_locale: "ar-LB", currency: "LBP", latitude: "33.854721", longitude: "35.862285", currency_name: "Lebanese Pound", languages: ["ar", "fr"], capital: "Beirut", emoji: "🇱🇧", emojiU: "U+1F1F1 U+1F1E7", fips: "LE", internet: "LB", continent: "Asia", region: "South West Asia" }, { name: "Lesotho", alpha2: "LS", alpha3: "LSO", numeric: "426", locales: ["en"], default_locale: "en", currency: "ZAR", latitude: "-29.609988", longitude: "28.233608", currency_name: "Rand", languages: ["en", "st"], capital: "Maseru", emoji: "🇱🇸", emojiU: "U+1F1F1 U+1F1F8", fips: "LT", internet: "LS", continent: "Africa", region: "Southern Africa" }, { name: "Liberia", alpha2: "LR", alpha3: "LBR", numeric: "430", locales: ["en"], default_locale: "en", currency: "LRD", latitude: "6.428055", longitude: "-9.429499", currency_name: "Liberian Dollar", languages: ["en"], capital: "Monrovia", emoji: "🇱🇷", emojiU: "U+1F1F1 U+1F1F7", fips: "LI", internet: "LR", continent: "Africa", region: "Western Africa" }, { name: "Libya", alpha2: "LY", alpha3: "LBY", numeric: "434", locales: ["ar-LY"], default_locale: "ar-LY", currency: "LYD", latitude: "26.3351", longitude: "17.228331", currency_name: "Libyan Dinar", languages: ["ar"], capital: "Tripoli", emoji: "🇱🇾", emojiU: "U+1F1F1 U+1F1FE", fips: "LY", internet: "LY", continent: "Africa", region: "Northern Africa" }, { name: "Liechtenstein", alpha2: "LI", alpha3: "LIE", numeric: "438", locales: ["de-LI"], default_locale: "de-LI", currency: "CHF", latitude: "47.166", longitude: "9.555373", currency_name: "Swiss Franc", languages: ["de"], capital: "Vaduz", emoji: "🇱🇮", emojiU: "U+1F1F1 U+1F1EE", fips: "LS", internet: "LI", continent: "Europe", region: "Central Europe" }, { name: "Lithuania", alpha2: "LT", alpha3: "LTU", numeric: "440", locales: ["lt-LT"], default_locale: "lt-LT", currency: "EUR", latitude: "55.169438", longitude: "23.881275", currency_name: "Euro", languages: ["lt"], capital: "Vilnius", emoji: "🇱🇹", emojiU: "U+1F1F1 U+1F1F9", fips: "LH", internet: "LT", continent: "Europe", region: "Eastern Europe" }, { name: "Luxembourg", alpha2: "LU", alpha3: "LUX", numeric: "442", locales: ["fr-LU", "de-LU"], default_locale: "fr-LU", currency: "EUR", latitude: "49.815273", longitude: "6.129583", currency_name: "Euro", languages: ["fr", "de", "lb"], capital: "Luxembourg", emoji: "🇱🇺", emojiU: "U+1F1F1 U+1F1FA", fips: "LU", internet: "LU", continent: "Europe", region: "Western Europe" }, { name: "Macao", alpha2: "MO", alpha3: "MAC", numeric: "446", locales: ["zh-Hans-MO", "zh-Hant-MO"], default_locale: "zh-Hans-MO", currency: "MOP", latitude: "22.198745", longitude: "113.543873", currency_name: "Pataca", languages: ["zh", "pt"], capital: "", emoji: "🇲🇴", emojiU: "U+1F1F2 U+1F1F4", fips: "MC", internet: "MO", continent: "Asia", region: "East Asia" }, { name: "Madagascar", alpha2: "MG", alpha3: "MDG", numeric: "450", locales: ["fr-MG", "mg-MG"], default_locale: "fr-MG", currency: "MGA", latitude: "-18.766947", longitude: "46.869107", currency_name: "Malagasy Ariary", languages: ["fr", "mg"], capital: "Antananarivo", emoji: "🇲🇬", emojiU: "U+1F1F2 U+1F1EC", fips: "MA", internet: "MG", continent: "Africa", region: "Indian Ocean" }, { name: "Malawi", alpha2: "MW", alpha3: "MWI", numeric: "454", locales: ["en"], default_locale: "en", currency: "MWK", latitude: "-13.254308", longitude: "34.301525", currency_name: "Malawi Kwacha", languages: ["en", "ny"], capital: "Lilongwe", emoji: "🇲🇼", emojiU: "U+1F1F2 U+1F1FC", fips: "MI", internet: "MW", continent: "Africa", region: "Southern Africa" }, { name: "Malaysia", alpha2: "MY", alpha3: "MYS", numeric: "458", locales: ["ms-MY"], default_locale: "ms-MY", currency: "MYR", latitude: "4.210484", longitude: "101.975766", currency_name: "Malaysian Ringgit", languages: ["ms"], capital: "Kuala Lumpur", emoji: "🇲🇾", emojiU: "U+1F1F2 U+1F1FE", fips: "MY", internet: "MY", continent: "Asia", region: "South East Asia" }, { name: "Maldives", alpha2: "MV", alpha3: "MDV", numeric: "462", locales: ["dv"], default_locale: "dv", currency: "MVR", latitude: "3.202778", longitude: "73.22068", currency_name: "Rufiyaa", languages: ["dv"], capital: "Malé", emoji: "🇲🇻", emojiU: "U+1F1F2 U+1F1FB", fips: "MV", internet: "MV", continent: "Asia", region: "South Asia" }, { name: "Mali", alpha2: "ML", alpha3: "MLI", numeric: "466", locales: ["bm-ML", "fr-ML", "khq-ML", "ses-ML"], default_locale: "fr-ML", currency: "XOF", latitude: "17.570692", longitude: "-3.996166", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Bamako", emoji: "🇲🇱", emojiU: "U+1F1F2 U+1F1F1", fips: "ML", internet: "ML", continent: "Africa", region: "Western Africa" }, { name: "Malta", alpha2: "MT", alpha3: "MLT", numeric: "470", locales: ["en-MT", "mt-MT"], default_locale: "en-MT", currency: "EUR", latitude: "35.937496", longitude: "14.375416", currency_name: "Euro", languages: ["mt", "en"], capital: "Valletta", emoji: "🇲🇹", emojiU: "U+1F1F2 U+1F1F9", fips: "MT", internet: "MT", continent: "Europe", region: "Southern Europe" }, { name: "Marshall Islands", alpha2: "MH", alpha3: "MHL", numeric: "584", locales: ["en-MH"], default_locale: "en-MH", currency: "USD", latitude: "7.131474", longitude: "171.184478", currency_name: "US Dollar", languages: ["en", "mh"], capital: "Majuro", emoji: "🇲🇭", emojiU: "U+1F1F2 U+1F1ED", fips: "RM", internet: "MH", continent: "Oceania", region: "Pacific" }, { name: "Martinique", alpha2: "MQ", alpha3: "MTQ", numeric: "474", locales: ["fr-MQ"], default_locale: "fr-MQ", currency: "EUR", latitude: "14.641528", longitude: "-61.024174", currency_name: "Euro", languages: ["fr"], capital: "Fort-de-France", emoji: "🇲🇶", emojiU: "U+1F1F2 U+1F1F6", fips: "MB", internet: "MQ", continent: "Americas", region: "West Indies" }, { name: "Mauritania", alpha2: "MR", alpha3: "MRT", numeric: "478", locales: ["ar"], default_locale: "ar", currency: "MRU", latitude: "21.00789", longitude: "-10.940835", currency_name: "Ouguiya", languages: ["ar"], capital: "Nouakchott", emoji: "🇲🇷", emojiU: "U+1F1F2 U+1F1F7", fips: "MR", internet: "MR", continent: "Africa", region: "Western Africa" }, { name: "Mauritius", alpha2: "MU", alpha3: "MUS", numeric: "480", locales: ["en-MU", "mfe-MU"], default_locale: "en-MU", currency: "MUR", latitude: "-20.348404", longitude: "57.552152", currency_name: "Mauritius Rupee", languages: ["en"], capital: "Port Louis", emoji: "🇲🇺", emojiU: "U+1F1F2 U+1F1FA", fips: "MP", internet: "MU", continent: "Africa", region: "Indian Ocean" }, { name: "Mayotte", alpha2: "YT", alpha3: "MYT", numeric: "175", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "-12.8275", longitude: "45.166244", currency_name: "Euro", languages: ["fr"], capital: "Mamoudzou", emoji: "🇾🇹", emojiU: "U+1F1FE U+1F1F9", fips: "MF", internet: "YT", continent: "Africa", region: "Indian Ocean" }, { name: "Mexico", alpha2: "MX", alpha3: "MEX", numeric: "484", locales: ["es-MX"], default_locale: "es-MX", currency: "MXN", latitude: "23.634501", longitude: "-102.552784", currency_name: "Mexican Peso", languages: ["es"], capital: "Mexico City", emoji: "🇲🇽", emojiU: "U+1F1F2 U+1F1FD", fips: "MX", internet: "MX", continent: "Americas", region: "Central America" }, { name: "Micronesia", alpha2: "FM", alpha3: "FSM", numeric: "583", locales: ["en"], default_locale: "en", currency: "RUB", latitude: "7.425554", longitude: "150.550812", currency_name: "Russian Ruble", languages: ["en"], capital: "Palikir", emoji: "🇫🇲", emojiU: "U+1F1EB U+1F1F2", fips: "", internet: "FM", continent: "Oceania", region: "Pacific", alternate_names: ["Federated States of Micronesia"] }, { name: "Moldova", alpha2: "MD", alpha3: "MDA", numeric: "498", locales: ["ro-MD", "ru-MD"], default_locale: "ro-MD", currency: "MDL", latitude: "47.411631", longitude: "28.369885", currency_name: "Moldovan Leu", languages: ["ro"], capital: "Chișinău", emoji: "🇲🇩", emojiU: "U+1F1F2 U+1F1E9", fips: "MD", internet: "MD", continent: "Europe", region: "Eastern Europe", alternate_names: ["Republic of Moldova"] }, { name: "Monaco", alpha2: "MC", alpha3: "MCO", numeric: "492", locales: ["fr-MC"], default_locale: "fr-MC", currency: "EUR", latitude: "43.750298", longitude: "7.412841", currency_name: "Euro", languages: ["fr"], capital: "Monaco", emoji: "🇲🇨", emojiU: "U+1F1F2 U+1F1E8", fips: "MN", internet: "MC", continent: "Europe", region: "Western Europe" }, { name: "Mongolia", alpha2: "MN", alpha3: "MNG", numeric: "496", locales: ["mn"], default_locale: "mn", currency: "MNT", latitude: "46.862496", longitude: "103.846656", currency_name: "Tugrik", languages: ["mn"], capital: "Ulan Bator", emoji: "🇲🇳", emojiU: "U+1F1F2 U+1F1F3", fips: "MG", internet: "MN", continent: "Asia", region: "Northern Asia" }, { name: "Montenegro", alpha2: "ME", alpha3: "MNE", numeric: "499", locales: ["sr-Cyrl-ME", "sr-Latn-ME"], default_locale: "sr-Cyrl-ME", currency: "EUR", latitude: "42.708678", longitude: "19.37439", currency_name: "Euro", languages: ["sr", "bs", "sq", "hr"], capital: "Podgorica", emoji: "🇲🇪", emojiU: "U+1F1F2 U+1F1EA", fips: "MJ", internet: "ME", continent: "Europe", region: "South East Europe" }, { name: "Montserrat", alpha2: "MS", alpha3: "MSR", numeric: "500", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "16.742498", longitude: "-62.187366", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Plymouth", emoji: "🇲🇸", emojiU: "U+1F1F2 U+1F1F8", fips: "MH", internet: "MS", continent: "Americas", region: "West Indies" }, { name: "Morocco", alpha2: "MA", alpha3: "MAR", numeric: "504", locales: ["ar-MA", "tzm-Latn-MA", "shi-Latn-MA", "shi-Tfng-MA"], default_locale: "ar-MA", currency: "MAD", latitude: "31.791702", longitude: "-7.09262", currency_name: "Moroccan Dirham", languages: ["ar"], capital: "Rabat", emoji: "🇲🇦", emojiU: "U+1F1F2 U+1F1E6", fips: "MO", internet: "MA", continent: "Africa", region: "Northern Africa" }, { name: "Mozambique", alpha2: "MZ", alpha3: "MOZ", numeric: "508", locales: ["pt-MZ", "seh-MZ"], default_locale: "pt-MZ", currency: "MZN", latitude: "-18.665695", longitude: "35.529562", currency_name: "Mozambique Metical", languages: ["pt"], capital: "Maputo", emoji: "🇲🇿", emojiU: "U+1F1F2 U+1F1FF", fips: "MZ", internet: "MZ", continent: "Africa", region: "Southern Africa" }, { name: "Myanmar", alpha2: "MM", alpha3: "MMR", numeric: "104", locales: ["my-MM"], default_locale: "my-MM", currency: "MMK", latitude: "21.913965", longitude: "95.956223", currency_name: "Kyat", languages: ["my"], capital: "Naypyidaw", emoji: "🇲🇲", emojiU: "U+1F1F2 U+1F1F2", fips: "BM", internet: "MM", continent: "Asia", region: "South East Asia" }, { name: "Namibia", alpha2: "NA", alpha3: "NAM", numeric: "516", locales: ["af-NA", "en-NA", "naq-NA"], default_locale: "en-NA", currency: "ZAR", latitude: "-22.95764", longitude: "18.49041", currency_name: "Rand", languages: ["en", "af"], capital: "Windhoek", emoji: "🇳🇦", emojiU: "U+1F1F3 U+1F1E6", fips: "WA", internet: "NA", continent: "Africa", region: "Southern Africa" }, { name: "Nauru", alpha2: "NR", alpha3: "NRU", numeric: "520", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-0.522778", longitude: "166.931503", currency_name: "Australian Dollar", languages: ["en", "na"], capital: "Yaren", emoji: "🇳🇷", emojiU: "U+1F1F3 U+1F1F7", fips: "NR", internet: "NR", continent: "Oceania", region: "Pacific" }, { name: "Nepal", alpha2: "NP", alpha3: "NPL", numeric: "524", locales: ["ne-NP"], default_locale: "ne-NP", currency: "NPR", latitude: "28.394857", longitude: "84.124008", currency_name: "Nepalese Rupee", languages: ["ne"], capital: "Kathmandu", emoji: "🇳🇵", emojiU: "U+1F1F3 U+1F1F5", fips: "NP", internet: "NP", continent: "Asia", region: "South Asia" }, { name: "Netherlands", alpha2: "NL", alpha3: "NLD", numeric: "528", locales: ["nl-NL"], default_locale: "nl-NL", currency: "EUR", latitude: "52.132633", longitude: "5.291266", currency_name: "Euro", languages: ["nl"], capital: "Amsterdam", emoji: "🇳🇱", emojiU: "U+1F1F3 U+1F1F1", fips: "NL", internet: "NL", continent: "Europe", region: "Western Europe" }, { name: "Netherlands Antilles", alpha2: "AN", alpha3: "ANT", numeric: "530", locales: ["nl-AN"], default_locale: "nl-AN", currency: "ANG", latitude: "12.226079", longitude: "-69.060087", currency_name: "Netherlands Antillean Guilder", fips: "NT", internet: "AN", continent: "Americas", region: "West Indies" }, { name: "New Caledonia", alpha2: "NC", alpha3: "NCL", numeric: "540", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-20.904305", longitude: "165.618042", currency_name: "CFP Franc", languages: ["fr"], capital: "Nouméa", emoji: "🇳🇨", emojiU: "U+1F1F3 U+1F1E8", fips: "NC", internet: "NC", continent: "Oceania", region: "Pacific" }, { name: "New Zealand", alpha2: "NZ", alpha3: "NZL", numeric: "554", locales: ["en-NZ"], default_locale: "en-NZ", currency: "NZD", latitude: "-40.900557", longitude: "174.885971", currency_name: "New Zealand Dollar", languages: ["en", "mi"], capital: "Wellington", emoji: "🇳🇿", emojiU: "U+1F1F3 U+1F1FF", fips: "NZ", internet: "NZ", continent: "Oceania", region: "Pacific" }, { name: "Nicaragua", alpha2: "NI", alpha3: "NIC", numeric: "558", locales: ["es-NI"], default_locale: "es-NI", currency: "NIO", latitude: "12.865416", longitude: "-85.207229", currency_name: "Cordoba Oro", languages: ["es"], capital: "Managua", emoji: "🇳🇮", emojiU: "U+1F1F3 U+1F1EE", fips: "NU", internet: "NI", continent: "Americas", region: "Central America" }, { name: "Niger", alpha2: "NE", alpha3: "NER", numeric: "562", locales: ["fr-NE", "ha-Latn-NE"], default_locale: "fr-NE", currency: "XOF", latitude: "17.607789", longitude: "8.081666", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Niamey", emoji: "🇳🇪", emojiU: "U+1F1F3 U+1F1EA", fips: "NG", internet: "NE", continent: "Africa", region: "Western Africa" }, { name: "Nigeria", alpha2: "NG", alpha3: "NGA", numeric: "566", locales: ["ha-Latn-NG", "ig-NG", "yo-NG"], default_locale: "ha-Latn-NG", currency: "NGN", latitude: "9.081999", longitude: "8.675277", currency_name: "Naira", languages: ["en"], capital: "Abuja", emoji: "🇳🇬", emojiU: "U+1F1F3 U+1F1EC", fips: "NI", internet: "NG", continent: "Africa", region: "Western Africa" }, { name: "Niue", alpha2: "NU", alpha3: "NIU", numeric: "570", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-19.054445", longitude: "-169.867233", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Alofi", emoji: "🇳🇺", emojiU: "U+1F1F3 U+1F1FA", fips: "NE", internet: "NU", continent: "Oceania", region: "Pacific" }, { name: "Norfolk Island", alpha2: "NF", alpha3: "NFK", numeric: "574", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-29.040835", longitude: "167.954712", currency_name: "Australian Dollar", languages: ["en"], capital: "Kingston", emoji: "🇳🇫", emojiU: "U+1F1F3 U+1F1EB", fips: "NF", internet: "NF", continent: "Oceania", region: "Pacific" }, { name: "North Macedonia", alpha2: "MK", alpha3: "MKD", numeric: "807", locales: ["mk-MK"], default_locale: "mk-MK", currency: "MKD", latitude: "41.608635", longitude: "21.745275", currency_name: "Denar", languages: ["mk"], capital: "Skopje", emoji: "🇲🇰", emojiU: "U+1F1F2 U+1F1F0", fips: "MK", internet: "MK", continent: "Europe", region: "South East Europe" }, { name: "Northern Mariana Islands", alpha2: "MP", alpha3: "MNP", numeric: "580", locales: ["en-MP"], default_locale: "en-MP", currency: "USD", latitude: "17.33083", longitude: "145.38469", currency_name: "US Dollar", languages: ["en", "ch"], capital: "Saipan", emoji: "🇲🇵", emojiU: "U+1F1F2 U+1F1F5", fips: "CQ", internet: "MP", continent: "Oceania", region: "Pacific" }, { name: "Norway", alpha2: "NO", alpha3: "NOR", numeric: "578", locales: ["nb-NO", "nn-NO"], default_locale: "nb-NO", currency: "NOK", latitude: "60.472024", longitude: "8.468946", currency_name: "Norwegian Krone", languages: ["no", "nb", "nn"], capital: "Oslo", emoji: "🇳🇴", emojiU: "U+1F1F3 U+1F1F4", fips: "NO", internet: "NO", continent: "Europe", region: "Northern Europe" }, { name: "Oman", alpha2: "OM", alpha3: "OMN", numeric: "512", locales: ["ar-OM"], default_locale: "ar-OM", currency: "OMR", latitude: "21.512583", longitude: "55.923255", currency_name: "Rial Omani", languages: ["ar"], capital: "Muscat", emoji: "🇴🇲", emojiU: "U+1F1F4 U+1F1F2", fips: "MU", internet: "OM", continent: "Asia", region: "South West Asia" }, { name: "Pakistan", alpha2: "PK", alpha3: "PAK", numeric: "586", locales: ["en-PK", "pa-Arab-PK", "ur-PK"], default_locale: "en-PK", currency: "PKR", latitude: "30.375321", longitude: "69.345116", currency_name: "Pakistan Rupee", languages: ["en", "ur"], capital: "Islamabad", emoji: "🇵🇰", emojiU: "U+1F1F5 U+1F1F0", fips: "PK", internet: "PK", continent: "Asia", region: "South Asia" }, { name: "Palau", alpha2: "PW", alpha3: "PLW", numeric: "585", locales: ["en"], default_locale: "en", currency: "USD", latitude: "7.51498", longitude: "134.58252", currency_name: "US Dollar", languages: ["en"], capital: "Ngerulmud", emoji: "🇵🇼", emojiU: "U+1F1F5 U+1F1FC", fips: "PS", internet: "PW", continent: "Oceania", region: "Pacific" }, { name: "Palestine", alpha2: "PS", alpha3: "PSE", numeric: "275", locales: ["ar"], default_locale: "ar", currency: "USD", latitude: "31.952162", longitude: "35.233154", currency_name: "US Dollar", languages: ["ar"], capital: "Ramallah", emoji: "🇵🇸", emojiU: "U+1F1F5 U+1F1F8", fips: "WE", internet: "PS", continent: "Asia", region: "South West Asia", alternate_names: ["State of Palestine"] }, { name: "Panama", alpha2: "PA", alpha3: "PAN", numeric: "591", locales: ["es-PA"], default_locale: "es-PA", currency: "USD", latitude: "8.537981", longitude: "-80.782127", currency_name: "US Dollar", languages: ["es"], capital: "Panama City", emoji: "🇵🇦", emojiU: "U+1F1F5 U+1F1E6", fips: "PM", internet: "PA", continent: "Americas", region: "Central America" }, { name: "Papua New Guinea", alpha2: "PG", alpha3: "PNG", numeric: "598", locales: ["en"], default_locale: "en", currency: "PGK", latitude: "-6.314993", longitude: "143.95555", currency_name: "Kina", languages: ["en"], capital: "Port Moresby", emoji: "🇵🇬", emojiU: "U+1F1F5 U+1F1EC", fips: "PP", internet: "PG", continent: "Oceania", region: "Pacific" }, { name: "Paraguay", alpha2: "PY", alpha3: "PRY", numeric: "600", locales: ["es-PY"], default_locale: "es-PY", currency: "PYG", latitude: "-23.442503", longitude: "-58.443832", currency_name: "Guarani", languages: ["es", "gn"], capital: "Asunción", emoji: "🇵🇾", emojiU: "U+1F1F5 U+1F1FE", fips: "PA", internet: "PY", continent: "Americas", region: "South America" }, { name: "Peru", alpha2: "PE", alpha3: "PER", numeric: "604", locales: ["es-PE"], default_locale: "es-PE", currency: "PEN", latitude: "-9.189967", longitude: "-75.015152", currency_name: "Sol", languages: ["es"], capital: "Lima", emoji: "🇵🇪", emojiU: "U+1F1F5 U+1F1EA", fips: "PE", internet: "PE", continent: "Americas", region: "South America" }, { name: "Philippines", alpha2: "PH", alpha3: "PHL", numeric: "608", locales: ["en-PH", "fil-PH"], default_locale: "en-PH", currency: "PHP", latitude: "12.879721", longitude: "121.774017", currency_name: "Philippine Peso", languages: ["en"], capital: "Manila", emoji: "🇵🇭", emojiU: "U+1F1F5 U+1F1ED", fips: "RP", internet: "PH", continent: "Asia", region: "South East Asia" }, { name: "Pitcairn", alpha2: "PN", alpha3: "PCN", numeric: "612", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-24.703615", longitude: "-127.439308", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Adamstown", emoji: "🇵🇳", emojiU: "U+1F1F5 U+1F1F3", fips: "PC", internet: "PN", continent: "Oceania", region: "Pacific" }, { name: "Poland", alpha2: "PL", alpha3: "POL", numeric: "616", locales: ["pl-PL"], default_locale: "pl-PL", currency: "PLN", latitude: "51.919438", longitude: "19.145136", currency_name: "Zloty", languages: ["pl"], capital: "Warsaw", emoji: "🇵🇱", emojiU: "U+1F1F5 U+1F1F1", fips: "PL", internet: "PL", continent: "Europe", region: "Eastern Europe" }, { name: "Portugal", alpha2: "PT", alpha3: "PRT", numeric: "620", locales: ["pt-PT"], default_locale: "pt-PT", currency: "EUR", latitude: "39.399872", longitude: "-8.224454", currency_name: "Euro", languages: ["pt"], capital: "Lisbon", emoji: "🇵🇹", emojiU: "U+1F1F5 U+1F1F9", fips: "PO", internet: "PT", continent: "Europe", region: "South West Europe" }, { name: "Puerto Rico", alpha2: "PR", alpha3: "PRI", numeric: "630", locales: ["es-PR"], default_locale: "es-PR", currency: "USD", latitude: "18.220833", longitude: "-66.590149", currency_name: "US Dollar", languages: ["es", "en"], capital: "San Juan", emoji: "🇵🇷", emojiU: "U+1F1F5 U+1F1F7", fips: "RQ", internet: "PR", continent: "Americas", region: "West Indies" }, { name: "Qatar", alpha2: "QA", alpha3: "QAT", numeric: "634", locales: ["ar-QA"], default_locale: "ar-QA", currency: "QAR", latitude: "25.354826", longitude: "51.183884", currency_name: "Qatari Rial", languages: ["ar"], capital: "Doha", emoji: "🇶🇦", emojiU: "U+1F1F6 U+1F1E6", fips: "QA", internet: "QA", continent: "Asia", region: "South West Asia" }, { name: "Romania", alpha2: "RO", alpha3: "ROU", numeric: "642", locales: ["ro-RO"], default_locale: "ro-RO", currency: "RON", latitude: "45.943161", longitude: "24.96676", currency_name: "Romanian Leu", languages: ["ro"], capital: "Bucharest", emoji: "🇷🇴", emojiU: "U+1F1F7 U+1F1F4", fips: "RO", internet: "RO", continent: "Europe", region: "South East Europe" }, { name: "Russia", alpha2: "RU", alpha3: "RUS", numeric: "643", locales: ["ru-RU"], default_locale: "ru-RU", currency: "RUB", latitude: "61.52401", longitude: "105.318756", currency_name: "Russian Ruble", languages: ["ru"], capital: "Moscow", emoji: "🇷🇺", emojiU: "U+1F1F7 U+1F1FA", fips: "RS", internet: "RU", continent: "Asia", region: "Northern Asia", alternate_names: ["Russian Federation"] }, { name: "Rwanda", alpha2: "RW", alpha3: "RWA", numeric: "646", locales: ["fr-RW", "rw-RW"], default_locale: "fr-RW", currency: "RWF", latitude: "-1.940278", longitude: "29.873888", currency_name: "Rwanda Franc", languages: ["rw", "en", "fr"], capital: "Kigali", emoji: "🇷🇼", emojiU: "U+1F1F7 U+1F1FC", fips: "RW", internet: "RW", continent: "Africa", region: "Central Africa" }, { name: "Réunion", alpha2: "RE", alpha3: "REU", numeric: "638", locales: ["fr-RE"], default_locale: "fr-RE", currency: "RWF", latitude: "-21.115141", longitude: "55.536384", currency_name: "Rwanda Franc", languages: ["fr"], capital: "Saint-Denis", emoji: "🇷🇪", emojiU: "U+1F1F7 U+1F1EA", fips: "RE", internet: "RE", continent: "Africa", region: "Indian Ocean" }, { name: "Saint Barthélemy", alpha2: "BL", alpha3: "BLM", numeric: "652", locales: ["fr-BL"], default_locale: "fr-BL", currency: "EUR", currency_name: "Euro", languages: ["fr"], capital: "Gustavia", emoji: "🇧🇱", emojiU: "U+1F1E7 U+1F1F1", fips: "TB", internet: "BL", continent: "Americas", region: "West Indies" }, { name: "Saint Helena", alpha2: "SH", alpha3: "SHN", numeric: "654", locales: ["en"], default_locale: "en", currency: "SHP", latitude: "-24.143474", longitude: "-10.030696", currency_name: "Saint Helena Pound", languages: ["en"], capital: "Jamestown", emoji: "🇸🇭", emojiU: "U+1F1F8 U+1F1ED", fips: "SH", internet: "SH", continent: "Atlantic Ocean", region: "South Atlantic Ocean", alternate_names: ["Saint Helena, Ascension and Tristan da Cunha"] }, { name: "Saint Kitts and Nevis", alpha2: "KN", alpha3: "KNA", numeric: "659", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "17.357822", longitude: "-62.782998", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Basseterre", emoji: "🇰🇳", emojiU: "U+1F1F0 U+1F1F3", fips: "SC", internet: "KN", continent: "Americas", region: "West Indies" }, { name: "Saint Lucia", alpha2: "LC", alpha3: "LCA", numeric: "662", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "13.909444", longitude: "-60.978893", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Castries", emoji: "🇱🇨", emojiU: "U+1F1F1 U+1F1E8", fips: "ST", internet: "LC", continent: "Americas", region: "West Indies" }, { name: "Saint Martin", alpha2: "MF", alpha3: "MAF", numeric: "663", locales: ["fr-MF"], default_locale: "fr-MF", currency: "EUR", currency_name: "Euro", languages: ["en", "fr", "nl"], capital: "Marigot", emoji: "🇲🇫", emojiU: "U+1F1F2 U+1F1EB", fips: "RN", internet: "MF", continent: "Americas", region: "West Indies", alternate_names: ["Saint Martin French part"] }, { name: "Saint Pierre and Miquelon", alpha2: "PM", alpha3: "SPM", numeric: "666", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "46.941936", longitude: "-56.27111", currency_name: "Euro", languages: ["fr"], capital: "Saint-Pierre", emoji: "🇵🇲", emojiU: "U+1F1F5 U+1F1F2", fips: "SB", internet: "PM", continent: "Americas", region: "North America" }, { name: "Saint Vincent and the Grenadines", alpha2: "VC", alpha3: "VCT", numeric: "670", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "12.984305", longitude: "-61.287228", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Kingstown", emoji: "🇻🇨", emojiU: "U+1F1FB U+1F1E8", fips: "VC", internet: "VC", continent: "Americas", region: "West Indies" }, { name: "Samoa", alpha2: "WS", alpha3: "WSM", numeric: "882", locales: ["sm"], default_locale: "sm", currency: "WST", latitude: "-13.759029", longitude: "-172.104629", currency_name: "Tala", languages: ["sm", "en"], capital: "Apia", emoji: "🇼🇸", emojiU: "U+1F1FC U+1F1F8", fips: "WS", internet: "WS", continent: "Oceania", region: "Pacific" }, { name: "San Marino", alpha2: "SM", alpha3: "SMR", numeric: "674", locales: ["it"], default_locale: "it", currency: "EUR", latitude: "43.94236", longitude: "12.457777", currency_name: "Euro", languages: ["it"], capital: "City of San Marino", emoji: "🇸🇲", emojiU: "U+1F1F8 U+1F1F2", fips: "SM", internet: "SM", continent: "Europe", region: "Southern Europe" }, { name: "Sao Tome and Principe", alpha2: "ST", alpha3: "STP", numeric: "678", locales: ["pt"], default_locale: "pt", currency: "STN", latitude: "0.18636", longitude: "6.613081", currency_name: "Dobra", languages: ["pt"], capital: "São Tomé", emoji: "🇸🇹", emojiU: "U+1F1F8 U+1F1F9", fips: "TP", internet: "ST", continent: "Africa", region: "Western Africa" }, { name: "Saudi Arabia", alpha2: "SA", alpha3: "SAU", numeric: "682", locales: ["ar-SA"], default_locale: "ar-SA", currency: "SAR", latitude: "23.885942", longitude: "45.079162", currency_name: "Saudi Riyal", languages: ["ar"], capital: "Riyadh", emoji: "🇸🇦", emojiU: "U+1F1F8 U+1F1E6", fips: "SA", internet: "SA", continent: "Asia", region: "South West Asia" }, { name: "Senegal", alpha2: "SN", alpha3: "SEN", numeric: "686", locales: ["fr-SN", "ff-SN"], default_locale: "fr-SN", currency: "XOF", latitude: "14.497401", longitude: "-14.452362", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Dakar", emoji: "🇸🇳", emojiU: "U+1F1F8 U+1F1F3", fips: "SG", internet: "SN", continent: "Africa", region: "Western Africa" }, { name: "Serbia", alpha2: "RS", alpha3: "SRB", numeric: "688", locales: ["sr-Cyrl-RS", "sr-Latn-RS"], default_locale: "sr-Cyrl-RS", currency: "RSD", latitude: "44.016521", longitude: "21.005859", currency_name: "Serbian Dinar", languages: ["sr"], capital: "Belgrade", emoji: "🇷🇸", emojiU: "U+1F1F7 U+1F1F8", fips: "RI", internet: "RS", continent: "Europe", region: "South East Europe" }, { name: "Seychelles", alpha2: "SC", alpha3: "SYC", numeric: "690", locales: ["fr"], default_locale: "fr", currency: "SCR", latitude: "-4.679574", longitude: "55.491977", currency_name: "Seychelles Rupee", languages: ["fr", "en"], capital: "Victoria", emoji: "🇸🇨", emojiU: "U+1F1F8 U+1F1E8", fips: "SE", internet: "SC", continent: "Africa", region: "Indian Ocean" }, { name: "Sierra Leone", alpha2: "SL", alpha3: "SLE", numeric: "694", locales: ["en"], default_locale: "en", currency: "SLL", latitude: "8.460555", longitude: "-11.779889", currency_name: "Leone", languages: ["en"], capital: "Freetown", emoji: "🇸🇱", emojiU: "U+1F1F8 U+1F1F1", fips: "SL", internet: "SL", continent: "Africa", region: "Western Africa" }, { name: "Singapore", alpha2: "SG", alpha3: "SGP", numeric: "702", locales: ["zh-Hans-SG", "en-SG"], default_locale: "en-SG", currency: "SGD", latitude: "1.352083", longitude: "103.819836", currency_name: "Singapore Dollar", languages: ["en", "ms", "ta", "zh"], capital: "Singapore", emoji: "🇸🇬", emojiU: "U+1F1F8 U+1F1EC", fips: "SN", internet: "SG", continent: "Asia", region: "South East Asia" }, { name: "Sint Maarten", alpha2: "SX", alpha3: "SXM", numeric: "534", locales: ["nl"], default_locale: "nl", currency: "ANG", currency_name: "Netherlands Antillean Guilder", languages: ["nl", "en"], capital: "Philipsburg", emoji: "🇸🇽", emojiU: "U+1F1F8 U+1F1FD", fips: "NN", internet: "SX", continent: "Americas", region: "West Indies", alternate_names: ["Sint Maarten Dutch part"] }, { name: "Slovakia", alpha2: "SK", alpha3: "SVK", numeric: "703", locales: ["sk-SK"], default_locale: "sk-SK", currency: "EUR", latitude: "48.669026", longitude: "19.699024", currency_name: "Euro", languages: ["sk"], capital: "Bratislava", emoji: "🇸🇰", emojiU: "U+1F1F8 U+1F1F0", fips: "LO", internet: "SK", continent: "Europe", region: "Central Europe" }, { name: "Slovenia", alpha2: "SI", alpha3: "SVN", numeric: "705", locales: ["sl-SI"], default_locale: "sl-SI", currency: "EUR", latitude: "46.151241", longitude: "14.995463", currency_name: "Euro", languages: ["sl"], capital: "Ljubljana", emoji: "🇸🇮", emojiU: "U+1F1F8 U+1F1EE", fips: "SI", internet: "SI", continent: "Europe", region: "South East Europe" }, { name: "Solomon Islands", alpha2: "SB", alpha3: "SLB", numeric: "090", locales: ["en"], default_locale: "en", currency: "SBD", latitude: "-9.64571", longitude: "160.156194", currency_name: "Solomon Islands Dollar", languages: ["en"], capital: "Honiara", emoji: "🇸🇧", emojiU: "U+1F1F8 U+1F1E7", fips: "BP", internet: "SB", continent: "Oceania", region: "Pacific" }, { name: "Somalia", alpha2: "SO", alpha3: "SOM", numeric: "706", locales: ["so-SO"], default_locale: "so-SO", currency: "SOS", latitude: "5.152149", longitude: "46.199616", currency_name: "Somali Shilling", languages: ["so", "ar"], capital: "Mogadishu", emoji: "🇸🇴", emojiU: "U+1F1F8 U+1F1F4", fips: "SO", internet: "SO", continent: "Africa", region: "Eastern Africa" }, { name: "South Africa", alpha2: "ZA", alpha3: "ZAF", numeric: "710", locales: ["af-ZA", "en-ZA", "zu-ZA"], default_locale: "af-ZA", currency: "ZAR", latitude: "-30.559482", longitude: "22.937506", currency_name: "Rand", languages: ["af", "en", "nr", "st", "ss", "tn", "ts", "ve", "xh", "zu"], capital: "Pretoria", emoji: "🇿🇦", emojiU: "U+1F1FF U+1F1E6", fips: "SF", internet: "ZA", continent: "Africa", region: "Southern Africa" }, { name: "South Georgia and the South Sandwich Islands", alpha2: "GS", alpha3: "SGS", numeric: "239", locales: ["en"], default_locale: "en", currency: "USD", latitude: "-54.429579", longitude: "-36.587909", currency_name: "US Dollar", languages: ["en"], capital: "King Edward Point", emoji: "🇬🇸", emojiU: "U+1F1EC U+1F1F8", fips: "SX", internet: "GS", continent: "Atlantic Ocean", region: "South Atlantic Ocean" }, { name: "South Sudan", alpha2: "SS", alpha3: "SSD", numeric: "728", locales: ["en"], default_locale: "en", currency: "SSP", currency_name: "South Sudanese Pound", languages: ["en"], capital: "Juba", emoji: "🇸🇸", emojiU: "U+1F1F8 U+1F1F8", fips: "OD", internet: "SS", continent: "Africa", region: "Northern Africa" }, { name: "Spain", alpha2: "ES", alpha3: "ESP", numeric: "724", locales: ["eu-ES", "ca-ES", "gl-ES", "es-ES"], default_locale: "es-ES", currency: "EUR", latitude: "40.463667", longitude: "-3.74922", currency_name: "Euro", languages: ["es", "eu", "ca", "gl", "oc"], capital: "Madrid", emoji: "🇪🇸", emojiU: "U+1F1EA U+1F1F8", fips: "SP", internet: "ES", continent: "Europe", region: "South West Europe" }, { name: "Sri Lanka", alpha2: "LK", alpha3: "LKA", numeric: "144", locales: ["si-LK", "ta-LK"], default_locale: "si-LK", currency: "LKR", latitude: "7.873054", longitude: "80.771797", currency_name: "Sri Lanka Rupee", languages: ["si", "ta"], capital: "Colombo", emoji: "🇱🇰", emojiU: "U+1F1F1 U+1F1F0", fips: "CE", internet: "LK", continent: "Asia", region: "South Asia" }, { name: "Sudan", alpha2: "SD", alpha3: "SDN", numeric: "729", locales: ["ar-SD"], default_locale: "ar-SD", currency: "SDG", latitude: "12.862807", longitude: "30.217636", currency_name: "Sudanese Pound", languages: ["ar", "en"], capital: "Khartoum", emoji: "🇸🇩", emojiU: "U+1F1F8 U+1F1E9", fips: "SU", internet: "SD", continent: "Africa", region: "Northern Africa" }, { name: "Suriname", alpha2: "SR", alpha3: "SUR", numeric: "740", locales: ["nl"], default_locale: "nl", currency: "SRD", latitude: "3.919305", longitude: "-56.027783", currency_name: "Surinam Dollar", languages: ["nl"], capital: "Paramaribo", emoji: "🇸🇷", emojiU: "U+1F1F8 U+1F1F7", fips: "NS", internet: "SR", continent: "Americas", region: "South America" }, { name: "Svalbard and Jan Mayen", alpha2: "SJ", alpha3: "SJM", numeric: "744", locales: ["no"], default_locale: "no", currency: "NOK", latitude: "77.553604", longitude: "23.670272", currency_name: "Norwegian Krone", languages: ["no"], capital: "Longyearbyen", emoji: "🇸🇯", emojiU: "U+1F1F8 U+1F1EF", fips: "SV", internet: "SJ", continent: "Europe", region: "Northern Europe" }, { name: "Sweden", alpha2: "SE", alpha3: "SWE", numeric: "752", locales: ["sv-SE"], default_locale: "sv-SE", currency: "SEK", latitude: "60.128161", longitude: "18.643501", currency_name: "Swedish Krona", languages: ["sv"], capital: "Stockholm", emoji: "🇸🇪", emojiU: "U+1F1F8 U+1F1EA", fips: "SW", internet: "SE", continent: "Europe", region: "Northern Europe" }, { name: "Switzerland", alpha2: "CH", alpha3: "CHE", numeric: "756", locales: ["fr-CH", "de-CH", "it-CH", "rm-CH", "gsw-CH"], default_locale: "fr-CH", currency: "CHF", latitude: "46.818188", longitude: "8.227512", currency_name: "Swiss Franc", languages: ["de", "fr", "it"], capital: "Bern", emoji: "🇨🇭", emojiU: "U+1F1E8 U+1F1ED", fips: "SZ", internet: "CH", continent: "Europe", region: "Central Europe" }, { name: "Syrian Arab Republic", alpha2: "SY", alpha3: "SYR", numeric: "760", locales: ["ar-SY"], default_locale: "ar-SY", currency: "SYP", latitude: "34.802075", longitude: "38.996815", currency_name: "Syrian Pound", languages: ["ar"], capital: "Damascus", emoji: "🇸🇾", emojiU: "U+1F1F8 U+1F1FE", fips: "SY", internet: "SY", continent: "Asia", region: "South West Asia" }, { name: "Taiwan", alpha2: "TW", alpha3: "TWN", numeric: "158", locales: ["zh-Hant-TW"], default_locale: "zh-Hant-TW", currency: "TWD", latitude: "23.69781", longitude: "120.960515", currency_name: "New Taiwan Dollar", languages: ["zh"], capital: "Taipei", emoji: "🇹🇼", emojiU: "U+1F1F9 U+1F1FC", fips: "TW", internet: "TW", continent: "Asia", region: "East Asia", alternate_names: ["Province of China Taiwan"] }, { name: "Tajikistan", alpha2: "TJ", alpha3: "TJK", numeric: "762", locales: ["tg"], default_locale: "tg", currency: "TJS", latitude: "38.861034", longitude: "71.276093", currency_name: "Somoni", languages: ["tg", "ru"], capital: "Dushanbe", emoji: "🇹🇯", emojiU: "U+1F1F9 U+1F1EF", fips: "TI", internet: "TJ", continent: "Asia", region: "Central Asia" }, { name: "Tanzania", alpha2: "TZ", alpha3: "TZA", numeric: "834", locales: ["asa-TZ", "bez-TZ", "lag-TZ", "jmc-TZ", "kde-TZ", "mas-TZ", "rof-TZ", "rwk-TZ", "sw-TZ", "vun-TZ"], default_locale: "asa-TZ", currency: "TZS", latitude: "-6.369028", longitude: "34.888822", currency_name: "Tanzanian Shilling", languages: ["sw", "en"], capital: "Dodoma", emoji: "🇹🇿", emojiU: "U+1F1F9 U+1F1FF", fips: "TZ", internet: "TZ", continent: "Africa", region: "Eastern Africa", alternate_names: ["United Republic of Tanzania"] }, { name: "Thailand", alpha2: "TH", alpha3: "THA", numeric: "764", locales: ["th-TH"], default_locale: "th-TH", currency: "THB", latitude: "15.870032", longitude: "100.992541", currency_name: "Baht", languages: ["th"], capital: "Bangkok", emoji: "🇹🇭", emojiU: "U+1F1F9 U+1F1ED", fips: "TH", internet: "TH", continent: "Asia", region: "South East Asia" }, { name: "Timor-Leste", alpha2: "TL", alpha3: "TLS", numeric: "626", locales: ["pt"], default_locale: "pt", currency: "USD", latitude: "-8.874217", longitude: "125.727539", currency_name: "US Dollar", languages: ["pt"], capital: "Dili", emoji: "🇹🇱", emojiU: "U+1F1F9 U+1F1F1", fips: "TT", internet: "TL", continent: "Asia", region: "South East Asia" }, { name: "Togo", alpha2: "TG", alpha3: "TGO", numeric: "768", locales: ["ee-TG", "fr-TG"], default_locale: "fr-TG", currency: "XOF", latitude: "8.619543", longitude: "0.824782", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Lomé", emoji: "🇹🇬", emojiU: "U+1F1F9 U+1F1EC", fips: "TO", internet: "TG", continent: "Africa", region: "Western Africa" }, { name: "Tokelau", alpha2: "TK", alpha3: "TKL", numeric: "772", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-8.967363", longitude: "-171.855881", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Fakaofo", emoji: "🇹🇰", emojiU: "U+1F1F9 U+1F1F0", fips: "TL", internet: "TK", continent: "Oceania", region: "Pacific" }, { name: "Tonga", alpha2: "TO", alpha3: "TON", numeric: "776", locales: ["to-TO"], default_locale: "to-TO", currency: "TOP", latitude: "-21.178986", longitude: "-175.198242", currency_name: "Pa’anga", languages: ["en", "to"], capital: "Nuku'alofa", emoji: "🇹🇴", emojiU: "U+1F1F9 U+1F1F4", fips: "TN", internet: "TO", continent: "Oceania", region: "Pacific" }, { name: "Trinidad and Tobago", alpha2: "TT", alpha3: "TTO", numeric: "780", locales: ["en-TT"], default_locale: "en-TT", currency: "TTD", latitude: "10.691803", longitude: "-61.222503", currency_name: "Trinidad and Tobago Dollar", languages: ["en"], capital: "Port of Spain", emoji: "🇹🇹", emojiU: "U+1F1F9 U+1F1F9", fips: "TD", internet: "TT", continent: "Americas", region: "West Indies" }, { name: "Tunisia", alpha2: "TN", alpha3: "TUN", numeric: "788", locales: ["ar-TN"], default_locale: "ar-TN", currency: "TND", latitude: "33.886917", longitude: "9.537499", currency_name: "Tunisian Dinar", languages: ["ar"], capital: "Tunis", emoji: "🇹🇳", emojiU: "U+1F1F9 U+1F1F3", fips: "TS", internet: "TN", continent: "Africa", region: "Northern Africa" }, { name: "Turkey", alpha2: "TR", alpha3: "TUR", numeric: "792", locales: ["tr-TR"], default_locale: "tr-TR", currency: "TRY", latitude: "38.963745", longitude: "35.243322", currency_name: "Turkish Lira", languages: ["tr"], capital: "Ankara", emoji: "🇹🇷", emojiU: "U+1F1F9 U+1F1F7", fips: "TU", internet: "TR", continent: "Asia", region: "South West Asia" }, { name: "Turkmenistan", alpha2: "TM", alpha3: "TKM", numeric: "795", locales: ["tk"], default_locale: "tk", currency: "TMT", latitude: "38.969719", longitude: "59.556278", currency_name: "Turkmenistan New Manat", languages: ["tk", "ru"], capital: "Ashgabat", emoji: "🇹🇲", emojiU: "U+1F1F9 U+1F1F2", fips: "TX", internet: "TM", continent: "Asia", region: "Central Asia" }, { name: "Turks and Caicos Islands", alpha2: "TC", alpha3: "TCA", numeric: "796", locales: ["en"], default_locale: "en", currency: "USD", latitude: "21.694025", longitude: "-71.797928", currency_name: "US Dollar", languages: ["en"], capital: "Cockburn Town", emoji: "🇹🇨", emojiU: "U+1F1F9 U+1F1E8", fips: "TK", internet: "TC", continent: "Americas", region: "West Indies" }, { name: "Tuvalu", alpha2: "TV", alpha3: "TUV", numeric: "798", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-7.109535", longitude: "177.64933", currency_name: "Australian Dollar", languages: ["en"], capital: "Funafuti", emoji: "🇹🇻", emojiU: "U+1F1F9 U+1F1FB", fips: "TV", internet: "TV", continent: "Oceania", region: "Pacific" }, { name: "Uganda", alpha2: "UG", alpha3: "UGA", numeric: "800", locales: ["cgg-UG", "lg-UG", "nyn-UG", "xog-UG", "teo-UG"], default_locale: "cgg-UG", currency: "UGX", latitude: "1.373333", longitude: "32.290275", currency_name: "Uganda Shilling", languages: ["en", "sw"], capital: "Kampala", emoji: "🇺🇬", emojiU: "U+1F1FA U+1F1EC", fips: "UG", internet: "UG", continent: "Africa", region: "Eastern Africa" }, { name: "Ukraine", alpha2: "UA", alpha3: "UKR", numeric: "804", locales: ["ru-UA", "uk-UA"], default_locale: "uk-UA", currency: "UAH", latitude: "48.379433", longitude: "31.16558", currency_name: "Hryvnia", languages: ["uk"], capital: "Kyiv", emoji: "🇺🇦", emojiU: "U+1F1FA U+1F1E6", fips: "UP", internet: "UA", continent: "Europe", region: "Eastern Europe" }, { name: "United Arab Emirates", alpha2: "AE", alpha3: "ARE", numeric: "784", locales: ["ar-AE"], default_locale: "ar-AE", currency: "AED", latitude: "23.424076", longitude: "53.847818", currency_name: "UAE Dirham", languages: ["ar"], capital: "Abu Dhabi", emoji: "🇦🇪", emojiU: "U+1F1E6 U+1F1EA", fips: "TC", internet: "AE", continent: "Asia", region: "South West Asia" }, { name: "United Kingdom", alpha2: "GB", alpha3: "GBR", numeric: "826", locales: ["kw-GB", "en-GB", "gv-GB", "cy-GB"], default_locale: "en-GB", currency: "GBP", latitude: "55.378051", longitude: "-3.435973", currency_name: "Pound Sterling", languages: ["en"], capital: "London", emoji: "🇬🇧", emojiU: "U+1F1EC U+1F1E7", fips: "UK", internet: "UK", continent: "Europe", region: "Western Europe", alternate_names: ["United Kingdom of Great Britain and Northern Ireland"] }, { name: "United States Minor Outlying Islands", alpha2: "UM", alpha3: "UMI", numeric: "581", locales: ["en-UM"], default_locale: "en-UM", currency: "USD", currency_name: "US Dollar", languages: ["en"], capital: "", emoji: "🇺🇲", emojiU: "U+1F1FA U+1F1F2", fips: "", internet: "US", continent: "Americas", region: "North America" }, { name: "United States of America", alpha2: "US", alpha3: "USA", numeric: "840", locales: ["chr-US", "en-US", "haw-US", "es-US"], default_locale: "en-US", currency: "USD", latitude: "37.09024", longitude: "-95.712891", currency_name: "US Dollar", languages: ["en"], capital: "Washington D.C.", emoji: "🇺🇸", emojiU: "U+1F1FA U+1F1F8", fips: "US", internet: "US", continent: "Americas", region: "North America", alternate_names: ["United States"] }, { name: "Uruguay", alpha2: "UY", alpha3: "URY", numeric: "858", locales: ["es-UY"], default_locale: "es-UY", currency: "UYU", latitude: "-32.522779", longitude: "-55.765835", currency_name: "Peso Uruguayo", languages: ["es"], capital: "Montevideo", emoji: "🇺🇾", emojiU: "U+1F1FA U+1F1FE", fips: "UY", internet: "UY", continent: "Americas", region: "South America" }, { name: "Uzbekistan", alpha2: "UZ", alpha3: "UZB", numeric: "860", locales: ["uz-Cyrl-UZ", "uz-Latn-UZ"], default_locale: "uz-Cyrl-UZ", currency: "UZS", latitude: "41.377491", longitude: "64.585262", currency_name: "Uzbekistan Sum", languages: ["uz", "ru"], capital: "Tashkent", emoji: "🇺🇿", emojiU: "U+1F1FA U+1F1FF", fips: "UZ", internet: "UZ", continent: "Asia", region: "Central Asia" }, { name: "Vanuatu", alpha2: "VU", alpha3: "VUT", numeric: "548", locales: ["bi"], default_locale: "bi", currency: "VUV", latitude: "-15.376706", longitude: "166.959158", currency_name: "Vatu", languages: ["bi", "en", "fr"], capital: "Port Vila", emoji: "🇻🇺", emojiU: "U+1F1FB U+1F1FA", fips: "NH", internet: "VU", continent: "Oceania", region: "Pacific" }, { name: "Venezuela", alpha2: "VE", alpha3: "VEN", numeric: "862", locales: ["es-VE"], default_locale: "es-VE", currency: "VUV", latitude: "6.42375", longitude: "-66.58973", currency_name: "Vatu", languages: ["es"], capital: "Caracas", emoji: "🇻🇪", emojiU: "U+1F1FB U+1F1EA", fips: "VE", internet: "UE", continent: "Americas", region: "South America", alternate_names: ["Bolivarian Republic of Venezuela"] }, { name: "Viet Nam", alpha2: "VN", alpha3: "VNM", numeric: "704", locales: ["vi-VN"], default_locale: "vi-VN", currency: "VND", latitude: "14.058324", longitude: "108.277199", currency_name: "Dong", languages: ["vi"], capital: "Hanoi", emoji: "🇻🇳", emojiU: "U+1F1FB U+1F1F3", fips: "VN", internet: "VN", continent: "Asia", region: "South East Asia" }, { name: "Virgin Islands (British)", alpha2: "VG", alpha3: "VGB", numeric: "092", locales: ["en"], default_locale: "en", currency: "USD", latitude: "18.420695", longitude: "-64.639968", currency_name: "US Dollar", languages: ["en"], capital: "Road Town", emoji: "🇻🇬", emojiU: "U+1F1FB U+1F1EC", fips: "VI", internet: "VG", continent: "Americas", region: "West Indies" }, { name: "Virgin Islands (U.S.)", alpha2: "VI", alpha3: "VIR", numeric: "850", locales: ["en-VI"], default_locale: "en-VI", currency: "USD", latitude: "18.335765", longitude: "-64.896335", currency_name: "US Dollar", languages: ["en"], capital: "Charlotte Amalie", emoji: "🇻🇮", emojiU: "U+1F1FB U+1F1EE", fips: "VQ", internet: "VI", continent: "Americas", region: "West Indies" }, { name: "Wallis and Futuna", alpha2: "WF", alpha3: "WLF", numeric: "876", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-13.768752", longitude: "-177.156097", currency_name: "CFP Franc", languages: ["fr"], capital: "Mata-Utu", emoji: "🇼🇫", emojiU: "U+1F1FC U+1F1EB", fips: "WF", internet: "WF", continent: "Oceania", region: "Pacific" }, { name: "Western Sahara", alpha2: "EH", alpha3: "ESH", numeric: "732", locales: ["es"], default_locale: "es", currency: "MAD", latitude: "24.215527", longitude: "-12.885834", currency_name: "Moroccan Dirham", languages: ["es"], capital: "El Aaiún", emoji: "🇪🇭", emojiU: "U+1F1EA U+1F1ED", fips: "WI", internet: "EH", continent: "Africa", region: "Northern Africa" }, { name: "Yemen", alpha2: "YE", alpha3: "YEM", numeric: "887", locales: ["ar-YE"], default_locale: "ar-YE", currency: "YER", latitude: "15.552727", longitude: "48.516388", currency_name: "Yemeni Rial", languages: ["ar"], capital: "Sana'a", emoji: "🇾🇪", emojiU: "U+1F1FE U+1F1EA", fips: "YM", internet: "YE", continent: "Asia", region: "South West Asia" }, { name: "Zambia", alpha2: "ZM", alpha3: "ZMB", numeric: "894", locales: ["bem-ZM"], default_locale: "bem-ZM", currency: "ZMW", latitude: "-13.133897", longitude: "27.849332", currency_name: "Zambian Kwacha", languages: ["en"], capital: "Lusaka", emoji: "🇿🇲", emojiU: "U+1F1FF U+1F1F2", fips: "ZA", internet: "ZM", continent: "Africa", region: "Southern Africa" }, { name: "Zimbabwe", alpha2: "ZW", alpha3: "ZWE", numeric: "716", locales: ["en-ZW", "nd-ZW", "sn-ZW"], default_locale: "en-ZW", currency: "ZWL", latitude: "-19.015438", longitude: "29.154857", currency_name: "Zimbabwe Dollar", languages: ["en", "sn", "nd"], capital: "Harare", emoji: "🇿🇼", emojiU: "U+1F1FF U+1F1FC", fips: "ZI", internet: "ZW", continent: "Africa", region: "Southern Africa" }, { name: "Åland Islands", alpha2: "AX", alpha3: "ALA", numeric: "248", locales: ["sv"], default_locale: "sv", currency: "EUR", currency_name: "Euro", languages: ["sv"], capital: "Mariehamn", emoji: "🇦🇽", emojiU: "U+1F1E6 U+1F1FD", fips: "AX", internet: "AX", continent: "Europe", region: "Northern Europe" }, { name: "Kosovo", alpha2: "XK", alpha3: "XKX", numeric: "383", locales: ["sq"], default_locale: "sq", currency: "EUR", latitude: "42.602636", longitude: "20.902977", currency_name: "Euro", languages: ["sq", "sr"], capital: "Pristina", emoji: "🇽🇰", emojiU: "U+1F1FD U+1F1F0", fips: "KV", internet: "XK", continent: "Europe", region: "South East Europe" }];
});

// node_modules/.bun/country-locale-map@1.9.11/node_modules/country-locale-map/countries.json
var require_countries = __commonJS((exports, module) => {
  module.exports = [{ name: "Afghanistan", alpha2: "AF", alpha3: "AFG", numeric: "004", locales: ["ps_AF", "fa_AF", "uz_Arab_AF"], default_locale: "ps_AF", currency: "AFN", latitude: "33.93911", longitude: "67.709953", currency_name: "Afghani", languages: ["ps", "uz", "tk"], capital: "Kabul", emoji: "🇦🇫", emojiU: "U+1F1E6 U+1F1EB", fips: "AF", internet: "AF", continent: "Asia", region: "South Asia" }, { name: "Albania", alpha2: "AL", alpha3: "ALB", numeric: "008", locales: ["sq_AL"], default_locale: "sq_AL", currency: "ALL", latitude: "41.153332", longitude: "20.168331", currency_name: "Lek", languages: ["sq"], capital: "Tirana", emoji: "🇦🇱", emojiU: "U+1F1E6 U+1F1F1", fips: "AL", internet: "AL", continent: "Europe", region: "South East Europe" }, { name: "Algeria", alpha2: "DZ", alpha3: "DZA", numeric: "012", locales: ["ar_DZ", "kab_DZ"], default_locale: "ar_DZ", currency: "DZD", latitude: "28.033886", longitude: "1.659626", currency_name: "Algerian Dinar", languages: ["ar"], capital: "Algiers", emoji: "🇩🇿", emojiU: "U+1F1E9 U+1F1FF", fips: "AG", internet: "DZ", continent: "Africa", region: "Northern Africa" }, { name: "American Samoa", alpha2: "AS", alpha3: "ASM", numeric: "016", locales: ["en_AS"], default_locale: "en_AS", currency: "USD", latitude: "-14.270972", longitude: "-170.132217", currency_name: "US Dollar", languages: ["en", "sm"], capital: "Pago Pago", emoji: "🇦🇸", emojiU: "U+1F1E6 U+1F1F8", fips: "AQ", internet: "AS", continent: "Oceania", region: "Pacific" }, { name: "Andorra", alpha2: "AD", alpha3: "AND", numeric: "020", locales: ["ca"], default_locale: "ca", currency: "EUR", latitude: "42.546245", longitude: "1.601554", currency_name: "Euro", languages: ["ca"], capital: "Andorra la Vella", emoji: "🇦🇩", emojiU: "U+1F1E6 U+1F1E9", fips: "AN", internet: "AD", continent: "Europe", region: "South West Europe" }, { name: "Angola", alpha2: "AO", alpha3: "AGO", numeric: "024", locales: ["pt"], default_locale: "pt", currency: "AOA", latitude: "-11.202692", longitude: "17.873887", currency_name: "Kwanza", languages: ["pt"], capital: "Luanda", emoji: "🇦🇴", emojiU: "U+1F1E6 U+1F1F4", fips: "AO", internet: "AO", continent: "Africa", region: "Southern Africa" }, { name: "Anguilla", alpha2: "AI", alpha3: "AIA", numeric: "660", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "18.220554", longitude: "-63.068615", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "The Valley", emoji: "🇦🇮", emojiU: "U+1F1E6 U+1F1EE", fips: "AV", internet: "AI", continent: "Americas", region: "West Indies" }, { name: "Antarctica", alpha2: "AQ", alpha3: "ATA", numeric: "010", locales: ["en_US"], default_locale: "en_US", currency: "USD", latitude: "-75.250973", longitude: "-0.071389", currency_name: "US Dollar", languages: [], capital: "", emoji: "🇦🇶", emojiU: "U+1F1E6 U+1F1F6", fips: "AY", internet: "AQ", continent: "Antarctica", region: "Antarctica" }, { name: "Antigua and Barbuda", alpha2: "AG", alpha3: "ATG", numeric: "028", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "17.060816", longitude: "-61.796428", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Saint John's", emoji: "🇦🇬", emojiU: "U+1F1E6 U+1F1EC", fips: "AC", internet: "AG", continent: "Americas", region: "West Indies" }, { name: "Argentina", alpha2: "AR", alpha3: "ARG", numeric: "032", locales: ["es_AR"], default_locale: "es_AR", currency: "ARS", latitude: "-38.416097", longitude: "-63.616672", currency_name: "Argentine Peso", languages: ["es", "gn"], capital: "Buenos Aires", emoji: "🇦🇷", emojiU: "U+1F1E6 U+1F1F7", fips: "AR", internet: "AR", continent: "Americas", region: "South America" }, { name: "Armenia", alpha2: "AM", alpha3: "ARM", numeric: "051", locales: ["hy_AM"], default_locale: "hy_AM", currency: "AMD", latitude: "40.069099", longitude: "45.038189", currency_name: "Armenian Dram", languages: ["hy", "ru"], capital: "Yerevan", emoji: "🇦🇲", emojiU: "U+1F1E6 U+1F1F2", fips: "AM", internet: "AM", continent: "Asia", region: "South West Asia" }, { name: "Aruba", alpha2: "AW", alpha3: "ABW", numeric: "533", locales: ["nl"], default_locale: "nl", currency: "AWG", latitude: "12.52111", longitude: "-69.968338", currency_name: "Aruban Florin", languages: ["nl", "pa"], capital: "Oranjestad", emoji: "🇦🇼", emojiU: "U+1F1E6 U+1F1FC", fips: "AA", internet: "AW", continent: "Americas", region: "West Indies" }, { name: "Australia", alpha2: "AU", alpha3: "AUS", numeric: "036", locales: ["en_AU"], default_locale: "en_AU", currency: "AUD", latitude: "-25.274398", longitude: "133.775136", currency_name: "Australian Dollar", languages: ["en"], capital: "Canberra", emoji: "🇦🇺", emojiU: "U+1F1E6 U+1F1FA", fips: "AS", internet: "AU", continent: "Oceania", region: "Pacific" }, { name: "Austria", alpha2: "AT", alpha3: "AUT", numeric: "040", locales: ["de_AT"], default_locale: "de_AT", currency: "EUR", latitude: "47.516231", longitude: "14.550072", currency_name: "Euro", languages: ["de"], capital: "Vienna", emoji: "🇦🇹", emojiU: "U+1F1E6 U+1F1F9", fips: "AU", internet: "AT", continent: "Europe", region: "Central Europe" }, { name: "Azerbaijan", alpha2: "AZ", alpha3: "AZE", numeric: "031", locales: ["az_Cyrl_AZ", "az_Latn_AZ"], default_locale: "az_Cyrl_AZ", currency: "AZN", latitude: "40.143105", longitude: "47.576927", currency_name: "Azerbaijan Manat", languages: ["az"], capital: "Baku", emoji: "🇦🇿", emojiU: "U+1F1E6 U+1F1FF", fips: "AJ", internet: "AZ", continent: "Asia", region: "South West Asia" }, { name: "Bahamas", alpha2: "BS", alpha3: "BHS", numeric: "044", locales: ["en"], default_locale: "en", currency: "BSD", latitude: "25.03428", longitude: "-77.39628", currency_name: "Bahamian Dollar", languages: ["en"], capital: "Nassau", emoji: "🇧🇸", emojiU: "U+1F1E7 U+1F1F8", fips: "BF", internet: "BS", continent: "Americas", region: "West Indies" }, { name: "Bahrain", alpha2: "BH", alpha3: "BHR", numeric: "048", locales: ["ar_BH"], default_locale: "ar_BH", currency: "BHD", latitude: "25.930414", longitude: "50.637772", currency_name: "Bahraini Dinar", languages: ["ar"], capital: "Manama", emoji: "🇧🇭", emojiU: "U+1F1E7 U+1F1ED", fips: "BA", internet: "BH", continent: "Asia", region: "South West Asia" }, { name: "Bangladesh", alpha2: "BD", alpha3: "BGD", numeric: "050", locales: ["bn_BD"], default_locale: "bn_BD", currency: "BDT", latitude: "23.684994", longitude: "90.356331", currency_name: "Taka", languages: ["bn"], capital: "Dhaka", emoji: "🇧🇩", emojiU: "U+1F1E7 U+1F1E9", fips: "BG", internet: "BD", continent: "Asia", region: "South Asia" }, { name: "Barbados", alpha2: "BB", alpha3: "BRB", numeric: "052", locales: ["en"], default_locale: "en", currency: "BBD", latitude: "13.193887", longitude: "-59.543198", currency_name: "Barbados Dollar", languages: ["en"], capital: "Bridgetown", emoji: "🇧🇧", emojiU: "U+1F1E7 U+1F1E7", fips: "BB", internet: "BB", continent: "Americas", region: "West Indies" }, { name: "Belarus", alpha2: "BY", alpha3: "BLR", numeric: "112", locales: ["be_BY"], default_locale: "be_BY", currency: "BYN", latitude: "53.709807", longitude: "27.953389", currency_name: "Belarusian Ruble", languages: ["be", "ru"], capital: "Minsk", emoji: "🇧🇾", emojiU: "U+1F1E7 U+1F1FE", fips: "BO", internet: "BY", continent: "Europe", region: "Eastern Europe" }, { name: "Belgium", alpha2: "BE", alpha3: "BEL", numeric: "056", locales: ["nl_BE", "en_BE", "fr_BE", "de_BE"], default_locale: "nl_BE", currency: "EUR", latitude: "50.503887", longitude: "4.469936", currency_name: "Euro", languages: ["nl", "fr", "de"], capital: "Brussels", emoji: "🇧🇪", emojiU: "U+1F1E7 U+1F1EA", fips: "BE", internet: "BE", continent: "Europe", region: "Western Europe" }, { name: "Belize", alpha2: "BZ", alpha3: "BLZ", numeric: "084", locales: ["en_BZ"], default_locale: "en_BZ", currency: "BZD", latitude: "17.189877", longitude: "-88.49765", currency_name: "Belize Dollar", languages: ["en", "es"], capital: "Belmopan", emoji: "🇧🇿", emojiU: "U+1F1E7 U+1F1FF", fips: "BH", internet: "BZ", continent: "Americas", region: "Central America" }, { name: "Benin", alpha2: "BJ", alpha3: "BEN", numeric: "204", locales: ["fr_BJ"], default_locale: "fr_BJ", currency: "XOF", latitude: "9.30769", longitude: "2.315834", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Porto-Novo", emoji: "🇧🇯", emojiU: "U+1F1E7 U+1F1EF", fips: "BN", internet: "BJ", continent: "Africa", region: "Western Africa" }, { name: "Bermuda", alpha2: "BM", alpha3: "BMU", numeric: "060", locales: ["en"], default_locale: "en", currency: "BMD", latitude: "32.321384", longitude: "-64.75737", currency_name: "Bermudian Dollar", languages: ["en"], capital: "Hamilton", emoji: "🇧🇲", emojiU: "U+1F1E7 U+1F1F2", fips: "BD", internet: "BM", continent: "Americas", region: "West Indies" }, { name: "Bhutan", alpha2: "BT", alpha3: "BTN", numeric: "064", locales: ["dz"], default_locale: "dz", currency: "BTN", latitude: "27.514162", longitude: "90.433601", currency_name: "Ngultrum", languages: ["dz"], capital: "Thimphu", emoji: "🇧🇹", emojiU: "U+1F1E7 U+1F1F9", fips: "BT", internet: "BT", continent: "Asia", region: "South Asia" }, { name: "Bolivia", alpha2: "BO", alpha3: "BOL", numeric: "068", locales: ["es_BO"], default_locale: "es_BO", currency: "BOB", latitude: "-16.290154", longitude: "-63.588653", currency_name: "Bolivia", languages: ["es", "ay", "qu"], capital: "Sucre", emoji: "🇧🇴", emojiU: "U+1F1E7 U+1F1F4", fips: "BL", internet: "BO", continent: "Americas", region: "South America", alternate_names: ["Plurinational State of Bolivia"] }, { name: "Bonaire", alpha2: "BQ", alpha3: "BES", numeric: "535", locales: ["nl"], default_locale: "nl", currency: "USD", currency_name: "US Dollar", languages: ["nl"], capital: "Kralendijk", emoji: "🇧🇶", emojiU: "U+1F1E7 U+1F1F6", fips: "BQ", internet: "BQ", continent: "Americas", region: "West Indies", alternate_names: ["Bonaire, Sint Eustatius and Saba"] }, { name: "Bosnia and Herzegovina", alpha2: "BA", alpha3: "BIH", numeric: "070", locales: ["bs_BA", "sr_Cyrl_BA", "sr_Latn_BA"], default_locale: "bs_BA", currency: "BAM", latitude: "43.915886", longitude: "17.679076", currency_name: "Convertible Mark", languages: ["bs", "hr", "sr"], capital: "Sarajevo", emoji: "🇧🇦", emojiU: "U+1F1E7 U+1F1E6", fips: "BK", internet: "BA", continent: "Europe", region: "South East Europe" }, { name: "Botswana", alpha2: "BW", alpha3: "BWA", numeric: "072", locales: ["en_BW"], default_locale: "en_BW", currency: "BWP", latitude: "-22.328474", longitude: "24.684866", currency_name: "Pula", languages: ["en", "tn"], capital: "Gaborone", emoji: "🇧🇼", emojiU: "U+1F1E7 U+1F1FC", fips: "BC", internet: "BW", continent: "Africa", region: "Southern Africa" }, { name: "Bouvet Island", alpha2: "BV", alpha3: "BVT", numeric: "074", locales: ["no"], default_locale: "no", currency: "NOK", latitude: "-54.423199", longitude: "3.413194", currency_name: "Norwegian Krone", languages: ["no", "nb", "nn"], capital: "", emoji: "🇧🇻", emojiU: "U+1F1E7 U+1F1FB", fips: "BV", internet: "BV", continent: "Atlantic Ocean", region: "South Atlantic Ocean" }, { name: "Brazil", alpha2: "BR", alpha3: "BRA", numeric: "076", locales: ["pt_BR"], default_locale: "pt_BR", currency: "BRL", latitude: "-14.235004", longitude: "-51.92528", currency_name: "Brazilian Real", languages: ["pt"], capital: "Brasília", emoji: "🇧🇷", emojiU: "U+1F1E7 U+1F1F7", fips: "BR", internet: "BR", continent: "Americas", region: "South America" }, { name: "British Indian Ocean Territory", alpha2: "IO", alpha3: "IOT", numeric: "086", locales: ["en"], default_locale: "en", currency: "USD", latitude: "-6.343194", longitude: "71.876519", currency_name: "US Dollar", languages: ["en"], capital: "Diego Garcia", emoji: "🇮🇴", emojiU: "U+1F1EE U+1F1F4", fips: "IO", internet: "IO", continent: "Asia", region: "South Asia" }, { name: "Brunei Darussalam", alpha2: "BN", alpha3: "BRN", numeric: "096", locales: ["ms_BN"], default_locale: "ms_BN", currency: "BND", latitude: "4.535277", longitude: "114.727669", currency_name: "Brunei Dollar", languages: ["ms"], capital: "Bandar Seri Begawan", emoji: "🇧🇳", emojiU: "U+1F1E7 U+1F1F3", fips: "BX", internet: "BN", continent: "Asia", region: "South East Asia" }, { name: "Bulgaria", alpha2: "BG", alpha3: "BGR", numeric: "100", locales: ["bg_BG"], default_locale: "bg_BG", currency: "BGN", latitude: "42.733883", longitude: "25.48583", currency_name: "Bulgarian Lev", languages: ["bg"], capital: "Sofia", emoji: "🇧🇬", emojiU: "U+1F1E7 U+1F1EC", fips: "BU", internet: "BG", continent: "Europe", region: "South East Europe" }, { name: "Burkina Faso", alpha2: "BF", alpha3: "BFA", numeric: "854", locales: ["fr_BF"], default_locale: "fr_BF", currency: "XOF", latitude: "12.238333", longitude: "-1.561593", currency_name: "CFA Franc BCEAO", languages: ["fr", "ff"], capital: "Ouagadougou", emoji: "🇧🇫", emojiU: "U+1F1E7 U+1F1EB", fips: "UV", internet: "BF", continent: "Africa", region: "Western Africa" }, { name: "Burundi", alpha2: "BI", alpha3: "BDI", numeric: "108", locales: ["fr_BI"], default_locale: "fr_BI", currency: "BIF", latitude: "-3.373056", longitude: "29.918886", currency_name: "Burundi Franc", languages: ["fr", "rn"], capital: "Bujumbura", emoji: "🇧🇮", emojiU: "U+1F1E7 U+1F1EE", fips: "BY", internet: "BI", continent: "Africa", region: "Central Africa" }, { name: "Cabo Verde", alpha2: "CV", alpha3: "CPV", numeric: "132", locales: ["kea_CV"], default_locale: "kea_CV", currency: "CVE", latitude: "16.002082", longitude: "-24.013197", currency_name: "Cabo Verde Escudo", languages: ["pt"], capital: "Praia", emoji: "🇨🇻", emojiU: "U+1F1E8 U+1F1FB", fips: "CV", internet: "CV", continent: "Africa", region: "Western Africa" }, { name: "Cambodia", alpha2: "KH", alpha3: "KHM", numeric: "116", locales: ["km_KH"], default_locale: "km_KH", currency: "KHR", latitude: "12.565679", longitude: "104.990963", currency_name: "Riel", languages: ["km"], capital: "Phnom Penh", emoji: "🇰🇭", emojiU: "U+1F1F0 U+1F1ED", fips: "CB", internet: "KH", continent: "Asia", region: "South East Asia" }, { name: "Cameroon", alpha2: "CM", alpha3: "CMR", numeric: "120", locales: ["fr_CM"], default_locale: "fr_CM", currency: "XAF", latitude: "7.369722", longitude: "12.354722", currency_name: "CFA Franc BEAC", languages: ["en", "fr"], capital: "Yaoundé", emoji: "🇨🇲", emojiU: "U+1F1E8 U+1F1F2", fips: "CM", internet: "CM", continent: "Africa", region: "Western Africa" }, { name: "Canada", alpha2: "CA", alpha3: "CAN", numeric: "124", locales: ["en_CA", "fr_CA"], default_locale: "en_CA", currency: "CAD", latitude: "56.130366", longitude: "-106.346771", currency_name: "Canadian Dollar", languages: ["en", "fr"], capital: "Ottawa", emoji: "🇨🇦", emojiU: "U+1F1E8 U+1F1E6", fips: "CA", internet: "CA", continent: "Americas", region: "North America" }, { name: "Cayman Islands", alpha2: "KY", alpha3: "CYM", numeric: "136", locales: ["en"], default_locale: "en", currency: "KYD", latitude: "19.513469", longitude: "-80.566956", currency_name: "Cayman Islands Dollar", languages: ["en"], capital: "George Town", emoji: "🇰🇾", emojiU: "U+1F1F0 U+1F1FE", fips: "CJ", internet: "KY", continent: "Americas", region: "West Indies" }, { name: "Central African Republic", alpha2: "CF", alpha3: "CAF", numeric: "140", locales: ["fr_CF", "sg_CF"], default_locale: "fr_CF", currency: "XAF", latitude: "6.611111", longitude: "20.939444", currency_name: "CFA Franc BEAC", languages: ["fr", "sg"], capital: "Bangui", emoji: "🇨🇫", emojiU: "U+1F1E8 U+1F1EB", fips: "CT", internet: "CF", continent: "Africa", region: "Central Africa" }, { name: "Chad", alpha2: "TD", alpha3: "TCD", numeric: "148", locales: ["fr_TD"], default_locale: "fr_TD", currency: "XAF", latitude: "15.454166", longitude: "18.732207", currency_name: "CFA Franc BEAC", languages: ["fr", "ar"], capital: "N'Djamena", emoji: "🇹🇩", emojiU: "U+1F1F9 U+1F1E9", fips: "CD", internet: "TD", continent: "Africa", region: "Central Africa" }, { name: "Chile", alpha2: "CL", alpha3: "CHL", numeric: "152", locales: ["es_CL"], default_locale: "es_CL", currency: "CLP", latitude: "-35.675147", longitude: "-71.542969", currency_name: "Chilean Peso", languages: ["es"], capital: "Santiago", emoji: "🇨🇱", emojiU: "U+1F1E8 U+1F1F1", fips: "CI", internet: "CL", continent: "Americas", region: "South America" }, { name: "China", alpha2: "CN", alpha3: "CHN", numeric: "156", locales: ["zh_CN", "zh_Hans_CN", "ii_CN", "bo_CN"], default_locale: "zh_CN", currency: "CNY", latitude: "35.86166", longitude: "104.195397", currency_name: "Yuan Renminbi", languages: ["zh"], capital: "Beijing", emoji: "🇨🇳", emojiU: "U+1F1E8 U+1F1F3", fips: "CH", internet: "CN", continent: "Asia", region: "East Asia" }, { name: "Christmas Island", alpha2: "CX", alpha3: "CXR", numeric: "162", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-10.447525", longitude: "105.690449", currency_name: "Australian Dollar", languages: ["en"], capital: "Flying Fish Cove", emoji: "🇨🇽", emojiU: "U+1F1E8 U+1F1FD", fips: "KT", internet: "CX", continent: "Asia", region: "South East Asia" }, { name: "Cocos Islands", alpha2: "CC", alpha3: "CCK", numeric: "166", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-12.164165", longitude: "96.870956", currency_name: "Australian Dollar", languages: ["en"], capital: "West Island", emoji: "🇨🇨", emojiU: "U+1F1E8 U+1F1E8", fips: "CK", internet: "CC", continent: "Asia", region: "South East Asia", alternate_names: ["Cocos Keeling Islands"] }, { name: "Colombia", alpha2: "CO", alpha3: "COL", numeric: "170", locales: ["es_CO"], default_locale: "es_CO", currency: "COP", latitude: "4.570868", longitude: "-74.297333", currency_name: "Colombian Peso", languages: ["es"], capital: "Bogotá", emoji: "🇨🇴", emojiU: "U+1F1E8 U+1F1F4", fips: "CO", internet: "CO", continent: "Americas", region: "South America" }, { name: "Comoros", alpha2: "KM", alpha3: "COM", numeric: "174", locales: ["fr_KM"], default_locale: "fr_KM", currency: "KMF", latitude: "-11.875001", longitude: "43.872219", currency_name: "Comorian Franc ", languages: ["ar", "fr"], capital: "Moroni", emoji: "🇰🇲", emojiU: "U+1F1F0 U+1F1F2", fips: "CN", internet: "KM", continent: "Africa", region: "Indian Ocean" }, { name: "Democratic Republic of the Congo", alpha2: "CD", alpha3: "COD", numeric: "180", locales: ["fr_CD"], default_locale: "fr_CD", currency: "CDF", latitude: "-4.038333", longitude: "21.758664", currency_name: "Congolese Franc", languages: ["fr", "ln", "kg", "sw", "lu"], capital: "Kinshasa", emoji: "🇨🇩", emojiU: "U+1F1E8 U+1F1E9", fips: "CG", internet: "ZR", continent: "Africa", region: "Central Africa" }, { name: "Congo", alpha2: "CG", alpha3: "COG", numeric: "178", locales: ["fr_CG"], default_locale: "fr_CG", currency: "XAF", latitude: "-0.228021", longitude: "15.827659", currency_name: "CFA Franc BEAC", languages: ["fr", "ln"], capital: "Brazzaville", emoji: "🇨🇬", emojiU: "U+1F1E8 U+1F1EC", fips: "CF", internet: "CG", continent: "Africa", region: "Central Africa" }, { name: "Cook Islands", alpha2: "CK", alpha3: "COK", numeric: "184", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-21.236736", longitude: "-159.777671", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Avarua", emoji: "🇨🇰", emojiU: "U+1F1E8 U+1F1F0", fips: "CW", internet: "CK", continent: "Oceania", region: "Pacific" }, { name: "Costa Rica", alpha2: "CR", alpha3: "CRI", numeric: "188", locales: ["es_CR"], default_locale: "es_CR", currency: "CRC", latitude: "9.748917", longitude: "-83.753428", currency_name: "Costa Rican Colon", languages: ["es"], capital: "San José", emoji: "🇨🇷", emojiU: "U+1F1E8 U+1F1F7", fips: "CS", internet: "CR", continent: "Americas", region: "Central America" }, { name: "Croatia", alpha2: "HR", alpha3: "HRV", numeric: "191", locales: ["hr_HR"], default_locale: "hr_HR", currency: "EUR", latitude: "45.1", longitude: "15.2", currency_name: "Euro", languages: ["hr"], capital: "Zagreb", emoji: "🇭🇷", emojiU: "U+1F1ED U+1F1F7", fips: "HR", internet: "HR", continent: "Europe", region: "South East Europe" }, { name: "Cuba", alpha2: "CU", alpha3: "CUB", numeric: "192", locales: ["es"], default_locale: "es", currency: "CUC", latitude: "21.521757", longitude: "-77.781167", currency_name: "Peso Convertible", languages: ["es"], capital: "Havana", emoji: "🇨🇺", emojiU: "U+1F1E8 U+1F1FA", fips: "CU", internet: "CU", continent: "Americas", region: "West Indies" }, { name: "Curaçao", alpha2: "CW", alpha3: "CUW", numeric: "531", locales: ["nl"], default_locale: "nl", currency: "ANG", currency_name: "Netherlands Antillean Guilder", languages: ["nl", "pa", "en"], capital: "Willemstad", emoji: "🇨🇼", emojiU: "U+1F1E8 U+1F1FC", fips: "UC", internet: "CW", continent: "Americas", region: "West Indies" }, { name: "Cyprus", alpha2: "CY", alpha3: "CYP", numeric: "196", locales: ["el_CY"], default_locale: "el_CY", currency: "EUR", latitude: "35.126413", longitude: "33.429859", currency_name: "Euro", languages: ["el", "tr", "hy"], capital: "Nicosia", emoji: "🇨🇾", emojiU: "U+1F1E8 U+1F1FE", fips: "CY", internet: "CY", continent: "Asia", region: "South West Asia" }, { name: "Czechia", alpha2: "CZ", alpha3: "CZE", numeric: "203", locales: ["cs_CZ"], default_locale: "cs_CZ", currency: "CZK", latitude: "49.817492", longitude: "15.472962", currency_name: "Czech Koruna", languages: ["cs", "sk"], capital: "Prague", emoji: "🇨🇿", emojiU: "U+1F1E8 U+1F1FF", fips: "EZ", internet: "CZ", continent: "Europe", region: "Central Europe" }, { name: "Côte d'Ivoire", alpha2: "CI", alpha3: "CIV", numeric: "384", locales: ["fr_CI"], default_locale: "fr_CI", currency: "CZK", latitude: "7.539989", longitude: "-5.54708", currency_name: "Czech Koruna", languages: ["fr"], capital: "Yamoussoukro", emoji: "🇨🇮", emojiU: "U+1F1E8 U+1F1EE", fips: "IV", internet: "CI", continent: "Africa", region: "Western Africa" }, { name: "Denmark", alpha2: "DK", alpha3: "DNK", numeric: "208", locales: ["da_DK"], default_locale: "da_DK", currency: "DKK", latitude: "56.26392", longitude: "9.501785", currency_name: "Danish Krone", languages: ["da"], capital: "Copenhagen", emoji: "🇩🇰", emojiU: "U+1F1E9 U+1F1F0", fips: "DA", internet: "DK", continent: "Europe", region: "Northern Europe" }, { name: "Djibouti", alpha2: "DJ", alpha3: "DJI", numeric: "262", locales: ["fr_DJ", "so_DJ"], default_locale: "fr_DJ", currency: "DJF", latitude: "11.825138", longitude: "42.590275", currency_name: "Djibouti Franc", languages: ["fr", "ar"], capital: "Djibouti", emoji: "🇩🇯", emojiU: "U+1F1E9 U+1F1EF", fips: "DJ", internet: "DJ", continent: "Africa", region: "Eastern Africa" }, { name: "Dominica", alpha2: "DM", alpha3: "DMA", numeric: "212", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "15.414999", longitude: "-61.370976", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Roseau", emoji: "🇩🇲", emojiU: "U+1F1E9 U+1F1F2", fips: "DO", internet: "DM", continent: "Americas", region: "West Indies" }, { name: "Dominican Republic", alpha2: "DO", alpha3: "DOM", numeric: "214", locales: ["es_DO"], default_locale: "es_DO", currency: "DOP", latitude: "18.735693", longitude: "-70.162651", currency_name: "Dominican Peso", languages: ["es"], capital: "Santo Domingo", emoji: "🇩🇴", emojiU: "U+1F1E9 U+1F1F4", fips: "DR", internet: "DO", continent: "Americas", region: "West Indies" }, { name: "Ecuador", alpha2: "EC", alpha3: "ECU", numeric: "218", locales: ["es_EC"], default_locale: "es_EC", currency: "USD", latitude: "-1.831239", longitude: "-78.183406", currency_name: "US Dollar", languages: ["es"], capital: "Quito", emoji: "🇪🇨", emojiU: "U+1F1EA U+1F1E8", fips: "EC", internet: "EC", continent: "Americas", region: "South America" }, { name: "Egypt", alpha2: "EG", alpha3: "EGY", numeric: "818", locales: ["ar_EG"], default_locale: "ar_EG", currency: "EGP", latitude: "26.820553", longitude: "30.802498", currency_name: "Egyptian Pound", languages: ["ar"], capital: "Cairo", emoji: "🇪🇬", emojiU: "U+1F1EA U+1F1EC", fips: "EG", internet: "EG", continent: "Africa", region: "Northern Africa" }, { name: "El Salvador", alpha2: "SV", alpha3: "SLV", numeric: "222", locales: ["es_SV"], default_locale: "es_SV", currency: "USD", latitude: "13.794185", longitude: "-88.89653", currency_name: "US Dollar", languages: ["es"], capital: "San Salvador", emoji: "🇸🇻", emojiU: "U+1F1F8 U+1F1FB", fips: "ES", internet: "SV", continent: "Americas", region: "Central America" }, { name: "Equatorial Guinea", alpha2: "GQ", alpha3: "GNQ", numeric: "226", locales: ["fr_GQ", "es_GQ"], default_locale: "fr_GQ", currency: "XAF", latitude: "1.650801", longitude: "10.267895", currency_name: "CFA Franc BEAC", languages: ["es", "fr"], capital: "Malabo", emoji: "🇬🇶", emojiU: "U+1F1EC U+1F1F6", fips: "EK", internet: "GQ", continent: "Africa", region: "Western Africa" }, { name: "Eritrea", alpha2: "ER", alpha3: "ERI", numeric: "232", locales: ["ti_ER"], default_locale: "ti_ER", currency: "ERN", latitude: "15.179384", longitude: "39.782334", currency_name: "Nakfa", languages: ["ti", "ar", "en"], capital: "Asmara", emoji: "🇪🇷", emojiU: "U+1F1EA U+1F1F7", fips: "ER", internet: "ER", continent: "Africa", region: "Eastern Africa" }, { name: "Estonia", alpha2: "EE", alpha3: "EST", numeric: "233", locales: ["et_EE"], default_locale: "et_EE", currency: "EUR", latitude: "58.595272", longitude: "25.013607", currency_name: "Euro", languages: ["et"], capital: "Tallinn", emoji: "🇪🇪", emojiU: "U+1F1EA U+1F1EA", fips: "EN", internet: "EE", continent: "Europe", region: "Eastern Europe" }, { name: "Eswatini", alpha2: "SZ", alpha3: "SWZ", numeric: "748", locales: ["en"], default_locale: "en", currency: "EUR", latitude: "-26.522503", longitude: "31.465866", currency_name: "Euro", languages: ["en", "ss"], capital: "Lobamba", emoji: "🇸🇿", emojiU: "U+1F1F8 U+1F1FF", fips: "WZ", internet: "SZ", continent: "Africa", region: "Southern Africa" }, { name: "Ethiopia", alpha2: "ET", alpha3: "ETH", numeric: "231", locales: ["am_ET", "om_ET", "so_ET", "ti_ET"], default_locale: "am_ET", currency: "ETB", latitude: "9.145", longitude: "40.489673", currency_name: "Ethiopian Birr", languages: ["am"], capital: "Addis Ababa", emoji: "🇪🇹", emojiU: "U+1F1EA U+1F1F9", fips: "ET", internet: "ET", continent: "Africa", region: "Eastern Africa" }, { name: "Falkland Islands", alpha2: "FK", alpha3: "FLK", numeric: "238", locales: ["en"], default_locale: "en", currency: "DKK", latitude: "-51.796253", longitude: "-59.523613", currency_name: "Danish Krone", languages: ["en"], capital: "Stanley", emoji: "🇫🇰", emojiU: "U+1F1EB U+1F1F0", fips: "FA", internet: "FK", continent: "Americas", region: "South America", alternate_names: ["Malvinas Falkland Islands"] }, { name: "Faroe Islands", alpha2: "FO", alpha3: "FRO", numeric: "234", locales: ["fo_FO"], default_locale: "fo_FO", currency: "DKK", latitude: "61.892635", longitude: "-6.911806", currency_name: "Danish Krone", languages: ["fo"], capital: "Tórshavn", emoji: "🇫🇴", emojiU: "U+1F1EB U+1F1F4", fips: "FO", internet: "FO", continent: "Europe", region: "Northern Europe" }, { name: "Fiji", alpha2: "FJ", alpha3: "FJI", numeric: "242", locales: ["en"], default_locale: "en", currency: "FJD", latitude: "-16.578193", longitude: "179.414413", currency_name: "Fiji Dollar", languages: ["en", "fj", "hi", "ur"], capital: "Suva", emoji: "🇫🇯", emojiU: "U+1F1EB U+1F1EF", fips: "FJ", internet: "FJ", continent: "Oceania", region: "Pacific" }, { name: "Finland", alpha2: "FI", alpha3: "FIN", numeric: "246", locales: ["fi_FI", "sv_FI"], default_locale: "fi_FI", currency: "EUR", latitude: "61.92411", longitude: "25.748151", currency_name: "Euro", languages: ["fi", "sv"], capital: "Helsinki", emoji: "🇫🇮", emojiU: "U+1F1EB U+1F1EE", fips: "FI", internet: "FI", continent: "Europe", region: "Northern Europe" }, { name: "France", alpha2: "FR", alpha3: "FRA", numeric: "250", locales: ["fr_FR"], default_locale: "fr_FR", currency: "EUR", latitude: "46.227638", longitude: "2.213749", currency_name: "Euro", languages: ["fr"], capital: "Paris", emoji: "🇫🇷", emojiU: "U+1F1EB U+1F1F7", fips: "FR", internet: "FR", continent: "Europe", region: "Western Europe" }, { name: "French Guiana", alpha2: "GF", alpha3: "GUF", numeric: "254", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "3.933889", longitude: "-53.125782", currency_name: "Euro", languages: ["fr"], capital: "Cayenne", emoji: "🇬🇫", emojiU: "U+1F1EC U+1F1EB", fips: "FG", internet: "GF", continent: "Americas", region: "South America" }, { name: "French Polynesia", alpha2: "PF", alpha3: "PYF", numeric: "258", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-17.679742", longitude: "-149.406843", currency_name: "CFP Franc", languages: ["fr"], capital: "Papeetē", emoji: "🇵🇫", emojiU: "U+1F1F5 U+1F1EB", fips: "FP", internet: "PF", continent: "Oceania", region: "Pacific" }, { name: "French Southern Territories", alpha2: "TF", alpha3: "ATF", numeric: "260", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "-49.280366", longitude: "69.348557", currency_name: "Euro", languages: ["fr"], capital: "Port-aux-Français", emoji: "🇹🇫", emojiU: "U+1F1F9 U+1F1EB", fips: "FS", internet: "--", continent: "Indian Ocean", region: "Southern Indian Ocean" }, { name: "Gabon", alpha2: "GA", alpha3: "GAB", numeric: "266", locales: ["fr_GA"], default_locale: "fr_GA", currency: "XAF", latitude: "-0.803689", longitude: "11.609444", currency_name: "CFA Franc BEAC", languages: ["fr"], capital: "Libreville", emoji: "🇬🇦", emojiU: "U+1F1EC U+1F1E6", fips: "GB", internet: "GA", continent: "Africa", region: "Western Africa" }, { name: "Gambia", alpha2: "GM", alpha3: "GMB", numeric: "270", locales: ["en"], default_locale: "en", currency: "GMD", latitude: "13.443182", longitude: "-15.310139", currency_name: "Dalasi", languages: ["en"], capital: "Banjul", emoji: "🇬🇲", emojiU: "U+1F1EC U+1F1F2", fips: "GA", internet: "GM", continent: "Africa", region: "Western Africa" }, { name: "Georgia", alpha2: "GE", alpha3: "GEO", numeric: "268", locales: ["ka_GE"], default_locale: "ka_GE", currency: "GEL", latitude: "42.315407", longitude: "43.356892", currency_name: "Lari", languages: ["ka"], capital: "Tbilisi", emoji: "🇬🇪", emojiU: "U+1F1EC U+1F1EA", fips: "GG", internet: "GE", continent: "Asia", region: "South West Asia" }, { name: "Germany", alpha2: "DE", alpha3: "DEU", numeric: "276", locales: ["de_DE"], default_locale: "de_DE", currency: "EUR", latitude: "51.165691", longitude: "10.451526", currency_name: "Euro", languages: ["de"], capital: "Berlin", emoji: "🇩🇪", emojiU: "U+1F1E9 U+1F1EA", fips: "GM", internet: "DE", continent: "Europe", region: "Western Europe" }, { name: "Ghana", alpha2: "GH", alpha3: "GHA", numeric: "288", locales: ["ak_GH", "ee_GH", "ha_Latn_GH"], default_locale: "ak_GH", currency: "GHS", latitude: "7.946527", longitude: "-1.023194", currency_name: "Ghana Cedi", languages: ["en"], capital: "Accra", emoji: "🇬🇭", emojiU: "U+1F1EC U+1F1ED", fips: "GH", internet: "GH", continent: "Africa", region: "Western Africa" }, { name: "Gibraltar", alpha2: "GI", alpha3: "GIB", numeric: "292", locales: ["en"], default_locale: "en", currency: "GIP", latitude: "36.137741", longitude: "-5.345374", currency_name: "Gibraltar Pound", languages: ["en"], capital: "Gibraltar", emoji: "🇬🇮", emojiU: "U+1F1EC U+1F1EE", fips: "GI", internet: "GI", continent: "Europe", region: "South West Europe" }, { name: "Greece", alpha2: "GR", alpha3: "GRC", numeric: "300", locales: ["el_GR"], default_locale: "el_GR", currency: "EUR", latitude: "39.074208", longitude: "21.824312", currency_name: "Euro", languages: ["el"], capital: "Athens", emoji: "🇬🇷", emojiU: "U+1F1EC U+1F1F7", fips: "GR", internet: "GR", continent: "Europe", region: "South East Europe" }, { name: "Greenland", alpha2: "GL", alpha3: "GRL", numeric: "304", locales: ["kl_GL"], default_locale: "kl_GL", currency: "DKK", latitude: "71.706936", longitude: "-42.604303", currency_name: "Danish Krone", languages: ["kl"], capital: "Nuuk", emoji: "🇬🇱", emojiU: "U+1F1EC U+1F1F1", fips: "GL", internet: "GL", continent: "Americas", region: "North America" }, { name: "Grenada", alpha2: "GD", alpha3: "GRD", numeric: "308", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "12.262776", longitude: "-61.604171", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "St. George's", emoji: "🇬🇩", emojiU: "U+1F1EC U+1F1E9", fips: "GJ", internet: "GD", continent: "Americas", region: "West Indies" }, { name: "Guadeloupe", alpha2: "GP", alpha3: "GLP", numeric: "312", locales: ["fr_GP"], default_locale: "fr_GP", currency: "EUR", latitude: "16.995971", longitude: "-62.067641", currency_name: "Euro", languages: ["fr"], capital: "Basse-Terre", emoji: "🇬🇵", emojiU: "U+1F1EC U+1F1F5", fips: "GP", internet: "GP", continent: "Americas", region: "West Indies" }, { name: "Guam", alpha2: "GU", alpha3: "GUM", numeric: "316", locales: ["en_GU"], default_locale: "en_GU", currency: "USD", latitude: "13.444304", longitude: "144.793731", currency_name: "US Dollar", languages: ["en", "ch", "es"], capital: "Hagåtña", emoji: "🇬🇺", emojiU: "U+1F1EC U+1F1FA", fips: "GQ", internet: "GU", continent: "Oceania", region: "Pacific" }, { name: "Guatemala", alpha2: "GT", alpha3: "GTM", numeric: "320", locales: ["es_GT"], default_locale: "es_GT", currency: "GTQ", latitude: "15.783471", longitude: "-90.230759", currency_name: "Quetzal", languages: ["es"], capital: "Guatemala City", emoji: "🇬🇹", emojiU: "U+1F1EC U+1F1F9", fips: "GT", internet: "GT", continent: "Americas", region: "Central America" }, { name: "Guernsey", alpha2: "GG", alpha3: "GGY", numeric: "831", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "49.465691", longitude: "-2.585278", currency_name: "Pound Sterling", languages: ["en", "fr"], capital: "St. Peter Port", emoji: "🇬🇬", emojiU: "U+1F1EC U+1F1EC", fips: "GK", internet: "GG", continent: "Europe", region: "Western Europe" }, { name: "Guinea", alpha2: "GN", alpha3: "GIN", numeric: "324", locales: ["fr_GN"], default_locale: "fr_GN", currency: "GNF", latitude: "9.945587", longitude: "-9.696645", currency_name: "Guinean Franc", languages: ["fr", "ff"], capital: "Conakry", emoji: "🇬🇳", emojiU: "U+1F1EC U+1F1F3", fips: "GV", internet: "GN", continent: "Africa", region: "Western Africa" }, { name: "Guinea-Bissau", alpha2: "GW", alpha3: "GNB", numeric: "624", locales: ["pt_GW"], default_locale: "pt_GW", currency: "XOF", latitude: "11.803749", longitude: "-15.180413", currency_name: "CFA Franc BCEAO", languages: ["pt"], capital: "Bissau", emoji: "🇬🇼", emojiU: "U+1F1EC U+1F1FC", fips: "PU", internet: "GW", continent: "Africa", region: "Western Africa" }, { name: "Guyana", alpha2: "GY", alpha3: "GUY", numeric: "328", locales: ["en"], default_locale: "en", currency: "GYD", latitude: "4.860416", longitude: "-58.93018", currency_name: "Guyana Dollar", languages: ["en"], capital: "Georgetown", emoji: "🇬🇾", emojiU: "U+1F1EC U+1F1FE", fips: "GY", internet: "GY", continent: "Americas", region: "South America" }, { name: "Haiti", alpha2: "HT", alpha3: "HTI", numeric: "332", locales: ["fr"], default_locale: "fr", currency: "USD", latitude: "18.971187", longitude: "-72.285215", currency_name: "US Dollar", languages: ["fr", "ht"], capital: "Port-au-Prince", emoji: "🇭🇹", emojiU: "U+1F1ED U+1F1F9", fips: "HA", internet: "HT", continent: "Americas", region: "West Indies" }, { name: "Heard Island and McDonald Islands", alpha2: "HM", alpha3: "HMD", numeric: "334", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-53.08181", longitude: "73.504158", currency_name: "Australian Dollar", languages: ["en"], capital: "", emoji: "🇭🇲", emojiU: "U+1F1ED U+1F1F2", fips: "HM", internet: "HM", continent: "Indian Ocean", region: "Southern Indian Ocean" }, { name: "Holy See", alpha2: "VA", alpha3: "VAT", numeric: "336", locales: ["it"], default_locale: "it", currency: "EUR", latitude: "41.902916", longitude: "12.453389", currency_name: "Euro", languages: ["it", "la"], capital: "Vatican City", emoji: "🇻🇦", emojiU: "U+1F1FB U+1F1E6", fips: "VT", internet: "VA", continent: "Europe", region: "Southern Europe" }, { name: "Honduras", alpha2: "HN", alpha3: "HND", numeric: "340", locales: ["es_HN"], default_locale: "es_HN", currency: "HNL", latitude: "15.199999", longitude: "-86.241905", currency_name: "Lempira", languages: ["es"], capital: "Tegucigalpa", emoji: "🇭🇳", emojiU: "U+1F1ED U+1F1F3", fips: "HO", internet: "HN", continent: "Americas", region: "Central America" }, { name: "Hong Kong", alpha2: "HK", alpha3: "HKG", numeric: "344", locales: ["yue_Hant_HK", "zh_Hans_HK", "zh_Hant_HK", "en_HK"], default_locale: "en_HK", currency: "HKD", latitude: "22.396428", longitude: "114.109497", currency_name: "Hong Kong Dollar", languages: ["zh", "en"], capital: "City of Victoria", emoji: "🇭🇰", emojiU: "U+1F1ED U+1F1F0", fips: "HK", internet: "HK", continent: "Asia", region: "East Asia" }, { name: "Hungary", alpha2: "HU", alpha3: "HUN", numeric: "348", locales: ["hu_HU"], default_locale: "hu_HU", currency: "HUF", latitude: "47.162494", longitude: "19.503304", currency_name: "Forint", languages: ["hu"], capital: "Budapest", emoji: "🇭🇺", emojiU: "U+1F1ED U+1F1FA", fips: "HU", internet: "HU", continent: "Europe", region: "Central Europe" }, { name: "Iceland", alpha2: "IS", alpha3: "ISL", numeric: "352", locales: ["is_IS"], default_locale: "is_IS", currency: "ISK", latitude: "64.963051", longitude: "-19.020835", currency_name: "Iceland Krona", languages: ["is"], capital: "Reykjavik", emoji: "🇮🇸", emojiU: "U+1F1EE U+1F1F8", fips: "IC", internet: "IS", continent: "Europe", region: "Northern Europe" }, { name: "India", alpha2: "IN", alpha3: "IND", numeric: "356", locales: ["as_IN", "bn_IN", "en_IN", "gu_IN", "hi_IN", "kn_IN", "kok_IN", "ml_IN", "mr_IN", "ne_IN", "or_IN", "pa_Guru_IN", "ta_IN", "te_IN", "bo_IN", "ur_IN"], default_locale: "hi_IN", currency: "INR", latitude: "20.593684", longitude: "78.96288", currency_name: "Indian Rupee", languages: ["hi", "en"], capital: "New Delhi", emoji: "🇮🇳", emojiU: "U+1F1EE U+1F1F3", fips: "IN", internet: "IN", continent: "Asia", region: "South Asia" }, { name: "Indonesia", alpha2: "ID", alpha3: "IDN", numeric: "360", locales: ["id_ID"], default_locale: "id_ID", currency: "IDR", latitude: "-0.789275", longitude: "113.921327", currency_name: "Rupiah", languages: ["id"], capital: "Jakarta", emoji: "🇮🇩", emojiU: "U+1F1EE U+1F1E9", fips: "ID", internet: "ID", continent: "Asia", region: "South East Asia" }, { name: "Iran", alpha2: "IR", alpha3: "IRN", numeric: "364", locales: ["fa_IR"], default_locale: "fa_IR", currency: "XDR", latitude: "32.427908", longitude: "53.688046", currency_name: "SDR (Special Drawing Right)", languages: ["fa"], capital: "Tehran", emoji: "🇮🇷", emojiU: "U+1F1EE U+1F1F7", fips: "IR", internet: "IR", continent: "Asia", region: "South West Asia", alternate_names: ["Islamic Republic of Iran"] }, { name: "Iraq", alpha2: "IQ", alpha3: "IRQ", numeric: "368", locales: ["ar_IQ"], default_locale: "ar_IQ", currency: "IQD", latitude: "33.223191", longitude: "43.679291", currency_name: "Iraqi Dinar", languages: ["ar", "ku"], capital: "Baghdad", emoji: "🇮🇶", emojiU: "U+1F1EE U+1F1F6", fips: "IZ", internet: "IQ", continent: "Asia", region: "South West Asia" }, { name: "Ireland", alpha2: "IE", alpha3: "IRL", numeric: "372", locales: ["en_IE", "ga_IE"], default_locale: "en_IE", currency: "EUR", latitude: "53.41291", longitude: "-8.24389", currency_name: "Euro", languages: ["ga", "en"], capital: "Dublin", emoji: "🇮🇪", emojiU: "U+1F1EE U+1F1EA", fips: "EI", internet: "IE", continent: "Europe", region: "Western Europe" }, { name: "Isle of Man", alpha2: "IM", alpha3: "IMN", numeric: "833", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "54.236107", longitude: "-4.548056", currency_name: "Pound Sterling", languages: ["en", "gv"], capital: "Douglas", emoji: "🇮🇲", emojiU: "U+1F1EE U+1F1F2", fips: "IM", internet: "IM", continent: "Europe", region: "Western Europe" }, { name: "Israel", alpha2: "IL", alpha3: "ISR", numeric: "376", locales: ["en_IL", "he_IL"], default_locale: "he_IL", currency: "ILS", latitude: "31.046051", longitude: "34.851612", currency_name: "New Israeli Sheqel", languages: ["he", "ar"], capital: "Jerusalem", emoji: "🇮🇱", emojiU: "U+1F1EE U+1F1F1", fips: "IS", internet: "IL", continent: "Asia", region: "South West Asia" }, { name: "Italy", alpha2: "IT", alpha3: "ITA", numeric: "380", locales: ["it_IT"], default_locale: "it_IT", currency: "EUR", latitude: "41.87194", longitude: "12.56738", currency_name: "Euro", languages: ["it"], capital: "Rome", emoji: "🇮🇹", emojiU: "U+1F1EE U+1F1F9", fips: "IT", internet: "IT", continent: "Europe", region: "Southern Europe" }, { name: "Jamaica", alpha2: "JM", alpha3: "JAM", numeric: "388", locales: ["en_JM"], default_locale: "en_JM", currency: "JMD", latitude: "18.109581", longitude: "-77.297508", currency_name: "Jamaican Dollar", languages: ["en"], capital: "Kingston", emoji: "🇯🇲", emojiU: "U+1F1EF U+1F1F2", fips: "JM", internet: "JM", continent: "Americas", region: "West Indies" }, { name: "Japan", alpha2: "JP", alpha3: "JPN", numeric: "392", locales: ["ja_JP"], default_locale: "ja_JP", currency: "JPY", latitude: "36.204824", longitude: "138.252924", currency_name: "Yen", languages: ["ja"], capital: "Tokyo", emoji: "🇯🇵", emojiU: "U+1F1EF U+1F1F5", fips: "JA", internet: "JP", continent: "Asia", region: "East Asia" }, { name: "Jersey", alpha2: "JE", alpha3: "JEY", numeric: "832", locales: ["en"], default_locale: "en", currency: "GBP", latitude: "49.214439", longitude: "-2.13125", currency_name: "Pound Sterling", languages: ["en", "fr"], capital: "Saint Helier", emoji: "🇯🇪", emojiU: "U+1F1EF U+1F1EA", fips: "JE", internet: "JE", continent: "Europe", region: "Western Europe" }, { name: "Jordan", alpha2: "JO", alpha3: "JOR", numeric: "400", locales: ["ar_JO"], default_locale: "ar_JO", currency: "JOD", latitude: "30.585164", longitude: "36.238414", currency_name: "Jordanian Dinar", languages: ["ar"], capital: "Amman", emoji: "🇯🇴", emojiU: "U+1F1EF U+1F1F4", fips: "JO", internet: "JO", continent: "Asia", region: "South West Asia" }, { name: "Kazakhstan", alpha2: "KZ", alpha3: "KAZ", numeric: "398", locales: ["kk_Cyrl_KZ"], default_locale: "kk_Cyrl_KZ", currency: "KZT", latitude: "48.019573", longitude: "66.923684", currency_name: "Tenge", languages: ["kk", "ru"], capital: "Astana", emoji: "🇰🇿", emojiU: "U+1F1F0 U+1F1FF", fips: "KZ", internet: "KZ", continent: "Asia", region: "Central Asia" }, { name: "Kenya", alpha2: "KE", alpha3: "KEN", numeric: "404", locales: ["ebu_KE", "guz_KE", "kln_KE", "kam_KE", "ki_KE", "luo_KE", "luy_KE", "mas_KE", "mer_KE", "om_KE", "saq_KE", "so_KE", "sw_KE", "dav_KE", "teo_KE"], default_locale: "ebu_KE", currency: "KES", latitude: "-0.023559", longitude: "37.906193", currency_name: "Kenyan Shilling", languages: ["en", "sw"], capital: "Nairobi", emoji: "🇰🇪", emojiU: "U+1F1F0 U+1F1EA", fips: "KE", internet: "KE", continent: "Africa", region: "Eastern Africa" }, { name: "Kiribati", alpha2: "KI", alpha3: "KIR", numeric: "296", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-3.370417", longitude: "-168.734039", currency_name: "Australian Dollar", languages: ["en"], capital: "South Tarawa", emoji: "🇰🇮", emojiU: "U+1F1F0 U+1F1EE", fips: "KR", internet: "KI", continent: "Oceania", region: "Pacific" }, { name: "North Korea", alpha2: "KP", alpha3: "PRK", numeric: "408", locales: ["ko"], default_locale: "ko", currency: "KPW", latitude: "40.339852", longitude: "127.510093", currency_name: "North Korean Won", languages: ["ko"], capital: "Pyongyang", emoji: "🇰🇵", emojiU: "U+1F1F0 U+1F1F5", fips: "KN", internet: "KP", continent: "Asia", region: "East Asia", alternate_names: ["Democratic People's Republic of Korea"] }, { name: "South Korea", alpha2: "KR", alpha3: "KOR", numeric: "410", locales: ["ko_KR"], default_locale: "ko_KR", currency: "KRW", latitude: "35.907757", longitude: "127.766922", currency_name: "Won", languages: ["ko"], capital: "Seoul", emoji: "🇰🇷", emojiU: "U+1F1F0 U+1F1F7", fips: "KS", internet: "KR", continent: "Asia", region: "East Asia", alternate_names: ["Republic of Korea"] }, { name: "Kuwait", alpha2: "KW", alpha3: "KWT", numeric: "414", locales: ["ar_KW"], default_locale: "ar_KW", currency: "KWD", latitude: "29.31166", longitude: "47.481766", currency_name: "Kuwaiti Dinar", languages: ["ar"], capital: "Kuwait City", emoji: "🇰🇼", emojiU: "U+1F1F0 U+1F1FC", fips: "KU", internet: "KW", continent: "Asia", region: "South West Asia" }, { name: "Kyrgyzstan", alpha2: "KG", alpha3: "KGZ", numeric: "417", locales: ["ky"], default_locale: "ky", currency: "KGS", latitude: "41.20438", longitude: "74.766098", currency_name: "Som", languages: ["ky", "ru"], capital: "Bishkek", emoji: "🇰🇬", emojiU: "U+1F1F0 U+1F1EC", fips: "KG", internet: "KG", continent: "Asia", region: "Central Asia" }, { name: "Lao People's Democratic Republic", alpha2: "LA", alpha3: "LAO", numeric: "418", locales: ["lo"], default_locale: "lo", currency: "LAK", latitude: "19.85627", longitude: "102.495496", currency_name: "Lao Kip", languages: ["lo"], capital: "Vientiane", emoji: "🇱🇦", emojiU: "U+1F1F1 U+1F1E6", fips: "LA", internet: "LA", continent: "Asia", region: "South East Asia" }, { name: "Latvia", alpha2: "LV", alpha3: "LVA", numeric: "428", locales: ["lv_LV"], default_locale: "lv_LV", currency: "EUR", latitude: "56.879635", longitude: "24.603189", currency_name: "Euro", languages: ["lv"], capital: "Riga", emoji: "🇱🇻", emojiU: "U+1F1F1 U+1F1FB", fips: "LG", internet: "LV", continent: "Europe", region: "Eastern Europe" }, { name: "Lebanon", alpha2: "LB", alpha3: "LBN", numeric: "422", locales: ["ar_LB"], default_locale: "ar_LB", currency: "LBP", latitude: "33.854721", longitude: "35.862285", currency_name: "Lebanese Pound", languages: ["ar", "fr"], capital: "Beirut", emoji: "🇱🇧", emojiU: "U+1F1F1 U+1F1E7", fips: "LE", internet: "LB", continent: "Asia", region: "South West Asia" }, { name: "Lesotho", alpha2: "LS", alpha3: "LSO", numeric: "426", locales: ["en"], default_locale: "en", currency: "ZAR", latitude: "-29.609988", longitude: "28.233608", currency_name: "Rand", languages: ["en", "st"], capital: "Maseru", emoji: "🇱🇸", emojiU: "U+1F1F1 U+1F1F8", fips: "LT", internet: "LS", continent: "Africa", region: "Southern Africa" }, { name: "Liberia", alpha2: "LR", alpha3: "LBR", numeric: "430", locales: ["en"], default_locale: "en", currency: "LRD", latitude: "6.428055", longitude: "-9.429499", currency_name: "Liberian Dollar", languages: ["en"], capital: "Monrovia", emoji: "🇱🇷", emojiU: "U+1F1F1 U+1F1F7", fips: "LI", internet: "LR", continent: "Africa", region: "Western Africa" }, { name: "Libya", alpha2: "LY", alpha3: "LBY", numeric: "434", locales: ["ar_LY"], default_locale: "ar_LY", currency: "LYD", latitude: "26.3351", longitude: "17.228331", currency_name: "Libyan Dinar", languages: ["ar"], capital: "Tripoli", emoji: "🇱🇾", emojiU: "U+1F1F1 U+1F1FE", fips: "LY", internet: "LY", continent: "Africa", region: "Northern Africa" }, { name: "Liechtenstein", alpha2: "LI", alpha3: "LIE", numeric: "438", locales: ["de_LI"], default_locale: "de_LI", currency: "CHF", latitude: "47.166", longitude: "9.555373", currency_name: "Swiss Franc", languages: ["de"], capital: "Vaduz", emoji: "🇱🇮", emojiU: "U+1F1F1 U+1F1EE", fips: "LS", internet: "LI", continent: "Europe", region: "Central Europe" }, { name: "Lithuania", alpha2: "LT", alpha3: "LTU", numeric: "440", locales: ["lt_LT"], default_locale: "lt_LT", currency: "EUR", latitude: "55.169438", longitude: "23.881275", currency_name: "Euro", languages: ["lt"], capital: "Vilnius", emoji: "🇱🇹", emojiU: "U+1F1F1 U+1F1F9", fips: "LH", internet: "LT", continent: "Europe", region: "Eastern Europe" }, { name: "Luxembourg", alpha2: "LU", alpha3: "LUX", numeric: "442", locales: ["fr_LU", "de_LU"], default_locale: "fr_LU", currency: "EUR", latitude: "49.815273", longitude: "6.129583", currency_name: "Euro", languages: ["fr", "de", "lb"], capital: "Luxembourg", emoji: "🇱🇺", emojiU: "U+1F1F1 U+1F1FA", fips: "LU", internet: "LU", continent: "Europe", region: "Western Europe" }, { name: "Macao", alpha2: "MO", alpha3: "MAC", numeric: "446", locales: ["zh_Hans_MO", "zh_Hant_MO"], default_locale: "zh_Hans_MO", currency: "MOP", latitude: "22.198745", longitude: "113.543873", currency_name: "Pataca", languages: ["zh", "pt"], capital: "", emoji: "🇲🇴", emojiU: "U+1F1F2 U+1F1F4", fips: "MC", internet: "MO", continent: "Asia", region: "East Asia" }, { name: "Madagascar", alpha2: "MG", alpha3: "MDG", numeric: "450", locales: ["fr_MG", "mg_MG"], default_locale: "fr_MG", currency: "MGA", latitude: "-18.766947", longitude: "46.869107", currency_name: "Malagasy Ariary", languages: ["fr", "mg"], capital: "Antananarivo", emoji: "🇲🇬", emojiU: "U+1F1F2 U+1F1EC", fips: "MA", internet: "MG", continent: "Africa", region: "Indian Ocean" }, { name: "Malawi", alpha2: "MW", alpha3: "MWI", numeric: "454", locales: ["en"], default_locale: "en", currency: "MWK", latitude: "-13.254308", longitude: "34.301525", currency_name: "Malawi Kwacha", languages: ["en", "ny"], capital: "Lilongwe", emoji: "🇲🇼", emojiU: "U+1F1F2 U+1F1FC", fips: "MI", internet: "MW", continent: "Africa", region: "Southern Africa" }, { name: "Malaysia", alpha2: "MY", alpha3: "MYS", numeric: "458", locales: ["ms_MY"], default_locale: "ms_MY", currency: "MYR", latitude: "4.210484", longitude: "101.975766", currency_name: "Malaysian Ringgit", languages: ["ms"], capital: "Kuala Lumpur", emoji: "🇲🇾", emojiU: "U+1F1F2 U+1F1FE", fips: "MY", internet: "MY", continent: "Asia", region: "South East Asia" }, { name: "Maldives", alpha2: "MV", alpha3: "MDV", numeric: "462", locales: ["dv"], default_locale: "dv", currency: "MVR", latitude: "3.202778", longitude: "73.22068", currency_name: "Rufiyaa", languages: ["dv"], capital: "Malé", emoji: "🇲🇻", emojiU: "U+1F1F2 U+1F1FB", fips: "MV", internet: "MV", continent: "Asia", region: "South Asia" }, { name: "Mali", alpha2: "ML", alpha3: "MLI", numeric: "466", locales: ["bm_ML", "fr_ML", "khq_ML", "ses_ML"], default_locale: "fr_ML", currency: "XOF", latitude: "17.570692", longitude: "-3.996166", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Bamako", emoji: "🇲🇱", emojiU: "U+1F1F2 U+1F1F1", fips: "ML", internet: "ML", continent: "Africa", region: "Western Africa" }, { name: "Malta", alpha2: "MT", alpha3: "MLT", numeric: "470", locales: ["en_MT", "mt_MT"], default_locale: "en_MT", currency: "EUR", latitude: "35.937496", longitude: "14.375416", currency_name: "Euro", languages: ["mt", "en"], capital: "Valletta", emoji: "🇲🇹", emojiU: "U+1F1F2 U+1F1F9", fips: "MT", internet: "MT", continent: "Europe", region: "Southern Europe" }, { name: "Marshall Islands", alpha2: "MH", alpha3: "MHL", numeric: "584", locales: ["en_MH"], default_locale: "en_MH", currency: "USD", latitude: "7.131474", longitude: "171.184478", currency_name: "US Dollar", languages: ["en", "mh"], capital: "Majuro", emoji: "🇲🇭", emojiU: "U+1F1F2 U+1F1ED", fips: "RM", internet: "MH", continent: "Oceania", region: "Pacific" }, { name: "Martinique", alpha2: "MQ", alpha3: "MTQ", numeric: "474", locales: ["fr_MQ"], default_locale: "fr_MQ", currency: "EUR", latitude: "14.641528", longitude: "-61.024174", currency_name: "Euro", languages: ["fr"], capital: "Fort-de-France", emoji: "🇲🇶", emojiU: "U+1F1F2 U+1F1F6", fips: "MB", internet: "MQ", continent: "Americas", region: "West Indies" }, { name: "Mauritania", alpha2: "MR", alpha3: "MRT", numeric: "478", locales: ["ar"], default_locale: "ar", currency: "MRU", latitude: "21.00789", longitude: "-10.940835", currency_name: "Ouguiya", languages: ["ar"], capital: "Nouakchott", emoji: "🇲🇷", emojiU: "U+1F1F2 U+1F1F7", fips: "MR", internet: "MR", continent: "Africa", region: "Western Africa" }, { name: "Mauritius", alpha2: "MU", alpha3: "MUS", numeric: "480", locales: ["en_MU", "mfe_MU"], default_locale: "en_MU", currency: "MUR", latitude: "-20.348404", longitude: "57.552152", currency_name: "Mauritius Rupee", languages: ["en"], capital: "Port Louis", emoji: "🇲🇺", emojiU: "U+1F1F2 U+1F1FA", fips: "MP", internet: "MU", continent: "Africa", region: "Indian Ocean" }, { name: "Mayotte", alpha2: "YT", alpha3: "MYT", numeric: "175", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "-12.8275", longitude: "45.166244", currency_name: "Euro", languages: ["fr"], capital: "Mamoudzou", emoji: "🇾🇹", emojiU: "U+1F1FE U+1F1F9", fips: "MF", internet: "YT", continent: "Africa", region: "Indian Ocean" }, { name: "Mexico", alpha2: "MX", alpha3: "MEX", numeric: "484", locales: ["es_MX"], default_locale: "es_MX", currency: "MXN", latitude: "23.634501", longitude: "-102.552784", currency_name: "Mexican Peso", languages: ["es"], capital: "Mexico City", emoji: "🇲🇽", emojiU: "U+1F1F2 U+1F1FD", fips: "MX", internet: "MX", continent: "Americas", region: "Central America" }, { name: "Micronesia", alpha2: "FM", alpha3: "FSM", numeric: "583", locales: ["en"], default_locale: "en", currency: "RUB", latitude: "7.425554", longitude: "150.550812", currency_name: "Russian Ruble", languages: ["en"], capital: "Palikir", emoji: "🇫🇲", emojiU: "U+1F1EB U+1F1F2", fips: "", internet: "FM", continent: "Oceania", region: "Pacific", alternate_names: ["Federated States of Micronesia"] }, { name: "Moldova", alpha2: "MD", alpha3: "MDA", numeric: "498", locales: ["ro_MD", "ru_MD"], default_locale: "ro_MD", currency: "MDL", latitude: "47.411631", longitude: "28.369885", currency_name: "Moldovan Leu", languages: ["ro"], capital: "Chișinău", emoji: "🇲🇩", emojiU: "U+1F1F2 U+1F1E9", fips: "MD", internet: "MD", continent: "Europe", region: "Eastern Europe", alternate_names: ["Republic of Moldova"] }, { name: "Monaco", alpha2: "MC", alpha3: "MCO", numeric: "492", locales: ["fr_MC"], default_locale: "fr_MC", currency: "EUR", latitude: "43.750298", longitude: "7.412841", currency_name: "Euro", languages: ["fr"], capital: "Monaco", emoji: "🇲🇨", emojiU: "U+1F1F2 U+1F1E8", fips: "MN", internet: "MC", continent: "Europe", region: "Western Europe" }, { name: "Mongolia", alpha2: "MN", alpha3: "MNG", numeric: "496", locales: ["mn"], default_locale: "mn", currency: "MNT", latitude: "46.862496", longitude: "103.846656", currency_name: "Tugrik", languages: ["mn"], capital: "Ulan Bator", emoji: "🇲🇳", emojiU: "U+1F1F2 U+1F1F3", fips: "MG", internet: "MN", continent: "Asia", region: "Northern Asia" }, { name: "Montenegro", alpha2: "ME", alpha3: "MNE", numeric: "499", locales: ["sr_Cyrl_ME", "sr_Latn_ME"], default_locale: "sr_Cyrl_ME", currency: "EUR", latitude: "42.708678", longitude: "19.37439", currency_name: "Euro", languages: ["sr", "bs", "sq", "hr"], capital: "Podgorica", emoji: "🇲🇪", emojiU: "U+1F1F2 U+1F1EA", fips: "MJ", internet: "ME", continent: "Europe", region: "South East Europe" }, { name: "Montserrat", alpha2: "MS", alpha3: "MSR", numeric: "500", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "16.742498", longitude: "-62.187366", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Plymouth", emoji: "🇲🇸", emojiU: "U+1F1F2 U+1F1F8", fips: "MH", internet: "MS", continent: "Americas", region: "West Indies" }, { name: "Morocco", alpha2: "MA", alpha3: "MAR", numeric: "504", locales: ["ar_MA", "tzm_Latn_MA", "shi_Latn_MA", "shi_Tfng_MA"], default_locale: "ar_MA", currency: "MAD", latitude: "31.791702", longitude: "-7.09262", currency_name: "Moroccan Dirham", languages: ["ar"], capital: "Rabat", emoji: "🇲🇦", emojiU: "U+1F1F2 U+1F1E6", fips: "MO", internet: "MA", continent: "Africa", region: "Northern Africa" }, { name: "Mozambique", alpha2: "MZ", alpha3: "MOZ", numeric: "508", locales: ["pt_MZ", "seh_MZ"], default_locale: "pt_MZ", currency: "MZN", latitude: "-18.665695", longitude: "35.529562", currency_name: "Mozambique Metical", languages: ["pt"], capital: "Maputo", emoji: "🇲🇿", emojiU: "U+1F1F2 U+1F1FF", fips: "MZ", internet: "MZ", continent: "Africa", region: "Southern Africa" }, { name: "Myanmar", alpha2: "MM", alpha3: "MMR", numeric: "104", locales: ["my_MM"], default_locale: "my_MM", currency: "MMK", latitude: "21.913965", longitude: "95.956223", currency_name: "Kyat", languages: ["my"], capital: "Naypyidaw", emoji: "🇲🇲", emojiU: "U+1F1F2 U+1F1F2", fips: "BM", internet: "MM", continent: "Asia", region: "South East Asia" }, { name: "Namibia", alpha2: "NA", alpha3: "NAM", numeric: "516", locales: ["af_NA", "en_NA", "naq_NA"], default_locale: "en_NA", currency: "ZAR", latitude: "-22.95764", longitude: "18.49041", currency_name: "Rand", languages: ["en", "af"], capital: "Windhoek", emoji: "🇳🇦", emojiU: "U+1F1F3 U+1F1E6", fips: "WA", internet: "NA", continent: "Africa", region: "Southern Africa" }, { name: "Nauru", alpha2: "NR", alpha3: "NRU", numeric: "520", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-0.522778", longitude: "166.931503", currency_name: "Australian Dollar", languages: ["en", "na"], capital: "Yaren", emoji: "🇳🇷", emojiU: "U+1F1F3 U+1F1F7", fips: "NR", internet: "NR", continent: "Oceania", region: "Pacific" }, { name: "Nepal", alpha2: "NP", alpha3: "NPL", numeric: "524", locales: ["ne_NP"], default_locale: "ne_NP", currency: "NPR", latitude: "28.394857", longitude: "84.124008", currency_name: "Nepalese Rupee", languages: ["ne"], capital: "Kathmandu", emoji: "🇳🇵", emojiU: "U+1F1F3 U+1F1F5", fips: "NP", internet: "NP", continent: "Asia", region: "South Asia" }, { name: "Netherlands", alpha2: "NL", alpha3: "NLD", numeric: "528", locales: ["nl_NL"], default_locale: "nl_NL", currency: "EUR", latitude: "52.132633", longitude: "5.291266", currency_name: "Euro", languages: ["nl"], capital: "Amsterdam", emoji: "🇳🇱", emojiU: "U+1F1F3 U+1F1F1", fips: "NL", internet: "NL", continent: "Europe", region: "Western Europe" }, { name: "Netherlands Antilles", alpha2: "AN", alpha3: "ANT", numeric: "530", locales: ["nl_AN"], default_locale: "nl_AN", currency: "ANG", latitude: "12.226079", longitude: "-69.060087", currency_name: "Netherlands Antillean Guilder", fips: "NT", internet: "AN", continent: "Americas", region: "West Indies" }, { name: "New Caledonia", alpha2: "NC", alpha3: "NCL", numeric: "540", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-20.904305", longitude: "165.618042", currency_name: "CFP Franc", languages: ["fr"], capital: "Nouméa", emoji: "🇳🇨", emojiU: "U+1F1F3 U+1F1E8", fips: "NC", internet: "NC", continent: "Oceania", region: "Pacific" }, { name: "New Zealand", alpha2: "NZ", alpha3: "NZL", numeric: "554", locales: ["en_NZ"], default_locale: "en_NZ", currency: "NZD", latitude: "-40.900557", longitude: "174.885971", currency_name: "New Zealand Dollar", languages: ["en", "mi"], capital: "Wellington", emoji: "🇳🇿", emojiU: "U+1F1F3 U+1F1FF", fips: "NZ", internet: "NZ", continent: "Oceania", region: "Pacific" }, { name: "Nicaragua", alpha2: "NI", alpha3: "NIC", numeric: "558", locales: ["es_NI"], default_locale: "es_NI", currency: "NIO", latitude: "12.865416", longitude: "-85.207229", currency_name: "Cordoba Oro", languages: ["es"], capital: "Managua", emoji: "🇳🇮", emojiU: "U+1F1F3 U+1F1EE", fips: "NU", internet: "NI", continent: "Americas", region: "Central America" }, { name: "Niger", alpha2: "NE", alpha3: "NER", numeric: "562", locales: ["fr_NE", "ha_Latn_NE"], default_locale: "fr_NE", currency: "XOF", latitude: "17.607789", longitude: "8.081666", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Niamey", emoji: "🇳🇪", emojiU: "U+1F1F3 U+1F1EA", fips: "NG", internet: "NE", continent: "Africa", region: "Western Africa" }, { name: "Nigeria", alpha2: "NG", alpha3: "NGA", numeric: "566", locales: ["en_NG", "ha_Latn_NG", "ig_NG", "yo_NG"], default_locale: "en_NG", currency: "NGN", latitude: "9.081999", longitude: "8.675277", currency_name: "Naira", languages: ["en"], capital: "Abuja", emoji: "🇳🇬", emojiU: "U+1F1F3 U+1F1EC", fips: "NI", internet: "NG", continent: "Africa", region: "Western Africa" }, { name: "Niue", alpha2: "NU", alpha3: "NIU", numeric: "570", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-19.054445", longitude: "-169.867233", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Alofi", emoji: "🇳🇺", emojiU: "U+1F1F3 U+1F1FA", fips: "NE", internet: "NU", continent: "Oceania", region: "Pacific" }, { name: "Norfolk Island", alpha2: "NF", alpha3: "NFK", numeric: "574", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-29.040835", longitude: "167.954712", currency_name: "Australian Dollar", languages: ["en"], capital: "Kingston", emoji: "🇳🇫", emojiU: "U+1F1F3 U+1F1EB", fips: "NF", internet: "NF", continent: "Oceania", region: "Pacific" }, { name: "North Macedonia", alpha2: "MK", alpha3: "MKD", numeric: "807", locales: ["mk_MK"], default_locale: "mk_MK", currency: "MKD", latitude: "41.608635", longitude: "21.745275", currency_name: "Denar", languages: ["mk"], capital: "Skopje", emoji: "🇲🇰", emojiU: "U+1F1F2 U+1F1F0", fips: "MK", internet: "MK", continent: "Europe", region: "South East Europe" }, { name: "Northern Mariana Islands", alpha2: "MP", alpha3: "MNP", numeric: "580", locales: ["en_MP"], default_locale: "en_MP", currency: "USD", latitude: "17.33083", longitude: "145.38469", currency_name: "US Dollar", languages: ["en", "ch"], capital: "Saipan", emoji: "🇲🇵", emojiU: "U+1F1F2 U+1F1F5", fips: "CQ", internet: "MP", continent: "Oceania", region: "Pacific" }, { name: "Norway", alpha2: "NO", alpha3: "NOR", numeric: "578", locales: ["nb_NO", "nn_NO"], default_locale: "nb_NO", currency: "NOK", latitude: "60.472024", longitude: "8.468946", currency_name: "Norwegian Krone", languages: ["no", "nb", "nn"], capital: "Oslo", emoji: "🇳🇴", emojiU: "U+1F1F3 U+1F1F4", fips: "NO", internet: "NO", continent: "Europe", region: "Northern Europe" }, { name: "Oman", alpha2: "OM", alpha3: "OMN", numeric: "512", locales: ["ar_OM"], default_locale: "ar_OM", currency: "OMR", latitude: "21.512583", longitude: "55.923255", currency_name: "Rial Omani", languages: ["ar"], capital: "Muscat", emoji: "🇴🇲", emojiU: "U+1F1F4 U+1F1F2", fips: "MU", internet: "OM", continent: "Asia", region: "South West Asia" }, { name: "Pakistan", alpha2: "PK", alpha3: "PAK", numeric: "586", locales: ["en_PK", "pa_Arab_PK", "ur_PK"], default_locale: "en_PK", currency: "PKR", latitude: "30.375321", longitude: "69.345116", currency_name: "Pakistan Rupee", languages: ["en", "ur"], capital: "Islamabad", emoji: "🇵🇰", emojiU: "U+1F1F5 U+1F1F0", fips: "PK", internet: "PK", continent: "Asia", region: "South Asia" }, { name: "Palau", alpha2: "PW", alpha3: "PLW", numeric: "585", locales: ["en"], default_locale: "en", currency: "USD", latitude: "7.51498", longitude: "134.58252", currency_name: "US Dollar", languages: ["en"], capital: "Ngerulmud", emoji: "🇵🇼", emojiU: "U+1F1F5 U+1F1FC", fips: "PS", internet: "PW", continent: "Oceania", region: "Pacific" }, { name: "Palestine", alpha2: "PS", alpha3: "PSE", numeric: "275", locales: ["ar"], default_locale: "ar", currency: "USD", latitude: "31.952162", longitude: "35.233154", currency_name: "US Dollar", languages: ["ar"], capital: "Ramallah", emoji: "🇵🇸", emojiU: "U+1F1F5 U+1F1F8", fips: "WE", internet: "PS", continent: "Asia", region: "South West Asia", alternate_names: ["State of Palestine"] }, { name: "Panama", alpha2: "PA", alpha3: "PAN", numeric: "591", locales: ["es_PA"], default_locale: "es_PA", currency: "USD", latitude: "8.537981", longitude: "-80.782127", currency_name: "US Dollar", languages: ["es"], capital: "Panama City", emoji: "🇵🇦", emojiU: "U+1F1F5 U+1F1E6", fips: "PM", internet: "PA", continent: "Americas", region: "Central America" }, { name: "Papua New Guinea", alpha2: "PG", alpha3: "PNG", numeric: "598", locales: ["en"], default_locale: "en", currency: "PGK", latitude: "-6.314993", longitude: "143.95555", currency_name: "Kina", languages: ["en"], capital: "Port Moresby", emoji: "🇵🇬", emojiU: "U+1F1F5 U+1F1EC", fips: "PP", internet: "PG", continent: "Oceania", region: "Pacific" }, { name: "Paraguay", alpha2: "PY", alpha3: "PRY", numeric: "600", locales: ["es_PY"], default_locale: "es_PY", currency: "PYG", latitude: "-23.442503", longitude: "-58.443832", currency_name: "Guarani", languages: ["es", "gn"], capital: "Asunción", emoji: "🇵🇾", emojiU: "U+1F1F5 U+1F1FE", fips: "PA", internet: "PY", continent: "Americas", region: "South America" }, { name: "Peru", alpha2: "PE", alpha3: "PER", numeric: "604", locales: ["es_PE"], default_locale: "es_PE", currency: "PEN", latitude: "-9.189967", longitude: "-75.015152", currency_name: "Sol", languages: ["es"], capital: "Lima", emoji: "🇵🇪", emojiU: "U+1F1F5 U+1F1EA", fips: "PE", internet: "PE", continent: "Americas", region: "South America" }, { name: "Philippines", alpha2: "PH", alpha3: "PHL", numeric: "608", locales: ["en_PH", "fil_PH"], default_locale: "en_PH", currency: "PHP", latitude: "12.879721", longitude: "121.774017", currency_name: "Philippine Peso", languages: ["en"], capital: "Manila", emoji: "🇵🇭", emojiU: "U+1F1F5 U+1F1ED", fips: "RP", internet: "PH", continent: "Asia", region: "South East Asia" }, { name: "Pitcairn", alpha2: "PN", alpha3: "PCN", numeric: "612", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-24.703615", longitude: "-127.439308", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Adamstown", emoji: "🇵🇳", emojiU: "U+1F1F5 U+1F1F3", fips: "PC", internet: "PN", continent: "Oceania", region: "Pacific" }, { name: "Poland", alpha2: "PL", alpha3: "POL", numeric: "616", locales: ["pl_PL"], default_locale: "pl_PL", currency: "PLN", latitude: "51.919438", longitude: "19.145136", currency_name: "Zloty", languages: ["pl"], capital: "Warsaw", emoji: "🇵🇱", emojiU: "U+1F1F5 U+1F1F1", fips: "PL", internet: "PL", continent: "Europe", region: "Eastern Europe" }, { name: "Portugal", alpha2: "PT", alpha3: "PRT", numeric: "620", locales: ["pt_PT"], default_locale: "pt_PT", currency: "EUR", latitude: "39.399872", longitude: "-8.224454", currency_name: "Euro", languages: ["pt"], capital: "Lisbon", emoji: "🇵🇹", emojiU: "U+1F1F5 U+1F1F9", fips: "PO", internet: "PT", continent: "Europe", region: "South West Europe" }, { name: "Puerto Rico", alpha2: "PR", alpha3: "PRI", numeric: "630", locales: ["es_PR"], default_locale: "es_PR", currency: "USD", latitude: "18.220833", longitude: "-66.590149", currency_name: "US Dollar", languages: ["es", "en"], capital: "San Juan", emoji: "🇵🇷", emojiU: "U+1F1F5 U+1F1F7", fips: "RQ", internet: "PR", continent: "Americas", region: "West Indies" }, { name: "Qatar", alpha2: "QA", alpha3: "QAT", numeric: "634", locales: ["ar_QA"], default_locale: "ar_QA", currency: "QAR", latitude: "25.354826", longitude: "51.183884", currency_name: "Qatari Rial", languages: ["ar"], capital: "Doha", emoji: "🇶🇦", emojiU: "U+1F1F6 U+1F1E6", fips: "QA", internet: "QA", continent: "Asia", region: "South West Asia" }, { name: "Romania", alpha2: "RO", alpha3: "ROU", numeric: "642", locales: ["ro_RO"], default_locale: "ro_RO", currency: "RON", latitude: "45.943161", longitude: "24.96676", currency_name: "Romanian Leu", languages: ["ro"], capital: "Bucharest", emoji: "🇷🇴", emojiU: "U+1F1F7 U+1F1F4", fips: "RO", internet: "RO", continent: "Europe", region: "South East Europe" }, { name: "Russia", alpha2: "RU", alpha3: "RUS", numeric: "643", locales: ["ru_RU"], default_locale: "ru_RU", currency: "RUB", latitude: "61.52401", longitude: "105.318756", currency_name: "Russian Ruble", languages: ["ru"], capital: "Moscow", emoji: "🇷🇺", emojiU: "U+1F1F7 U+1F1FA", fips: "RS", internet: "RU", continent: "Asia", region: "Northern Asia", alternate_names: ["Russian Federation"] }, { name: "Rwanda", alpha2: "RW", alpha3: "RWA", numeric: "646", locales: ["fr_RW", "rw_RW"], default_locale: "fr_RW", currency: "RWF", latitude: "-1.940278", longitude: "29.873888", currency_name: "Rwanda Franc", languages: ["rw", "en", "fr"], capital: "Kigali", emoji: "🇷🇼", emojiU: "U+1F1F7 U+1F1FC", fips: "RW", internet: "RW", continent: "Africa", region: "Central Africa" }, { name: "Réunion", alpha2: "RE", alpha3: "REU", numeric: "638", locales: ["fr_RE"], default_locale: "fr_RE", currency: "RWF", latitude: "-21.115141", longitude: "55.536384", currency_name: "Rwanda Franc", languages: ["fr"], capital: "Saint-Denis", emoji: "🇷🇪", emojiU: "U+1F1F7 U+1F1EA", fips: "RE", internet: "RE", continent: "Africa", region: "Indian Ocean" }, { name: "Saint Barthélemy", alpha2: "BL", alpha3: "BLM", numeric: "652", locales: ["fr_BL"], default_locale: "fr_BL", currency: "EUR", currency_name: "Euro", languages: ["fr"], capital: "Gustavia", emoji: "🇧🇱", emojiU: "U+1F1E7 U+1F1F1", fips: "TB", internet: "BL", continent: "Americas", region: "West Indies" }, { name: "Saint Helena", alpha2: "SH", alpha3: "SHN", numeric: "654", locales: ["en"], default_locale: "en", currency: "SHP", latitude: "-24.143474", longitude: "-10.030696", currency_name: "Saint Helena Pound", languages: ["en"], capital: "Jamestown", emoji: "🇸🇭", emojiU: "U+1F1F8 U+1F1ED", fips: "SH", internet: "SH", continent: "Atlantic Ocean", region: "South Atlantic Ocean", alternate_names: ["Saint Helena, Ascension and Tristan da Cunha"] }, { name: "Saint Kitts and Nevis", alpha2: "KN", alpha3: "KNA", numeric: "659", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "17.357822", longitude: "-62.782998", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Basseterre", emoji: "🇰🇳", emojiU: "U+1F1F0 U+1F1F3", fips: "SC", internet: "KN", continent: "Americas", region: "West Indies" }, { name: "Saint Lucia", alpha2: "LC", alpha3: "LCA", numeric: "662", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "13.909444", longitude: "-60.978893", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Castries", emoji: "🇱🇨", emojiU: "U+1F1F1 U+1F1E8", fips: "ST", internet: "LC", continent: "Americas", region: "West Indies" }, { name: "Saint Martin", alpha2: "MF", alpha3: "MAF", numeric: "663", locales: ["fr_MF"], default_locale: "fr_MF", currency: "EUR", currency_name: "Euro", languages: ["en", "fr", "nl"], capital: "Marigot", emoji: "🇲🇫", emojiU: "U+1F1F2 U+1F1EB", fips: "RN", internet: "MF", continent: "Americas", region: "West Indies", alternate_names: ["Saint Martin French part"] }, { name: "Saint Pierre and Miquelon", alpha2: "PM", alpha3: "SPM", numeric: "666", locales: ["fr"], default_locale: "fr", currency: "EUR", latitude: "46.941936", longitude: "-56.27111", currency_name: "Euro", languages: ["fr"], capital: "Saint-Pierre", emoji: "🇵🇲", emojiU: "U+1F1F5 U+1F1F2", fips: "SB", internet: "PM", continent: "Americas", region: "North America" }, { name: "Saint Vincent and the Grenadines", alpha2: "VC", alpha3: "VCT", numeric: "670", locales: ["en"], default_locale: "en", currency: "XCD", latitude: "12.984305", longitude: "-61.287228", currency_name: "East Caribbean Dollar", languages: ["en"], capital: "Kingstown", emoji: "🇻🇨", emojiU: "U+1F1FB U+1F1E8", fips: "VC", internet: "VC", continent: "Americas", region: "West Indies" }, { name: "Samoa", alpha2: "WS", alpha3: "WSM", numeric: "882", locales: ["sm"], default_locale: "sm", currency: "WST", latitude: "-13.759029", longitude: "-172.104629", currency_name: "Tala", languages: ["sm", "en"], capital: "Apia", emoji: "🇼🇸", emojiU: "U+1F1FC U+1F1F8", fips: "WS", internet: "WS", continent: "Oceania", region: "Pacific" }, { name: "San Marino", alpha2: "SM", alpha3: "SMR", numeric: "674", locales: ["it"], default_locale: "it", currency: "EUR", latitude: "43.94236", longitude: "12.457777", currency_name: "Euro", languages: ["it"], capital: "City of San Marino", emoji: "🇸🇲", emojiU: "U+1F1F8 U+1F1F2", fips: "SM", internet: "SM", continent: "Europe", region: "Southern Europe" }, { name: "Sao Tome and Principe", alpha2: "ST", alpha3: "STP", numeric: "678", locales: ["pt"], default_locale: "pt", currency: "STN", latitude: "0.18636", longitude: "6.613081", currency_name: "Dobra", languages: ["pt"], capital: "São Tomé", emoji: "🇸🇹", emojiU: "U+1F1F8 U+1F1F9", fips: "TP", internet: "ST", continent: "Africa", region: "Western Africa" }, { name: "Saudi Arabia", alpha2: "SA", alpha3: "SAU", numeric: "682", locales: ["ar_SA"], default_locale: "ar_SA", currency: "SAR", latitude: "23.885942", longitude: "45.079162", currency_name: "Saudi Riyal", languages: ["ar"], capital: "Riyadh", emoji: "🇸🇦", emojiU: "U+1F1F8 U+1F1E6", fips: "SA", internet: "SA", continent: "Asia", region: "South West Asia" }, { name: "Senegal", alpha2: "SN", alpha3: "SEN", numeric: "686", locales: ["fr_SN", "ff_SN"], default_locale: "fr_SN", currency: "XOF", latitude: "14.497401", longitude: "-14.452362", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Dakar", emoji: "🇸🇳", emojiU: "U+1F1F8 U+1F1F3", fips: "SG", internet: "SN", continent: "Africa", region: "Western Africa" }, { name: "Serbia", alpha2: "RS", alpha3: "SRB", numeric: "688", locales: ["sr_Cyrl_RS", "sr_Latn_RS"], default_locale: "sr_Cyrl_RS", currency: "RSD", latitude: "44.016521", longitude: "21.005859", currency_name: "Serbian Dinar", languages: ["sr"], capital: "Belgrade", emoji: "🇷🇸", emojiU: "U+1F1F7 U+1F1F8", fips: "RI", internet: "RS", continent: "Europe", region: "South East Europe" }, { name: "Seychelles", alpha2: "SC", alpha3: "SYC", numeric: "690", locales: ["fr"], default_locale: "fr", currency: "SCR", latitude: "-4.679574", longitude: "55.491977", currency_name: "Seychelles Rupee", languages: ["fr", "en"], capital: "Victoria", emoji: "🇸🇨", emojiU: "U+1F1F8 U+1F1E8", fips: "SE", internet: "SC", continent: "Africa", region: "Indian Ocean" }, { name: "Sierra Leone", alpha2: "SL", alpha3: "SLE", numeric: "694", locales: ["en"], default_locale: "en", currency: "SLL", latitude: "8.460555", longitude: "-11.779889", currency_name: "Leone", languages: ["en"], capital: "Freetown", emoji: "🇸🇱", emojiU: "U+1F1F8 U+1F1F1", fips: "SL", internet: "SL", continent: "Africa", region: "Western Africa" }, { name: "Singapore", alpha2: "SG", alpha3: "SGP", numeric: "702", locales: ["zh_Hans_SG", "en_SG"], default_locale: "en_SG", currency: "SGD", latitude: "1.352083", longitude: "103.819836", currency_name: "Singapore Dollar", languages: ["en", "ms", "ta", "zh"], capital: "Singapore", emoji: "🇸🇬", emojiU: "U+1F1F8 U+1F1EC", fips: "SN", internet: "SG", continent: "Asia", region: "South East Asia" }, { name: "Sint Maarten", alpha2: "SX", alpha3: "SXM", numeric: "534", locales: ["nl"], default_locale: "nl", currency: "ANG", currency_name: "Netherlands Antillean Guilder", languages: ["nl", "en"], capital: "Philipsburg", emoji: "🇸🇽", emojiU: "U+1F1F8 U+1F1FD", fips: "NN", internet: "SX", continent: "Americas", region: "West Indies", alternate_names: ["Sint Maarten Dutch part"] }, { name: "Slovakia", alpha2: "SK", alpha3: "SVK", numeric: "703", locales: ["sk_SK"], default_locale: "sk_SK", currency: "EUR", latitude: "48.669026", longitude: "19.699024", currency_name: "Euro", languages: ["sk"], capital: "Bratislava", emoji: "🇸🇰", emojiU: "U+1F1F8 U+1F1F0", fips: "LO", internet: "SK", continent: "Europe", region: "Central Europe" }, { name: "Slovenia", alpha2: "SI", alpha3: "SVN", numeric: "705", locales: ["sl_SI"], default_locale: "sl_SI", currency: "EUR", latitude: "46.151241", longitude: "14.995463", currency_name: "Euro", languages: ["sl"], capital: "Ljubljana", emoji: "🇸🇮", emojiU: "U+1F1F8 U+1F1EE", fips: "SI", internet: "SI", continent: "Europe", region: "South East Europe" }, { name: "Solomon Islands", alpha2: "SB", alpha3: "SLB", numeric: "090", locales: ["en"], default_locale: "en", currency: "SBD", latitude: "-9.64571", longitude: "160.156194", currency_name: "Solomon Islands Dollar", languages: ["en"], capital: "Honiara", emoji: "🇸🇧", emojiU: "U+1F1F8 U+1F1E7", fips: "BP", internet: "SB", continent: "Oceania", region: "Pacific" }, { name: "Somalia", alpha2: "SO", alpha3: "SOM", numeric: "706", locales: ["so_SO"], default_locale: "so_SO", currency: "SOS", latitude: "5.152149", longitude: "46.199616", currency_name: "Somali Shilling", languages: ["so", "ar"], capital: "Mogadishu", emoji: "🇸🇴", emojiU: "U+1F1F8 U+1F1F4", fips: "SO", internet: "SO", continent: "Africa", region: "Eastern Africa" }, { name: "South Africa", alpha2: "ZA", alpha3: "ZAF", numeric: "710", locales: ["af_ZA", "en_ZA", "zu_ZA"], default_locale: "af_ZA", currency: "ZAR", latitude: "-30.559482", longitude: "22.937506", currency_name: "Rand", languages: ["af", "en", "nr", "st", "ss", "tn", "ts", "ve", "xh", "zu"], capital: "Pretoria", emoji: "🇿🇦", emojiU: "U+1F1FF U+1F1E6", fips: "SF", internet: "ZA", continent: "Africa", region: "Southern Africa" }, { name: "South Georgia and the South Sandwich Islands", alpha2: "GS", alpha3: "SGS", numeric: "239", locales: ["en"], default_locale: "en", currency: "USD", latitude: "-54.429579", longitude: "-36.587909", currency_name: "US Dollar", languages: ["en"], capital: "King Edward Point", emoji: "🇬🇸", emojiU: "U+1F1EC U+1F1F8", fips: "SX", internet: "GS", continent: "Atlantic Ocean", region: "South Atlantic Ocean" }, { name: "South Sudan", alpha2: "SS", alpha3: "SSD", numeric: "728", locales: ["en"], default_locale: "en", currency: "SSP", currency_name: "South Sudanese Pound", languages: ["en"], capital: "Juba", emoji: "🇸🇸", emojiU: "U+1F1F8 U+1F1F8", fips: "OD", internet: "SS", continent: "Africa", region: "Northern Africa" }, { name: "Spain", alpha2: "ES", alpha3: "ESP", numeric: "724", locales: ["eu_ES", "ca_ES", "gl_ES", "es_ES"], default_locale: "es_ES", currency: "EUR", latitude: "40.463667", longitude: "-3.74922", currency_name: "Euro", languages: ["es", "eu", "ca", "gl", "oc"], capital: "Madrid", emoji: "🇪🇸", emojiU: "U+1F1EA U+1F1F8", fips: "SP", internet: "ES", continent: "Europe", region: "South West Europe" }, { name: "Sri Lanka", alpha2: "LK", alpha3: "LKA", numeric: "144", locales: ["si_LK", "ta_LK"], default_locale: "si_LK", currency: "LKR", latitude: "7.873054", longitude: "80.771797", currency_name: "Sri Lanka Rupee", languages: ["si", "ta"], capital: "Colombo", emoji: "🇱🇰", emojiU: "U+1F1F1 U+1F1F0", fips: "CE", internet: "LK", continent: "Asia", region: "South Asia" }, { name: "Sudan", alpha2: "SD", alpha3: "SDN", numeric: "729", locales: ["ar_SD"], default_locale: "ar_SD", currency: "SDG", latitude: "12.862807", longitude: "30.217636", currency_name: "Sudanese Pound", languages: ["ar", "en"], capital: "Khartoum", emoji: "🇸🇩", emojiU: "U+1F1F8 U+1F1E9", fips: "SU", internet: "SD", continent: "Africa", region: "Northern Africa" }, { name: "Suriname", alpha2: "SR", alpha3: "SUR", numeric: "740", locales: ["nl"], default_locale: "nl", currency: "SRD", latitude: "3.919305", longitude: "-56.027783", currency_name: "Surinam Dollar", languages: ["nl"], capital: "Paramaribo", emoji: "🇸🇷", emojiU: "U+1F1F8 U+1F1F7", fips: "NS", internet: "SR", continent: "Americas", region: "South America" }, { name: "Svalbard and Jan Mayen", alpha2: "SJ", alpha3: "SJM", numeric: "744", locales: ["no"], default_locale: "no", currency: "NOK", latitude: "77.553604", longitude: "23.670272", currency_name: "Norwegian Krone", languages: ["no"], capital: "Longyearbyen", emoji: "🇸🇯", emojiU: "U+1F1F8 U+1F1EF", fips: "SV", internet: "SJ", continent: "Europe", region: "Northern Europe" }, { name: "Sweden", alpha2: "SE", alpha3: "SWE", numeric: "752", locales: ["sv_SE"], default_locale: "sv_SE", currency: "SEK", latitude: "60.128161", longitude: "18.643501", currency_name: "Swedish Krona", languages: ["sv"], capital: "Stockholm", emoji: "🇸🇪", emojiU: "U+1F1F8 U+1F1EA", fips: "SW", internet: "SE", continent: "Europe", region: "Northern Europe" }, { name: "Switzerland", alpha2: "CH", alpha3: "CHE", numeric: "756", locales: ["fr_CH", "de_CH", "it_CH", "rm_CH", "gsw_CH"], default_locale: "fr_CH", currency: "CHF", latitude: "46.818188", longitude: "8.227512", currency_name: "Swiss Franc", languages: ["de", "fr", "it"], capital: "Bern", emoji: "🇨🇭", emojiU: "U+1F1E8 U+1F1ED", fips: "SZ", internet: "CH", continent: "Europe", region: "Central Europe" }, { name: "Syrian Arab Republic", alpha2: "SY", alpha3: "SYR", numeric: "760", locales: ["ar_SY"], default_locale: "ar_SY", currency: "SYP", latitude: "34.802075", longitude: "38.996815", currency_name: "Syrian Pound", languages: ["ar"], capital: "Damascus", emoji: "🇸🇾", emojiU: "U+1F1F8 U+1F1FE", fips: "SY", internet: "SY", continent: "Asia", region: "South West Asia" }, { name: "Taiwan", alpha2: "TW", alpha3: "TWN", numeric: "158", locales: ["zh_Hant_TW"], default_locale: "zh_Hant_TW", currency: "TWD", latitude: "23.69781", longitude: "120.960515", currency_name: "New Taiwan Dollar", languages: ["zh"], capital: "Taipei", emoji: "🇹🇼", emojiU: "U+1F1F9 U+1F1FC", fips: "TW", internet: "TW", continent: "Asia", region: "East Asia", alternate_names: ["Province of China Taiwan"] }, { name: "Tajikistan", alpha2: "TJ", alpha3: "TJK", numeric: "762", locales: ["tg"], default_locale: "tg", currency: "TJS", latitude: "38.861034", longitude: "71.276093", currency_name: "Somoni", languages: ["tg", "ru"], capital: "Dushanbe", emoji: "🇹🇯", emojiU: "U+1F1F9 U+1F1EF", fips: "TI", internet: "TJ", continent: "Asia", region: "Central Asia" }, { name: "Tanzania", alpha2: "TZ", alpha3: "TZA", numeric: "834", locales: ["asa_TZ", "bez_TZ", "lag_TZ", "jmc_TZ", "kde_TZ", "mas_TZ", "rof_TZ", "rwk_TZ", "sw_TZ", "vun_TZ"], default_locale: "asa_TZ", currency: "TZS", latitude: "-6.369028", longitude: "34.888822", currency_name: "Tanzanian Shilling", languages: ["sw", "en"], capital: "Dodoma", emoji: "🇹🇿", emojiU: "U+1F1F9 U+1F1FF", fips: "TZ", internet: "TZ", continent: "Africa", region: "Eastern Africa", alternate_names: ["United Republic of Tanzania"] }, { name: "Thailand", alpha2: "TH", alpha3: "THA", numeric: "764", locales: ["th_TH"], default_locale: "th_TH", currency: "THB", latitude: "15.870032", longitude: "100.992541", currency_name: "Baht", languages: ["th"], capital: "Bangkok", emoji: "🇹🇭", emojiU: "U+1F1F9 U+1F1ED", fips: "TH", internet: "TH", continent: "Asia", region: "South East Asia" }, { name: "Timor-Leste", alpha2: "TL", alpha3: "TLS", numeric: "626", locales: ["pt"], default_locale: "pt", currency: "USD", latitude: "-8.874217", longitude: "125.727539", currency_name: "US Dollar", languages: ["pt"], capital: "Dili", emoji: "🇹🇱", emojiU: "U+1F1F9 U+1F1F1", fips: "TT", internet: "TL", continent: "Asia", region: "South East Asia" }, { name: "Togo", alpha2: "TG", alpha3: "TGO", numeric: "768", locales: ["ee_TG", "fr_TG"], default_locale: "fr_TG", currency: "XOF", latitude: "8.619543", longitude: "0.824782", currency_name: "CFA Franc BCEAO", languages: ["fr"], capital: "Lomé", emoji: "🇹🇬", emojiU: "U+1F1F9 U+1F1EC", fips: "TO", internet: "TG", continent: "Africa", region: "Western Africa" }, { name: "Tokelau", alpha2: "TK", alpha3: "TKL", numeric: "772", locales: ["en"], default_locale: "en", currency: "NZD", latitude: "-8.967363", longitude: "-171.855881", currency_name: "New Zealand Dollar", languages: ["en"], capital: "Fakaofo", emoji: "🇹🇰", emojiU: "U+1F1F9 U+1F1F0", fips: "TL", internet: "TK", continent: "Oceania", region: "Pacific" }, { name: "Tonga", alpha2: "TO", alpha3: "TON", numeric: "776", locales: ["to_TO"], default_locale: "to_TO", currency: "TOP", latitude: "-21.178986", longitude: "-175.198242", currency_name: "Pa’anga", languages: ["en", "to"], capital: "Nuku'alofa", emoji: "🇹🇴", emojiU: "U+1F1F9 U+1F1F4", fips: "TN", internet: "TO", continent: "Oceania", region: "Pacific" }, { name: "Trinidad and Tobago", alpha2: "TT", alpha3: "TTO", numeric: "780", locales: ["en_TT"], default_locale: "en_TT", currency: "TTD", latitude: "10.691803", longitude: "-61.222503", currency_name: "Trinidad and Tobago Dollar", languages: ["en"], capital: "Port of Spain", emoji: "🇹🇹", emojiU: "U+1F1F9 U+1F1F9", fips: "TD", internet: "TT", continent: "Americas", region: "West Indies" }, { name: "Tunisia", alpha2: "TN", alpha3: "TUN", numeric: "788", locales: ["ar_TN"], default_locale: "ar_TN", currency: "TND", latitude: "33.886917", longitude: "9.537499", currency_name: "Tunisian Dinar", languages: ["ar"], capital: "Tunis", emoji: "🇹🇳", emojiU: "U+1F1F9 U+1F1F3", fips: "TS", internet: "TN", continent: "Africa", region: "Northern Africa" }, { name: "Turkey", alpha2: "TR", alpha3: "TUR", numeric: "792", locales: ["tr_TR"], default_locale: "tr_TR", currency: "TRY", latitude: "38.963745", longitude: "35.243322", currency_name: "Turkish Lira", languages: ["tr"], capital: "Ankara", emoji: "🇹🇷", emojiU: "U+1F1F9 U+1F1F7", fips: "TU", internet: "TR", continent: "Asia", region: "South West Asia" }, { name: "Turkmenistan", alpha2: "TM", alpha3: "TKM", numeric: "795", locales: ["tk"], default_locale: "tk", currency: "TMT", latitude: "38.969719", longitude: "59.556278", currency_name: "Turkmenistan New Manat", languages: ["tk", "ru"], capital: "Ashgabat", emoji: "🇹🇲", emojiU: "U+1F1F9 U+1F1F2", fips: "TX", internet: "TM", continent: "Asia", region: "Central Asia" }, { name: "Turks and Caicos Islands", alpha2: "TC", alpha3: "TCA", numeric: "796", locales: ["en"], default_locale: "en", currency: "USD", latitude: "21.694025", longitude: "-71.797928", currency_name: "US Dollar", languages: ["en"], capital: "Cockburn Town", emoji: "🇹🇨", emojiU: "U+1F1F9 U+1F1E8", fips: "TK", internet: "TC", continent: "Americas", region: "West Indies" }, { name: "Tuvalu", alpha2: "TV", alpha3: "TUV", numeric: "798", locales: ["en"], default_locale: "en", currency: "AUD", latitude: "-7.109535", longitude: "177.64933", currency_name: "Australian Dollar", languages: ["en"], capital: "Funafuti", emoji: "🇹🇻", emojiU: "U+1F1F9 U+1F1FB", fips: "TV", internet: "TV", continent: "Oceania", region: "Pacific" }, { name: "Uganda", alpha2: "UG", alpha3: "UGA", numeric: "800", locales: ["cgg_UG", "lg_UG", "nyn_UG", "xog_UG", "teo_UG"], default_locale: "cgg_UG", currency: "UGX", latitude: "1.373333", longitude: "32.290275", currency_name: "Uganda Shilling", languages: ["en", "sw"], capital: "Kampala", emoji: "🇺🇬", emojiU: "U+1F1FA U+1F1EC", fips: "UG", internet: "UG", continent: "Africa", region: "Eastern Africa" }, { name: "Ukraine", alpha2: "UA", alpha3: "UKR", numeric: "804", locales: ["ru_UA", "uk_UA"], default_locale: "uk_UA", currency: "UAH", latitude: "48.379433", longitude: "31.16558", currency_name: "Hryvnia", languages: ["uk"], capital: "Kyiv", emoji: "🇺🇦", emojiU: "U+1F1FA U+1F1E6", fips: "UP", internet: "UA", continent: "Europe", region: "Eastern Europe" }, { name: "United Arab Emirates", alpha2: "AE", alpha3: "ARE", numeric: "784", locales: ["ar_AE"], default_locale: "ar_AE", currency: "AED", latitude: "23.424076", longitude: "53.847818", currency_name: "UAE Dirham", languages: ["ar"], capital: "Abu Dhabi", emoji: "🇦🇪", emojiU: "U+1F1E6 U+1F1EA", fips: "TC", internet: "AE", continent: "Asia", region: "South West Asia" }, { name: "United Kingdom", alpha2: "GB", alpha3: "GBR", numeric: "826", locales: ["kw_GB", "en_GB", "gv_GB", "cy_GB"], default_locale: "en_GB", currency: "GBP", latitude: "55.378051", longitude: "-3.435973", currency_name: "Pound Sterling", languages: ["en"], capital: "London", emoji: "🇬🇧", emojiU: "U+1F1EC U+1F1E7", fips: "UK", internet: "UK", continent: "Europe", region: "Western Europe", alternate_names: ["United Kingdom of Great Britain and Northern Ireland"] }, { name: "United States Minor Outlying Islands", alpha2: "UM", alpha3: "UMI", numeric: "581", locales: ["en_UM"], default_locale: "en_UM", currency: "USD", currency_name: "US Dollar", languages: ["en"], capital: "", emoji: "🇺🇲", emojiU: "U+1F1FA U+1F1F2", fips: "", internet: "US", continent: "Americas", region: "North America" }, { name: "United States of America", alpha2: "US", alpha3: "USA", numeric: "840", locales: ["chr_US", "en_US", "haw_US", "es_US"], default_locale: "en_US", currency: "USD", latitude: "37.09024", longitude: "-95.712891", currency_name: "US Dollar", languages: ["en"], capital: "Washington D.C.", emoji: "🇺🇸", emojiU: "U+1F1FA U+1F1F8", fips: "US", internet: "US", continent: "Americas", region: "North America", alternate_names: ["United States"] }, { name: "Uruguay", alpha2: "UY", alpha3: "URY", numeric: "858", locales: ["es_UY"], default_locale: "es_UY", currency: "UYU", latitude: "-32.522779", longitude: "-55.765835", currency_name: "Peso Uruguayo", languages: ["es"], capital: "Montevideo", emoji: "🇺🇾", emojiU: "U+1F1FA U+1F1FE", fips: "UY", internet: "UY", continent: "Americas", region: "South America" }, { name: "Uzbekistan", alpha2: "UZ", alpha3: "UZB", numeric: "860", locales: ["uz_Cyrl_UZ", "uz_Latn_UZ"], default_locale: "uz_Cyrl_UZ", currency: "UZS", latitude: "41.377491", longitude: "64.585262", currency_name: "Uzbekistan Sum", languages: ["uz", "ru"], capital: "Tashkent", emoji: "🇺🇿", emojiU: "U+1F1FA U+1F1FF", fips: "UZ", internet: "UZ", continent: "Asia", region: "Central Asia" }, { name: "Vanuatu", alpha2: "VU", alpha3: "VUT", numeric: "548", locales: ["bi"], default_locale: "bi", currency: "VUV", latitude: "-15.376706", longitude: "166.959158", currency_name: "Vatu", languages: ["bi", "en", "fr"], capital: "Port Vila", emoji: "🇻🇺", emojiU: "U+1F1FB U+1F1FA", fips: "NH", internet: "VU", continent: "Oceania", region: "Pacific" }, { name: "Venezuela", alpha2: "VE", alpha3: "VEN", numeric: "862", locales: ["es_VE"], default_locale: "es_VE", currency: "VUV", latitude: "6.42375", longitude: "-66.58973", currency_name: "Vatu", languages: ["es"], capital: "Caracas", emoji: "🇻🇪", emojiU: "U+1F1FB U+1F1EA", fips: "VE", internet: "UE", continent: "Americas", region: "South America", alternate_names: ["Bolivarian Republic of Venezuela"] }, { name: "Viet Nam", alpha2: "VN", alpha3: "VNM", numeric: "704", locales: ["vi_VN"], default_locale: "vi_VN", currency: "VND", latitude: "14.058324", longitude: "108.277199", currency_name: "Dong", languages: ["vi"], capital: "Hanoi", emoji: "🇻🇳", emojiU: "U+1F1FB U+1F1F3", fips: "VN", internet: "VN", continent: "Asia", region: "South East Asia" }, { name: "Virgin Islands (British)", alpha2: "VG", alpha3: "VGB", numeric: "092", locales: ["en"], default_locale: "en", currency: "USD", latitude: "18.420695", longitude: "-64.639968", currency_name: "US Dollar", languages: ["en"], capital: "Road Town", emoji: "🇻🇬", emojiU: "U+1F1FB U+1F1EC", fips: "VI", internet: "VG", continent: "Americas", region: "West Indies" }, { name: "Virgin Islands (U.S.)", alpha2: "VI", alpha3: "VIR", numeric: "850", locales: ["en_VI"], default_locale: "en_VI", currency: "USD", latitude: "18.335765", longitude: "-64.896335", currency_name: "US Dollar", languages: ["en"], capital: "Charlotte Amalie", emoji: "🇻🇮", emojiU: "U+1F1FB U+1F1EE", fips: "VQ", internet: "VI", continent: "Americas", region: "West Indies" }, { name: "Wallis and Futuna", alpha2: "WF", alpha3: "WLF", numeric: "876", locales: ["fr"], default_locale: "fr", currency: "XPF", latitude: "-13.768752", longitude: "-177.156097", currency_name: "CFP Franc", languages: ["fr"], capital: "Mata-Utu", emoji: "🇼🇫", emojiU: "U+1F1FC U+1F1EB", fips: "WF", internet: "WF", continent: "Oceania", region: "Pacific" }, { name: "Western Sahara", alpha2: "EH", alpha3: "ESH", numeric: "732", locales: ["es"], default_locale: "es", currency: "MAD", latitude: "24.215527", longitude: "-12.885834", currency_name: "Moroccan Dirham", languages: ["es"], capital: "El Aaiún", emoji: "🇪🇭", emojiU: "U+1F1EA U+1F1ED", fips: "WI", internet: "EH", continent: "Africa", region: "Northern Africa" }, { name: "Yemen", alpha2: "YE", alpha3: "YEM", numeric: "887", locales: ["ar_YE"], default_locale: "ar_YE", currency: "YER", latitude: "15.552727", longitude: "48.516388", currency_name: "Yemeni Rial", languages: ["ar"], capital: "Sana'a", emoji: "🇾🇪", emojiU: "U+1F1FE U+1F1EA", fips: "YM", internet: "YE", continent: "Asia", region: "South West Asia" }, { name: "Zambia", alpha2: "ZM", alpha3: "ZMB", numeric: "894", locales: ["bem_ZM"], default_locale: "bem_ZM", currency: "ZMW", latitude: "-13.133897", longitude: "27.849332", currency_name: "Zambian Kwacha", languages: ["en"], capital: "Lusaka", emoji: "🇿🇲", emojiU: "U+1F1FF U+1F1F2", fips: "ZA", internet: "ZM", continent: "Africa", region: "Southern Africa" }, { name: "Zimbabwe", alpha2: "ZW", alpha3: "ZWE", numeric: "716", locales: ["en_ZW", "nd_ZW", "sn_ZW"], default_locale: "en_ZW", currency: "ZWL", latitude: "-19.015438", longitude: "29.154857", currency_name: "Zimbabwe Dollar", languages: ["en", "sn", "nd"], capital: "Harare", emoji: "🇿🇼", emojiU: "U+1F1FF U+1F1FC", fips: "ZI", internet: "ZW", continent: "Africa", region: "Southern Africa" }, { name: "Åland Islands", alpha2: "AX", alpha3: "ALA", numeric: "248", locales: ["sv"], default_locale: "sv", currency: "EUR", currency_name: "Euro", languages: ["sv"], capital: "Mariehamn", emoji: "🇦🇽", emojiU: "U+1F1E6 U+1F1FD", fips: "AX", internet: "AX", continent: "Europe", region: "Northern Europe" }, { name: "Kosovo", alpha2: "XK", alpha3: "XKX", numeric: "383", locales: ["sq-XK"], default_locale: "sq-XK", currency: "EUR", latitude: "42.602636", longitude: "20.902977", currency_name: "Euro", languages: ["sq", "sr"], capital: "Pristina", emoji: "🇽🇰", emojiU: "U+1F1FD U+1F1F0", fips: "KV", internet: "XK", continent: "Europe", region: "South East Europe" }];
});

// node_modules/.bun/country-locale-map@1.9.11/node_modules/country-locale-map/index.js
var require_country_locale_map = __commonJS((exports, module) => {
  var fuzz = require_fuzzball();
  function CLM() {
    var clm = {};
    var countries;
    if (typeof process !== "undefined" && process && process.env && process.env.CLM_MODE == "INTL") {
      countries = require_countries_intl();
    } else {
      countries = require_countries();
    }
    var countryByAlpha2Code = {};
    var countryByAlpha3Code = {};
    var countryByNumericCode = {};
    var countryByName = {};
    var countryNames = [];
    var countriesByContinent = {};
    for (let i = 0;i < countries.length; ++i) {
      countryByAlpha2Code[countries[i]["alpha2"]] = countries[i];
      countryByAlpha3Code[countries[i]["alpha3"]] = countries[i];
      countryByNumericCode[countries[i]["numeric"]] = countries[i];
      countryByName[countries[i]["name"]] = countries[i];
      countryNames.push(countries[i]["name"]);
      countriesByContinent[countries[i]["continent"]] = [
        ...countriesByContinent[countries[i]["continent"]] || [],
        countries[i]
      ];
      if (countries[i]["alternate_names"]) {
        for (let j = 0;j < countries[i]["alternate_names"].length; ++j) {
          countryByName[countries[i]["alternate_names"][j]] = countries[i];
          countryNames.push(countries[i]["alternate_names"][j]);
        }
      }
    }
    Object.freeze(countryByAlpha2Code);
    Object.freeze(countryByAlpha3Code);
    Object.freeze(countryByNumericCode);
    Object.freeze(countryByName);
    Object.freeze(countryNames);
    Object.freeze(countriesByContinent);
    clm.getAllCountries = function() {
      return countries;
    };
    clm.getAlpha3ByAlpha2 = function(alpha2) {
      if (countryByAlpha2Code.hasOwnProperty(alpha2))
        return countryByAlpha2Code[alpha2].alpha3;
      else
        return;
    };
    clm.getLocaleByAlpha2 = function(alpha2) {
      if (countryByAlpha2Code.hasOwnProperty(alpha2))
        return countryByAlpha2Code[alpha2].default_locale;
      else
        return;
    };
    clm.getCountryNameByAlpha2 = function(alpha2) {
      if (countryByAlpha2Code.hasOwnProperty(alpha2))
        return countryByAlpha2Code[alpha2].name;
      else
        return;
    };
    clm.getNumericByAlpha2 = function(alpha2) {
      if (countryByAlpha2Code.hasOwnProperty(alpha2))
        return countryByAlpha2Code[alpha2].numeric;
      else
        return;
    };
    clm.getCurrencyByAlpha2 = function(alpha2) {
      if (countryByAlpha2Code.hasOwnProperty(alpha2))
        return countryByAlpha2Code[alpha2].currency;
      else
        return;
    };
    clm.getCountryByAlpha2 = function(alpha2) {
      return countryByAlpha2Code.hasOwnProperty(alpha2) ? countryByAlpha2Code[alpha2] : undefined;
    };
    clm.getAlpha2ByAlpha3 = function(alpha3) {
      if (countryByAlpha3Code.hasOwnProperty(alpha3))
        return countryByAlpha3Code[alpha3].alpha2;
      else
        return;
    };
    clm.getLocaleByAlpha3 = function(alpha3) {
      if (countryByAlpha3Code.hasOwnProperty(alpha3))
        return countryByAlpha3Code[alpha3].default_locale;
      else
        return;
    };
    clm.getCountryNameByAlpha3 = function(alpha3) {
      if (countryByAlpha3Code.hasOwnProperty(alpha3))
        return countryByAlpha3Code[alpha3].name;
      else
        return;
    };
    clm.getNumericByAlpha3 = function(alpha3) {
      if (countryByAlpha3Code.hasOwnProperty(alpha3))
        return countryByAlpha3Code[alpha3].numeric;
      else
        return;
    };
    clm.getCurrencyByAlpha3 = function(alpha3) {
      if (countryByAlpha3Code.hasOwnProperty(alpha3))
        return countryByAlpha3Code[alpha3].currency;
      else
        return;
    };
    clm.getCountryByAlpha3 = function(alpha3) {
      return countryByAlpha3Code.hasOwnProperty(alpha3) ? countryByAlpha3Code[alpha3] : undefined;
    };
    clm.getAlpha2ByNumeric = function(numeric) {
      if (countryByNumericCode.hasOwnProperty(numeric))
        return countryByNumericCode[numeric].alpha2;
      else
        return;
    };
    clm.getAlpha3ByNumeric = function(numeric) {
      if (countryByNumericCode.hasOwnProperty(numeric))
        return countryByNumericCode[numeric].alpha3;
      else
        return;
    };
    clm.getLocaleByNumeric = function(numeric) {
      if (countryByNumericCode.hasOwnProperty(numeric))
        return countryByNumericCode[numeric].default_locale;
      else
        return;
    };
    clm.getCountryNameByNumeric = function(numeric) {
      if (countryByNumericCode.hasOwnProperty(numeric))
        return countryByNumericCode[numeric].name;
      else
        return;
    };
    clm.getCurrencyByNumeric = function(numeric) {
      if (countryByNumericCode.hasOwnProperty(numeric))
        return countryByNumericCode[numeric].currency;
      else
        return;
    };
    clm.getCountryByNumeric = function(numeric) {
      return countryByNumericCode.hasOwnProperty(numeric) ? countryByNumericCode[numeric] : undefined;
    };
    clm.getAlpha2ByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name].alpha2;
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match].alpha2;
        }
      }
      return;
    };
    clm.getAlpha3ByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name].alpha3;
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match].alpha3;
        }
      }
      return;
    };
    clm.getLocaleByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name].default_locale;
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match].default_locale;
        }
      }
      return;
    };
    clm.getNumericByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name].numeric;
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match].numeric;
        }
      }
      return;
    };
    clm.getCurrencyByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name].currency;
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match].currency;
        }
      }
      return;
    };
    clm.getCountryByName = function(name, fuzzy) {
      if (countryByName.hasOwnProperty(name)) {
        return countryByName[name];
      } else if (fuzzy) {
        let match = getClosestMatch(name);
        if (match) {
          return countryByName[match];
        }
      }
      return;
    };
    clm.getCountriesByContinent = function(name) {
      if (countriesByContinent.hasOwnProperty(name)) {
        return countriesByContinent[name];
      }
      return;
    };
    function getClosestMatch(name) {
      let result = fuzz.extract(name, countryNames);
      if (result[0][1] >= 60) {
        return result[0][0];
      }
      return;
    }
    return clm;
  }
  module.exports = CLM();
});

// static/js/main.ts
var import_qrcode = __toESM(require_browser(), 1);
// ../edge-apps-library/dist/utils/theme.js
var DEFAULT_THEME_COLORS = {
  primary: "#972EFF",
  secondary: "#454BD2",
  tertiary: "#FFFFFF",
  background: "#C9CDD0"
};
function getPrimaryColor(accentColor) {
  if (!accentColor || accentColor.toLowerCase() === "#ffffff") {
    return DEFAULT_THEME_COLORS.primary;
  }
  return accentColor;
}
function getSecondaryColor(theme, lightColor, darkColor) {
  const defaultSecondary = "#adafbe";
  if (theme === "light") {
    return !lightColor || lightColor.toLowerCase() === "#ffffff" ? defaultSecondary : lightColor;
  } else if (theme === "dark") {
    return !darkColor || darkColor.toLowerCase() === "#ffffff" ? defaultSecondary : darkColor;
  }
  return DEFAULT_THEME_COLORS.secondary;
}
function getThemeColors() {
  const settings = screenly.settings;
  const primary = getPrimaryColor(settings.screenly_color_accent);
  const secondary = getSecondaryColor(settings.theme, settings.screenly_color_light, settings.screenly_color_dark);
  return {
    primary,
    secondary,
    tertiary: DEFAULT_THEME_COLORS.tertiary,
    background: DEFAULT_THEME_COLORS.background
  };
}
function applyThemeColors(colors) {
  document.documentElement.style.setProperty("--theme-color-primary", colors.primary);
  document.documentElement.style.setProperty("--theme-color-secondary", colors.secondary);
  document.documentElement.style.setProperty("--theme-color-tertiary", colors.tertiary);
  document.documentElement.style.setProperty("--theme-color-background", colors.background);
}
function setupTheme() {
  const colors = getThemeColors();
  applyThemeColors(colors);
  return colors;
}
// ../edge-apps-library/dist/utils/locale.js
var import_tz_lookup = __toESM(require_tz(), 1);
var import_country_locale_map = __toESM(require_country_locale_map(), 1);
// ../edge-apps-library/dist/utils/settings.js
function getSetting(key) {
  return screenly.settings[key];
}
function signalReady() {
  screenly.signalReadyForRendering();
}
// ../edge-apps-library/dist/utils/utm.js
function getDefaultUTMParams() {
  const { location, hostname } = screenly.metadata;
  return {
    utm_source: "screenly",
    utm_medium: "digital-signage",
    utm_location: encodeURIComponent(location),
    utm_placement: encodeURIComponent(hostname)
  };
}
function addUTMParams(url, params) {
  const utmParams = { ...getDefaultUTMParams(), ...params };
  const queryString = Object.entries(utmParams).map(([key, value]) => `${key}=${value}`).join("&");
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${queryString}`;
}
function addUTMParamsIf(url, enabled, params) {
  return enabled ? addUTMParams(url, params) : url;
}
// static/js/main.ts
function generateQrCode(url, options, callback) {
  import_qrcode.default.toString(url, options, (err, result) => {
    if (err)
      throw err;
    const parser = new DOMParser;
    const svg = parser.parseFromString(result, "image/svg+xml");
    callback(svg.documentElement);
  });
}
window.onload = function() {
  const url = getSetting("url") || "";
  const enableUtm = getSetting("enable_utm") === "true";
  const headline = getSetting("headline") || "";
  const callToAction = getSetting("call_to_action") || "";
  setupTheme();
  const headlineElement = document.querySelector("#headline");
  if (headlineElement && headline) {
    headlineElement.textContent = headline;
  }
  const ctaElement = document.querySelector("#cta");
  if (ctaElement && callToAction) {
    ctaElement.textContent = callToAction;
  }
  const finalUrl = addUTMParamsIf(url, enableUtm);
  generateQrCode(finalUrl, {
    type: "svg",
    color: {
      dark: "#000000",
      light: "#ffffff"
    },
    margin: 2
  }, (svgElement) => {
    const container = document.querySelector("#qr-code");
    container?.appendChild(svgElement);
    signalReady();
  });
};
