import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/ev-api/v1'

const api = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ev_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('ev_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}${API_PREFIX}/auth/refresh`, {
            refreshToken,
          })
          localStorage.setItem('ev_access_token', data.accessToken)
          localStorage.setItem('ev_refresh_token', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          localStorage.removeItem('ev_access_token')
          localStorage.removeItem('ev_refresh_token')
          window.location.href = '/ev-web-ia/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
