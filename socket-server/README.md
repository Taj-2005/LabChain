# LabChain Socket Server

Real-time WebSocket server for LabChain using Express and Socket.io.

## Features

- **Presence**: Track users in experiment rooms
- **Real-time collaboration**: Cursor updates, experiment updates
- **Authentication**: JWT-based authentication via socket handshake

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (create `.env` file):

```
JWT_SECRET=your-secret-key-must-match-frontend
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

3. Run the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Deployment

Deploy to Render, Heroku, Railway, or DigitalOcean. Ensure:

- Environment variables are set
- CORS_ORIGIN matches your frontend URL
- JWT_SECRET matches the frontend secret

## Socket Events

### Client → Server

- `join-experiment { experimentId }` - Join an experiment room
- `leave-experiment { experimentId }` - Leave an experiment room
- `cursor-update { experimentId, x, y }` - Send cursor position
- `experiment-updated { experimentId, delta }` - Broadcast experiment update

### Server → Client

- `user-joined { userId, experimentId }` - User joined room
- `user-left { userId, experimentId }` - User left room
- `presence-update { experimentId, userIds }` - Current users in room
- `cursor-update { userId, x, y }` - Cursor position from another user
- `experiment-updated { experimentId, delta, updatedBy }` - Experiment was updated

## Authentication

Connect with token in handshake:

```javascript
const socket = io(SOCKET_HOST, {
  auth: {
    token: userToken,
  },
});
```

Or via Authorization header:

```javascript
const socket = io(SOCKET_HOST, {
  extraHeaders: {
    Authorization: `Bearer ${userToken}`,
  },
});
```
