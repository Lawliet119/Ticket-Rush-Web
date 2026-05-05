import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../lib/socket';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function WaitingRoom({ eventId, onPassed }) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('CONNECTING'); // CONNECTING, WAITING, GRANTED
  const [hasWaited, setHasWaited] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Prevent connecting if not logged in
    
    const socket = io(SOCKET_URL);

    // Join the queue initially and on reconnects
    socket.on('connect', () => {
      socket.emit('join_queue', eventId, user.id);
    });

    socket.on('queue_position', (data) => {
      setStatus('WAITING');
      setPosition(data.position);
      setHasWaited(true);
    });

    socket.on('queue_passed', (data) => {
      setStatus('GRANTED');
      localStorage.setItem(`booking_token_${eventId}`, data.token);
      
      if (!hasWaited) {
        // Instantly skip to seat map without showing the waiting room UI
        onPassed();
      } else {
        // If they were waiting, give them 1.5s to see the success message
        setTimeout(() => {
          onPassed();
        }, 1500);
      }
    });

    return () => {
      // Leave queue if user unmounts this component early
      if (status !== 'GRANTED') {
        socket.emit('leave_queue', eventId, user.id);
      }
      socket.disconnect();
    };
  }, [eventId, user, onPassed, status]);

  // If granted instantly, hide the UI to make it seamless
  if (status === 'GRANTED' && !hasWaited) return null;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
        
        {status === 'GRANTED' ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">It's Your Turn!</h3>
            <p className="text-gray-600">Redirecting you to the seat selection...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900">Waiting Room</h3>
            
            {status === 'CONNECTING' ? (
              <p className="text-gray-600 text-lg">Connecting to the ticketing system...</p>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <p className="text-sm text-purple-800 font-medium uppercase tracking-wide mb-1">Your Position</p>
                  <p className="text-5xl font-black text-purple-700">{position}</p>
                </div>
                
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-3 text-left">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Please do NOT refresh this page. If you leave, you will lose your spot in the queue.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
