// Content-Security-Policy for the built web app and Platform Console (Part 10 §10.12.3,
// §10.17). Added to index.html at build time only: the Vite dev server injects inline scripts
// for hot reload, so it runs without the policy. Hosted builds also send it as a header.

/**
 * @param {{ apiOrigin: string }} options the API the pages call (connect-src).
 * @returns {string}
 */
export function contentSecurityPolicy({ apiOrigin }) {
  return [
    "default-src 'self'",
    "script-src 'self'",
    // React style props and the design tokens' <style> element.
    "style-src 'self' 'unsafe-inline'",
    // QR codes for authenticator apps are drawn as data: images.
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/**
 * A Vite plugin that writes the policy into index.html of production builds.
 * @param {{ apiOrigin: string }} options
 * @returns {import('vite').Plugin}
 */
export function cspPlugin(options) {
  return {
    name: 'erp-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(options)}" />`;
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${meta}`);
    },
  };
}
