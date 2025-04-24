const mongoose = require('mongoose');

const deliveryPersonnelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A delivery personnel must be linked to a user']
  },
  name: {
    type: String,
    required: [true, 'A delivery personnel must have a name']
  },
  phone: {
    type: String,
    required: [true, 'A delivery personnel must have a phone number']
  },
  email: {
    type: String,
    required: [true, 'A delivery personnel must have an email']
  },
  isAvailable: {
    type: Boolean,
    default: true
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
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  vehicleType: {
    type: String,
    enum: ['bicycle', 'motorcycle', 'car', 'van'],
    default: 'motorcycle'
  },
  vehicleNumber: String,
  deliveryCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index on location
deliveryPersonnelSchema.index({ currentLocation: '2dsphere' });

const DeliveryPersonnel = mongoose.model('DeliveryPersonnel', deliveryPersonnelSchema);

module.exports = DeliveryPersonnel;