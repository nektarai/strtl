const debug = require('../debug')('strtl:tup');
const { isTemplate } = require('../constants.js');

const incr = (heap) => {
  heap.depth += 1;
  debug('incr', heap.pos, heap.depth);
};

const decr = (next) => (heap) => {
  heap.depth -= 1;
  debug('decr', heap.pos, heap.depth);

  if (heap.depth < 0) {
    debug('pushing template', heap.tokenStart);
    heap.stack.push({ [isTemplate]: true, start: heap.tokenStart + 1 });
    heap.pos--;
    return 'tag';
  }
  return next;
};

exports.transits = {
  'tup': {
    '{': 'tup.open?',
    '|': 'tup.shut?',
    '': 'tup',
  },
  'tup.tag': {
    '|': [incr, 'tup'],
    '}': 'tup',
    '"': 'tup.str',
    '': 'tup.tag',
  },
  'tup.str': {
    '\\': 'tup.esc',
    '"':  'tup.tag',
    '': 'tup.str',
  },
  'tup.esc': {
    '': 'tup.str',
  },
  'tup.open?': {
    '=': 'tup.tag',
    '?': 'tup.tag',
    '!': 'tup.tag',
    '#': 'tup.tag',
    ':': 'tup.tag',
    '|': [incr, 'tup'],
    '':  'tup',
  },
  'tup.shut?': {
    '}': decr('tup'),
    ':': decr('tup.tag'),
    '':  'tup',
  },
};
