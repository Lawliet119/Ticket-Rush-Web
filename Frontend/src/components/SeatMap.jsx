import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const ZONES = [
  { id: 'VIP', name: 'VIP', price: 2500000, rows: 5, seatsPerRow: 10, color: 'bg-amber-400' },
  { id: 'ZONE_A', name: 'Zone A', price: 1500000, rows: 8, seatsPerRow: 15, color: 'bg-blue-400' },
  { id: 'ZONE_B', name: 'Zone B', price: 800000, rows: 10, seatsPerRow: 18, color: 'bg-emerald-400' },
];

export default function SeatMap() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [realtimeLockedSeats, setRealtimeLockedSeats] = useState([]); // Chứa các ghế BỊ NGƯỜI KHÁC CHỌN
  const [socket, setSocket] = useState(null);
  
  const navigate = useNavigate();

  // Động cơ đếm ngược
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // ĐỘNG CƠ REAL-TIME SOCKET.IO
  useEffect(() => {
    // Kết nối tới Mini Server
    const newSocket = io('http://127.0.0.1:4000', {
  transports: ['websocket']
  });
    setSocket(newSocket);

    // 1. Nhận danh sách ghế đang bị khóa ngay khi mới vào
    newSocket.on('sync_seats', (lockedList) => {
      setRealtimeLockedSeats(lockedList);
    });

    // 2. Lắng nghe mỗi khi có ai đó bấm chọn/nhả ghế
    newSocket.on('seat_updated', (seatId, isLocking) => {
      setRealtimeLockedSeats(prev => {
        if (isLocking) return [...prev, seatId]; // Thêm vào danh sách khóa
        return prev.filter(id => id !== seatId); // Rút khỏi danh sách khóa
      });
    });

    // Ngắt kết nối khi rời trang
    return () => newSocket.disconnect();
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatus = (seatId) => {
    // Nếu ghế nằm trong danh sách đang bị người khác giữ -> Trả về LOCKED
    if (realtimeLockedSeats.includes(seatId)) return 'LOCKED';

    // Mock logic cũ cho vài ghế thành SOLD
    const hash = seatId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 15 === 0) return 'SOLD';
    
    return 'AVAILABLE';
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'SOLD' || seat.status === 'LOCKED') return; // Không cho click nếu đã Sold hoặc bị người khác Lock

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      
      if (isSelected) {
        // ĐANG CHỌN MÀ BẤM LẠI -> NHẢ GHẾ (Báo cho Server là false)
        if (socket) socket.emit('toggle_seat', seat.id, false);
        return prev.filter(s => s.id !== seat.id);
      } else {
        // CHƯA CHỌN MÀ BẤM VÀO -> XÍ GHẾ (Báo cho Server là true)
        if (socket) socket.emit('toggle_seat', seat.id, true);
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-8 flex flex-col xl:flex-row gap-8 xl:gap-12">
      <div className="flex-1 overflow-x-auto xl:overflow-x-visible pb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Select Your Seats</h2>
        
        <div className="w-full bg-slate-800 text-white py-3 text-center rounded-xl font-bold tracking-[0.5em] mb-16 shadow-lg">
          STAGE
        </div>

        {ZONES.map(zone => (
          <div key={zone.id} className="mb-14 min-w-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-4 h-4 rounded ${zone.color}`}></div>
              <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
              <span className="text-gray-400 font-medium">{zone.price.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex flex-col gap-3">
              {[...Array(zone.rows)].map((_, rowIndex) => {
                const rowNum = rowIndex + 1;
                return (
                  <div key={rowNum} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-bold text-gray-400 text-center">{rowNum}</span>
                    <div className="flex gap-2">
                      {[...Array(zone.seatsPerRow)].map((_, seatIndex) => {
                        const seatNum = seatIndex + 1;
                        const seatId = `${zone.id}-${rowNum}-${seatNum}`;
                        const status = getStatus(seatId); // Lấy trạng thái real-time
                        const isSelected = selectedSeats.some(s => s.id === seatId);

                        let bgClass = zone.color;
                        let cursor = 'cursor-pointer hover:scale-110';

                        // Đổ màu theo trạng thái
                        if (status === 'SOLD') { bgClass = 'bg-gray-300'; cursor = 'cursor-not-allowed'; }
                        else if (status === 'LOCKED') { bgClass = 'bg-orange-400'; cursor = 'cursor-not-allowed'; }
                        else if (isSelected) { bgClass = 'bg-violet-600 shadow-md ring-2 ring-violet-300 scale-110'; }

                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatClick({ id: seatId, price: zone.price, label: `${zone.name} - Row ${rowNum} Seat ${seatNum}`, status })}
                            className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-200 ${bgClass} ${cursor} ${isSelected || status !== 'AVAILABLE' ? 'text-white' : 'text-gray-800/60'}`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10 flex flex-wrap gap-8 py-6 border-t border-gray-100">
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded"></div><span className="text-sm font-bold text-gray-600">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-violet-600 rounded"></div><span className="text-sm font-bold text-gray-600">Selected (Bạn)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-orange-400 rounded animate-pulse"></div><span className="text-sm font-bold text-gray-600">Locked (Người khác)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-300 rounded"></div><span className="text-sm font-bold text-gray-600">Sold</span></div>
        </div>
      </div>

      {/* CỘT PHẢI: BOOKING SUMMARY (Giữ nguyên như cũ) */}
      <div className="w-full xl:w-[400px] shrink-0">
        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl sticky top-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Booking Summary</h2>
          
          <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-3 text-orange-600 font-bold mb-3">
              <Clock size={20} />
              <span>Time remaining</span>
            </div>
            <div className="text-4xl font-black text-orange-600 tracking-tight">{formatTime(timeLeft)}</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-5 overflow-hidden">
              <div 
                className="bg-gray-900 h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${(timeLeft / 600) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold">Selected seats</span>
              <span className="text-xl font-black text-gray-900">{selectedSeats.length}</span>
            </div>

            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {selectedSeats.map(s => (
                <div key={s.id} className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">{s.label}</span>
                  <span className="text-gray-900">{s.price.toLocaleString('vi-VN')} đ</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
            <span className="text-2xl font-black text-gray-900">Total</span>
            <span className="text-3xl font-black text-violet-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
          </div>

          <button 
            disabled={selectedSeats.length === 0}
            onClick={() => navigate('/checkout', { state: { selectedSeats, totalPrice } })}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-5 rounded-[1.5rem] shadow-lg shadow-violet-200 transition-all active:scale-95"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

    </div>
  );
}