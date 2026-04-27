export class Timer {
  constructor(onTick) {
    this._onTick = onTick;
    this._startTime = null;
    this._elapsed = 0;      // 이전 구간 누적 (pause 지원)
    this._raf = null;
    this._running = false;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._startTime = performance.now() - this._elapsed;
    this._tick();
  }

  pause() {
    if (!this._running) return;
    this._running = false;
    this._elapsed = performance.now() - this._startTime;
    cancelAnimationFrame(this._raf);
  }

  reset() {
    this._running = false;
    this._elapsed = 0;
    this._startTime = null;
    cancelAnimationFrame(this._raf);
  }

  getElapsedMs() {
    if (!this._startTime) return 0;
    if (this._running) return performance.now() - this._startTime;
    return this._elapsed;
  }

  getElapsedSeconds() {
    return this.getElapsedMs() / 1000;
  }

  _tick() {
    if (!this._running) return;
    this._onTick && this._onTick(this.getElapsedSeconds());
    this._raf = requestAnimationFrame(() => this._tick());
  }
}

// 초를 MM:SS 형식으로 변환
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// 카운트다운 타이머
export class CountdownTimer {
  constructor(totalSeconds, onTick, onEnd) {
    this._total = totalSeconds;
    this._onTick = onTick;
    this._onEnd = onEnd;
    this._inner = new Timer((elapsed) => {
      const remaining = Math.max(0, totalSeconds - elapsed);
      onTick && onTick(remaining);
      if (remaining <= 0) {
        this._inner.reset();
        onEnd && onEnd();
      }
    });
  }

  start() { this._inner.start(); }
  pause() { this._inner.pause(); }
  reset() { this._inner.reset(); }
  getRemaining() { return Math.max(0, this._total - this._inner.getElapsedSeconds()); }
}
