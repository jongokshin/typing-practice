const STORAGE_KEY = 'typing_practice_scores';
const MAX_RECORDS = 100;

export const ScoreStore = {
  save(record) {
    const all = this.getAll();
    all.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...record,
    });
    if (all.length > MAX_RECORDS) all.splice(MAX_RECORDS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (_) {}
    return all[0];
  },

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (_) {
      return [];
    }
  },

  getByMode(mode) {
    return this.getAll().filter(r => r.mode === mode);
  },

  getBest(mode) {
    const records = this.getByMode(mode);
    if (!records.length) return null;
    return records.reduce((best, r) => (r.wpm > best.wpm ? r : best), records[0]);
  },

  getRecent(count = 10) {
    return this.getAll().slice(0, count);
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
