import { useState, useEffect } from 'react';
import { Search, CalendarDays, MapPin } from 'lucide-react';
import { getAllEventsApi } from '../services/event.api';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEventsApi();
        setEvents(data.metadata || []); 
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="pb-16">
      
      <div className="relative bg-gray-900 h-[450px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533174000220-9fa6d6484d5f?auto=format&fit=crop&q=80')" }}
        ></div>
        
        <div className="relative z-10 w-full max-w-2xl mt-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">TicketRush</h1>
          <p className="text-xl text-gray-200 mb-10 font-medium drop-shadow-md">Your favorite events, one click away.</p>
          
          <div className="bg-white rounded-full p-2 flex items-center shadow-2xl mx-auto max-w-xl">
            <input 
              type="text" 
              placeholder="Search events, artists, venues..." 
              className="flex-grow px-4 py-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            <button className="bg-violet-600 hover:bg-violet-700 p-3 rounded-full text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Upcoming Events</h2>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No events available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col cursor-pointer group">
                
                <div className="relative h-52 bg-gray-200 overflow-hidden">
                  <img 
                    src={event.image || 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80'} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {event.seatsLeft || event.capacity} seats left
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{event.title}</h3>
                    {event.isPreview && (
                      <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider whitespace-nowrap mt-1">Preview</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-6">{event.artist}</p>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                      {/* TODO: Format date based on backend response */}
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">From</span>
                    <span className="text-xl font-extrabold text-violet-600">{event.price?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}