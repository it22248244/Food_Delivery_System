const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A delivery must be associated with an order']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A delivery must be associated with a restaurant']
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A delivery must be associated with a delivery person']
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  restaurantAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'assigned'
  },
  currentLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  pickedUpAt: Date,
  deliveredAt: Date,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date
});

// Create indexes for faster queries
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ deliveryPersonId: 1, status: 1 });
deliverySchema.index({ userId: 1 });
deliverySchema.index({ currentLocation: '2dsphere' });

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;