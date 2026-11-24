import { Link, useLocation } from 'react-router-dom'

// Brackets around a line: a scanner looking at one row of code.
function Mark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 2H2v14h3M13 2h3v14h-3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 9h7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function Topbar({ children }) {
  const { pathname } = useLocation()
  const current = (path) => (pathname === path ? 'page' : undefined)
  return (
    <header className="topbar">
      <Link to="/" className="wordmark" aria-label="VulnScan home">
        <Mark />
        VulnScan
      </Link>
      <nav className="nav" aria-label="Main">
        <Link to="/" aria-current={current('/')}>Scan</Link>
        <Link to="/history" aria-current={current('/history')}>History</Link>
        <Link to="/results/demo" aria-current={current('/results/demo')} className="hide-sm">Demo report</Link>
        {children}
      </nav>
    </header>
  )
}
