import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Clock, MapPin, Phone, Star } from 'lucide-react';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { MENU } from '../data/menu';

export default function PublicMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load restaurant profile and menu items in parallel
      const [restaurantResponse, menuResponse] = await Promise.allSettled([
        apiService.getRestaurantProfile(restaurantId),
        apiService.getMenuItems(restaurantId),
      ]);

      // Handle restaurant profile
      if (restaurantResponse.status === 'fulfilled' && restaurantResponse.value.success) {
        setRestaurant(restaurantResponse.value.profile);
      } else {
        // Fallback restaurant data
        setRestaurant({
          restaurantName: `Restaurant ${restaurantId}`,
          address: 'Location not specified',
          phone: 'Contact not available',
          email: 'email@restaurant.com',
          description: 'Welcome to our restaurant! Enjoy fresh, delicious meals prepared with care.',
          rating: 4.5,
          cuisine: 'Multi-cuisine'
        });
      }

      // Handle menu items
      if (menuResponse.status === 'fulfilled' && menuResponse.value) {
        const menuArray = Array.isArray(menuResponse.value) ? menuResponse.value : (menuResponse.value?.menu || []);
        
        if (menuArray.length > 0) {
          const transformedMenu = menuArray
            .filter(item => {
              const matchesRestaurant = item.restaurantId === restaurantId;
              const isActive = item.status === 1 || item.status === '1'; // Backend uses status field
              return matchesRestaurant && isActive;
            })
            .map(item => {
              // Handle prices: if item has sizes, use first size price as default, otherwise use item.price
              const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
              const enabledSizes = hasSizes ? item.sizes.filter(s => s.enabled !== false) : [];
              const defaultPrice = hasSizes && enabledSizes.length > 0 
                ? enabledSizes[0].price 
                : (item.price || 0);
              
              return {
              id: item._id || item.id,
              name: item.itemName || item.name,
                price: defaultPrice, // Default price (from first size or item.price)
                sizes: enabledSizes.length > 0 ? enabledSizes : null, // Include sizes if available
              description: item.description,
              image: item.itemImage || item.image,
              tags: item.tags || (item.categoryId?.categoryName ? [item.categoryId.categoryName] : []),
              category: item.categoryId?.categoryName || item.category,
              isActive: item.status === 1 || item.status === '1',
                originalItem: item, // Keep original item data
              };
            });
        
          const activeItems = transformedMenu; // Already filtered for active items
          setMenuItems(activeItems);
          
          // Extract categories
          const uniqueCategories = [...new Set(activeItems.map(item => item.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          // No menu items in array
          setMenuItems([]);
          setCategories([]);
        }
      } else {
        // No menu items for this restaurant
        setMenuItems([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      setError('Failed to load restaurant information. Please try again.');
      // Set empty state on error
      setMenuItems([]);
      setRestaurant({
        restaurantName: `Restaurant ${restaurantId}`,
        address: 'Location not specified',
        description: 'Welcome to our restaurant!'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCartItems(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId, newQty) => {
    if (newQty === 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, qty: newQty } : item
      )
    );
  };

  // Filter menu items by category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Restaurant Not Found</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="section flex h-16 items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Find Another Restaurant
          </button>
          
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-brand-600" />
            <span className="font-medium text-stone-900">{restaurant?.restaurantName}</span>
          </div>
        </div>
      </header>

      {/* Restaurant Info */}
      <section className="section py-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-[var(--font-display)] text-3xl font-bold text-stone-900">
                {restaurant?.restaurantName}
              </h1>
              {restaurant?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-stone-700">{restaurant.rating}</span>
                </div>
              )}
            </div>
            
            {restaurant?.description && (
              <p className="text-stone-600 mb-4">{restaurant.description}</p>
            )}
            
            <div className="space-y-2 text-sm text-stone-600">
              {restaurant?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
              {restaurant?.cuisine && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.cuisine} Restaurant</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center">
            <h3 className="text-lg font-semibold mb-2">Restaurant ID</h3>
            <p className="text-2xl font-mono font-bold">{restaurantId}</p>
            <p className="text-white/80 text-sm mt-2">Share this ID with your friends</p>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      {categories.length > 0 && (
        <section className="section py-4 bg-white border-b border-stone-200">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-brand-600 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {category} ({menuItems.filter(item => item.category === category).length})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Menu Items */}
      <main className="section py-8">
        <div className="mb-6">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-stone-900 mb-2">
            {selectedCategory === 'all' ? 'Our Menu' : selectedCategory}
          </h2>
          <p className="text-stone-600">
            {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No items available</h3>
            <p className="text-stone-600">This restaurant hasn't added any menu items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMenuItems.map(item => (
              <ProductCard key={item.id} item={item} onAdd={addToCart} showFullInfo />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            className="btn btn-primary shadow-2xl px-6 py-3 flex items-center gap-2"
            onClick={() => setCartOpen(true)}
          >
            <span>View Cart</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
              {totalCartItems}
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          restaurantId={restaurantId}
          restaurantName={restaurant?.restaurantName}
          onClose={() => setCartOpen(false)}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
        />
      )}
    </div>
  );
}