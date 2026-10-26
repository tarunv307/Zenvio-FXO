import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Input, Button } from '../../components/ui/FormElements';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithEmail, isConfigured, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Determine redirect target after login
  const from = (location.state as any)?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      return;
    }
    setLocalError(null);
    clearError();
    setLoadingEmail(true);
    try {
      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in.');
    } finally {
      setLoadingEmail(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="size-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="size-5" />
            </div>
            <span className="text-2xl font-black text-[#0F172A] tracking-tight">
              Zenvio <span className="text-[#2563EB]">FXO</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-[#0F172A] pt-2">Welcome Back</h2>
          <p className="text-xs text-[#64748B]">
            Sign in to access your tools, history, and saved preferences
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xl space-y-6">
          {/* Missing Firebase config banner if applicable */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="size-4 text-amber-600 shrink-0" />
                Firebase Setup Needed
              </div>
              <p>
                Add your Firebase project credentials to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> and Vercel Environment Variables to enable live Google sign-in.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {displayError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">{displayError}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-3">
            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              loading={loadingGoogle}
              disabled={loadingEmail}
            />

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E2E8F0]" />
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-[#E2E8F0]" />
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm font-sans pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#64748B] hover:text-[#0F172A]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center font-bold"
              disabled={loadingEmail || loadingGoogle}
            >
              {loadingEmail ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Switch to Sign Up */}
          <div className="pt-2 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/auth/sign-up" className="font-bold text-[#2563EB] hover:text-[#1D4ED8] underline">
              Create free account
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Secured by Firebase Authentication & Google OAuth</span>
        </div>
      </div>
    </div>
  );
}
