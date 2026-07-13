const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  reminderTime: {
    type: String,
    required: true
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  minute: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  isActive: {
    type: Boolean,
    default: true
  },
  durationInDays: {
    type: Number,
    default: 60
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);
