const debug = require('./debug')('strtl:functions');

const { isTemplate } = require('./constants.js');
const machine = require('./states/index.js');
const run = require('./machine.js');

function truthy (value) {
  // Undefined, null, empty arrays and strings are falsy.
  // The number 0 is truthy.
  return value === 0 || !!value && !(Array.isArray(value) && !value.length);
}

function render(string, scopes, pos, out) {
  let result = '';
  const newHeap = {
    tokenStart: pos,
    pos,
    scopes,
    out: out || ((chunk) => {
      debug('buffer output', chunk);
      result += chunk;
    })
  };
  run(machine, string, 'txt', newHeap);
  return result;
}

function output(value, string, { scopes, out }) {
  if (value && value[isTemplate]) {
    value = render(string, scopes, value.start, out);
    return true;
  }
  if (truthy(value)) {
    out(value);
    return true;
  }
  return false;
}

exports['='] = exports['|'] = exports[':'] = function (string, heap) {
  const { stack, pos } = heap;
  if (stack.length < 1) {
    throw Error(`Invalid tag ending at ${pos}: at lest one argument expected, ${
      stack.length} found`);
  }

  for (let value of stack) if (output(value, string, heap)) return;
};

exports['#'] = function (string, heap) {
  const { stack, scopes, pos, out } = heap;
  if (stack.length < 2 || stack.length > 4) {
    throw Error(`Invalid # tag ending at ${pos}: 2-4 arguments expected, ${
      stack.length} found`);
  }
  const [arr, tpl, sep, def] = stack;

  if (!tpl?.[isTemplate]) {
    throw Error(`Invalid # tag ending at ${pos}: ${
      JSON.stringify(tpl)} is not a template`);
  }

  if (!truthy(arr)) {
    output(def, string, heap);
    return;
  }

  if (!Array.isArray(arr)) {
    throw Error(`Invalid # tag ending at ${pos}: ${
      JSON.stringify(arr)} is not an array`);
  }

  arr.forEach((element, index) => {
    const newScopes = [element, ...scopes];
    newScopes.indexes = [index, ...scopes.indexes || []];
    render(string, newScopes, tpl.start, out);
    if (index < arr.length - 1) output(sep, string, heap);
  });
};

function conditional(dir) {
  return function (string, heap) {
    const { stack, pos } = heap;
    if (stack.length < 2 || stack.length > 3) {
      throw Error(`Invalid ${dir ? '?' : '!'} tag ending at ${
        pos}: 2-3 arguments expected, ${stack.length} found`);
    }

    output(stack[truthy(stack[0]) === dir ? 1 : 2], string, heap);
  };
}

exports['?'] = conditional(true);
exports['!'] = conditional(false);

exports.wrapFn = function (fn) {
  return (string, {stack, scopes}) => {
    debug({ before: fn.name, stack, scopes });
    const args = stack.splice(-fn.length).map(arg => arg && arg[isTemplate]
      ? render(string, scopes, arg.start)
      : arg
    );
    stack.push(fn(...args));
    debug({ after: fn.name, args, stack });
  };
};
