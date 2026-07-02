import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'
import SeveritySummary from '../components/SeveritySummary.jsx'
import FindingCard from '../components/FindingCard.jsx'
import OwaspCoverage from '../components/OwaspCoverage.jsx'
import { buildMarkdownReport } from '../lib/report.js'
import { DEMO_SCAN } from '../lib/demoScan.js'

const CodePanel = lazy(() => import('../components/CodePanel.jsx'))

const panel = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  overflow: 'hidden',
}

export default function ResultsPage() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFinding, setSelectedFinding] = useState(null)
  const [copied, setCopied] = useState(false)

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(buildMarkdownReport(scan))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (permissions) — leave button state unchanged
    }
  }

  useEffect(() => {
    if (scanId === 'demo') {
      setScan(DEMO_SCAN)
      setSelectedFinding(DEMO_SCAN.findings[0])
      setLoading(false)
      return
    }
    supabase.from('scans').select('*').eq('id', scanId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Scan not found.'); return }
        setScan(data)
        const findings = data.findings || []
        if (findings.length > 0) setSelectedFinding(findings[0])
      })
      .finally(() => setLoading(false))
  }, [scanId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
        loading...
      </span>
    </div>
  )

  if (error || !scan) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--color-critical)' }}>
        ✕ {error || 'Scan not found.'}
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--color-accent)', letterSpacing: '0.04em' }}
      >
        ← new scan
      </button>
    </div>
  )

  const findings = [...(scan.findings || [])].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )

  const highlightColor = selectedFinding ? SEVERITY_COLORS[selectedFinding.severity] : 'var(--color-accent)'
  const highlightLines = selectedFinding?.affected_lines || []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '1.75rem 2.5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: 'var(--color-accent)' }}>Vuln</span>Scan
            </h1>
            <span style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.65rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              paddingLeft: '1rem',
              borderLeft: '1px solid var(--color-border)',
            }}>
              Results
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}
            >
              ← new scan
            </button>
            <button
              onClick={() => navigate('/history')}
              style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}
            >
              history
            </button>
          </div>
        </div>

        {/* Scan metadata bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '3px',
        }}>
          <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--color-text)' }}>
            {scan.input_label}
          </span>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
            {new Date(scan.created_at).toLocaleString()}
          </span>
          {scan.scan_duration_ms && (
            <>
              <span style={{ color: 'var(--color-border)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                {(scan.scan_duration_ms / 1000).toFixed(1)}s
              </span>
            </>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <SeveritySummary scan={scan} />
            <button
              onClick={copyReport}
              style={{
                fontFamily: 'var(--font-code)', fontSize: '0.68rem', letterSpacing: '0.05em',
                color: copied ? 'var(--color-low)' : 'var(--color-accent)',
                border: `1px solid ${copied ? 'var(--color-low)' : 'var(--color-accent)'}44`,
                borderRadius: '3px', padding: '0.35rem 0.6rem', background: 'transparent',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {copied ? '✓ copied' : 'copy report .md'}
            </button>
          </div>
        </div>
      </header>

      <OwaspCoverage findings={findings} onSelect={setSelectedFinding} />

      <div className="results-grid" style={{ display: 'grid', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        {/* Findings list */}
        <div style={{ ...panel, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.65rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Findings
            </span>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.65rem', color: 'var(--color-muted)' }}>
              {findings.length}
            </span>
          </div>
          <div style={{ overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {findings.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-low)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  No vulnerabilities found
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                  Code passed all checks
                </p>
              </div>
            ) : (
              findings.map(f => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  onSelect={setSelectedFinding}
                  isSelected={selectedFinding?.id === f.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Code panel */}
        <div style={{ ...panel, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.65rem', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Source
            </span>
            {selectedFinding && (
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.68rem', color: highlightColor }}>
                {selectedFinding.name} · {highlightLines.length > 0 ? `L.${highlightLines.join(', L.')}` : 'no lines'}
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--color-muted)', fontSize: '0.85rem' }}>Loading...</div>}>
              <CodePanel
                code={scan.code_snippet}
                language={scan.language}
                highlightLines={highlightLines}
                highlightColor={highlightColor}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
