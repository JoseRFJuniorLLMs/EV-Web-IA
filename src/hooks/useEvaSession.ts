import { useState, useCallback, useRef, useEffect } from 'react'
import { EVWebSocket } from '../services/websocket'
import { useAudioEngine } from './useAudioEngine'
import type { SessionMessage, SessionStatus, VoiceMessage } from '../types/voice'

let msgId = 0

export function useEvaSession(token: string) {
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [error, setError] = useState<string>()
  const wsRef = useRef<EVWebSocket | null>(null)

  const audio = useAudioEngine()

  const addMessage = useCallback((role: 'user' | 'eva', text: string) => {
    setMessages((prev) => [...prev, { id: String(++msgId), role, text, timestamp: Date.now() }])
  }, [])

  const handleMessage = useCallback((msg: VoiceMessage) => {
    switch (msg.type) {
      case 'audio':
        if (msg.data) audio.playAudioChunk(msg.data)
        break
      case 'text':
        if (msg.text) addMessage('eva', msg.text)
        break
      case 'status':
        if (msg.text === 'interrupted') audio.handleInterrupted()
        if (msg.text === 'turn_complete') audio.setIsSpeaking(false)
        if (msg.text === 'error') setError(msg.data)
        break
      case 'ui_action':
        // handled by parent via onUiAction callback
        break
    }
  }, [audio, addMessage])

  const start = useCallback(async () => {
    if (status !== 'idle') return
    setStatus('connecting')
    setMessages([])
    setError(undefined)

    try {
      const micStream = await audio.initAudio()
      const ws = new EVWebSocket('/ws/ev')
      wsRef.current = ws
      ws.onMessage(handleMessage)
      ws.connect(token)

      audio.setupMicCapture(micStream, (blob) => {
        ws.sendAudio(blob.data)
      })

      setStatus('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setStatus('error')
    }
  }, [status, token, audio, handleMessage])

  const stop = useCallback(() => {
    audio.cleanupAudio()
    wsRef.current?.disconnect()
    wsRef.current = null
    setStatus('idle')
  }, [audio])

  const sendText = useCallback((text: string) => {
    if (!text.trim()) return
    addMessage('user', text)
    wsRef.current?.sendText(text)
  }, [addMessage])

  useEffect(() => {
    return () => {
      audio.cleanupAudio()
      wsRef.current?.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    status,
    messages,
    error,
    isSpeaking: audio.isSpeaking,
    waveCanvasRef: audio.waveCanvasRef,
    start,
    stop,
    sendText,
  }
}
