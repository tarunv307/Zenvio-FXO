import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signOutUser as fbSignOutUser,
  getFriendlyAuthErrorMessage,
} from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Safely check redirect result if a redirect authentication was executed
    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          console.info('Redirect authentication completed successfully');
        }
      })
      .catch((redirectErr) => {
        // Silently catch known storage partitioning or null redirect errors
        const code = redirectErr?.code || '';
        if (
          code !== 'auth/missing-initial-state' &&
          code !== 'auth/null-user' &&
          code !== 'auth/popup-closed-by-user'
        ) {
          console.warn('Redirect sign-in notice:', redirectErr?.message || redirectErr);
        }
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (current) => {
        setFirebaseUser(current);
        if (current) {
          setUser({
            uid: current.uid,
            email: current.email,
            displayName: current.displayName || current.email?.split('@')[0] || 'User',
            photoURL: current.photoURL,
            emailVerified: current.emailVerified,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('onAuthStateChanged error', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = (): Promise<void> => {
    setError(null);
    return fbSignInWithGoogle()
      .then(() => {
        // Successfully initiated popup & authenticated
      })
      .catch((err: any) => {
        console.error('[AuthContext] Google Sign-in error:', err?.code, err?.message);
        const friendly = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
        const isDev =
          import.meta.env.DEV ||
          (typeof window !== 'undefined' && window.location.hostname === 'localhost');
        const fullMsg = isDev && err?.code ? `${friendly} [Code: ${err.code}]` : friendly;
        setError(fullMsg);
        const enhancedError: any = new Error(fullMsg);
        enhancedError.code = err?.code;
        throw enhancedError;
      });
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await fbSignInWithEmail(email, pass);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setError(null);
    try {
      await fbSignUpWithEmail(email, pass, name);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err?.code || err?.message || '');
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await fbSignOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign-out error', err);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch {
      return null;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    isConfigured: isFirebaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    getIdToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
