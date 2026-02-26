const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingsByDate,
    releaseBooking
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/date', protect, getBookingsByDate);
router.put('/:id/release', protect, releaseBooking);

module.exports = router;
