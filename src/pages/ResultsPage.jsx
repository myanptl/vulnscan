import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'
import Topbar from '../components/Topbar.jsx'
import FindingCard from '../components/FindingCard.jsx'
import OwaspChecklist from '../components/OwaspChecklist.jsx'
import { buildMarkdownReport } from '../lib/report.js'
import { DEMO_SCAN } from '../lib/demoScan.js'

const CodePanel = lazy(() => import('../components/CodePanel.jsx'))

const TALLY = [
  ['Critical', 'total_critical'],
  ['High', 'total_high'],
  ['Medium', 'total_medium'],
  ['Low', 'total_low'],
]

function verdictFor(scan, count) {
  if (scan.total_critical > 0) return { label: 'Critical issues found', sev: 'Critical' }
  if (scan.total_high > 0) return { label: 'High-risk issues found', sev: 'High' }
  if (scan.total_medium > 0) return { label: 'Worth a review', sev: 'Medium' }
  if (count > 0) return { label: 'Low risk', sev: 'Low' }
  return { label: 'No issues found', sev: 'Low' }
}

function Skeleton() {
  return (
    <div className="shell">
      <Topbar />
      <div className="panel summary" aria-busy="true">
        <div className="skeleton" style={{ width: 220 }} />
        <div className="skeleton" style={{ width: 140 }} />
      </div>
      <div className="results-layout">
        {[0, 1, 2].map(i => (
          <div key={i} className="panel" style={{ padding: 16, display: 'grid', gap: 12 }}>
            {[80, 60, 90, 70].map(w => <div key={w} className="skeleton" style={{ width: `${w}%` }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { scanId } = useParams()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(buildMarkdownReport(scan))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (permissions): leave the button as it was
    }
  }

  useEffect(() => {
    if (scanId === 'demo') {
      setScan(DEMO_SCAN)
      setSelected(DEMO_SCAN.findings[0])
      setLoading(false)
      return
    }
    supabase.from('scans').select('*').eq('id', scanId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('This scan doesn’t exist, or it was cleared from history.'); return }
        setScan(data)
        if (data.findings?.length) setSelected(data.findings[0])
      })
      .finally(() => setLoading(false))
  }, [scanId])

  if (loading) return <Skeleton />

  if (error || !scan) return (
    <div className="shell">
      <Topbar />
      <div className="panel empty">
        <strong>Scan not found</strong>
        <p>{error}</p>
        <p style={{ marginTop: 12 }}><Link className="link" to="/">Run a new scan →</Link></p>
      </div>
    </div>
  )

  const findings = [...(scan.findings || [])].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )
  const verdict = verdictFor(scan, findings.length)
  const sevColor = selected ? SEVERITY_COLORS[selected.severity] : 'var(--accent)'
  const lines = selected?.affected_lines || []

  return (
    <div className="shell">
      <Topbar>
        <button type="button" onClick={copyReport} aria-live="polite">
          {copied ? <><Check size={13} style={{ verticalAlign: -2 }} /> Copied</> : <><Copy size={13} style={{ verticalAlign: -2 }} /> Copy report</>}
        </button>
      </Topbar>

      <section className="panel summary fade-in" aria-label="Scan summary">
        <div>
          <div className="verdict" style={{ '--sev': SEVERITY_COLORS[verdict.sev] }}>
            <span className="dot" aria-hidden="true" />
            <strong>{verdict.label}</strong>
          </div>
          <div className="meta" style={{ marginTop: 6, marginLeft: 20 }}>
            <span className="target">{scan.input_label}</span>
            <span>{new Date(scan.created_at).toLocaleString()}</span>
            {scan.scan_duration_ms ? <span>{(scan.scan_duration_ms / 1000).toFixed(1)}s</span> : null}
            {scanId === 'demo' && <span>Sample report</span>}
          </div>
        </div>
        <div className="tally">
          {TALLY.map(([sev, field]) => {
            const n = scan[field] ?? 0
            return (
              <div key={sev} style={{ '--sev': SEVERITY_COLORS[sev] }}>
                <b className={n ? '' : 'zero'}>{n}</b>
                <span>{sev}</span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="results-layout">
        <section className="panel" aria-label="OWASP categories">
          <div className="panel-head"><strong>OWASP Top 10</strong></div>
          <OwaspChecklist findings={findings} onSelect={setSelected} />
        </section>

        <section className="panel" aria-label="Findings">
          <div className="panel-head"><strong>Findings</strong><span className="end mono">{findings.length}</span></div>
          <div className="findings">
            {findings.length === 0 ? (
              <div className="empty">
                <strong>Nothing flagged</strong>
                This code passed every check. Static analysis can miss logic bugs, so still review auth and data flows by hand.
              </div>
            ) : (
              findings.map(f => (
                <FindingCard key={f.id} finding={f} onSelect={setSelected} isSelected={selected?.id === f.id} />
              ))
            )}
          </div>
        </section>

        <section className="panel code-col" aria-label="Source">
          <div className="panel-head">
            <strong>Source</strong>
            {selected && (
              <span className="end mono" style={{ color: sevColor }}>
                {lines.length ? `line ${lines.join(', ')}` : 'no line info'}
              </span>
            )}
          </div>
          <div className="code-wrap">
            <Suspense fallback={<div style={{ padding: 16, display: 'grid', gap: 10 }}>{[70, 50, 85].map(w => <div key={w} className="skeleton" style={{ width: `${w}%` }} />)}</div>}>
              <CodePanel code={scan.code_snippet} language={scan.language} highlightLines={lines} highlightColor={sevColor} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}
