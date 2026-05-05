import { useState, useEffect, useRef } from 'react';
import { Search, CalendarDays, MapPin, ChevronLeft, ChevronRight, CheckCircle2, ShoppingCart, Ticket as TicketIcon } from 'lucide-react';
import { getAllEventsApi } from '../services/event.api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

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
    <div className="pb-24 bg-[#f4f4f4] relative overflow-hidden">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[600px] flex flex-col items-center justify-center text-center px-4 overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/concert_hero.png')" }}
        ></div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Navigation Arrows (Visual only) */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition opacity-0 group-hover:opacity-100 hidden md:block">
          <ChevronLeft className="w-12 h-12" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition opacity-0 group-hover:opacity-100 hidden md:block">
          <ChevronRight className="w-12 h-12" />
        </button>

        <div className="relative z-10 w-full max-w-4xl mt-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-widest uppercase drop-shadow-lg">
            Selling<br/>Concert Tickets
          </h1>
          <p className="text-sm md:text-base text-gray-200 mb-10 font-medium max-w-2xl mx-auto drop-shadow-md px-4">
            Post-ironic authentic drinking vinegar chambray quinoa VHS letterpress sriracha, tacos skateboard migas farm-to-table artisan kombucha.
          </p>
          
          <button className="bg-white hover:bg-gray-100 text-black px-8 py-3 font-bold text-sm tracking-wider uppercase transition-colors shadow-lg">
            Read More
          </button>
        </div>
      </div>

      {/* --- FEATURES BAR --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <CheckCircle2 className="w-8 h-8 text-[#6bda63] mb-4" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Choose Events and Tickets</h3>
              <p className="text-gray-400 text-xs">with only a few clicks</p>
            </div>
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <ShoppingCart className="w-8 h-8 text-[#6bda63] mb-4" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Buy Directly from Organizers</h3>
              <p className="text-gray-400 text-xs">Pay online or cash on delivery</p>
            </div>
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <TicketIcon className="w-8 h-8 text-[#6bda63] mb-4" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Receive Tickets</h3>
              <p className="text-gray-400 text-xs">via email or right at your door</p>
            </div>
          </div>
        </div>
      </div>

      <div id="upcoming-events" className="relative max-w-5xl mx-auto px-4 mt-16 z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Upcoming Events
            </h2>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No events available at the moment.</div>
        ) : (
          <div className="relative group -mx-4 px-4">
            {/* Left Arrow */}
            <button 
              onClick={() => scroll('left')} 
              className="absolute -left-2 md:-left-6 top-[calc(50%-20px)] z-20 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={scrollRef} 
              className="flex gap-8 overflow-x-auto snap-x scroll-smooth hide-scrollbar pb-6 pt-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {events.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => {
                    if (!user) {
                      alert("Please log in to view event details and book tickets!");
                    } else {
                      navigate(`/events/${event.id}`);
                    }
                  }} 
                  className="min-w-[100%] md:min-w-[calc(50%-16px)] snap-start shrink-0 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer group/card"
                >
                  
                  <div className="relative h-[250px] bg-gray-200 overflow-hidden">
                    <img 
                      src={event.banner_url || 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80'} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" 
                    />
                    {/* Venue overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex items-center text-white text-xs font-medium">
                      <MapPin className="w-3 h-3 mr-1.5" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow border border-t-0 border-gray-100">
                    <h3 className="text-base font-bold text-gray-800 leading-tight mb-2 truncate">{event.title}</h3>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-[#e67e22]">
                        {(() => {
                          if (!event.zones || event.zones.length === 0) return "Updating";
                          const prices = event.zones.map(z => Number(z.price));
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          if (min === max) return `$${min.toLocaleString('en-US')}`;
                          return `$${min.toLocaleString('en-US')} - $${max.toLocaleString('en-US')}`;
                        })()}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Charity
                      </span>
                      <span className="flex items-center gap-1">
                        <TicketIcon className="w-3 h-3" /> {event.available_seats}
                      </span>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button 
              onClick={() => scroll('right')} 
              className="absolute -right-2 md:-right-6 top-[calc(50%-20px)] z-20 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}