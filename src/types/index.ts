// ─── Tool Registry Types ──────────────────────────────────────────────────────

export type ToolCategory =
  | 'imagekit'
  | 'pdfkit'
  | 'dockit'
  | 'studentkit'
  | 'careerkit'
  | 'devkit'
  | 'mediakit'
  | 'privacykit'
  | 'qrkit'
  | 'aikit';

export type ToolStatus = 'live' | 'beta' | 'coming-soon';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  slug: string;
  icon: string; // Lucide icon name
  status: ToolStatus;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  relatedTools?: string[]; // tool ids
}

export interface ToolCategory_ {
  id: ToolCategory;
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
}

// ─── App State Types ──────────────────────────────────────────────────────────

export interface SearchResult {
  tool: Tool;
  score: number;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress?: number;
  message?: string;
}

// ─── File Types ───────────────────────────────────────────────────────────────

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface ProcessedFile {
  originalName: string;
  originalSize: number;
  processedName: string;
  processedSize: number;
  url: string;
  blob: Blob;
}
