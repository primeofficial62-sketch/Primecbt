const API_ORIGIN = "https://prime-cbt.vercel.app";

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    // Keep the existing Vercel serverless API as the backend while Cloudflare
    // serves the public static site. Forward all /api/* methods, query strings,
    // request bodies, and cookies without exposing server credentials.
    if (incomingUrl.pathname.startsWith("/api/")) {
      const upstreamUrl = new URL(
        incomingUrl.pathname + incomingUrl.search,
        API_ORIGIN
      );
      const upstreamRequest = new Request(upstreamUrl, request);
      return fetch(upstreamRequest);
    }

    // All non-API routes continue to use the existing Cloudflare static assets.
    return env.ASSETS.fetch(request);
  },
};
