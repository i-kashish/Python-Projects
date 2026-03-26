import os
import sqlite3
from datetime import datetime, date, timedelta
from typing import Dict, List, Tuple

import pandas as pd
import plotly.express as px


import streamlit as st
from fpdf import FPDF
import io
import qrcode


# ----------------------------
# App configuration
# ----------------------------
st.set_page_config(page_title="Smart Cafeteria Dashboard", page_icon="🍽️", layout="wide")


# ----------------------------
# Constants and helpers
# ----------------------------
APP_DATA_DIR = os.path.join(os.getcwd(), "data")
DB_PATH = os.path.join(APP_DATA_DIR, "smart_cafeteria.db")

ROLE_OPTIONS = ["Full-time", "Part-time", "Intern", "Contract"]
ATTENDANCE_STATUS = ["Present", "Absent", "Half Day", "Full Day", "Part Time", "Full Time", "Extra Time", "Holiday", "Leave"]


def ensure_data_dir() -> None:
    if not os.path.exists(APP_DATA_DIR):
        os.makedirs(APP_DATA_DIR, exist_ok=True)


@st.cache_resource(show_spinner=False)
def get_connection() -> sqlite3.Connection:
    ensure_data_dir()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def execute_query(query: str, params: Tuple = ()) -> None:
    conn = get_connection()
    with conn:
        conn.execute(query, params)


def execute_many(query: str, seq_of_params: List[Tuple]) -> None:
    conn = get_connection()
    with conn:
        conn.executemany(query, seq_of_params)


def fetch_df(query: str, params: Tuple = ()) -> pd.DataFrame:
    conn = get_connection()
    df = pd.read_sql_query(query, conn, params=params)
    return df


def init_db() -> None:
    # Create tables
    execute_query(
        """
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT UNIQUE,
            name TEXT NOT NULL,
            role TEXT NOT NULL, -- Application level validation used instead of strict DB CHECK
            wallet_balance REAL NOT NULL DEFAULT 0,
            salary REAL NOT NULL DEFAULT 0.0
        );
        """
    )
    
    # ---------------------------------------------------------
    # Schema Migration: Fix employees table constraints & columns
    # ---------------------------------------------------------
    try:
        conn = get_connection()
        cur = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='employees'")
        row = cur.fetchone()
        if row and "CHECK (role IN ('Full-time','Part-time'))" in row[0]:
            print("Migrating employees table: Removing restrictive role constraint...")
            with conn:
                # 1. Rename old table
                conn.execute("ALTER TABLE employees RENAME TO employees_old_v2")
                
                # 2. Create new table (Constraint Removed)
                conn.execute("""
                    CREATE TABLE employees (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        employee_id TEXT UNIQUE,
                        name TEXT NOT NULL,
                        role TEXT NOT NULL,
                        wallet_balance REAL NOT NULL DEFAULT 0,
                        salary REAL NOT NULL DEFAULT 0.0
                    )
                """)
                
                # 3. Copy data (Handle case where 'salary' might be missing in old v1 table if not migrated yet)
                # Check columns in old table
                cur_old = conn.execute("PRAGMA table_info(employees_old_v2)")
                old_cols = [c[1] for c in cur_old.fetchall()]
                
                if "salary" in old_cols:
                    conn.execute("INSERT INTO employees SELECT id, employee_id, name, role, wallet_balance, salary FROM employees_old_v2")
                else:
                    # Provide default 0.0 for salary
                    conn.execute("INSERT INTO employees (id, employee_id, name, role, wallet_balance, salary) SELECT id, employee_id, name, role, wallet_balance, 0.0 FROM employees_old_v2")
                    
                # 4. Cleanup
                conn.execute("DROP TABLE employees_old_v2")
            print("Migration complete: employees table updated.")
            
        # Ensure salary column exists (Redundant safety check)
        cur = conn.execute("PRAGMA table_info(employees)")
        cols = [info[1] for info in cur.fetchall()]
        if "salary" not in cols:
            print("Adding missing salary column...")
            execute_query("ALTER TABLE employees ADD COLUMN salary REAL NOT NULL DEFAULT 0.0")
            
    except Exception as e:
        print(f"Migration error: {e}")

    execute_query(
        """
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            calories INTEGER NOT NULL,
            protein REAL NOT NULL,
            image_url TEXT,
            ingredients TEXT
        );
        """
    )

    execute_query(
        """
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            entry_time TEXT,
            exit_time TEXT,
            status TEXT NOT NULL CHECK (status IN ('Present','Absent')),
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        """
    )


    execute_query(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            items TEXT NOT NULL, -- e.g. "Sandwich x1; Coffee x2"
            total_cost REAL NOT NULL,
            tip REAL NOT NULL DEFAULT 0,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Completed',
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        """
    )
    
    execute_query(
        """
        CREATE TABLE IF NOT EXISTS salary_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            month_year TEXT NOT NULL, -- Format: YYYY-MM
            credit_date TEXT,
            status TEXT DEFAULT 'Pending',
            base_salary REAL DEFAULT 0,
            bonus REAL DEFAULT 0,
            deductions REAL DEFAULT 0,
            deduction_reason TEXT,
            total_salary REAL DEFAULT 0,
            generated_at TEXT,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );
        """
    )

    # Migration for attendance table to support new statuses
    try:
        # Check if we need to migrate by attempting to insert a new status type
        # If it fails with a CHECK constraint, we migrate. 
        # Easier way: check table_info or just try to migrate if not already done.
        # We will check if the table schema strictly allows only Present/Absent.
        
        # Simple migration: Rename old, create new, copy data.
        # We'll do this safely.
        conn = get_connection()
        temp_check = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='attendance'").fetchone()
        if temp_check and "CHECK (status IN ('Present','Absent'))" in temp_check[0]:
            print("Migrating attendance table schema...")
            with conn:
                conn.execute("ALTER TABLE attendance RENAME TO attendance_old")
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS attendance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        employee_id INTEGER NOT NULL,
                        date TEXT NOT NULL,
                        entry_time TEXT,
                        exit_time TEXT,
                        status TEXT NOT NULL, -- constraint removed or broadened
                        FOREIGN KEY (employee_id) REFERENCES employees(id)
                    );
                    """
                )
                conn.execute("INSERT INTO attendance (id, employee_id, date, entry_time, exit_time, status) SELECT id, employee_id, date, entry_time, exit_time, status FROM attendance_old")
                conn.execute("DROP TABLE attendance_old")
            print("Migration complete.")
    except Exception as e:
        print(f"Migration warning: {e}")

    # Seed data if empty
    if fetch_df("SELECT COUNT(*) AS c FROM employees").iloc[0]["c"] == 0:
        employees_seed = [
            ("E001", "Alice Johnson", "Full-time", 120.0, 45000.0),
            ("E002", "Bob Smith", "Part-time", 65.0, 25000.0),
            ("E003", "Charlie Lee", "Full-time", 200.0, 52000.0),
            ("E999", "Guest / Self-Service", "Guest", 0.0, 0.0),
        ]
        execute_many(
            "INSERT INTO employees (employee_id, name, role, wallet_balance, salary) VALUES (?,?,?,?,?)",
            employees_seed,
        )

    if fetch_df("SELECT COUNT(*) AS c FROM menu_items").iloc[0]["c"] <= 10:
        # Force re-seed to Vegetarian Menu
        execute_query("DELETE FROM menu_items")
        # Vegetarian image placeholders
        items_seed = [
            ("Veggie Wrap", 180, 280, 12.0, "https://plus.unsplash.com/premium_photo-1663853492231-7b71429d33f8?w=600", "Whole wheat tortilla, hummus, roasted vegetables, spinach, feta cheese"),
            ("Paneer Tikka Bowl", 220, 400, 20.0, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600", "Marinated paneer, basmati rice, bell peppers, onions, yogurt mint chutney"),
            ("Dal & Rice Combo", 160, 380, 15.0, "https://plus.unsplash.com/premium_photo-1661313797960-e4b7b2501064?w=600", "Yellow lentils (moong dal), steamed basmati rice, cumin, garlic, ghee"),
            ("Mixed Veg Salad", 150, 250, 10.0, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600", "Kale, cherry tomatoes, cucumbers, chickpeas, avocado, lemon vinaigrette"),
            ("Fruit Smoothie", 120, 200, 6.0, "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600", "Fresh strawberries, bananas, almond milk, chia seeds, honey"),
            ("Veg Burger", 200, 420, 18.0, "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=600", "Oat and black bean patty, whole grain bun, lettuce, tomato, spicy mayo"),
            ("Stuffed Paratha Plate", 140, 350, 8.0, "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600", "Whole wheat flatbread, spiced potato filling, curd, mango pickle"),
            ("Chocolate Muffin", 90, 250, 4.0, "https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?w=600", "Dark chocolate cocoa, whole wheat flour, walnuts, yogurt, honey")
        ]
        execute_many(
            "INSERT INTO menu_items (name, price, calories, protein, image_url, ingredients) VALUES (?,?,?,?,?,?)",
            items_seed,
        )

    if fetch_df("SELECT COUNT(*) AS c FROM transactions").iloc[0]["c"] == 0:
        # Create some sample transactions for last 7 days
        employees = fetch_df("SELECT id, name FROM employees")
        menu = fetch_df("SELECT name, price FROM menu_items")
        if not employees.empty and not menu.empty:
            now = datetime.now()
            sample_tx: List[Tuple[int, str, float, float, str]] = []
            menu_names = menu["name"].tolist()
            for d in range(0, 7):
                tx_date = now - timedelta(days=d)
                ts = tx_date.replace(hour=12, minute=30)
                for _, emp in employees.iterrows():
                    # Build a simple order of 1-3 items
                    items_list = []
                    total_cost = 0.0
                    for idx in range((emp["id"] % 3) + 1):
                        item_name = menu_names[(emp["id"] + idx + d) % len(menu_names)]
                        qty = (idx % 2) + 1
                        items_list.append(f"{item_name} x{qty}")
                        price = float(menu[menu["name"] == item_name]["price"].iloc[0])
                        total_cost += price * qty
                    tip = round(total_cost * 0.05, 2)
                    items_str = "; ".join(items_list)
                    sample_tx.append((int(emp["id"]), items_str, round(total_cost, 2), tip, ts.isoformat()))
            execute_many(
                "INSERT INTO transactions (employee_id, items, total_cost, tip, timestamp) VALUES (?,?,?,?,?)",
                sample_tx,
            )


def parse_items(items_text: str) -> Dict[str, int]:
    result: Dict[str, int] = {}
    if not items_text:
        return result
    parts = [p.strip() for p in items_text.split(";") if p.strip()]
    for p in parts:
        # Expected patterns: "Item x2" or just "Item"
        if " x" in p:
            name, qty_txt = p.rsplit(" x", 1)
            try:
                qty = int(qty_txt.strip())
            except ValueError:
                qty = 1
        else:
            name, qty = p, 1
        result[name.strip()] = result.get(name.strip(), 0) + qty
    return result


def get_today_str() -> str:
    return date.today().isoformat()


def get_employees_with_attendance(today_only: bool = True) -> pd.DataFrame:
    employees = fetch_df("SELECT id, employee_id, name, role, wallet_balance FROM employees")
    if employees.empty:
        return employees
    today = get_today_str()
    attendance_df = fetch_df(
        """
        SELECT a.* FROM attendance a
        WHERE a.date = ?
        ORDER BY a.id DESC
        """,
        (today,),
    )
    # Keep latest record per employee
    latest_map: Dict[int, Dict[str, str]] = {}
    for _, row in attendance_df.iterrows():
        emp_id = int(row["employee_id"])
        if emp_id not in latest_map:
            latest_map[emp_id] = {
                "entry_time": row["entry_time"],
                "exit_time": row["exit_time"],
                "status": row["status"],
            }

    # Build result
    rows = []
    for _, emp in employees.iterrows():
        att = latest_map.get(int(emp["id"]), None)
        if att:
            status = att.get("status")
            entry_time = att.get("entry_time")
            exit_time = att.get("exit_time")
        else:
            status = "Absent"
            entry_time = None
            exit_time = None
        rows.append(
            {
                "Name": emp["name"],
                "Employee ID": emp["employee_id"],
                "Role": emp["role"],
                "Entry": entry_time if entry_time else "-",
                "Exit": exit_time if exit_time else "-",
                "Attendance": status,
                "Salary": float(emp.get("salary", 0.0)),
                "_emp_pk": int(emp["id"]),
                "Wallet": float(emp["wallet_balance"]),
            }
        )
    result_df = pd.DataFrame(rows)
    return result_df


def upsert_employee(name: str, employee_id: str, role: str, wallet_balance: float, salary: float = 0.0, internal_id: int = None) -> None:
    if internal_id:
        execute_query(
            "UPDATE employees SET name=?, employee_id=?, role=?, wallet_balance=?, salary=? WHERE id=?",
            (name.strip(), employee_id.strip(), role, float(wallet_balance), float(salary), internal_id)
        )
    else:
        execute_query(
            "INSERT INTO employees (name, employee_id, role, wallet_balance, salary) VALUES (?,?,?,?,?)",
            (name.strip(), employee_id.strip(), role, float(wallet_balance), float(salary))
        )


def process_order(employee_pk: int, items_dict: Dict[str, int], tip_amount: float) -> Tuple[bool, str]:
    # 1. Get menu prices
    menu_df = list_menu_items()
    price_map = {row["name"]: row["price"] for _, row in menu_df.iterrows()}
    
    # 2. Calculate total cost
    total_cost = 0.0
    items_list = []
    for name, qty in items_dict.items():
        if name in price_map:
            total_cost += price_map[name] * qty
            items_list.append(f"{name} x{qty}")
    
    if not items_list:
        return False, "No items selected."
        
    items_str = "; ".join(items_list)
    
    # 3. Check wallet balance
    conn = get_connection()
    cur = conn.execute("SELECT wallet_balance, name FROM employees WHERE id=?", (employee_pk,))
    emp = cur.fetchone()
    if not emp:
        return False, "Employee not found."
    
    current_balance = float(emp["wallet_balance"])
    total_needed = total_cost + tip_amount
    
    # 4. Process transaction
    new_balance = current_balance - total_needed
    now_iso = datetime.now().isoformat()
    
    try:
        with conn:
            # Deduct from wallet
            conn.execute("UPDATE employees SET wallet_balance=? WHERE id=?", (new_balance, employee_pk))
            # Insert transaction
            conn.execute(
                "INSERT INTO transactions (employee_id, items, total_cost, tip, timestamp, status) VALUES (?,?,?,?,?,?)",
                (employee_pk, items_str, total_cost, tip_amount, now_iso, 'Pending')
            )
        return True, f"Order successfully processed for {emp['name']}!"
    except Exception as e:
        return False, f"System error during transaction: {str(e)}"


def upsert_menu_item(item_id: int, name: str, price: float, calories: int, protein: float, image_url: str, ingredients: str = "") -> None:
    if item_id == -1:
        execute_query(
            "INSERT INTO menu_items (name, price, calories, protein, image_url, ingredients) VALUES (?,?,?,?,?,?)",
            (name, price, int(calories), protein, image_url, ingredients),
        )
    else:
        execute_query(
            "UPDATE menu_items SET name=?, price=?, calories=?, protein=?, image_url=?, ingredients=? WHERE id=?",
            (name, price, int(calories), protein, image_url, ingredients, item_id),
        )


@st.dialog("📋 Item Details")
def show_item_details(item_row):
    st.image(item_row["image_url"], use_container_width=True)
    st.markdown(f"## {item_row['name']}")
    st.markdown(f"**Price:** ₹{item_row['price']:.2f}")
    
    col1, col2 = st.columns(2)
    col1.metric("Calories", f"{int(item_row['calories'])} kcal")
    col2.metric("Protein", f"{item_row['protein']:.1f} g")
    
    st.markdown("### 🥗 Ingredients")
    ingredients = item_row.get("ingredients") or "No ingredients listed."
    st.write(ingredients)
    
    if st.button("Close"):
        st.rerun()


def create_pdf_bill(order_row: pd.Series) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Arial", "B", 20)
    pdf.set_text_color(26, 58, 95)  # Pro Blue
    pdf.cell(0, 15, "SMART CAFETERIA PRO", ln=True, align="C")
    
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, "Official Digital Invoice", ln=True, align="C")
    pdf.ln(10)
    
    # Order Info
    pdf.set_font("Arial", "B", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, f"BILL TO: {order_row['employee_name']}", ln=True)
    
    pdf.set_font("Arial", "", 10)
    pdf.cell(100, 7, f"Invoice #: ORD-{order_row['id']}", ln=False)
    pdf.cell(0, 7, f"Date: {order_row['timestamp']}", ln=True, align="R")
    pdf.ln(5)
    
    # Table Header
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(100, 10, "Item Description", 1, 0, "C", True)
    pdf.cell(30, 10, "Price", 1, 0, "C", True)
    pdf.cell(20, 10, "Qty", 1, 0, "C", True)
    pdf.cell(40, 10, "Subtotal", 1, 1, "C", True)
    
    # Table Body
    pdf.set_font("Arial", "", 10)
    items_map = parse_items(order_row["items"])
    
    menu_df = list_menu_items()
    price_map = {r["name"]: r["price"] for _, r in menu_df.iterrows()}
    
    total_items_cost = 0.0
    for name, qty in items_map.items():
        price = price_map.get(name, 0.0)
        subtotal = price * qty
        total_items_cost += subtotal
        
        pdf.cell(100, 10, f" {name}", 1)
        pdf.cell(30, 10, f" INR {price:.2f}", 1, 0, "R")
        pdf.cell(20, 10, str(qty), 1, 0, "C")
        pdf.cell(40, 10, f" INR {subtotal:.2f}", 1, 1, "R")
        
    # Summary
    pdf.ln(5)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(150, 10, "Items Total:", 0, 0, "R")
    pdf.cell(40, 10, f" INR {total_items_cost:.2f}", 0, 1, "R")
    
    pdf.cell(150, 10, "Service Tip:", 0, 0, "R")
    pdf.cell(40, 10, f" INR {order_row['tip']:.2f}", 0, 1, "R")
    
    pdf.set_font("Arial", "B", 12)
    pdf.set_text_color(39, 174, 96)  # Success Green
    pdf.cell(150, 12, "GRAND TOTAL (PREPAID):", 0, 0, "R")
    pdf.cell(40, 12, f" INR {order_row['total_cost'] + order_row['tip']:.2f}", 0, 1, "R")
    
    # Footer
    pdf.ln(20)
    pdf.set_font("Arial", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "Thank you for using Smart Cafeteria. This is a computer-generated prepaid voucher.", ln=True, align="C")
    
    return bytes(pdf.output())


def mark_entry(employee_pk: int, status: str = "Present") -> None:
    now_iso = datetime.now().isoformat(timespec="seconds")
    execute_query(
        "INSERT INTO attendance (employee_id, date, entry_time, status) VALUES (?,?,?,?)",
        (int(employee_pk), get_today_str(), now_iso, status),
    )


def mark_exit(employee_pk: int) -> None:
    now_iso = datetime.now().isoformat(timespec="seconds")
    # Update the most recent attendance record today for this employee
    conn = get_connection()
    with conn:
        cur = conn.execute(
            "SELECT id FROM attendance WHERE employee_id=? AND date=? ORDER BY id DESC LIMIT 1",
            (int(employee_pk), get_today_str()),
        )
        row = cur.fetchone()
        if row:
            conn.execute(
                "UPDATE attendance SET exit_time=?, status='Absent' WHERE id=?",
                (now_iso, int(row["id"])),
            )
        else:
            # If no entry, create an absent record with exit time logged
            conn.execute(
                "INSERT INTO attendance (employee_id, date, exit_time, status) VALUES (?,?,?, 'Absent')",
                (int(employee_pk), get_today_str(), now_iso),
            )


def get_transactions_df() -> pd.DataFrame:
    df = fetch_df(
        """
        SELECT t.id, e.name AS employee_name, t.items, t.total_cost, t.tip, t.timestamp, t.status
        FROM transactions t
        JOIN employees e ON e.id = t.employee_id
        ORDER BY t.timestamp DESC
        """
    )
    return df


def update_order_status(order_id: int, new_status: str) -> None:
    execute_query(
        "UPDATE transactions SET status=? WHERE id=?",
        (new_status, int(order_id))
    )


def compute_daily_revenue_and_tips(target_date: str) -> Tuple[float, float, int]:
    df = fetch_df(
        "SELECT total_cost, tip FROM transactions WHERE date(timestamp) = date(?)",
        (target_date,),
    )
    if df.empty:
        return 0.0, 0.0, 0
    revenue = float(df["total_cost"].sum())
    tips = float(df["tip"].sum())
    count = int(df.shape[0])
    return revenue, tips, count


def compute_employee_nutrition_for_day(employee_pk: int, target_date: str) -> Tuple[int, float, pd.DataFrame]:
    tx = fetch_df(
        "SELECT items FROM transactions WHERE employee_id=? AND date(timestamp) = date(?)",
        (int(employee_pk), target_date),
    )
    if tx.empty:
        return 0, 0.0, pd.DataFrame(columns=["Item", "Quantity", "Calories", "Protein"])  # type: ignore
    menu = fetch_df("SELECT name, calories, protein FROM menu_items")
    name_to_cal = {r["name"]: int(r["calories"]) for _, r in menu.iterrows()}
    name_to_pro = {r["name"]: float(r["protein"]) for _, r in menu.iterrows()}
    item_to_qty: Dict[str, int] = {}
    for _, row in tx.iterrows():
        items_map = parse_items(row["items"])
        for nm, q in items_map.items():
            item_to_qty[nm] = item_to_qty.get(nm, 0) + int(q)
    rows = []
    total_cal = 0
    total_pro = 0.0
    for nm, q in item_to_qty.items():
        c = name_to_cal.get(nm, 0) * q
        p = name_to_pro.get(nm, 0.0) * q
        total_cal += c
        total_pro += p
        rows.append({"Item": nm, "Quantity": q, "Calories": c, "Protein": p})
    df = pd.DataFrame(rows).sort_values(by="Calories", ascending=False)
    return total_cal, total_pro, df


def get_daily_trends(days: int = 14) -> pd.DataFrame:
    start_date = (date.today() - timedelta(days=days - 1)).isoformat()
    df = fetch_df(
        """
        SELECT date(timestamp) AS day, COUNT(*) AS orders, SUM(total_cost) AS revenue, SUM(tip) AS tips
        FROM transactions
        WHERE date(timestamp) >= date(?)
        GROUP BY date(timestamp)
        ORDER BY day
        """,
        (start_date,),
    )
    return df


def list_menu_items() -> pd.DataFrame:
    return fetch_df("SELECT id, name, price, calories, protein, image_url, ingredients FROM menu_items ORDER BY name")


def list_employees() -> pd.DataFrame:
    return fetch_df("SELECT id, employee_id, name, role, wallet_balance, salary FROM employees ORDER BY name")


def upsert_salary_record(record_id: int, employee_id: int, month_year: str, credit_date: str, status: str, base_salary: float, bonus: float, deductions: float, reason: str, total: float) -> None:
    now_iso = datetime.now().isoformat()
    if record_id == -1:
        execute_query(
            "INSERT INTO salary_records (employee_id, month_year, credit_date, status, base_salary, bonus, deductions, deduction_reason, total_salary, generated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (employee_id, month_year, credit_date, status, float(base_salary), float(bonus), float(deductions), reason, float(total), now_iso)
        )
    else:
        execute_query(
            "UPDATE salary_records SET credit_date=?, status=?, base_salary=?, bonus=?, deductions=?, deduction_reason=?, total_salary=?, generated_at=? WHERE id=?",
            (credit_date, status, float(base_salary), float(bonus), float(deductions), reason, float(total), now_iso, record_id)
        )


def get_salary_history(employee_id: int = None, month_year: str = None) -> pd.DataFrame:
    query = """
        SELECT s.*, e.name as employee_name, e.employee_id as emp_code, e.role 
        FROM salary_records s
        JOIN employees e ON s.employee_id = e.id
        WHERE 1=1
    """
    params = []
    if employee_id:
        query += " AND s.employee_id = ?"
        params.append(employee_id)
    if month_year:
        query += " AND s.month_year = ?"
        params.append(month_year)
    
    query += " ORDER BY s.month_year DESC, s.id DESC"
    return fetch_df(query, tuple(params))


def calculate_monthly_salary(employee_id: int, month_year: str) -> Dict:
    # Get employee details
    emp = fetch_df("SELECT * FROM employees WHERE id=?", (employee_id,)).iloc[0]
    monthly_salary = float(emp.get("salary", 0.0))
    
    # Get attendance for the month
    start_date = f"{month_year}-01"
    # End date is start of next month
    try:
        y, m = map(int, month_year.split('-'))
        if m == 12:
            end_date = f"{y+1}-01-01"
        else:
            end_date = f"{y}-{m+1:02d}-01"
    except ValueError:
        end_date = start_date # Fallback
        
    att_df = fetch_df(
        "SELECT * FROM attendance WHERE employee_id=? AND date >= ? AND date < ?",
        (employee_id, start_date, end_date)
    )
    
    # Calculate payable days
    payable_days = 0.0
    present_days = 0
    half_days = 0
    
    # Weights
    # Present, Full Day, Full Time, Extra Time, Holiday = 1
    # Half Day, Part Time = 0.5
    # Absent, Leave = 0
    
    summary = {}
    if not att_df.empty:
        for _, row in att_df.iterrows():
            s = row["status"]
            summary[s] = summary.get(s, 0) + 1
            
            if s in ["Present", "Full Day", "Full Time", "Extra Time", "Holiday"]:
                payable_days += 1.0
                present_days += 1
            elif s in ["Half Day", "Part Time"]:
                payable_days += 0.5
                half_days += 1
            
    # Simple pro-rata: (Monthly / 30) * payable_days
    daily_rate = monthly_salary / 30.0 if monthly_salary > 0 else 0.0
    base_calc = daily_rate * payable_days
    
    return {
        "employee_id": employee_id,
        "name": emp["name"],
        "role": emp["role"],
        "month_year": month_year,
        "monthly_salary": monthly_salary,
        "payable_days": payable_days,
        "summary": summary,
        "base_salary": round(base_calc, 2),
        "suggested_bonus": 0.0,
        "suggested_deductions": 0.0
    }


# ----------------------------
# Sidebar Navigation & Info
# ----------------------------
init_db()  # Initialize database and run migrations

with st.sidebar:
    st.image("https://img.icons8.com/clouds/200/000000/restaurant.png", width=120)
    st.title("Admin Controls")
    
    st.markdown("---")
    theme_mode = st.radio("🌗 Dashboard Theme", ["Light", "Dark"], index=0, horizontal=True)

# Define Theme Colors
if theme_mode == "Light":
    bg_gradient = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    card_bg = "rgba(255, 255, 255, 0.7)"
    text_primary = "#1a3a5f"
    text_secondary = "#666"
    sidebar_bg = "#ffffff"
    card_border = "rgba(255, 255, 255, 0.3)"
    input_bg = "rgba(255, 255, 255, 0.8)"
else:
    # Deep, rich dark mode
    bg_gradient = "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
    card_bg = "rgba(20, 25, 40, 0.85)"
    text_primary = "#e0e0e0"
    text_secondary = "#b0b0b0"
    sidebar_bg = "#111822"
    card_border = "rgba(255, 255, 255, 0.1)"
    input_bg = "rgba(30, 35, 50, 0.9)"

# ----------------------------
# UI Enhancements (Inject CSS)
# ----------------------------
st.markdown(f"""
<style>
    /* Main Background */
    .stApp {{
        background: {bg_gradient};
        color: {text_primary};
    }}
    
    /* Card Styles */
    .metric-card {{
        background-color: {card_bg};
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid {card_border};
        margin-bottom: 20px;
        transition: transform 0.2s;
    }}
    .metric-card:hover {{
        transform: translateY(-5px);
    }}
    
    /* Global font and color */
    html, body, [class*="css"] {{
        font-family: 'Inter', sans-serif;
    }}
    
    /* Force text color for generic elements to ensure visibility */
    .stApp, .stApp p, .stApp label, .stApp span, .stApp div {{
        color: {text_primary} !important;
    }}
    
    /* HEADERS */
    h1, h2, h3, h4, h5, h6 {{
        color: {text_primary} !important;
    }}

    /* INPUTS & WIDGETS */
    /* Force background and text color on all input-like elements */
    .stTextInput input, .stNumberInput input, .stDateInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] {{
        background-color: {input_bg} !important;
        color: {text_primary} !important;
        border: 1px solid {card_border} !important;
    }}
    
    /* Placeholder text color */
    ::placeholder {{
        color: {text_secondary} !important;
        opacity: 1;
    }}

    /* Dropdown menu items */
    ul[data-baseweb="menu"] {{
        background-color: {card_bg} !important;
    }}
    li[data-baseweb="option"] {{
        color: {text_primary} !important;
    }}
    
    /* DATAFRAME / TABLE FIXES */
    /* Try to style the dataframe container, but inner cells are tricky */
    div[data-testid="stDataFrame"] {{
        background-color: {card_bg};
        border: 1px solid {card_border};
        border-radius: 10px;
        padding: 5px;
    }}
    /* Force table text color if possible */
    div[data-testid="stDataFrame"] div {{
        color: {text_primary} !important;
    }}
    
    /* Button overrides */
    button {{
        color: white !important;
    }}

    /* Custom Sidebar */
    [data-testid="stSidebar"] {{
        background-color: {sidebar_bg};
        border-right: 1px solid {card_border};
    }}
    
    /* Buttons */
    .stButton>button {{
        border-radius: 10px;
        background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
        color: white;
        border: none;
        font-weight: bold;
        transition: all 0.2s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }}
    .stButton>button:hover {{
        transform: scale(1.05);
        box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
        color: #ffffff;
    }}
    
    /* Expander */
    .streamlit-expanderHeader {{
        background-color: {card_bg} !important;
        color: {text_primary} !important;
        border-radius: 8px;
    }}
    
    /* Tab Styling */
    .stTabs [data-baseweb="tab-list"] button {{
        color: {text_primary} !important;
        font-weight: 600;
    }}
    .stTabs [data-baseweb="tab-highlight"] {{
        background-color: #4facfe;
    }}
</style>
""", unsafe_allow_html=True)

# ----------------------------
# Main Dashboard Header
# ----------------------------
st.title("🚀 Smart Cafeteria Pro")
st.markdown("#### Intelligent Workplace Dining Management System")

# Stats Grid in Header
today_str = date.today().isoformat()
rev, tips, count = compute_daily_revenue_and_tips(today_str)

c1, c2, c3 = st.columns(3)
with c1:
    st.markdown(f"""
    <div class="metric-card">
        <p style="color: {text_secondary}; font-size: 14px; margin-bottom: 5px;">Today's Orders</p>
        <h2 style="margin: 0;">📦 {count}</h2>
    </div>
    """, unsafe_allow_html=True)
with c2:
    st.markdown(f"""
    <div class="metric-card">
        <p style="color: {text_secondary}; font-size: 14px; margin-bottom: 5px;">Today's Revenue</p>
        <h2 style="margin: 0; color: #2ecc71;">💰 ₹{rev:,.2f}</h2>
    </div>
    """, unsafe_allow_html=True)
with c3:
    st.markdown(f"""
    <div class="metric-card">
        <p style="color: {text_secondary}; font-size: 14px; margin-bottom: 5px;">Today's Tips</p>
        <h2 style="margin: 0; color: #f1c40f;">✨ ₹{tips:,.2f}</h2>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

st.markdown("---")

tab_emp, tab_menu, tab_orders, tab_billing, tab_salary, tab_analytics = st.tabs([
    "📋 Employee Management",
    "🍽️ Cafeteria Menu",
    "🛒 Orders",
    "💳 Wallet & Billing",
    "💰 Salary Management",
    "📊 Analytics",
])


# ----------------------------
# Employee Management
# ----------------------------
with tab_emp:
    st.subheader("📋 Employee Management Panel")
    employees_att = get_employees_with_attendance()

    # Filters
    f1, f2 = st.columns(2)
    with f1:
        role_filter = st.multiselect("Filter by Role", ROLE_OPTIONS, default=ROLE_OPTIONS)
    with f2:
        att_filter = st.multiselect("Filter by Attendance", ATTENDANCE_STATUS, default=ATTENDANCE_STATUS)

    filtered = employees_att[
        employees_att["Role"].isin(role_filter) & employees_att["Attendance"].isin(att_filter)
    ].copy()

    st.dataframe(
        filtered[["Name", "Employee ID", "Role", "Entry", "Exit", "Attendance"]],
        use_container_width=True,
        hide_index=True,
    )

    st.markdown("### 🛠️ Employee Administration")
    admin_mode = st.radio("Management Mode", ["Add New Employee", "Edit Existing Employee"], horizontal=True)
    
    emp_list_for_edit = list_employees()
    
    if admin_mode == "Add New Employee":
        with st.form("add_employee_form", clear_on_submit=True):
            new_name = st.text_input("Name")
            new_eid = st.text_input("Employee ID (e.g. E004)")
            new_role = st.selectbox("Role", ROLE_OPTIONS)
            submitted = st.form_submit_button("➕ Create Employee Record")
            if submitted and new_name.strip() and new_eid.strip():
                upsert_employee(new_name, new_eid, new_role, 0.0)
                st.success(f"Added employee {new_name} ({new_eid}).")
                st.rerun()
    else:
        if not emp_list_for_edit.empty:
            selected_emp_name = st.selectbox("Select Employee to Edit", emp_list_for_edit["name"].tolist())
            emp_to_edit = emp_list_for_edit[emp_list_for_edit["name"] == selected_emp_name].iloc[0]
            
            with st.form("edit_employee_form"):
                edit_name = st.text_input("Name", value=emp_to_edit["name"])
                edit_eid = st.text_input("Employee ID", value=emp_to_edit["employee_id"])
                
                # Find index of current role in ROLE_OPTIONS
                current_role_idx = 0
                if emp_to_edit["role"] in ROLE_OPTIONS:
                    current_role_idx = ROLE_OPTIONS.index(emp_to_edit["role"])
                edit_role = st.selectbox("Role", ROLE_OPTIONS, index=current_role_idx)
                
                submitted = st.form_submit_button("💾 Save Employee Changes")
                if submitted:
                    upsert_employee(edit_name, edit_eid, edit_role, 0.0, internal_id=int(emp_to_edit["id"]))
                    st.success(f"Updated record for {edit_name}.")
                    st.rerun()
        else:
            st.warning("No employees found to edit.")

    st.markdown("### 🕘 Attendance")
    emp_list = list_employees()
    if not emp_list.empty:
        ac1, ac2 = st.columns(2)
        with ac1:
            emp_entry = st.selectbox("Mark Entry for", emp_list["name"].tolist(), key="entry_emp")
            entry_status = st.selectbox("Entry Status", ATTENDANCE_STATUS, index=0, key="entry_status_sel")
            if st.button("Mark Entry"):
                emp_pk = int(emp_list[emp_list["name"] == emp_entry]["id"].iloc[0])
                mark_entry(emp_pk, entry_status)
                st.success(f"Entry marked for {emp_entry} as {entry_status}.")
                st.rerun()
        with ac2:
            emp_exit = st.selectbox("Mark Exit for", emp_list["name"].tolist(), key="exit_emp")
            if st.button("Mark Exit"):
                emp_pk = int(emp_list[emp_list["name"] == emp_exit]["id"].iloc[0])
                mark_exit(emp_pk)
                st.success(f"Exit marked for {emp_exit}.")
                st.rerun()


# ----------------------------
# Cafeteria Menu
# ----------------------------
with tab_menu:
    st.subheader("🍽️ Culinary Inventory")
    
    # Menu Filter
    menu_search = st.text_input("🔍 Search Culinary Options", placeholder="e.g. Salmon, Salad...")
    
    menu_df = list_menu_items()
    if menu_search:
        menu_df = menu_df[menu_df["name"].str.contains(menu_search, case=False)]

    if not menu_df.empty:
        n_cols = 3
        rows_to_render = [menu_df.iloc[i:i+n_cols] for i in range(0, len(menu_df), n_cols)]
        
        for row_set in rows_to_render:
            cols = st.columns(n_cols)
            for i, (_, row) in enumerate(row_set.iterrows()):
                with cols[i]:
                    st.markdown(f"""
                    <div style="background-color: {card_bg}; padding: 15px; border-radius: 12px; border: 1px solid {card_border}; margin-bottom: 20px;">
                        <img src="{row['image_url']}" style="width: 100%; border-radius: 8px; height: 150px; object-fit: cover; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: {text_primary};">{row['name']}</h4>
                        <p style="color: #e67e22; font-weight: bold; margin: 5px 0;">₹{row['price']:.2f}</p>
                        <div style="display: flex; gap: 10px; font-size: 12px; color: {text_secondary};">
                            <span>🔥 {int(row['calories'])} kcal</span>
                            <span>🥩 {row['protein']:.1f}g protein</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                    if st.button(f"🔍 View Details", key=f"details_{row['id']}"):
                        show_item_details(row)
    else:
        st.info("No menu items yet. Add some below.")

    with st.expander("✏️ Administrative: Manage Menu"):
        edit_mode = st.radio("Operation", ["Add New", "Edit Existing"], horizontal=True)
        # ... existing form logic simplified for brevity here, but keep logic
        if edit_mode == "Add New":
            with st.form("add_item_form", clear_on_submit=True):
                name = st.text_input("Item Name")
                c1, c2, c3 = st.columns(3)
                with c1: price = st.number_input("Price (₹)", min_value=0.0, value=5.0)
                with c2: calories = st.number_input("Calories", min_value=0, value=200)
                with c3: protein = st.number_input("Protein (g)", min_value=0.0, value=8.0)
                image_url = st.text_input("Image URL")
                ingredients = st.text_area("Ingredients (JSON or List)", placeholder="e.g. Tomato, Cheese, Basil")
                if st.form_submit_button("🚀 Deploy Item"):
                    upsert_menu_item(-1, name, price, calories, protein, image_url, ingredients)
                    st.success("Item added.")
                    st.rerun()
        else:
            if not menu_df.empty:
                item_name = st.selectbox("Select Target Item", menu_df["name"].tolist())
                row = menu_df[menu_df["name"] == item_name].iloc[0]
                with st.form("edit_item_form"):
                    name = st.text_input("Item Name", value=row["name"])
                    c1, c2, c3 = st.columns(3)
                    with c1: price = st.number_input("Price (₹)", min_value=0.0, value=float(row["price"]))
                    with c2: calories = st.number_input("Calories", min_value=0, value=int(row["calories"]))
                    with c3: protein = st.number_input("Protein (g)", min_value=0.0, value=float(row["protein"]))
                    image_url = st.text_input("Image URL", value=row["image_url"] or "")
                    ingredients = st.text_area("Ingredients", value=row["ingredients"] or "")
                    if st.form_submit_button("💾 Save Updates"):
                        upsert_menu_item(int(row["id"]), name, price, calories, protein, image_url, ingredients)
                        st.success("Updates saved.")
                        st.rerun()


# ----------------------------
# Orders Management
# ----------------------------
with tab_orders:
    st.subheader("🛒 Culinary Transaction Portal")
    
    # Hero Order Section
    o1, o2 = st.columns([1, 1.5])
    
    with o1:
        st.markdown("### ⚡ Quick Buy")
        emp_list = list_employees()
        menu_df = list_menu_items()
        
        if not emp_list.empty and not menu_df.empty:
            selected_items = st.multiselect("Select Items", menu_df["name"].tolist())
            
            # Dynamic quantities & Total Calc
            item_qtys = {}
            current_total = 0.0
            price_map = {row["name"]: row["price"] for _, row in menu_df.iterrows()}
            
            for item in selected_items:
                item_qtys[item] = st.number_input(f"Qty for {item}", min_value=1, max_value=10, value=1, key=f"qty_{item}")
                current_total += price_map[item] * item_qtys[item]
            
            tip_val = st.number_input("Add Tip (₹)", min_value=0.0, step=5.0, value=0.0)
            grand_total = current_total + tip_val
            
            if selected_items:
                st.markdown(f"""
                <div style="background-color: {card_bg}; padding: 15px; border-radius: 10px; border: 1px solid #4facfe; margin: 10px 0;">
                    <h3 style="margin: 0; color: #4facfe;">Total Amount: ₹{grand_total:,.2f}</h3>
                    <p style="font-size: 12px; color: {text_secondary}; margin-top: 5px;">Includes items subtotal + service tip</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.markdown(f"""
                <div style="padding: 10px; border-left: 5px solid #4facfe; background: {card_bg}; margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: bold; color: {text_primary};">💳 Payment Instruction:</p>
                    <p style="margin: 0; color: {text_secondary};">Please complete your payment of <b>₹{grand_total:,.2f}</b> via UPI or Cash at the counter.</p>
                </div>
                """, unsafe_allow_html=True)
            
            if st.button("🔥 Confirm & Pay Now", use_container_width=True):
                # Default to Guest Employee (E999)
                matches = emp_list[emp_list["employee_id"] == "E999"]
                if matches.empty:
                    st.error("System Error: Guest account not found. Please re-init database.")
                elif not selected_items:
                    st.error("Please select at least one item.")
                else:
                    emp_row = matches.iloc[0]
                    success, msg = process_order(int(emp_row["id"]), item_qtys, tip_val)
                    if success:
                        st.success(f"Order processed via QR Payment for {emp_row['name']}!")
                        st.balloons()
                        
                        # Show Download Link for the new order
                        latest_tx = get_transactions_df().iloc[0]
                        pdf_bytes = create_pdf_bill(latest_tx)
                        st.download_button(
                            label="📄 Download Prepaid Bill (PDF)",
                            data=pdf_bytes,
                            file_name=f"bill_{latest_tx['id']}.pdf",
                            mime="application/pdf"
                        )
                    else:
                        st.error(msg)
        else:
            st.warning("Needs employees and menu items to enable ordering.")

    with o2:
        st.markdown("### 🕒 Recent Business Activity")
        tx_df = get_transactions_df()
        
        # Recent Activity

        if not tx_df.empty:
            tx_df_display = tx_df.copy()
            tx_df_display["timestamp"] = pd.to_datetime(tx_df_display["timestamp"]).dt.strftime("%Y-%m-%d %H:%M")
            tx_df_display = tx_df_display.rename(
                columns={
                    "employee_name": "Employee",
                    "items": "Items",
                    "total_cost": "Total (₹)",
                    "tip": "Tip (₹)",
                    "timestamp": "Time",
                    "status": "Status"
                }
            )
            st.dataframe(tx_df_display[["Employee", "Items", "Total (₹)"]], use_container_width=True, hide_index=True)
            
            # Export Logic
            tx_options = {f"Order #{row['id']} - {row['Employee']}": row['id'] for _, row in tx_df_display.head(10).iterrows()}
            
            st.markdown("#### 📄 Export PDF Bill")
            selected_bill_label = st.selectbox("Select Order to Export", list(tx_options.keys()), key="bill_export_sel")
            target_tx = tx_df[tx_df["id"] == tx_options[selected_bill_label]].iloc[0]
            pdf_data = create_pdf_bill(target_tx)
            st.download_button(
                label=f"💾 Download Bill #{target_tx['id']}",
                data=pdf_data,
                file_name=f"bill_{target_tx['id']}.pdf",
                mime="application/pdf",
                key=f"dl_btn_{target_tx['id']}"
            )
        else:
            st.info("No transaction records found.")


# ----------------------------
# Wallet & Billing
# ----------------------------
with tab_billing:
    st.subheader("💳 Wallet & Billing Summary")
    employees_df = list_employees()
    if not employees_df.empty:
        st.markdown("#### Current Wallet Balances")
        st.dataframe(
            employees_df[["name", "employee_id", "role"]].rename(
                columns={"name": "Name", "employee_id": "Employee ID", "role": "Role"}
            ),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.info("No employee records found.")

    st.markdown("---")
    rev, tips, count = compute_daily_revenue_and_tips(get_today_str())
    c1, c2, c3 = st.columns(3)
    c1.metric("Orders Today", f"{count}")
    c2.metric("Revenue Today", f"₹{rev:,.2f}")
    c3.metric("Tips Today", f"₹{tips:,.2f}")


# ----------------------------
# Salary Management
# ----------------------------
with tab_salary:
    st.subheader("💰 Employee Salary & Compensation")
    
    sal_mode = st.radio("Mode", ["Generate Monthly Salary", "Salary History"], horizontal=True)
    
    if sal_mode == "Generate Monthly Salary":
        st.markdown("### 🗓️ Monthly Salary Generation")
        with st.form("salary_gen_form"):
            col1, col2 = st.columns(2)
            current_year = datetime.now().year
            years = [current_year - 1, current_year, current_year + 1]
            months = list(range(1, 13))
            
            with col1:
                sel_year = st.selectbox("Year", years, index=1)
            with col2:
                sel_month = st.selectbox("Month", months, index=datetime.now().month - 1)
                
            submitted = st.form_submit_button("Calculate Salaries")
            
        if submitted:
            month_str = f"{sel_year}-{sel_month:02d}"
            st.markdown(f"#### Preview for {month_str}")
            
            emps = list_employees()
            salary_previews = []
            
            if not emps.empty:
                for _, emp in emps.iterrows():
                    calc = calculate_monthly_salary(int(emp["id"]), month_str)
                    salary_previews.append(calc)
                    
                preview_df = pd.DataFrame(salary_previews)
                if not preview_df.empty:
                    st.dataframe(
                        preview_df[["name", "role", "monthly_salary", "payable_days", "base_salary"]],
                        use_container_width=True
                    )
                    
                    # Store in session state to allow saving in next step if needed, or just save immediately
                    # For simplicity, we can have a button outside functionality, but Streamlit forms reset.
                    # We'll use a session state or just a direct save button if it was outside.
                    # Since we are inside the 'if submitted', we can't easily have another button press without rerun.
                    # So we'll auto-save or provide a separate 'Commit' button that re-calculates?
                    # Better: button "Calculate & Review".
                    
                    # Hack for "Commit" button:
                    # We can't nest buttons.
                    # We'll rely on the user to review.
                    pass
            else:
                 st.warning("No employees found.")
                 
            # To actually Save, we need a button that persists.
            # We will use st.session_state
            st.session_state['last_salary_calc'] = salary_previews
            st.session_state['last_salary_month'] = month_str
            
        if 'last_salary_calc' in st.session_state and st.session_state.get('last_salary_month') == f"{st.session_state.get('last_salary_month', '')}":
             # Show the Clean Commit Button
             st.info(f"Ready to commit {len(st.session_state['last_salary_calc'])} records for {st.session_state['last_salary_month']}")
             if st.button("💾 Save / Commit Salary Records"):
                for rec in st.session_state['last_salary_calc']:
                    existing = get_salary_history(rec["employee_id"], st.session_state['last_salary_month'])
                    rec_id = -1
                    if not existing.empty:
                        rec_id = int(existing.iloc[0]["id"])
                        
                    upsert_salary_record(
                        rec_id, 
                        rec["employee_id"], 
                        st.session_state['last_salary_month'], 
                        None, 
                        "Pending", 
                        rec["base_salary"], 
                        0.0, 
                        0.0, 
                        "", 
                        rec["base_salary"]
                    )
                st.success(f"Salary records for {st.session_state['last_salary_month']} saved successfully!")
                # Clear state
                del st.session_state['last_salary_calc']
                st.rerun()

    else:
        st.markdown("### 📜 Salary History")
        
        # Filters
        f_emp = st.selectbox("Filter by Employee", ["All"] + list_employees()["name"].tolist())
        
        if f_emp != "All":
             emp_id = int(list_employees()[list_employees()["name"] == f_emp].iloc[0]["id"])
             hist_df = get_salary_history(employee_id=emp_id)
        else:
             hist_df = get_salary_history()
             
        if not hist_df.empty:
            # Editable Dataframe for Bonus/Deductions?
            # Or just a view.
            
            st.dataframe(
                hist_df[["month_year", "employee_name", "role", "payable_days", "base_salary", "bonus", "deductions", "total_salary", "status"]],
                use_container_width=True
            )
            
            # Action to Update Status or Edit
            st.markdown("#### ✏️ Edit Record")
            sel_rec_id = st.selectbox("Select Record ID to Edit", hist_df["id"].tolist())
            rec = hist_df[hist_df["id"] == sel_rec_id].iloc[0]
            
            with st.form("edit_salary_form"):
                 st.write(f"Editing: {rec['employee_name']} for {rec['month_year']}")
                 new_bonus = st.number_input("Bonus", value=float(rec["bonus"]))
                 new_deduct = st.number_input("Deductions", value=float(rec["deductions"]))
                 new_reason = st.text_input("Deduction Reason", value=rec["deduction_reason"] or "")
                 new_status = st.selectbox("Status", ["Pending", "Credited"], index=0 if rec["status"] == "Pending" else 1)
                 
                 submit_edit = st.form_submit_button("Update Record")
                 if submit_edit:
                      new_total = float(rec["base_salary"]) + new_bonus - new_deduct
                      c_date = rec["credit_date"]
                      if new_status == "Credited" and not c_date:
                           c_date = datetime.now().isoformat()
                           
                      upsert_salary_record(
                          int(rec["id"]),
                          int(rec["employee_id"]),
                          rec["month_year"],
                          c_date,
                          new_status,
                          float(rec["base_salary"]),
                          new_bonus,
                          new_deduct,
                          new_reason,
                          new_total
                      )
                      st.success("Record updated!")
                      st.rerun()
            
        else:
            st.info("No salary records found.")


# ----------------------------
# Analytics
# ----------------------------
with tab_analytics:
    st.subheader("📊 Consumption & Wellness Business Intelligence")
    
    # Date Picker for Analytics
    session_date = st.date_input("Select Analysis Date", value=date.today())
    
    # Hero Analytics
    emp_list = list_employees()
    if not emp_list.empty:
        s1, s2 = st.columns([1, 2])
        with s1:
            st.markdown("### 🔍 Employee Spotlight")
            sel_emp_name = st.selectbox("Select Talent", emp_list["name"].tolist())
            emp_pk = int(emp_list[emp_list["name"] == sel_emp_name]["id"].iloc[0])
            total_cal, total_pro, detail_df = compute_employee_nutrition_for_day(emp_pk, session_date.isoformat())
            
            st.metric("Daily Calories", f"{total_cal} kcal")
            st.metric("Macro Protein", f"{total_pro:.1f} g")
            
            status_color = "green" if total_cal < 2500 else "orange"
            st.markdown(f"Status: <span style='color: {status_color}; font-weight: bold;'>{'Optimal' if total_cal < 2500 else 'High Consumption'}</span>", unsafe_allow_html=True)

        with s2:
            if not detail_df.empty:
                st.markdown("### 📈 Nutrient Velocity")
                fig = px.bar(detail_df, x="Item", y="Calories", color="Calories", 
                             color_continuous_scale="Viridis", title="Caloric Impact per Choice")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No consumption recorded for this operating cycle.")

    st.markdown("---")
    st.markdown("### 📊 Macro Trends")
    trends = get_daily_trends(days=14)
    if not trends.empty:
        trends["day"] = pd.to_datetime(trends["day"])
        fig1 = px.area(trends, x="day", y="orders", title="Order Velocity (14D)", line_shape="spline")
        fig2 = px.line(trends, x="day", y="revenue", markers=True, title="Revenue Stream (₹)")
        a1, a2 = st.columns(2)
        a1.plotly_chart(fig1, use_container_width=True)
        a2.plotly_chart(fig2, use_container_width=True)
    else:
        st.info("No trend data available yet.")


st.markdown("---")
st.caption("© 2025 Smart Cafeteria — Built with Streamlit 🧡")


