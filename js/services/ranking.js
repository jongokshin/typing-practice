import { db, isFirebaseConfigured } from './firebase.js';
import {
  doc, getDoc, setDoc, getDocs,
  collection, query, orderBy, where, limit,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const COLLECTION = 'rankings';
const NICKNAME_KEY = 'typing_nickname';

// 저장된 닉네임 가져오기
export function getSavedNickname() {
  return localStorage.getItem(NICKNAME_KEY) || '';
}

// 닉네임 저장
export function saveNickname(name) {
  localStorage.setItem(NICKNAME_KEY, name.trim());
}

// 랭킹 등록 (최고 기록만 갱신)
// 반환: { saved: bool, isNewRecord: bool, rank: number|null, prevWpm: number|null }
export async function saveRanking({ nickname, wpm, accuracy, duration }) {
  if (!isFirebaseConfigured() || !db) {
    return { saved: false, isNewRecord: false, rank: null, prevWpm: null, error: 'not_configured' };
  }

  try {
    const ref = doc(db, COLLECTION, nickname);
    const existing = await getDoc(ref);

    if (existing.exists() && existing.data().wpm >= wpm) {
      return {
        saved: false,
        isNewRecord: false,
        rank: null,
        prevWpm: existing.data().wpm,
        error: null,
      };
    }

    await setDoc(ref, {
      nickname,
      wpm,
      accuracy: Math.round(accuracy * 10) / 10,
      duration,
      date: serverTimestamp(),
    });

    const rank = await getUserRank(nickname, wpm);
    return { saved: true, isNewRecord: true, rank, prevWpm: null, error: null };
  } catch (e) {
    console.warn('랭킹 저장 실패:', e.message);
    return { saved: false, isNewRecord: false, rank: null, prevWpm: null, error: e.message };
  }
}

// 전체 랭킹 조회 (wpm 내림차순, 최대 50명)
export async function getLeaderboard(duration = null) {
  if (!isFirebaseConfigured() || !db) return [];

  try {
    const col = collection(db, COLLECTION);
    const constraints = [orderBy('wpm', 'desc'), limit(50)];
    if (duration) constraints.unshift(where('duration', '==', duration));
    const snapshot = await getDocs(query(col, ...constraints));
    return snapshot.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
  } catch (e) {
    console.warn('랭킹 조회 실패:', e.message);
    return [];
  }
}

// 특정 닉네임의 현재 순위 계산
async function getUserRank(nickname, wpm) {
  try {
    const col = collection(db, COLLECTION);
    const snapshot = await getDocs(query(col, where('wpm', '>', wpm)));
    return snapshot.size + 1; // 나보다 높은 사람 수 + 1
  } catch (_) {
    return null;
  }
}
