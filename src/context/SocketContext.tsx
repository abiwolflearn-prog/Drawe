import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activePlayersCount: number;
  joinDrawRoom: (drawId: string, userId?: string) => void;
  leaveDrawRoom: (drawId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activePlayersCount: 1,
  joinDrawRoom: () => {},
  leaveDrawRoom: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activePlayersCount, setActivePlayersCount] = useState(1);

  useEffect(() => {
    // Connect to same origin
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO Client] Connected to real-time sync server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('presence:update', (data: { activePlayersCount: number }) => {
      if (data && typeof data.activePlayersCount === 'number') {
        setActivePlayersCount(data.activePlayersCount);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinDrawRoom = (drawId: string, userId?: string) => {
    if (socket && isConnected) {
      socket.emit('join_draw_room', { drawId, userId });
    }
  };

  const leaveDrawRoom = (drawId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_draw_room', { drawId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activePlayersCount,
        joinDrawRoom,
        leaveDrawRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
