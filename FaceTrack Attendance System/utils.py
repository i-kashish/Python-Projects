import os
# Removed face_recognition dependency
import pandas as pd
import numpy as np
from datetime import datetime
import bcrypt

def load_known_faces(known_faces_dir):
    """
    Simplified version that just returns names without face recognition
    
    Args:
        known_faces_dir (str): Path to directory containing face images
        
    Returns:
        tuple: (dummy_encodings, known_names)
    """
    known_names = []
    
    # Just get the names from the files
    if os.path.exists(known_faces_dir):
        for filename in os.listdir(known_faces_dir):
            if filename.endswith(('.jpg', '.jpeg', '.png')):
                # Extract name from filename (without extension)
                name = os.path.splitext(filename)[0]
                known_names.append(name)
    
    # Return dummy encodings (empty list) and names
    return [], known_names

def mark_attendance(name, excel_path):
    """
    Mark attendance with name, date, time, and status (Present/Late).
    """
    now = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%I:%M %p")
    
    # Status Logic
    hour = now.hour
    minute = now.minute
    status = "Present"
    if hour == 8 and minute <= 30:
        status = "Late"
    elif hour >= 8:
        status = "Late" # Simplified for demo, usually would be 'Absent' after cutoff
    
    if not os.path.exists(excel_path):
        df = pd.DataFrame(columns=["Name", "Date", "Time", "Status"])
        df.to_excel(excel_path, index=False)
    
    df = pd.read_excel(excel_path)
    
    # Check duplicate
    if not df[(df["Name"].astype(str).str.strip() == name.strip()) & (df["Date"] == date)].empty:
        return False
    
    new_record = pd.DataFrame({"Name": [name], "Date": [date], "Time": [time_str], "Status": [status]})
    df = pd.concat([df, new_record], ignore_index=True)
    df.to_excel(excel_path, index=False)
    return True

def hash_password(password):
    """
    Hash a password using bcrypt.
    
    Args:
        password (str): Plain text password
        
    Returns:
        bytes: Hashed password
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def verify_password(plain_password, hashed_password):
    """
    Verify a password against its hash.
    
    Args:
        plain_password (str): Plain text password to verify
        hashed_password (bytes): Hashed password to compare against
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_attendance_summary(excel_path):
    """
    Generate a summary of attendance from the Excel file.
    
    Args:
        excel_path (str): Path to Excel file
        
    Returns:
        dict: Summary statistics
    """
    if not os.path.exists(excel_path):
        return {"total_records": 0, "unique_people": 0, "dates": 0}
    
    df = pd.read_excel(excel_path)
    
    summary = {
        "total_records": len(df),
        "unique_people": df["Name"].nunique(),
        "dates": df["Date"].nunique(),
        "recent_records": df.tail(5).to_dict('records')
    }
    
    return summary