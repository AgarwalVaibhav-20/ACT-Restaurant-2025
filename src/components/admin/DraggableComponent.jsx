import { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Move, Settings, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const ItemTypes = {
  COMPONENT: 'component'
}

export default function DraggableComponent({ 
  id, 
  type, 
  children, 
  onMove, 
  onDelete, 
  onEdit,
  isVisible = true,
  className = ''
}) {
  // Safe admin context usage with fallback
  let isAdminMode = false
  try {
    const adminContext = useAdmin()
    isAdminMode = adminContext?.isAdminMode || false
  } catch (error) {
    console.log('Admin context not available, using fallback')
  }
  
  const [isHovered, setIsHovered] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const ref = useRef(null)

  // Safe drag/drop context usage with fallback
  let isDragging = false
  let isOver = false
  let dragDropRef = ref
  
  try {
    const [{ isDragging: _isDragging }, drag] = useDrag({
      type: ItemTypes.COMPONENT,
      item: { id, type },
      canDrag: isAdminMode,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const [{ isOver: _isOver }, drop] = useDrop({
      accept: ItemTypes.COMPONENT,
      drop: (item, monitor) => {
        if (!ref.current) return
        
        const didDrop = monitor.didDrop()
        if (didDrop) return

        const draggedId = item.id
        if (draggedId === id) return

        onMove?.(draggedId, id)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    })
    
    isDragging = _isDragging
    isOver = _isOver
    dragDropRef = drag(drop(ref))
  } catch (error) {
    console.log('Drag/drop context not available, using fallback')
  }

  // dragDropRef is now handled in the try/catch block above

  if (!isAdminMode) {
    return (
      <div className={`${className} ${!isVisible ? 'opacity-50' : ''}`}>
        {isVisible && children}
      </div>
    )
  }

  return (
    <div
      ref={dragDropRef}
      className={`
        relative group transition-all duration-200
        ${className}
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'bg-brand-50 border-2 border-brand-300 border-dashed' : ''}
        ${isHovered ? 'ring-2 ring-brand-400 ring-opacity-50' : ''}
        ${!isVisible ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowControls(false)
      }}
      onClick={() => setShowControls(true)}
    >
      {/* Admin Controls Overlay */}
      {isAdminMode && (isHovered || showControls) && (
        <div className="absolute top-0 right-0 z-10 flex gap-1 p-2">
          <div className="bg-white border border-stone-200 rounded-lg shadow-lg flex gap-1">
            {/* Drag Handle */}
            <button
              className="p-2 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors cursor-move"
              title="Move component"
            >
              <Move className="size-4" />
            </button>
            
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(id, type)
              }}
              className="p-2 hover:bg-brand-50 text-brand-600 hover:text-brand-900 transition-colors"
              title="Edit component"
            >
              <Settings className="size-4" />
            </button>
            
            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // This would be handled by the parent component
                onEdit?.(id, type, { isVisible: !isVisible })
              }}
              className={`p-2 hover:bg-stone-50 transition-colors ${
                isVisible ? 'text-stone-600 hover:text-stone-900' : 'text-red-600 hover:text-red-900'
              }`}
              title={isVisible ? "Hide component" : "Show component"}
            >
              {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to delete this component?')) {
                  onDelete?.(id)
                }
              }}
              className="p-2 hover:bg-red-50 text-red-600 hover:text-red-900 transition-colors"
              title="Delete component"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Component Content */}
      <div className={`${!isVisible ? 'opacity-50' : ''}`}>
        {isVisible && children}
      </div>

      {/* Component Type Label (only in admin mode) */}
      {isAdminMode && (isHovered || showControls) && (
        <div className="absolute bottom-0 left-0 bg-brand-600 text-white text-xs px-2 py-1 rounded-tr-lg">
          {type}
        </div>
      )}
    </div>
  )
}