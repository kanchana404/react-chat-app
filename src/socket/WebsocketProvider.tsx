import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
  } from "react";
  
  interface WebSocketContextValue {
    socket: WebSocket | null;
    isConnected: boolean;
    userId: number;
    sendMessage: (data: any) => void;
  }
  const WebSocketContext = createContext<WebSocketContextValue | null>(null);
  export const WebSocketProvider: React.FC<{
    children: React.ReactNode;
    userId: number;
  }> = ({ children, userId }) => {
    const [isConnected, setConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
      console.log('WebSocketProvider: Creating connection with userId:', userId);
      
      // Don't create WebSocket connection if userId is 0 (no user logged in)
      if (userId === 0) {
        console.log('WebSocketProvider: No user logged in, skipping WebSocket connection');
        setConnected(false);
        return;
      }

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocketProvider: Connection already exists');
        return;
      }
      
      // Check if WebSocket URL is properly configured
      const wsUrl = process.env.EXPO_PUBLIC_WS_URL;
      if (!wsUrl) {
        console.error('WebSocketProvider: EXPO_PUBLIC_WS_URL is not configured');
        setConnected(false);
        return;
      }
      
      const fullWsUrl = `wss://${wsUrl}/chat?userId=${userId}`;
      console.log('WebSocketProvider: Connecting to:', fullWsUrl);
      
      const socket = new WebSocket(fullWsUrl);
      socketRef.current = socket;
  
      socket.onopen = () => {
        console.log("WebSocket connected successfully!");
        setConnected(true);
      };
  
      socket.onclose = (event) => {
        console.log("WebSocket disconnected:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          userId: userId
        });
        setConnected(false);
        
        // Attempt to reconnect after a delay if it wasn't a clean close
        if (event.code !== 1000 && userId !== 0) {
          console.log("WebSocket: Attempting to reconnect in 3 seconds...");
          setTimeout(() => {
            if (userId !== 0) {
              console.log("WebSocket: Reconnecting...");
              // Trigger reconnection by updating userId
              setConnected(false);
            }
          }, 3000);
        }
      };
  
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        console.error("WebSocket error details:", {
          type: error.type,
          target: error.target,
          currentTarget: error.currentTarget,
          bubbles: error.bubbles,
          cancelable: error.cancelable,
          composed: error.composed,
          defaultPrevented: error.defaultPrevented,
          eventPhase: error.eventPhase,
          isTrusted: error.isTrusted,
          timeStamp: error.timeStamp
        });
        setConnected(false);
      };
  
      return () => {
        socket.close();
      };
    }, [userId]);
  
    const sendMessage = (data: any) => {
      console.log('WebSocketProvider: sendMessage called with userId:', userId, 'data:', data);
      
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const message = { ...data, userId };
        console.log('WebSocketProvider: Sending message:', message);
        socketRef.current.send(JSON.stringify(message));
      } else {
        console.log('WebSocketProvider: Cannot send message - socket not connected');
      }
    };
  
    return (
      <WebSocketContext.Provider
        value={{
          socket: socketRef.current,
          isConnected,
          userId,
          sendMessage,
        }}
      >
        {children}
      </WebSocketContext.Provider>
    );
  };
  
  export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
       throw new Error("useWebSocket must be used inside WebSocketProvider");
    }
    return ctx;
  };
  