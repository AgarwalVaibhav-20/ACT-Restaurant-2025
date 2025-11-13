import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, CalendarDays, Menu as MenuIcon, Settings } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'
import apiService from '../services/api'
import { RESTAURANT_FALLBACK_NAME, RESTAURANT_LOGO_SRC } from '../config/restaurant'

/* global __RESTAURENT_ID__ */

const INVALID_NAMES = new Set(['', 'not provided', 'not_provided', 'undefined', 'null'])

export default function Header() {
  // useAdmin now returns default values instead of throwing error
  const { isAdminMode, enterAdminMode, exitAdminMode } = useAdmin()
  const [restaurantName, setRestaurantName] = useState(RESTAURANT_FALLBACK_NAME)

  useEffect(() => {
    const envRestaurantId = import.meta?.env?.VITE_RESTAURENT_ID
    const globalRestaurantId = typeof __RESTAURENT_ID__ !== 'undefined' ? __RESTAURENT_ID__ : ''
    const rawRestaurantId = envRestaurantId ?? globalRestaurantId
    const restaurantId = typeof rawRestaurantId === 'string' 
      ? rawRestaurantId.trim().replace(/^"|"$/g, '') 
      : rawRestaurantId

    console.log('Header: resolved restaurantId from env:', restaurantId)

    if (!restaurantId) {
      console.warn('VITE_RESTAURENT_ID environment variable is missing. Falling back to default header title.')
      return
    }

    let isMounted = true

    const loadRestaurantName = async () => {
      try {
        const response = await apiService.getRestaurantProfile(restaurantId)
        const name =
          response?.restaurant?.restaurantName ||
          response?.profile?.restaurantName ||
          response?.restaurantName ||
          response?.data?.restaurantName ||
          response?.name ||
          response?.title ||
          RESTAURANT_FALLBACK_NAME

        if (isMounted) {
          const normalizedName = typeof name === 'string' ? name.trim() : ''
          const lowerName = normalizedName.toLowerCase()
          const finalName = normalizedName && !INVALID_NAMES.has(lowerName)
            ? normalizedName
            : RESTAURANT_FALLBACK_NAME

          setRestaurantName(finalName)
        }
      } catch (error) {
        console.error('Failed to fetch restaurant name for header:', error)
      }
    }

    loadRestaurantName()

    return () => {
      isMounted = false
    }
  }, [])
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-stone-200">
      <div className="section flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="inline-flex size-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 lg:hidden">
            <MenuIcon className="size-5" />
          </button>
          <Link to="/" className="group flex items-center gap-3 text-stone-900">
            <span className="inline-flex h-[42px] w-[42px] min-w-[42px] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-stone-200 transition group-hover:ring-brand-500/60 group-active:ring-brand-600">
              <img
                src={RESTAURANT_LOGO_SRC}
                alt={`${restaurantName} logo`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <span className="font-semibold text-[1.35rem] tracking-tight transition group-hover:text-brand-700" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
              {restaurantName}
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-700">
          <NavLink className={({isActive}) => (isActive ? 'text-brand-700' : 'hover:text-stone-900')} to="/">Home</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'text-brand-700' : 'hover:text-stone-900')} to="/orders">Orders</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'text-brand-700' : 'hover:text-stone-900')} to="/booking">Book a table</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Admin Mode Toggle */}
          <button
            onClick={isAdminMode ? exitAdminMode : enterAdminMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAdminMode 
                ? 'bg-brand-600 text-white hover:bg-brand-700' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title={isAdminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
          >
            <Settings className="size-4" />
            {isAdminMode ? 'Exit Admin' : 'Admin'}
          </button>
          
          <Link to="/orders" className="btn btn-outline"><ShoppingBag className="size-4"/> Cart</Link>
          <Link to="/booking" className="btn btn-primary"><CalendarDays className="size-4"/> Reserve</Link>
        </div>
      </div>
    </header>
  )
}
