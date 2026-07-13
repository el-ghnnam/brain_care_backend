const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  time: {
    type: String,
    required: true
  },
  taken: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

medicationLogSchema.index({ medicationId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
