import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../utils/api';
import WeeklyAllocationTable from '../components/WeeklyAllocationTable';

const WeeklyViewPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday

    const weekDays = [...Array(5)].map((_, i) => addDays(startDate, i));

    const { data: employees } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => (await api.get('/users')).data
    });

    const { data: allBookings, isLoading } = useQuery({
        queryKey: ['allBookings', format(startDate, 'yyyy-MM-dd')],
        queryFn: async () => {
            const results = await Promise.all(
                weekDays.map(day => api.get(`/bookings/date?date=${format(day, 'yyyy-MM-dd')}`))
            );
            return results.map(r => r.data);
        }
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold dark:text-white tracking-tight">Weekly View</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Attendance & Seat Allocation</p>
                </div>

                <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors font-bold"
                    >
                        ← Previous
                    </button>
                    <div className="px-8 text-center border-x dark:border-gray-700">
                        <span className="block text-sm font-bold dark:text-white uppercase tracking-tighter">Current Week</span>
                        <span className="text-xs text-gray-400">{format(startDate, 'MMM d')} — {format(weekDays[4], 'MMM d, yyyy')}</span>
                    </div>
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors font-bold"
                    >
                        Next →
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Synchronizing Records...</p>
                </div>
            ) : (
                <WeeklyAllocationTable
                    weekDays={weekDays}
                    employees={employees || []}
                    bookingsByDay={allBookings || []}
                />
            )}
        </div>
    );
};

export default WeeklyViewPage;
