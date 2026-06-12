# TexPrep — Texas K-12 Practice App

Free, TEKS-aligned practice for every Texas school district.
STAAR Prep · MAP Prep · Gifted & Talented · Daily Practice · Voice Read-Aloud

---

## Deploy in 10 Minutes (GitHub → Vercel)

### Step 1 — Put the code on GitHub

1. Go to **github.com** and sign in.
2. Click the **+** (top right) → **New repository**.
3. Repository name: `texprep` → keep it **Public** → click **Create repository**.
4. On the next page, click the link **"uploading an existing file"**.
5. Open the unzipped `texprep-app` folder on your computer. Select **everything inside it**
   (the `app`, `components`, `public` folders and the `package.json`, `next.config.mjs`,
   `.gitignore` files) and drag them into the GitHub upload box.
   - Important: upload the *contents* of the folder, not the folder itself —
     `package.json` must end up at the top level of the repo.
6. Click **Commit changes**. Wait for the upload to finish.

### Step 2 — Deploy on Vercel

1. Go to **vercel.com** and sign in (use "Continue with GitHub" — it links your account).
2. Click **Add New… → Project**.
3. Find your `texprep` repository in the list → click **Import**.
4. Vercel auto-detects Next.js. Don't change any settings.
5. Click **Deploy**. Wait ~2 minutes.
6. Done! You'll get a live URL like **https://texprep.vercel.app**
   (Vercel may add random words — you can edit the name under
   Project → Settings → Domains).

### Step 3 — Test on your phone

1. Open your new URL on your phone.
2. In Chrome (Android): tap ⋮ menu → **Add to Home screen** → it installs like an app.
3. On iPhone (Safari): tap Share → **Add to Home Screen**.

That's your app, live, shareable, installable. Send the link to anyone.

---

## What's Inside

| Path | What it is |
|---|---|
| `app/layout.js` | App shell, PWA metadata, service worker registration |
| `app/page.js` | Home page (loads the practice app) |
| `app/privacy/page.js` | Privacy policy (required for Play Store) — at `/privacy` |
| `components/TexPrepApp.jsx` | The entire practice app (all 4 screens) |
| `public/manifest.json` | PWA manifest (makes it installable) |
| `public/sw.js` | Service worker (offline support) |
| `public/icon-192.png`, `icon-512.png` | App icons |

## Updating the App Later

Edit files directly on GitHub (open the file → pencil icon → edit → Commit changes).
Vercel automatically redeploys within ~2 minutes of every commit. No manual steps.

## Next Phases (ask Claude)

- **Play Store**: run your live URL through **pwabuilder.com** → upload the
  generated package to Google Play Console ($25 one-time developer fee).
- **Supabase**: student accounts, progress tracking, streaks, and the
  AI-generated question bank (Gemini Flash-Lite + Groq batch pipeline).
- **More content**: expand full question banks to all grades K-12.

## License & Content

All practice questions are original, aligned to public-domain TEKS standards
(Texas Education Agency). District data derived from NCES public datasets.
No copyrighted test content is reproduced.
