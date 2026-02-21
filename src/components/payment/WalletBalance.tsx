import { Wallet } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

interface WalletBalanceProps {
  balance: number
  currency?: string
  onAddFunds?: () => void
}

export function WalletBalance({ balance, currency = 'BRL', onAddFunds }: WalletBalanceProps) {
  return (
    <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm">Saldo disponivel</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(balance, currency)}</p>
        </div>
        <Wallet className="w-10 h-10 text-emerald-200" />
      </div>
      {onAddFunds && (
        <button
          onClick={onAddFunds}
          className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors"
        >
          Adicionar Saldo
        </button>
      )}
    </div>
  )
}
