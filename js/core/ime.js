// 한글 IME 조합 입력 처리 핸들러
// compositionstart/update/end 이벤트로 조합 상태를 추적

export class IMEHandler {
  constructor(inputEl, { onUpdate, onCommit, onKeydown } = {}) {
    this._el = inputEl;
    this._onUpdate = onUpdate || (() => {});
    this._onCommit = onCommit || (() => {});
    this._onKeydown = onKeydown || (() => {});

    this.composing = false;
    this._composingChar = '';

    this._listeners = [];
    this._bind();
  }

  _on(el, event, handler) {
    el.addEventListener(event, handler);
    this._listeners.push({ el, event, handler });
  }

  _bind() {
    this._on(this._el, 'compositionstart', () => {
      this.composing = true;
      this._composingChar = '';
    });

    this._on(this._el, 'compositionupdate', (e) => {
      this._composingChar = e.data || '';
      // 조합 중 실시간 미리보기: input.value + 조합 글자
      this._onUpdate(this._el.value, true, this._composingChar);
    });

    this._on(this._el, 'compositionend', (e) => {
      this.composing = false;
      this._composingChar = '';
      // compositionend 후 input 이벤트가 뒤따라 오므로 여기서는 상태만 초기화
      this._onCommit(this._el.value);
      this._onUpdate(this._el.value, false, '');
    });

    this._on(this._el, 'input', () => {
      if (!this.composing) {
        this._onUpdate(this._el.value, false, '');
      }
    });

    this._on(this._el, 'keydown', (e) => {
      this._onKeydown(e);
    });
  }

  // 현재 입력값 (조합 중 글자 포함)
  getValue() {
    return this._el.value + (this.composing ? this._composingChar : '');
  }

  reset() {
    this.composing = false;
    this._composingChar = '';
    this._el.value = '';
  }

  destroy() {
    for (const { el, event, handler } of this._listeners) {
      el.removeEventListener(event, handler);
    }
    this._listeners = [];
  }
}
