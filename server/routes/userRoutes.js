const express = require('express');
const router = express.Router();
const { getUsers, getUserBookings } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/:id/bookings', protect, admin, getUserBookings);

module.exports = router;
