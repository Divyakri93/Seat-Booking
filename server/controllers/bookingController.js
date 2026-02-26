const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { validateBookingRules, normalizeDate } = require('../utils/scheduleUtils');

// @desc    Book a seat
// @route   POST /api/bookings
const createBooking = async (req, res) => {
    const { seatId, bookingDate, bookingType } = req.body;
    const currentTime = new Date();
    const utcBookingDate = normalizeDate(bookingDate);

    console.log(`[BOOKING] Attempting to book seat: ${seatId} for date: ${utcBookingDate.toISOString()}, user: ${req.user?._id}`);

    try {
        const seat = await Seat.findById(seatId);
        if (!seat) return res.status(404).json({ message: 'Seat not found' });

        const validation = await validateBookingRules(req.user, seatId, bookingType, utcBookingDate, currentTime);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const booking = await Booking.create({
            employee: req.user._id,
            seat: seatId,
            bookingDate: utcBookingDate,
            bookingType,
            status: 'confirmed'
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            employee: req.user._id,
            status: 'confirmed'
        })
            .populate('seat')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for a day
// @route   GET /api/bookings/date
const getBookingsByDate = async (req, res) => {
    const { date } = req.query;
    const queryDate = normalizeDate(date);

    try {
        const bookings = await Booking.find({
            bookingDate: queryDate,
            status: 'confirmed'
        }).populate('employee seat');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Release a booking
// @route   PUT /api/bookings/:id/release
const releaseBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.employee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = 'released';
        booking.releasedAt = Date.now();
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingsByDate,
    releaseBooking
};
