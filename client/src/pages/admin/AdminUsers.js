import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaCheck, FaTimes, FaUserLock, FaUserCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUser, deleteUser } from '../../redux/slices/adminSlice';
import './AdminUsers.css';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector(state => state.admin);
  const { token } = useSelector(state => state.auth); // Get auth token from Redux store
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  
  useEffect(() => {
    // Check if token exists before making the API call
    if (token) {
      dispatch(fetchAllUsers(token));
    }
  }, [dispatch, token]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };
  
  // Open edit modal
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setShowEditModal(true);
  };
  
  // Handle edit form input change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    
    if (currentUser && token) {
      dispatch(updateUser({
        userId: currentUser._id,
        userData: editForm,
        token
      }));
      
      // Close modal after submission
      setShowEditModal(false);
      setCurrentUser(null);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.') && token) {
      dispatch(deleteUser({ userId, token }));
    }
  };
  
  // Toggle user status (activate/deactivate)
  const handleToggleStatus = (user) => {
    if (!token) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    dispatch(updateUser({
      userId: user._id,
      userData: { status: newStatus },
      token
    }));
  };
  
  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    // Filter by role
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  // If no token, show authentication error
  if (!token) {
    return (
      <div className="admin-users-page">
        <div className="error-message">
          <h3>Authentication Required</h3>
          <p>You need to be logged in as an admin to access this page.</p>
          <button onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1>User Management</h1>
        <p>View and manage user accounts</p>
      </div>
      
      <div className="admin-users-filters">
        <div className="admin-users-search-box">
          <FaSearch className="admin-users-search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email or phone"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="admin-users-filter-controls">
          <div className="admin-users-filter-item">
            <label htmlFor="role-filter">Filter by Role</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={handleRoleFilterChange}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="restaurant">Restaurant Owners</option>
              <option value="delivery">Delivery Personnel</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="admin-users-loading-spinner">Loading users...</div>
      ) : error ? (
        <div className="admin-users-error-message">
          <h3>Error loading users</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(fetchAllUsers(token))}>Try Again</button>
        </div>
      ) : (
        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id} className={user.status === 'inactive' ? 'admin-users-inactive-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`admin-users-role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-users-status-badge ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td className="admin-users-action-buttons">
                      <button 
                        className="admin-users-edit-button"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      
                      <button 
                        className={`admin-users-status-toggle-button ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(user)}
                        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.status === 'active' ? <FaUserLock /> : <FaUserCheck />}
                      </button>
                      
                      <button 
                        className="admin-users-delete-button"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="admin-users-no-results">
                    No users found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="admin-users-modal-overlay">
          <div className="admin-users-modal-content">
            <h2>Edit User</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="admin-users-form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="admin-users-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="admin-users-form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="admin-users-form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={editForm.role}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant Owner</option>
                  <option value="delivery">Delivery Personnel</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="admin-users-modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-users-save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;