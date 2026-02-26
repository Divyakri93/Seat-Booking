const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');

/**
 * Normalizes a date to YYYY-MM-DD format as a Date object at UTC Midnight.
 * This prevents timezone drift from causing double bookings.
 */
const normalizeDate = (dateInput) => {
    const d = new Date(dateInput);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Returns the ISO week number for a given date.
 */
const getCurrentWeekNumber = (dateInput) => {
    const d = normalizeDate(dateInput);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

/**
 * Determines which batch is active for a given day.
 */
const getBatchForDay = (dateInput) => {
    const d = normalizeDate(dateInput);
    const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday ...

    if (day === 0 || day === 6) {
        return { activeBatch: null, isWorkingDay: false };
    }

    if (day >= 1 && day <= 3) {
        return { activeBatch: 1, isWorkingDay: true };
    } else if (day === 4 || day === 5) {
        return { activeBatch: 2, isWorkingDay: true };
    }

    return { activeBatch: null, isWorkingDay: false };
};

const isEmployeeBatchDay = (employee, dateInput) => {
    const { activeBatch, isWorkingDay } = getBatchForDay(dateInput);
    return isWorkingDay && Number(employee.batch) === activeBatch;
};

const canBookFloatingSeat = (bookingDateInput, currentDateTime) => {
    const targetDate = normalizeDate(bookingDateInput);
    const now = new Date(currentDateTime);

    // Calculate 3 PM previous day in UTC for comparison
    const openTime = new Date(targetDate);
    openTime.setUTCDate(openTime.getUTCDate() - 1);
    openTime.setUTCHours(15, 0, 0, 0);

    if (now < openTime) {
        return {
            allowed: false,
            reason: 'Floating seats for tomorrow only open at 3:00 PM today.'
        };
    }

    if (now > new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)) {
        return { allowed: false, reason: 'Cannot book for a past date.' };
    }

    return { allowed: true, reason: '' };
};

const getAvailableFloatingSeats = async (dateInput) => {
    const targetDate = normalizeDate(dateInput);
    const baseFloatingSeats = 10;

    const booked = await Booking.countDocuments({
        bookingDate: targetDate,
        bookingType: 'floating',
        status: 'confirmed'
    });

    return {
        total: baseFloatingSeats,
        booked,
        available: Math.max(0, baseFloatingSeats - booked)
    };
};

const validateBookingRules = async (employee, seatId, seatType, bookingDateInput, currentTime) => {
    const targetDate = normalizeDate(bookingDateInput);
    const now = new Date(currentTime);

    // 1. One employee = one seat per day
    const existingEmployeeBooking = await Booking.findOne({
        employee: employee._id,
        bookingDate: targetDate,
        status: 'confirmed'
    });

    if (existingEmployeeBooking) {
        return { valid: false, message: 'You already have a confirmed booking for this day.' };
    }

    // 2. One seat = one person per day
    const existingSeatBooking = await Booking.findOne({
        seat: seatId,
        bookingDate: targetDate,
        status: 'confirmed'
    });

    if (existingSeatBooking) {
        return { valid: false, message: 'This seat is already booked for the selected date.' };
    }

    const isBatchDayForThisUser = isEmployeeBatchDay(employee, targetDate);

    // 3. Booking Type Logic
    if (seatType === 'designated') {
        if (!isBatchDayForThisUser) {
            return {
                valid: false,
                message: 'This is a Designated seat. Since it is not your batch day, please pick a Floating seat after 3 PM.'
            };
        }

        const maxDate = normalizeDate(now);
        maxDate.setUTCDate(maxDate.getUTCDate() + 14);

        if (targetDate > maxDate) {
            return {
                valid: false,
                message: 'Designated seats can only be booked up to 2 weeks in advance.'
            };
        }
    } else if (seatType === 'floating') {
        if (isBatchDayForThisUser) {
            return {
                valid: false,
                message: 'Floating seats are reserved for remote batch members. Use a Designated seat instead.'
            };
        }

        const check = canBookFloatingSeat(bookingDateInput, currentTime);
        if (!check.allowed) {
            return { valid: false, message: check.reason };
        }

        const availability = await getAvailableFloatingSeats(targetDate);
        if (availability.available <= 0) {
            return { valid: false, message: 'No floating seats available for this date.' };
        }
    }

    return { valid: true, message: '' };
};

module.exports = {
    normalizeDate,
    getCurrentWeekNumber,
    getBatchForDay,
    isEmployeeBatchDay,
    canBookFloatingSeat,
    getAvailableFloatingSeats,
    validateBookingRules
};
