# Real-Time Collaboration Explained

## What is Real-Time Collaboration?

Real-time collaboration means multiple people can view and work on the same experiment **at the same time**, and see each other's presence and changes **instantly** - like Google Docs or Figma.

## How It Works

### The Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Your Browser  │◄───────►│  Socket Server   │◄───────►│  Other Browser  │
│  (Next.js App)  │  WebSocket│  (Node.js + Socket.io) │  WebSocket│  (Next.js App)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

1. **Your browser** connects to the **Socket Server** using WebSockets
2. When you open an experiment, you "join" that experiment's "room"
3. The **Socket Server** tracks who's in each room
4. When someone else joins/leaves, **everyone in that room** gets notified instantly
5. Changes are broadcast to all viewers in real-time

### What Happens Step-by-Step

#### Scenario: You and a colleague viewing the same experiment

1. **You open experiment #123:**
   - Your browser connects to socket server
   - Sends: "I want to join experiment #123"
   - Socket server adds you to room "experiment:123"
   - Socket server tells everyone else: "User X joined"

2. **Your colleague opens the same experiment:**
   - Their browser connects to socket server
   - Sends: "I want to join experiment #123"
   - Socket server adds them to room "experiment:123"
   - Socket server tells you: "User Y joined"
   - **You see**: "👥 2 people viewing this experiment"

3. **You make a change:**
   - You edit the title and save
   - Your browser sends update to Next.js API
   - Next.js API broadcasts to socket server: "Experiment #123 was updated"
   - Socket server tells everyone in room "experiment:123"
   - **Your colleague sees**: The experiment updates automatically (no refresh needed!)

4. **Your colleague leaves:**
   - They close the page or navigate away
   - Socket server detects disconnection
   - Socket server tells you: "User Y left"
   - **You see**: "👥 1 person viewing this experiment"

## The Components

### 1. Socket Server (`socket-server/index.js`)

- **What it is**: A separate Node.js server that handles WebSocket connections
- **What it does**:
  - Manages "rooms" (one per experiment)
  - Tracks who's in each room
  - Broadcasts messages to everyone in a room
  - Handles authentication (verifies JWT tokens)

### 2. Socket Client (`src/hooks/useSocket.ts`)

- **What it is**: A React hook that connects your browser to the socket server
- **What it does**:
  - Connects to socket server when you log in
  - Joins experiment rooms when you view experiments
  - Listens for presence updates
  - Shows who's viewing

### 3. Experiment Page (`src/app/experiments/[id]/page.tsx`)

- **What it does**:
  - Uses the `useSocket` hook
  - Automatically joins the experiment room when you view it
  - Displays presence indicators
  - Shows real-time updates

## What You See

### Presence Indicators

When you open an experiment, you might see:

```
👥 2 people viewing this experiment
```

This means:

- You + 1 other person = 2 total
- The other person is currently viewing the same experiment
- This updates in real-time (no page refresh needed)

### Real-Time Updates

When someone else makes a change:

- The experiment data refreshes automatically
- You see the new title/status/protocol immediately
- No need to refresh the page

## Why a Separate Server?

The socket server runs separately because:

1. **Next.js is serverless** - Vercel functions can't maintain persistent WebSocket connections
2. **WebSockets need persistence** - Unlike HTTP requests, WebSocket connections stay open
3. **Better performance** - Dedicated server handles real-time features efficiently
4. **Scalability** - Can scale the socket server independently

## How to Set It Up

### Step 1: Install Socket Server Dependencies

```bash
cd socket-server
npm install
```

### Step 2: Configure Environment

Create `socket-server/.env`:

```env
JWT_SECRET=your-secret-key-must-match-frontend
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**Important**: `JWT_SECRET` must match the one in your Next.js `.env.local`!

### Step 3: Start Socket Server

```bash
npm start
```

You should see:

```
Socket server running on port 3001
CORS origin: http://localhost:3000
```

### Step 4: Configure Frontend

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SOCKET_HOST=http://localhost:3001
```

### Step 5: Restart Next.js

Restart your `npm run dev` so it picks up the new environment variable.

### Step 6: Test It

1. Open an experiment in one browser tab
2. Open the same experiment in another browser tab (or different browser)
3. You should see: "👥 2 people viewing this experiment"

## What Events Are Handled?

### Client → Server (You send):

- `join-experiment { experimentId }` - Join a room
- `leave-experiment { experimentId }` - Leave a room
- `cursor-update { x, y }` - Send cursor position (future feature)
- `experiment-updated { delta }` - Broadcast your changes

### Server → Client (You receive):

- `user-joined { userId }` - Someone joined
- `user-left { userId }` - Someone left
- `presence-update { userIds }` - List of current viewers
- `experiment-updated { delta }` - Someone made changes

## Troubleshooting

### "I don't see presence indicators"

1. Check socket server is running: `cd socket-server && npm start`
2. Check browser console for connection errors
3. Verify `NEXT_PUBLIC_SOCKET_HOST` is set correctly
4. Make sure JWT_SECRET matches in both servers

### "Socket connection failed"

1. Check socket server is running on port 3001
2. Check CORS_ORIGIN matches your frontend URL
3. Check JWT_SECRET matches between servers
4. Check firewall isn't blocking port 3001

### "I see presence but updates don't sync"

- This is partially implemented
- Full sync requires broadcasting from API endpoints
- Currently, presence works, but auto-refresh on changes needs more work

## Current Implementation Status

✅ **Working:**

- Socket connection
- Joining/leaving rooms
- Presence indicators
- User join/leave notifications

⚠️ **Partially Working:**

- Real-time updates (presence works, but experiment changes need API integration)

🚧 **Future:**

- Cursor tracking
- Live editing
- Typing indicators
- Conflict resolution UI

## In Simple Terms

**Think of it like a video call:**

- The socket server is the "conference room"
- Each experiment is a different "room"
- When you open an experiment, you "enter the room"
- You can see who else is "in the room" (presence)
- When someone makes a change, everyone "in the room" sees it

**Without socket server:**

- Like a phone call that's disconnected
- You can't see who's there
- You can't get real-time updates

**With socket server:**

- Like a live video call
- You see everyone who's there
- You get instant updates

## Summary

Real-time collaboration lets multiple people:

1. **See each other's presence** - Know who's viewing
2. **Get instant updates** - See changes as they happen
3. **Collaborate effectively** - Work together on experiments

It requires:

- Socket server running separately
- Proper configuration (JWT_SECRET, CORS, etc.)
- WebSocket connection from browser

Once set up, it works automatically - just open an experiment and you'll see who else is viewing it!
