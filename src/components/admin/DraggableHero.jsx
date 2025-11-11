import DraggableComponent from './DraggableComponent'

// Helper function to get button size class
const getSizeClass = (size) => {
  switch (size) {
    case 'small':
      return 'px-4 py-2 text-xs'
    case 'large':
      return 'px-7 py-3.5 text-base'
    case 'medium':
    default:
      return 'px-5 py-2.5 text-sm'
  }
}

export default function DraggableHero({
  id,
  config = {
    title: 'Celebrating Indian Flavours.\nEnjoy by Everyone.',
    subtitle: 'Tandoori grills, slow-cooked curries and hand-made breads. Chai, lassi and seasonal specials.',
    backgroundImage: '/images/pasta-hero.jpg',
    primaryButton: { text: 'Order now', link: '/orders' },
    secondaryButton: { text: 'Book a table', link: '/booking' }
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {
  return (
    <DraggableComponent
      id={id}
      type="Hero"
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
              <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl text-white drop-shadow">
                {config.title.split('\\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < config.title.split('\\n').length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="mt-6 text-white/90 max-w-xl">
                {config.subtitle}
              </p>
              <div className="mt-8 flex gap-3">
                {config.primaryButton && config.primaryButton.enabled !== false && config.primaryButton.text && (
                  <a 
                    href={config.primaryButton.link || '#'} 
                    className={`btn ${getSizeClass(config.primaryButton?.size)}`}
                    style={{
                      backgroundColor: config.primaryButton?.bgColor || '#d46112',
                      color: config.primaryButton?.textColor || '#ffffff',
                      borderColor: config.primaryButton?.bgColor || '#d46112'
                    }}
                  >
                    {config.primaryButton.text}
                  </a>
                )}
                {config.secondaryButton && config.secondaryButton.enabled !== false && config.secondaryButton.text && (
                  <a 
                    href={config.secondaryButton.link || '#'} 
                    className={`btn ${getSizeClass(config.secondaryButton?.size)}`}
                    style={{
                      backgroundColor: config.secondaryButton?.bgColor || '#000000',
                      color: config.secondaryButton?.textColor || '#ffffff',
                      borderColor: config.secondaryButton?.bgColor || '#000000'
                    }}
                  >
                    {config.secondaryButton.text}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DraggableComponent>
  )
}