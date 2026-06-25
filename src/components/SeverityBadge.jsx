import { SEVERITY_COLORS } from '../lib/constants.js'

export default function SeverityBadge({ severity, size = 'sm' }) {
  const color = SEVERITY_COLORS[severity] || '#94A3B8'
  const pad = size === 'sm' ? '0.2rem 0.55rem' : '0.3rem 0.75rem'
  const fontSize = size === 'sm' ? '0.7rem' : '0.8rem'

  return (
    <span style={{
      display: 'inline-block',
      padding: pad,
      borderRadius: '999px',
      background: `${color}22`,
      color,
      border: `1px solid ${color}55`,
      fontSize,
      fontWeight: 700,
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.03em',
    }}>
      {severity}
    </span>
  )
}
