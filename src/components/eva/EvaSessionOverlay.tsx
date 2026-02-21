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
  }, [messages])

  const isActive = status === 'active'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = inputRef.current?.value.trim()
    if (val) {
      onSendText(val)
      inputRef.current!.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-semibold text-gray-900">EVA</span>
          {isSpeaking && <span className="text-xs text-emerald-600">falando...</span>}
        </div>
        <button onClick={onStop} className="p-2 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Waveform */}
      <div className="px-4 py-2 bg-gray-50">
        <EvaWaveform canvasRef={waveCanvasRef} active={isActive} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && status === 'active' && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Diga algo para a EVA...
          </p>
        )}
        {messages.map((msg) => (
          <EvaChatBubble key={msg.id} message={msg} />
        ))}
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
