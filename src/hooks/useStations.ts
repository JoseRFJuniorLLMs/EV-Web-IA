import { useQuery, keepPreviousData } from '@tanstack/react-query'
import api from '../services/api'
import type { ChargePoint } from '../types/station'

export function useNearbyStations(lat?: number, lon?: number, radius = 50) {
  return useQuery<ChargePoint[]>({
    queryKey: ['stations', 'nearby', lat, lon, radius],
    queryFn: async () => {
      if (lat != null && lon != null) {
        const { data } = await api.get('/devices/nearby', {
          params: { lat, lon, radius },
        })
        return data ?? []
      }
      // Fallback: load all stations when geolocation is unavailable
      const { data } = await api.get('/devices')
      return data ?? []
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
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
