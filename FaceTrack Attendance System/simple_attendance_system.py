import os
import tkinter as tk
from tkinter import ttk, messagebox, Frame
import cv2
import numpy as np
from PIL import Image, ImageTk
from datetime import datetime
import threading
import time
import json
import pandas as pd
import hashlib

class SimpleAttendanceSystem:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.known_faces_dir = "known_faces"
        self.attendance_file = "attendance.xlsx"
        self.camera_active = False
        self.video_capture = None
        self.current_frame = None
        self.recognition_active = False
        self.recognition_thread = None
        self.last_attendance_time = {}  # To prevent duplicate entries in short time
        
        # Setup UI
        self._setup_ui()
    
    def _setup_ui(self):
        """Set up the main UI"""
        self.root.title("Simple Attendance System")
        self.root.geometry("1000x600")
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)
        
        # Create main frames
        left_frame = ttk.Frame(self.root, padding="10")
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        right_frame = ttk.Frame(self.root, padding="10")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=False, padx=10)
        
        # Video frame (left side)
        video_container = ttk.LabelFrame(left_frame, text="Camera Feed", padding="10")
        video_container.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.video_label = ttk.Label(video_container)
        self.video_label.pack(fill=tk.BOTH, expand=True)
        
        # Control buttons
        control_frame = ttk.Frame(left_frame)
        control_frame.pack(fill=tk.X, pady=10)
        
        self.camera_btn = ttk.Button(control_frame, text="Start Camera", command=self._toggle_camera)
        self.camera_btn.pack(side=tk.LEFT, padx=5)
        
        self.mark_attendance_btn = ttk.Button(control_frame, text="Mark Attendance", 
                                         command=self._mark_attendance, state=tk.DISABLED)
        self.mark_attendance_btn.pack(side=tk.LEFT, padx=5)
        
        # Right side - Attendance info and controls
        # User info
        user_frame = ttk.LabelFrame(right_frame, text="User Information", padding="10")
        user_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(user_frame, text=f"Logged in as: {self.username}").pack(anchor=tk.W)
        
        logout_btn = ttk.Button(user_frame, text="Logout", command=self._logout)
        logout_btn.pack(anchor=tk.W, pady=5)
        
        # Manual attendance entry
        manual_frame = ttk.LabelFrame(right_frame, text="Manual Attendance", padding="10")
        manual_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(manual_frame, text="Student Name:").pack(anchor=tk.W)
        self.student_name_var = tk.StringVar()
        ttk.Entry(manual_frame, textvariable=self.student_name_var).pack(fill=tk.X, pady=5)
        
        ttk.Button(manual_frame, text="Mark Attendance", 
                  command=lambda: self._manual_mark_attendance(self.student_name_var.get())).pack(anchor=tk.W)
        
        # Attendance summary
        self.summary_frame = ttk.LabelFrame(right_frame, text="Attendance Summary", padding="10")
        self.summary_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self._update_attendance_summary()
    
    def _update_attendance_summary(self):
        """Update the attendance summary display"""
        # Clear existing widgets
        for widget in self.summary_frame.winfo_children():
            widget.destroy()
        
        # Get attendance summary
        summary = self._get_attendance_summary()
        
        if summary["total_records"] == 0:
            ttk.Label(self.summary_frame, text="No attendance records yet.").pack(anchor=tk.W)
            return
        
        # Display summary
        ttk.Label(self.summary_frame, text=f"Total records: {summary['total_records']}").pack(anchor=tk.W)
        ttk.Label(self.summary_frame, text=f"Unique people: {summary['unique_people']}").pack(anchor=tk.W)
        ttk.Label(self.summary_frame, text=f"Unique dates: {summary['dates']}").pack(anchor=tk.W)
        
        # Recent records
        ttk.Label(self.summary_frame, text="\nRecent Records:", font=("Arial", 10, "bold")).pack(anchor=tk.W, pady=(10, 5))
        
        # Create treeview for recent records
        columns = ("Name", "Date", "Time")
        tree = ttk.Treeview(self.summary_frame, columns=columns, show="headings", height=5)
        
        # Define headings
        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, width=80)
        
        # Add data
        for record in summary["recent_records"]:
            tree.insert("", tk.END, values=(record["Name"], record["Date"], record["Time"]))
        
        tree.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Refresh button
        ttk.Button(self.summary_frame, text="Refresh", command=self._update_attendance_summary).pack(anchor=tk.E)
    
    def _get_attendance_summary(self):
        """Generate a summary of attendance from the Excel file"""
        if not os.path.exists(self.attendance_file):
            return {"total_records": 0, "unique_people": 0, "dates": 0, "recent_records": []}
        
        try:
            df = pd.read_excel(self.attendance_file)
            
            summary = {
                "total_records": len(df),
                "unique_people": df["Name"].nunique(),
                "dates": df["Date"].nunique(),
                "recent_records": df.tail(5).to_dict('records')
            }
            
            return summary
        except Exception as e:
            print(f"Error reading attendance file: {str(e)}")
            return {"total_records": 0, "unique_people": 0, "dates": 0, "recent_records": []}
    
    def _toggle_camera(self):
        """Toggle camera on/off"""
        if self.camera_active:
            self._stop_camera()
            self.camera_btn.config(text="Start Camera")
            self.mark_attendance_btn.config(state=tk.DISABLED)
        else:
            if self._start_camera():
                self.camera_btn.config(text="Stop Camera")
                self.mark_attendance_btn.config(state=tk.NORMAL)
    
    def _start_camera(self):
        """Start the camera feed"""
        try:
            # Try multiple camera indices
            for camera_index in range(3):  # Try indices 0, 1, 2
                self.video_capture = cv2.VideoCapture(camera_index)
                if self.video_capture.isOpened():
                    # Successfully opened camera
                    self.camera_active = True
                    self._update_frame()
                    return True
            
            # If we get here, no camera was found
            messagebox.showerror("Error", "Could not open any camera. Please check your camera connection.")
            return False
        except Exception as e:
            messagebox.showerror("Error", f"Error starting camera: {str(e)}")
            return False
    
    def _stop_camera(self):
        """Stop the camera feed"""
        self.camera_active = False
        
        if self.video_capture is not None:
            self.video_capture.release()
            self.video_capture = None
    
    def _update_frame(self):
        """Update the video frame"""
        if self.camera_active and self.video_capture is not None:
            ret, frame = self.video_capture.read()
            if ret:
                # Convert to RGB for display
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Save current frame
                self.current_frame = frame_rgb.copy()
                
                # Draw a rectangle in the center for face positioning
                h, w = frame_rgb.shape[:2]
                center_x, center_y = w // 2, h // 2
                rect_size = min(w, h) // 3
                
                cv2.rectangle(frame_rgb, 
                             (center_x - rect_size, center_y - rect_size),
                             (center_x + rect_size, center_y + rect_size),
                             (0, 255, 0), 2)
                
                # Convert to ImageTk format
                img = Image.fromarray(frame_rgb)
                imgtk = ImageTk.PhotoImage(image=img)
                
                # Update the label
                self.video_label.imgtk = imgtk
                self.video_label.configure(image=imgtk)
            
            # Schedule the next update
            self.root.after(10, self._update_frame)
    
    def _mark_attendance(self):
        """Mark attendance using the current frame"""
        if self.current_frame is not None:
            # In a real system, this would use face recognition
            # For this simplified version, we'll just ask for the name
            name = simpledialog.askstring("Attendance", "Enter student name:")
            if name:
                self._manual_mark_attendance(name)
        else:
            messagebox.showerror("Error", "No camera frame available")
    
    def _manual_mark_attendance(self, name):
        """Manually mark attendance for a given name"""
        if not name:
            messagebox.showerror("Error", "Please enter a name")
            return
        
        now = datetime.now()
        date = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        
        # Create Excel file if it doesn't exist
        if not os.path.exists(self.attendance_file):
            df = pd.DataFrame(columns=["Name", "Date", "Time"])
            df.to_excel(self.attendance_file, index=False)
        
        try:
            # Read existing attendance data
            df = pd.read_excel(self.attendance_file)
            
            # Check if person already marked attendance today
            same_day_records = df[(df["Name"] == name) & (df["Date"] == date)]
            if not same_day_records.empty:
                messagebox.showinfo("Info", f"{name} already marked attendance today")
                return
            
            # Add new attendance record
            new_record = pd.DataFrame({"Name": [name], "Date": [date], "Time": [time_str]})
            df = pd.concat([df, new_record], ignore_index=True)
            
            # Save updated attendance data
            df.to_excel(self.attendance_file, index=False)
            messagebox.showinfo("Success", f"Attendance marked for {name}")
            
            # Update attendance summary
            self._update_attendance_summary()
        except Exception as e:
            messagebox.showerror("Error", f"Error marking attendance: {str(e)}")
    
    def _logout(self):
        """Logout and return to login screen"""
        if self.camera_active:
            self._stop_camera()
        
        self.root.destroy()
        # The login window will be shown again by the main script
    
    def _on_close(self):
        """Handle window close event"""
        if self.camera_active:
            self._stop_camera()
        self.root.destroy()

class SimpleLoginSystem:
    def __init__(self, root, on_login_success):
        self.root = root
        self.on_login_success = on_login_success
        self.users_file = "users.json"
        self.current_user = None
        self.session_active = False
        
        # Initialize users file if it doesn't exist
        if not os.path.exists(self.users_file):
            self._create_default_users()
        
        self._setup_ui()
    
    def _create_default_users(self):
        """Create a default users file with an admin account"""
        default_users = {
            "admin": {
                "password": self._hash_password("admin123"),
                "role": "admin"
            }
        }
        with open(self.users_file, 'w') as f:
            json.dump(default_users, f, indent=4)
    
    def _hash_password(self, password):
        """Simple password hashing using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _setup_ui(self):
        """Set up the login UI"""
        self.root.title("Simple Attendance System - Login")
        self.root.geometry("400x300")
        self.root.resizable(False, False)
        
        # Center the window
        self.root.geometry("+%d+%d" % (self.root.winfo_screenwidth()/2 - 200, 
                                      self.root.winfo_screenheight()/2 - 150))
        
        # Create a frame with padding
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, text="Login Authentication", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # Username
        username_frame = ttk.Frame(main_frame)
        username_frame.pack(fill=tk.X, pady=5)
        
        username_label = ttk.Label(username_frame, text="Username:", width=10)
        username_label.pack(side=tk.LEFT, padx=5)
        
        self.username_var = tk.StringVar()
        username_entry = ttk.Entry(username_frame, textvariable=self.username_var)
        username_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Password
        password_frame = ttk.Frame(main_frame)
        password_frame.pack(fill=tk.X, pady=5)
        
        password_label = ttk.Label(password_frame, text="Password:", width=10)
        password_label.pack(side=tk.LEFT, padx=5)
        
        self.password_var = tk.StringVar()
        password_entry = ttk.Entry(password_frame, textvariable=self.password_var, show="*")
        password_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Login button
        login_button = ttk.Button(main_frame, text="Login", command=self._login)
        login_button.pack(pady=20)
        
        # Register link
        register_frame = ttk.Frame(main_frame)
        register_frame.pack(fill=tk.X)
        
        register_label = ttk.Label(register_frame, text="Don't have an account?")
        register_label.pack(side=tk.LEFT)
        
        register_link = ttk.Label(register_frame, text="Register", foreground="blue", cursor="hand2")
        register_link.pack(side=tk.LEFT, padx=5)
        register_link.bind("<Button-1>", lambda e: self._show_register())
        
        # Set focus to username entry
        username_entry.focus()
        
        # Bind Enter key to login
        self.root.bind("<Return>", lambda e: self._login())
    
    def _login(self):
        """Validate login credentials and proceed if valid"""
        username = self.username_var.get().strip()
        password = self.password_var.get()
        
        if not username or not password:
            messagebox.showerror("Error", "Please enter both username and password")
            return
        
        # Load users
        with open(self.users_file, 'r') as f:
            users = json.load(f)
        
        if username in users:
            stored_hash = users[username]["password"]
            if stored_hash == self._hash_password(password):
                self.current_user = username
                self.session_active = True
                messagebox.showinfo("Success", f"Welcome, {username}!")
                self.root.withdraw()  # Hide login window
                self.on_login_success(username)  # Call the success callback
            else:
                messagebox.showerror("Error", "Invalid password")
        else:
            messagebox.showerror("Error", "Username not found")
    
    def _show_register(self):
        """Show registration window"""
        register_window = tk.Toplevel(self.root)
        register_window.title("Register New User")
        register_window.geometry("400x300")
        register_window.resizable(False, False)
        register_window.transient(self.root)
        register_window.grab_set()
        
        # Center the window
        register_window.geometry("+%d+%d" % (register_window.winfo_screenwidth()/2 - 200, 
                                           register_window.winfo_screenheight()/2 - 150))
        
        # Create a frame with padding
        main_frame = ttk.Frame(register_window, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, text="Register New User", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # Username
        username_frame = ttk.Frame(main_frame)
        username_frame.pack(fill=tk.X, pady=5)
        
        username_label = ttk.Label(username_frame, text="Username:", width=12)
        username_label.pack(side=tk.LEFT, padx=5)
        
        reg_username_var = tk.StringVar()
        username_entry = ttk.Entry(username_frame, textvariable=reg_username_var)
        username_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Password
        password_frame = ttk.Frame(main_frame)
        password_frame.pack(fill=tk.X, pady=5)
        
        password_label = ttk.Label(password_frame, text="Password:", width=12)
        password_label.pack(side=tk.LEFT, padx=5)
        
        reg_password_var = tk.StringVar()
        password_entry = ttk.Entry(password_frame, textvariable=reg_password_var, show="*")
        password_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Confirm Password
        confirm_frame = ttk.Frame(main_frame)
        confirm_frame.pack(fill=tk.X, pady=5)
        
        confirm_label = ttk.Label(confirm_frame, text="Confirm Pass:", width=12)
        confirm_label.pack(side=tk.LEFT, padx=5)
        
        reg_confirm_var = tk.StringVar()
        confirm_entry = ttk.Entry(confirm_frame, textvariable=reg_confirm_var, show="*")
        confirm_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Register button
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
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            if username in users:
                messagebox.showerror("Error", "Username already exists", parent=register_window)
                return
            
            # Add new user
            users[username] = {
                "password": self._hash_password(password),
                "role": "user"
            }
            
            # Save users
            with open(self.users_file, 'w') as f:
                json.dump(users, f, indent=4)
            
            messagebox.showinfo("Success", "Registration successful! You can now login.", parent=register_window)
            register_window.destroy()
        
        register_button = ttk.Button(main_frame, text="Register", command=register)
        register_button.pack(pady=20)
        
        # Set focus to username entry
        username_entry.focus()
    
    def logout(self):
        """Log out the current user"""
        if self.session_active:
            self.current_user = None
            self.session_active = False
            self.root.deiconify()  # Show login window again
            # Clear login fields
            self.username_var.set("")
            self.password_var.set("")
            return True
        return False

# Import for dialog
from tkinter import simpledialog

def main():
    # Create the main window but don't show it yet
    main_window = tk.Tk()
    main_window.withdraw()
    
    # Create login window
    login_window = tk.Toplevel(main_window)
    
    def on_login_success(username):
        # Close login window and show main window
        login_window.destroy()
        main_window.deiconify()
        
        # Start attendance system
        app = SimpleAttendanceSystem(main_window, username)
    
    # Initialize login system
    login_system = SimpleLoginSystem(login_window, on_login_success)
    
    # Start the main loop
    main_window.mainloop()

if __name__ == "__main__":
    main()