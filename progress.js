export const PROGRESS_KEY = 'linuxlab-progress-v1';
export const DAILY_GOALS = [5, 10, 15, 20, 30, 50];

export function newProgress() {
  return { version: 1, drills: {}, incidents: {}, daily: {}, xp: 0, settings: { dailyGoal: 10 }, createdAt: Date.now() };
}

const count = value => Number.isSafeInteger(value) && value >= 0;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const contentId = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
const localDate = /^\d{4}-\d{2}-\d{2}$/;

function mapOf(value, keyPattern, checkRow) {
  return record(value) && Object.entries(value).every(([key, row]) => keyPattern.test(key) && record(row) && checkRow(row));
}

export function parseProgress(json) {
  const data = JSON.parse(json);
  if (!record(data) || data.version !== 1) throw new Error('Нужна резервная копия LinuxLab версии 1.');
  if (
    !count(data.xp) ||
    !record(data.settings) ||
    !DAILY_GOALS.includes(data.settings.dailyGoal) ||
    (data.createdAt !== undefined && !count(data.createdAt)) ||
    !mapOf(data.drills, contentId, row =>
      [row.seen, row.correct, row.fails, row.streak, row.interval, row.due, row.last].every(count)
    ) ||
    !mapOf(data.incidents, contentId, row => row.done === true && count(row.completedAt)) ||
    !mapOf(data.daily, localDate, row => [row.drills, row.incidents].every(count))
  ) {
    throw new Error('В резервной копии есть некорректные данные прогресса.');
  }
  return { ...data, createdAt: data.createdAt ?? Date.now() };
}

export function loadProgress(storage) {
  try {
    const json = storage()?.getItem(PROGRESS_KEY);
    return json ? parseProgress(json) : newProgress();
  } catch {
    return newProgress();
  }
}
