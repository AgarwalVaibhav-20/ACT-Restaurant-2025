import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, Users } from 'lucide-react';
import { IMAGES } from '../data/images';

export default function RestaurantSelector() {
  const [restaurantId, setRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    
    if (!restaurantId.trim()) {
      setError('Please enter a restaurant ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Navigate to the restaurant menu page
      navigate(`/restaurant/${restaurantId.trim()}`);
    } catch (error) {
      console.error('Error accessing restaurant:', error);
      setError('Failed to access restaurant. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-stone-900/40"></div>
        <img 
          src={IMAGES.pastaHero} 
          alt="Restaurant" 
          className="h-[60vh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="section max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Store className="h-12 w-12" />
              </div>
            </div>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-6xl mb-4 drop-shadow-lg">
              Find Your Restaurant
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Enter your restaurant ID to view the menu, place orders, and make reservations
            </p>
            
            {/* Restaurant ID Form */}
            <form onSubmit={handleRestaurantSubmit} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="Enter Restaurant ID"
                  className="w-full pl-12 pr-4 py-4 rounded-full text-stone-900 bg-white/95 backdrop-blur-sm border-0 focus:ring-4 focus:ring-brand-500/30 focus:outline-none text-center text-lg"
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="mt-3 text-red-200 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 btn btn-primary px-8 py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Accessing Restaurant...
                  </div>
                ) : (
                  'View Menu & Order'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[var(--font-display)] text-3xl font-semibold text-stone-900 mb-4">
            What You Can Do
          </h2>
          <p className="text-stone-600 mb-12">
            Access your favorite restaurant's full menu and services
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Browse Menu</h3>
              <p className="text-stone-600 text-sm">
                Explore the full menu with detailed descriptions and prices
              </p>
            </div>
            
            <div className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Place Orders</h3>
              <p className="text-stone-600 text-sm">
                Add items to your cart and place orders with cash payment
              </p>
            </div>
            
            <div className="card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Make Reservations</h3>
              <p className="text-stone-600 text-sm">
                Reserve tables and book your dining experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section py-16 bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="font-[var(--font-display)] text-3xl font-semibold mb-4">
            Restaurant Owner?
          </h2>
          <p className="text-white/90 mb-8">
            Manage your restaurant, menu, and orders through our admin dashboard
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/login" 
              className="btn bg-white text-brand-700 hover:bg-white/90 px-6 py-3"
            >
              Restaurant Login
            </a>
            <a 
              href="/signup" 
              className="btn bg-white/10 text-white border-white/30 hover:bg-white/20 px-6 py-3"
            >
              Register Restaurant
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}