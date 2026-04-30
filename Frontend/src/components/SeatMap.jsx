import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { holdSeatsApi } from '../services/booking.api';

export default function SeatMap({ eventData }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [realtimeLockedSeats, setRealtimeLockedSeats] = useState([]); // Locked seats by other users
  const [socket, setSocket] = useState(null);
  const [soldSeats, setSoldSeats] = useState([]); // Recently sold seats by others
  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // REAL-TIME SOCKET.IO ENGINE
  useEffect(() => {
     // 1. Lấy URL Backend từ biến môi trường một cách an toàn
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api';
    const backendUrl = apiUrl.replace('/v1/api', ''); // Remove API suffix to get Root Server URL

    // const newSocket = io(backendUrl, { transports: ['websocket'] });
    const newSocket = io('http://localhost:3000', { transports: ['websocket'] });
    setSocket(newSocket);

    // 2. Sync locked seats from Server on connection
    newSocket.on('sync_seats', (lockedList) => {
      setRealtimeLockedSeats(lockedList);
    });

    // 3. Listen for seat lock/unlock events
    newSocket.on('seat_updated', (seatId, isLocking) => {
      setRealtimeLockedSeats(prev => {
        if (isLocking) return [...prev, seatId]; // Add to locked list
        return prev.filter(id => id !== seatId); // Remove from locked list
      });
    });
    
    // Listen for real-time sold seats
    newSocket.on('seat_sold_realtime', (seatId) => {
       setSoldSeats(prev => [...prev, seatId]);
       // Remove from Locked list if present
       setRealtimeLockedSeats(prev => prev.filter(id => id !== seatId));
    });

    // Disconnect on unmount
    return () => newSocket.disconnect();
  }, []);

   if (!eventData || !eventData.zones || eventData.zones.length === 0) {
    return <div className="py-20 text-center text-xl font-bold text-gray-500">Seat map not configured for this event!</div>;
  }

  // Handle seat selection
  const handleSeatClick = (seat, zoneInfo) => {
    const lockedArray = Array.isArray(realtimeLockedSeats) ? realtimeLockedSeats : [];

    if (seat.status === 'SOLD' || lockedArray.includes(seat.id)) return; // Prevent selection if SOLD or LOCKED by others

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, { 
          id: seat.id, 
          label: `${zoneInfo.name} - Seat ${seat.label}`, 
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

        {/* LOOP THROUGH REAL DATA: eventData.zones */}
        {eventData.zones.map(zone => {
          const rowsArray = Array.from({ length: zone.rows }, (_, i) => i + 1);

          return (
            <div key={zone.id} className="mb-14 min-w-fit">
              <div className="flex items-center gap-3 mb-6">
                {/* Use actual color from DB */}
                <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color_hex }}></div>
                <h3 className="text-xl font-bold text-gray-800">{zone.name}</h3>
                <span className="text-gray-400 font-medium">{Number(zone.price).toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="flex flex-col gap-3">
                {rowsArray.map(rowNum => {
                  // Filter seats for each row from backend response
                  const seatsInThisRow = zone.seats?.filter(s => s.row_number === rowNum) || [];

                  return (
                    <div key={rowNum} className="flex items-center gap-4">
                      <span className="w-6 text-sm font-bold text-gray-400 text-center">{rowNum}</span>
                      
                      {/* Grid Layout for seats */}
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${zone.seats_per_row}, minmax(0, 1fr))` }}>
                        {seatsInThisRow.map(seat => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id);
                          const isLocked = realtimeLockedSeats.includes(seat.id);
                          const isSoldRealtime = soldSeats.includes(seat.id);
                          
                          let bgStyle = { backgroundColor: zone.color_hex }; 
                          let cursorClass = 'cursor-pointer hover:scale-110 hover:brightness-90';

                          if (seat.status === 'SOLD' || isSoldRealtime) {
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
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-violet-600 rounded"></div><span className="text-sm font-bold text-gray-600">Selected (You)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-orange-400 rounded animate-pulse"></div><span className="text-sm font-bold text-gray-600">Locked (Others)</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-300 rounded"></div><span className="text-sm font-bold text-gray-600">Sold</span></div>
        </div>
      </div>

      {/* RIGHT COLUMN: BOOKING SUMMARY */}
      <div className="w-full xl:w-[400px] shrink-0">
        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl sticky top-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Booking Summary</h2>
          
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

          {error && <p className="text-red-500 text-sm font-bold mb-4">{error}</p>}

          <button 
            disabled={selectedSeats.length === 0 || isHolding}
            onClick={async () => {
              setIsHolding(true);
              setError('');
              try {
                const res = await holdSeatsApi({
                  eventId: eventData.id,
                  seatIds: selectedSeats.map(s => s.id)
                });
                // Redirect to Checkout with real expiration time from Backend
                navigate('/checkout', { 
                  state: { 
                    selectedSeats, 
                    totalPrice, 
                    eventData,
                    expiresAt: res.metadata.expires_at 
                  } 
                });
              } catch (err) {
                setError(err.response?.data?.message || 'Unable to hold seats. Please try again.');
              } finally {
                setIsHolding(false);
              }
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-5 rounded-[1.5rem] shadow-lg shadow-violet-200 transition-all active:scale-95"
          >
            {isHolding ? 'Holding Seats...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

    </div>
  );
}