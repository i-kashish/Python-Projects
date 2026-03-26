import tkinter as tk
from tkinter import messagebox, ttk
import json
import os
from utils import hash_password, verify_password

class LoginSystem:
    def __init__(self, root, on_login_success):
        self.root = root
        self.on_login_success = on_login_success
        self.users_file = "users.json"
        
        # Initialize users file if it doesn't exist
        if not os.path.exists(self.users_file):
            self._create_default_users()
        
        self._apply_styles()
        self._setup_ui()
    
    def _create_default_users(self):
        """Create a default users file with an admin account"""
        default_users = {
            "admin": {
                "password": hash_password("admin123").decode('utf-8'),
                "role": "admin"
            }
        }
        with open(self.users_file, 'w') as f:
            json.dump(default_users, f, indent=4)

    def _apply_styles(self):
        """Apply modern theme using ttk.Style"""
        self.style = ttk.Style()
        # Use a premium color palette
        self.colors = {
            "primary": "#6366f1",
            "bg": "#f8fafc",
            "text": "#1e293b",
            "secondary": "#64748b"
        }
        
        self.style.configure("TFrame", background=self.colors["bg"])
        self.style.configure("TLabel", background=self.colors["bg"], foreground=self.colors["text"], font=("Segoe UI", 10))
        self.style.configure("Header.TLabel", font=("Segoe UI", 18, "bold"), foreground=self.colors["primary"])
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), padding=10)
        self.style.configure("Login.TButton", background=self.colors["primary"], foreground="white")
        
        # Entry styling for focused look (if supported by theme)
        self.style.map("Login.TButton",
            foreground=[('active', 'white')],
            background=[('active', '#4f46e5')]
        )

    def _setup_ui(self):
        """Set up the login UI"""
        self.root.title("Kiosk Login")
        self.root.geometry("450x400")
        self.root.config(bg=self.colors["bg"])
        self.root.resizable(False, False)
        
        # Center the window
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        # Main container with nice shadow-like padding
        container = ttk.Frame(self.root, padding="40")
        container.pack(fill=tk.BOTH, expand=True)
        
        # Icon / Title
        title_label = ttk.Label(container, text="🔒 System Access", style="Header.TLabel")
        title_label.pack(pady=(0, 30))
        
        # Form
        form_frame = ttk.Frame(container)
        form_frame.pack(fill=tk.X)
        
        ttk.Label(form_frame, text="USERNAME", font=("Segoe UI", 8, "bold"), foreground=self.colors["secondary"]).pack(anchor=tk.W)
        self.username_var = tk.StringVar()
        username_entry = ttk.Entry(form_frame, textvariable=self.username_var, font=("Segoe UI", 12))
        username_entry.pack(fill=tk.X, pady=(5, 20))
        
        ttk.Label(form_frame, text="PASSWORD", font=("Segoe UI", 8, "bold"), foreground=self.colors["secondary"]).pack(anchor=tk.W)
        self.password_var = tk.StringVar()
        password_entry = ttk.Entry(form_frame, textvariable=self.password_var, show="•", font=("Segoe UI", 12))
        password_entry.pack(fill=tk.X, pady=(5, 30))
        
        # Buttons
        login_btn = ttk.Button(container, text="LOGIN", command=self._login, style="Login.TButton")
        login_btn.pack(fill=tk.X)
        
        # Bottom link
        footer_frame = ttk.Frame(container)
        footer_frame.pack(fill=tk.X, pady=(20, 0))
        ttk.Label(footer_frame, text="Need access?", foreground=self.colors["secondary"]).pack(side=tk.LEFT)
        register_link = ttk.Label(footer_frame, text="Register Here", foreground=self.colors["primary"], cursor="hand2", font=("Segoe UI", 10, "bold"))
        register_link.pack(side=tk.LEFT, padx=5)
        register_link.bind("<Button-1>", lambda e: self._show_register())
        
        # Focus & Bindings
        username_entry.focus()
        self.root.bind("<Return>", lambda e: self._login())

    def _login(self):
        """Validate login credentials"""
        username = self.username_var.get().strip()
        password = self.password_var.get()
        
        if not username or not password:
            messagebox.showwarning("Login", "Please enter both credentials")
            return
        
        if not os.path.exists(self.users_file):
            self._create_default_users()
            
        with open(self.users_file, 'r') as f:
            users = json.load(f)
        
        if username in users:
            stored_hash = users[username]["password"]
            if verify_password(password, stored_hash.encode('utf-8')):
                messagebox.showinfo("Success", f"Welcome back, {username}!")
                self.root.withdraw()
                self.on_login_success(username)
            else:
                messagebox.showerror("Error", "Invalid password")
        else:
            messagebox.showerror("Error", "User not found")

    def _show_register(self):
        """Show registration window"""
        reg_win = tk.Toplevel(self.root)
        reg_win.title("Registration")
        reg_win.geometry("400x450")
        reg_win.config(bg=self.colors["bg"])
        reg_win.transient(self.root)
        reg_win.grab_set()
        
        # Center
        reg_win.update_idletasks()
        x = (reg_win.winfo_screenwidth() // 2) - (400 // 2)
        y = (reg_win.winfo_screenheight() // 2) - (450 // 2)
        reg_win.geometry(f"+{x}+{y}")
        
        container = ttk.Frame(reg_win, padding="30")
        container.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(container, text="Create Account", style="Header.TLabel").pack(pady=(0, 20))
        
        usr_var = tk.StringVar()
        pwd_var = tk.StringVar()
        cpwd_var = tk.StringVar()
        
        ttk.Label(container, text="USERNAME").pack(anchor=tk.W)
        ttk.Entry(container, textvariable=usr_var, font=("Segoe UI", 11)).pack(fill=tk.X, pady=(5, 15))
        
        ttk.Label(container, text="PASSWORD").pack(anchor=tk.W)
        ttk.Entry(container, textvariable=pwd_var, show="•", font=("Segoe UI", 11)).pack(fill=tk.X, pady=(5, 15))
        
        ttk.Label(container, text="CONFIRM PASSWORD").pack(anchor=tk.W)
        ttk.Entry(container, textvariable=cpwd_var, show="•", font=("Segoe UI", 11)).pack(fill=tk.X, pady=(5, 25))
        
        def do_register():
            u, p, c = usr_var.get().strip(), pwd_var.get(), cpwd_var.get()
            if not u or not p or not c:
                messagebox.showwarning("Error", "All fields required", parent=reg_win)
                return
            if p != c:
                messagebox.showerror("Error", "Passwords mismatch", parent=reg_win)
                return
            
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            if u in users:
                messagebox.showerror("Error", "Username taken", parent=reg_win)
                return
            
            users[u] = {"password": hash_password(p).decode('utf-8'), "role": "user"}
            with open(self.users_file, 'w') as f:
                json.dump(users, f, indent=4)
            
            messagebox.showinfo("Success", "Account created!", parent=reg_win)
            reg_win.destroy()
            
        ttk.Button(container, text="REGISTER NOW", command=do_register).pack(fill=tk.X)

    def logout(self):
        """Handle logout"""
        self.username_var.set("")
        self.password_var.set("")
        self.root.deiconify()

if __name__ == "__main__":
    root = tk.Tk()
    LoginSystem(root, lambda u: print(f"Logged in: {u}"))
    root.mainloop()


# For testing the login system independently
if __name__ == "__main__":
    root = tk.Tk()
    def on_login(username):
        print(f"Login successful for {username}")
        # Here you would normally start the main application
        # For testing, we'll just add a logout button
        logout_window = tk.Toplevel(root)
        logout_window.title("Test Window")
        logout_window.geometry("300x200")
        
        label = ttk.Label(logout_window, text=f"Welcome, {username}!")
        label.pack(pady=20)
        
        logout_btn = ttk.Button(logout_window, text="Logout", 
                               command=lambda: login_system.logout() or logout_window.destroy())
        logout_btn.pack()
    
    login_system = LoginSystem(root, on_login)
    root.mainloop()