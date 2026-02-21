import { CreditCard, Wallet } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { formatCurrency } from '../../utils/formatters'

interface PaymentSheetProps {
  open: boolean
  onClose: () => void
  amount: number
  walletBalance: number
  onPayWithWallet: () => void
  onPayWithCard: () => void
}

export function PaymentSheet({ open, onClose, amount, walletBalance, onPayWithWallet, onPayWithCard }: PaymentSheetProps) {
  const canPayWithWallet = walletBalance >= amount

  return (
    <Modal open={open} onClose={onClose} title="Pagamento">
      <div className="space-y-4">
        <div className="text-center py-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
        </div>

        <button
          onClick={onPayWithWallet}
          disabled={!canPayWithWallet}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Carteira EV</p>
            <p className="text-sm text-gray-500">Saldo: {formatCurrency(walletBalance)}</p>
          </div>
          {canPayWithWallet && <span className="text-xs text-emerald-600 font-medium">Recomendado</span>}
        </button>

        <button
          onClick={onPayWithCard}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Cartao de Credito</p>
            <p className="text-sm text-gray-500">Visa, Mastercard, Elo</p>
          </div>
        </button>
      </div>
    </Modal>
  )
}
