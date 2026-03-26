import json
import os

def add_more_students():
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
        "1001": "Rahul Sharma",
        "1002": "Priya Patel",
        "1003": "Amit Kumar",
        "1004": "Neha Gupta",
        "1005": "Anjali Singh",
        "1006": "Vikas Verma",
        "1007": "Sneha Reddy",
        "1008": "Rohan Das",
        "1009": "Pooja Mishra",
        "1010": "Karan Malhotra",
        "1011": "Aisha Khan",
        "1012": "Aditya Joshi",
        "1013": "Kavita Rao",
        "1014": "Siddharth Menon",
        "1015": "Riya Kapoor",
        "1016": "Arjun Nair",
        "1017": "Meera Iyer",
        "1018": "Sameer Jain",
        "1019": "Tanvi Bhatia",
        "1020": "Varun Desai"
    }

    students.update(new_students)

    with open(students_file, 'w') as f:
        json.dump(students, f, indent=4)

    print(f"Successfully added {len(new_students)} new students.")

if __name__ == "__main__":
    add_more_students()
