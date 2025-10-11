# Chat App Setup Guide

## 🚀 Getting Chat Functionality Working

### 1. Environment Variables Required

You need to set up these environment variables for the chat to work:

#### For WebSocket Connection:
```bash
EXPO_PUBLIC_WS_URL=your-websocket-server-url
```

#### For API Connection:
```bash
EXPO_PUBLIC_APP_URL=your-api-server-url
```

### 2. How to Set Environment Variables

#### Option 1: Create a .env file in the root directory
```bash
# .env
EXPO_PUBLIC_WS_URL=wss://your-websocket-server.com
EXPO_PUBLIC_APP_URL=https://your-api-server.com
```

#### Option 2: Set in app.json (for Expo)
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_WS_URL": "wss://your-websocket-server.com",
      "EXPO_PUBLIC_APP_URL": "https://your-api-server.com"
    }
  }
}
```

### 3. Chat Features Available

✅ **Real-time messaging** - WebSocket connection
✅ **Friend management** - Add/remove friends
✅ **Chat list** - View all conversations
✅ **Message status** - Sent, delivered, read indicators
✅ **Connection status** - Green/red dot shows connection
✅ **Search users** - Find by phone number
✅ **Profile pictures** - Avatar support
✅ **Message timestamps** - Date and time display

### 4. How to Use Chat

1. **Login/Register** - Create account or login
2. **Add Friends** - Use "Start Conversation" button
3. **Search Users** - Enter phone number to find users
4. **Start Chatting** - Click on any friend to start chatting
5. **Send Messages** - Type and press send button

### 5. Troubleshooting

#### WebSocket Connection Issues:
- Check if `EXPO_PUBLIC_WS_URL` is set correctly
- Ensure WebSocket server is running
- Check network connectivity
- Look for connection status indicator (green dot = connected)

#### Chat Not Loading:
- Check if `EXPO_PUBLIC_APP_URL` is set correctly
- Ensure API server is running
- Check if user is logged in
- Verify friend list is loaded

#### Messages Not Sending:
- Check WebSocket connection status
- Ensure friend is added successfully
- Check if backend chat server is running
- Verify message format

### 6. Backend Requirements

Your backend needs to support:
- WebSocket server for real-time messaging
- REST API for user management
- Friend list management
- Message storage and retrieval
- User authentication

### 7. Testing Chat

1. **Register two accounts** with different phone numbers
2. **Add each other as friends** using phone number search
3. **Start a conversation** from the chat list
4. **Send messages** between the accounts
5. **Check message status** indicators

## 🎉 Chat is Ready!

Once you set up the environment variables and ensure your backend is running, the chat functionality will work perfectly!
