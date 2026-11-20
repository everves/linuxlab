// Compare the supported command forms as text. The input is never executed.
const TOKEN = /(?:\\[^\r\n]|'[^'\r\n]*'|"(?:\\[^\r\n]|[^"\\\r\n])*"|[^ \t\r\n"'\\|;])+|\|\||\|&|[|;]|[ \t]+/gy;
const SHORT_SWITCHES = new Map([
  ['nc', /^-[vz]+$/],
  ['ls', /^-[adhl]+$/],
  ['du', /^-[hs]+$/],
  ['ss', /^-[lnptu]+$/],
  ['docker exec', /^-[it]+$/],
]);
const TYPOGRAPHIC_FLAG = /^[‐‑‒–—−](?=[a-z-])/i;

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

const commandIndex = words => words[0] === 'sudo' ? 1 : 0;
const sameWords = (given, expected) =>
  given.length === expected.length && given.every((word, index) => word === expected[index]);

function normalized(input) {
  const words = tokens(input);
  if (!words?.length) return null;
  const first = commandIndex(words);
  if (words[first] === 'netcat') words[first] = 'nc';
  const exec = words[first] === 'docker' && words[first + 1] === 'exec';
  const switches = SHORT_SWITCHES.get(exec ? 'docker exec' : words[first]);
  if (!switches) return words;

  const start = first + (exec ? 2 : 1);
  let end = start;
  while (end < words.length && switches.test(words[end])) end++;
  if (end > start) {
    const flags = words.slice(start, end).flatMap(word => [...word.slice(1)]);
    words.splice(start, end - start, '-' + flags.sort().join(''));
  }
  return words;
}

export function answersMatch(input, expected) {
  const given = normalized(input);
  const answer = normalized(expected);
  return !!given && !!answer && sameWords(given, answer);
}

export function checkAnswer(input, expected) {
  const given = normalized(input);
  if (!given) return { correct: false, message: 'Проверь, что кавычки закрыты, а после обратной косой черты есть символ.' };
  const answers = expected.map(normalized).filter(Boolean);
  if (answers.some(answer => sameWords(given, answer))) return { correct: true };

  const index = commandIndex(given);
  const utility = given[index];
  const sameUtility = answers.filter(answer => answer[commandIndex(answer)] === utility);
  if (!sameUtility.length) return { correct: false, message: 'Для этого задания нужна другая утилита. Сверь её с целью задания.' };
  if (given.slice(index + 1).some(word => TYPOGRAPHIC_FLAG.test(word))) {
    return { correct: false, message: 'Перед флагами нужен обычный дефис (-). В твоей команде на этом месте стоит тире или знак минуса.' };
  }
  const samePrivilege = sameUtility.filter(answer => commandIndex(answer) === index);
  if (!samePrivilege.length) return { correct: false, message: 'Сверь, нужен ли sudo в этом задании.' };

  if (utility === 'nc') {
    const [, , host, port] = given.slice(index);
    const [, flags, expectedHost, expectedPort] = samePrivilege[0].slice(index);
    if (given[index + 1] !== flags) return { correct: false, message: 'Утилита выбрана верно. Проверь флаги TCP-проверки.' };
    if (host?.includes(':') && !port) return { correct: false, message: 'Передай адрес и порт двумя аргументами через пробел.' };
    if (host !== expectedHost) return { correct: false, message: 'Проверь адрес назначения.' };
    if (port !== expectedPort) return { correct: false, message: 'Адрес указан верно. Проверь номер порта.' };
    return { correct: false, message: 'Адрес и порт верны. Проверь, нет ли лишних аргументов после порта.' };
  }

  const flags = words => words.filter(word => /^-[a-z\d-]/i.test(word));
  if (samePrivilege.some(answer => sameWords(flags(given), flags(answer)))) {
    return { correct: false, message: 'Утилита и флаги совпадают. Проверь подкоманду, аргументы и их порядок.' };
  }
  return { correct: false, message: 'Утилита выбрана верно. Проверь флаги и их значения.' };
}

export function checkIncidentCommand(input, step) {
  if (step.command) return checkAnswer(input, [step.command]);
  const correct = step.patterns.some(pattern => new RegExp(pattern, 'i').test(input));
  return { correct };
}
