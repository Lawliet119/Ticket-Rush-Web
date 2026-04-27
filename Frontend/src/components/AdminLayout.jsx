import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, User, LogOut, ArrowLeftRight } from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const isActive = (path) => location.pathname === path ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Ticket className="w-5 h-5 text-purple-600 transform -rotate-45" />
            </div>
            TicketRush <span className="text-sm font-normal text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full ml-1">Admin</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/admin/dashboard" className={`transition ${isActive('/admin/dashboard')}`}>Dashboard</Link>
            <Link to="/admin/events" className={`transition ${isActive('/admin/events')}`}>Events</Link>
            
            {/* NÚT QUAY LẠI GIAO DIỆN KHÁN GIẢ */}
            <Link to="/home" className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition">
              <ArrowLeftRight className="w-4 h-4" /> Customer View
            </Link>

            <div className="pl-4 border-l border-gray-200 flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
}