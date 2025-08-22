// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmFFLUxDhjNG5B0etD2w36bAILbb9mjQI",
  authDomain: "fooddeliveryapp-5f91d.firebaseapp.com",
  projectId: "fooddeliveryapp-5f91d",
  storageBucket: "fooddeliveryapp-5f91d.firebasestorage.app",
  messagingSenderId: "803805229825",
  appId: "1:803805229825:web:e3cc01216d2db95ab32100",
  measurementId: "G-Z583W82SSS"
};

// Initialize Firebase
const app = getApps().length === 0 ?  initializeApp(firebaseConfig): getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };