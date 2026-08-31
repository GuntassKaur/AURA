import { useEffect, useRef, useState } from 'react';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function useWebSocket(channel: 'transactions' | 'alerts' | 'graph' | 'agents', onMessage: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = () => {
    const wsUrl = `${WS_BASE_URL}/ws/${channel}`;
    console.log(`🔌 Establishing WebSocket to: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log(`✅ WebSocket connected to channel: ${channel}`);
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('❌ Failed to parse WebSocket message:', err);
      }
    };

    socket.onclose = (event) => {
      console.warn(`🔌 WebSocket connection closed on channel ${channel}:`, event.reason);
      setIsConnected(false);
      // Attempt reconnect in 3s
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    socket.onerror = (err) => {
      console.error(`❌ WebSocket error on channel ${channel}:`, err);
      socket.close();
    };

    socketRef.current = socket;
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        // Clear reconnect loop
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        socketRef.current.close();
      }
    };
  }, [channel]);

  const sendMessage = (msg: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(msg);
    }
  };

  return { isConnected, sendMessage };
}
