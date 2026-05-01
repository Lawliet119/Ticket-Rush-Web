import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, MapPin, Download, Eye, Ticket } from 'lucide-react';
import { getMyTicketsApi } from '../services/booking.api';
import { motion } from 'framer-motion';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getMyTicketsApi();
        const formattedTickets = data.metadata.map(ticket => {
          const event = ticket.orders?.events || {};
          const item = ticket.order_items || {};
          
          return {
            id: ticket.ticket_code,
            eventTitle: event.title || 'Unknown Event',
            image: event.banner_url || 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop',
            date: event.event_date ? new Date(event.event_date).toLocaleDateString('vi-VN') : '',
            time: event.event_date ? new Date(event.event_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            venue: event.venue || 'Unknown Venue',
            address: event.address || '',
            seats: `${item.zone_name} - ${item.seat_label}`,
            totalPaid: `${Number(item.price).toLocaleString('vi-VN')} đ`,
            status: ticket.status,
            qrData: ticket.qr_data
          };
        });
        setTickets(formattedTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Ticket className="w-12 h-12 text-purple-400 mb-4" />
          <p className="text-gray-500 font-medium tracking-widest uppercase">Fetching Tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-indigo-50/40 to-purple-50/50 py-16 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight relative inline-block">
            My Tickets
            <div className="absolute -bottom-3 left-0 w-1/2 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"></div>
          </h1>
          <p className="text-gray-500 mt-4 text-lg">Quản lý vé và chuẩn bị sẵn sàng cho sự kiện</p>
        </div>

        {tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white"
          >
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có vé nào</h3>
            <p className="text-gray-500">Bạn chưa mua bất kỳ vé nào trên TicketRush.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {tickets.map((ticket, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                key={ticket.id} 
                className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-white/50 flex flex-col md:flex-row relative group"
              >
                {/* 1. Image Section */}
                <div className="w-full md:w-[320px] h-64 md:h-auto relative overflow-hidden rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10"></div>
                  <img src={ticket.image} alt={ticket.eventTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-5 left-5 z-20">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
                      ticket.status === 'ACTIVE' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-gray-500/90 text-white border-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* 2. Content Section */}
                <div className="flex-1 p-8 pr-12 flex flex-col relative bg-white md:rounded-r-[2rem]">
                  <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{ticket.eventTitle}</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">TICKET ID: {ticket.id}</p>

                  <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-auto">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 p-2 rounded-lg shrink-0">
                        <Calendar size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date & Time</p>
                        <p className="text-gray-900 font-bold">{ticket.date}</p>
                        <p className="text-purple-600 font-semibold">{ticket.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                        <MapPin size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Venue</p>
                        <p className="text-gray-900 font-bold truncate max-w-[150px]" title={ticket.venue}>{ticket.venue}</p>
                        <p className="text-gray-500 text-xs font-medium truncate max-w-[150px]">{ticket.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Seat Location</p>
                      <p className="text-2xl font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">{ticket.seats}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                      <p className="text-xl font-extrabold text-purple-600">{ticket.totalPaid}</p>
                    </div>
                  </div>
                </div>

                {/* Perforation Line (Dotted cut) */}
                <div className="hidden md:flex flex-col items-center justify-between absolute right-[220px] top-0 bottom-0 z-20">
                  <div className="w-8 h-4 bg-[#f8fafc] rounded-b-full shadow-inner border-b border-white/50 -mt-[1px]"></div>
                  <div className="w-0 h-[80%] border-r-[2px] border-dashed border-gray-300"></div>
                  <div className="w-8 h-4 bg-[#f8fafc] rounded-t-full shadow-inner border-t border-white/50 -mb-[1px]"></div>
                </div>

                {/* 3. QR Code Section */}
                <div className="w-full md:w-[220px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-8 rounded-b-[2rem] md:rounded-bl-none md:rounded-r-[2rem] relative border-t md:border-t-0 md:border-l border-dashed border-gray-300 md:border-none">
                  {/* Decorative corner circles for mobile view */}
                  <div className="md:hidden absolute top-[-16px] left-8 w-8 h-8 bg-[#f8fafc] rounded-full shadow-inner"></div>
                  <div className="md:hidden absolute top-[-16px] right-8 w-8 h-8 bg-[#f8fafc] rounded-full shadow-inner"></div>
                  
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 group-hover:scale-105 transition-transform duration-300">
                    <QRCodeCanvas 
                      value={ticket.qrData} 
                      size={130}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase text-center leading-relaxed tracking-widest">
                    Scan to <br/>Enter Venue
                  </p>
                </div>
                
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}