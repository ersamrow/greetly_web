# Greetly

React/Vinext greeting maker with 72 template variants, seven occasion collections, PNG canvas exports, native sharing with fallbacks, device-local drafts, Cloudflare D1 saved greetings and analytics, R2 photos, and an installable PWA.

## Develop

Run `npm install`, `npm run db:generate` after schema changes, and `npm run build`. Apply pending local migrations with the command in the starter README, then `npm run dev`. Hosted deployments apply generated migrations automatically.

## Launch configuration

- Set a strong `ADMIN_TOKEN` secret to enable `/admin`. Until configured, admin access fails closed. Never put this token in client code.
- The initial Sites deployment is owner-private. Anonymous recipient access and search indexing of occasion pages require explicitly making the Site public in its access settings.
- Google AdSense is integrated with manual responsive placements after the template library and below message suggestions. Personal greeting pages, admin, privacy, and editor/share dialogs have no ad units. Unconfigured or disabled units render nothing.
- The library uses 60 original reusable variants plus six Dussehra and six Diwali designs. Three original illustrations (floral, Dussehra bow/marigolds, and Diwali diyas/rangoli) were created with image generation; other designs use geometric patterns and system fonts. Existing IDs remain unchanged so older shared links still work. Festival filters and server validation use the shared template registry.
- Native file sharing, installation prompts, and offline support depend on the browser. A first online visit is required to cache the app. Shared greetings, APIs, admin and personal photos are deliberately excluded from service-worker caching.
- Configure abuse/rate limits at the hosting layer before a public launch. Review reported greetings in admin. Server-side payload validation and a 5 MB client photo limit are implemented; photos are resized before upload.
- Deletion keys are stored on the creator’s device; clearing browser data removes those keys. No account recovery is implemented.
- Aggregate analytics are opt-in. Share completion means the device share API resolved; it does not prove social publication. Revenue reporting requires a connected advertising provider.

## Google AdSense

Configure these runtime variables in Sites (or a local ignored `.env` file):

- `ADSENSE_PUBLISHER_ID=ca-pub-4905030687832208`
- `ADSENSE_DISPLAY_SLOT`: the 10-digit `data-ad-slot` from a responsive display unit.
- `ADSENSE_ENABLED=true` when the site is approved and ready to serve ads.
- `ADSENSE_CONSENT_READY=true` only after configuring and publishing applicable Google Privacy & messaging messages (including a Google-certified CMP for EEA/UK/Switzerland visitors). The existing anonymous-analytics banner is not advertising consent.

The publisher ID enables the `google-adsense-account` verification meta tag and `/ads.txt` independently of ad serving. No placeholder publisher or slot ID is used. The ad SDK loads once, near a visible unit, only when both activation flags and both IDs are valid. Ad blockers/load failures leave the greeting workflow working. The PWA never caches Google's cross-origin scripts or ads; config and ads.txt responses use no-store.

Keep Auto ads disabled in the AdSense dashboard: these manually placed units keep ads away from editing and sharing. Google's configured Privacy & messaging CMP handles consent and revocation. Do not enable the consent-ready flag just to make ads appear. AdSense approval, consent-message publication and the site's public accessibility are account/hosting setup steps, not consequences of deploying this code. No ad impressions or revenue are fabricated in the app's analytics.

References: https://support.google.com/adsense/answer/12171612 (ads.txt), https://support.google.com/adsense/answer/9183363 (responsive units), https://support.google.com/adsense/answer/10960768 (Google consent messages).

## Data

`greetings` stores validated text/design fields and a hash of an unguessable deletion key. Uploaded JPEGs live in R2. Personal pages and APIs carry noindex/no-store controls. `published` controls template availability. `events` records consented template/action counts without names, messages or photos.
