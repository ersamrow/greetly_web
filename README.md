# vinext-starter

## Creator photo posts

In a greeting's Photo tab, upload a portrait with automatic background removal
enabled (the default). The browser downloads MediaPipe Tasks Vision 0.10.32
WASM from jsDelivr and Google's Selfie Segmenter model on first use. Photo pixels
are processed locally, with no background-removal API key or server upload.
Initial processing requires internet access. A clear, well-lit single-person
portrait gives the best results; hair and complex backgrounds may be imperfect.

Creator post layout places the transparent portrait beside the greeting and
prints the sender's name at the bottom. Portrait scale and the existing drag
controls adjust placement. The preview's Move menu selects the heading, message,
recipient name, creator/sender name or photo independently. Drag, arrow buttons
and keyboard arrows adjust the selected element; Reset selected resets only that
element. All text together preserves the existing grouped movement.
Individual positions survive drafts, sharing and downloads.
Click text or a portrait on the preview to select it. The selection outline is
measured by the same renderer used for exports, including fitted social formats.
Drag its corner handle to resize from 50–200%, or use the accessible Size slider
and keyboard arrows on the handle. Each text section and portrait resizes
independently. Resize settings persist with the greeting. While dragging, edges
and centres snap to the card or other elements and show alignment guides; hold
Alt to bypass snapping. Selection outlines and guides never appear in downloads.
On phones, use the size slider in the compact preview; Larger preview also shows
the corner handle without crowding small text.
Under Photo → From / name style, choose a compact badge (the default), plain
text, an italic signature, an outline or a full-width strip. Set the prefix
(including name only), font, 20–80 px name size, text/background colours and
badge opacity independently of the greeting. The badge fits the name rather
than spanning the portrait, and these settings persist in saved greetings.
Disable automatic removal to upload an already
transparent PNG, then enable Creator post layout. Undo restores prior edits.
Drafts and saved links preserve the layout, and the shared renderer supports
PNG, social formats, video and print. Business logos and invitations retain
their existing upload flow.

Run `node scripts/test-creator.mjs` for browser rendering and schema checks.
Set `PORTRAIT_TEST_IMAGE` to a local portrait to additionally exercise real
segmentation; `CHROME_PATH` can select a Chrome executable. Test images are
written only to the ignored `.local-tests/` directory.

Deploying Greetly on Hostinger? Follow [HOSTINGER.md](./HOSTINGER.md) for the
Next.js build command and MySQL setup. `npm run build` now targets Hostinger;
use `npm run build:sites` for the Sites build described below.

## Card pages and preview assets

Every template has a `/card/<descriptive-slug>` page. Stable IDs still identify saved drafts and preview assets; `lib/legacy-cards.json` maps the 60 original IDs to public slugs, with 301 redirects configured in Next.js. Only canonical editions are included in the sitemap.
The homepage shows a curated selection; collection pages link to every card.
Thumbnails are committed WebP files at 320 and 640 pixels, and social previews
are 1200 × 630 JPEGs rendered from the same canvas code as the editor.

After changing template names, artwork, or rendering, run `npm run previews`
before building and commit the resulting `public/previews` files. This uses
local headless Chrome (set `CHROME_PATH` if Chrome is installed elsewhere).
Production builds do not require Chrome. Run `npm run test:seo` to check
catalog coverage, unique names, metadata and preview availability. With the
built app running, run `node scripts/smoke-seo.mjs`; `TEST_BASE_URL` defaults
to `http://127.0.0.1:3000`.

Admin data and mutations require the server's `ADMIN_TOKEN`. The public admin
page is only the key-entry screen; no admin data is embedded in its HTML.
Missing or incorrect keys are rejected by the API. Configure this secret on
the deployment host; never expose it through a `NEXT_PUBLIC_` variable.

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)


## Card discovery and search metadata

Card tiles link to their detail pages; the Personalise button opens the editor as
an action. Card pages contain contextual copy, three example messages and related
cards. `lib/card-editorial.ts` owns that copy. Alternate faith “Warm wishes”
editions canonicalise to the original; general Diwali and Hindu Deepavali cards
retain distinct URLs because they serve different messages and audiences.

`lib/content-dates.ts` records meaningful content revision dates. Update the
relevant date when content changes; never replace it with the build/request date.

If verification is not already handled through DNS, set
`GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` to the public token
from the service, then rebuild. Empty values emit no verification tag. Setting a
tag does not itself verify ownership or submit the sitemap: complete verification
and submit `https://greetlo.in/sitemap.xml` in the appropriate account after
publishing. Request indexing for `/occasions/diwali`, `/card/diwali-diyas`, and the
other intended canonical pages only after the deployed pages are available.

Run `npm run test:seo`, then `node scripts/smoke-seo.mjs` against the built server
(`TEST_BASE_URL` overrides its default). The smoke check verifies real 301s,
server-rendered metadata, structured data, related content and social images.
