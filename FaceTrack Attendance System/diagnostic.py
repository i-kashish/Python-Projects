#!/usr/bin/env python3
"""
Diagnostic script for Face Attendance System
"""
import sys
import subprocess
import socket
import json
import os

def check_python_version():
    print(f"Python version: {sys.version}")
    return sys.version_info >= (3, 6)

def check_dependencies():
    required_packages = [
        'flask', 'opencv-python', 'face-recognition', 
        'numpy', 'pandas', 'openpyxl', 'PIL', 'bcrypt'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            if package == 'opencv-python':
                import cv2
            elif package == 'PIL':
                import PIL
            else:
                __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"✗ {package} is missing")
            missing_packages.append(package)
    
    return len(missing_packages) == 0, missing_packages

def check_port_availability(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('127.0.0.1', port))
        sock.close()
        print(f"✓ Port {port} is available")
        return True
    except socket.error:
        print(f"✗ Port {port} is in use")
        return False

def check_required_files():
    files_to_check = [
        'web_app.py',
        'templates/login.html',
        'templates/dashboard.html',
        'templates/face_attendance.html'
    ]
    
    missing_files = []
    for file_path in files_to_check:
        if os.path.exists(file_path):
            print(f"✓ {file_path} exists")
        else:
            print(f"✗ {file_path} is missing")
            missing_files.append(file_path)
    
    return len(missing_files) == 0, missing_files

def main():
    print("=" * 50)
    print("Face Attendance System Diagnostic")
    print("=" * 50)
    
    # Check Python version
    print("\n1. Checking Python version...")
    python_ok = check_python_version()
    
    # Check dependencies
    print("\n2. Checking dependencies...")
    deps_ok, missing_deps = check_dependencies()
    
    # Check ports
    print("\n3. Checking port availability...")
    port_5000_ok = check_port_availability(5000)
    port_8080_ok = check_port_availability(8080)
    
    # Check required files
    print("\n4. Checking required files...")
    files_ok, missing_files = check_required_files()
    
    # Summary
    print("\n" + "=" * 50)
    print("DIAGNOSTIC SUMMARY")
    print("=" * 50)
    
    if python_ok and deps_ok and files_ok and (port_5000_ok or port_8080_ok):
        print("✓ All checks passed! The system should work correctly.")
        recommended_port = 5000 if port_5000_ok else 8080
        print(f"✓ Recommended port: {recommended_port}")
        print(f"✓ Start server with: python web_app.py")
        print(f"✓ Access at: http://localhost:{recommended_port}")
    else:
        print("✗ Issues found:")
        if not python_ok:
            print("  - Python version is too old (requires 3.6+)")
        if not deps_ok:
            print(f"  - Missing dependencies: {', '.join(missing_deps)}")
        if not files_ok:
            print(f"  - Missing files: {', '.join(missing_files)}")
        if not port_5000_ok and not port_8080_ok:
            print("  - Both ports 5000 and 8080 are in use")
    
    print("\n" + "=" * 50)

if __name__ == '__main__':
    main()