import { describe, it, expect } from 'vitest';
import { getFriendlyAuthErrorMessage } from '../lib/firebase';
import { verifyFirebaseIdToken, extractBearerToken } from '../server/authVerifier';

describe('Firebase Authentication — Error Handling & UX Messages', () => {
  it('translates auth/popup-closed-by-user into friendly cancellation notice', () => {
    const msg = getFriendlyAuthErrorMessage('auth/popup-closed-by-user');
    expect(msg).toContain('Google popup was closed');
  });

  it('translates auth/unauthorized-domain into actionable domain configuration instruction', () => {
    const msg = getFriendlyAuthErrorMessage('auth/unauthorized-domain');
    expect(msg).toContain('Authorized Domains in Firebase Authentication Settings');
  });

  it('translates auth/popup-blocked into browser popup instruction', () => {
    const msg = getFriendlyAuthErrorMessage('auth/popup-blocked');
    expect(msg).toContain('popup was blocked');
  });

  it('translates auth/missing-initial-state into storage partitioning instruction', () => {
    const msg = getFriendlyAuthErrorMessage('auth/missing-initial-state');
    expect(msg).toContain('storage partitioning');
  });

  it('translates auth/cancelled-popup-request into open window notice', () => {
    const msg = getFriendlyAuthErrorMessage('auth/cancelled-popup-request');
    expect(msg).toContain('sign-in window was already open');
  });

  it('translates auth/operation-not-allowed into console setup notice', () => {
    const msg = getFriendlyAuthErrorMessage('auth/operation-not-allowed');
    expect(msg).toContain('enable Google provider');
  });

  it('provides safe generic fallback for unexpected codes', () => {
    const msg = getFriendlyAuthErrorMessage('auth/unknown-error');
    expect(msg).toContain('An error occurred during authentication');
  });
});

describe('Firebase Configuration & Popup Contract', () => {
  it('has valid Firebase client configuration with projectId and authDomain', async () => {
    const { firebaseConfig, isFirebaseConfigured, signInWithGoogle } = await import('../lib/firebase');
    expect(firebaseConfig.projectId).toBe('zenvio-fxo');
    expect(firebaseConfig.authDomain).toBe('zenvio-fxo.firebaseapp.com');
    expect(isFirebaseConfigured).toBe(true);
    expect(typeof signInWithGoogle).toBe('function');
  });
});

describe('GoogleSignInButton UI Component', () => {
  it('renders correctly and dispatches onClick directly upon user click', async () => {
    const React = await import('react');
    const { render, fireEvent, screen, cleanup } = await import('@testing-library/react');
    const { GoogleSignInButton } = await import('../components/auth/GoogleSignInButton');

    cleanup();
    let clicked = false;
    render(
      React.createElement(GoogleSignInButton, {
        onClick: () => {
          clicked = true;
        },
        text: 'Continue with Google',
      })
    );

    const button = screen.getByRole('button', { name: /continue with google/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(clicked).toBe(true);
    cleanup();
  });

  it('disables button and displays connecting state when loading is true', async () => {
    const React = await import('react');
    const { render, screen, cleanup } = await import('@testing-library/react');
    const { GoogleSignInButton } = await import('../components/auth/GoogleSignInButton');

    cleanup();
    render(
      React.createElement(GoogleSignInButton, {
        onClick: () => {},
        loading: true,
      })
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/connecting to google.../i)).toBeInTheDocument();
    cleanup();
  });
});

describe('Firebase Server-Side Token Verification', () => {
  it('extracts Bearer tokens from authorization header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    expect(extractBearerToken('bearer   token123  ')).toBe('token123');
    expect(extractBearerToken('')).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken('Basic dXNlcjpwYXNz')).toBeNull();
  });

  it('rejects malformed token strings', async () => {
    const res = await verifyFirebaseIdToken('not-a-jwt');
    expect(res.valid).toBe(false);
    expect(res.error).toBe('Malformed JWT structure');
  });

  it('rejects expired tokens', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'user-123',
        exp: pastExp,
        iss: 'https://securetoken.google.com/test-project',
        aud: 'test-project',
      })
    ).toString('base64url');
    const token = `${header}.${payload}.dummy_signature`;

    const res = await verifyFirebaseIdToken(token, 'test-project');
    expect(res.valid).toBe(false);
    expect(res.error).toBe('Token has expired');
  });

  it('validates active tokens with correct issuer and claims', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'google-user-789',
        email: 'user@zenvio.io',
        email_verified: true,
        name: 'Alex Morgan',
        exp: futureExp,
        iss: 'https://securetoken.google.com/zenvio-fxo',
        aud: 'zenvio-fxo',
      })
    ).toString('base64url');
    const token = `${header}.${payload}.dummy_sig`;

    const res = await verifyFirebaseIdToken(token, 'zenvio-fxo');
    expect(res.valid).toBe(true);
    expect(res.user?.uid).toBe('google-user-789');
    expect(res.user?.email).toBe('user@zenvio.io');
  });
});
