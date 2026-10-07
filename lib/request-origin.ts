/** Validate browser origins without trusting caller-supplied proxy headers. */
export function isSameOrigin(request: Request, publicOrigin?: string): boolean {
  const origin = request.headers.get('origin');
  // Preserve support for non-browser clients and existing server-side scripts.
  if (!origin) return true;
  if (origin === 'null') return false;
  try {
    const parsed = new URL(origin);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.origin !== origin) return false;
    // Reverse proxies may expose an internal HTTP URL to the application even
    // though the browser is using the configured public HTTPS origin.
    return origin === new URL(request.url).origin || origin === publicOrigin;
  } catch {
    return false;
  }
}
