const debug = require('../debug')('strtl:tag');

const functions = require('../functions.js');

const setType = (heap, state, string) => {
  heap.tagFn = functions[string[heap.pos]];
};

const startArg = (heap) => {
  heap.tokenStart = heap.pos;
  heap.path = [];
  heap.depth = 0;
  heap.leadingDots = 0;
};

const evalFn = (heap, state, string) => {
  if (!heap.currentFn) return;
  heap.currentFn(string, heap);
  debug('Called', heap.currFnName);
  heap.currentFn = null;
};

const endTag = (heap, state, string) => {
  heap.currentFn = heap.tagFn;
  heap.currFnName = 'tagFn';
  evalFn(heap, state, string);
  heap.tokenStart = heap.pos + 1;
};

const back = (heap) => {
  heap.pos--;
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
    '.': [startArg, 'tag.dot'],
    '+': [back, startArg, 'num.beginInt'],
    '-': [back, startArg, 'num.beginInt'],
    'digit': [back, startArg, 'num.intPart'],

    '"': [startArg, 'str'],
    '|': [evalFn, startArg, 'tup'],
  },

  'tag.dot': {
    'digit': [back, back, 'num.beginFrac'],
    '': [back, back, 'var']
  }
};
