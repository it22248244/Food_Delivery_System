import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';
import { createOrder } from '../../redux/slices/orderSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import './FakeStripePayment.css';

const FakeStripePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const amount = queryParams.get('amount');
  const orderPending = queryParams.get('order_pending') === 'true';
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!sessionId || !amount) {
      navigate('/');
    }
  }, [sessionId, amount, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    // Simple validation for card number (16 digits)
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16 || !/^\d+$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Validate expiry date (MM/YY format)
    if (!expiryDate.trim() || !expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    // Validate CVV (3 or 4 digits)
    if (!cvv.trim() || cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV code';
    }
    
    // Validate cardholder name
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    // Format card number with spaces after every 4 digits
    const input = e.target.value.replace(/\s/g, '');
    const formatted = input.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 2) {
      setExpiryDate(input);
    } else {
      setExpiryDate(`${input.slice(0, 2)}/${input.slice(2, 4)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // If order is pending (saved in sessionStorage), create it now
      if (orderPending) {
        // Get the pending order data from sessionStorage
        const pendingOrderData = JSON.parse(sessionStorage.getItem('pendingOrderData'));
        
        if (!pendingOrderData) {
          toast.error('Order data not found. Please try again.');
          navigate('/cart');
          return;
        }
        
        // Create the order
        const result = await dispatch(createOrder(pendingOrderData)).unwrap();
        
        // Show success message
        toast.success('Payment successful! Order placed.');
        
        // Clear cart and session storage
        dispatch(clearCart());
        sessionStorage.removeItem('pendingOrderData');
        
        // Navigate to order success page
        navigate(`/payment/success?session_id=${sessionId}`);
      } else {
        // For standalone payments (not from checkout)
        // Simulate payment processing delay
        setTimeout(() => {
          // Navigate to success page
          navigate(`/payment/success?session_id=${sessionId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment processing failed. Please try again.');
      navigate('/payment/status?status=error&message=Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fake-stripe-container">
      <div className="fake-stripe-header">
        <div className="stripe-logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" />
        </div>
        <h2>Complete your payment</h2>
        <div className="payment-amount">${parseFloat(amount).toFixed(2)}</div>
      </div>
      
      <div className="fake-stripe-form-container">
        <form className="fake-stripe-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Card number</label>
            <div className="input-with-icon">
              <FaCreditCard className="input-icon" />
              <input 
                type="text" 
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Expiry date</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input 
                  type="text" 
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              {errors.expiryDate && <div className="error-message">{errors.expiryDate}</div>}
            </div>
            
            <div className="form-group">
              <label>CVV</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input 
                  type="text" 
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
              {errors.cvv && <div className="error-message">{errors.cvv}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Cardholder name</label>
            <input 
              type="text" 
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Smith"
            />
            {errors.cardholderName && <div className="error-message">{errors.cardholderName}</div>}
          </div>
          
          <button 
            type="submit" 
            className="pay-button" 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay $${parseFloat(amount).toFixed(2)}`}
          </button>
        </form>
        
        <div className="secure-payment-info">
          <FaLock /> Secure payment processing
        </div>
      </div>
    </div>
  );
};

export default FakeStripePayment;