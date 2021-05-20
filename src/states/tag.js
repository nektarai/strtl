const { startArg, back, evalFn } = require('../heap.js');
const functions = require('../functions.js');

const setType = (heap, state, string) => {
  heap.tagFn = functions[string[heap.pos]];
};

const endTag = (heap, state, string) => {
  heap.currentFn = heap.tagFn;
  heap.currFnName = 'tagFn';
  evalFn(heap, state, string);
  heap.tokenStart = heap.pos + 1;
};

exports.transits = {
  'tag.open': {
    '=': [setType, startArg, 'var'],
    '?': [setType, startArg, 'var'],
    '!': [setType, startArg, 'var'],
    ':': [setType, startArg, 'var'],
    '#': [setType, startArg, 'var'],
    '|': [setType, startArg, 'tup'],
  },

  'tag': {
    'whitespace': 'tag',

    ':': [evalFn, 'tag'],
    '}': [evalFn, endTag, 'txt'],

    'alpha': [back, startArg, 'var'],
    'operator': [back, startArg, 'var'],
    'digit': [startArg, 'num.intPart'],
    '.': [startArg, 'tag.dot'],
    // '+': [startArg, 'tag.sign'],
    // '-': [startArg, 'tag.sign'],

    '"': [startArg, 'str'],
    '|': [evalFn, startArg, 'tup'],
  },

  'tag.dot': {
    'digit': [back, 'num.beginFrac'],
    '': [back, back, 'var']
  },

  'tag.sign': {
    'digit': [back, 'num.beginInt'],
    '': [back, back, 'var']
  }
};
