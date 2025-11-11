import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, ArrowLeft, Search, RotateCcw } from 'lucide-react';
import apiService from '../services/api';

export default function MenuManagement() {
  const { user, restaurantId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = () => {
    loadMenuItems();
  };

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading menu items for restaurant ID:', restaurantId);
      
      const response = await apiService.getMenuItems(restaurantId);
      console.log('API Response:', response);
      
      // The API returns the menu array directly, not wrapped in an object
      const menuArray = Array.isArray(response) ? response : (response?.menu || []);
      
      if (menuArray && menuArray.length > 0) {
        console.log('Total menu items from API:', menuArray.length);
        console.log('All menu items:', menuArray);
        console.log('Current restaurant ID to filter by:', restaurantId, '(type:', typeof restaurantId, ')');
        
        // Transform backend data to match frontend format
        // Filter by restaurant ID
        console.log('Available restaurant IDs in menu items:');
        menuArray.forEach(item => {
          console.log(`- Item "${item.itemName}": restaurantId='${item.restaurantId}'`);
        });
        
        // Filter items for this restaurant and exclude soft-deleted items
        let filteredMenu = menuArray.filter(item => {
          const matchesRestaurant = item.restaurantId === restaurantId || String(item.restaurantId) === String(restaurantId);
          const isActive = item.status === 1 || item.status === '1'; // Backend uses status: 1 for active, 0 for deleted
          return matchesRestaurant && isActive;
        });
        
        console.log('Filtered menu items for this restaurant:', filteredMenu.length, filteredMenu);
        
        console.log('Filtered menu items for this restaurant:', filteredMenu.length, filteredMenu);
        
        const transformedMenu = filteredMenu.map(item => ({
          id: item._id || item.id,
          name: item.itemName || item.name, // Backend uses itemName
          price: item.price,
          description: item.description,
          image: item.itemImage || item.image, // Backend uses itemImage
          tags: item.tags || (item.categoryId?.categoryName ? [item.categoryId.categoryName] : []),
          category: item.categoryId?.categoryName || item.category,
          isActive: item.status === 1 || item.status === '1', // Backend uses status field
          status: item.status, // Keep original status for debugging
          restaurantId: item.restaurantId, // Keep for debugging
        }));
        
        setMenuItems(transformedMenu);
        console.log('Final transformed menu items:', transformedMenu);
      } else {
        // No backend menu items - show empty state
        console.log('No menu items found. MenuArray:', menuArray);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      setError('Failed to load menu items. Please check your connection and try again.');
      // Show empty state on error instead of fallback data
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && restaurantId) {
      loadMenuItems();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, restaurantId, navigate]);

  const handleDelete = async (itemId) => {
    console.log('=== DELETE DEBUG INFO ===');
    console.log('Item ID to delete:', itemId);
    console.log('Item ID type:', typeof itemId);
    
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      console.log('Starting delete process...');
      console.log('Auth token available:', !!apiService.token);
      
      const response = await apiService.deleteMenuItem(itemId);
      console.log('Delete API response:', response);
      
      if (response && (response.message || response.success)) {
        console.log('Delete successful, updating UI...');
        
        // Remove from local state on successful delete
        setMenuItems(prev => {
          const updated = prev.filter(item => item.id !== itemId);
          console.log('Updated menu items:', updated);
          return updated;
        });
        
        // Show success message
        alert('Menu item deleted successfully!');
        
        // Refresh the list to ensure consistency after a delay
        setTimeout(() => {
          console.log('Refreshing menu list...');
          handleRefresh();
        }, 1000);
      } else {
        console.error('Delete response did not indicate success:', response);
        alert('Delete may have failed - please refresh to check');
      }
    } catch (error) {
      console.error('=== DELETE ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to delete menu item: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleStatus = async (itemId, currentStatus) => {
    try {
      await apiService.updateMenuStatus({
        menuId: itemId,
        isActive: !currentStatus
      });
      
      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isActive: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Error updating menu status:', error);
      alert('Failed to update menu item status');
    }
  };

  // Filter menu items based on search term
  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format price as Indian Rupees
  const formatINR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format;

  // Show loading or redirect while not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="section flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="font-[var(--font-display)] text-xl font-semibold text-stone-900">
              Menu Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>
            <span className="text-sm text-stone-600">
              {filteredItems.length} items
            </span>
            <Link
              to="/menu-management/new"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>


        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-48 bg-stone-200 rounded mb-4"></div>
                <div className="h-4 bg-stone-200 rounded mb-2"></div>
                <div className="h-6 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {searchTerm ? 'No items found' : 'No menu items yet'}
            </h3>
            <p className="text-stone-600 mb-6">
              {searchTerm 
                ? `No menu items match "${searchTerm}"`
                : 'Start building your menu by adding your first item.'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/menu-management/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="card overflow-hidden group hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="relative">
                  {(() => {
                    const placeholder = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop';
                    const src = item.image && typeof item.image === 'string' && item.image.trim() !== ''
                      ? item.image
                      : placeholder;
                    return (
                      <img
                        src={src}
                        alt={item.name}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = placeholder;
                        }}
                      />
                    );
                  })()}
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="badge bg-white/90 text-stone-700">
                      {formatINR(item.price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-xs text-stone-500">{item.category}</p>
                    <h3 className="font-semibold text-stone-900 group-hover:text-brand-700 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.isActive)}
                        className={`text-xs px-2 py-1 rounded ${
                          item.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } transition-colors`}
                      >
                        {item.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 text-stone-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit item"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}