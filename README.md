# LabChain

A reproducibility and collaboration platform for scientific experiments. Share, replicate, and verify research with confidence.

## Features

- **User Authentication**: JWT-based authentication with email/password
- **Experiment Management**: Create, read, update, and manage scientific experiments
- **Protocol Builder**: Visual drag-and-drop interface for building experiment protocols
- **Voice-to-Text Notes**: Hands-free note-taking using browser Web Speech API
- **Real-time Collaboration**: Socket.io-based presence and collaboration features
- **ML Integration**: Protocol standardization and transformation endpoints
- **Verification Service**: Cryptographic hashing and signing for experiment verification
- **Version Control**: Experiment versioning with conflict resolution

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io (separate server)
- **Authentication**: JWT
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 20.x or later
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd labchain
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your actual values. See `.env.example` for all required environment variables.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Socket Server

The socket server runs separately for real-time features:

1. Navigate to socket-server directory:

```bash
cd socket-server
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your actual values. **Important**: The `JWT_SECRET` must match the one in your Next.js `.env.local` file.

3. Run the socket server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Project Structure

```
labchain/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (SWR, etc.)
│   ├── lib/              # Utilities (db, auth, verification)
│   ├── models/           # Mongoose models
│   ├── pages/            # API routes
│   └── stores/            # Zustand stores
├── socket-server/        # Socket.io server (Express)
├── ml-server/            # Optional Flask ML server
├── .github/workflows/    # CI/CD workflows
└── public/               # Static assets
```

## Environment Variables

### Frontend/API (Next.js)

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NEXT_PUBLIC_SOCKET_HOST`: Socket server URL (public)
- `ML_SERVER_URL`: ML server URL (optional)
- `NODE_ENV`: Environment (development/production)

### Socket Server

- `JWT_SECRET`: Must match frontend JWT_SECRET
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origin

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Experiments

- `GET /api/experiments` - List experiments (with pagination)
- `POST /api/experiments` - Create experiment
- `GET /api/experiments/[id]` - Get experiment
- `PATCH /api/experiments/[id]` - Update experiment
- `DELETE /api/experiments/[id]` - Delete experiment
- `POST /api/experiments/[id]/notes` - Save notes (autosave)

### ML

- `POST /api/ml/standardize-protocol` - Standardize protocol text

### Verification

- `POST /api/verify/stamp` - Create verification stamp
- `GET /api/verify/[id]` - Verify stamp

## Deployment

### Vercel (Frontend/API)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SOCKET_HOST` (your socket server URL)
   - `ML_SERVER_URL` (optional)

4. Deploy

### Socket Server

Deploy to Render, Heroku, Railway, or DigitalOcean:

1. Set environment variables
2. Ensure `CORS_ORIGIN` matches your Vercel URL
3. Ensure `JWT_SECRET` matches frontend secret
4. Deploy

### ML Server (Optional)

If using a separate Flask ML server:

1. Navigate to ml-server directory:

```bash
cd ml-server
pip install -r requirements.txt
```

2. Create `.env` file:

```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Run the server:

```bash
python app.py
```

4. Deploy to Render/DigitalOcean
5. Set `ML_SERVER_URL` in Vercel environment variables

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

### Code Quality

- ESLint for linting
- Prettier for formatting
- Husky for pre-commit hooks
- TypeScript for type safety

## Testing

Run tests with:

```bash
npm test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure `npm run build` and `npm run lint` pass
4. Commit with meaningful messages
5. Push and create a pull request

## License

[Your License Here]

## Phase-by-Phase Changelog

### Phase 0: Infrastructure

- TailwindCSS setup
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Jest testing setup

### Phase 1: Database & Auth

- MongoDB connection helper
- User model with password hashing
- JWT authentication
- Auth API endpoints (register/login/me)

### Phase 2: Experiment CRUD

- Experiment model with versions and replication attempts
- CRUD API endpoints with pagination
- Conflict resolution with version numbers

### Phase 3: Frontend Skeleton

- Zustand auth store
- SWR hooks for data fetching
- Login/Register pages
- Dashboard with experiment list
- Experiment detail page
- Navigation component

### Phase 4: Real-time Features

- Socket.io server with Express
- Presence tracking
- Experiment room channels
- Cursor updates
- Experiment update broadcasts

### Phase 5: Protocol Builder & Notebook

- Visual protocol builder (drag-and-drop)
- Voice-to-text note capture
- Autosave functionality
- ML transformation stub

### Phase 6: ML Integration

- Next.js API route for protocol standardization
- Text parsing and structure extraction
- Ready for external ML service integration

### Phase 7: Verification Service

- Cryptographic hashing (SHA-256)
- ECDSA signing and verification
- Verification model and API endpoints
- Blockchain-ready structure

### Phase 8: CI/CD & Documentation

- GitHub Actions workflow
- Vercel configuration
- Comprehensive README
- Low-level design documentation
