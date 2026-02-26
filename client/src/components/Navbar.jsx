import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 font-outfit">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                                💺
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter uppercase">
                                Office<span className="text-blue-500 underline decoration-indigo-500">Sync</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl mr-4 border border-white/5">
                                    <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
                                    <NavLink to="/book" active={isActive('/book')}>Book Seat</NavLink>
                                    <NavLink to="/my-bookings" active={isActive('/my-bookings')}>My Bookings</NavLink>
                                    {user.role === 'admin' && (
                                        <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 ml-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-white tracking-tight">{user.name}</span>
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">
                                            {user.role} • Batch {user.batch}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300">
                                        {user.name.charAt(0)}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children, active }) => (
    <Link
        to={to}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
    >
        {children}
    </Link>
);

export default Navbar;
