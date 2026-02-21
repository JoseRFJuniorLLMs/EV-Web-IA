import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Battery, User, List, Map } from 'lucide-react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useNearbyStations } from '../hooks/useStations'
import { useActiveSession } from '../hooks/useCharging'
import { useEvaSession } from '../hooks/useEvaSession'
import { useAuth } from '../hooks/useAuth'
import { StationMap } from '../components/station/StationMap'
import { StationList } from '../components/station/StationList'
import { EvaVoiceButton } from '../components/eva/EvaVoiceButton'
import { EvaSessionOverlay } from '../components/eva/EvaSessionOverlay'
import { ChargingMonitor } from '../components/charging/ChargingMonitor'
import type { ChargePoint } from '../types/station'

export function HomePage() {
  const [view, setView] = useState<'map' | 'list'>('map')
  const { position } = useGeolocation()
  const { data: stations = [], isLoading } = useNearbyStations(position?.latitude, position?.longitude)
  const { data: activeSession } = useActiveSession()
  const { token } = useAuth()
  const navigate = useNavigate()

  const eva = useEvaSession(token)
  const [showEva, setShowEva] = useState(false)

  const handleStationClick = (station: ChargePoint) => {
    navigate(`/station/${station.id}`)
  }

  const handleEvaPress = () => {
    setShowEva(true)
    if (eva.status === 'idle') eva.start()
  }

  const handleEvaClose = () => {
    eva.stop()
    setShowEva(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">EV-Web</h1>
            {position && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>Estacoes proximas</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeSession && (
              <button onClick={() => navigate('/charging')} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                <Battery className="w-3.5 h-3.5" />
                Carregando
              </button>
            )}
            <button onClick={() => navigate('/profile')} className="p-2 text-gray-500 hover:text-gray-700">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <button
          onClick={() => setView('map')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'map' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'
          }`}
        >
          <Map className="w-4 h-4" /> Mapa
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500'
          }`}
        >
          <List className="w-4 h-4" /> Lista
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24">
        {view === 'map' ? (
          <div className="h-[60vh] rounded-2xl overflow-hidden shadow-sm">
            <StationMap
              stations={stations}
              userLat={position?.latitude}
              userLon={position?.longitude}
              onStationClick={handleStationClick}
            />
          </div>
        ) : (
          <StationList
            stations={stations}
            loading={isLoading}
            onStationClick={handleStationClick}
          />
        )}

        {activeSession && (
          <div className="mt-4">
            <ChargingMonitor session={activeSession} onStop={() => navigate('/charging')} />
          </div>
        )}
      </div>

      {/* Floating EVA button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <EvaVoiceButton status={eva.status} onPress={handleEvaPress} />
        <p className="text-center text-xs text-gray-500 mt-2">Falar com EVA</p>
      </div>

      {/* EVA overlay */}
      {showEva && (
        <EvaSessionOverlay
          status={eva.status}
          messages={eva.messages}
          isSpeaking={eva.isSpeaking}
          waveCanvasRef={eva.waveCanvasRef}
          error={eva.error}
          onStop={handleEvaClose}
          onStart={eva.start}
          onSendText={eva.sendText}
        />
      )}
    </div>
  )
}
