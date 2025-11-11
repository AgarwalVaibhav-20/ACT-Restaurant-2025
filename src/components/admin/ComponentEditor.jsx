import { useState, useEffect } from 'react'
import { X, Image, Type, Link as LinkIcon, Palette, Eye } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

export default function ComponentEditor({ 
  isOpen, 
  onClose, 
  component, 
  onSave 
}) {
  const [config, setConfig] = useState({})
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    if (component) {
      setConfig(component.config || {})
    }
  }, [component])

  if (!isOpen || !component) return null

  const handleSave = () => {
    onSave(component.id, component.type, { config })
    onClose()
  }

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateNestedConfig = (parentKey, childKey, value) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }))
  }

  const renderStyleEditor = () => {
    switch (component.type) {
      case 'hero':
      case 'enhanced_hero':
      case 'ultra_hero':
        return (
          <div className="space-y-6">
            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Palette className="size-4" />
                Primary Button Style
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <HexColorPicker
                      color={config.primaryButton?.bgColor || '#d46112'}
                      onChange={(color) => updateNestedConfig('primaryButton', 'bgColor', color)}
                      className="scale-75 origin-left"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.primaryButton?.bgColor || '#d46112'}
                        onChange={(e) => updateNestedConfig('primaryButton', 'bgColor', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md font-mono"
                        placeholder="#d46112"
                      />
                      <div className="flex gap-2 mt-2">
                        {['#d46112', '#000000', '#1f2937', '#059669', '#dc2626'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateNestedConfig('primaryButton', 'bgColor', color)}
                            className="w-8 h-8 rounded-md border-2 border-white shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <HexColorPicker
                      color={config.primaryButton?.textColor || '#ffffff'}
                      onChange={(color) => updateNestedConfig('primaryButton', 'textColor', color)}
                      className="scale-75 origin-left"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.primaryButton?.textColor || '#ffffff'}
                        onChange={(e) => updateNestedConfig('primaryButton', 'textColor', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md font-mono"
                        placeholder="#ffffff"
                      />
                      <div className="flex gap-2 mt-2">
                        {['#ffffff', '#000000', '#f3f4f6', '#1f2937'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateNestedConfig('primaryButton', 'textColor', color)}
                            className="w-8 h-8 rounded-md border-2 border-stone-300 shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Button Size
                  </label>
                  <select
                    value={config.primaryButton?.size || 'medium'}
                    onChange={(e) => updateNestedConfig('primaryButton', 'size', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Palette className="size-4" />
                Secondary Button Style
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <HexColorPicker
                      color={config.secondaryButton?.bgColor || '#000000'}
                      onChange={(color) => updateNestedConfig('secondaryButton', 'bgColor', color)}
                      className="scale-75 origin-left"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.secondaryButton?.bgColor || '#000000'}
                        onChange={(e) => updateNestedConfig('secondaryButton', 'bgColor', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md font-mono"
                        placeholder="#000000"
                      />
                      <div className="flex gap-2 mt-2">
                        {['#000000', '#ffffff', '#1f2937', '#059669', '#dc2626'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateNestedConfig('secondaryButton', 'bgColor', color)}
                            className="w-8 h-8 rounded-md border-2 border-white shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <HexColorPicker
                      color={config.secondaryButton?.textColor || '#ffffff'}
                      onChange={(color) => updateNestedConfig('secondaryButton', 'textColor', color)}
                      className="scale-75 origin-left"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={config.secondaryButton?.textColor || '#ffffff'}
                        onChange={(e) => updateNestedConfig('secondaryButton', 'textColor', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md font-mono"
                        placeholder="#ffffff"
                      />
                      <div className="flex gap-2 mt-2">
                        {['#ffffff', '#000000', '#f3f4f6', '#1f2937'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateNestedConfig('secondaryButton', 'textColor', color)}
                            className="w-8 h-8 rounded-md border-2 border-stone-300 shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">
                    Button Size
                  </label>
                  <select
                    value={config.secondaryButton?.size || 'medium'}
                    onChange={(e) => updateNestedConfig('secondaryButton', 'size', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-stone-500">
            Style options not available for this component type yet.
          </div>
        )
    }
  }

  const renderContentEditor = () => {
    switch (component.type) {
      case 'hero':
      case 'enhanced_hero':
      case 'ultra_hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Title
              </label>
              <textarea
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter hero title (use \\n for line breaks)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter hero subtitle"
              />
            </div>

            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Background Image
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={config.backgroundImage || ''}
                    onChange={(e) => updateConfig('backgroundImage', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-stone-500 mt-1">Paste any image URL from the web</p>
                </div>
                
                {/* Quick Image Options */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-2">Quick Options</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Restaurant Interior', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
                      { label: 'Food Close-up', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
                      { label: 'Kitchen Scene', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
                      { label: 'Dining Table', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }
                    ].map(({ label, url }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateConfig('backgroundImage', url)}
                        className="px-3 py-2 text-xs border border-stone-300 rounded-md hover:bg-brand-50 hover:border-brand-300 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Image Preview */}
                {config.backgroundImage && (
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-2">Preview</label>
                    <div className="relative">
                      <img 
                        src={config.backgroundImage} 
                        alt="Background Preview" 
                        className="w-full h-32 object-cover rounded-lg border border-stone-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => updateConfig('backgroundImage', '')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                <h4 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-600 rounded-full"></span>
                  Primary Button
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={config.primaryButton?.text || ''}
                      onChange={(e) => updateNestedConfig('primaryButton', 'text', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Order now"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={config.primaryButton?.link || ''}
                      onChange={(e) => updateNestedConfig('primaryButton', 'link', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="/orders"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.primaryButton?.enabled !== false}
                      onChange={(e) => updateNestedConfig('primaryButton', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-brand-600 border-stone-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-xs text-stone-600">Show button</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
              <h4 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-stone-400 rounded-full"></span>
                Secondary Button
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={config.secondaryButton?.text || ''}
                    onChange={(e) => updateNestedConfig('secondaryButton', 'text', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Book a table"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={config.secondaryButton?.link || ''}
                    onChange={(e) => updateNestedConfig('secondaryButton', 'link', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="/booking"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.secondaryButton?.enabled !== false}
                    onChange={(e) => updateNestedConfig('secondaryButton', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-stone-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-xs text-stone-600">Show button</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 'section_header':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Kicker (optional)
              </label>
              <input
                type="text"
                value={config.kicker || ''}
                onChange={(e) => updateConfig('kicker', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Who are we?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Section title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Section description"
              />
            </div>
          </div>
        )

      case 'menu_section':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Menu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="Browse our delicious offerings"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showCategories"
                checked={config.showCategories ?? true}
                onChange={(e) => updateConfig('showCategories', e.target.checked)}
                className="w-4 h-4 text-brand-600 border-stone-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="showCategories" className="text-sm font-medium text-stone-700">
                Show category filters
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Maximum items to show
              </label>
              <select
                value={config.maxItems || 4}
                onChange={(e) => updateConfig('maxItems', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value={2}>2 items</option>
                <option value={4}>4 items</option>
                <option value={6}>6 items</option>
                <option value={8}>8 items</option>
                <option value={12}>12 items</option>
              </select>
            </div>
          </div>
        )

      case 'team_section':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                placeholder="Our Chefs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg resize-none"
                rows={2}
                placeholder="A talented team..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-stone-700">
                Team Members
              </label>
              {config.members?.map((member, index) => (
                <div key={member.id} className="p-4 border border-stone-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Member {index + 1}</span>
                    <button
                      onClick={() => {
                        const newMembers = config.members.filter((_, i) => i !== index)
                        updateConfig('members', newMembers)
                      }}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <input
                    type="url"
                    value={member.image}
                    onChange={(e) => {
                      const newMembers = [...config.members]
                      newMembers[index] = { ...member, image: e.target.value }
                      updateConfig('members', newMembers)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                    placeholder="Image URL"
                  />
                  
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const newMembers = [...config.members]
                      newMembers[index] = { ...member, name: e.target.value }
                      updateConfig('members', newMembers)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                    placeholder="Name"
                  />
                  
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => {
                      const newMembers = [...config.members]
                      newMembers[index] = { ...member, role: e.target.value }
                      updateConfig('members', newMembers)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                    placeholder="Role"
                  />
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newMember = {
                    id: `member-${Date.now()}`,
                    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
                    name: 'New Chef',
                    role: 'Chef'
                  }
                  updateConfig('members', [...(config.members || []), newMember])
                }}
                className="w-full px-4 py-2 border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50"
              >
                + Add Member
              </button>
            </div>
          </div>
        )

      case 'testimonials':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                placeholder="What guests say"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg resize-none"
                rows={2}
                placeholder="Real reviews..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-stone-700">
                Testimonials
              </label>
              {config.testimonials?.map((test, index) => (
                <div key={test.id} className="p-4 border border-stone-200 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Review {index + 1}</span>
                    <button
                      onClick={() => {
                        const newTests = config.testimonials.filter((_, i) => i !== index)
                        updateConfig('testimonials', newTests)
                      }}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <textarea
                    value={test.quote}
                    onChange={(e) => {
                      const newTests = [...config.testimonials]
                      newTests[index] = { ...test, quote: e.target.value }
                      updateConfig('testimonials', newTests)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Customer quote"
                  />
                  
                  <input
                    type="text"
                    value={test.author || ''}
                    onChange={(e) => {
                      const newTests = [...config.testimonials]
                      newTests[index] = { ...test, author: e.target.value }
                      updateConfig('testimonials', newTests)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                    placeholder="Author name (optional)"
                  />
                  
                  <select
                    value={test.rating || 5}
                    onChange={(e) => {
                      const newTests = [...config.testimonials]
                      newTests[index] = { ...test, rating: parseInt(e.target.value) }
                      updateConfig('testimonials', newTests)
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                    <option value={3}>⭐⭐⭐ (3 stars)</option>
                  </select>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newTest = {
                    id: `test-${Date.now()}`,
                    quote: 'Amazing experience!',
                    author: '',
                    rating: 5
                  }
                  updateConfig('testimonials', [...(config.testimonials || []), newTest])
                }}
                className="w-full px-4 py-2 border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50"
              >
                + Add Testimonial
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-stone-500">
            No editor available for this component type.
          </div>
        )
    }
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
              <Type className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Edit Component</h2>
              <p className="text-white/80 capitalize">{component.type?.replace('_', ' ')} Settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200">
          <div className="flex">
            {[
              { id: 'content', label: 'Content', icon: Type },
              { id: 'style', label: 'Style', icon: Palette },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'content' && renderContentEditor()}
          {activeTab === 'style' && renderStyleEditor()}
          {activeTab === 'preview' && (
            <div className="text-center py-8 text-stone-500">
              Live preview coming soon!
            </div>
          )}
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