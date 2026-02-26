const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    List all employees (Admin)
// @route   GET /api/users
const getUsers = async (req, res) => {
    const { batch, squad } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (squad) filter.squad = squad;

    try {
        const users = await User.find(filter);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    View specific employee bookings (Admin)
// @route   GET /api/users/:id/bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ employee: req.params.id })
            .populate('seat')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserBookings
};
