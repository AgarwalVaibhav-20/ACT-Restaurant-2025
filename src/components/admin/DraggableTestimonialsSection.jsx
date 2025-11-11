import DraggableComponent from './DraggableComponent'

export default function DraggableTestimonialsSection({
  id,
  config = {
    title: 'What guests say',
    subtitle: 'Real reviews from people who keep coming back.',
    testimonials: [
      {
        id: 'test-1',
        quote: 'The best pasta in town.',
        author: '',
        rating: 5
      },
      {
        id: 'test-2',
        quote: 'Loved the vibe and service!',
        author: '',
        rating: 5
      },
      {
        id: 'test-3',
        quote: 'Authentic flavors, generous portions.',
        author: '',
        rating: 5
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
      type="Testimonials"
      onMove={onMove}
      onDelete={onDelete}
      onEdit={onEdit}
      isVisible={isVisible}
    >
      <section className="section space-y-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          {config.title && (
            <h2 className="section-title">{config.title}</h2>
          )}
          {config.subtitle && (
            <p className="mt-4 text-lg text-stone-600">{config.subtitle}</p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.testimonials?.map((testimonial) => (
            <blockquote 
              key={testimonial.id} 
              className="card p-6 space-y-4"
            >
              {/* Quote */}
              <p className="italic text-stone-700">
                "{testimonial.quote}"
              </p>
              
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={i < testimonial.rating ? 'text-brand-500' : 'text-stone-300'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
              
              {/* Author */}
              {testimonial.author && (
                <p className="text-sm font-medium text-stone-600">
                  — {testimonial.author}
                </p>
              )}
            </blockquote>
          ))}
        </div>
      </section>
    </DraggableComponent>
  )
}
