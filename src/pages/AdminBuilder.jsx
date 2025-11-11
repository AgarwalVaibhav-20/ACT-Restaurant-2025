import { useState, useCallback, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Save, Plus, Eye, Code, Undo, Redo, Palette } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'
import DraggableHero from '../components/admin/DraggableHero'
import EnhancedDraggableHero from '../components/admin/EnhancedDraggableHero'
import UltraEnhancedHero from '../components/admin/UltraEnhancedHero'
import DraggableSectionHeader from '../components/admin/DraggableSectionHeader'
import DraggableMenuSection from '../components/admin/DraggableMenuSection'
import DraggableTeamSection from '../components/admin/DraggableTeamSection'
import DraggableTestimonialsSection from '../components/admin/DraggableTestimonialsSection'
import ComponentEditor from '../components/admin/ComponentEditor'
import PreviewModal from '../components/admin/PreviewModal'

const COMPONENT_TYPES = {
  HERO: 'hero',
  ENHANCED_HERO: 'enhanced_hero',
  ULTRA_HERO: 'ultra_hero',
  SECTION_HEADER: 'section_header', 
  MENU_SECTION: 'menu_section',
  TEAM_SECTION: 'team_section',
  TESTIMONIALS: 'testimonials'
}

const DEFAULT_COMPONENTS = [
  {
    id: 'hero-1',
    type: COMPONENT_TYPES.HERO,
    config: {
      title: 'Celebrating Indian Flavours.\\nEnjoy by Everyone.',
      subtitle: 'Tandoori grills, slow-cooked curries and hand-made breads. Chai, lassi and seasonal specials.',
      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      primaryButton: { text: 'Order now', link: '/orders' },
      secondaryButton: { text: 'Book a table', link: '/booking' }
    },
    isVisible: true
  },
  {
    id: 'section-header-1',
    type: COMPONENT_TYPES.SECTION_HEADER,
    config: {
      kicker: 'Who are we?',
      title: "Rooted in India's culinary heritage",
      subtitle: 'From the tandoor to the tadka, we bring regional recipes from across India—fresh, vibrant and full of soul.'
    },
    isVisible: true
  },
  {
    id: 'menu-1',
    type: COMPONENT_TYPES.MENU_SECTION,
    config: {
      title: 'Menu',
      subtitle: 'Live data from your backend for the configured restaurant.',
      showCategories: true,
      maxItems: 4
    },
    isVisible: true
  }
]

export default function AdminBuilder() {
  const { saveLayout, customLayout, isAuthenticated } = useAdmin()
  const [components, setComponents] = useState(customLayout?.components || DEFAULT_COMPONENTS)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [history, setHistory] = useState([DEFAULT_COMPONENTS])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [editorComponent, setEditorComponent] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Load custom layout on mount
  useEffect(() => {
    if (customLayout?.components) {
      setComponents(customLayout.components)
      setHistory([customLayout.components])
      setHistoryIndex(0)
    }
  }, [customLayout])

  const addToHistory = useCallback((newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newComponents)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setComponents(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setComponents(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  const moveComponent = useCallback((draggedId, targetId) => {
    const draggedIndex = components.findIndex(c => c.id === draggedId)
    const targetIndex = components.findIndex(c => c.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newComponents = [...components]
    const [draggedComponent] = newComponents.splice(draggedIndex, 1)
    newComponents.splice(targetIndex, 0, draggedComponent)
    
    setComponents(newComponents)
    addToHistory(newComponents)
  }, [components, addToHistory])

  const deleteComponent = useCallback((id) => {
    const newComponents = components.filter(c => c.id !== id)
    setComponents(newComponents)
    addToHistory(newComponents)
    if (selectedComponent?.id === id) {
      setSelectedComponent(null)
    }
  }, [components, selectedComponent, addToHistory])

  const editComponent = useCallback((id, type, updates = {}) => {
    if (updates && Object.keys(updates).length > 0) {
      // Direct update (e.g., from visibility toggle)
      const componentIndex = components.findIndex(c => c.id === id)
      if (componentIndex === -1) return

      const newComponents = [...components]
      newComponents[componentIndex] = {
        ...newComponents[componentIndex],
        ...updates
      }
      
      setComponents(newComponents)
      addToHistory(newComponents)
    } else {
      // Open editor modal
      const component = components.find(c => c.id === id)
      if (component) {
        setEditorComponent(component)
        setShowEditor(true)
      }
    }
  }, [components, addToHistory])

  const addComponent = useCallback((type) => {
    const newId = `${type}-${Date.now()}`
    const newComponent = {
      id: newId,
      type,
      config: getDefaultConfig(type),
      isVisible: true
    }
    
    const newComponents = [...components, newComponent]
    setComponents(newComponents)
    addToHistory(newComponents)
  }, [components, addToHistory])

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const layout = {
        components,
        lastModified: new Date().toISOString()
      }
      await saveLayout(layout)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditorSave = useCallback((id, type, updates) => {
    const componentIndex = components.findIndex(c => c.id === id)
    if (componentIndex === -1) return

    const newComponents = [...components]
    newComponents[componentIndex] = {
      ...newComponents[componentIndex],
      ...updates
    }
    
    setComponents(newComponents)
    addToHistory(newComponents)
  }, [components, addToHistory])

  const renderComponent = (component) => {
    const commonProps = {
      id: component.id,
      config: component.config,
      onMove: moveComponent,
      onDelete: deleteComponent,
      onEdit: editComponent,
      isVisible: component.isVisible
    }

    switch (component.type) {
      case COMPONENT_TYPES.HERO:
        return <DraggableHero key={component.id} {...commonProps} />
      case COMPONENT_TYPES.ENHANCED_HERO:
        return <EnhancedDraggableHero key={component.id} {...commonProps} />
      case COMPONENT_TYPES.ULTRA_HERO:
        return <UltraEnhancedHero key={component.id} {...commonProps} />
      case COMPONENT_TYPES.SECTION_HEADER:
        return <DraggableSectionHeader key={component.id} {...commonProps} />
      case COMPONENT_TYPES.MENU_SECTION:
        return <DraggableMenuSection key={component.id} {...commonProps} />
      case COMPONENT_TYPES.TEAM_SECTION:
        return <DraggableTeamSection key={component.id} {...commonProps} />
      case COMPONENT_TYPES.TESTIMONIALS:
        return <DraggableTestimonialsSection key={component.id} {...commonProps} />
      default:
        return <div key={component.id} className="p-4 border-2 border-dashed border-red-300 text-red-600">Unknown component type: {component.type}</div>
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Access Denied</h1>
          <p className="text-stone-600">Please authenticate to access the admin builder.</p>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-stone-50">
        {/* Admin Toolbar */}
        <div className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Palette className="size-5 text-brand-600" />
                  <h1 className="text-xl font-bold text-stone-900">Page Builder</h1>
                </div>
                
                <div className="flex items-center gap-2 border-l border-stone-200 pl-4">
                  <button
                    onClick={undo}
                    disabled={historyIndex === 0}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <Undo className="size-4" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo className="size-4" />
                  </button>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Eye className="size-4" />
                  Preview
                </button>
                
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  <Save className="size-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Component Palette */}
          <div className="w-64 bg-white border-r border-stone-200 min-h-screen">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-stone-900 mb-4">Components</h2>
              <div className="space-y-2">
                {[
                  { type: COMPONENT_TYPES.HERO, label: 'Hero Section', icon: '🎯' },
                  { type: COMPONENT_TYPES.ENHANCED_HERO, label: 'Enhanced Hero', icon: '✨' },
                  { type: COMPONENT_TYPES.ULTRA_HERO, label: 'Ultra Hero', icon: '🚀' },
                  { type: COMPONENT_TYPES.SECTION_HEADER, label: 'Section Header', icon: '📝' },
                  { type: COMPONENT_TYPES.MENU_SECTION, label: 'Menu Section', icon: '🍽️' },
                  { type: COMPONENT_TYPES.TEAM_SECTION, label: 'Team Section', icon: '👨‍🍳' },
                  { type: COMPONENT_TYPES.TESTIMONIALS, label: 'Testimonials', icon: '💬' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addComponent(type)}
                    className="w-full flex items-center gap-3 p-3 text-left text-stone-700 hover:bg-stone-50 rounded-lg border border-stone-200 hover:border-brand-300 transition-colors"
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    <Plus className="size-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1">
            <div className="space-y-6 p-6">
              {components.map(renderComponent)}
              
              {components.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">Start Building</h3>
                  <p className="text-stone-600 mb-6">Add components from the sidebar to build your page</p>
                  <button
                    onClick={() => addComponent(COMPONENT_TYPES.HERO)}
                    className="btn btn-primary"
                  >
                    Add Hero Section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Component Editor Modal */}
        <ComponentEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false)
            setEditorComponent(null)
          }}
          component={editorComponent}
          onSave={handleEditorSave}
        />

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </div>
    </DndProvider>
  )
}

function getDefaultConfig(type) {
  switch (type) {
    case COMPONENT_TYPES.HERO:
      return {
        title: 'New Hero Title',
        subtitle: 'Hero subtitle description',
        backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        primaryButton: { text: 'Primary Action', link: '#' },
        secondaryButton: { text: 'Secondary Action', link: '#' }
      }
    case COMPONENT_TYPES.ENHANCED_HERO:
      return {
        title: 'Click to Edit Title',
        subtitle: 'Click to edit this subtitle - supports inline editing!',
        backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        primaryButton: { text: 'Click to Edit', link: '/orders', enabled: true },
        secondaryButton: { text: 'Click to Edit', link: '/booking', enabled: true }
      }
    case COMPONENT_TYPES.ULTRA_HERO:
      return {
        title: 'Ultra Hero with Draggable Buttons',
        subtitle: 'Click text to edit, drag buttons to reorder, style each button individually!',
        backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        buttons: [
          { id: `btn-${Date.now()}-1`, text: 'Drag Me', link: '/orders', style: 'primary', size: 'medium', rounded: 'normal' },
          { id: `btn-${Date.now()}-2`, text: 'Style Me', link: '/booking', style: 'outline', size: 'medium', rounded: 'normal' }
        ]
      }
    case COMPONENT_TYPES.SECTION_HEADER:
      return {
        kicker: 'Section Kicker',
        title: 'Section Title',
        subtitle: 'Section description goes here'
      }
    case COMPONENT_TYPES.MENU_SECTION:
      return {
        title: 'Menu',
        subtitle: 'Browse our delicious offerings',
        showCategories: true,
        maxItems: 4
      }
    case COMPONENT_TYPES.TEAM_SECTION:
      return {
        title: 'Our Chefs',
        subtitle: 'A talented team mastering tandoor, curries and breads.',
        members: [
          {
            id: `member-${Date.now()}-1`,
            image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
            name: 'Chef Arjun Singh',
            role: 'Tandoor Specialist'
          },
          {
            id: `member-${Date.now()}-2`,
            image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
            name: 'Chef Meera Kapoor',
            role: 'Regional Curries'
          }
        ]
      }
    case COMPONENT_TYPES.TESTIMONIALS:
      return {
        title: 'What guests say',
        subtitle: 'Real reviews from people who keep coming back.',
        testimonials: [
          {
            id: `test-${Date.now()}-1`,
            quote: 'Amazing food and service!',
            author: 'Happy Customer',
            rating: 5
          }
        ]
      }
    default:
      return {}
  }
}
