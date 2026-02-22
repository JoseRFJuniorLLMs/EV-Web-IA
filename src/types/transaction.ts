export interface Transaction {
  id: string
  charge_point_id: string
  connector_id: number
  user_id: string
  status: 'Started' | 'Completed' | 'Faulted' | 'Stopped'
  start_time: string
  end_time?: string
  meter_start: number
  meter_stop: number
  total_energy: number
  cost: number
}

export interface MeterValue {
  timestamp: string
  power_kw: number
  energy_kwh: number
  soc?: number
}

export interface ChargingSession {
  transactionId: string
  chargePointName: string
  connectorType: string
  status: 'Started' | 'Completed'
  soc: number
  targetSoc: number
  energyKwh: number
  powerKw: number
  cost: number
  elapsedMinutes: number
  estimatedMinutesLeft: number
}
