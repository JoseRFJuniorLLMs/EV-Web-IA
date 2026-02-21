import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import type { User, AuthTokens } from '../types/user'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const saveTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem('ev_access_token', tokens.accessToken)
    localStorage.setItem('ev_refresh_token', tokens.refreshToken)
  }, [])

  const clearTokens = useCallback(() => {
    localStorage.removeItem('ev_access_token')
    localStorage.removeItem('ev_refresh_token')
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [clearTokens])

  useEffect(() => {
    const token = localStorage.getItem('ev_access_token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveTokens(data.tokens)
    setUser(data.user)
    return data.user
  }, [saveTokens])

  const loginWithCpf = useCallback(async (cpf: string, password: string) => {
    const { data } = await api.post('/auth/login', { cpf, password })
    saveTokens(data.tokens)
    setUser(data.user)
    return data.user
  }, [saveTokens])

  const register = useCallback(async (name: string, email: string, password: string, cpf?: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, cpf })
    saveTokens(data.tokens)
    setUser(data.user)
    return data.user
  }, [saveTokens])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [clearTokens])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithCpf,
    register,
    logout,
    token: localStorage.getItem('ev_access_token') || '',
  }
}
