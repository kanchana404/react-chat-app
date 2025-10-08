import { createContext, useEffect, useRef, useState } from "react";

interface WebSocketContexctValue {
    socket: WebSocket | null;
    isConnected: boolean;
    userId: number;
    sendMessage: (message: string) => void;
}

const WebsocketContext = createContext<WebSocketContexctValue | null>(null);
export const WebsocketProvider = ({ children }: { children: React.ReactNode }) => {

    const [Connected, setConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {

        

     }, []);

}