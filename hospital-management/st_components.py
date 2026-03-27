import streamlit as st
import pandas as pd
from database import get_connection
from datetime import datetime

# Helper to render aesthetic tables that follow the dark/light theme reliably
def render_aesthetic_table(df):
    if df.empty:
        st.info("No records found.")
        return
    st.table(df)

def show_home():
    is_dark = st.session_state.get('theme') == "Dark"
    text_color = "#ffffff" if is_dark else "#1a1a1a"
    subtext_color = "#888888" if is_dark else "#555555"
    card_bg = "rgba(255, 255, 255, 0.03)" if is_dark else "rgba(0, 0, 0, 0.02)"
    border_color = "#222222" if is_dark else "#dddddd"
    shadow = "0 20px 50px rgba(0,0,0,0.5)" if is_dark else "0 10px 30px rgba(0,0,0,0.1)"

    # Hero Section
    st.markdown(f"""
        <div style="text-align: center; padding: 20px 0;">
            <h1 style='color: {text_color}; margin-bottom: 0; font-weight: 800; letter-spacing: -1px; font-size: 3rem;'>
                🏥 Hospital Management System
            </h1>
            <p style='color: {subtext_color}; font-style: italic; margin-top: 0; font-size: 1.1rem;'>
                Empowering Healthcare through Intelligent Operations
            </p>
        </div>
    """, unsafe_allow_html=True)

    # Command Center Metrics
    conn = get_connection()
    total_patients = pd.read_sql("SELECT COUNT(*) as count FROM patients", conn).iloc[0]['count']
    total_doctors = pd.read_sql("SELECT COUNT(*) as count FROM doctors", conn).iloc[0]['count']
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_apps = pd.read_sql("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?", conn, params=(today_str,)).iloc[0]['count']
    conn.close()

    m1, m2, m3 = st.columns(3)
    with m1:
        st.metric("Total Patients", total_patients)
    with m2:
        st.metric("Active Doctors", total_doctors)
    with m3:
        st.metric("Today's Appointments", today_apps)

    st.divider()

    # Quick Action Center
    st.markdown(f"<h3 style='color: {text_color}; text-align: center; margin-bottom: 25px;'>⚡ Quick Action Center</h3>", unsafe_allow_html=True)
    q1, q2, q3 = st.columns(3)
    
    if q1.button("➕ Register Patient", use_container_width=True):
        st.session_state.menu_choice = "👥 Patients"
        st.rerun()
    if q2.button("👨‍⚕️ Manage Doctors", use_container_width=True):
        st.session_state.menu_choice = "👨‍⚕️ Doctors"
        st.rerun()
    if q3.button("📅 Book Appointment", use_container_width=True):
        st.session_state.menu_choice = "📅 Appointments"
        st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)
    
    # Professional CSS Logo with Pop Effects
    st.markdown(f"""
        <style>
            @keyframes float {{
                0% {{ transform: translateY(0px) rotate(-10deg); }}
                50% {{ transform: translateY(-10px) rotate(-10deg); }}
                100% {{ transform: translateY(0px) rotate(-10deg); }}
            }}
            @keyframes pulse {{
                0% {{ box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }}
                70% {{ box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }}
                100% {{ box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }}
            }}
            .logo-container {{
                animation: float 3s ease-in-out infinite;
                cursor: pointer;
            }}
            .logo-container:hover {{
                animation: none !important;
                transform: scale(1.1) rotate(0deg) !important;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }}
            .logo-inner {{
                animation: pulse 2s infinite;
            }}
        </style>
        <div style="display: flex; justify-content: center; margin: 40px 0;">
            <div class="logo-container" style="
                width: 160px; height: 160px; 
                background: linear-gradient(135deg, {text_color} 0%, {subtext_color} 100%);
                border-radius: 20px;
                display: flex; align-items: center; justify-content: center;
                box-shadow: {shadow};
            ">
                <div class="logo-inner" style="
                    width: 140px; height: 140px;
                    background: {'#111' if is_dark else '#fff'};
                    border-radius: 15px;
                    display: flex; align-items: center; justify-content: center;
                    transform: rotate(10deg);
                ">
                    <span style="
                        font-size: 50px; font-weight: 900; color: {text_color}; 
                        letter-spacing: 2px;
                    ">HMS</span>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Introduction Card
    st.markdown(f"""
        <div style="
            text-align: center; max-width: 900px; margin: 0 auto; padding: 50px; 
            border-radius: 30px; background: {card_bg}; 
            border: 1px solid {border_color}; box-shadow: {shadow};
            backdrop-filter: blur(10px);
        ">
            <h2 style="color: {text_color}; margin-bottom: 25px; font-weight: 700;">The Complete Solution for Modern Hospitals</h2>
            <p style="font-size: 1.15rem; line-height: 1.8; color: {text_color}; opacity: 0.85; text-align: center; margin-bottom: 30px;">
                HMS v3.0 represents a new standard in healthcare administration. By unifying patient care, clinical data, and backend operations, we provide administrators with a powerful, real-time command center to optimize every aspect of the hospital journey.
            </p>
            <div style="display: flex; justify-content: center; gap: 20px;">
                <span style="padding: 10px 20px; border-radius: 50px; background: {border_color}; color: {text_color}; font-size: 0.9rem; font-weight: 600;">Secure</span>
                <span style="padding: 10px 20px; border-radius: 50px; background: {border_color}; color: {text_color}; font-size: 0.9rem; font-weight: 600;">Reliable</span>
                <span style="padding: 10px 20px; border-radius: 50px; background: {border_color}; color: {text_color}; font-size: 0.9rem; font-weight: 600;">Precise</span>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    # Feature Cards with Hover Effects
    st.markdown(f"""
        <style>
            .feature-card {{
                text-align: center; 
                padding: 30px; 
                border-radius: 20px; 
                background: {'#0c0c0c' if is_dark else '#ffffff'}; 
                border: 1px solid {border_color};
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
            }}
            .feature-card:hover {{
                transform: translateY(-15px) scale(1.05);
                box-shadow: 0 15px 40px { 'rgba(255, 255, 255, 0.15)' if is_dark else 'rgba(0, 0, 0, 0.1)' };
                border-color: {text_color};
            }}
            .feature-card div {{
                transition: transform 0.4s ease;
            }}
            .feature-card:hover div {{
                transform: scale(1.2);
            }}
        </style>
    """, unsafe_allow_html=True)

    f1, f2, f3 = st.columns(3)
    features = [
        ("⚡", "SPEED", "Optimized for high-volume transactions."),
        ("🛡️", "SECURITY", "Enterprise-level data protection protocols."),
        ("📊", "ANALYTICS", "Instant reporting and operational insights.")
    ]
    
    for col, (icon, title, desc) in zip([f1, f2, f3], features):
        with col:
            st.markdown(f"""
                <div class="feature-card">
                    <div style="font-size: 45px; margin-bottom: 15px;">{icon}</div>
                    <h4 style="margin:0; color: {text_color}; font-weight: 700; letter-spacing: 1px;">{title}</h4>
                    <p style="color: {subtext_color}; font-size: 0.95rem; margin-top: 15px; line-height: 1.4;">{desc}</p>
                </div>
            """, unsafe_allow_html=True)

    st.markdown("<br><br>", unsafe_allow_html=True)

    # Image Section
    st.markdown(f"<h2 style='text-align: center; color: {text_color}; font-weight: 700; margin-bottom: 30px;'>Our Excellence</h2>", unsafe_allow_html=True)
    img_col1, img_col2 = st.columns(2)
    
    import glob
    import os
    brain_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\109fadba-5ba1-43c0-b620-97ac6496634b"
    
    def get_latest_img(pattern):
        files = glob.glob(os.path.join(brain_dir, pattern))
        if not files:
            return None
        return max(files, key=os.path.getctime)

    hosp_img = get_latest_img("doctors_working_professional*")
    doc_img = get_latest_img("doctors_at_work_professional*")
    
    with img_col1:
        if hosp_img:
            st.image(hosp_img, caption="Collaborative Excellence", use_container_width=True)
        else:
            # Fallback to any doctors image if specifically 'working_professional' is missing
            fallback_img = get_latest_img("professional_doctors_working*")
            if fallback_img:
                st.image(fallback_img, caption="Collaborative Excellence", use_container_width=True)
            else:
                st.info("Meeting image loading...")
        st.markdown(f"<p style='color: {subtext_color}; text-align: center; font-size: 0.9rem;'>Expert clinicians collaborating on complex cases.</p>", unsafe_allow_html=True)
    
    with img_col2:
        if doc_img:
            st.image(doc_img, caption="Clinical Expertise", use_container_width=True)
        else:
            st.info("Working image loading...")
        st.markdown(f"<p style='color: {subtext_color}; text-align: center; font-size: 0.9rem;'>Advanced research and precision in every diagnosis.</p>", unsafe_allow_html=True)

def show_patients():
    st.markdown('<h1 style="text-align: center;">👤 Patient Management</h1>', unsafe_allow_html=True)
    
    is_admin = st.session_state.get('is_admin', False)
    if is_admin:
        st.markdown('<div style="text-align: center;"><span class="admin-badge">ADMIN ACCESS ACTIVE</span></div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Search & Manage Patients", "Register New Patient"])
    
    conn = get_connection()
    
    with tab1:
        st.subheader("Search Patients")
        col1, col2 = st.columns([3, 1])
        with col1:
            search_query = st.text_input("Search (Name/ID/Disease)", "")
        with col2:
            search_by = st.selectbox("Search By", ["name", "id", "disease"])
            
        query = f"SELECT * FROM patients WHERE {search_by} LIKE ?"
        df = pd.read_sql(query, conn, params=(f"%{search_query}%",))
        
        if not df.empty:
            render_aesthetic_table(df)
            
            if is_admin:
                st.divider()
                st.subheader("Update / Delete Patient")
                patient_id = st.number_input("Enter Patient ID to Manage", min_value=1, step=1)
                
                patient_data = df[df['id'] == patient_id]
                if not patient_data.empty:
                    patient = patient_data.iloc[0]
                    with st.form("update_patient_form"):
                        u_col1, u_col2 = st.columns(2)
                        with u_col1:
                            u_name = st.text_input("Name", value=patient['name'])
                            u_age = st.number_input("Age", value=int(patient['age']))
                            u_gender = st.selectbox("Gender", ["Male", "Female", "Other"], index=["Male", "Female", "Other"].index(patient['gender']))
                        with u_col2:
                            u_contact = st.text_input("Contact", value=patient['contact'])
                            u_address = st.text_area("Address", value=patient['address'])
                        
                        u_disease = st.text_input("Disease/Problem", value=patient['disease'])
                        
                        c1, c2 = st.columns(2)
                        with c1:
                            update_btn = st.form_submit_button("Update Patient")
                        with c2:
                            delete_btn = st.form_submit_button("Delete Patient", type="primary")
                            
                        if update_btn:
                            cursor = conn.cursor()
                            cursor.execute("""
                                UPDATE patients SET name=?, age=?, gender=?, contact=?, address=?, disease=?
                                WHERE id=?
                            """, (u_name, u_age, u_gender, u_contact, u_address, u_disease, patient_id))
                            conn.commit()
                            st.success("Patient updated!")
                            st.rerun()
                            
                        if delete_btn:
                            cursor = conn.cursor()
                            cursor.execute("DELETE FROM patients WHERE id=?", (patient_id,))
                            cursor.execute("DELETE FROM appointments WHERE patient_id=?", (patient_id,))
                            cursor.execute("DELETE FROM billing WHERE patient_id=?", (patient_id,))
                            conn.commit()
                            st.warning("Patient deleted!")
                            st.rerun()
                else:
                    st.info("Select a valid Patient ID from the table above to update or delete.")
            else:
                st.info("Logging in as Admin will allow you to Update or Delete patients.")

    with tab2:
        st.subheader("New Patient Registration")
        with st.form("register_patient_form"):
            col1, col2 = st.columns(2)
            with col1:
                name = st.text_input("Name")
                age = st.number_input("Age", min_value=0, max_value=120, value=25)
                gender = st.selectbox("Gender", ["Male", "Female", "Other"])
            with col2:
                contact = st.text_input("Contact")
                admission_date = st.date_input("Admission Date", value=datetime.now())
                address = st.text_area("Address")
            
            disease = st.text_input("Disease/Problem")
            
            submit_btn = st.form_submit_button("Register Patient")
            
            if submit_btn:
                if name and contact and address and disease:
                    with st.spinner("Registering patient..."):
                        cursor = conn.cursor()
                        cursor.execute("""
                            INSERT INTO patients (name, age, gender, contact, address, disease, admission_date)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (name, age, gender, contact, address, disease, admission_date.strftime("%Y-%m-%d")))
                        conn.commit()
                        st.toast(f"✅ Patient {name} registered!", icon="🏥")
                        st.rerun()
                else:
                    st.error("Please fill in all required fields")
    
    conn.close()

def show_doctors():
    st.markdown('<h1 style="text-align: center;">👨‍⚕️ Doctor Management</h1>', unsafe_allow_html=True)
    
    is_admin = st.session_state.get('is_admin', False)
    if is_admin:
        st.markdown('<div style="text-align: center;"><span class="admin-badge">ADMIN ACCESS ACTIVE</span></div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Search & Manage Doctors", "Register New Doctor"])
    
    conn = get_connection()
    
    with tab1:
        st.subheader("Search Doctors")
        col1, col2 = st.columns([3, 1])
        with col1:
            search_query = st.text_input("Search (Name/Specialty)", "")
        with col2:
            search_by = st.selectbox("Search By", ["name", "specialty"])
            
        query = f"SELECT * FROM doctors WHERE {search_by} LIKE ?"
        df = pd.read_sql(query, conn, params=(f"%{search_query}%",))
        
        if not df.empty:
            render_aesthetic_table(df)
            
            if is_admin:
                st.divider()
                st.subheader("Update / Delete Doctor")
                doc_id = st.number_input("Enter Doctor ID to Manage", min_value=1, step=1)
                
                doc_data = df[df['id'] == doc_id]
                if not doc_data.empty:
                    doc = doc_data.iloc[0]
                    with st.form("update_doc_form"):
                        u_name = st.text_input("Name", value=doc['name'])
                        u_spec = st.text_input("Specialty", value=doc['specialty'])
                        u_avail = st.selectbox("Availability", 
                                             ["Monday-Friday 9AM-5PM", "Monday-Saturday 10AM-6PM", "24/7", "On Call"],
                                             index=["Monday-Friday 9AM-5PM", "Monday-Saturday 10AM-6PM", "24/7", "On Call"].index(doc['availability']))
                        
                        c1, c2 = st.columns(2)
                        with c1:
                            update_btn = st.form_submit_button("Update Doctor")
                        with c2:
                            delete_btn = st.form_submit_button("Delete Doctor", type="primary")
                            
                        if update_btn:
                            with st.spinner("Updating doctor record..."):
                                cursor = conn.cursor()
                                cursor.execute("""
                                    UPDATE doctors SET name=?, specialty=?, availability=?
                                    WHERE id=?
                                """, (u_name, u_spec, u_avail, doc_id))
                                conn.commit()
                                st.toast("✅ Doctor updated!", icon="👨‍⚕️")
                                st.rerun()
                            
                        if delete_btn:
                            with st.spinner("Deleting doctor record..."):
                                cursor = conn.cursor()
                                cursor.execute("DELETE FROM doctors WHERE id=?", (doc_id,))
                                cursor.execute("DELETE FROM appointments WHERE doctor_id=?", (doc_id,))
                                conn.commit()
                                st.toast("🗑️ Doctor deleted!", icon="👨‍⚕️")
                                st.rerun()
            else:
                st.info("Logging in as Admin will allow you to Update or Delete doctors.")

    with tab2:
        st.subheader("New Doctor Registration")
        with st.form("register_doc_form"):
            name = st.text_input("Name")
            specialty = st.text_input("Specialty")
            availability = st.selectbox("Availability", 
                                      ["Monday-Friday 9AM-5PM", "Monday-Saturday 10AM-6PM", "24/7", "On Call"])
            
            submit_btn = st.form_submit_button("Register Doctor")
            
            if submit_btn:
                if name and specialty:
                    with st.spinner("Registering doctor..."):
                        cursor = conn.cursor()
                        cursor.execute("""
                            INSERT INTO doctors (name, specialty, availability)
                            VALUES (?, ?, ?)
                        """, (name, specialty, availability))
                        conn.commit()
                        st.toast(f"👨‍⚕️ Dr. {name} registered!", icon="🏥")
                        st.rerun()
                else:
                    st.error("Please fill in all required fields")
    
    conn.close()

def show_appointments():
    st.markdown('<h1 style="text-align: center;">📅 Appointment Management</h1>', unsafe_allow_html=True)
    
    is_admin = st.session_state.get('is_admin', False)
    if is_admin:
        st.markdown('<div style="text-align: center;"><span class="admin-badge">ADMIN ACCESS ACTIVE</span></div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Appointment Schedule", "Book New Appointment"])
    
    conn = get_connection()
    
    with tab1:
        st.subheader("Search Appointments")
        col1, col2 = st.columns([3, 1])
        with col1:
            search_query = st.text_input("Search (Patient/Doctor/Date)", "")
        with col2:
            search_by = st.selectbox("Search By", ["patient", "doctor", "date"])
            
        if search_by == "patient":
            query = """
                SELECT a.id, p.name as patient_name, d.name as doctor_name, a.appointment_date, a.status
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE p.name LIKE ?
            """
        elif search_by == "doctor":
            query = """
                SELECT a.id, p.name as patient_name, d.name as doctor_name, a.appointment_date, a.status
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.name LIKE ?
            """
        else:
            query = """
                SELECT a.id, p.name as patient_name, d.name as doctor_name, a.appointment_date, a.status
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE a.appointment_date LIKE ?
            """
            
        df = pd.read_sql(query, conn, params=(f"%{search_query}%",))
        
        if not df.empty:
            render_aesthetic_table(df)
            
            if is_admin:
                st.divider()
                st.subheader("Manage Appointment")
                app_id = st.number_input("Enter Appointment ID to Manage", min_value=1, step=1)
                
                app_data = df[df['id'] == app_id]
                if not app_data.empty:
                    app = app_data.iloc[0]
                    with st.form("manage_app_form"):
                        st.write(f"Appointment ID: {app_id}")
                        new_status = st.selectbox("Status", ["Scheduled", "Completed", "Cancelled"], 
                                                index=["Scheduled", "Completed", "Cancelled"].index(app['status']))
                        
                        c1, c2 = st.columns(2)
                        with c1:
                            update_btn = st.form_submit_button("Update Status")
                        with c2:
                            delete_btn = st.form_submit_button("Delete Appointment", type="primary")
                            
                        if update_btn:
                            with st.spinner("Updating appointment status..."):
                                cursor = conn.cursor()
                                cursor.execute("UPDATE appointments SET status=? WHERE id=?", (new_status, app_id))
                                conn.commit()
                                st.toast("✅ Appointment status updated!", icon="📅")
                                st.rerun()
                            
                        if delete_btn:
                            with st.spinner("Deleting appointment..."):
                                cursor = conn.cursor()
                                cursor.execute("DELETE FROM appointments WHERE id=?", (app_id,))
                                conn.commit()
                                st.toast("🗑️ Appointment deleted!", icon="📅")
                                st.rerun()
                else:
                    st.info("Select a valid Appointment ID from the table above to manage.")
            else:
                st.info("Logging in as Admin will allow you to manage appointments.")

    with tab2:
        st.subheader("Book New Appointment")
        
        patients_df = pd.read_sql("SELECT id, name FROM patients ORDER BY name", conn)
        doctors_df = pd.read_sql("SELECT id, name FROM doctors ORDER BY name", conn)
        
        if patients_df.empty or doctors_df.empty:
            st.warning("Please ensure there are both patients and doctors registered before booking.")
        else:
            with st.form("book_appointment_form"):
                patient_labels = {f"{row['name']} (ID: {row['id']})": row['id'] for idx, row in patients_df.iterrows()}
                doctor_labels = {f"{row['name']} (ID: {row['id']})": row['id'] for idx, row in doctors_df.iterrows()}
                
                selected_patient = st.selectbox("Select Patient", options=list(patient_labels.keys()))
                selected_doctor = st.selectbox("Select Doctor", options=list(doctor_labels.keys()))
                app_date = st.date_input("Appointment Date", value=datetime.now())
                
                submit_btn = st.form_submit_button("Book Appointment")
                
                if submit_btn:
                    with st.spinner("Booking appointment..."):
                        cursor = conn.cursor()
                        cursor.execute("""
                            INSERT INTO appointments (patient_id, doctor_id, appointment_date, status)
                            VALUES (?, ?, ?, ?)
                        """, (patient_labels[selected_patient], doctor_labels[selected_doctor], app_date.strftime("%Y-%m-%d"), "Scheduled"))
                        conn.commit()
                        st.toast("📅 Appointment booked successfully!", icon="🏥")
                        st.rerun()
    
    conn.close()

def show_billing():
    st.markdown('<h1 style="text-align: center;">💳 Billing Management</h1>', unsafe_allow_html=True)
    
    is_admin = st.session_state.get('is_admin', False)
    if is_admin:
        st.markdown('<div style="text-align: center;"><span class="admin-badge">ADMIN ACCESS ACTIVE</span></div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Search & Manage Bills", "Generate New Bill"])
    
    conn = get_connection()
    
    with tab1:
        st.subheader("Search Bills")
        search_query = st.text_input("Search (Patient Name)", "")
            
        query = """
            SELECT b.id, p.name as patient_name, b.total_amount, b.payment_status, 
                   b.payment_method, b.payment_date, b.billing_date
            FROM billing b
            JOIN patients p ON b.patient_id = p.id
            WHERE p.name LIKE ?
            ORDER BY b.billing_date DESC
        """
            
        df = pd.read_sql(query, conn, params=(f"%{search_query}%",))
        
        if not df.empty:
            render_aesthetic_table(df)
            
            if is_admin:
                st.divider()
                st.subheader("Manage Bill")
                bill_id = st.number_input("Enter Bill ID to Manage", min_value=1, step=1)
                
                bill_data = df[df['id'] == bill_id]
                if not bill_data.empty:
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM billing WHERE id=?", (bill_id,))
                    bill = cursor.fetchone()
                    
                    with st.form("manage_bill_form"):
                        col1, col2 = st.columns(2)
                        with col1:
                            u_cons = st.number_input("Consultation Fee", value=float(bill[2]))
                            u_med = st.number_input("Medicine Charges", value=float(bill[3]))
                            u_room = st.number_input("Room Charges/Day", value=float(bill[4]))
                        with col2:
                            u_days = st.number_input("Number of Days", value=int(bill[5]), min_value=1)
                            u_other = st.number_input("Other Charges", value=float(bill[6]))
                            u_status = st.selectbox("Status", ["Unpaid", "Paid", "Pending"], 
                                                  index=["Unpaid", "Paid", "Pending"].index(bill[9]))
                        
                        u_method = st.selectbox("Method", ["Cash", "Online", "Bank Transfer"],
                                              index=0 if bill[10] not in ["Cash", "Online", "Bank Transfer"] else ["Cash", "Online", "Bank Transfer"].index(bill[10]))
                        u_pay_date = st.date_input("Payment Date", value=datetime.strptime(bill[11], "%Y-%m-%d") if bill[11] else datetime.now())
                        
                        u_total = u_cons + u_med + (u_room * u_days) + u_other
                        st.info(f"Calculated Total: ₹{u_total:.2f}")
                        
                        c1, c2 = st.columns(2)
                        with c1:
                            update_btn = st.form_submit_button("Update Bill")
                        with c2:
                            delete_btn = st.form_submit_button("Delete Bill", type="primary")
                            
                        if update_btn:
                            with st.spinner("Updating bill record..."):
                                cursor.execute("""
                                    UPDATE billing SET 
                                        consultation_fee=?, medicine_charges=?, room_charges_per_day=?, 
                                        number_of_days=?, other_charges=?, total_amount=?, 
                                        payment_status=?, payment_method=?, payment_date=?
                                    WHERE id=?
                                """, (u_cons, u_med, u_room, u_days, u_other, u_total, u_status, u_method, u_pay_date.strftime("%Y-%m-%d"), bill_id))
                                conn.commit()
                                st.toast("✅ Bill updated!", icon="💳")
                                st.rerun()
                            
                        if delete_btn:
                            with st.spinner("Deleting bill record..."):
                                cursor.execute("DELETE FROM billing WHERE id=?", (bill_id,))
                                conn.commit()
                                st.toast("🗑️ Bill deleted!", icon="💳")
                                st.rerun()
                else:
                    st.info("Select a valid Bill ID from the table above to manage.")
            else:
                st.info("Logging in as Admin will allow you to manage bills.")

    with tab2:
        st.subheader("Generate New Patient Bill")
        patients_df = pd.read_sql("SELECT id, name FROM patients ORDER BY name", conn)
        if patients_df.empty:
            st.warning("No patients registered.")
        else:
            with st.form("new_bill_form"):
                patient_labels = {f"{row['name']} (ID: {row['id']})": row['id'] for idx, row in patients_df.iterrows()}
                selected_patient = st.selectbox("Select Patient", options=list(patient_labels.keys()))
                col1, col2 = st.columns(2)
                with col1:
                    cons = st.number_input("Consultation Fee", value=0.0)
                    med = st.number_input("Medicine Charges", value=0.0)
                    room = st.number_input("Room Charges/Day", value=0.0)
                with col2:
                    days = st.number_input("Number of Days", value=1, min_value=1)
                    other = st.number_input("Other Charges", value=0.0)
                    status = st.selectbox("Status", ["Unpaid", "Paid", "Pending"])
                method = st.selectbox("Method", ["Cash", "Online", "Bank Transfer"])
                pay_date = st.date_input("Payment Date", value=datetime.now())
                
                submit_btn = st.form_submit_button("Generate Bill")
                if submit_btn:
                    total = cons + med + (room * days) + other
                    with st.spinner("Generating bill..."):
                        cursor = conn.cursor()
                        cursor.execute("""
                            INSERT INTO billing (patient_id, consultation_fee, medicine_charges, room_charges_per_day, number_of_days, other_charges, total_amount, billing_date, payment_status, payment_method, payment_date)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (patient_labels[selected_patient], cons, med, room, days, other, total, datetime.now().strftime("%Y-%m-%d"), status, method, pay_date.strftime("%Y-%m-%d")))
                        conn.commit()
                        st.toast(f"💳 Bill Generated! Total: ₹{total:.2f}", icon="🧾")
                        st.rerun()
    
    conn.close()

def show_salaries():
    st.markdown('<h1 style="text-align: center;">💰 Doctor Salary Management</h1>', unsafe_allow_html=True)
    
    is_admin = st.session_state.get('is_admin', False)
    if is_admin:
        st.markdown('<div style="text-align: center;"><span class="admin-badge">ADMIN ACCESS ACTIVE</span></div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Search & Manage Salaries", "Generate New Salary"])
    
    conn = get_connection()
    
    with tab1:
        st.subheader("Search Salaries")
        search_query = st.text_input("Search (Doctor Name)", "")
            
        query = """
            SELECT s.id, d.name as doctor_name, s.salary_amount, s.salary_month, 
                   s.salary_year, s.payment_status, s.payment_method, s.payment_date
            FROM doctor_salary s
            JOIN doctors d ON s.doctor_id = d.id
            WHERE d.name LIKE ?
            ORDER BY s.salary_year DESC, s.salary_month DESC
        """
            
        df = pd.read_sql(query, conn, params=(f"%{search_query}%",))
        
        if not df.empty:
            render_aesthetic_table(df)
            
            if is_admin:
                st.divider()
                st.subheader("Manage Salary")
                sal_id = st.number_input("Enter Salary ID to Manage", min_value=1, step=1)
                
                sal_data = df[df['id'] == sal_id]
                if not sal_data.empty:
                    sal_row = sal_data.iloc[0]
                    with st.form("manage_salary_form"):
                        u_amt = st.number_input("Amount", value=float(sal_row['salary_amount']))
                        u_month = st.selectbox("Month", [f"{i:02d}" for i in range(1, 13)], index=int(sal_row['salary_month'])-1)
                        u_year = st.text_input("Year", value=str(sal_row['salary_year']))
                        u_status = st.selectbox("Status", ["Unpaid", "Paid", "Pending"], index=["Unpaid", "Paid", "Pending"].index(sal_row['payment_status']))
                        u_method = st.selectbox("Method", ["Cash", "Online", "Bank Transfer"], index=0 if sal_row['payment_method'] not in ["Cash", "Online", "Bank Transfer"] else ["Cash", "Online", "Bank Transfer"].index(sal_row['payment_method']))
                        u_pay_date = st.date_input("Payment Date", value=datetime.strptime(sal_row['payment_date'], "%Y-%m-%d") if sal_row['payment_date'] else datetime.now())
                        
                        c1, c2 = st.columns(2)
                        with c1:
                            update_btn = st.form_submit_button("Update Salary")
                        with c2:
                            delete_btn = st.form_submit_button("Delete Salary", type="primary")
                            
                        if update_btn:
                            with st.spinner("Updating salary details..."):
                                cursor = conn.cursor()
                                cursor.execute("""
                                    UPDATE doctor_salary SET salary_amount=?, salary_month=?, salary_year=?, payment_status=?, payment_method=?, payment_date=?
                                    WHERE id=?
                                """, (u_amt, u_month, u_year, u_status, u_method, u_pay_date.strftime("%Y-%m-%d"), sal_id))
                                conn.commit()
                                st.toast("✅ Salary updated!", icon="💰")
                                st.rerun()
                            
                        if delete_btn:
                            with st.spinner("Deleting salary record..."):
                                cursor = conn.cursor()
                                cursor.execute("DELETE FROM doctor_salary WHERE id=?", (sal_id,))
                                conn.commit()
                                st.toast("🗑️ Salary record deleted!", icon="💰")
                                st.rerun()
            else:
                st.info("Logging in as Admin will allow you to manage salaries.")
        else:
            st.info("No salary records found.")

    with tab2:
        st.subheader("Generate New Doctor Salary")
        docs_df = pd.read_sql("SELECT id, name FROM doctors ORDER BY name", conn)
        if docs_df.empty:
            st.warning("No doctors registered.")
        else:
            with st.form("new_salary_form"):
                doc_labels = {f"{row['name']} (ID: {row['id']})": row['id'] for idx, row in docs_df.iterrows()}
                selected_doc = st.selectbox("Select Doctor", options=list(doc_labels.keys()))
                amt = st.number_input("Amount", value=0.0)
                month = st.selectbox("Month", [f"{i:02d}" for i in range(1, 13)], index=datetime.now().month-1)
                year = st.text_input("Year", value=datetime.now().strftime("%Y"))
                status = st.selectbox("Status", ["Unpaid", "Paid", "Pending"])
                method = st.selectbox("Method", ["Cash", "Online", "Bank Transfer"])
                pay_date = st.date_input("Payment Date", value=datetime.now())
                
                submit_btn = st.form_submit_button("Generate Salary")
                if submit_btn:
                    with st.spinner("Processing salary payment..."):
                        cursor = conn.cursor()
                        cursor.execute("""
                            INSERT INTO doctor_salary (doctor_id, salary_amount, salary_month, salary_year, payment_status, payment_method, payment_date)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (doc_labels[selected_doc], amt, month, year, status, method, pay_date.strftime("%Y-%m-%d")))
                        conn.commit()
                        st.toast(f"💰 Salary generated for {selected_doc.split(' (ID: ')[0]}!", icon="🏥")
                        st.rerun()
    
    conn.close()

def show_financials():
    st.markdown('<h1 style="text-align: center;">📈 Financial Insights</h1>', unsafe_allow_html=True)
    
    conn = get_connection()
    
    # Revenue calculations
    rev_total_df = pd.read_sql("SELECT SUM(total_amount) as total FROM billing", conn)
    rev_paid_df = pd.read_sql("SELECT SUM(total_amount) as paid FROM billing WHERE payment_status='Paid'", conn)
    rev_unpaid_df = pd.read_sql("SELECT SUM(total_amount) as unpaid FROM billing WHERE payment_status='Unpaid'", conn)
    
    total_rev = rev_total_df.iloc[0]['total'] or 0
    paid_rev = rev_paid_df.iloc[0]['paid'] or 0
    unpaid_rev = rev_unpaid_df.iloc[0]['unpaid'] or 0

    # Expense calculations
    sal_total_df = pd.read_sql("SELECT SUM(salary_amount) as total FROM doctor_salary", conn)
    sal_paid_df = pd.read_sql("SELECT SUM(salary_amount) as paid FROM doctor_salary WHERE payment_status='Paid'", conn)
    sal_unpaid_df = pd.read_sql("SELECT SUM(salary_amount) as unpaid FROM doctor_salary WHERE payment_status='Unpaid'", conn)

    total_sal = sal_total_df.iloc[0]['total'] or 0
    paid_sal = sal_paid_df.iloc[0]['paid'] or 0
    unpaid_sal = sal_unpaid_df.iloc[0]['unpaid'] or 0

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Revenue", f"₹{total_rev:,.2f}", f"₹{paid_rev:,.2f} Paid")
    with col2:
        st.metric("Total Salaries", f"₹{total_sal:,.2f}", f"-₹{paid_sal:,.2f} Paid", delta_color="inverse")
    with col3:
        profit = paid_rev - paid_sal
        st.metric("Net Profit (Realized)", f"₹{profit:,.2f}", delta="Current Liquid Profit")

    st.divider()

    c1, c2 = st.columns(2)
    with c1:
        st.subheader("Payment Status Breakdown")
        status_data = pd.DataFrame({
            "Category": ["Revenue Paid", "Revenue Unpaid", "Salaries Paid", "Salaries Unpaid"],
            "Amount": [paid_rev, unpaid_rev, paid_sal, unpaid_sal]
        })
        st.bar_chart(status_data.set_index("Category"))
    
    with c2:
        st.subheader("Revenue by Method")
        method_df = pd.read_sql("SELECT payment_method, SUM(total_amount) as amount FROM billing WHERE payment_status='Paid' GROUP BY payment_method", conn)
        if not method_df.empty:
            st.write("") # Spacer
            st.write("") 
            st.dataframe(method_df, use_container_width=True)
        else:
            st.info("No paid billing data available yet.")

    conn.close()

def show_reports():
    st.markdown('<h1 style="text-align: center;">📊 Hospital Reports</h1>', unsafe_allow_html=True)
    
    report_type = st.selectbox("Report Type", ["Daily Report", "Monthly Report"])
    conn = get_connection()
    
    if report_type == "Daily Report":
        date = st.date_input("Select Date", value=datetime.now())
        if st.button("Generate Daily Report"):
            d_str = date.strftime("%Y-%m-%d")
            st.divider()
            st.subheader(f"📅 Summary for {d_str}")
            
            p_df = pd.read_sql("SELECT id, name, disease, contact FROM patients WHERE admission_date=?", conn, params=(d_str,))
            a_df = pd.read_sql("""
                SELECT a.id, p.name as patient, d.name as doctor, a.status 
                FROM appointments a 
                JOIN patients p ON a.patient_id = p.id 
                JOIN doctors d ON a.doctor_id = d.id 
                WHERE a.appointment_date=?
            """, conn, params=(d_str,))
            b_val = pd.read_sql("SELECT SUM(total_amount) as val FROM billing WHERE billing_date=?", conn, params=(d_str,)).iloc[0]['val'] or 0
            
            col1, col2, col3 = st.columns(3)
            col1.metric("Patients Admitted", len(p_df))
            col2.metric("Appointments", len(a_df))
            col3.metric("Daily Revenue", f"₹{b_val:,.2f}")
            
            if not p_df.empty:
                st.write("---")
                st.subheader("Patients Admitted Today")
                render_aesthetic_table(p_df)
            
            if not a_df.empty:
                st.write("---")
                st.subheader("Appointments Today")
                render_aesthetic_table(a_df)
                
            csv = p_df.to_csv(index=False).encode('utf-8')
            st.download_button("Download Patient List (CSV)", csv, f"patients_{d_str}.csv", "text/csv")
            
    else:
        month = st.selectbox("Month", [f"{i:02d}" for i in range(1, 13)], index=datetime.now().month-1)
        year = st.text_input("Year", value=datetime.now().strftime("%Y"))
        if st.button("Generate Monthly Report"):
            m_str = f"{year}-{month}%"
            st.divider()
            st.subheader(f"📈 Summary for {month}/{year}")
            
            p_df = pd.read_sql("SELECT id, name, admission_date, disease FROM patients WHERE admission_date LIKE ?", conn, params=(m_str,))
            a_df = pd.read_sql("""
                SELECT a.id, p.name as patient, d.name as doctor, a.appointment_date, a.status 
                FROM appointments a 
                JOIN patients p ON a.patient_id = p.id 
                JOIN doctors d ON a.doctor_id = d.id 
                WHERE a.appointment_date LIKE ?
            """, conn, params=(m_str,))
            b_val = pd.read_sql("SELECT SUM(total_amount) as val FROM billing WHERE billing_date LIKE ?", conn, params=(m_str,)).iloc[0]['val'] or 0
            
            col1, col2, col3 = st.columns(3)
            col1.metric("Total Patients", len(p_df))
            col2.metric("Total Appointments", len(a_df))
            col3.metric("Monthly Revenue", f"₹{b_val:,.2f}")
            
            st.write("---")
            st.subheader("Monthly Patient Records")
            render_aesthetic_table(p_df)
            
            csv = p_df.to_csv(index=False).encode('utf-8')
            st.download_button("Download Monthly Data (CSV)", csv, f"report_{year}_{month}.csv", "text/csv")
            
    conn.close()
