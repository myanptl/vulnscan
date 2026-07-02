export const SEVERITY_COLORS = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#EAB308',
  Low: '#22C55E',
}

export const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low']

// OWASP Top 10 (2021)
export const OWASP_TOP_10 = [
  { id: 'A01', name: 'Broken Access Control' },
  { id: 'A02', name: 'Cryptographic Failures' },
  { id: 'A03', name: 'Injection' },
  { id: 'A04', name: 'Insecure Design' },
  { id: 'A05', name: 'Security Misconfiguration' },
  { id: 'A06', name: 'Vulnerable Components' },
  { id: 'A07', name: 'Auth Failures' },
  { id: 'A08', name: 'Integrity Failures' },
  { id: 'A09', name: 'Logging Failures' },
  { id: 'A10', name: 'SSRF' },
]

export const SOURCE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go',
  '.rb', '.php', '.cs', '.cpp', '.c', '.h', '.rs', '.swift', '.kt',
]

export const EXCLUDED_PATH_FRAGMENTS = [
  'node_modules', 'dist', '.min.', 'vendor', '__pycache__', '.lock',
]

export const LANGUAGE_OPTIONS = [
  { label: 'Auto-detect', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'PHP', value: 'php' },
  { label: 'C#', value: 'csharp' },
  { label: 'C/C++', value: 'cpp' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
]
