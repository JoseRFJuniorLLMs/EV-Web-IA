import { MapPin, Zap, Clock } from 'lucide-react'
import type { ChargePoint } from '../../types/station'
import { formatCurrency, formatDistance } from '../../utils/formatters'

interface StationCardProps {
  station: ChargePoint
  onClick?: () => void
}

export function StationCard({ station, onClick }: StationCardProps) {
  const availableConnectors = station.connectors.filter(c => c.status === 'Available')
  const maxPower = Math.max(...station.connectors.map(c => c.maxPowerKw))

  return (
    <button onClick={onClick} className="card w-full text-left hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{station.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{station.address}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          station.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {station.status === 'Online' ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm">
        <div className="flex items-center gap-1 text-emerald-600">
          <Zap className="w-4 h-4" />
          <span className="font-medium">{maxPower} kW</span>
        </div>
        <div className="text-gray-500">
          {formatCurrency(station.pricePerKwh)}/kWh
        </div>
        {station.distance != null && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {formatDistance(station.distance)}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {station.connectors.map((c) => (
          <span key={c.id} className={`px-2 py-0.5 rounded text-xs font-medium ${
            c.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
            c.status === 'Occupied' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {c.type} {c.status === 'Available' ? '' : `(${c.status === 'Occupied' ? 'em uso' : 'indisponivel'})`}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-400 mt-2">
        {availableConnectors.length}/{station.connectors.length} conectores disponiveis
      </div>
    </button>
  )
}
