import React from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaLeaf } from 'react-icons/fa';
import Button from './Button';

const MenuItemCard = ({ menuItem, onAddToCart, isRestaurantOpen }) => {
  const { name, description, price, image, isAvailable, isVegetarian } = menuItem;
  
  const handleAddToCart = () => {
    if (isAvailable && isRestaurantOpen) {
      onAddToCart();
    }
  };
  
  return (
    <div className={`menu-item-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="menu-item-info">
        <div className="menu-item-details">
          <div className="menu-item-header">
            <h3 className="menu-item-name">{name}</h3>
            {isVegetarian && (
              <span className="vegetarian-badge" title="Vegetarian">
                <FaLeaf className="veg-icon" />
              </span>
            )}
          </div>
          
          <p className="menu-item-price">Rs. {price.toFixed(2)}</p>
          
          {description && (
            <p className="menu-item-description">{description}</p>
          )}
          
          {!isAvailable && (
            <p className="unavailable-message">Currently unavailable</p>
          )}
        </div>
        
        <div className="menu-item-action">
          <Button
            variant="primary"
            size="small"
            onClick={handleAddToCart}
            disabled={!isAvailable || !isRestaurantOpen}
            className="add-to-cart-button"
          >
            <FaPlus className="plus-icon" />
            <span className="add-text">Add</span>
          </Button>
        </div>
      </div>
      
      {image && (
        <div className="menu-item-image">
          <img src={image} alt={name} loading="lazy" />
        </div>
      )}
    </div>
  );
};

MenuItemCard.propTypes = {
  menuItem: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    isAvailable: PropTypes.bool,
    isVegetarian: PropTypes.bool,
    category: PropTypes.string,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isRestaurantOpen: PropTypes.bool.isRequired,
};

MenuItemCard.defaultProps = {
  isRestaurantOpen: true,
};

export default MenuItemCard;