import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCi6rMPyZrXZyLBAfCsWJ44pUsku0Pds68",
  authDomain: "mpflow-f0be9.firebaseapp.com",
  projectId: "mpflow-f0be9",
  storageBucket: "mpflow-f0be9.firebasestorage.app",
  messagingSenderId: "149977304918",
  appId: "1:149977304918:web:bac21122c8330170d610f7"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)