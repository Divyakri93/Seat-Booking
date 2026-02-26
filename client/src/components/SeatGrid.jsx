import React from 'react';
import { isSameDay, isTomorrow } from 'date-fns';

/**
 * SeatGrid Component
 * Displays a visual office map with real-time status tracking.
 * Updated: 
 * - Designated: ONLY for active batch members.
 * - Floating: ONLY for remote batch members (after 3 PM).
 */
const SeatGrid = ({ seats, bookings, onSeatSelect, selectedSeatId, date, currentUser }) => {
    const targetDate = new Date(date);
    const now = new Date();

    // Logic to check if floating seats are locked for tomorrow
    const isAfter3PM = now.getHours() >= 15;
    const isFloatingLocked = isTomorrow(targetDate) && !isAfter3PM;

    // Determine which batch is active for the target date
    const day = targetDate.getDay();
    let activeBatchToday = null;
    if (day >= 1 && day <= 3) activeBatchToday = 1;
    else if (day === 4 || day === 5) activeBatchToday = 2;

    const isMyBatchDay = currentUser?.batch === activeBatchToday;

    const getSeatStatus = (seat) => {
        // 0. Check if currently SELECTED by user (local state)
        if (selectedSeatId === seat._id) {
            return {
                status: 'selected',
                color: 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-500/20 scale-110 shadow-xl z-10',
                label: 'Selected',
                selectable: true
            };
        }

        // 1. Check for existing booking (database)
        const booking = bookings?.find(b =>
            b.seat?._id === seat._id &&
            isSameDay(new Date(b.bookingDate), targetDate) &&
            b.status === 'confirmed'
        );

        if (booking) {
            if (booking.employee?._id === currentUser?._id) {
                return {
                    status: 'booked-me',
                    color: 'bg-blue-600 border-blue-700 text-white',
                    label: 'My Seat',
                    selectable: false
                };
            }
            return {
                status: 'booked-others',
                color: 'bg-red-500 border-red-700 text-white opacity-40 cursor-not-allowed grayscale',
                label: 'Booked',
                selectable: false,
                reason: `Booked by ${booking.employee?.name || 'another employee'}`
            };
        }

        // 2. Check if Designated
        if (seat.seatType === 'designated') {
            if (isMyBatchDay) {
                return {
                    status: 'available-batch',
                    color: 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-sm',
                    label: 'Your Batch',
                    selectable: true
                };
            } else {
                return {
                    status: 'wrong-day',
                    color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-30',
                    label: `Batch ${activeBatchToday}`,
                    selectable: false,
                    reason: `Designated seats are only for the active batch (${activeBatchToday}). Please pick a floating seat.`
                };
            }
        }

        // 3. Check if Floating
        if (seat.seatType === 'floating') {
            // RULE: Floating are only for other batch members
            if (isMyBatchDay) {
                return {
                    status: 'available-designated-only',
                    color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-30',
                    label: 'Designated Only',
                    selectable: false,
                    reason: 'Since today IS your batch day, please use a designated seat. Floating are for other batch members.'
                };
            }

            // If not active batch day, follow 3 PM rule for floating
            if (isFloatingLocked) {
                return {
                    status: 'locked-floating',
                    color: 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed',
                    label: 'Locked',
                    selectable: false,
                    reason: 'Floating seats unlock at 3:00 PM the day before.'
                };
            }

            return {
                status: 'available-floating',
                color: 'bg-green-500 border-green-700 text-white',
                label: 'Floating',
                selectable: true
            };
        }

        return { status: 'unknown', color: 'bg-gray-200', selectable: false };
    };

    return (
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-inner">
            {/* Legend */}
            <div className="flex flex-wrap gap-6 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm shadow-lg shadow-green-500/20"></span> Floating</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-400 rounded-sm shadow-lg shadow-yellow-500/20"></span> Designated</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded-sm"></span> Confirmed</div>
                <div className="flex items-center gap-2 opacity-40"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Occupied</div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-4">
                {seats.map((seat) => {
                    const config = getSeatStatus(seat);

                    return (
                        <div key={seat._id} className="group relative">
                            <button
                                onClick={() => config.selectable ? onSeatSelect(seat) : null}
                                className={`
                  w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-500 relative
                  ${config.color}
                  ${config.selectable ? 'hover:scale-110 hover:shadow-2xl active:scale-90 cursor-pointer' : 'cursor-not-allowed'}
                `}
                            >
                                <span className="text-xs font-black">{seat.seatNumber}</span>
                                <span className={`text-[7px] mt-0.5 font-black uppercase px-1 rounded-sm ${config.status.includes('available') || config.status === 'selected' ? 'bg-black/10' : 'opacity-60'
                                    }`}>
                                    {seat.seatType === 'designated' ? 'DES' : 'FL'}
                                </span>

                                {/* Visual Indicators */}
                                {config.status === 'booked-me' && (
                                    <div className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-lg p-0.5 shadow-xl border border-blue-100">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    </div>
                                )}
                                {config.status === 'selected' && (
                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-lg p-0.5 animate-bounce shadow-xl">
                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                    </div>
                                )}
                            </button>

                            {/* Enhanced Tooltip */}
                            {!config.selectable && config.reason && (
                                <div className="absolute bottom-full left-1/2 -_translate-x-1/2 mb-3 w-40 hidden group-hover:block z-50 pointer-events-none">
                                    <div className="bg-slate-900 text-white text-[10px] font-bold p-3 rounded-xl shadow-2xl text-center relative border border-white/10 backdrop-blur-xl">
                                        {config.reason}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SeatGrid;
