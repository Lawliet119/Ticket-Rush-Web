import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, Download } from 'lucide-react';

// Mock ticket data
const mockTickets = [
  {
    id: 'TKT-001-2026', eventName: 'Summer Beats Festival 2026', eventDate: '2026-07-15T18:00', venue: 'National Stadium', location: 'Hanoi, Vietnam',
    seats: [{ zone: 'VIP', row: 2, number: 5 }, { zone: 'VIP', row: 2, number: 6 }],
    totalPrice: 5000000,
    image: 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80',
  }
];

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Vé Của Tôi</h1>

        {mockTickets.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có vé nào</h2>
            <p className="text-gray-600 mb-6">Hãy đặt vé sự kiện đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mockTickets.map((ticket, index) => (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img src={ticket.image} alt={ticket.eventName} className="w-full h-48 md:h-full object-cover" />
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{ticket.eventName}</h2>
                        <p className="text-sm text-gray-500">Mã vé: {ticket.id}</p>
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">Đã xác nhận</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Thời gian</p>
                            <p className="font-semibold">{new Date(ticket.eventDate).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Địa điểm</p>
                            <p className="font-semibold">{ticket.venue}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <QRCodeSVG value={ticket.id} size={100} level="H" includeMargin />
                        <p className="text-xs text-gray-500 mt-2">Quét mã tại cổng</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
                          <Download className="w-4 h-4 mr-2" /> Tải vé
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Ghế: {ticket.seats.map((s) => `${s.zone} Hàng ${s.row} Số ${s.number}`).join(', ')}</p>
                        <p className="font-bold text-purple-600 text-lg">{ticket.totalPrice.toLocaleString('vi-VN')} ₫</p>
                      </div>
                    </div>
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