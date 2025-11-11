import { useMemo } from 'react'

const formatINR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format

export default function CartDrawer({ items, onClose }){
  const total = useMemo(() => items.reduce((s,i)=> s + i.price * i.qty, 0), [items])
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[min(420px,100%)] bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Your cart</h3>
          <button className="text-stone-500 hover:text-stone-700" onClick={onClose}>Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-160px)]">
          {items.length === 0 && <p className="text-stone-600">Your cart is empty.</p>}
          {items.map((it)=> (
            <div key={it.id} className="flex gap-3 items-center">
              <img src={it.image} alt={it.name} className="size-16 rounded object-cover"/>
              <div className="flex-1">
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-stone-500">Qty {it.qty}</p>
              </div>
              <p className="font-semibold">{formatINR(it.price * it.qty)}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-semibold">{formatINR(total)}</span>
          </div>
          <button className="btn btn-primary w-full" onClick={onClose}>Close</button>
        </div>
      </aside>
    </div>
  )
}
