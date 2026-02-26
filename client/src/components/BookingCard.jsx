import { format } from 'date-fns';

const BookingCard = ({ booking, onRelease }) => {
    const isPast = new Date(booking.bookingDate) < new Date().setHours(0, 0, 0, 0);
    const isReleased = booking.status === 'released';

    return (
        <div className={`p-6 rounded-2xl shadow-sm border transition-all ${isReleased ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${booking.bookingType === 'designated' ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                        {booking.bookingType}
                    </span>
                    <h3 className="text-2xl font-bold mt-2 dark:text-white">Seat {booking.seat?.seatNumber || 'N/A'}</h3>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${isReleased ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-700"
                    }`}>
                    {booking.status}
                </div>
            </div>

            <div className="space-y-1 mb-6">
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {format(new Date(booking.bookingDate), 'EEEE, MMMM do, yyyy')}
                </p>
                <p className="text-xs text-gray-400">Booked on {format(new Date(booking.bookedAt), 'MMM d, h:mm a')}</p>
            </div>

            {!isPast && !isReleased && (
                <button
                    onClick={() => onRelease(booking._id)}
                    className="w-full py-2 rounded-xl text-red-600 font-semibold border border-red-100 hover:bg-red-50 transition-colors"
                >
                    Release Seat
                </button>
            )}
        </div>
    );
};

export default BookingCard;
