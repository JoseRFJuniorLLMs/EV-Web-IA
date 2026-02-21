import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTransactionHistory } from '../hooks/useCharging'
import { ReceiptCard } from '../components/payment/ReceiptCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function HistoryPage() {
  const navigate = useNavigate()
  const { data: transactions = [], isLoading } = useTransactionHistory()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900">Historico</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <LoadingSpinner className="py-8" />
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nenhum carregamento realizado</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <ReceiptCard key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
