const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

function getToken() {
  return localStorage.getItem('ragqa_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data.message || message
    } catch (_) { /* no json body */ }
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}

async function uploadFile(path, file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    let message = `Upload failed (${res.status})`
    try {
      const data = await res.json()
      message = data.message || message
    } catch (_) { /* ignore */ }
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  listRepositories: () => request('/repositories'),
  createRepository: (payload) => request('/repositories', { method: 'POST', body: payload }),
  getRepository: (id) => request(`/repositories/${id}`),
  deleteRepository: (id) => request(`/repositories/${id}`, { method: 'DELETE' }),

  listDocuments: (repoId) => request(`/repositories/${repoId}/documents`),
  uploadDocument: (repoId, file) => uploadFile(`/repositories/${repoId}/documents`, file),
  deleteDocument: (repoId, docId) => request(`/repositories/${repoId}/documents/${docId}`, { method: 'DELETE' }),

  askQuestion: (repoId, question) =>
    request(`/repositories/${repoId}/ask`, { method: 'POST', body: { question } }),
  qaHistory: (repoId) => request(`/repositories/${repoId}/qa-history`),

  bulkAsk: async (repoId, file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE_URL}/repositories/${repoId}/bulk-qa`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) {
      let message = `Bulk Q&A failed (${res.status})`
      try {
        const data = await res.json()
        message = data.message || message
      } catch (_) { /* ignore */ }
      throw new Error(message)
    }
    const disposition = res.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    const filename = match ? match[1] : 'answered-questions.xlsx'
    const blob = await res.blob()
    return { blob, filename }
  },
}

export { getToken }
