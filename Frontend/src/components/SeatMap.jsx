import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function SeatMap({ eventData }) {
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
     // 1. Lấy URL Backend từ biến môi trường một cách an toàn
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
    const backendUrl = apiUrl.replace('/v1/api', ''); // Cắt đuôi API để lấy gốc Server

    // const newSocket = io(backendUrl, { transports: ['websocket'] });
    const newSocket = io('http://localhost:3000', { transports: ['websocket'] });
    setSocket(newSocket);

    // 2. Khi kết nối thành công, đồng bộ danh sách ghế đang bị khóa từ Server
    newSocket.on('sync_seats', (lockedList) => {
      setRealtimeLockedSeats(lockedList);
    });

    // 3. Lắng nghe mỗi khi có ai đó bấm chọn/nhả ghế
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

   if (!eventData || !eventData.zones || eventData.zones.length === 0) {
    return <div className="py-20 text-center text-xl font-bold text-gray-500">Sự kiện này chưa được cấu hình sơ đồ ghế!</div>;
  }

  // Khi người dùng click vào ghế
  const handleSeatClick = (seat, zoneInfo) => {
    const lockedArray = Array.isArray(realtimeLockedSeats) ? realtimeLockedSeats : [];

    if (seat.status === 'SOLD' || lockedArray.includes(seat.id)) return; // Không cho click nếu đã Sold hoặc bị người khác Lock

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      
      if (isSelected) {
        if (socket && socket.connected) socket.emit('toggle_seat', seat.id, false);
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (socket && socket.connected) socket.emit('toggle_seat', seat.id, true);
        return [...prev, { 
          id: seat.id, 
          label: `${zoneInfo.name} - Ghế ${seat.label}`, 
          price: Number(zoneInfo.price) 
        }];
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

        {/* LẶP QUA DỮ LIỆU THẬT: eventData.zones thay vì ZONES */}
        {eventData.zones.map(zone => {
          const rowsArray = Array.from({ length: zone.rows }, (_, i) => i + 1);

          return (
            <div key={zone.id} className="mb-14 min-w-fit">
              <div className="flex items-center gap-3 mb-6">
                {/* Dùng màu thật từ DB */}
                <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color_hex }}></div>
                <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
                <span className="text-gray-400 font-medium">{Number(zone.price).toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="flex flex-col gap-3">
                {rowsArray.map(rowNum => {
                  // Lọc ra ghế của từng hàng từ Backend trả về
                  const seatsInThisRow = zone.seats?.filter(s => s.row_number === rowNum) || [];

                  return (
                    <div key={rowNum} className="flex items-center gap-4">
                      <span className="w-6 text-sm font-bold text-gray-400 text-center">{rowNum}</span>
                      
                      {/* CSS Grid dàn ghế */}
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${zone.seats_per_row}, minmax(0, 1fr))` }}>
                        {seatsInThisRow.map(seat => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id);
                          const isLocked = realtimeLockedSeats.includes(seat.id);
                          
                          let bgStyle = { backgroundColor: zone.color_hex }; 
                          let cursorClass = 'cursor-pointer hover:scale-110 hover:brightness-90';

                          if (seat.status === 'SOLD') {
                            bgStyle = { backgroundColor: '#D1D5DB' }; cursorClass = 'cursor-not-allowed';
                          } else if (isLocked) {
                            bgStyle = { backgroundColor: '#FB923C' }; cursorClass = 'cursor-not-allowed';
                          } else if (isSelected) {
                            bgStyle = { backgroundColor: '#7C3AED' }; cursorClass = 'shadow-md ring-2 ring-violet-300 scale-110';
                          }

                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat, zone)}
                              style={bgStyle}
                              title={seat.label}
                              className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-200 text-white ${cursorClass}`}
                            >
                              {seat.seat_number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

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