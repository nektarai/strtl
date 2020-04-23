module.exports = function render(nodes, scopes, helperFns) {
  return nodes.map(node => {
    if (typeof node === 'string') return node;
    const { tag, variable, template, helpers } = node;
    const value = variable && lookup(variable, scopes);

    switch(tag) {
      case '=':
        return finalize(value, helpers, helperFns);
      case '?':
        return truthy(value) ? finalize(
          render(template, scopes, helperFns),
          helpers, helperFns
        ) : ''
      case '!':
        return truthy(value) ? '' : finalize(
          render(template, scopes, helperFns),
          helpers, helperFns
        );
      case '#':
        return (finalize(
          value.map(item => render(template, [item, ...scopes], helperFns)),
          helpers, helperFns
        ) || []).join('')
      default:
        return finalize(
          render(template, scopes, helperFns),
          helpers, helperFns
        );
    }
  }).join('');
}

function lookup (variable, scopes) {
  let value;

  nextValue:
  for (value of scopes) {
    for (const word of variable) {
      if (!(word in value)) continue nextValue
      value = value[word]
    }
    return value
  }
}

function truthy (value) {
  // In addition to falsy things in the language, empty arrays are falsy.
  // Everything else is truthy.
  return !!value && !(Array.isArray(value) && !value.length)
}

function finalize (value = '', helpers, helperFns) {
  if (helperFns) {
    for (const helperStr of helpers) {
      const [fnName, ...args] = helperStr.split(/\s+/g);
      if (!helperFns[fnName]) continue;
      value = helperFns[fnName](value, ...args) || '';
    }
  }
  return truthy(value) ? value : '';
}
