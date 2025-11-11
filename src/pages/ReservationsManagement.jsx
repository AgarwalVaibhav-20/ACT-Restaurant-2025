import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  MapPin
} from 'lucide-react';
import apiService from '../services/api';

const RESERVATION_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  seated: { label: 'Seated', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export default function ReservationsManagement() {
  const { user, restaurantId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated && restaurantId) {
      loadReservations();
      // Set up polling for real-time updates
      const interval = setInterval(loadReservations, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, restaurantId, navigate]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAllReservations(restaurantId);
      
      if (response && response.reservations) {
        // Transform and sort reservations
        const transformedReservations = response.reservations.map(reservation => ({
          id: reservation._id || reservation.id,
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          date: reservation.date,
          time: reservation.time,
          guests: reservation.guests || 2,
          specialRequests: reservation.specialRequests,
          orderItems: reservation.orderItems || [],
          totalAmount: reservation.totalAmount || 0,
          paymentMethod: reservation.paymentMethod,
          status: reservation.status || 'pending',
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt
        }));
        
        // Sort by reservation date and time (upcoming first)
        transformedReservations.sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}`);
          const dateTimeB = new Date(`${b.date}T${b.time}`);
          return dateTimeA - dateTimeB;
        });
        
        setReservations(transformedReservations);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Failed to load reservations. Please try again.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await apiService.updateReservation(reservationId, { status: newStatus });
      
      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: newStatus } 
            : reservation
        )
      );
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('Failed to update reservation status');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await apiService.cancelReservation(reservationId);
      // Remove from local state
      setReservations(prev => prev.filter(res => res.id !== reservationId));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

  const handleRefresh = () => {
    loadReservations();
  };

  // Format price as Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date and time
  const formatDateTime = (date, time) => {
    const reservationDate = new Date(`${date}T${time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = '';
    if (date === today.toISOString().split('T')[0]) {
      dayLabel = 'Today';
    } else if (date === tomorrow.toISOString().split('T')[0]) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = reservationDate.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    const timeLabel = reservationDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { dayLabel, timeLabel, fullDate: reservationDate };
  };

  const isUpcoming = (date, time) => {
    const reservationDateTime = new Date(`${date}T${time}`);
    return reservationDateTime > new Date();
  };

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone?.includes(searchTerm) ||
      reservation.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = reservation.date === today;
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = reservation.date === tomorrow.toISOString().split('T')[0];
    } else if (dateFilter === 'upcoming') {
      matchesDate = isUpcoming(reservation.date, reservation.time);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
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
              Reservations Management
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
              {filteredReservations.length} reservations
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
              placeholder="Search by customer name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-stone-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {Object.entries(RESERVATION_STATUSES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
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

        {/* Reservations List */}
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
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'No reservations found' : 'No reservations yet'}
            </h3>
            <p className="text-stone-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Customer reservations will appear here when they start booking tables'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(reservation => {
              const statusInfo = RESERVATION_STATUSES[reservation.status] || RESERVATION_STATUSES.pending;
              const StatusIcon = statusInfo.icon;
              const { dayLabel, timeLabel } = formatDateTime(reservation.date, reservation.time);
              const upcoming = isUpcoming(reservation.date, reservation.time);
              
              return (
                <div 
                  key={reservation.id} 
                  className={`card p-6 hover:shadow-lg transition-shadow ${
                    upcoming ? 'border-l-4 border-l-brand-500' : ''
                  }`}
                >
                  {/* Reservation Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-stone-900">
                          {reservation.customerName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        {upcoming && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{dayLabel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{timeLabel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {reservation.totalAmount > 0 && (
                        <>
                          <p className="text-xl font-bold text-brand-600">
                            {formatINR(reservation.totalAmount)}
                          </p>
                          <p className="text-sm text-stone-500 capitalize">
                            {reservation.paymentMethod}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-stone-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{reservation.customerPhone}</p>
                        <p className="text-xs text-stone-600">Phone</p>
                      </div>
                    </div>
                    {reservation.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-stone-500" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">{reservation.customerEmail}</p>
                          <p className="text-xs text-stone-600">Email</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-stone-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {new Date(reservation.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-stone-600">Booked on</p>
                      </div>
                    </div>
                  </div>

                  {/* Pre-ordered Items */}
                  {reservation.orderItems && reservation.orderItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-stone-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Pre-ordered Items
                      </h4>
                      <div className="space-y-2">
                        {reservation.orderItems.map((item, index) => (
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
                  )}

                  {/* Special Requests */}
                  {reservation.specialRequests && (
                    <div className="mb-4">
                      <h4 className="font-medium text-stone-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Special Requests
                      </h4>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{reservation.specialRequests}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-600">Update Status:</span>
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                        className="text-sm px-3 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        {Object.entries(RESERVATION_STATUSES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-500">
                        ID: {reservation.id.slice(-8)}
                      </span>
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Cancel
                      </button>
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