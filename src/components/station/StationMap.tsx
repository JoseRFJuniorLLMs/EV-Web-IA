import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import type { ChargePoint } from '../../types/station'
import { stationName, stationAddress, stationMaxPower, stationIsOnline, stationLat, stationLon } from '../../types/station'
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
L.Marker.prototype.options.icon = defaultIcon

function createStationIcon(station: ChargePoint) {
  const maxPower = stationMaxPower(station)
  const online = stationIsOnline(station)
  const hasAvailable = station.connectors?.some(c => c.status === 'Available')

  let bgColor = '#ef4444' // red - offline
  if (online && hasAvailable) {
    bgColor = '#10b981' // emerald - available
  } else if (online) {
    bgColor = '#f59e0b' // amber - occupied
  }

  const label = maxPower >= 50 ? `${maxPower}kW` : `${maxPower}`

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${bgColor};
        color:#fff;
        padding:4px 8px;
        border-radius:20px;
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        border:2px solid white;
        display:flex;
        align-items:center;
        gap:3px;
        cursor:pointer;
        transform:translate(-50%,-50%);
      ">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        ${label}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function FitBounds({ stations, userLat, userLon }: { stations: ChargePoint[]; userLat?: number; userLon?: number }) {
  const map = useMap()

  useEffect(() => {
    const points: [number, number][] = []
    if (userLat && userLon) points.push([userLat, userLon])
    stations.forEach(s => {
      const lat = stationLat(s)
      const lon = stationLon(s)
      if (lat && lon) points.push([lat, lon])
    })
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
    } else if (points.length === 1) {
      map.setView(points[0], 14)
    }
  }, [map, stations, userLat, userLon])

  return null
}

interface StationMapProps {
  stations: ChargePoint[]
  userLat?: number
  userLon?: number
  onStationClick?: (station: ChargePoint) => void
  className?: string
}

export function StationMap({ stations, userLat, userLon, onStationClick, className }: StationMapProps) {
  const center: [number, number] = userLat && userLon ? [userLat, userLon] : [-23.55, -46.63]

  const validStations = useMemo(
    () => stations.filter(s => stationLat(s) !== 0 && stationLon(s) !== 0),
    [stations]
  )

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={className || 'w-full h-full'}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds stations={validStations} userLat={userLat} userLon={userLon} />

      {/* User location marker */}
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

      {/* Station markers - Google Flights style */}
      {validStations.map((station) => (
        <Marker
          key={station.id}
          position={[stationLat(station), stationLon(station)]}
          icon={createStationIcon(station)}
          eventHandlers={{ click: () => onStationClick?.(station) }}
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <p className="font-bold text-gray-900">{stationName(station)}</p>
              <p className="text-gray-500 text-xs mt-0.5">{stationAddress(station)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-emerald-600 font-semibold">{stationMaxPower(station)} kW</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{station.vendor}</span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {station.connectors?.map(c => (
                  <span key={c.id} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    c.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.type}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
