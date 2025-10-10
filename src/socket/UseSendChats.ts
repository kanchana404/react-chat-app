import { useWebSocket } from "./WebSocketProvider";
import { Chat } from "./chat";

export function useSendChat() {
  const { sendMessage, userId } = useWebSocket();

  const sendChat = (friendId: number, message: string) => {
    // Send the message to the server
    sendMessage({
      type: "send_message",
      friendId,
      message,
    });
  };

  return sendChat;
}
