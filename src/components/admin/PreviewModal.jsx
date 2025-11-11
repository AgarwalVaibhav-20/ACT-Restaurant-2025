import { useState, useEffect } from 'react'
import { X, Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react'

export default function PreviewModal({ isOpen, onClose }) {
  const [device, setDevice] = useState('desktop')
  const [orientation, setOrientation] = useState('portrait')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Simulate loading delay
      const timer = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const devices = {
    mobile: {
      name: 'Mobile',
      icon: Smartphone,
      width: orientation === 'portrait' ? 375 : 667,
      height: orientation === 'portrait' ? 667 : 375,
      canRotate: true
    },
    tablet: {
      name: 'Tablet',
      icon: Tablet,
      width: orientation === 'portrait' ? 768 : 1024,
      height: orientation === 'portrait' ? 1024 : 768,
      canRotate: true
    },
    desktop: {
      name: 'Desktop',
      icon: Monitor,
      width: 1200,
      height: 800,
      canRotate: false
    }
  }

  const currentDevice = devices[device]

  // Load the home page in preview mode (without admin controls)
  const previewUrl = `${window.location.origin}/?preview=true`

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-stone-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-stone-900">Preview</h2>
              
              {/* Device Selector */}
              <div className="flex items-center gap-2">
                {Object.entries(devices).map(([key, dev]) => {
                  const Icon = dev.icon
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setDevice(key)
                        if (!dev.canRotate) setOrientation('portrait')
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        device === key
                          ? 'bg-brand-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="text-sm font-medium">{dev.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Orientation Toggle */}
              {currentDevice.canRotate && (
                <button
                  onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                  className="flex items-center gap-2 px-3 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                  title={`Rotate to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
                >
                  <RotateCw className="size-4" />
                  <span className="text-sm font-medium capitalize">{orientation}</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-stone-100">
          <div className="relative">
            {/* Device Frame */}
            <div
              className="bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-stone-800"
              style={{
                width: currentDevice.width + 16,
                height: currentDevice.height + 16
              }}
            >
              {isLoading ? (
                <div 
                  className="flex items-center justify-center bg-white"
                  style={{ 
                    width: currentDevice.width, 
                    height: currentDevice.height 
                  }}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-600">Loading preview...</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  width={currentDevice.width}
                  height={currentDevice.height}
                  className="border-none"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              )}
            </div>

            {/* Device Info */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-stone-800 text-white px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  {currentDevice.width} × {currentDevice.height}px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-stone-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-stone-600">
              Preview shows your live website with current changes
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(previewUrl, '_blank')}
                className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => setIsLoading(true)}
                className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-lg transition-colors"
              >
                Refresh Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}