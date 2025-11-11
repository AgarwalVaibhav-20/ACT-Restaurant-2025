export default function Footer() {
  return (
    <footer className="border-t border-stone-200">
      <div className="section py-10 text-sm text-stone-600 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <p>© {new Date().getFullYear()} Swad Bhārat. All rights reserved.</p>
        <p className="text-stone-500">Made in India. Enjoyed by Everyone.</p>
      </div>
    </footer>
  )
}
