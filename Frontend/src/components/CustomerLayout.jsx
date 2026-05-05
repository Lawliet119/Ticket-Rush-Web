import { Link, useLocation } from 'react-router-dom';
import { Ticket, User, LogOut, LayoutDashboard, MessageCircle, Globe, Share2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CustomerLayout({ children }) {
  const location = useLocation();

  const { user } = useAuth();
  const role = user?.role;

  const isActive = (path) => location.pathname === path ? "text-purple-600 font-semibold" : "text-gray-600 hover:text-purple-600";

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-900 selection:bg-purple-200 selection:text-purple-900">
      {/* NAVBAR CONTAINER */}
      <div className={location.pathname === '/home' ? 'absolute w-full top-0 z-50' : 'bg-[#1a1325] sticky top-0 z-50 shadow-lg'}>
        {/* --- THIN TOP BAR --- */}
        <div className={`text-gray-300 text-xs py-2 hidden md:block ${location.pathname === '/home' ? 'bg-black/20' : 'bg-black'}`}>
          <div className="container mx-auto px-4 max-w-7xl flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-white cursor-pointer"><Mail className="w-3 h-3" /> support@ticketrush.com</span>
              <span className="flex items-center gap-2 hover:text-white cursor-pointer"><MessageCircle className="w-3 h-3" /> +123 456 789</span>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="w-3 h-3 cursor-pointer hover:text-white" />
              <Ticket className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>

        {/* --- MAIN NAVBAR --- */}
        <header className={`text-white border-b border-white/5 ${location.pathname === '/home' ? 'bg-transparent' : 'bg-transparent'}`}>
          <div className="container mx-auto px-4 max-w-7xl h-20 flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-3 text-2xl font-black text-white tracking-wider">
              <div className="bg-[#6bda63] p-1.5 rounded text-black">
                <Ticket className="w-6 h-6 transform -rotate-45" />
              </div>
              TICKETRUSH
            </Link>

          <nav className="flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-gray-300">
            <Link to="/home" className={`hover:text-white transition ${location.pathname === '/home' ? 'text-white' : ''}`}>Home</Link>
            <Link 
              to="/home" 
              onClick={() => {
                setTimeout(() => {
                  const el = document.getElementById('upcoming-events');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 100; // Offset for navbar
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, location.pathname === '/home' ? 0 : 300);
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Events
            </Link>
            
            {user ? (
              <>
                <Link to="/my-tickets" className={`hover:text-white transition ${location.pathname === '/my-tickets' ? 'text-white' : ''}`}>My Tickets</Link>
                
                {role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="flex items-center gap-1 text-gray-300 hover:text-white transition">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}

                <div className="pl-6 border-l border-gray-700 flex items-center gap-4">
                  <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center overflow-hidden border border-gray-600 hover:border-white transition-all">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="pl-6 border-l border-gray-700 flex items-center gap-4">
                <Link to="/login" className="hover:text-white transition">Login</Link>
                <Link to="/signup" className="bg-[#6bda63] hover:bg-[#5bc254] text-black px-6 py-2.5 rounded font-bold transition">Sign Up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      </div>
      <main className="flex-grow">{children}</main>

      {/* --- PREMIUM FOOTER (LIGHT THEME) --- */}
      <footer className="bg-gray-50 text-gray-500 pt-12 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-gray-200 pb-12">
            
            {/* Column 1: Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Hotline</h3>
                <p className="text-sm mb-1">Mon - Sun (8:00 AM - 11:00 PM)</p>
                <p className="text-xl font-black text-purple-600">1900.6408</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Email</h3>
                <p className="text-sm">support@ticketrush.vn</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">Headquarters</h3>
                <p className="text-sm leading-relaxed">
                  Technology Building, Vietnam National University,<br/>
                  144 Xuan Thuy, Cau Giay, Hanoi
                </p>
              </div>
            </div>

            {/* Column 2: Customer & Organizer Links */}
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">For Customers</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service for Customers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">For Organizers</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service for Organizers</a></li>
                </ul>
              </div>
            </div>

            {/* Column 3: About Us */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">About Us</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Operating Regulations</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Dispute Resolution</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Payment Security Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Return & Refund Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Shipping & Delivery Terms</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Payment Methods</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* TicketRush App */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">TicketRush App</h3>
              <div className="flex flex-col gap-3">
                <button className="w-40 h-12 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center gap-3 hover:border-purple-300 hover:ring-2 hover:ring-purple-100 transition">
                  <Globe className="w-6 h-6 text-gray-700" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Download on</p>
                    <p className="text-sm font-bold text-gray-900">Google Play</p>
                  </div>
                </button>
                <button className="w-40 h-12 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center gap-3 hover:border-purple-300 hover:ring-2 hover:ring-purple-100 transition">
                  <Ticket className="w-6 h-6 text-gray-700" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Download on</p>
                    <p className="text-sm font-bold text-gray-900">App Store</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Organizer Check-in App */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Check-in (Organizers)</h3>
              <div className="flex flex-col gap-3">
                <button className="w-40 h-12 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center gap-3 hover:border-purple-300 hover:ring-2 hover:ring-purple-100 transition">
                  <Globe className="w-6 h-6 text-gray-700" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Download on</p>
                    <p className="text-sm font-bold text-gray-900">Google Play</p>
                  </div>
                </button>
                <button className="w-40 h-12 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center gap-3 hover:border-purple-300 hover:ring-2 hover:ring-purple-100 transition">
                  <Ticket className="w-6 h-6 text-gray-700" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Download on</p>
                    <p className="text-sm font-bold text-gray-900">App Store</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Follow Us & Language */}
            <div>
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Follow us</h3>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 transition">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 transition">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 transition">
                    <Share2 className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Language</h3>
                <div className="flex gap-3 text-2xl">
                  <span className="cursor-pointer hover:scale-110 transition-transform" title="Vietnamese">🇻🇳</span>
                  <span className="cursor-pointer hover:scale-110 transition-transform grayscale hover:grayscale-0" title="English">🇬🇧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}