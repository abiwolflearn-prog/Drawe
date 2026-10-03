import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { defaultNumbersMap, defaultDraw } from './store.js';

let io: SocketIOServer | null = null;

// Track active connections per draw room
const activeRoomUsers = new Map<string, Set<string>>();

export function initializeSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific draw round
    socket.on('join_draw_room', (data: { drawId: string; userId?: string }) => {
      const room = `draw:${data.drawId}`;
      socket.join(room);

      if (!activeRoomUsers.has(room)) {
        activeRoomUsers.set(room, new Set());
      }
      activeRoomUsers.get(room)?.add(socket.id);

      const activeCount = activeRoomUsers.get(room)?.size || 1;

      // Broadcast updated presence count to the room
      io?.to(room).emit('presence:update', {
        drawId: data.drawId,
        activePlayersCount: activeCount,
      });

      console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}. Active: ${activeCount}`);
    });

    // Leave draw room
    socket.on('leave_draw_room', (data: { drawId: string }) => {
      const room = `draw:${data.drawId}`;
      socket.leave(room);

      if (activeRoomUsers.has(room)) {
        activeRoomUsers.get(room)?.delete(socket.id);
        const activeCount = activeRoomUsers.get(room)?.size || 0;

        io?.to(room).emit('presence:update', {
          drawId: data.drawId,
          activePlayersCount: activeCount,
        });
      }
    });

    // Player selects a number on board
    socket.on('select_number', (data: { drawId: string; number: number; user: { id: string; name: string } }) => {
      const { drawId, number, user } = data;
      const cell = defaultNumbersMap.get(number);

      if (cell && cell.status === 'AVAILABLE') {
        cell.status = 'RESERVED';
        cell.selectedBy = user;
        cell.reservedAt = new Date().toISOString();

        const room = `draw:${drawId}`;
        io?.to(room).emit('number:updated', {
          number,
          status: 'RESERVED',
          selectedBy: user,
        });
      }
    });

    // Player deselects a number
    socket.on('deselect_number', (data: { drawId: string; number: number; userId: string }) => {
      const { drawId, number, userId } = data;
      const cell = defaultNumbersMap.get(number);

      if (cell && cell.status === 'RESERVED' && cell.selectedBy?.id === userId) {
        cell.status = 'AVAILABLE';
        cell.selectedBy = undefined;

        const room = `draw:${drawId}`;
        io?.to(room).emit('number:updated', {
          number,
          status: 'AVAILABLE',
          selectedBy: undefined,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);

      // Clean up presence across all rooms
      for (const [room, userSet] of activeRoomUsers.entries()) {
        if (userSet.has(socket.id)) {
          userSet.delete(socket.id);
          const drawId = room.replace('draw:', '');
          io?.to(room).emit('presence:update', {
            drawId,
            activePlayersCount: userSet.size,
          });
        }
      }
    });
  });

  return io;
}

// Server-side helper to broadcast number cell status changes
export function broadcastNumberUpdate(drawId: string, number: number, status: string, selectedBy?: any) {
  if (io) {
    const room = `draw:${drawId}`;
    io.to(room).emit('number:updated', {
      number,
      status,
      selectedBy,
    });
  }
}

// Server-side helper to broadcast draw state changes (OPEN, CLOSED, COMPLETED)
export function broadcastDrawStateChange(drawId: string, status: string, winnerNumber?: number) {
  if (io) {
    const room = `draw:${drawId}`;
    io.to(room).emit('draw:state_changed', {
      drawId,
      status,
      winnerNumber,
    });
  }
}
