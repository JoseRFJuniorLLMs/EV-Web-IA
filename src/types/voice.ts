export type MessageType = 'audio' | 'text' | 'status' | 'ui_action' | 'config'

export interface VoiceMessage {
  type: MessageType
  data?: string
  text?: string
  action?: string
}

export interface SessionMessage {
  id: string
  role: 'user' | 'eva'
  text: string
  timestamp: number
}

export interface ToolCall {
  name: string
  params: Record<string, unknown>
}

export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error'

export interface EvaSessionState {
  status: SessionStatus
  messages: SessionMessage[]
  isListening: boolean
  isSpeaking: boolean
  error?: string
}
