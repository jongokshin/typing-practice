import { FINGER_LESSONS } from '../data/finger-lessons.js';
import { IMEHandler } from '../core/ime.js';
import { TypingEngine } from '../core/typing-engine.js';
import { TextDisplay } from '../components/text-display.js';
import { StatsDisplay } from '../components/stats-display.js';
import { KeyboardVisualizer } from '../components/keyboard.js';

let ime = null, engine = null, textDisplay = null, statsDisplay = null, keyboard = null;
let currentLesson = null, currentLineIndex = 0;

export function init(container) {
  container.innerHTML = `
    <div class="mode-header">
      <h2>자리 연습</h2>
      <p class="mode-desc">손가락 위치를 익히는 기본 연습입니다.</p>
    </div>

    <div id="finger-lesson-select" class="lesson-grid">
      ${FINGER_LESSONS.map(l => `
        <button class="lesson-card" data-lesson="${l.id}">
          <h3>${l.title}</h3>
          <p>${l.description}</p>
        </button>
      `).join('')}
    </div>

    <div id="finger-practice-area" class="practice-area hidden">
      <div class="practice-header">
        <button id="finger-back-btn" class="btn-secondary">← 목록으로</button>
        <h3 id="finger-lesson-title"></h3>
      </div>
      <div id="finger-keyboard-wrap"></div>
      <div id="finger-text-display" class="text-display"></div>
      <div id="finger-stats" class="stats-bar"></div>
      <input id="finger-input" class="typing-input" autocomplete="off" autocorrect="off"
             autocapitalize="off" spellcheck="false" placeholder="여기에 입력하세요...">
      <div class="practice-controls">
        <button id="finger-retry-btn" class="btn-primary">다시 시도</button>
        <button id="finger-next-btn" class="btn-primary hidden">다음 줄 →</button>
      </div>
    </div>
  `;

  container.querySelector('#finger-lesson-select').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lesson]');
    if (btn) startLesson(btn.dataset.lesson, container);
  });
}

function startLesson(lessonId, container) {
  currentLesson = FINGER_LESSONS.find(l => l.id === lessonId);
  if (!currentLesson) return;
  currentLineIndex = 0;

  container.querySelector('#finger-lesson-select').classList.add('hidden');
  const area = container.querySelector('#finger-practice-area');
  area.classList.remove('hidden');
  area.querySelector('#finger-lesson-title').textContent = currentLesson.title;

  // 키보드
  const kbWrap = area.querySelector('#finger-keyboard-wrap');
  keyboard = new KeyboardVisualizer(kbWrap);
  keyboard.showFingerGuide(currentLesson.fingerGuide);

  // 텍스트 디스플레이
  textDisplay = new TextDisplay(area.querySelector('#finger-text-display'));

  // 통계
  statsDisplay = new StatsDisplay(area.querySelector('#finger-stats'));

  // 뒤로가기
  area.querySelector('#finger-back-btn').onclick = () => {
    destroy();
    container.querySelector('#finger-lesson-select').classList.remove('hidden');
    area.classList.add('hidden');
  };

  area.querySelector('#finger-retry-btn').onclick = () => loadLine(area);
  area.querySelector('#finger-next-btn').onclick = () => {
    currentLineIndex = (currentLineIndex + 1) % currentLesson.lines.length;
    loadLine(area);
  };

  loadLine(area);
}

function loadLine(area) {
  const line = currentLesson.lines[currentLineIndex];

  if (ime) ime.destroy();
  if (engine) engine.reset(line);
  else engine = new TypingEngine(line);

  textDisplay.setTarget(line);
  statsDisplay.reset();

  area.querySelector('#finger-next-btn').classList.add('hidden');

  const inputEl = area.querySelector('#finger-input');
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
        area.querySelector('#finger-next-btn').classList.remove('hidden');
      }
    },
  });
}

export function destroy() {
  if (ime) { ime.destroy(); ime = null; }
  engine = null; textDisplay = null; statsDisplay = null; keyboard = null;
  currentLesson = null;
}
