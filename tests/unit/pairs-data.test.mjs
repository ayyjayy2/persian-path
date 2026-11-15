// Everyday call-and-response pairs and the Quick replies drill (#57)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../../learn-data.js';
import { PAIRS, pairsFor, buildRepliesDrill } from '../../pairs-data.js';

const lesson = id => LESSONS.find(l => l.id === id);
const keep = a => a; // no shuffling, so results are predictable

test('every pair links to words its lesson teaches', () => {
  for (const p of PAIRS) {
    const ph = new Set(lesson(p.lesson).words.map(w => w.phonetic));
    assert.ok(ph.has(p.call.word), `${p.lesson}: call ${p.call.word}`);
    assert.ok(ph.has(p.reply.word), `${p.lesson}: reply ${p.reply.word}`);
  }
});

test('Greetings has 5 rounds; Expressions has 5 informal and 4 polite', () => {
  const g = buildRepliesDrill('greetings', keep).turns, e = buildRepliesDrill('expressions', keep).turns;
  assert.equal(g.filter(t => t.who === 'you').length, 5);
  assert.equal(e.filter(t => t.who === 'you').length, 9);
  assert.equal(e.filter(t => t.who === 'npc' && t.speaker === 'An older neighbour').length, 4);
  assert.deepEqual(buildRepliesDrill('numbers', keep).turns, []);
});

test('turns alternate call then reply, with three choices and exactly one right', () => {
  for (const id of ['greetings', 'expressions']) {
    const t = buildRepliesDrill(id, keep).turns;
    t.forEach((turn, i) => assert.equal(turn.who, i % 2 ? 'you' : 'npc', `${id} turn ${i}`));
    for (const turn of t.filter(x => x.who === 'you')) {
      assert.equal(turn.choices.length, 3);
      assert.equal(turn.choices.filter(c => c.ok).length, 1);
      assert.equal(new Set(turn.choices.map(c => c.fa)).size, 3, 'no duplicate choices');
      for (const c of turn.choices.filter(c => !c.ok)) assert.ok(c.why, 'wrong choices explain why');
    }
  }
});

test('a polite round offers the informal reply as a wrong choice when it differs', () => {
  const t = buildRepliesDrill('expressions', keep).turns;
  const i = t.findIndex(x => x.who === 'npc' && x.lat === 'Khaste nabaashid');
  const choices = t[i + 1].choices;
  assert.equal(choices.find(c => c.ok).lat, 'Salaamat baashid');
  assert.match(choices.find(c => c.lat === 'Salaamat baashi').why, /friend/);
});

test('pairsFor only returns that lesson', () => {
  assert.equal(pairsFor('greetings').length, 5);
  assert.ok(pairsFor('expressions').every(p => p.lesson === 'expressions'));
});
