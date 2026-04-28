import { countJaso, calcTypingSpeed, calcEnglishSpeed, calcAccuracy } from './hangul.js';
import { Timer } from './timer.js';

export class TypingEngine {
  constructor(targetText, lang = 'ko') {
    this.target = targetText;
    this.lang = lang;
    this.targetLen = [...targetText].length;

    this._timer = new Timer(() => {});
    this._startedAt = null;
    this._finished = false;

    this._correctJaso = 0;
    this._totalJaso = 0;
  }

  start() {
    this._startedAt = performance.now();
    this._timer.start();
  }

  stop() {
    this._timer.pause();
    this._finished = true;
  }

  reset(newTarget = null, lang = null) {
    if (newTarget) this.target = newTarget;
    if (lang) this.lang = lang;
    this.targetLen = [...this.target].length;
    this._timer.reset();
    this._startedAt = null;
    this._finished = false;
    this._correctJaso = 0;
    this._totalJaso = 0;
  }

  isStarted() { return this._startedAt !== null; }
  isFinished() { return this._finished; }
  getElapsed() { return this._timer.getElapsedSeconds(); }

  // 입력 텍스트를 받아 비교 결과를 반환
  // composingText: 조합 중인 글자 (미확정)
  compare(inputText, composingText = '') {
    const displayInput = inputText + composingText;
    const inputChars  = [...displayInput];
    const targetChars = [...this.target];

    return targetChars.map((ch, i) => {
      if (i >= inputChars.length) {
        return { char: ch, input: null, status: 'pending', index: i };
      }
      if (i === inputChars.length - 1 && composingText) {
        return { char: ch, input: inputChars[i], status: 'composing', index: i };
      }
      return {
        char: ch,
        input: inputChars[i],
        status: inputChars[i] === ch ? 'correct' : 'incorrect',
        index: i,
      };
    });
  }

  // 현재 통계 계산
  getStats(inputText) {
    const elapsed = this.getElapsed();
    const inputChars  = [...inputText];
    const targetChars = [...this.target];

    let correctCount = 0;
    for (let i = 0; i < inputChars.length; i++) {
      if (inputChars[i] === targetChars[i]) correctCount++;
    }

    const correctJaso = countJaso(
      [...targetChars].slice(0, inputChars.length)
        .filter((ch, i) => inputChars[i] === ch)
        .join('')
    );

    const wpm = this.lang === 'en'
      ? calcEnglishSpeed(correctCount, elapsed)
      : calcTypingSpeed(correctJaso, elapsed);

    return {
      wpm,
      accuracy: calcAccuracy(inputText, this.target),
      elapsed,
      inputLength: inputChars.length,
      targetLength: this.targetLen,
      correctChars: correctCount,
      lang: this.lang,
    };
  }

  // 완료 여부 확인 (마지막 글자까지 입력했는지)
  isComplete(inputText) {
    return [...inputText].length >= this.targetLen;
  }
}
