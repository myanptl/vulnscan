import { useNavigate } from 'react-router-dom'
import { SEVERITY_COLORS } from '../lib/constants.js'

export default function HistoryRow({ scan }) {
  const navigate = useNavigate()

  return (
    <tr
      onClick={() => navigate(`/results/${scan.id}`)}
      style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in oklab, var(--color-accent) 5%, transparent)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{
        padding: '0.75rem 1rem',
        fontFamily: 'var(--font-code)',
        fontSize: '0.75rem',
        maxWidth: '240px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {scan.input_label}
      </td>
      <td style={{
        padding: '0.75rem 1rem',
        fontFamily: 'var(--font-code)',
        fontSize: '0.7rem',
        color: 'var(--color-muted)',
        whiteSpace: 'nowrap',
      }}>
        {new Date(scan.created_at).toLocaleString()}
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { key: 'C', count: scan.total_critical, color: SEVERITY_COLORS.Critical },
            { key: 'H', count: scan.total_high,     color: SEVERITY_COLORS.High },
            { key: 'M', count: scan.total_medium,   color: SEVERITY_COLORS.Medium },
            { key: 'L', count: scan.total_low,      color: SEVERITY_COLORS.Low },
          ].map(({ key, count, color }) => (
            <span key={key} style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: count > 0 ? color : 'var(--color-border)',
              letterSpacing: '0.03em',
            }}>
              {key}:{count}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'var(--color-accent)', letterSpacing: '0.04em' }}>
          view →
        </span>
      </td>
    </tr>
  )
}
