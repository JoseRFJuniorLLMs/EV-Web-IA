export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showNotification(title: string, body: string, icon?: string): void {
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: icon || '/ev-icon.svg',
    badge: '/ev-icon.svg',
    tag: 'ev-web',
  })
}

export function notifyChargingComplete(stationName: string, energyKwh: number, cost: number): void {
  showNotification(
    'Carregamento Concluido!',
    `${stationName}: ${energyKwh.toFixed(1)} kWh - R$ ${cost.toFixed(2)}`
  )
}

export function notifyChargingTarget(soc: number): void {
  showNotification(
    `Bateria em ${soc}%`,
    'Seu veiculo atingiu a meta de carregamento.'
  )
}
