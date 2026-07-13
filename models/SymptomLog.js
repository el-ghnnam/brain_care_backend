const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  symptoms: [{
    type: String,
    enum: [
      'headache',
      'dizziness',
      'memory_lapse',
      'fatigue',
      'nausea',
      'vision_changes',
      'seizures',
      'balance_issues',
      'speech_difficulty'
    ]
  }]
}, {
  timestamps: true
});

symptomLogSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
