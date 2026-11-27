import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const examTypes: Record<string, string> = {
  JAMB: "utme",
  WAEC: "wassce",
  NECO: "neco",
  POST_UTME: "post-utme"
};
const subjectAliases: Record<string, string> = {
  "Use of English": "english",
  "English Language": "english",
  "Mathematics": "mathematics",
  "General Mathematics": "mathematics",
  "Further Mathematics": "mathematics",
  "Principles of Accounts": "accounting",
  "Agricultural Science": "agriculture",
  "Christian Religious Studies": "crk",
  "Islamic Studies": "irk",
  "Literature in English": "englishlit",
  "Computer Studies": "computer",
  "Physical and Health Education": "physicaleducation",
  "Physical Education": "physicaleducation",
  "Health Education": "healtheducation",
  "Financial Accounting": "accounting"
};
const slugFor = (name: string) =>
  subjectAliases[name] || name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "").replace(/^$/, "");

type ProviderQuestion = {
  id: number | string;
  question: string;
  section?: string | null;
  option?: Record<string, string>;
  answer?: string;
  solution?: string | null;
  image?: string | null;
  examyear?: string | number;
};

async function startFromLocal(
  admin: ReturnType<typeof createClient>,
  userId: string,
  examCode: string,
  examYear: number,
  subjectIds: string[],
  questionCount: number,
  durationSeconds: number,
  mode: string
) {
  const { data: available, error: questionError } = await admin
    .from("external_exam_questions")
    .select("id")
    .eq("exam_code", examCode)
    .eq("exam_year", examYear)
    .eq("status", "published")
    .in("subject_id", subjectIds)
    .limit(Math.min(600, questionCount * 4));
  if (questionError) return json({ error: "Could not check the verified local archive." }, 500);
  const chosen = (available || []).sort(() => Math.random() - 0.5).slice(0, questionCount);
  if (!chosen.length) return json({
    error: !Deno.env.get("SDASHAPI_ACCESS_TOKEN")
      ? "No local questions are published for this selection yet, and the licensed provider token is not configured. Add SDASHAPI_ACCESS_TOKEN or import verified licensed questions."
      : "No questions are available from the connected provider or the verified local archive for this selection. Some subjects have sparse coverage in older years."
  }, 404);

  const { data: attempt, error: attemptError } = await admin.from("external_exam_attempts").insert({
    user_id: userId, exam_code: examCode, exam_year: examYear, question_provider: "local",
    mode, duration_seconds: durationSeconds, total_questions: chosen.length
  }).select("id").single();
  if (attemptError || !attempt) return json({ error: "Could not create your examination session." }, 500);

  const { error: linkError } = await admin.from("external_exam_attempt_questions").insert(
    chosen.map((q, index) => ({ attempt_id: attempt.id, question_id: q.id, position: index + 1 }))
  );
  if (linkError) {
    await admin.from("external_exam_attempts").delete().eq("id", attempt.id).eq("user_id", userId);
    return json({ error: "The verified question set could not be prepared." }, 500);
  }
  return json({ attempt_id: attempt.id, question_count: chosen.length, exam_year: examYear, source: "local" });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
  if (!accessToken) return json({ error: "Please sign in to use the question bank." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "The question-bank service is not configured." }, 503);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
  const user = userData?.user;
  if (userError || !user) return json({ error: "Your session has expired. Please sign in again." }, 401);

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "start") {
      const examCode = String(body?.exam_code || "");
      const examYear = Number(body?.exam_year);
      const subjectIds = Array.isArray(body?.subject_ids) ? [...new Set(body.subject_ids.map(String))] : [];
      const questionCount = Math.max(1, Math.min(200, Number(body?.question_count) || 40));
      const durationSeconds = Math.max(60, Math.min(14400, Number(body?.duration_seconds) || 7200));
      const mode = ["practice", "timed", "challenge"].includes(body?.mode) ? body.mode : "practice";

      if (!examTypes[examCode]) return json({ error: "This question provider currently supports JAMB, WAEC, NECO and Post-UTME. GCE is not available in this feed yet." }, 422);
      if (!Number.isInteger(examYear) || examYear < 1990 || examYear > 2026) return json({ error: "Choose an examination year from 1990 to 2026." }, 400);
      if (!subjectIds.length || subjectIds.length > 8) return json({ error: "Select between one and eight subjects." }, 400);

      const { data: subjects, error: subjectError } = await admin
        .from("external_exam_subjects")
        .select("id,name,exam_code")
        .in("id", subjectIds)
        .eq("exam_code", examCode)
        .eq("is_active", true);
      if (subjectError) return json({ error: "Could not validate the selected subjects." }, 500);
      if (!subjects?.length || subjects.length !== subjectIds.length) return json({ error: "One or more selected subjects are not valid for this examination." }, 400);

      const providerToken = Deno.env.get("SDASHAPI_ACCESS_TOKEN");
      if (!providerToken) {
        return await startFromLocal(admin,user.id,examCode,examYear,subjectIds,questionCount,durationSeconds,mode);
      }

      const perSubject = Math.ceil(questionCount / subjects.length);
      const fetched: Array<{ q: ProviderQuestion; subject: string; subjectId: string }> = [];
      const seen = new Set<string>();
      const providerType = examTypes[examCode];

      for (const subject of subjects) {
        let subjectCount = 0;
        let calls = 0;
        const maxCalls = Math.ceil(perSubject / 50) + 2;
        while (subjectCount < perSubject && calls < maxCalls) {
          const limit = Math.min(50, perSubject - subjectCount);
          const params = new URLSearchParams({
            type: providerType,
            subject: slugFor(subject.name),
            year: String(examYear),
            limit: String(limit)
          });
          const response = await fetch("https://sdashapi.com/api/v1/q?" + params.toString(), {
            headers: { "AccessToken": providerToken, "Accept": "application/json" }
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || (payload?.status && Number(payload.status) !== 200)) {
            if (response.status === 404) break;
            const message = String(payload?.message || payload?.error || "The past-question provider is temporarily unavailable.").slice(0, 220);
            return json({ error: message }, response.status === 429 ? 429 : 502);
          }
          const rows = Array.isArray(payload?.data) ? payload.data : payload?.data ? [payload.data] : [];
          if (!rows.length) break;
          let added = 0;
          for (const q of rows as ProviderQuestion[]) {
            const providerId = String(q?.id ?? "");
            const optionKeys = ["a", "b", "c", "d", "e"].filter(k => q?.option?.[k] !== undefined && q.option[k] !== null && String(q.option[k]).trim() !== "");
            const answerKey = String(q?.answer ?? "").toLowerCase().trim();
            const answerIndex = optionKeys.indexOf(answerKey);
            if (!providerId || !q?.question || optionKeys.length < 2 || answerIndex < 0 || seen.has(providerId)) continue;
            seen.add(providerId);
            fetched.push({ q, subject: subject.name, subjectId: subject.id });
            subjectCount++;
            added++;
            if (subjectCount >= perSubject) break;
          }
          calls++;
          if (rows.length < limit || added === 0) break;
        }
      }

      const selected = fetched.slice(0, questionCount);
      if (!selected.length) return await startFromLocal(admin,user.id,examCode,examYear,subjectIds,questionCount,durationSeconds,mode);

      const { data: attempt, error: attemptError } = await admin.from("external_exam_attempts").insert({
        user_id: user.id,
        exam_code: examCode,
        exam_year: examYear,
        question_provider: "sdashapi",
        mode,
        duration_seconds: durationSeconds,
        total_questions: 0
      }).select("id").single();
      if (attemptError || !attempt) return json({ error: "Could not create your examination session." }, 500);

      const publicRows = selected.map((item, index) => {
        const optionKeys = ["a", "b", "c", "d", "e"].filter(k => item.q.option?.[k] !== undefined && item.q.option[k] !== null && String(item.q.option[k]).trim() !== "");
        const answerLetter = String(item.q.answer || "").toLowerCase().trim();
        return {
          attempt_id: attempt.id,
          provider_question_id: String(item.q.id),
          position: index + 1,
          subject_name: item.subject,
          exam_year: examYear,
          question_text: String(item.q.question),
          section: item.q.section ? String(item.q.section) : null,
          options: optionKeys.map(k => String(item.q.option?.[k])),
          image_url: item.q.image ? String(item.q.image) : null,
          _answer: optionKeys.indexOf(answerLetter),
          _solution: item.q.solution ? String(item.q.solution) : null
        };
      });

      const { data: inserted, error: insertError } = await admin.from("external_exam_api_attempt_questions")
        .insert(publicRows.map(({ _answer, _solution, ...row }) => row))
        .select("id,provider_question_id");
      if (insertError || !inserted?.length) {
        await admin.from("external_exam_attempts").delete().eq("id", attempt.id).eq("user_id", user.id);
        return json({ error: "The question set could not be prepared. Please retry." }, 500);
      }

      const answerRows = inserted.map(row => {
        const source = publicRows.find(item => item.provider_question_id === row.provider_question_id)!;
        return { question_id: row.id, correct_option_index: source._answer, solution: source._solution };
      });
      const { error: answerError } = await admin.from("external_exam_api_question_answers").insert(answerRows);
      if (answerError) {
        await admin.from("external_exam_attempts").delete().eq("id", attempt.id).eq("user_id", user.id);
        return json({ error: "The answer key could not be prepared. Please retry." }, 500);
      }
      await admin.from("external_exam_attempts").update({ total_questions: inserted.length }).eq("id", attempt.id).eq("user_id", user.id);
      return json({ attempt_id: attempt.id, question_count: inserted.length, exam_year: examYear });
    }

    const attemptId = String(body?.attempt_id || "");
    if (!attemptId) return json({ error: "An examination session is required." }, 400);
    const { data: attempt, error: attemptError } = await admin.from("external_exam_attempts")
      .select("id,user_id,exam_code,exam_year,status,question_provider,total_questions,started_at,duration_seconds")
      .eq("id", attemptId).eq("user_id", user.id).maybeSingle();
    if (attemptError || !attempt) return json({ error: "Examination session not found." }, 404);

    if (action === "load") {
      if (attempt.status !== "in_progress") return json({ error: "This examination has already been submitted." }, 409);
      if (attempt.question_provider !== "sdashapi") return json({ error: "This is not a licensed question-bank attempt." }, 400);
      const [{ data: questions, error: questionsError }, { data: answers, error: answersError }] = await Promise.all([
        admin.from("external_exam_api_attempt_questions")
          .select("id,position,subject_name,exam_year,question_text,section,options,image_url")
          .eq("attempt_id", attemptId).order("position"),
        admin.from("external_exam_api_user_answers")
          .select("question_id,selected_option_index")
          .eq("attempt_id", attemptId)
      ]);
      if (questionsError || answersError || !questions?.length) return json({ error: "Could not load the question set." }, 500);
      return json({ attempt, questions, answers: answers || [] });
    }

    if (action === "answer") {
      if (attempt.status !== "in_progress") return json({ error: "This examination is no longer active." }, 409);
      const questionId = String(body?.question_id || "");
      const selectedIndex = Number(body?.selected_option_index);
      if (!questionId || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 4) return json({ error: "Invalid answer selection." }, 400);
      const { data: questionRow } = await admin.from("external_exam_api_attempt_questions")
        .select("id,options").eq("id", questionId).eq("attempt_id", attemptId).maybeSingle();
      if (!questionRow || selectedIndex >= (questionRow.options as unknown[]).length) return json({ error: "This answer does not belong to the active examination." }, 400);
      const { error } = await admin.from("external_exam_api_user_answers").upsert({
        attempt_id: attemptId, question_id: questionId, selected_option_index: selectedIndex, answered_at: new Date().toISOString()
      }, { onConflict: "attempt_id,question_id" });
      if (error) return json({ error: "Your answer could not be saved. Please try again." }, 500);
      return json({ saved: true });
    }

    if (action === "submit") {
      if (attempt.status !== "in_progress") return json({ error: "This examination has already been submitted." }, 409);
      const [{ data: keys, error: keyError }, { data: userAnswers, error: userAnswerError }] = await Promise.all([
        admin.from("external_exam_api_question_answers").select("question_id,correct_option_index")
          .in("question_id", (await admin.from("external_exam_api_attempt_questions").select("id").eq("attempt_id", attemptId)).data?.map(x => x.id) || []),
        admin.from("external_exam_api_user_answers").select("question_id,selected_option_index").eq("attempt_id", attemptId)
      ]);
      if (keyError || userAnswerError) return json({ error: "Your answers could not be graded. Please try again." }, 500);
      const answerMap = new Map((userAnswers || []).map(a => [a.question_id, a.selected_option_index]));
      const correct = (keys || []).filter(k => answerMap.get(k.question_id) === k.correct_option_index).length;
      const total = Number(attempt.total_questions || keys?.length || 0);
      const { error: updateError } = await admin.from("external_exam_attempts")
        .update({ status: "submitted", score: correct, submitted_at: new Date().toISOString() })
        .eq("id", attemptId).eq("user_id", user.id).eq("status", "in_progress");
      if (updateError) return json({ error: "Your result could not be saved. Please retry." }, 500);
      return json({ attempt_id: attemptId, total_questions: total, correct_answers: correct, score_percent: total ? Math.round(correct / total * 10000) / 100 : 0 });
    }

    return json({ error: "Unknown question-bank action." }, 400);
  } catch (_error) {
    return json({ error: "The question-bank service is temporarily unavailable. Please try again." }, 500);
  }
});