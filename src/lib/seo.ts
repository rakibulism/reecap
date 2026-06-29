import { useEffect } from 'react';

export const SITE_URL = 'https://reecap.vercel.app';
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

interface SeoOptions {
  title: string;
  description: string;
  path: string;                 // e.g. "/blog/slug"
  type?: 'website' | 'article';
  keywords?: string[];
  image?: string;
  jsonLd?: object | object[];   // structured data graph(s)
}

function meta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function link(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets per-route document title, meta tags, canonical, and JSON-LD. */
export function useSeo({ title, description, path, type = 'website', keywords, image, jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = SITE_URL + path;
    const img = image || DEFAULT_OG;

    document.title = title;
    meta('name', 'description', description);
    if (keywords?.length) meta('name', 'keywords', keywords.join(', '));
    link('canonical', url);

    meta('property', 'og:title', title);
    meta('property', 'og:description', description);
    meta('property', 'og:url', url);
    meta('property', 'og:type', type);
    meta('property', 'og:image', img);
    meta('name', 'twitter:title', title);
    meta('name', 'twitter:description', description);
    meta('name', 'twitter:image', img);

    // JSON-LD structured data (managed in a single tagged script tag).
    const ID = 'seo-jsonld';
    let script = document.getElementById(ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = ID;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, type, keywords, image, jsonLd]);
}
