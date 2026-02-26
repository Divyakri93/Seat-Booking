import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookingRules } from '../hooks/useBookingRules';
import api from '../utils/api';
import FloatingSeatTimer from '../components/FloatingSeatTimer';
import WeekScheduleBadge from '../components/WeekScheduleBadge';

const Dashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const todayISO = new Date().toISOString().split('T')[0];
    const { useCurrentStatus, useSeatAvailability } = useBookingRules(todayISO);

    const { currentBatch, status } = useCurrentStatus(user);
    const { data: counts, isLoading: loadingCounts } = useSeatAvailability(todayISO);

    const { data: myBookings } = useQuery({
        queryKey: ['myBookings'],
        queryFn: async () => (await api.get('/bookings/my')).data,
        refetchInterval: 10000
    });

    const todayLabel = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleManualRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['seatAvailability'] });
        queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 font-outfit text-slate-900 dark:text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        Welcome back, <span className="text-blue-500">{user?.name}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/5">
                            {todayLabel}
                        </span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-black uppercase ${status === 'on-site'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                            }`}>
                            <span className={`w-2 h-2 rounded-full animate-ping ${status === 'on-site' ? 'bg-green-500' : 'bg-indigo-500'}`}></span>
                            {status === 'on-site' ? 'In-Office Parity' : 'Remote Parity'}
                        </div>
                    </div>
                </div>
                <WeekScheduleBadge activeBatch={currentBatch} userBatch={user?.batch} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {/* User Info Card */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-600/20 transition-colors"></div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Team Identity
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">EMPID</span>
                            <span className="text-sm font-black text-white">{user?.employeeId || '---'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">BATCH</span>
                            <span className="text-sm font-black text-blue-500">{user?.batch ? `BATCH ${user.batch}` : '---'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-400">SQUAD</span>
                            <span className="text-sm font-black text-indigo-500">{user?.squad ? `SQUAD ${user.squad}` : '---'}</span>
                        </div>
                    </div>
                </div>

                {/* Availability Card (Live Occupancy) */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <button
                        onClick={handleManualRefresh}
                        className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        title="Refresh Availability"
                    >
                        <svg className={`w-4 h-4 ${loadingCounts ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Occupancy
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                                <span>Designated</span>
                                <span className="text-white">
                                    {counts?.designated.booked ?? '0'} BOOKED | {counts?.designated.available ?? '0'} FREE
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-[1500ms] shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${(counts?.designated.booked / counts?.designated.total) * 100 || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                                <span>Floating</span>
                                <span className="text-white">
                                    {counts?.floating.booked ?? '0'} BOOKED | {counts?.floating.available ?? '0'} FREE
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-[1500ms] shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${(counts?.floating.booked / counts?.floating.total) * 100 || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Summary */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Active Status
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-5xl font-black text-white italic tracking-tighter">
                                {myBookings?.filter(b => b.status === 'confirmed').length || 0}
                            </span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Reservations</p>
                        </div>
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-3xl border border-yellow-500/20">
                            🏷️
                        </div>
                    </div>
                </div>

                {/* Next Unlock */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <FloatingSeatTimer />
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                Operations <span className="h-px bg-slate-800 flex-grow"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link to="/book" className="group">
                    <div className="h-full bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 hover:bg-blue-500 transition-all transform hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <div className="text-4xl mb-6 bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md">📍</div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight italic">Designated Seat</h2>
                        <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed">
                            Secured workspace optimized for your batch productivity today.
                        </p>
                    </div>
                </Link>

                <Link to="/book" className="group">
                    <div className="h-full bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all transform hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <div className="text-4xl mb-6 bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md">💨</div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight italic">Floating Seat</h2>
                        <p className="text-indigo-100 text-sm font-medium opacity-80 leading-relaxed">
                            Dynamic universal seating. Unlock precision booking at 3:00 PM.
                        </p>
                    </div>
                </Link>

                <Link to="/my-bookings" className="group">
                    <div className="h-full bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl hover:border-blue-500/30 transition-all transform hover:-translate-y-2 relative overflow-hidden">
                        <div className="text-4xl mb-6 bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5">📅</div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight italic">View History</h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Audit your confirmed presence and upcoming office schedule.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
