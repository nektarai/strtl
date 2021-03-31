const pushNumber = (heap, state, string) => {
  const { stack, pos, tokenStart } = heap;
  stack.push(parseFloat(string.substring(tokenStart, pos)));
  heap.pos--; // We need to process this character again in the 'tag' context.
  return 'tag';
};

exports.transits = {
  'num.beginInt': {
    'digit': 'num.intPart',
  },
  "num.intPart": {
    'digit': 'num.intPart',
    '.': 'num.beginFrac',
    'e': 'num.beginExp',
    'E': 'num.beginExp',
    '': pushNumber,
  },
  'num.beginFrac': {
    'digit': 'num.fracPart',
  },
  'num.fracPart': {
    'digit': 'num.fracPart',
    'e': 'num.beginExp',
    'E': 'num.beginExp',
    '': pushNumber,
  },
  'num.beginExp': {
    '+': 'num.beginExpNum',
    '-': 'num.beginExpNum',
    'digit': 'num.expPart',
  },
  'num.beginExpNum': {
    'digit': 'num.expPart',
  },
  'num.expPart': {
    'digit': 'num.expPart',
    '': pushNumber,
  }
};
