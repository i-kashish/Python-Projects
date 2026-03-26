#!/usr/bin/env python3
"""
Robust startup script for Face Attendance System
"""
import os
import sys
import socket
import time
import subprocess
from flask import Flask

def find_available_port(start_port=5000, end_port=5010):
    """Find an available port in the given range."""
    for port in range(start_port, end_port):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('127.0.0.1', port))
            sock.close()
            return port
        except socket.error:
            continue
    return None

def kill_processes_on_port(port):
    """Kill any processes using the specified port."""
    try:
        if os.name == 'nt':  # Windows
            result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
            lines = result.stdout.split('\n')
            for line in lines:
                if f':{port}' in line and 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
                            print(f"Killed process {pid} on port {port}")
                        except:
                            pass
    except Exception as e:
        print(f"Error killing processes: {e}")

def start_flask_app():
    """Start the Flask application with error handling."""
    # First, try to free up common ports
    for port in [5000, 8080]:
        kill_processes_on_port(port)
    
    time.sleep(2)  # Wait for processes to be killed
    
    # Find an available port
    port = find_available_port(5000, 5010)
    if not port:
        port = find_available_port(8080, 8090)
    
    if not port:
        print("ERROR: No available ports found. Please close other applications and try again.")
        return False
    
    print(f"Starting Face Attendance System on port {port}...")
    print(f"Server will be available at: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Import and modify the Flask app
    sys.path.insert(0, '.')
    
    try:
        # Import the web app module
        import web_app
        
        # Update the app to use the found port
        web_app.app.run(host='127.0.0.1', port=port, debug=True, use_reloader=False)
        return True
        
    except ImportError as e:
        print(f"ERROR: Could not import web_app.py: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Could not start server: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Face Attendance System - Robust Startup")
    print("=" * 60)
    
    if not start_flask_app():
        print("\nFailed to start the server. Please check the error messages above.")
        input("Press Enter to exit...")