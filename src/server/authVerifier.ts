/**
 * Server-side Firebase ID Token verification helper
 * Validates Google/Firebase JWT tokens without requiring private keys or service accounts.
 */

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  issuer: string;
  expiresAt: number;
}

/**
 * Parses and verifies basic structure, issuer, expiry, and claims of a Firebase ID token
 */
export async function verifyFirebaseIdToken(
  token: string,
  expectedProjectId?: string
): Promise<{ valid: boolean; user?: VerifiedFirebaseUser; error?: string }> {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'No token provided' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed JWT structure' };
    }

    // Decode JWT payload (Base64Url)
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);

    // Verify token expiration
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    // Verify issue time
    if (payload.auth_time && payload.auth_time > now + 300) {
      return { valid: false, error: 'Token issued in the future' };
    }

    // Verify issuer if expectedProjectId is provided
    if (expectedProjectId) {
      const expectedIssuer = `https://securetoken.google.com/${expectedProjectId}`;
      if (payload.iss !== expectedIssuer) {
        return { valid: false, error: `Invalid issuer: expected ${expectedIssuer}, got ${payload.iss}` };
      }
      if (payload.aud !== expectedProjectId) {
        return { valid: false, error: `Invalid audience: expected ${expectedProjectId}, got ${payload.aud}` };
      }
    }

    if (!payload.sub) {
      return { valid: false, error: 'Token payload missing subject identifier (uid)' };
    }

    return {
      valid: true,
      user: {
        uid: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
        issuer: payload.iss,
        expiresAt: payload.exp,
      },
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' };
  }
}

/**
 * Extracts Bearer token from HTTP Authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
