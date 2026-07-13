const mongoose = require('mongoose');

const dailySymptomLogSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  symptom: {
    type: String,
    required: true
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DailySymptomLog', dailySymptomLogSchema);
