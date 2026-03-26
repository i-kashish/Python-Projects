import sqlite3
import pandas as pd
import os
from datetime import datetime

# Mock app functions for testing
DB_PATH = "test_cafeteria.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def execute_query(query, params=()):
    conn = get_connection()
    with conn:
        conn.execute(query, params)

def fetch_df(query, params=()):
    conn = get_connection()
    return pd.read_sql_query(query, conn, params=params)

def init_test_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    execute_query("""
        CREATE TABLE employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            salary REAL DEFAULT 0.0,
            role TEXT,
            wallet_balance REAL DEFAULT 0.0,
            employee_id TEXT
        )
    """)
    execute_query("""
        CREATE TABLE attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            date TEXT,
            status TEXT,
            entry_time TEXT,
            exit_time TEXT
        )
    """)
    # Seed Employee
    execute_query("INSERT INTO employees (name, salary, role, employee_id) VALUES (?, ?, ?, ?)", 
                  ("Test Emp", 30000.0, "Full-time", "T001"))

def calculate_monthly_salary_test(employee_id, month_year):
    # Logic copied from app.py for independent verification
    emp = fetch_df("SELECT * FROM employees WHERE id=?", (employee_id,)).iloc[0]
    monthly_salary = float(emp.get("salary", 0.0))
    
    start_date = f"{month_year}-01"
    y, m = map(int, month_year.split('-'))
    if m == 12:
        end_date = f"{y+1}-01-01"
    else:
        end_date = f"{y}-{m+1:02d}-01"
        
    att_df = fetch_df(
        "SELECT * FROM attendance WHERE employee_id=? AND date >= ? AND date < ?",
        (employee_id, start_date, end_date)
    )
    
    payable_days = 0.0
    
    for _, row in att_df.iterrows():
        s = row["status"]
        if s in ["Present", "Full Day", "Full Time", "Extra Time", "Holiday"]:
            payable_days += 1.0
        elif s in ["Half Day", "Part Time"]:
            payable_days += 0.5
            
    daily_rate = monthly_salary / 30.0 if monthly_salary > 0 else 0.0
    base_calc = daily_rate * payable_days
    return base_calc, payable_days

def run_test():
    init_test_db()
    
    # 1. Add Attendance
    # 2 Full Days, 1 Half Day, 1 Absent (implicitly absent if not in DB, but let's add explicitly if we tracked it)
    # Our DB logic only tracks entries.
    
    emp_id = 1
    month = "2025-05"
    
    # Day 1: Present
    execute_query("INSERT INTO attendance (employee_id, date, status) VALUES (?,?,?)", (emp_id, "2025-05-01", "Present"))
    # Day 2: Full Day
    execute_query("INSERT INTO attendance (employee_id, date, status) VALUES (?,?,?)", (emp_id, "2025-05-02", "Full Day"))
    # Day 3: Half Day
    execute_query("INSERT INTO attendance (employee_id, date, status) VALUES (?,?,?)", (emp_id, "2025-05-03", "Half Day"))
    # Day 4: Holiday
    execute_query("INSERT INTO attendance (employee_id, date, status) VALUES (?,?,?)", (emp_id, "2025-05-04", "Holiday"))
    
    # Expected Payable: 1 + 1 + 0.5 + 1 = 3.5 days
    # Salary: 30000 -> Daily 1000.
    # Expected Pay: 3500.
    
    pay, days = calculate_monthly_salary_test(emp_id, month)
    
    print(f"Calculated Pay: {pay}")
    print(f"Payable Days: {days}")
    
    assert days == 3.5, f"Expected 3.5 days, got {days}"
    assert pay == 3500.0, f"Expected 3500.0, got {pay}"
    
    print("Test Passed!")
    
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

if __name__ == "__main__":
    run_test()
