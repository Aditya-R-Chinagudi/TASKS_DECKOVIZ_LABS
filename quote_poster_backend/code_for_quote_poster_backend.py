import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dummy collection of backgrounds for testing
BACKGROUND_COLLECTION = [
    {'id': 1, 'url': '/static/bg1.jpg'},
    {'id': 2, 'url': '/static/bg2.jpg'},
    {'id': 3, 'url': '/static/bg3.jpg'},
]

@app.route("/api/background-collection", methods=["GET"])
def background_collection():
    return jsonify(BACKGROUND_COLLECTION)

@app.route("/api/generate-background", methods=["POST"])
def generate_background():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # DeepAI Text-to-Image API endpoint and key
    DEEPAI_API_KEY = os.getenv("DEEPAI_API_KEY")  # Set this in your environment
    url = "https://api.deepai.org/api/text2img"
    headers = {'api-key': DEEPAI_API_KEY}
    payload = {'text': prompt}

    try:
        response = requests.post(url, data=payload, headers=headers)
        result = response.json()
        image_url = result.get("output_url")
        if image_url:
            return jsonify({"url": image_url})
        else:
            return jsonify({"error": result.get("error", "Unknown error")}), 500
    except Exception as e:
        print("DeepAI API error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
