export default function SectionHeader({kicker, title, subtitle}){
  return (
    <div className="text-center space-y-2"> 
      {kicker && <div className="badge inline-block">{kicker}</div>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="text-stone-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}
