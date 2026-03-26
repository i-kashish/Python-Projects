import json

def replace_names():
    # Replace in students.json
    try:
        with open('students.json', 'r') as f:
            students = json.load(f)
            
        replacements = {
            "1": "Aarav Gupta",
            "2": "Vivaan Sharma",
            "3": "Sanya Patel",
            "101": "Ishaan Kumar",
            "102": "Diya Singh",
            "103": "Kabir Verma",
            "104": "Myra Reddy"
        }
        
        for sid, new_name in replacements.items():
            if sid in students:
                students[sid] = new_name
                
        with open('students.json', 'w') as f:
            json.dump(students, f, indent=4)
        print("Replaced all student names.")
        
    except Exception as e:
        print(f"Error updating students: {e}")

    # Replace in users.json
    try:
        with open('users.json', 'r') as f:
            users = json.load(f)
            
        if "mr_smith" in users:
            pw_hash = users.pop("mr_smith")
            users["mr_sharma"] = pw_hash
            
            with open('users.json', 'w') as f:
                json.dump(users, f, indent=4)
            print("Replaced mr_smith with mr_sharma in users.json")
            
    except Exception as e:
        print(f"Error updating users: {e}")

if __name__ == "__main__":
    replace_names()
