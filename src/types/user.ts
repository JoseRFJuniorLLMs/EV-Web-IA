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

export interface Wallet {
  balance: number
  currency: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
