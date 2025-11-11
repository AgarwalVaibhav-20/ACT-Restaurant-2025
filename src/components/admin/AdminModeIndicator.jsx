import { Settings, Eye, EyeOff } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminModeIndicator() {
  // Safe admin context usage with fallback
  let isAdminMode = false
  let exitAdminMode = () => {}
  
  try {
    const adminContext = useAdmin()
    isAdminMode = adminContext?.isAdminMode || false
    exitAdminMode = adminContext?.exitAdminMode || (() => {})
  } catch (error) {
    // Silently handle missing context
    return null
  }

  if (!isAdminMode) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-brand-600 text-white px-4 py-2 rounded-lg shadow-lg border border-brand-500 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <Settings className="size-4" />
          <span className="text-sm font-medium">Admin Mode</span>
        </div>
        
        <button
          onClick={exitAdminMode}
          className="text-white/80 hover:text-white transition-colors"
          title="Exit Admin Mode"
        >
          <Eye className="size-4" />
        </button>
      </div>
      
      <div className="mt-2 bg-stone-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
        <p className="mb-1">🎨 <strong>Click text to edit inline</strong></p>
        <p className="mb-1">🔄 <strong>Drag buttons to reorder</strong></p>
        <p className="mb-1">🎨 <strong>Click palette icon for styles</strong></p>
        <p>⚙️ Use component controls to customize</p>
      </div>
    </div>
  )
}