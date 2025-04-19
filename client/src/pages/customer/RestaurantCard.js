import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaStar, FaMotorcycle, FaClock } from 'react-icons/fa';

const RestaurantCard = ({ restaurant }) => {
  // Check if restaurant is undefined or null
  if (!restaurant) {
    return null; // Return null or a placeholder component
  }

  const {
    _id,
    name,
    cuisine,
    rating,
    images,
    address,
    isOpen,
    deliveryTime = '30-45 min', // Default value
  } = restaurant;

  // Function to render star ratings
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star filled" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half-filled" />);
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  return (
    <div className="restaurant-card">
      <Link to={`/restaurants/${_id}`}>
        <div className="restaurant-image">
          <img 
            src={images?.[0] || '/images/restaurant-placeholder.jpg'} 
            alt={name} 
            loading="lazy"
          />
          {isOpen ? (
            <span className="status-badge open">Open</span>
          ) : (
            <span className="status-badge closed">Closed</span>
          )}
        </div>
        
        <div className="restaurant-info">
          <h3 className="restaurant-name">{name}</h3>
          
          <div className="restaurant-meta">
            <div className="rating">
              {renderRatingStars(rating || 0)}
              <span className="rating-number">{rating || '0.0'}</span>
            </div>
          </div>
          
          <p className="cuisine">{cuisine}</p>
          
          <div className="restaurant-details">
            <div className="detail-item">
              <FaMotorcycle className="detail-icon" />
              <span>{deliveryTime}</span>
            </div>
            {address?.city && (
              <div className="detail-item">
                <span>{address.city}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    cuisine: PropTypes.string,
    rating: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      postalCode: PropTypes.string,
    }),
    isOpen: PropTypes.bool,
    deliveryTime: PropTypes.string,
  })
};

export default RestaurantCard;