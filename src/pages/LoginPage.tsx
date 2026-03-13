import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function LoginPage() {
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const isVisitor = cpf.replace(/\D/g, '') === '00000000000'

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) {
      setError('CPF deve ter 11 digitos.')
      return
    }

    setLoading(true)
    try {
      const pwd = cleanCPF === '00000000000' ? 'visitante' : password
      await login(cleanCPF, pwd)
      navigate('/')
    } catch {
      setError('CPF ou senha invalidos. Tente novamente.')
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCPFChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />

          {!isVisitor && (
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Sem CPF cadastrado? Digite{' '}
          <span className="font-mono font-medium text-gray-500">000.000.000-00</span>
          {' '}para entrar como visitante.
        </p>

        <p className="text-center text-sm text-gray-500 mt-4">
          Nao tem conta?{' '}
          <Link to="/register" className="text-emerald-600 font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
