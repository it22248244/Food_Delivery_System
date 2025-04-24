const Delivery = require('../models/Delivery');
const axios = require('axios');
const config = require('../config/config');

// Get available delivery personnel
exports.getAvailableDeliveryPersonnel = async (req, res) => {
  try {
    // Fetch users with delivery role from user service
    const response = await axios.get(
      `${config.servicesEndpoints.userService}/api/v1/users/delivery-personnel`,
      { headers: { Authorization: req.headers.authorization } }
    );

    const deliveryPersons = response.data.data.users.map(user => ({
      _id: user._id,
      name: user.name,
      phoneNumber: user.phone,
      currentLocation: user.currentLocation,
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber,
      rating: user.rating
    }));

    res.status(200).json({
      status: 'success',
      data: {
        deliveryPersons
      }
    });
  } catch (error) {
    console.error('Error fetching delivery personnel:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to fetch delivery personnel'
    });
  }
};

// Assign delivery person to an order
// Assign delivery person to an order
exports.assignDelivery = async (req, res) => {
  try {
    const { orderId, restaurantId, deliveryPersonId } = req.body;
    
    // Check if all required fields are provided
    if (!orderId || !restaurantId || !deliveryPersonId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order ID, restaurant ID, and delivery person ID are required'
      });
    }
    
    // Allow delivery person to assign themselves
    if (req.user.role === 'delivery' && req.user.id !== deliveryPersonId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only assign orders to yourself'
      });
    }
    
    // Get order information to obtain delivery address
    let orderData;
    try {
      const orderResponse = await axios.get(
        `${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      orderData = orderResponse.data.data.order;
    } catch (error) {
      console.error('Error fetching order data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    // Get restaurant information
    let restaurantData;
    try {
      const response = await axios.get(
        `${config.servicesEndpoints.restaurantService}/api/v1/restaurants/${restaurantId}`
      );
      restaurantData = response.data.data.restaurant;
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      return res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      });
    }

    // Create delivery record
    const deliveryData = {
      orderId,
      userId: orderData.userId, // Add user ID from order
      restaurantId,
      deliveryPersonId,
      deliveryAddress: orderData.deliveryAddress, // Add delivery address from order
      restaurantAddress: restaurantData.address,
      currentLocation: restaurantData.address.coordinates,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    };
    
    const delivery = await Delivery.create(deliveryData);
    
    // Also update the order status to out_for_delivery
    try {
      await axios.patch(
        `${config.servicesEndpoints.orderService}/api/v1/orders/${orderId}/status`,
        { status: 'out_for_delivery' },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      // Continue even if update fails
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        delivery
      }
    });
  } catch (error) {
    console.error('Error in assignDelivery:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, currentLocation } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Status is required'
      });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        status: 'fail',
        message: 'No delivery found with that ID'
      });
    }
    
    // Check if user is the assigned delivery person
    if (delivery.deliveryPersonId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this delivery'
      });
    }
    
    // Update delivery status
    delivery.status = status;
    
    // Update current location if provided
    if (currentLocation) {
      delivery.currentLocation = {
        type: 'Point',
        coordinates: [currentLocation.longitude, currentLocation.latitude]
      };
    }
    
    // Update timestamps based on status
    if (status === 'picked_up') {
      delivery.pickedUpAt = Date.now();
    } else if (status === 'delivered') {
      delivery.deliveredAt = Date.now();
      delivery.actualDeliveryTime = Date.now();
      
      // Update delivery person status to available
      try {
        await axios.patch(
          `${config.servicesEndpoints.userService}/api/v1/users/${delivery.deliveryPersonId}`,
          { isAvailable: true },
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (error) {
        console.error('Error updating delivery person status:', error);
        // Continue even if status update fails
      }
      
      // Update order status to delivered
      try {
        await axios.patch(
          `${config.servicesEndpoints.orderService}/api/v1/orders/${delivery.orderId}/status`,
          { status: 'delivered' },
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (error) {
        console.error('Error updating order status:', error);
        // Continue even if order update fails
      }
    }
    
    await delivery.save();
    
    // Send notification about delivery status update
    try {
      await axios.post(
        `${config.servicesEndpoints.notificationService}/api/v1/notifications/delivery-status`,
        {
          deliveryId: delivery._id,
          orderId: delivery.orderId,
          userId: delivery.userId,
          status: delivery.status,
          currentLocation: delivery.currentLocation
        }
      );
    } catch (error) {
      console.error('Error sending delivery status notification:', error);
      // Continue even if notification fails
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        delivery
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get delivery status for an order
exports.getDeliveryByOrder = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ orderId: req.params.orderId });
    
    if (!delivery) {
      return res.status(404).json({
        status: 'fail',
        message: 'No delivery found for this order'
      });
    }
    
    // Get delivery person details from user service
    let deliveryPerson;
    try {
      const response = await axios.get(
        `${config.servicesEndpoints.userService}/api/v1/users/${delivery.deliveryPersonId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      deliveryPerson = response.data.data.user;
    } catch (error) {
      console.error('Error fetching delivery person details:', error);
      deliveryPerson = null;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        delivery,
        deliveryPerson: deliveryPerson ? {
          name: deliveryPerson.name,
          phone: deliveryPerson.phone,
          vehicleType: deliveryPerson.vehicleType,
          vehicleNumber: deliveryPerson.vehicleNumber,
          rating: deliveryPerson.rating
        } : null
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all deliveries for a delivery person
exports.getMyDeliveries = async (req, res) => {
  try {
    // Get all deliveries assigned to this delivery person
    const deliveries = await Delivery.find({
      deliveryPersonId: req.user.id,
      status: { $ne: 'cancelled' }
    }).sort('-assignedAt');
    
    res.status(200).json({
      status: 'success',
      results: deliveries.length,
      data: {
        deliveries
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update delivery person's current location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'fail',
        message: 'Latitude and longitude are required'
      });
    }
    
    // Update user's current location in user service
    try {
      await axios.patch(
        `${config.servicesEndpoints.userService}/api/v1/users/${req.user.id}`,
        {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (error) {
      console.error('Error updating user location:', error);
      return res.status(400).json({
        status: 'fail',
        message: 'Failed to update location'
      });
    }
    
    // Update location for active deliveries
    await Delivery.updateMany(
      { 
        deliveryPersonId: req.user.id,
        status: { $in: ['assigned', 'picked_up', 'in_transit'] }
      },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get orders ready for pickup
// Get orders ready for pickup
exports.getReadyForPickupOrders = async () => {
  try {
    const response = await api.get('/orders', {
      params: {
        status: 'ready_for_pickup'
      }
    });
    
    // Log the response for debugging
    console.log('Ready for pickup orders response:', response.data);
    
    // Make sure to transform any missing properties if needed
    const orders = response.data.data.orders.map(order => ({
      id: order._id,  // Ensure id is available
      _id: order._id, // Keep _id as well
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      items: order.items || [],
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    }));
    
    return { data: { orders } };
  } catch (error) {
    console.error('Error fetching ready for pickup orders:', error);
    throw error.response?.data || { message: 'Failed to fetch available orders' };
  }
};