// Screen markup, converted from the v2 design export (Persian Learnin.dc.html).
// `v` is the view model built by App.renderVals() in app.js.
import { html } from "./vendor/preact-htm.js";
import { SAY } from "./learn-data.js";

// Persian digit set beside a number word (e.g. هفت ۷)
// How to say a Persian label, shown in Latin letters beside it
const say = (fa, size = 12) => SAY[fa] ? html`<span style="font-family:var(--font-body);font-style:italic;font-size:${size}px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--color-neutral-700);direction:ltr;white-space:nowrap">${SAY[fa]}</span>` : null;
// Persian words inside English text, set in the Persian font
const faRuns = (text) => text.split(/([\u0600-\u06FF\u200C]+(?:\s+[\u0600-\u06FF\u200C]+)*)/).map((t, i) => i % 2 ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:1.2em">${t}</span>` : t);
// A number word's digit, boxed and captioned ("digit 7") so it can't be mistaken for the word beside it (#55).
// In quiz questions and choices, reveal = false keeps the caption to "digit" so it doesn't give the answer away.
const westDigits = (s) => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const digit = (num, reveal = true) => num ? html`<span data-digit aria-label=${reveal ? 'digit ' + westDigits(num) : 'digit'} style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin-inline-start:0.45em;padding:0.08em 0.3em 0.12em;border:1px solid var(--color-accent);border-radius:6px;line-height:1;color:var(--color-accent-700)"><span>${num}</span><span style="font-family:var(--font-body);font-size:max(9px,0.26em);letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-600);margin-top:0.25em;direction:ltr;white-space:nowrap"> digit${reveal ? ' ' + westDigits(num) : ''}</span></span>` : null;
// A verb's command forms and how it's used, under its table
const verbNotes = (t) => html`
  ${(t.imp) ? html`<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px">
    <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Commands</span>
    ${t.imp.map((f, i) => html`<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center">
      <span style="font-size:13px;color:var(--color-neutral-700)">${i ? 'to several people, or politely' : 'to one person'}</span>
      <span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;line-height:1.4">${f.fa}!</span><span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${f.lat}!</span></span></div>`)}
  </div>` : null}
  ${(t.note) ? html`<p style="margin:0;font-size:14px;line-height:1.6;color:var(--color-neutral-800)">${faRuns(t.note)}</p>` : null}`;
// A verb's six forms in one tense: person on the left, Persian form on the right
const verbTable = (t) => html`
  <div style="display:flex;flex-direction:column">
    ${t.rows.map((r) => html`
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--color-divider)">
        <span style="display:flex;flex-direction:column;min-width:0"><span style="font-size:14px">${r.en}</span><span style="font-size:11px;color:var(--color-neutral-600)">${r.whoLat} <span style="font-family:'Noto Naskh Arabic',serif">${r.whoFa}</span></span></span>
        <span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;line-height:1.4">${r.fa}</span><span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${r.lat}</span></span>
      </div>`)}
  </div>`;

export function view(v) {
  return html`
<div style="min-height:100vh;display:flex;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body)">

${(v.showRail) ? html`
<aside style="width:248px;flex:none;position:sticky;top:0;height:100vh;border-right:1px solid var(--color-divider);display:flex;flex-direction:column;padding:28px 20px;gap:28px;box-sizing:border-box">
  <div style="display:flex;flex-direction:column;gap:2px">
    <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:22px;color:var(--color-accent-700);direction:rtl;text-align:left;line-height:1.3">فارسی</span>${say('فارسی')}</span>
    <span style="font-family:var(--font-heading);font-size:24px;font-weight:600;letter-spacing:-0.01em">Persian Learnin</span>
  </div>
  <nav style="display:flex;flex-direction:column;gap:2px">
    ${(v.tabs || []).map((t) => html`
      <button onClick=${t.go} style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;border-left:2px solid ${t.rail};background:${t.railBg};color:${t.color};cursor:pointer;text-align:left;font-family:var(--font-heading);font-size:18px;font-weight:600;border-radius:0 var(--radius-md) var(--radius-md) 0" class="hv0">${t.icon}<span>${t.label}</span></button>
    `)}
  </nav>
  <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--color-divider);padding-top:18px;font-size:13px">
    <div style="display:flex;justify-content:space-between"><span style="color:var(--color-neutral-700)">Streak</span><span style="font-feature-settings:'tnum'">${v.streak} ${v.streak === 1 ? 'day' : 'days'}</span></div>
    <div style="display:flex;justify-content:space-between"><span style="color:var(--color-neutral-700)">Total XP</span><span style="font-feature-settings:'tnum'">${v.xp}</span></div>
  </div>
</aside>
` : null}

<div style="flex:1;min-width:0;display:flex;flex-direction:column;padding-bottom:${v.bottomPad}">

${(v.showAppBar) ? html`
<header style="position:sticky;top:0;z-index:20;background:color-mix(in srgb, var(--color-bg) 92%, transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid var(--color-divider);padding:12px 20px;padding-top:max(12px, env(safe-area-inset-top))">
  <div style="max-width:680px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;direction:rtl">
    <div style="display:flex;align-items:baseline;gap:10px">
      <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${v.appBarFa}</span>${say(v.appBarFa)}</span>
      <span style="font-family:var(--font-heading);font-size:22px;font-weight:600">${v.appBarTitle}</span>
    </div>
    <div style="display:flex;align-items:center;gap:14px;font-size:13px;font-feature-settings:'tnum';direction:ltr">
      <span style="display:flex;align-items:center;gap:5px;color:var(--color-accent-700)">${v.ic.flame}${v.streak}</span>
      <span style="display:flex;align-items:center;gap:5px;color:var(--color-neutral-800)">${v.ic.zap}${v.xp}</span>
    </div>
  </div>
</header>
` : null}

<main style="flex:1;width:100%;max-width:680px;margin:0 auto;box-sizing:border-box;padding:${v.mainPad}">


${(v.is.learn) ? html`
<div style="display:flex;flex-direction:column;gap:28px;animation:plfade .25s ease">
  <section style="display:flex;flex-direction:column;gap:6px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap">
      <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${v.dateEn}</span>
      <span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-family:'Noto Naskh Arabic',serif;font-size:14px;color:var(--color-neutral-700);direction:rtl">${v.dateFa}</span>${(v.dateLat) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${v.dateLat}</span>` : null}</span>
    </div>
    ${(v.dayName) ? html`<span style="font-size:13px;color:var(--color-neutral-700)">${v.dayName.en} is <span style="font-style:italic;color:var(--color-accent-700)">${v.dayName.lat}</span></span>` : null}
    <h1 style="font-size:40px;font-weight:400;margin:4px 0 0;line-height:1.05">${v.greeting}</h1>
    <p style="margin:0;color:var(--color-neutral-700);font-size:14px">${v.greetingSub}</p>
  </section>

  <section style="border:1px solid var(--color-accent);border-radius:var(--radius-md);padding:18px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;direction:rtl">
      <span style="display:flex;align-items:baseline;gap:8px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:17px;color:var(--color-accent-700)">مسیر تسلط</span>${say('مسیر تسلط')}</span><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Path to fluency</span></span>
      <button class="btn btn-ghost" onClick=${v.openPlan} style="min-height:40px;direction:ltr">Full plan</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;direction:rtl">
      ${(v.track || []).map((t) => html`
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
          <div style="width:100%;height:3px;background:${t.bar}"></div>
          <span style="font-size:10px;color:${t.color};direction:ltr;font-feature-settings:'tnum'">${t.level}</span>
        </div>
      `)}
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700);font-feature-settings:'tnum'">Stage ${v.path.n} of 5 · ${v.path.level} · ${v.path.weeks}</span>
      <span style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:22px;color:var(--color-accent-700)">${v.path.fa}</span>${say(v.path.fa)}</span><span style="font-family:var(--font-heading);font-size:28px;font-weight:400;line-height:1.1">${v.path.name}</span></span>
      <p style="margin:0;font-size:13px;line-height:1.55;color:var(--color-neutral-800)">${v.path.goal}</p>
    </div>
    <div style="display:flex;flex-direction:column;border-top:1px solid var(--color-divider)">
      <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-neutral-700);padding:12px 0 2px">By the end of this stage you can</span>
      ${(v.path.cando || []).map((c) => html`
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--color-divider)">
          <span style="width:20px;height:20px;border-radius:50%;border:1px solid ${c.border};color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;flex:none">${c.icon}</span>
          <span style="font-size:14px;color:${c.color}">${c.text}</span>
        </div>
      `)}
    </div>
  </section>

  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:18px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;direction:rtl">
      <span style="display:flex;align-items:baseline;gap:8px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:17px;color:var(--color-accent-700)">هدف روزانه</span>${say('هدف روزانه')}</span><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Daily goal</span></span>
      <span style="font-size:13px;font-feature-settings:'tnum';color:var(--color-neutral-700);direction:ltr">${v.todayXp} / ${v.goal} XP</span>
    </div>
    <div style="height:2px;background:var(--color-divider);position:relative"><div style="position:absolute;right:0;top:-1px;height:4px;background:var(--color-accent);width:${v.goalPct}"></div></div>
    <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;direction:rtl">
      ${(v.week || []).map((d) => html`
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:34px;height:34px;border-radius:50%;border:1px solid ${d.border};background:${d.bg};display:flex;align-items:center;justify-content:center;font-family:'Noto Naskh Arabic',serif;font-size:15px;color:${d.color}">${d.fa}</div>
          <span style="font-size:10px;color:var(--color-neutral-600)">${d.en}</span>
          ${(d.lat) ? html`<span style="font-size:10px;font-style:italic;color:var(--color-accent-700);white-space:nowrap">${d.lat}</span>` : null}
        </div>
      `)}
    </div>
    <div aria-hidden="true" style="display:flex;align-items:center;margin:-4px 7% 0;color:var(--color-neutral-400)">
      <svg width="6" height="9" viewBox="0 0 6 9" style="flex:none;margin-right:-1px"><path d="M5.5 .5 1 4.5l4.5 4" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <div style="flex:1;height:1px;background:currentColor"></div>
    </div>
    <p style="margin:0;font-size:12px;color:var(--color-neutral-700);font-style:italic;text-align:right;padding-right:calc((100% - 36px) / 14 - 17px)">The Persian week begins on Saturday — shanbe.</p>
  </section>

  <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
    <div style="border:1px solid var(--color-accent);border-radius:var(--radius-md);padding:18px;display:flex;flex-direction:column;gap:8px">
      <span style="display:flex;align-items:baseline;gap:8px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">مرور</span>${say('مرور')}</span><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Spaced review</span></span>
      <div style="display:flex;align-items:baseline;gap:8px"><span style="font-family:var(--font-heading);font-size:44px;line-height:1;font-feature-settings:'tnum'">${v.dueCount}</span><span style="font-size:14px">words due today</span></div>
      <p style="margin:0;font-size:13px;color:var(--color-neutral-700)">Short, timed reviews move words into long-term memory.</p>
      <button class="btn btn-primary" onClick=${v.startReview} disabled=${v.reviewEmpty} style="align-self:flex-start;margin-top:4px;min-height:44px;padding-inline:20px">Begin review</button>
      ${(v.reviewEmpty) ? html`<p style="margin:0;font-size:13px;color:var(--color-neutral-700)">Nothing to review right now. <button onClick=${v.openNextLesson} style="background:none;border:0;padding:0;color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px;cursor:pointer">Start a lesson</button> to add new words.</p>` : null}
    </div>
    <div style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:18px;display:flex;flex-direction:column;gap:8px;cursor:pointer" onClick=${v.cont.open} class="hv1">
      <span style="display:flex;align-items:baseline;gap:8px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">ادامه</span>${say('ادامه')}</span><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700);direction:ltr">Continue · Chapter ${v.cont.n}</span></span>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;direction:rtl">
        <span style="font-family:var(--font-heading);font-size:24px;font-weight:600;line-height:1.1">${v.cont.title}</span>
        <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:24px;color:var(--color-accent-700)">${v.cont.glyph}</span>${say(v.cont.glyph)}</span>
      </div>
      <p style="margin:0;font-size:13px;color:var(--color-neutral-700)">Next: ${v.cont.next}</p>
      <div style="height:1px;background:var(--color-divider);margin-top:auto;position:relative"><div style="position:absolute;left:0;top:-1px;height:3px;background:var(--color-accent);width:${v.cont.pct}"></div></div>
    </div>
  </section>

  <section style="border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:22px 0;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;direction:rtl">
      <span style="display:flex;align-items:baseline;gap:8px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">عبارت روز</span>${say('عبارت روز')}</span><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Phrase of the day</span></span>
      <button onClick=${v.wod.play} aria-label="Play" style="width:44px;height:44px;border-radius:50%;border:1px solid var(--color-accent);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer" class="hv2">${v.ic.vol}</button>
    </div>
    ${(v.show.fa) ? html`<div style="font-family:'Noto Naskh Arabic',serif;font-size:40px;direction:rtl;text-align:right;line-height:1.4">${v.wod.fa}${digit(v.wod.num)}</div>` : null}
    ${(v.show.lat) ? html`<div style="font-style:italic;font-size:15px;color:var(--color-neutral-700);text-align:right">${v.wod.lat}</div>` : null}
    <div style="font-family:var(--font-heading);font-size:22px;font-weight:600">${v.wod.en}</div>
    <p style="margin:0;font-size:14px;line-height:1.6;text-align:justify;hyphens:auto;color:var(--color-neutral-800)">Say it to anyone at the end of their work — a shopkeeper, a cook, a colleague. It acknowledges effort, not result. The reply is <em>salaamat baashi</em>, “may you be healthy.”</p>
  </section>

  <section style="display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;direction:rtl">
      <span style="display:flex;align-items:baseline;gap:10px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">فهرست</span>${say('فهرست')}</span><h2 style="font-size:28px;margin:0">Contents</h2></span>
      <span style="font-size:12px;color:var(--color-neutral-700);font-feature-settings:'tnum';direction:ltr">${v.chaptersDone} of ${v.chapterCount} complete</span>
    </div>
    ${(v.stageGroups || []).map((g) => html`
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:24px 0 8px;border-bottom:1px solid var(--color-text);direction:rtl">
        <span style="display:flex;align-items:baseline;gap:10px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">${g.fa}</span>${say(g.fa)}</span><span style="font-family:var(--font-heading);font-size:21px;font-weight:600">${g.title}</span></span>
        <span style="font-size:11px;color:var(--color-neutral-700);direction:ltr;font-feature-settings:'tnum';display:flex;align-items:center;gap:6px">${g.lockIcon}${g.meta}</span>
      </div>
      ${(g.items || []).map((c) => html`
        <button onClick=${c.open} style="display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px 4px;border:0;border-bottom:1px solid var(--color-divider);background:transparent;text-align:left;cursor:${c.cursor};min-height:64px;opacity:${c.op}" class="hv3">
          <span style="display:flex;flex-direction:column;align-items:center;line-height:1">
            ${(c.isLesson) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${c.nFa}</span><span style="font-size:10px;color:var(--color-neutral-600);font-feature-settings:'tnum';margin-top:2px">${c.n}</span>` : null}
            ${(c.isOther) ? html`<span style="width:32px;height:32px;border:1px solid ${c.iconBorder};border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--color-accent-700)">${c.icon}</span>` : null}
          </span>
          <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
            ${(c.kicker) ? html`<span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${c.kicker}</span>` : null}
            <span style="font-family:var(--font-heading);font-size:20px;font-weight:600;line-height:1.15">${c.title}</span>
            <span style="font-size:12px;color:var(--color-neutral-700)">${c.desc}</span>
            ${(c.isLesson) ? html`<span style="display:flex;gap:4px;margin-top:4px">${(c.marks || []).map((m) => html`<span style="width:18px;height:3px;background:${m.bg}"></span>`)}</span>` : null}
          </span>
          <span style="display:flex;align-items:center;gap:10px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-neutral-700)">${c.glyph}</span>${say(c.glyph)}</span><span style="color:${c.endColor};display:flex">${c.endIcon}</span></span>
        </button>
      `)}
    `)}
  </section>
  <section style="display:flex;flex-direction:column">
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">دستور</span>${say('دستور')}</span><h2 style="font-size:28px;margin:0">Grammar</h2></div>
    ${(v.grammarList || []).map((gr) => html`
      <button onClick=${gr.open} style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px 4px;border:0;border-bottom:1px solid var(--color-divider);background:transparent;text-align:left;cursor:${gr.cursor};opacity:${gr.op};min-height:56px">
        <span style="display:flex;flex-direction:column;gap:3px;min-width:0"><span style="font-family:var(--font-heading);font-size:20px;font-weight:600;line-height:1.15">${gr.title}</span><span style="font-size:12px;color:var(--color-neutral-700)">${gr.desc}</span></span>
        <span style="color:var(--color-neutral-500);display:flex">${gr.end}</span>
      </button>`)}
  </section>
</div>
` : null}


${(v.is.lesson) ? html`
<div style="display:flex;flex-direction:column;gap:26px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:var(--radius-md)" class="hv4">${v.ic.back}</button>
    <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700);font-feature-settings:'tnum'">${v.L.where} · ${v.L.count} words</span>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:1px solid var(--color-divider);padding-bottom:18px">
    <div><h1 style="font-size:40px;font-weight:400;margin:0;line-height:1.05">${v.L.title}</h1><p style="margin:6px 0 0;color:var(--color-neutral-700);font-size:14px">${v.L.desc}</p><p style="margin:12px 0 0;font-size:14px;line-height:1.5;display:flex;flex-direction:column;gap:2px"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">You'll be able to</span><em>${v.L.cando}</em></p></div>
    <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:44px;color:var(--color-accent-700);line-height:1.2">${v.L.glyph}</span>${say(v.L.glyph)}</span>
  </div>

  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md)">
    <button onClick=${v.toggleNote} style="width:100%;display:flex;align-items:center;gap:10px;padding:14px 16px;border:0;background:transparent;cursor:pointer;text-align:left;min-height:48px">
      <span style="color:var(--color-accent-700)">${v.ic.bulb}</span>
      <span style="flex:1;display:flex;flex-direction:column"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Teacher's note</span><span style="font-family:var(--font-heading);font-size:18px;font-weight:600">${v.L.noteT}</span></span>
      <span style="color:var(--color-neutral-600);transform:rotate(${v.noteRot});transition:transform .2s">${v.ic.chev}</span>
    </button>
    ${(v.noteOpen) ? html`<p style="margin:0;padding:0 16px 16px 46px;font-size:14px;line-height:1.65;text-align:justify;hyphens:auto;color:var(--color-neutral-800)">${v.L.noteB}</p>` : null}
  </section>
  ${(v.L.conj) ? html`
  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:16px;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;direction:rtl">
      <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">دستور</span>${say('دستور')}</span>
      <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700);direction:ltr">Grammar · ${v.registerLabel}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
      <span style="font-family:var(--font-heading);font-size:22px;font-weight:600">${v.L.conj.inf} <span style="font-weight:400;font-size:16px;color:var(--color-neutral-700)">— ${v.L.conj.en}</span></span>
      <span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${v.L.conj.infFa}</span>
    </div>
    ${verbTable(v.L.conj)}
    ${verbNotes(v.L.conj)}
    <button class="btn btn-ghost" onClick=${v.L.openPresent} style="align-self:flex-start;min-height:44px;padding:0;gap:6px">How the present tense works ${v.ic.chev}</button>
    ${(v.L.conjPast) ? html`
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-top:1px solid var(--color-divider);padding-top:12px">
      <span style="font-family:var(--font-heading);font-size:20px;font-weight:600">In the past${v.L.conjPast.inf !== v.L.conj.inf ? html` <span style="font-weight:400;font-size:15px;color:var(--color-neutral-700)">— from ${v.L.conjPast.inf}</span>` : null}</span>
      <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">گذشته</span>${say('گذشته')}</span>
    </div>
    ${verbTable(v.L.conjPast)}
    <button class="btn btn-ghost" onClick=${v.L.openPast} style="align-self:flex-start;min-height:44px;padding:0;gap:6px">How the past tense works ${v.ic.chev}</button>` : null}
  </section>
  ` : null}

  <section style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:baseline;gap:10px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">تمرین</span>${say('تمرین')}</span><h2 style="font-size:24px;margin:0">Practice</h2></div>
    ${(v.L.acts || []).map((a) => html`
      <button onClick=${a.start} style="display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px;border:1px solid ${a.border};border-radius:var(--radius-md);background:transparent;cursor:pointer;text-align:left;min-height:68px" class="hv5">
        <span style="width:44px;height:44px;border:1px solid var(--color-divider);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--color-accent-700)">${a.icon}</span>
        <span style="display:flex;flex-direction:column;gap:2px;min-width:0">
          <span style="display:flex;align-items:center;gap:8px"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">${a.title}</span>${(a.isNew) ? html`<span class="tag tag-outline" style="font-size:10px;padding:1px 6px;border:1px solid var(--color-accent);color:var(--color-accent-700);border-radius:var(--radius-sm);letter-spacing:0.06em;text-transform:uppercase">New</span>` : null}</span>
          <span style="font-size:12px;color:var(--color-neutral-700)">${a.desc}</span>
        </span>
        <span style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:11px;color:var(--color-neutral-700);font-feature-settings:'tnum'">
          ${(a.done) ? html`<span style="color:var(--color-accent-700);display:flex">${v.ic.check}</span>` : null}
          <span>${a.mins} min</span>
        </span>
      </button>
    `)}
  </section>

  <section style="display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;direction:rtl"><span style="display:flex;align-items:baseline;gap:10px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">واژه‌ها</span>${say('واژه‌ها')}</span><h2 style="font-size:24px;margin:0">Vocabulary</h2></span><span style="font-size:12px;color:var(--color-neutral-700);direction:ltr">Register: ${v.registerLabel}</span></div>
    ${(v.L.words || []).map((w) => html`
      <div style="display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-divider)">
        <button onClick=${w.play} aria-label="Play" style="width:40px;height:40px;border-radius:50%;border:1px solid ${w.btnBorder};background:${w.btnBg};color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
        <span style="display:flex;flex-direction:column;min-width:0"><span style="font-size:14px">${w.en}</span>${(w.hasAlt) ? html`<span style="font-size:11px;color:var(--color-neutral-600)">${w.altLabel}: <span style="font-family:'Noto Naskh Arabic',serif">${w.altFa}</span> · ${w.altLat}</span>` : null}</span>
        <span style="display:flex;flex-direction:column;align-items:flex-end">
          ${(w.num) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${w.num}</span>` : null}
          ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;line-height:1.4">${w.fa}</span>` : null}
          ${(v.show.lat) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${w.lat}</span>` : null}
        </span>
      </div>
    `)}
  </section>
</div>
` : null}


${(v.is.exercise) ? html`
<div style="display:flex;flex-direction:column;gap:22px;min-height:calc(100vh - 48px);padding-bottom:140px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:14px;direction:rtl">
    <button onClick=${v.exitEx} aria-label="Close" style="width:44px;height:44px;margin-right:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:var(--radius-md)" class="hv6">${v.ic.x}</button>
    <div style="flex:1;height:1px;background:var(--color-divider);position:relative"><div style="position:absolute;right:0;top:-1px;height:3px;background:var(--color-accent);width:${v.X.pct};transition:width .35s ease"></div></div>
    <span style="font-size:12px;font-feature-settings:'tnum';color:var(--color-neutral-700);min-width:44px;text-align:left;direction:ltr">${v.X.counter}</span>
  </div>
  <span style="display:flex;align-items:baseline;gap:8px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">${v.X.kindFa}</span>${say(v.X.kindFa)}</span><span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${v.X.kindLabel}</span></span>

  ${(v.X.isFlash) ? html`
  <div style="display:flex;flex-direction:column;gap:18px;align-items:center;overflow-x:clip;margin-inline:-20px;padding-inline:20px">
    <div onClick=${v.X.flip} class="card-slide" style="width:100%;max-width:460px;height:320px;perspective:1200px;cursor:pointer;animation-name:${v.X.slide}">
      <div style="position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.4,0,.2,1);transform:rotateY(${v.X.rot})">
        <div style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:1px solid var(--color-divider);outline:6px solid var(--color-surface);outline-offset:-7px;border-radius:var(--radius-md);background:var(--color-bg);box-shadow:var(--shadow-md);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px">
          <span style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-neutral-600)">Persian</span>
          ${(v.X.num) ? html`<span data-card-num style="font-family:'Noto Naskh Arabic',serif;font-size:64px;line-height:1.1;color:var(--color-accent-700)">${v.X.num}</span>` : null}
          ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:52px;direction:rtl;line-height:1.35;text-align:center">${v.X.fa}</span>` : null}
          ${(v.show.lat) ? html`<span style="font-style:italic;font-size:17px;color:var(--color-neutral-700)">${v.X.lat}</span>` : null}
          <span style="font-size:12px;color:var(--color-neutral-600);margin-top:8px">Tap to reveal</span>
        </div>
        <div style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);border:1px solid var(--color-accent);outline:6px solid var(--color-surface);outline-offset:-7px;border-radius:var(--radius-md);background:var(--color-bg);box-shadow:var(--shadow-md);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px;text-align:center">
          ${(v.X.flipped) ? html`
          <span style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-accent-700)">English</span>
          <span style="font-family:var(--font-heading);font-size:32px;font-weight:600;line-height:1.1">${v.X.en}</span>
          <span style="width:40px;height:1px;background:var(--color-divider);margin:6px 0"></span>
          ${(v.X.exParts) ? html`
          <div dir="rtl" data-ex-parts style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:6px 8px;max-width:100%">
            ${v.X.exParts.parts.map(([fa, en], i) => html`
            <span data-hit=${i === v.X.exParts.hit ? 'true' : null} style="display:inline-flex;flex-direction:column;align-items:center;min-width:0">
              <span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.5;color:${i === v.X.exParts.hit ? 'var(--color-accent-700)' : 'var(--color-neutral-800)'};font-weight:${i === v.X.exParts.hit ? 600 : 400}">${fa}</span>
              <span style="align-self:stretch;height:5px;margin:0 2px;border:1px solid ${i === v.X.exParts.hit ? 'var(--color-accent)' : 'var(--color-neutral-400)'};border-top:0;border-radius:0 0 3px 3px"></span>
              <span dir="ltr" style="font-size:11px;line-height:1.3;margin-top:3px;text-align:center;color:${i === v.X.exParts.hit ? 'var(--color-accent-700)' : 'var(--color-neutral-600)'}">${en}</span>
            </span>`)}
          </div>
          <span style="font-size:14px;font-style:italic;line-height:1.4;color:var(--color-neutral-700);margin-top:2px">${v.X.exParts.en}</span>
          ${(v.X.exParts.parts.every(p => p[2])) ? html`<span data-ex-lat style="font-size:13px;font-style:italic;line-height:1.4;color:var(--color-neutral-600)">${v.X.exParts.parts.map((p, i) => html`${i ? ' ' : ''}${i === v.X.exParts.hit ? html`<b data-hit-lat style="font-weight:700;color:var(--color-text)">${p[2]}</b>` : p[2]}`)}</span>` : null}
          ` : html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;color:var(--color-neutral-800)">${v.X.example}</span>`}
          ` : null}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-secondary" onClick=${v.X.play} style="min-height:44px;gap:8px">${v.ic.volSm} Listen</button>
      <button class="btn btn-secondary" onClick=${v.X.playSlow} style="min-height:44px">Slow · 0.7×</button>
    </div>
  </div>
  ` : null}

  ${(v.X.isChoice) ? html`
  <div style="display:flex;flex-direction:column;gap:20px">
    <h2 style="font-size:26px;margin:0">${v.X.prompt}</h2>
    ${(v.X.isListen) ? html`
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px 0">
        <button onClick=${v.X.play} aria-label="Play" style="width:120px;height:120px;border-radius:50%;border:1px solid var(--color-accent);outline:6px solid var(--color-surface);background:${v.X.listenBg};color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer" class="hv7">${v.ic.volLg}</button>
        <button class="btn btn-ghost" onClick=${v.X.playSlow} style="min-height:44px">Play slowly</button>
      </div>
    ` : null}
    ${(v.X.showPromptWord) ? html`
      <div style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:24px;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative">
        ${(v.X.promptIsFa) ? html`
          ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:44px;direction:rtl;line-height:1.4">${v.X.fa}${digit(v.X.num, false)}</span>` : null}
          ${(v.show.lat) ? html`<span style="font-style:italic;color:var(--color-neutral-700)">${v.X.lat}</span>` : null}
          <button onClick=${v.X.play} aria-label="Play" style="position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:50%;border:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
        ` : null}
        ${(v.X.promptIsEn) ? html`<span style="font-family:var(--font-heading);font-size:32px;font-weight:600;text-align:center;line-height:1.15">${v.X.en}</span>` : null}
      </div>
    ` : null}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
      ${(v.X.options || []).map((o) => html`
        <button onClick=${o.pick} style="min-height:64px;padding:12px 14px;border:1px solid ${o.border};border-radius:var(--radius-md);background:${o.bg};opacity:${o.op};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;transition:background .15s,border-color .15s" class="hv8">
          ${(o.showFa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:22px;direction:rtl;line-height:1.35">${o.fa}${digit(o.num, false)}</span>` : null}
          ${(o.showLat) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${o.lat}</span>` : null}
          ${(o.showEn) ? html`<span style="font-size:15px">${o.en}</span>` : null}
        </button>
      `)}
    </div>
  </div>
  ` : null}

  ${(v.X.isBuild) ? html`
  <div style="display:flex;flex-direction:column;gap:20px">
    <h2 style="font-size:26px;margin:0">Translate into Persian</h2>
    <div style="font-family:var(--font-heading);font-size:28px;font-weight:600">“${v.X.en}”</div>
    <div style="min-height:76px;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:12px 0;display:flex;flex-wrap:wrap;gap:8px;direction:rtl;align-items:center">
      ${(v.X.built || []).map((t) => html`
        <button onClick=${t.tap} style="direction:rtl;min-height:52px;padding:6px 14px;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-100);cursor:pointer;display:flex;flex-direction:column;align-items:center;animation:plup .18s ease"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.3">${t.fa}</span>${(v.show.lat) ? html`<span style="font-size:11px;font-style:italic;color:var(--color-neutral-700);direction:ltr">${t.lat}</span>` : null}</button>
      `)}
      ${(v.X.builtEmpty) ? html`<span style="font-size:13px;color:var(--color-neutral-600);direction:ltr;width:100%;text-align:right">Tap words below — they fill in right to left →</span>` : null}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;direction:rtl">
      ${(v.X.bank || []).map((t) => html`
        <button onClick=${t.tap} style="min-height:52px;padding:6px 14px;border:1px solid var(--color-divider);border-radius:var(--radius-md);background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;opacity:${t.op};visibility:${t.vis}" class="hv9"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.3">${t.fa}</span>${(v.show.lat) ? html`<span style="font-size:11px;font-style:italic;color:var(--color-neutral-700);direction:ltr">${t.lat}</span>` : null}</button>
      `)}
    </div>
  </div>
  ` : null}

  ${(v.X.isConvo) ? html`
  <div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div><h2 style="font-size:28px;margin:0">${v.X.title}</h2><p style="margin:4px 0 0;font-size:13px;font-style:italic;color:var(--color-neutral-700)">${v.X.setting}</p></div>
      <button class="btn btn-secondary" onClick=${v.X.toggleEn} style="min-height:40px;flex:none;font-size:13px">${v.X.enLabel}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--color-divider);padding-top:16px">
      ${(v.X.log || []).map((m) => html`
        <div style="display:flex;flex-direction:column;align-items:${m.align};gap:4px;animation:plup .2s ease">
          <span style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-neutral-600)">${m.name}</span>
          <button onClick=${m.play} style="max-width:85%;border:1px solid ${m.border};border-radius:var(--radius-lg);padding:10px 14px;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:${m.align};gap:2px;text-align:${m.ta}" class="hv10">
            ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:22px;direction:rtl;line-height:1.45">${m.fa}</span>` : null}
            ${(v.show.lat) ? html`<span style="font-size:13px;font-style:italic;color:var(--color-neutral-700)">${m.lat}</span>` : null}
            ${(v.X.showEn) ? html`<span style="font-size:13px">${m.en}</span>` : null}
          </button>
          ${(m.tip) ? html`<span style="max-width:85%;font-size:12px;line-height:1.5;color:var(--color-neutral-800);display:flex;gap:6px;text-align:left"><span style="color:var(--color-accent-700);flex:none">${v.ic.bulbSm}</span>${m.tip}</span>` : null}
        </div>
      `)}
    </div>
    ${(v.X.wrongMsg) ? html`<p style="margin:0;font-size:13px;line-height:1.55;display:flex;gap:8px;border-top:1px solid var(--color-text);padding-top:10px;animation:plup .2s ease"><span style="color:var(--color-accent-700);flex:none">${v.ic.bulbSm}</span><span><em>Not quite.</em> ${v.X.wrongMsg}</span></p>` : null}
    ${(v.X.awaiting) ? html`
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:6px">
        <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Your reply</span>
        ${(v.X.choices || []).map((o) => html`
          <button onClick=${o.pick} style="min-height:56px;padding:10px 14px;border:1px solid ${o.border};opacity:${o.op};border-radius:var(--radius-md);background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:flex-end;gap:2px;text-align:right" class="hv11">
            ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;line-height:1.45">${o.fa}</span>` : null}
            ${(v.show.lat) ? html`<span style="font-size:13px;font-style:italic;color:var(--color-neutral-700)">${o.lat}</span>` : null}
            ${(v.X.showEn) ? html`<span style="font-size:13px">${o.en}</span>` : null}
          </button>
        `)}
      </div>
    ` : null}
    ${(v.X.convoDone) ? html`<button class="btn btn-primary" onClick=${v.X.finishConvo} style="min-height:50px;font-size:16px;margin-top:8px">Finish conversation</button>` : null}
  </div>
  ` : null}

  ${(v.X.isSpeak) ? html`
  <div style="display:flex;flex-direction:column;gap:20px;align-items:center;text-align:center">
    <h2 style="font-size:26px;margin:0;align-self:flex-start">Listen, then say it aloud</h2>
    <div style="width:100%;border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:24px;display:flex;flex-direction:column;align-items:center;gap:6px">
      ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:44px;direction:rtl;line-height:1.4">${v.X.fa}${digit(v.X.num)}</span>` : null}
      ${(v.show.lat) ? html`<span style="font-style:italic;color:var(--color-neutral-700)">${v.X.lat}</span>` : null}
      <span style="font-size:14px;margin-top:4px">${v.X.en}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:420px">
      <button onClick=${v.X.play} style="min-height:96px;border:1px solid var(--color-divider);border-radius:var(--radius-md);background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--color-accent-700)" class="hv12">${v.ic.vol}<span style="font-size:13px;color:var(--color-text)">1 · Native speaker</span></button>
      <button onClick=${v.X.rec} style="min-height:96px;border:1px solid ${v.X.recBorder};border-radius:var(--radius-md);background:${v.X.recBg};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--color-accent-700)" class="hv13">${v.X.recIcon}<span style="font-size:13px;color:var(--color-text)">${v.X.recLabel}</span></button>
    </div>
    ${(v.X.recErr) ? html`<p role="alert" style="margin:0;max-width:420px;font-size:13px;line-height:1.5;color:var(--color-text);border-top:1px solid var(--color-text);padding-top:10px">${v.X.recErr}</p>` : null}
    ${(v.X.recDone) ? html`
      <div style="width:100%;max-width:420px;display:flex;flex-direction:column;gap:12px;animation:plup .2s ease">
        <button class="btn btn-secondary" onClick=${v.X.playMine} style="min-height:44px;gap:8px">${v.ic.play} Play my recording</button>
        <span style="font-size:13px;color:var(--color-neutral-700)">How close was it?</span>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${(v.X.selfRates || []).map((r) => html`<button class="btn btn-secondary" onClick=${r.go} style="min-height:48px">${r.label}</button>`)}
        </div>
      </div>
    ` : null}
    <p style="margin:0;font-size:12px;color:var(--color-neutral-700);max-width:420px;font-style:italic">Shadowing — copying a native speaker's rhythm immediately after them — trains your mouth and your ear at once.</p>
  </div>
  ` : null}

  ${(v.X.showBottomBar) ? html`
  <div style="position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--color-bg);border-top:1px solid var(--color-divider);padding:14px 20px;padding-bottom:max(14px, env(safe-area-inset-bottom))">
    <div style="max-width:680px;margin:0 auto;display:flex;gap:10px;padding-left:${v.railOffset}">
      ${(v.X.barBtns || []).map((b) => html`
        <button class="btn ${b.cls}" onClick=${b.go} disabled=${b.disabled} style="flex:1;min-height:50px;font-size:16px;display:flex;flex-direction:column;gap:0"><span>${b.label}</span>${(b.sub) ? html`<span style="font-family:var(--font-body);font-size:10px;font-weight:400;color:var(--color-neutral-600);display:flex;align-items:center;gap:3px">${v.ic.refresh}${b.sub}</span>` : null}</button>
      `)}
    </div>
  </div>
  ` : null}

  ${(v.X.hasFeedback) ? html`
  <div style="position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--color-bg);border-top:2px solid ${v.X.fbColor};box-shadow:var(--shadow-lg);padding:18px 20px;padding-bottom:max(18px, env(safe-area-inset-bottom));animation:plup .22s ease">
    <div style="max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:10px;padding-left:${v.railOffset}">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:30px;height:30px;border-radius:50%;border:1px solid ${v.X.fbColor};color:${v.X.fbColor};display:flex;align-items:center;justify-content:center">${v.X.fbIcon}</span>
        <span style="font-family:var(--font-heading);font-size:24px;font-weight:600">${v.X.fbTitle}</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
        ${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:22px;direction:rtl">${v.X.fbFa}${digit(v.X.fbNum)}</span>` : null}
        ${(v.show.lat) ? html`<span style="font-style:italic;font-size:14px;color:var(--color-neutral-700)">${v.X.fbLat}</span>` : null}
        <span style="font-size:14px">— ${v.X.fbEn}</span>
      </div>
      ${(v.X.fbTip) ? html`<p style="margin:0;font-size:13px;line-height:1.55;color:var(--color-neutral-800);display:flex;gap:8px"><span style="color:var(--color-accent-700);flex:none">${v.ic.bulbSm}</span><span>${v.X.fbTip}</span></p>` : null}
      <button class="btn btn-primary" onClick=${v.X.cont} style="min-height:50px;font-size:16px;margin-top:4px">Continue</button>
    </div>
  </div>
  ` : null}
</div>
` : null}


${(v.is.path) ? html`
<div style="display:flex;flex-direction:column;gap:24px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <span style="display:flex;align-items:baseline;gap:8px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">برنامه</span>${say('برنامه')}</span><span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">The plan</span></span>
  </div>
  <header style="display:flex;flex-direction:column;gap:8px;border-bottom:1px solid var(--color-divider);padding-bottom:18px">
    <h1 style="font-size:42px;font-weight:400;margin:0;line-height:1.05">From zero to fluent</h1>
    <p style="margin:0;font-size:15px;line-height:1.65;text-align:justify;hyphens:auto">Five stages take you from your first letter to real conversations with native speakers. Each stage ends with a conversation checkpoint — a short, unscripted-feeling exchange that tests whether you can actually use what you've learned.</p>
  </header>
  <section style="display:flex;flex-direction:column;gap:6px">
    <h3 style="font-size:21px;margin:0">How every chapter works</h3>
    ${(v.loop || []).map((s) => html`
      <div style="display:grid;grid-template-columns:28px 110px minmax(0,1fr);gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--color-divider)">
        <span style="font-family:'Noto Naskh Arabic',serif;font-size:17px;color:var(--color-accent-700)">${s.nFa}</span>
        <span style="font-family:var(--font-heading);font-size:18px;font-weight:600">${s.step}</span>
        <span style="font-size:13px;color:var(--color-neutral-800)">${s.desc}</span>
      </div>
    `)}
  </section>
  ${(v.plan || []).map((p) => html`
    <section style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;border-top:1px solid var(--color-text);padding-top:18px">
      <span style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:32px;line-height:1.2;color:var(--color-accent-700)">${p.nFa}</span><span style="font-size:10px;color:var(--color-neutral-700);font-feature-settings:'tnum';text-align:center">${p.level}</span></span>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
        <span style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><span style="font-family:var(--font-heading);font-size:26px;font-weight:600;line-height:1.1">${p.name}</span><span style="font-size:11px;color:${p.statusColor};font-feature-settings:'tnum'">${p.weeks} · ${p.status}</span></span>
        <p style="margin:0;font-size:14px;line-height:1.6;text-align:justify;hyphens:auto">${p.goal}</p>
        <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:3px;font-size:13px;line-height:1.5;color:var(--color-neutral-800)">${(p.cando || []).map((c) => html`<li>${c}</li>`)}</ul>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${(p.items || []).map((i) => html`<span style="font-size:11px;border:1px solid var(--color-divider);border-radius:999px;padding:3px 10px">${i}</span>`)}</div>
        <button onClick=${p.cpOpen} style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid ${p.cpBorder};border-radius:var(--radius-md);background:transparent;cursor:${p.cpCursor};text-align:left;min-height:56px" class="hv14">
          <span style="color:var(--color-accent-700);display:flex">${v.ic.chat}</span>
          <span style="flex:1;display:flex;flex-direction:column"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Checkpoint · conversation</span><span style="font-family:var(--font-heading);font-size:18px;font-weight:600">${p.cpTitle}</span><span style="font-size:12px;color:var(--color-neutral-700)">${p.cpDesc}</span></span>
          <span style="color:var(--color-neutral-600);display:flex">${p.cpIcon}</span>
        </button>
      </div>
    </section>
  `)}
</div>
` : null}


${(v.is.results) ? html`
<div style="display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center;padding-top:32px;animation:plfade .3s ease">
  <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-accent-700)">${v.R.kicker}</span>
  <span style="font-family:'Noto Naskh Arabic',serif;font-size:76px;line-height:1.3;color:var(--color-accent-700)">${v.R.fa}</span>
  <div style="display:flex;flex-direction:column;gap:4px"><span style="font-style:italic;color:var(--color-neutral-700)">${v.R.lat}</span><h1 style="font-size:36px;font-weight:400;margin:0">${v.R.en}</h1></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);width:100%;max-width:420px;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider)">
    ${(v.R.stats || []).map((s) => html`
      <div style="padding:16px 8px;display:flex;flex-direction:column;gap:2px;border-left:${s.bl}"><span style="font-family:var(--font-heading);font-size:32px;font-feature-settings:'tnum'">${s.v}</span><span style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-neutral-700)">${s.l}</span></div>
    `)}
  </div>
  ${(v.R.hasMissed) ? html`
  <div style="width:100%;max-width:420px;text-align:left;display:flex;flex-direction:column">
    <h3 style="font-size:20px;margin:0 0 4px">Words to revisit</h3>
    ${(v.R.missed || []).map((w) => html`
      <div data-revisit style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-divider);gap:12px">
        <span style="font-size:14px;min-width:0">${w.en}</span>
        <span style="display:flex;align-items:center;gap:10px"><span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.4;direction:rtl">${w.fa}${digit(w.num)}</span>${(v.show.lat) ? html`<span data-lat style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${w.lat}</span>` : null}</span><button onClick=${w.play} aria-label="Play" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button></span>
      </div>
    `)}
    <p style="margin:8px 0 0;font-size:12px;color:var(--color-neutral-700)">Added to your mistake notebook and your next review.</p>
  </div>
  ` : null}
  <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:420px">
    <button class="btn btn-primary" onClick=${v.R.primary} style="min-height:50px;font-size:16px">${v.R.primaryLabel}</button>
    <button class="btn btn-secondary" onClick=${v.R.again} style="min-height:50px;font-size:16px">Practice again</button>
  </div>
</div>
` : null}


${(v.is.review) ? html`
<div style="display:flex;flex-direction:column;gap:26px;animation:plfade .25s ease">
  <section style="display:flex;flex-direction:column;gap:6px">
    <h1 style="font-size:40px;font-weight:400;margin:0">Review</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:var(--color-neutral-700);text-align:justify;hyphens:auto">Each word lives in one of five boxes. Remember it and it moves right — you'll see it less often. Forget it and it goes back to the start.</p>
  </section>
  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:18px;display:flex;flex-direction:column;gap:16px">
    <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;align-items:end;height:120px">
      ${(v.boxes || []).map((b) => html`
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">
          <span style="font-size:12px;font-feature-settings:'tnum'">${b.count}</span>
          <div style="width:100%;height:${b.h};border:1px solid var(--color-accent);border-bottom:0;background:${b.bg}"></div>
        </div>
      `)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;border-top:1px solid var(--color-text);padding-top:6px">
      ${(v.boxes || []).map((b) => html`<span style="font-size:10px;text-align:center;color:var(--color-neutral-700)">${b.label}</span>`)}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--color-divider);padding-top:14px">
      <span style="font-size:14px"><span style="font-family:var(--font-heading);font-size:26px;font-feature-settings:'tnum'">${v.dueCount}</span> due now${v.dueCount ? ` · about ${v.dueMins} min` : ''}</span>
      <button class="btn btn-primary" onClick=${v.startReview} disabled=${v.reviewEmpty} style="min-height:44px;padding-inline:20px">Begin review</button>
      ${(v.reviewEmpty) ? html`<p style="margin:0;flex-basis:100%;font-size:13px;color:var(--color-neutral-700)">Nothing to review right now. <button onClick=${v.openNextLesson} style="background:none;border:0;padding:0;color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px;cursor:pointer">Start a lesson</button> to add new words.</p>` : null}
    </div>
  </section>
  <section style="display:flex;align-items:center;gap:14px;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:14px 0">
      <button onClick=${v.openMy} style="flex:1;display:flex;align-items:center;gap:12px;border:0;background:transparent;cursor:pointer;text-align:left;min-height:52px;padding:0">
        <span style="color:var(--color-accent-700)">${v.ic.pen}</span>
        <span style="display:flex;flex-direction:column"><span style="display:flex;align-items:baseline;gap:8px"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">My words</span><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">واژه‌های من</span>${say('واژه‌های من')}</span></span><span style="font-size:12px;color:var(--color-neutral-700)">${v.myCountLabel} added by you</span></span>
      </button>
      <button class="btn btn-secondary" onClick=${v.addWord} style="min-height:44px;gap:6px">${v.ic.plus} Add</button>
    </section>
  <section style="display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:baseline;direction:rtl"><span style="display:flex;align-items:baseline;gap:10px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">دفتر اشتباه‌ها</span>${say('دفتر اشتباه‌ها')}</span><h2 style="font-size:24px;margin:0">Mistake notebook</h2></span>${(v.hasMistakes) ? html`<button class="btn btn-ghost" onClick=${v.drillMistakes} style="min-height:44px">Drill these</button>` : null}</div>
    ${(v.noMistakes) ? html`<p style="margin:8px 0 0;font-size:14px;color:var(--color-neutral-700);font-style:italic">Words you miss in practice will collect here.</p>` : null}
    ${(v.mistakeList || []).map((w) => html`
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto 44px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-divider)">
        <span style="display:flex;flex-direction:column"><span style="font-size:14px">${w.en}</span><span style="font-size:11px;color:var(--color-neutral-600)">${w.lesson}</span></span>
        <span style="display:flex;flex-direction:column;align-items:flex-end">${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.4;direction:rtl">${w.fa}${digit(w.num)}</span>` : null}${(v.show.lat) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${w.lat}</span>` : null}</span>
        <button onClick=${w.play} aria-label="Play" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
      </div>
    `)}
  </section>
</div>
` : null}


${(v.is.script) ? html`
<div style="display:flex;flex-direction:column;gap:22px;animation:plfade .25s ease">
  <section style="display:flex;flex-direction:column;gap:6px">
    <h1 style="font-size:40px;font-weight:400;margin:0">The alphabet</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:var(--color-neutral-700);text-align:justify;hyphens:auto">Thirty-two letters, written right to left. Most letters change shape depending on where they sit in a word — learn the four forms and reading opens up.</p>
  </section>
  <section id="vowels" style="display:flex;flex-direction:column;gap:10px;scroll-margin-top:72px">
    <div style="display:flex;align-items:baseline;gap:10px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">واکه‌ها</span>${say('واکه‌ها')}</span><h2 style="font-size:28px;margin:0">Vowels</h2></div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:var(--color-neutral-700)">Persian has six vowels. The three long ones are always written as letters; the three short ones usually aren't written at all.</p>
    <div style="display:flex;flex-direction:column">
      ${(v.vowels || []).map((vw) => html`
        <div style="display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-divider)">
          <span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${vw.kind}</span><span style="font-family:var(--font-heading);font-size:22px;font-weight:600;line-height:1.1">${vw.lat}</span></span>
          <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="display:flex;align-items:baseline;gap:8px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:26px;line-height:1.3;color:var(--color-accent-700)">${vw.mark}</span>${(vw.name) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${vw.name} · usually unwritten</span>` : null}</span><span style="font-size:13px;line-height:1.4">Like ${vw.like}</span></span>
          <button onClick=${vw.play} aria-label=${'Play ' + vw.wlat} style="display:flex;align-items:center;gap:8px;border:1px solid ${vw.playing ? 'var(--color-accent)' : 'var(--color-divider)'};border-radius:var(--radius-md);background:transparent;cursor:pointer;padding:6px 10px;min-height:44px">
            <span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;line-height:1.3">${vw.fa}</span><span style="font-size:11px;font-style:italic;color:var(--color-neutral-700)">${vw.wlat} · ${vw.en}</span></span>
            <span style="color:var(--color-accent-700);display:flex">${v.ic.volSm}</span>
          </button>
        </div>`)}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;padding-top:4px">
      ${(v.vowelNotes || []).map((n) => html`<p style="margin:0;font-size:14px;line-height:1.6"><strong style="font-weight:600">${faRuns(n.h)}.</strong> ${faRuns(n.p)}</p>`)}
    </div>
  </section>
  <div style="display:flex;gap:6px;overflow-x:auto;margin:0 -20px;padding:0 20px 4px">
    ${(v.letterFilters || []).map((f) => html`
      <button onClick=${f.go} style="flex:none;min-height:40px;padding:6px 14px;border:1px solid ${f.border};color:${f.color};background:transparent;border-radius:999px;cursor:pointer;font-size:13px;white-space:nowrap">${f.label}</button>
    `)}
  </div>
  ${(v.letterFilterNote) ? html`<p style="margin:0;font-size:13px;line-height:1.55;font-style:italic;color:var(--color-neutral-800);border-left:0;border-top:1px solid var(--color-divider);padding-top:10px">${v.letterFilterNote}</p>` : null}
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px;direction:rtl">
    ${(v.letters || []).map((l) => html`
      <button onClick=${l.open} style="aspect-ratio:1/1.1;border:1px solid ${l.border};border-radius:var(--radius-md);background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;position:relative" class="hv15">
        <span style="font-family:'Noto Naskh Arabic',serif;font-size:32px;line-height:1.4">${l.ch}</span>
        <span style="font-size:11px;color:var(--color-neutral-700);direction:ltr">${l.name}</span>
        ${(l.persianOnly) ? html`<span style="position:absolute;top:6px;left:6px;width:5px;height:5px;border-radius:50%;background:var(--color-accent)"></span>` : null}
      </button>
    `)}
  </div>
  <p style="margin:0;font-size:12px;color:var(--color-neutral-700);display:flex;align-items:center;gap:8px"><span style="width:5px;height:5px;border-radius:50%;background:var(--color-accent)"></span>Letters Persian added to the Arabic alphabet</p>
</div>
` : null}

${(v.is.letter) ? html`
<div style="display:flex;flex-direction:column;gap:24px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700);font-feature-settings:'tnum'">Letter ${v.LT.n} of 32</span>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;border-bottom:1px solid var(--color-divider);padding-bottom:20px">
    <span style="font-family:'Noto Naskh Arabic',serif;font-size:120px;line-height:1.3">${v.LT.ch}</span>
    <h1 style="font-size:34px;font-weight:400;margin:0">${v.LT.name}</h1>
    <span style="font-size:14px;color:var(--color-neutral-700)">Sounds like <em>${v.LT.sound}</em></span>
  </div>
  <section style="display:flex;flex-direction:column;gap:10px">
    <h3 style="font-size:20px;margin:0">Four forms</h3>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--color-divider);border-radius:var(--radius-md);direction:rtl">
      ${(v.LT.forms || []).map((f) => html`
        <div style="display:flex;flex-direction:column;align-items:center;padding:14px 4px;border-right:${f.br}">
          <span style="font-family:'Noto Naskh Arabic',serif;font-size:40px;line-height:1.5;color:${f.color}">${f.ch}</span>
          <span style="font-size:11px;color:var(--color-neutral-700);direction:ltr">${f.label}</span>
        </div>
      `)}
    </div>
    <p style="margin:0;font-size:13px;line-height:1.55;color:var(--color-neutral-800)">${v.LT.connectNote}</p>
  </section>
  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:16px;display:flex;align-items:center;gap:14px">
    <button onClick=${v.LT.play} aria-label="Play" style="width:44px;height:44px;flex:none;border-radius:50%;border:1px solid var(--color-accent);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
    <span style="flex:1;display:flex;flex-direction:column"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">In a word</span><span style="font-size:14px"><em>${v.LT.exLat}</em> — ${v.LT.exEn}</span></span>
    <span style="font-family:'Noto Naskh Arabic',serif;font-size:32px">${v.LT.ex}</span>
  </section>
  ${(v.LT.groupNote) ? html`<p style="margin:0;font-size:13px;line-height:1.55;font-style:italic;color:var(--color-neutral-800);display:flex;gap:8px"><span style="color:var(--color-accent-700);flex:none;font-style:normal">${v.ic.bulbSm}</span>${v.LT.groupNote}</p>` : null}
  <div style="display:flex;justify-content:space-between;gap:10px;border-top:1px solid var(--color-divider);padding-top:16px">
    <button class="btn btn-secondary" onClick=${v.LT.prev} disabled=${v.LT.isFirst} style="min-height:44px">← ${v.LT.prevName}</button>
    <button class="btn btn-secondary" onClick=${v.LT.next} disabled=${v.LT.isLast} style="min-height:44px">${v.LT.nextName} →</button>
  </div>
</div>
` : null}


${(v.is.explore) ? html`
<div style="display:flex;flex-direction:column;gap:18px;animation:plfade .25s ease">
  <section style="display:flex;flex-direction:column;gap:6px">
    <h1 style="font-size:40px;font-weight:400;margin:0">Explore</h1>
    <p style="margin:0;font-size:14px;color:var(--color-neutral-700)">History, geography, and culture — the world behind the words.</p>
  </section>
  ${(v.articles || []).map((a) => html`
    <button onClick=${a.open} style="display:grid;grid-template-columns:minmax(0,1fr) 72px;gap:16px;align-items:center;padding:18px 0;border:0;border-top:1px solid var(--color-divider);background:transparent;text-align:left;cursor:pointer" class="hv16">
      <span style="display:flex;flex-direction:column;gap:5px;min-width:0">
        <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${a.category} · ${a.readTime}</span>
        <span style="font-family:var(--font-heading);font-size:23px;font-weight:600;line-height:1.15">${a.title}</span>
        <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">${a.preview}</span>
      </span>
      <span style="height:72px;border:1px solid var(--color-divider);outline:4px solid var(--color-surface);outline-offset:-5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${a.fa}${say(a.fa, 10)}</span>
    </button>
  `)}
</div>
` : null}

${(v.is.grammar) ? html`
<article style="display:flex;flex-direction:column;gap:18px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Grammar · ${v.registerLabel}</span>
  </div>
  <header style="display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--color-divider);padding-bottom:18px">
    <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:28px;color:var(--color-accent-700)">${v.G.fa}</span>${say(v.G.fa)}</span>
    <h1 style="font-size:40px;font-weight:400;margin:0;line-height:1.05">${v.G.title}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6">${faRuns(v.G.intro)}</p>
  </header>
  ${(v.G.endings.length) ? html`
  <section style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
    ${v.G.endings.map((e) => html`<div style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:10px;display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:11px;color:var(--color-neutral-700)">${e.who}</span><span style="font-family:var(--font-heading);font-size:22px;font-weight:600">${e.end}</span></div>`)}
  </section>` : null}
  ${v.G.sections.map((sec) => html`
  <section style="display:flex;flex-direction:column;gap:8px">
    <h2 style="font-size:24px;margin:0">${sec.h}</h2>
    <p style="margin:0;font-size:15px;line-height:1.65">${faRuns(sec.p)}</p>
    ${sec.ex.map((x) => html`<div style="display:flex;flex-direction:column;align-items:flex-end;padding:8px 12px;border-right:2px solid var(--color-accent)"><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;line-height:1.5">${x.fa}</span><span style="font-size:13px;font-style:italic;color:var(--color-neutral-700)">${x.lat}</span><span style="font-size:13px">${x.en}</span></div>`)}
    ${sec.tables.map((t) => html`
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><span style="font-family:var(--font-heading);font-size:20px;font-weight:600">${t.inf} <span style="font-weight:400;font-size:15px;color:var(--color-neutral-700)">— ${t.en}</span></span><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${t.infFa}</span></div>
        ${verbTable(t)}
      </div>`)}
  </section>`)}
  ${(v.G.verbs.length) ? html`<section style="display:flex;flex-direction:column;gap:22px">
    <h2 style="font-size:24px;margin:0">Every lesson's verb</h2>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${v.G.verbBtns.map((b) => html`<button onClick=${b.pick} style="min-height:40px;padding:6px 14px;border:1px solid ${b.border};color:${b.color};background:${b.bg};border-radius:999px;cursor:pointer;font-size:13px;white-space:nowrap">${b.label}</button>`)}
    </div>
    ${((t) => html`
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><span style="display:flex;flex-direction:column"><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${t.lesson}</span><span style="font-family:var(--font-heading);font-size:20px;font-weight:600">${t.inf} <span style="font-weight:400;font-size:15px;color:var(--color-neutral-700)">— ${t.en}</span></span></span><span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;color:var(--color-accent-700)">${t.infFa}</span></div>
        ${verbTable(t)}
        ${verbNotes(t)}
      </div>`)(v.G.verb)}
  </section>` : null}
</article>
` : null}

${(v.is.article) ? html`
<article style="display:flex;flex-direction:column;gap:18px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">${v.A.category} · ${v.A.readTime}</span>
  </div>
  <header style="display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--color-divider);padding-bottom:18px">
    <span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:28px;color:var(--color-accent-700)">${v.A.fa}</span>${say(v.A.fa)}</span>
    <h1 style="font-size:42px;font-weight:400;margin:0;line-height:1.05">${v.A.title}</h1>
    <p style="margin:0;font-style:italic;color:var(--color-neutral-700)">${v.A.subtitle}</p>
  </header>
  ${(v.A.noBody) ? html`<p style="margin:0;font-size:15px;line-height:1.7;text-align:justify">${v.A.preview}</p>` : null}
  ${(v.A.sections || []).map((s) => html`
    <section style="display:flex;flex-direction:column;gap:8px">
      <h3 style="font-size:23px;margin:8px 0 0">${s.h}</h3>
      ${(s.p || []).map((para) => html`<p style="margin:0;font-size:15px;line-height:1.7;text-align:justify;hyphens:auto">${para}</p>`)}
      ${(s.list) ? html`<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px;font-size:15px;line-height:1.6">${(s.list || []).map((li) => html`<li>${li}</li>`)}</ul>` : null}
      ${(s.after) ? html`<p style="margin:0;font-size:15px;line-height:1.7;text-align:justify;hyphens:auto">${s.after}</p>` : null}
    </section>
  `)}
  ${(v.A.rich || []).map((s) => richSection(s, v))}
</article>
` : null}


${(v.is.mywords) ? html`
<div style="display:flex;flex-direction:column;gap:20px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <button class="btn btn-primary" onClick=${v.addWord} style="min-height:44px;gap:6px">${v.ic.plus} Add a word</button>
  </div>
  <header style="display:flex;flex-direction:column;gap:6px;border-bottom:1px solid var(--color-divider);padding-bottom:16px">
    <span style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:24px;color:var(--color-accent-700)">واژه‌های من</span>${say('واژه‌های من')}</span><h1 style="font-size:40px;font-weight:400;margin:0;line-height:1.05">My words</h1></span>
    <p style="margin:0;font-size:14px;line-height:1.6;color:var(--color-neutral-700);text-align:justify;hyphens:auto">Words you pick up from friends, films and menus. Each one joins your spaced review, so it sticks like the rest.</p>
  </header>
  ${(v.noMy) ? html`
    <div style="border:1px dashed var(--color-neutral-400);border-radius:var(--radius-md);padding:32px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
      <span style="font-family:'Noto Naskh Arabic',serif;font-size:36px;color:var(--color-accent-700);line-height:1.3">پروانه</span>
      <span style="font-style:italic;font-size:13px;color:var(--color-neutral-700)">parvaane · butterfly</span>
      <p style="margin:0;font-size:14px;line-height:1.55;max-width:320px">Heard a new word? Write it the way it sounds — we'll write it in Persian for you.</p>
      <button class="btn btn-primary" onClick=${v.addWord} style="min-height:44px;gap:6px;margin-top:4px">${v.ic.plus} Add your first word</button>
    </div>
  ` : null}
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
    ${(v.myWords || []).map((w) => html`
      <div role="button" tabindex="0" onClick=${w.open} style="border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;cursor:pointer;display:flex;flex-direction:column;position:relative" class="hv18">
        <div style="aspect-ratio:4/3;background:var(--color-surface);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--color-divider)">
          ${(w.hasImg) ? html`<div role="img" aria-label=${w.en} style="width:100%;height:100%;background-image:${w.bgImg};background-size:cover;background-position:center;filter:sepia(.12) saturate(.9)"></div>` : null}
          ${(w.noImg) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:30px;color:var(--color-accent-700);direction:rtl">${w.fa}</span>` : null}
        </div>
        <div style="padding:10px 12px;display:flex;flex-direction:column;gap:1px">
          <span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;direction:rtl;text-align:right;line-height:1.4">${w.fa}</span>
          <span style="font-size:12px;font-style:italic;color:var(--color-neutral-700);text-align:right">${w.lat}</span>
          <span style="font-size:14px">${w.en}</span>
        </div>
        <button onClick=${w.play} aria-label="Play" style="position:absolute;top:8px;left:8px;width:36px;height:36px;border-radius:50%;border:1px solid var(--color-divider);background:var(--color-bg);color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
      </div>
    `)}
  </div>
</div>
` : null}

${(v.is.addword) ? html`
<div style="display:flex;flex-direction:column;gap:22px;animation:plfade .25s ease;padding-bottom:24px">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <span style="display:flex;align-items:baseline;gap:8px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">واژهٔ تازه</span>${say('واژهٔ تازه')}</span><span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">My words</span></span>
  </div>
  <h1 style="font-size:40px;font-weight:400;margin:0;line-height:1.05">${v.W.title}</h1>

  <div class="field" style="display:flex;flex-direction:column;gap:6px">
    <label style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px">Meaning</span><span style="font-size:12px;color:var(--color-neutral-700)">In your own language</span></label>
    <input class="input" value=${v.W.en} onInput=${v.W.setEn} placeholder="e.g. butterfly" style="min-height:48px;font-size:16px" />
  </div>
  <div class="field" style="display:flex;flex-direction:column;gap:6px">
    <label style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px">How it sounds</span><span style="font-size:12px;color:var(--color-neutral-700)">Spell it the way you hear it, in your own alphabet</span></label>
    <input class="input" value=${v.W.lat} onInput=${v.W.setLat} placeholder="e.g. parvone" autocapitalize="off" autocomplete="off" spellcheck="false" style="min-height:48px;font-size:16px;font-style:italic" />
  </div>

  <section style="border:1px solid var(--color-accent);border-radius:var(--radius-md);padding:14px 16px;display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;direction:rtl">
      <span style="display:flex;align-items:baseline;gap:8px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:15px;color:var(--color-accent-700)">خط فارسی</span>${say('خط فارسی')}</span><span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)">Persian script</span></span>
      <span style="display:flex;gap:4px;direction:ltr">
        <button onClick=${v.W.listen} aria-label="Listen" disabled=${v.W.noFa} style="width:40px;height:40px;border-radius:50%;border:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
        <button class="btn btn-ghost" onClick=${v.W.regen} disabled=${v.W.noLat} style="min-height:40px;gap:6px;font-size:13px">${v.ic.wand} Auto-fill</button>
      </span>
    </div>
    <input value=${v.W.fa} onInput=${v.W.setFa} dir="rtl" lang="fa" placeholder="…" style="border:0;border-bottom:1px solid var(--color-divider);background:transparent;font-family:'Noto Naskh Arabic',serif;font-size:36px;line-height:1.5;padding:4px 0;color:var(--color-text);outline:none;width:100%;box-sizing:border-box" />
    <span style="font-size:12px;color:var(--color-neutral-700);font-style:italic">${v.W.srcNote}</span>
  </section>

  <section style="display:flex;flex-direction:column;gap:10px">
    <span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px">Picture <span style="color:var(--color-neutral-600)">· optional</span></span><span style="font-size:12px;color:var(--color-neutral-700)">A picture ties the word to the thing itself — not to its translation.</span></span>
    <div style="display:flex;border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;align-self:flex-start">
      ${(v.W.modes || []).map((o) => html`<button onClick=${o.go} style="min-height:40px;padding:6px 16px;border:0;border-left:${o.bl};background:transparent;box-shadow:${o.shadow};color:${o.color};cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px">${o.label}</button>`)}
    </div>
    ${(v.W.isDraw) ? html`
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="border:1px solid var(--color-divider);outline:6px solid var(--color-surface);outline-offset:-7px;border-radius:var(--radius-md);overflow:hidden;padding:6px;background:var(--color-surface)">
          <canvas ref=${v.cvRef} width="480" height="320" onPointerDown=${v.drawStart} onPointerMove=${v.drawMove} onPointerUp=${v.drawEnd} onPointerCancel=${v.drawEnd} onPointerLeave=${v.drawEnd} style="width:100%;aspect-ratio:3/2;display:block;touch-action:none;cursor:crosshair;border-radius:2px"></canvas>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;color:var(--color-neutral-700);font-style:italic">Draw it with your finger — rough is fine.</span><button class="btn btn-ghost" onClick=${v.W.clearDraw} style="min-height:40px;gap:6px;font-size:13px">${v.ic.trash} Clear</button></div>
      </div>
    ` : null}
    ${(v.W.isPhoto) ? html`
      ${(v.W.hasPhoto) ? html`
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="border:1px solid var(--color-divider);outline:6px solid var(--color-surface);outline-offset:-7px;padding:6px;background:var(--color-surface);border-radius:var(--radius-md)"><div style="width:100%;aspect-ratio:3/2;background-image:${v.W.bgImg};background-size:cover;background-position:center;filter:sepia(.12) saturate(.9)"></div></div>
          <div style="display:flex;justify-content:flex-end;gap:6px">
            <label class="btn btn-ghost" style="min-height:40px;font-size:13px;cursor:pointer;display:flex;align-items:center">Replace<input type="file" accept="image/*" onChange=${v.W.onPhoto} style="display:none" /></label>
            <button class="btn btn-ghost" onClick=${v.W.removePhoto} style="min-height:40px;gap:6px;font-size:13px">${v.ic.trash} Remove</button>
          </div>
        </div>
      ` : null}
      ${(v.W.noPhoto) ? html`
        <label style="border:1px dashed var(--color-neutral-400);border-radius:var(--radius-md);aspect-ratio:3/2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:var(--color-accent-700)" class="hv19">
          ${v.ic.imageIc}<span style="font-size:14px;color:var(--color-text)">Take or choose a photo</span>
          <input type="file" accept="image/*" onChange=${v.W.onPhoto} style="display:none" />
        </label>
      ` : null}
    ` : null}
  </section>

  <div style="display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--color-divider);padding-top:18px">
    <button class="btn btn-primary" onClick=${v.W.save} disabled=${v.W.cannotSave} style="min-height:50px;font-size:16px">${v.W.saveLabel}</button>
    ${(v.W.isEdit) ? html`<button class="btn btn-secondary" onClick=${v.W.del} style="min-height:50px;font-size:16px;gap:6px">${v.ic.trash} Delete word</button>` : null}
    <p style="margin:0;font-size:12px;color:var(--color-neutral-700);text-align:center">New words join today's review.</p>
  </div>
</div>
` : null}

${(v.is.map) ? html`
<div style="display:flex;flex-direction:column;gap:14px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;gap:8px">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <h1 style="font-size:30px;font-weight:400;margin:0;line-height:1.1">${v.M.heading}</h1>
  </div>
  ${(v.M.offline) ? html`<p role="status" style="margin:0;font-size:13px;line-height:1.55;display:flex;gap:8px;border-top:1px solid var(--color-text);padding-top:10px"><span style="color:var(--color-accent-700);flex:none">${v.ic.bulbSm}</span><span><em>You're offline.</em> Only parts of the map you've viewed before will show; the markers all work.</span></p>` : null}
  <div id="pl-map" class="plate" style="height:min(70vh,560px);width:100%"></div>
  ${(v.M.note) ? html`<p class="rich" style="margin:0;font-size:13px;line-height:1.55;font-style:italic;color:var(--color-neutral-800)" dangerouslySetInnerHTML=${{ __html: v.M.note }}></p>` : null}
</div>
` : null}


${(v.is.profile) ? html`
<div style="display:flex;flex-direction:column;gap:26px;animation:plfade .25s ease">
  ${(v.isGuest) ? html`
  <section style="border:1px solid var(--color-accent);border-radius:var(--radius-md);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
    <span style="display:flex;flex-direction:column"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Save progress across devices</span><span style="font-size:12px;color:var(--color-neutral-700)">You're currently in guest mode</span></span>
    <button class="btn btn-primary" onClick=${v.openAuth} style="min-height:44px;padding-inline:20px">Sign in</button>
  </section>
  ` : html`
  <section style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
    <span style="display:flex;flex-direction:column;min-width:0"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Signed in</span><span style="font-size:12px;color:var(--color-neutral-700);overflow-wrap:anywhere">${v.userEmail} · progress syncs to your account</span></span>
    <button class="btn btn-secondary" onClick=${v.openSignOut} style="min-height:44px;padding-inline:20px">Sign out</button>
  </section>
  `}
  <section style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider)">
    ${(v.pStats || []).map((s) => html`
      <div style="padding:14px 6px;display:flex;flex-direction:column;align-items:center;gap:2px;border-left:${s.bl}"><span style="font-family:var(--font-heading);font-size:28px;font-feature-settings:'tnum'">${s.v}</span><span style="font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-neutral-700);text-align:center">${s.l}</span></div>
    `)}
  </section>
  <section style="display:flex;flex-direction:column;gap:0">
    <div style="display:flex;align-items:baseline;gap:10px;direction:rtl;margin-bottom:6px"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">تنظیمات</span>${say('تنظیمات')}</span><h2 style="font-size:24px;margin:0">Learning preferences</h2></div>
    ${(v.prefs || []).map((p) => html`
      <div style="display:flex;flex-direction:column;gap:8px;padding:14px 0;border-bottom:1px solid var(--color-divider)">
        <span style="display:flex;flex-direction:column"><span style="font-size:14px">${p.label}</span><span style="font-size:12px;color:var(--color-neutral-700)">${p.hint}</span></span>
        <div style="display:flex;border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden;align-self:flex-start">
          ${(p.opts || []).map((o) => html`<button onClick=${o.go} style="min-height:40px;padding:6px 14px;border:0;border-left:${o.bl};background:transparent;box-shadow:${o.shadow};color:${o.color};cursor:pointer;font-size:13px">${o.label}</button>`)}
        </div>
      </div>
    `)}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--color-divider)">
      <span style="display:flex;flex-direction:column"><span style="font-size:14px">Show mature chapter</span><span style="font-size:12px;color:var(--color-neutral-700)">Slang & adult words</span></span>
      <button onClick=${v.toggleMature} role="switch" aria-label="Show mature chapter" style="width:48px;height:28px;border-radius:999px;border:1px solid ${v.matureBorder};background:transparent;position:relative;cursor:pointer;flex:none"><span style="position:absolute;top:3px;left:${v.matureKnob};width:20px;height:20px;border-radius:50%;background:${v.matureBorder};transition:left .15s"></span></button>
    </div>
  </section>
  <section style="display:flex;flex-direction:column">
    <button onClick=${v.openMy} style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border:0;border-top:1px solid var(--color-divider);background:transparent;cursor:pointer;text-align:left;min-height:60px">
          <span style="display:flex;align-items:center;gap:12px"><span style="color:var(--color-accent-700)">${v.ic.pen}</span><span style="display:flex;flex-direction:column"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">My words</span><span style="font-size:12px;color:var(--color-neutral-700)">${v.myCountLabel} you've added — with drawings and photos</span></span></span>
          <span style="color:var(--color-neutral-500)">${v.ic.chev}</span>
        </button>
    <button onClick=${v.openWords} style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border:0;border-top:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);background:transparent;cursor:pointer;text-align:left;min-height:60px">
      <span style="display:flex;align-items:center;gap:12px"><span style="color:var(--color-accent-700)">${v.ic.book}</span><span style="display:flex;flex-direction:column"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Word collection</span><span style="font-size:12px;color:var(--color-neutral-700)">${v.learnedCount} words learned</span></span></span>
      <span style="color:var(--color-neutral-500)">${v.ic.chev}</span>
    </button>
    <button onClick=${v.openInstall} style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border:0;border-bottom:1px solid var(--color-divider);background:transparent;cursor:pointer;text-align:left;min-height:60px">
      <span style="display:flex;align-items:center;gap:12px"><span style="color:var(--color-accent-700)">${v.ic.download}</span><span style="display:flex;flex-direction:column"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Install the app</span><span style="font-size:12px;color:var(--color-neutral-700)">Works offline, with lessons and audio cached</span></span></span>
      <span style="color:var(--color-neutral-500)">${v.ic.chev}</span>
    </button>
    <button onClick=${v.refreshApp} disabled=${v.refreshing} style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border:0;border-bottom:1px solid var(--color-divider);background:transparent;cursor:pointer;text-align:left;min-height:60px">
      <span style="display:flex;align-items:center;gap:12px"><span style="color:var(--color-accent-700);display:flex;animation:${v.refreshSpin}">${v.ic.refreshLg}</span><span style="display:flex;flex-direction:column"><span style="font-family:var(--font-heading);font-size:19px;font-weight:600">Refresh app</span><span role="status" style="font-size:12px;color:var(--color-neutral-700)">${v.refreshMsg}</span></span></span>
      <span style="color:var(--color-neutral-500)">${v.ic.chev}</span>
    </button>
  </section>
  <section style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:baseline;gap:10px;direction:rtl"><span style="display:inline-flex;align-items:baseline;gap:6px"><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">دستاوردها</span>${say('دستاوردها')}</span><h2 style="font-size:24px;margin:0">Achievements</h2></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
      ${(v.achievements || []).map((a) => html`
        <div style="border:1px solid ${a.border};border-radius:var(--radius-md);padding:12px;display:flex;flex-direction:column;gap:4px;opacity:${a.op}">
          <span style="display:flex;justify-content:space-between;align-items:center"><span style="font-family:var(--font-heading);font-size:17px;font-weight:600">${a.title}</span><span style="color:var(--color-accent-700);display:flex">${a.icon}</span></span>
          <span style="font-size:11px;line-height:1.4;color:var(--color-neutral-700)">${a.desc}</span>
        </div>
      `)}
    </div>
  </section>
</div>
` : null}

${(v.is.words) ? html`
<div style="display:flex;flex-direction:column;gap:16px;animation:plfade .25s ease">
  <div style="display:flex;align-items:center;gap:8px">
    <button onClick=${v.back} aria-label="Back" style="width:44px;height:44px;margin-left:-10px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.back}</button>
    <h1 style="font-size:32px;font-weight:400;margin:0">Word collection</h1>
  </div>
  <input class="input" placeholder="Search in English or Persian" value=${v.wordQuery} onInput=${v.setWordQuery} style="min-height:44px;font-size:15px" />
  <div style="display:flex;flex-direction:column">
    ${(v.collection || []).map((w) => html`
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto 44px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-divider)">
        <span style="display:flex;flex-direction:column;min-width:0"><span style="font-size:14px">${w.en}</span><span style="font-size:11px;color:var(--color-neutral-600)">${w.lesson} · box ${w.box}</span></span>
        <span style="display:flex;flex-direction:column;align-items:flex-end">${(v.show.fa) ? html`<span style="font-family:'Noto Naskh Arabic',serif;font-size:20px;line-height:1.4;direction:rtl">${w.fa}${digit(w.num)}</span>` : null}${(v.show.lat) ? html`<span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${w.lat}</span>` : null}</span>
        <button onClick=${w.play} aria-label="Play" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--color-divider);background:transparent;color:var(--color-accent-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.ic.volSm}</button>
      </div>
    `)}
  </div>
</div>
` : null}

</main>
</div>

${(v.showBottomTabs) ? html`
<nav style="position:fixed;left:0;right:0;bottom:0;z-index:25;background:color-mix(in srgb, var(--color-bg) 94%, transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-top:1px solid var(--color-divider);display:grid;grid-template-columns:repeat(5,1fr);padding-bottom:env(safe-area-inset-bottom)">
  ${(v.tabs || []).map((t) => html`
    <button onClick=${t.go} style="min-height:60px;border:0;border-top:2px solid ${t.rail};margin-top:-1px;background:transparent;color:${t.color};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer">${t.icon}<span style="font-size:11px">${t.label}</span></button>
  `)}
</nav>
` : null}

${(v.sheetOpen) ? html`
<div onClick=${v.closeSheet} style="position:fixed;inset:0;z-index:60;background:color-mix(in srgb, var(--color-neutral-900) 40%, transparent);display:flex;align-items:${v.sheetCenter ? 'center' : 'flex-end'};justify-content:center;padding:${v.sheetCenter ? '16px' : '0'};animation:plfade .2s ease">
  <div onClick=${v.stop} style="width:100%;max-width:480px;max-height:${v.sheetCenter ? 'calc(100dvh - 32px)' : '100dvh'};overflow-y:auto;background:var(--color-bg);border-radius:${v.sheetCenter ? 'var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) 0 0'};box-shadow:var(--shadow-lg);padding:22px;padding-bottom:max(22px, env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:14px;animation:plup .25s ease">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="font-size:28px;margin:0">${v.sheetTitle}</h2>
      <button onClick=${v.closeSheet} aria-label="Close" style="width:44px;height:44px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-right:-10px">${v.ic.x}</button>
    </div>
    ${(v.sheetAuth) ? html`
      <div style="display:flex;border:1px solid var(--color-divider);border-radius:var(--radius-md);overflow:hidden">
        ${(v.authTabs || []).map((o) => html`<button onClick=${o.go} style="flex:1;min-height:42px;border:0;border-left:${o.bl};background:transparent;box-shadow:${o.shadow};color:${o.color};cursor:pointer;font-size:14px">${o.label}</button>`)}
      </div>
      <form onSubmit=${v.submitAuth} style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label for="auth-email">Email address</label><input id="auth-email" class="input" type="email" autocomplete="email" required value=${v.authEmail} onInput=${v.setAuthEmail} style="min-height:44px" /></div>
        <div class="field"><label for="auth-password">Password</label><div style="position:relative"><input id="auth-password" class="input" type=${v.authShowPw ? 'text' : 'password'} autocomplete=${v.authPwAuto} autocapitalize="off" autocorrect="off" spellcheck="false" required minlength="6" placeholder="At least 6 characters" value=${v.authPassword} onInput=${v.setAuthPassword} style="min-height:44px;width:100%;box-sizing:border-box;padding-right:48px" /><button type="button" onClick=${v.toggleShowPw} aria-label=${v.authShowPw ? 'Hide password' : 'Show password'} aria-pressed=${v.authShowPw} style="position:absolute;right:2px;top:50%;transform:translateY(-50%);width:44px;height:44px;border:0;background:transparent;color:var(--color-neutral-700);display:flex;align-items:center;justify-content:center;cursor:pointer">${v.authShowPw ? v.ic.eyeOff : v.ic.eye}</button></div></div>
        ${(v.authMsg) ? html`<p role="status" style="margin:0;font-size:13px;line-height:1.5;border-top:1px solid ${v.authMsgRule};padding-top:8px">${v.authMsg}</p>` : null}
        <button type="submit" class="btn btn-primary" disabled=${v.authBusy} style="min-height:50px;font-size:16px">${v.authCta}</button>
      </form>
      <p style="margin:0;font-size:12px;color:var(--color-neutral-700);text-align:center">Your local progress will sync to your account on sign in.</p>
    ` : null}
    ${(v.sheetSignOut) ? html`
      <p style="margin:0;font-size:14px;line-height:1.6">Your progress is saved to your account. This device will go back to guest mode.</p>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" onClick=${v.closeSheet} style="flex:1;min-height:50px;font-size:16px">Cancel</button>
        <button class="btn btn-primary" onClick=${v.doSignOut} style="flex:1;min-height:50px;font-size:16px">Sign out</button>
      </div>
    ` : null}
    ${(v.sheetHoliday) ? html`
      <div style="display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow-y:auto;margin-right:-8px;padding-right:8px">
        ${(v.H.sections || []).map((s) => html`
          <section style="display:flex;flex-direction:column;gap:8px">
            ${(s.heading) ? html`<h3 style="font-size:21px;margin:0">${s.heading}</h3>` : null}
            ${(s.images || []).map((img) => html`<figure style="margin:0;display:flex;flex-direction:column;gap:4px"><img class="plate" src=${img.url} alt=${img.caption} loading="lazy" style="width:100%;max-height:260px;object-fit:cover" /><figcaption style="font-size:11px;font-style:italic;color:var(--color-neutral-700)">${img.caption}</figcaption></figure>`)}
            ${(s.body) ? html`<div class="rich" dangerouslySetInnerHTML=${{ __html: s.body }}></div>` : null}
          </section>
        `)}
      </div>
    ` : null}
    ${(v.sheetInstall) ? html`
      <p style="margin:0;font-size:14px;line-height:1.6">Add Persian Learnin to your home screen to practice offline — lessons, audio and your review schedule are kept on the device.</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:var(--color-neutral-800)"><li>On iPhone: tap Share, then “Add to Home Screen”.</li><li>On Android or desktop Chrome: use “Install app” below or the browser menu.</li></ol>
      <button class="btn btn-primary" onClick=${v.doInstall} style="min-height:50px;font-size:16px;gap:8px">${v.ic.download} Install app</button>
    ` : null}
  </div>
</div>
` : null}

</div>
`;
}

// Culture articles (culture.js) carry richer section types than the design's plain sections.
const kicker = 'font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent-700)';
const cardTitle = 'font-family:var(--font-heading);font-size:19px;font-weight:600;line-height:1.2';
const small = 'font-size:13px;line-height:1.55;color:var(--color-neutral-800)';
const rich = (s, style = '') => html`<div class="rich" style=${style} dangerouslySetInnerHTML=${{ __html: s }}></div>`;

function richSection(s, v) {
  const t = s.type || 'text';
  let body = null;
  if (t === 'text') body = rich(s.body);
  else if (t === 'timeline') body = html`
    <ol style="list-style:none;margin:0;padding:0;border-left:1px solid var(--color-accent);margin-left:5px">
      ${s.items.map((it) => html`
        <li style="position:relative;padding:0 0 18px 20px">
          <span style="position:absolute;left:-5px;top:6px;width:9px;height:9px;border-radius:50%;border:1px solid var(--color-accent);background:var(--color-bg)"></span>
          <span style="${kicker};font-feature-settings:'tnum'">${it.date}</span>
          <div style=${cardTitle}>${it.era}</div>
          ${rich(it.body, small)}
        </li>`)}
    </ol>`;
  else if (t === 'people') body = html`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
      ${s.people.map((p) => html`
        <div class="card" style="display:flex;flex-direction:column;gap:4px;padding:14px">
          <span style="${kicker};font-feature-settings:'tnum'">${p.dates}</span>
          <span style=${cardTitle}>${p.name}</span>
          <span style="font-size:12px;font-style:italic;color:var(--color-neutral-700)">${p.role}</span>
          ${rich(p.note, small)}
        </div>`)}
    </div>`;
  else if (t === 'geo-facts') body = html`
    <dl style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin:0;border-top:1px solid var(--color-divider)">
      ${s.facts.map((f) => html`
        <div style="padding:10px 0;border-bottom:1px solid var(--color-divider)">
          <dt style=${kicker}>${f.label}</dt>
          <dd style="margin:2px 0 0;font-family:var(--font-heading);font-size:19px;font-weight:600">${f.value}</dd>
        </div>`)}
    </dl>`;
  else if (t === 'cities') body = html`
    <div style="display:flex;flex-direction:column">
      ${s.cities.map((c) => html`
        <div style="padding:10px 0;border-bottom:1px solid var(--color-divider)">
          <div style=${cardTitle}>${c.name}</div>
          ${rich(c.note, small)}
        </div>`)}
      ${s.body ? rich(s.body, 'margin-top:12px') : null}
    </div>`;
  else if (t === 'holiday-cards') body = html`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${s.holidays.map((h) => html`
        <div class="card" style="display:flex;flex-direction:column;gap:6px;padding:14px 16px">
          <span style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap">
            <span style="display:flex;align-items:baseline;gap:10px"><span style=${cardTitle}>${h.name}</span><span style="font-family:'Noto Naskh Arabic',serif;font-size:18px;color:var(--color-accent-700)">${h.persian}</span></span>
            ${h.badge ? html`<span class="tag tag-outline">${h.badge}</span>` : null}
          </span>
          <span style=${kicker}>${h.timing}</span>
          ${rich(h.desc, small)}
          ${h.detail ? html`<button class="btn btn-ghost" onClick=${() => v.openHoliday(h)} style="align-self:flex-start;min-height:40px;gap:4px;padding-inline:0">Read more ${v.ic.chev}</button>` : null}
        </div>`)}
    </div>`;
  else if (t === 'flags') body = html`
    <div style="display:flex;flex-direction:column;gap:18px">
      ${s.flags.map((f) => html`
        <figure style="margin:0;display:grid;grid-template-columns:minmax(0,140px) minmax(0,1fr);gap:16px;align-items:start">
          <img class="plate" src=${f.image} alt=${f.name} loading="lazy" style="width:100%;aspect-ratio:7/4;object-fit:${f.crop ? 'cover' : 'contain'};background:var(--color-surface)" />
          <figcaption style="display:flex;flex-direction:column;gap:3px">
            <span style="${kicker};font-feature-settings:'tnum'">${f.era} · ${f.badge}</span>
            <span style=${cardTitle}>${f.name}</span>
            ${rich(f.desc, small)}
          </figcaption>
        </figure>`)}
    </div>`;
  else if (t === 'map') body = html`
    <button onClick=${() => v.openMap(s)} class="hv-map" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid var(--color-divider);border-radius:var(--radius-md);background:transparent;cursor:pointer;text-align:left;min-height:60px">
      <span style="display:flex;align-items:center;gap:12px"><span style="color:var(--color-accent-700)">${v.ic.compass}</span><span style="display:flex;flex-direction:column"><span style=${cardTitle}>${s.heading}</span><span style="font-size:12px;color:var(--color-neutral-700)">Open the interactive map</span></span></span>
      <span style="color:var(--color-neutral-500)">${v.ic.chev}</span>
    </button>`;
  return html`
    <section style="display:flex;flex-direction:column;gap:10px">
      ${t !== 'map' ? html`<h3 style="font-size:23px;margin:8px 0 0">${s.heading}</h3>` : null}
      ${body}
    </section>`;
}
