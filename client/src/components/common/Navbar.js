// src/components/common/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Get nav links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <li>
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/restaurants" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Restaurants
            </Link>
          </li>
        </>
      );
    }

    if (user?.role === 'customer') {
      return (
        <>
          <li>
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/restaurants" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Restaurants
            </Link>
          </li>
          <li>
            <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              My Orders
            </Link>
          </li>
        </>
      );
    }

    if (user?.role === 'restaurant') {
      return (
        <>
          <li>
            <Link to="/restaurant/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/restaurant/menu" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Menu
            </Link>
          </li>
          <li>
            <Link to="/restaurant/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Orders
            </Link>
          </li>
        </>
      );
    }

    if (user?.role === 'delivery') {
      return (
        <>
          <li>
            <Link to="/delivery/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/delivery/history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              History
            </Link>
          </li>
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <li>
            <Link to="/admin/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Users
            </Link>
          </li>
          <li>
            <Link to="/admin/restaurants" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Restaurants
            </Link>
          </li>
          <li>
            <Link to="/admin/financial" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Financial
            </Link>
          </li>
        </>
      );
    }

    return null;
  };

  // Get auth section based on authentication status
  const getAuthSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
            Register
          </Link>
        </div>
      );
    }

    return (
      <div className="user-menu">
        {user?.role === 'customer' && (
          <Link to="/cart" className="cart-icon" onClick={() => setIsMenuOpen(false)}>
            <FaShoppingCart />
            {items.length > 0 && <span className="cart-badge">{items.length}</span>}
          </Link>
        )}
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <FaUser />
            <span>{user?.name}</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu show">
              <Link to="/profile" className="dropdown-item" onClick={() => {
                setIsDropdownOpen(false);
                setIsMenuOpen(false);
              }}>
                Profile
              </Link>
              <button onClick={() => {
                handleLogout();
                setIsDropdownOpen(false);
              }} className="dropdown-item">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FoodDelivery
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {getNavLinks()}
        </ul>

        {getAuthSection()}
      </div>
    </nav>
  );
};

export default Navbar;