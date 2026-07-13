const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { linkPatientToDoctor, getDoctorPatients } = require('../controllers/linkController');

router.use(auth);

router.post('/', linkPatientToDoctor);
router.get('/:doctorId/patients', getDoctorPatients);

module.exports = router;
