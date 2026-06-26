import { useState } from 'react'
import { SEVERITY_COLORS } from '../lib/constants.js'
import SeverityBadge from './SeverityBadge.jsx'

export default function FindingCard({ finding, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false)
  const color = SEVERITY_COLORS[finding.severity] || '#6B88A8'

  return (
    <div
      onClick={() => onSelect(finding)}
      style={{
        background: isSelected ? `${color}08` : 'var(--color-surface)',
        border: `1px solid ${isSelected ? color + '60' : 'var(--color-border)'}`,
        borderLeft: `2px solid ${color}`,
        borderRadius: '3px',
        padding: '0.75rem 0.875rem',
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
          <SeverityBadge severity={finding.severity} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>
            {finding.name}
          </span>
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: '0.65rem',
          fontFamily: 'var(--font-code)',
          color: 'var(--color-muted)',
          letterSpacing: '0.04em',
        }}>
          {finding.owasp_id}
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem', lineHeight: 1.55 }}>
        {finding.description}
      </p>

      {finding.affected_lines?.length > 0 && (
        <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-code)', color, marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
          {'L.' + finding.affected_lines.join(', L.')}
        </p>
      )}

      <button
        onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
        style={{
          fontSize: '0.72rem',
          fontFamily: 'var(--font-code)',
          color: 'var(--color-accent)',
          letterSpacing: '0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <span style={{ fontSize: '0.6rem' }}>{expanded ? '▲' : '▼'}</span>
        {expanded ? 'hide fix' : 'show fix'}
      </button>

      {expanded && (
        <div style={{
          marginTop: '0.6rem',
          padding: '0.625rem 0.75rem',
          background: 'var(--color-card)',
          borderLeft: '2px solid var(--color-accent)',
          borderRadius: '0 3px 3px 0',
          fontSize: '0.76rem',
          fontFamily: 'var(--font-code)',
          color: 'var(--color-text)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {finding.fix_recommendation}
        </div>
      )}
    </div>
  )
}
