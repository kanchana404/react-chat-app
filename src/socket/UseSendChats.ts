import { useWebSocket } from "./WebSocketProvider";
import { Chat } from "./chat";

export function useSendChat() {
  const { sendMessage, userId } = useWebSocket();

  const sendChat = (friendId: number, message: string, imageUrl?: string, messageType?: 'text' | 'image') => {
    // Send the message to the server
    const payload: any = {
      type: "send_message",
      friendId,
      message,
      messageType: messageType || (imageUrl ? 'image' : 'text'),
    };
    
    // Only include files field if there's an image
    if (imageUrl && imageUrl.trim() !== '') {
      payload.files = imageUrl;
    }
    
    sendMessage(payload);
  };

  return sendChat;
}
