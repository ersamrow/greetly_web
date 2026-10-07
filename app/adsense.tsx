'use client';

import { useEffect, useRef, useState } from 'react';

type Settings = { publisherId: string; displaySlot: string; enabled: boolean };
declare global {
  interface Window { adsbygoogle?: { push: (value: Record<string, never>) => unknown } }
}

let scriptPromise: Promise<void> | undefined;
function loadAdSense(publisherId: string) {
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'greetly-adsense';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); reject(new Error('AdSense unavailable')); };
      document.head.appendChild(script);
    }).catch(error => { scriptPromise = undefined; throw error; });
  }
  return scriptPromise;
}

// Only mounted on content-rich collection pages. Google's configured Privacy &
// messaging CMP handles advertising consent, separately from our analytics toggle.
export default function AdSense({ placement }: { placement: 'collection' | 'messages' }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [failed, setFailed] = useState(false);
  const element = useRef<HTMLModElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/adsense', { signal: controller.signal, cache: 'no-store' })
      .then(async response => response.ok ? response.json() as Promise<Settings> : null)
      .then(value => {
        if (value?.enabled && /^ca-pub-\d{16}$/.test(value.publisherId)
          && /^\d{10}$/.test(value.displaySlot)) setSettings(value);
      }).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const ad = element.current;
    if (!settings || !ad) return;
    let cancelled = false;
    let requested = false;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || requested || ad.clientWidth === 0) return;
      requested = true;
      observer.disconnect();
      void loadAdSense(settings.publisherId).then(() => {
        if (cancelled || !ad.isConnected || ad.hasAttribute('data-adsbygoogle-status')) return;
        const queue = window.adsbygoogle || ([] as Record<string, never>[]);
        window.adsbygoogle = queue;
        queue.push({});
      }).catch(() => { if (!cancelled) setFailed(true); });
    }, { rootMargin: '150px' });
    observer.observe(ad);
    return () => { cancelled = true; observer.disconnect(); };
  }, [settings]);

  if (!settings || failed) return null;
  return <aside className="advertisement" aria-label="Advertisement" data-placement={placement}>
    <p>Advertisement</p>
    <ins ref={element} className="adsbygoogle" style={{ display: 'block' }}
      data-ad-client={settings.publisherId} data-ad-slot={settings.displaySlot}
      data-ad-format="auto" data-full-width-responsive="true" />
  </aside>;
}
