import { SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'

const COUNT_KEYS = {
  Critical: 'total_critical',
  High: 'total_high',
  Medium: 'total_medium',
  Low: 'total_low',
}

export default function SeveritySummary({ scan }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {SEVERITY_ORDER.map(sev => {
        const count = scan[COUNT_KEYS[sev]] ?? 0
        const color = SEVERITY_COLORS[sev]
        return (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{count}</span>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>{sev}</span>
          </div>
        )
      })}
    </div>
  )
}
