import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type { ChargingSession, Transaction } from '../types/transaction'

export function useActiveSession() {
  return useQuery<ChargingSession | null>({
    queryKey: ['charging', 'active'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/transactions/active')
        return data
      } catch {
        return null
      }
    },
    refetchInterval: 5000,
  })
}

export function useStartCharging() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { chargePointId: string; connectorId: number; targetSoc?: number }) => {
      const { data } = await api.post('/transactions/start', params)
      return data as Transaction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charging', 'active'] })
    },
  })
}

export function useStopCharging() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data } = await api.post(`/transactions/${transactionId}/stop`)
      return data as Transaction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['charging', 'active'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useTransactionHistory() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions')
      return data
    },
  })
}
