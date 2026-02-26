const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: [true, 'Please add a seat number'],
        unique: true,
        trim: true
    },
    seatType: {
        type: String,
        enum: ['designated', 'floating'],
        required: [true, 'Please specify seat type']
    },
    // For designated seats, we can optionally tag them, 
    // but the 2-batch system logic is primarily date-based.
    assignedBatch: {
        type: Number,
        enum: [1, 2]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Seat', SeatSchema);
