// ===== STATE =====
let state = {
  xp: 0,
  streak: 0,
  hearts: 5,
  completedLessons: {},  // lessonId -> { flashcard, quiz, listen }
  lastPlayedDate: null,
};

// Load saved state
function loadState() {
  const saved = localStorage.getItem("persian_app_state");
  if (saved) {
    try {
      state = { ...state, ...JSON.parse(saved) };
    } catch (e) {}
  }
  // Update streak
  const today = new Date().toDateString();
  if (state.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastPlayedDate !== yesterday) state.streak = 0;
  }
}

function saveState() {
  state.lastPlayedDate = new Date().toDateString();
  localStorage.setItem("persian_app_state", JSON.stringify(state));
}

// ===== NAVIGATION =====
let currentLesson = null;
let currentActivity = null;
let currentTab = "learn"; // "learn" | "explore"
let articleReturnScreen = "explore-screen"; // where back-from-article goes

const HIDE_NAV_SCREENS = new Set(["exercise-screen", "results-screen", "article-screen"]);

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
  } else {
    showScreen("explore-screen");
    renderExplore();
  }
}

function setActiveTab(tab) {
  document.getElementById("nav-learn").classList.toggle("active", tab === "learn");
  document.getElementById("nav-explore").classList.toggle("active", tab === "explore");
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

// ===== SPEECH SYNTHESIS =====
function speak(text, onEnd) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fa-IR";
  utter.rate = 0.85;
  utter.pitch = 1;
  if (onEnd) utter.onend = onEnd;
  // Try to find a Persian voice
  const voices = speechSynthesis.getVoices();
  const faVoice = voices.find(v => v.lang.startsWith("fa"));
  if (faVoice) utter.voice = faVoice;
  speechSynthesis.speak(utter);
}

function speakWithButton(text, btn) {
  btn.classList.add("speaking");
  speak(text, () => btn.classList.remove("speaking"));
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
function finishActivity(correct, total) {
  const xpEarned = XP_PER_LESSON + Math.round((correct / total) * XP_PER_LESSON);
  state.xp += xpEarned;
  state.streak = Math.max(state.streak, 1);

  if (!state.completedLessons[currentLesson.id]) {
    state.completedLessons[currentLesson.id] = {};
  }
  state.completedLessons[currentLesson.id][currentActivity] = true;
  saveState();

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
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  // Load voices (browsers need this)
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {};

  loadState();
  renderHome();
  showScreen("home-screen");

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
});
