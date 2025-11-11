import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { restaurantId, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastCounts, setLastCounts] = useState({
    orders: 0,
    reservations: 0,
    menuItems: 0
  });

  useEffect(() => {
    if (!isAuthenticated || !restaurantId) return;

    // Initial load to set baseline
    loadInitialCounts();

    // Set up polling for notifications
    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, restaurantId]);

  const loadInitialCounts = async () => {
    try {
      const [ordersResponse, reservationsResponse, menuResponse] = await Promise.allSettled([
        apiService.getAllOrders(),
        apiService.getAllReservations(restaurantId),
        apiService.getMenuItems(restaurantId)
      ]);

      const ordersCount = ordersResponse.status === 'fulfilled' 
        ? (ordersResponse.value?.orders?.filter(order => order.restaurantId === restaurantId).length || 0)
        : 0;
      
      const reservationsCount = reservationsResponse.status === 'fulfilled' 
        ? (reservationsResponse.value?.reservations?.length || 0)
        : 0;

      const menuCount = menuResponse.status === 'fulfilled' 
        ? (menuResponse.value?.menu?.filter(item => item.isActive !== false).length || 0)
        : 0;

      setLastCounts({
        orders: ordersCount,
        reservations: reservationsCount,
        menuItems: menuCount
      });
    } catch (error) {
      console.error('Error loading initial counts:', error);
    }
  };

  const checkForUpdates = async () => {
    try {
      const [ordersResponse, reservationsResponse] = await Promise.allSettled([
        apiService.getAllOrders(),
        apiService.getAllReservations(restaurantId)
      ]);

      const ordersCount = ordersResponse.status === 'fulfilled' 
        ? (ordersResponse.value?.orders?.filter(order => order.restaurantId === restaurantId).length || 0)
        : 0;
      
      const reservationsCount = reservationsResponse.status === 'fulfilled' 
        ? (reservationsResponse.value?.reservations?.length || 0)
        : 0;

      // Check for new orders
      if (ordersCount > lastCounts.orders) {
        const newOrdersCount = ordersCount - lastCounts.orders;
        addNotification({
          id: Date.now(),
          type: 'new_order',
          title: 'New Order Received!',
          message: `${newOrdersCount} new ${newOrdersCount === 1 ? 'order' : 'orders'} received`,
          timestamp: new Date(),
          icon: '🛍️'
        });
      }

      // Check for new reservations
      if (reservationsCount > lastCounts.reservations) {
        const newReservationsCount = reservationsCount - lastCounts.reservations;
        addNotification({
          id: Date.now() + 1,
          type: 'new_reservation',
          title: 'New Reservation!',
          message: `${newReservationsCount} new ${newReservationsCount === 1 ? 'reservation' : 'reservations'} made`,
          timestamp: new Date(),
          icon: '📅'
        });
      }

      // Update counts
      setLastCounts(prev => ({
        ...prev,
        orders: ordersCount,
        reservations: reservationsCount
      }));

    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    lastCounts
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}