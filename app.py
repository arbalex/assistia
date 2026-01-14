import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)
CORS(app)


@app.route('/widget.js')
def widget():
    """Sert le widget JavaScript"""
    with open('widget.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}


@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint du chat"""
    try:
        # Crée le client ICI, pas au démarrage
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return jsonify({'error': 'API key not configured'}), 500
        
        openai_client = OpenAI(api_key=api_key)
        
        data = request.json
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'No message'}), 400
        
        response = openai_client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[{'role': 'user', 'content': message}],
            max_tokens=150
        )
        
        return jsonify({'response': response.choices[0].message.content}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
