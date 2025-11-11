import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, CalendarDays, Menu as MenuIcon, Settings } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'

export default function Header() {
  // useAdmin now returns default values instead of throwing error
  const { isAdminMode, isAuthenticated, enterAdminMode, exitAdminMode } = useAdmin()
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-stone-200">
      <div className="section flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="inline-flex size-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 lg:hidden">
            <MenuIcon className="size-5" />
          </button>
          <Link to="/" className="font-[var(--font-display)] text-xl tracking-tight">
            Restaurent
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
