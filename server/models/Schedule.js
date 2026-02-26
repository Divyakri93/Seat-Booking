const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    batch1Days: {
        type: [String],
        default: []
    },
    batch2Days: {
        type: [String],
        default: []
    },
    isTeamDay: {
        type: Boolean,
        default: false
    },
    extraFloatingSeats: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
