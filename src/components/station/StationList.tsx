import { StationCard } from './StationCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { ChargePoint } from '../../types/station'

interface StationListProps {
  stations: ChargePoint[]
  loading?: boolean
  onStationClick?: (station: ChargePoint) => void
}

export function StationList({ stations, loading, onStationClick }: StationListProps) {
  if (loading) {
    return <LoadingSpinner className="py-8" />
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">Nenhuma estacao encontrada</p>
        <p className="text-xs mt-1">Tente aumentar o raio de busca</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          onClick={() => onStationClick?.(station)}
        />
      ))}
    </div>
  )
}
