import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllEventsApi, deleteEventApi } from '../../services/event.api';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEventsApi({ limit: 20, page: 1 });
        setEvents(data.metadata || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải danh sách sự kiện.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này không?')) return;
    try {
      await deleteEventApi(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      alert('Xóa sự kiện thành công!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa sự kiện.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
            <p className="text-gray-600">Quản lý và tạo sự kiện mới</p>
          </div>
          <Link to="/create-event" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Sự Kiện Mới
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center text-gray-500 py-16">Đang tải danh sách sự kiện...</div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-6">{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center bg-white rounded-lg p-16 shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có sự kiện nào</h2>
            <p className="text-gray-500 mb-6">Bắt đầu bằng cách tạo sự kiện đầu tiên!</p>
            <Link to="/create-event" className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition">
              <Plus className="w-4 h-4 mr-2" />
              Tạo Sự Kiện Mới
            </Link>
          </div>
        )}

        {/* Events list */}
        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="md:flex">
                  {/* Banner image */}
                  <div className="md:w-64 bg-gray-200">
                    <img
                      src={event.banner_url || 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80'}
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                        <p className="text-gray-500 text-sm">{event.description || 'Chưa có mô tả'}</p>
                        {/* Status badge */}
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-bold rounded uppercase ${
                          event.status === 'ON_SALE' ? 'bg-green-100 text-green-700' :
                          event.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                          event.status === 'SOLD_OUT' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/admin/edit-event/${event.id}`} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(event.event_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{event.available_seats} / {event.total_seats} chỗ trống</span>
                      </div>
                    </div>

                    {/* Seat fill progress */}
                    {event.total_seats > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Tỷ lệ lấp đầy</span>
                          <span className="font-semibold">
                            {(((event.total_seats - event.available_seats) / event.total_seats) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${((event.total_seats - event.available_seats) / event.total_seats) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}