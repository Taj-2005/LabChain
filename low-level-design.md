# LabChain Low-Level Design Document

## Overview

LabChain is a reproducibility and collaboration platform for scientific experiments. This document describes the technical architecture, caching strategies, mutation handling, conflict resolution, and infrastructure recommendations.

## Architecture

### System Components

1. **Next.js Frontend/API** (Vercel)
   - App Router for pages
   - API routes for backend logic
   - Serverless functions

2. **Socket Server** (External - Render/Heroku/Railway)
   - Node.js + Express + Socket.io
   - Real-time collaboration features
   - Presence tracking

3. **ML Server** (Optional - External)
   - Flask Python server
   - Heavy ML/GPU workloads
   - Alternative: Next.js API routes calling external APIs (OpenAI/Hugging Face)

4. **MongoDB** (Atlas or self-hosted)
   - Primary data store
   - Document-based schema

5. **Redis** (Recommended for scale)
   - Session caching
   - Pub/Sub for real-time notifications
   - Query result caching

## Data Flow & Caching

### SWR (Data Fetching & Caching)

**Key Patterns:**

- Experiment list: `/api/experiments?page=1&limit=20`
- Single experiment: `/api/experiments/[id]`
- User data: `/api/auth/me`

**Configuration:**

```typescript
{
  revalidateOnFocus: false,
  dedupingInterval: 2000, // 2 seconds
  revalidateOnReconnect: true,
  shouldRetryOnError: true
}
```

**Cache Strategy:**

- Client-side caching via SWR
- Automatic deduplication of concurrent requests
- Background revalidation
- Stale-while-revalidate pattern

### Optimistic Updates

**Pattern:**

1. User performs action (create/edit)
2. Immediately update SWR cache with optimistic data: `mutate(key, newData, false)`
3. Send API request
4. On success: revalidate cache
5. On failure: rollback using previous cache state

**Example:**

```typescript
// Optimistic update
const previousData = mutate('/api/experiments', newExperiments, false);

try {
  await fetch('/api/experiments', { method: 'POST', body: ... });
  mutate('/api/experiments'); // Revalidate
} catch (error) {
  mutate('/api/experiments', previousData, false); // Rollback
}
```

### Redis Caching (Recommended for Scale)

**Use Cases:**

1. **Session Store**
   - JWT token validation cache
   - User session data
   - TTL: 7 days (matches JWT expiry)

2. **Query Result Caching**
   - Experiment summaries (list views)
   - TTL: 30-60 seconds
   - Invalidate on mutations

3. **Pub/Sub for Real-time**
   - Broadcast experiment updates
   - Presence events
   - Notification routing

**Implementation:**

```javascript
// Cache experiment list
const cacheKey = `experiments:page:${page}:limit:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... fetch from DB ...
await redis.setex(cacheKey, 60, JSON.stringify(results));
```

## Mutation Consistency & Real-time

### Local Mutations

1. **Optimistic Update**: Update SWR cache immediately
2. **API Request**: Send mutation to server
3. **Success**: Revalidate affected cache keys
4. **Failure**: Rollback optimistic update

### Real-time Synchronization

**Socket Events:**

- `experiment-updated`: Broadcast to experiment room
- `presence-update`: User join/leave notifications
- `cursor-update`: Real-time cursor positions

**Client-side Handling:**

```typescript
socket.on("experiment-updated", ({ experimentId, delta }) => {
  // Revalidate or patch cache
  mutate(
    `/api/experiments/${experimentId}`,
    (current) => ({
      ...current,
      ...delta,
    }),
    false
  );
});
```

### Conflict Resolution

**Version-based Optimistic Locking:**

1. **Experiment Model** includes `version` field (number)
2. **Client** sends current version with update
3. **Server** checks version:
   - If match: update and increment version
   - If mismatch: return HTTP 409 with latest version
4. **Client** on 409:
   - Fetch latest data
   - Show conflict resolution UI
   - Allow user to merge or overwrite

**Implementation:**

```typescript
// PATCH /api/experiments/[id]
const { version, ...updates } = req.body;
const experiment = await Experiment.findById(id);

if (experiment.version !== version) {
  return res.status(409).json({
    error: "Conflict",
    currentVersion: experiment.version,
    serverData: experiment,
  });
}

experiment.version += 1;
// ... apply updates ...
```

## State Management

### Zustand (Client State)

**Stores:**

- `useAuth`: Authentication state, user data, token
- Future: UI state, preferences, temporary form data

**Pattern:**

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}
```

### SWR (Server State)

- All server data fetched via SWR
- Automatic caching and revalidation
- Optimistic updates for mutations

## Database Schema

### User

- `email` (unique, indexed)
- `password` (hashed with bcrypt)
- `name`
- `createdAt`, `updatedAt`

### Experiment

- `owner` (ObjectId, ref: User, indexed)
- `title`
- `protocol` (JSON/Mixed)
- `attachments` (Array of ObjectIds)
- `versions` (Array of version snapshots)
- `status` (enum: draft, active, completed, archived)
- `replicationAttempts` (Array)
- `version` (number, for conflict resolution)
- `createdAt`, `updatedAt`

**Indexes:**

- `{ owner: 1, createdAt: -1 }` - User's experiments
- `{ status: 1 }` - Filter by status

### Verification

- `experimentId` (ObjectId, ref: Experiment)
- `hash` (SHA-256 hash of experiment data)
- `signature` (ECDSA signature)
- `publicKey` (for verification)
- `createdAt`

## API Design

### Authentication

- JWT tokens (7-day expiry)
- Bearer token in Authorization header
- Token stored in Zustand store (client-side)

### Endpoints

**Auth:**

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get token
- `GET /api/auth/me` - Get current user (requires auth)

**Experiments:**

- `GET /api/experiments?page=1&limit=20&status=active` - List with pagination
- `POST /api/experiments` - Create (requires auth)
- `GET /api/experiments/[id]` - Get single
- `PATCH /api/experiments/[id]` - Update (version check)
- `DELETE /api/experiments/[id]` - Delete (owner only)
- `POST /api/experiments/[id]/notes` - Save notes (autosave)

**ML:**

- `POST /api/ml/standardize-protocol` - Transform protocol text

**Verification:**

- `POST /api/verify/stamp` - Create verification stamp
- `GET /api/verify/[id]` - Verify stamp

## Real-time Architecture

### Socket Server

**Namespaces:**

- `/presence` - User presence tracking
- `/experiment` - Experiment-specific rooms

**Events:**

- `join-experiment { experimentId }` - Join room
- `leave-experiment { experimentId }` - Leave room
- `cursor-update { x, y }` - Broadcast cursor
- `experiment-updated { id, delta }` - Server broadcasts updates

**Authentication:**

- JWT token in `Authorization` header or `auth.token`
- Server verifies token on connection
- Attach `userId` to socket

**Room Management:**

- Rooms: `experiment:${experimentId}`
- Track user → rooms mapping
- Cleanup on disconnect

## ML Integration

### Lightweight (Recommended for MVP)

**Next.js API Routes:**

- Call external APIs (OpenAI, Hugging Face)
- Stateless, serverless
- No infrastructure overhead

**Example:**

```typescript
// /api/ml/standardize-protocol
const response = await fetch("https://api.openai.com/v1/...", {
  method: "POST",
  headers: { Authorization: `Bearer ${OPENAI_KEY}` },
  body: JSON.stringify({ text: protocolText }),
});
```

### Heavy ML (Separate Server)

**Flask Server:**

- Persistent models
- GPU acceleration
- Long-running inference

**Endpoints:**

- `POST /predict/standardize` - Standardize protocol
- `GET /health` - Health check

**Deployment:**

- Docker container
- Host on Render/DigitalOcean
- Secure with API key

## Verification & Blockchain

### Current Implementation (Skeleton)

1. **Hash Generation:**
   - SHA-256 hash of experiment data (protocol, results, metadata)
   - Deterministic serialization

2. **Signing:**
   - ECDSA (secp256k1) signing
   - Private key stored securely (server-side)
   - Public key stored with verification record

3. **Storage:**
   - Verification record in MongoDB
   - Hash + signature + metadata

### Future Blockchain Integration

**Options:**

1. **IPFS + Ethereum:**
   - Store hash on IPFS
   - Store IPFS CID on Ethereum (smart contract)
   - Timestamp and immutability

2. **Arweave:**
   - Permanent storage
   - Built-in timestamping

3. **Custom Blockchain:**
   - Private/permissioned chain
   - Scientific data focus

**Flow:**

```
Experiment → Hash → Sign → Store in DB → (Future) Anchor to Blockchain
```

## Infrastructure Recommendations

### Production Setup

1. **Frontend/API (Vercel)**
   - Automatic scaling
   - Edge functions
   - Environment variables in dashboard

2. **Socket Server (Render/Railway)**
   - Persistent WebSocket support
   - Auto-restart on crash
   - Environment variables

3. **MongoDB (Atlas)**
   - Managed service
   - Automatic backups
   - Connection pooling

4. **Redis (Upstash/Redis Cloud)**
   - Serverless Redis (Upstash)
   - Or managed Redis
   - Pub/Sub support

5. **ML Server (Optional)**
   - Render/DigitalOcean
   - Docker deployment
   - GPU instances if needed

### Environment Variables

**Next.js:**

- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_SOCKET_HOST`
- `ML_SERVER_URL` (optional)
- `REDIS_URL` (optional, for caching)

**Socket Server:**

- `JWT_SECRET` (must match Next.js)
- `PORT` (default: 3001)
- `CORS_ORIGIN` (Vercel URL)

**ML Server:**

- `API_KEY` (for authentication)
- `MODEL_PATH` (if using local models)

## Security Considerations

1. **Authentication:**
   - JWT with strong secret
   - Token expiry (7 days)
   - Secure storage (httpOnly cookies in future)

2. **Authorization:**
   - Owner checks on mutations
   - Role-based access (future)

3. **Data Validation:**
   - Input validation on all endpoints
   - Mongoose schema validation
   - Sanitize user input

4. **CORS:**
   - Configure allowed origins
   - Socket server CORS

5. **Rate Limiting:**
   - API rate limits (Vercel Pro)
   - Socket connection limits

## Performance Optimizations

1. **Database:**
   - Proper indexes
   - Pagination for lists
   - Connection pooling

2. **Caching:**
   - SWR client-side caching
   - Redis server-side caching
   - Static page generation where possible

3. **Real-time:**
   - Efficient room management
   - Throttle cursor updates
   - Batch notifications

4. **API:**
   - Response compression
   - Efficient serialization
   - Minimal data transfer

## Testing Strategy

1. **Unit Tests:**
   - Utility functions
   - Models (Mongoose)
   - Auth helpers

2. **Integration Tests:**
   - API endpoints
   - Database operations
   - Socket events

3. **E2E Tests:**
   - Critical user flows
   - Authentication
   - Experiment CRUD

## Monitoring & Observability

1. **Logging:**
   - Structured logging
   - Error tracking (Sentry)

2. **Metrics:**
   - API response times
   - Database query performance
   - Socket connection counts

3. **Alerts:**
   - Error rate thresholds
   - Database connection issues
   - Socket server downtime

## Future Enhancements

1. **Advanced Collaboration:**
   - Operational transforms (OT)
   - CRDTs for conflict-free editing
   - Rich text editing

2. **ML Features:**
   - Protocol suggestions
   - Anomaly detection
   - Result prediction

3. **Blockchain:**
   - On-chain verification
   - Decentralized storage
   - Token incentives

4. **Analytics:**
   - Experiment analytics
   - Replication success rates
   - User engagement metrics
