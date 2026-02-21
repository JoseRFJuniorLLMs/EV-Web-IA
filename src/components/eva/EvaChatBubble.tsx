import type { SessionMessage } from '../../types/voice'
import { Zap, User } from 'lucide-react'

interface EvaChatBubbleProps {
  message: SessionMessage
}

export function EvaChatBubble({ message }: EvaChatBubbleProps) {
  const isEva = message.role === 'eva'

  return (
    <div className={`flex gap-2 ${isEva ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isEva ? 'bg-emerald-100' : 'bg-gray-100'}`}>
        {isEva ? <Zap className="w-4 h-4 text-emerald-600" /> : <User className="w-4 h-4 text-gray-600" />}
      </div>
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isEva ? 'bg-emerald-50 text-gray-800 rounded-tl-sm' : 'bg-gray-100 text-gray-800 rounded-tr-sm'
      }`}>
        {message.text}
      </div>
    </div>
  )
}
