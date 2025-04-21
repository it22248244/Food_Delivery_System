import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTruck, FaClock, FaMapMarkerAlt, FaPhone, FaUtensils } from 'react-icons/fa';
import { fetchOrderById } from '../../redux/slices/orderSlice';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentOrder, isLoading, error } = useSelector((state) => state.order);
  
  useEffect(() => {
    if (user && id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, user, id]);
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          className: 'status-pending',
          icon: <FaClock />,
          text: 'Pending'
        };
      case 'confirmed':
        return {
          className: 'status-confirmed',
          icon: <FaCheckCircle />,
          text: 'Confirmed'
        };
      case 'preparing':
        return {
          className: 'status-preparing',
          icon: <FaUtensils />,
          text: 'Preparing'
        };
      case 'ready_for_pickup':
        return {
          className: 'status-ready',
          icon: <FaCheckCircle />,
          text: 'Ready for Pickup'
        };
      case 'out_for_delivery':
        return {
          className: 'status-delivery',
          icon: <FaTruck />,
          text: 'Out for Delivery'
        };
      case 'delivered':
        return {
          className: 'status-delivered',
          icon: <FaCheckCircle />,
          text: 'Delivered'
        };
      case 'cancelled':
        return {
          className: 'status-cancelled',
          icon: <FaTimesCircle />,
          text: 'Cancelled'
        };
      default:
        return {
          className: 'status-pending',
          icon: <FaClock />,
          text: 'Unknown'
        };
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (!user) {
    return (
      <div className="order-detail-page">
        <div className="login-prompt">
          <h2>Please log in to view order details</h2>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="order-detail-page">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error-message">
          <h2>{error.message || 'Error loading order details'}</h2>
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button onClick={() => dispatch(fetchOrderById(id))}>Try Again</button>
        </div>
      </div>
    );
  }
  
  if (!currentOrder) {
    return (
      <div className="order-detail-page">
        <div className="not-found">
          <h2>Order not found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/orders')}>Back to Orders</button>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(currentOrder.status);
  
  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Orders
        </button>

        <div className="order-header">
          <div className="order-info">
            <h1>Order #{currentOrder.orderNumber || (id ? id.slice(-6) : 'N/A')}</h1>
            <p className="order-date">Placed on {formatDate(currentOrder.createdAt)}</p>
          </div>
          <div className={`status-badge ${statusInfo.className}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
        </div>
                
        <div className="order-content">
          <div className="order-section">
            <h2>Order Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Subtotal</span>
                <span className="value">Rs. {currentOrder.subtotal?.toFixed(2) || 
                  (currentOrder.totalAmount - currentOrder.deliveryFee - (currentOrder.tax || 0)).toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Delivery Fee</span>
                <span className="value">Rs. {currentOrder.deliveryFee?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Tax</span>
                <span className="value">Rs. {currentOrder.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-item total">
                <span className="label">Total</span>
                <span className="value">Rs. {currentOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="order-section">
            <h2>Items</h2>
            <div className="items-list">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">Rs. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <span>Quantity: {item.quantity}</span>
                    <span className="item-subtotal">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
                
          <div className="order-section">
            <h2>Delivery Information</h2>
            <div className="delivery-info">
              <div className="info-item">
                <span className="label">Delivery Address</span>
                <span className="value">
                  {currentOrder.deliveryAddress?.street}, {currentOrder.deliveryAddress?.city}, {currentOrder.deliveryAddress?.zipCode}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Contact Number</span>
                <span className="value">{currentOrder.contactNumber}</span>
              </div>
              {currentOrder.specialInstructions && (
                <div className="info-item">
                  <span className="label">Special Instructions</span>
                  <span className="value">{currentOrder.specialInstructions}</span>
                </div>
              )}
              {currentOrder.estimatedDeliveryTime && (
                <div className="info-item">
                  <span className="label">Estimated Delivery Time</span>
                  <span className="value">{formatDate(currentOrder.estimatedDeliveryTime)}</span>
                </div>
              )}
            </div>
          </div>
                
          <div className="order-section">
            <h2>Payment Information</h2>
            <div className="payment-info">
              <div className="info-item">
                <span className="label">Payment Method</span>
                <span className="value">
                  {currentOrder.paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 
                   currentOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : 
                   currentOrder.paymentMethod}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Payment Status</span>
                <span className={`value ${currentOrder.paymentStatus === 'paid' ? 'paid' : 'unpaid'}`}>
                  {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          {currentOrder.status === 'pending' && (
            <div className="order-actions">
              <button className="cancel-button" onClick={() => {
                // Add cancel order functionality here
                // dispatch(cancelOrder(currentOrder._id));
                alert('Order cancellation not implemented yet');
              }}>
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;