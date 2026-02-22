import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useActiveSession, useStopCharging } from '../hooks/useCharging'
import { ChargingMonitor } from '../components/charging/ChargingMonitor'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function ChargingPage() {
  const navigate = useNavigate()
  const { data: session, isLoading } = useActiveSession()
  const stopCharging = useStopCharging()

  const handleStop = async () => {
    if (!session) return
    await stopCharging.mutateAsync(session.transaction_id)
  }

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <p className="text-gray-500">Nenhum carregamento ativo</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 font-medium text-sm">
          Voltar ao mapa
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900">Carregamento</h1>
        </div>
      </header>
      <div className="px-4 py-4">
        <ChargingMonitor session={session} onStop={handleStop} />
      </div>
    </div>
  )
}
