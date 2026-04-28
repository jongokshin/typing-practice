import { Router } from './router.js';
import * as finger   from './modes/finger-practice.js';
import * as word     from './modes/word-practice.js';
import * as sentence from './modes/sentence-practice.js';
import * as exam     from './modes/exam.js';
import * as game     from './modes/game.js';
import { ScoreStore } from './storage/score-store.js';
import { getLeaderboard } from './services/ranking.js';
import { isFirebaseConfigured } from './services/firebase.js';

function initHome(container) {
  const recent  = ScoreStore.getRecent(5);
  const bestExam = ScoreStore.getBest('exam');

  container.querySelector('#home-best-wpm').textContent =
    bestExam ? bestExam.wpm + ' 타/분' : '기록 없음';

  const listEl = container.querySelector('#home-recent-list');
  if (!recent.length) {
    listEl.innerHTML = '<li class="empty">아직 기록이 없습니다.</li>';
  } else {
    listEl.innerHTML = recent.map(r => `
      <li>
        <span class="recent-mode">${modeLabel(r.mode)}</span>
        <span class="recent-wpm">${r.wpm ?? '-'} 타/분</span>
        <span class="recent-acc">${r.accuracy?.toFixed(1) ?? '-'}%</span>
        <span class="recent-date">${new Date(r.date).toLocaleDateString('ko-KR')}</span>
      </li>
    `).join('');
  }
}

function modeLabel(mode) {
  return { finger: '자리 연습', word: '낱말 연습', sentence: '단문 연습', exam: '타자 검정', game: '게임' }[mode] || mode;
}

function initResults(container) {
  const all      = ScoreStore.getAll();
  const bestExam = ScoreStore.getBest('exam');
  const fbReady  = isFirebaseConfigured();

  container.innerHTML = `
    <div class="mode-header">
      <h2>기록 & 랭킹</h2>
      <button id="clear-scores-btn" class="btn-danger btn-sm">내 기록 초기화</button>
    </div>

    <!-- 탭 -->
    <div class="results-tabs">
      ${fbReady ? `<button class="tab-btn active" data-tab="ranking">🏆 전체 랭킹</button>` : ''}
      <button class="tab-btn ${fbReady ? '' : 'active'}" data-tab="my">📋 내 기록</button>
    </div>

    <!-- 전체 랭킹 탭 -->
    ${fbReady ? `
    <div id="tab-ranking" class="tab-panel ${fbReady ? 'active' : 'hidden'}">
      <div class="ranking-filter">
        <button class="lang-filter-btn ${(localStorage.getItem('typing_lang')||'ko')==='ko' ? 'active' : ''}" data-lang="ko">한글</button>
        <button class="lang-filter-btn ${(localStorage.getItem('typing_lang')||'ko')==='en' ? 'active' : ''}" data-lang="en">English</button>
        <span class="filter-sep">|</span>
        <button class="filter-btn active" data-dur="all">전체</button>
        <button class="filter-btn" data-dur="1">1분</button>
        <button class="filter-btn" data-dur="3">3분</button>
        <button class="filter-btn" data-dur="5">5분</button>
        <button id="ranking-refresh-btn" class="btn-secondary btn-sm" style="margin-left:auto">↻ 새로고침</button>
      </div>
      <div id="ranking-table-wrap" class="scores-table-wrap">
        <div class="loading-msg">랭킹 불러오는 중...</div>
      </div>
    </div>` : ''}

    <!-- 내 기록 탭 -->
    <div id="tab-my" class="tab-panel ${fbReady ? 'hidden' : 'active'}">
      ${bestExam ? `
      <div class="best-record-card">
        <span class="best-label">타자 검정 최고 기록</span>
        <span class="best-wpm">${bestExam.wpm} <small>타/분</small></span>
        <span class="best-acc">${bestExam.accuracy?.toFixed(1)}% 정확도</span>
      </div>` : ''}
      <div class="scores-table-wrap">
        <table class="scores-table">
          <thead><tr><th>모드</th><th>타수</th><th>정확도</th><th>날짜</th></tr></thead>
          <tbody>
            ${all.length ? all.map(r => `
              <tr>
                <td>${modeLabel(r.mode)}</td>
                <td>${r.wpm ?? '-'}</td>
                <td>${r.accuracy?.toFixed(1) ?? '-'}%</td>
                <td>${new Date(r.date).toLocaleDateString('ko-KR')}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="empty">기록이 없습니다.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // 탭 전환
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    };
  });

  // 기록 초기화
  container.querySelector('#clear-scores-btn')?.addEventListener('click', () => {
    if (confirm('내 기록을 모두 삭제하시겠습니까?')) {
      ScoreStore.clear();
      initResults(container);
    }
  });

  if (!fbReady) return;

  // 랭킹 필터
  let currentDur = null;
  let currentLang = localStorage.getItem('typing_lang') || 'ko';

  const loadRanking = async (duration, lang) => {
    currentDur  = duration;
    currentLang = lang;
    const wrap = container.querySelector('#ranking-table-wrap');
    wrap.innerHTML = '<div class="loading-msg">불러오는 중...</div>';
    const rows = await getLeaderboard(duration, lang);
    wrap.innerHTML = renderRankingTable(rows);
  };

  container.querySelectorAll('.lang-filter-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.lang-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadRanking(currentDur, btn.dataset.lang);
    };
  });

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadRanking(btn.dataset.dur === 'all' ? null : parseInt(btn.dataset.dur), currentLang);
    };
  });

  container.querySelector('#ranking-refresh-btn').onclick = () => loadRanking(currentDur, currentLang);

  // 초기 로드
  loadRanking(null, currentLang);
}

function renderRankingTable(rows) {
  if (!rows.length) {
    return '<p class="empty-ranking">아직 등록된 기록이 없습니다.</p>';
  }
  const myNickname = localStorage.getItem('typing_nickname') || '';
  return `
    <table class="scores-table ranking-table">
      <thead><tr>
        <th>순위</th><th>닉네임</th><th>타수</th><th>정확도</th><th>시간</th><th>날짜</th>
      </tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr class="${r.nickname === myNickname ? 'my-row' : ''}">
            <td><span class="rank-badge rank-${r.rank}">${r.rank}</span></td>
            <td>${r.nickname}${r.nickname === myNickname ? ' <span class="my-tag">나</span>' : ''}</td>
            <td><strong>${r.wpm}</strong> 타/분</td>
            <td>${r.accuracy?.toFixed(1) ?? '-'}%</td>
            <td>${r.duration}분</td>
            <td>${r.date?.toDate ? r.date.toDate().toLocaleDateString('ko-KR') : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

const router = new Router([
  { path: '/',         viewId: 'view-home',     init: initHome },
  { path: '/finger',   viewId: 'view-finger',   init: finger.init,   destroy: finger.destroy },
  { path: '/word',     viewId: 'view-word',     init: word.init,     destroy: word.destroy },
  { path: '/sentence', viewId: 'view-sentence', init: sentence.init, destroy: sentence.destroy },
  { path: '/exam',     viewId: 'view-exam',     init: exam.init,     destroy: exam.destroy },
  { path: '/game',     viewId: 'view-game',     init: game.init,     destroy: game.destroy },
  { path: '/results',  viewId: 'view-results',  init: initResults },
]);

// 헤더 언어 전환
(function() {
  const savedLang = localStorage.getItem('typing_lang') || 'ko';
  document.querySelectorAll('.header-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === savedLang);
  });
  document.getElementById('header-lang-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const newLang = btn.dataset.lang;
    if (newLang === (localStorage.getItem('typing_lang') || 'ko')) return;
    localStorage.setItem('typing_lang', newLang);
    document.querySelectorAll('.header-lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === newLang);
    });
    router.reload();
  });
})();
