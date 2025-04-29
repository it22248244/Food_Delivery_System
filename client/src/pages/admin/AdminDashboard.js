import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaUtensils, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCog, 
  FaFileInvoiceDollar, 
  FaBell,
  FaCheck,
  FaTimes,
  FaEye,
  FaSpinner,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, fetchAllRestaurants, approveRestaurant, rejectRestaurant } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector(state => state.auth);
  const { users, allRestaurants, isLoading, error } = useSelector(state => state.admin);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0
  });

  const [chartData, setChartData] = useState({
    revenueData: [],
    orderData: [],
    userData: []
  });
  
  // Get pending restaurants that need verification
  const pendingRestaurants = allRestaurants.filter(rest => 
    rest.status === 'pending' || !rest.isVerified
  );

  useEffect(() => {
    // Only fetch data if user is authenticated and has admin role
    if (isAuthenticated && user?.role === 'admin' && token) {
      // Fetch users and restaurants data
      dispatch(fetchAllUsers(token));
      dispatch(fetchAllRestaurants(token));
    }
  }, [dispatch, isAuthenticated, token, user?.role]);

  // Update stats and prepare chart data when data changes
  useEffect(() => {
    if (users.length && allRestaurants.length) {
      // Calculate statistics from fetched data
      const pendingCount = pendingRestaurants.length;
      const totalOrders = allRestaurants.reduce((acc, rest) => acc + (rest.totalOrders || 0), 0);
      const totalRevenue = allRestaurants.reduce((acc, rest) => acc + (rest.totalRevenue || 0), 0);

      // Prepare chart data
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleString('default', { month: 'short' });
      }).reverse();

      // Process revenue data
      const revenueData = last6Months.map(month => {
        const monthRevenue = allRestaurants.reduce((acc, rest) => {
          const restMonthRevenue = rest.monthlyRevenue?.[month] || 0;
          return acc + restMonthRevenue;
        }, 0);
        return monthRevenue;
      });

      // Process order data
      const orderData = last6Months.map(month => {
        const monthOrders = allRestaurants.reduce((acc, rest) => {
          const restMonthOrders = rest.monthlyOrders?.[month] || 0;
          return acc + restMonthOrders;
        }, 0);
        return monthOrders;
      });

      // Process user registration data
      const userData = last6Months.map(month => {
        return users.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.toLocaleString('default', { month: 'short' }) === month;
        }).length;
      });

      setChartData({
        revenueData,
        orderData,
        userData
      });

      setStats({
        totalUsers: users.length,
        totalRestaurants: allRestaurants.length,
        totalOrders,
        totalRevenue,
        pendingVerifications: pendingCount
      });
    }
  }, [users, allRestaurants, pendingRestaurants]);

  // Handle approve restaurant with loading state
  const [approvingId, setApprovingId] = useState(null);
  const handleApproveRestaurant = async (restaurantId) => {
    try {
      setApprovingId(restaurantId);
      await dispatch(approveRestaurant({ restaurantId, token })).unwrap();
    } catch (err) {
      console.error('Error approving restaurant:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Handle reject restaurant with loading state
  const [rejectingId, setRejectingId] = useState(null);
  const handleRejectRestaurant = async (restaurantId) => {
    try {
      setRejectingId(restaurantId);
      const reason = "Rejected by administrator";
      await dispatch(rejectRestaurant({ restaurantId, reason, token })).unwrap();
    } catch (err) {
      console.error('Error rejecting restaurant:', err);
    } finally {
      setRejectingId(null);
    }
  };

  // If not authenticated or not admin, show authentication error
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h3>Authentication Required</h3>
          <p>You need to be logged in as an admin to access this dashboard.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="admin-loading">
        <FaSpinner className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            <FaSpinner className="spinner" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-welcome">
          <p>Welcome back, {user?.name || 'Admin'}</p>
          <span className="current-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon restaurants">
            <FaUtensils />
          </div>
          <div className="stat-details">
            <h3>Restaurants</h3>
            <p className="stat-value">{stats.totalRestaurants}</p>
            <span className="stat-label">({stats.pendingVerifications} pending verification)</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders">
            <FaFileInvoiceDollar />
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">Rs. {stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-content-grid">
        <div className="admin-card pending-verifications">
          <div className="card-header">
            <h2>Pending Restaurant Verifications</h2>
            <span className="notification-badge">{stats.pendingVerifications}</span>
          </div>
          
          {pendingRestaurants.length > 0 ? (
            <div className="pending-list">
              {pendingRestaurants.map(restaurant => (
                <div key={restaurant._id} className="pending-item">
                  <div className="pending-info">
                    <h3>{restaurant.name}</h3>
                    <p>Owner: {restaurant.ownerName || restaurant.ownerId}</p>
                    <p className="submission-date">
                      Submitted: {new Date(restaurant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className={`approve-btn ${approvingId === restaurant._id ? 'loading' : ''}`}
                      onClick={() => handleApproveRestaurant(restaurant._id)}
                      disabled={approvingId === restaurant._id}
                    >
                      {approvingId === restaurant._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaCheck />
                      )}
                      {approvingId === restaurant._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button 
                      className={`reject-btn ${rejectingId === restaurant._id ? 'loading' : ''}`}
                      onClick={() => handleRejectRestaurant(restaurant._id)}
                      disabled={rejectingId === restaurant._id}
                    >
                      {rejectingId === restaurant._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaTimes />
                      )}
                      {rejectingId === restaurant._id ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/admin/restaurants/${restaurant._id}`)}
                    >
                      <FaEye />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaBell />
              <p>No pending restaurant verifications</p>
            </div>
          )}
        </div>

        <div className="admin-card revenue-chart">
          <div className="card-header">
            <h2>Revenue Overview</h2>
            <FaChartLine className="chart-icon" />
          </div>
          <div className="chart-container">
            {/* Revenue chart will be rendered here */}
            <div className="chart-placeholder">
              <FaChartBar />
              <p>Revenue data visualization will be shown here</p>
            </div>
          </div>
        </div>

        <div className="admin-card orders-chart">
          <div className="card-header">
            <h2>Orders Overview</h2>
            <FaChartPie className="chart-icon" />
          </div>
          <div className="chart-container">
            {/* Orders chart will be rendered here */}
            <div className="chart-placeholder">
              <FaChartBar />
              <p>Orders data visualization will be shown here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;