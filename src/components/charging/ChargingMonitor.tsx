import type { ChargingSession } from '../../types/transaction'
import { formatCurrency, formatKwh } from '../../utils/formatters'
import { ChargingStats } from './ChargingStats'

interface ChargingMonitorProps {
  session: ChargingSession
  onStop?: () => void
}

export function ChargingMonitor({ session, onStop }: ChargingMonitorProps) {
  const progress = session.targetSoc > 0 ? (session.soc / session.targetSoc) * 100 : session.soc
  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference - (progress / 100) * circumference

  return (
    <div className="card">
      <div className="text-center mb-4">
        <h3 className="font-bold text-gray-900">{session.chargePointName}</h3>
        <span className="text-xs text-gray-500">{session.connectorType}</span>
      </div>

      {/* Circular progress */}
      <div className="relative w-36 h-36 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="#10b981" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{Math.round(session.soc)}%</span>
          <span className="text-xs text-gray-500">de {session.targetSoc}%</span>
        </div>
      </div>

      <ChargingStats session={session} />

      {session.status === 'Started' && onStop && (
        <button
          onClick={onStop}
          className="w-full mt-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
        >
          Parar Carregamento
        </button>
      )}

      {session.status === 'Completed' && (
        <div className="mt-4 text-center py-3 bg-emerald-50 rounded-xl">
          <p className="text-emerald-700 font-semibold">Carregamento concluido!</p>
          <p className="text-sm text-emerald-600 mt-1">Total: {formatCurrency(session.cost)} | {formatKwh(session.energyKwh)}</p>
        </div>
      )}
    </div>
  )
}
