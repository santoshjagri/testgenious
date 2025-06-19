
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This log helps verify if Next.js is loading the variable from .env
// You should see your actual API key in the server console when the app starts,
// and potentially in the browser console (though it's better to check server logs for NEXT_PUBLIC variables).
console.log('Firebase API Key attempting to load:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

let app: FirebaseApp;

if (!firebaseConfig.apiKey) {
  // This error means process.env.NEXT_PUBLIC_FIREBASE_API_KEY was undefined or empty when this code ran.
  // This is the core issue you are facing.
  console.error("CRITICAL ERROR: Firebase API Key is UNDEFINED. Please check your .env file at the project root and ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set. You MUST restart your development server after creating/editing .env.");
  // To prevent the app from crashing further down with a less clear error,
  // we can throw an error here, or the initializeApp will fail anyway.
  // For now, we let initializeApp handle the failure, which it does by throwing an error.
}

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
