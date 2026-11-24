import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { getOrCreateSessionId } from '../lib/session.js'
import { parseGitHubUrl, fetchFileContent, buildMultiFileCode } from '../lib/github.js'
import { LANGUAGE_OPTIONS } from '../lib/constants.js'
import Topbar from '../components/Topbar.jsx'
import FileSelector from '../components/FileSelector.jsx'
import OwaspChecklist from '../components/OwaspChecklist.jsx'

const MAX_CHARS = 50000
const TICK_MS = 380 // pacing for the checklist while the single scan request runs

export default function ScanPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('code')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [repoInfo, setRepoInfo] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  // Tick the OWASP rows while scanning; hold on the last row until the request returns.
  useEffect(() => {
    if (!scanning) return
    const id = setInterval(() => setProgress(p => (p < 9 ? p + 1 : p)), TICK_MS)
    return () => clearInterval(id)
  }, [scanning])

  const lineCount = Math.max(code.split('\n').length, 22)
  const gutter = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')

  function handleGithubUrlBlur() {
    const parsed = parseGitHubUrl(githubUrl)
    if (parsed) {
      setRepoInfo(parsed)
      setError(null)
    } else if (githubUrl.trim()) {
      setError('That isn’t a GitHub repo URL. Expected https://github.com/owner/repo')
      setRepoInfo(null)
    }
  }

  async function handleScan() {
    setError(null)
    setProgress(0)
    setScanning(true)

    try {
      let codeToScan = ''
      let inputLabel = ''
      const inputType = mode

      if (mode === 'code') {
        if (!code.trim()) throw new Error('Paste some code to scan.')
        codeToScan = code.slice(0, MAX_CHARS)
        inputLabel = 'Pasted Code'
      } else {
        if (!repoInfo) throw new Error('Enter a valid GitHub repo URL.')
        if (!selectedFiles.length) throw new Error('Select at least one file.')
        const results = await Promise.allSettled(
          selectedFiles.map(async f => ({
            path: f.path,
            content: await fetchFileContent(repoInfo.owner, repoInfo.repo, f.path),
          }))
        )
        const fileContents = results.filter(r => r.status === 'fulfilled').map(r => r.value)
        if (!fileContents.length) throw new Error('Could not fetch any files from this repository.')
        codeToScan = buildMultiFileCode(fileContents).slice(0, MAX_CHARS)
        inputLabel = `${repoInfo.owner}/${repoInfo.repo}`
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ code: codeToScan, language, filename: inputLabel }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')

      const findings = data.findings || []
      const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
      findings.forEach(f => { if (counts[f.severity] !== undefined) counts[f.severity]++ })

      const record = {
        session_id: getOrCreateSessionId(),
        input_type: inputType,
        input_label: inputLabel,
        language: language || 'unknown',
        code_snippet: codeToScan,
        findings,
        total_critical: counts.Critical,
        total_high: counts.High,
        total_medium: counts.Medium,
        total_low: counts.Low,
        scan_duration_ms: data.scan_duration_ms,
      }

      const { data: saved, error: dbErr } = await supabase.from('scans').insert(record).select().single()
      if (dbErr) throw dbErr

      navigate(`/results/${saved.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setScanning(false)
      setProgress(null)
    }
  }

  function onEditorKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !scanning) handleScan()
  }

  return (
    <div className="shell">
      <Topbar />

      <div className="hero-line">
        <h1>Check code for the OWASP Top 10 before you ship it.</h1>
        <p>Paste a file or point it at a public GitHub repo. You get each issue, the lines it lives on, and how to fix it.</p>
      </div>

      <div className="scan-layout">
        <section className="panel" aria-label="Source to scan">
          <div className="panel-head">
            <div className="seg" role="group" aria-label="Input type">
              <button type="button" aria-pressed={mode === 'code'} onClick={() => setMode('code')}>Paste code</button>
              <button type="button" aria-pressed={mode === 'github'} onClick={() => setMode('github')}>GitHub repo</button>
            </div>
            {mode === 'code' && (
              <span className="end mono">{code.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
            )}
          </div>

          {mode === 'code' ? (
            <div className="editor">
              {scanning && <div className="beam" aria-hidden="true" />}
              <div className="editor-scroll">
                <div className="gutter" aria-hidden="true">{gutter}</div>
                <textarea
                  aria-label="Code to scan"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={onEditorKey}
                  placeholder={'// paste code here\nconst q = "SELECT * FROM users WHERE id = " + req.query.id'}
                  spellCheck={false}
                  wrap="off"
                  rows={lineCount}
                  maxLength={MAX_CHARS}
                />
              </div>
            </div>
          ) : (
            <div className="side-body" style={{ minHeight: 440 }}>
              <label className="field">
                <span>Public repository</span>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  onBlur={handleGithubUrlBlur}
                  placeholder="https://github.com/owner/repo"
                />
              </label>
              {repoInfo ? (
                <FileSelector owner={repoInfo.owner} repo={repoInfo.repo} onFilesChange={setSelectedFiles} />
              ) : (
                <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Up to 15 source files are pulled from the default branch. You can uncheck any you don&rsquo;t want scanned.</p>
              )}
            </div>
          )}
        </section>

        <aside className="side">
          <section className="panel">
            <div className="side-body">
              <label className="field">
                <span>Language</span>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              {error && <p className="error-text" role="alert">{error}</p>}

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleScan}
                disabled={scanning}
                aria-busy={scanning}
              >
                {scanning ? 'Analyzing…' : <>Analyze <ArrowRight size={15} /></>}
              </button>
              <p style={{ color: 'var(--ink-3)', fontSize: 12.5, textAlign: 'center' }}>
                or press <kbd>⌘</kbd> <kbd>Enter</kbd>
              </p>
            </div>
          </section>

          <section className="panel" aria-live="polite">
            <div className="panel-head"><strong>What it checks</strong><span className="end mono">OWASP 2021</span></div>
            <OwaspChecklist progress={progress} />
          </section>
        </aside>
      </div>
    </div>
  )
}
