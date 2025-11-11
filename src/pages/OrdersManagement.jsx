import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Clock,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import apiService from '../services/api';

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function OrdersManagement() {
  const { user, restaurantId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated && restaurantId) {
      loadOrders();
      // Set up polling for real-time updates
      const interval = setInterval(loadOrders, 45000); // Refresh every 45 seconds
      return () => clearInterval(interval);
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, restaurantId, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAllOrders();
      
      if (response && response.orders) {
        // Filter orders by restaurant ID and transform data
        const restaurantOrders = response.orders
          .filter(order => {
            // restaurantId from backend is an ObjectId string; ensure string comparison
            const rid = (order.restaurantId && order.restaurantId._id) ? order.restaurantId._id : order.restaurantId;
            return String(rid) === String(restaurantId);
          })
          .map(order => {
            const rawItems = Array.isArray(order.orderItems) && order.orderItems.length > 0
              ? order.orderItems
              : (Array.isArray(order.items) ? order.items : []);
            const mappedItems = rawItems.map(i => ({
              name: i.name || i.itemName || 'Item',
              quantity: i.quantity || i.qty || 1,
              price: i.price || 0,
              total: i.total || i.subtotal || ((i.price || 0) * (i.quantity || i.qty || 1)),
            }));

            return ({
              id: order._id || order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              customerAddress: order.customerAddress,
              orderItems: mappedItems,
              totalAmount: order.totalAmount || order.subtotal || mappedItems.reduce((s, it) => s + (it.total || 0), 0),
              paymentMethod: order.paymentMethod,
              orderType: order.orderType || 'takeaway',
              status: order.status || 'pending',
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            });
          });
        
        // Sort by creation date (newest first)
        restaurantOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(restaurantOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleRefresh = () => {
    loadOrders();
  };

  // Format price as Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Show loading while not authenticated
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
              Orders Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>
            <span className="text-sm text-stone-600">
              {filteredOrders.length} orders
            </span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="section py-4 bg-white border-b border-stone-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Search orders by customer name, phone, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-stone-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </section>

      {/* Main Content */}
      <main className="section py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-32"></div>
                    <div className="h-3 bg-stone-200 rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-stone-200 rounded w-20"></div>
                </div>
                <div className="h-16 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-stone-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Orders from customers will appear here when they start ordering'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="card p-6 hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-stone-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium capitalize">
                          {order.orderType}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-brand-600">
                        {formatINR(order.totalAmount)}
                      </p>
                      <p className="text-sm text-stone-500 capitalize">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-stone-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{order.customerName}</p>
                        <p className="text-xs text-stone-600">Customer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-stone-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{order.customerPhone}</p>
                        <p className="text-xs text-stone-600">Phone</p>
                      </div>
                    </div>
                    {order.customerAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-stone-500" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">{order.customerAddress}</p>
                          <p className="text-xs text-stone-600">Address</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-stone-900 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <span className="font-medium text-stone-900">{item.name}</span>
                          </div>
                          <span className="font-medium text-stone-700">
                            {formatINR(item.total || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-600">Update Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-sm px-3 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="text-sm text-stone-500">
                      Items: {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}