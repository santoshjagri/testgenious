
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

// TEMPORARY DEBUG LOG: Check if the API key is being loaded correctly
console.log('Firebase API Key attempting to load:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// You should see your actual API key logged here in the server console (when the app starts/SSR)
// and potentially in the browser console.
// If this value is 'undefined' or not your actual key,
// your .env file is not configured correctly or not being loaded by Next.js.
// Ensure your .env file is at the project root and you've restarted the dev server.

let app: FirebaseApp;

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set.");
  // Potentially throw an error here or handle it gracefully depending on how critical Firebase is at startup
  // For now, we'll let initializeApp fail which is what's happening.
}

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
