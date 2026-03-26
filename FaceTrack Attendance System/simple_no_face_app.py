import os
import tkinter as tk
from tkinter import ttk, messagebox
import pandas as pd
from datetime import datetime
import json
import bcrypt
import hashlib
from utils import mark_attendance, get_attendance_summary

class SimpleAttendanceApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Simple Attendance System")
        self.root.geometry("800x600")
        
        self.users_file = "users.json"
        self.attendance_file = "attendance.xlsx"
        
        # Initialize users file if it doesn't exist
        if not os.path.exists(self.users_file):
            self._create_default_users()
            
        self.setup_login_ui()
    
    def _create_default_users(self):
        """Create a default users file with an admin account"""
        default_users = {
            "admin": {
                "password": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                "role": "admin"
            }
        }
        with open(self.users_file, 'w') as f:
            json.dump(default_users, f, indent=4)
    
    def setup_login_ui(self):
        # Clear any existing widgets
        for widget in self.root.winfo_children():
            widget.destroy()
            
        # Create login frame
        login_frame = ttk.Frame(self.root, padding=20)
        login_frame.pack(expand=True)
        
        # Title
        ttk.Label(login_frame, text="Attendance System Login", font=("Arial", 16)).pack(pady=10)
        
        # Username
        ttk.Label(login_frame, text="Username:").pack(anchor="w", pady=(10, 0))
        self.username_var = tk.StringVar()
        ttk.Entry(login_frame, textvariable=self.username_var, width=30).pack(pady=(0, 10))
        
        # Password
        ttk.Label(login_frame, text="Password:").pack(anchor="w", pady=(10, 0))
        self.password_var = tk.StringVar()
        ttk.Entry(login_frame, textvariable=self.password_var, show="*", width=30).pack(pady=(0, 10))
        
        # Login button
        ttk.Button(login_frame, text="Login", command=self.login).pack(pady=10)
        
        # Register link
        register_frame = ttk.Frame(login_frame)
        register_frame.pack(fill=tk.X)
        
        ttk.Label(register_frame, text="Don't have an account?").pack(side=tk.LEFT)
        register_link = ttk.Label(register_frame, text="Register", foreground="blue", cursor="hand2")
        register_link.pack(side=tk.LEFT, padx=5)
        register_link.bind("<Button-1>", lambda e: self.show_register())
        
        # Default credentials note
        ttk.Label(login_frame, text="Default: admin / admin123", foreground="gray").pack(pady=(10, 0))
    
    def login(self):
        username = self.username_var.get()
        password = self.password_var.get()
        
        if not username or not password:
            messagebox.showerror("Error", "Please enter both username and password")
            return
        
        # Load users
        try:
            with open(self.users_file, 'r') as f:
                users = json.load(f)
        except:
            messagebox.showerror("Error", "Could not load users file")
            return
        
        # Validate credentials
        if username in users:
            # Hash the entered password for comparison
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            stored_password = users[username]["password"]
            
            if hashed_password == stored_password:
                self.setup_main_ui(username)
                messagebox.showinfo("Login Successful", f"Welcome {username}!")
            else:
                messagebox.showerror("Error", "Invalid password")
        else:
            messagebox.showerror("Error", "Username not found")
            
    def show_register(self):
        """Show registration window"""
        register_window = tk.Toplevel(self.root)
        register_window.title("Register New User")
        register_window.geometry("400x300")
        register_window.transient(self.root)
        register_window.grab_set()
        
        # Create main frame
        main_frame = ttk.Frame(register_window, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        ttk.Label(main_frame, text="Register New User", font=("Arial", 16)).pack(pady=10)
        
        # Username
        ttk.Label(main_frame, text="Username:").pack(anchor="w", pady=(10, 0))
        reg_username_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=reg_username_var, width=30).pack(pady=(0, 10))
        
        # Password
        ttk.Label(main_frame, text="Password:").pack(anchor="w", pady=(10, 0))
        reg_password_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=reg_password_var, show="*", width=30).pack(pady=(0, 10))
        
        # Confirm Password
        ttk.Label(main_frame, text="Confirm Password:").pack(anchor="w", pady=(10, 0))
        reg_confirm_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=reg_confirm_var, show="*", width=30).pack(pady=(0, 10))
        
        # Register function
        def register():
            username = reg_username_var.get().strip()
            password = reg_password_var.get()
            confirm = reg_confirm_var.get()
            
            if not username or not password or not confirm:
                messagebox.showerror("Error", "Please fill all fields", parent=register_window)
                return
            
            if password != confirm:
                messagebox.showerror("Error", "Passwords do not match", parent=register_window)
                return
            
            # Load users
            try:
                with open(self.users_file, 'r') as f:
                    users = json.load(f)
            except:
                messagebox.showerror("Error", "Could not load users file", parent=register_window)
                return
            
            if username in users:
                messagebox.showerror("Error", "Username already exists", parent=register_window)
                return
            
            # Add new user
            users[username] = {
                "password": hashlib.sha256(password.encode()).hexdigest(),
                "role": "user"
            }
            
            # Save users
            try:
                with open(self.users_file, 'w') as f:
                    json.dump(users, f, indent=4)
                messagebox.showinfo("Success", "Registration successful! You can now login.", parent=register_window)
                register_window.destroy()
            except:
                messagebox.showerror("Error", "Failed to save user data", parent=register_window)
        
        # Register button
        ttk.Button(main_frame, text="Register", command=register).pack(pady=20)
    
    def setup_main_ui(self, username):
        # Clear login UI
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Create main frame
        main_frame = ttk.Frame(self.root, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header frame with welcome message and logout button
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill=tk.X, pady=10)
        
        # Welcome message
        ttk.Label(header_frame, text=f"Welcome, {username}!", font=("Arial", 16)).pack(side=tk.LEFT, pady=10)
        
        # Logout button
        ttk.Button(header_frame, text="Logout", command=self.logout).pack(side=tk.RIGHT)
        
        # Create notebook for tabs
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Tab 1: Attendance marking
        attendance_tab = ttk.Frame(notebook)
        notebook.add(attendance_tab, text="Mark Attendance")
        
        # Tab 2: Student Registration
        registration_tab = ttk.Frame(notebook)
        notebook.add(registration_tab, text="Student Registration")
        
        # === Attendance Tab ===
        # Attendance section
        attendance_frame = ttk.LabelFrame(attendance_tab, text="Mark Attendance", padding=10)
        attendance_frame.pack(fill=tk.X, pady=10)
        
        # Student name entry
        ttk.Label(attendance_frame, text="Student Name:").pack(anchor="w", pady=(5, 0))
        self.student_name_var = tk.StringVar()
        ttk.Entry(attendance_frame, textvariable=self.student_name_var, width=30).pack(pady=(0, 10))
        
        # Mark attendance button
        ttk.Button(attendance_frame, text="Mark Attendance", 
                  command=self.mark_student_attendance).pack(pady=5)
        
        # Attendance records
        records_frame = ttk.LabelFrame(attendance_tab, text="Attendance Records", padding=10)
        records_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Date filter frame
        filter_frame = ttk.Frame(records_frame)
        filter_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Date filter
        ttk.Label(filter_frame, text="Filter by date:").pack(side=tk.LEFT, padx=(0, 5))
        
        # Date entry (format: YYYY-MM-DD)
        self.date_filter_var = tk.StringVar()
        date_entry = ttk.Entry(filter_frame, textvariable=self.date_filter_var, width=12)
        date_entry.pack(side=tk.LEFT, padx=(0, 5))
        
        # Today's date button
        def set_today():
            self.date_filter_var.set(datetime.now().strftime("%Y-%m-%d"))
        
        ttk.Button(filter_frame, text="Today", command=set_today).pack(side=tk.LEFT, padx=(0, 5))
        
        # Apply filter button
        ttk.Button(filter_frame, text="Apply Filter", 
                  command=self.load_attendance_records).pack(side=tk.LEFT, padx=(0, 5))
        
        # Clear filter button
        def clear_filter():
            self.date_filter_var.set("")
            self.load_attendance_records()
            
        ttk.Button(filter_frame, text="Clear Filter", 
                  command=clear_filter).pack(side=tk.LEFT)
        
        # Create treeview for attendance records
        columns = ("name", "date", "time")
        self.records_tree = ttk.Treeview(records_frame, columns=columns, show="headings")
        
        # Define headings
        self.records_tree.heading("name", text="Name")
        self.records_tree.heading("date", text="Date")
        self.records_tree.heading("time", text="Time")
        
        # Column widths
        self.records_tree.column("name", width=150)
        self.records_tree.column("date", width=100)
        self.records_tree.column("time", width=100)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(records_frame, orient=tk.VERTICAL, command=self.records_tree.yview)
        self.records_tree.configure(yscroll=scrollbar.set)
        
        # Pack treeview and scrollbar
        self.records_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Button frame for record actions
        button_frame = ttk.Frame(records_frame)
        button_frame.pack(pady=10, fill=tk.X)
        
        # Refresh button
        ttk.Button(button_frame, text="Refresh Records", 
                  command=self.load_attendance_records).pack(side=tk.LEFT, padx=5)
        
        # Export button
        ttk.Button(button_frame, text="Export to CSV", 
                  command=self.export_attendance).pack(side=tk.LEFT, padx=5)
        
        # === Registration Tab ===
        # Registration frame
        reg_frame = ttk.LabelFrame(registration_tab, text="Register New Student", padding=10)
        reg_frame.pack(fill=tk.X, pady=10)
        
        # Student ID
        ttk.Label(reg_frame, text="Student ID:").pack(anchor=tk.W, pady=(5, 0))
        self.student_id_var = tk.StringVar()
        ttk.Entry(reg_frame, textvariable=self.student_id_var, width=30).pack(pady=(0, 10))
        
        # Student Name
        ttk.Label(reg_frame, text="Full Name:").pack(anchor=tk.W, pady=(5, 0))
        self.reg_student_name_var = tk.StringVar()
        ttk.Entry(reg_frame, textvariable=self.reg_student_name_var, width=30).pack(pady=(0, 10))
        
        # Register button
        ttk.Button(reg_frame, text="Register Student", 
                  command=self.register_student).pack(pady=5)
                  
        # Student List frame
        list_frame = ttk.LabelFrame(registration_tab, text="Student List", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Create treeview for student list
        columns = ("ID", "Name", "Registration Date")
        self.students_tree = ttk.Treeview(list_frame, columns=columns, show="headings")
        
        # Set column headings
        for col in columns:
            self.students_tree.heading(col, text=col)
            self.students_tree.column(col, width=100)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.students_tree.yview)
        self.students_tree.configure(yscroll=scrollbar.set)
        self.students_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add right-click context menu
        self.context_menu = tk.Menu(self.students_tree, tearoff=0)
        self.context_menu.add_command(label="Edit Student", command=self.edit_student)
        self.context_menu.add_command(label="Delete Student", command=self.delete_student)
        
        # Bind right-click to show context menu
        self.students_tree.bind("<Button-3>", self.show_context_menu)
        
        # Button frame
        button_frame = ttk.Frame(list_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        # Search frame
        search_frame = ttk.Frame(button_frame)
        search_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        ttk.Label(search_frame, text="Search:").pack(side=tk.LEFT, padx=(0, 5))
        self.search_var = tk.StringVar()
        ttk.Entry(search_frame, textvariable=self.search_var, width=20).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(search_frame, text="Search", command=self.search_students).pack(side=tk.LEFT, padx=(0, 5))
        
        # Refresh button
        ttk.Button(button_frame, text="Refresh List", 
                  command=self.load_student_list).pack(side=tk.RIGHT)
                  
        # Load student list on startup
        self.load_student_list()
        
        # Logout button
        ttk.Button(main_frame, text="Logout", command=self.setup_login_ui).pack(pady=10)
        
        # Load initial records
        self.load_attendance_records()
    
    def mark_student_attendance(self):
        name = self.student_name_var.get()
        if not name:
            messagebox.showerror("Error", "Please enter a student name")
            return
        
        # Mark attendance
        mark_attendance(name, self.attendance_file)
        messagebox.showinfo("Success", f"Attendance marked for {name}")
        
        # Clear entry and refresh records
        self.student_name_var.set("")
        self.load_attendance_records()
    
    def load_attendance_records(self):
        # Clear existing records
        for item in self.records_tree.get_children():
            self.records_tree.delete(item)
        
        # Load attendance data
        try:
            if os.path.exists(self.attendance_file):
                df = pd.read_excel(self.attendance_file)
                
                # Apply date filter if specified
                date_filter = self.date_filter_var.get().strip()
                if date_filter:
                    df = df[df['Date'] == date_filter]
                    
                # Display filtered records
                if df.empty:
                    messagebox.showinfo("Info", "No records found for the selected date")
                else:
                    for _, row in df.iterrows():
                        self.records_tree.insert("", tk.END, values=(row['Name'], row['Date'], row['Time']))
            else:
                messagebox.showinfo("Info", "No attendance records found")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load attendance records: {str(e)}")
            
    def export_attendance(self):
        """Export attendance records to CSV file"""
        try:
            if os.path.exists(self.attendance_file):
                # Read the Excel file
                df = pd.read_excel(self.attendance_file)
                
                # Create export filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                export_file = f"attendance_export_{timestamp}.csv"
                
                # Export to CSV
                df.to_csv(export_file, index=False)
                
                # Show success message with file path
                messagebox.showinfo("Export Successful", 
                                   f"Attendance records exported to:\n{export_file}")
            else:
                messagebox.showwarning("Warning", "No attendance records found to export.")
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export records: {str(e)}")
            
    def register_student(self):
        """Register a new student"""
        student_id = self.student_id_var.get().strip()
        student_name = self.reg_student_name_var.get().strip()
        
        # Validate inputs
        if not student_id or not student_name:
            messagebox.showerror("Error", "Student ID and Name are required")
            return
            
        try:
            # Create students directory if it doesn't exist
            students_dir = "students"
            if not os.path.exists(students_dir):
                os.makedirs(students_dir)
                
            # Create or load students database
            students_file = os.path.join(students_dir, "students.json")
            students_data = {}
            
            if os.path.exists(students_file):
                with open(students_file, 'r') as f:
                    students_data = json.load(f)
                    
            # Check if student ID already exists
            if student_id in students_data:
                messagebox.showerror("Error", f"Student ID {student_id} already exists")
                return
                
            # Add new student
            students_data[student_id] = {
                "name": student_name,
                "registered_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Save updated data
            with open(students_file, 'w') as f:
                json.dump(students_data, f, indent=4)
                
            # Clear form fields
            self.student_id_var.set("")
            self.reg_student_name_var.set("")
            
            # Refresh student list
            self.load_student_list()
            
            # Show success message
            messagebox.showinfo("Success", f"Student {student_name} registered successfully")
            
        except Exception as e:
            messagebox.showerror("Registration Error", f"Failed to register student: {str(e)}")
            
    def load_student_list(self):
        """Load and display the list of registered students"""
        # Clear existing records
        for item in self.students_tree.get_children():
            self.students_tree.delete(item)
        
        try:
            # Path to students database
            students_file = os.path.join("students", "students.json")
            
            # Check if file exists
            if os.path.exists(students_file):
                # Load student data
                with open(students_file, 'r') as f:
                    students_data = json.load(f)
                
                # Display students in treeview
                for student_id, data in students_data.items():
                    self.students_tree.insert("", tk.END, values=(
                        student_id,
                        data.get("name", "Unknown"),
                        data.get("registered_date", "Unknown")
                    ))
            else:
                messagebox.showinfo("Info", "No students registered yet")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load student list: {str(e)}")
            
    def search_students(self):
        """Search for students by ID or name"""
        search_term = self.search_var.get().strip().lower()
        
        if not search_term:
            # If search term is empty, just reload the full list
            self.load_student_list()
            return
            
        try:
            # Clear existing records
            for item in self.students_tree.get_children():
                self.students_tree.delete(item)
                
            # Path to students database
            students_file = os.path.join("students", "students.json")
            
            # Check if file exists
            if os.path.exists(students_file):
                # Load student data
                with open(students_file, 'r') as f:
                    students_data = json.load(f)
                
                # Filter and display matching students
                found = False
                for student_id, data in students_data.items():
                    # Search in ID and name
                    if (search_term in student_id.lower() or 
                        search_term in data.get("name", "").lower()):
                        self.students_tree.insert("", tk.END, values=(
                            student_id,
                            data.get("name", "Unknown"),
                            data.get("registered_date", "Unknown")
                        ))
                        found = True
                
                if not found:
                    messagebox.showinfo("Search Results", "No matching students found")
            else:
                messagebox.showinfo("Info", "No students registered yet")
        except Exception as e:
            messagebox.showerror("Search Error", f"Error during search: {str(e)}")
            
    def show_context_menu(self, event):
        """Show context menu on right-click"""
        # Get the item that was clicked on
        item = self.students_tree.identify_row(event.y)
        if item:
            # Select the item
            self.students_tree.selection_set(item)
            # Show context menu
            self.context_menu.post(event.x_root, event.y_root)
            
    def logout(self):
        """Log out the current user and return to login screen"""
        if messagebox.askyesno("Logout", "Are you sure you want to logout?"):
            self.setup_login_ui()
            messagebox.showinfo("Logout", "You have been logged out successfully")
            
    def edit_student(self):
        """Edit selected student"""
        # Get selected item
        selected = self.students_tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a student to edit")
            return
            
        # Get student ID from selected item
        student_id = self.students_tree.item(selected[0], 'values')[0]
        
        try:
            # Path to students database
            students_file = os.path.join("students", "students.json")
            
            # Load student data
            with open(students_file, 'r') as f:
                students_data = json.load(f)
                
            # Check if student exists
            if student_id not in students_data:
                messagebox.showerror("Error", f"Student ID {student_id} not found")
                return
                
            # Get current student data
            student_data = students_data[student_id]
            
            # Create edit dialog
            edit_window = tk.Toplevel(self.root)
            edit_window.title("Edit Student")
            edit_window.geometry("300x150")
            edit_window.resizable(False, False)
            
            # Center window
            edit_window.update_idletasks()
            width = edit_window.winfo_width()
            height = edit_window.winfo_height()
            x = (edit_window.winfo_screenwidth() // 2) - (width // 2)
            y = (edit_window.winfo_screenheight() // 2) - (height // 2)
            edit_window.geometry(f"{width}x{height}+{x}+{y}")
            
            # Make dialog modal
            edit_window.transient(self.root)
            edit_window.grab_set()
            
            # Student ID (readonly)
            ttk.Label(edit_window, text="Student ID:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
            ttk.Label(edit_window, text=student_id).grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
            
            # Student Name
            ttk.Label(edit_window, text="Name:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
            name_var = tk.StringVar(value=student_data.get("name", ""))
            ttk.Entry(edit_window, textvariable=name_var).grid(row=1, column=1, padx=5, pady=5, sticky=tk.W)
            
            # Save button
            def save_changes():
                new_name = name_var.get().strip()
                if not new_name:
                    messagebox.showerror("Error", "Name cannot be empty")
                    return
                    
                # Update student data
                students_data[student_id]["name"] = new_name
                
                # Save updated data
                with open(students_file, 'w') as f:
                    json.dump(students_data, f, indent=4)
                    
                # Close dialog
                edit_window.destroy()
                
                # Refresh student list
                self.load_student_list()
                
                # Show success message
                messagebox.showinfo("Success", f"Student {student_id} updated successfully")
                
            ttk.Button(edit_window, text="Save", command=save_changes).grid(row=2, column=0, padx=5, pady=10)
            ttk.Button(edit_window, text="Cancel", command=edit_window.destroy).grid(row=2, column=1, padx=5, pady=10)
            
            # Wait for dialog to close
            self.root.wait_window(edit_window)
            
        except Exception as e:
            messagebox.showerror("Edit Error", f"Error editing student: {str(e)}")
            
    def delete_student(self):
        """Delete selected student"""
        # Get selected item
        selected = self.students_tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Please select a student to delete")
            return
            
        # Get student ID from selected item
        student_id = self.students_tree.item(selected[0], 'values')[0]
        
        # Confirm deletion
        if not messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete student {student_id}?"):
            return
            
        try:
            # Path to students database
            students_file = os.path.join("students", "students.json")
            
            # Load student data
            with open(students_file, 'r') as f:
                students_data = json.load(f)
                
            # Check if student exists
            if student_id not in students_data:
                messagebox.showerror("Error", f"Student ID {student_id} not found")
                return
                
            # Delete student
            del students_data[student_id]
            
            # Save updated data
            with open(students_file, 'w') as f:
                json.dump(students_data, f, indent=4)
                
            # Refresh student list
            self.load_student_list()
            
            # Show success message
            messagebox.showinfo("Success", f"Student {student_id} deleted successfully")
            
        except Exception as e:
            messagebox.showerror("Delete Error", f"Error deleting student: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = SimpleAttendanceApp(root)
    root.mainloop()