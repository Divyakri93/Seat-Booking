import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BookSeatPage from './pages/BookSeatPage';
import MyBookingsPage from './pages/MyBookingsPage';
import WeeklyViewPage from './pages/WeeklyViewPage';
import AdminPage from './pages/AdminPage';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-black animate-pulse uppercase tracking-[0.5em]">Syncing System...</div>;
    if (!user) return <Navigate to="/" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

    return children;
};

function AppContent() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {user && <Navbar />}
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />

                {/* Secure / Employee Access */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/book" element={
                    <ProtectedRoute>
                        <BookSeatPage />
                    </ProtectedRoute>
                } />

                <Route path="/my-bookings" element={
                    <ProtectedRoute>
                        <MyBookingsPage />
                    </ProtectedRoute>
                } />

                {/* Admin Exclusive */}
                <Route path="/weekly" element={
                    <ProtectedRoute adminOnly>
                        <WeeklyViewPage />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <AdminPage />
                    </ProtectedRoute>
                } />

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
