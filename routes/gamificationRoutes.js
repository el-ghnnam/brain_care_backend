const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getGardenState, awardPoints, resetGardenState } = require('../controllers/gamificationController');

router.use(auth);

// Route to get a patient's garden state
router.get('/:patientId', getGardenState);

// Route to award points based on actions
router.post('/award', awardPoints);

// Route to reset a patient's garden state
router.put('/reset/:patientId', resetGardenState);

module.exports = router;
