# LabChain - What's Actually Implemented

## ✅ Working Features

### 1. **Authentication** ✅

- User registration with email/password
- Login/logout
- JWT-based authentication
- Protected routes

### 2. **Experiment Management** ✅

- Create new experiments (with title)
- View all experiments on dashboard
- View individual experiment details
- Filter experiments by status (Draft, Active, Completed, Archived)
- **Edit experiments** (title and status) - NEW!
- Delete experiments (via API)

### 3. **Notebook & Voice Notes** ✅

- Access notebook from experiment page (📓 Notebook button)
- Voice-to-text note capture using browser Web Speech API
- Automatic saving of notes (every 2 seconds)
- Notes are linked to experiments

### 4. **Real-Time Collaboration** ✅ (Requires socket server running)

- Socket.io client connection
- Presence indicators (shows who's viewing)
- Join/leave experiment rooms
- Real-time updates when others make changes
- **Note**: Socket server must be running separately

### 5. **Verification** ✅

- Create verification stamps (🔒 button on experiment page)
- Cryptographic hashing of experiment data
- Digital signatures

### 6. **Version Control** ✅

- Experiment versioning (automatic on updates)
- Version numbers displayed
- Conflict resolution (via API)

## ⚠️ Partially Implemented / Not Visible

### Protocol Builder

- **Status**: Backend exists, but no visible UI
- Protocol is stored as JSON
- Can be viewed as JSON on experiment page
- No drag-and-drop interface yet

### Replication Tracking

- **Status**: Database schema exists
- No UI for creating replication attempts
- Can be added via API

## 🚫 Not Yet Implemented

- Advanced protocol builder UI
- File attachments
- Experiment templates
- Advanced search
- Export to PDF/JSON
- Blockchain integration (skeleton only)

## How to Use What's Available

### To Use Real-Time Features:

1. **Start the socket server:**

   ```bash
   cd socket-server
   npm install
   cp .env.example .env
   # Edit .env with your JWT_SECRET and CORS_ORIGIN
   npm start
   ```

2. **Set NEXT_PUBLIC_SOCKET_HOST in .env.local:**

   ```
   NEXT_PUBLIC_SOCKET_HOST=http://localhost:3001
   ```

3. **Restart your Next.js dev server**

4. **Open an experiment** - you'll see presence indicators if others are viewing

### To Edit an Experiment:

1. Go to experiment detail page
2. Click "✏️ Edit" button (only visible to owner)
3. Change title or status
4. Click "Save"

### To Use Voice Notes:

1. Go to experiment detail page
2. Click "📓 Notebook" button
3. Click "🎤 Start Voice Input"
4. Allow microphone access
5. Speak - your words will be transcribed
6. Click "⏹ Stop Recording" when done
7. Notes auto-save every 2 seconds

### To Create Verification Stamp:

1. Go to experiment detail page (as owner)
2. Scroll to bottom
3. Click "🔒 Create Verification Stamp"
4. Stamp will be created and ID shown

## Current Limitations

1. **Socket server must run separately** - real-time features won't work without it
2. **Protocol builder** - no visual UI, just JSON editing
3. **No file uploads** - attachments not yet implemented
4. **No replication UI** - can only be done via API
5. **No advanced search** - only status filtering

## What to Expect

- ✅ Authentication works
- ✅ CRUD operations for experiments work
- ✅ Voice notes work (if browser supports Web Speech API)
- ✅ Real-time collaboration works (if socket server is running)
- ✅ Verification works
- ⚠️ Protocol builder needs UI work
- ⚠️ Some features need UI implementation
