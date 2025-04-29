import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUtensils, FaMotorcycle, FaRegClock, FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import apiService from '../../utils/api';
import useApi from '../../hooks/useApi';
import Button from '../../components/common/Button';
import HeroSlider from '../../components/common/HeroSlider';
import './HomePage.css';

// Mock data for development
const mockRestaurants = [
  {
    _id: '1',
    name: 'Spice Garden',
    cuisine: 'Indian',
    description: 'Authentic Indian cuisine with a modern twist. Specializing in tandoori dishes and rich curries.',
    rating: 4.5,
    priceRange: '$$',
    deliveryTime: '30-45 min',
    distance: '1.2',
    isOpen: true,
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    address: {
      street: '123 Curry Lane',
      city: 'Colombo',
      state: 'Western',
      zipCode: '00100',
      country: 'Sri Lanka'
    }
  },
  {
    _id: '2',
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    description: 'Handmade pasta and authentic Italian recipes passed down through generations.',
    rating: 4.8,
    priceRange: '$$$',
    deliveryTime: '25-40 min',
    distance: '0.8',
    isOpen: true,
    images: [
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    address: {
      street: '456 Pasta Street',
      city: 'Colombo',
      state: 'Western',
      zipCode: '00200',
      country: 'Sri Lanka'
    }
  },
  {
    _id: '3',
    name: 'Sushi Master',
    cuisine: 'Japanese',
    description: 'Fresh sushi and traditional Japanese dishes prepared by master chefs.',
    rating: 4.7,
    priceRange: '$$$',
    deliveryTime: '35-50 min',
    distance: '1.5',
    isOpen: true,
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    address: {
      street: '789 Sushi Avenue',
      city: 'Colombo',
      state: 'Western',
      zipCode: '00300',
      country: 'Sri Lanka'
    }
  },
  {
    _id: '4',
    name: 'Burger Haven',
    cuisine: 'American',
    description: 'Gourmet burgers and classic American comfort food.',
    rating: 4.3,
    priceRange: '$$',
    deliveryTime: '20-35 min',
    distance: '0.5',
    isOpen: true,
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    address: {
      street: '321 Burger Road',
      city: 'Colombo',
      state: 'Western',
      zipCode: '00400',
      country: 'Sri Lanka'
    }
  }
];

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [topCuisines, setTopCuisines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { loading, error } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real restaurants from the API
        const restaurantsData = await apiService.restaurants.getAll();
        const restaurants = restaurantsData.data.restaurants || [];
        
        // Set featured restaurants (for now, just use all restaurants)
        setFeaturedRestaurants(restaurants);

        // Extract unique cuisines from the restaurants
        const uniqueCuisines = [...new Set(restaurants.map(r => r.cuisine))];
        
        // Create cuisine objects with images
        const cuisineObjects = uniqueCuisines.map((cuisine, index) => ({
          id: index + 1,
          name: cuisine,
          image: restaurants.find(r => r.cuisine === cuisine)?.images?.[0] || '/images/cuisine-placeholder.jpg'
        }));
        
        setTopCuisines(cuisineObjects);
      } catch (err) {
        console.error('Error fetching home data:', err);
        // Fallback to mock data if API fails
        setFeaturedRestaurants(mockRestaurants);
        setTopCuisines([
          { 
            id: 1, 
            name: 'Italian', 
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          { 
            id: 2, 
            name: 'Chinese', 
            image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          { 
            id: 3, 
            name: 'Indian', 
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ]);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to restaurant listing with search query
    window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSlider />
      
      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for food or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Button type="submit" variant="primary" className="search-button">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FaSearch />
              </div>
              <h3>Find Food</h3>
              <p>Browse restaurants and cuisines near you</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaUtensils />
              </div>
              <h3>Place Order</h3>
              <p>Choose your favorite dishes and checkout</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaMotorcycle />
              </div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered within 30 minutes</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaRegClock />
              </div>
              <h3>Track Orders</h3>
              <p>Monitor your delivery in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="featured-restaurants-section">
        <div className="section-container">
          <h2 className="section-title">Featured Restaurants</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading restaurants...</div>
          ) : error ? (
            <div className="error-message">
              Could not load restaurants. Please try again later.
            </div>
          ) : (
            <div className="restaurant-grid">
              {featuredRestaurants.length > 0 ? (
                featuredRestaurants.map((restaurant) => (
                  <Link 
                    key={restaurant._id} 
                    to={`/restaurants/${restaurant._id}`}
                    className="restaurant-card"
                  >
                    <div className="restaurant-image">
                      <img 
                        src={restaurant.images?.[0] || '/images/restaurant-placeholder.jpg'} 
                        alt={restaurant.name} 
                      />
                      {restaurant.isOpen ? (
                        <span className="status-badge open">Open</span>
                      ) : (
                        <span className="status-badge closed">Closed</span>
                      )}
                    </div>
                    <div className="restaurant-info">
                      <h3>{restaurant.name}</h3>
                      <p className="cuisine">{restaurant.cuisine}</p>
                      <div className="restaurant-meta">
                        <span className="rating">
                          <FaStar /> {restaurant.rating || '0.0'}
                        </span>
                        <span className="delivery-time">
                          <FaClock /> {restaurant.deliveryTime}
                        </span>
                      </div>
                      <div className="restaurant-details">
                        <span className="price-range">{restaurant.priceRange}</span>
                        <span className="distance">
                          <FaMapMarkerAlt /> {restaurant.distance} miles
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-results">
                  <p>No featured restaurants available.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="view-all-container">
            <Link to="/restaurants" className="view-all-link">
              View All Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cuisines Section */}
      <section className="popular-cuisines-section">
        <div className="section-container">
          <h2 className="section-title">Popular Cuisines</h2>
          
          <div className="cuisines-grid">
            {topCuisines.map((cuisine) => (
              <Link 
                key={cuisine.id} 
                to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`} 
                className="cuisine-card"
              >
                <div className="cuisine-image">
                  <img 
                    src={cuisine.image || '/images/cuisine-placeholder.jpg'} 
                    alt={cuisine.name}
                  />
                </div>
                <h3>{cuisine.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Become a Delivery Partner</h2>
            <p>Join our network of delivery partners and earn competitive income on your own schedule.</p>
            <Link to="/register?role=delivery" className="cta-button">
              Sign Up as Delivery Partner
            </Link>
          </div>
          
          <div className="cta-content">
            <h2>Add Your Restaurant</h2>
            <p>Partner with us to increase your restaurant's visibility and boost your sales.</p>
            <Link to="/register?role=restaurant" className="cta-button">
              Register Your Restaurant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;