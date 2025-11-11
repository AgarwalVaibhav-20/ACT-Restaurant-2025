import { useState, useEffect } from 'react'
import { X, Palette, Eye } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

export default function ButtonStyleEditor({ isOpen, onClose, button, onSave }) {
  const [config, setConfig] = useState({
    text: '',
    link: '',
    style: 'primary',
    customBg: '',
    customText: '',
    customBorder: '',
    size: 'medium',
    rounded: 'normal',
    ...button
  })

  const [showColorPicker, setShowColorPicker] = useState('')

  useEffect(() => {
    if (button) {
      setConfig({ ...config, ...button })
    }
  }, [button])

  if (!isOpen) return null

  const buttonStyles = {
    primary: { 
      label: 'Primary', 
      class: 'bg-brand-600 text-white hover:bg-brand-700',
      preview: 'bg-blue-600 text-white'
    },
    secondary: { 
      label: 'Secondary', 
      class: 'bg-stone-600 text-white hover:bg-stone-700',
      preview: 'bg-gray-600 text-white'
    },
    outline: { 
      label: 'Outline', 
      class: 'border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white',
      preview: 'border-2 border-blue-600 text-blue-600 bg-transparent'
    },
    ghost: { 
      label: 'Ghost', 
      class: 'text-brand-600 hover:bg-brand-50',
      preview: 'text-blue-600 bg-transparent'
    },
    link: { 
      label: 'Link', 
      class: 'text-brand-600 hover:text-brand-700 underline bg-transparent p-0',
      preview: 'text-blue-600 underline bg-transparent p-0'
    }
  }

  const sizes = {
    small: { label: 'Small', class: 'px-3 py-1.5 text-sm' },
    medium: { label: 'Medium', class: 'px-4 py-2' },
    large: { label: 'Large', class: 'px-6 py-3 text-lg' }
  }

  const rounded = {
    none: { label: 'Square', class: 'rounded-none' },
    normal: { label: 'Normal', class: 'rounded-lg' },
    full: { label: 'Pill', class: 'rounded-full' }
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const getButtonClass = () => {
    const baseClass = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500'
    const styleClass = buttonStyles[config.style]?.class || ''
    const sizeClass = sizes[config.size]?.class || ''
    const roundedClass = rounded[config.rounded]?.class || ''
    
    return `${baseClass} ${styleClass} ${sizeClass} ${roundedClass}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Palette className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Style Button</h2>
              <p className="text-white/80">Customize appearance and behavior</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-6">
          {/* Live Preview */}
          <div className="text-center p-6 bg-stone-50 rounded-lg">
            <h3 className="text-sm font-semibold text-stone-800 mb-4">Live Preview</h3>
            <button className={getButtonClass()}>
              {config.text || 'Button Preview'}
            </button>
          </div>

          {/* Content Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter button text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Link URL
              </label>
              <input
                type="text"
                value={config.link}
                onChange={(e) => setConfig({ ...config, link: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="/page or https://example.com"
              />
            </div>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Button Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(buttonStyles).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, style: key })}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    config.style === key 
                      ? 'border-brand-500 bg-brand-50' 
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-medium text-stone-700 mb-2">{style.label}</div>
                  <div className={`px-3 py-1 text-xs rounded ${style.preview}`}>
                    Sample
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Button Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(sizes).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, size: key })}
                  className={`p-3 border-2 rounded-lg transition-all text-center ${
                    config.size === key 
                      ? 'border-brand-500 bg-brand-50' 
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-sm font-medium">{size.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rounded Corners */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Border Radius
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(rounded).map(([key, round]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, rounded: key })}
                  className={`p-3 border-2 transition-all text-center ${
                    config.rounded === key 
                      ? 'border-brand-500 bg-brand-50' 
                      : 'border-stone-200 hover:border-stone-300'
                  } ${round.class}`}
                >
                  <div className="text-sm font-medium">{round.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-between items-center">
          <div className="text-sm text-stone-600">
            Changes will be applied immediately
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}