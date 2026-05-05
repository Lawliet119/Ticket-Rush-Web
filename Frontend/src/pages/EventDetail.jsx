import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { getEventDetailApi } from '../services/event.api';
import SeatMap from '../components/SeatMap';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../lib/socket';

export default function EventDetail() {
  // 1. Get ID from URL
  const { id } = useParams(); 
  
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Fetch event data from API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getEventDetailApi(id);
        setEventData(res.metadata);
      } catch (err) {
        setError('Unable to load event details! (The ID may not exist)');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();

    const socket = io(SOCKET_URL);
    socket.on('dashboard_stats_updated', () => {
      fetchDetail();
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">Loading seat map...</div>;
  if (error || !eventData) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl font-bold">{error}</div>;

  const occupancyRate = eventData.total_seats > 0 
    ? (((eventData.total_seats - eventData.available_seats) / eventData.total_seats) * 100).toFixed(0) 
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors w-fit">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to list</span>
        </Link>
      </div>

      {/* Event Header - Real Data */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg bg-gray-100">
          <img 
            src={eventData.banner_url || 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop'} 
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{eventData.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-8 mt-2">
            {eventData.description || 'No description available for this event.'}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} className="text-gray-400" />
              <span className="font-medium">{new Date(eventData.event_date).toLocaleString('en-US')}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin size={20} className="text-gray-400" />
              <span className="font-medium">{eventData.venue} {eventData.address && `- ${eventData.address}`}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Users size={20} className="text-gray-400" />
              <span className="font-medium">{eventData.available_seats} / {eventData.total_seats} seats available</span>
            </div>
          </div>

          {eventData.total_seats > 0 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                <span>Venue Occupancy Rate</span>
                <span>{occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Pass real data to Seat Map */}
      <div className="bg-gray-50 py-16 border-t border-gray-100">
        <SeatMap eventData={eventData} />
      </div>
    </div>
  );
}