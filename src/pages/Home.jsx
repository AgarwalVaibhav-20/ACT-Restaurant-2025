import { useEffect, useMemo, useState } from 'react'
import { IMAGES } from '../data/images'
import SectionHeader from '../components/SectionHeader'
import ProductCard from '../components/ProductCard'
import { api } from '../lib/api'

const aboutImages = [IMAGES.about1, IMAGES.about2, IMAGES.about3]

export default function Home(){
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoriesError, setCategoriesError] = useState('')

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
      // Check if item's categoryId matches selected category
      return item.categoryId === selectedCategory || 
             (item.categoryId && item.categoryId._id === selectedCategory)
    })
  }, [menu, selectedCategory])

  const preview = useMemo(() => filteredMenu.slice(0, 4).map(m => {
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
  }), [filteredMenu])

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section>
        <div className="relative">
          <div className="absolute inset-0 bg-stone-900/40"></div>
          <img src={IMAGES.pastaHero} alt="pasta" className="h-[70svh] w-full object-cover"/>
          <div className="section absolute inset-0 flex items-center">
            <div className="max-w-2xl">
              <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl text-white drop-shadow">Celebrating Indian Flavours.<br/>Enjoyed by Everyone.</h1>
              <p className="mt-6 text-white/90 max-w-xl">Tandoori grills, slow-cooked curries and hand-made breads. Chai, lassi and seasonal specials.</p>
              <div className="mt-8 flex gap-3">
                <a href="/orders" className="btn btn-primary">Order now</a>
                <a href="/booking" className="btn btn-outline bg-white/10 text-white border-white/40 hover:bg-white/20">Book a table</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who are we */}
      <section className="section space-y-10">
        <SectionHeader kicker="Who are we?" title="Rooted in India’s culinary heritage" subtitle="From the tandoor to the tadka, we bring regional recipes from across India—fresh, vibrant and full of soul."/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aboutImages.map((src,i)=> (
            <img key={i} src={src} alt="about" className="h-64 w-full object-cover rounded-2xl"/>
          ))}
        </div>
      </section>

      {/* Menu preview */}
      <section id="menu" className="section space-y-10">
        <SectionHeader title="Menu" subtitle="Live data from your backend for the configured restaurant."/>
        
        {/* Enhanced Animated Category Banner */}
        <div className="moving-banner relative overflow-hidden bg-gradient-to-r from-brand-50 via-brand-100 to-brand-50 rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-brand-800 animate-bounce-in">Categories</h3>
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

        {/* Menu Items Display */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {preview.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard item={item}/>
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
      </section>

      {/* Features */}
      <section className="section grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {title:'Tandoori & grills',desc:'Charred, smoky and finished with ghee.'},
          {title:'Handmade breads',desc:'Naan, roti, kulcha and more—fresh from the tandoor.'},
          {title:'Regional recipes',desc:'From Punjabi classics to coastal favourites.'},
        ].map((f,i)=> (
          <div key={i} className="card p-6">
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-stone-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Team preview */}
      <section id="team" className="section space-y-10">
        <SectionHeader title="Our chefs" subtitle="A talented team mastering tandoor, curries and breads."/>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {src: IMAGES.chef1, name: 'Chef Arjun Singh', role: 'Tandoor Specialist'},
            {src: IMAGES.chef2, name: 'Chef Meera Kapoor', role: 'Regional Curries'},
            {src: IMAGES.chef3, name: 'Chef Kabir Rao', role: 'Breads & Biryanis'},
            {src: IMAGES.chef2, name: 'Chef Ananya Iyer', role: 'Pastry & Mithai'},
          ].map((m, i)=> (
            <figure key={i} className="card overflow-hidden">
              <img src={m.src} alt={m.name} className="h-64 w-full object-cover"/>
              <figcaption className="p-4">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-stone-600">{m.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section space-y-6">
        <SectionHeader title="What guests say" subtitle="Real reviews from people who keep coming back."/>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["The best pasta in town.","Loved the vibe and service!","Authentic flavors, generous portions."].map((t,i)=> (
            <blockquote key={i} className="card p-6 italic text-stone-700">“{t}”</blockquote>
          ))}
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="section">
        <div className="card p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div>
            <h3 className="text-2xl font-[var(--font-display)]">Join our newsletter</h3>
            <p className="text-white/80">Get events, specials and seasonal drops.</p>
          </div>
          <form className="flex w-full md:w-auto gap-3">
            <input className="w-full md:w-72 rounded-full px-4 py-3 text-white outline-0 border-2 border-white" placeholder="you@email.com"/>
            <button className="btn bg-black/20 hover:bg-black/30 text-white">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
