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
      } catch (err: unknown) {
        // 404 = no active session (normal state) — return null silently
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) return null
        // Other errors: rethrow so React Query can handle retries
        throw err
      }
    },
    // Only poll every 5s when there IS an active session; otherwise stop polling
    refetchInterval: (query) => (query.state.data ? 5000 : false),
    retry: 1,
    retryDelay: 10000,
    staleTime: 4000,
  })
}

export function useStartCharging() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { device_id: string; connector_id: number }) => {
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
      const { data } = await api.get('/transactions/history')
      return data ?? []
    },
  })
}
