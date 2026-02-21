export interface Connector {
  id: number
  charge_point_id: string
  connector_id: number
  type: string
  status: 'Available' | 'Occupied' | 'Faulted' | 'Unavailable'
  max_power_kw: number
}

export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  country: string
}

export interface ChargePoint {
  id: string
  vendor: string
  model: string
  serial_number: string
  firmware_version: string
  status: 'Available' | 'Occupied' | 'Faulted' | 'Unavailable' | 'Charging'
  location_id: string
  location?: Location
  connectors: Connector[]
  last_heartbeat: string
  created_at: string
  updated_at: string
}

export interface StationFilter {
  connectorType?: string
  maxDistance?: number
  minPower?: number
  available?: boolean
}

// Helper functions
export function stationName(cp: ChargePoint): string {
  return cp.location?.name || `${cp.vendor} ${cp.model}`
}

export function stationAddress(cp: ChargePoint): string {
  return cp.location?.address || ''
}

export function stationLat(cp: ChargePoint): number {
  return cp.location?.latitude ?? 0
}

export function stationLon(cp: ChargePoint): number {
  return cp.location?.longitude ?? 0
}

export function stationMaxPower(cp: ChargePoint): number {
  if (!cp.connectors?.length) return 0
  return Math.max(...cp.connectors.map(c => c.max_power_kw))
}

export function stationIsOnline(cp: ChargePoint): boolean {
  return cp.status === 'Available' || cp.status === 'Occupied' || cp.status === 'Charging'
}
