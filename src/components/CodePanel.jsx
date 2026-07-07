import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CodePanel({ code, language, highlightLines = [], highlightColor = '#a8291d' }) {
  if (!code) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-muted)', textAlign: 'center', fontSize: '0.85rem' }}>
        Select a finding to highlight affected lines
      </div>
    )
  }

  function lineProps(lineNumber) {
    if (highlightLines.includes(lineNumber)) {
      return {
        style: {
          background: `${highlightColor}28`,
          borderLeft: `3px solid ${highlightColor}`,
          display: 'block',
          marginLeft: '-1rem',
          paddingLeft: '1rem',
        },
      }
    }
    return {}
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneLight}
        showLineNumbers
        wrapLines
        lineProps={lineProps}
        customStyle={{
          margin: 0,
          background: 'transparent',
          fontSize: '0.78rem',
          lineHeight: 1.6,
          fontFamily: 'var(--font-code)',
          minHeight: '100%',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
