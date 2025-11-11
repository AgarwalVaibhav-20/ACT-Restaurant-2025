import DraggableComponent from './DraggableComponent'
import InlineTextEditor from './InlineTextEditor'

export default function EnhancedDraggableHero({ 
  id,
  config = {
    title: 'Celebrating Indian Flavours.\nEnjoy by Everyone.',
    subtitle: 'Tandoori grills, slow-cooked curries and hand-made breads. Chai, lassi and seasonal specials.',
    backgroundImage: '/images/pasta-hero.jpg',
    primaryButton: { text: 'Order now', link: '/orders', enabled: true },
    secondaryButton: { text: 'Book a table', link: '/booking', enabled: true }
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value }
    onEdit?.(id, 'hero', { config: newConfig })
  }

  const updateButtonConfig = (buttonType, key, value) => {
    const newConfig = {
      ...config,
      [buttonType]: {
        ...config[buttonType],
        [key]: value
      }
    }
    onEdit?.(id, 'hero', { config: newConfig })
  }

  return (
    <DraggableComponent
      id={id}
      type="Enhanced Hero"
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
              
              <div className="mt-8 flex gap-3">
                {config.primaryButton && config.primaryButton.enabled !== false && config.primaryButton.text && (
                  <div className="relative group">
                    <a href={config.primaryButton.link || '#'} className="btn btn-primary">
                      <InlineTextEditor
                        value={config.primaryButton.text}
                        onChange={(value) => updateButtonConfig('primaryButton', 'text', value)}
                        className="text-inherit"
                        placeholder="Button text"
                      />
                    </a>
                  </div>
                )}
                
                {config.secondaryButton && config.secondaryButton.enabled !== false && config.secondaryButton.text && (
                  <div className="relative group">
                    <a 
                      href={config.secondaryButton.link || '#'} 
                      className="btn btn-outline bg-white/10 text-white border-white/40 hover:bg-white/20"
                    >
                      <InlineTextEditor
                        value={config.secondaryButton.text}
                        onChange={(value) => updateButtonConfig('secondaryButton', 'text', value)}
                        className="text-inherit"
                        placeholder="Button text"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DraggableComponent>
  )
}