import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import RestaurantCard from './RestaurantCard'; // Import the fixed RestaurantCard component
import { mockApi } from '../../api/config'; // Import mockApi if real API isn't available

const CustomerRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // For now, use mock API data
        const response = await mockApi.getRestaurants();
        setRestaurants(response.data.restaurants || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'open' && restaurant.isOpen) ||
                          (filter === restaurant.cuisine);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search restaurants or cuisine..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <div className="flex-shrink-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Restaurants</option>
                <option value="open">Open Now</option>
                <option value="pizza">Pizza</option>
                <option value="burger">Burgers</option>
                <option value="chinese">Chinese</option>
                <option value="indian">Indian</option>
                <option value="italian">Italian</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Loading restaurants...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard 
                key={restaurant._id} 
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRestaurants;