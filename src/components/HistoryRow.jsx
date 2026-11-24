import { useNavigate } from 'react-router-dom'
import { SEVERITY_COLORS } from '../lib/constants.js'

const COLS = [
  ['C', 'total_critical', 'Critical'],
  ['H', 'total_high', 'High'],
  ['M', 'total_medium', 'Medium'],
  ['L', 'total_low', 'Low'],
]

export default function HistoryRow({ scan }) {
  const navigate = useNavigate()
  const open = () => navigate(`/results/${scan.id}`)

  return (
    <tr
      tabIndex={0}
      onClick={open}
      onKeyDown={e => { if (e.key === 'Enter') open() }}
    >
      <td className="mono" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {scan.input_label}
      </td>
      <td style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{new Date(scan.created_at).toLocaleString()}</td>
      <td>
        <div className="pills">
          {COLS.map(([k, field, sev]) => {
            const n = scan[field] ?? 0
            return (
              <span key={k} className={n ? '' : 'zero'} style={{ '--sev': SEVERITY_COLORS[sev] }} title={`${n} ${sev}`}>
                {k} {n}
              </span>
            )
          })}
        </div>
      </td>
      <td style={{ textAlign: 'right' }}><span className="row-cta">Open →</span></td>
    </tr>
  )
}
