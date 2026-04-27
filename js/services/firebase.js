// Firebase 초기화
// ★ Firebase Console에서 본인 프로젝트의 config를 아래에 붙여넣으세요.
// https://console.firebase.google.com → 프로젝트 설정 → 웹 앱 → firebaseConfig 복사

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBxdoorTh7RfgyIMrso4xfNtC1uAn8Ogvk",
  authDomain: "typing-practice-9070e.firebaseapp.com",
  projectId: "typing-practice-9070e",
  storageBucket: "typing-practice-9070e.firebasestorage.app",
  messagingSenderId: "1022727747301",
  appId: "1:1022727747301:web:9d71ac76bb5a03b2bec60c"
};

let db = null;

export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

try {
  if (isFirebaseConfigured()) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('Firebase 초기화 실패:', e.message);
}

export { db };

