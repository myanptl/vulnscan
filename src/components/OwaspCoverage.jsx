import { OWASP_TOP_10, SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'

/**
 * OWASP Top 10 coverage strip: all ten categories, lit where the scan has
 * findings. Clicking a lit cell jumps to that category's worst finding.
 */
export default function OwaspCoverage({ findings, onSelect }) {
  const byCategory = {}
  for (const f of findings) {
    const key = (f.owasp_id || '').slice(0, 3)
    if (!byCategory[key]) byCategory[key] = []
    byCategory[key].push(f)
  }

  function worstColor(list) {
    const worst = [...list].sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    )[0]
    return SEVERITY_COLORS[worst.severity] || 'var(--color-accent)'
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
      gap: '1px',
      background: 'var(--color-border)',
      border: '1px solid var(--color-border)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '1.25rem',
    }}>
      {OWASP_TOP_10.map(cat => {
        const hits = byCategory[cat.id] || []
        const lit = hits.length > 0
        const color = lit ? worstColor(hits) : null
        return (
          <button
            key={cat.id}
            type="button"
            onClick={lit && onSelect ? () => onSelect(hits[0]) : undefined}
            title={`${cat.id} ${cat.name}${lit ? ` — ${hits.length} finding${hits.length > 1 ? 's' : ''}` : ' — clear'}`}
            style={{
              background: lit ? `${color}14` : 'var(--color-card)',
              border: 'none',
              borderTop: `2px solid ${lit ? color : 'transparent'}`,
              padding: '0.5rem 0.4rem 0.45rem',
              cursor: lit ? 'pointer' : 'default',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: lit ? color : 'var(--color-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}>
              {cat.id}
              {lit && <span>{hits.length}</span>}
            </span>
            <span style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.52rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: lit ? 'var(--color-text)' : 'var(--color-border)',
              lineHeight: 1.3,
            }}>
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
