import { useState, useCallback, useRef, useEffect } from 'react'
import { EVWebSocket } from '../services/websocket'
import { useAudioEngine } from './useAudioEngine'
import type { SessionMessage, SessionStatus, VoiceMessage } from '../types/voice'

let msgId = 0

export function useEvaSession(token: string) {
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [subtitleText, setSubtitleText] = useState('')
  const [error, setError] = useState<string>()
  const wsRef = useRef<EVWebSocket | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const activeRef = useRef(false)

  const audio = useAudioEngine()

  const addMessage = useCallback((role: 'user' | 'eva', text: string) => {
    setMessages((prev) => [...prev, { id: String(++msgId), role, text, timestamp: Date.now() }])
  }, [])

  // Called ONLY after the server sends status:'ready' — same pattern as Malaria project
  const startAudioCapture = useCallback(() => {
    const micStream = micStreamRef.current
    const ws = wsRef.current
    if (!micStream || !ws) return

    audio.setupMicCapture(micStream, (blob) => {
      ws.sendAudio(blob.data)
    })
  }, [audio])

  const handleMessage = useCallback((msg: VoiceMessage) => {
    switch (msg.type) {
      case 'status':
        if (msg.text === 'ready') {
          // Server is ready — NOW start audio capture (critical: must wait for this)
          if (!activeRef.current) {
            activeRef.current = true
            startAudioCapture()
          }
          setStatus('active')
        } else if (msg.text === 'interrupted') {
          audio.handleInterrupted()
        } else if (msg.text === 'turn_complete') {
          // Save current subtitle as a message before clearing (like Malaria)
          setTimeout(() => {
            audio.setIsSpeaking(false)
            setSubtitleText((prev) => {
              if (prev.trim()) {
                addMessage('eva', prev.trim())
              }
              return ''
            })
          }, 500)
        } else if (msg.text === 'reconnecting') {
          setStatus('connecting')
          audio.handleInterrupted()
        } else if (msg.text?.startsWith('error')) {
          setError(msg.data || msg.text)
          setStatus('error')
        }
        break
      case 'audio':
        if (msg.data) audio.playAudioChunk(msg.data)
        break
      case 'text':
        if (msg.text) {
          if (msg.data === 'user') {
            // User speech transcription from server
            addMessage('user', msg.text)
          } else {
            // EVA response text — show as live subtitle (saved on turn_complete)
            setSubtitleText(msg.text)
          }
        }
        break
      case 'ui_action':
        // handled by parent via onUiAction callback
        break
    }
  }, [audio, addMessage, startAudioCapture])

  const start = useCallback(async () => {
    if (status !== 'idle') return
    if (!token) { setError('Autenticacao necessaria'); setStatus('error'); return }
    setStatus('connecting')
    setMessages([])
    setSubtitleText('')
    setError(undefined)
    activeRef.current = false

    try {
      // Init audio (create AudioContext, load worklet, get mic)
      const micStream = await audio.initAudio()
      micStreamRef.current = micStream

      // Connect WebSocket — sends config with token on open
      const ws = new EVWebSocket('/ws/ev')
      wsRef.current = ws
      ws.onMessage(handleMessage)
      ws.connect(token)

      // Do NOT start audio capture yet — wait for 'ready' status from server
      // (startAudioCapture will be called from handleMessage when status='ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setStatus('error')
    }
  }, [status, token, audio, handleMessage])

  const stop = useCallback(() => {
    activeRef.current = false
    audio.cleanupAudio()
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
    wsRef.current?.disconnect()
    wsRef.current = null
    setStatus('idle')
    setSubtitleText('')
  }, [audio])

  const sendText = useCallback((text: string) => {
    if (!text.trim()) return
    addMessage('user', text)
    wsRef.current?.sendText(text)
  }, [addMessage])

  useEffect(() => {
    return () => {
      activeRef.current = false
      audio.cleanupAudio()
      wsRef.current?.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    status,
    messages,
    subtitleText,
    error,
    isSpeaking: audio.isSpeaking,
    waveCanvasRef: audio.waveCanvasRef,
    start,
    stop,
    sendText,
  }
}
