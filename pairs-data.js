// Everyday call-and-response pairs: someone says the call, everyone answers with the reply (#57).
// Pure, so Node can test it (tests/unit/pairs-data.test.mjs).
// `word` is the phonetic of the lesson word each side teaches. `polite` is the shomaa form,
// when the reply changes with register. Written by Claude; a native speaker should review it.
export const PAIRS = [
  { lesson: 'greetings',
    call: { fa: 'سلام علیکم', lat: 'Salaam aleykom', en: 'Peace be upon you', word: 'Salaam Aleykom' },
    reply: { fa: 'علیکم السلام', lat: 'Aleykom salaam', en: 'And upon you, peace', word: 'Aleykom Salaam' },
    tip: 'The reply turns the greeting around: salaam aleykom, aleykom salaam.' },
  { lesson: 'greetings',
    call: { fa: 'ممنون', lat: 'Mamnoon', en: 'Thanks', word: 'Mamnoon' },
    reply: { fa: 'خواهش میکنم', lat: 'Khaahesh mikonam', en: "You're welcome", word: 'Khaahesh Mikonam' } },
  { lesson: 'greetings',
    call: { fa: 'خوشبختم', lat: 'Khoshbakhtam', en: 'Nice to meet you', word: 'Khoshbakhtam' },
    reply: { fa: 'همچنین', lat: 'Hamchenin', en: 'Likewise', word: 'Hamchenin' } },
  { lesson: 'greetings',
    call: { fa: 'ببخشید', lat: 'Bebakhshid', en: 'Sorry', word: 'Bebakhshid' },
    reply: { fa: 'عیب نداره', lat: 'Eyb nadaare', en: 'No problem', word: 'Eyb Nadaare' } },
  { lesson: 'greetings',
    call: { fa: 'خداحافظ', lat: 'Khodaa haafez', en: 'Goodbye', word: 'Khodaa Haafez' },
    reply: { fa: 'به سلامت', lat: 'Be salaamat', en: 'Go safely', word: 'Be Salaamat' },
    tip: 'Khodaa haafez back works too. Be salaamat is what the one staying says.' },
  { lesson: 'expressions',
    call: { fa: 'چه خبر؟', lat: 'Che khabar?', en: "What's new?", word: 'Che Khabar?' },
    reply: { fa: 'سلامتی', lat: 'Salaamati', en: "All's well (lit: health)", word: 'Salaamati' },
    tip: 'Salaamati means "health": nothing new, all is well.' },
  { lesson: 'expressions',
    call: { fa: 'چطوری؟', lat: 'Chetori?', en: 'How are you?', word: 'Chetori?' },
    reply: { fa: 'خوبم، مرسی. تو چطوری؟', lat: 'Khubam, mersi. To chetori?', en: "I'm well, thanks. And you?", word: 'Khubam' },
    polite: { call: { fa: 'حالتون چطوره؟', lat: 'Haaletun chetore?', en: 'How are you? (polite)' },
              reply: { fa: 'خوبم، ممنون. شما چطورین؟', lat: 'Khubam, mamnoon. Shomaa chetorin?', en: "I'm well, thank you. And you? (polite)" } } },
  { lesson: 'expressions',
    call: { fa: 'خسته نباشی', lat: 'Khaste nabaashi', en: 'May you not be tired', word: 'Khaste Nabashi' },
    reply: { fa: 'سلامت باشی', lat: 'Salaamat baashi', en: 'May you be healthy', word: 'Salaamat Baashi' },
    polite: { call: { fa: 'خسته نباشید', lat: 'Khaste nabaashid', en: 'May you not be tired (polite)' },
              reply: { fa: 'سلامت باشید', lat: 'Salaamat baashid', en: 'May you be healthy (polite)' } } },
  { lesson: 'expressions',
    call: { fa: 'دستت درد نکنه', lat: 'Dastet dard nakone', en: 'Thank you (lit: may your hand not hurt)', word: 'Dastet Dard Nakone' },
    reply: { fa: 'نوش جان', lat: 'Nooshe jaan', en: 'Enjoy, my pleasure', word: 'Nooshe Jaan' },
    polite: { call: { fa: 'دستتون درد نکنه', lat: 'Dastetun dard nakone', en: 'Thank you (polite)' },
              reply: { fa: 'نوش جان', lat: 'Nooshe jaan', en: 'Enjoy, my pleasure' } },
    tip: 'Said after a meal you cooked. Nooshe jaan works with everyone.' },
  { lesson: 'expressions',
    call: { fa: 'عافیت باشه', lat: 'Aafiyat baashe', en: 'Bless you', word: 'Aafiyat Baashe' },
    reply: { fa: 'سلامت باشی', lat: 'Salaamat baashi', en: 'May you be healthy', word: 'Salaamat Baashi' },
    polite: { call: { fa: 'عافیت باشه', lat: 'Aafiyat baashe', en: 'Bless you' },
              reply: { fa: 'سلامت باشید', lat: 'Salaamat baashid', en: 'May you be healthy (polite)' } } },
];

const FRIEND = 'Your friend', ELDER = 'An older neighbour';
const defaultShuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const side = s => ({ fa: s.fa, lat: s.lat, en: s.en });

export function pairsFor(lessonId) { return PAIRS.filter(p => p.lesson === lessonId); }

// The Quick replies drill, in the checkpoint scenario shape: { title, setting, npc, turns }.
// Informal rounds first (one per pair, in teaching order), then a polite round for each pair that has one.
export function buildRepliesDrill(lessonId, shuffle = defaultShuffle) {
  const pairs = pairsFor(lessonId), turns = [];
  const round = (speaker, call, reply, wrong, tip) => {
    turns.push({ who: 'npc', speaker, ...side(call) });
    turns.push({ who: 'you', choices: shuffle([{ ...side(reply), ok: true, tip }, ...wrong]) });
  };
  // Two wrong choices: other pairs' replies, each saying which call it answers
  const others = (p, right, n) => shuffle(pairs.filter(q => q !== p && q.reply.fa !== right.fa && q.reply.fa !== p.reply.fa))
    .slice(0, n).map(q => ({ ...side(q.reply), why: `${q.reply.lat} answers ${q.call.lat} (${q.call.en.toLowerCase()}).` }));
  for (const p of pairs) round(FRIEND, p.call, p.reply, others(p, p.reply, 2), p.tip);
  for (const p of pairs.filter(q => q.polite)) {
    const informal = p.reply.fa !== p.polite.reply.fa
      ? [{ ...side(p.reply), why: `That's how you'd answer a friend. With elders and strangers: ${p.polite.reply.lat}.` }] : [];
    round(ELDER, p.polite.call, p.polite.reply, [...informal, ...others(p, p.polite.reply, 2 - informal.length)], p.tip);
  }
  return { title: 'Quick replies', setting: 'Someone says a set phrase. Answer the way Iranians do.', npc: FRIEND, turns };
}

// A lesson's words as units: a call followed by its reply, or a single word. A reply shared by two
// calls goes with the first one. Units keep the lesson's word order.
export function pairUnits(words, lessonId) {
  const by = new Map(words.map(w => [w.phonetic, w])), used = new Set(), units = [];
  const pairs = pairsFor(lessonId);
  for (const w of words) {
    if (used.has(w)) continue;
    const p = pairs.find(p => p.call.word === w.phonetic);
    const r = p && by.get(p.reply.word);
    const u = r && !used.has(r) ? [w, r] : [w];
    u.forEach(x => used.add(x)); units.push(u);
  }
  return units;
}

// A random deck of at least n words that never splits a pair
export function pairedPool(words, lessonId, shuffle, n) {
  const out = [];
  for (const u of shuffle(pairUnits(words, lessonId))) { if (out.length >= n) break; out.push(...u); }
  return out;
}

// For a reply's word key ("lesson:Phonetic"): the calls it answers, spelled as their cards spell
// them, e.g. "Khoshbakhtam"; null otherwise
export function replyTo(key) {
  const [lessonId, ph] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
  const calls = pairsFor(lessonId).filter(p => p.reply.word === ph).map(p => p.call.word);
  return calls.length ? calls.join(' / ') : null;
}
