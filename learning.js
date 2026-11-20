// Scheduling uses the existing version 1 drill history.
const DAY = 86_400_000;
const INTERVALS = [1, 3, 7, 14, 30, 60];

export const needsPractice = row => !!row && row.streak < 2 && (row.relearning || row.fails > 0 || (row.seen > 0 && row.streak === 0));

export function recordAnswer(previous, { correct, independent, hadMiss }, now = Date.now()) {
  const row = { seen: 0, correct: 0, fails: 0, streak: 0, interval: 0, due: 0, ...previous };
  row.seen++;
  row.last = now;
  if (correct) row.correct++;
  if (!correct || hadMiss) row.fails++;
  if (!correct || !independent) {
    row.relearning = true;
    row.streak = 0;
    row.interval = correct ? 1 : 0;
  } else if (row.due > now) {
    // Early practice does not advance the interval or postpone the scheduled review.
    return row;
  } else {
    if (needsPractice(previous)) row.relearning = true;
    row.streak++;
    if (row.streak >= 2) delete row.relearning;
    row.interval = INTERVALS[Math.min(row.streak, INTERVALS.length) - 1];
  }
  row.due = now + row.interval * DAY;
  return row;
}

export function planPractice(drills, history, limit, now = Date.now()) {
  const review = drills.filter(d => history[d.id]?.seen && history[d.id].due <= now)
    .sort((a, b) => history[a.id].due - history[b.id].due);
  // Interleave modules at the same level, retaining the order of lessons within each.
  const moduleCounts = new Map();
  const fresh = drills.filter(d => !history[d.id]?.seen).map(drill => {
    const position = moduleCounts.get(drill.moduleId) || 0;
    moduleCounts.set(drill.moduleId, position + 1);
    return { drill, position };
  }).sort((a, b) => a.drill.level - b.drill.level || a.position - b.position);
  const plan = review.map(drill => ({ id: drill.id, reason: needsPractice(history[drill.id]) ? 'Сложное задание' : 'Пора повторить' }));
  plan.push(...fresh.map(({ drill }) => ({ id: drill.id, reason: 'Новая команда' })));
  if (plan.length < limit) {
    const known = drills.filter(d => history[d.id]?.seen && history[d.id].due > now)
      .sort((a, b) => history[a.id].due - history[b.id].due);
    plan.push(...known.map(drill => ({ id: drill.id, reason: 'Для закрепления' })));
  }
  return plan.slice(0, limit);
}
