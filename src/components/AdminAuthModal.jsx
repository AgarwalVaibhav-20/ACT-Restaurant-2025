import { useState } from 'react'
import { X, Lock, Shield } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'

export default function AdminAuthModal() {
  const { showAuthModal, setShowAuthModal, authenticateAdmin } = useAdmin()
  const [restaurantId, setRestaurantId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!restaurantId.trim()) {
      setError('Please enter a restaurant ID')
      return
    }

    setLoading(true)
    setError('')

    const result = await authenticateAdmin(restaurantId.trim())
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleClose = () => {
    setShowAuthModal(false)
    setError('')
    setRestaurantId('')
  }

  if (!showAuthModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="size-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <Shield className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin Access</h2>
                <p className="text-white/80">Enter your restaurant ID to continue</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant ID Input */}
              <div className="space-y-2">
                <label htmlFor="restaurantId" className="block text-sm font-medium text-stone-700">
                  Restaurant ID
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-5 text-stone-400" />
                  <input
                    id="restaurantId"
                    type="text"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    placeholder="Enter your restaurant ID"
                    className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="text-sm text-stone-500 space-y-1">
                  <p><strong>For development, try:</strong></p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• <code className="bg-stone-100 px-1 rounded">admin</code> - Quick admin access</li>
                    <li>• <code className="bg-stone-100 px-1 rounded">test</code> - Test account</li>
                    <li>• <code className="bg-stone-100 px-1 rounded">68e147a53c053e790e0ac135</code> - Your restaurant ID</li>
                  </ul>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !restaurantId.trim()}
                >
                  {loading ? 'Verifying...' : 'Access Admin Mode'}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-stone-50 px-6 py-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Shield className="size-4" />
              <span>Secure authentication required for admin access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}