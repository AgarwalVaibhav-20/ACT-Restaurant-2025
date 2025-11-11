import { useState } from 'react'
import DraggableComponent from './DraggableComponent'
import InlineTextEditor from './InlineTextEditor'
import DraggableButton from './DraggableButton'
import ButtonStyleEditor from './ButtonStyleEditor'

export default function UltraEnhancedHero({ 
  id,
  config = {
    title: 'Celebrating Indian Flavours.\nEnjoy by Everyone.',
    subtitle: 'Tandoori grills, slow-cooked curries and hand-made breads. Chai, lassi and seasonal specials.',
    backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    buttons: [
      { id: 'btn-1', text: 'Order Now', link: '/orders', style: 'primary', size: 'medium', rounded: 'normal' },
      { id: 'btn-2', text: 'Book Table', link: '/booking', style: 'outline', size: 'medium', rounded: 'normal' }
    ]
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {
  const [editingButton, setEditingButton] = useState(null)
  const [showButtonStyleEditor, setShowButtonStyleEditor] = useState(false)

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value }
    onEdit?.(id, 'ultra_hero', { config: newConfig })
  }

  const updateButtonConfig = (buttonId, newButtonConfig) => {
    const newButtons = config.buttons.map(btn => 
      btn.id === buttonId ? { ...btn, ...newButtonConfig } : btn
    )
    updateConfig('buttons', newButtons)
  }

  const moveButton = (draggedId, targetId) => {
    const buttons = [...config.buttons]
    const draggedIndex = buttons.findIndex(btn => btn.id === draggedId)
    const targetIndex = buttons.findIndex(btn => btn.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const [draggedButton] = buttons.splice(draggedIndex, 1)
    buttons.splice(targetIndex, 0, draggedButton)
    
    updateConfig('buttons', buttons)
  }

  const deleteButton = (buttonId) => {
    const newButtons = config.buttons.filter(btn => btn.id !== buttonId)
    updateConfig('buttons', newButtons)
  }

  const addButton = () => {
    const newButton = {
      id: `btn-${Date.now()}`,
      text: 'New Button',
      link: '#',
      style: 'primary',
      size: 'medium',
      rounded: 'normal'
    }
    updateConfig('buttons', [...(config.buttons || []), newButton])
  }

  const openButtonStyleEditor = (buttonId) => {
    const button = config.buttons.find(btn => btn.id === buttonId)
    setEditingButton(button)
    setShowButtonStyleEditor(true)
  }

  const saveButtonStyle = (updatedButton) => {
    updateButtonConfig(updatedButton.id, updatedButton)
  }

  return (
    <DraggableComponent
      id={id}
      type="Ultra Hero"
      onMove={onMove}
      onDelete={onDelete}
      onEdit={onEdit}
      isVisible={isVisible}
    >
      <section>
        <div className="relative">
          <div className="absolute inset-0 bg-stone-900/40"></div>
          <img 
            src={config.backgroundImage} 
            alt="hero background" 
            className="h-[70svh] w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            }}
          />
          <div className="section absolute inset-0 flex items-center">
            <div className="max-w-2xl">
              <InlineTextEditor
                value={config.title}
                onChange={(value) => updateConfig('title', value)}
                className="font-[var(--font-display)] text-5xl sm:text-6xl text-white drop-shadow"
                placeholder="Enter hero title..."
                multiline
                tag="h1"
              />
              
              <InlineTextEditor
                value={config.subtitle}
                onChange={(value) => updateConfig('subtitle', value)}
                className="mt-6 text-white/90 max-w-xl"
                placeholder="Enter hero subtitle..."
                multiline
                tag="p"
              />
              
              <div className="mt-8 flex flex-wrap gap-3">
                {(config.buttons || []).map((button) => (
                  <DraggableButton
                    key={button.id}
                    id={button.id}
                    config={button}
                    onMove={moveButton}
                    onDelete={deleteButton}
                    onEdit={updateButtonConfig}
                    onStyleChange={openButtonStyleEditor}
                  />
                ))}
                
                {/* Add Button */}
                <button
                  onClick={addButton}
                  className="px-4 py-2 border-2 border-dashed border-white/40 text-white/80 hover:border-white/60 hover:text-white rounded-lg transition-colors"
                >
                  + Add Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Button Style Editor */}
      <ButtonStyleEditor
        isOpen={showButtonStyleEditor}
        onClose={() => {
          setShowButtonStyleEditor(false)
          setEditingButton(null)
        }}
        button={editingButton}
        onSave={saveButtonStyle}
      />
    </DraggableComponent>
  )
}