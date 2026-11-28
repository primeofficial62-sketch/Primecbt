const API_ORIGIN = "https://prime-cbt.vercel.app";

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    // External Exams is now a separate application.
    // Keep its former routes unavailable on the University deployment.
    if (incomingUrl.pathname === "/external" || incomingUrl.pathname.startsWith("/external/")) {
      return new Response("Not Found", { status: 404 });
    }

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
