const debug = require('../debug')('strtl:var');
const { wrapFn } = require('../functions.js');

const startWord = (heap) => {
  heap.tokenStart = heap.pos;
};

const endWord = (heap, state, string) => {
  heap.path.push(string.substring(heap.tokenStart, heap.pos));
};

const incr = (heap) => {
  heap.leadingDots++;
};

const endVar = (heap) => {
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

  debug(path, value, leadingDots);

  if (typeof value === 'function') {
    if (heap.currentFn) {
      throw Error(`Unexpected function ${path.join('.')
      } in the argument list of function ${heap.currFnName}`);
    }
    heap.currentFn = wrapFn(value);
    heap.currFnName = path.join('.');
  } else {
    stack.push(value);
  }

  heap.pos--;
  return 'tag';
};

exports.transits = {
  'var': {
    '.': [incr, 'var'],
    'alpha': [startWord, 'var.word'],
    '': endVar
  },
  'var.word': {
    'alpha_digit': 'var.word',
    '.': [endWord, 'var'],
    'whitespace': 'var.dot?',
    '': [endWord, endVar]
  },
  'var.dot?': {
    'whitespace': 'var.dot?',
    '.': 'var',
    '': endVar
  }
};
