import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const OFFICE_FILE = /\.(pptx?|docx?|xlsx?)$/i;
const MAX_FILE_BYTES = 100 * 1024 * 1024;

function parseSourceUrl(raw: string, supabaseUrl: string, allowedBucket: string) {
  if (typeof raw !== "string" || raw.length > 4096) throw new Error("Invalid file URL.");
  const target = new URL(raw);
  const base = new URL(supabaseUrl);
  if (
    base.protocol !== "https:" ||
    target.protocol !== "https:" ||
    target.origin !== base.origin ||
    target.username ||
    target.password ||
    target.search ||
    target.hash
  ) throw new Error("Only public files from this PRIME-CBT project can be converted.");

  const prefix = "/storage/v1/object/public/";
  if (!target.pathname.startsWith(prefix)) throw new Error("The file must be in public Storage.");
  const parts = target.pathname.slice(prefix.length).split("/").map((part) => decodeURIComponent(part));
  const bucket = parts.shift() || "";
  if (
    bucket !== allowedBucket ||
    !parts.length ||
    parts.some((part) => !part || part === "." || part === ".." || /[\\/\u0000-\u001f]/.test(part))
  ) throw new Error("Only files from the configured materials bucket can be converted.");

  const path = parts.join("/");
  if (!OFFICE_FILE.test(path)) throw new Error("Only PowerPoint, Word and Excel files can be converted.");
  return { bucket, path };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const cloudConvertKey = Deno.env.get("CLOUDCONVERT_API_KEY") || "";
  const allowedBucket = Deno.env.get("STORAGE_BUCKET") || "materials";

  if (!supabaseUrl || !serviceKey || !cloudConvertKey) {
    return json({ error: "The PDF conversion service is not configured." }, 503);
  }

  // This function is server-to-server only. The service-role key is never sent to a browser.
  if (
    req.headers.get("authorization") !== `Bearer ${serviceKey}` ||
    req.headers.get("apikey") !== serviceKey
  ) return json({ error: "Not authorised." }, 401);

  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > 8192) return json({ error: "Request is too large." }, 413);

  let body: { file_url?: string };
  try {
    const raw = await req.text();
    if (raw.length > 8192) return json({ error: "Request is too large." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "A valid JSON request is required." }, 400);
  }

  let source: { bucket: string; path: string };
  try {
    source = parseSourceUrl(String(body.file_url || ""), supabaseUrl, allowedBucket);
  } catch (error) {
    return json({ error: (error as Error).message || "Invalid file URL." }, 400);
  }

  const { bucket, path: sourcePath } = source;
  const pdfPath = sourcePath.replace(OFFICE_FILE, ".pdf");
  const folder = sourcePath.split("/").slice(0, -1).join("/");
  const sourceName = sourcePath.split("/").pop() || "";
  const pdfName = pdfPath.split("/").pop() || "";
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const storage = supabase.storage.from(bucket);
  const publicPdfUrl = storage.getPublicUrl(pdfPath).data.publicUrl;

  try {
    const { data: sourceFiles, error: sourceError } = await storage.list(folder, {
      search: sourceName,
      limit: 10,
    });
    if (sourceError) throw new Error("Could not verify the source file.");
    const sourceFile = (sourceFiles || []).find((file) => file.name === sourceName);
    if (!sourceFile) return json({ error: "The source file was not found in Storage." }, 404);
    const sourceSize = Number(sourceFile.metadata?.size || 0);
    if (sourceSize > MAX_FILE_BYTES) return json({ error: "Files larger than 100 MB cannot be converted." }, 413);

    const { data: existingFiles, error: existingError } = await storage.list(folder, {
      search: pdfName,
      limit: 10,
    });
    if (existingError) throw new Error("Could not check for an existing PDF.");
    const cached = (existingFiles || []).find((file) => file.name === pdfName);
    if (cached) {
      return json({
        pdf_url: publicPdfUrl,
        size: Number(cached.metadata?.size || 0),
        cached: true,
      });
    }

    const { data: claim, error: claimError } = await supabase.rpc("claim_pdf_conversion_job", {
      p_bucket: bucket,
      p_source_path: sourcePath,
      p_pdf_path: pdfPath,
    });
    if (claimError) throw new Error("Could not reserve a conversion slot.");
    if (claim === "busy") return json({ error: "This file is already being converted. Try again shortly." }, 409);
    if (claim === "rate_limited") return json({ error: "Too many conversions. Wait one minute and try again." }, 429);
    if (claim !== "claimed") throw new Error("The conversion slot could not be reserved.");

    const updateJob = async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("pdf_conversion_jobs").update({
        ...patch,
        updated_at: new Date().toISOString(),
      }).eq("bucket", bucket).eq("source_path", sourcePath);
      if (error) throw new Error("Could not update the conversion job.");
    };

    try {
      const sourceUrl = storage.getPublicUrl(sourcePath).data.publicUrl;
      const headers = {
        Authorization: `Bearer ${cloudConvertKey}`,
        "Content-Type": "application/json",
      };
      const createResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          tasks: {
            import: { operation: "import/url", url: sourceUrl },
            convert: { operation: "convert", input: "import", output_format: "pdf" },
            export: { operation: "export/url", input: "convert" },
          },
        }),
      });
      const created = await createResponse.json().catch(() => ({}));
      const jobId = created?.data?.id;
      if (!createResponse.ok || !jobId) {
        throw new Error(created?.message || "CloudConvert could not start the job.");
      }
      await updateJob({ cloudconvert_job_id: jobId });

      let finished: any = null;
      const deadline = Date.now() + 90000;
      while (Date.now() < deadline) {
        const pollResponse = await fetch(
          `https://sync.api.cloudconvert.com/v2/jobs/${encodeURIComponent(jobId)}`,
          { headers, signal: AbortSignal.timeout(10000) },
        );
        const polled = await pollResponse.json().catch(() => ({}));
        if (!pollResponse.ok) throw new Error(polled?.message || "Could not check conversion progress.");
        const status = polled?.data?.status;
        if (status === "finished") { finished = polled.data; break; }
        if (status === "error") {
          const failedTask = (polled.data.tasks || []).find((task: any) => task.status === "error");
          throw new Error(failedTask?.message || "The conversion failed.");
        }
        await sleep(2000);
      }
      if (!finished) throw new Error("The conversion took too long. Try again.");

      const outputUrl = (finished.tasks || []).find((task: any) => task.name === "export")?.result?.files?.[0]?.url;
      if (!outputUrl || new URL(outputUrl).protocol !== "https:") {
        throw new Error("CloudConvert returned an invalid PDF URL.");
      }
      const pdfResponse = await fetch(outputUrl, { signal: AbortSignal.timeout(20000) });
      if (!pdfResponse.ok) throw new Error("Could not download the converted PDF.");
      const bytes = new Uint8Array(await pdfResponse.arrayBuffer());
      if (bytes.byteLength > MAX_FILE_BYTES) throw new Error("The converted PDF is larger than 100 MB.");

      const { error: uploadError } = await storage.upload(pdfPath, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (uploadError) throw new Error("Could not save the converted PDF.");

      await updateJob({
        status: "completed",
        locked_until: null,
        cloudconvert_job_id: jobId,
        last_error: null,
      });
      return json({ pdf_url: publicPdfUrl, size: bytes.byteLength, cached: false });
    } catch (error) {
      try {
        await updateJob({
          status: "failed",
          locked_until: null,
          last_error: String((error as Error).message || "Conversion failed.").slice(0, 500),
        });
      } catch (updateError) {
        console.error("[convert-to-pdf] failed to release job lock:", updateError);
      }
      throw error;
    }
  } catch (error) {
    console.error("[convert-to-pdf] conversion failed:", error);
    const message = (error as Error).message || "Something went wrong.";
    return json({ error: message }, /too long|timed out/i.test(message) ? 504 : 502);
  }
});
