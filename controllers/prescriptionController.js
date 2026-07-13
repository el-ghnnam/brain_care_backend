const Prescription = require('../models/Prescription');

const addPrescription = async (req, res, next) => {
  try {
    const { doctorId, patientId, medicationName, dosage, frequency, type, durationDays, notes } = req.body;

    if (!doctorId || !patientId || !medicationName || !dosage || !frequency) {
      return res.status(400).json({ success: false, message: 'doctorId, patientId, medicationName, dosage, and frequency are required' });
    }

    const prescription = await Prescription.create({
      doctorId,
      patientId,
      medicationName,
      dosage,
      frequency,
      type,
      durationDays,
      notes
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

const getPatientPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const now = Date.now();

    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });

    const updated = [];
    for (const p of prescriptions) {
      let changed = false;
      if (p.durationDays && p.status === 'active') {
        const expiresAt = new Date(p.createdAt).getTime() + p.durationDays * 86400000;
        if (expiresAt < now) {
          p.status = 'inactive';
          p.isActive = false;
          changed = true;
        }
      }
      if (changed) {
        await p.save();
      }
      updated.push(p);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const updatePrescriptionStatus = async (req, res, next) => {
  console.log('PATCH Request received for ID:', req.params.id, 'Body:', req.body);
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be "active" or "inactive"' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

const deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPrescription,
  getPatientPrescriptions,
  updatePrescriptionStatus,
  deletePrescription
};
