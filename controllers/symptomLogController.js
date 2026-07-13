const DailySymptomLog = require('../models/DailySymptomLog');

const logSymptom = async (req, res, next) => {
  try {
    const { patientId, symptom } = req.body;

    if (!patientId || !symptom) {
      return res.status(400).json({ success: false, message: 'patientId and symptom are required' });
    }

    const log = await DailySymptomLog.create({ patientId, symptom });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const getPatientSymptoms = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const logs = await DailySymptomLog.find({ patientId }).sort({ loggedAt: -1 });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const removeSymptomLog = async (req, res, next) => {
  try {
    const { patientId, symptom } = req.body;

    if (!patientId || !symptom) {
      return res.status(400).json({ success: false, message: 'patientId and symptom are required' });
    }

    const result = await DailySymptomLog.findOneAndDelete({ patientId, symptom });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Symptom log not found' });
    }

    res.status(200).json({ success: true, message: 'Symptom log removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logSymptom,
  getPatientSymptoms,
  removeSymptomLog
};
