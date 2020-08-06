const { spaceMore } = require('../common/spacecape.js');

exports.prefix = '^@%)';
exports.suffix = '(%@^';

exports.tplPrefix = '@*$';
exports.tplSuffix = '$*@';

exports.spacer = (id) => `&#!${id}!#&`;

const prefixRe = /\[\"\^\@\%\)/g;
const suffixRe = /\(\%\@\^\"\]/g;

const tplPrefixRe = /\@\*\$\"\,/g;
const tplSuffixRe = /\,\"\$\*\@/g;

const spacerRe = /\&\#\!(\d+)\!\#\&/g;

exports.strOuter = (value, buildId) => spaceMore(
  JSON.stringify(value)
    .replace(prefixRe, '')
    .replace(suffixRe, '')
    .replace(tplPrefixRe, '|')
    .replace(tplSuffixRe, '|')
  ).replace(spacerRe, (match, id) => id === buildId ? '' : match);
