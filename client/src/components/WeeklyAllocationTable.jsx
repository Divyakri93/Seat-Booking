import React from 'react';
import { format } from 'date-fns';

const WeeklyAllocationTable = ({ weekDays, employees, bookingsByDay }) => {

    const getBookingForEmployee = (dayIdx, employeeId) => {
        return bookingsByDay[dayIdx]?.find(b => b.employee?._id === employeeId);
    };

    const exportToCSV = () => {
        const headers = ['Employee', 'Batch', ...weekDays.map(d => format(d, 'EEE (MMM d)'))];
        const rows = employees.map(emp => [
            emp.name,
            emp.batch,
            ...weekDays.map((_, idx) => {
                const b = getBookingForEmployee(idx, emp._id);
                return b ? `Seat ${b.seat?.seatNumber}` : '—';
            })
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_week_${format(weekDays[0], 'yyyy_MM_dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                <h2 className="text-xl font-bold dark:text-white">Attendance Matrix</h2>
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    📥 Export CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">Employee</th>
                            {weekDays.map(day => (
                                <th key={day.toString()} className="p-4 text-center border-b dark:border-gray-700">
                                    <div className="text-gray-900 dark:text-white font-bold">{format(day, 'EEE')}</div>
                                    <div className="text-[10px] text-gray-400 font-normal">{format(day, 'MMM d')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees?.map(emp => (
                            <tr
                                key={emp._id}
                                className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors ${emp.batch === 1 ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-green-50/30 dark:bg-green-900/10'
                                    }`}
                            >
                                <td className="p-4">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{emp.name}</div>
                                    <div className="text-[10px] text-gray-400">Batch {emp.batch} • Squad {emp.squad}</div>
                                </td>
                                {weekDays.map((_, dayIdx) => {
                                    const booking = getBookingForEmployee(dayIdx, emp._id);
                                    return (
                                        <td key={dayIdx} className="p-2 text-center">
                                            {booking ? (
                                                <div className={`
                          inline-block px-2 py-1 rounded-lg text-[10px] font-black shadow-sm
                          ${booking.bookingType === 'designated' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}
                        `}>
                                                    {booking.seat?.seatNumber}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600 font-bold">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklyAllocationTable;
