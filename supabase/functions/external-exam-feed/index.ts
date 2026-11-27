import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const allowedHosts = new Set([
  "jamb.gov.ng",
  "waecnigeria.org",
  "neco.gov.ng",
  "education.gov.ng",
]);
const monthNames = "January February March April May June July August September October November December".split(" ");
const monthPattern = monthNames.join("|");

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}
function tag(item: string, name: string) {
  const match = item.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i"));
  return match ? decodeXml(match[1]).trim() : "";
}
function hostAllowed(raw: string) {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    return [...allowedHosts].some(domain => host === domain || host.endsWith("." + domain));
  } catch { return false; }
}
function eventDate(text: string): Date | null {
  const iso = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 9);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const dayFirst = text.match(new RegExp("\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(" + monthPattern + ")\\s+(20\\d{2})\\b", "i"));
  const monthFirst = text.match(new RegExp("\\b(" + monthPattern + ")\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(20\\d{2})\\b", "i"));
  const match = dayFirst || monthFirst;
  if (!match) return null;
  const day = Number(dayFirst ? match[1] : match[2]);
  const month = monthNames.findIndex(m => m.toLowerCase() === (dayFirst ? match[2] : match[1]).toLowerCase());
  const year = Number(match[3]);
  const d = new Date(year, month, day, 9);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}
function parseItems(xml: string, eventFeed: boolean) {
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
  const now = Date.now();
  return items.flatMap(item => {
    const title = tag(item, "title");
    const link = tag(item, "link");
    const guid = tag(item, "guid") || link;
    const description = tag(item, "description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 900);
    const sourceMatch = item.match(/<source\s+url=["']([^"']+)["'][^>]*>([\s\S]*?)<\/source>/i);
    const publisherUrl = sourceMatch ? decodeXml(sourceMatch[1]) : "";
    const sourceName = sourceMatch ? decodeXml(sourceMatch[2]).trim() : "";
    if (!title || !link || !guid || !hostAllowed(publisherUrl)) return [];
    const date = eventFeed ? eventDate(title + " " + description) : null;
    const eventLike = /exam|registration|timetable|schedule|deadline|orientation|screening|mock/i.test(title);
    const isEvent = !!date && date.getTime() > now && eventLike;
    const published = Date.parse(tag(item, "pubDate"));
    return [{
      source_item_id: guid.slice(0, 1800),
      source_name: sourceName || new URL(publisherUrl).hostname,
      source_url: link,
      target_url: link,
      title: title.slice(0, 500),
      summary: description || "Open the original publisher's notice for full details.",
      update_type: isEvent ? "event" : "news",
      starts_at: isEvent ? date!.toISOString() : null,
      published_at: Number.isFinite(published) ? new Date(published).toISOString() : new Date().toISOString(),
      is_published: true,
    }];
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return new Response(JSON.stringify({ error: "Feed service is not configured" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const { data: sync } = await db.from("external_exam_feed_sync_state").select("last_synced_at").eq("singleton", true).maybeSingle();
    if (sync?.last_synced_at && Date.now() - new Date(sync.last_synced_at).getTime() < 15 * 60 * 1000) {
      return new Response(JSON.stringify({ ok: true, refreshed: false, reason: "recently_synced" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const baseQuery = "site:jamb.gov.ng OR site:waecnigeria.org OR site:neco.gov.ng OR site:education.gov.ng";
    const feeds = [
      { url: "https://news.google.com/rss/search?q=" + encodeURIComponent(baseQuery) + "&hl=en-NG&gl=NG&ceid=NG:en", events: false },
      { url: "https://news.google.com/rss/search?q=" + encodeURIComponent(baseQuery + " (exam date OR timetable OR schedule OR registration deadline)") + "&hl=en-NG&gl=NG&ceid=NG:en", events: true },
    ];
    const all = [];
    for (const feed of feeds) {
      const response = await fetch(feed.url, { headers: { "User-Agent": "PRIME-CBT-External-Exams/1.0" } });
      if (!response.ok) throw new Error("Trusted news feed returned HTTP " + response.status);
      all.push(...parseItems(await response.text(), feed.events));
    }
    const deduped = [...new Map(all.map(item => [item.source_item_id, item])).values()];
    if (deduped.length) {
      const { error } = await db.from("external_exam_updates").upsert(deduped, { onConflict: "source_item_id", ignoreDuplicates: true });
      if (error) throw error;
    }
    await db.from("external_exam_feed_sync_state").upsert({ singleton: true, last_synced_at: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() });
    return new Response(JSON.stringify({ ok: true, refreshed: true, imported: deduped.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error).slice(0, 1000);
    await db.from("external_exam_feed_sync_state").upsert({ singleton: true, last_error: message, updated_at: new Date().toISOString() });
    return new Response(JSON.stringify({ error: "Unable to refresh trusted exam updates", detail: message }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
