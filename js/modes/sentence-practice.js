import { SENTENCE_CATEGORIES, getRandomSentence, getRandomSentenceEn } from '../data/sentences.js';
import { IMEHandler } from '../core/ime.js';
import { TypingEngine } from '../core/typing-engine.js';
import { TextDisplay } from '../components/text-display.js';
import { StatsDisplay } from '../components/stats-display.js';
import { ScoreStore } from '../storage/score-store.js';

// 한국어 카테고리 → 영문 카테고리 매핑
const KO_TO_EN_CAT = {
  '속담': 'Proverbs', '명언': 'Quotes', '자연': 'Nature',
  '일상': 'Daily Life', '과학': 'Technology', '문학': 'Quotes', '검정': 'Exam',
};
const EN_TO_KO_CAT = {
  'Proverbs': '속담', 'Quotes': '명언', 'Nature': '자연',
  'Daily Life': '일상', 'Technology': '과학', 'Exam': '검정',
};

let ime = null, engine = null, textDisplay = null, statsDisplay = null;
let currentSentence = null, selectedCategory = null, lang = 'ko';

export function init(container) {
  lang = localStorage.getItem('typing_lang') || 'ko';
  selectedCategory = null;
  renderMode(container);
}

function renderMode(container) {
  container.innerHTML = `
    <div class="mode-header">
      <h2>단문 연습</h2>
    </div>
    <p class="mode-desc">짧은 문장을 정확하게 타이핑하는 연습입니다.</p>

    <div id="sentence-category-select" class="category-grid">
      <button class="category-card active" data-cat="all">
        <span class="cat-name">전체</span>
      </button>
      ${SENTENCE_CATEGORIES.map(c => `
        <button class="category-card" data-cat="${c}">
          <span class="cat-name">${c}</span>
        </button>
      `).join('')}
    </div>

    <div id="sentence-practice-area" class="practice-area">
      <div class="practice-header">
        <span id="sentence-category-label" class="badge"></span>
        <button id="sentence-skip-btn" class="btn-secondary btn-sm">다른 문장</button>
      </div>
      <div id="sentence-text-display" class="text-display sentence-text-display"></div>
      <div id="sentence-stats" class="stats-bar"></div>
      <input id="sentence-input" class="typing-input" autocomplete="off"
             autocorrect="off" autocapitalize="off" spellcheck="false"
             placeholder="위 문장을 입력하세요...">
      <div id="sentence-result-inline" class="inline-result hidden"></div>
    </div>
  `;

  container.querySelector('#sentence-category-select').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    container.querySelectorAll('.category-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.cat === 'all' ? null : btn.dataset.cat;
    loadNewSentence(container);
  });

  textDisplay  = new TextDisplay(container.querySelector('#sentence-text-display'));
  statsDisplay = new StatsDisplay(container.querySelector('#sentence-stats'));
  container.querySelector('#sentence-skip-btn').onclick = () => loadNewSentence(container);

  loadNewSentence(container);
}

function loadNewSentence(container) {
  if (lang === 'en') {
    const enCat = selectedCategory ? KO_TO_EN_CAT[selectedCategory] : null;
    currentSentence = getRandomSentenceEn(enCat);
    // 뱃지는 한국어 카테고리명으로 표시
    const koLabel = selectedCategory || EN_TO_KO_CAT[currentSentence.category] || currentSentence.category;
    container.querySelector('#sentence-category-label').textContent = koLabel;
  } else {
    currentSentence = getRandomSentence(selectedCategory);
    container.querySelector('#sentence-category-label').textContent = currentSentence.category;
  }

  textDisplay.setTarget(currentSentence.text);
  statsDisplay.reset();
  container.querySelector('#sentence-result-inline').classList.add('hidden');

  if (ime) ime.destroy();
  if (engine) engine.reset(currentSentence.text, lang);
  else engine = new TypingEngine(currentSentence.text, lang);

  const inputEl = container.querySelector('#sentence-input');
  inputEl.value = '';
  inputEl.focus();

  ime = new IMEHandler(inputEl, {
    onUpdate: (val, composing, composingChar) => {
      if (!engine.isStarted()) engine.start();
      const result = engine.compare(val, composing ? composingChar : '');
      textDisplay.update(result);
      statsDisplay.update(engine.getStats(val));
    },
    onCommit: (val) => {
      if (engine.isComplete(val)) {
        engine.stop();
        showInlineResult(container, val);
      }
    },
  });
}

function showInlineResult(container, inputVal) {
  const stats = engine.getStats(inputVal);
  const wpmUnit = '타/분';
  ScoreStore.save({ mode: 'sentence', lang, category: currentSentence.category, wpm: stats.wpm, accuracy: stats.accuracy, elapsed: stats.elapsed });

  const el = container.querySelector('#sentence-result-inline');
  el.classList.remove('hidden');
  el.innerHTML = `
    <span>완료! 타수: <strong>${stats.wpm}${wpmUnit}</strong> &nbsp; 정확도: <strong>${stats.accuracy.toFixed(1)}%</strong></span>
    <button class="btn-primary btn-sm" id="sentence-next-btn">다음 문장 →</button>
  `;
  el.querySelector('#sentence-next-btn').onclick = () => loadNewSentence(container);
}

export function destroy() {
  if (ime) { ime.destroy(); ime = null; }
  engine = null; textDisplay = null; statsDisplay = null;
}
