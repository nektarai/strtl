const pushString = ({ stack, pos, tokenStart }, state, string) => {
  stack.push(JSON.parse(string.substring(tokenStart, pos + 1)));
  return 'tag';
};

exports.transits = {
  'str': {
    '\\': 'str.esc',
    '"':  [pushString, 'tag'],
    '': 'str',
  },
  'str.esc': {
    '': 'str',
  },
};
