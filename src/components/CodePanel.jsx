import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CodePanel({ code, language, highlightLines = [], highlightColor = 'var(--accent)' }) {
  if (!code) {
    return <div className="empty">Select a finding to highlight its lines.</div>
  }

  function lineProps(lineNumber) {
    return highlightLines.includes(lineNumber)
      ? { className: 'code-line-hit', style: { '--sev': highlightColor } }
      : { style: { display: 'block' } }
  }

  return (
    <SyntaxHighlighter
      language={language || 'text'}
      style={oneDark}
      showLineNumbers
      wrapLines
      lineProps={lineProps}
      lineNumberStyle={{ minWidth: '2.6em', paddingRight: '1em', color: 'var(--ink-3)', opacity: 0.7 }}
      customStyle={{
        margin: 0,
        padding: '12px 0',
        background: 'transparent',
        fontSize: '12.5px',
        lineHeight: '20px',
        fontFamily: 'var(--font-mono)',
      }}
      codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
