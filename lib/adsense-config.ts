export type AdSenseSettings = {
  ADSENSE_PUBLISHER_ID?: string;
  ADSENSE_DISPLAY_SLOT?: string;
  ADSENSE_ENABLED?: string;
  ADSENSE_CONSENT_READY?: string;
};

export function parseAdSenseSettings(settings: AdSenseSettings) {
  const publisherId = settings.ADSENSE_PUBLISHER_ID?.trim() || '';
  const displaySlot = settings.ADSENSE_DISPLAY_SLOT?.trim() || '';
  const validPublisher = /^ca-pub-\d{16}$/.test(publisherId);
  const validSlot = /^\d{10}$/.test(displaySlot);
  return {
    publisherId: validPublisher ? publisherId : '',
    displaySlot: validSlot ? displaySlot : '',
    enabled: validPublisher && validSlot && settings.ADSENSE_ENABLED === 'true'
      && settings.ADSENSE_CONSENT_READY === 'true',
  };
}

export function adsTxt(publisherId: string) {
  return /^ca-pub-\d{16}$/.test(publisherId)
    ? `google.com, ${publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`
    : null;
}
