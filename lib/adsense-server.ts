import { env } from 'cloudflare:workers';
import { parseAdSenseSettings, type AdSenseSettings } from './adsense-config';

export function getAdSenseSettings() {
  return parseAdSenseSettings(env as unknown as AdSenseSettings);
}
