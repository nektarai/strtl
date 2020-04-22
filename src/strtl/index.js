import parse from './parse.js';
import render from './render.js';

export default function (template, scopes, helperFns) {
  if (!Array.isArray(scopes)) scopes = [scopes];
  const tree = parse(template);
  return render(tree, scopes, helperFns);
}
