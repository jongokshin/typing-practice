import { WORD_CATEGORIES, getRandomWords, getRandomWordsEn } from '../data/words.js';
import { IMEHandler } from '../core/ime.js';
import { TypingEngine } from '../core/typing-engine.js';
import { StatsDisplay } from '../components/stats-display.js';
import { ScoreStore } from '../storage/score-store.js';

let ime = null, engine = null, statsDisplay = null;
let words = [], currentIndex = 0, correctCount = 0, level = 'easy';
let startTime = null, lang = 'ko';

export function init(container) {
  lang = localStorage.getItem('typing_lang') || 'ko';
  renderSelect(container);
}

function renderSelect(container) {
  container.innerHTML = `
    <div class="mode-header">
      <h2>낱말 연습</h2>
    </div>
    <p class="mode-desc">단어를 정확하게 입력하는 연습입니다.</p>

    <div id="word-level-select" class="level-select">
      ${WORD_CATEGORIES.map(c => `
        <button class="level-btn" data-level="${c.id}">
          <span class="level-name">${c.label}</span>
          <span class="level-count">${c.count}개 단어</span>
        </button>
      `).join('')}
    </div>

    <div id="word-practice-area" class="practice-area hidden">
      <div class="practice-header">
        <button id="word-back-btn" class="btn-secondary">← 목록으로</button>
        <div id="word-progress-bar-wrap"><div id="word-progress-bar"></div></div>
        <span id="word-counter" class="word-counter">0 / 20</span>
      </div>
      <div id="word-display" class="word-display">
        <div id="word-prev" class="word-prev"></div>
        <div id="word-current" class="word-current"></div>
        <div id="word-next" class="word-next"></div>
      </div>
      <div id="word-feedback" class="word-feedback"></div>
      <input id="word-input" class="typing-input word-input" autocomplete="off"
             autocorrect="off" autocapitalize="off" spellcheck="false"
             placeholder="단어를 입력하고 스페이스 또는 엔터를 누르세요">
      <div id="word-stats" class="stats-bar"></div>
    </div>

    <div id="word-result" class="result-screen hidden"></div>
  `;

  container.querySelector('#word-level-select').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-level]');
    if (btn) startPractice(btn.dataset.level, container);
  });
}

function startPractice(selectedLevel, container) {
  level = selectedLevel;
  words = lang === 'en' ? getRandomWordsEn(level, 20) : getRandomWords(level, 20);
  currentIndex = 0;
  correctCount = 0;
  startTime = null;

  container.querySelector('#word-level-select').classList.add('hidden');
  container.querySelector('#word-result').classList.add('hidden');
  const area = container.querySelector('#word-practice-area');
  area.classList.remove('hidden');

  statsDisplay = new StatsDisplay(area.querySelector('#word-stats'));

  area.querySelector('#word-back-btn').onclick = () => {
    destroy();
    container.querySelector('#word-level-select').classList.remove('hidden');
    area.classList.add('hidden');
  };

  const inputEl = area.querySelector('#word-input');

  if (ime) ime.destroy();
  ime = new IMEHandler(inputEl, {
    onUpdate: (val, composing, composingChar) => {
      if (!startTime) startTime = Date.now();
      if (!composing && val.includes(' ')) {
        const word = val.replace(/\s+/g, '');
        if (word) submitWord(word, container);
        return;
      }
      highlightCurrentWord(container, val, composing ? composingChar : '');
    },
    onKeydown: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = inputEl.value.trim();
        if (val) submitWord(val, container);
      }
    },
    onCommit: () => {},
  });

  loadWord(container);
  inputEl.focus();
}

function loadWord(container) {
  if (currentIndex >= words.length) { showResult(container); return; }
  const area = container.querySelector('#word-practice-area');
  area.querySelector('#word-prev').textContent    = words[currentIndex - 1] || '';
  area.querySelector('#word-current').textContent = words[currentIndex];
  area.querySelector('#word-next').textContent    = words[currentIndex + 1] || '';
  area.querySelector('#word-feedback').textContent = '';
  area.querySelector('#word-counter').textContent = `${currentIndex} / ${words.length}`;
  area.querySelector('#word-progress-bar').style.width = (currentIndex / words.length * 100) + '%';

  const inputEl = area.querySelector('#word-input');
  inputEl.value = '';
  inputEl.focus();

  engine = new TypingEngine(words[currentIndex], lang);
  engine.start();
}

function highlightCurrentWord(container, val, composingChar) {
  const cur = container.querySelector('#word-current');
  const target = words[currentIndex] || '';
  const display = val + composingChar;
  let html = '';
  for (let i = 0; i < target.length; i++) {
    const inputCh = display[i];
    if (inputCh === undefined) {
      html += `<span class="char pending">${target[i]}</span>`;
    } else if (i === display.length - 1 && composingChar) {
      html += `<span class="char composing">${target[i]}</span>`;
    } else {
      html += `<span class="char ${inputCh === target[i] ? 'correct' : 'incorrect'}">${target[i]}</span>`;
    }
  }
  cur.innerHTML = html;
}

function submitWord(input, container) {
  const target = words[currentIndex];
  const isCorrect = input === target;
  if (isCorrect) correctCount++;
  if (ime) ime.reset();

  const fb = container.querySelector('#word-feedback');
  fb.textContent = isCorrect ? '정확합니다!' : `오답: ${target}`;
  fb.className   = `word-feedback ${isCorrect ? 'correct' : 'incorrect'}`;

  currentIndex++;
  if (statsDisplay && engine) statsDisplay.update(engine.getStats(target));
  setTimeout(() => loadWord(container), isCorrect ? 300 : 800);
}

function showResult(container) {
  destroy();
  container.querySelector('#word-practice-area').classList.add('hidden');
  const elapsed  = startTime ? (Date.now() - startTime) / 1000 : 1;
  const accuracy = Math.round((correctCount / words.length) * 100);
  ScoreStore.save({ mode: 'word', level, lang, correctCount, total: words.length, accuracy, elapsed });

  const resultEl = container.querySelector('#word-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <div class="result-card">
      <h2>연습 완료!</h2>
      <div class="result-stats">
        <div class="result-stat"><span class="r-label">정답</span><span class="r-value">${correctCount} / ${words.length}</span></div>
        <div class="result-stat"><span class="r-label">정확도</span><span class="r-value">${accuracy}%</span></div>
        <div class="result-stat"><span class="r-label">소요 시간</span><span class="r-value">${Math.round(elapsed)}초</span></div>
      </div>
      <div class="result-actions">
        <button class="btn-primary" id="word-again-btn">다시 하기</button>
        <button class="btn-secondary" id="word-home-btn">목록으로</button>
      </div>
    </div>
  `;
  resultEl.querySelector('#word-again-btn').onclick = () => startPractice(level, container);
  resultEl.querySelector('#word-home-btn').onclick  = () => {
    resultEl.classList.add('hidden');
    container.querySelector('#word-level-select').classList.remove('hidden');
  };
}

export function destroy() {
  if (ime) { ime.destroy(); ime = null; }
  engine = null; statsDisplay = null;
}
