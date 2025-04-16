import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { createRestaurant, updateRestaurant, fetchRestaurantById } from '../../redux/slices/restaurantSlice';
import { toast } from 'react-toastify';
import { FiPlus, FiX, FiClock, FiMapPin, FiImage, FiInfo } from 'react-icons/fi';
import './RestaurantForm.css';

const RestaurantSchema = Yup.object().shape({
  name: Yup.string().required('Restaurant name is required'),
  description: Yup.string().required('Description is required'),
  cuisine: Yup.string().required('Cuisine type is required'),
  phone: Yup.string().required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  address: Yup.object().shape({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('Zip code is required'),
    country: Yup.string().required('Country is required'),
    coordinates: Yup.object().shape({
      latitude: Yup.number().nullable(),
      longitude: Yup.number().nullable(),
    }),
  }),
  openingHours: Yup.object().shape({
    monday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    tuesday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    wednesday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    thursday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    friday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    saturday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
    sunday: Yup.object().shape({
      open: Yup.string(),
      close: Yup.string(),
    }),
  }),
  images: Yup.array().of(Yup.string()),
  isOpen: Yup.boolean(),
});

const RestaurantForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, error, currentRestaurant } = useSelector((state) => state.restaurant);
  const isEditMode = !!id;
  
  const initialValues = {
    name: '',
    description: '',
    cuisine: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka',
      coordinates: {
        latitude: null,
        longitude: null,
      },
    },
    openingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' },
    },
    images: [''],
    isOpen: true,
  };
  
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchRestaurantById(id))
        .unwrap()
        .catch((error) => {
          toast.error(`Failed to fetch restaurant: ${error.message || 'Restaurant not found'}`);
          navigate('/restaurant/dashboard');
        });
    }
  }, [dispatch, id, isEditMode, navigate]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      values.images = values.images.filter(img => img.trim() !== '');
      
      if (isEditMode) {
        if (!currentRestaurant?._id) {
          toast.error('Restaurant ID not found');
          return;
        }
        await dispatch(updateRestaurant({ id: currentRestaurant._id, data: values })).unwrap();
        toast.success('Restaurant updated successfully!');
      } else {
        await dispatch(createRestaurant(values)).unwrap();
        toast.success('Restaurant created successfully!');
      }
      
      navigate('/restaurant/dashboard');
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} restaurant: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isEditMode && isLoading) {
    return (
      <div className="restaurant-form-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (isEditMode && error) {
    return (
      <div className="restaurant-form-container">
        <div className="error-alert">
          <FiInfo className="error-icon" />
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="restaurant-form-container">
      <div className="restaurant-form-header">
        <h2>{isEditMode ? 'Update Restaurant' : 'Create Restaurant'}</h2>
        <p className="form-description">
          {isEditMode 
            ? 'Update your restaurant details and settings'
            : 'Fill in the details to create your restaurant profile'}
        </p>
      </div>
      
      {error && (
        <div className="error-alert">
          <FiInfo className="error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="restaurant-form-card">
        <Formik
          initialValues={isEditMode ? currentRestaurant || initialValues : initialValues}
          validationSchema={RestaurantSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="restaurant-form">
              <div className="form-sections">
                {/* Basic Information Section */}
                <section className="form-section">
                  <div className="section-header">
                    <FiInfo className="section-icon" />
                    <h3>Basic Information</h3>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Restaurant Name *</label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter restaurant name"
                      />
                      <ErrorMessage name="name" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cuisine">Cuisine Type *</label>
                      <Field
                        type="text"
                        id="cuisine"
                        name="cuisine"
                        placeholder="e.g. Italian, Indian, Chinese"
                      />
                      <ErrorMessage name="cuisine" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="description">Description *</label>
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        placeholder="Describe your restaurant"
                        rows="3"
                      />
                      <ErrorMessage name="description" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <Field
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="+94 77 123 4567"
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="restaurant@example.com"
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="toggle-label">
                        <div className="toggle-switch">
                          <Field type="checkbox" name="isOpen" />
                          <span className="toggle-slider"></span>
                        </div>
                        <span className="toggle-text">Restaurant is currently open for orders</span>
                      </label>
                    </div>
                  </div>
                </section>
                
                {/* Address Section */}
                <section className="form-section">
                  <div className="section-header">
                    <FiMapPin className="section-icon" />
                    <h3>Address</h3>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="address.street">Street Address *</label>
                      <Field
                        type="text"
                        id="address.street"
                        name="address.street"
                        placeholder="Enter street address"
                      />
                      <ErrorMessage name="address.street" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address.city">City *</label>
                      <Field
                        type="text"
                        id="address.city"
                        name="address.city"
                        placeholder="Enter city"
                      />
                      <ErrorMessage name="address.city" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address.state">State/Province *</label>
                      <Field
                        type="text"
                        id="address.state"
                        name="address.state"
                        placeholder="Enter state/province"
                      />
                      <ErrorMessage name="address.state" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address.zipCode">Zip/Postal Code *</label>
                      <Field
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        placeholder="Enter zip/postal code"
                      />
                      <ErrorMessage name="address.zipCode" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address.country">Country *</label>
                      <Field
                        type="text"
                        id="address.country"
                        name="address.country"
                        placeholder="Enter country"
                      />
                      <ErrorMessage name="address.country" component="div" className="error-message" />
                    </div>
                  </div>
                </section>
                
                {/* Images Section */}
                <section className="form-section">
                  <div className="section-header">
                    <FiImage className="section-icon" />
                    <h3>Restaurant Images</h3>
                  </div>
                  
                  <FieldArray name="images">
                    {({ push, remove }) => (
                      <div className="images-container">
                        {values.images.map((image, index) => (
                          <div key={index} className="image-input-group">
                            <Field
                              type="text"
                              name={`images.${index}`}
                              placeholder="Image URL"
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="remove-image-btn"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => push('')}
                          className="add-image-btn"
                        >
                          <FiPlus className="btn-icon" />
                          Add Image URL
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </section>
                
                {/* Opening Hours Section */}
                <section className="form-section">
                  <div className="section-header">
                    <FiClock className="section-icon" />
                    <h3>Opening Hours</h3>
                  </div>
                  
                  <div className="hours-grid">
                    {Object.entries(values.openingHours).map(([day, hours]) => (
                      <div key={day} className="hours-card">
                        <div className="day-header">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                        <div className="hours-inputs">
                          <div className="time-input-group">
                            <label htmlFor={`openingHours.${day}.open`}>Open</label>
                            <Field
                              type="time"
                              id={`openingHours.${day}.open`}
                              name={`openingHours.${day}.open`}
                            />
                          </div>
                          <div className="time-input-group">
                            <label htmlFor={`openingHours.${day}.close`}>Close</label>
                            <Field
                              type="time"
                              id={`openingHours.${day}.close`}
                              name={`openingHours.${day}.close`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/restaurant/dashboard')}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="submit-btn"
                >
                  {isSubmitting || isLoading ? 'Saving...' : isEditMode ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RestaurantForm; 