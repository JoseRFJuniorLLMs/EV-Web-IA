import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { EvaVoiceButton } from './EvaVoiceButton'
import { EvaWaveform } from './EvaWaveform'
import { EvaChatBubble } from './EvaChatBubble'
import type { SessionMessage, SessionStatus } from '../../types/voice'
import type { RefObject } from 'react'

interface EvaSessionOverlayProps {
  status: SessionStatus
  messages: SessionMessage[]
  subtitleText: string
  isSpeaking: boolean
  waveCanvasRef: RefObject<HTMLCanvasElement | null>
  error?: string
  onStop: () => void
  onStart: () => void
  onSendText: (text: string) => void
}

export function EvaSessionOverlay({
  status,
  messages,
  subtitleText,
  isSpeaking,
  waveCanvasRef,
  error,
  onStop,
  onStart,
  onSendText,
}: EvaSessionOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, subtitleText])

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = inputRef.current?.value.trim()
    if (val) {
      onSendText(val)
      inputRef.current!.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            isActive
              ? isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'
              : isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'
          }`} />
          <span className="font-semibold text-gray-900">EVA</span>
          <span className="text-xs text-gray-400">
            {isConnecting ? 'Conectando...'
              : isActive ? (isSpeaking ? 'Falando...' : 'Ouvindo...')
              : status === 'error' ? 'Erro' : ''}
          </span>
        </div>
        <button onClick={onStop} className="p-2 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Waveform */}
      <div className="px-4 py-2 bg-gray-50">
        <EvaWaveform canvasRef={waveCanvasRef} active={isActive || isConnecting} />
        <p className="text-center text-xs mt-1" style={{ color: isSpeaking ? '#10b981' : '#9ca3af' }}>
          {isConnecting ? 'Conectando ao EVA...'
            : isSpeaking ? 'EVA esta falando...'
            : isActive ? 'Ouvindo...' : ''}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !subtitleText && status === 'active' && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Diga algo para a EVA...
          </p>
        )}
        {messages.map((msg) => (
          <EvaChatBubble key={msg.id} message={msg} />
        ))}

        {/* Live subtitle — EVA's response being spoken in real-time */}
        {subtitleText && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100">
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-emerald-50 text-gray-800 border border-emerald-100">
              {subtitleText}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1.5 align-middle" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm py-2">{error}</div>
        )}
      </div>

      {/* Bottom: Voice button + text input */}
      <div className="border-t border-gray-100 px-4 py-4 bg-white">
        <div className="flex items-center gap-3">
          <EvaVoiceButton
            status={status}
            onPress={isActive ? onStop : onStart}
          />
          {isActive && (
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ou digite aqui..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-emerald-500 text-white px-4 rounded-xl text-sm font-medium hover:bg-emerald-600">
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
