import React, { createContext, useContext, useState, useEffect } from 'react';
import { IDraw, IDrawNumber, PaymentMethod } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { useSocket } from './SocketContext.js';

interface DrawContextType {
  activeDraw: IDraw | null;
  numbersMap: Map<number, IDrawNumber>;
  selectedNumbers: number[];
  pricePerNumber: number;
  totalAmount: number;
  isLoading: boolean;
  toggleNumberSelection: (num: number) => void;
  clearSelections: () => void;
  submitPaymentReference: (method: PaymentMethod, ref: string, screenshotUrl?: string) => Promise<{ success: boolean; error?: string }>;
  refreshNumbers: () => Promise<void>;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { socket, joinDrawRoom } = useSocket();
  const [activeDraw, setActiveDraw] = useState<IDraw | null>(null);
  const [numbersMap, setNumbersMap] = useState<Map<number, IDrawNumber>>(new Map());
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pricePerNumber = activeDraw?.pricePerNumber || 50;
  const totalAmount = selectedNumbers.length * pricePerNumber;

  const fetchDrawData = async () => {
    try {
      setIsLoading(true);
      const resDraw = await fetch('/api/draws');
      if (resDraw.ok) {
        const dataDraw = await resDraw.json();
        if (dataDraw.draws && dataDraw.draws.length > 0) {
          const draw = dataDraw.draws[0];
          setActiveDraw(draw);

          const resNums = await fetch(`/api/draws/${draw.id || draw._id}/numbers`);
          if (resNums.ok) {
            const dataNums = await resNums.json();
            const newMap = new Map<number, IDrawNumber>();
            dataNums.numbers.forEach((item: IDrawNumber) => {
              newMap.set(item.number, item);
            });
            setNumbersMap(newMap);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load draw data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawData();
  }, []);

  // Join Socket.IO room when activeDraw loads
  useEffect(() => {
    const drawId = activeDraw?._id || activeDraw?.id;
    if (drawId) {
      joinDrawRoom(drawId, user?.id);
    }
  }, [activeDraw?._id, activeDraw?.id, user?.id]);

  // Listen to Socket.IO real-time board updates
  useEffect(() => {
    if (!socket) return;

    const handleNumberUpdated = (data: { number: number; status: any; selectedBy?: any }) => {
      setNumbersMap((prevMap) => {
        const newMap = new Map(prevMap);
        const existing = newMap.get(data.number);
        if (existing) {
          newMap.set(data.number, {
            ...existing,
            status: data.status,
            selectedBy: data.selectedBy,
          });
        }
        return newMap;
      });
    };

    const handleDrawStateChanged = (data: { drawId: string; status: any; winnerNumber?: number }) => {
      setActiveDraw((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          winnerNumber: data.winnerNumber ?? prev.winnerNumber,
        };
      });
    };

    socket.on('number:updated', handleNumberUpdated);
    socket.on('draw:state_changed', handleDrawStateChanged);

    return () => {
      socket.off('number:updated', handleNumberUpdated);
      socket.off('draw:state_changed', handleDrawStateChanged);
    };
  }, [socket]);

  const toggleNumberSelection = (num: number) => {
    const item = numbersMap.get(num);
    if (item && item.status !== 'AVAILABLE' && !selectedNumbers.includes(num)) {
      return;
    }

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= (activeDraw?.maxSelectionsPerPlayer || 10)) {
        alert(`Maximum ${activeDraw?.maxSelectionsPerPlayer || 10} selections allowed per round.`);
        return;
      }
      setSelectedNumbers((prev) => [...prev, num].sort((a, b) => a - b));
    }
  };

  const clearSelections = () => {
    setSelectedNumbers([]);
  };

  const submitPaymentReference = async (method: PaymentMethod, ref: string, screenshotUrl?: string) => {
    if (selectedNumbers.length === 0) {
      return { success: false, error: 'No numbers selected' };
    }
    if (!token) {
      return { success: false, error: 'Please log in or create an account to submit payment' };
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drawId: activeDraw?.id || activeDraw?._id,
          numbers: selectedNumbers,
          method,
          transactionReference: ref,
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit payment reference' };
      }

      setSelectedNumbers([]);
      await fetchDrawData();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error submitting payment reference' };
    }
  };

  return (
    <DrawContext.Provider
      value={{
        activeDraw,
        numbersMap,
        selectedNumbers,
        pricePerNumber,
        totalAmount,
        isLoading,
        toggleNumberSelection,
        clearSelections,
        submitPaymentReference,
        refreshNumbers: fetchDrawData,
      }}
    >
      {children}
    </DrawContext.Provider>
  );
};

export const useDraw = () => {
  const ctx = useContext(DrawContext);
  if (!ctx) throw new Error('useDraw must be used within a DrawProvider');
  return ctx;
};
