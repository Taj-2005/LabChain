# LabChain ML Server

Optional Flask server for heavy ML workloads (GPU inference, large models, etc.).

## When to Use

- **Lightweight ML**: Use Next.js API routes (`/api/ml/*`) that call external APIs (OpenAI, Hugging Face)
- **Heavy ML**: Use this Flask server for:
  - Large models that need GPU
  - Persistent model loading
  - Long-running inference jobs
  - Custom trained models

## Setup

1. Install dependencies:

```bash
pip install flask flask-cors python-dotenv
# Add other ML dependencies as needed (torch, transformers, etc.)
```

2. Create `.env` file:

```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Run the server:

```bash
python app.py
# Or with gunicorn for production:
# gunicorn -w 4 -b 0.0.0.0:5000 app.py
```

## Endpoints

- `POST /predict/standardize` - Standardize protocol text
- `GET /health` - Health check

## Deployment

Deploy to Render, DigitalOcean, or any platform that supports Python/Flask.

Set environment variables in your deployment platform:

- `API_KEY` (required)
- `PORT` (default: 5000)
- Other variables as needed

## Integration with Next.js

Set `ML_SERVER_URL` in your Next.js `.env.local`:

```env
ML_SERVER_URL=https://your-ml-server.herokuapp.com
```

The Next.js API route at `/api/ml/standardize-protocol` can proxy requests to this server if needed.
