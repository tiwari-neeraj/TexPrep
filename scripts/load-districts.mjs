// TexPrep Nationwide District Loader
// Loads every US public school district (~13,000) from the Urban Institute
// Education Data API (free, public, sourced from NCES CCD) into Supabase.
// Run via GitHub Actions: "Load Districts" workflow (one-time, re-runnable).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB_URL || !SB_KEY) { console.error("Missing Supabase env vars"); process.exit(1); }

// FIPS codes for all states + DC
const FIPS = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY",
  "22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT",
  "31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH",
  "40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY",
};

const YEAR = 2022; // latest stable CCD directory year on the API
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function insertBatch(rows) {
  if (!rows.length) return;
  const res = await fetch(`${SB_URL}/rest/v1/districts`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Insert failed: ${res.status} ${await res.text()}`);
}

async function loadState(fips, code) {
  let url = `https://educationdata.urban.org/api/v1/school-districts/ccd/directory/${YEAR}/?fips=${parseInt(fips, 10)}`;
  let total = 0;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  ${code}: API ${res.status}, skipping page`); break; }
    const data = await res.json();
    const rows = (data.results || [])
      .filter((d) => d.lea_name)
      .map((d) => ({
        state: code,
        name: d.lea_name,
        city: d.city_location || null,
        zips: d.zip_location ? [String(d.zip_location).slice(0, 5)] : [],
        nces_id: d.leaid ? String(d.leaid) : null,
      }));
    await insertBatch(rows);
    total += rows.length;
    url = data.next;
    await sleep(400);
  }
  console.log(`${code}: ${total} districts loaded`);
  return total;
}

async function main() {
  // Load order: Texas first, then everything else
  const entries = Object.entries(FIPS).sort(([, a], [, b]) => (a === "TX" ? -1 : b === "TX" ? 1 : a.localeCompare(b)));
  let grand = 0;
  for (const [fips, code] of entries) {
    try { grand += await loadState(fips, code); }
    catch (e) { console.warn(`${code} failed: ${e.message}`); }
  }
  console.log(`DONE — ${grand} districts total.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
