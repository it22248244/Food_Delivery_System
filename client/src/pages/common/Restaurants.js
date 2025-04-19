import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar, FaClock, FaMotorcycle, FaMapMarkerAlt } from 'react-icons/fa';
import apiService from '../../utils/api';
import useApi from '../../hooks/useApi';
import './Restaurants.css';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const { loading, error } = useApi();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const search = searchParams.get('search');
        const cuisine = searchParams.get('cuisine');

        if (search) setSearchQuery(search);
        if (cuisine) setSelectedCuisine(cuisine);

        const restaurantsData = await apiService.restaurants.getAll();
        setRestaurants(restaurantsData.data.restaurants || []);
        setFilteredRestaurants(restaurantsData.data.restaurants || []);
        setCuisines([...new Set(restaurantsData.data.restaurants.map(r => r.cuisine))]);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setRestaurants([]);
        setFilteredRestaurants([]);
        setCuisines([]);
      }
    };

    fetchData();
  }, [location]);

  // Filter restaurants based on search and filters
  useEffect(() => {
    let filtered = [...restaurants];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply cuisine filter
    if (selectedCuisine) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine === selectedCuisine
      );
    }

    // Apply price filter
    if (selectedPrice) {
      filtered = filtered.filter(restaurant =>
        restaurant.priceRange === selectedPrice
      );
    }

    // Apply rating filter
    if (selectedRating) {
      filtered = filtered.filter(restaurant =>
        Math.floor(restaurant.rating) >= parseInt(selectedRating)
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCuisine, selectedPrice, selectedRating, restaurants]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    params.set('search', searchQuery);
    window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
  };

  return (
    <div className="restaurants-page">
      {/* Header Section */}
      <div className="restaurants-header">
        <h1>Restaurants</h1>
        <p>Discover and order from the best restaurants in your area</p>
      </div>

      {/* Search and Filters Section */}
      <div className="search-filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="cuisine-filter">Cuisine</label>
            <select
              id="cuisine-filter"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="filter-select"
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price-filter">Price Range</label>
            <select
              id="price-filter"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="filter-select"
            >
              <option value="">All Prices</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
              <option value="$$$$">$$$$</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rating-filter">Minimum Rating</label>
            <select
              id="rating-filter"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="restaurants-grid">
        {loading ? (
          <div className="loading-spinner">Loading restaurants...</div>
        ) : error ? (
          <div className="error-message">
            Could not load restaurants. Please try again later.
          </div>
        ) : filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
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
                    <FaClock /> 30-45 min
                  </span>
                </div>
                <div className="restaurant-details">
                  <span className="price-range">{restaurant.priceRange || '$$'}</span>
                  <span className="distance">
                    <FaMapMarkerAlt /> {restaurant.distance || '1.2'} miles
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results">
            <p>No restaurants found matching your criteria.</p>
            <button
              className="clear-filters-button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('');
                setSelectedPrice('');
                setSelectedRating('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants; 