import { useState, useRef, useEffect } from 'react'
import { useAdmin } from '../../contexts/AdminContext'

export default function InlineTextEditor({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Click to edit',
  multiline = false,
  tag = 'div'
}) {
  // Safe admin context usage with fallback
  let isAdminMode = false
  try {
    const adminContext = useAdmin()
    isAdminMode = adminContext?.isAdminMode || false
  } catch (error) {
    // Silently handle missing context
  }
  
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const inputRef = useRef(null)
  const Tag = tag

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (multiline) {
        inputRef.current.select()
      } else {
        inputRef.current.setSelectionRange(0, inputRef.current.value.length)
      }
    }
  }, [isEditing, multiline])

  const handleClick = (e) => {
    if (isAdminMode) {
      e.preventDefault()
      e.stopPropagation()
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    onChange?.(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleBlur = () => {
    handleSave()
  }

  if (!isAdminMode) {
    return <Tag className={className}>{value || placeholder}</Tag>
  }

  if (isEditing) {
    const inputClassName = `${className} border-2 border-brand-500 rounded-md px-2 py-1 outline-none resize-none`
    
    if (multiline) {
      return (
        <div className="relative">
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={inputClassName}
            rows={Math.min(Math.max(editValue.split('\n').length, 2), 8)}
            placeholder={placeholder}
          />
          <div className="absolute -bottom-6 left-0 text-xs text-stone-500 bg-white px-2 py-1 rounded border border-stone-200 shadow-sm">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={inputClassName}
          placeholder={placeholder}
        />
        <div className="absolute -bottom-6 left-0 text-xs text-black bg-white px-2 py-1 rounded border border-stone-200 shadow-sm">
          Press Enter to save, Esc to cancel
        </div>
      </div>
    )
  }

  return (
    <Tag 
      className={`${className} ${isAdminMode ? 'cursor-pointer text-black hover:bg-blue-700 hover:border-brand-200 border border-transparent rounded-md px-2 py-1 transition-all group' : ''}`}
      onClick={handleClick}
      title={isAdminMode ? 'Click to edit' : undefined}
    >
      {value || (isAdminMode ? (
        <span className="text-black italic">{placeholder}</span>
      ) : placeholder)}
      {isAdminMode && (
        <span className="ml-2 opacity-0 group-hover:opacity-100 text-brand-600 text-sm transition-opacity">
          ✏️
        </span>
      )}
    </Tag>
  )
}