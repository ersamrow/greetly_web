# Hostinger deployment

Use Hostinger's **Node.js Web App** with these build settings:

- Framework: **Next.js**
- Node.js: **22**
- Package manager: **npm**
- Build command: **npm run build** (select this in the dropdown)
- Output directory: **.next**
- Root directory: the directory containing this package.json
- Entry file: leave empty for Hostinger's Next.js deployment

The default `npm run build` runs the Hostinger Next.js build. The alternative
`npm run build:hostinger` does the same thing. For Vinext/Sites, explicitly run
`npm run build:sites`; its `dist` output is not for Hostinger's Next.js deployment.

## Database setup

1. Create a MySQL database and database user in hPanel.
2. Note the database connection values for the app's environment settings.
3. Add these environment variables in the Node.js app's deployment settings:
   `MYSQL_HOST`, `MYSQL_PORT` (usually `3306`), `MYSQL_DATABASE`, `MYSQL_USER`,
   and `MYSQL_PASSWORD`. Copy the actual connection values from hPanel.
4. Set a strong `ADMIN_TOKEN` for the admin API. Optional AdSense variables
   are listed in `.env.example`; configure these before building.
5. Run `npm run db:migrate` from the project directory in an environment that
   can reach this database. This creates the four application tables and a
   `greetly_migrations` history table. Existing tables and data are preserved.
   Alternatively, select the database in phpMyAdmin and import `db/hostinger.sql`.
6. Deploy the updated source using the build settings above.

The migration command reads `.env` and `.env.local` when present, while keeping
already-set environment variables. Repeat runs skip completed migrations and
use a database lock to prevent concurrent migration runs. An interrupted initial
migration can be retried safely. Do not edit `db/hostinger.sql` after the baseline
has been recorded; add future migrations as new entries in the migration runner.
An existing table is not altered or checked for schema compatibility by the
initial migration. This is table creation, not a Cloudflare data transfer.

If your deployment environment can reach MySQL during builds, an explicit
one-step deployment command is `npm run db:migrate && npm run build`.
Otherwise run migration from a database-accessible terminal before deployment.
The default build stays database-independent. Run `npm run test:migrations`
to verify the runner with mocked database access.

Greetings, reports, template visibility, analytics events, and JPEG photos are
stored in MySQL. Photos use a MEDIUMBLOB column, retaining the existing upload
size limit. No database credentials are bundled into browser code.

This creates a fresh database. Existing Cloudflare D1/R2 data is not migrated.
The build does not need a database connection, but API requests need configured
credentials and the imported schema. Do not commit real credentials.

## Local production check

Run `npm run build:hostinger`, then `npm run start:hostinger`. The build prepares
the standalone server with public assets and Next.js static chunks. It listens
on `PORT` (default `3000`); use `HOSTNAME=127.0.0.1` for a local-only check.

The dedicated Next.js build replaces the Worker environment module with the
MySQL adapter. Vinext/Sites continues to use its Cloudflare bindings.

Run `npm run test:hostinger` for adapter tests with a mocked MySQL driver. These
verify query parameters, photo bytes, and configuration, but do not replace a
live database check. After deploying, create a greeting with a photo, open its
share link, then delete it to verify database access and the imported schema.

## Search engine configuration

The default public origin is `https://greetly.myledgerpro.in`. Set `SITE_URL`
before building only if this changes. Use an HTTP(S) origin without a path,
query string, or credentials. Rebuild and redeploy after changing the domain;
the homepage, robots file, and sitemap are generated during the build.

`/sitemap.xml` lists the homepage and every occasion collection. `/robots.txt`
advertises that sitemap and excludes API paths. Personal greeting pages,
administration, and the device-specific privacy controls use `noindex` metadata;
their HTML remains crawlable so search engines can read that instruction.
These rules do not provide access control.

Run `node scripts/test-seo.mjs` for metadata and sitemap checks. After deploying,
verify the domain in Google Search Console and submit
`https://greetly.myledgerpro.in/sitemap.xml`. Inspect the homepage and an occasion
URL to confirm that Google sees the intended canonical and indexability.
Search Console verification and submission require the site's owner account.

## Copy/share requests behind the hosting proxy

The API accepts the configured `SITE_URL` origin as well as the request URL's
own origin. This allows public HTTPS requests when the hosting proxy passes an
internal HTTP URL to Next.js. The default is `https://greetly.myledgerpro.in`;
if overriding `SITE_URL`, use that exact public origin, without a trailing path.
Unrelated origins and caller-supplied forwarding headers do not grant access.

Run `node scripts/test-request-origin.mjs` to test proxy requests, hostile
origins, and the greeting/analytics handlers with mocked storage. Deploy and
restart the updated server to apply this fix; it is not a browser-cache change.
