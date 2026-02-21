export interface Connector {
  id: number
  type: 'CCS' | 'CHAdeMO' | 'Type2' | 'Type1'
  status: 'Available' | 'Occupied' | 'Faulted' | 'Unavailable'
  maxPowerKw: number
  currentPowerKw?: number
}

export interface ChargePoint {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  status: 'Online' | 'Offline' | 'Faulted'
  connectors: Connector[]
  pricePerKwh: number
  operator: string
  distance?: number
  rating?: number
}

export interface StationFilter {
  connectorType?: string
  maxDistance?: number
  minPower?: number
  available?: boolean
}
