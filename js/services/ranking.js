import { db, isFirebaseConfigured } from './firebase.js';
import {
  doc, getDoc, setDoc, getDocs,
  collection, query, where,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const COLLECTION = 'rankings';
const NICKNAME_KEY = 'typing_nickname';

export function getSavedNickname() {
  return localStorage.getItem(NICKNAME_KEY) || '';
}

export function saveNickname(name) {
  localStorage.setItem(NICKNAME_KEY, name.trim());
}

// 랭킹 등록 (언어별 최고 기록만 갱신)
export async function saveRanking({ nickname, wpm, accuracy, duration, lang = 'ko' }) {
  if (!isFirebaseConfigured() || !db) {
    return { saved: false, rank: null, prevWpm: null, error: 'not_configured' };
  }

  try {
    const docId = `${lang}_${nickname}`;
    const ref = doc(db, COLLECTION, docId);
    const existing = await getDoc(ref);

    if (existing.exists() && existing.data().wpm >= wpm) {
      return { saved: false, rank: null, prevWpm: existing.data().wpm, error: null };
    }

    await setDoc(ref, {
      nickname,
      wpm,
      accuracy: Math.round(accuracy * 10) / 10,
      duration,
      lang,
      date: serverTimestamp(),
    });

    const rank = await getUserRank(wpm, lang);
    return { saved: true, rank, prevWpm: null, error: null };
  } catch (e) {
    console.warn('랭킹 저장 실패:', e.message);
    return { saved: false, rank: null, prevWpm: null, error: e.message };
  }
}

// 전체 랭킹 조회 (lang 필터, 클라이언트 정렬)
export async function getLeaderboard(duration = null, lang = 'ko') {
  if (!isFirebaseConfigured() || !db) return [];

  try {
    const col = collection(db, COLLECTION);
    const snapshot = await getDocs(query(col, where('lang', '==', lang)));
    let results = snapshot.docs.map(d => d.data());
    if (duration) results = results.filter(r => r.duration === duration);
    return results
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 50)
      .map((r, i) => ({ rank: i + 1, ...r }));
  } catch (e) {
    console.error('랭킹 조회 실패:', e);
    return [];
  }
}

// 나보다 wpm이 높은 사람 수 + 1 = 내 순위
async function getUserRank(wpm, lang) {
  try {
    const col = collection(db, COLLECTION);
    const snapshot = await getDocs(query(col, where('lang', '==', lang)));
    const above = snapshot.docs.filter(d => d.data().wpm > wpm);
    return above.length + 1;
  } catch (_) {
    return null;
  }
}
