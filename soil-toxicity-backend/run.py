# run.py - Main entry point for your Flask app
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:8000")
    print("CORS enabled for http://localhost:5173")
    app.run(host='0.0.0.0', port=8000, debug=True)