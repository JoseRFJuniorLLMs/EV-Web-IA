import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Zap } from 'lucide-react'
import { useStation } from '../hooks/useStations'
import { useStartCharging } from '../hooks/useCharging'
import { ConnectorCard } from '../components/charging/ConnectorCard'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { stationName, stationAddress, stationMaxPower } from '../types/station'

export function StationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: station, isLoading } = useStation(id || '')
  const startCharging = useStartCharging()
  const [selectedConnector, setSelectedConnector] = useState<number | null>(null)

  if (isLoading || !station) return <LoadingSpinner className="min-h-screen" />

  const handleStart = async () => {
    if (selectedConnector == null) return
    try {
      await startCharging.mutateAsync({
        chargePointId: station.id,
        connectorId: selectedConnector,
        targetSoc: 80,
      })
      navigate('/charging')
    } catch {
      // error handled by mutation
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900">{stationName(station)}</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="card">
          <div className="flex items-start gap-1 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{stationAddress(station)}</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-emerald-600">
              <Zap className="w-4 h-4" />
              <span className="font-medium">{stationMaxPower(station)} kW</span>
            </div>
            <span className="text-sm text-gray-500">{station.vendor}</span>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Conectores</h2>
          <div className="space-y-2">
            {station.connectors?.map((c) => (
              <ConnectorCard
                key={c.id}
                connector={c}
                selected={selectedConnector === c.id}
                onClick={() => setSelectedConnector(c.id)}
              />
            ))}
          </div>
        </div>

        {selectedConnector != null && (
          <Button
            onClick={handleStart}
            loading={startCharging.isPending}
            className="w-full"
            size="lg"
          >
            Iniciar Carregamento
          </Button>
        )}
      </div>
    </div>
  )
}
