exports.prefix = '^@%)';
exports.suffix = '(%@^';

const prefixRe = /\"\^\@\%\)/g
const suffixRe = /\(\%\@\^\"/g;

exports.strInner = value => JSON.stringify(value)
  .replace(prefixRe, '{')
  .replace(suffixRe, '}');

exports.strOuter = value => JSON.stringify(value)
  .replace(prefixRe, '{')
  .replace(suffixRe, ':json}');
