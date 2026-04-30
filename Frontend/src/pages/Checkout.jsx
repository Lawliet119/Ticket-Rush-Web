import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkoutApi } from '../services/booking.api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedSeats, totalPrice, eventData, expiresAt } = location.state || { selectedSeats: [], totalPrice: 0, eventData: null, expiresAt: null };
  
  // Calculate remaining time based on expiresAt from Backend
  const calculateInitialTime = () => {
    if (!expiresAt) return 30; // Default 30s if no data
    const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialTime());
  const [isSuccess, setIsSuccess] = useState(false); // Success screen control state
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (selectedSeats.length === 0) {
      navigate('/home');
      return;
    }

    // Stop timer if payment is successful
    if (isSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Transaction session expired! Please select seats again.');
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, selectedSeats, isSuccess]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!eventData || selectedSeats.length === 0) return;

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const payload = {
        eventId: eventData.id,
        seatIds: selectedSeats.map(s => s.id)
      };
      await checkoutApi(payload);
      setIsSuccess(true);
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // SCREEN 2: PAYMENT SUCCESSFUL UI
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-gray-100"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-500 mb-8 font-medium">Your tickets have been booked successfully. We sent a receipt to your email.</p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-medium text-sm">Transaction ID</span>
              <span className="font-bold text-gray-900">TRX-{Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium text-sm">Amount Paid</span>
              <span className="font-black text-violet-600 text-lg">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/my-tickets', { state: { selectedSeats, totalPrice, eventData } })}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            View My Tickets <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  // SCREEN 1: CHECKOUT UI
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: INFORMATION FORM */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" defaultValue="Nguyen" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" defaultValue="Van A" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue="nguyen.vana@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" defaultValue="+84 123 456 789" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 border border-blue-100">
                This is a demo checkout. No real payment will be processed. Click "Confirm Payment" to complete your booking.
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input type="text" defaultValue="1234 5678 9012 3456" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="text" defaultValue="12/28" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input type="text" defaultValue="123" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: ORDER SUMMARY */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl sticky top-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex justify-between items-center">
                <span className="text-orange-600 font-medium text-sm">Time remaining to pay</span>
                <span className="text-2xl font-black text-orange-600">{formatTime(timeLeft)}</span>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="font-bold text-gray-900">{eventData?.title || 'Unknown Event'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {eventData?.event_date ? new Date(eventData.event_date).toLocaleString('vi-VN') : ''}
                </p>
                <p className="text-sm text-gray-500">{eventData?.venue}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Tickets ({selectedSeats.length})</span>
                  <span className="text-gray-900">{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-gray-900">0 đ</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
                <span className="text-xl font-black text-gray-900">Total</span>
                <span className="text-2xl font-black text-violet-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              {checkoutError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                  {checkoutError}
                </div>
              )}

              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-black py-4 rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}