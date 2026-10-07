import { getAdSenseSettings } from '@/lib/adsense-server';
import { adsTxt } from '@/lib/adsense-config';

export function GET() {
  const content = adsTxt(getAdSenseSettings().publisherId);
  return new Response(content || '# AdSense publisher is not configured.\n', {
    status: content ? 200 : 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
