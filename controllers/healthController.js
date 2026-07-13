const SymptomLog = require('../models/SymptomLog');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');

const logSymptoms = async (req, res, next) => {
  try {
    const { date, symptoms } = req.body;
    const patientId = req.user.id;

    if (!date || !symptoms) {
      return res.status(400).json({ success: false, message: 'date and symptoms are required' });
    }

    const log = await SymptomLog.findOneAndUpdate(
      { patientId, date },
      { symptoms },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const addMedication = async (req, res, next) => {
  try {
    const { name, reminderTime, hour, minute } = req.body;
    const patientId = req.user.id;

    if (!name || !reminderTime || hour == null || minute == null) {
      return res.status(400).json({ success: false, message: 'name, reminderTime, hour, and minute are required' });
    }

    const medication = await Medication.create({
      patientId,
      name,
      reminderTime,
      hour,
      minute
    });

    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

const toggleMedicationLog = async (req, res, next) => {
  try {
    const { medicationId, date, time } = req.body;
    const patientId = req.user.id;

    if (!medicationId || !date || !time) {
      return res.status(400).json({ success: false, message: 'medicationId, date, and time are required' });
    }

    const medication = await Medication.findOne({ _id: medicationId, patientId });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    const existing = await MedicationLog.findOne({ medicationId, date, time });

    let log;
    if (existing) {
      existing.taken = !existing.taken;
      log = await existing.save();
    } else {
      log = await MedicationLog.create({ patientId, medicationId, date, time, taken: true });
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const getPatientHealthSummary = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [medications, todayMedLogs, todaySymptomLog] = await Promise.all([
      Medication.find({ patientId, isActive: true }),
      MedicationLog.find({ patientId, date: today }),
      SymptomLog.findOne({ patientId, date: today })
    ]);

    res.status(200).json({
      success: true,
      data: {
        medications,
        todayMedicationLogs: todayMedLogs,
        todaySymptomLog
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTodayMedications = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const logs = await MedicationLog.find({ patientId, date: today, taken: true })
      .populate('medicationId', 'name reminderTime hour minute');

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logSymptoms,
  addMedication,
  toggleMedicationLog,
  getPatientHealthSummary,
  getTodayMedications
};
