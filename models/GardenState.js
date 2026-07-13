const mongoose = require('mongoose');

/**
 * GardenState Schema
 * Tracks the progression of a patient's virtual "Hope Garden".
 * Points and stages are designed to only increase (dormancy safe),
 * preventing users from feeling penalized or losing progress.
 */
const gardenStateSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    index: true // For faster lookups
  },
  waterPoints: {
    type: Number,
    default: 0
  },
  sunlightPoints: {
    type: Number,
    default: 0
  },
  currentStage: {
    type: Number,
    default: 0,
    max: 100 // Max stage is 100
  },
  lastInteractionTimestamp: {
    type: Date,
    default: Date.now
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  dailyActions: {
    date: {
      type: String,
      default: null
    },
    types: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('GardenState', gardenStateSchema);
