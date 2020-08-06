const { prefix, suffix, spacer, tplPrefix, tplSuffix } = require('./affixes.js');
const wrapped = Symbol();
const wrap = value => ({ [wrapped]: value });

function proxy(node, id) {
  const func = () => {};
  func.node = node;
  func.id = id;
  return new Proxy(func, traps);
}


const traps = {
  get({ node, id }, key) {
    if (key === 'toString') return JSON.stringify(node);
    if (key === 'toJSON') return toJSON(node, id);
    if (typeof key === 'symbol') return;
    return proxy({ ...node, expr: node.expr.concat([key]) }, id);
  },
  ownKeys() {
    return [];
  },
  apply({ node, id }, self, args) {
    const name = node.expr[node.expr.length - 1];
    const expr = node.expr.slice(0, -1);
    switch(name) {
      case 'map':
        const child = wrap(args[0](root(id)));
        return proxy({ ...node, expr, tag: '#', nodes: [child] }, id);
      case 'then':
        return proxy({ ...node, expr, tag: '?', nodes: [wrap(args[0])] }, id)
      case 'else':
        const numNodes = node.nodes.length;
        const lastNode = node.nodes[numNodes - 1];
        const delim = numNodes > 0 && typeof lastNode !== 'string' ? ':' : '';
        const nodes = node.nodes.concat([delim, wrap(args[0])]);
        return proxy({ ...node, expr, nodes }, id);
      default:
        // const tag = expr.length ? node.tag : '';
        return proxy({ ...node, expr, tag: node.tag, nodes: node.nodes.concat([
          ':' + name, ...args].join(' ')) }, id)
    }
  }
};

const root = id => proxy({ tag: '=', expr: [], nodes: [] }, id);

const toJSON = ({ tag, expr, nodes }, id) => () => {
  const result = [];
  let tagStart = '{', tagEnd = '}', exprTrail = '';
  if (tag === '#') {
    tagStart = '[{';
    tagEnd = ':join}]';
  } else if (tag === '=' || tag === '') {
    if (!expr || !expr.length && nodes) tag = '';
    exprTrail = ':json'
  }
  let string = prefix + tagStart + spacer(id) + tag + expr.join('.');
  for (const node of nodes) {
    if (typeof node === 'string') {
      string += node;
    } else {
      result.push(string + exprTrail + tplPrefix, node[wrapped]);
      string = tplSuffix + spacer(id);
      exprTrail = '';
    }
  }
  string += exprTrail + tagEnd + suffix;
  result.push(string);
  return result;
};

module.exports = root;
