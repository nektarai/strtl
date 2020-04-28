const transitions = {
  template: {
    '{=': ['push', 'variable'],
    '{#': ['push', 'variable'],
    '{?': ['push', 'variable'],
    '{!': ['push', 'variable'],
    '{|': ['push', 'template'],
    '|}': ['pop', 'template'],
    '|:': ['', 'helpers'],
  },
  variable: {
    '.': ['', 'variable'],
    ':': ['', 'helpers'],
    '|': ['def', 'template'],
    '}': ['pop', 'template'],
  },
  helpers: {
    '|': ['flip', 'template'],
    ':': ['', 'helpers'],
    '}': ['pop', 'template'],
  }
}

module.exports = function parse(string) {
  const stack = [];
  let context = 'template';
  let startIx = 0, i = 0;
  let current = { tag: '|', template: [], helpers: [] };
  const ops = { push, pop, flip, def };

  while (i < string.length) {
    for (const token in transitions[context]) {
      if (!test(token)) continue;
      add(string.substring(startIx, i), token);
      startIx = i + token.length;
      i += (token.length - 1);
      break;
    }
    i++;
  }
  if (startIx < string.length) add(string.substr(startIx));
  return stack.length ? stack[0].template : current.template;

  function push(token) {
    const node = { tag: token[1], variable: [], template: [], helpers: [] };
    current.template.push(node);
    stack.push(current);
    current = node;
  }

  function pop() {
    if (stack.length) current = stack.pop();
  }

  function flip() {
    current = {
      tag: '!',
      variable: current.variable,
      template: [],
      helpers: [],
    };
    stack[stack.length - 1].template.push(current);
  }

  function def() {
    if (current.tag === '=') flip();
  }

  function add(value, token) {
    if (value) current[context].push(value);
    if (!token) return;
    const [op, nextState] = transitions[context][token];
    if (ops[op]) ops[op](token);
    if (nextState) context = nextState;
  }

  function test(token) {
    for (let j = 0; j < token.length; j++) {
      if (token[j] !== string[i + j]) return false;
    }
    return true;
  }
}
