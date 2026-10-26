import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, AlertCircle, PauseCircle, ArrowRight } from 'lucide-react';
import { getDynamicLink, recordScan, isValidDestinationUrl } from '../lib/dynamicQr';
import type { DynamicQrLink } from '../lib/dynamicQr';

export function RedirectHandler() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<DynamicQrLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(2);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('No redirect code provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function resolveRedirect() {
      try {
        const found = await getDynamicLink(code!);
        if (!isMounted) return;

        if (!found) {
          setError(`Dynamic QR code "${code}" was not found or has been removed.`);
          setLoading(false);
          return;
        }

        if (!found.isActive) {
          setError('This dynamic QR code has been temporarily paused by its creator.');
          setLink(found);
          setLoading(false);
          return;
        }

        if (!isValidDestinationUrl(found.destinationUrl)) {
          setError('The destination URL associated with this QR code is invalid or unsafe.');
          setLink(found);
          setLoading(false);
          return;
        }

        setLink(found);
        setLoading(false);

        // Record scan event
        await recordScan(found.shortCode);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'An unexpected error occurred while resolving the redirect.');
        setLoading(false);
      }
    }

    resolveRedirect();

    return () => {
      isMounted = false;
    };
  }, [code]);

  // Countdown timer for automatic safe redirect
  useEffect(() => {
    if (loading || !link || !link.isActive || error || cancelled) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Execute safe redirect
      window.location.replace(link.destinationUrl);
    }
  }, [loading, link, countdown, error, cancelled]);

  const handleImmediateRedirect = () => {
    if (link && isValidDestinationUrl(link.destinationUrl)) {
      window.location.replace(link.destinationUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-card p-6 sm:p-8 text-center">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="#2563EB"/>
            <path d="M9 10h14l-10 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-black text-[#0F172A]">
            Zenvio <span className="text-[#2563EB]">FXO</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-semibold ml-1">
            Dynamic QR
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-8 space-y-4">
            <div className="size-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[#0F172A]">Resolving destination...</p>
            <p className="text-xs text-[#64748B]">Checking destination safety and validity</p>
          </div>
        )}

        {/* Error / Paused / Not found state */}
        {!loading && error && (
          <div className="py-6 space-y-4">
            <div className="size-12 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto border border-red-100">
              {link && !link.isActive ? (
                <PauseCircle className="size-6 text-[#D97706]" />
              ) : (
                <AlertCircle className="size-6" />
              )}
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {link && !link.isActive ? 'QR Code Paused' : 'Redirect Unavailable'}
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">{error}</p>

            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Link
                to="/tools/qr-studio"
                className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Create Your Own QR Code
              </Link>
              <Link
                to="/"
                className="w-full py-2 px-4 border border-[#E2E8F0] hover:bg-slate-50 text-[#475569] text-sm font-medium rounded-xl transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

        {/* Successful redirecting state */}
        {!loading && link && link.isActive && !error && (
          <div className="py-4 space-y-5">
            <div className="size-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100">
              <ShieldCheck className="size-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {cancelled ? 'Redirect Cancelled' : 'Redirecting you now'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1 truncate max-w-xs mx-auto">
                {link.title}
              </p>
            </div>

            {/* Destination URL card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] text-left">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Destination Address
              </p>
              <p className="text-sm font-mono text-[#0F172A] break-all flex items-center gap-1.5">
                <ExternalLink className="size-3.5 shrink-0 text-[#2563EB]" />
                {link.destinationUrl}
              </p>
            </div>

            {!cancelled ? (
              <div className="space-y-3">
                <p className="text-xs text-[#64748B]">
                  Transferring automatically in <span className="font-bold text-[#2563EB]">{countdown}s</span>...
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCancelled(true)}
                    className="flex-1 py-2 px-3 border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#475569] rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImmediateRedirect}
                    className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    Proceed Now <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleImmediateRedirect}
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Visit Destination <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0]">
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Dynamic QR codes powered by <span className="font-semibold text-[#0F172A]">Zenvio FXO</span>.
                Destination can be updated anytime without reprinting the QR code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
