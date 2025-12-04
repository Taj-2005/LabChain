"""
LabChain ML Server - Flask application for heavy ML workloads
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("API_KEY")
PORT = int(os.getenv("PORT", 5000))


def require_api_key(f):
    """Decorator to require API key authentication"""
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-Key") or request.args.get("api_key")
        if not api_key or api_key != API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "ml-server"}), 200


@app.route("/predict/standardize", methods=["POST"])
@require_api_key
def standardize_protocol():
    """
    Standardize raw protocol text into structured format.
    
    Request body:
    {
        "rawText": "string",
        "experimentId": "string (optional)"
    }
    
    Returns:
    {
        "protocol": {
            "steps": [...],
            "metadata": {...}
        },
        "confidence": float
    }
    """
    try:
        data = request.get_json()
        raw_text = data.get("rawText")
        
        if not raw_text or not isinstance(raw_text, str):
            return jsonify({"error": "rawText is required"}), 400
        
        # TODO: Implement actual ML model inference here
        # This is a stub implementation
        
        # Example: Parse text into steps
        import re
        sentences = [s.strip() for s in re.split(r'[.!?]\s+', raw_text) if s.strip()]
        
        steps = [
            {
                "id": f"step-{i}",
                "type": "step",
                "content": sentence,
                "order": i
            }
            for i, sentence in enumerate(sentences)
        ]
        
        standardized_protocol = {
            "steps": steps,
            "metadata": {
                "source": "ml-server",
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                "experimentId": data.get("experimentId")
            }
        }
        
        return jsonify({
            "protocol": standardized_protocol,
            "confidence": 0.85  # Stub confidence
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=os.getenv("FLASK_ENV") == "development")
