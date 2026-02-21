import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [mode, setMode] = useState<'email' | 'cpf'>('email')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithCpf } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'email') {
        await login(email, password)
      } else {
        await loginWithCpf(cpf, password)
      }
      navigate('/')
    } catch {
      setError('Credenciais invalidas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">EV-Web</h1>
          <p className="text-gray-500 text-sm mt-1">Carregamento inteligente por voz</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setMode('cpf')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'cpf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            CPF
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'email' ? (
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          ) : (
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          )}

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nao tem conta?{' '}
          <a href="/register" className="text-emerald-600 font-medium hover:underline">Criar conta</a>
        </p>
      </div>
    </div>
  )
}
