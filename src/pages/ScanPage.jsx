import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getOrCreateSessionId } from '../lib/session.js'
import { parseGitHubUrl, fetchFileContent, buildMultiFileCode } from '../lib/github.js'
import { LANGUAGE_OPTIONS } from '../lib/constants.js'
import ScanBeam from '../components/ScanBeam.jsx'
import FileSelector from '../components/FileSelector.jsx'

const panelStyle = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '1.5rem',
}

export default function ScanPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('code')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [repoInfo, setRepoInfo] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  function handleGithubUrlBlur() {
    const parsed = parseGitHubUrl(githubUrl)
    if (parsed) {
      setRepoInfo(parsed)
      setError(null)
    } else if (githubUrl.trim()) {
      setError('Invalid GitHub URL. Use format: https://github.com/owner/repo')
      setRepoInfo(null)
    }
  }

  async function handleScan() {
    setError(null)
    setScanning(true)

    try {
      let codeToScan = ''
      let inputLabel = ''
      let inputType = mode

      if (mode === 'code') {
        if (!code.trim()) throw new Error('Paste some code to scan.')
        codeToScan = code.slice(0, 50000)
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
        codeToScan = buildMultiFileCode(fileContents).slice(0, 50000)
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
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <span style={{ color: 'var(--color-primary)' }}>Vuln</span>Scan
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          AI-powered OWASP Top 10 security scanner
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
        {/* Left panel — input */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['code', 'github'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: mode === m ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: mode === m ? '#fff' : 'var(--color-muted)',
                  border: `1px solid ${mode === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {m === 'code' ? 'Paste Code' : 'GitHub URL'}
              </button>
            ))}
          </div>

          {mode === 'code' ? (
            <>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <ScanBeam active={scanning} />
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Paste your code here…"
                  style={{
                    width: '100%',
                    height: '320px',
                    resize: 'vertical',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    background: 'var(--color-bg)',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onBlur={handleGithubUrlBlur}
                placeholder="https://github.com/owner/repo"
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              {repoInfo && (
                <FileSelector
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  onFilesChange={setSelectedFiles}
                />
              )}
            </>
          )}

          {error && (
            <p style={{ color: 'var(--color-critical)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              background: scanning ? 'var(--color-border)' : 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-display)',
              transition: 'background 0.15s',
              opacity: scanning ? 0.7 : 1,
            }}
          >
            {scanning ? 'Scanning…' : 'Scan for Vulnerabilities'}
          </button>
        </div>

        {/* Right panel — placeholder */}
        <div style={{ ...panelStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>
              Scan results will appear here
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Paste code or enter a GitHub URL to begin
            </p>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <a href="/history" style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
          View scan history →
        </a>
      </footer>
    </div>
  )
}
