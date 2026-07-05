# VulnScan — Claude Code Config

Web-based static analysis scanner for the OWASP Top 10. Paste code → get findings.
Plan-B (AI/security) portfolio project.

## Stack
- React 18 + Vite (JS, ESM), `react-router-dom`
- Supabase (`@supabase/supabase-js`) — persistence
- `react-syntax-highlighter`, `lucide-react`
- Lint: **oxlint** · Tests: **vitest** + Testing Library (jsdom)

## Layout
- `src/` — scanner UI, detection rules, results
- `supabase/` — schema / config
- `tests/` — vitest specs
- `vercel.json` — SPA rewrite (all non-asset routes → index.html)

## Commands
```bash
npm run dev      # vite dev
npm run build    # vite build
npm run lint     # oxlint
npm test         # vitest run
npm run preview
```

## Conventions
- Detection rules are the product — every rule needs a test (true positive AND true negative). Aim 80%+ coverage on rule logic.
- Never trust scanned input: it's untrusted code. Render it, never `eval`/execute it. Sanitize before `dangerouslySetInnerHTML`.
- Supabase: RLS on, anon key only in client, no service-role key in the bundle.
- Supabase free tier auto-pauses — if calls fail, check the project isn't paused.

## Deploy
Vercel (`vercel --prod`). Keep the SPA rewrite in `vercel.json`. Push source to `main`.

## Tooling available
- MCP `context7` (docs), `supabase` (DB) — both global.
- Project agent `detection-reviewer` — audit OWASP rules for false pos/neg.
- Global agents: `security-reviewer`, `react-reviewer`, `database-reviewer`.
