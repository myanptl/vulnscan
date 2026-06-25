import { useState } from 'react'
import { SEVERITY_COLORS } from '../lib/constants.js'
import SeverityBadge from './SeverityBadge.jsx'

export default function FindingCard({ finding, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false)
  const color = SEVERITY_COLORS[finding.severity] || '#94A3B8'

  return (
    <div
      onClick={() => onSelect(finding)}
      style={{
        background: 'var(--color-bg)',
        border: `1px solid ${isSelected ? color : 'var(--color-border)'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '8px',
        padding: '0.875rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <SeverityBadge severity={finding.severity} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
            {finding.name}
          </span>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontFamily: 'var(--font-code)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          padding: '0.15rem 0.4rem',
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}>
          {finding.owasp_id}
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
        {finding.description}
      </p>

      {finding.affected_lines?.length > 0 && (
        <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-code)', color, marginBottom: '0.5rem' }}>
          Lines: {finding.affected_lines.join(', ')}
        </p>
      )}

      <button
        onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
        style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}
      >
        {expanded ? 'Hide fix ↑' : 'Show fix ↓'}
      </button>

      {expanded && (
        <div style={{
          marginTop: '0.6rem',
          padding: '0.6rem',
          background: 'var(--color-card)',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-code)',
          color: 'var(--color-text)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {finding.fix_recommendation}
        </div>
      )}
    </div>
  )
}
