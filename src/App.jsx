import { Routes, Route, useSearchParams } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CustomHome from './pages/CustomHome.jsx'
import Orders from './pages/Orders.jsx'
import Booking from './pages/Booking.jsx'
import AdminBuilder from './pages/AdminBuilder.jsx'
import AdminAuthModal from './components/AdminAuthModal.jsx'
import AdminModeIndicator from './components/admin/AdminModeIndicator.jsx'
import { AdminProvider } from './contexts/AdminContext.jsx'

function App() {
  const [searchParams] = useSearchParams()
  const isPreviewMode = searchParams.get('preview') === 'true'
  
  return (
    <AdminProvider>
      <div className="min-h-dvh flex flex-col">
        {!isPreviewMode && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<CustomHome />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/admin" element={<AdminBuilder />} />
          </Routes>
        </main>
        {!isPreviewMode && <Footer />}
        {!isPreviewMode && <AdminAuthModal />}
        {!isPreviewMode && <AdminModeIndicator />}
      </div>
    </AdminProvider>
  )
}

export default App
