import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../lib/socket';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Virtual Waiting Room Component.
 * Manages real-time queue position and redirects users to the seat map when granted.
 */
export default function WaitingRoom({ eventId, onPassed }) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('CONNECTING');
  const [hasWaited, setHasWaited] = useState(false);
  const { user } = useAuth();
  
  const isGrantedRef = useRef(false);
  const hasWaitedRef = useRef(false);
  const onPassedRef = useRef(onPassed);

  useEffect(() => {
    onPassedRef.current = onPassed;
  }, [onPassed]);

  useEffect(() => {
    if (!user || !eventId) return;
    
    const socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5
    });

    const requestLivePosition = () => {
      if (!isGrantedRef.current) {
        socket.emit('request_position', eventId, user.id);
      }
    };

    socket.on('connect', () => {
      socket.emit('join_queue', eventId, user.id);
    });

    // Handle queue position updates
    socket.on('queue_position', (data) => {
      if (isGrantedRef.current) return;
      setStatus('WAITING');
      setPosition(data.position);
      setHasWaited(true);
      hasWaitedRef.current = true;
    });

    // Refresh position when the queue moves
    socket.on('queue_moved', () => {
      if (!isGrantedRef.current) requestLivePosition();
    });

    // Handle entry permission granted
    socket.on('queue_passed', (data) => {
      setStatus('GRANTED');
      isGrantedRef.current = true;
      localStorage.setItem(`booking_token_${eventId}`, data.token);
      
      if (!hasWaitedRef.current) {
        onPassedRef.current();
      } else {
        // Show success message briefly if user has been waiting
        setTimeout(() => {
          onPassedRef.current();
        }, 1500);
      }
    });

    // Backup polling every 10s
    const interval = setInterval(requestLivePosition, 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [eventId, user]); 

  // Hide UI if granted access immediately
  if (status === 'GRANTED' && !hasWaited) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10 text-center">
          {status === 'GRANTED' ? (
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">It's your turn!</h3>
              <p className="text-gray-600 font-medium">Redirecting you to the seat selection map...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Virtual Waiting Room</h3>
              
              {status === 'CONNECTING' ? (
                <p className="text-gray-500 italic">Connecting to the queue system...</p>
              ) : (
                <div className="space-y-5">
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl py-8 px-4">
                    <p className="text-xs text-purple-500 uppercase font-bold tracking-widest mb-1">Your Position</p>
                    <p className="text-6xl font-black text-purple-700">{position || '...'}</p>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl text-amber-800 text-xs border border-amber-100">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Please <b>DO NOT</b> refresh this page. You will be automatically redirected once space becomes available.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}