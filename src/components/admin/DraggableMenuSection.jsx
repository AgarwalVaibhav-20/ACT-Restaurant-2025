import { useEffect, useMemo, useState } from 'react'
import DraggableComponent from './DraggableComponent'
import ProductCard from '../ProductCard'
import { api } from '../../lib/api'

export default function DraggableMenuSection({ 
  id,
  config = {
    title: 'Menu',
    subtitle: 'Live data from your backend for the configured restaurant.',
    showCategories: true,
    maxItems: 4
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch menu items
  useEffect(() => {
    let active = true
    async function fetchMenu() {
      try {
        setLoading(true)
        const items = await api.getMenu()
        if (!active) return
        setMenu(Array.isArray(items) ? items : [])
      } catch (e) {
        setError(e?.message || 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
    return () => { active = false }
  }, [])

  // Fetch categories
  useEffect(() => {
    let active = true
    async function fetchCategories() {
      try {
        const response = await api.getCategories()
        if (!active) return
        const categoryData = response?.data || []
        setCategories(categoryData)
      } catch (e) {
        console.error('Failed to load categories:', e)
      }
    }
    fetchCategories()
    return () => { active = false }
  }, [])

  // Filter menu items
  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') {
      return menu
    }
    return menu.filter(item => {
      return item.categoryId === selectedCategory || 
             (item.categoryId && item.categoryId._id === selectedCategory)
    })
  }, [menu, selectedCategory])

  const preview = useMemo(() => 
    filteredMenu.slice(0, config.maxItems).map(m => {
      // Handle prices: if item has sizes, use first enabled size price as default
      const hasSizes = Array.isArray(m.sizes) && m.sizes.length > 0
      const enabledSizes = hasSizes ? m.sizes.filter(s => s.enabled !== false) : []
      const defaultPrice = hasSizes && enabledSizes.length > 0 
        ? enabledSizes[0].price 
        : (m.price || 0)
      
      return {
      id: m._id,
      name: m.itemName,
        price: defaultPrice,
        sizes: enabledSizes.length > 0 ? enabledSizes : null, // Include sizes if available
      image: m.itemImage,
      tags: m.sub_category ? [m.sub_category] : [],
      }
    }), [filteredMenu, config.maxItems]
  )

  return (
    <DraggableComponent
      id={id}
      type="Menu Section"
      onMove={onMove}
      onDelete={onDelete}
      onEdit={onEdit}
      isVisible={isVisible}
      className="section space-y-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-stone-900">
          {config.title}
        </h2>
        {config.subtitle && (
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
        )}
      </div>
      
      {/* Categories */}
      {config.showCategories && (
        <div className="moving-banner relative overflow-hidden bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-brand-800">Categories</h3>
          </div>
          
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200'
                }`}
              >
                All Items
              </button>
              
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium ${
                    selectedCategory === category._id
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200'
                  }`}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {loading && <p className="text-stone-600">Loading menu…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="space-y-6">
          {preview.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {preview.map((item, index) => (
                <div key={item.id} className="animate-slide-up">
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone-500">No items found in this category.</p>
            </div>
          )}
        </div>
      )}
    </DraggableComponent>
  )
}