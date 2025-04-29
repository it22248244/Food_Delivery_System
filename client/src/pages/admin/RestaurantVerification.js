import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaTimes, FaInfoCircle, FaCalendarAlt, FaClock, FaUtensils } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRestaurants, approveRestaurant, rejectRestaurant } from '../../redux/slices/adminSlice';
import './RestaurantVerification.css';
import { toast } from 'react-toastify';

const RestaurantVerification = () => {
  const dispatch = useDispatch();
  const { allRestaurants, isLoading, error } = useSelector((state) => state.admin);
  const { token } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (token) {
      dispatch(fetchAllRestaurants(token));
    }
  }, [dispatch, token]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
    setActiveTab('basic');
  };

  const handleApprove = async (restaurantId) => {
    try {
      await dispatch(approveRestaurant({ restaurantId, token })).unwrap();
      
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      dispatch(fetchAllRestaurants(token));
      toast.success('Restaurant approved successfully');
    } catch (error) {
      console.error('Error approving restaurant:', error);
      toast.error(error.message || 'Failed to approve restaurant');
    }
  };

  const handleReject = async (restaurantId) => {
    if (!rejectionReason.trim()) {
      setSelectedRestaurant({ _id: restaurantId });
      setShowRejectModal(true);
      return;
    }

    try {
      await dispatch(rejectRestaurant({ restaurantId, reason: rejectionReason, token })).unwrap();
      setRejectionReason('');
      setShowRejectModal(false);
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      dispatch(fetchAllRestaurants(token));
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
    }
  };

  // Format opening hours for display
  const formatOpeningHours = (openingHours) => {
    if (!openingHours) return 'Not specified';
    
    const formattedHours = {};
    
    Object.keys(openingHours).forEach(day => {
      if (openingHours[day]?.open && openingHours[day]?.close) {
        formattedHours[day] = `${openingHours[day].open} - ${openingHours[day].close}`;
      } else {
        formattedHours[day] = 'Closed';
      }
    });
    
    return formattedHours;
  };

  // Helper function to determine restaurant status
  const getRestaurantStatus = (restaurant) => {
    if (restaurant.isVerified) {
      return 'approved';
    } else if (restaurant.rejectionReason) {
      return 'rejected';
    } else {
      return 'pending';
    }
  };

  // Filter restaurants based on search term and status
  const filteredRestaurants = allRestaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerId?.toString().includes(searchTerm.toLowerCase());

    const restaurantStatus = getRestaurantStatus(restaurant);
    const matchesStatus = filterStatus === 'all' || restaurantStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (!token) {
    return (
      <div className="restaurant-verification-page">
        <div className="error-message">
          <h3>Authentication Required</h3>
          <p>You need to be logged in as an admin to access this page.</p>
          <button onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="admin-loading">Loading restaurants...</div>;
  }

  if (error) {
    return (
      <div className="restaurant-verification-page">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchAllRestaurants(token))}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-verification-page">
      <div className="restaurant-verification-header">
        <h1>Restaurant Verification</h1>
        <p>Review and manage restaurant verification requests</p>
      </div>

      <div className="restaurant-verification-filter-bar">
        <div className="restaurant-verification-search-box">
          <FaSearch className="restaurant-verification-search-icon" />
          <input
            type="text"
            placeholder="Search restaurants by name, owner or cuisine"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="restaurant-verification-filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={handleFilterStatusChange}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="restaurant-verification-grid">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => {
            const status = getRestaurantStatus(restaurant);
            
            return (
              <div key={restaurant._id} className="restaurant-verification-card">
                <div className="restaurant-verification-card-header">
                  <h2>{restaurant.name}</h2>
                  <span className={`restaurant-verification-status-badge ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                <div className="restaurant-verification-info">
                  <p><strong>Owner ID:</strong> {restaurant.ownerId}</p>
                  <p><strong>Cuisine:</strong> {restaurant.cuisine || 'Not specified'}</p>
                  <p><strong>Location:</strong> {restaurant.address?.city || 'Not specified'}</p>
                  <p><strong>Menu Items:</strong> {restaurant.menu?.length || 0}</p>
                  <p><strong>Submitted:</strong> {new Date(restaurant.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="restaurant-verification-actions">
                  <button
                    className="restaurant-verification-view-button"
                    onClick={() => handleViewDetails(restaurant)}
                  >
                    <FaInfoCircle /> View Details
                  </button>

                  {status === 'pending' && (
                    <>
                      <button
                        className="restaurant-verification-approve-button"
                        onClick={() => handleApprove(restaurant._id)}
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        className="restaurant-verification-reject-button"
                        onClick={() => handleReject(restaurant._id)}
                      >
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">
            No restaurants found matching your criteria
          </div>
        )}
      </div>

      {/* Restaurant Details Modal */}
      {showDetailsModal && selectedRestaurant && (
        <div className="modal-overlay">
          <div className="modal-content restaurant-details-modal">
            <h2>{selectedRestaurant.name}</h2>
            <div className="modal-tabs">
              <button 
                className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button 
                className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`}
                onClick={() => setActiveTab('hours')}
              >
                <FaClock /> Opening Hours
              </button>
              <button 
                className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <FaUtensils /> Menu
              </button>
            </div>
            
            {activeTab === 'basic' && (
              <div className="details-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedRestaurant.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Owner ID</label>
                    <span>{selectedRestaurant.ownerId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cuisine</label>
                    <span>{selectedRestaurant.cuisine || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${getRestaurantStatus(selectedRestaurant)}`}>
                      {getRestaurantStatus(selectedRestaurant).charAt(0).toUpperCase() + 
                       getRestaurantStatus(selectedRestaurant).slice(1)}
                    </span>
                  </div>
                  
                  <div className="detail-item full-width">
                    <label>Description</label>
                    <span>{selectedRestaurant.description || 'No description provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedRestaurant.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{selectedRestaurant.phone}</span>
                  </div>
                  
                  <div className="detail-item full-width">
                    <label>Address</label>
                    <span>
                      {selectedRestaurant.address?.street}, {selectedRestaurant.address?.city}, {selectedRestaurant.address?.state}, {selectedRestaurant.address?.zipCode}, {selectedRestaurant.address?.country}
                    </span>
                  </div>
                  
                  {selectedRestaurant.images && selectedRestaurant.images.length > 0 && (
                    <div className="detail-item full-width">
                      <label>Restaurant Images</label>
                      <div className="image-gallery">
                        {selectedRestaurant.images.map((image, index) => (
                          <div key={index} className="restaurant-image">
                            <img src={image} alt={`${selectedRestaurant.name} - Image ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'hours' && (
              <div className="details-section">
                <h3>Opening Hours</h3>
                {selectedRestaurant.openingHours ? (
                  <div className="opening-hours-grid">
                    {Object.entries(formatOpeningHours(selectedRestaurant.openingHours)).map(([day, hours]) => (
                      <div key={day} className="opening-hours-item">
                        <div className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                        <div className="hours">{hours}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">No opening hours specified</p>
                )}
              </div>
            )}
            
            {activeTab === 'menu' && (
              <div className="details-section">
                <h3>Menu Items</h3>
                {selectedRestaurant.menu && selectedRestaurant.menu.length > 0 ? (
                  <div className="menu-items-list">
                    {selectedRestaurant.menu.map((item, index) => (
                      <div key={index} className="menu-item">
                        <div className="menu-item-header">
                          <h4>{item.name}</h4>
                          <span className="menu-item-price">LKR {item.price.toFixed(2)}</span>
                        </div>
                        <div className="menu-item-details">
                          <p className="menu-item-description">{item.description || 'No description provided'}</p>
                          <div className="menu-item-meta">
                            <span className="menu-item-category">Category: {item.category}</span>
                            <span className={`menu-item-availability ${item.isAvailable ? 'available' : 'unavailable'}`}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        {item.image && (
                          <div className="menu-item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">No menu items available</p>
                )}
              </div>
            )}

            <div className="modal-actions">
              {getRestaurantStatus(selectedRestaurant) === 'pending' && (
                <>
                  <button
                    className="approve-button"
                    onClick={() => handleApprove(selectedRestaurant._id)}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleReject(selectedRestaurant._id)}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
              <button
                className="close-button"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedRestaurant && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reject Restaurant</h2>
            <p>Please provide a reason for rejecting this restaurant</p>
            
            <div className="form-group">
              <label htmlFor="rejection-reason">Reason for Rejection</label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                required
              />
            </div>
            
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
              
              <button
                className="confirm-reject-button"
                onClick={() => handleReject(selectedRestaurant._id)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantVerification;