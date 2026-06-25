import Anthropic from 'npm:@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a security code scanner. Analyze the provided code for OWASP Top 10 (2021) vulnerabilities.

Return ONLY a valid JSON array. Each item must have exactly these fields:
- id: a new UUIDv4 string
- name: string (specific vulnerability name, e.g. "SQL Injection")
- owasp_category: string (full category name, e.g. "A03:2021 – Injection")
- owasp_id: string (e.g. "A03")
- severity: exactly one of "Critical" | "High" | "Medium" | "Low"
- description: string (1-2 sentences explaining what is vulnerable and why)
- affected_lines: number[] (1-indexed line numbers where the issue occurs)
- code_snippet: string (the exact vulnerable code from the input)
- fix_recommendation: string (concrete fix with example code where possible)

If no vulnerabilities are found, return [].
Return ONLY the JSON array — no markdown fences, no prose, no trailing text.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, language, filename } = await req.json()

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const truncated = code.slice(0, 50000)

    const userMessage = [
      filename ? `File: ${filename}` : null,
      language ? `Language: ${language}` : null,
      '',
      truncated,
    ].filter(Boolean).join('\n')

    const client = new Anthropic()
    const start = Date.now()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const scan_duration_ms = Date.now() - start
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    let findings
    try {
      findings = JSON.parse(raw)
      if (!Array.isArray(findings)) throw new Error('not an array')
    } catch {
      findings = []
    }

    return new Response(
      JSON.stringify({ findings, scan_duration_ms }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Claude API error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
