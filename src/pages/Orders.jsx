import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import ProductCard from '../components/ProductCard'
import CartDrawer from '../components/CartDrawer'
import { api } from '../lib/api'

export default function Orders(){
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoriesError, setCategoriesError] = useState('')

  const [cartOpen, setCartOpen] = useState(false)
  const [items, setItems] = useState([])

  // Customer + order info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [tableNumber, setTableNumber] = useState('T1')
  const [placing, setPlacing] = useState(false)
  const [message, setMessage] = useState('')

  // Load saved user data from localStorage on component mount
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('restaurant_order_user_data')
      if (savedUserData) {
        const userData = JSON.parse(savedUserData)
        if (userData.name) setName(userData.name)
        if (userData.email) setEmail(userData.email)
        if (userData.phone) setPhone(userData.phone)
        // Note: address and tableNumber are NOT loaded from localStorage (as per requirement)
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error)
    }
  }, [])

  // Function to save user data to localStorage (excluding address and tableNumber)
  const saveUserDataToLocalStorage = () => {
    try {
      const userData = {
        name: name || '',
        email: email || '',
        phone: phone || '',
        // address and tableNumber are NOT saved to localStorage (as per requirement)
      }
      localStorage.setItem('restaurant_order_user_data', JSON.stringify(userData))
      console.log('✅ User data saved to localStorage:', userData)
    } catch (error) {
      console.error('Error saving user data to localStorage:', error)
    }
  }

  // Fetch menu items
  useEffect(() => {
    let active = true
    async function run(){
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
    run()
    return () => { active = false }
  }, [])

  // Fetch categories
  useEffect(() => {
    let active = true
    async function run(){
      try {
        setCategoriesLoading(true)
        const response = await api.getCategories()
        if (!active) return
        const categoryData = response?.data || []
        setCategories(categoryData)
      } catch (e) {
        setCategoriesError(e?.message || 'Failed to load categories')
      } finally {
        setCategoriesLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [])

  // Filter menu items based on selected category
  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') {
      return menu
    }
    return menu.filter(item => {
      return item.categoryId === selectedCategory || 
             (item.categoryId && item.categoryId._id === selectedCategory)
    })
  }, [menu, selectedCategory])

  const viewItems = useMemo(() => filteredMenu.map(m => {
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
    source: m,
    }
  }), [filteredMenu])

  function addToCart(item){
    setItems(prev => {
      // Check if same item with same size already exists
      const itemKey = item.selectedSize 
        ? `${item.id}_${item.selectedSize?.name || item.selectedSize?.label || 'default'}`
        : item.id
      
      const found = prev.find(p => {
        const pKey = p.selectedSize 
          ? `${p.id}_${p.selectedSize?.name || p.selectedSize?.label || 'default'}`
          : p.id
        return pKey === itemKey
      })
      
      if (found) {
        return prev.map(p => {
          const pKey = p.selectedSize 
            ? `${p.id}_${p.selectedSize?.name || p.selectedSize?.label || 'default'}`
            : p.id
          return pKey === itemKey ? {...p, qty: p.qty + 1} : p
        })
      }
      return [...prev, {...item, qty: 1}]
    })
    setCartOpen(true)
  }

  async function placeOrder(){
    setMessage('')
    if (!name || !email) {
      setMessage('Please enter your name and email.')
      return
    }
    if (items.length === 0) {
      setMessage('Your cart is empty.')
      return
    }

    try {
      setPlacing(true)
      // Create (or attempt to create) customer; ignore duplicate errors
      try {
        await api.createCustomer({ name, email, phoneNumber: phone, address: address || '' })
      } catch (_) {}

      const payloadItems = items.map(it => ({
        itemId: it.id,
        itemName: it.name,
        price: it.price, // This will be the selected size price or default price
        quantity: it.qty,
        subtotal: it.price * it.qty,
        // Include size information if available
        ...(it.selectedSize ? {
          size: it.sizeName || it.selectedSize?.name || it.selectedSize?.label,
          sizeId: it.selectedSize?._id || null,
        } : {}),
      }))

      // 🔥 CRITICAL: Order place करने से पहले restaurantId check (Ecommerce Frontend)
      // Priority: localStorage restaurantId (FIRST) > RESTAURENT_ID (.env fallback)
      // api.createOrder function में ही localStorage check होगी और RESTAURENT_ID fallback होगी
      // यहां से restaurantId pass करना optional है (api.createOrder में proper fallback है)
      
      console.log('🛒 Placing order (Ecommerce Frontend - Order Place)');
      console.log('   Frontend Priority: localStorage (first) > RESTAURENT_ID (.env fallback)');
      console.log('   Note: api.createOrder में proper fallback है - localStorage में नहीं होगी तो .env की use होगी');
      
      // api.createOrder function में ही localStorage check होगी और RESTAURENT_ID fallback होगी
      // इसलिए यहां से restaurantId pass करना optional है
      const res = await api.createOrder({
        items: payloadItems,
        tableNumber,
        customerName: name,
        customerAddress: address || '',
        // ✅ OPTIONAL: restaurantId pass करना optional है
        // api.createOrder में localStorage check होगी (FIRST), फिर RESTAURENT_ID (.env) fallback होगी
      })
      setMessage('Order placed successfully!')
      setItems([])
      setCartOpen(false)
      
      // Save user data to localStorage after successful order (excluding address)
      saveUserDataToLocalStorage()
    } catch (e) {
      setMessage(e?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="section py-12 space-y-10">
      <SectionHeader title="Order your favorites" subtitle="Live menu from your backend. Enter your details to place an order."/>

      {/* Customer details */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <input className="rounded-xl border px-3 py-2" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="rounded-xl border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="rounded-xl border px-3 py-2" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="rounded-xl border px-3 py-2" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <input className="rounded-xl border px-3 py-2" placeholder="Table (e.g., T1)" value={tableNumber} onChange={e=>setTableNumber(e.target.value)} />
      </div>

      {/* Enhanced Animated Category Banner */}
      <div className="moving-banner relative overflow-hidden bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50 rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-brand-800 animate-bounce-in">Filter by Category</h3>
          {categoriesLoading && <div className="text-sm text-brand-600 animate-pulse">Loading categories...</div>}
          {categoriesError && <div className="text-sm text-red-600 animate-bounce-in">{categoriesError}</div>}
        </div>
        
        {/* Enhanced Animated Category Scroll */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {/* All Categories Button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-btn flex-shrink-0 px-6 py-3 rounded-full font-medium ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-lg animate-pulse-glow'
                  : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200'
              }`}
            >
              <span className="relative z-10">All Items</span>
            </button>
            
            {/* Category Buttons */}
            {categories.map((category, index) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`category-btn flex-shrink-0 px-6 py-3 rounded-full font-medium animate-bounce-in ${
                  selectedCategory === category._id
                    ? 'bg-brand-600 text-white shadow-lg animate-pulse-glow'
                    : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10">{category.categoryName}</span>
              </button>
            ))}
          </div>
          
          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-200/20 rounded-full blur-xl animate-wave"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-300/20 rounded-full blur-lg animate-float"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-brand-400/10 rounded-full blur-md animate-pulse"></div>
          </div>
          
          {/* Moving Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"></div>
        </div>
      </div>

      {loading && <p className="text-stone-600">Loading menu…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Category Info */}
          {selectedCategory !== 'all' && (
            <div className="text-center">
              <p className="text-brand-600 font-medium">
                Showing items from: <span className="text-brand-800">
                  {categories.find(cat => cat._id === selectedCategory)?.categoryName || 'Selected Category'}
                </span>
              </p>
              <p className="text-sm text-stone-500 mt-1">
                {filteredMenu.length} item{filteredMenu.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
          
          {/* Menu Grid */}
          {filteredMenu.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {viewItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard item={item} onAdd={addToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-bounce-in">
              <p className="text-stone-500">No items found in this category.</p>
              <button 
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-brand-600 hover:text-brand-700 font-medium category-btn px-4 py-2 rounded-full border border-brand-200 hover:border-brand-300 transition-all duration-300"
              >
                View all items
              </button>
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-6 flex flex-col items-center gap-3">
        {message && <p className="text-sm {message.includes('success') ? 'text-green-600' : 'text-red-600'}">{message}</p>}
        {items.length > 0 && (
          <div className="flex gap-3">
            <button className="btn btn-outline" onClick={()=> setCartOpen(true)}>
              View cart • {items.reduce((s,i)=> s + i.qty, 0)} items
            </button>
            <button className="btn btn-primary" onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing…' : 'Place order'}
            </button>
          </div>
        )}
      </div>

      {cartOpen && <CartDrawer items={items} onClose={()=> setCartOpen(false)} />}
    </div>
  )
}
