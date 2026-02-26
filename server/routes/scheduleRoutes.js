const express = require('express');
const router = express.Router();
const { getCurrentSchedule, setTeamDay } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/current', protect, getCurrentSchedule);
router.put('/team-day', protect, admin, setTeamDay);

module.exports = router;
