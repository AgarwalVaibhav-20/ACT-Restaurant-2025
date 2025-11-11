import { IMAGES } from '../data/images'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Italian pasta"
          className="h-[70svh] w-full object-cover object-center brightness-[.55]"
        />
      </div>
      <div className="section relative z-10 h-[70svh] flex items-center">
        <div className="max-w-2xl">
          <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl text-white drop-shadow">Rooted in India.<br/>Enjoyed by Everyone.</h1>
          <p className="mt-6 text-white/90 max-w-xl">Authentic recipes, seasonal ingredients, and a wine list curated to perfection.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/orders" className="btn btn-primary">Order now</Link>
            <Link to="/booking" className="btn bg-black text-white border-black hover:bg-stone-800">Book a table</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
