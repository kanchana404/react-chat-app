import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { Chat, WSResponse } from "./chat";

export function useSingleChat(friendId: number) {
  const { socket, sendMessage, userId } = useWebSocket();
  const [messages, setMessage] = useState<Chat[]>([]);
  
  // Function to mark messages as read
  const markMessagesAsRead = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("=== MARKING MESSAGES AS READ ===");
      console.log("Friend ID:", friendId);
      console.log("WebSocket state:", socket.readyState);
      const message = { 
        type: "mark_messages_read", 
        friendId: friendId 
      };
      console.log("Sending message:", message);
      sendMessage(message);
      console.log("===============================");
    } else {
      console.log("Cannot mark messages as read - WebSocket not connected");
      console.log("Socket:", socket);
      console.log("Ready state:", socket?.readyState);
    }
  };
  
  useEffect(() => {
    if (!socket) {
      console.log("useSingleChat: No socket connection available");
      return;
    }
    
    if (userId === 0) {
      console.log("useSingleChat: No user logged in, cannot load chat");
      return;
    }
    
    console.log("useSingleChat: Loading chat for friend:", friendId, "user:", userId);
    sendMessage({ type: "get_single_chat", friendId });
    
    // Note: Mark messages as read is now handled by SingleChatScreen useFocusEffect
    const onMessage = (event: MessageEvent) => {
      console.log("SingleChat received message:", event.data);
      const response: WSResponse = JSON.parse(event.data);
      console.log("Parsed response:", response);
      
      if (response.type === "single_chat") {
        console.log("Setting single chat messages:", response.payload);
        console.log("=== BACKEND MESSAGES DEBUG ===");
        response.payload.forEach((msg: Chat, index: number) => {
          console.log(`Backend Message ${index}: ${msg.message} - ${new Date(msg.createdAt).toLocaleTimeString()}`);
        });
        // Sort messages by creation time (oldest first) for normal FlatList
        const sortedMessages = response.payload.sort((a: Chat, b: Chat) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        console.log("=== SORTED MESSAGES DEBUG ===");
        sortedMessages.forEach((msg: Chat, index: number) => {
          console.log(`Sorted Message ${index}: ${msg.message} - ${new Date(msg.createdAt).toLocaleTimeString()}`);
        });
        console.log("=============================");
        setMessage(sortedMessages);
      } else if (response.type === "chat" && response.payload) {
        // Add new message to the list immediately
        console.log("Adding new chat message:", response.payload);
        const newMessage = response.payload;
        
        // Only add message if it's for this specific chat (from or to the friend)
        const isRelevantMessage = 
          (newMessage.from && newMessage.from.id === friendId) ||
          (newMessage.to && newMessage.to.id === friendId);
          
        if (isRelevantMessage) {
          console.log("Adding relevant message to chat:", newMessage);
          setMessage(prevMessages => {
            const updatedMessages = [...prevMessages, newMessage];
            // Sort messages by creation time (oldest first) for normal FlatList
            return updatedMessages.sort((a: Chat, b: Chat) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
        } else {
          console.log("Message not relevant to this chat, ignoring");
        }
      } else if (response.type === "message_status_update" && response.payload) {
        // Update message status in real-time
        console.log("Updating message status:", response.payload);
        const { messageId, status } = response.payload;
        setMessage(prevMessages => {
          const updatedMessages = prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
          );
          console.log("Updated message status for messageId:", messageId, "to status:", status);
          return updatedMessages;
        });
      } else if (response.type === "messages_marked_read_response" && response.payload) {
        // Backend confirmed messages were marked as read
        console.log("Backend confirmed messages marked as read:", response.payload);
      } else {
        // Log any other response types for debugging
        console.log("SingleChat received other response type:", response.type, response.payload);
      }
    };

    socket.addEventListener("message", onMessage);
    
    // Add error handling for WebSocket
    const onError = (error: Event) => {
      console.error("useSingleChat: WebSocket error:", error);
    };
    
    const onClose = (event: CloseEvent) => {
      console.log("useSingleChat: WebSocket closed:", event.code, event.reason);
    };
    
    socket.addEventListener("error", onError);
    socket.addEventListener("close", onClose);
    
    return () => {
      socket.removeEventListener("message", onMessage);
      socket.removeEventListener("error", onError);
      socket.removeEventListener("close", onClose);
    };
  }, [socket, friendId, userId]);

  return messages;
}
