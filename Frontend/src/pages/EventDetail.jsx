import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeatMap from '../components/SeatMap';

export default function EventDetail() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nút Back */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Events</span>
        </Link>
      </div>

      {/* Phần Header Sự Kiện */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Banner */}
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop" 
            alt="Event Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thông tin sự kiện */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Summer Beats Festival 2026</h1>
          <p className="text-xl text-gray-500 mb-6 font-medium">Various Artists</p>
          
          <p className="text-gray-600 leading-relaxed mb-8">
            Experience the biggest music festival of the summer featuring top artists from around the world. 
            Don't miss out on this unforgettable night of rhythm and energy.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} className="text-gray-400" />
              <span className="font-medium">15/7/2026 • 18:00</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin size={20} className="text-gray-400" />
              <span className="font-medium">National Stadium, Hanoi, Vietnam</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Users size={20} className="text-gray-400" />
              <span className="font-medium">287 / 450 seats available</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
              <span>Seat occupancy</span>
              <span>36%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-gray-900 h-full rounded-full transition-all duration-500" style={{ width: '36%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Sơ đồ ghế */}
      <div className="bg-gray-50 py-16 border-t border-gray-100">
        <SeatMap />
      </div>
    </div>
  );
}