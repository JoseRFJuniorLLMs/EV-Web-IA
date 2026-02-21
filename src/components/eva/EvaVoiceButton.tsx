import { Mic, MicOff, Zap } from 'lucide-react'
import type { SessionStatus } from '../../types/voice'

interface EvaVoiceButtonProps {
  status: SessionStatus
  onPress: () => void
}

export function EvaVoiceButton({ status, onPress }: EvaVoiceButtonProps) {
  const isActive = status === 'active'
  const isConnecting = status === 'connecting'

  return (
    <button
      onClick={onPress}
      disabled={isConnecting}
      className={`
        relative w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-300 shadow-lg
        ${isActive
          ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
          : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 eva-pulse'
        }
        ${isConnecting ? 'opacity-60 cursor-wait' : ''}
      `}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
      )}
      {isConnecting ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : isActive ? (
        <MicOff className="w-8 h-8 text-white relative z-10" />
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <Mic className="w-7 h-7 text-white" />
          <Zap className="w-3 h-3 text-yellow-300 -mt-0.5" />
        </div>
      )}
    </button>
  )
}
