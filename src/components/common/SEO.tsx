import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://zenvio-fxo.vercel.app';
const SITE_NAME = 'Zenvio FXO';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function SEO({
  title,
  description,
  canonicalPath,
  noindex = false,
  ogType = 'website',
  jsonLd,
}: SEOProps) {
  const location = useLocation();
  // Ensure canonical URL is always normalized without trailing slash for subpaths, or with slash for root
  const rawPath = canonicalPath !== undefined ? canonicalPath : location.pathname;
  const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper function to safely set or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta description
    setMetaTag('name', 'description', description);

    // 3. Robots directive
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 4. OpenGraph tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:image', DEFAULT_IMAGE);

    // 5. Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);

    // 6. Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 7. Dynamic JSON-LD Structured Data
    const SCRIPT_ID = 'seo-dynamic-jsonld';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonicalUrl, noindex, ogType, jsonLd]);

  return null;
}
