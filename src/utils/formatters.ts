export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`
}

export function formatPower(kw: number): string {
  return `${kw.toFixed(1)} kW`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatSoc(soc: number): string {
  return `${Math.round(soc)}%`
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'agora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min atras`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atras`
  return `${Math.floor(seconds / 86400)}d atras`
}
