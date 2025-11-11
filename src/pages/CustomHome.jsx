import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAdmin } from '../contexts/AdminContext'
import DefaultHome from './Home'
import DraggableHero from '../components/admin/DraggableHero'
import EnhancedDraggableHero from '../components/admin/EnhancedDraggableHero'
import UltraEnhancedHero from '../components/admin/UltraEnhancedHero'
import DraggableSectionHeader from '../components/admin/DraggableSectionHeader'
import DraggableMenuSection from '../components/admin/DraggableMenuSection'
import DraggableTeamSection from '../components/admin/DraggableTeamSection'
import DraggableTestimonialsSection from '../components/admin/DraggableTestimonialsSection'
import { RESTAURENT_ID } from '../lib/config'

export default function CustomHome() {
  const { customLayout, isAdminMode } = useAdmin()
  
  // Temporary: Add a reset button in development
  const handleResetLayout = async () => {
    if (confirm('Reset to original site? This will clear all admin customizations.')) {
      try {
        // Clear localStorage first
        localStorage.removeItem('custom_layout')
        
        // Delete from backend using correct endpoint
        const response = await fetch(`http://localhost:4000/custom-layout/${RESTAURENT_ID}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert('✅ Layout reset successfully! Reloading...')
        } else {
          alert('⚠️ Backend clear failed, but localStorage cleared. Reloading...')
        }
      } catch (err) {
        console.error('Failed to delete from backend:', err)
        alert('⚠️ Network error, but localStorage cleared. Reloading...')
      }
      
      window.location.reload()
    }
  }

  // If no custom layout exists or components array is empty, render the default home page
  if (!customLayout?.components || customLayout.components.length === 0) {
    return <DefaultHome />
  }

  const renderComponent = (component) => {
    const commonProps = {
      id: component.id,
      config: component.config,
      isVisible: component.isVisible,
      // In view mode, we don't need the admin callbacks
      onMove: () => {},
      onDelete: () => {},
      onEdit: () => {}
    }

    switch (component.type) {
      case 'hero':
        return <DraggableHero key={component.id} {...commonProps} />
      case 'enhanced_hero':
        return <EnhancedDraggableHero key={component.id} {...commonProps} />
      case 'ultra_hero':
        return <UltraEnhancedHero key={component.id} {...commonProps} />
      case 'section_header':
        return <DraggableSectionHeader key={component.id} {...commonProps} />
      case 'menu_section':
        return <DraggableMenuSection key={component.id} {...commonProps} />
      case 'team_section':
        return <DraggableTeamSection key={component.id} {...commonProps} />
      case 'testimonials':
        return <DraggableTestimonialsSection key={component.id} {...commonProps} />
      default:
        return null
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-24">
        {/* Temporary Reset Button - Remove in production */}
        <button
          onClick={handleResetLayout}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700"
          title="Reset to original coded site"
        >
          🔄 Reset Layout
        </button>
        
        {customLayout.components
          .filter(component => component.isVisible !== false)
          .map(renderComponent)
        }
      </div>
    </DndProvider>
  )
}