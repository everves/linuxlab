// Compare a small, explicit set of expected command spellings. Never evaluate the input.
const TOKEN = /(?:\\[^\r\n]|'[^'\r\n]*'|"(?:\\[^\r\n]|[^"\\\r\n])*"|[^ \t\r\n"'\\|;])+|\|\||\|&|[|;]|[ \t]+/gy;

function tokens(command) {
  const words = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < command.length) {
    const match = TOKEN.exec(command);
    if (!match) return null;
    const [word] = match;
    if (/^[ \t]+$/.test(word)) continue;
    // A whole single-quoted literal also fits in double quotes when it has no expansions.
    const literal = /^'([^'"$`!\\]*)'$/.exec(word);
    words.push(literal ? `"${literal[1]}"` : word);
  }
  if (words.at(-1) === ';' && !/[|;&]+$/.test(words.at(-2) || '')) words.pop();
  return words;
}

export function answersMatch(input, expected) {
  const given = tokens(input);
  const answer = tokens(expected);
  return !!given?.length && given.length === answer?.length &&
    given.every((word, index) => word === answer[index]);
}
