import { SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'

const COUNT_KEYS = {
  Critical: 'total_critical',
  High: 'total_high',
  Medium: 'total_medium',
  Low: 'total_low',
}

export default function SeveritySummary({ scan }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {SEVERITY_ORDER.map(sev => {
        const count = scan[COUNT_KEYS[sev]] ?? 0
        const color = SEVERITY_COLORS[sev]
        return (
          <div key={sev} style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{
              fontFamily: 'var(--font-code)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: count > 0 ? color : 'var(--color-border)',
              lineHeight: 1,
            }}>
              {count}
            </span>
            <span style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.62rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: count > 0 ? color + 'aa' : 'var(--color-border)',
            }}>
              {sev}
            </span>
          </div>
        )
      })}
    </div>
  )
}
