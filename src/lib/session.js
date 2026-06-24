export function getOrCreateSessionId() {
  const stored = localStorage.getItem('vulnscan_session_id')
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem('vulnscan_session_id', id)
  return id
}
