import DraggableComponent from './DraggableComponent'

export default function DraggableSectionHeader({ 
  id,
  config = {
    kicker: '',
    title: 'Section Title',
    subtitle: 'Section description goes here'
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {
  return (
    <DraggableComponent
      id={id}
      type="Section Header"
      onMove={onMove}
      onDelete={onDelete}
      onEdit={onEdit}
      isVisible={isVisible}
      className="space-y-4"
    >
      <div className="text-center space-y-4">
        {config.kicker && (
          <div className="text-sm font-medium text-brand-600 uppercase tracking-wider">
            {config.kicker}
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-stone-900">
          {config.title}
        </h2>
        {config.subtitle && (
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {config.subtitle}
          </p>
        )}
      </div>
    </DraggableComponent>
  )
}