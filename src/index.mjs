const API_ORIGIN = "https://prime-cbt.vercel.app";

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    // Route the External Exams directory explicitly; the Worker asset binding
    // does not consistently apply nested directory index resolution.
    if (incomingUrl.pathname === "/external" || incomingUrl.pathname === "/external/") {
      return Response.redirect(new URL("/external/home.html", incomingUrl), 302);
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
