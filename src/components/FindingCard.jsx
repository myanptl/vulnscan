import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SEVERITY_COLORS } from '../lib/constants.js'

export default function FindingCard({ finding, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_COLORS[finding.severity] || 'var(--ink-3)'
  const lines = finding.affected_lines || []

  return (
    <div
      role="button"
      tabIndex={0}
      className="finding"
      aria-pressed={isSelected}
      style={{ '--sev': sev }}
      onClick={() => onSelect(finding)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(finding) } }}
    >
      <div className="finding-top">
        <span className="sevdot" aria-hidden="true" />
        <h3>{finding.name}</h3>
        <span className="id">{finding.owasp_id}</span>
      </div>
      <p>{finding.description}</p>
      <div className="lines">
        <span className="sev-chip">{finding.severity}</span>
        {lines.length > 0 && <span style={{ color: 'var(--ink-3)' }}> · line {lines.join(', ')}</span>}
      </div>

      <button
        type="button"
        className="fix-toggle"
        aria-expanded={expanded}
        onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
      >
        <ChevronRight size={13} />
        {expanded ? 'Hide fix' : 'How to fix'}
      </button>

      {expanded && <div className="fix fade-in">{finding.fix_recommendation}</div>}
    </div>
  )
}
