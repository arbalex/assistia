import os
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

def validate_api_key(client_api_key):
    if not client_api_key or client_api_key not in VALID_API_KEYS:
        return False, None
    
    key_info = VALID_API_KEYS[client_api_key]
    if not key_info.get('active', False):
        return False, None
    
    return True, key_info


@app.route('/widget.js')
def widget():
    with open('widget.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        client_api_key = request.headers.get('X-API-Key')
        print(client_api_key)
        
        if not client_api_key:
            return jsonify({'error': 'Missing API key'}), 401
        
        is_valid, key_info = validate_api_key(client_api_key)
        
        if not is_valid:
            return jsonify({'error': 'Invalid API key'}), 401
        
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
