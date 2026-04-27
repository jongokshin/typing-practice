export const FINGER_LESSONS = [
  {
    id: 'home-left',
    title: '왼손 기본 자리',
    description: '왼손의 기본 자리를 익힙니다. 새끼(ㅁ), 약지(ㄴ), 중지(ㅇ), 검지(ㄹ/ㅎ)',
    highlightKeys: ['a', 's', 'd', 'f', 'g'],
    fingerGuide: [
      { key: 'a', finger: 0 }, { key: 's', finger: 1 },
      { key: 'd', finger: 2 }, { key: 'f', finger: 3 }, { key: 'g', finger: 3 },
    ],
    lines: [
      'ㅁ ㄴ ㅇ ㄹ ㅎ ㄹ ㅇ ㄴ ㅁ',
      'ㄴ ㅇ ㄹ ㅎ ㄹ ㅇ ㄴ ㅁ ㄴ',
    ]
  },
  {
    id: 'home-right',
    title: '오른손 기본 자리',
    description: '오른손의 기본 자리를 익힙니다. 검지(ㅗ/ㅓ), 중지(ㅏ), 약지(ㅣ)',
    highlightKeys: ['h', 'j', 'k', 'l'],
    fingerGuide: [
      { key: 'h', finger: 6 }, { key: 'j', finger: 6 },
      { key: 'k', finger: 7 }, { key: 'l', finger: 8 },
    ],
    lines: [
      'ㅗ ㅓ ㅏ ㅣ ㅏ ㅓ ㅗ ㅣ ㅏ',
      'ㅣ ㅏ ㅓ ㅗ ㅣ ㅏ ㅓ ㅗ ㅏ',
    ]
  },
  {
    id: 'home-both',
    title: '양손 기본 자리',
    description: '양손을 함께 사용하여 기본 자리를 익힙니다.',
    highlightKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    fingerGuide: [
      { key: 'a', finger: 0 }, { key: 's', finger: 1 },
      { key: 'd', finger: 2 }, { key: 'f', finger: 3 }, { key: 'g', finger: 3 },
      { key: 'h', finger: 6 }, { key: 'j', finger: 6 },
      { key: 'k', finger: 7 }, { key: 'l', finger: 8 },
    ],
    lines: [
      '아나 오나 아나 이나 아나',
      '나라 나루 나리 나로 나라',
      '마나 마루 마리 마로 마라',
    ]
  },
  {
    id: 'upper-row',
    title: '윗줄 자리',
    description: '윗줄(Q~P행) 자판을 익힙니다.',
    highlightKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    fingerGuide: [
      { key: 'q', finger: 0 }, { key: 'w', finger: 1 }, { key: 'e', finger: 2 },
      { key: 'r', finger: 3 }, { key: 't', finger: 3 },
      { key: 'y', finger: 6 }, { key: 'u', finger: 6 }, { key: 'i', finger: 7 },
      { key: 'o', finger: 8 }, { key: 'p', finger: 9 },
    ],
    lines: [
      '바자 다가 사야 와 이야 애기',
      '새벽 자연 기억 세계 바위 재주',
    ]
  },
  {
    id: 'lower-row',
    title: '아랫줄 자리',
    description: '아랫줄(Z~M행) 자판을 익힙니다.',
    highlightKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    fingerGuide: [
      { key: 'z', finger: 0 }, { key: 'x', finger: 1 }, { key: 'c', finger: 2 },
      { key: 'v', finger: 3 }, { key: 'b', finger: 3 },
      { key: 'n', finger: 6 }, { key: 'm', finger: 6 },
    ],
    lines: [
      '크티치피 뷰뉴므',
      '축구 투표 추위 크기 큰소',
    ]
  },
  {
    id: 'all-rows',
    title: '전체 자리 종합',
    description: '모든 자리를 종합하여 연습합니다.',
    highlightKeys: [],
    fingerGuide: [],
    lines: [
      '하늘 바람 구름 나무 강물',
      '사랑 행복 건강 평화 희망',
      '대한민국 아름다운 자연환경',
    ]
  },
];
