# Hostinger deployment

Use Hostinger's **Node.js Web App** with these build settings:

- Framework: **Next.js**
- Node.js: **22**
- Package manager: **npm**
- Build command: **npm run build:hostinger**
- Output directory: **.next**
- Root directory: the directory containing this package.json
- Entry file: leave empty for Hostinger's Next.js deployment

The default `npm run build` remains the Vinext/Sites build. It produces `dist`,
which Hostinger's Next.js deployment cannot use.

## Database setup

1. Create a MySQL database and database user in hPanel.
2. Select that database in phpMyAdmin and import `db/hostinger.sql`.
3. Add these environment variables in the Node.js app's deployment settings:
   `MYSQL_HOST`, `MYSQL_PORT` (usually `3306`), `MYSQL_DATABASE`, `MYSQL_USER`,
   and `MYSQL_PASSWORD`. Copy the actual connection values from hPanel.
4. Set a strong `ADMIN_TOKEN` for the admin API. Optional AdSense variables
   are listed in `.env.example`; configure these before building.
5. Deploy the updated source using the build settings above.

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
