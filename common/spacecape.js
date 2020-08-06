const RE = /\{\ *[=#?!|:]|\|\ *[:}]/g;

exports.spaceMore = function spaceMore(string) {
  return string.replace(
    RE,
    (match) => match[0] + ' ' + match.slice(1)
  );
}

exports.spaceLess = function spaceLess(string) {
  return string.replace(
    RE,
    (match) => match[0] + match.slice(2)
  );
}
