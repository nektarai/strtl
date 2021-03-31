const debug = require('../debug')('strtl:txt');

const chunk = (heap, state, string) => {
  debug('chunk');
  if (heap.tokenStart < heap.pos - 1) {
    heap.out(string.substring(heap.tokenStart, heap.pos - 1));
  }
};
// const chunk2 = (heap, state, string) => {
//   debug('chunk2');
//   heap.out(string.substring(heap.tokenStart, heap.pos - 3));
// };

const final = (heap, state, string) => {
  debug('final');
  if (heap.tokenStart < heap.pos) {
    heap.out(string.substring(heap.tokenStart, heap.pos));
  }
};

const mark = (heap) => {
  heap.tokenStart = heap.pos;
};

const startTag = (heap) => {
  heap.pos--;
  heap.stack = [];
  heap.currentFn = null;
  return 'tag.open';
};

exports.transits = {
  'txt': {
    '{': 'txt.open?',
    '|':  'txt.end?',
    '\0': [final, 'end'],
    '': 'txt',
  },
  'txt.open?': {
    '=': [chunk, startTag],
    '?': [chunk, startTag],
    '!': [chunk, startTag],
    ':': [chunk, startTag],
    '#': [chunk, startTag],
    '|': [chunk, startTag],
    'whitespace': 'txt.escopen?',
    '': 'txt',
  },
  'txt.end?': {
    '}': [chunk, 'end'],
    ':': [chunk, 'end'],
    'whitespace': 'txt.escend?',
    '': 'txt',
  },
  'txt.escopen?': {
    '=': [chunk, mark, 'txt'],
    '?': [chunk, mark, 'txt'],
    '!': [chunk, mark, 'txt'],
    ':': [chunk, mark, 'txt'],
    '#': [chunk, mark, 'txt'],
    '|': [chunk, mark, 'txt'],
    'whitespace': 'txt.escopen?',
    '': 'txt',
  },
  'txt.escend?': {
    '}': [chunk, mark, 'txt'],
    ':': [chunk, mark, 'txt'],
    'whitespace': 'txt.escend?',
    '': 'txt',
  }

};
