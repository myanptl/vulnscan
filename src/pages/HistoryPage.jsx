import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getOrCreateSessionId } from '../lib/session.js'
import HistoryRow from '../components/HistoryRow.jsx'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const sessionId = getOrCreateSessionId()

  useEffect(() => {
    supabase
      .from('scans')
      .select('id,created_at,input_label,input_type,language,total_critical,total_high,total_medium,total_low')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setScans(data || []))
      .finally(() => setLoading(false))
  }, [])

  async function clearHistory() {
    if (!confirm('Delete all scan history for this session?')) return
    setClearing(true)
    await supabase.from('scans').delete().eq('session_id', sessionId)
    setScans([])
    setClearing(false)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-primary)' }}>Vuln</span>Scan History
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            This session's scans — stored anonymously in your browser
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.85rem' }}
          >
            ← New Scan
          </button>
          {scans.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={clearing}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid var(--color-critical)',
                color: 'var(--color-critical)',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              {clearing ? 'Clearing…' : 'Clear History'}
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Loading…</p>
      ) : scans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>No scans yet</p>
          <button onClick={() => navigate('/')} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Run your first scan →
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Target', 'Scanned At', 'Findings', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scans.map(scan => <HistoryRow key={scan.id} scan={scan} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
