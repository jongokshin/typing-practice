import { WORD_LIST } from '../data/words.js';
import { IMEHandler } from '../core/ime.js';

const SPEEDS = { easy: 12, medium: 7, hard: 4 }; // 낙하 시간(초)
const SPAWN_INTERVALS = { easy: 3000, medium: 2000, hard: 1200 };
const WORD_POOL = [...WORD_LIST.easy, ...WORD_LIST.medium];

let ime = null;
let gameState = 'idle'; // 'idle' | 'playing' | 'over'
let fallingWords = [];
let score = 0, lives = 3, level = 'easy';
let spawnTimer = null, frameId = null;
let wordIdCounter = 0;
let container = null;

export function init(cont) {
  container = cont;
  gameState = 'idle';

  container.innerHTML = `
    <div class="mode-header">
      <h2>낙하 게임</h2>
      <p class="mode-desc">떨어지는 단어를 빠르게 입력해서 없애세요!</p>
    </div>

    <div id="game-setup" class="game-setup">
      <div class="difficulty-select">
        <button class="diff-btn active" data-diff="easy">쉬움</button>
        <button class="diff-btn" data-diff="medium">보통</button>
        <button class="diff-btn" data-diff="hard">어려움</button>
      </div>
      <button id="game-start-btn" class="btn-primary btn-lg">게임 시작</button>
    </div>

    <div id="game-area" class="game-area hidden">
      <div class="game-hud">
        <div class="hud-score">점수: <strong id="game-score">0</strong></div>
        <div class="hud-lives" id="game-lives">♥ ♥ ♥</div>
        <button id="game-pause-btn" class="btn-secondary btn-sm">일시정지</button>
      </div>
      <div id="game-field" class="game-field">
        <div id="game-baseline" class="game-baseline"></div>
      </div>
      <input id="game-input" class="typing-input game-input" autocomplete="off"
             autocorrect="off" autocapitalize="off" spellcheck="false"
             placeholder="단어를 입력하세요...">
    </div>

    <div id="game-over" class="result-screen hidden">
      <div class="result-card">
        <h2>게임 오버</h2>
        <div class="result-stats">
          <div class="result-stat main">
            <span class="r-label">점수</span>
            <span class="r-value big" id="go-score">0</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" id="game-retry-btn">다시 하기</button>
          <button class="btn-secondary" id="game-home-btn">메뉴로</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('.difficulty-select').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-diff]');
    if (!btn) return;
    container.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    level = btn.dataset.diff;
  });

  container.querySelector('#game-start-btn').onclick = () => startGame();
  container.querySelector('#game-retry-btn').onclick = () => startGame();
  container.querySelector('#game-home-btn').onclick  = () => {
    destroy();
    container.querySelector('#game-over').classList.add('hidden');
    container.querySelector('#game-setup').classList.remove('hidden');
  };
}

function startGame() {
  stopGame();
  gameState = 'playing';
  score = 0; lives = 3; fallingWords = []; wordIdCounter = 0;

  container.querySelector('#game-setup').classList.add('hidden');
  container.querySelector('#game-over').classList.add('hidden');
  const area = container.querySelector('#game-area');
  area.classList.remove('hidden');

  updateHUD();

  container.querySelector('#game-pause-btn').onclick = () => togglePause();

  const field = container.querySelector('#game-field');
  // 기존 단어 DOM 정리
  field.querySelectorAll('.falling-word').forEach(el => el.remove());

  const inputEl = container.querySelector('#game-input');
  inputEl.value = '';
  inputEl.disabled = false;
  inputEl.focus();

  if (ime) ime.destroy();
  ime = new IMEHandler(inputEl, {
    onUpdate: (val, composing, composingChar) => {
      const display = val + (composing ? composingChar : '');
      checkMatch(display, val, composing, field, inputEl);
    },
    onCommit: () => {},
  });

  spawnWord(field);
  spawnTimer = setInterval(() => {
    if (gameState === 'playing') spawnWord(field);
  }, SPAWN_INTERVALS[level]);

  gameLoop(field, inputEl);
}

function spawnWord(field) {
  const allWords = WORD_POOL;
  const text = allWords[Math.floor(Math.random() * allWords.length)];
  const id = ++wordIdCounter;
  const x  = 5 + Math.random() * 80; // 5% ~ 85%
  const duration = SPEEDS[level] + (Math.random() * 2 - 1);

  const el = document.createElement('div');
  el.className = 'falling-word';
  el.dataset.id = id;
  el.style.left = x + '%';
  el.style.animationDuration = duration + 's';
  el.textContent = text;

  el.addEventListener('animationend', () => {
    if (gameState !== 'playing') return;
    // 이미 매칭·제거된 단어는 건너뜀 (destroy 애니메이션 종료 이벤트 방지)
    if (!fallingWords.find(w => w.id === id)) return;
    el.remove();
    fallingWords = fallingWords.filter(w => w.id !== id);
    lives--;
    updateHUD();
    flashBaseline(field);
    if (lives <= 0) endGame();
  });

  field.appendChild(el);
  fallingWords.push({ id, text, el });
}

function checkMatch(display, committed, composing, field, inputEl) {
  // 부분 일치 하이라이트
  fallingWords.forEach(w => {
    w.el.classList.remove('partial');
    if (display && w.text.startsWith(display) && display.length > 0) {
      w.el.classList.add('partial');
    }
  });

  // 완전 일치 (확정 텍스트 기준)
  if (!composing) {
    const matched = fallingWords.find(w => w.text === committed);
    if (matched) {
      matched.el.classList.add('destroyed');
      setTimeout(() => matched.el.remove(), 300);
      fallingWords = fallingWords.filter(w => w.id !== matched.id);
      score += matched.text.length * 10;
      updateHUD();
      // setTimeout으로 현재 이벤트 루프 종료 후 초기화 (IME 상태 충돌 방지)
      setTimeout(() => { if (ime) ime.reset(); }, 0);
    }
  }
}

function gameLoop(field) {
  if (gameState !== 'playing') return;
  frameId = requestAnimationFrame(() => gameLoop(field));
}

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    container.querySelector('#game-pause-btn').textContent = '계속';
    fallingWords.forEach(w => w.el.style.animationPlayState = 'paused');
  } else if (gameState === 'paused') {
    gameState = 'playing';
    container.querySelector('#game-pause-btn').textContent = '일시정지';
    fallingWords.forEach(w => w.el.style.animationPlayState = 'running');
  }
}

function endGame() {
  stopGame();
  gameState = 'over';
  container.querySelector('#game-area').classList.add('hidden');
  const over = container.querySelector('#game-over');
  over.classList.remove('hidden');
  over.querySelector('#go-score').textContent = score;
}

function stopGame() {
  gameState = 'idle';
  clearInterval(spawnTimer);
  cancelAnimationFrame(frameId);
  if (ime) { ime.destroy(); ime = null; }
}

function updateHUD() {
  const scoreEl = container.querySelector('#game-score');
  const livesEl = container.querySelector('#game-lives');
  if (scoreEl) scoreEl.textContent = score;
  if (livesEl) livesEl.innerHTML = '♥ '.repeat(Math.max(0, lives)).trim() +
    (lives < 3 ? ' <span style="opacity:.3">' + '♥ '.repeat(3 - lives).trim() + '</span>' : '');
}

function flashBaseline(field) {
  const bl = field.querySelector('#game-baseline');
  if (!bl) return;
  bl.classList.add('flash');
  setTimeout(() => bl.classList.remove('flash'), 400);
}

export function destroy() {
  stopGame();
  fallingWords = [];
  container = null;
}
