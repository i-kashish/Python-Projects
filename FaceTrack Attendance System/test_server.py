#!/usr/bin/env python3
"""
Simple test server to verify Flask is working
"""
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>Flask Server is Working!</h1><p>The Face Attendance System should work now.</p>'

@app.route('/test')
def test():
    return {'status': 'ok', 'message': 'Server is running'}

if __name__ == '__main__':
    print("Starting test server...")
    print("Server will be available at: http://localhost:5000")
    print("If this works, the main application should work too.")
    
    try:
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")