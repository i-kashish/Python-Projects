import json
import os
from utils import hash_password

def add_default_data():
    # 1. Add Teachers to users.json
    users_file = 'users.json'
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            try:
                users = json.load(f)
            except:
                users = {}
    else:
        users = {}

    new_teachers = {
        "teacher1": "pass123",
        "teacher2": "pass123",
        "mr_smith": "smith123"
    }

    added_teachers = 0
    for t_user, t_pass in new_teachers.items():
        if t_user not in users:
            users[t_user] = hash_password(t_pass).decode('utf-8')
            added_teachers += 1

    with open(users_file, 'w') as f:
        json.dump(users, f)

    # 2. Add Students to students.json
    students_file = 'students.json'
    if os.path.exists(students_file):
        with open(students_file, 'r') as f:
            try:
                students = json.load(f)
            except:
                students = {}
    else:
        students = {}

    new_students = {
        "101": "Alice Brown",
        "102": "Charlie Davis",
        "103": "Eva White",
        "104": "David Green"
    }
    
    students.update(new_students)

    with open(students_file, 'w') as f:
        json.dump(students, f)

    print(f"Successfully added {added_teachers} new teachers and {len(new_students)} new students.")

if __name__ == "__main__":
    add_default_data()
