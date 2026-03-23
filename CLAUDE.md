# CLAUDE.md — Clarity Protocol

## Project Overview

The Clarity Protocol is a 90-day biological operating system PWA for elite performance and personal sovereignty. It's a premium SaaS health/fitness platform with gender-specific protocols, biometric tracking, achievement systems, and tiered coaching access.

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML5, CSS3 (no framework)
- **Backend/Hosting:** Firebase (Firestore, Auth, Hosting)
- **Payments:** Lemon Squeezy (replaced Stripe)
- **Monitoring:** Sentry (errors), Google Analytics 4
- **Auth:** Firebase Auth (Google OAuth + email/password)
- **Build scripts:** Python 3 (PDF generation, premium content)
- **CI/CD:** GitHub Actions → Firebase Hosting auto-deploy on push to `main`

## Repository Structure

```
app/                        # Main PWA application
├── index.html              # Entry point
├── app.js                  # Core app logic
├── style.css               # Main stylesheet (CSS custom properties)
├── service-worker.js       # Offline PWA support
├── manifest.json           # PWA manifest
├── services/               # Business logic modules (25 JS files)
│   ├── firebase-config.js  # Firebase SDK init
│   ├── auth.js             # Authentication
│   ├── payments.js         # Lemon Squeezy checkout
│   ├── modules.js          # Course module management
│   ├── achievements.js     # Badge/achievement system
│   ├── dataVisualizer.js   # Charting
│   ├── MaleTrack.js        # Male hormonal optimization
│   ├── FemaleTrack.js      # Female infradian cycle syncing
│   ├── BioWeather.js       # Environmental impacts
│   ├── SovereignData.js    # Central data store
│   ├── biometrics.js       # Wearable data integration
│   ├── social.js           # Leaderboards, challenges
│   ├── pwa.js              # PWA install & notifications
│   └── workflow/           # Visual workflow editor
├── data/                   # Protocol data (JSON)
│   ├── male_linear.json
│   └── female_phasic.json
├── guides/                 # HTML guides (10 files)
└── scripts/                # Backend automation scripts
.github/workflows/          # CI/CD (firebase-deploy.yml)
PDFs/                       # Generated PDF outputs
content/                    # Markdown content
```

## Development Workflow

### Branching & Deployment

- **`main` branch** is production. Pushing to `main` triggers Firebase auto-deploy via GitHub Actions.
- Develop on feature branches, merge to `main` to deploy.
- Commit messages follow conventional format: `feat:`, `fix:`, `security:`, `ci:`, `chore:`

### Deployment Pipeline

GitHub Actions (`.github/workflows/firebase-deploy.yml`):
1. Checkout → Node.js 22 → Install Firebase CLI → Deploy to Firebase Hosting
2. Auth uses `FIREBASE_TOKEN` secret.

### No Build Step for Frontend

The frontend uses vanilla JS with ES6 module imports (no bundler). Changes to `app/` are deployed as-is. Cache busting is done via query string versioning on script tags (e.g., `?v=2`).

### Python Build Scripts

- `build_pdfs.py` — Generates PDFs from HTML via headless Chrome
- `build_premium.py` — Bundles premium content

## Code Conventions

### JavaScript

- **Module pattern:** Services export namespace objects (`export const ServiceName = { ... }`) or ES6 classes
- **Naming:** camelCase for variables/functions, UPPER_CASE for constants
- **DOM manipulation:** Direct DOM updates (no virtual DOM or framework)
- **Async:** Try-catch in async functions, toast notifications for user-facing errors
- **Imports:** ES6 module imports from `./services/`

### CSS

- **Design tokens** via CSS custom properties: `--void` (black), `--gold`, `--signal`, `--slate`
- **Fonts:** Cinzel (display), Inter (body), JetBrains Mono (code) — loaded from Google Fonts
- **No CSS framework** — all custom, responsive layout
- **Section headers** in code: `/* ═══════════════════════ SECTION ═══════════════════════ */`

### Code Comment Style

```javascript
// ═══ SECTION NAME ═══
/* ═══════════════════════════════════════════════════════════════ */
```

## Key Architecture Patterns

### Firebase/Firestore

- Firebase SDK v10.12.2 with persistent local cache (multi-tab safe)
- UID-based data isolation: users can only read/write their own data
- **Do not** use deprecated `enableIndexedDbPersistence` — use `persistentLocalCache` with `persistentMultipleTabManager`

### Security

- Strict CSP headers configured in `firebase.json`
- HSTS, X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff
- Firestore rules enforce UID-based access (`request.auth.uid == userId`)
- Never commit `.env` files or API keys

### PWA

- Service worker caches static assets for offline use
- `manifest.json` defines app shortcuts, icons, theme colors
- Standalone display mode (gold #D4AF37 on black)

## Business Domain

### Three Tiers

1. **Tier 1 (Digital Sovereign):** Self-led app access
2. **Tier 2 (Accelerated Rebuild):** Hybrid coaching + video audits
3. **Tier 3 (Total Rebuild):** 1-on-1 biological engineering

### Gender-Specific Protocols

- **Male:** Linear progression (daily timeline, antigravity training) — `male_linear.json`
- **Female:** Infradian cycle syncing (menstrual, follicular, ovulatory, luteal) — `female_phasic.json`

## Common Tasks

### Adding a new service module

1. Create `app/services/YourService.js` exporting a namespace object or class
2. Import it in `app/app.js`
3. Initialize in the appropriate lifecycle hook

### Modifying Firebase security rules

Edit `firestore.rules`, then deploy with Firebase CLI or push to `main`.

### Updating cache busters

When changing JS/CSS files, increment the `?v=N` query string on the `<script>` or `<link>` tag in `index.html` to bust the 1-year cache.

## What's Missing (known gaps)

- No linter/formatter config (no ESLint, Prettier)
- No automated tests or test framework
- No pre-commit hooks
- No local dev server config (use Firebase emulators or a static server)
