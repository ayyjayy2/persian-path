// Merges the progress two devices hold for the same account. Pure: no DOM, Firebase or Preact,
// so Node can test it (tests/unit/sync.test.mjs). Rules: docs/superpowers/specs/2026-10-23-sync-design.md

// State keys pushed to app_state in each learner's Firestore document (users/{uid})
export const SYNCED = ['srs', 'mistakes', 'mistakeAt', 'prefs', 'prefsU', 'scriptSeen', 'vowelsSeen', 'grammarSeen',
  'todayXp', 'lastPlayedDate', 'myWords', 'deletedWords'];

const MAX_MISTAKES = 40;
const u = x => (x && x.u) || 0;
const day = d => (d ? new Date(d).getTime() || 0 : 0);

// Per key, the later of two timestamped entries; a tie keeps a (local)
function newer(a = {}, b = {}) {
  const out = { ...a };
  Object.entries(b).forEach(([k, v]) => { if (!(k in out) || u(v) > u(out[k])) out[k] = v; });
  return out;
}

export function mergeState(local, remote) {
  const L = local || {}, R = remote || {};

  const deletedWords = { ...(L.deletedWords || {}) };
  Object.entries(R.deletedWords || {}).forEach(([id, t]) => { if (!(deletedWords[id] >= t)) deletedWords[id] = t; });

  const byId = {};
  [...(L.myWords || []), ...(R.myWords || [])].forEach(w => { if (!byId[w.id] || u(w) > u(byId[w.id])) byId[w.id] = w; });
  const myWords = Object.values(byId).filter(w => !(deletedWords[w.id] >= u(w))).sort((a, b) => (b.created || 0) - (a.created || 0));
  const kept = new Set(myWords.map(w => w.id));
  const gone = k => k.startsWith('my:') && deletedWords[k.slice(3)] != null && !kept.has(k.slice(3));

  const srs = newer(L.srs, R.srs);
  Object.keys(srs).forEach(k => { if (gone(k)) delete srs[k]; });

  const at = { ...(L.mistakeAt || {}) };
  Object.entries(R.mistakeAt || {}).forEach(([k, t]) => { if (!(at[k] >= t)) at[k] = t; });
  const mistakes = [...new Set([...(L.mistakes || []), ...(R.mistakes || [])])].filter(k => !gone(k))
    .sort((a, b) => (at[b] || 0) - (at[a] || 0)).slice(0, MAX_MISTAKES);
  const mistakeAt = {}; mistakes.forEach(k => { if (at[k] != null) mistakeAt[k] = at[k]; });

  const remotePrefs = (R.prefsU || 0) > (L.prefsU || 0);

  const sameDay = L.lastPlayedDate === R.lastPlayedDate;
  const todayXp = sameDay ? Math.max(L.todayXp || 0, R.todayXp || 0)
    : day(R.lastPlayedDate) > day(L.lastPlayedDate) ? (R.todayXp || 0) : (L.todayXp || 0);

  return {
    srs, mistakes, mistakeAt, myWords, deletedWords,
    prefs: remotePrefs ? (R.prefs || {}) : (L.prefs || {}), prefsU: Math.max(L.prefsU || 0, R.prefsU || 0),
    scriptSeen: !!(L.scriptSeen || R.scriptSeen), vowelsSeen: !!(L.vowelsSeen || R.vowelsSeen),
    grammarSeen: { ...(L.grammarSeen || {}), ...(R.grammarSeen || {}) },
    todayXp,
  };
}
