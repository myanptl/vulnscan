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
    <div style={{ minHeight: '100vh', padding: '1.75rem 2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '0.3rem',
          }}>
            <span style={{ color: 'var(--color-accent)' }}>Vuln</span>Scan
            <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: '1rem', marginLeft: '0.6rem' }}>/ history</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.68rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
            Session-scoped · stored locally
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}
          >
            ← new scan
          </button>
          {scans.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={clearing}
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.72rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '3px',
                background: 'transparent',
                border: '1px solid var(--color-critical)',
                color: 'var(--color-critical)',
                letterSpacing: '0.04em',
                opacity: clearing ? 0.5 : 1,
              }}
            >
              {clearing ? 'clearing...' : 'clear history'}
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
          loading...
        </p>
      ) : scans.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
        }}>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            No scans yet
          </p>
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--color-accent)', letterSpacing: '0.04em' }}
          >
            run your first scan →
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Target', 'Scanned', 'Findings', ''].map(h => (
                  <th key={h} style={{
                    padding: '0.625rem 1rem',
                    textAlign: 'left',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}>
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
