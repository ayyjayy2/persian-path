// Persian Learnin v2 — app logic. Ported from the v2 design export; markup lives in view.js.
import { h, render, Component } from './vendor/preact-htm.js';
import * as D from './learn-data.js';
import { view } from './view.js';

// ===== SUPABASE =====
const SUPABASE_URL = 'https://rpnwwtsdfclcyexdafks.supabase.co';
const SUPABASE_KEY = 'sb_publishable_40HGCpUI6aogWTGhS8fGDA_B3Fozx_w';
const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ===== PERSISTENCE =====
const STORE_KEY = 'pl_state_v2';
const V1_KEY = 'persian_app_state';
const PERSISTED = ['xp', 'streak', 'todayXp', 'lastPlayedDate', 'progress', 'srs', 'mistakes', 'prefs', 'scriptSeen', 'myWords'];
const MIN = 60e3, DAY = 864e5;
// Review intervals per Leitner box: today, 1 day, 3 days, 1 week, 1 month
const INTERVALS = [MIN, DAY, 3 * DAY, 7 * DAY, 30 * DAY];

const dayKey = (t = Date.now()) => new Date(t).toDateString();

// Pictures for My words live in IndexedDB: as data URLs in localStorage they would soon fill its
// ~5 MB quota, and then progress would stop saving.
const media = (() => {
  let db;
  const open = () => db || (db = new Promise((res, rej) => {
    const r = indexedDB.open('pl_media', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('img');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = (mode, fn) => open().then(d => new Promise((res, rej) => {
    const t = d.transaction('img', mode), q = fn(t.objectStore('img'));
    t.oncomplete = () => res(q.result); t.onerror = () => rej(t.error);
  }));
  return { get: k => tx('readonly', st => st.get(k)), put: (k, v) => tx('readwrite', st => st.put(v, k)), del: k => tx('readwrite', st => st.delete(k)) };
})();

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) return saved;
    // One-time carry-over from the v1 app
    const v1 = JSON.parse(localStorage.getItem(V1_KEY) || 'null');
    if (v1) return { xp: v1.xp || 0, streak: v1.streak || 0, lastPlayedDate: v1.lastPlayedDate || null, progress: v1.completedLessons || {} };
  } catch (e) {}
  return {};
}

// Roll the daily counters forward: a new day resets today's XP; a missed day breaks the streak.
function rollDay(s) {
  const today = dayKey(), yesterday = dayKey(Date.now() - DAY);
  if (s.lastPlayedDate === today) return s;
  return { ...s, todayXp: 0, streak: s.lastPlayedDate === yesterday ? s.streak : 0 };
}

class App extends Component {
  state = { ready: false, w: window.innerWidth, tab: 'learn', route: null, sheet: null, authMode: 'signin',
    xp: 0, streak: 0, todayXp: 0, goal: 30, lastPlayedDate: null,
    progress: {}, srs: {}, mistakes: [], prefs: {}, myWords: [], imgs: {}, draft: null, ex: null, result: null, letterFilter: 'all', noteOpen: true, playing: null, wordQuery: '',
    online: navigator.onLine, user: null, authEmail: '', authPassword: '', authMsg: null, authErr: false, authBusy: false, refreshing: false, refreshNote: null, holiday: null, mapSection: null };

  componentDidMount() {
    this.D = D;
    this.setState({ ...rollDay({ ...this.state, ...loadLocal() }), ready: true }, () => this.loadImgs());
    this._r = () => this.setState({ w: window.innerWidth });
    window.addEventListener('resize', this._r);
    this._bip = e => { e.preventDefault(); this._deferred = e; };
    window.addEventListener('beforeinstallprompt', this._bip);
    this._net = () => { this.setState({ online: navigator.onLine }); if (navigator.onLine) this.pushRemote(); };
    window.addEventListener('online', this._net); window.addEventListener('offline', this._net);
    if (sb) sb.auth.onAuthStateChange((event, session) => {
      const user = session ? session.user : null;
      const was = this.state.user;
      this.setState({ user });
      if (user && (!was || was.id !== user.id)) setTimeout(() => this.pullRemote(user), 0);
    });
  }
  componentWillUnmount() { window.removeEventListener('resize', this._r); window.removeEventListener('beforeinstallprompt', this._bip); window.removeEventListener('online', this._net); window.removeEventListener('offline', this._net); }
  componentDidUpdate(prevProps, prev) {
    if (!this.state.ready) return;
    const s = this.state;
    const data = {}; PERSISTED.forEach(k => { data[k] = s[k]; });
    const json = JSON.stringify(data);
    if (json !== this._lastSaved) {
      this._lastSaved = json;
      try { localStorage.setItem(STORE_KEY, json); } catch (e) {}
      if (prev.ready) this.pushRemote();
    }
    const ex = s.ex;
    const n = ex && ex.kind === 'convo' ? ex.log.length + (ex.wrongMsg ? 1 : 0) : 0;
    if (n && n !== this._logLen) setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 60);
    this._logLen = n;
    if (s.route && s.route.name === 'map' && s.mapSection !== this._mapFor) this.mountMap(s.mapSection);
    if (!(s.route && s.route.name === 'map') && this._map) this.unmountMap();
  }

  // ---------- account sync ----------
  // The profiles table (xp, streak, last_played_date, completed_lessons) predates v2; the review
  // schedule, mistakes and preferences stay on the device.
  async pullRemote(user) {
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      this.setState(s => {
        const progress = { ...(data.completed_lessons || {}) };
        Object.entries(s.progress).forEach(([id, p]) => { progress[id] = typeof p === 'object' ? { ...(progress[id] || {}), ...p } : p; });
        const remoteNewer = data.last_played_date && (!s.lastPlayedDate || new Date(data.last_played_date) > new Date(s.lastPlayedDate));
        return rollDay({ ...s, progress, xp: Math.max(s.xp, data.xp || 0),
          streak: remoteNewer ? (data.streak || 0) : s.streak, lastPlayedDate: remoteNewer ? data.last_played_date : s.lastPlayedDate });
      });
    }
    this.pushRemote();
  }
  pushRemote() {
    const s = this.state; if (!sb || !s.user || !navigator.onLine) return;
    clearTimeout(this._pushT);
    this._pushT = setTimeout(() => {
      sb.from('profiles').upsert({ id: s.user.id, xp: this.state.xp, streak: this.state.streak, last_played_date: this.state.lastPlayedDate,
        completed_lessons: this.state.progress, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) console.warn('Sync failed', error.message); });
    }, 600);
  }
  async submitAuth(e) {
    e.preventDefault();
    const s = this.state; if (!sb || !navigator.onLine) return this.setState({ authMsg: "You're offline. Sign in once you're connected — your progress is saved on this device meanwhile.", authErr: true });
    this.setState({ authBusy: true, authMsg: null });
    const creds = { email: s.authEmail.trim(), password: s.authPassword };
    const res = s.authMode === 'signin' ? await sb.auth.signInWithPassword(creds) : await sb.auth.signUp(creds);
    if (res.error) return this.setState({ authBusy: false, authMsg: res.error.message, authErr: true });
    if (s.authMode === 'signup' && res.data.user && !res.data.session) return this.setState({ authBusy: false, authMsg: 'Check your email to confirm your account, then sign in.', authErr: false, authMode: 'signin', authPassword: '' });
    this.setState({ authBusy: false, sheet: null, authPassword: '', authMsg: null });
  }
  async signOut() {
    this.setState({ sheet: null });
    try { await sb.auth.signOut(); } catch (e) {}
    // Back to a clean guest profile on this device
    this._lastSaved = null;
    this.setState({ user: null, xp: 0, streak: 0, todayXp: 0, lastPlayedDate: null, progress: {}, srs: {}, mistakes: [], scriptSeen: false, tab: 'learn', route: null });
  }

  // ---------- refresh ----------
  // Home screen apps have no reload button: fetch the newest service worker and files, then reload.
  async refreshApp() {
    if (!navigator.onLine) return this.setState({ refreshNote: "You're offline — connect to get the latest version" });
    this.setState({ refreshing: true, refreshNote: null });
    try {
      const reg = 'serviceWorker' in navigator && await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        const sw = reg.installing || reg.waiting;
        // A new version downloads every lesson and recording first; wait for it (up to a minute)
        if (sw) await new Promise(res => {
          const done = () => sw.state === 'activated' || sw.state === 'redundant';
          if (done()) return res();
          sw.addEventListener('statechange', () => done() && res());
          setTimeout(res, 60e3);
        });
      }
    } catch (e) {}
    location.reload();
  }

  // ---------- maps ----------
  mountMap(section) {
    this.unmountMap(); this._mapFor = section;
    const el = document.getElementById('pl-map'); if (!el || !window.L || !section) return;
    const map = L.map(el, { center: section.center, zoom: section.zoom, scrollWheelZoom: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    section.markers.forEach(m => {
      const icon = L.divIcon({ className: 'pl-marker', html: `<span style="--m:${m.color}">${m.emoji}</span>`, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18] });
      L.marker([m.lat, m.lng], { icon, title: m.label }).addTo(map).bindPopup(m.popup, { maxWidth: 220 });
    });
    this._map = map;
  }
  unmountMap() { if (this._map) { try { this._map.remove(); } catch (e) {} } this._map = null; this._mapFor = null; }

  // ---------- helpers ----------
  icon(name, size = 20, sw = 1.6) {
    const P = {
      book: ['M12 7v14', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'],
      review: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
      feather: ['M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z', 'M16 8 2 22', 'M17.5 15H9'],
      compass: [{ c: [12, 12, 10] }, 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z'],
      user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', { c: [12, 7, 4] }],
      vol: ['M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z', 'M16 9a5 5 0 0 1 0 6', 'M19.364 18.364a9 9 0 0 0 0-12.728'],
      mic: ['M12 19v3', 'M19 10v2a7 7 0 0 1-14 0v-2', { r: [9, 2, 6, 13, 3] }],
      back: ['m12 19-7-7 7-7', 'M19 12H5'], x: ['M18 6 6 18', 'm6 6 12 12'], check: ['M20 6 9 17l-5-5'], chev: ['m9 18 6-6-6-6'],
      flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
      zap: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'],
      layers: ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'],
      list: ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
      headphones: ['M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'],
      blocks: [{ r: [14, 3, 7, 7, 1] }, 'M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3'],
      bulb: ['M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5', 'M9 18h6', 'M10 22h4'],
      play: ['M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z'],
      stop: [{ r: [6, 6, 12, 12, 1] }],
      download: ['M12 15V3', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5'],
      lock: [{ r: [3, 11, 18, 11, 2] }, 'M7 11V7a5 5 0 0 1 10 0v4'],
      chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
      plus: ['M5 12h14', 'M12 5v14'],
      sparkles: ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'],
      trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
      image: [{ r: [3, 3, 18, 18, 2] }, { c: [9, 9, 2] }, 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'],
      pen: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
    }[name] || [];
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', style: { display: 'block', flex: 'none' } },
      ...P.map((p, i) => typeof p === 'string' ? h('path', { key: i, d: p }) : p.c ? h('circle', { key: i, cx: p.c[0], cy: p.c[1], r: p.c[2] }) : h('rect', { key: i, x: p.r[0], y: p.r[1], width: p.r[2], height: p.r[3], rx: p.r[4] })));
  }
  faNum(n) { return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]); }
  shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  prefs() {
    const p = this.state.prefs || {}, pr = this.props;
    return { script: p.script ?? pr.scriptMode ?? 'both', register: p.register ?? pr.register ?? 'spoken', speed: p.speed ?? 1, mature: p.mature ?? pr.showMature ?? false };
  }
  setPref(k, v) { this.setState(s => ({ prefs: { ...s.prefs, [k]: v } })); }
  disp(w) {
    const written = this.prefs().register === 'written' && w.written;
    return { fa: written ? w.written : w.persian, lat: written ? w.writtenPhonetic : w.phonetic, en: w.english, num: w.digit != null ? this.faNum(w.digit) : null };
  }
  lessons() {
    const m = this.prefs().mature, all = this.D.LESSONS.filter(l => m || !l.mature);
    const order = this.D.STAGES.flatMap(st => st.items.filter(i => i.kind === 'lesson').map(i => i.id));
    return [...order.map(id => all.find(l => l.id === id)).filter(Boolean), ...all.filter(l => !order.includes(l.id))];
  }
  lessonDone(id) { const p = this.state.progress[id] || {}; return ['flashcard', 'quiz', 'listen'].every(a => p[a]); }
  stageInfo() {
    const s = this.state; let prevDone = true;
    return this.D.STAGES.map(st => {
      const playable = st.items.filter(it => it.kind === 'lesson' || it.kind === 'script');
      const isDone = it => it.kind === 'lesson' ? this.lessonDone(it.id) : !!s.scriptSeen;
      const doneCount = playable.filter(isDone).length;
      const cpDone = !!s.progress['cp:' + st.checkpoint.id];
      const complete = doneCount === playable.length && cpDone && playable.length === st.items.length;
      const unlocked = st.n <= 2 || prevDone; prevDone = complete;
      return { ...st, doneCount, total: playable.length, cpDone, complete, unlocked, playableCp: unlocked && !!this.D.SCENARIOS[st.checkpoint.id] };
    });
  }
  startConvo(id) {
    const sc = this.D.SCENARIOS[id]; if (!sc) return;
    const ex = this.advanceNpc({ kind: 'convo', scId: id, sc, items: sc.turns, i: 0, step: 0, log: [], wrongMsg: null, turnWrong: false, correct: 0, total: sc.turns.filter(t => t.who === 'you').length, missed: [], picked: [], showEn: true, lessonId: null });
    this.setState({ ex, route: { name: 'exercise' } }); window.scrollTo(0, 0);
  }
  advanceNpc(ex) {
    const t = ex.sc.turns; let step = ex.step, last = null; const log = [...ex.log];
    while (t[step] && t[step].who === 'npc') { log.push({ ...t[step] }); last = t[step]; step++; }
    if (last) setTimeout(() => this.play({ persian: last.fa, key: 'npc' + step }), 250);
    return { ...ex, step, log, done: step >= t.length };
  }
  choose(c) {
    const ex = this.state.ex;
    if (!c.ok) return this.exUpd({ wrongMsg: c.why, turnWrong: true, picked: [...ex.picked, c.fa] });
    this.setState({ ex: { ...ex, log: [...ex.log, { ...c, who: 'you' }], step: ex.step + 1, wrongMsg: null, correct: ex.correct + (ex.turnWrong ? 0 : 1), turnWrong: false, picked: [] } });
    setTimeout(() => this.setState(st => ({ ex: st.ex && st.ex.kind === 'convo' ? this.advanceNpc(st.ex) : st.ex })), 700);
  }
  allWords() { return this.D.LESSONS.flatMap(l => l.words.map(w => ({ ...w, lessonTitle: l.title }))).concat(this.myAsWords()); }
  wordByKey(k) { return this.allWords().find(w => w.key === k); }
  learned() { const p = this.state.progress; return this.D.LESSONS.filter(l => p[l.id] && p[l.id].flashcard).flatMap(l => l.words.map((w, i) => ({ ...w, lessonTitle: l.title, idx: i }))).concat(this.myAsWords()); }
  // ---------- my words ----------
  // Words the learner adds themselves. They count as learned straight away, so they join review now.
  myAsWords() { return (this.state.myWords || []).map(w => ({ key: 'my:' + w.id, persian: w.fa, phonetic: w.lat, english: w.en, example: '', lessonTitle: 'My words', idx: 0 })); }
  async loadImgs() {
    const ids = (this.state.myWords || []).filter(w => w.img).map(w => w.id);
    const imgs = {};
    await Promise.all(ids.map(id => media.get(id).then(v => { if (v) imgs[id] = v; }).catch(() => {})));
    this.setState(s => ({ imgs: { ...imgs, ...s.imgs } }));
  }
  draftUpd(p) { this.setState(s => ({ draft: { ...s.draft, ...p } })); }
  editWord(id) {
    const w = id && (this.state.myWords || []).find(x => x.id === id);
    const img = w && this.state.imgs[id];
    this._drawn = false;
    this.setState({ draft: w ? { id, en: w.en, lat: w.lat, fa: w.fa, faAuto: false, src: 'manual', mode: img ? 'photo' : 'none', img: img || null, busy: false }
      : { id: null, en: '', lat: '', fa: '', faAuto: true, src: null, mode: 'none', img: null, busy: false } });
    this.nav({ name: 'addword' });
  }
  // Rough Latin-to-Persian spelling for words the lessons don't know; the learner can correct it.
  translit(s) {
    const C = { kh: 'خ', gh: 'ق', sh: 'ش', ch: 'چ', zh: 'ژ', b: 'ب', p: 'پ', t: 'ت', j: 'ج', h: 'ه', d: 'د', r: 'ر', z: 'ز', s: 'س', f: 'ف', q: 'ق', k: 'ک', g: 'گ', l: 'ل', m: 'م', n: 'ن', v: 'و', w: 'و', y: 'ی', x: 'خ', c: 'ک', "'": 'ع' };
    return s.toLowerCase().split(/\s+/).filter(Boolean).map(w => {
      w = w.replace(/[^a-z']/g, ''); let out = '', i = 0, prev = '';
      while (i < w.length) {
        const st = i === 0, two = w.slice(i, i + 2), ch = w[i];
        const end = n => i + n >= w.length;
        if (['kh', 'gh', 'sh', 'ch', 'zh'].includes(two)) { out += C[two]; prev = two; i += 2; continue; }
        if (two === 'aa') { out += st ? 'آ' : 'ا'; i += 2; prev = ''; continue; }
        if (['oo', 'ou', 'uu'].includes(two)) { out += st ? 'او' : 'و'; i += 2; prev = ''; continue; }
        if (['ee', 'ii', 'ei', 'ey'].includes(two)) { out += st ? 'ای' : 'ی'; i += 2; prev = ''; continue; }
        if (ch === 'a') out += st ? 'ا' : end(1) ? 'ا' : '';
        else if (ch === 'e') out += st ? 'ا' : end(1) ? 'ه' : '';
        else if (ch === 'o') out += st ? 'ا' : end(1) ? 'و' : '';
        else if (ch === 'i') out += st ? 'ای' : 'ی';
        else if (ch === 'u') out += st ? 'او' : 'و';
        else if (C[ch] && ch !== prev) out += C[ch];
        prev = ch; i++;
      }
      return out;
    }).join(' ');
  }
  // Fill in the Persian script: a matching lesson word if there is one, otherwise transliterate.
  autoScript(lat) {
    if (!lat || !lat.trim()) return;
    const norm = x => (x || '').toLowerCase().replace(/[^a-z' ]/g, '').trim();
    const hit = this.allWords().find(w => !String(w.key).startsWith('my:') && (norm(w.phonetic) === norm(lat) || (w.writtenPhonetic && norm(w.writtenPhonetic) === norm(lat))));
    const fa = hit ? hit.persian : this.translit(lat), src = hit ? 'app' : 'auto';
    this.setState(s => ({ draft: s.draft && { ...s.draft, busy: false, ...(s.draft.faAuto ? { fa, src } : {}) } }));
  }
  tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  cvRef = el => { this._cv = el; if (el && !el._init) { el._init = true; this.clearCanvas(); } };
  clearCanvas() { const c = this._cv; if (!c) return; const x = c.getContext('2d'); x.fillStyle = this.tok('--color-surface') || '#fff'; x.fillRect(0, 0, c.width, c.height); this._drawn = false; }
  pt(e) { const c = this._cv, r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; }
  drawStart = e => {
    if (!this._cv) return; e.preventDefault(); try { this._cv.setPointerCapture(e.pointerId); } catch (er) {} this._pen = this.pt(e);
    const x = this._cv.getContext('2d'); x.strokeStyle = this.tok('--color-text') || '#201f1d'; x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(...this._pen); x.lineTo(...this._pen); x.stroke(); this._drawn = true;
  };
  drawMove = e => { if (!this._pen) return; const p = this.pt(e), x = this._cv.getContext('2d'); x.beginPath(); x.moveTo(...this._pen); x.lineTo(...p); x.stroke(); this._pen = p; };
  drawEnd = () => { this._pen = null; };
  onPhoto = e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); this.draftUpd({ img: c.toDataURL('image/jpeg', 0.75) }); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f); e.target.value = '';
  };
  saveWord() {
    const d = this.state.draft; if (!d || !d.en.trim() || !d.lat.trim() || !d.fa.trim()) return;
    const img = d.mode === 'photo' ? d.img : d.mode === 'draw' && this._drawn && this._cv ? this._cv.toDataURL('image/jpeg', 0.75) : null;
    const id = d.id || Date.now().toString(36);
    if (img) media.put(id, img).catch(() => {}); else media.del(id).catch(() => {});
    const rec = { id, en: d.en.trim(), lat: d.lat.trim(), fa: d.fa.trim(), img: !!img };
    this.setState(s => {
      const list = s.myWords || [], old = list.find(x => x.id === id);
      const imgs = { ...s.imgs }; if (img) imgs[id] = img; else delete imgs[id];
      return { myWords: old ? list.map(x => x.id === id ? { ...x, ...rec } : x) : [{ ...rec, created: Date.now() }, ...list], imgs, draft: null,
        xp: old ? s.xp : s.xp + 5, todayXp: old ? s.todayXp : s.todayXp + 5 };
    });
    this.nav({ name: 'mywords' });
  }
  deleteWord(id) {
    media.del(id).catch(() => {});
    const key = 'my:' + id;
    this.setState(s => {
      const srs = { ...s.srs }; delete srs[key];
      const imgs = { ...s.imgs }; delete imgs[id];
      return { myWords: (s.myWords || []).filter(x => x.id !== id), srs, imgs, mistakes: s.mistakes.filter(k => k !== key), draft: null };
    });
    this.nav({ name: 'mywords' });
  }
  // srs[key] = { b: Leitner box 0-4, t: when it is next due }. Words learned but never reviewed are due now.
  box(w) { const v = this.state.srs[w.key]; return v ? v.b : 0; }
  due() { const now = Date.now(); return this.learned().filter(w => { const v = this.state.srs[w.key]; return !v || v.t <= now; }); }
  tip(w) { const m = /\(lit: ([^)]+)\)/.exec(w.english); return m ? `Literally “${m[1]}”.` : null; }

  play(word, slow, key) {
    try { if (this._a) this._a.pause(); if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    const rate = (slow ? 0.7 : 1) * this.prefs().speed;
    const k = key || word.key || word.persian;
    const done = () => this.setState(s => s.playing === k ? { playing: null } : null);
    this.setState({ playing: k });
    const tts = () => {
      if (!window.speechSynthesis) return done();
      const u = new SpeechSynthesisUtterance(word.persian); u.lang = 'fa-IR'; u.rate = 0.85 * rate;
      const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('fa')); if (v) u.voice = v;
      u.onend = done; speechSynthesis.speak(u); setTimeout(done, 2500);
    };
    const f = word.english && this.D.audioFile(word.english, word.phonetic);
    if (f) { const a = new Audio(f); this._a = a; a.playbackRate = rate; a.onended = done; a.onerror = tts; a.play().catch(tts); }
    else tts();
  }

  // ---------- navigation ----------
  go(tab) { this.setState({ tab, route: null }); window.scrollTo(0, 0); }
  nav(route) { this.setState({ route }); window.scrollTo(0, 0); }
  back() {
    const r = this.state.route;
    if (r && r.name === 'map') return this.nav(r.from);
    if (r && r.name === 'addword') return this.nav({ name: 'mywords' });
    if (r && r.name === 'results') { const lid = this.state.result && this.state.result.lessonId; return this.nav(lid ? { name: 'lesson', id: lid } : null); }
    this.nav(null);
  }

  // ---------- exercises ----------
  // The review button is disabled when nothing is due; the note under it points to the next lesson.
  startReview() {
    const d = this.due();
    if (d.length) this.start('review', null, this.shuffle(d).slice(0, 10));
  }
  openNextLesson() {
    const p = this.state.progress, ls = this.lessons();
    const l = ls.find(l => this.D.ACTIVITIES.some(a => !(p[l.id] || {})[a.id])) || ls[0];
    this.setState({ tab: 'learn', route: { name: 'lesson', id: l.id } }); window.scrollTo(0, 0);
  }
  start(kind, lessonId, wordsOverride) {
    const D = this.D;
    const lesson = lessonId && D.LESSONS.find(l => l.id === lessonId);
    const pool = wordsOverride || this.shuffle(lesson.words).slice(0, 10);
    const all = this.allWords();
    const opts = w => this.shuffle([w, ...this.shuffle(all.filter(x => x.english !== w.english && x.persian !== w.persian)).slice(0, 3)]);
    let items;
    if (kind === 'quiz') items = pool.map((w, i) => ({ w, dir: i % 2 ? 'en2fa' : 'fa2en', opts: opts(w) }));
    else if (kind === 'listen') items = pool.map(w => ({ w, dir: 'listen', opts: opts(w) }));
    else if (kind === 'build') items = D.SENTENCES.map(s => ({ s, bank: this.shuffle([...s.tiles.map((t, i) => ({ fa: t[0], lat: t[1], ord: i })), ...s.extra.map(t => ({ fa: t[0], lat: t[1], ord: -1 }))]).map((t, id) => ({ ...t, id })) }));
    else if (kind === 'speak') items = pool.slice(0, 5).map(w => ({ w }));
    else items = pool.map(w => ({ w }));
    if (!items.length) return; // an exercise with no items has nothing to show
    this.setState({ ex: { kind, lessonId, items, i: 0, status: null, picked: null, correct: 0, flipped: false, built: [], rec: 'idle', missed: [] }, route: { name: 'exercise' } });
    window.scrollTo(0, 0);
    const first = items[0];
    if (first && first.w && kind !== 'quiz' || (first && first.dir === 'fa2en')) setTimeout(() => first.w && this.play(first.w), 350);
  }
  exUpd(patch) { this.setState(s => ({ ex: { ...s.ex, ...(typeof patch === 'function' ? patch(s.ex) : patch) } })); }
  next(extra = {}) {
    const ex = { ...this.state.ex, ...extra };
    if (ex.i + 1 >= ex.items.length) return this.finish(ex);
    const ni = ex.i + 1, it = ex.items[ni];
    this.setState({ ex: { ...ex, i: ni, status: null, picked: null, flipped: false, built: [], rec: 'idle', recUrl: null } });
    if (it.w && (ex.kind !== 'quiz' || it.dir === 'fa2en')) setTimeout(() => this.play(it.w), 300);
  }
  pick(o) {
    const ex = this.state.ex; if (ex.status) return;
    const it = ex.items[ex.i]; const right = o.key === it.w.key;
    this.exUpd({ status: right ? 'right' : 'wrong', picked: o.key, correct: ex.correct + (right ? 1 : 0), missed: right ? ex.missed : [...ex.missed, it.w.key] });
    if (right) this.play(it.w);
  }
  finish(ex) {
    const total = ex.total || ex.items.length, xpE = 10 + Math.round((ex.correct / total) * 10);
    const lessonId = ex.lessonId;
    this.setState(s => {
      const progress = { ...s.progress };
      if (lessonId && ex.kind !== 'review') progress[lessonId] = { ...(progress[lessonId] || {}), [ex.kind]: 1 };
      if (ex.kind === 'convo') progress['cp:' + ex.scId] = 1;
      const mistakes = [...new Set([...ex.missed, ...s.mistakes])].slice(0, 40);
      const srs = { ...s.srs }; ex.missed.forEach(k => { srs[k] = { b: 0, t: Date.now() }; });
      const today = dayKey(), streak = s.lastPlayedDate === today ? s.streak : s.lastPlayedDate === dayKey(Date.now() - DAY) ? s.streak + 1 : 1;
      return { progress, mistakes, srs, streak, lastPlayedDate: today, xp: s.xp + xpE, todayXp: (s.lastPlayedDate === today ? s.todayXp : 0) + xpE, result: { kind: ex.kind, scId: ex.scId, lessonId, correct: ex.correct, total, xp: xpE, missed: ex.missed }, route: { name: 'results' }, ex: null };
    });
    window.scrollTo(0, 0);
  }
  async record() {
    const ex = this.state.ex, item = ex.items[ex.i];
    if (ex.rec === 'asking') return;
    if (ex.rec === 'rec') { clearTimeout(this._recT); if (this._mr && this._mr.state === 'recording') this._mr.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return this.exUpd({ rec: 'error', recErr: "This browser can't record audio." });
    // Updates only apply while the same word is still on screen
    const same = () => this.state.ex && this.state.ex.items[this.state.ex.i] === item;
    this.exUpd({ rec: 'asking', recUrl: null, recErr: null });
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) {
      if (same()) this.exUpd({ rec: 'error', recErr: e.name === 'NotAllowedError' ? 'Microphone access is blocked. Allow it for this site in your browser settings, then try again.' : "Couldn't start the microphone." });
      return;
    }
    if (!same()) return stream.getTracks().forEach(t => t.stop());
    const mr = new MediaRecorder(stream), chunks = [];
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (!same()) return;
      this.exUpd(chunks.length ? { rec: 'done', recUrl: URL.createObjectURL(new Blob(chunks, { type: mr.mimeType })) } : { rec: 'error', recErr: 'Nothing was recorded. Try again.' });
    };
    this._mr = mr; mr.start(); this.exUpd({ rec: 'rec' });
    this._recT = setTimeout(() => mr.state === 'recording' && mr.stop(), 5000);
  }

  // ---------- render ----------
  renderVals() {
    const s = this.state;
    const I = (n, z, w) => this.icon(n, z, w);
    const ic = { back: I('back', 22), x: I('x', 22), check: I('check', 18, 2), chev: I('chev', 18), flame: I('flame', 16), zap: I('zap', 16), vol: I('vol', 22), volSm: I('vol', 18), volLg: I('vol', 44, 1.3), bulb: I('bulb', 20), bulbSm: I('bulb', 16), refreshLg: I('review', 22), compass: I('compass', 22), play: I('play', 16), book: I('book', 22), download: I('download', 20), refresh: I('review', 10, 2), chat: I('chat', 20), plus: I('plus', 18), wand: I('sparkles', 16), trash: I('trash', 16), imageIc: I('image', 30, 1.3), pen: I('pen', 22) };
    const mode = this.props.forceLayout || 'auto';
    const wide = mode === 'desktop' || (mode === 'auto' && s.w >= 900);
    const base = { ic, is: {}, show: { fa: true, lat: true }, tabs: [], showRail: false, showBottomTabs: false, showAppBar: false, wide };
    if (!s.ready) return { ...base, is: { learn: false } };

    const D = this.D, P = this.prefs();
    const show = { fa: P.script !== 'latin', lat: P.script !== 'persian' };
    const r = s.route;
    const view = r ? r.name : s.tab;
    const is = { [view]: true };
    const inFlow = view === 'exercise' || view === 'results';
    const tabDefs = [['learn', 'Learn', 'book'], ['review', 'Review', 'review'], ['script', 'Script', 'feather'], ['explore', 'Explore', 'compass'], ['profile', 'Profile', 'user']];
    const tabs = tabDefs.map(([id, label, icn]) => { const a = s.tab === id; return { label, icon: I(icn, 22), go: () => this.go(id), rail: a ? 'var(--color-accent)' : 'transparent', railBg: a ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent', color: a ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }; });
    const showBottomTabs = !wide && !inFlow;
    const titles = { learn: ['Persian Learnin', 'فارسی'], review: ['Review', 'مرور'], script: ['Script', 'الفبا'], explore: ['Explore', 'کاوش'], profile: ['Profile', 'من'] };
    const lessons = this.lessons();
    const prog = id => s.progress[id] || {};

    const v = { ...base, show, is, tabs, showRail: wide && !inFlow, showBottomTabs, showAppBar: !r && !wide,
      appBarTitle: titles[s.tab][0], appBarFa: titles[s.tab][1], streak: s.streak, xp: s.xp,
      bottomPad: showBottomTabs ? 'calc(64px + env(safe-area-inset-bottom))' : '0px',
      mainPad: wide ? '40px 40px 64px' : (r ? '12px 20px 40px' : '22px 20px 40px'),
      railOffset: '0px', back: () => this.back(), dueCount: this.due().length, startReview: () => this.startReview(), reviewEmpty: !this.due().length, openNextLesson: () => this.openNextLesson() };

    // learn
    const now = new Date();
    try {
      v.dateEn = new Intl.DateTimeFormat('en-US-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
      v.dateFa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    } catch (e) { v.dateEn = now.toDateString(); v.dateFa = ''; }
    const hr = now.getHours();
    v.greeting = hr < 12 ? 'Sob bekheyr.' : hr < 18 ? 'Salaam.' : 'Shab bekheyr.';
    v.greetingSub = hr < 12 ? 'Good morning — a few minutes now is worth an hour later.' : hr < 18 ? 'Hello — pick up where you left off.' : 'Good evening — a short review before sleep helps memory settle.';
    v.todayXp = s.todayXp; v.goal = s.goal; v.goalPct = Math.min(100, Math.round(s.todayXp / s.goal * 100)) + '%';
    const todayIdx = (now.getDay() + 1) % 7;
    const dayEn = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][todayIdx];
    const dayW = D.LESSONS.find(l => l.id === 'days')?.words.find(w => w.english === dayEn);
    v.dayName = dayW ? { en: dayEn, lat: dayW.phonetic } : null;
    v.week = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((fa, i) => {
      const done = i <= todayIdx && i > todayIdx - s.streak && (i < todayIdx || s.todayXp > 0);
      const today = i === todayIdx;
      return { fa, en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i], border: done || today ? 'var(--color-accent)' : 'var(--color-divider)', bg: done ? 'var(--color-accent-100)' : 'transparent', color: done ? 'var(--color-accent-800)' : 'var(--color-neutral-600)' };
    });
    const nextL = lessons.find(l => D.ACTIVITIES.some(a => !prog(l.id)[a.id])) || lessons[0];
    const nextA = D.ACTIVITIES.find(a => !prog(nextL.id)[a.id]) || D.ACTIVITIES[0];
    const ln = l => lessons.indexOf(l) + 1;
    v.cont = { n: ln(nextL), title: nextL.title, glyph: nextL.glyph, next: nextA.title, pct: Math.round(D.ACTIVITIES.filter(a => prog(nextL.id)[a.id]).length / 5 * 100) + '%', open: () => this.nav({ name: 'lesson', id: nextL.id }) };
    const wodPool = lessons.flatMap(l => l.words), wodW = wodPool[Math.floor(now / DAY) % wodPool.length]; const wd = this.disp(wodW);
    v.wod = { fa: wd.fa, num: wd.num, lat: wd.lat, en: wd.en, play: () => this.play(wodW) };
    v.chapters = lessons.map((l, i) => ({ n: i + 1, nFa: this.faNum(i + 1), title: l.title, desc: l.description, count: l.words.length, glyph: l.glyph,
      marks: D.ACTIVITIES.map(a => ({ bg: prog(l.id)[a.id] ? 'var(--color-accent)' : 'var(--color-divider)' })), open: () => this.nav({ name: 'lesson', id: l.id }) }));
    // plan / stages
    const SI = this.stageInfo();
    const cur = SI.find(st => st.unlocked && !st.complete) || SI[SI.length - 1];
    const curPct = Math.round((cur.doneCount + (cur.cpDone ? 1 : 0)) / (cur.total + 1) * 100);
    v.track = SI.map(st => ({ level: st.level, color: st === cur ? 'var(--color-accent-700)' : 'var(--color-neutral-600)',
      bar: st.complete ? 'var(--color-accent)' : st === cur ? `linear-gradient(to left, var(--color-accent) ${curPct}%, var(--color-divider) ${curPct}%)` : 'var(--color-divider)' }));
    const needs = (D.CANDO_NEEDS || {})[cur.id] || [];
    v.path = { n: cur.n, name: cur.name, fa: cur.fa, level: cur.level, weeks: cur.weeks, goal: cur.goal,
      cando: cur.cando.map((text, i) => { const nd = needs[i]; const done = nd === 'script' ? !!s.scriptSeen : nd ? this.lessonDone(nd) : false;
        return { text, icon: done ? I('check', 12, 2.2) : null, border: done ? 'var(--color-accent)' : 'var(--color-divider)', color: done ? 'var(--color-text)' : 'var(--color-neutral-800)' }; }) };
    v.openPlan = () => this.nav({ name: 'path' });
    const noop = () => {};
    const kindIcon = { script: 'feather', grammar: 'blocks', conversation: 'chat', skill: 'headphones' };
    const row = (it, st) => {
      const locked = !st.unlocked;
      if (it.kind === 'lesson') {
        const l = D.LESSONS.find(x => x.id === it.id); if (!l || (l.mature && !P.mature)) return null; const n = ln(l);
        return { isLesson: true, n, nFa: this.faNum(n), title: l.title, desc: `${l.description} · ${l.words.length} words`, glyph: l.glyph,
          marks: D.ACTIVITIES.map(a => ({ bg: prog(l.id)[a.id] ? 'var(--color-accent)' : 'var(--color-divider)' })),
          op: locked ? 0.5 : 1, cursor: locked ? 'default' : 'pointer', endIcon: locked ? I('lock', 14) : this.lessonDone(l.id) ? I('check', 16, 2) : ic.chev, endColor: this.lessonDone(l.id) ? 'var(--color-accent-700)' : 'var(--color-neutral-500)',
          open: locked ? noop : () => this.nav({ name: 'lesson', id: l.id }) };
      }
      const isScript = it.kind === 'script';
      return { isOther: true, icon: I(kindIcon[it.kind], 15), iconBorder: 'var(--color-divider)', kicker: { script: 'Script', grammar: 'Grammar', conversation: 'Conversation', skill: 'Skill' }[it.kind],
        title: it.title, desc: it.desc, glyph: isScript ? 'الفبا' : '', op: locked ? 0.5 : 1, cursor: locked ? 'default' : 'pointer',
        endIcon: locked ? I('lock', 14) : isScript && s.scriptSeen ? I('check', 16, 2) : ic.chev, endColor: isScript && s.scriptSeen ? 'var(--color-accent-700)' : 'var(--color-neutral-500)',
        open: locked ? noop : isScript ? () => this.go('script') : noop };
    };
    const cpRow = st => ({ isOther: true, icon: I('chat', 15), iconBorder: 'var(--color-accent)', kicker: 'Checkpoint · conversation', title: st.checkpoint.title, desc: st.checkpoint.desc, glyph: '',
      op: st.playableCp ? 1 : 0.5, cursor: st.playableCp ? 'pointer' : 'default', endIcon: st.cpDone ? I('check', 16, 2) : st.playableCp ? ic.chev : I('lock', 14), endColor: st.cpDone ? 'var(--color-accent-700)' : 'var(--color-neutral-500)',
      open: st.playableCp ? () => this.startConvo(st.checkpoint.id) : noop });
    const inPlan = new Set(D.STAGES.flatMap(st => st.items.map(i => i.id)).filter(Boolean));
    const electives = lessons.filter(l => !inPlan.has(l.id));
    v.stageGroups = SI.map(st => ({ fa: st.fa, title: `Stage ${st.n} · ${st.name}`, lockIcon: st.unlocked ? null : I('lock', 12),
      meta: st.unlocked ? `${st.level} · ${st.doneCount + (st.cpDone ? 1 : 0)}/${st.total + 1}` : `${st.level} · Locked`,
      items: [...st.items.map(it => row(it, st)).filter(Boolean), cpRow(st)] }));
    if (electives.length) v.stageGroups.push({ fa: 'اختیاری', title: 'Electives', lockIcon: null, meta: 'Any time', items: electives.map(l => row({ kind: 'lesson', id: l.id }, { unlocked: true })).filter(Boolean) });
    v.loop = [['Meet', 'Flashcards with native audio — the sound comes first'], ['Recognise', 'Pick the meaning, both directions, by eye and by ear'], ['Build', 'Arrange words into Persian order yourself'], ['Say', 'Shadow a native speaker and record yourself'], ['Use', 'Hold the conversation at the end of each stage']].map(([step, desc], i) => ({ step, desc, nFa: this.faNum(i + 1) }));
    v.plan = SI.map(st => ({ nFa: this.faNum(st.n), level: st.level, name: st.name, weeks: st.weeks, goal: st.goal, cando: st.cando,
      status: st.complete ? 'Complete' : st === cur ? 'In progress' : st.unlocked ? 'Open' : 'Locked', statusColor: st === cur ? 'var(--color-accent-700)' : 'var(--color-neutral-700)',
      items: st.items.map(it => it.kind === 'lesson' ? (D.LESSONS.find(l => l.id === it.id) || {}).title : it.title),
      cpTitle: st.checkpoint.title, cpDesc: st.checkpoint.desc, cpBorder: st.playableCp ? 'var(--color-accent)' : 'var(--color-divider)', cpCursor: st.playableCp ? 'pointer' : 'default',
      cpIcon: st.cpDone ? I('check', 16, 2) : st.playableCp ? ic.chev : I('lock', 14), cpOpen: st.playableCp ? () => this.startConvo(st.checkpoint.id) : noop }));

    v.chapterCount = lessons.length; v.chaptersDone = lessons.filter(l => D.ACTIVITIES.every(a => prog(l.id)[a.id])).length;

    // lesson
    if (view === 'lesson') {
      const l = D.LESSONS.find(x => x.id === r.id); const note = D.NOTES[l.id];
      const stg = D.STAGES.find(st => st.items.some(i => i.id === l.id));
      v.L = { n: ln(l), where: stg ? `Stage ${stg.n} · ${stg.name}` : 'Elective', cando: D.CANDO[l.id], title: l.title, desc: l.description, glyph: l.glyph, count: l.words.length, noteT: note.t, noteB: note.b,
        acts: D.ACTIVITIES.map(a => ({ ...a, icon: I(a.icon, 20), done: !!prog(l.id)[a.id], border: prog(l.id)[a.id] ? 'color-mix(in srgb, var(--color-accent) 55%, transparent)' : 'var(--color-divider)', start: () => this.start(a.id, l.id) })),
        words: l.words.map(w => { const d = this.disp(w); const p = s.playing === w.key; const alt = !!w.written; const written = P.register === 'written';
          return { ...d, play: () => this.play(w), btnBorder: p ? 'var(--color-accent)' : 'var(--color-divider)', btnBg: p ? 'var(--color-accent-100)' : 'transparent', hasAlt: alt, altLabel: written ? 'Spoken' : 'Written', altFa: written ? w.persian : w.written, altLat: written ? w.phonetic : w.writtenPhonetic }; }) };
      v.noteOpen = s.noteOpen; v.noteRot = s.noteOpen ? '90deg' : '0deg'; v.toggleNote = () => this.setState({ noteOpen: !s.noteOpen });
    }
    v.registerLabel = P.register === 'written' ? 'written' : 'spoken';

    // exercise
    if (view === 'exercise' && s.ex) {
      const ex = s.ex, it = ex.items[ex.i], k = ex.kind;
      const X = { pct: Math.round(ex.i / ex.items.length * 100) + '%', counter: `${ex.i + 1} / ${ex.items.length}`,
        kindLabel: { flashcard: 'Flashcards', quiz: 'Recognition', listen: 'Listening', build: 'Sentence builder', speak: 'Speaking', review: 'Spaced review' }[k],
        kindFa: { flashcard: 'کارت‌ها', quiz: 'شناخت', listen: 'شنیدن', build: 'جمله‌سازی', speak: 'گفتن', review: 'مرور' }[k],
        isFlash: k === 'flashcard' || k === 'review', isChoice: k === 'quiz' || k === 'listen', isBuild: k === 'build', isSpeak: k === 'speak' };
      if (it.w) { const d = this.disp(it.w); Object.assign(X, d, { example: it.w.example, play: () => this.play(it.w), playSlow: () => this.play(it.w, true) }); }
      v.exitEx = () => { const lid = ex.lessonId; this.setState({ ex: null }); this.nav(lid ? { name: 'lesson', id: lid } : null); };
      if (X.isFlash) {
        X.rot = ex.flipped ? '180deg' : '0deg'; X.flip = () => this.exUpd({ flipped: !ex.flipped });
        X.showBottomBar = true;
        if (k === 'review') {
          const rate = (lvl) => { const b = this.box(it.w); const nb = [0, 1, Math.max(2, Math.min(4, b + 1)), b >= 3 ? 4 : 3][lvl];
            this.setState(st => ({ srs: { ...st.srs, [it.w.key]: { b: nb, t: Date.now() + INTERVALS[nb] } } })); this.next({ correct: ex.correct + (lvl > 0 ? 1 : 0), missed: lvl === 0 ? [...ex.missed, it.w.key] : ex.missed }); };
          X.barBtns = ex.flipped ? [['Again', '1 min', 0], ['Hard', '1 day', 1], ['Good', '3 days', 2], ['Easy', '1 week', 3]].map(([label, sub, lvl]) => ({ label, sub, cls: lvl === 2 ? 'btn-primary' : 'btn-secondary', go: () => rate(lvl), disabled: false }))
            : [{ label: 'Show answer', sub: '', cls: 'btn-primary', go: X.flip, disabled: false }];
        } else {
          X.barBtns = [{ label: 'Still learning', sub: '', cls: 'btn-secondary', go: () => this.next({ missed: [...ex.missed, it.w.key] }), disabled: false },
                       { label: 'I know this', sub: '', cls: 'btn-primary', go: () => this.next({ correct: ex.correct + 1 }), disabled: false }];
        }
      }
      if (X.isChoice) {
        X.isListen = it.dir === 'listen'; X.showPromptWord = !X.isListen; X.promptIsFa = it.dir === 'fa2en'; X.promptIsEn = it.dir === 'en2fa';
        X.prompt = X.isListen ? 'What did you hear?' : it.dir === 'fa2en' ? 'What does this mean?' : 'How do you say this in Persian?';
        X.listenBg = s.playing === it.w.key ? 'var(--color-accent-100)' : 'transparent';
        X.options = it.opts.map(o => { const d = this.disp(o); const isAns = o.key === it.w.key, isPick = ex.picked === o.key;
          const st = !ex.status ? 'idle' : isAns ? 'right' : isPick ? 'wrong' : 'dim';
          const faOpt = it.dir === 'en2fa';
          return { ...d, showFa: faOpt && show.fa, showLat: faOpt && show.lat, showEn: !faOpt, pick: () => this.pick(o),
            border: st === 'right' ? 'var(--color-accent)' : st === 'wrong' ? 'var(--color-text)' : 'var(--color-divider)',
            bg: st === 'right' ? 'var(--color-accent-100)' : st === 'wrong' ? 'var(--color-neutral-200)' : 'transparent', op: st === 'dim' ? 0.45 : 1 }; });
      }
      if (X.isBuild) {
        X.en = it.s.en;
        X.built = ex.built.map((id, j) => { const t = it.bank[id]; return { ...t, tap: () => !ex.status && this.exUpd({ built: ex.built.filter((_, q) => q !== j) }) }; });
        X.builtEmpty = ex.built.length === 0;
        X.bank = it.bank.map(t => { const used = ex.built.includes(t.id); return { ...t, op: used ? 0 : 1, vis: used ? 'hidden' : 'visible', tap: () => !used && !ex.status && this.exUpd({ built: [...ex.built, t.id] }) }; });
        X.showBottomBar = !ex.status;
        const check = () => { const ok = ex.built.length === it.s.tiles.length && ex.built.every((id, j) => it.bank[id].ord === j);
          this.exUpd({ status: ok ? 'right' : 'wrong', correct: ex.correct + (ok ? 1 : 0) }); };
        X.barBtns = [{ label: 'Check', sub: '', cls: 'btn-primary', go: check, disabled: ex.built.length === 0 }];
      }
      if (X.isSpeak) {
        X.recDone = ex.rec === 'done'; X.rec = () => this.record();
        X.recIcon = ex.rec === 'rec' ? h('span', { style: { width: 22, height: 22, borderRadius: '50%', background: 'var(--color-accent)', animation: 'plblink 1s infinite' } }) : I('mic', 22);
        X.recLabel = { asking: 'Allow the microphone…', rec: 'Recording… tap to stop', done: 'Record again', error: 'Try again' }[ex.rec] || '2 · Your turn';
        X.recErr = ex.rec === 'error' ? ex.recErr : null;
        X.recBorder = ex.rec === 'rec' ? 'var(--color-accent)' : 'var(--color-divider)'; X.recBg = ex.rec === 'rec' ? 'var(--color-accent-100)' : 'transparent';
        X.playMine = () => { if (this._a) this._a.pause(); this._a = new Audio(ex.recUrl); this._a.play().catch(() => {}); };
        X.selfRates = [['Needs work', 0], ['Close', 1], ['Nailed it', 1]].map(([label, c]) => ({ label, go: () => this.next({ correct: ex.correct + c }) }));
      }
      if (k === 'convo') {
        const t = ex.sc.turns, youDone = ex.log.filter(m => m.who === 'you').length;
        Object.assign(X, { isConvo: true, kindLabel: 'Conversation checkpoint', kindFa: 'گفتگو', pct: Math.round(ex.step / t.length * 100) + '%', counter: `${youDone} / ${ex.total}`,
          title: ex.sc.title, setting: ex.sc.setting, showEn: ex.showEn, enLabel: ex.showEn ? 'Hide English' : 'Show English', toggleEn: () => this.exUpd({ showEn: !ex.showEn }),
          log: ex.log.map((m, j) => { const you = m.who === 'you'; return { ...m, name: you ? 'You' : ex.sc.npc, align: you ? 'flex-end' : 'flex-start', ta: you ? 'right' : 'left', border: you ? 'var(--color-accent)' : 'var(--color-divider)', tip: you ? m.tip : null, play: () => this.play({ persian: m.fa, key: 'log' + j }) }; }),
          wrongMsg: ex.wrongMsg, awaiting: !!(t[ex.step] && t[ex.step].who === 'you'), convoDone: !!ex.done, finishConvo: () => this.finish(ex),
          choices: t[ex.step] && t[ex.step].who === 'you' ? t[ex.step].choices.map(c => { const used = ex.picked.includes(c.fa); return { ...c, pick: () => !used && this.choose(c), border: used ? 'var(--color-text)' : 'var(--color-divider)', op: used ? 0.45 : 1 }; }) : [] });
      }
      X.hasFeedback = !!ex.status;
      if (ex.status) {
        const right = ex.status === 'right';
        X.fbColor = right ? 'var(--color-accent)' : 'var(--color-text)'; X.fbIcon = right ? I('check', 16, 2) : I('x', 16, 2);
        if (it.w) { const d = this.disp(it.w); X.fbTitle = right ? ['Afarin — well done', 'Correct', 'Aali — excellent'][ex.i % 3] : 'Not quite'; X.fbFa = d.fa; X.fbNum = d.num; X.fbLat = d.lat; X.fbEn = d.en; X.fbTip = this.tip(it.w) || (right ? null : 'This word will come back in your next review.'); }
        else { X.fbTitle = right ? 'Afarin — well done' : 'Not quite'; X.fbFa = it.s.tiles.map(t => t[0]).join(' '); X.fbLat = it.s.tiles.map(t => t[1]).join(' '); X.fbEn = it.s.en; X.fbTip = it.s.tip; }
        X.cont = () => this.next(); X.showBottomBar = false;
      }
      v.X = X;
    }

    // results
    if (view === 'results' && s.result) {
      const R = s.result, acc = Math.round(R.correct / R.total * 100);
      const good = acc >= 80;
      v.R = { kicker: R.kind === 'review' ? 'Review complete' : 'Activity complete', fa: good ? 'آفرین' : 'خسته نباشی', lat: good ? 'Aafarin' : 'Khaste nabaashi', en: good ? 'Well done.' : 'May you not be tired.',
        stats: [[`+${R.xp}`, 'XP'], [acc + '%', 'Accuracy'], [s.streak, 'Day streak']].map(([v2, l], i) => ({ v: v2, l, bl: i ? '1px solid var(--color-divider)' : '0' })),
        hasMissed: R.missed.length > 0, missed: R.missed.map(k => { const w = this.wordByKey(k); const d = this.disp(w); return { ...d, play: () => this.play(w) }; }),
        primaryLabel: R.lessonId ? 'Back to chapter' : 'Done', primary: () => this.back(), again: () => this.start(R.kind, R.lessonId, R.lessonId ? null : this.shuffle(this.due()).slice(0, 10)) };
      if (R.lessonId && R.kind !== 'review') v.R.again = () => this.start(R.kind, R.lessonId);
      if (R.kind === 'convo') { v.R.kicker = 'Checkpoint complete'; v.R.again = () => this.startConvo(R.scId); v.R.primaryLabel = 'Back to your path'; }
    }

    // review
    const L = this.learned();
    const counts = [0, 0, 0, 0, 0]; L.forEach(w => counts[Math.min(4, this.box(w))]++);
    const mx = Math.max(1, ...counts);
    v.boxes = counts.map((c, i) => ({ count: c, h: Math.max(4, Math.round(c / mx * 84)) + 'px', label: ['Today', '1 day', '3 days', '1 week', '1 month'][i], bg: `color-mix(in srgb, var(--color-accent) ${12 + i * 10}%, transparent)` }));
    v.dueMins = Math.max(1, Math.round(v.dueCount * 0.3));
    v.mistakeList = s.mistakes.map(k => this.wordByKey(k)).filter(Boolean).map(w => ({ ...this.disp(w), lesson: w.lessonTitle, play: () => this.play(w) }));
    v.hasMistakes = v.mistakeList.length > 0; v.noMistakes = !v.hasMistakes;
    v.drillMistakes = () => this.start('review', null, s.mistakes.map(k => this.wordByKey(k)).filter(Boolean).slice(0, 10));

    // script
    const filt = s.letterFilter;
    const FL = [['all', 'All 32'], ['persian', 'Persian-only'], ['nc', 'Non-connectors'], ['alike', 'Sound-alikes']];
    v.letterFilters = FL.map(([id, label]) => ({ label, go: () => this.setState({ letterFilter: id }), border: filt === id ? 'var(--color-accent)' : 'var(--color-divider)', color: filt === id ? 'var(--color-accent-700)' : 'var(--color-text)' }));
    v.letterFilterNote = { all: null, persian: 'Persian added four letters to the Arabic alphabet for sounds Arabic lacks: p, ch, zh and g.', nc: 'These seven letters never join to the letter after them — so a word can have gaps in the middle, like دوست (doost).', alike: 'Several letters share one sound. Spelling must be memorised word by word — but in speech you only need one.' }[filt];
    v.letters = D.LETTERS.map((l, i) => ({ ...l, i })).filter(l => filt === 'all' || (filt === 'persian' && l.persianOnly) || (filt === 'nc' && !l.connects) || (filt === 'alike' && l.group))
      .map(l => ({ ch: l.ch, name: l.name, persianOnly: l.persianOnly, border: 'var(--color-divider)', open: () => { this.setState({ scriptSeen: true }); this.nav({ name: 'letter', i: l.i }); } }));
    if (view === 'letter') {
      const i = r.i, l = D.LETTERS[i], prev = D.LETTERS[i - 1], nxt = D.LETTERS[i + 1];
      v.LT = { n: i + 1, ch: l.ch, name: l.name, sound: l.sound, ex: l.ex, exLat: l.exLat, exEn: l.exEn,
        forms: [['isolated', 'Alone'], ['initial', 'Start'], ['medial', 'Middle'], ['final', 'End']].map(([f, label], j) => ({ ch: l.forms[f], label, br: j ? '1px solid var(--color-divider)' : '0', color: !l.connects && (f === 'initial' || f === 'medial') ? 'var(--color-neutral-500)' : 'var(--color-text)' })),
        connectNote: l.connects ? `${l.name} joins to the letters on both sides, so its shape changes in every position.` : `${l.name} is a non-connector: it joins the letter before it, but never the one after. Its start and middle forms look like its alone and end forms.`,
        groupNote: l.group ? D.SOUND_GROUPS[l.group] : null,
        play: () => this.play({ persian: l.ex, key: 'letter' + i }),
        prev: () => prev && this.nav({ name: 'letter', i: i - 1 }), next: () => nxt && this.nav({ name: 'letter', i: i + 1 }),
        prevName: prev ? prev.name : '', nextName: nxt ? nxt.name : '', isFirst: !prev, isLast: !nxt };
    }

    // explore
    v.articles = D.ARTICLES.map(a => ({ ...a, open: () => this.nav({ name: 'article', id: a.id }) }));
    if (view === 'article') {
      const a = D.ARTICLES.find(x => x.id === r.id), full = (window.CULTURE_ARTICLES || []).find(x => x.id === r.id);
      v.A = full ? { ...a, sections: [], rich: full.sections, noBody: false } : { ...a, sections: (a.sections || []).map(sec => ({ p: [], list: null, after: null, ...sec })), rich: [], noBody: !a.sections };
    }
    v.openMap = sec => this.setState({ mapSection: sec, route: { name: 'map', from: r } }, () => window.scrollTo(0, 0));
    v.openHoliday = hol => this.setState({ sheet: 'holiday', holiday: hol });
    if (view === 'map') v.M = { heading: s.mapSection.heading, note: s.mapSection.note, offline: !s.online };
    v.offline = !s.online;

    // profile
    const fullDone = lessons.filter(l => D.ACTIVITIES.slice(0, 3).every(a => prog(l.id)[a.id])).length;
    v.learnedCount = L.length;
    v.pStats = [[s.xp, 'Total XP'], [Math.floor(s.xp / 100) + 1, 'Level'], [s.streak, 'Day streak'], [L.length, 'Words']].map(([val, l], i) => ({ v: val, l, bl: i ? '1px solid var(--color-divider)' : '0' }));
    const seg = (key, opts) => opts.map(([val, label], j) => ({ label, go: () => this.setPref(key, val), bl: j ? '1px solid var(--color-divider)' : '0', shadow: P[key] === val ? 'inset 0 0 0 1px var(--color-accent)' : 'none', color: P[key] === val ? 'var(--color-accent-700)' : 'var(--color-text)' }));
    v.prefs = [
      { label: 'Script display', hint: 'Fade out transliteration as your reading improves', opts: seg('script', [['both', 'Persian + Latin'], ['persian', 'Persian only'], ['latin', 'Latin only']]) },
      { label: 'Register', hint: 'Everyday Tehran speech, or the formal written language', opts: seg('register', [['spoken', 'Spoken'], ['written', 'Written']]) },
      { label: 'Audio speed', hint: 'Applies to every recording', opts: seg('speed', [[1, 'Normal'], [0.75, 'Slower']]) },
    ];
    v.toggleMature = () => this.setPref('mature', !P.mature); v.matureBorder = P.mature ? 'var(--color-accent)' : 'var(--color-neutral-500)'; v.matureKnob = P.mature ? '23px' : '3px';
    const unlocked = { first_step: Object.keys(s.progress).length > 0, on_fire: s.streak >= 3, dedicated: s.streak >= 7, rising_star: fullDone >= 3, scholar: fullDone >= lessons.length, centurion: s.xp >= 100, master: s.xp >= 400, word_collector: Object.values(s.progress).filter(p => p.flashcard).length >= 5 };
    v.achievements = D.ACHIEVEMENTS.map(a => ({ ...a, op: unlocked[a.id] ? 1 : 0.55, border: unlocked[a.id] ? 'var(--color-accent)' : 'var(--color-divider)', icon: unlocked[a.id] ? I('check', 16, 2) : I('lock', 14) }));
    v.refreshApp = () => this.refreshApp(); v.refreshing = s.refreshing; v.refreshSpin = s.refreshing ? 'plspin 1s linear infinite' : 'none';
    v.refreshMsg = s.refreshing ? 'Checking for updates…' : s.refreshNote || 'Load the latest version';
    v.openWords = () => this.nav({ name: 'words' }); v.openAuth = () => this.setState({ sheet: 'auth' }); v.openInstall = () => this.setState({ sheet: 'install' });
    v.wordQuery = s.wordQuery; v.setWordQuery = e => this.setState({ wordQuery: e.target.value });
    const q = s.wordQuery.trim().toLowerCase();
    v.collection = L.filter(w => !q || w.english.toLowerCase().includes(q) || w.phonetic.toLowerCase().includes(q) || w.persian.includes(q)).map(w => ({ ...this.disp(w), lesson: w.lessonTitle, box: Math.min(4, this.box(w)) + 1, play: () => this.play(w) }));

    // my words
    const my = s.myWords || [];
    v.myCountLabel = my.length === 1 ? '1 word' : my.length + ' words'; v.noMy = my.length === 0;
    v.myWords = my.map(w => { const img = s.imgs[w.id];
      return { ...w, bgImg: img ? `url("${img}")` : 'none', hasImg: !!img, noImg: !img, open: () => this.editWord(w.id), play: e => { e.stopPropagation(); this.play({ persian: w.fa, phonetic: w.lat, english: w.en, key: 'my:' + w.id }); } }; });
    v.addWord = () => this.editWord(null); v.openMy = () => this.nav({ name: 'mywords' });
    v.cvRef = this.cvRef; v.drawStart = this.drawStart; v.drawMove = this.drawMove; v.drawEnd = this.drawEnd;
    if (view === 'addword' && s.draft) {
      const d = s.draft;
      v.W = { ...d, bgImg: d.img ? `url("${d.img}")` : 'none', title: d.id ? 'Edit word' : 'Add a word', isEdit: !!d.id, saveLabel: d.id ? 'Save changes' : 'Save word',
        noFa: !d.fa.trim(), noLat: !d.lat.trim(), cannotSave: !d.en.trim() || !d.lat.trim() || !d.fa.trim() || d.busy,
        srcNote: d.busy ? 'Writing it in Persian…' : ({ app: 'Matched a word from your lessons', auto: 'Written from your spelling — tap to correct, or check with a native speaker', manual: 'Edited by you' }[d.src] || 'Fills in automatically as you type the sound'),
        isDraw: d.mode === 'draw', isPhoto: d.mode === 'photo', hasPhoto: d.mode === 'photo' && !!d.img, noPhoto: d.mode === 'photo' && !d.img,
        modes: [['none', 'None'], ['draw', 'Draw'], ['photo', 'Photo']].map(([m, label], j) => ({ label, go: () => this.draftUpd({ mode: m }), bl: j ? '1px solid var(--color-divider)' : '0', shadow: d.mode === m ? 'inset 0 0 0 1px var(--color-accent)' : 'none', color: d.mode === m ? 'var(--color-accent-700)' : 'var(--color-text)' })),
        setEn: e => this.draftUpd({ en: e.target.value }),
        setLat: e => {
          const lat = e.target.value, auto = this.state.draft.faAuto;
          this.draftUpd({ lat, ...(auto && !lat.trim() ? { fa: '', src: null } : {}), ...(auto && lat.trim() ? { busy: true } : {}) });
          clearTimeout(this._tt);
          if (auto && lat.trim()) this._tt = setTimeout(() => this.autoScript(lat), 450);
        },
        setFa: e => this.draftUpd({ fa: e.target.value, faAuto: false, src: 'manual' }),
        regen: () => { this.draftUpd({ faAuto: true }); this.autoScript(d.lat); },
        listen: () => d.fa.trim() && this.play({ persian: d.fa, key: 'draft' }),
        clearDraw: () => this.clearCanvas(), onPhoto: this.onPhoto, removePhoto: () => this.draftUpd({ img: null }),
        save: () => this.saveWord(), del: () => this.deleteWord(d.id) };
    }
    // The add-word page needs a draft; without one, show the list instead of rendering an empty form
    if (view === 'addword' && !s.draft) { delete v.is.addword; v.is.mywords = true; }

    // sheet
    v.sheetOpen = !!s.sheet; v.sheetAuth = s.sheet === 'auth'; v.sheetInstall = s.sheet === 'install'; v.sheetSignOut = s.sheet === 'signout'; v.sheetHoliday = s.sheet === 'holiday';
    v.sheetTitle = s.sheet === 'install' ? 'Install Persian Learnin' : s.sheet === 'signout' ? 'Sign out?' : s.sheet === 'holiday' ? s.holiday.name : s.authMode === 'signin' ? 'Welcome back' : 'Create an account';
    v.H = s.sheet === 'holiday' ? s.holiday.detail : null;
    v.closeSheet = () => this.setState({ sheet: null, authMsg: null });
    v.isGuest = !s.user; v.userEmail = s.user ? s.user.email : ''; v.openSignOut = () => this.setState({ sheet: 'signout' }); v.doSignOut = () => this.signOut();
    v.authEmail = s.authEmail; v.authPassword = s.authPassword; v.authBusy = s.authBusy || !s.online;
    v.authMsg = s.authMsg || (s.online ? null : "You're offline. Sign in once you're connected — your progress is saved on this device meanwhile.");
    v.authMsgRule = s.authErr || !s.online ? 'var(--color-text)' : 'var(--color-accent)';
    v.setAuthEmail = e => this.setState({ authEmail: e.target.value }); v.setAuthPassword = e => this.setState({ authPassword: e.target.value });
    v.authPwAuto = s.authMode === 'signin' ? 'current-password' : 'new-password'; v.submitAuth = e => this.submitAuth(e); v.stop = e => e.stopPropagation();
    v.authTabs = [['signin', 'Sign in'], ['signup', 'Sign up']].map(([id, label], j) => ({ label, go: () => this.setState({ authMode: id, authMsg: null }), bl: j ? '1px solid var(--color-divider)' : '0', shadow: s.authMode === id ? 'inset 0 0 0 1px var(--color-accent)' : 'none', color: s.authMode === id ? 'var(--color-accent-700)' : 'var(--color-text)' }));
    v.authCta = s.authBusy ? 'One moment…' : s.authMode === 'signin' ? 'Sign in' : 'Create account';
    v.doInstall = () => { if (this._deferred) this._deferred.prompt(); this.setState({ sheet: null }); };
    return v;
  }

  render() { return view(this.renderVals()); }
}

// If a screen ever throws while drawing, Preact leaves the old one up with nothing responding to
// taps. Catch it here and offer a reload instead; progress is already saved on the device.
class Boundary extends Component {
  state = { err: null };
  componentDidCatch(err) { console.error(err); this.setState({ err }); }
  render() {
    if (!this.state.err) return this.props.children;
    return h('div', { class: 'pl-crash' },
      h('p', { class: 'pl-crash-fa', lang: 'fa', dir: 'rtl' }, 'ببخشید'),
      h('h1', null, 'Something went wrong'),
      h('p', null, 'Your progress is saved on this device. Reload to pick up where you left off.'),
      h('button', { onClick: () => location.reload() }, 'Reload'));
  }
}

render(h(Boundary, {}, h(App, {})), document.getElementById('app'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
