// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


export const firebaseConfig = {
  apiKey: "AIzaSyA-AVZtkKtxOMmWFk04LXkun0n8nyTJD-Y",
  authDomain: "oqulix-nest-e6f1f.firebaseapp.com",
  projectId: "oqulix-nest-e6f1f",
  storageBucket: "oqulix-nest-e6f1f.firebasestorage.app",
  messagingSenderId: "886413934456",
  appId: "1:886413934456:web:300857e34bb98f73a2528d",
  measurementId: "G-E5KQCWCGWK"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// analytics
const analytics = getAnalytics(app);


// 🔐 Enable persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to local (default).");
  })
  .catch((error) => {
    console.error("Failed to set persistence:", error);
  });