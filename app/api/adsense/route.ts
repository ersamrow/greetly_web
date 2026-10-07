import { getAdSenseSettings } from '@/lib/adsense-server';

export function GET() {
  return Response.json(getAdSenseSettings(), {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
