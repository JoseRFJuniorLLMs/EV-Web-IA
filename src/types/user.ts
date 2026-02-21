export interface User {
  id: string
  name: string
  email: string
  cpf?: string
  phone?: string
  role: 'user' | 'operator' | 'admin'
  avatarUrl?: string
  vehicles: Vehicle[]
  wallet: Wallet
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
  expiresAt: number
}
