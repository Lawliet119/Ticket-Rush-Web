import { Link, useLocation } from 'react-router-dom';
import { Ticket, User, LayoutDashboard } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  // Hàm nhỏ để bôi đậm link đang chọn
  const isActive = (path) => location.pathname === path ? "text-violet-600 font-semibold" : "text-gray-600 hover:text-violet-600";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* ticketrush header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-8 md:px-12 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="bg-violet-100 p-1.5 rounded-lg">
              <Ticket className="w-5 h-5 text-violet-600 transform -rotate-45" />
            </div>
            TicketRush
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`transition ${isActive('/')}`}>Events</Link>
            <Link to="/my-tickets" className={`transition ${isActive('/my-tickets')}`}>My Tickets</Link>
            
            {/* Phân quyền: Nút Admin */}
            <Link to="/admin/events" className={`flex items-center gap-1 transition ${isActive('/admin/events')}`}>
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
            
            {/* User Profile / Đăng nhập */}
            <div className="pl-4 border-l border-gray-200">
               <Link to="/login" className="p-2 rounded-full bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-600 transition flex items-center justify-center">
                 <User className="w-4 h-4" />
               </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}