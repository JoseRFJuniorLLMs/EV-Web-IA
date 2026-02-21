import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { ChargePoint } from '../types/station'

export function useNearbyStations(lat?: number, lon?: number, radius = 5) {
  return useQuery<ChargePoint[]>({
    queryKey: ['stations', 'nearby', lat, lon, radius],
    queryFn: async () => {
      const { data } = await api.get('/devices/nearby', {
        params: { lat, lon, radius },
      })
      return data
    },
    enabled: lat != null && lon != null,
    staleTime: 30000,
  })
}

export function useStation(id: string) {
  return useQuery<ChargePoint>({
    queryKey: ['station', id],
    queryFn: async () => {
      const { data } = await api.get(`/devices/${id}`)
      return data
    },
    enabled: !!id,
  })
}
