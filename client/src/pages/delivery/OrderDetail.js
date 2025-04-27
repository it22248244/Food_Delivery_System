import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTruck, FaClock, 
         FaMapMarkerAlt, FaPhone, FaUtensils, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getDeliveryByOrder, updateDeliveryStatus } from '../../api/deliveryApi';
import api from '../../api/config';

const DeliveryOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

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

    fetchOrderDetails();
  }, [id, isAuthenticated, user, navigate, token]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // First get the order details
      const orderResponse = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orderData = orderResponse.data.data.order;
      setOrder(orderData);
      
      // Then get delivery details for this order
      try {
        const deliveryResponse = await getDeliveryByOrder(id);
        setDelivery(deliveryResponse.data.delivery);
      } catch (deliveryError) {
        console.error('Error fetching delivery details:', deliveryError);
        // We still have the order data, so we can continue
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!delivery) {
      toast.error('No delivery information found for this order');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateDeliveryStatus(delivery._id, { status: newStatus });
      
      // Also update order status if needed
      if (newStatus === 'delivered' || newStatus === 'cancelled') {
        await api.patch(`/orders/${id}/status`, { 
          status: newStatus 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
      
      // Refresh order and delivery data
      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format address to string
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    
    const { street, city, state, zipCode } = address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };

  // Get status info (icon, class, text)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { className: 'status-pending', icon: <FaClock />, text: 'Pending' };
      case 'confirmed':
        return { className: 'status-confirmed', icon: <FaCheckCircle />, text: 'Confirmed' };
      case 'preparing':
        return { className: 'status-preparing', icon: <FaUtensils />, text: 'Preparing' };
      case 'ready_for_pickup':
        return { className: 'status-ready', icon: <FaCheckCircle />, text: 'Ready for Pickup' };
      case 'out_for_delivery':
        return { className: 'status-delivery', icon: <FaTruck />, text: 'Out for Delivery' };
      case 'delivered':
        return { className: 'status-delivered', icon: <FaCheckCircle />, text: 'Delivered' };
      case 'cancelled':
        return { className: 'status-cancelled', icon: <FaTimesCircle />, text: 'Cancelled' };
      default:
        return { className: 'status-default', icon: null, text: status };
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error-message">
          <h2>Error Loading Order</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/delivery/dashboard')} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="not-found">
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/delivery/dashboard')} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <button className="back-button" onClick={() => navigate('/delivery/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="order-header">
          <div className="order-info">
            <h1>Order #{order._id.slice(-6)}</h1>
            <p className="order-date">
              {new Date(order.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`status-badge ${statusInfo.className}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
        </div>

        <div className="order-content">
          <div className="order-section locations-section">
            <h2>Delivery Information</h2>
            <div className="locations-grid">
              <div className="location-card">
                <div className="location-header">
                  <FaMapMarkerAlt className="location-icon restaurant" />
                  <h3>Pickup Location</h3>
                </div>
                <div className="location-details">
                  <p className="location-name">{order.restaurantName || 'Restaurant'}</p>
                  <p className="location-address">{formatAddress(order.restaurantAddress)}</p>
                  {delivery && delivery.pickedUpAt && (
                    <p className="time-info">
                      <span className="label">Picked up at:</span>
                      <span className="value">
                        {new Date(delivery.pickedUpAt).toLocaleTimeString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="location-card">
                <div className="location-header">
                  <FaMapMarkerAlt className="location-icon customer" />
                  <h3>Delivery Location</h3>
                </div>
                <div className="location-details">
                  <p className="location-name">{order.customerName || 'Customer'}</p>
                  <p className="location-address">{formatAddress(order.deliveryAddress)}</p>
                  <p className="contact-info">
                    <FaPhone className="icon" /> {order.contactNumber || 'N/A'}
                  </p>
                  {delivery && delivery.estimatedDeliveryTime && (
                    <p className="time-info">
                      <span className="label">Estimated delivery:</span>
                      <span className="value">
                        {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="order-section">
            <h2>Order Details</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-price">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {(order.totalAmount - order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method</span>
                <span>
                  {order.paymentMethod === 'credit_card' 
                    ? 'Credit/Debit Card' 
                    : order.paymentMethod === 'cash' 
                      ? 'Cash on Delivery'
                      : order.paymentMethod}
                </span>
              </div>
              {order.specialInstructions && (
                <div className="special-instructions">
                  <h4>Special Instructions:</h4>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="order-actions-section">
            <h2>Update Delivery Status</h2>
            
            {order.status === 'ready_for_pickup' && (
              <button 
                className="status-action-button picked-up"
                onClick={() => handleStatusUpdate('picked_up')}
                disabled={isUpdating}
              >
                {isUpdating ? <FaSpinner className="spinner" /> : null}
                {isUpdating ? 'Updating...' : 'Mark as Picked Up'}
              </button>
            )}
            
            {order.status === 'picked_up' && (
              <button 
                className="status-action-button out-for-delivery"
                onClick={() => handleStatusUpdate('out_for_delivery')}
                disabled={isUpdating}
              >
                {isUpdating ? <FaSpinner className="spinner" /> : null}
                {isUpdating ? 'Updating...' : 'Start Delivery'}
              </button>
            )}
            
            {order.status === 'out_for_delivery' && (
              <div className="action-buttons-row">
                <button 
                  className="status-action-button delivered"
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={isUpdating}
                >
                  {isUpdating ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                  {isUpdating ? 'Updating...' : 'Mark as Delivered'}
                </button>
                <button 
                  className="status-action-button cancelled"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                >
                  {isUpdating ? <FaSpinner className="spinner" /> : <FaTimesCircle />}
                  {isUpdating ? 'Updating...' : 'Cancel Delivery'}
                </button>
              </div>
            )}
            
            {(order.status === 'delivered' || order.status === 'cancelled') && (
              <p className="status-complete-message">
                {order.status === 'delivered' 
                  ? 'This order has been successfully delivered.'
                  : 'This order has been cancelled.'}
              </p>
            )}
          </div>

          <div className="customer-contact-section">
            <h2>Customer Contact</h2>
            <div className="contact-buttons">
              <a 
                href={`tel:${order.contactNumber}`} 
                className="contact-action-button call"
              >
                <FaPhone /> Call Customer
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(order.deliveryAddress))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-action-button map"
              >
                <FaMapMarkerAlt /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderDetail;