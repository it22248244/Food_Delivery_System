const Restaurant = require('../models/Restaurant');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Restaurant.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const restaurants = await query;
    
    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      data: {
        restaurants
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create restaurant
exports.createRestaurant = async (req, res) => {
  try {
    // Set owner ID from authenticated user
    req.body.ownerId = req.user.id;
    
    const newRestaurant = await Restaurant.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        restaurant: newRestaurant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is the owner or admin
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this restaurant'
      });
    }
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        restaurant: updatedRestaurant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is the owner or admin
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this restaurant'
      });
    }
    
    await Restaurant.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get restaurant by owner ID
exports.getRestaurantByOwner = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.params.ownerId });
    
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found for this owner'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update restaurant verification status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { isVerified, status, rejectionReason } = req.body;
    
    const restaurant = await Restaurant.findById(req.params.id);
    
    // Check if restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        status: 'fail',
        message: 'No restaurant found with that ID'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update verification status'
      });
    }
    
    // Update the verification status
    restaurant.isVerified = isVerified;
    restaurant.status = status;
    
    if (rejectionReason) {
      restaurant.rejectionReason = rejectionReason;
    }
    
    await restaurant.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};