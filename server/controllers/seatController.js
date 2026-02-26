const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { normalizeDate } = require('../utils/scheduleUtils');

// @desc    Get all seats
// @route   GET /api/seats
const getSeats = async (req, res) => {
    const { type, batch } = req.query;
    const filter = {};
    if (type) filter.seatType = type;
    if (batch) filter.assignedBatch = batch;

    try {
        const seats = await Seat.find(filter);
        res.json(seats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available seats for a date
// @route   GET /api/seats/available
const getAvailableSeats = async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    try {
        const queryDate = normalizeDate(date);
        console.log(`[SEATS] Checking availability for: ${queryDate.toISOString()}`);

        // Get all active seats
        const allSeats = await Seat.find({ isActive: true });

        // Get all confirmed bookings for that date
        const bookings = await Booking.find({
            bookingDate: queryDate,
            status: 'confirmed'
        });

        const bookedSeatIds = bookings.map(b => b.seat.toString());
        const availableSeats = allSeats.filter(seat => !bookedSeatIds.includes(seat._id.toString()));

        console.log(`[SEATS] Found ${bookings.length} bookings. ${availableSeats.length} seats available.`);

        res.json(availableSeats);
    } catch (error) {
        console.error('[SEATS] Error fetching availability:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a seat (Admin)
// @route   POST /api/seats
const createSeat = async (req, res) => {
    try {
        const seat = await Seat.create(req.body);
        res.status(201).json(seat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update seat (Admin)
// @route   PUT /api/seats/:id
const updateSeat = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!seat) return res.status(404).json({ message: 'Seat not found' });
        res.json(seat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getSeats,
    getAvailableSeats,
    createSeat,
    updateSeat
};
