import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, MapPin, Download, Eye } from 'lucide-react';

export default function MyTicketsPage() {
  // 1. HỨNG DỮ LIỆU TỪ CHECKOUT
  const location = useLocation();
  const newBooking = location.state; // Sẽ chứa { selectedSeats, totalPrice }

  // 2. CHẾ BIẾN DỮ LIỆU TRƯỚC KHI ĐƯA VÀO GIAO DIỆN
  // Nếu có vé mới thì format lại tên ghế (VD: "VIP - Row 1 Seat 2, Zone A - Row 3 Seat 1")
  const formattedSeats = newBooking 
    ? newBooking.selectedSeats.map(s => s.label).join(', ')
    : 'VIP Row 2 Seat 5, VIP Row 2 Seat 6'; // Dữ liệu phòng hờ

  // Nếu có vé mới thì lấy tổng tiền mới
  const formattedPrice = newBooking 
    ? `${newBooking.totalPrice.toLocaleString('vi-VN')} đ`
    : '5.000.000 đ'; // Dữ liệu phòng hờ

  // Dữ liệu vé để vẽ giao diện
  const MY_TICKETS = [
    {
      id: `TKT-${Math.floor(Math.random() * 1000000)}-2026`, // Random mã vé cho xịn
      eventTitle: 'Summer Beats Festival 2026',
      image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2070&auto=format&fit=crop',
      date: '15/7/2026',
      time: '18:00',
      venue: 'National Stadium',
      address: 'Hanoi, Vietnam',
      seats: formattedSeats,   // <--- Truyền danh sách ghế đã xử lý vào đây
      totalPaid: formattedPrice, // <--- Truyền giá tiền đã xử lý vào đây
      status: 'Confirmed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-black text-gray-900 mb-10">My Tickets</h1>

        <div className="space-y-8">
          {MY_TICKETS.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              
              {/* Ảnh sự kiện */}
              <div className="w-full md:w-1/3 h-64 md:h-auto relative">
                <img src={ticket.image} alt={ticket.eventTitle} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
                  {ticket.status}
                </div>
              </div>

              {/* Thông tin vé */}
              <div className="flex-1 p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">{ticket.eventTitle}</h2>
                  <p className="text-sm text-gray-400 font-medium mb-6">Ticket ID: {ticket.id}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Calendar size={20} className="text-gray-300 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                        <p className="text-gray-900 font-bold">{ticket.date}</p>
                        <p className="text-gray-600 text-sm font-medium">{ticket.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-gray-300 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Venue</p>
                        <p className="text-gray-900 font-bold">{ticket.venue}</p>
                        <p className="text-gray-600 text-sm font-medium">{ticket.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Seats</p>
                      <p className="text-gray-900 font-black">{ticket.seats}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                      <p className="text-xl font-black text-violet-600">{ticket.totalPaid}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="w-full md:w-48 flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="bg-white p-3 rounded-2xl shadow-inner mb-4">
                    <QRCodeCanvas 
                      value={ticket.id} 
                      size={120}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase text-center leading-tight">
                    Scan at venue entrance
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}