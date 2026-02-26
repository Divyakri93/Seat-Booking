const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true
    },
    bookingDate: {
        type: Date,
        required: [true, 'Please add a booking date']
    },
    bookingType: {
        type: String,
        enum: ['designated', 'floating'],
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'released', 'pending'],
        default: 'confirmed'
    },
    bookedAt: {
        type: Date,
        default: Date.now
    },
    releasedAt: {
        type: Date
    }
});

// CRITICAL INTEGRITY INDEXES
// 1. One person = One confirmed seat per day
BookingSchema.index(
    { bookingDate: 1, employee: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'confirmed' }
    }
);

// 2. One seat = One confirmed person per day
BookingSchema.index(
    { bookingDate: 1, seat: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'confirmed' }
    }
);

module.exports = mongoose.model('Booking', BookingSchema);
