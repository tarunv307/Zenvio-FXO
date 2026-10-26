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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
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
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please add your VITE_FIREBASE_* environment variables.');
  }

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // If popup was blocked or failed on mobile browser, fallback to redirect if appropriate
    if (error?.code === 'auth/popup-blocked') {
      console.warn('Popup blocked by browser, trying redirect fallback...');
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }
    throw error;
  }
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
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. The Google popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain (zenvio-fxo.vercel.app or localhost) is not authorized in your Firebase project. Please add it to Authorized Domains in Firebase Authentication Settings.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials or sign in with Google.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Console. Please enable Google provider under Authentication > Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
}
