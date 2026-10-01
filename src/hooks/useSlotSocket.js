import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

/**
 * Subscribes to /topic/slots/{date} and calls onUpdate(slotDTO) on each message.
 * Uses SockJS loaded via dynamic import to avoid Vite CJS interop issues.
 */
export function useSlotSocket(date, onUpdate) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!date) return;

    let client;

    // Dynamically import SockJS to avoid CJS/ESM interop crash at module parse time
    import('sockjs-client').then((mod) => {
      const SockJS = mod.default || mod;

      client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/slots/${date}`, (msg) => {
            try {
              const data = JSON.parse(msg.body);
              if (data && typeof data === 'object' && !Array.isArray(data)) {
                onUpdate(data);
              }
            } catch (_) {
              // Non-JSON message (e.g. "REFRESH" string) — ignore
            }
          });
        },
        onStompError: (frame) => {
          console.warn('[WS] STOMP error:', frame.headers?.message);
        },
      });

      client.activate();
      clientRef.current = client;
    }).catch((err) => {
      console.warn('[WS] SockJS load failed:', err.message);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [date]);
}
