import { useEffect, useState } from "react";
import { Chat, WSResponse } from "./chat";
import { useWebSocket } from "./WebSocketProvider";
import { formatChatTime } from "../util/DateFormatter";

// Global variable to store the reset function
let resetUnreadCountFunction: ((friendId: number) => void) | null = null;

export function useChatList(): Chat[] {
  const { socket, sendMessage, userId } = useWebSocket();
  const [chatList, setChatList] = useState<Chat[]>([]);

  console.log("useChatList hook called, current chatList:", chatList);

  // Expose reset function globally
  const resetUnreadCount = (friendId: number) => {
    console.log("Resetting unread count for friend:", friendId);
    setChatList(prevChats => 
      prevChats.map(chat => 
        chat.friendId === friendId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  };

  // Store the function globally so it can be called from other components
  resetUnreadCountFunction = resetUnreadCount;

  useEffect(() => {
    if (!socket) {
      return;
    }
    sendMessage({ type: "get_chat_list" });
    
    // Frontend workaround: Reset unread count when chat list is refreshed
    // This will be triggered when get_chat_list is called after marking as read
    
    const onMessage = (event: MessageEvent) => {
      console.log("ChatList received message:", event.data);

      try {
        const response: WSResponse = JSON.parse(event.data);
        console.log("ChatList parsed response:", response);
        console.log("ChatList response type:", response.type);
        console.log("ChatList response payload:", response.payload);

        if (response.type === "friend_list") {
          console.log("Setting chat list with data:", response.payload);
          // Map the received data to match our Chat interface
          const mappedChats: Chat[] = response.payload.map((item: any) => ({
            id: item.friendId, // Use friendId as id
            friendId: item.friendId,
            friendName: item.friendName,
            friendFirstName: item.friendName.split(' ')[0], // Extract first name
            lastMessage: item.lastMessage,
            lastTimeStamp: item.lastTimeStamp,
            unreadCount: item.unreadCount,
            profileImage: item.profileImage,
            from: { id: 0, firstName: "", lastName: "", countryCode: "", contactNo: "", createdAt: "", updatedAt: "", status: "" }, // Default user
            to: { id: item.friendId, firstName: item.friendName.split(' ')[0], lastName: item.friendName.split(' ')[1] || "", countryCode: "", contactNo: "", createdAt: "", updatedAt: "", status: "" },
            createdAt: item.lastTimeStamp,
            updatedAt: item.lastTimeStamp,
            status: "DELIVERED" as const,
            message: item.lastMessage,
            files: item.files || "" // Include files field for image detection
          }));
          console.log("Mapped chats:", mappedChats);
          setChatList(mappedChats);
        } else if (response.type === "friend_list" && response.payload) {
          // Update chat list when backend sends updated friend list
          console.log("Received friend_list update:", response.payload);
          console.log("Updating chat list with new data...");
          const mappedChats: Chat[] = response.payload.map((item: any) => ({
            id: item.friendId, // Use friendId as id
            friendId: item.friendId,
            friendName: item.friendName,
            friendFirstName: item.friendName.split(' ')[0], // Extract first name
            lastMessage: item.lastMessage,
            lastTimeStamp: item.lastTimeStamp,
            unreadCount: item.unreadCount,
            profileImage: item.profileImage,
            from: { id: 0, firstName: "", lastName: "", countryCode: "", contactNo: "", createdAt: "", updatedAt: "", status: "" }, // Default user
            to: { id: item.friendId, firstName: item.friendName.split(' ')[0], lastName: item.friendName.split(' ')[1] || "", countryCode: "", contactNo: "", createdAt: "", updatedAt: "", status: "" },
            createdAt: item.lastTimeStamp,
            updatedAt: item.lastTimeStamp,
            status: "DELIVERED" as const,
            message: item.lastMessage,
            files: item.files || "" // Include files field for image detection
          }));
          console.log("Updated chat list with new data:", mappedChats);
          setChatList(mappedChats);
        } else if (response.type === "chat" && response.payload) {
          // New message received - update chat list
          const newMessage = response.payload;
          console.log("New message received in chat list:", newMessage);
          
          setChatList(prevChats => {
            const updatedChats = [...prevChats];
            const chatIndex = updatedChats.findIndex(
              chat => chat.friendId === newMessage.from.id || chat.friendId === newMessage.to.id
            );
            
            if (chatIndex !== -1) {
              // Update existing chat
              const updatedChat = {
                ...updatedChats[chatIndex],
                lastMessage: newMessage.message,
                lastTimeStamp: formatChatTime(newMessage.createdAt),
                unreadCount: newMessage.from.id !== userId 
                  ? updatedChats[chatIndex].unreadCount + 1 
                  : updatedChats[chatIndex].unreadCount
              };
              // Remove from current position and add to top
              updatedChats.splice(chatIndex, 1);
              updatedChats.unshift(updatedChat);
            }
            
            return updatedChats;
          });
        } else if (response.type === "messages_marked_read" && response.payload) {
          // Messages marked as read - reset unread count
          const { friendId } = response.payload;
          console.log("Messages marked as read for friend:", friendId);
          console.log("Current chat list before update:", chatList);
          
          setChatList(prevChats => {
            const updatedChats = prevChats.map(chat => 
              chat.friendId === friendId 
                ? { ...chat, unreadCount: 0 }
                : chat
            );
            console.log("Updated chat list after marking as read:", updatedChats);
            return updatedChats;
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    socket.addEventListener("message", onMessage);
    
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket]);

  return chatList;
}

// Export the reset function so it can be called from other components
export const resetUnreadCount = (friendId: number) => {
  if (resetUnreadCountFunction) {
    resetUnreadCountFunction(friendId);
  } else {
    console.log("Reset function not available yet");
  }
};
