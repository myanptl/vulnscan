import { useEffect, useState } from 'react'

/**
 * Cosmetic scan log. While a scan is in flight this streams plausible engine
 * lines so the wait reads like a real analyzer booting up. It drives no logic
 * and reports nothing about the actual scan — purely atmosphere.
 */
const LINES = [
  'initializing static analysis engine',
  'loading OWASP Top 10 (2021) ruleset',
  'tokenizing source · building AST',
  'tracing taint: sources → sinks',
  'matching injection & XSS signatures',
  'auditing auth & access-control paths',
  'scoring severity · compiling report',
]

export default function ScanConsole() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => (c < LINES.length ? c + 1 : c))
    }, 520)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--elev-2)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-card)',
      }}>
        <span className="vs-status-dot" style={{ background: 'var(--color-accent)' }} />
        <span style={{
          fontFamily: 'var(--font-code)', fontSize: '0.62rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--color-accent)',
        }}>
          Scanning
        </span>
      </div>
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {LINES.slice(0, count).map((line, i) => {
          const done = i < count - 1
          return (
            <div
              key={line}
              className="vs-logline"
              style={{
                fontFamily: 'var(--font-code)', fontSize: '0.68rem', lineHeight: 1.5,
                color: done ? 'var(--color-muted)' : 'var(--color-text)',
                display: 'flex', gap: '0.5rem', alignItems: 'baseline',
              }}
            >
              <span style={{ color: done ? 'var(--color-low)' : 'var(--color-accent)', flexShrink: 0 }}>
                {done ? '✓' : '›'}
              </span>
              <span>
                {line}
                {!done && <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
