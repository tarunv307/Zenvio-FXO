import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User,
  type UserCredential
} from 'firebase/auth';

/**
 * Firebase Client Configuration
 * Environment variables must be prefixed with VITE_ to be exposed to client bundle by Vite.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBmxjzHoRZc4cUMZ81QbI9mFBs96QTK434',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zenvio-fxo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zenvio-fxo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zenvio-fxo.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1090337015895',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1090337015895:web:0a2a25d5648f46d0e87b12',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-RD63568T8J',
};

/**
 * Validate that Firebase credentials have been configured
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  !firebaseConfig.apiKey.includes('your_')
);

// Initialize Firebase App singleton safely
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (err) {
    console.warn('Firebase initialization error:', err);
  }
}

export { app, auth, googleProvider };

/**
 * Sign in using Google OAuth popup
 * Triggers signInWithPopup directly and synchronously within the user event loop
 * without awaiting unrelated asynchronous operations first.
 */
export function signInWithGoogle(): Promise<UserCredential> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please add your VITE_FIREBASE_* environment variables.');
  }

  // Directly return the popup promise - do NOT await or delay in microtasks
  return signInWithPopup(auth, googleProvider);
}

/**
 * Optional redirect-based Google sign in (intended for custom domains or native webviews)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please add your VITE_FIREBASE_* environment variables.');
  }
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Sign in using email and password
 */
export async function signInWithEmail(email: string, pass: string): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please add your VITE_FIREBASE_* environment variables.');
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

/**
 * Register a new user with email and password
 */
export async function signUpWithEmail(email: string, pass: string, displayName?: string): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please add your VITE_FIREBASE_* environment variables.');
  }
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn('Failed to update displayName', e);
    }
  }
  return cred;
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

/**
 * Friendly error message parser for Firebase Auth error codes
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  const code = (errorCode || '').toLowerCase();

  if (code.includes('popup-closed-by-user')) {
    return 'Sign-in cancelled. The Google popup was closed before completing.';
  }
  if (code.includes('popup-blocked')) {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site in your browser address bar and try again.';
  }
  if (
    code.includes('missing-initial-state') ||
    code.includes('missing initial state') ||
    code.includes('storage-partitioned')
  ) {
    return 'Unable to process sign-in due to browser storage partitioning or strict privacy settings. Please disable third-party cookie blocking or allow popups and try again.';
  }
  if (code.includes('unauthorized-domain')) {
    return 'This domain (zenvio-fxo.vercel.app or localhost) is not authorized in your Firebase project. Please add it to Authorized Domains in Firebase Authentication Settings.';
  }
  if (
    code.includes('user-not-found') ||
    code.includes('wrong-password') ||
    code.includes('invalid-credential')
  ) {
    return 'Invalid email or password. Please verify your credentials or sign in with Google.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code.includes('weak-password')) {
    return 'Password should be at least 6 characters.';
  }
  if (code.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('operation-not-allowed')) {
    return 'Google sign-in is not enabled in Firebase Console. Please enable Google provider under Authentication > Sign-in method.';
  }
  if (code.includes('network-request-failed')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  if (code.includes('cancelled-popup-request')) {
    return 'Another sign-in window was already open. Please complete or close it and try again.';
  }

  return 'An error occurred during authentication. Please try again.';
}
