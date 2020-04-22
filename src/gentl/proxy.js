const { prefix, suffix, strInner } = require('./affixes.js');

function proxy(node) {
  const fnNode = () => {};
  for (const key in node) {
    // console.log('Copied', key, );
    fnNode[key] = node[key];
  }
  return new Proxy(fnNode, traps);
}

const traps = {
  get(node, key) {
    if (key === 'toString') return JSON.stringify(node);
    if (key === 'toJSON') return toJSON(node);
    if (typeof key === 'symbol') return;
    return proxy({ ...node, expr: node.expr.concat([key]) });
  },
  apply(node, self, args) {
    const name = node.expr[node.expr.length - 1];
    const expr = node.expr.slice(0, -1);
    switch(name) {
      case 'map':
        const child = args[0](root);
        return proxy({ ...node, expr, tag: '#', nodes: [child] });
      case 'ifTrue':
        return proxy({ ...node, expr, tag: '?', nodes: [args[0]] })
      case 'ifFalse':
        return proxy({ ...node, expr, tag: '!', nodes: [args[0]] })
      case 'else':
        return proxy({ ...node, expr, nodes: node.nodes.concat(
          [nodes.length === 1 ? ':' : '', args[0]]
        ) });
      default:
        return proxy({ ...node, expr, nodes: node.nodes.concat([
          ':' + name, ...args].join(' ')) })
    }
  }
};

const root = proxy({ tag: '=', expr: [], nodes: [] });

const toJSON = ({ tag, expr, nodes }) => () => {
  return [
    prefix,
    tag,
    expr.join('.'),
    ...nodes.map(node =>
      typeof node === 'string'
      ? node
      : `|${strInner(node)}|`
    ),
    suffix
  ].filter(Boolean).join('');
};

module.exports = root;
