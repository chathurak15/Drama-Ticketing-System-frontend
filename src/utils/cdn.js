export const getCdnUrl = (path = '', folder = '') => {
  if (!path || typeof path !== 'string') return '/assets/hero.png';

  let clean = path.trim();
  if (!clean) return '/assets/hero.png';

  // 1. Detect any absolute URL embedded in path (e.g. "dramas/https://...", "https://...", "https:/...")
  const httpMatch = clean.match(/(https?:\/+[^\s]+)/i);
  if (httpMatch) {
    let url = httpMatch[1];
    // Fix single slash after protocol e.g. https:/domain -> https://domain
    if (url.startsWith('https:/') && !url.startsWith('https://')) {
      url = 'https://' + url.slice(7);
    } else if (url.startsWith('http:/') && !url.startsWith('http://')) {
      url = 'http://' + url.slice(6);
    }

    // Handle dead cloudfront distribution fallback
    if (url.includes('cloudfront.net/uploads/')) {
      const sub = url.split('cloudfront.net/uploads/')[1];
      return `/uploads/${sub}`;
    }
    if (url.includes('cloudfront.net/')) {
      const sub = url.split('cloudfront.net/')[1];
      return `/${sub}`;
    }
    return url;
  }

  // 2. Handle leading slashes
  if (clean.startsWith('/')) {
    clean = clean.slice(1);
  }

  // 3. If already starts with uploads/
  if (clean.startsWith('uploads/')) {
    return `/${clean}`;
  }

  // 4. If folder is provided and clean does not already start with that folder
  if (folder) {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    if (cleanFolder && !clean.startsWith(cleanFolder + '/')) {
      clean = `${cleanFolder}/${clean}`;
    }
  }

  let baseUrl = '/uploads';
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CDN_URL) {
    const envCdn = process.env.NEXT_PUBLIC_CDN_URL;
    if (!envCdn.includes('cloudfront.net')) {
      baseUrl = envCdn;
    }
  } else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CDN_URL) {
    const viteCdn = import.meta.env.VITE_CDN_URL;
    if (!viteCdn.includes('cloudfront.net')) {
      baseUrl = viteCdn;
    }
  }

  return `${baseUrl.replace(/\/+$/, '')}/${clean}`;
};

export const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {}
  return 'http://localhost:8080/api/v1/';
};

