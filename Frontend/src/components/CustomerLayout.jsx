import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CustomerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const role = user?.role;

  const isActive = (path) => location.pathname === path ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-900 selection:bg-purple-200 selection:text-purple-900">
      <header className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Ticket className="w-5 h-5 text-purple-600 transform -rotate-45" />
            </div>
            TicketRush
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/home" className={`transition ${isActive('/home')}`}>Events</Link>
            
            {user ? (
              <>
                <Link to="/my-tickets" className={`transition ${isActive('/my-tickets')}`}>My Tickets</Link>
                
                {/* NÚT CHUYỂN SANG GIAO DIỆN ADMIN (Chỉ Admin mới thấy) */}
                {role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}

                <div className="pl-4 border-l border-gray-200 flex items-center gap-3">
                  <Link to="/profile" className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center overflow-hidden border border-purple-100 hover:ring-2 ring-purple-300 transition-all">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </Link>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="pl-4 border-l border-gray-200 flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-purple-600 font-semibold transition">Login</Link>
                <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-sm">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
}