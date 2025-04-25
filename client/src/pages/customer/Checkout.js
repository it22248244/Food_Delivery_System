import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaCheck } from 'react-icons/fa';
import { createOrder } from '../../redux/slices/orderSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, restaurantId, restaurantName } = useSelector((state) => state.cart);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to continue with checkout');
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Get user's default address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setDeliveryAddress(defaultAddress.street || '');
      setCity(defaultAddress.city || '');
      setPostalCode(defaultAddress.postalCode || '');
    }
  }, [user]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? 150 : 0; // Standard delivery fee
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + deliveryFee + tax;
    
    return {
      subtotal,
      deliveryFee,
      tax,
      total
    };
  }, [items]);

  const steps = [
    { id: 1, title: 'Delivery Address' },
    { id: 2, title: 'Payment Method' },
    { id: 3, title: 'Review Order' }
  ];

  // Validate current step before proceeding
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!deliveryAddress.trim() || !city.trim() || !postalCode.trim() || !contactNumber.trim()) {
          toast.error('Please fill all delivery information fields');
          return false;
        }
        return true;
      case 2:
        if (!paymentMethod) {
          toast.error('Please select a payment method');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Handle next step button click
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Validate all form fields before submission
  const validateForm = () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return false;
    }
    if (!city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!postalCode.trim()) {
      toast.error('Please enter postal code');
      return false;
    }
    if (!contactNumber.trim()) {
      toast.error('Please enter contact number');
      return false;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }
    return true;
  };

  // Handle place order button click
  const handlePlaceOrder = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Prevent duplicate submissions
  if (isProcessing) return;
  
  setIsProcessing(true);
  
  try {
    // Create full delivery address string
    const fullDeliveryAddress = {
      street: deliveryAddress,
      city: city,
      state: "Sri Lanka", // Setting a default state value instead of empty string
      zipCode: postalCode,
    };
    
    // Prepare order data
    const orderData = {
      restaurantId,
      restaurantName,
      items: items.map(item => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cartTotals.total,
      deliveryAddress: fullDeliveryAddress,
      deliveryFee: cartTotals.deliveryFee,
      paymentMethod,
      contactNumber,
      specialInstructions,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax
    };
    
    console.log('Submitting order with data:', orderData);
    
    // If payment method is card, navigate to FakeStripePayment before creating the order
    if (paymentMethod === 'card') {
      // Store order data in sessionStorage to retrieve it after payment
      sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
      
      // Generate a fake session ID
      const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Navigate to payment page with parameters
      navigate(`/payment/checkout?session_id=${sessionId}&amount=${cartTotals.total}&order_pending=true`);
      return;
    }
    
    // For non-card payments, proceed with order creation as usual
    const result = await dispatch(createOrder(orderData)).unwrap();
    
    // Show success message
    toast.success('Order placed successfully!');
    
    // Clear cart
    dispatch(clearCart());
    
    // Navigate to order detail page
    navigate(`/orders/${result.data.order._id}`);
  } catch (error) {
    console.error('Order placement error:', error);
    
    if (error.status === 401) {
      // Token expired or invalid
      toast.error('Your session has expired. Please log in again.');
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      toast.error(error.message || 'Failed to place order. Please try again.');
    }
  } finally {
    setIsProcessing(false);
  }
};

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }
  
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checkout</p>
          <button onClick={() => navigate('/restaurants')}>Browse Restaurants</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Cart
        </button>

        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="steps">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`step ${currentStep === step.id ? 'active' : ''} ${
                  currentStep > step.id ? 'completed' : ''
                }`}
              >
                <div className="step-number">
                  {currentStep > step.id ? <FaCheck /> : step.id}
                </div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
                    
        <div className="checkout-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Delivery Address</h2>
              <div className="address-form">
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input 
                    type="text" 
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter your postal code" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input 
                    type="tel" 
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Special Instructions (Optional)</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Add any special delivery instructions here"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="step-content">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <div 
                  className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard />
                  <span>Credit/Debit Card</span>
                </div>
                <div
                  className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FaMapMarkerAlt />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="step-content">
              <h2>Review Order</h2>
              <div className="restaurant-info">
                <h3>{restaurantName}</h3>
              </div>
              <div className="order-summary">
                <div className="summary-section">
                  <h3>Delivery Details</h3>
                  <div className="delivery-details">
                    <p><strong>Address:</strong> {deliveryAddress}, {city}, {postalCode}</p>
                    <p><strong>Contact:</strong> {contactNumber}</p>
                    {specialInstructions && (
                      <p><strong>Instructions:</strong> {specialInstructions}</p>
                    )}
                  </div>
                </div>
                
                <div className="summary-section">
                  <h3>Payment Method</h3>
                  <p>{paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
                </div>
                
                <div className="summary-section">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {items.map((item) => (
                      <div key={item._id} className="item">
                        <div className="item-info">
                          <span className="item-quantity">{item.quantity}x</span>
                          <h4>{item.name}</h4>
                        </div>
                        <div className="item-price">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-total-section">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>Rs. {cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Delivery Fee</span>
                    <span>Rs. {cartTotals.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (15%)</span>
                    <span>Rs. {cartTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>Rs. {cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
            
        <div className="checkout-actions">
          {currentStep > 1 && (
            <button
              className="secondary-button"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              className="primary-button"
              onClick={handleNextStep}
            >
              Next
            </button>
          ) : (
            <button
              className="primary-button"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;