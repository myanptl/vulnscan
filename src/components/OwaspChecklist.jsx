import { Check, Circle, LoaderCircle } from 'lucide-react'
import { OWASP_TOP_10, SEVERITY_COLORS, SEVERITY_ORDER } from '../lib/constants.js'

function worst(list) {
  return [...list].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))[0]
}

/**
 * The ten OWASP categories as one list, used twice:
 * - scan page: `progress` (0-10) ticks rows off while a scan runs (cosmetic pacing,
 *   the real scan is one request)
 * - results page: `findings` lights each category that has hits; clicking jumps to its worst one
 */
export default function OwaspChecklist({ progress = null, findings = null, onSelect }) {
  const byCat = {}
  for (const f of findings || []) {
    const key = (f.owasp_id || '').slice(0, 3)
    ;(byCat[key] ||= []).push(f)
  }

  return (
    <ul className="checklist">
      {OWASP_TOP_10.map((cat, i) => {
        if (findings) {
          const hits = byCat[cat.id] || []
          if (!hits.length) {
            return (
              <li key={cat.id} data-state="pending" title={`${cat.name}: clear`}>
                <span className="id">{cat.id}</span>
                <span>{cat.name}</span>
                <span className="mark"><Check size={13} aria-label="clear" /></span>
              </li>
            )
          }
          const top = worst(hits)
          return (
            <li key={cat.id} className="hit" style={{ '--sev': SEVERITY_COLORS[top.severity] }}>
              <button type="button" onClick={() => onSelect?.(top)} aria-label={`${cat.name}: ${hits.length} finding${hits.length > 1 ? 's' : ''}`}>
                <span className="id">{cat.id}</span>
                <span>{cat.name}</span>
                <span className="count">{hits.length}</span>
              </button>
            </li>
          )
        }

        const state = progress === null ? 'idle' : i < progress ? 'done' : i === progress ? 'active' : 'pending'
        return (
          <li key={cat.id} data-state={state}>
            <span className="id">{cat.id}</span>
            <span>{cat.name}</span>
            <span className="mark">
              {state === 'done' && <Check size={13} />}
              {state === 'active' && <LoaderCircle size={13} className="spin" />}
              {(state === 'pending' || state === 'idle') && <Circle size={6} fill="currentColor" strokeWidth={0} />}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
