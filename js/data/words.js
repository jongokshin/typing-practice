export const WORD_LIST = {
  easy: [
    '사과', '나무', '하늘', '바람', '구름', '강물', '학교', '친구',
    '가방', '책상', '의자', '창문', '문어', '고양이', '강아지', '나비',
    '꽃잎', '별빛', '달빛', '햇살', '눈물', '웃음', '노래', '춤',
    '밥', '물', '불', '흙', '나라', '마을', '거리', '언덕',
    '봄', '여름', '가을', '겨울', '아침', '낮', '저녁', '밤',
    '빨강', '파랑', '노랑', '초록', '하양', '검정', '보라', '분홍',
    '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟',
    '아버지', '어머니', '형제', '자매', '가족', '이웃', '선생님', '학생',
  ],
  medium: [
    '대한민국', '아름다운', '자연환경', '생활습관', '컴퓨터', '스마트폰',
    '도서관', '병원', '우체국', '경찰서', '소방서', '은행',
    '자동차', '기차', '비행기', '배', '버스', '지하철',
    '음악회', '전시회', '박람회', '운동회', '졸업식', '입학식',
    '사랑스러운', '아름답고', '즐거운', '행복한', '건강한', '자유로운',
    '하늘색', '초록색', '붉은색', '노란색', '파란색', '흰색',
    '도전정신', '창의력', '집중력', '인내력', '판단력', '기억력',
    '국어', '수학', '영어', '과학', '역사', '음악', '미술', '체육',
    '봄바람', '여름비', '가을하늘', '겨울눈', '새벽이슬', '저녁노을',
    '산들바람', '파도소리', '새소리', '빗소리', '바람소리', '물소리',
  ],
  hard: [
    '대한민국헌법', '컴퓨터프로그래밍', '인공지능기술', '정보통신기술',
    '환경보호운동', '지속가능발전', '문화다양성', '글로벌시대',
    '민주주의사회', '경제발전전략', '과학기술혁신', '교육개혁방안',
    '자연재해대비', '기후변화대응', '에너지절약방법', '재활용분리수거',
    '사회적기업가정신', '창업생태계조성', '스타트업문화', '벤처캐피탈투자',
    '원격의료서비스', '디지털헬스케어', '바이오테크놀로지', '유전공학연구',
    '우주탐사기술', '인공위성발사', '화성탐사계획', '달기지건설',
    '양자컴퓨터개발', '블록체인기술', '메타버스플랫폼', '가상현실경험',
  ],
};

export const WORD_CATEGORIES = [
  { id: 'easy',   label: '초급', count: WORD_LIST.easy.length },
  { id: 'medium', label: '중급', count: WORD_LIST.medium.length },
  { id: 'hard',   label: '고급', count: WORD_LIST.hard.length },
];

export function getRandomWords(level, count = 20) {
  const list = [...WORD_LIST[level]];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(list[Math.floor(Math.random() * list.length)]);
  }
  return result;
}

// 영문 단어 목록
export const WORD_LIST_EN = {
  easy: [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
    'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'cat', 'dog',
    'sun', 'sky', 'run', 'big', 'red', 'hot', 'fun', 'top', 'cup', 'map',
    'bed', 'car', 'fly', 'job', 'key', 'mix', 'net', 'odd', 'pan', 'raw',
  ],
  medium: [
    'water', 'world', 'think', 'after', 'about', 'might', 'right', 'place',
    'never', 'again', 'still', 'every', 'great', 'small', 'those', 'under',
    'years', 'being', 'found', 'leave', 'light', 'means', 'other', 'point',
    'start', 'state', 'study', 'three', 'their', 'there', 'these', 'thing',
    'which', 'while', 'white', 'whole', 'where', 'write', 'young', 'above',
    'bring', 'build', 'check', 'clear', 'drive', 'email', 'enjoy', 'event',
  ],
  hard: [
    'beautiful', 'different', 'important', 'knowledge', 'mountain', 'absolute',
    'adventure', 'carefully', 'celebrate', 'community', 'computer', 'confident',
    'dangerous', 'education', 'excellent', 'executive', 'following', 'frequency',
    'generally', 'highlight', 'immediate', 'influence', 'interview', 'introduce',
    'javascript', 'knowledge', 'landscape', 'magazine', 'necessary', 'objective',
    'paragraph', 'perfectly', 'practical', 'president', 'principle', 'professor',
    'recommend', 'reference', 'represent', 'resources', 'shoulders', 'signature',
    'situation', 'statement', 'structure', 'surprised', 'technical', 'telephone',
  ],
};

export const WORD_CATEGORIES_EN = [
  { id: 'easy',   label: 'Easy',   count: WORD_LIST_EN.easy.length },
  { id: 'medium', label: 'Medium', count: WORD_LIST_EN.medium.length },
  { id: 'hard',   label: 'Hard',   count: WORD_LIST_EN.hard.length },
];

export function getRandomWordsEn(level, count = 20) {
  const list = [...WORD_LIST_EN[level]];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(list[Math.floor(Math.random() * list.length)]);
  }
  return result;
}
