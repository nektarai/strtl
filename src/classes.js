exports.whitespace = (char) => (
  char === ' ' || char === '\t' || char === '\n' || char === '\r'
) && 'whitespace';

exports.alpha_digit = (char) => (
  char >= 'a' && char <= 'z' ||
  char >= 'A' && char <= 'Z' ||
  char >= '0' && char <= '9' ||
  char === '_'
) && 'alpha_digit';

exports.alpha = (char) => (
  char >= 'a' && char <= 'z' ||
  char >= 'A' && char <= 'Z' ||
  char === '_'
) && 'alpha';

exports.digit = (char) => (
  char >= '0' && char <= '9'
) && 'digit';
