import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getOrCreateSessionId } from '../lib/session.js'
import Topbar from '../components/Topbar.jsx'
import HistoryRow from '../components/HistoryRow.jsx'

export default function HistoryPage() {
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
  }, [sessionId])

  async function clearHistory() {
    if (!confirm('Delete every scan in this browser’s history?')) return
    setClearing(true)
    await supabase.from('scans').delete().eq('session_id', sessionId)
    setScans([])
    setClearing(false)
  }

  return (
    <div className="shell">
      <Topbar />

      <div className="hero-line" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>History</h1>
          <p>Scans from this browser. Nothing is tied to an account.</p>
        </div>
        {scans.length > 0 && (
          <button type="button" className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={clearHistory} disabled={clearing}>
            {clearing ? 'Clearing…' : 'Clear history'}
          </button>
        )}
      </div>

      <section className="panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 16, display: 'grid', gap: 14 }}>
            {[90, 75, 85].map(w => <div key={w} className="skeleton" style={{ width: `${w}%` }} />)}
          </div>
        ) : scans.length === 0 ? (
          <div className="empty">
            <strong>No scans yet</strong>
            Scans you run show up here so you can reopen the report later.
            <p style={{ marginTop: 12 }}><Link className="link" to="/">Run your first scan →</Link> <span style={{ color: 'var(--ink-3)' }}>or</span> <Link className="link" to="/results/demo">see a sample report</Link></p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Target</th><th>Scanned</th><th>Findings</th><th aria-label="Open" /></tr>
            </thead>
            <tbody>
              {scans.map(scan => <HistoryRow key={scan.id} scan={scan} />)}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
