# VulnScan

An AI security scanner that catches **OWASP Top 10** vulnerabilities before they catch you.

Paste code or drop a GitHub repo link and get a real vulnerability report in seconds — no login, no friction, just results.

**Live:** [vulnscan-xi.vercel.app](https://vulnscan-xi.vercel.app)

## What it does

- **Two ways in** — paste a code snippet, or point it at a public GitHub repo
- **Auto-detects the language** across 12: JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, C#, C/C++, Rust, Swift, Kotlin
- **Flags OWASP Top 10 issues** — injection, XSS, broken authentication, and more — with the offending lines highlighted
- **Fast** — findings come back in seconds

## Architecture

- **React + Vite** frontend, deployed on **Vercel**
- **Supabase Edge Function** (`supabase/functions/scan`) acts as a secure API proxy — the **Claude API key never touches the client side**, because that would be embarrassing for a security tool
- `react-syntax-highlighter` for readable, highlighted findings

## Local development

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run preview    # preview the build
npm run lint       # oxlint
npm test           # vitest
```

### Environment

Create a `.env.local` (git-ignored) with your Supabase project values:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Claude API key is set as a secret on the Supabase Edge Function, not in the client. Never commit real keys.

## Status

v1 — still a sophomore, still shipping.

Built human-directed, Claude-assisted.
