import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    // If user is already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-outfit overflow-hidden">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                            🏢
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                            OFFICE<span className="text-blue-600">SYNC</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#rules" className="hover:text-blue-600 transition-colors">Seat Rules</a>
                        <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95">
                            Join Team
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Smart Seat Booking v2.0
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic">Spot</span>, Own Your Day.
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 font-medium">
                            Modernize your hybrid workspace with precision. 80 members, 50 seats, two-batch system – perfectly synchronized for your productivity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
                            <Link to="/register" className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95 text-center">
                                Join Now — Free
                            </Link>
                            <Link to="/login" className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[1.5rem] font-black text-lg hover:border-blue-600/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center">
                                Employee Login
                            </Link>
                        </div>
                    </div>

                    <div className="relative animate-in zoom-in duration-1000 delay-300">
                        {/* Static decorative background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-950/20 border border-white/20">
                            <img
                                src="/office_hero.png"
                                alt="Modern Office Space"
                                className="w-full h-auto object-cover"
                            />
                            {/* Floating Card Overlay */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl text-white shadow-2xl animate-bounce-slow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">✓</div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                            <p className="font-bold">D-06 Confirmed</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Expires</p>
                                        <p className="font-bold">6:00 PM</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-green-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Optimized for Your Team</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">Built to solve the hybrid office puzzle with iron-clad booking rules and real-time updates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: '80 Members', icon: '👥', desc: 'Managed across 8 squads (10 members each) and 2 batches.' },
                            { title: '50 Seats', icon: '🛋️', desc: '40 Designated Seats + 10 Floating Seats available daily.' },
                            { title: 'Strict Rules', icon: '⚖️', desc: 'One person, one seat. No double bookings. Guaranteed.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-950 p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <div className="text-4xl mb-6">{item.icon}</div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight">{item.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rules Section */}
            <section id="rules" className="py-32 px-6">
                <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -ml-32 -mt-32"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight italic tracking-tighter">
                                The Master <span className="text-blue-500 underline decoration-indigo-500/50">Schedule</span>
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/5 font-black text-blue-400">01</div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Batch 1 (Squads 1-4)</h4>
                                        <p className="text-slate-400 font-medium">Active in office Monday - Wednesday. Book designated seats 2 weeks in advance.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/5 font-black text-indigo-400">02</div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Batch 2 (Squads 5-8)</h4>
                                        <p className="text-slate-400 font-medium">Active in office Thursday - Friday. Same 2-week early booking privilege.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/5 font-black text-green-400">03</div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Floating Seats (Everyone)</h4>
                                        <p className="text-slate-400 font-medium">Reserved for remote batch members. Unlock at 3:00 PM exactly one day before.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-inner">
                            <h3 className="text-center text-white font-black tracking-widest uppercase text-xs mb-8 opacity-40">Live Capacity Monitor</h3>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3">
                                        <span>DESIGNATED CAPACITY</span>
                                        <span className="text-blue-500 italic">40 Spots</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-3">
                                        <span>FLOATING POOL</span>
                                        <span className="text-indigo-500 italic">10 Spots</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[40%] h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="text-white font-black tracking-tighter italic">80 MEMBERS REGISTERED</div>
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center font-bold text-[10px]">JD</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center font-bold text-[10px]">SM</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">+78</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA / Footer Section */}
            <footer className="py-32 px-6 border-t border-slate-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter italic italic">Ready to <span className="text-blue-600">Secure</span> Your Spot?</h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">Join the most efficient office management system today. Coordinate with your squad and never worry about workspace again.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/register" className="px-12 py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 transition-all active:scale-95">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-[2rem] font-black text-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95">
                            Login
                        </Link>
                    </div>

                    <div className="mt-32 pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span>© 2026 OfficeSync Systems. All Rights Reserved.</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Contact Admin</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
