import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 font-outfit">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-white/10 shadow-2xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[1.5rem] text-white text-4xl mb-6 shadow-2xl shadow-blue-500/30 transform rotate-12">
                            🔐
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter italic">Welcome Back</h1>
                        <p className="text-slate-500 font-medium">Access your personalized workstation</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-3 animate-head-shake">
                            <span className="text-xl">🚨</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Corporate Email</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-5 text-slate-900 dark:text-white outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all font-medium pr-12"
                                    placeholder="your@email.com"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">📧</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Secure Password</label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-5 text-slate-900 dark:text-white outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all font-medium pr-12"
                                    placeholder="••••••••"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔑</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-2xl font-black text-2xl tracking-tight italic transition-all overflow-hidden relative active:scale-95 shadow-2xl ${loading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-600/40 translate-y-0 hover:-translate-y-1'
                                }`}
                        >
                            <span className="relative z-10">{loading ? 'Syncing...' : 'Enter Dashboard →'}</span>
                            {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer shadow-inner"></div>}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
                        <p className="text-slate-500 font-medium tracking-tight">
                            New to the team? <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2 italic">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
