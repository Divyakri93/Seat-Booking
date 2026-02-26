import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';

const BookSeatPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialType = searchParams.get('type') || 'designated';

    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    // 1. Fetch ALL seats
    const { data: allSeats, isLoading: loadingSeats } = useQuery({
        queryKey: ['allSeats'],
        queryFn: async () => {
            const res = await api.get('/seats');
            return res.data;
        }
    });

    // 2. Fetch bookings for the selected date
    const { data: bookings, isLoading: loadingBookings } = useQuery({
        queryKey: ['bookingsByDate', bookingDate],
        queryFn: async () => {
            const res = await api.get(`/bookings/date?date=${bookingDate}`);
            return res.data;
        },
        refetchInterval: 3000
    });

    // Booking mutation
    const bookingMutation = useMutation({
        mutationFn: async (bookingData) => {
            console.log('API CALL: POST /api/bookings', bookingData);
            const res = await api.post('/bookings', bookingData);
            return res.data;
        },
        onSuccess: (data) => {
            console.log('BOOKING SUCCESS:', data);
            setMessage({ type: 'success', text: 'Seat booked successfully! Redirecting...' });
            setSelectedSeat(null);

            // Force refresh data
            queryClient.invalidateQueries({ queryKey: ['bookingsByDate'] });
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
            queryClient.invalidateQueries({ queryKey: ['seatAvailability'] });

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000);
        },
        onError: (err) => {
            console.error('BOOKING ERROR:', err);
            const errorMsg = err.response?.data?.message || 'Failed to book seat. Please try again.';
            setMessage({ type: 'error', text: errorMsg });

            // If it's a validation error, we might want to alert specifically
            if (err.response?.status === 400) {
                alert(errorMsg);
            }
        }
    });

    const handleBook = () => {
        if (!selectedSeat) {
            alert('Please select a seat from the map first.');
            return;
        }

        if (!currentUser) {
            setMessage({ type: 'error', text: 'You must be logged in to book.' });
            return;
        }

        const bookingData = {
            seatId: selectedSeat._id,
            bookingDate: bookingDate,
            bookingType: selectedSeat.seatType
        };

        console.log('Sending booking request...', bookingData);
        bookingMutation.mutate(bookingData);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 font-outfit">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Reserve Your Space</h1>
                        <p className="text-slate-500 font-medium">Plan your office day with precision</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">📅</div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingDate}
                                onChange={(e) => {
                                    setBookingDate(e.target.value);
                                    setSelectedSeat(null);
                                    setMessage({ type: '', text: '' });
                                }}
                                className="bg-transparent text-slate-800 dark:text-white font-black outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Rules and Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span>📝</span> Booking Smart Rules
                            </h3>
                            <ul className="space-y-4 text-sm opacity-90 font-medium">
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Designated</span>
                                    <span className="font-black italic">Batch Exclusive</span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Floating Seats</span>
                                    <span className="font-black italic">After 3:00 PM (T-1)</span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2">
                                    <span>Daily Limit</span>
                                    <span className="font-black italic">1 Seat / Person</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic leading-relaxed">
                                "Choose an available <span className="text-green-500 font-bold">Green</span> floating seat, or a <span className="text-yellow-500 font-bold">Yellow</span> designated seat assigned to your batch."
                            </p>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest text-sm flex items-center gap-3">
                            Office Floor Map <span className="h-px bg-slate-200 flex-grow"></span>
                        </h2>

                        {(loadingSeats || loadingBookings) ? (
                            <div className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-bold animate-pulse">Syncing occupancy data...</p>
                            </div>
                        ) : (
                            <SeatGrid
                                seats={allSeats || []}
                                bookings={bookings || []}
                                onSeatSelect={(seat) => {
                                    setSelectedSeat(seat);
                                    setMessage({ type: '', text: '' });
                                }}
                                selectedSeatId={selectedSeat?._id}
                                date={bookingDate}
                                currentUser={currentUser}
                            />
                        )}
                    </div>
                </div>

                {/* Messaging and Action */}
                <div className="mt-8">
                    {message.text && (
                        <div className={`mb-6 p-5 rounded-2xl border-2 flex items-center gap-4 animate-in slide-in-from-top duration-300 ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {message.type === 'success' ? '✓' : '!'}
                            </div>
                            <p className="font-bold">{message.text}</p>
                        </div>
                    )}

                    <div className={`p-8 rounded-[2rem] transition-all duration-500 flex flex-col lg:flex-row items-center justify-between gap-8 ${selectedSeat
                        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 ring-1 ring-white/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                        }`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${selectedSeat ? 'bg-blue-600 text-white rotate-12 shadow-blue-600/50 shadow-lg' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                {selectedSeat ? '🛋️' : '🔘'}
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tight">
                                    {selectedSeat ? `READY TO BOOK ${selectedSeat.seatNumber}` : 'WAITING FOR SELECTION'}
                                </h3>
                                <p className={`text-sm font-medium ${selectedSeat ? 'text-slate-400' : 'text-slate-500 opacity-60'}`}>
                                    {selectedSeat
                                        ? `${selectedSeat.seatType.toUpperCase()} SEAT DETECTED`
                                        : 'Select a green or yellow seat on the map above to proceed'}
                                </p>
                            </div>
                        </div>

                        <button
                            disabled={!selectedSeat || bookingMutation.isPending}
                            onClick={handleBook}
                            className={`group relative overflow-hidden px-14 py-6 rounded-2xl font-black text-xl transition-all active:scale-95 ${selectedSeat && !bookingMutation.isPending
                                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-2xl hover:shadow-blue-600/40 cursor-pointer'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {bookingMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        PROCESSING...
                                    </>
                                ) : (
                                    <>
                                        CONFIRM BOOKING
                                        <span className="transition-transform group-hover:translate-x-2">→</span>
                                    </>
                                )}
                            </span>
                            {selectedSeat && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookSeatPage;
