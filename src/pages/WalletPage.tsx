import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWallet, useAddFunds } from '../hooks/useWallet'
import { useTransactionHistory } from '../hooks/useCharging'
import { WalletBalance } from '../components/payment/WalletBalance'
import { ReceiptCard } from '../components/payment/ReceiptCard'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function WalletPage() {
  const navigate = useNavigate()
  const { data: wallet, isLoading } = useWallet()
  const { data: transactions = [] } = useTransactionHistory()
  const addFunds = useAddFunds()
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState('')

  if (isLoading) return <LoadingSpinner className="min-h-screen" />

  const handleAddFunds = async () => {
    if (!amount) return
    await addFunds.mutateAsync({ amount: parseFloat(amount), paymentMethodId: 'default' })
    setShowAdd(false)
    setAmount('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900">Carteira</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <WalletBalance
          balance={wallet?.balance ?? 0}
          currency={wallet?.currency}
          onAddFunds={() => setShowAdd(true)}
        />

        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Historico</h2>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Nenhuma transacao ainda</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <ReceiptCard key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Adicionar Saldo">
        <div className="space-y-4">
          <div className="flex gap-2">
            {[20, 50, 100].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  amount === String(v) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700'
                }`}
              >
                R$ {v}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Outro valor"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={handleAddFunds} loading={addFunds.isPending} className="w-full">
            Adicionar R$ {amount || '0'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
