export interface User {
  id: string
  name: string
  email: string
  document?: string
  role: 'user' | 'operator' | 'admin'
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  batteryCapacityKwh: number
  connectorType: string
  licensePlate: string
}

export interface Wallet {
  balance: number
  currency: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
