const Schedule = require('../models/Schedule');
const { getCurrentWeekNumber } = require('../utils/scheduleUtils');

// @desc    Get current week schedule
// @route   GET /api/schedule/current
const getCurrentSchedule = async (req, res) => {
    const now = new Date();
    const weekNum = getCurrentWeekNumber(now);
    try {
        const schedule = await Schedule.findOne({ weekNumber: weekNum });
        res.json(schedule || { message: 'Schedule not set for this week', weekNumber: weekNum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set team day (Admin)
// @route   PUT /api/schedule/team-day
const setTeamDay = async (req, res) => {
    const { weekNumber, weekStartDate, extraFloatingSeats, isTeamDay } = req.body;
    try {
        let schedule = await Schedule.findOne({ weekNumber });
        if (schedule) {
            schedule.extraFloatingSeats = extraFloatingSeats;
            schedule.isTeamDay = isTeamDay;
            await schedule.save();
        } else {
            schedule = await Schedule.create({
                weekNumber,
                weekStartDate,
                extraFloatingSeats,
                isTeamDay
            });
        }
        res.json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getCurrentSchedule,
    setTeamDay
};
