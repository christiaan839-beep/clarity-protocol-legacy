# CLAUDE.md — The Clarity Protocol (Legacy)

> Guidance for AI assistants working in this repository. Everything here is
> verified against the actual files in the repo. When in doubt, read the source
> before changing it.

## What this is

**The Clarity Protocol** is a South African (Cape Town–built) biohacking / high-ticket
wellness product. The brand premise: a 90-day "operating system" for physical, biological,
and mental "sovereignty" (hybrid-calisthenics, organic nutrition / seed-oil avoidance,
Stoic mental models). See `brand_bible.md` for positioning and `technical_specifications.md`
for the aspirational product vision.

**This is the LEGACY repository.** It is a static, vanilla-JS Progressive Web App (PWA)
deployed to Firebase Hosting, plus a set of Python scripts that build branded PDF guides.
The active / current product lives elsewhere (a separate, newer Clarity Protocol build).
Treat this repo as the older shipped version: small, self-contained, no build step for the
web app, no npm dependency tree. Do not assume frameworks or tooling that aren't present here.

Note: `technical_specifications.md` describes an *ambitious* native-app vision (React Native /
Flutter, FastAPI, PostgreSQL, wearable SDK integrations, computer-vision form coaching). That
is a spec / roadmap document — **it does not reflect what is actually built in this repo.**
The actual implementation is the static PWA described below.

## Tech stack (what's actually here)

- **Web app:** Plain HTML + CSS + vanilla JavaScript **ES modules** (no bundler, no
  framework, no `package.json`). Loaded directly by the browser.
- **Backend / data:** **Firebase** — Auth (Google sign-in) + Firestore. Firebase SDK is
  imported over the network from `https://www.gstatic.com/firebasejs/10.12.2/...`
  (see `app/services/firebase-config.js`). No local node_modules.
- **Hosting:** Firebase Hosting (static), project `clarity-protocol-app` (`.firebaserc`).
- **PWA:** `app/manifest.json` + `app/service-worker.js` (`CACHE_NAME = 'clarity-protocol-v1.0.0'`).
- **Payments:** **Lemon Squeezy** hosted checkout (live URLs in `app/services/payments.js`).
  An older `app/scripts/stripe_fulfillment.js` exists but is mostly mocked/commented — Lemon
  Squeezy is the live path.
- **Monitoring / analytics:** Sentry (CDN snippet) + Google Analytics 4 (`G-1CXESV59P0`),
  both wired inline in `app/index.html`.
- **Fonts:** Google Fonts — Cinzel, Inter, JetBrains Mono.
- **PDF tooling:** Python 3 scripts using the `markdown` package + headless Chrome (macOS-only
  paths, see below).

## Directory layout

```
/
├── app/                       # The deployed static PWA (Firebase "public" dir)
│   ├── index.html             # Single-page entry; inline Sentry/GA4; loads app.js?v=2 as a module
│   ├── pricing.html           # Pricing page
│   ├── app.js                 # Main controller (~1800 LOC); imports all services/*
│   ├── style.css              # Main stylesheet (~2500 LOC)
│   ├── *-styles.css           # achievement / interactivity / module / pwa-social / premium CSS
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # SW cache (bump CACHE_NAME on asset changes)
│   ├── data/                  # male_linear.json, female_phasic.json (training program data)
│   ├── guides/                # Static HTML guides + print.css
│   ├── services/              # ES-module feature services (see below)
│   │   └── workflow/          # Node-based workflow engine (NodeEditor, WorkflowEngine, nodes, types)
│   └── scripts/               # Standalone helper agents (NOT bundled into the web app)
│       ├── sourcing_agent.py        # Python — "Sovereign Logistics" sourcing
│       ├── geroscience_scraper.py   # Python — needs `requests`
│       ├── compliance_monitor.js    # Node-style mock agent
│       ├── n8n_fatigue_handler.js   # n8n Function-node snippet
│       └── stripe_fulfillment.js    # Mostly-mocked Stripe webhook handler (legacy)
├── content/                   # Source markdown for some guides (7_day_reset.md, etc.)
├── PDFs/                      # Generated PDF output, grouped (01_Mindset .. 06_Complete_Guides)
├── build_pdfs.py              # PDF builder (verbose)
├── build_premium.py           # PDF builder v2 (compact; same PDFS map)
├── brand_bible.md             # Brand positioning / philosophy
├── technical_specifications.md# Aspirational product spec (NOT the built reality)
├── sovereign_map.json         # Sample "Global Organic Map" location data
├── firebase.json              # Hosting + Firestore config, security headers, CSP
├── firestore.rules            # Users can only read/write their own /users/{uid}/** docs
├── firestore.indexes.json     # Empty (no composite indexes)
├── .firebaserc                # default project = clarity-protocol-app
└── .github/workflows/firebase-deploy.yml  # CI deploy on push to main
```

### `app/services/` (vanilla ES modules, imported by `app.js`)

`firebase-config.js` (Auth + Firestore init), `auth.js`, `SovereignData.js` (cloud sync),
`payments.js` (Lemon Squeezy), `pdfManager.js`, `modules.js`, `analytics.js`, `social.js`,
`pwa.js`, `performance.js`, `interactivity.js`, `dataVisualizer.js`, `achievements.js`,
`biometrics.js`, plus feature tracks: `BioWeather.js`, `MaleTrack.js`, `FemaleTrack.js`,
`KnowledgeArsenal.js`, `NeuralFatigue.js`, `SovereignBuild.js`, `TacticalSweepData.js`,
and `workflow/`.

## Key commands

There is **no `package.json`, no build step, and no test suite** for the web app. It is
served as-is from `app/`.

### Run the web app locally
Serve the `app/` directory over HTTP (ES modules + Firebase need a server, not `file://`):
```bash
cd app && python3 -m http.server 8000
# then open http://localhost:8000
```
The app detects `localhost` for the Sentry `development` environment.

### Build the PDFs (Python)
```bash
pip install markdown          # only dependency import in the builders; geroscience_scraper.py also needs `requests`
python3 build_pdfs.py         # or: python3 build_premium.py   (v2, same content map)
```
Both scripts convert markdown guides → styled HTML → PDF via **headless Google Chrome**.
**Gotcha:** the paths are hard-coded to one macOS machine and will not run as-is elsewhere:
- `SRC`  = `/Users/christiaanwillemdewet/.gemini/antigravity/brain/<uuid>` (markdown source — **not in this repo**)
- `OUT`  = an iCloud `…/clarity_protocol/PDFs` path
- `CHROME` = `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
To run elsewhere, edit `SRC`, `OUT`, and `CHROME` at the top of the script. The committed
`PDFs/` tree is the previously generated output. The `PDFS` dict in both builders is the
canonical map of which markdown files compose each PDF.

### Deploy (Firebase Hosting)
- **Automatic:** push to `main` → `.github/workflows/firebase-deploy.yml` runs
  `firebase deploy --only hosting --project clarity-protocol-app` (uses Node 22 + the
  `FIREBASE_TOKEN` GitHub secret).
- **Manual:** `firebase deploy --only hosting` (Firestore rules/indexes:
  `firebase deploy --only firestore`).

## Firebase / hosting config notes

- **`firebase.json`** sets `hosting.public = "app"`, SPA-style rewrite (`** → /index.html`),
  long-immutable cache for `*.js`/`*.css`, `no-cache` for `*.html`, and a full security-header
  set including a strict **Content-Security-Policy**. **If you add any external script, frame,
  font, or `connect` endpoint, update the CSP in `firebase.json`** or the browser will block it.
  Currently allow-listed origins include gstatic (Firebase), Sentry, Google Tag Manager,
  Google Fonts, `*.googleapis.com`/firestore, Google accounts, and
  `clarity-protocol.lemonsqueezy.com`.
- **`firestore.rules`** are minimal and strict: a user may read/write only
  `/users/{userId}/**` where `request.auth.uid == userId`. No public collections.
- **`firestore.indexes.json`** is empty — add composite indexes here if a query needs one.
- Firebase **client** API keys in `firebase-config.js` are intentionally public; server-side
  protection is the Firestore rules. Do not treat that key as a leaked secret.

## Conventions & gotchas

- **ES modules everywhere.** `app/index.html` loads `app.js` as `<script type="module"
  src="app.js?v=2">`. The `?v=N` query string is a manual **cache-buster** — bump it when you
  change `app.js` and need browsers to reload the new version (a real commit did exactly this).
- **Service worker cache:** after changing any cached asset, bump `CACHE_NAME` in
  `app/service-worker.js` (currently `clarity-protocol-v1.0.0`) so clients pick up the update.
- **Firebase SDK is pinned to `10.12.2` via gstatic URLs.** A prior bug came from a deprecated
  v9 persistence API — this repo uses the v10 `initializeFirestore` + `persistentLocalCache`
  pattern. Don't reintroduce `enableIndexedDbPersistence`.
- **Don't over-trust `technical_specifications.md`.** It's a vision doc; the shipped artifact
  is the static PWA. Verify against `app/` before claiming a feature exists.
- **`app/scripts/*` are standalone helpers/agents**, not part of the web bundle and not all
  wired up (several are mocks / n8n snippets). Treat them as auxiliary.
- **Payments:** Lemon Squeezy hosted checkout is live (`app/services/payments.js`). The Stripe
  file is legacy/mocked — prefer Lemon Squeezy.
- **No secrets in the repo.** `.env*`, `node_modules/`, build outputs, and Python caches are
  git-ignored (`.gitignore`). The only deploy secret is the GitHub `FIREBASE_TOKEN`.
- **Currency / market:** product is South-Africa-first ("Built in Cape Town. Engineered for
  the world."), with global pricing handled by Lemon Squeezy.
- **No linter/test config** exists. Keep changes minimal and self-contained; match the existing
  vanilla-JS, module-per-feature style rather than introducing frameworks or a build pipeline.
