const PatientDoctorLink = require('../models/PatientDoctorLink');

const linkPatientToDoctor = async (req, res, next) => {
  try {
    const { patientId, patientName, doctorId } = req.body;

    if (!patientId || !patientName || !doctorId) {
      return res.status(400).json({ success: false, message: 'patientId, patientName, and doctorId are required' });
    }

    const existing = await PatientDoctorLink.findOne({ patientId, doctorId });
    if (existing) {
      return res.status(200).json({ success: true, data: existing, message: 'Link already exists' });
    }

    const link = await PatientDoctorLink.create({ patientId, patientName, doctorId });
    res.status(201).json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

const getDoctorPatients = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const patients = await PatientDoctorLink.find({ doctorId });

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  linkPatientToDoctor,
  getDoctorPatients
};
