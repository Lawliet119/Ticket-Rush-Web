import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom'; // Dùng Link để chuyển hướng
// Tạm thời fake data tĩnh
const mockEvents = [
  { id: '1', name: 'Summer Beats Festival 2026', artist: 'Various Artists', date: '2026-07-15T18:00', venue: 'National Stadium', totalSeats: 450, availableSeats: 287, image: 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80' },
  { id: '2', name: 'Rock Night Live', artist: 'The Thunders', date: '2026-06-20T20:00', venue: 'Youth Theater', totalSeats: 300, availableSeats: 156, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80' }
];

export default function ManageEventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
            <p className="text-gray-600">Quản lý và tạo sự kiện mới</p>
          </div>
          
          {/* Sửa lại nút thành Link trỏ về trang CreateEvent của bạn */}
          <Link to="/create-event" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Sự Kiện Mới
          </Link>
        </div>

        <div className="grid gap-6">
          {mockEvents.map((event, index) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-64">
                  <img src={event.image} alt={event.name} className="w-full h-48 md:h-full object-cover" />
                </div>

                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{event.name}</h3>
                      <p className="text-gray-600">{event.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{event.availableSeats} / {event.totalSeats} chỗ trống</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tỷ lệ lấp đầy</span>
                      <span className="font-semibold">{(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}