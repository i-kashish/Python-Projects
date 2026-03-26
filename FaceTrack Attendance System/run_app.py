#!/usr/bin/env python3
"""
Comprehensive startup script for Face Attendance System
Handles all potential errors and ensures proper execution
"""
import os
import sys
import json
import socket
import subprocess
import time
from datetime import datetime

def check_and_install_dependencies():
    """Check and install required dependencies"""
    required_packages = {
        'flask': 'flask',
        'cv2': 'opencv-python',
        'numpy': 'numpy',
        'pandas': 'pandas',
        'openpyxl': 'openpyxl',
        'PIL': 'Pillow',
        'bcrypt': 'bcrypt'
    }
    
    missing_packages = []
    
    for import_name, package_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✓ {package_name} is available")
        except ImportError:
            print(f"✗ {package_name} is missing")
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\nInstalling missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
            print("✓ All packages installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install packages: {e}")
            return False
    
    return True

def setup_required_files():
    """Create required files and directories"""
    print("\nSetting up required files and directories...")
    
    # Create directories
    directories = ['known_faces', 'templates', 'students']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✓ Created directory: {directory}")
        else:
            print(f"✓ Directory exists: {directory}")
    
    # Create default users.json if it doesn't exist
    users_file = 'users.json'
    if not os.path.exists(users_file):
        import hashlib
        default_users = {
            'admin': hashlib.sha256('admin'.encode()).hexdigest()
        }
        with open(users_file, 'w') as f:
            json.dump(default_users, f, indent=4)
        print(f"✓ Created {users_file} with default admin user")
    
    # Create default students.json if it doesn't exist
    students_file = 'students.json'
    if not os.path.exists(students_file):
        default_students = {
            "1": "John Doe",
            "2": "Jane Smith",
            "3": "Michael Johnson"
        }
        with open(students_file, 'w') as f:
            json.dump(default_students, f, indent=4)
        print(f"✓ Created {students_file} with sample students")
    
    return True

def find_available_port(start_port=5000, max_attempts=10):
    """Find an available port"""
    for i in range(max_attempts):
        port = start_port + i
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('127.0.0.1', port))
            sock.close()
            return port
        except socket.error:
            continue
    return None

def kill_port_processes(port):
    """Kill processes using the specified port"""
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
                            subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True, check=True)
                            print(f"✓ Killed process {pid} on port {port}")
                        except subprocess.CalledProcessError:
                            pass
    except Exception as e:
        print(f"Warning: Could not kill processes on port {port}: {e}")

def start_web_application():
    """Start the web application with error handling"""
    print("\n" + "="*60)
    print("Starting Face Attendance System Web Application")
    print("="*60)
    
    # Kill any existing processes on common ports
    for port in [5000, 5001, 8080]:
        kill_port_processes(port)
    
    time.sleep(2)  # Wait for processes to be killed
    
    # Find available port
    port = find_available_port(5001, 10)
    if not port:
        print("✗ No available ports found")
        return False
    
    print(f"✓ Using port {port}")
    
    # Update web_app.py to use the found port
    try:
        with open('web_app.py', 'r') as f:
            content = f.read()
        
        # Replace the port and host in the run command
        import re
        content = re.sub(
            r"app\.run\(host='.*', port=\d+, debug=True\)",
            f"app.run(host='0.0.0.0', port={port}, debug=True)",
            content
        )
        
        with open('web_app.py', 'w') as f:
            f.write(content)
        
        print(f"✓ Updated web_app.py to use port {port}")
        
    except Exception as e:
        print(f"Warning: Could not update port in web_app.py: {e}")
    
    print(f"\n🚀 Starting server on http://localhost:{port}")
    print("📱 Click the preview button in your IDE to access the application")
    print("🔑 Default login: admin / admin")
    print("⚠️  Press Ctrl+C to stop the server")
    print("-" * 60)
    
    # Start the Flask application
    try:
        os.system(f'python web_app.py')
        return True
    except KeyboardInterrupt:
        print("\n✓ Server stopped by user")
        return True
    except Exception as e:
        print(f"✗ Error starting server: {e}")
        return False

def main():
    """Main function to run the complete setup and start the application"""
    print("="*60)
    print("Face Attendance System - Complete Setup & Startup")
    print("="*60)
    
    # Step 1: Check and install dependencies
    print("\n1. Checking dependencies...")
    if not check_and_install_dependencies():
        print("✗ Failed to install dependencies")
        input("Press Enter to exit...")
        return
    
    # Step 2: Setup required files
    print("\n2. Setting up files and directories...")
    if not setup_required_files():
        print("✗ Failed to setup required files")
        input("Press Enter to exit...")
        return
    
    # Step 3: Start the web application
    print("\n3. Starting web application...")
    if not start_web_application():
        print("✗ Failed to start web application")
        input("Press Enter to exit...")
        return
    
    print("\n✅ Face Attendance System setup completed successfully!")

if __name__ == '__main__':
    main()