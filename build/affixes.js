exports.prefix = '^@%)';
exports.suffix = '(%@^';

exports.tplPrefix = '@*$';
exports.tplSuffix = '$*@';

const prefixRe = /\[\"\^\@\%\)/g;
const suffixRe = /\(\%\@\^\"\]/g;

const tplPrefixRe = /\@\*\$\"\,/g;
const tplSuffixRe = /\,\"(\,?)\$\*\@/g;


exports.strOuter = value => JSON.stringify(value)
  .replace(prefixRe, '')
  .replace(suffixRe, '')
  .replace(tplPrefixRe, '|')
  .replace(tplSuffixRe, '$1|');
