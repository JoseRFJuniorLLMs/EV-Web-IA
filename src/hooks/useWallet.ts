import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type { Wallet } from '../types/user'

export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet')
      return data
    },
  })
}

export function useAddFunds() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { amount: number; paymentMethodId: string }) => {
      const { data } = await api.post('/wallet/deposit', params)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

export function usePayFromWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: { transactionId: string; amount: number }) => {
      const { data } = await api.post('/wallet/pay', params)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
