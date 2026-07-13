const mongoose = require('mongoose');

const patientDoctorLinkSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

patientDoctorLinkSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

module.exports = mongoose.model('PatientDoctorLink', patientDoctorLinkSchema);
