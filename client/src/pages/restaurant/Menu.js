import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import { 
  fetchRestaurantById, 
  addMenuItem, 
  updateMenuItem,
  deleteMenuItem,
  fetchRestaurantByOwnerId
} from '../../redux/slices/restaurantSlice';
import './Menu.css';

// Mock data for development
const mockCategories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides'];

const mockMenuItems = [
  {
    _id: '1',
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    category: 'Main Course',
    isAvailable: true,
    isVegetarian: true,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    _id: '2',
    name: 'Garlic Bread',
    description: 'Freshly baked bread with garlic butter and herbs',
    price: 5.99,
    category: 'Appetizers',
    isAvailable: true,
    isVegetarian: true,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    _id: '3',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'Desserts',
    isAvailable: true,
    isVegetarian: true,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    _id: '4',
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon',
    price: 3.99,
    category: 'Beverages',
    isAvailable: true,
    isVegetarian: true,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    _id: '5',
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    price: 4.99,
    category: 'Sides',
    isAvailable: true,
    isVegetarian: true,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

const MenuItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  category: Yup.string().required('Category is required'),
  isAvailable: Yup.boolean(),
  isVegetarian: Yup.boolean(),
  image: Yup.string(),
});

const Menu = () => {
  const dispatch = useDispatch();
  const { currentRestaurant, isLoading, error } = useSelector((state) => state.restaurant);
  const { user } = useSelector((state) => state.auth);
  
  // State variables
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Initial form values
  const initialFormValues = {
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    isVegetarian: false,
    image: ''
  };
  
  // Fetch restaurant data if not available
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!currentRestaurant && user) {
        try {
          // First try to get restaurant by owner ID
          await dispatch(fetchRestaurantByOwnerId(user._id)).unwrap();
        } catch (error) {
          toast.error('Failed to load restaurant data');
          console.error('Error fetching restaurant:', error);
        }
      }
    };

    fetchRestaurantData();
  }, [dispatch, currentRestaurant, user]);
  
  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        if (currentRestaurant && currentRestaurant.menu) {
          setMenuItems(currentRestaurant.menu);
          // Extract unique categories
          const uniqueCategories = ['all', ...new Set(currentRestaurant.menu.map(item => item.category))];
          setCategories(uniqueCategories);
        } else {
          setMenuItems([]);
          setCategories(['all']);
        }
      } catch (err) {
        toast.error('Failed to load menu items');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [currentRestaurant]);
  
  // Filter menu items based on category and search term
  const filteredMenuItems = menuItems.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Handle new category
      if (values.category === 'new' && values.newCategory) {
        values.category = values.newCategory;
        delete values.newCategory;
      }

      if (selectedItem) {
        // Update existing item
        await dispatch(updateMenuItem({
          restaurantId: currentRestaurant._id,
          menuItemId: selectedItem._id,
          menuItemData: values
        })).unwrap();
        toast.success('Menu item updated successfully');
      } else {
        // Add new item
        await dispatch(addMenuItem({
          restaurantId: currentRestaurant._id,
          menuItemData: values
        })).unwrap();
        toast.success('Menu item added successfully');
      }
      
      closeModals();
      resetForm();
    } catch (error) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Open add modal
  const handleAddItem = () => {
    setSelectedItem(null);
    setShowAddModal(true);
  };
  
  // Open edit modal
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };
  
  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };
  
  // Delete menu item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await dispatch(deleteMenuItem({
          restaurantId: currentRestaurant._id,
          menuItemId: itemId
        })).unwrap();
        toast.success('Menu item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete menu item');
        console.error('Error deleting menu item:', error);
      }
    }
  };
  
  // Toggle item availability
  const toggleItemAvailability = async (itemId) => {
    try {
      const item = menuItems.find(i => i._id === itemId);
      await dispatch(updateMenuItem({
        restaurantId: currentRestaurant._id,
        menuItemId: itemId,
        menuItemData: { ...item, isAvailable: !item.isAvailable }
      })).unwrap();
      toast.success('Item availability updated');
    } catch (error) {
      toast.error('Failed to update item availability');
      console.error('Error updating item availability:', error);
    }
  };
  
  // Render loading state
  if (loading || isLoading) {
    return (
      <div className="restaurant-menu-page">
        <div className="loading-spinner">Loading menu items...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="restaurant-menu-page">
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="reload-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Menu Management</h1>
        <button className="add-button" onClick={handleAddItem}>
          <FaPlus /> Add New Item
        </button>
      </div>
      
      <div className="menu-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="menu-grid">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map(item => (
            <div key={item._id} className="menu-item-card">
              <div className="item-header">
                <h3>{item.name}</h3>
                <div className="item-actions">
                  <button onClick={() => handleEditItem(item)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteItem(item._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="item-details">
                <span className="category">{item.category}</span>
                <span className="price">Rs. {item.price.toFixed(2)}</span>
              </div>
              <div className={`status-badge ${item.isAvailable ? 'available' : 'unavailable'}`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
          ))
        ) : (
          <div className="no-items-message">
            {searchTerm 
              ? 'No items match your search criteria.' 
              : activeCategory !== 'all'
              ? `No items in the ${activeCategory} category.`
              : 'No menu items found. Add your first item!'}
          </div>
        )}
      </div>
      
      {/* Add/Edit Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
            <Formik
              initialValues={selectedItem || initialFormValues}
              validationSchema={MenuItemSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, values }) => (
                <Form className="item-form">
                  <div className="form-group">
                    <label htmlFor="name">Item Name *</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="error-message"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="3"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Price ($) *</label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="price"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <Field
                        as="select"
                        id="category"
                        name="category"
                        className="form-input"
                      >
                        <option value="">Select a category</option>
                        {categories.filter(c => c !== 'all').map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="new">+ Add New Category</option>
                      </Field>
                      <ErrorMessage
                        name="category"
                        component="div"
                        className="error-message"
                      />
                      
                      {values.category === 'new' && (
                        <Field
                          type="text"
                          name="newCategory"
                          placeholder="Enter new category name"
                          className="form-input mt-2"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row checkboxes">
                    <div className="form-group checkbox-group">
                      <Field
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                      />
                      <label htmlFor="isAvailable">Available</label>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <Field
                        type="checkbox"
                        id="isVegetarian"
                        name="isVegetarian"
                      />
                      <label htmlFor="isVegetarian">Vegetarian</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <Field
                      type="text"
                      id="image"
                      name="image"
                      className="form-input"
                      placeholder="Enter image URL or leave blank for default"
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <Button type="button" variant="outline" onClick={closeModals}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : selectedItem ? 'Update Item' : 'Add Item'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;