const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { addPrescription, getPatientPrescriptions, updatePrescriptionStatus, deletePrescription } = require('../controllers/prescriptionController');

router.use(auth);

router.post('/', addPrescription);
router.patch('/:id/status', updatePrescriptionStatus);
router.delete('/:id', deletePrescription);
router.get('/:patientId', getPatientPrescriptions);

module.exports = router;
