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
  transaction_id: string
  charge_point_name: string
  connector_type: string
  status: 'Started' | 'Completed'
  soc: number
  target_soc: number
  energy_kwh: number
  power_kw: number
  cost: number
  elapsed_minutes: number
  estimated_minutes_left: number
}
