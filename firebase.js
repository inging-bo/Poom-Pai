// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUuXok9FopzlvbwtAnWpn0bCule6IVnuk",
  authDomain: "poom-pai.firebaseapp.com",
  projectId: "poom-pai",
  storageBucket: "poom-pai.firebasestorage.app",
  messagingSenderId: "332082482946",
  appId: "1:332082482946:web:cc572e4e2350e105ecbc1b",
  measurementId: "G-PFZFMWLV8W"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
export const db = getFirestore(app);