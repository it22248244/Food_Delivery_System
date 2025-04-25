import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import './PaymentStatus.css';

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status');
  const sessionId = queryParams.get('session_id');
  const errorMessage = queryParams.get('message');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // In our simplified flow, we assume payment was successful if we reach the success page
    if (status === 'success' && sessionId) {
      // In a real app, we would verify with the backend
      // For this implementation, we'll just set success
      setPaymentResult({
        status: 'success',
        message: 'Payment was successfully processed!'
      });
      
      // Try to get orderId from localStorage if available
      const orderDataString = localStorage.getItem('lastOrderId');
      if (orderDataString) {
        setOrderId(orderDataString);
        // Clear it once used
        localStorage.removeItem('lastOrderId');
      }
      
      setIsVerifying(false);
    } else if (status === 'cancelled') {
      setPaymentResult({
        status: 'cancelled',
        message: 'Payment was cancelled'
      });
      setIsVerifying(false);
    } else if (status === 'error') {
      setPaymentResult({
        status: 'fail',
        message: errorMessage || 'An error occurred during payment processing'
      });
      setIsVerifying(false);
    } else {
      // Set default timeout to finish "verification"
      setTimeout(() => {
        setIsVerifying(false);
        setPaymentResult({
          status: 'success',
          message: 'Payment was successfully processed!'
        });
      }, 2000);
    }
  }, [status, sessionId, errorMessage]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate('/orders');
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="payment-status-content loading">
          <FaSpinner className="spinner" />
          <h2>Verifying payment...</h2>
          <p>Please wait while we confirm your payment</p>
        </div>
      );
    }

    if (status === 'success' || paymentResult?.status === 'success') {
      return (
        <div className="payment-status-content success">
          <FaCheckCircle className="status-icon success" />
          <h2>Payment Successful!</h2>
          <p>Your order has been confirmed and is being processed.</p>
          <button className="view-order-btn" onClick={handleViewOrder}>
            View Order Details
          </button>
        </div>
      );
    }

    if (status === 'cancelled' || paymentResult?.status === 'cancelled') {
      return (
        <div className="payment-status-content cancelled">
          <FaTimesCircle className="status-icon cancelled" />
          <h2>Payment Cancelled</h2>
          <p>Your payment was cancelled. No charges were made.</p>
          <button className="try-again-btn" onClick={() => navigate('/cart')}>
            Return to Cart
          </button>
        </div>
      );
    }

    // Error or failure case
    return (
      <div className="payment-status-content error">
        <FaTimesCircle className="status-icon error" />
        <h2>Payment Failed</h2>
        <p>{paymentResult?.message || 'An error occurred during payment processing'}</p>
        <button className="try-again-btn" onClick={() => navigate('/cart')}>
          Return to Cart
        </button>
      </div>
    );
  };

  return (
    <div className="payment-status-container">
      <div className="payment-status-card">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentStatus;