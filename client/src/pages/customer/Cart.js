import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaTrash, FaMinus, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { removeItem, updateQuantity } from '../../redux/slices/cartSlice';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate total using useMemo to avoid unnecessary recalculations
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeItem(itemId));
    toast.success('Item removed from cart');
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    setIsLoading(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false);
      navigate('/checkout');
    }, 1000);
  };
  
  // Return to previous page
  const handleBackClick = () => {
    navigate('/restaurants');
  };
  
  // Render empty cart state
  if (items.length === 0) {
    return (
      <div className="food-cart-page">
        <div className="food-cart-header">
          <h1>Your Cart</h1>
        </div>
        
        <div className="food-cart-empty">
          <div className="food-cart-empty-icon">
            🛒
          </div>
          <h2>Your cart is empty</h2>
          <p>Add items from a restaurant to get started</p>
          <Link to="/restaurants" className="food-cart-browse-link">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="food-cart-page">
      <div className="food-cart-header">
        <button className="food-cart-back-button" onClick={handleBackClick}>
          <FaChevronLeft />
          <span>Back to Restaurants</span>
        </button>
        <h1>Your Cart</h1>
      </div>
      
      <div className="food-cart-container">
        <div className="food-cart-items-container">
          <div className="food-cart-restaurant-info">
            <h2>{items[0]?.restaurantName || 'Restaurant Name'}</h2>
            <p>Delivery time: 30-45 min</p>
          </div>
          
          <div className="food-cart-items-list">
            {items.map((item) => (
              <div key={item._id} className="food-cart-item">
                <div className="food-cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="food-cart-no-image">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="food-cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="food-cart-restaurant-name">{item.restaurantName}</p>
                  <p className="food-cart-price">Rs. {item.price.toFixed(2)}</p>
                </div>
                
                <div className="food-cart-quantity">
                  <button 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    className="food-cart-quantity-button"
                  >
                    <FaMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    className="food-cart-quantity-button"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <div className="food-cart-item-total">
                  <p>Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => handleRemoveItem(item._id)}
                    className="food-cart-remove-button"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="food-cart-special-instructions">
            <label htmlFor="instructions">Special Instructions</label>
            <textarea 
              id="instructions" 
              placeholder="Add notes for the restaurant (allergies, dietary restrictions, etc.)"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="food-cart-summary-container">
          <div className="food-cart-summary">
            <h2>Order Summary</h2>
            
            <div className="food-cart-summary-row">
              <span>Subtotal</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            
            <div className="food-cart-summary-row">
              <span>Delivery Fee</span>
              <span>Rs. 2.99</span>
            </div>
            
            <div className="food-cart-summary-row total">
              <span>Total</span>
              <span>Rs. {(total + 2.99).toFixed(2)}</span>
            </div>
            
            <button 
              className="food-cart-checkout-button"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <div className="food-cart-note">
              <FaInfoCircle className="info-icon" />
              <p>
                You can modify your order until the restaurant begins preparing it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;