const debug = require('./debug')('strtl:machine');

module.exports = function run(
  machine, // transitions and character classes
  input,   // input string
  state,   // initial state (string matching a machine state)
  heap,    // object containing mutable properties
) {
  heap.pos = heap.pos || 0;
  debug('start', heap.pos);

  for (let char; (char = input[heap.pos]); heap.pos++) {
    const cTransits = machine.transits[state];

    /* Which transition should we take?
       We first check if a transition is defined for this character.
       If not, we see if there are any character classes defined for it.
       If that doesn't work either, use the default transit (''). */

    let next = cTransits[char] ?? cTransits[
      machine.classes[state]?.(char)
        ?.find(cls => cls && cls in cTransits) ?? ''
    ];

    if (typeof next === 'undefined') throw unexpected(char);

    /* Transitions may be defined as strings (the next state), functions
       (that mutate the heap before returning the next state), or arrays
       with functions and strings. All functions in an array are evaluated
       in order, and the final string (or the return value final function)
       becomes the next state. */

    next = exec(next);

    debug(`${state} -[${char}]-> ${next}`);
    if (next === 'end') {
      debug('return');
      return;
    }

    if (!(next in machine.transits)) {
      throw Error(
        `500 Invalid transition to ${next} from ${state} for token ${
          char} at ${heap.pos}`
      );
    }
    state = next;
  }
  const final = machine.transits[state]['\0'];
  if (typeof final === 'undefined') throw unexpected('end of input');
  exec(final);

  debug('halt');

  function exec(next) {
    if (typeof next === 'function') {
      return next(heap, state, input);
    }

    if (Array.isArray(next)) {
      return next.reduce((_, el) => {
        return typeof el === 'function' ? el(heap, state, input) : el;
      }, '');
    }

    return next;
  }


  function unexpected(message) {
    return Error(`400 Expected one of ${
      Object.keys(machine.transits[state]).join(', ')
    } in state ${state} at ${heap.pos}, found ${message} instead`);
  }
};
