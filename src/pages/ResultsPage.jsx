import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'
import SeveritySummary from '../components/SeveritySummary.jsx'
import FindingCard from '../components/FindingCard.jsx'
import CodePanel from '../components/CodePanel.jsx'

export default function ResultsPage() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFinding, setSelectedFinding] = useState(null)

  useEffect(() => {
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
      Loading scan…
    </div>
  )

  if (error || !scan) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: 'var(--color-critical)' }}>{error || 'Scan not found.'}</p>
      <button onClick={() => navigate('/')} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← New Scan</button>
    </div>
  )

  const findings = [...(scan.findings || [])].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )

  const highlightColor = selectedFinding ? SEVERITY_COLORS[selectedFinding.severity] : '#2563EB'
  const highlightLines = selectedFinding?.affected_lines || []

  const panelStyle = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    overflow: 'hidden',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-primary)' }}>Vuln</span>Scan Results
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => navigate('/')} style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              ← New Scan
            </button>
            <button onClick={() => navigate('/history')} style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              History
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
            {scan.input_label}
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
            {new Date(scan.created_at).toLocaleString()}
          </span>
          {scan.scan_duration_ms && (
            <>
              <span style={{ color: 'var(--color-border)' }}>|</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                {(scan.scan_duration_ms / 1000).toFixed(1)}s
              </span>
            </>
          )}
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <SeveritySummary scan={scan} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left — findings list */}
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-muted)' }}>
              {findings.length} {findings.length === 1 ? 'Finding' : 'Findings'}
            </h2>
          </div>
          <div style={{ overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
            {findings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-low)', fontWeight: 600 }}>
                No vulnerabilities found ✓
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

        {/* Right — code panel */}
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-muted)' }}>
              Code
            </span>
            {selectedFinding && (
              <span style={{ fontSize: '0.75rem', color: highlightColor }}>
                Highlighting: {selectedFinding.name} (lines {highlightLines.join(', ')})
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <CodePanel
              code={scan.code_snippet}
              language={scan.language}
              highlightLines={highlightLines}
              highlightColor={highlightColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
