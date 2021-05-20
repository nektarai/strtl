const debug = require('../debug')('strtl:var');
const { wrapFn } = require('../functions.js');
const { evalFn } = require('../heap.js');

const startWord = (heap) => {
  heap.tokenStart = heap.pos;
};

const endWord = (heap, state, string) => {
  heap.path.push(string.substring(heap.tokenStart, heap.pos));
};

const incr = (heap) => {
  heap.leadingDots++;
};

const pushVar = (heap, state, string) => {
  let { path, stack, scopes, leadingDots } = heap;

  let value;
  if (path.length || !leadingDots) {
    nextScope:
    for (let j = leadingDots; j < scopes.length; j++) {
      let scope = scopes[j];
      for (const word of path) {
        if (typeof scope !== 'object' || !scope || !(word in scope)) {
          continue nextScope;
        }
        scope = scope[word];
      }
      value = scope;
      break;
    }
  } else {
    value = scopes.indexes[leadingDots - 1];
  }

  if (state === 'var.operator' && typeof value !== 'function') {
    throw Error(`Expected function for operator ${path[0]}, found ${value}`);
  }

  debug({ path, value, leadingDots });

  if (typeof value === 'function') {
    evalFn(heap, state, string);
    heap.currentFn = wrapFn(value);
    heap.currFnName = path.join('.');
  } else {
    stack.push(value);
  }

  heap.pos--;
  return 'tag';
};

const startOperator = (heap, state, string) => {
  let { path, leadingDots } = heap;

  // Is there an unfinished var (with trailing dots) before this?
  if (path.length || leadingDots) return pushVar(heap, state, string);

  startWord(heap, state, string);
  return 'var.operator';
};

exports.transits = {
  'var': {
    '.': [incr, 'var'],
    'alpha': [startWord, 'var.word'],
    'operator': startOperator,
    'whitespace': 'var',
    '': pushVar
  },
  'var.word': {
    'alpha_digit': 'var.word',
    '.': [endWord, 'var'],
    'whitespace': [endWord, 'var.dot?'],
    '': [endWord, pushVar]
  },
  'var.dot?': {
    'whitespace': 'var.dot?',
    '.': 'var',
    '': pushVar
  },
  'var.operator': {
    'operator': 'var.operator',
    '': [endWord, pushVar]
  }
};
