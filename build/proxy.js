const { prefix, suffix, tplPrefix, tplSuffix } = require('./affixes.js');
const wrapped = Symbol();
const wrap = value => ({ [wrapped]: value });

function proxy(node) {
  const func = () => {};
  func.node = node;
  return new Proxy(func, traps);
}


const traps = {
  get({ node }, key) {
    if (key === 'toString') return JSON.stringify(node);
    if (key === 'toJSON') return toJSON(node);
    if (typeof key === 'symbol') return;
    return proxy({ ...node, expr: node.expr.concat([key]) });
  },
  ownKeys() {
    return [];
  },
  apply({ node }, self, args) {
    const name = node.expr[node.expr.length - 1];
    const expr = node.expr.slice(0, -1);
    switch(name) {
      case 'map':
        const child = wrap(args[0](root));
        return proxy({ ...node, expr, tag: '#', nodes: [child] });
      case 'then':
        return proxy({ ...node, expr, tag: '?', nodes: [wrap(args[0])] })
      case 'else':
        const numNodes = node.nodes.length;
        const lastNode = node.nodes[numNodes - 1];
        const delim = numNodes > 0 && typeof lastNode !== 'string' ? ':' : '';
        const nodes = node.nodes.concat([delim, wrap(args[0])]);
        return proxy({ ...node, expr, nodes });
      default:
        const tag = expr.length ? node.tag : '';
        return proxy({ ...node, expr, tag, nodes: node.nodes.concat([
          ':' + name, ...args].join(' ')) })
    }
  }
};

const root = proxy({ tag: '=', expr: [], nodes: [] });

const toJSON = ({ tag, expr, nodes }) => () => {
  const result = [];
  let tagStart = '{', tagEnd = '}', tplTrail = '', exprTrail = '';
  if (tag === '#') {
    tagStart = '[{';
    tagEnd = '}]';
    tplTrail = ','
  } else if (tag === '=' || tag === '') {
    exprTrail = ':json'
  }
  let string = prefix + tagStart + tag + expr.join('.');
  for (const node of nodes) {
    if (typeof node === 'string') {
      string += node;
    } else {
      result.push(string + exprTrail + tplPrefix, node[wrapped]);
      string = tplTrail + tplSuffix;
      exprTrail = '';
      tplTrail = '';
    }
  }
  string += exprTrail + tagEnd + suffix;
  result.push(string);
  return result;
};

module.exports = root;
