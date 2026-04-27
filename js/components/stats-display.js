import { formatTime } from '../core/timer.js';

// 실시간 통계 표시 컴포넌트
export class StatsDisplay {
  constructor(container) {
    this._container = container;
    this._render();
  }

  _render() {
    this._container.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">타수</span>
        <span class="stat-value" id="stat-wpm">0</span>
        <span class="stat-unit">타/분</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">정확도</span>
        <span class="stat-value" id="stat-accuracy">100</span>
        <span class="stat-unit">%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">시간</span>
        <span class="stat-value" id="stat-time">00:00</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">진행</span>
        <span class="stat-value" id="stat-progress">0</span>
        <span class="stat-unit">%</span>
      </div>
    `;
    this._wpm      = this._container.querySelector('#stat-wpm');
    this._accuracy = this._container.querySelector('#stat-accuracy');
    this._time     = this._container.querySelector('#stat-time');
    this._progress = this._container.querySelector('#stat-progress');
  }

  update({ wpm = 0, accuracy = 100, elapsed = 0, inputLength = 0, targetLength = 1 } = {}) {
    this._wpm.textContent      = wpm;
    this._accuracy.textContent = accuracy.toFixed(1);
    this._time.textContent     = formatTime(elapsed);
    const pct = targetLength > 0 ? Math.round((inputLength / targetLength) * 100) : 0;
    this._progress.textContent = Math.min(100, pct);

    // 정확도에 따라 색상 변경
    this._accuracy.style.color =
      accuracy >= 95 ? 'var(--color-success)' :
      accuracy >= 80 ? 'var(--color-warning)' :
      'var(--color-error)';
  }

  // 카운트다운 모드 (타자 검정용)
  showCountdown(seconds) {
    this._time.textContent = formatTime(seconds);
    this._time.style.color = seconds <= 10 ? 'var(--color-error)' : '';
  }

  reset() {
    this.update();
  }
}
