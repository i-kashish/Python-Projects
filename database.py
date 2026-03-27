import sqlite3
import os

DB_NAME = 'hospital.db'

def get_connection():
    """Get a connection to the SQLite database"""
    return sqlite3.connect(DB_NAME, check_same_thread=False)

def initialize_database():
    """Create SQLite database and tables if they don't exist"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create patients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            contact TEXT NOT NULL,
            address TEXT NOT NULL,
            disease TEXT NOT NULL,
            admission_date TEXT NOT NULL
        )
    ''')
    
    # Create doctors table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialty TEXT NOT NULL,
            availability TEXT NOT NULL
        )
    ''')
    
    # Create appointments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            status TEXT DEFAULT 'Scheduled',
            FOREIGN KEY (patient_id) REFERENCES patients (id),
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        )
    ''')
    
    # Check if billing table exists and has the old schema
    cursor.execute("PRAGMA table_info(billing)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]
    
    if not columns:
        # Create new billing table with updated schema
        cursor.execute('''
            CREATE TABLE billing (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                consultation_fee REAL DEFAULT 0,
                medicine_charges REAL DEFAULT 0,
                room_charges_per_day REAL DEFAULT 0,
                number_of_days INTEGER DEFAULT 1,
                other_charges REAL DEFAULT 0,
                total_amount REAL DEFAULT 0,
                billing_date TEXT NOT NULL,
                payment_status TEXT DEFAULT 'Unpaid',
                payment_method TEXT DEFAULT 'Cash',
                payment_date TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            )
        ''')
    elif 'room_charges' in column_names and 'room_charges_per_day' not in column_names:
        # Migrate from old schema to new schema
        # Check if there's existing data
        cursor.execute("SELECT COUNT(*) FROM billing")
        count = cursor.fetchone()[0]
        
        if count > 0:
            # Backup existing data
            cursor.execute("SELECT * FROM billing")
            billing_data = cursor.fetchall()
            
            # Drop the old table
            cursor.execute("DROP TABLE billing")
            
            # Create the new table with updated schema
            cursor.execute('''
                CREATE TABLE billing (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER NOT NULL,
                    consultation_fee REAL DEFAULT 0,
                    medicine_charges REAL DEFAULT 0,
                    room_charges_per_day REAL DEFAULT 0,
                    number_of_days INTEGER DEFAULT 1,
                    other_charges REAL DEFAULT 0,
                    total_amount REAL DEFAULT 0,
                    billing_date TEXT NOT NULL,
                    payment_status TEXT DEFAULT 'Unpaid',
                    payment_method TEXT DEFAULT 'Cash',
                    payment_date TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id)
                )
            ''')
            
            # Restore data (assuming room_charges was for 1 day)
            # Old schema: id, patient_id, consultation_fee, medicine_charges, room_charges, other_charges, total_amount, billing_date
            for record in billing_data:
                old_id, patient_id, cons_fee, med_fee, room_fee, other_fee, total, b_date = record
                cursor.execute('''
                    INSERT INTO billing (
                        id, patient_id, consultation_fee, medicine_charges, 
                        room_charges_per_day, number_of_days, other_charges, total_amount, billing_date
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (old_id, patient_id, cons_fee, med_fee, room_fee, 1, other_fee, total, b_date))
        else:
            # No data, just drop and recreate
            cursor.execute("DROP TABLE billing")
            cursor.execute('''
                CREATE TABLE billing (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER NOT NULL,
                    consultation_fee REAL DEFAULT 0,
                    medicine_charges REAL DEFAULT 0,
                    room_charges_per_day REAL DEFAULT 0,
                    number_of_days INTEGER DEFAULT 1,
                    other_charges REAL DEFAULT 0,
                    total_amount REAL DEFAULT 0,
                    billing_date TEXT NOT NULL,
                    payment_status TEXT DEFAULT 'Unpaid',
                    payment_method TEXT DEFAULT 'Cash',
                    payment_date TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id)
                )
            ''')
    elif 'payment_status' not in column_names:
        # Add payment status columns to existing table
        try:
            cursor.execute("ALTER TABLE billing ADD COLUMN payment_status TEXT DEFAULT 'Unpaid'")
            cursor.execute("ALTER TABLE billing ADD COLUMN payment_method TEXT DEFAULT 'Cash'")
            cursor.execute("ALTER TABLE billing ADD COLUMN payment_date TEXT")
        except sqlite3.OperationalError:
            pass
    
    # Create doctor_salary table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctor_salary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER NOT NULL,
            salary_amount REAL DEFAULT 0,
            salary_month TEXT NOT NULL,
            salary_year TEXT NOT NULL,
            payment_date TEXT,
            payment_status TEXT DEFAULT 'Unpaid',
            payment_method TEXT DEFAULT 'Cash',
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    initialize_database()
