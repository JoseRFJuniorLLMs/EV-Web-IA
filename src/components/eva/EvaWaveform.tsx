import type { RefObject } from 'react'

interface EvaWaveformProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  active: boolean
}

export function EvaWaveform({ canvasRef, active }: EvaWaveformProps) {
  return (
    <div className={`w-full h-16 rounded-xl overflow-hidden transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
