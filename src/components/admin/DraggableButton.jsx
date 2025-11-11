import { useDrag, useDrop } from 'react-dnd'
import { useRef } from 'react'
import { Move, Settings, Trash2, Palette } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import InlineTextEditor from './InlineTextEditor'

const ItemTypes = {
  BUTTON: 'button'
}

export default function DraggableButton({
  id,
  config,
  onMove,
  onDelete,
  onEdit,
  onStyleChange,
  className = 'btn btn-primary',
  children
}) {
  // Safe admin context usage with fallback
  let isAdminMode = false
  try {
    const adminContext = useAdmin()
    isAdminMode = adminContext?.isAdminMode || false
  } catch (error) {
    console.log('Admin context not available, using fallback')
  }
  
  const ref = useRef(null)

  // Safe drag/drop context usage with fallback
  let isDragging = false
  let isOver = false
  let dragDropRef = ref
  
  try {
    const [{ isDragging: _isDragging }, drag] = useDrag({
      type: ItemTypes.BUTTON,
      item: { id, type: 'button' },
      canDrag: isAdminMode,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const [{ isOver: _isOver }, drop] = useDrop({
      accept: ItemTypes.BUTTON,
      drop: (item, monitor) => {
        if (!ref.current || item.id === id) return
        
        const didDrop = monitor.didDrop()
        if (didDrop) return

        onMove?.(item.id, id)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    })
    
    isDragging = _isDragging
    isOver = _isOver
    dragDropRef = drag(drop(ref))
  } catch (error) {
    console.log('Drag/drop context not available for button, using fallback')
  }

  const buttonStyles = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary', 
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
    link: 'text-brand-600 hover:text-brand-700 underline',
    custom: config?.customClass || className
  }

  const currentStyle = config?.style || 'primary'

  if (!isAdminMode) {
    return (
      <a href={config?.link || '#'} className={buttonStyles[currentStyle]}>
        {config?.text || children}
      </a>
    )
  }

  return (
    <div 
      ref={dragDropRef}
      className={`relative group inline-block ${isDragging ? 'opacity-50' : ''} ${isOver ? 'ring-2 ring-brand-400' : ''}`}
    >
      <a href={config?.link || '#'} className={buttonStyles[currentStyle]}>
        <InlineTextEditor
          value={config?.text}
          onChange={(text) => onEdit?.(id, { ...config, text })}
          className="text-inherit"
          placeholder="Button text"
        />
      </a>

      {/* Admin Controls */}
      {isAdminMode && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-stone-200 rounded-lg shadow-lg flex gap-1 p-1">
          {/* Drag Handle */}
          <button
            className="p-1 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors cursor-move"
            title="Drag to reorder"
          >
            <Move className="size-3" />
          </button>

          {/* Style Button */}
          <button
            onClick={() => onStyleChange?.(id, config)}
            className="p-1 hover:bg-brand-50 text-brand-600 hover:text-brand-900 transition-colors"
            title="Change style"
          >
            <Palette className="size-3" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit?.(id, config)}
            className="p-1 hover:bg-brand-50 text-brand-600 hover:text-brand-900 transition-colors"
            title="Edit properties"
          >
            <Settings className="size-3" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (confirm('Delete this button?')) {
                onDelete?.(id)
              }
            }}
            className="p-1 hover:bg-red-50 text-red-600 hover:text-red-900 transition-colors"
            title="Delete button"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}