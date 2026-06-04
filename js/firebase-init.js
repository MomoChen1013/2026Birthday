/* ============================================================
   firebase-init.js — 連 Firebase（Firestore + Anonymous Auth）
   ・由 <script type="module"> 載入
   ・把 SDK 物件掛到 window.fb，給非 module 的 common.js / 各頁 JS 使用
   ・準備好之後 dispatch 'fb:ready'，common.js 監聽到才會啟動 DataStore
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, doc, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjmsRisQP7tR-cQGi4EqxdAaY2CeJe4_E",
  authDomain: "birthday-mo2026.firebaseapp.com",
  projectId: "birthday-mo2026",
  storageBucket: "birthday-mo2026.firebasestorage.app",
  messagingSenderId: "634251755712",
  appId: "1:634251755712:web:21ec5b9b100fffb6d7ed25"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

window.fb = {
  db, auth,
  collection, addDoc, onSnapshot, query, orderBy, doc, runTransaction, serverTimestamp,
  signInAnonymously, onAuthStateChanged,
};

signInAnonymously(auth).catch(e => console.warn('[fb] 匿名登入失敗：', e));

window.dispatchEvent(new Event('fb:ready'));
