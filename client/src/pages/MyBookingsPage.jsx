import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';

const MyBookingsPage = () => {
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['myBookings'],
        queryFn: async () => {
            const res = await api.get('/bookings/my');
            return res.data;
        }
    });

    const releaseMutation = useMutation({
        mutationFn: async (id) => {
            return await api.put(`/bookings/${id}/release`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myBookings']);
        }
    });

    if (isLoading) return <div className="p-8 text-center">Loading bookings...</div>;

    const upcoming = bookings?.filter(b => b.status === 'confirmed' && new Date(b.bookingDate) >= new Date().setHours(0, 0, 0, 0));
    const past = bookings?.filter(b => b.status === 'released' || new Date(b.bookingDate) < new Date().setHours(0, 0, 0, 0));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 dark:text-white">My Reservations</h1>

            <section className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-gray-500 uppercase tracking-widest text-sm">Upcoming</h2>
                {upcoming?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map(booking => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                                onRelease={(id) => releaseMutation.mutate(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-400">No upcoming bookings found.</p>
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-xl font-bold mb-6 text-gray-500 uppercase tracking-widest text-sm">History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {past?.map(booking => (
                        <BookingCard key={booking._id} booking={booking} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MyBookingsPage;
