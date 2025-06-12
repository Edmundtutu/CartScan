import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnR5ABi4bL7EjTLAaajEkRuJuFDGXxV80",
  authDomain: "scancart-b980b.firebaseapp.com",
  databaseURL: "https://scancart-b980b-default-rtdb.firebaseio.com",
  projectId: "scancart-b980b",
  storageBucket: "scancart-b980b.firebasestorage.app",
  messagingSenderId: "180656718718",
  appId: "1:180656718718:web:78bc5866d764327f65292f",
  measurementId: "G-K81ZC18QB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Analytics only on web platform
export const analytics = Platform.OS === 'web' ? getAnalytics(app) : null;

export default app;