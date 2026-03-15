// ===== SUPABASE =====
const SUPABASE_URL = 'https://rpnwwtsdfclcyexdafks.supabase.co';
const SUPABASE_KEY = 'sb_publishable_40HGCpUI6aogWTGhS8fGDA_B3Fozx_w';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let _currentUser = null;
let _authTab = 'signin';

// ===== STATE =====
let state = {
  xp: 0,
  streak: 0,
  hearts: 5,
  completedLessons: {},  // lessonId -> { flashcard, quiz, listen }
  lastPlayedDate: null,
};

// Load saved state
async function loadState() {
  let isNewUser = false;
  if (_currentUser) {
    const { data } = await _sb.from('profiles').select('*').eq('id', _currentUser.id).single();
    if (data) {
      state.xp = data.xp ?? 0;
      state.streak = data.streak ?? 0;
      state.hearts = data.hearts ?? 5;
      state.lastPlayedDate = data.last_played_date ?? null;
      state.completedLessons = data.completed_lessons ?? {};
    } else {
      isNewUser = true;
    }
  } else {
    const saved = localStorage.getItem("persian_app_state");
    if (saved) {
      try { state = { ...state, ...JSON.parse(saved) }; } catch (e) {}
    }
  }
  // Update streak
  const today = new Date().toDateString();
  if (state.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastPlayedDate !== yesterday) state.streak = 0;
  }
  return isNewUser;
}

async function saveState() {
  state.lastPlayedDate = new Date().toDateString();
  if (_currentUser) {
    await _sb.from('profiles').upsert({
      id: _currentUser.id,
      xp: state.xp,
      streak: state.streak,
      hearts: state.hearts,
      last_played_date: state.lastPlayedDate,
      completed_lessons: state.completedLessons,
      updated_at: new Date().toISOString(),
    });
  } else {
    localStorage.setItem("persian_app_state", JSON.stringify(state));
  }
}

// ===== NAVIGATION =====
let currentLesson = null;
let currentActivity = null;
let currentTab = "learn"; // "learn" | "explore"
let articleReturnScreen = "explore-screen"; // where back-from-article goes

const HIDE_NAV_SCREENS = new Set(["exercise-screen", "results-screen", "article-screen", "wordcollection-screen"]);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  // Show/hide bottom nav
  const nav = document.getElementById("bottom-nav");
  if (nav) nav.classList.toggle("hidden", HIDE_NAV_SCREENS.has(id));
}

function goHome() {
  currentTab = "learn";
  setActiveTab("learn");
  showScreen("home-screen");
  renderHome();
}

function switchTab(tab) {
  currentTab = tab;
  setActiveTab(tab);
  if (tab === "learn") {
    showScreen("home-screen");
    renderHome();
  } else if (tab === "explore") {
    showScreen("explore-screen");
    renderExplore();
  } else if (tab === "profile") {
    showScreen("profile-screen");
    renderProfile();
  }
}

function setActiveTab(tab) {
  document.getElementById("nav-learn").classList.toggle("active", tab === "learn");
  document.getElementById("nav-explore").classList.toggle("active", tab === "explore");
  document.getElementById("nav-profile").classList.toggle("active", tab === "profile");
}

function openLesson(lessonId) {
  currentLesson = LESSONS.find(l => l.id === lessonId);
  if (!currentLesson) return;
  renderLessonMenu();
  showScreen("lesson-screen");
}

// ===== EXPLORE SCREEN =====
function renderExplore() {
  const grid = document.getElementById("explore-grid");
  grid.innerHTML = "";
  ARTICLES.forEach(article => {
    const card = document.createElement("div");
    card.className = "explore-card";
    card.style.setProperty("--card-color", article.color);
    card.innerHTML = `
      <div class="explore-card-icon" style="background:${article.color}22">${article.icon}</div>
      <div class="explore-card-body">
        <div class="explore-card-meta">
          <span class="explore-card-category">${article.category}</span>
          <span class="explore-card-read-time">· ${article.readTime}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.preview}</p>
      </div>
    `;
    card.onclick = () => openArticle(article.id);
    grid.appendChild(card);
  });
}

function openArticle(articleId) {
  const article = ARTICLES.find(a => a.id === articleId);
  if (!article) return;
  articleReturnScreen = currentTab === "explore" ? "explore-screen" : "home-screen";
  renderArticle(article);
  showScreen("article-screen");
}

function renderArticle(article) {
  // Update nav meta
  document.getElementById("article-nav-category").textContent = article.category;
  document.getElementById("article-nav-read-time").textContent = article.readTime;

  const container = document.getElementById("article-content");
  let html = `
    <div class="article-hero">
      <div class="article-hero-icon">${article.icon}</div>
      <h1>${article.title}</h1>
      <p class="hero-subtitle">${article.subtitle}</p>
    </div>
  `;

  article.sections.forEach(section => {
    html += `<div class="article-section" style="--article-color:${article.color}">`;
    html += `<h2>${section.heading}</h2>`;

    if (!section.type || section.type === "text") {
      html += `<div class="article-body">${section.body}</div>`;

    } else if (section.type === "timeline") {
      html += `<div class="timeline">`;
      section.items.forEach(item => {
        html += `
          <div class="timeline-item">
            <div class="timeline-left">
              <div class="timeline-dot">${item.emoji}</div>
              <div class="timeline-line"></div>
            </div>
            <div class="timeline-right">
              <div class="timeline-date">${item.date}</div>
              <div class="timeline-era">${item.era}</div>
              <div class="timeline-body">${item.body}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (section.type === "people") {
      html += `<div class="people-grid">`;
      section.people.forEach(p => {
        html += `
          <div class="person-card">
            <div class="person-emoji">${p.emoji}</div>
            <div class="person-name">${p.name}</div>
            <div class="person-dates">${p.dates}</div>
            <div class="person-role">${p.role}</div>
            <div class="person-note">${p.note}</div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (section.type === "geo-facts") {
      html += `<div class="geo-facts-grid">`;
      section.facts.forEach(f => {
        html += `
          <div class="geo-fact">
            <div class="geo-fact-icon">${f.icon}</div>
            <div>
              <div class="geo-fact-label">${f.label}</div>
              <div class="geo-fact-value">${f.value}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (section.type === "cities") {
      html += `<div class="cities-list">`;
      section.cities.forEach(c => {
        html += `
          <div class="city-card">
            <div class="city-emoji">${c.emoji}</div>
            <div>
              <div class="city-name">${c.name}</div>
              <div class="city-note">${c.note}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      if (section.body) html += `<div class="article-body" style="margin-top:16px">${section.body}</div>`;

    } else if (section.type === "holiday-cards") {
      if (!window._holidays) window._holidays = {};
      html += `<div class="holiday-grid">`;
      section.holidays.forEach(h => {
        const hid = h.name.toLowerCase().replace(/\s+/g, "-");
        window._holidays[hid] = h;
        html += `
          <div class="holiday-card" style="--hol-color:${h.color}">
            <div class="holiday-card-top">
              <span class="holiday-emoji">${h.emoji}</span>
              <div class="holiday-card-head">
                <div class="holiday-name">${h.name} <span class="holiday-persian">${h.persian}</span></div>
                <div class="holiday-timing">📅 ${h.timing}</div>
              </div>
              ${h.badge ? `<span class="holiday-badge" style="background:${h.color}">${h.badge}</span>` : ""}
            </div>
            <div class="holiday-desc">${h.desc}</div>
            ${h.detail ? `<button class="holiday-more-btn" style="--hol-color:${h.color}" onclick="openHolidayModal('${hid}')">More ›</button>` : ""}
          </div>
        `;
      });
      html += `</div>`;

    } else if (section.type === "flags") {
      html += `<div class="flags-showcase">`;
      section.flags.forEach(f => {
        html += `
          <div class="flag-card">
            <div class="flag-img-wrap">
              <img class="flag-img${f.crop ? ' flag-img-crop' : ''}" src="${f.image}" alt="${f.name}" loading="lazy" />
              <span class="flag-badge" style="background:${f.badgeColor}">${f.badge}</span>
            </div>
            <div class="flag-card-body">
              <div class="flag-name">${f.name}</div>
              <div class="flag-era">${f.era}</div>
              <div class="flag-desc">${f.desc}</div>
            </div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (section.type === "map") {
      html += `<div id="${section.mapId}" class="article-map"></div>`;
      if (section.note) {
        html += `<p class="map-note">${section.note}</p>`;
      }
    }

    html += `</div>`; // close article-section
  });

  container.innerHTML = html;
  container.scrollTop = 0;
  document.getElementById("article-screen").scrollTop = 0;
  window.scrollTo(0, 0);

  // Initialize any maps in this article
  destroyMaps();
  setTimeout(() => initArticleMaps(article), 50);
}

// ===== LEAFLET MAP MANAGEMENT =====
const _maps = {};

function destroyMaps() {
  Object.keys(_maps).forEach(id => {
    try { _maps[id].remove(); } catch (e) {}
    delete _maps[id];
  });
}

function initArticleMaps(article) {
  if (typeof L === "undefined") return;

  const tiles = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const attr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  article.sections.forEach(section => {
    if (section.type !== "map") return;
    const el = document.getElementById(section.mapId);
    if (!el) return;

    const map = L.map(section.mapId, {
      center: section.center,
      zoom: section.zoom,
      zoomControl: true,
      scrollWheelZoom: false, // prevent accidental scroll-hijack
    });

    L.tileLayer(tiles, { attribution: attr, maxZoom: 18 }).addTo(map);

    section.markers.forEach(m => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:34px;height:34px;border-radius:50%;
          background:${m.color};
          display:flex;align-items:center;justify-content:center;
          font-size:15px;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.28);
          cursor:pointer;
        ">${m.emoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -22],
      });

      L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-size:13px;line-height:1.5">${m.popup}</div>`, { maxWidth: 220 });
    });

    _maps[section.mapId] = map;
  });
}

// ===== RENDER HOME =====
function renderHome() {
  updateHeaderStats();

  // XP bar (per 100 xp = 1 level)
  const level = Math.floor(state.xp / 100) + 1;
  const xpInLevel = state.xp % 100;
  document.getElementById("xp-bar-fill").style.width = xpInLevel + "%";
  document.getElementById("xp-level-label").textContent = `Level ${level}`;
  document.getElementById("xp-label").textContent = `${xpInLevel}/100 XP`;

  const grid = document.getElementById("lessons-grid");
  grid.innerHTML = "";

  LESSONS.forEach((lesson, i) => {
    const done = state.completedLessons[lesson.id] || {};
    const activitiesCount = ["flashcard", "quiz", "listen"].filter(a => done[a]).length;
    const progress = Math.round((activitiesCount / 3) * 100);
    const stars = activitiesCount >= 3 ? "⭐⭐⭐" : activitiesCount >= 2 ? "⭐⭐☆" : activitiesCount >= 1 ? "⭐☆☆" : "☆☆☆";

    const card = document.createElement("div");
    card.className = "lesson-card" + (activitiesCount === 3 ? " completed" : "");
    card.style.setProperty("--lesson-color", lesson.color);
    card.style.setProperty("--lesson-color-light", lesson.color + "22");

    card.innerHTML = `
      <div class="lesson-icon">${lesson.icon}</div>
      <div class="lesson-info">
        <h3>${lesson.title}</h3>
        <p>${lesson.description} · ${lesson.words.length} words</p>
      </div>
      <div class="lesson-progress">
        <div class="lesson-progress-bar">
          <div class="lesson-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="lesson-stars">${stars}</div>
      </div>
      ${activitiesCount === 3 ? '<div class="complete-badge">✓</div>' : ""}
    `;
    card.onclick = () => openLesson(lesson.id);
    grid.appendChild(card);
  });
}

// ===== RENDER LESSON MENU =====
function renderLessonMenu() {
  const lesson = currentLesson;
  const done = state.completedLessons[lesson.id] || {};

  document.getElementById("lesson-menu-icon").textContent = lesson.icon;
  document.getElementById("lesson-menu-title").textContent = lesson.title;
  document.getElementById("lesson-menu-desc").textContent = `${lesson.words.length} words`;

  const activities = [
    {
      id: "flashcard",
      icon: "🃏",
      title: "Flashcards",
      desc: "Flip through all words with audio",
      color: "#CE82FF",
    },
    {
      id: "quiz",
      icon: "🧠",
      title: "Quiz",
      desc: "Multiple choice challenge",
      color: "#FF9600",
    },
    {
      id: "listen",
      icon: "🔊",
      title: "Listen & Choose",
      desc: "Hear the word, pick the meaning",
      color: "#1CB0F6",
    },
  ];

  const container = document.getElementById("activity-cards");
  container.innerHTML = "";

  activities.forEach(act => {
    const completed = done[act.id];
    const card = document.createElement("div");
    card.className = "activity-card";
    card.style.setProperty("--act-color", act.color);
    card.innerHTML = `
      <div class="act-icon">${act.icon}${completed ? " ✅" : ""}</div>
      <h3>${act.title}</h3>
      <p>${act.desc}</p>
      <span class="act-xp">+${XP_PER_LESSON} XP</span>
    `;
    card.onclick = () => startActivity(act.id);
    container.appendChild(card);
  });
}

// ===== UPDATE HEADER =====
function updateHeaderStats() {
  document.getElementById("stat-xp").textContent = state.xp;
  document.getElementById("stat-streak").textContent = state.streak;
  document.getElementById("stat-hearts").textContent = "❤️".repeat(Math.max(0, state.hearts));
}

// ===== AUDIO PLAYBACK =====
let _currentAudio = null;

function toAudioFileName(english, phonetic) {
  const clean = s => s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")       // remove (parentheticals)
    .replace(/—.*$/, "")           // remove em-dash and after
    .replace(/[/|]/g, " ")         // slashes to spaces
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .trim()
    .replace(/\s+/g, "-")          // spaces to hyphens
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
  return `${clean(english)}-${clean(phonetic)}.wav`;
}

function getAudioPath(persian) {
  if (!currentLesson) return null;
  const word = currentLesson.words.find(w => w.persian === persian);
  if (!word) return null;
  return `audio/${toAudioFileName(word.english, word.phonetic)}`;
}

function speak(persian, onEnd) {
  // Stop anything already playing
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();

  const filePath = getAudioPath(persian);
  if (filePath) {
    const audio = new Audio(filePath);
    _currentAudio = audio;
    if (onEnd) audio.onended = onEnd;
    audio.onerror = () => _ttsFallback(persian, onEnd); // fall back if file missing
    audio.play().catch(() => _ttsFallback(persian, onEnd));
  } else {
    _ttsFallback(persian, onEnd);
  }
}

function _ttsFallback(persian, onEnd) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
  const utter = new SpeechSynthesisUtterance(persian);
  utter.lang = "fa-IR";
  utter.rate = 0.85;
  if (onEnd) utter.onend = onEnd;
  const voices = speechSynthesis.getVoices();
  const faVoice = voices.find(v => v.lang.startsWith("fa"));
  if (faVoice) utter.voice = faVoice;
  speechSynthesis.speak(utter);
}

function speakWithButton(persian, btn) {
  btn.classList.add("speaking");
  speak(persian, () => btn.classList.remove("speaking"));
}

// ===== FLASHCARD ACTIVITY =====
let fcIndex = 0;
let fcFlipped = false;

function startActivity(activityId) {
  currentActivity = activityId;
  if (!currentLesson) return;

  if (activityId === "flashcard") startFlashcards();
  else if (activityId === "quiz") startQuiz();
  else if (activityId === "listen") startListen();
}

function startFlashcards() {
  fcIndex = 0;
  fcFlipped = false;
  const words = [...currentLesson.words];
  shuffle(words);
  window._fcWords = words;
  renderFlashcard();
  showScreen("exercise-screen");
  updateExerciseHeader(0, words.length);
}

function renderFlashcard() {
  const words = window._fcWords;
  const word = words[fcIndex];
  const container = document.getElementById("exercise-content");
  fcFlipped = false;

  container.innerHTML = `
    <div class="flashcard-wrapper">
      <p class="hint-text">Tap the card to flip it</p>
      <div class="flashcard-scene" id="fc-scene" onclick="flipCard()">
        <div class="flashcard" id="fc-card">
          <div class="flashcard-face front">
            <span class="card-label">Persian</span>
            <div class="card-persian">${word.persian}</div>
            <div class="card-phonetic">${word.phonetic}</div>
            <button class="audio-btn" id="fc-audio-btn" onclick="event.stopPropagation(); speakCard()" title="Listen">🔊</button>
          </div>
          <div class="flashcard-face back">
            <span class="card-label">English</span>
            <div class="card-english">${word.english}</div>
            <div class="card-phonetic">${word.phonetic}</div>
            <div class="card-example">${word.example}</div>
          </div>
        </div>
      </div>
      <div class="flashcard-counter">${fcIndex + 1} / ${words.length}</div>
      <div class="flashcard-nav">
        ${fcIndex > 0 ? `<button class="nav-btn" onclick="fcPrev()">← Back</button>` : ""}
        <button class="nav-btn primary" onclick="fcNext()">${fcIndex === words.length - 1 ? "Finish ✓" : "Next →"}</button>
      </div>
    </div>
  `;

  updateExerciseHeader(fcIndex, words.length);
  // Auto-speak
  setTimeout(() => speak(word.persian), 300);
}

function flipCard() {
  const card = document.getElementById("fc-card");
  if (!card) return;
  fcFlipped = !fcFlipped;
  card.classList.toggle("flipped", fcFlipped);
}

function speakCard() {
  const words = window._fcWords;
  const word = words[fcIndex];
  const btn = document.getElementById("fc-audio-btn");
  if (btn) speakWithButton(word.persian, btn);
  else speak(word.persian);
}

function fcNext() {
  const words = window._fcWords;
  if (fcIndex < words.length - 1) {
    fcIndex++;
    renderFlashcard();
  } else {
    finishActivity(words.length, words.length);
  }
}

function fcPrev() {
  if (fcIndex > 0) {
    fcIndex--;
    renderFlashcard();
  }
}

// ===== QUIZ ACTIVITY =====
let quizIndex = 0;
let quizCorrect = 0;
let quizWords = [];

function startQuiz() {
  quizWords = shuffle([...currentLesson.words]);
  quizIndex = 0;
  quizCorrect = 0;
  state.hearts = HEARTS_MAX;
  renderQuiz();
  showScreen("exercise-screen");
}

function renderQuiz() {
  const word = quizWords[quizIndex];
  // Generate 3 wrong answers from other words in lesson + other lessons
  const allWords = LESSONS.flatMap(l => l.words);
  const wrongPool = allWords.filter(w => w.english !== word.english);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(w => w.english);
  const options = shuffle([word.english, ...wrongs]);

  const container = document.getElementById("exercise-content");
  container.innerHTML = `
    <div class="quiz-wrapper">
      <div class="quiz-question-label">What does this mean?</div>
      <div class="quiz-question-card">
        <div class="quiz-persian">${word.persian}</div>
        <div class="quiz-phonetic">${word.phonetic}</div>
        <button class="audio-btn" id="quiz-audio-btn" onclick="speakQuizWord()" title="Listen">🔊</button>
      </div>
      <div class="quiz-options" id="quiz-options">
        ${options.map(opt => `
          <button class="quiz-option" onclick="checkAnswer(this, '${escHtml(opt)}', '${escHtml(word.english)}')">${opt}</button>
        `).join("")}
      </div>
      <div class="feedback-bar" id="feedback-bar">
        <span class="feedback-text" id="feedback-text"></span>
        <button class="continue-btn" id="continue-btn" onclick="quizContinue()">Continue</button>
      </div>
    </div>
  `;

  updateExerciseHeader(quizIndex, quizWords.length);
  setTimeout(() => speak(word.persian), 200);
}

function speakQuizWord() {
  const word = quizWords[quizIndex];
  const btn = document.getElementById("quiz-audio-btn");
  if (btn) speakWithButton(word.persian, btn);
}

function checkAnswer(btn, chosen, correct) {
  const opts = document.querySelectorAll(".quiz-option");
  opts.forEach(o => o.disabled = true);

  const fb = document.getElementById("feedback-bar");
  const fbText = document.getElementById("feedback-text");
  const contBtn = document.getElementById("continue-btn");

  if (chosen === correct) {
    btn.classList.add("correct");
    fb.className = "feedback-bar show correct-fb";
    fbText.textContent = "🎉 Correct! Great job!";
    contBtn.className = "continue-btn";
    quizCorrect++;
  } else {
    btn.classList.add("wrong");
    opts.forEach(o => { if (o.textContent === correct) o.classList.add("correct"); });
    fb.className = "feedback-bar show wrong-fb";
    fbText.textContent = `Correct answer: "${correct}"`;
    contBtn.className = "continue-btn wrong-btn";
    state.hearts = Math.max(0, state.hearts - 1);
    updateHeaderStats();
    document.getElementById("exercise-content").classList.add("shake");
    setTimeout(() => document.getElementById("exercise-content").classList.remove("shake"), 500);
  }
}

function quizContinue() {
  if (state.hearts === 0) {
    showToast("Out of hearts! Keep practicing!");
    finishActivity(quizCorrect, quizWords.length);
    return;
  }
  quizIndex++;
  if (quizIndex >= quizWords.length) {
    finishActivity(quizCorrect, quizWords.length);
  } else {
    renderQuiz();
  }
}

// ===== LISTEN ACTIVITY =====
let listenIndex = 0;
let listenCorrect = 0;
let listenWords = [];

function startListen() {
  listenWords = shuffle([...currentLesson.words]);
  listenIndex = 0;
  listenCorrect = 0;
  state.hearts = HEARTS_MAX;
  renderListen();
  showScreen("exercise-screen");
}

function renderListen() {
  const word = listenWords[listenIndex];
  const allWords = LESSONS.flatMap(l => l.words);
  const wrongPool = allWords.filter(w => w.english !== word.english);
  const wrongs = shuffle(wrongPool).slice(0, 3).map(w => w.english);
  const options = shuffle([word.english, ...wrongs]);

  const container = document.getElementById("exercise-content");
  container.innerHTML = `
    <div class="listen-wrapper">
      <p class="listen-prompt">Listen and choose the correct meaning</p>
      <button class="listen-big-btn" id="listen-big-btn" onclick="speakListenWord()">🔊</button>
      <button class="listen-again-btn" onclick="speakListenWord()">Play again</button>
      <div class="quiz-options" id="listen-options" style="width:100%;max-width:480px">
        ${options.map(opt => `
          <button class="quiz-option" onclick="checkListenAnswer(this, '${escHtml(opt)}', '${escHtml(word.english)}')">${opt}</button>
        `).join("")}
      </div>
      <div class="feedback-bar" id="feedback-bar">
        <span class="feedback-text" id="feedback-text"></span>
        <button class="continue-btn" id="continue-btn" onclick="listenContinue()">Continue</button>
      </div>
    </div>
  `;

  updateExerciseHeader(listenIndex, listenWords.length);
  setTimeout(() => speakListenWord(), 400);
}

function speakListenWord() {
  const word = listenWords[listenIndex];
  const btn = document.getElementById("listen-big-btn");
  if (btn) speakWithButton(word.persian, btn);
}

function checkListenAnswer(btn, chosen, correct) {
  const opts = document.querySelectorAll(".quiz-option");
  opts.forEach(o => o.disabled = true);

  const fb = document.getElementById("feedback-bar");
  const fbText = document.getElementById("feedback-text");
  const contBtn = document.getElementById("continue-btn");
  const word = listenWords[listenIndex];

  if (chosen === correct) {
    btn.classList.add("correct");
    fb.className = "feedback-bar show correct-fb";
    fbText.textContent = `🎉 Correct! "${word.persian}" = "${correct}"`;
    contBtn.className = "continue-btn";
    listenCorrect++;
  } else {
    btn.classList.add("wrong");
    opts.forEach(o => { if (o.textContent === correct) o.classList.add("correct"); });
    fb.className = "feedback-bar show wrong-fb";
    fbText.textContent = `"${word.persian}" means "${correct}"`;
    contBtn.className = "continue-btn wrong-btn";
    state.hearts = Math.max(0, state.hearts - 1);
    updateHeaderStats();
  }
}

function listenContinue() {
  listenIndex++;
  if (listenIndex >= listenWords.length || state.hearts === 0) {
    finishActivity(listenCorrect, listenWords.length);
  } else {
    renderListen();
  }
}

// ===== EXERCISE HEADER =====
function updateExerciseHeader(current, total) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  document.getElementById("ex-progress-fill").style.width = pct + "%";
  const hearts = document.getElementById("ex-hearts");
  if (hearts) hearts.textContent = "❤️".repeat(Math.max(0, state.hearts)) + "🖤".repeat(Math.max(0, HEARTS_MAX - state.hearts));
}

// ===== FINISH ACTIVITY =====
async function finishActivity(correct, total) {
  const xpEarned = XP_PER_LESSON + Math.round((correct / total) * XP_PER_LESSON);
  state.xp += xpEarned;
  state.streak = Math.max(state.streak, 1);

  if (!state.completedLessons[currentLesson.id]) {
    state.completedLessons[currentLesson.id] = {};
  }
  state.completedLessons[currentLesson.id][currentActivity] = true;
  await saveState();

  renderResults(correct, total, xpEarned);
  showScreen("results-screen");
  if (correct === total) launchConfetti();
}

function renderResults(correct, total, xpEarned) {
  const accuracy = Math.round((correct / total) * 100);
  const isPerfect = correct === total;

  document.getElementById("results-trophy").textContent = isPerfect ? "🏆" : correct > total / 2 ? "🎉" : "💪";
  document.getElementById("results-title").textContent = isPerfect ? "Perfect!" : correct > total / 2 ? "Nice Work!" : "Keep Practicing!";
  document.getElementById("result-xp").textContent = `+${xpEarned}`;
  document.getElementById("result-streak").textContent = state.streak;
  document.getElementById("result-accuracy").textContent = accuracy + "%";
  document.getElementById("results-lesson-name").textContent = currentLesson.title;
}

// ===== CONFETTI =====
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";
  const colors = ["#58CC02", "#FF9600", "#CE82FF", "#1CB0F6", "#FF4B4B", "#FFD900"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    const size = Math.random() * 10 + 6;
    piece.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-20px;
      width:${size}px;
      height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      opacity:1;
      animation: confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards;
    `;
    container.appendChild(piece);
  }

  const style = document.getElementById("confetti-style") || document.createElement("style");
  style.id = "confetti-style";
  style.textContent = `
    @keyframes confettiFall {
      to { top: 110%; opacity: 0; transform: rotate(${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 720)}deg) translateX(${(Math.random() - 0.5) * 200}px); }
    }
  `;
  document.head.appendChild(style);
  setTimeout(() => container.innerHTML = "", 4000);
}

// ===== TOAST =====
let _toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  if (_toastTimeout) clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
    _toastTimeout = null;
  }, 2500);
}

// ===== UTILS =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ===== HOLIDAY MODAL =====
function openHolidayModal(hid) {
  const h = window._holidays && window._holidays[hid];
  if (!h || !h.detail) return;

  document.getElementById("holiday-modal-title").innerHTML =
    `<span>${h.emoji}</span> ${h.name} <span class="modal-title-persian">${h.persian}</span>`;

  const body = document.getElementById("holiday-modal-body");
  let html = "";
  h.detail.sections.forEach(s => {
    html += `<div class="modal-section">`;
    if (s.heading) html += `<h3 class="modal-section-heading">${s.heading}</h3>`;
    if (s.images && s.images.length) {
      html += `<div class="modal-images">`;
      s.images.forEach(img => {
        html += `
          <figure class="modal-figure">
            <img src="${img.url}" alt="${img.caption}" loading="lazy" />
            <figcaption>${img.caption}</figcaption>
          </figure>`;
      });
      html += `</div>`;
    }
    if (s.body) html += `<div class="modal-body-text">${s.body}</div>`;
    html += `</div>`;
  });

  body.innerHTML = html;
  body.scrollTop = 0;
  document.getElementById("holiday-modal").classList.add("open");
  document.body.classList.add("modal-open");
}

function closeHolidayModal() {
  document.getElementById("holiday-modal").classList.remove("open");
  document.body.classList.remove("modal-open");
}

// ===== ACHIEVEMENTS =====
const ACHIEVEMENTS = [
  { id: 'first_step',     icon: '🌱', title: 'First Step',     desc: 'Complete your first lesson activity' },
  { id: 'on_fire',        icon: '🔥', title: 'On Fire',        desc: 'Reach a 3-day streak' },
  { id: 'dedicated',      icon: '📅', title: 'Dedicated',      desc: 'Reach a 7-day streak' },
  { id: 'rising_star',    icon: '⭐', title: 'Rising Star',    desc: 'Fully complete 3 lessons' },
  { id: 'scholar',        icon: '🎓', title: 'Scholar',        desc: 'Fully complete all lessons' },
  { id: 'centurion',      icon: '⚡', title: 'Centurion',      desc: 'Reach 100 XP' },
  { id: 'master',         icon: '👑', title: 'Master',         desc: 'Reach Level 5 (400 XP)' },
  { id: 'word_collector', icon: '📖', title: 'Word Collector', desc: 'Learn words from 5 lessons' },
];

function fullyCompletedLessons() {
  return LESSONS.filter(l => {
    const done = state.completedLessons[l.id] || {};
    return done.flashcard && done.quiz && done.listen;
  });
}

function learnedWords() {
  const words = [];
  LESSONS.forEach(l => {
    const done = state.completedLessons[l.id] || {};
    if (done.flashcard) {
      l.words.forEach(w => words.push({ ...w, lessonId: l.id, lessonTitle: l.title, lessonIcon: l.icon, lessonColor: l.color }));
    }
  });
  return words;
}

function checkAchievement(id) {
  const lessonsWithFlashcard = LESSONS.filter(l => (state.completedLessons[l.id] || {}).flashcard).length;
  switch (id) {
    case 'first_step':     return Object.keys(state.completedLessons).length >= 1;
    case 'on_fire':        return state.streak >= 3;
    case 'dedicated':      return state.streak >= 7;
    case 'rising_star':    return fullyCompletedLessons().length >= 3;
    case 'scholar':        return fullyCompletedLessons().length >= LESSONS.length;
    case 'centurion':      return state.xp >= 100;
    case 'master':         return state.xp >= 400;
    case 'word_collector': return lessonsWithFlashcard >= 5;
    default:               return false;
  }
}

// ===== PROFILE =====
function renderProfile() {
  const isGuest = !_currentUser;

  document.getElementById('profile-auth-banner').style.display = isGuest ? '' : 'none';
  document.getElementById('profile-user-header').style.display = isGuest ? 'none' : '';

  if (!isGuest) {
    document.getElementById('profile-avatar').textContent = (_currentUser.email || '?')[0].toUpperCase();
    document.getElementById('profile-email').textContent = _currentUser.email;
  }

  // Stats row
  const level = Math.floor(state.xp / 100) + 1;
  const completed = fullyCompletedLessons().length;
  document.getElementById('profile-stats-row').innerHTML = `
    <div class="profile-stat-card">
      <div class="psc-value">${level}</div>
      <div class="psc-label">Level</div>
    </div>
    <div class="profile-stat-card">
      <div class="psc-value">${state.xp}</div>
      <div class="psc-label">Total XP</div>
    </div>
    <div class="profile-stat-card">
      <div class="psc-value">${state.streak}</div>
      <div class="psc-label">🔥 Streak</div>
    </div>
    <div class="profile-stat-card">
      <div class="psc-value">${completed}/${LESSONS.length}</div>
      <div class="psc-label">Lessons Done</div>
    </div>
  `;

  // Achievements
  document.getElementById('achievements-grid').innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = checkAchievement(a.id);
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-title">${a.title}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
    `;
  }).join('');

  // Word collection summary
  const words = learnedWords();
  const lessonCount = LESSONS.filter(l => (state.completedLessons[l.id] || {}).flashcard).length;
  document.getElementById('wc-summary').textContent =
    words.length > 0 ? `${words.length} words across ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}` : 'Complete flashcards to start collecting';
}

function showWordCollection() {
  showScreen('wordcollection-screen');
  const container = document.getElementById('word-collection-content');
  const words = learnedWords();
  if (words.length === 0) {
    container.innerHTML = '<p class="wc-empty">Complete flashcard activities to build your word collection!</p>';
    return;
  }
  const byLesson = {};
  words.forEach(w => {
    if (!byLesson[w.lessonId]) byLesson[w.lessonId] = { title: w.lessonTitle, icon: w.lessonIcon, color: w.lessonColor, words: [] };
    byLesson[w.lessonId].words.push(w);
  });
  container.innerHTML = Object.values(byLesson).map(lesson => `
    <div class="wc-lesson">
      <div class="wc-lesson-header" style="--lesson-color:${lesson.color}">
        <span>${lesson.icon}</span> ${lesson.title}
      </div>
      <div class="wc-words">
        ${lesson.words.map(w => `
          <div class="wc-word">
            <div class="wc-persian">${w.persian}</div>
            <div class="wc-phonetic">${w.phonetic}</div>
            <div class="wc-english">${w.english}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===== AUTH =====
function openAuthModal() {
  document.getElementById('auth-modal').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function showAuthTab(tab) {
  _authTab = tab;
  document.getElementById('tab-signin').classList.toggle('active', tab === 'signin');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('auth-submit').textContent = tab === 'signin' ? 'Sign In' : 'Sign Up';
  document.getElementById('auth-modal-title').textContent = tab === 'signin' ? 'Welcome Back' : 'Create Account';
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';
  errEl.style.color = '';
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('auth-submit');

  errEl.style.display = 'none';
  errEl.style.color = '';
  btn.disabled = true;
  btn.textContent = '...';

  const result = _authTab === 'signin'
    ? await _sb.auth.signInWithPassword({ email, password })
    : await _sb.auth.signUp({ email, password });

  btn.disabled = false;
  btn.textContent = _authTab === 'signin' ? 'Sign In' : 'Sign Up';

  if (result.error) {
    errEl.textContent = result.error.message;
    errEl.style.display = '';
    return;
  }

  // Sign up with email confirmation pending
  if (_authTab === 'signup' && result.data?.user && !result.data.session) {
    errEl.style.color = 'var(--green)';
    errEl.textContent = 'Check your email to confirm your account!';
    errEl.style.display = '';
    return;
  }
}

function openSignoutModal() {
  document.getElementById('signout-modal').classList.add('open');
}

function closeSignoutModal() {
  document.getElementById('signout-modal').classList.remove('open');
}

async function confirmSignOut() {
  const btn = document.getElementById('signout-confirm-btn');
  btn.disabled = true;
  btn.textContent = '...';
  try {
    await _sb.auth.signOut();
  } catch (e) {}
  _currentUser = null;
  closeSignoutModal();
  await loadState();
  renderHome();
  renderProfile();
  showToast('Signed out');
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  // Load voices (browsers need this)
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {};

  await loadState();
  renderHome();
  showScreen("home-screen");

  // Supabase auth listener — fires immediately on load if session exists
  _sb.auth.onAuthStateChange(async (event, session) => {
    _currentUser = session?.user ?? null;
    if (_currentUser) {
      const isNewUser = await loadState();
      if (isNewUser) await saveState(); // sync local progress to new account
      renderHome();
      if (currentTab === 'profile') renderProfile();
      if (document.getElementById('auth-modal').classList.contains('open')) {
        closeAuthModal();
        showToast('Signed in! Progress synced. 🎉');
      }
    } else if (event === 'SIGNED_OUT') {
      await loadState();
      renderHome();
      if (currentTab === 'profile') renderProfile();
    }
  });

  // Wire back buttons
  document.getElementById("back-from-lesson").onclick = () => {
    if (currentTab === "learn") { showScreen("home-screen"); renderHome(); }
    else { showScreen("explore-screen"); renderExplore(); }
  };
  document.getElementById("back-from-exercise").onclick = () => {
    speechSynthesis.cancel();
    openLesson(currentLesson.id);
    showScreen("lesson-screen");
  };
  document.getElementById("back-from-article").onclick = () => {
    destroyMaps();
    if (articleReturnScreen === "explore-screen") {
      showScreen("explore-screen");
      renderExplore();
    } else {
      goHome();
    }
  };
  document.getElementById("btn-play-again").onclick = () => startActivity(currentActivity);
  document.getElementById("btn-go-home").onclick = goHome;
  document.getElementById("back-from-wordcollection").onclick = () => {
    showScreen("profile-screen");
    renderProfile();
  };
});
