import DraggableComponent from './DraggableComponent'

export default function DraggableTeamSection({
  id,
  config = {
    title: 'Our Chefs',
    subtitle: 'A talented team mastering tandoor, curries and breads.',
    members: [
      {
        id: 'member-1',
        image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
        name: 'Chef Arjun Singh',
        role: 'Tandoor Specialist'
      },
      {
        id: 'member-2',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
        name: 'Chef Meera Kapoor',
        role: 'Regional Curries'
      },
      {
        id: 'member-3',
        image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400',
        name: 'Chef Kabir Rao',
        role: 'Breads & Biryanis'
      },
      {
        id: 'member-4',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
        name: 'Chef Ananya Iyer',
        role: 'Pastry & Mithai'
      }
    ]
  },
  onMove,
  onDelete,
  onEdit,
  isVisible = true
}) {
  return (
    <DraggableComponent
      id={id}
      type="Team Section"
      onMove={onMove}
      onDelete={onDelete}
      onEdit={onEdit}
      isVisible={isVisible}
    >
      <section className="section space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          {config.title && (
            <h2 className="section-title">{config.title}</h2>
          )}
          {config.subtitle && (
            <p className="mt-4 text-lg text-stone-600">{config.subtitle}</p>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {config.members?.map((member) => (
            <figure key={member.id} className="card overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="h-64 w-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400'
                }}
              />
              <figcaption className="p-4">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-stone-600">{member.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </DraggableComponent>
  )
}
