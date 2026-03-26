import json
import pandas as pd
from datetime import datetime
import os

def setup_attendance():
    # 1. Clean up students.json to exactly 20 students
    try:
        with open('students.json', 'r') as f:
            students = json.load(f)
            
        # If there are more than 20 students, keep the newest 20.
        if len(students) > 20:
             # It's likely the newly added ones are at the end, or we can just keep exactly 20
             keys = list(students.keys())[-20:]
             students = {k: students[k] for k in keys}
        
        with open('students.json', 'w') as f:
            json.dump(students, f, indent=4)
        print(f"Configured students.json to have exactly {len(students)} students.")
    except Exception as e:
        print(f"Error adjusting students: {e}")
        return

    # 2. Mark 14 present in attendance.xlsx
    excel_path = 'attendance.xlsx'
    now = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")

    student_names = list(students.values())
    present_students = student_names[:14] # Elect first 14 as present

    if not os.path.exists(excel_path):
        df = pd.DataFrame(columns=["Name", "Date", "Time"])
    else:
        df = pd.read_excel(excel_path)
    
    added_count = 0
    for name in present_students:
        # Avoid duplicate marks for today
        if not df.empty and 'Name' in df.columns and 'Date' in df.columns:
            same_day = df[(df["Name"] == name) & (df["Date"] == date)]
            if not same_day.empty:
                continue
                
        new_record = pd.DataFrame({"Name": [name], "Date": [date], "Time": [time]})
        df = pd.concat([df, new_record], ignore_index=True)
        added_count += 1

    df.to_excel(excel_path, index=False)
    print(f"Successfully marked {added_count} students as present for today ({date}).")

if __name__ == "__main__":
    setup_attendance()
