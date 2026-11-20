# Prompts History

Collated prompts from this session for `genmiheng-droid/acai-per-2` (BellyBellyGood — Singapore Açaí Delivery).

---

## 1. Initial Repository Import & Migration (2026-11-20)
> This app was imported from GitHub repository `genmiheng-droid/acai-per`.
> Migrate and verify the imported project to run cleanly in the AI Studio Web (Node.js) environment.

**Outcome:** Removed `bun.lock`, added `.env.example` with `GEMINI_API_KEY=`, updated `vite.config.ts` (`host: '0.0.0.0'`, `port: 3000`, `allowedHosts: true as const`), installed npm dependencies, and verified `vite build` and `tsc --noEmit`.

---

## 2. Push to New GitHub Repository (2026-11-20)
> `git push https://<REDACTED_GITHUB_TOKEN>@github.com/genmiheng-droid/acai-per-2.git`

*(Note: Personal access token redacted for security.)*

**Outcome:** Initialized Git repository on `main`, committed 21 migrated project files (`780f8db`), and pushed to `https://github.com/genmiheng-droid/acai-per-2.git`.

---

## 3. Update Offer Copy & Banner Color (2026-11-20)
> Change heading from New Members get to "Founding Members get". Change valid till 31st Dec to While Stocks Last. Change banner colour to colour of acai

**Outcome:** Updated `src/App.tsx`, `src/components/CartDrawer.tsx`, and `src/components/MemberAuthModal.tsx` to use `"Founding Members get"`, `"While Stocks Last"`, and the açaí purple palette (`#5D2E6D` / `#441E52` / `#C084FC`).

---

## 4. Push Banner & Copy Changes (2026-11-20)
> `git push`

**Outcome:** Committed (`501d10b`) and pushed updated UI files to `main`.

---

## 5. Follow-up Push Check (2026-11-20)
> `git push`

**Outcome:** Verified `main` was already up-to-date on GitHub (`501d10b`).

---

## 6. Fix Vercel `npm install` Dependency Conflict (2026-11-20)
> looking to deploy this on vercel, but it fails with the following error call:
> `npm error code ERESOLVE` — `Found: esbuild@0.25.12 ... Could not resolve dependency: peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.3.8`
> fix it.

**Outcome:** Updated `esbuild` in `package.json` `devDependencies` from `^0.25.0` to `^0.27.0`, verified clean `npm install --dry-run` resolution, verified build and TypeScript lint, and pushed (`375d35e`) to `main`.

---

## 7. Collate All Prompts to `prompts.md` (2026-11-20)
> collate all prompts and store in prompts.md in github

**Outcome:** Created `prompts.md` in the repository root and pushed it to `main` on GitHub.
