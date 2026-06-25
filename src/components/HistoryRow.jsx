import { useNavigate } from 'react-router-dom'
import { SEVERITY_COLORS } from '../lib/constants.js'

export default function HistoryRow({ scan }) {
  const navigate = useNavigate()

  return (
    <tr
      onClick={() => navigate(`/results/${scan.id}`)}
      style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
    >
      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-code)', fontSize: '0.8rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {scan.input_label}
      </td>
      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
        {new Date(scan.created_at).toLocaleString()}
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'C', count: scan.total_critical, color: SEVERITY_COLORS.Critical },
            { label: 'H', count: scan.total_high, color: SEVERITY_COLORS.High },
            { label: 'M', count: scan.total_medium, color: SEVERITY_COLORS.Medium },
            { label: 'L', count: scan.total_low, color: SEVERITY_COLORS.Low },
          ].map(({ label, count, color }) => (
            <span key={label} style={{ fontSize: '0.75rem', fontWeight: 700, color: count > 0 ? color : 'var(--color-border)' }}>
              {label}:{count}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600 }}>View →</span>
      </td>
    </tr>
  )
}
