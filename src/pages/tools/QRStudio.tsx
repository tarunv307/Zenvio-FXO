import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode, Sliders, Image as ImageIcon, Frame, Download, Copy,
  Check, RotateCcw, AlertTriangle, ShieldCheck, ExternalLink,
  Trash2, Plus, Sparkles, RefreshCw, Smartphone, Eye, Layers
} from 'lucide-react';
import { Button, Input, Select, RangeSlider } from '../../components/ui/FormElements';
import { downloadDataUrl, copyToClipboard } from '../../utils/file';
import {
  isSupabaseConfigured
} from '../../lib/supabase';
import {
  createDynamicLink,
  listDynamicLinks,
  updateDynamicLink,
  deleteDynamicLink,
  isValidDestinationUrl,
  normalizeDestinationUrl,
  type DynamicQrLink
} from '../../lib/dynamicQr';

// ─── Color & Palette Helpers ────────────────────────────────────────────────

interface ColorPreset {
  name: string;
  dark: string;
  light: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Classic Black', dark: '#000000', light: '#FFFFFF' },
  { name: 'Midnight Blue', dark: '#2563EB', light: '#FFFFFF' },
  { name: 'Deep Slate', dark: '#0F172A', light: '#FFFFFF' },
  { name: 'Indigo Dream', dark: '#4F46E5', light: '#F8FAFC' },
  { name: 'Emerald Trust', dark: '#16A34A', light: '#FFFFFF' },
  { name: 'Crimson Bold', dark: '#DC2626', light: '#FFFFFF' },
  { name: 'Soft Contrast', dark: '#1E293B', light: '#EFF6FF' },
  { name: 'Amber Sunset', dark: '#D97706', light: '#FFFBEB' },
];

/**
 * Calculate relative luminance of a hex color (sRGB)
 */
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Contrast ratio between two hex colors (1:1 to 21:1)
 */
function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 10;
  }
}

// ─── Types & Configuration ──────────────────────────────────────────────────

export type DotPattern = 'square' | 'rounded' | 'dots' | 'classy';
export type EyePattern = 'square' | 'rounded' | 'circle';
export type FrameStyle = 'none' | 'bottom-banner' | 'top-banner' | 'card';

export interface QRStudioHistoryItem {
  id: string;
  title: string;
  url: string;
  previewDataUrl: string;
  createdAt: string;
  isDynamic: boolean;
  shortCode?: string;
}

const HISTORY_STORAGE_KEY = 'zenvio_qr_studio_history';

export function QRStudio() {
  const [activeTab, setActiveTab] = useState<'static' | 'dynamic' | 'history'>('static');

  // Core URL & Content
  const [url, setUrl] = useState<string>('https://zenvio.io');
  const [urlError, setUrlError] = useState<string>('');

  // Customization State
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#FFFFFF');
  const [useCustomEyeColor, setUseCustomEyeColor] = useState<boolean>(false);
  const [eyeColor, setEyeColor] = useState<string>('#000000');
  const [dotPattern, setDotPattern] = useState<DotPattern>('rounded');
  const [eyePattern, setEyePattern] = useState<EyePattern>('rounded');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [margin, setMargin] = useState<number>(3);
  const [exportSize, setExportSize] = useState<number>(1024);

  // Logo Settings
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const [logoBadgeShape, setLogoBadgeShape] = useState<'circle' | 'rounded' | 'none'>('circle');

  // Frame & Label Settings
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('bottom-banner');
  const [frameText, setFrameText] = useState<string>('SCAN ME');
  const [frameColor, setFrameColor] = useState<string>('#000000');

  // Preview & Export state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showScanChecklist, setShowScanChecklist] = useState<boolean>(false);

  // Dynamic QR state
  const [dynamicLinks, setDynamicLinks] = useState<DynamicQrLink[]>([]);
  const [dynamicTitle, setDynamicTitle] = useState<string>('');
  const [dynamicDestUrl, setDynamicDestUrl] = useState<string>('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editDestUrl, setEditDestUrl] = useState<string>('');
  const [loadingDynamic, setLoadingDynamic] = useState<boolean>(false);

  // History state
  const [historyItems, setHistoryItems] = useState<QRStudioHistoryItem[]>([]);

  // Load history from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) setHistoryItems(JSON.parse(raw));
    } catch {
      // Ignore
    }
  }, []);

  // Load dynamic links
  const refreshDynamicLinks = useCallback(async () => {
    setLoadingDynamic(true);
    try {
      const links = await listDynamicLinks();
      setDynamicLinks(links);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDynamic(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dynamic') {
      refreshDynamicLinks();
    }
  }, [activeTab, refreshDynamicLinks]);

  // URL Real-time Validation
  useEffect(() => {
    if (!url.trim()) {
      setUrlError('Please enter a destination URL.');
      return;
    }
    if (!isValidDestinationUrl(url)) {
      setUrlError('Enter a valid URL (e.g., https://example.com).');
    } else {
      setUrlError('');
    }
  }, [url]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoSrc(event.target?.result as string);
      // Automatically upgrade error correction level to 'H' for logo tolerance
      setErrorLevel('H');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoSrc(null);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setUrl('https://zenvio.io');
    setDarkColor('#000000');
    setLightColor('#FFFFFF');
    setUseCustomEyeColor(false);
    setEyeColor('#000000');
    setDotPattern('rounded');
    setEyePattern('rounded');
    setErrorLevel('H');
    setMargin(3);
    setExportSize(1024);
    setLogoSrc(null);
    setLogoSizePercent(22);
    setLogoBadgeShape('circle');
    setFrameStyle('none');
    setFrameText('SCAN ME');
    setFrameColor('#000000');
  };

  // ─── Custom Canvas Renderer ────────────────────────────────────────────────

  const renderQRCodeToCanvas = useCallback(
    async (targetCanvas: HTMLCanvasElement, targetWidth: number): Promise<void> => {
      if (!url.trim() || urlError) return;

      const validUrl = normalizeDestinationUrl(url);

      // Generate raw QR matrix using qrcode library
      const qr = QRCode.create(validUrl, {
        errorCorrectionLevel: errorLevel,
      });

      const moduleCount = qr.modules.size;
      const effectiveMargin = margin;
      const totalModules = moduleCount + effectiveMargin * 2;

      // Frame dimensions
      const hasBottomBanner = frameStyle === 'bottom-banner';
      const hasTopBanner = frameStyle === 'top-banner';
      const hasCard = frameStyle === 'card';

      const bannerHeight = hasBottomBanner || hasTopBanner || hasCard
        ? Math.round(targetWidth * 0.18)
        : 0;

      const cardPadding = hasCard ? Math.round(targetWidth * 0.05) : 0;

      const canvasWidth = targetWidth;
      const canvasHeight = targetWidth + bannerHeight + (hasCard ? cardPadding * 2 : 0);

      targetCanvas.width = canvasWidth;
      targetCanvas.height = canvasHeight;

      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      // Background fill
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Determine QR plotting area
      const qrSize = targetWidth - cardPadding * 2;
      const qrOffsetX = cardPadding;
      const qrOffsetY = (hasTopBanner ? bannerHeight : 0) + cardPadding;

      const moduleSize = qrSize / totalModules;

      // Helper to check if (r, c) is inside one of the 3 corner finder patterns (7x7)
      const isFinder = (r: number, c: number): boolean => {
        // Top-left
        if (r < 7 && c < 7) return true;
        // Top-right
        if (r < 7 && c >= moduleCount - 7) return true;
        // Bottom-left
        if (r >= moduleCount - 7 && c < 7) return true;
        return false;
      };

      // Draw standard data modules
      ctx.fillStyle = darkColor;

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (isFinder(r, c)) continue; // Eyes handled separately for custom shapes

          if (qr.modules.get(r, c)) {
            const x = qrOffsetX + (c + effectiveMargin) * moduleSize;
            const y = qrOffsetY + (r + effectiveMargin) * moduleSize;

            if (dotPattern === 'dots') {
              ctx.beginPath();
              ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize * 0.42, 0, Math.PI * 2);
              ctx.fill();
            } else if (dotPattern === 'rounded') {
              const radius = moduleSize * 0.35;
              ctx.beginPath();
              ctx.roundRect(x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, radius);
              ctx.fill();
            } else if (dotPattern === 'classy') {
              const radius = moduleSize * 0.5;
              ctx.beginPath();
              ctx.roundRect(x + 0.2, y + 0.2, moduleSize - 0.4, moduleSize - 0.4, radius);
              ctx.fill();
            } else {
              // Square
              ctx.fillRect(x, y, moduleSize + 0.3, moduleSize + 0.3);
            }
          }
        }
      }

      // Draw Corner Eyes
      const activeEyeColor = useCustomEyeColor ? eyeColor : darkColor;

      const drawEye = (startRow: number, startCol: number) => {
        const eyeX = qrOffsetX + (startCol + effectiveMargin) * moduleSize;
        const eyeY = qrOffsetY + (startRow + effectiveMargin) * moduleSize;
        const eyeOuterSize = 7 * moduleSize;
        const eyeInnerSize = 3 * moduleSize;

        ctx.fillStyle = activeEyeColor;

        if (eyePattern === 'circle') {
          // Outer circle
          ctx.beginPath();
          ctx.arc(eyeX + eyeOuterSize / 2, eyeY + eyeOuterSize / 2, eyeOuterSize / 2, 0, Math.PI * 2);
          ctx.fill();

          // Cutout light ring
          ctx.fillStyle = lightColor;
          ctx.beginPath();
          ctx.arc(eyeX + eyeOuterSize / 2, eyeY + eyeOuterSize / 2, (eyeOuterSize - 2 * moduleSize) / 2, 0, Math.PI * 2);
          ctx.fill();

          // Center dot
          ctx.fillStyle = activeEyeColor;
          ctx.beginPath();
          ctx.arc(eyeX + eyeOuterSize / 2, eyeY + eyeOuterSize / 2, eyeInnerSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (eyePattern === 'rounded') {
          // Outer rounded rectangle
          const outerRadius = moduleSize * 2;
          ctx.beginPath();
          ctx.roundRect(eyeX, eyeY, eyeOuterSize, eyeOuterSize, outerRadius);
          ctx.fill();

          // Cutout light ring
          ctx.fillStyle = lightColor;
          ctx.beginPath();
          ctx.roundRect(
            eyeX + moduleSize,
            eyeY + moduleSize,
            eyeOuterSize - 2 * moduleSize,
            eyeOuterSize - 2 * moduleSize,
            moduleSize
          );
          ctx.fill();

          // Inner rounded center
          ctx.fillStyle = activeEyeColor;
          ctx.beginPath();
          ctx.roundRect(
            eyeX + 2 * moduleSize,
            eyeY + 2 * moduleSize,
            eyeInnerSize,
            eyeInnerSize,
            moduleSize * 0.8
          );
          ctx.fill();
        } else {
          // Classic square
          ctx.fillRect(eyeX, eyeY, eyeOuterSize, eyeOuterSize);

          ctx.fillStyle = lightColor;
          ctx.fillRect(
            eyeX + moduleSize,
            eyeY + moduleSize,
            eyeOuterSize - 2 * moduleSize,
            eyeOuterSize - 2 * moduleSize
          );

          ctx.fillStyle = activeEyeColor;
          ctx.fillRect(
            eyeX + 2 * moduleSize,
            eyeY + 2 * moduleSize,
            eyeInnerSize,
            eyeInnerSize
          );
        }
      };

      // Draw all 3 finder eyes
      drawEye(0, 0); // Top-left
      drawEye(0, moduleCount - 7); // Top-right
      drawEye(moduleCount - 7, 0); // Bottom-left

      // Draw Center Logo if provided
      if (logoSrc) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoAreaFraction = logoSizePercent / 100;
            const logoW = qrSize * logoAreaFraction;
            const logoH = qrSize * logoAreaFraction;
            const logoX = qrOffsetX + (qrSize - logoW) / 2;
            const logoY = qrOffsetY + (qrSize - logoH) / 2;

            // Draw backing badge
            const badgePadding = moduleSize * 0.8;
            const badgeW = logoW + badgePadding * 2;
            const badgeH = logoH + badgePadding * 2;
            const badgeX = logoX - badgePadding;
            const badgeY = logoY - badgePadding;

            ctx.fillStyle = lightColor;
            if (logoBadgeShape === 'circle') {
              ctx.beginPath();
              ctx.arc(badgeX + badgeW / 2, badgeY + badgeH / 2, badgeW / 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (logoBadgeShape === 'rounded') {
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY, badgeW, badgeH, moduleSize * 1.5);
              ctx.fill();
            }

            // Draw logo image
            ctx.drawImage(img, logoX, logoY, logoW, logoH);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logoSrc;
        });
      }

      // Draw Frame / Banner if selected
      if (frameStyle === 'bottom-banner' || frameStyle === 'top-banner' || frameStyle === 'card') {
        const bannerW = canvasWidth * 0.78;
        const bannerH = bannerHeight * 0.7;
        const bannerX = (canvasWidth - bannerW) / 2;
        const bannerY = hasTopBanner
          ? Math.round(bannerHeight * 0.15)
          : targetWidth + (hasCard ? cardPadding : 0) + Math.round((bannerHeight - bannerH) / 2);

        // Banner pill background
        ctx.fillStyle = frameColor;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, bannerH / 2);
        ctx.fill();

        // Banner label text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(bannerH * 0.44)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameText.toUpperCase(), bannerX + bannerW / 2, bannerY + bannerH / 2 + 1);
      }
    },
    [
      url, urlError, errorLevel, margin, lightColor, darkColor,
      dotPattern, eyePattern, useCustomEyeColor, eyeColor,
      logoSrc, logoSizePercent, logoBadgeShape,
      frameStyle, frameText, frameColor
    ]
  );

  // Update live preview when settings change
  useEffect(() => {
    let active = true;
    const canvas = document.createElement('canvas');

    renderQRCodeToCanvas(canvas, 480).then(() => {
      if (active) {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      }
    });

    return () => {
      active = false;
    };
  }, [renderQRCodeToCanvas]);

  // Contrast ratio computation
  const contrastRatio = getContrastRatio(darkColor, lightColor);
  const isContrastOptimal = contrastRatio >= 4.0;
  const isContrastFair = contrastRatio >= 2.5 && contrastRatio < 4.0;
  const isLogoOversized = !!logoSrc && logoSizePercent > 25;

  // ─── Export Handlers ───────────────────────────────────────────────────────

  const handleDownloadPNG = async () => {
    const exportCanvas = document.createElement('canvas');
    await renderQRCodeToCanvas(exportCanvas, exportSize);
    const dataUrl = exportCanvas.toDataURL('image/png');
    const filename = `zenvio-qr-${Date.now()}.png`;
    downloadDataUrl(dataUrl, filename);
  };

  const handleDownloadSVG = async () => {
    try {
      const validUrl = normalizeDestinationUrl(url);
      const svgString = await QRCode.toString(validUrl, {
        type: 'svg',
        margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `zenvio-qr-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to generate SVG', err);
    }
  };

  const handleCopyDataUrl = async () => {
    if (previewDataUrl) {
      await copyToClipboard(previewDataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToHistory = () => {
    if (!previewDataUrl) return;

    const newItem: QRStudioHistoryItem = {
      id: `qrh_${Date.now()}`,
      title: url.replace(/^https?:\/\//, '').split('/')[0] || 'QR Code',
      url: normalizeDestinationUrl(url),
      previewDataUrl,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isDynamic: false,
    };

    const updated = [newItem, ...historyItems.slice(0, 19)];
    setHistoryItems(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Ignore
    }
  };

  // ─── Dynamic QR Actions ───────────────────────────────────────────────────

  const handleCreateDynamic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dynamicDestUrl.trim() || !isValidDestinationUrl(dynamicDestUrl)) {
      alert('Please enter a valid destination URL (e.g., https://example.com).');
      return;
    }

    try {
      const created = await createDynamicLink({
        destinationUrl: dynamicDestUrl,
        title: dynamicTitle.trim() || 'Dynamic Link',
      });

      // Set current studio URL to the short redirect URL
      const redirectUrl = `${window.location.origin}/r/${created.shortCode}`;
      setUrl(redirectUrl);

      setDynamicTitle('');
      setDynamicDestUrl('');
      await refreshDynamicLinks();
      setActiveTab('static'); // Switch to editor to customize the dynamic QR
    } catch (err: any) {
      alert(err.message || 'Failed to create dynamic QR code.');
    }
  };

  const handleUpdateDynamic = async (shortCode: string) => {
    if (!editDestUrl.trim() || !isValidDestinationUrl(editDestUrl)) {
      alert('Please enter a valid destination URL.');
      return;
    }

    try {
      await updateDynamicLink(shortCode, { destinationUrl: editDestUrl });
      setEditingCode(null);
      setEditDestUrl('');
      await refreshDynamicLinks();
    } catch (err: any) {
      alert(err.message || 'Failed to update destination URL.');
    }
  };

  const handleToggleActive = async (link: DynamicQrLink) => {
    try {
      await updateDynamicLink(link.shortCode, { isActive: !link.isActive });
      await refreshDynamicLinks();
    } catch (err: any) {
      alert(err.message || 'Failed to update link status.');
    }
  };

  const handleDeleteDynamic = async (shortCode: string) => {
    if (confirm('Are you sure you want to delete this dynamic QR link? Scans will stop resolving.')) {
      await deleteDynamicLink(shortCode);
      await refreshDynamicLinks();
    }
  };

  const handleLoadDynamicIntoEditor = (link: DynamicQrLink) => {
    const redirectUrl = `${window.location.origin}/r/${link.shortCode}`;
    setUrl(redirectUrl);
    setActiveTab('static');
  };

  // ─── Render UI ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-[#E2E8F0] gap-2 pb-px">
        <button
          onClick={() => setActiveTab('static')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'static'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <QrCode className="size-4" />
          Static QR Studio
        </button>

        <button
          onClick={() => setActiveTab('dynamic')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'dynamic'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sparkles className="size-4" />
          Dynamic QR Codes
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-[#1D4ED8]">
            Editable
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Layers className="size-4" />
          Saved Designs ({historyItems.length})
        </button>
      </div>

      {/* ─── TAB 1: STATIC QR STUDIO ────────────────────────────────────── */}
      {activeTab === 'static' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Target URL Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <ExternalLink className="size-4 text-[#2563EB]" />
                  Destination Web Address (URL)
                </h3>
                <span className="text-xs text-[#64748B] font-medium">Permanent • Zero Server Dependency</span>
              </div>

              <div>
                <Input
                  label="Target Web Address"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/page"
                  error={urlError}
                />
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-blue-100 rounded-xl text-xs text-[#1E40AF] flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-[#2563EB] mt-0.5" />
                <span>
                  <strong>Static Guarantee:</strong> This QR code directly encodes your destination URL. Once printed, it does not rely on any third-party servers and will never expire as long as your destination URL remains active.
                </span>
              </div>
            </div>

            {/* Visual Styling Accordion / Controls */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Sliders className="size-4 text-[#2563EB]" />
                  Colors & Theme
                </h3>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
                >
                  <RotateCcw className="size-3" /> Reset all
                </button>
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 block">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setDarkColor(preset.dark);
                        setLightColor(preset.light);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#E2E8F0] flex items-center gap-1.5 hover:border-blue-400 bg-white"
                    >
                      <span className="size-3 rounded-full border" style={{ backgroundColor: preset.dark }} />
                      <span className="text-[#475569] font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 block">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="size-9 rounded-lg cursor-pointer border border-[#E2E8F0]"
                    />
                    <input
                      type="text"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-[#E2E8F0] rounded-lg w-28 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 block">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="size-9 rounded-lg cursor-pointer border border-[#E2E8F0]"
                    />
                    <input
                      type="text"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-[#E2E8F0] rounded-lg w-28 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Eye Color Toggle */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomEyeColor}
                      onChange={(e) => setUseCustomEyeColor(e.target.checked)}
                      className="size-4 text-[#2563EB] rounded border-[#E2E8F0] focus:ring-[#2563EB]"
                    />
                    Custom Corner Finder Eye Color
                  </label>
                </div>

                {useCustomEyeColor && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="size-9 rounded-lg cursor-pointer border border-[#E2E8F0]"
                    />
                    <input
                      type="text"
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono border border-[#E2E8F0] rounded-lg w-28 uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Module & Eye Patterns */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Patterns & Shapes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#64748B] mb-1.5 block">
                      Dot / Module Pattern
                    </label>
                    <Select
                      value={dotPattern}
                      onChange={(e) => setDotPattern(e.target.value as DotPattern)}
                      options={[
                        { value: 'rounded', label: 'Rounded Squares (Modern)' },
                        { value: 'dots', label: 'Circular Dots' },
                        { value: 'classy', label: 'Classy Connected' },
                        { value: 'square', label: 'Classic Squares' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] mb-1.5 block">
                      Corner Finder Pattern
                    </label>
                    <Select
                      value={eyePattern}
                      onChange={(e) => setEyePattern(e.target.value as EyePattern)}
                      options={[
                        { value: 'rounded', label: 'Rounded Eyes (Modern)' },
                        { value: 'circle', label: 'Circular Rings' },
                        { value: 'square', label: 'Classic Square Eyes' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-[#2563EB]" />
                    Centre Brand Logo
                  </h4>
                  {logoSrc && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-xs text-[#DC2626] hover:underline font-medium"
                    >
                      Remove logo
                    </button>
                  )}
                </div>

                {!logoSrc ? (
                  <label className="border-2 border-dashed border-[#E2E8F0] hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                    <ImageIcon className="size-6 text-[#64748B] mb-1" />
                    <span className="text-xs font-semibold text-[#0F172A]">
                      Upload logo image
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      PNG, SVG, or JPG (transparent recommended)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                      <img
                        src={logoSrc}
                        alt="Logo Preview"
                        className="size-12 object-contain bg-white rounded-lg border border-[#E2E8F0] p-1"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-[#0F172A] block">
                          Logo active
                        </span>
                        <span className="text-[11px] text-[#16A34A] font-medium">
                          Error correction auto-set to High (30%)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-medium text-[#64748B] mb-1 block">
                          Badge Shape
                        </label>
                        <Select
                          value={logoBadgeShape}
                          onChange={(e) => setLogoBadgeShape(e.target.value as any)}
                          options={[
                            { value: 'circle', label: 'Circle Background' },
                            { value: 'rounded', label: 'Rounded Square' },
                            { value: 'none', label: 'No Background' },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#64748B] mb-1 block">
                          Logo Scale ({logoSizePercent}%)
                        </label>
                        <RangeSlider
                          min={15}
                          max={28}
                          value={logoSizePercent}
                          onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Frame & Banner Label */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Frame className="size-3.5 text-[#2563EB]" />
                  Call-To-Action Frame & Label
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#64748B] mb-1 block">
                      Frame Style
                    </label>
                    <Select
                      value={frameStyle}
                      onChange={(e) => setFrameStyle(e.target.value as FrameStyle)}
                      options={[
                        { value: 'none', label: 'No Frame (Clean QR)' },
                        { value: 'bottom-banner', label: 'Bottom Banner' },
                        { value: 'top-banner', label: 'Top Banner' },
                        { value: 'card', label: 'Card Badge' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] mb-1 block">
                      Banner Text
                    </label>
                    <Input
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="SCAN ME"
                      disabled={frameStyle === 'none'}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#64748B] mb-1 block">
                      Banner Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => setFrameColor(e.target.value)}
                        disabled={frameStyle === 'none'}
                        className="size-9 rounded-lg cursor-pointer border border-[#E2E8F0]"
                      />
                      <span className="text-xs font-mono">{frameColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview & Export Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="size-4 text-[#2563EB]" />
                  Live Preview
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-semibold border border-blue-100">
                  Real-time
                </span>
              </div>

              {/* Rendered Preview Box */}
              <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] shadow-inner flex items-center justify-center w-full max-w-[340px]">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Custom QR Preview"
                    className="w-full max-w-[280px] h-auto object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="size-64 flex flex-col items-center justify-center text-[#64748B] text-xs">
                    <QrCode className="size-12 mb-2 stroke-1" />
                    Enter URL to preview
                  </div>
                )}
              </div>

              {/* Scannability & Contrast Guard */}
              <div className="w-full mt-4 space-y-2">
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    isContrastOptimal
                      ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]'
                      : isContrastFair
                      ? 'bg-amber-50 border-amber-200 text-[#D97706]'
                      : 'bg-red-50 border-red-200 text-[#DC2626]'
                  }`}
                >
                  {isContrastOptimal ? (
                    <ShieldCheck className="size-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong>
                      {isContrastOptimal
                        ? `Contrast Ratio: ${contrastRatio.toFixed(1)}:1 (Excellent)`
                        : isContrastFair
                        ? `Contrast Ratio: ${contrastRatio.toFixed(1)}:1 (Moderate)`
                        : `Contrast Ratio: ${contrastRatio.toFixed(1)}:1 (Low Warning!)`}
                    </strong>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      {isContrastOptimal
                        ? 'High contrast facilitates fast, reliable scanning across all mobile camera sensors.'
                        : isContrastFair
                        ? 'May scan slower in low-light environments. Test with a smartphone before printing.'
                        : 'Low contrast detected. Please choose a darker foreground or lighter background.'}
                    </p>
                  </div>
                </div>

                {isLogoOversized && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-[#D97706] rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Logo coverage is {logoSizePercent}%. Test scanning before large print runs.</span>
                  </div>
                )}
              </div>

              {/* Phone Scan Checklist Toggle */}
              <div className="w-full mt-3">
                <button
                  type="button"
                  onClick={() => setShowScanChecklist(!showScanChecklist)}
                  className="w-full py-2 px-3 text-xs text-[#2563EB] hover:bg-blue-50/50 rounded-lg flex items-center justify-between border border-blue-100 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Smartphone className="size-3.5" />
                    Physical Scan-Testing Instructions
                  </span>
                  <span>{showScanChecklist ? '▲' : '▼'}</span>
                </button>

                {showScanChecklist && (
                  <div className="mt-2 p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#475569] space-y-1.5">
                    <p className="font-semibold text-[#0F172A]">Recommended Pre-Print Checklist:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Open your smartphone's native Camera app (iOS/Android).</li>
                      <li>Hold device 15–25cm away with adequate ambient lighting.</li>
                      <li>Verify the popup prompt displays the exact destination URL.</li>
                      <li>Test under slightly tilted angles to guarantee real-world readability.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Export Controls */}
              <div className="w-full mt-6 pt-4 border-t border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Export Resolution
                  </label>
                  <div className="flex gap-1">
                    {[512, 1024, 2048].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setExportSize(s)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md border transition-colors ${
                          exportSize === s
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'border-[#E2E8F0] text-[#475569] hover:bg-slate-50'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    onClick={handleDownloadPNG}
                    disabled={!previewDataUrl || !!urlError}
                    className="w-full justify-center"
                  >
                    <Download className="size-4 mr-1.5" /> Download PNG
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadSVG}
                    disabled={!previewDataUrl || !!urlError}
                    className="w-full justify-center"
                  >
                    <Download className="size-4 mr-1.5" /> Vector SVG
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleCopyDataUrl}
                    disabled={!previewDataUrl}
                    className="flex-1 justify-center text-xs"
                  >
                    {copied ? (
                      <><Check className="size-3.5 text-[#16A34A] mr-1" /> Copied URL</>
                    ) : (
                      <><Copy className="size-3.5 mr-1" /> Copy Image URL</>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={handleSaveToHistory}
                    disabled={!previewDataUrl}
                    className="flex-1 justify-center text-xs"
                  >
                    {savedSuccess ? (
                      <><Check className="size-3.5 text-[#16A34A] mr-1" /> Saved!</>
                    ) : (
                      <><Layers className="size-3.5 mr-1" /> Save to Studio</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DYNAMIC QR CODES ─────────────────────────────────────── */}
      {activeTab === 'dynamic' && (
        <div className="space-y-6">
          {/* Cloud vs Local Testbed Status Banner */}
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Dynamic QR Code Destination Management
                  </h3>
                  {isSupabaseConfigured ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] font-semibold border border-emerald-200">
                      Cloud Connected (Supabase)
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] font-semibold border border-blue-200">
                      Local Testbed Mode (Active)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Dynamic QR codes encode a redirect link ({window.location.origin}/r/...) that lets you change the target URL anytime without altering or reprinting the QR code image.
                </p>
              </div>
            </div>

            <button
              onClick={refreshDynamicLinks}
              disabled={loadingDynamic}
              className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`size-3.5 ${loadingDynamic ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Dynamic Link Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Plus className="size-4 text-[#2563EB]" />
                Create New Dynamic QR
              </h3>
              <p className="text-xs text-[#64748B]">
                Specify an initial destination. You can update this destination anytime.
              </p>

              <form onSubmit={handleCreateDynamic} className="space-y-4">
                <Input
                  label="Title or Campaign Name"
                  placeholder="e.g., Summer Menu, Conference Brochure"
                  value={dynamicTitle}
                  onChange={(e) => setDynamicTitle(e.target.value)}
                />

                <Input
                  label="Destination Web Address"
                  placeholder="https://example.com/promo"
                  value={dynamicDestUrl}
                  onChange={(e) => setDynamicDestUrl(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full justify-center">
                  <Sparkles className="size-4 mr-2" />
                  Generate Dynamic QR Link
                </Button>
              </form>

              <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                <strong>Hosting Notice:</strong> Dynamic QR codes resolve via your domain. Ensure your server or hosting stays operational so redirected visitors reach their target smoothly.
              </div>
            </div>

            {/* List & Edit Existing Dynamic Links (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Active Dynamic QR Links ({dynamicLinks.length})
                </h3>
                <span className="text-xs text-[#64748B]">Live redirection</span>
              </div>

              {dynamicLinks.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] space-y-2">
                  <QrCode className="size-10 mx-auto stroke-1 text-slate-300" />
                  <p className="text-sm font-medium">No dynamic QR codes created yet.</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Use the form on the left to create your first dynamic QR code with an editable destination.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0] space-y-3">
                  {dynamicLinks.map((link) => (
                    <div key={link.shortCode} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#0F172A]">{link.title}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                link.isActive
                                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                                  : 'bg-amber-50 text-[#D97706] border border-amber-200'
                              }`}
                            >
                              {link.isActive ? 'Active' : 'Paused'}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              Code: {link.shortCode}
                            </span>
                          </div>

                          <p className="text-xs font-mono text-[#2563EB] mt-0.5 break-all">
                            {window.location.origin}/r/{link.shortCode}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadDynamicIntoEditor(link)}
                            className="p-1.5 text-xs font-medium text-[#2563EB] hover:bg-blue-50 rounded-lg"
                            title="Customize QR Visuals in Studio"
                          >
                            <Sliders className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(link)}
                            className="p-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg"
                            title={link.isActive ? 'Pause Redirect' : 'Resume Redirect'}
                          >
                            {link.isActive ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDynamic(link.shortCode)}
                            className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Destination Editor Box */}
                      {editingCode === link.shortCode ? (
                        <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2 mt-2">
                          <label className="text-xs font-semibold text-[#0F172A] block">
                            Change Target Destination (QR Code remains unchanged!):
                          </label>
                          <Input
                            value={editDestUrl}
                            onChange={(e) => setEditDestUrl(e.target.value)}
                            placeholder="https://new-destination.com"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingCode(null)}
                              className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-white rounded-lg border border-[#E2E8F0]"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateDynamic(link.shortCode)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg"
                            >
                              Save Target
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]/70">
                          <span className="text-[#475569] truncate max-w-sm">
                            <strong>Target:</strong> {link.destinationUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCode(link.shortCode);
                              setEditDestUrl(link.destinationUrl);
                            }}
                            className="text-[#2563EB] hover:underline font-semibold ml-2 shrink-0"
                          >
                            Edit URL
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Scans recorded: <strong>{link.scansCount}</strong></span>
                        <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: QR HISTORY & SAVED DESIGNS ────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Saved QR Code Designs</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Saved designs in your browser storage. Access or re-export anytime.
              </p>
            </div>
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all saved designs from browser storage?')) {
                    setHistoryItems([]);
                    localStorage.removeItem(HISTORY_STORAGE_KEY);
                  }
                }}
                className="text-xs text-[#DC2626] hover:underline font-semibold"
              >
                Clear History
              </button>
            )}
          </div>

          {historyItems.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] space-y-2">
              <Layers className="size-10 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-medium">No saved designs yet.</p>
              <p className="text-xs max-w-sm mx-auto">
                Customize any QR in the Static or Dynamic Studio and click "Save to Studio" to store it here for future access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col items-center text-center space-y-3 group hover:border-blue-300 transition-colors"
                >
                  <img
                    src={item.previewDataUrl}
                    alt={item.title}
                    className="size-32 object-contain bg-white rounded-lg border border-[#E2E8F0] p-2 shadow-sm"
                  />

                  <div className="w-full">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">{item.title}</h4>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">{item.url}</p>
                    <span className="text-[10px] text-[#94A3B8] block mt-1">{item.createdAt}</span>
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUrl(item.url);
                        setActiveTab('static');
                      }}
                      className="flex-1 py-1.5 bg-white border border-[#E2E8F0] hover:border-blue-300 text-xs font-semibold text-[#2563EB] rounded-lg"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDataUrl(item.previewDataUrl, `${item.title}-qr.png`)}
                      className="p-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg"
                      title="Download PNG"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
