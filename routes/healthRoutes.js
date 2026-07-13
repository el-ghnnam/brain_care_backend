const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  logSymptoms,
  addMedication,
  toggleMedicationLog,
  getPatientHealthSummary,
  getTodayMedications
} = require('../controllers/healthController');

router.use(auth);

router.post('/symptoms', logSymptoms);
router.post('/medications', addMedication);
router.post('/medications/toggle', toggleMedicationLog);
router.get('/medications/today', getTodayMedications);
router.get('/summary', getPatientHealthSummary);

module.exports = router;
