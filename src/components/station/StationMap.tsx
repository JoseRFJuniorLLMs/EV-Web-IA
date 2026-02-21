import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { ChargePoint } from '../../types/station'
import { formatCurrency, formatDistance } from '../../utils/formatters'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons in Leaflet + Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const availableIcon = L.divIcon({
  className: '',
  html: '<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const occupiedIcon = L.divIcon({
  className: '',
  html: '<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const offlineIcon = L.divIcon({
  className: '',
  html: '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

L.Marker.prototype.options.icon = defaultIcon

function getStationIcon(station: ChargePoint) {
  const hasAvailable = station.connectors.some(c => c.status === 'Available')
  if (station.status === 'Offline') return offlineIcon
  if (hasAvailable) return availableIcon
  return occupiedIcon
}

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lon], 14) }, [map, lat, lon])
  return null
}

interface StationMapProps {
  stations: ChargePoint[]
  userLat?: number
  userLon?: number
  onStationClick?: (station: ChargePoint) => void
}

export function StationMap({ stations, userLat, userLon, onStationClick }: StationMapProps) {
  const center: [number, number] = userLat && userLon ? [userLat, userLon] : [-23.55, -46.63]

  return (
    <MapContainer center={center} zoom={14} className="w-full h-full rounded-2xl" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLat && userLon && <RecenterMap lat={userLat} lon={userLon} />}
      {userLat && userLon && (
        <Marker position={[userLat, userLon]} icon={L.divIcon({
          className: '',
          html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3b82f6"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}>
          <Popup>Voce esta aqui</Popup>
        </Marker>
      )}
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={getStationIcon(station)}
          eventHandlers={{ click: () => onStationClick?.(station) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{station.name}</p>
              <p className="text-gray-500">{station.address}</p>
              <p className="text-emerald-600 font-medium">{formatCurrency(station.pricePerKwh)}/kWh</p>
              {station.distance != null && <p className="text-gray-400">{formatDistance(station.distance)}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
