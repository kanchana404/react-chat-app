import { useEffect, useState } from "react";
import { Chat, WSResponse } from "./chat";
import { useWebSocket } from "./WebSocketProvider";

export function useChatList(): Chat[] {
  const { socket, sendMessage, userId } = useWebSocket();
  const [chatList, setChatList] = useState<Chat[]>([]);

  console.log("useChatList hook called, current chatList:", chatList);

  useEffect(() => {
    if (!socket) {
      return;
    }
    sendMessage({ type: "get_chat_list" });
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
            message: item.lastMessage
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
            message: item.lastMessage
          }));
          console.log("Updated chat list with new data:", mappedChats);
          setChatList(mappedChats);
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
