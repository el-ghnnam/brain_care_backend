const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { logSymptom, getPatientSymptoms, removeSymptomLog } = require('../controllers/symptomLogController');

router.use(auth);

router.post('/', logSymptom);
router.delete('/', removeSymptomLog);
router.get('/:patientId', getPatientSymptoms);

module.exports = router;
