// src/pages/delivery/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMotorcycle, FaClock, FaCheckCircle, FaTimes, FaMapMarkerAlt, FaPhone, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  
  // State variables
  const [activeOrders, setActiveOrders] = useState([]);
  const [readyForPickupOrders, setReadyForPickupOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderIds, setProcessingOrderIds] = useState([]); // Track orders being processed
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    averageRating: 0,
    earningsToday: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user has delivery role
    if (user && user.role !== 'delivery') {
      toast.error('Access denied. Only delivery personnel can access this page.');
      navigate('/');
      return;
    }

    fetchDeliveryData();
    fetchReadyForPickupOrders();
  }, [isAuthenticated, user, navigate]);

  // Fetch active deliveries assigned to this delivery person
  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      // Get all deliveries assigned to this delivery person
      const deliveriesResponse = await axios.get(
        `${process.env.REACT_APP_DELIVERY_SERVICE_URL}/deliveries/my-deliveries`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const deliveries = deliveriesResponse.data.data.deliveries || [];
      
      // Filter active orders (not completed or cancelled)
      const active = deliveries.filter(delivery => 
        ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(delivery.status)
      );
      
      // Enhance active orders with additional data
      const enhancedActiveOrders = await Promise.all(
        active.map(async (delivery) => {
          try {
            // Get order details
            const orderResponse = await axios.get(
              `${process.env.REACT_APP_ORDER_SERVICE_URL}/orders/${delivery.orderId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const order = orderResponse.data.data.order;
            
            // Get restaurant details
            const restaurantResponse = await axios.get(
              `${process.env.REACT_APP_RESTAURANT_SERVICE_URL}/restaurants/${delivery.restaurantId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const restaurant = restaurantResponse.data.data.restaurant;
            
            // Return enhanced delivery object
            return {
              id: delivery._id,
              orderId: delivery.orderId,
              orderNumber: order._id.substring(order._id.length - 6),
              customer: {
                name: order.userId?.name || 'Customer',
                phone: order.contactNumber || 'N/A',
                address: order.deliveryAddress 
                  ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
                  : 'Address not available'
              },
              restaurant: {
                name: restaurant?.name || 'Restaurant',
                address: restaurant?.address 
                  ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`
                  : 'Address not available'
              },
              items: order.items || [],
              total: order.totalAmount,
              status: delivery.status,
              pickupTime: new Date(delivery.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              estimatedDelivery: delivery.estimatedDeliveryTime 
                ? new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Not available'
            };
          } catch (error) {
            console.error('Error fetching delivery details:', error);
            return null;
          }
        })
      );
      
      // Filter out any null values from failed requests
      setActiveOrders(enhancedActiveOrders.filter(order => order !== null));
      
      // Calculate statistics
      const allDelivered = deliveries.filter(delivery => delivery.status === 'delivered');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = allDelivered.filter(delivery => {
        const deliveryDate = new Date(delivery.deliveredAt || delivery.updatedAt);
        return deliveryDate >= today;
      });
      
      // Calculate earnings (simplified - in real app would come from a payment service)
      const earningsToday = completedToday.length * 150; // Assuming LKR 150 per delivery
      
      setStats({
        totalDeliveries: allDelivered.length,
        completedToday: completedToday.length,
        averageRating: 4.7, // This would typically come from ratings data
        earningsToday: earningsToday
      });
      
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
      
      // Fallback to empty arrays if API fails
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders with "ready_for_pickup" status that need delivery
  const fetchReadyForPickupOrders = async () => {
    try {
      // Directly query orders API with status parameter
      const ordersResponse = await axios.get(
        `${process.env.REACT_APP_ORDER_SERVICE_URL}/orders/status/ready_for_pickup`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const readyOrders = ordersResponse.data.data.orders || [];
      
      // Enhance orders with restaurant details
      const enhancedOrders = await Promise.all(
        readyOrders.map(async (order) => {
          try {
            // Get restaurant details
            const restaurantResponse = await axios.get(
              `${process.env.REACT_APP_RESTAURANT_SERVICE_URL}/restaurants/${order.restaurantId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const restaurant = restaurantResponse.data.data.restaurant;
            
            return {
              id: order._id,
              orderNumber: order._id.substring(order._id.length - 6),
              restaurantId: order.restaurantId,
              restaurantName: restaurant?.name || 'Restaurant',
              restaurantAddress: restaurant?.address
                ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`
                : 'Address not available',
              deliveryAddress: order.deliveryAddress
                ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
                : 'Address not available',
              customerName: order.userId?.name || 'Customer',
              customerPhone: order.contactNumber || 'N/A',
              items: order.items || [],
              totalAmount: order.totalAmount,
              status: order.status,
              createdAt: order.createdAt
            };
          } catch (error) {
            console.error('Error fetching restaurant details:', error);
            return null;
          }
        })
      );
      
      setReadyForPickupOrders(enhancedOrders.filter(order => order !== null));
    } catch (error) {
      console.error('Error fetching ready for pickup orders:', error);
      toast.error('Failed to load available orders');
      setReadyForPickupOrders([]);
    }
  };

  // Handle delivery status update
  const handleStatusUpdate = async (deliveryId, newStatus) => {
    // Add the deliveryId to the processing array
    setProcessingOrderIds(prev => [...prev, deliveryId]);
    
    try {
      await axios.patch(
        `${process.env.REACT_APP_DELIVERY_SERVICE_URL}/deliveries/${deliveryId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data after status update
      fetchDeliveryData();
      
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update status');
    } finally {
      // Remove the deliveryId from the processing array
      setProcessingOrderIds(prev => prev.filter(id => id !== deliveryId));
    }
  };

  // Handle accepting a new order for delivery
  const handleAcceptOrder = async (order) => {
    if (!order) {
      toast.error('Invalid order data');
      return;
    }
    
    // Add the order ID to the processing array
    setProcessingOrderIds(prev => [...prev, order.id || order._id]);
    
    try {
      // Extract required IDs and ensure they're valid strings
      const orderId = order.id || order._id;
      const restaurantId = order.restaurantId;
      
      // Make sure we get the delivery person ID correctly
      // user comes from Redux state
      const deliveryPersonId = user?._id || user?.id;
      
      // Log all values for debugging
      console.log('Accept order values:', {
        orderId,
        restaurantId,
        deliveryPersonId,
        user: user,
        userObject: JSON.stringify(user)
      });
      
      if (!deliveryPersonId) {
        toast.error('Missing delivery person ID - user ID not available');
        return;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_DELIVERY_SERVICE_URL || 'http://localhost:3004'}/deliveries/assign`,
        {
          orderId: String(orderId),
          restaurantId: String(restaurantId),
          deliveryPersonId: String(deliveryPersonId)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Order assignment response:', response.data);
      toast.success('Order accepted for delivery');
      
      // Refresh data
      fetchDeliveryData();
      fetchReadyForPickupOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to accept order for delivery';
      toast.error(errorMessage);
    } finally {
      // Remove the order ID from the processing array
      setProcessingOrderIds(prev => prev.filter(id => id !== (order.id || order._id)));
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Delivery Dashboard</h1>
        <div className="delivery-stats">
          <div className="stat-card">
            <FaMotorcycle className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{stats.totalDeliveries}</span>
              <span className="stat-label">Total Deliveries</span>
            </div>
          </div>
          <div className="stat-card">
            <FaClock className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{stats.completedToday}</span>
              <span className="stat-label">Completed Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Orders Ready for Pickup Section */}
      <div className="orders-section">
        <h2>Orders Ready for Pickup</h2>
        {readyForPickupOrders.length > 0 ? (
          <div className="orders-grid">
            {readyForPickupOrders.map(order => (
              <div key={order.id || order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderNumber || (order._id ? order._id.substring(order._id.length - 6) : 'N/A')}</h3>
                  <div className="status-badge ready-for-pickup">
                    <FaClock />
                    <span>Ready for Pickup</span>
                  </div>
                </div>

                <div className="order-locations">
                  <div className="location-item">
                    <FaMapMarkerAlt className="location-icon restaurant" />
                    <div className="location-content">
                      <h4>Restaurant</h4>
                      <p>{order.restaurantName || 'Restaurant'}</p>
                      <p className="address">{order.restaurantAddress || 'Address not available'}</p>
                    </div>
                  </div>
                  <div className="location-item">
                    <FaMapMarkerAlt className="location-icon customer" />
                    <div className="location-content">
                      <h4>Delivery Location</h4>
                      <p>{order.customerName || 'Customer'}</p>
                      <p className="address">{order.deliveryAddress || 'Address not available'}</p>
                    </div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="items-count">
                    <span>{order.items ? order.items.length : 0} items</span>
                  </div>
                  <div className="order-total">
                    <span>Total: Rs. {(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="accept-button"
                    onClick={() => handleAcceptOrder(order)}
                    disabled={processingOrderIds.includes(order.id || order._id)}
                  >
                    {processingOrderIds.includes(order.id || order._id) ? (
                      <><FaSpinner className="spinner" /> Processing...</>
                    ) : (
                      <>Accept Delivery</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <FaMotorcycle className="no-orders-icon" />
            <h3>No Orders Ready for Pickup</h3>
            <p>There are currently no orders ready for pickup.</p>
          </div>
        )}
      </div>

      {/* Active Orders Section */}
      <div className="active-orders">
        <h2>My Active Orders</h2>
        {activeOrders.length > 0 ? (
          <div className="orders-grid">
            {activeOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderNumber}</h3>
                  <div className={`status-badge ${order.status.toLowerCase().replace('_', '-')}`}>
                    {order.status === 'assigned' && <FaClock />}
                    {order.status === 'picked_up' && <FaCheckCircle />}
                    {order.status === 'out_for_delivery' && <FaMotorcycle />}
                    <span>{order.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="order-timeline">
                  <div className="timeline-item">
                    <FaMapMarkerAlt className="timeline-icon" />
                    <div className="timeline-content">
                      <h4>Pickup Location</h4>
                      <p>{order.restaurant.name}</p>
                      <p className="address">{order.restaurant.address}</p>
                      <p className="time">Pickup by: {order.pickupTime}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <FaMapMarkerAlt className="timeline-icon" />
                    <div className="timeline-content">
                      <h4>Delivery Location</h4>
                      <p>{order.customer.name}</p>
                      <p className="address">{order.customer.address}</p>
                      <p className="time">Deliver by: {order.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Order Items</h4>
                  <ul>
                    {order.items.slice(0, 3).map((item, index) => (
                      <li key={index}>
                        <span className="quantity">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="more-items">
                        +{order.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>

                <div className="order-footer">
                  <div className="customer-contact">
                    <a href={`tel:${order.customer.phone}`} className="contact-button">
                      <FaPhone /> Call Customer
                    </a>
                    <button 
                      onClick={() => navigate(`/delivery/orders/${order.orderId}`)}
                      className="view-details-button"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="order-actions">
                    {order.status === 'assigned' && (
                      <button
                        className="action-button"
                        onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                        disabled={processingOrderIds.includes(order.id)}
                      >
                        {processingOrderIds.includes(order.id) ? <FaSpinner className="spinner" /> : null}
                        {processingOrderIds.includes(order.id) ? 'Processing...' : 'Mark as Picked Up'}
                      </button>
                    )}
                    {order.status === 'picked_up' && (
                      <button
                        className="action-button"
                        onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                        disabled={processingOrderIds.includes(order.id)}
                      >
                        {processingOrderIds.includes(order.id) ? <FaSpinner className="spinner" /> : null}
                        {processingOrderIds.includes(order.id) ? 'Processing...' : 'Out for Delivery'}
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <>
                        <button
                          className="action-button delivered"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={processingOrderIds.includes(order.id)}
                        >
                          {processingOrderIds.includes(order.id) ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                          {processingOrderIds.includes(order.id) ? 'Processing...' : 'Mark as Delivered'}
                        </button>
                        <button
                          className="action-button cancelled"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          disabled={processingOrderIds.includes(order.id)}
                        >
                          {processingOrderIds.includes(order.id) ? <FaSpinner className="spinner" /> : <FaTimes />}
                          {processingOrderIds.includes(order.id) ? 'Processing...' : 'Cancel Delivery'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <FaMotorcycle className="no-orders-icon" />
            <h3>No Active Orders</h3>
            <p>You don't have any active orders at the moment.</p>
            <p>Check the "Ready for Pickup" section to accept new deliveries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;