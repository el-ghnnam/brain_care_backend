const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  medicationName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: {
      type: String,
      required: true
    },
    schedules: {
      type: [String],
      default: []
    }
  },
  notes: {
    type: String
  },
  type: {
    type: String,
    enum: ['course', 'prn'],
    default: 'course'
  },
  durationDays: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
