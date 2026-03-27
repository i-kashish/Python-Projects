import sqlite3
from datetime import datetime

# Connect to the database
conn = sqlite3.connect('hospital.db')
cursor = conn.cursor()

# Insert test patients
patients = [
    ("John Doe", 35, "Male", "1234567890", "123 Main St", "Fever", "2023-05-15"),
    ("Jane Smith", 28, "Female", "0987654321", "456 Oak Ave", "Headache", "2023-05-16"),
    ("Robert Johnson", 45, "Male", "5551234567", "789 Pine Rd", "Broken Arm", "2023-05-17")
]

cursor.executemany('''
    INSERT INTO patients (name, age, gender, contact, address, disease, admission_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', patients)

# Insert test doctors
doctors = [
    ("Dr. Emily Brown", "Cardiology", "Monday-Friday 9AM-5PM"),
    ("Dr. Michael Davis", "Neurology", "Monday-Saturday 10AM-6PM"),
    ("Dr. Sarah Wilson", "Orthopedics", "24/7")
]

cursor.executemany('''
    INSERT INTO doctors (name, specialty, availability)
    VALUES (?, ?, ?)
''', doctors)

# Insert test appointments
appointments = [
    (1, 1, "2023-05-20"),  # John Doe with Dr. Emily Brown
    (2, 2, "2023-05-21"),  # Jane Smith with Dr. Michael Davis
    (3, 3, "2023-05-22")   # Robert Johnson with Dr. Sarah Wilson
]

cursor.executemany('''
    INSERT INTO appointments (patient_id, doctor_id, appointment_date)
    VALUES (?, ?, ?)
''', appointments)

# Insert test billing records
billing = [
    (1, 50.0, 25.0, 100.0, 0.0, 175.0, "2023-05-15"),  # John Doe
    (2, 50.0, 15.0, 0.0, 10.0, 75.0, "2023-05-16"),    # Jane Smith
    (3, 50.0, 0.0, 200.0, 50.0, 300.0, "2023-05-17")   # Robert Johnson
]

cursor.executemany('''
    INSERT INTO billing (
        patient_id, consultation_fee, medicine_charges, 
        room_charges, other_charges, total_amount, billing_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', billing)

# Commit changes and close connection
conn.commit()
conn.close()

print("Test data inserted successfully!")