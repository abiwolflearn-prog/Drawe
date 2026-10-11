import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  error: string | null;
  selectionError: string | null;
  toggleNumberSelection: (num: number) => void;
  clearSelections: () => void;
  clearErrors: () => void;
  submitPaymentReference: (
    method: PaymentMethod,
    ref: string,
    screenshotUrl?: string
  ) => Promise<{ success: boolean; error?: string; payment?: any }>;
  refreshNumbers: () => Promise<void>;
  setCapacityFilter: (capacity: number) => void;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { socket, joinDrawRoom } = useSocket();
  const [activeDraw, setActiveDraw] = useState<IDraw | null>(null);
  const [numbersMap, setNumbersMap] = useState<Map<number, IDrawNumber>>(new Map());
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const pricePerNumber = activeDraw?.pricePerNumber || 50;
  const totalAmount = selectedNumbers.length * pricePerNumber;

  const fetchDrawData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract tenant and draw query parameters from URL (e.g. from Telegram Mini App link)
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant') || '';
      const drawParam = urlParams.get('draw') || '';

      const queryParts: string[] = [];
      if (tenantParam) queryParts.push(`tenant=${encodeURIComponent(tenantParam)}`);
      if (drawParam) queryParts.push(`draw=${encodeURIComponent(drawParam)}`);
      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      const resDraw = await fetch(`/api/draws${queryString}`);
      if (!resDraw.ok) {
        throw new Error('Failed to load draw data from server');
      }

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
      } else {
        setError('No active draw currently available');
      }
    } catch (err: any) {
      console.error('Failed to load draw data:', err);
      setError(err.message || 'Failed to connect to draw service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrawData();
  }, [fetchDrawData]);

  // Join Socket.IO room when activeDraw loads
  useEffect(() => {
    const drawId = activeDraw?._id || activeDraw?.id;
    if (drawId) {
      joinDrawRoom(drawId, user?.id);
    }
  }, [activeDraw?._id, activeDraw?.id, user?.id, joinDrawRoom]);

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

      // If a number that current player selected was taken by someone else, notify and unselect
      if (data.status !== 'AVAILABLE') {
        setSelectedNumbers((prev) => {
          if (prev.includes(data.number) && data.selectedBy?.id !== user?.id) {
            setSelectionError(`ይቅርታ፣ ቁጥር ${data.number} በሌላ ተጠቃሚ ተይዟል።`);
            return prev.filter((n) => n !== data.number);
          }
          return prev;
        });
      }
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
  }, [socket, user?.id]);

  const toggleNumberSelection = (num: number) => {
    setSelectionError(null);
    const item = numbersMap.get(num);

    // If number is already reserved, pending, confirmed, or disabled
    if (item && item.status !== 'AVAILABLE' && !selectedNumbers.includes(num)) {
      setSelectionError(`ይቅርታ፣ ቁጥር ${num} በሌላ ተጠቃሚ ተይዟል (${item.status})።`);
      return;
    }

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      const maxLimit = activeDraw?.maxSelectionsPerPlayer || 20;
      if (selectedNumbers.length >= maxLimit) {
        setSelectionError(`በአንድ ዙር ቢበዛ ${maxLimit} ቁጥሮች ብቻ መምረጥ ይቻላል።`);
        return;
      }
      setSelectedNumbers((prev) => [...prev, num].sort((a, b) => a - b));
    }
  };

  const clearSelections = () => {
    setSelectedNumbers([]);
    setSelectionError(null);
  };

  const clearErrors = () => {
    setError(null);
    setSelectionError(null);
  };

  const submitPaymentReference = async (
    method: PaymentMethod,
    ref: string,
    screenshotUrl?: string
  ) => {
    if (selectedNumbers.length === 0) {
      return { success: false, error: 'እባክዎ ቢያንስ አንድ ቁጥር ይምረጡ።' };
    }
    if (!token) {
      return { success: false, error: 'የክፍያ መረጃ ለመላክ እባክዎ በመጀመሪያ ይግቡ።' };
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
        const errorText = data.error || 'ክፍያውን ማረጋገጥ አልተቻለም።';
        setSelectionError(errorText);
        // Refresh board so player sees the updated unavailable cells
        await fetchDrawData();
        return { success: false, error: errorText };
      }

      setSelectedNumbers([]);
      await fetchDrawData();
      return { success: true, payment: data.payment };
    } catch (err: any) {
      const netError = 'የኔትወርክ ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።';
      setSelectionError(netError);
      return { success: false, error: netError };
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
        error,
        selectionError,
        toggleNumberSelection,
        clearSelections,
        clearErrors,
        submitPaymentReference,
        refreshNumbers: fetchDrawData,
        setCapacityFilter: () => {},
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
