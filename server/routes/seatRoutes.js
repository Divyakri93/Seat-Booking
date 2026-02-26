const express = require('express');
const router = express.Router();
const { getSeats, getAvailableSeats, createSeat, updateSeat } = require('../controllers/seatController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getSeats);
router.get('/available', protect, getAvailableSeats);
router.post('/', protect, admin, createSeat);
router.put('/:id', protect, admin, updateSeat);

module.exports = router;
