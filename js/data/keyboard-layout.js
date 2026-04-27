// 두벌식 표준 키보드 레이아웃
// finger: 0=왼새끼, 1=왼약지, 2=왼중지, 3=왼검지, 4=왼엄지(스페이스)
//         5=오른엄지(스페이스), 6=오른검지, 7=오른중지, 8=오른약지, 9=오른새끼

export const KEYBOARD_ROWS = [
  {
    row: 0,
    keys: [
      { key: '`',  label: '`',  finger: 0 },
      { key: '1',  label: '1',  finger: 0 },
      { key: '2',  label: '2',  finger: 1 },
      { key: '3',  label: '3',  finger: 2 },
      { key: '4',  label: '4',  finger: 3 },
      { key: '5',  label: '5',  finger: 3 },
      { key: '6',  label: '6',  finger: 6 },
      { key: '7',  label: '7',  finger: 6 },
      { key: '8',  label: '8',  finger: 7 },
      { key: '9',  label: '9',  finger: 8 },
      { key: '0',  label: '0',  finger: 9 },
      { key: '-',  label: '-',  finger: 9 },
      { key: '=',  label: '=',  finger: 9 },
    ]
  },
  {
    row: 1,
    keys: [
      { key: 'q', label: 'q', ko: 'ㅂ', koShift: 'ㅃ', finger: 0 },
      { key: 'w', label: 'w', ko: 'ㅈ', koShift: 'ㅉ', finger: 1 },
      { key: 'e', label: 'e', ko: 'ㄷ', koShift: 'ㄸ', finger: 2 },
      { key: 'r', label: 'r', ko: 'ㄱ', koShift: 'ㄲ', finger: 3 },
      { key: 't', label: 't', ko: 'ㅅ', koShift: 'ㅆ', finger: 3 },
      { key: 'y', label: 'y', ko: 'ㅛ', finger: 6 },
      { key: 'u', label: 'u', ko: 'ㅕ', finger: 6 },
      { key: 'i', label: 'i', ko: 'ㅑ', finger: 7 },
      { key: 'o', label: 'o', ko: 'ㅐ', koShift: 'ㅒ', finger: 8 },
      { key: 'p', label: 'p', ko: 'ㅔ', koShift: 'ㅖ', finger: 9 },
      { key: '[', label: '[', finger: 9 },
      { key: ']', label: ']', finger: 9 },
    ]
  },
  {
    row: 2,
    keys: [
      { key: 'a', label: 'a', ko: 'ㅁ', finger: 0 },
      { key: 's', label: 's', ko: 'ㄴ', finger: 1 },
      { key: 'd', label: 'd', ko: 'ㅇ', finger: 2 },
      { key: 'f', label: 'f', ko: 'ㄹ', finger: 3 },
      { key: 'g', label: 'g', ko: 'ㅎ', finger: 3 },
      { key: 'h', label: 'h', ko: 'ㅗ', finger: 6 },
      { key: 'j', label: 'j', ko: 'ㅓ', finger: 6 },
      { key: 'k', label: 'k', ko: 'ㅏ', finger: 7 },
      { key: 'l', label: 'l', ko: 'ㅣ', finger: 8 },
      { key: ';', label: ';', finger: 9 },
      { key: "'",label: "'", finger: 9 },
    ]
  },
  {
    row: 3,
    keys: [
      { key: 'z', label: 'z', ko: 'ㅋ', finger: 0 },
      { key: 'x', label: 'x', ko: 'ㅌ', finger: 1 },
      { key: 'c', label: 'c', ko: 'ㅊ', finger: 2 },
      { key: 'v', label: 'v', ko: 'ㅍ', finger: 3 },
      { key: 'b', label: 'b', ko: 'ㅠ', finger: 3 },
      { key: 'n', label: 'n', ko: 'ㅜ', finger: 6 },
      { key: 'm', label: 'm', ko: 'ㅡ', finger: 6 },
      { key: ',', label: ',', finger: 7 },
      { key: '.', label: '.', finger: 8 },
      { key: '/', label: '/', finger: 9 },
    ]
  }
];

export const FINGER_COLORS = [
  '#e74c3c', // 0: 왼새끼
  '#e67e22', // 1: 왼약지
  '#f1c40f', // 2: 왼중지
  '#2ecc71', // 3: 왼검지
  '#95a5a6', // 4: 왼엄지
  '#95a5a6', // 5: 오른엄지
  '#9b59b6', // 6: 오른검지
  '#1abc9c', // 7: 오른중지
  '#e67e22', // 8: 오른약지
  '#e74c3c', // 9: 오른새끼
];

export const FINGER_NAMES = [
  '왼쪽 새끼손가락', '왼쪽 약지', '왼쪽 중지', '왼쪽 검지', '왼쪽 엄지',
  '오른쪽 엄지', '오른쪽 검지', '오른쪽 중지', '오른쪽 약지', '오른쪽 새끼손가락',
];

// 자소 → 키 매핑 (두벌식)
export const JASO_TO_KEY = {
  'ㅂ': 'q', 'ㅃ': 'Q', 'ㅈ': 'w', 'ㅉ': 'W', 'ㄷ': 'e', 'ㄸ': 'E',
  'ㄱ': 'r', 'ㄲ': 'R', 'ㅅ': 't', 'ㅆ': 'T',
  'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅒ': 'O', 'ㅔ': 'p', 'ㅖ': 'P',
  'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
  'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
  'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm',
};
