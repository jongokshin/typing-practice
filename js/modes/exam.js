import { getExamText, getExamTextEn, getExamPassage, EXAM_PASSAGES_KO, EXAM_PASSAGES_EN } from '../data/sentences.js';
import { IMEHandler } from '../core/ime.js';
import { TypingEngine } from '../core/typing-engine.js';
import { TextDisplay } from '../components/text-display.js';
import { CountdownTimer, formatTime } from '../core/timer.js';
import { ScoreStore } from '../storage/score-store.js';
import { saveRanking, getSavedNickname, saveNickname } from '../services/ranking.js';
import { isFirebaseConfigured } from '../services/firebase.js';

let ime = null, engine = null, textDisplay = null, countdown = null;
let selectedDuration = 1, examStarted = false;
let totalInput = '';
let lang = 'ko';
let selectedPassageId = null;

export function init(container) {
  lang = localStorage.getItem('typing_lang') || 'ko';
  selectedPassageId = null;
  renderSetup(container);
}

function renderSetup(container) {
  const passages = lang === 'en' ? EXAM_PASSAGES_EN : EXAM_PASSAGES_KO;

  container.innerHTML = `
    <div class="mode-header">
      <h2>타자 검정</h2>
    </div>
    <p class="mode-desc">제한 시간 동안 타수와 정확도를 측정합니다.</p>

    <div id="exam-setup" class="exam-setup">
      <h3>지문 선택</h3>
      <div class="passage-cards" id="exam-passage-cards">
        <button class="passage-card active" data-pid="">
          <span class="passage-card-title">랜덤</span>
          <span class="passage-card-author">매번 다른 지문</span>
        </button>
        ${passages.map(p => `
          <button class="passage-card" data-pid="${p.id}">
            <span class="passage-card-title">${p.title}</span>
            <span class="passage-card-author">${p.author}</span>
          </button>
        `).join('')}
      </div>

      <h3>시험 시간 선택</h3>
      <div class="duration-select">
        <button class="duration-btn active" data-min="1">1분</button>
        <button class="duration-btn" data-min="3">3분</button>
        <button class="duration-btn" data-min="5">5분</button>
      </div>
      <button id="exam-start-btn" class="btn-primary btn-lg">시험 시작</button>
    </div>

    <div id="exam-area" class="practice-area hidden">
      <div class="exam-header">
        <div class="exam-timer-wrap">
          <span class="exam-timer-label">남은 시간</span>
          <span id="exam-timer" class="exam-timer">01:00</span>
        </div>
        <div class="exam-live-stats">
          <span>타수: <strong id="exam-wpm">0</strong> <span id="exam-wpm-unit">타/분</span></span>
          <span>정확도: <strong id="exam-acc">100.0</strong>%</span>
        </div>
      </div>
      <div id="exam-passage-info" class="exam-passage-info"></div>
      <div id="exam-text-display" class="text-display exam-text-display"></div>
      <input id="exam-input" class="typing-input" autocomplete="off"
             autocorrect="off" autocapitalize="off" spellcheck="false"
             placeholder="시험이 시작되면 이 곳에 입력하세요...">
    </div>

    <div id="exam-result" class="result-screen hidden"></div>

    <!-- 닉네임 입력 모달 -->
    <div id="nickname-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <h3>랭킹에 등록하기</h3>
        <p class="modal-desc">닉네임을 입력하면 전체 랭킹에 등록됩니다.</p>
        <input id="nickname-input" class="modal-input" type="text" maxlength="12"
               placeholder="닉네임 (최대 12자)">
        <div id="nickname-feedback" class="nickname-feedback"></div>
        <div class="modal-actions">
          <button id="nickname-submit-btn" class="btn-primary">등록</button>
          <button id="nickname-cancel-btn" class="btn-secondary">취소</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#exam-passage-cards').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pid]');
    if (!btn) return;
    container.querySelectorAll('.passage-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPassageId = btn.dataset.pid || null;
  });

  container.querySelector('.duration-select').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-min]');
    if (!btn) return;
    container.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDuration = parseInt(btn.dataset.min);
    container.querySelector('#exam-timer').textContent = formatTime(selectedDuration * 60);
  });

  container.querySelector('#exam-start-btn').onclick = () => startExam(container);
}

function startExam(container) {
  examStarted = false;
  totalInput = '';

  const text = lang === 'en' ? getExamTextEn(selectedDuration, selectedPassageId) : getExamText(selectedDuration, selectedPassageId);
  const passage = getExamPassage(lang, selectedPassageId);
  const infoEl = area.querySelector('#exam-passage-info');
  if (infoEl) infoEl.textContent = `${passage.title}  —  ${passage.author}`;

  container.querySelector('#exam-setup').classList.add('hidden');
  container.querySelector('#exam-result').classList.add('hidden');
  const area = container.querySelector('#exam-area');
  area.classList.remove('hidden');

  textDisplay = new TextDisplay(area.querySelector('#exam-text-display'));
  textDisplay.setTarget(text);
  engine = new TypingEngine(text, lang);

  const timerEl    = area.querySelector('#exam-timer');
  const wpmEl      = area.querySelector('#exam-wpm');
  const accEl      = area.querySelector('#exam-acc');
  const wpmUnitEl  = area.querySelector('#exam-wpm-unit');
  if (wpmUnitEl) wpmUnitEl.textContent = '타/분';

  countdown = new CountdownTimer(
    selectedDuration * 60,
    (remaining) => {
      timerEl.textContent = formatTime(remaining);
      timerEl.style.color = remaining <= 10 ? 'var(--color-error)' : '';
    },
    () => endExam(container)
  );

  const inputEl = area.querySelector('#exam-input');
  inputEl.value = '';
  inputEl.disabled = false;

  if (ime) ime.destroy();
  ime = new IMEHandler(inputEl, {
    onUpdate: (val, composing, composingChar) => {
      if (!examStarted) {
        examStarted = true;
        engine.start();
        countdown.start();
      }
      totalInput = val;
      const result = engine.compare(val, composing ? composingChar : '');
      textDisplay.update(result);
      const stats = engine.getStats(val);
      wpmEl.textContent = stats.wpm;
      accEl.textContent = stats.accuracy.toFixed(1);
    },
    onCommit: () => {},
  });

  inputEl.focus();
}

function endExam(container) {
  if (ime) { ime.destroy(); ime = null; }
  if (engine) engine.stop();

  const area = container.querySelector('#exam-area');
  area.querySelector('#exam-input').disabled = true;

  const stats = engine.getStats(totalInput);

  ScoreStore.save({
    mode: 'exam',
    lang,
    duration: selectedDuration,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    elapsed: stats.elapsed,
    totalChars: stats.inputLength,
    correctChars: stats.correctChars,
  });

  area.classList.add('hidden');
  showResult(container, stats);
}

function showResult(container, stats) {
  const wpmUnit  = '타/분';
  const resultEl = container.querySelector('#exam-result');
  resultEl.classList.remove('hidden');

  const best = ScoreStore.getBest('exam');
  const firebaseReady = isFirebaseConfigured();

  resultEl.innerHTML = `
    <div class="result-card">
      <h2>검정 완료</h2>
      <div class="result-stats">
        <div class="result-stat main">
          <span class="r-label">타수</span>
          <span class="r-value big">${stats.wpm}<small>${wpmUnit}</small></span>
        </div>
        <div class="result-stat main">
          <span class="r-label">정확도</span>
          <span class="r-value big">${stats.accuracy.toFixed(1)}<small>%</small></span>
        </div>
        <div class="result-stat">
          <span class="r-label">입력 글자</span>
          <span class="r-value">${stats.inputLength}자</span>
        </div>
        <div class="result-stat">
          <span class="r-label">시험 시간</span>
          <span class="r-value">${selectedDuration}분</span>
        </div>
        ${best ? `
        <div class="result-stat">
          <span class="r-label">내 최고 기록</span>
          <span class="r-value">${best.wpm}${wpmUnit}</span>
        </div>` : ''}
      </div>
      <div id="ranking-result-msg" class="ranking-result-msg"></div>
      <div class="result-actions">
        ${firebaseReady ? `<button class="btn-accent" id="exam-ranking-btn">🏆 랭킹 등록</button>` : ''}
        <button class="btn-primary" id="exam-retry-btn">다시 시험</button>
        <button class="btn-secondary" id="exam-home-btn">설정으로</button>
      </div>
    </div>
  `;

  if (firebaseReady) {
    resultEl.querySelector('#exam-ranking-btn').onclick = () =>
      openNicknameModal(container, stats);
  }
  resultEl.querySelector('#exam-retry-btn').onclick = () => startExam(container);
  resultEl.querySelector('#exam-home-btn').onclick  = () => {
    resultEl.classList.add('hidden');
    container.querySelector('#exam-setup').classList.remove('hidden');
  };
}

function openNicknameModal(container, stats) {
  const modal    = container.querySelector('#nickname-modal');
  const input    = container.querySelector('#nickname-input');
  const feedback = container.querySelector('#nickname-feedback');
  const submitBtn = container.querySelector('#nickname-submit-btn');
  const cancelBtn = container.querySelector('#nickname-cancel-btn');

  input.value = getSavedNickname();
  feedback.textContent = '';
  modal.classList.remove('hidden');
  input.focus();

  const cleanup = () => modal.classList.add('hidden');

  cancelBtn.onclick = cleanup;
  modal.onclick = (e) => { if (e.target === modal) cleanup(); };

  submitBtn.onclick = async () => {
    const name = input.value.trim();
    if (!name) { feedback.textContent = '닉네임을 입력해주세요.'; return; }
    if (name.length < 2) { feedback.textContent = '닉네임은 2자 이상이어야 합니다.'; return; }

    submitBtn.disabled = true;
    feedback.textContent = '등록 중...';
    saveNickname(name);

    const result = await saveRanking({
      nickname: name,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      duration: selectedDuration,
      lang,
    });

    submitBtn.disabled = false;
    cleanup();

    const msgEl = container.querySelector('#ranking-result-msg');
    if (result.error === 'not_configured') {
      msgEl.textContent = 'Firebase 설정이 필요합니다.';
      msgEl.className = 'ranking-result-msg error';
    } else if (result.saved) {
      msgEl.textContent = result.rank
        ? `🎉 등록 완료! 현재 ${result.rank}위`
        : '🎉 랭킹에 등록되었습니다!';
      msgEl.className = 'ranking-result-msg success';
    } else {
      msgEl.textContent = `이미 더 좋은 기록이 있습니다 (기존 ${result.prevWpm}타/분)`;
      msgEl.className = 'ranking-result-msg info';
    }
  };

  input.onkeydown = (e) => { if (e.key === 'Enter') submitBtn.click(); };
}

export function destroy() {
  if (ime)      { ime.destroy(); ime = null; }
  if (countdown){ countdown.reset(); countdown = null; }
  engine = null; textDisplay = null; examStarted = false;
}
