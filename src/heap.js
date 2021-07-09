const debug = require('./debug')('strtl:heap');

exports.startArg = (heap) => {
  heap.tokenStart = heap.pos;
  heap.path = [];
  heap.depth = 0;
  heap.leadingDots = 0;
};

exports.evalFn = (heap, state, string) => {
  if (!heap.currentFn) return;
  heap.currentFn(string, heap);
  debug('Called', heap.currFnName);
  heap.currentFn = null;
};

exports.back = (heap) => {
  heap.pos--;
};
