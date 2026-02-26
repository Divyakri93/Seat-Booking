import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '../utils/api';

const AdminPage = () => {
    const [newSeat, setNewSeat] = useState({ seatNumber: '', seatType: 'designated', assignedBatch: 1 });
    const [teamDay, setTeamDay] = useState({ weekStartDate: '', extraFloatingSeats: 10, isTeamDay: true });
    const queryClient = useQueryClient();

    const today = format(new Date(), 'yyyy-MM-dd');

    // Queries
    const { data: seats } = useQuery({ queryKey: ['adminSeats'], queryFn: async () => (await api.get('/seats')).data });
    const { data: users } = useQuery({ queryKey: ['adminUsers'], queryFn: async () => (await api.get('/users')).data });
    const { data: todayBookings } = useQuery({ queryKey: ['todayBookings'], queryFn: async () => (await api.get(`/bookings/date?date=${today}`)).data });
    const { data: schedule } = useQuery({ queryKey: ['currentSchedule'], queryFn: async () => (await api.get('/schedule/current')).data });

    // Mutations
    const addSeatMutation = useMutation({
        mutationFn: async (data) => await api.post('/seats', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminSeats']);
            setNewSeat({ seatNumber: '', seatType: 'designated', assignedBatch: 1 });
        }
    });

    const toggleSeatStatus = useMutation({
        mutationFn: async ({ id, isActive }) => await api.put(`/seats/${id}`, { isActive }),
        onSuccess: () => queryClient.invalidateQueries(['adminSeats'])
    });

    const setTeamDayMutation = useMutation({
        mutationFn: async (data) => {
            const d = new Date(data.weekStartDate);
            // ISO Week calculation logic
            const date = new Date(d.getTime());
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            const week1 = new Date(date.getFullYear(), 0, 4);
            const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

            return await api.put('/schedule/team-day', { ...data, weekNumber });
        },
        onSuccess: () => queryClient.invalidateQueries(['currentSchedule'])
    });

    // Stats Logic
    const totalOccupied = todayBookings?.length || 0;
    const floatingBooked = todayBookings?.filter(b => b.bookingType === 'floating').length || 0;
    const totalEmployees = users?.length || 0;
    const inOfficeToday = totalOccupied;
    const wfhToday = Math.max(0, totalEmployees - totalOccupied);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 font-outfit text-slate-900 dark:text-white">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                        Admin Restricted
                    </span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter italic">Command <span className="text-blue-600">Center</span></h1>
                <p className="text-slate-500 font-medium">Global workforce and infrastructure management.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Total Occupancy', val: totalOccupied, sub: 'Seats Today', color: 'blue' },
                    { label: 'Floating Usage', val: floatingBooked, sub: 'Booked', color: 'indigo' },
                    { label: 'In Office', val: inOfficeToday, sub: 'Employees', color: 'green' },
                    { label: 'Remote (WFH)', val: wfhToday, sub: 'Estimated', color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-white/5 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-${stat.color}-500/10 transition-colors`}></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full`}></span> {stat.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-black text-${stat.color}-600 dark:text-${stat.color}-500`}>{stat.val}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Management */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Seat Inventory */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                        <div className="p-8 border-b dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                            <h2 className="text-2xl font-black italic tracking-tight">Seat Inventory</h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{seats?.length || 0} Total Units</span>
                        </div>

                        {/* Add Form Inline */}
                        <div className="p-8 border-b dark:border-white/5 bg-blue-500/5 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="ID (e.g. A01)"
                                className="px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-sm outline-none focus:border-blue-500/50 transition-all font-bold"
                                value={newSeat.seatNumber}
                                onChange={e => setNewSeat({ ...newSeat, seatNumber: e.target.value })}
                            />
                            <select
                                className="px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold uppercase"
                                value={newSeat.seatType}
                                onChange={e => setNewSeat({ ...newSeat, seatType: e.target.value })}
                            >
                                <option value="designated">Designated</option>
                                <option value="floating">Floating</option>
                            </select>
                            {newSeat.seatType === 'designated' && (
                                <select
                                    className="px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold uppercase"
                                    value={newSeat.assignedBatch}
                                    onChange={e => setNewSeat({ ...newSeat, assignedBatch: Number(e.target.value) })}
                                >
                                    <option value={1}>Batch 1</option>
                                    <option value={2}>Batch 2</option>
                                </select>
                            )}
                            <button
                                onClick={() => addSeatMutation.mutate(newSeat)}
                                className="bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                + Add Unit
                            </button>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 shadow-sm border-b dark:border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {seats?.map(seat => (
                                        <tr key={seat._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6 font-black text-lg text-slate-900 dark:text-white italic">{seat.seatNumber}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${seat.seatType === 'designated' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                                                    }`}>
                                                    {seat.seatType}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                {seat.seatType === 'designated' ? `Team Batch ${seat.assignedBatch}` : 'Universal Pool'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${seat.isActive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`}></span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{seat.isActive ? 'Functional' : 'Deactivated'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => toggleSeatStatus.mutate({ id: seat._id, isActive: !seat.isActive })}
                                                    className={`text-[10px] font-black uppercase tracking-widest p-2 rounded-lg border transition-all ${seat.isActive ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10'
                                                        }`}
                                                >
                                                    {seat.isActive ? 'Disable' : 'Enable'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Team Day Config */}
                    <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                        <h2 className="text-2xl font-black mb-8 italic tracking-tight">Override Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Deployment Week</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold"
                                    value={teamDay.weekStartDate}
                                    onChange={e => setTeamDay({ ...teamDay, weekStartDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Floating Multiplier</label>
                                <input
                                    type="number"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold"
                                    value={teamDay.extraFloatingSeats}
                                    onChange={e => setTeamDay({ ...teamDay, extraFloatingSeats: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setTeamDayMutation.mutate(teamDay)}
                                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black py-4 rounded-2xl text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                                >
                                    Push Global Update
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Employee Overview */}
                <div className="space-y-10">
                    <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-white/5">
                        <h2 className="text-2xl font-black mb-10 italic tracking-tight underline decoration-blue-500/30">Workforce Roster</h2>

                        {/* Group by Batch 1 */}
                        <div className="mb-12">
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] border-b border-blue-500/10 pb-4 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Production Batch 01
                            </h3>
                            <div className="space-y-4">
                                {users?.filter(u => u.batch === 1).map(u => (
                                    <div key={u._id} className="bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase italic">{u.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">SQUAD {u.squad} • {u.employeeId}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">💼</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Group by Batch 2 */}
                        <div>
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] border-b border-indigo-500/10 pb-4 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span> Production Batch 02
                            </h3>
                            <div className="space-y-4">
                                {users?.filter(u => u.batch === 2).map(u => (
                                    <div key={u._id} className="bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase italic">{u.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">SQUAD {u.squad} • {u.employeeId}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">💼</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
