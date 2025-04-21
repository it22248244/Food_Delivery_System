import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';
import { fetchOrderById, updateOrderStatus } from '../../redux/slices/orderSlice';
import { formatDate } from '../../utils/dateUtils';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, isLoading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Format address object to string
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    
    const { street, city, state, zipCode } = address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { className: 'status-pending', icon: <FaClock />, text: 'Pending' };
      case 'confirmed':
        return { className: 'status-confirmed', icon: <FaCheckCircle />, text: 'Confirmed' };
      case 'preparing':
        return { className: 'status-preparing', icon: <FaClock />, text: 'Preparing' };
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

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready_for_pickup';
      case 'ready_for_pickup':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  };

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
          <h2>Error</h2>
          <p>{error.message}</p>
          <button onClick={() => navigate('/restaurant/orders')}>Back to Orders</button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="order-detail-page">
        <div className="not-found">
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/restaurant/orders')}>Back to Orders</button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentOrder.status);
  const nextStatus = getNextStatus(currentOrder.status);

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <button className="back-button" onClick={() => navigate('/restaurant/orders')}>
          <FaArrowLeft /> Back to Orders
        </button>

        <div className="order-header">
          <div className="order-info">
            <h1>Order #{currentOrder._id.slice(-6)}</h1>
            <p className="order-date">{formatDate(currentOrder.createdAt)}</p>
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
                <span className="label">Customer</span>
                <span className="value">{currentOrder.customerName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Contact</span>
                <span className="value">{currentOrder.contactNumber}</span>
              </div>
              <div className="summary-item">
                <span className="label">Payment Method</span>
                <span className="value">{currentOrder.paymentMethod}</span>
              </div>
              <div className="summary-item">
                <span className="label">Payment Status</span>
                <span className={`value ${currentOrder.isPaid ? 'paid' : 'unpaid'}`}>
                  {currentOrder.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="summary-item total">
                <span className="label">Total Amount</span>
                <span className="value">Rs. {currentOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-section">
            <h2>Order Items</h2>
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
                <span className="value">{formatAddress(currentOrder.deliveryAddress)}</span>
              </div>
              <div className="info-item">
                <span className="label">Delivery Fee</span>
                <span className="value">Rs. {currentOrder.deliveryFee.toFixed(2)}</span>
              </div>
              {currentOrder.specialInstructions && (
                <div className="info-item">
                  <span className="label">Special Instructions</span>
                  <span className="value">{currentOrder.specialInstructions}</span>
                </div>
              )}
            </div>
          </div>

          {nextStatus && (
            <div className="order-actions">
              <button
                className="update-status-button"
                onClick={() => handleStatusUpdate(nextStatus)}
              >
                Mark as {getStatusInfo(nextStatus).text}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 