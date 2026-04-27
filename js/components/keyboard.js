import { KEYBOARD_ROWS, FINGER_COLORS, FINGER_NAMES } from '../data/keyboard-layout.js';

export class KeyboardVisualizer {
  constructor(container) {
    this._container = container;
    this._keyMap = new Map(); // key → DOM element
    this._render();
  }

  _render() {
    this._container.innerHTML = '';
    this._container.className = 'keyboard-visual';

    for (const row of KEYBOARD_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = `kb-row kb-row-${row.row}`;

      for (const keyDef of row.keys) {
        const el = document.createElement('div');
        el.className = 'kb-key';
        el.dataset.key    = keyDef.key;
        el.dataset.finger = keyDef.finger;

        const top = document.createElement('span');
        top.className = 'kb-key-ko';
        top.textContent = keyDef.ko || keyDef.label;

        const bot = document.createElement('span');
        bot.className = 'kb-key-en';
        bot.textContent = keyDef.key.toUpperCase();

        el.appendChild(top);
        el.appendChild(bot);
        rowEl.appendChild(el);

        this._keyMap.set(keyDef.key, el);
        if (keyDef.ko)      this._keyMap.set(keyDef.ko, el);
        if (keyDef.koShift) this._keyMap.set(keyDef.koShift, el);
      }

      this._container.appendChild(rowEl);
    }

    // 스페이스바
    const spaceRow = document.createElement('div');
    spaceRow.className = 'kb-row kb-row-space';
    const space = document.createElement('div');
    space.className = 'kb-key kb-key-space';
    space.dataset.key = ' ';
    space.dataset.finger = '4';
    space.textContent = 'SPACE';
    spaceRow.appendChild(space);
    this._container.appendChild(spaceRow);
    this._keyMap.set(' ', space);
  }

  // 키 하이라이트 (100ms 후 자동 해제)
  flash(key) {
    const el = this._keyMap.get(key?.toLowerCase?.() ?? key);
    if (!el) return;
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 120);
  }

  // 손가락 가이드 표시 (자리 연습용)
  showFingerGuide(fingerGuide) {
    // 기존 가이드 해제
    this._keyMap.forEach(el => {
      el.classList.remove('guide');
      el.style.removeProperty('--guide-color');
    });

    for (const { key, finger } of fingerGuide) {
      const el = this._keyMap.get(key);
      if (!el) continue;
      el.classList.add('guide');
      el.style.setProperty('--guide-color', FINGER_COLORS[finger]);
    }
  }

  clearGuide() {
    this._keyMap.forEach(el => {
      el.classList.remove('guide');
      el.style.removeProperty('--guide-color');
    });
  }

  // 특정 키 목록 강조
  highlightKeys(keys) {
    this.clearGuide();
    for (const key of keys) {
      const el = this._keyMap.get(key);
      if (el) el.classList.add('guide');
    }
  }
}
