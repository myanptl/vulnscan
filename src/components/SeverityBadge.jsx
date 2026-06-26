import { SEVERITY_COLORS } from '../lib/constants.js'

export default function SeverityBadge({ severity, size = 'sm' }) {
  const color = SEVERITY_COLORS[severity] || '#6B88A8'
  const fontSize = size === 'sm' ? '0.62rem' : '0.72rem'

  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.45rem',
      borderRadius: '2px',
      background: `${color}18`,
      color,
      border: `1px solid ${color}50`,
      fontSize,
      fontWeight: 700,
      fontFamily: 'var(--font-code)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
    }}>
      {severity}
    </span>
  )
}
