import { Zap, Clock, DollarSign, Battery } from 'lucide-react'
import type { ChargingSession } from '../../types/transaction'
import { formatKwh, formatPower, formatDuration, formatCurrency } from '../../utils/formatters'

interface ChargingStatsProps {
  session: ChargingSession
}

export function ChargingStats({ session }: ChargingStatsProps) {
  const stats = [
    { icon: <Battery className="w-4 h-4" />, label: 'Energia', value: formatKwh(session.energyKwh), color: 'text-emerald-600' },
    { icon: <Zap className="w-4 h-4" />, label: 'Potencia', value: formatPower(session.powerKw), color: 'text-amber-600' },
    { icon: <Clock className="w-4 h-4" />, label: 'Tempo', value: formatDuration(session.elapsedMinutes), color: 'text-blue-600' },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Custo', value: formatCurrency(session.cost), color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
          <div className={`flex items-center gap-1.5 ${stat.color}`}>
            {stat.icon}
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
          <p className="font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
      {session.estimatedMinutesLeft > 0 && (
        <div className="col-span-2 bg-emerald-50 rounded-xl p-3 text-center">
          <span className="text-sm text-emerald-700">
            Estimativa: {formatDuration(session.estimatedMinutesLeft)} restantes
          </span>
        </div>
      )}
    </div>
  )
}
