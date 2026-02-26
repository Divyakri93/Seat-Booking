const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getBatchForDay } = require('./scheduleUtils');

/**
 * Initialize all automated cron jobs
 */
const initCronJobs = () => {

    // 1. Auto-Release/Complete Job
    // Runs every night at 11:59 PM to finalize the day's bookings
    cron.schedule('59 23 * * *', async () => {
        console.log('[CRON] Running daily booking finalization...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const result = await Booking.updateMany(
                {
                    bookingDate: today,
                    status: 'confirmed'
                },
                { $set: { status: 'completed' } }
            );
            console.log(`[CRON] Finalization complete. Marked ${result.modifiedCount} bookings as completed.`);
        } catch (error) {
            console.error('[CRON] Finalization error:', error);
        }
    });

    // 2. Upcoming Booking Reminder
    // Runs every day at 2:30 PM to remind users for tomorrow
    cron.schedule('30 14 * * *', async () => {
        console.log('[CRON] Running upcoming booking reminders...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const { activeBatch, isWorkingDay } = getBatchForDay(tomorrow);

            if (!isWorkingDay) return;

            // Find all employees in the active batch for tomorrow
            const employees = await User.find({ batch: activeBatch });

            for (const emp of employees) {
                const hasBooking = await Booking.findOne({
                    employee: emp._id,
                    bookingDate: tomorrow,
                    status: 'confirmed'
                });

                if (!hasBooking) {
                    await Notification.create({
                        user: emp._id,
                        message: `Tomorrow is your Batch ${activeBatch} day! You haven't booked a designated seat yet.`,
                        type: 'reminder'
                    });
                }
            }
            console.log('[CRON] Reminders sent successfully.');
        } catch (error) {
            console.error('[CRON] Reminder job error:', error);
        }
    });

    // 3. Floating Seat Unlock Notification
    // Runs every day at 3:00 PM
    cron.schedule('0 15 * * *', async () => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateString = tomorrow.toLocaleDateString();

            console.log(`[CRON] Floating seats are now open for tomorrow: ${dateString}`);

            // Notify all active users
            const users = await User.find({ role: 'employee' });
            const notifications = users.map(user => ({
                user: user._id,
                message: `Floating seats are now unlocked for tomorrow (${dateString})! 🚀`,
                type: 'unlock'
            }));

            await Notification.insertMany(notifications);
        } catch (error) {
            console.error('[CRON] Unlock notification error:', error);
        }
    });
};

module.exports = initCronJobs;
