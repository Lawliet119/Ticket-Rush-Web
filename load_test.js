// k6 Load Test Script for Ticket Rush Virtual Queue
// Run using: k6 run load_test.js

import ws from 'k6/ws';
import { check, sleep } from 'k6';

// 1. Configure to simulate 1000 users connecting over 30 seconds
export const options = {
  vus: 1000, 
  duration: '30s', 
};

// Replace this with a valid event UUID from your database
const EVENT_ID = '6c88a7c8-0b98-415b-beda-b4ae93c05a14';

export default function () {
  const url = 'ws://localhost:3000'; // Target local socket server
  const USER_ID = `VIRTUAL_USER_${__VU}`;

  const response = ws.connect(url, {}, function (socket) {
    
    socket.on('open', () => {
      // 2. Simulate User joining the Virtual Queue
      // Socket.IO message format for emission is: 42["event_name", arg1, arg2]
      const msg = `42["join_queue","${EVENT_ID}","${USER_ID}"]`;
      socket.send(msg);
    });

    socket.on('message', (msg) => {
      // 3. Socket.IO ping-pong handler
      if (msg === '2') {
          socket.send('3'); // Respond to ping
          return;
      }

      // Ignore generic messages that don't match the event format
      if (!msg.startsWith('42[')) return;

      try {
        const data = JSON.parse(msg.substring(2));
        const eventName = data[0];
        const payload = data[1];

        // 4. Handle Queue Position Updates
        if (eventName === 'queue_position') {
            console.log(`[VU ${__VU}] Waiting at position: ${payload.position}`);
        }

        // 5. Handle Queue Passed
        if (eventName === 'queue_passed') {
            console.log(`[VU ${__VU}] SUCCESS! Granted access to Seat Map with token: ${payload.token}`);
            
            // Simulate User viewing seats for a few seconds then leaving
            sleep(5); 
            
            // Leave queue (Free up the Active Pool)
            socket.send(`42["leave_queue","${EVENT_ID}","${USER_ID}"]`);
            socket.close();
        }
      } catch (e) {
        // Handle parsing errors silently
      }
    });

    socket.on('close', () => {
        // Socket closed
    });
  });

  check(response, { 'Connected successfully': (r) => r && r.status === 101 });
}
