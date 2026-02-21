import type { VoiceMessage } from '../types/voice'

type MessageHandler = (msg: VoiceMessage) => void

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]

export class EVWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private handlers: MessageHandler[] = []
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false

  constructor(path: string) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsBase = import.meta.env.VITE_WS_URL || `${proto}//${window.location.host}/ev-ws`
    this.url = `${wsBase}${path}`
  }

  connect(token: string): void {
    this.intentionalClose = false
    this.ws = new WebSocket(`${this.url}?token=${token}`)

    this.ws.onopen = () => {
      this.reconnectAttempt = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: VoiceMessage = JSON.parse(event.data)
        this.handlers.forEach((h) => h(msg))
      } catch { /* ignore malformed */ }
    }

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.attemptReconnect(token)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempt >= RECONNECT_DELAYS.length) return
    const delay = RECONNECT_DELAYS[this.reconnectAttempt]
    this.reconnectAttempt++
    this.reconnectTimer = setTimeout(() => this.connect(token), delay)
  }

  send(msg: VoiceMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  sendAudio(base64Data: string): void {
    this.send({ type: 'audio', data: base64Data })
  }

  sendText(text: string): void {
    this.send({ type: 'text', text })
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler)
    }
  }

  disconnect(): void {
    this.intentionalClose = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.handlers = []
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
