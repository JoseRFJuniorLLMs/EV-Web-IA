import { Receipt } from 'lucide-react'
import type { Transaction } from '../../types/transaction'
import { formatCurrency, formatKwh, formatDuration, timeAgo } from '../../utils/formatters'

interface ReceiptCardProps {
  transaction: Transaction
}

export function ReceiptCard({ transaction }: ReceiptCardProps) {
  const duration = transaction.endTime
    ? (new Date(transaction.endTime).getTime() - new Date(transaction.startTime).getTime()) / 60000
    : 0

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{transaction.chargePointName}</p>
            <p className="text-xs text-gray-500">{timeAgo(transaction.startTime)}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          transaction.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          transaction.status === 'Active' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {transaction.status === 'Completed' ? 'Concluido' :
           transaction.status === 'Active' ? 'Ativo' : 'Falhou'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
        <span className="text-gray-500">{formatKwh(transaction.energyKwh)}</span>
        {duration > 0 && <span className="text-gray-500">{formatDuration(duration)}</span>}
        <span className="font-bold text-gray-900">{formatCurrency(transaction.cost)}</span>
      </div>
    </div>
  )
}
