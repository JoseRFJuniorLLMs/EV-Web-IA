import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import type { ChargePoint } from '../../types/station'
import { stationName, stationMaxPower, stationIsOnline, stationLat, stationLon } from '../../types/station'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Sort stations into a route (nearest-neighbor greedy path)
function buildRoute(stations: ChargePoint[]): ChargePoint[] {
  if (stations.length <= 1) return [...stations]
  const remaining = [...stations]
  const route: ChargePoint[] = []

  // Start from northernmost station
  remaining.sort((a, b) => stationLat(b) - stationLat(a))
  route.push(remaining.shift()!)

  while (remaining.length > 0) {
    const last = route[route.length - 1]
    let nearestIdx = 0
    let nearestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(stationLat(last), stationLon(last), stationLat(remaining[i]), stationLon(remaining[i]))
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    }
    route.push(remaining.splice(nearestIdx, 1)[0])
  }
  return route
}

// Charging speed classification
function chargingSpeedLabel(powerKw: number): { label: string; color: string; bg: string } {
  if (powerKw >= 150) return { label: 'Ultra Rapido', color: '#7c3aed', bg: '#ede9fe' }
  if (powerKw >= 50) return { label: 'Rapido', color: '#059669', bg: '#d1fae5' }
  return { label: 'Normal', color: '#6b7280', bg: '#f3f4f6' }
}

// Group charge points by location
interface LocationGroup {
  locationId: string
  name: string
  lat: number
  lon: number
  chargePoints: ChargePoint[]
  maxPower: number
  isOnline: boolean
  hasAvailable: boolean
  vendors: string[]
  connectorTypes: string[]
}

function groupByLocation(stations: ChargePoint[]): LocationGroup[] {
  const map = new Map<string, LocationGroup>()
  for (const s of stations) {
    const locId = s.location_id || s.id
    if (!map.has(locId)) {
      map.set(locId, {
        locationId: locId,
        name: stationName(s),
        lat: stationLat(s),
        lon: stationLon(s),
        chargePoints: [],
        maxPower: 0,
        isOnline: false,
        hasAvailable: false,
        vendors: [],
        connectorTypes: [],
      })
    }
    const g = map.get(locId)!
    g.chargePoints.push(s)
    const pw = stationMaxPower(s)
    if (pw > g.maxPower) g.maxPower = pw
    if (stationIsOnline(s)) g.isOnline = true
    if (s.connectors?.some(c => c.status === 'Available')) g.hasAvailable = true
    if (s.vendor && !g.vendors.includes(s.vendor)) g.vendors.push(s.vendor)
    for (const c of s.connectors ?? []) {
      if (c.type && !g.connectorTypes.includes(c.type)) g.connectorTypes.push(c.type)
    }
  }
  return Array.from(map.values())
}

// Via Verde Electric style station card icon
function createStationCardIcon(group: LocationGroup) {
  const speed = chargingSpeedLabel(group.maxPower)
  const vendorText = group.vendors.slice(0, 2).join(' / ')
  const numPoints = group.chargePoints.length
  const connText = group.connectorTypes.slice(0, 3).join(' | ')

  let statusDot = '#ef4444'
  if (group.isOnline && group.hasAvailable) statusDot = '#10b981'
  else if (group.isOnline) statusDot = '#f59e0b'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:white;
        border-radius:12px;
        box-shadow:0 4px 20px rgba(0,0,0,0.15);
        padding:10px 14px;
        min-width:180px;
        max-width:220px;
        cursor:pointer;
        transform:translate(-50%,-100%);
        border-left:4px solid ${statusDot};
        font-family:system-ui,-apple-system,sans-serif;
      ">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${statusDot};flex-shrink:0;"></div>
          <div style="font-size:13px;font-weight:700;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${group.name}
          </div>
        </div>
        <div style="font-size:10px;color:#6b7280;margin-bottom:6px;">${vendorText}</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="
            background:${speed.bg};
            color:${speed.color};
            padding:2px 8px;
            border-radius:10px;
            font-size:10px;
            font-weight:600;
          ">${speed.label}</span>
          <span style="font-size:11px;font-weight:700;color:#111;">${group.maxPower} kW</span>
          <span style="font-size:10px;color:#9ca3af;">${numPoints} pt${numPoints > 1 ? 's' : ''}</span>
        </div>
        <div style="font-size:9px;color:#9ca3af;margin-top:4px;">${connText}</div>
        <div style="
          position:absolute;
          bottom:-8px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:8px solid white;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

// Distance label marker
function createDistanceIcon(distKm: number) {
  const label = distKm >= 1 ? `${distKm.toFixed(1)} km` : `${Math.round(distKm * 1000)} m`
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:#16a34a;
        color:white;
        padding:3px 10px;
        border-radius:12px;
        font-size:11px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
        transform:translate(-50%,-50%);
        font-family:system-ui,-apple-system,sans-serif;
      ">
        ${label}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function FitBounds({ groups, userLat, userLon }: { groups: LocationGroup[]; userLat?: number; userLon?: number }) {
  const map = useMap()

  useEffect(() => {
    const points: [number, number][] = []
    if (userLat && userLon) points.push([userLat, userLon])
    groups.forEach(g => {
      if (g.lat && g.lon) points.push([g.lat, g.lon])
    })
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 14 })
    } else if (points.length === 1) {
      map.setView(points[0], 13)
    }
  }, [map, groups, userLat, userLon])

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

  // Group stations by location
  const groups = useMemo(() => groupByLocation(validStations), [validStations])

  // Build route path through locations
  const routeGroups = useMemo(() => {
    if (groups.length <= 1) return groups
    // Build route using charge points, then map back to groups
    const routeStations = buildRoute(groups.map(g => g.chargePoints[0]))
    return routeStations.map(s => {
      const locId = s.location_id || s.id
      return groups.find(g => g.locationId === locId)!
    }).filter(Boolean)
  }, [groups])

  // Route polyline coordinates
  const routeCoords = useMemo(
    () => routeGroups.map(g => [g.lat, g.lon] as [number, number]),
    [routeGroups]
  )

  // Distance segments (midpoints with distance labels)
  const distanceSegments = useMemo(() => {
    const segs: { lat: number; lon: number; dist: number }[] = []
    for (let i = 0; i < routeGroups.length - 1; i++) {
      const a = routeGroups[i]
      const b = routeGroups[i + 1]
      const dist = haversineKm(a.lat, a.lon, b.lat, b.lon)
      segs.push({
        lat: (a.lat + b.lat) / 2,
        lon: (a.lon + b.lon) / 2,
        dist,
      })
    }
    return segs
  }, [routeGroups])

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={className || 'w-full h-full'}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds groups={routeGroups} userLat={userLat} userLon={userLon} />

      {/* Green route polyline */}
      {routeCoords.length > 1 && (
        <>
          {/* Shadow line */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#000',
              weight: 7,
              opacity: 0.1,
            }}
          />
          {/* Main green route */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#16a34a',
              weight: 4,
              opacity: 0.9,
              dashArray: '12, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </>
      )}

      {/* Distance labels on route segments */}
      {distanceSegments.map((seg, i) => (
        <Marker
          key={`dist-${i}`}
          position={[seg.lat, seg.lon]}
          icon={createDistanceIcon(seg.dist)}
          interactive={false}
        />
      ))}

      {/* User location marker */}
      {userLat && userLon && (
        <Marker position={[userLat, userLon]} icon={L.divIcon({
          className: '',
          html: `<div style="
            background:#3b82f6;
            width:18px;height:18px;
            border-radius:50%;
            border:3px solid white;
            box-shadow:0 0 0 3px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })} />
      )}

      {/* Via Verde style station cards */}
      {routeGroups.map((group) => (
        <Marker
          key={group.locationId}
          position={[group.lat, group.lon]}
          icon={createStationCardIcon(group)}
          eventHandlers={{
            click: () => onStationClick?.(group.chargePoints[0]),
          }}
        />
      ))}
    </MapContainer>
  )
}
