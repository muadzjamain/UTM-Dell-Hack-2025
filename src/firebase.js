import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAcAey_fsGetFihr427a4BYqyYHh62KLEg",
  authDomain: "deltri1-5fef4.firebaseapp.com",
  projectId: "deltri1-5fef4",
  storageBucket: "deltri1-5fef4.firebasestorage.app",
  messagingSenderId: "38783332367",
  appId: "1:38783332367:web:d8510d956a14eca861b37a",
  measurementId: "G-V1699QMZLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance for direct access if needed
export default app;
