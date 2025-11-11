import { useState } from 'react'
import { IMAGES } from '../data/images'

// Formats a number as Indian Rupees, e.g. 320 -> ₹320
const formatINR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format

export default function ProductCard({ item, onAdd }){
  const [selectedSize, setSelectedSize] = useState(null)
  
  // If item has sizes, default to first size
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0
  const effectivePrice = selectedSize 
    ? selectedSize.price 
    : (hasSizes && item.sizes[0]?.price ? item.sizes[0].price : item.price)
  
  const handleAddToCart = () => {
    if (onAdd) {
      // Include selected size information when adding to cart
      const itemToAdd = {
        ...item,
        price: effectivePrice,
        selectedSize: selectedSize || (hasSizes ? item.sizes[0] : null),
        sizeName: selectedSize?.name || selectedSize?.label || (hasSizes ? item.sizes[0]?.name || item.sizes[0]?.label : null),
      }
      onAdd(itemToAdd)
    }
  }
  
  return (
    <div className="card overflow-hidden group hover:shadow-xl transition-shadow">
      <div className="relative">
        <img src={item.image} alt={item.name} onError={(e)=>{ e.currentTarget.src = IMAGES.fallback }} className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"/>
        <div className="absolute right-3 top-3">
          <span className="badge bg-white/90">{formatINR(effectivePrice)}</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-stone-500">{item.tags?.join(' • ')}</p>
        <h3 className="font-semibold text-stone-900 group-hover:text-brand-700 transition-colors">{item.name}</h3>
        
        {/* Sizes Selection */}
        {hasSizes && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-stone-700">Size:</p>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size, index) => {
                const sizeName = size.name || size.label || `Size ${index + 1}`
                const isSelected = selectedSize === size || (!selectedSize && index === 0)
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-brand-400 hover:text-brand-600'
                    }`}
                  >
                    {sizeName}
                    <span className="ml-1 text-xs opacity-90">({formatINR(size.price)})</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Description */}
        {item.description && (
          <p className="text-sm text-stone-600 line-clamp-2">{item.description}</p>
        )}
        
        {/* Add to Cart Button */}
        {onAdd && (
          <button 
            className="btn btn-primary w-full" 
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  )
}
