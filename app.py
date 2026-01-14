import os
from openai import OpenAI
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import datetime

date_actuelle = datetime.now().strftime("%d %B %Y")

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in .env")

client = OpenAI(api_key=api_key)

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response


KNOWLEDGE_BASE = {
}


@app.route("/")
def index():
    with open('test_widget.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route("/widget.js")
def widget():
    with open('widget.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}



@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.json
    user_message = data.get("message", "").strip()
    
    if not user_message:
        return jsonify({"error": "Message vide"}), 400
    
    try:
        knowledge_text = "\n".join([f"- {k}: {v}" for k, v in KNOWLEDGE_BASE.items()])
        
        system_prompt = f"""connaissances
  "

CONNAISSANCES:
{knowledge_text}

Réponds en 2-3 phrases max."""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            "response": bot_response
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
