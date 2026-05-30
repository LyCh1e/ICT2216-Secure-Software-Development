const BASE = import.meta.env.VITE_API_URL ?? ''

let _csrf = null

async function _fetchCsrf() {
  try {
    const res = await fetch(BASE + '/api/auth/csrf-token', { credentials: 'include' })
    const data = await res.json()
    _csrf = data.csrf_token ?? null
  } catch {
    _csrf = null
  }
}

// Call after login (session changes, old token is stale)
export function resetCsrf() { _csrf = null }

async function apiFetch(path, options = {}) {
  const isMutating = options.method && options.method !== 'GET'

  if (isMutating && !_csrf) await _fetchCsrf()

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (isMutating && _csrf) headers['X-CSRFToken'] = _csrf

  const res = await fetch(BASE + path, { credentials: 'include', headers, ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  get:    (path)       => apiFetch(path),
  post:   (path, body) => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)       => apiFetch(path, { method: 'DELETE' }),
}
