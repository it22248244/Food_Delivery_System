import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaStar, FaClock, FaMotorcycle, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { fetchRestaurantById } from '../../redux/slices/restaurantSlice';
import useCart from '../../hooks/useCart';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { currentRestaurant, isLoading, error } = useSelector(state => state.restaurant);
  
  // Cart functionality
  const { 
    items, 
    restaurantId, 
    restaurantName, 
    addToCart, 
    cartTotals 
  } = useCart();
  
  // State variables
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuError, setMenuError] = useState(null);
  
  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        await dispatch(fetchRestaurantById(id)).unwrap();
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
      }
    };
    
    fetchRestaurantData();
  }, [id, dispatch]);
  
  // Extract menu categories when restaurant data loads
  useEffect(() => {
    if (currentRestaurant && currentRestaurant.menu && currentRestaurant.menu.length > 0) {
      // Extract unique categories
      const uniqueCategories = ['all'];
      currentRestaurant.menu.forEach(item => {
        if (item.category && !uniqueCategories.includes(item.category)) {
          uniqueCategories.push(item.category);
        }
      });
      setCategories(uniqueCategories);
    } else if (currentRestaurant && (!currentRestaurant.menu || currentRestaurant.menu.length === 0)) {
      setMenuError('No menu items available for this restaurant');
    }
  }, [currentRestaurant]);
  
  // Handle add to cart
  const handleAddToCart = (menuItem) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    
    // Check if restaurant is open
    if (currentRestaurant && !currentRestaurant.isOpen) {
      toast.error('This restaurant is currently closed');
      return;
    }
    
    // Check if adding from a different restaurant
    if (restaurantId && restaurantId !== currentRestaurant._id) {
      if (window.confirm("Your cart contains items from another restaurant. Would you like to clear your cart and add this item?")) {
        // Clear cart and add item
        addToCart(
          {
            _id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image,
          },
          1,
          currentRestaurant._id,
          currentRestaurant.name
        );
      }
    } else {
      // Add to cart normally
      addToCart(
        {
          _id: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
        },
        1,
        currentRestaurant._id,
        currentRestaurant.name
      );
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save favorites');
      navigate('/login');
      return;
    }
    
    setIsFavorite(!isFavorite);
    // In a real app, you would call an API to update favorites
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };
  
  // Filter menu by category
  const getFilteredMenu = () => {
    if (!currentRestaurant || !currentRestaurant.menu) return [];
    
    return activeCategory === 'all'
      ? currentRestaurant.menu
      : currentRestaurant.menu.filter(item => item.category === activeCategory);
  };
  
  // Handle view cart button
  const handleViewCart = () => {
    navigate('/cart');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="restaurant-detail-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading restaurant details...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="restaurant-detail-page">
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <Button onClick={() => navigate('/restaurants')}>
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }
  
  // Render if restaurant not found
  if (!currentRestaurant) {
    return (
      <div className="restaurant-detail-page">
        <div className="not-found-message">
          <h3>Restaurant Not Found</h3>
          <p>The restaurant you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }
  
  const filteredMenu = getFilteredMenu();
  
  return (
    <div className="restaurant-detail-page">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <div className="restaurant-cover">
          <img 
            src={currentRestaurant.images?.[0] || '/images/restaurant-cover-placeholder.jpg'} 
            alt={currentRestaurant.name} 
          />
          <div className="restaurant-cover-overlay"></div>
        </div>
        
        <div className="restaurant-info-container">
          <div className="restaurant-basic-info">
            <div>
              <h1>{currentRestaurant.name}</h1>
              <p className="cuisine">{currentRestaurant.cuisine}</p>
              
              <div className="restaurant-meta">
                <div className="rating">
                  <FaStar className="icon" />
                  <span>{currentRestaurant.rating || '0.0'}</span>
                </div>
                
                <div className="delivery-time">
                  <FaMotorcycle className="icon" />
                  <span>30-45 min</span>
                </div>
                
                {currentRestaurant.address && (
                  <div className="location">
                    <FaMapMarkerAlt className="icon" />
                    <span>
                      {[
                        currentRestaurant.address.street,
                        currentRestaurant.address.city,
                        currentRestaurant.address.state,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              className="favorite-button" 
              onClick={toggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <FaHeart className="favorite-icon active" />
              ) : (
                <FaRegHeart className="favorite-icon" />
              )}
            </button>
          </div>
          
          <div className="restaurant-status">
            {currentRestaurant.isOpen ? (
              <span className="status-badge open">Open Now</span>
            ) : (
              <span className="status-badge closed">Closed</span>
            )}
            
            <div className="hours">
              <FaClock className="icon" />
              <span>Hours: 10:00 AM - 10:00 PM</span>
            </div>
          </div>
          
          {currentRestaurant.description && (
            <div className="restaurant-description">
              <p>{currentRestaurant.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Menu Section */}
      <div className="menu-section">
        <div className="menu-categories">
          <div className="menu-categories-container">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {menuError ? (
          <div className="menu-error">
            <p>{menuError}</p>
          </div>
        ) : (
          <div className="menu-items-grid">
            {filteredMenu.map(menuItem => (
              <div key={menuItem._id} className="menu-item-card">
                {menuItem.image && (
                  <div className="menu-item-image">
                    <img src={menuItem.image} alt={menuItem.name} />
                  </div>
                )}
                <div className="menu-item-info">
                  <h3 className="menu-item-name">{menuItem.name}</h3>
                  <p className="menu-item-price">Rs. {menuItem.price.toFixed(2)}</p>
                  {menuItem.description && (
                    <p className="menu-item-description">{menuItem.description}</p>
                  )}
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(menuItem)}
                    disabled={!menuItem.isAvailable || !currentRestaurant.isOpen}
                  >
                    <FaShoppingCart className="cart-icon" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Cart Summary */}
      {isAuthenticated && items.length > 0 && restaurantId === currentRestaurant._id && (
        <div className="cart-summary">
          <div className="cart-info">
            <span className="cart-count">{cartTotals.itemCount} items</span>
            <span className="cart-total">Rs. {cartTotals.subtotal.toFixed(2)}</span>
          </div>
          <button className="view-cart-button" onClick={handleViewCart}>
            <FaShoppingCart className="cart-icon" />
            View Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;