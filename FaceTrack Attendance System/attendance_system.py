import os
import tkinter as tk
from tkinter import ttk, messagebox
import cv2
import numpy as np
import face_recognition
import pandas as pd
from PIL import Image, ImageTk
from datetime import datetime
import threading
import time
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

from login import LoginSystem
from utils import load_known_faces, mark_attendance, get_attendance_summary

class AttendanceSystem:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.known_faces_dir = "known_faces"
        self.attendance_file = "attendance.xlsx"
        self.camera_active = False
        self.video_capture = None
        self.current_frame = None
        self.face_locations = []
        self.face_names = []
        self.known_face_encodings = []
        self.known_face_names = []
        self.recognition_active = False
        self.recognition_thread = None
        self.last_attendance_time = {}
        
        self._load_faces()
        self._apply_styles()
        self._setup_ui()
    
    def _apply_styles(self):
        self.style = ttk.Style()
        self.colors = {
            "primary": "#6366f1",
            "bg": "#f8fafc",
            "card": "#ffffff",
            "text": "#1e293b",
            "accent": "#10b981",
            "danger": "#f43f5e"
        }
        
        self.style.configure("Main.TNotebook", background=self.colors["bg"], padding=10)
        self.style.configure("Main.TNotebook.Tab", padding=[20, 10], font=("Segoe UI", 10, "bold"))
        self.style.configure("Card.TFrame", background=self.colors["card"], relief="flat", borderwidth=0)
        self.style.configure("Accent.TButton", font=("Segoe UI", 10, "bold"), background=self.colors["primary"], foreground="white")
        self.style.configure("TLabel", background=self.colors["bg"], font=("Segoe UI", 10))
        self.style.configure("Title.TLabel", font=("Segoe UI", 16, "bold"), foreground=self.colors["primary"])

    def _setup_ui(self):
        self.root.title("Attendance Pro - Kiosk")
        self.root.geometry("1100x750")
        self.root.config(bg=self.colors["bg"])
        
        # Main Notebook
        self.notebook = ttk.Notebook(self.root, style="Main.TNotebook")
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tabs
        self.recog_tab = ttk.Frame(self.notebook)
        self.history_tab = ttk.Frame(self.notebook)
        self.stats_tab = ttk.Frame(self.notebook)
        
        self.notebook.add(self.recog_tab, text="Recognition")
        self.notebook.add(self.history_tab, text="History")
        self.notebook.add(self.stats_tab, text="Analytics Dashboard")
        
        self._build_recognition_tab()
        self._build_history_tab()
        self._build_stats_tab()
        
        # User Footer
        footer = ttk.Frame(self.root, padding=5)
        footer.pack(fill=tk.X)
        ttk.Label(footer, text=f"👤 Operator: {self.username}").pack(side=tk.LEFT, padx=10)
        ttk.Button(footer, text="Logout", command=self._logout).pack(side=tk.RIGHT, padx=10)

    def _build_recognition_tab(self):
        # Left: Camera
        left = ttk.Frame(self.recog_tab, padding=10)
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        cam_card = ttk.Frame(left, style="Card.TFrame", padding=10)
        cam_card.pack(fill=tk.BOTH, expand=True)
        
        self.video_label = ttk.Label(cam_card, background="black")
        self.video_label.pack(fill=tk.BOTH, expand=True)
        
        # Controls
        ctrl = ttk.Frame(left, padding=10)
        ctrl.pack(fill=tk.X)
        
        self.camera_btn = ttk.Button(ctrl, text="Start Camera", command=self._toggle_camera)
        self.camera_btn.pack(side=tk.LEFT, padx=5)
        
        self.rec_btn = ttk.Button(ctrl, text="Enable AI Recognition", command=self._toggle_recognition, state=tk.DISABLED)
        self.rec_btn.pack(side=tk.LEFT, padx=5)
        
        # Right: Info
        right = ttk.Frame(self.recog_tab, width=300, padding=10)
        right.pack(side=tk.RIGHT, fill=tk.Y)
        
        info_card = ttk.LabelFrame(right, text="Status Panel", padding=15)
        info_card.pack(fill=tk.BOTH, expand=True)
        
        self.status_lbl = ttk.Label(info_card, text="System Ready", font=("Segoe UI", 12, "bold"), foreground=self.colors["accent"])
        self.status_lbl.pack(pady=10)
        
        ttk.Label(info_card, text=f"Faces Loaded: {len(self.known_face_names)}").pack(anchor=tk.W)
        self.count_lbl = ttk.Label(info_card, text="Detected: 0")
        self.count_lbl.pack(anchor=tk.W, pady=5)

    def _build_history_tab(self):
        frame = ttk.Frame(self.history_tab, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="Attendance Logs", style="Title.TLabel").pack(pady=(0, 20))
        
        cols = ("Name", "Date", "Time", "Status")
        self.tree = ttk.Treeview(frame, columns=cols, show="headings")
        for col in cols:
            self.tree.heading(col, text=col)
            self.tree.column(col, width=150)
        
        scroll = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scroll.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        ttk.Button(frame, text="Refresh Logs", command=self._refresh_history).pack(pady=10)
        self._refresh_history()

    def _build_stats_tab(self):
        self.fig_container = ttk.Frame(self.stats_tab, padding=20)
        self.fig_container.pack(fill=tk.BOTH, expand=True)
        
        ttk.Button(self.stats_tab, text="Generate Latest Analytics", command=self._update_charts).pack(pady=5)
        self._update_charts()

    def _update_charts(self):
        # Clear previous
        for widget in self.fig_container.winfo_children():
            widget.destroy()
            
        if not os.path.exists(self.attendance_file):
            ttk.Label(self.fig_container, text="No data available for analytics yet.").pack()
            return

        df = pd.read_excel(self.attendance_file)
        if df.empty: return

        fig = Figure(figsize=(10, 6), dpi=100)
        
        # Pie Chart (Status)
        ax1 = fig.add_subplot(121)
        if 'Status' in df.columns:
            counts = df['Status'].value_counts()
            ax1.pie(counts, labels=counts.index, autopct='%1.1f%%', colors=['#6366f1', '#f43f5e', '#10b981'])
            ax1.set_title("Attendance Status Distribution")
        
        # Line Chart (Trend)
        ax2 = fig.add_subplot(122)
        trend = df.groupby('Date').size()
        ax2.plot(trend.index, trend.values, marker='o', color='#6366f1', linewidth=2)
        ax2.set_title("Daily Enrollment Trends")
        ax2.set_xlabel("Date")
        ax2.set_ylabel("Records")
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)

        fig.tight_layout()
        canvas = FigureCanvasTkAgg(fig, self.fig_container)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def _refresh_history(self):
        for i in self.tree.get_children(): self.tree.delete(i)
        if os.path.exists(self.attendance_file):
            df = pd.read_excel(self.attendance_file)
            for _, row in df.tail(50).iterrows():
                status = row.get('Status', 'N/A')
                self.tree.insert("", 0, values=(row['Name'], row['Date'], row['Time'], status))

    def _load_faces(self):
        self.known_face_encodings, self.known_face_names = load_known_faces(self.known_faces_dir)

    def _toggle_camera(self):
        if self.camera_active:
            self._stop_camera()
            self.camera_btn.config(text="Start Camera")
            self.rec_btn.config(state=tk.DISABLED)
        else:
            self.video_capture = cv2.VideoCapture(0)
            if self.video_capture.isOpened():
                self.camera_active = True
                self.camera_btn.config(text="Stop Camera")
                self.rec_btn.config(state=tk.NORMAL)
                self._update_frame()

    def _stop_camera(self):
        self.camera_active = False
        self.recognition_active = False
        if self.video_capture: self.video_capture.release()
        self.video_label.config(image='')

    def _update_frame(self):
        if self.camera_active:
            ret, frame = self.video_capture.read()
            if ret:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                if self.recognition_active: self.current_frame = rgb.copy()
                
                for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
                    cv2.rectangle(rgb, (left, top), (right, bottom), (99, 102, 241), 2)
                    cv2.putText(rgb, name, (left, bottom + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (99, 102, 241), 2)
                
                img = ImageTk.PhotoImage(Image.fromarray(rgb))
                self.video_label.imgtk = img
                self.video_label.configure(image=img)
            self.root.after(10, self._update_frame)

    def _toggle_recognition(self):
        if self.recognition_active:
            self.recognition_active = False
            self.rec_btn.config(text="Enable AI Recognition")
            self.status_lbl.config(text="AI Paused", foreground=self.colors["danger"])
        else:
            self.recognition_active = True
            self.rec_btn.config(text="Disable AI Recognition")
            self.status_lbl.config(text="AI ACTIVE", foreground=self.colors["accent"])
            threading.Thread(target=self._process_recognition, daemon=True).start()

    def _process_recognition(self):
        while self.recognition_active:
            if self.current_frame is not None:
                small = cv2.resize(self.current_frame, (0, 0), fx=0.25, fy=0.25)
                locs = face_recognition.face_locations(small)
                encs = face_recognition.face_encodings(small, locs)
                
                names = []
                for enc in encs:
                    name = "Unknown"
                    if self.known_face_encodings:
                        matches = face_recognition.compare_faces(self.known_face_encodings, enc)
                        if True in matches:
                            idx = matches.index(True)
                            name = self.known_face_names[idx]
                            current_time = time.time()
                            
                            # Cooldown check (prevent spamming same detection)
                            if name not in self.last_attendance_time or current_time - self.last_attendance_time[name] > 30:
                                if mark_attendance(name, self.attendance_file):
                                    self.last_attendance_time[name] = current_time
                                    self.root.after(0, self._refresh_history)
                                    self.root.after(0, lambda n=name: self.status_lbl.config(text=f"✅ {n}: Marked", foreground=self.colors["accent"]))
                                else:
                                    # Already marked today
                                    self.last_attendance_time[name] = current_time # Reset cooldown so we don't spam the 'Already Marked' message
                                    self.root.after(0, lambda n=name: self.status_lbl.config(text=f"⚠️ {n}: Already Marked", foreground=self.colors["primary"]))
                    names.append(name)
                
                self.face_locations = [(t*4, r*4, b*4, l*4) for (t, r, b, l) in locs]
                self.face_names = names
                self.root.after(0, lambda: self.count_lbl.config(text=f"Detected: {len(names)}"))
            time.sleep(0.3)

    def _logout(self):
        self._stop_camera()
        self.root.destroy()

    def _on_close(self):
        self._stop_camera()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    LoginSystem(root, lambda u: AttendanceSystem(tk.Toplevel(root), u))
    root.mainloop()