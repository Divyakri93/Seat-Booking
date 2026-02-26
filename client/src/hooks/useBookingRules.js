import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { isTomorrow } from 'date-fns';

/**
 * Custom hook to encapsulate all booking-related logic and business rules.
 */
export const useBookingRules = (date) => {
    const selectedDate = date ? new Date(date) : new Date();

    // 1. Fetch all seats (base data)
    const { data: allSeats } = useQuery({
        queryKey: ['allSeats'],
        queryFn: async () => (await api.get('/seats')).data,
        staleTime: 600000 // 10 minutes
    });

    // 2. Fetch current schedule
    const { data: schedule } = useQuery({
        queryKey: ['currentSchedule'],
        queryFn: async () => (await api.get('/schedule/current')).data,
        staleTime: 10000,
        refetchInterval: 10000
    });

    // 3. Fetch seat availability statistics
    const useSeatAvailability = (queryDate) => {
        return useQuery({
            queryKey: ['seatAvailability', queryDate],
            queryFn: async () => {
                // Fetch available seats for the day
                const res = await api.get(`/seats/available?date=${queryDate}`);
                const availableSeats = res.data;

                // Total designated/floating from allSeats
                const totalDesignated = allSeats?.filter(s => s.seatType === 'designated').length || 40;
                const totalFloating = allSeats?.filter(s => s.seatType === 'floating').length || 10;

                const availableDesignated = availableSeats.filter(s => s.seatType === 'designated').length;
                const availableFloating = availableSeats.filter(s => s.seatType === 'floating').length;

                const result = {
                    designated: {
                        total: totalDesignated,
                        available: availableDesignated,
                        booked: Math.max(0, totalDesignated - availableDesignated)
                    },
                    floating: {
                        total: totalFloating,
                        available: availableFloating,
                        booked: Math.max(0, totalFloating - availableFloating)
                    }
                };

                console.log(`[AVAILABILITY] ${queryDate}:`, result);
                return result;
            },
            staleTime: 0,
            refetchInterval: 3000,
            enabled: !!queryDate && !!allSeats
        });
    };

    const canBookDesignated = (user) => {
        if (!user) return { allowed: false, reason: 'User not logged in' };
        const day = selectedDate.getDay();

        let activeBatchToday = null;
        if (day >= 1 && day <= 3) activeBatchToday = 1;
        else if (day === 4 || day === 5) activeBatchToday = 2;

        if (day === 0 || day === 6) {
            return { allowed: false, reason: 'Office is closed on weekends.' };
        }

        const isMatch = Number(user.batch) === activeBatchToday;
        return {
            allowed: isMatch,
            reason: isMatch ? '' : `Today is for Batch ${activeBatchToday}. You are in Batch ${user.batch}.`
        };
    };

    const canBookFloating = () => {
        const now = new Date();
        const isTargetTomorrow = isTomorrow(selectedDate);
        const isAfter3PM = now.getHours() >= 15;

        if (isTargetTomorrow && !isAfter3PM) {
            return {
                allowed: false,
                reason: 'Floating seats for tomorrow unlock at 3:00 PM today.',
                unlocksAt: '15:00'
            };
        }
        return { allowed: true, reason: '' };
    };

    const useCurrentStatus = (user) => {
        if (!user) return { currentBatch: null, status: 'unknown' };
        const { allowed } = canBookDesignated(user);

        const day = new Date().getDay();
        let batchNow = null;
        if (day >= 1 && day <= 3) batchNow = 1;
        if (day === 4 || day === 5) batchNow = 2;

        return {
            currentBatch: batchNow,
            status: allowed ? 'on-site' : 'remote'
        };
    };

    return {
        schedule,
        canBookDesignated,
        canBookFloating,
        useCurrentStatus,
        useSeatAvailability
    };
};
