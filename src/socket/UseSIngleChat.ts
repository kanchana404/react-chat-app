import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Chat, WSResponse } from "./chat";

export function useSingleChat(friendId: number) {
  const { socket, sendMessage, userId } = useWebSocket();
  const [messages, setMessage] = useState<Chat[]>([]);
  
  useEffect(() => {
    if (!socket) {
      return;
    }
    sendMessage({ type: "get_single_chat", friendId });
    const onMessage = (event: MessageEvent) => {
      console.log("SingleChat received message:", event.data);
      const response: WSResponse = JSON.parse(event.data);
      console.log("Parsed response:", response);
      
      if (response.type === "single_chat") {
        console.log("Setting single chat messages:", response.payload);
        setMessage(response.payload);
      } else if (response.type === "chat" && response.payload) {
        // Add new message to the list immediately
        console.log("Adding new chat message:", response.payload);
        const newMessage = response.payload;
        setMessage(prevMessages => [newMessage, ...prevMessages]);
      }
    };

    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket, friendId]);

  return messages;
}
