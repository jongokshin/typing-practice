// 한글 자소 분해 및 WPM 계산 유틸리티
// 한국 표준 KS X 5002 기준: 1타 = 자소 1개

const CHOSUNG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const HANGUL_START = 0xAC00;
const HANGUL_END   = 0xD7A3;

export function isHangul(char) {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

export function isJaso(char) {
  const code = char.charCodeAt(0);
  return (code >= 0x3131 && code <= 0x314E) || (code >= 0x314F && code <= 0x3163);
}

// 한글 글자를 자소 배열로 분해. 비한글은 [char] 그대로 반환
export function decomposeChar(char) {
  const code = char.charCodeAt(0) - HANGUL_START;
  if (code < 0 || code > 11171) return [char];

  const jong = code % 28;
  const jung = Math.floor(code / 28) % 21;
  const cho  = Math.floor(code / 28 / 21);

  const result = [CHOSUNG[cho], JUNGSUNG[jung]];
  if (jong > 0) result.push(JONGSUNG[jong]);
  return result;
}

// 문자열의 총 자소 수 반환 (공백 포함)
export function countJaso(text) {
  let count = 0;
  for (const ch of text) {
    if (ch === ' ') {
      count += 1; // 공백도 1타
    } else {
      count += decomposeChar(ch).length;
    }
  }
  return count;
}

// 타/분 계산
export function calcTypingSpeed(jasoCount, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((jasoCount / elapsedSeconds) * 60);
}

// 정확도 계산: 입력된 글자 중 맞은 비율
export function calcAccuracy(inputText, targetText) {
  if (!inputText.length) return 100;
  const inputArr  = [...inputText];
  const targetArr = [...targetText];
  let correct = 0;
  for (let i = 0; i < inputArr.length; i++) {
    if (inputArr[i] === targetArr[i]) correct++;
  }
  return Math.round((correct / inputArr.length) * 1000) / 10;
}

// 두 문자열을 글자 단위로 비교
// 반환: { char, input, status: 'correct'|'incorrect'|'pending' }[]
export function compareTexts(inputText, targetText) {
  const inputArr  = [...inputText];
  const targetArr = [...targetText];
  return targetArr.map((ch, i) => {
    if (i >= inputArr.length) {
      return { char: ch, input: null, status: 'pending' };
    }
    return {
      char: ch,
      input: inputArr[i],
      status: inputArr[i] === ch ? 'correct' : 'incorrect',
    };
  });
}
