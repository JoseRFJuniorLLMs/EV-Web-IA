import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Wallet, History, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    { icon: <Zap className="w-5 h-5" />, label: 'Estacoes', path: '/' },
    { icon: <History className="w-5 h-5" />, label: 'Historico', path: '/history' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Carteira', path: '/wallet' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900">Perfil</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name || 'Usuario'}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.document && <p className="text-gray-400 text-xs mt-0.5">CPF: {user.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-500">{item.icon}</span>
              <span className="font-medium text-gray-900">{item.label}</span>
            </button>
          ))}
        </div>

        <hr className="my-4 border-gray-200" />

        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}
