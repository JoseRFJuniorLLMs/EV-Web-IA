export interface Transaction {
  id: string
  chargePointId: string
  chargePointName: string
  connectorId: number
  userId: string
  status: 'Active' | 'Completed' | 'Failed' | 'Stopped'
  startTime: string
  endTime?: string
  energyKwh: number
  cost: number
  currency: string
  paymentMethod?: string
  meterValues: MeterValue[]
}

export interface MeterValue {
  timestamp: string
  powerKw: number
  energyKwh: number
  soc?: number
  temperature?: number
}

export interface ChargingSession {
  transactionId: string
  chargePointName: string
  connectorType: string
  status: 'Active' | 'Completed'
  soc: number
  targetSoc: number
  energyKwh: number
  powerKw: number
  cost: number
  elapsedMinutes: number
  estimatedMinutesLeft: number
}
