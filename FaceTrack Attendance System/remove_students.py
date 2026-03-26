import pandas as pd
import json

to_remove = ["sas", "alice", "zara", "39", "102", "201", "100", "Michael Johnson"]

# Clean attendance.xlsx
try:
    df = pd.read_excel('attendance.xlsx')
    initial = len(df)
    
    # Also strip whitespace just in case
    names_series = df['Name'].astype(str).str.strip()
    
    # Filter out the names we want to remove
    df = df[~names_series.isin(to_remove)]
    
    if len(df) < initial:
        df.to_excel('attendance.xlsx', index=False)
        print(f"Removed {initial - len(df)} records from attendance.xlsx")
    else:
        print("No records matched for removal in attendance.xlsx")
except Exception as e:
    print(f"Error with attendance.xlsx: {e}")

# Clean students.json
try:
    with open('students.json', 'r') as f:
        students = json.load(f)
    initial = len(students)
    
    keys_to_del = []
    for k, v in students.items():
        if str(k).strip() in to_remove or str(v).strip() in to_remove:
            keys_to_del.append(k)
            
    for k in keys_to_del:
        del students[k]
        
    if len(students) < initial:
        with open('students.json', 'w') as f:
            json.dump(students, f, indent=4)
        print(f"Removed {initial - len(students)} students from students.json")
    else:
        print("No students matched for removal in students.json")
except Exception as e:
    print(f"Error with students.json: {e}")
