import { Plug } from 'lucide-react'
import type { Connector } from '../../types/station'

interface ConnectorCardProps {
  connector: Connector
  selected?: boolean
  onClick?: () => void
}

export function ConnectorCard({ connector, selected, onClick }: ConnectorCardProps) {
  const available = connector.status === 'Available'

  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={`
        card flex items-center gap-3 w-full transition-all
        ${selected ? 'ring-2 ring-emerald-500 border-emerald-200' : ''}
        ${!available ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        available ? 'bg-emerald-100' : 'bg-gray-100'
      }`}>
        <Plug className={`w-5 h-5 ${available ? 'text-emerald-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-900">{connector.type}</p>
        <p className="text-sm text-gray-500">{connector.maxPowerKw} kW max</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        available ? 'bg-emerald-100 text-emerald-700' :
        connector.status === 'Occupied' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>
        {available ? 'Disponivel' : connector.status === 'Occupied' ? 'Em uso' : 'Indisponivel'}
      </span>
    </button>
  )
}
