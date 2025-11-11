import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Menu as MenuIcon, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Settings,
  LogOut,
  Store,
  BarChart3
} from 'lucide-react';
import apiService from '../services/api';

export default function Dashboard() {
  const { user, restaurantId, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/menu-management')) return 'Menu Management';
    if (path.includes('/orders-management')) return 'Orders Management';
    if (path.includes('/reservations-management')) return 'Reservations Management';
    if (path.includes('/customers-management')) return 'Customers Management';
    if (path.includes('/settings')) return 'Settings';
    return 'Restaurant Dashboard';
  };
  const [stats, setStats] = useState({
    menuItems: 0,
    orders: 0,
    reservations: 0,
    customers: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated && restaurantId) {
      loadDashboardStats();
      
      // Set up polling for real-time updates
      const interval = setInterval(loadDashboardStats, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loading, restaurantId, navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);
      
      // Load statistics in parallel
      const [menuResponse, ordersResponse, reservationsResponse] = await Promise.allSettled([
        apiService.getMenuItems(restaurantId),
        apiService.getAllOrders(),
        apiService.getAllReservations(restaurantId),
      ]);

      // Calculate statistics properly
      let menuCount = 0;
      let ordersCount = 0;
      let reservationsCount = 0;

      // Menu items count
      if (menuResponse.status === 'fulfilled' && menuResponse.value) {
        // Handle both direct array and wrapped response
        const menuArray = Array.isArray(menuResponse.value) ? menuResponse.value : (menuResponse.value?.menu || []);
        
        // Filter by restaurant ID and active items (status = 1)
        menuCount = menuArray
          .filter(item => item.restaurantId === restaurantId)
          .filter(item => item.status === 1 || item.status === '1')
          .length;
          
        console.log('Menu count calculation:', {
          totalMenuItems: menuArray.length,
          filteredByRestaurant: menuArray.filter(item => item.restaurantId === restaurantId).length,
          finalCount: menuCount,
          restaurantId
        });
      }

      // Orders count (filter by restaurant ID)
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value) {
        // Handle both direct array and wrapped response
        const ordersArray = Array.isArray(ordersResponse.value) ? ordersResponse.value : (ordersResponse.value?.orders || []);
        
        ordersCount = ordersArray
          .filter(order => order.restaurantId === restaurantId)
          .length;
          
        console.log('Orders count calculation:', {
          totalOrders: ordersArray.length,
          filteredByRestaurant: ordersCount,
          restaurantId
        });
      }

      // Reservations count (already filtered by restaurant ID in API call)
      if (reservationsResponse.status === 'fulfilled' && reservationsResponse.value) {
        // Handle both direct array and wrapped response
        const reservationsArray = Array.isArray(reservationsResponse.value) ? reservationsResponse.value : (reservationsResponse.value?.reservations || []);
        
        reservationsCount = reservationsArray.length;
        
        console.log('Reservations count calculation:', {
          totalReservations: reservationsCount,
          restaurantId
        });
      }

      setStats({
        menuItems: menuCount,
        orders: ordersCount,
        reservations: reservationsCount,
        customers: 0, // Placeholder for customer count
      });

      console.log('Dashboard stats loaded:', {
        menuItems: menuCount,
        orders: ordersCount,
        reservations: reservationsCount,
        restaurantId
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const dashboardCards = [
    {
      title: 'Menu Management',
      description: 'Add, edit, and manage your restaurant menu items',
      icon: MenuIcon,
      count: stats.menuItems,
      countLabel: 'Menu Items',
      href: '/menu-management',
      color: 'bg-blue-500',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingBag,
      count: stats.orders,
      countLabel: 'Total Orders',
      href: '/orders-management',
      color: 'bg-green-500',
    },
    {
      title: 'Reservations',
      description: 'Manage table bookings and reservations',
      icon: Calendar,
      count: stats.reservations,
      countLabel: 'Reservations',
      href: '/reservations-management',
      color: 'bg-purple-500',
    },
    {
      title: 'Customers',
      description: 'Manage customer information and relationships',
      icon: Users,
      count: stats.customers,
      countLabel: 'Customers',
      href: '/customers-management',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="section flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-brand-600" />
            <div>
            <h1 className="font-[var(--font-display)] text-xl font-semibold text-stone-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-stone-600">Welcome back, {user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section py-8 space-y-8">
        {/* Welcome Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[var(--font-display)] font-semibold text-stone-900">
                Restaurant Management System
              </h2>
              <p className="mt-1 text-stone-600">
                Manage your menu, orders, reservations, and customers all in one place.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 text-sm text-brand-600">
                  <Store className="h-4 w-4" />
                  Restaurant ID: {restaurantId}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <BarChart3 className="h-12 w-12 text-brand-500" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-stone-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.href}
                  className="card p-6 hover:shadow-xl transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${card.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-stone-900">{card.count}</p>
                      <p className="text-xs text-stone-500">{card.countLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-stone-900 group-hover:text-brand-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-stone-600 mt-1">{card.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/menu-management/new"
              className="btn btn-primary justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Menu Item
            </Link>
            <Link
              to="/reservations-management"
              className="btn btn-outline justify-center"
            >
              <Calendar className="h-4 w-4" />
              View Reservations
            </Link>
            <Link
              to="/orders-management"
              className="btn btn-outline justify-center"
            >
              <ShoppingBag className="h-4 w-4" />
              Manage Orders
            </Link>
            <Link
              to="/settings/restaurant"
              className="btn btn-outline justify-center"
            >
              <Settings className="h-4 w-4" />
              Restaurant Settings
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-brand-700">1</span>
                </div>
                <div>
                  <p className="font-medium text-stone-900">Set up your menu</p>
                  <p className="text-sm text-stone-600">Add your dishes with prices and descriptions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-brand-700">2</span>
                </div>
                <div>
                  <p className="font-medium text-stone-900">Configure table booking</p>
                  <p className="text-sm text-stone-600">Set up your tables and availability</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-brand-700">3</span>
                </div>
                <div>
                  <p className="font-medium text-stone-900">Start taking orders</p>
                  <p className="text-sm text-stone-600">Your customers can now place orders</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm text-stone-600">
              <p>No recent activity to display.</p>
              <p className="text-xs">Activity will appear here as you manage your restaurant.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}