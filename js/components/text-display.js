// 타이핑 텍스트 표시 컴포넌트 (정오 색상 하이라이트)

export class TextDisplay {
  constructor(container) {
    this._container = container;
    this._spans = [];
    this._currentIndex = 0;
  }

  // 목표 텍스트 설정 (초기화)
  setTarget(text) {
    this._container.innerHTML = '';
    this._spans = [];
    this._currentIndex = 0;

    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char pending';
      span.textContent = ch === ' ' ? ' ' : ch; // 공백 → &nbsp;
      if (ch === '\n') {
        span.className = 'char pending newline';
        span.textContent = '↵';
      }
      this._container.appendChild(span);
      this._spans.push({ el: span, char: ch });
    }
  }

  // 비교 결과 배열로 UI 업데이트
  // result: { char, input, status: 'correct'|'incorrect'|'composing'|'pending', index }[]
  update(result) {
    let newCurrentIndex = 0;

    result.forEach(({ status, index }) => {
      const item = this._spans[index];
      if (!item) return;
      item.el.className = `char ${status}`;
      if (status !== 'pending') newCurrentIndex = index + 1;
    });

    this._currentIndex = newCurrentIndex;
    this._scrollToCurrent();
  }

  // 현재 입력 위치가 보이도록 스크롤
  _scrollToCurrent() {
    const cur = this._spans[this._currentIndex];
    if (cur) {
      cur.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  reset() {
    this._spans.forEach(({ el }) => {
      el.className = 'char pending';
    });
    this._currentIndex = 0;
  }
}
