// Bundled sample report so /results/demo can show the report UI without a
// backend call. The snippet and findings are illustrative sample data.
export const DEMO_SCAN = {
  id: 'demo',
  input_label: 'demo — sample-endpoint.js',
  language: 'javascript',
  created_at: '2026-07-01T12:00:00Z',
  scan_duration_ms: 4200,
  total_critical: 1,
  total_high: 2,
  total_medium: 1,
  total_low: 0,
  code_snippet: [
    'const express = require("express");',
    'const db = require("./db");',
    'const app = express();',
    '',
    'const API_KEY = "sk_live_demo_not_a_real_key";',
    '',
    'app.get("/users/:id", (req, res) => {',
    '  const query = "SELECT * FROM users WHERE id = " + req.params.id;',
    '  db.execute(query).then(rows => res.json(rows));',
    '});',
    '',
    'app.get("/search", (req, res) => {',
    '  res.send("<h1>Results for " + req.query.q + "</h1>");',
    '});',
    '',
    'app.get("/admin", (req, res) => {',
    '  res.send(renderAdminPanel());',
    '});',
  ].join('\n'),
  findings: [
    {
      id: 'demo-1',
      name: 'SQL Injection',
      owasp_id: 'A03:2021',
      severity: 'Critical',
      affected_lines: [8],
      description:
        'User input from req.params.id is concatenated directly into a SQL query. An attacker can inject arbitrary SQL — e.g. "1 OR 1=1" dumps every row.',
      fix_recommendation:
        'Use a parameterized query:\n\ndb.execute("SELECT * FROM users WHERE id = ?", [req.params.id])',
    },
    {
      id: 'demo-2',
      name: 'Reflected XSS',
      owasp_id: 'A03:2021',
      severity: 'High',
      affected_lines: [13],
      description:
        'req.query.q is echoed into HTML without escaping. A crafted link can execute scripts in the visitor\'s browser.',
      fix_recommendation:
        'Escape output or render through a templating engine with auto-escaping. Never concatenate user input into HTML.',
    },
    {
      id: 'demo-3',
      name: 'Hardcoded Secret',
      owasp_id: 'A02:2021',
      severity: 'High',
      affected_lines: [5],
      description:
        'A live-looking API key is committed in source. Anyone with repo access (or the git history) can use it.',
      fix_recommendation:
        'Move the key to an environment variable and rotate it. Add a secret scanner (e.g. keyhound) to CI.',
    },
    {
      id: 'demo-4',
      name: 'Missing Authorization Check',
      owasp_id: 'A01:2021',
      severity: 'Medium',
      affected_lines: [16, 17, 18],
      description:
        'The /admin route renders the admin panel with no authentication or role check.',
      fix_recommendation:
        'Gate the route behind auth middleware and verify the user\'s role server-side before rendering.',
    },
  ],
}
