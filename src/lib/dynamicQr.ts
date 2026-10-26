import { isSupabaseConfigured, supabase } from './supabase';

export interface DynamicQrLink {
  id: string;
  shortCode: string;
  destinationUrl: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  scansCount: number;
  isActive: boolean;
  isCloudSynced: boolean;
}

const LOCAL_STORAGE_KEY = 'zenvio_dynamic_qr_links';

/**
 * Validate that destination URL is a valid, safe http/https web address
 */
export function isValidDestinationUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  
  // Explicitly disallow dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize destination URL (adds https:// if missing)
 */
export function normalizeDestinationUrl(urlStr: string): string {
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generate a random URL-friendly short code
 */
export function generateShortCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = 'z-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── Local Storage Helpers ───────────────────────────────────────────────────

function getLocalLinks(): DynamicQrLink[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLinks(links: DynamicQrLink[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(links));
  } catch (err) {
    console.error('Failed to save dynamic QR links locally', err);
  }
}

// ─── Dynamic QR Service Operations ──────────────────────────────────────────

/**
 * Create a new dynamic QR link
 */
export async function createDynamicLink(params: {
  destinationUrl: string;
  title: string;
}): Promise<DynamicQrLink> {
  const normalizedUrl = normalizeDestinationUrl(params.destinationUrl);
  if (!isValidDestinationUrl(normalizedUrl)) {
    throw new Error('Invalid destination URL. Must be a valid HTTP or HTTPS address.');
  }

  const shortCode = generateShortCode();
  const now = new Date().toISOString();

  const newLink: DynamicQrLink = {
    id: `dyn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    shortCode,
    destinationUrl: normalizedUrl,
    title: params.title.trim() || 'Untitled QR Code',
    createdAt: now,
    updatedAt: now,
    scansCount: 0,
    isActive: true,
    isCloudSynced: false,
  };

  // If Supabase is configured, attempt cloud save
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dynamic_qr_links')
        .insert({
          short_code: shortCode,
          destination_url: normalizedUrl,
          title: newLink.title,
          is_active: true,
          scans_count: 0,
        })
        .select()
        .single();

      if (!error && data) {
        newLink.id = data.id;
        newLink.isCloudSynced = true;
      }
    } catch {
      // Fallback to local store if Supabase request fails
    }
  }

  // Always keep in local registry for immediate availability
  const links = getLocalLinks();
  links.unshift(newLink);
  saveLocalLinks(links);

  return newLink;
}

/**
 * Retrieve a dynamic QR link by its short code (used by /r/:code)
 */
export async function getDynamicLink(shortCode: string): Promise<DynamicQrLink | null> {
  const cleanCode = shortCode.trim();

  // Try cloud lookup first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dynamic_qr_links')
        .select('*')
        .eq('short_code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          shortCode: data.short_code,
          destinationUrl: data.destination_url,
          title: data.title,
          createdAt: data.created_at,
          updatedAt: data.updated_at || data.created_at,
          scansCount: data.scans_count || 0,
          isActive: data.is_active ?? true,
          isCloudSynced: true,
        };
      }
    } catch {
      // Fall through to local cache
    }
  }

  // Check local storage registry
  const links = getLocalLinks();
  const found = links.find((l) => l.shortCode === cleanCode);
  return found || null;
}

/**
 * Update the destination URL or status of an existing dynamic QR link
 */
export async function updateDynamicLink(
  shortCode: string,
  updates: Partial<Pick<DynamicQrLink, 'destinationUrl' | 'title' | 'isActive'>>
): Promise<DynamicQrLink> {
  const links = getLocalLinks();
  const index = links.findIndex((l) => l.shortCode === shortCode);

  let newUrl: string | undefined = undefined;
  if (updates.destinationUrl) {
    newUrl = normalizeDestinationUrl(updates.destinationUrl);
    if (!isValidDestinationUrl(newUrl)) {
      throw new Error('Invalid destination URL.');
    }
  }

  const now = new Date().toISOString();

  // Cloud update if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const payload: Record<string, any> = { updated_at: now };
      if (newUrl) payload.destination_url = newUrl;
      if (updates.title !== undefined) payload.title = updates.title.trim();
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      await supabase
        .from('dynamic_qr_links')
        .update(payload)
        .eq('short_code', shortCode);
    } catch {
      // Continue to local update
    }
  }

  if (index !== -1) {
    links[index] = {
      ...links[index],
      ...(newUrl ? { destinationUrl: newUrl } : {}),
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
      updatedAt: now,
    };
    saveLocalLinks(links);
    return links[index];
  }

  throw new Error(`Dynamic QR link with code "${shortCode}" not found.`);
}

/**
 * Record a scan / redirect event
 */
export async function recordScan(shortCode: string): Promise<void> {
  // Update local store
  const links = getLocalLinks();
  const index = links.findIndex((l) => l.shortCode === shortCode);
  if (index !== -1) {
    links[index].scansCount = (links[index].scansCount || 0) + 1;
    saveLocalLinks(links);
  }

  // Cloud increment if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc('increment_qr_scans', { link_code: shortCode });
    } catch {
      // Silent error for scan recording
    }
  }
}

/**
 * Delete a dynamic QR link
 */
export async function deleteDynamicLink(shortCode: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('dynamic_qr_links').delete().eq('short_code', shortCode);
    } catch {
      // Proceed to local removal
    }
  }

  const links = getLocalLinks().filter((l) => l.shortCode !== shortCode);
  saveLocalLinks(links);
  return true;
}

/**
 * List all dynamic QR links
 */
export async function listDynamicLinks(): Promise<DynamicQrLink[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('dynamic_qr_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((d) => ({
          id: d.id,
          shortCode: d.short_code,
          destinationUrl: d.destination_url,
          title: d.title,
          createdAt: d.created_at,
          updatedAt: d.updated_at || d.created_at,
          scansCount: d.scans_count || 0,
          isActive: d.is_active ?? true,
          isCloudSynced: true,
        }));
      }
    } catch {
      // Fall through to local links
    }
  }

  return getLocalLinks();
}
