import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Battery, User, List, X, ChevronUp } from 'lucide-react'
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
  const [showList, setShowList] = useState(false)
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
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen map */}
      <StationMap
        stations={stations}
        userLat={position?.latitude}
        userLon={position?.longitude}
        onStationClick={handleStationClick}
        className="w-full h-full"
      />

      {/* Top bar - floating */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2.5 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 text-lg">EV-Web</h1>
          <div className="flex items-center gap-2">
            {activeSession && (
              <button onClick={() => navigate('/charging')} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                <Battery className="w-3.5 h-3.5" />
                Carregando
              </button>
            )}
            <button onClick={() => setShowList(!showList)} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/profile')} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active charging mini card */}
      {activeSession && (
        <div className="absolute top-20 left-3 right-3 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3">
            <ChargingMonitor session={activeSession} onStop={() => navigate('/charging')} />
          </div>
        </div>
      )}

      {/* Station list - slide-up panel */}
      {showList && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] max-h-[70vh] bg-white rounded-t-3xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Estacoes ({stations.length})</h2>
            </div>
            <button onClick={() => setShowList(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <StationList
              stations={stations}
              loading={isLoading}
              onStationClick={handleStationClick}
            />
          </div>
        </div>
      )}

      {/* Floating EVA button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001]">
        <EvaVoiceButton status={eva.status} onPress={handleEvaPress} />
        <p className="text-center text-xs text-white mt-2 drop-shadow-lg font-medium">Falar com EVA</p>
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
