// TexPrep Question Generator
// Generates original TEKS-aligned questions via Gemini (free tier) with Groq fallback,
// and inserts them into the Supabase question_bank table.
// Run: node scripts/generate-questions.mjs
// Env needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, (optional) GROQ_API_KEY

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_URL || !SB_KEY) { console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
if (!GEMINI_KEY && !GROQ_KEY) { console.error("Need GEMINI_API_KEY or GROQ_API_KEY"); process.exit(1); }

const GRADES = ["K","1","2","3","4","5","6","7","8","9","10","11","12"];
const SUBJECTS = ["math","ela","science","social"];
const MODES = ["practice","staar","map","gt"];

// States to generate content for. Start with TX; add states by setting the
// GEN_STATES env/secret to e.g. "TX,FL,CA". Non-TX states use their own
// adopted standards (Common Core-aligned where applicable) in the prompt.
// STATE GENERATION SWITCH: which states the nightly generator builds content for.
// Currently Texas-only so TX fills to full depth fast. To build all states later,
// set GEN_STATES secret to the full list (or change this default) — see README.
const STATES = (process.env.GEN_STATES || "TX")
  .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
const STATE_STANDARDS = {
  TX: "Texas TEKS (Texas Essential Knowledge and Skills) standards",
};
function standardsFor(state) {
  return STATE_STANDARDS[state] || `the academic standards officially adopted by the U.S. state with postal code ${state} (Common Core State Standards for math/ELA and NGSS for science where that state has adopted them)`;
}

const TARGET_PER_COMBO = 80;   // questions we want per grade+subject+mode (covers official test lengths up to 64)
const MAX_CALLS_PER_RUN = 200; // Texas-only focus; Gemini free tier allows 1,000/day
const QUESTIONS_PER_CALL = 10;

const SUBJECT_NAMES = { math: "Mathematics", ela: "Reading & English Language Arts", science: "Science", social: "Social Studies" };
const MODE_STYLE = {
  practice: "standard daily practice questions",
  staar: "STAAR-style assessment questions (multi-step, scenario-based, like Texas state test format — but completely ORIGINAL, never copied from real tests)",
  map: "NWEA MAP-style adaptive questions spanning slightly below to slightly above grade level",
  gt: "advanced Gifted & Talented enrichment questions requiring creative, multi-step reasoning",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sbCount(grade, subject, mode, state) {
  const res = await fetch(
    `${SB_URL}/rest/v1/question_bank?grade=eq.${grade}&subject=eq.${subject}&mode=eq.${mode}&state=eq.${state}&select=id`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Prefer: "count=exact", Range: "0-0" } }
  );
  const range = res.headers.get("content-range") || "0/0";
  return parseInt(range.split("/")[1] || "0", 10);
}

async function sbInsert(rows) {
  const res = await fetch(`${SB_URL}/rest/v1/question_bank`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
}

function buildPrompt(grade, subject, mode, state) {
  const gradeLabel = grade === "K" ? "Kindergarten" : `Grade ${grade}`;
  return `You are an expert U.S. K-12 curriculum writer. Generate ${QUESTIONS_PER_CALL} ORIGINAL multiple-choice questions for ${gradeLabel} ${SUBJECT_NAMES[subject]}, aligned to ${standardsFor(state)}. Style: ${MODE_STYLE[mode]}.

STRICT RULES:
- 100% original content. NEVER reproduce questions from STAAR, MAP, textbooks, or any existing source.
- Age-appropriate language and difficulty for ${gradeLabel}.
- Exactly 4 answer options per question, one correct.
- Include the most relevant standard code from the named framework (e.g., "3.4A" for TEKS, "3.OA.A.1" for Common Core).
- Include a clear 1-2 sentence explanation of the correct answer.
- Vary the topics across the subject's TEKS strands.
- Respond with ONLY a JSON array, no markdown, no backticks, no preamble. Schema:
[{"q":"question text","opts":["A","B","C","D"],"ans":0,"teks":"X.XX","exp":"explanation"}]
"ans" is the 0-based index of the correct option.`;
}

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.8 }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseQuestions(text, grade, subject, mode, state) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("["), end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  let arr;
  try { arr = JSON.parse(clean.slice(start, end + 1)); } catch { return []; }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x) => x && typeof x.q === "string" && Array.isArray(x.opts) && x.opts.length === 4 &&
      Number.isInteger(x.ans) && x.ans >= 0 && x.ans <= 3 && typeof x.exp === "string")
    .map((x) => ({ grade, subject, mode, state, q: x.q.trim(), opts: x.opts.map(String), ans: x.ans, teks: String(x.teks || "").slice(0, 12), exp: x.exp.trim() }));
}

async function main() {
  // Build the work list: combos below target, lowest coverage first
  const work = [];
  for (const st of STATES) for (const g of GRADES) for (const s of SUBJECTS) for (const m of MODES) work.push({ st, g, s, m });

  console.log("Checking current coverage...");
  const counts = [];
  for (const w of work) {
    const c = await sbCount(w.g, w.s, w.m, w.st);
    if (c < TARGET_PER_COMBO) counts.push({ ...w, c });
  }
  counts.sort((a, b) => a.c - b.c);
  console.log(`${counts.length} combos still below target of ${TARGET_PER_COMBO}.`);

  let calls = 0, inserted = 0;
  for (const w of counts) {
    if (calls >= MAX_CALLS_PER_RUN) break;
    const prompt = buildPrompt(w.g, w.s, w.m, w.st);
    let text = "";
    try {
      if (GEMINI_KEY) { text = await callGemini(prompt); }
      else { text = await callGroq(prompt); }
    } catch (e) {
      console.warn(`Gemini failed for ${w.st}/${w.g}/${w.s}/${w.m}: ${e.message}`);
      if (GROQ_KEY) { try { text = await callGroq(prompt); } catch (e2) { console.warn(`Groq also failed: ${e2.message}`); } }
    }
    calls++;
    const rows = parseQuestions(text, w.g, w.s, w.m, w.st);
    if (rows.length) {
      try { await sbInsert(rows); inserted += rows.length; console.log(`+${rows.length}  ${w.st}/${w.g}/${w.s}/${w.m} (had ${w.c})`); }
      catch (e) { console.warn(`Insert failed: ${e.message}`); }
    } else {
      console.warn(`No valid questions parsed for ${w.st}/${w.g}/${w.s}/${w.m}`);
    }
    await sleep(4500); // respect 15 requests/minute free-tier limit
  }
  console.log(`Done. ${calls} AI calls, ${inserted} questions inserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
