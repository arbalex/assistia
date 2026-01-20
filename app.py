import os
from datetime import datetime, timedelta
from collections import defaultdict
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

VALID_API_KEYS = {
    os.getenv('API_KEY_SITE'): {'name': 'Site', 'active': True},
    os.getenv('API_KEY_DEV'): {'name': 'Local Dev', 'active': True},
}

VALID_API_KEYS = {k: v for k, v in VALID_API_KEYS.items() if k is not None}

RATE_LIMIT = 10
TIME_WINDOW = 60

message_history = defaultdict(list)

def validate_api_key(client_api_key):
    if not client_api_key or client_api_key not in VALID_API_KEYS:
        return False, None
    key_info = VALID_API_KEYS[client_api_key]
    if not key_info.get('active', False):
        return False, None
    return True, key_info

def check_rate_limit(api_key):
    now = datetime.now()
    message_history[api_key] = [
        ts for ts in message_history[api_key]
        if (now - ts).total_seconds() < TIME_WINDOW
    ]
    
    if len(message_history[api_key]) >= RATE_LIMIT:
        return False, "Too many messages. Wait 1 minute."
    message_history[api_key].append(now)
    return True, None

@app.after_request
def set_security_headers(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.openai.com"
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

@app.route('/widget.js')
def widget():
    with open('widget.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        client_api_key = request.headers.get('X-API-Key')
        if not client_api_key:
            return jsonify({'error': 'Missing API key'}), 401

        is_valid, key_info = validate_api_key(client_api_key)
        if not is_valid:
            return jsonify({'error': 'Invalid API key'}), 401

        allowed, error_msg = check_rate_limit(client_api_key)
        if not allowed:
            return jsonify({'error': error_msg}), 429

        client_name = key_info.get('name', 'Unknown')
        print(f"Request from: {client_name}")

        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 500

        openai_client = OpenAI(api_key=openai_api_key)

        data = request.json
        message = data.get('message', '').strip()

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        if len(message) > 1000:
            return jsonify({'error': 'Message too long (max 1000 characters)'}), 400

        response = openai_client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[{'role': 'user', 'content': message}],
            max_tokens=150
        )

        return jsonify({'response': response.choices[0].message.content}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
