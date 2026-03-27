import streamlit as st
from database import initialize_database
import st_components as comps

# Initialize database on startup
initialize_database()

# Initialize session state for theme and admin
if 'theme' not in st.session_state:
    st.session_state.theme = "Light"
if 'is_admin' not in st.session_state:
    st.session_state.is_admin = False

st.set_page_config(
    page_title="Hospital Management System", 
    layout="wide",
    page_icon="🏥"
)

# Custom CSS for Dark/Light Mode and UI effects
def apply_theme():
    if st.session_state.theme == "Dark":
        st.markdown("""
            <style>
                /* Global Background and Text */
                .stApp {
                    background-color: #000000;
                    color: #ffffff;
                }
                
                /* Sidebar Styling */
                [data-testid="stSidebar"] {
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(10px);
                    border-right: 1px solid #1a1a1a;
                }
                
                /* Headings */
                h1, h2, h3 {
                    color: #ffffff !important;
                    text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
                }

                /* HTML Tables (st.table) - Premium Styling */
                [data-testid="stTable"] {
                    background-color: #050505 !important;
                    border: 1px solid #1a1a1a !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                }
                table {
                    width: 100% !important;
                    color: #fff !important;
                    border-collapse: collapse !important;
                }
                th {
                    background-color: #0a0a0a !important;
                    color: #ffffff !important;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    border-bottom: 2px solid #333 !important;
                    font-weight: 800 !important;
                }
                td {
                    border-bottom: 1px solid #0f0f0f !important;
                    padding: 12px 15px !important;
                }
                tr:hover {
                    background-color: #0a0a0a !important;
                }
                
                /* Card elements */
                div.stForm, .stTabs [data-baseweb="tab-panel"] {
                    background-color: #050505 !important;
                    border: 1px solid #1a1a1a !important;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
                }
                
                /* Tabs Styling */
                .stTabs [data-baseweb="tab-list"] {
                    background-color: transparent !important;
                    gap: 10px;
                }
                .stTabs [data-baseweb="tab"] {
                    background-color: #0a0a0a !important;
                    border-radius: 8px 8px 0 0 !important;
                    color: #888 !important;
                    border: 1px solid #1a1a1a !important;
                    padding: 10px 20px !important;
                }
                .stTabs [aria-selected="true"] {
                    background-color: #151515 !important;
                    color: #ffffff !important;
                    border-bottom: 2px solid #ffffff !important;
                }

                /* Buttons with Neon Glow */
                .stButton > button {
                    background: linear-gradient(145deg, #0a0a0a, #151515);
                    color: #ffffff;
                    border: 1px solid #222;
                    border-radius: 10px;
                    padding: 0.6rem 1.5rem;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.8rem;
                }
                .stButton > button:hover {
                    border-color: #ffffff;
                    color: #ffffff;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                    transform: scale(1.02);
                }
                
                /* Inputs and Icons - GLOBAL FIX */
                .stTextInput input, .stSelectbox [data-baseweb="select"], .stNumberInput input, .stDateInput input, .stTextArea textarea {
                    background-color: #0d0d0d !important;
                    color: #fff !important;
                    border: 1px solid #333 !important;
                    border-radius: 10px !important;
                }

                /* FIX: Numeric Input Buttons (+/-) */
                div[data-testid="stNumberInput"] button {
                    background-color: #1a1a1a !important;
                    color: #ffffff !important;
                    border: 1px solid #333 !important;
                }

                /* FIX: Date Input / Calendar Icon */
                div[data-testid="stDateInput"] button {
                    background-color: transparent !important;
                    color: #ffffff !important;
                }

                /* FIX: Text Area Focus */
                .stTextArea textarea:focus {
                    border-color: #ffffff !important;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) !important;
                }
                
                /* FIX: White background on selectbox trigger and all nested input divs */
                .stSelectbox div[data-baseweb="select"] > div,
                div[data-testid="stTextInput"] > div,
                div[data-testid="stNumberInput"] > div,
                div[data-testid="stDateInput"] > div,
                div[data-testid="stTextArea"] > div {
                    background-color: #0d0d0d !important;
                    color: white !important;
                    border-radius: 10px !important;
                }

                /* FIX: Password field specifically */
                div[data-testid="stTextInput"] [data-baseweb="input"],
                div[data-testid="stTextInput"] [data-baseweb="input"] > div {
                    background-color: #0d0d0d !important;
                }

                /* FIX: Form Submit Buttons (often stay white) */
                div[data-testid="stFormSubmitButton"] button {
                    background: linear-gradient(145deg, #0a0a0a, #151515) !important;
                    color: #ffffff !important;
                    border: 1px solid #222 !important;
                    width: 100%;
                }
                div[data-testid="stFormSubmitButton"] button:hover {
                    border-color: #ffffff !important;
                    color: #ffffff !important;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
                }

                /* Popover/Dropdown menus */
                [data-baseweb="popover"], [data-baseweb="menu"], [data-baseweb="calendar"] {
                    background-color: #0d0d0d !important;
                    color: white !important;
                    border: 1px solid #333 !important;
                }
                [data-baseweb="popover"] li, [data-baseweb="calendar"] div {
                    color: white !important;
                }
                [data-baseweb="popover"] li:hover {
                    background-color: #1a1a1a !important;
                }

                /* Sidebar Navigation Text Visibility */
                [data-testid="stSidebar"] label, [data-testid="stSidebar"] p {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                }
                
                /* Sidebar Radio Buttons */
                [data-testid="stSidebar"] .st-bs, [data-testid="stSidebar"] .st-bt {
                    color: #ffffff !important;
                }
                
                /* Selection state for radio buttons */
                [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
                    font-size: 1.1rem !important;
                }
                
                /* Neon Highlight for active navigation */
                [data-testid="stSidebar"] div[role="radiogroup"] label[data-baseweb="radio"] div:first-child {
                    border-color: #333 !important;
                }
                [data-testid="stSidebar"] div[role="radiogroup"] label[data-checked="true"] p {
                    color: #ffffff !important;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
                [data-testid="stSidebar"] div[role="radiogroup"] label[data-checked="true"] div:first-child {
                    border-color: #ffffff !important;
                    background-color: #ffffff !important;
                }

                /* Header Polish */
                .main .block-container h1 {
                    background: linear-gradient(90deg, #ffffff, #aaaaaa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                    letter-spacing: -1px;
                    margin-bottom: 30px;
                }
                
                /* Ultra-High Visibility Labels */
                label, .main p, .stMarkdown p, .stText, [data-testid="stWidgetLabel"] p {
                    color: #ffffff !important;
                    font-weight: 700 !important;
                    font-size: 1.05rem !important;
                    text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5) !important;
                    margin-bottom: 5px !important;
                }
                
                /* Subheaders and small titles - Extra White */
                h2, h3, .main h1 {
                    color: #ffffff !important;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 800 !important;
                    text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1) !important;
                }

                /* Captions and small text - Still visible */
                .stCaption {
                    color: #cccccc !important;
                    font-weight: 500 !important;
                }

                /* Sidebar title polish - Remove the blue background / box */
                [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
                    background-color: transparent !important;
                    color: #ffffff !important;
                    font-size: 1.2rem !important;
                    letter-spacing: 1px !important;
                    text-transform: uppercase !important;
                }
                
                /* Sidebar Radio container */
                [data-testid="stSidebar"] .stRadio {
                    background-color: rgba(255, 255, 255, 0.03);
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid #1a1a1a;
                    margin-top: 10px;
                }

                /* Custom Badge for Admin (RESTORED to White) */
                .admin-badge {
                    background-color: #151515;
                    color: #ffffff;
                    padding: 5px 15px;
                    border-radius: 20px;
                    border: 1px solid #ffffff;
                    font-size: 0.8rem;
                    display: inline-block;
                    margin-bottom: 20px;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }
                
                /* Sidebar Button (About) visibility */
                [data-testid="stSidebar"] button {
                    width: 100% !important;
                    background-color: #0d0d0d !important;
                    color: #ffffff !important;
                    border: 1px solid #333 !important;
                    font-weight: 700 !important;
                }
                [data-testid="stSidebar"] button:hover {
                    color: #ffffff !important;
                    border-color: #ffffff !important;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                }

                /* Metrics - Now White */
                [data-testid="stMetricValue"] {
                    color: #ffffff !important;
                    font-weight: 800 !important;
                }
                
                /* Info/Alert boxes - Monochrome */
                .stAlert {
                    background-color: #111 !important;
                    color: #ffffff !important;
                    border: 1px solid #333 !important;
                }
                
                /* Scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                    background: #000;
                }
                ::-webkit-scrollbar-thumb {
                    background: #222;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #ffffff;
                }
            </style>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
            <style>
                .stApp {
                    background-color: #f0f2f6;
                }
                div.stDataFrame, div.stForm {
                    background-color: #ffffff;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    border: 1px solid #eef2f6;
                }
                .stButton > button {
                    background-color: #ffffff;
                    border-radius: 10px;
                    border: 1px solid #dce4ec;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }
                .stButton > button:hover {
                    border-color: #3498db;
                    color: #3498db;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.2);
                }

                /* Sidebar Text & Labels - High Prominence */
                [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
                    font-size: 1.15rem !important;
                    font-weight: 700 !important;
                    color: #111111 !important;
                }
                [data-testid="stSidebar"] div[role="radiogroup"] label p {
                    font-size: 1.15rem !important;
                    font-weight: 600 !important;
                }
                [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
                    font-size: 1.4rem !important;
                    font-weight: 800 !important;
                    color: #000000 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* Sidebar Buttons Visibility */
                [data-testid="stSidebar"] button {
                    font-size: 1.05rem !important;
                    font-weight: 700 !important;
                }
            </style>
        """, unsafe_allow_html=True)

apply_theme()

def main():
    st.sidebar.title("🏥 HMS Dashboard")
    
    # Theme Toggle (Sun/Moon Button)
    st.sidebar.markdown(f"**Theme: {st.session_state.theme}**")
    if st.session_state.theme == "Dark":
        if st.sidebar.button("☀️ Switch to Light Mode", use_container_width=True):
            st.session_state.theme = "Light"
            st.rerun()
    else:
        if st.sidebar.button("🌙 Switch to Dark Mode", use_container_width=True):
            st.session_state.theme = "Dark"
            st.rerun()

    st.sidebar.divider()
    
    # Admin Login
    st.sidebar.subheader("🔒 Admin Access")
    if not st.session_state.is_admin:
        admin_password = st.sidebar.text_input("Enter Admin Password", type="password")
        if st.sidebar.button("Login", use_container_width=True):
            if admin_password == "admin123": # Simple password for demo
                st.session_state.is_admin = True
                st.sidebar.success("Logged in as Admin!")
                st.rerun()
            else:
                st.sidebar.error("Incorrect password")
    else:
        st.sidebar.info("Logged in as Admin")
        if st.sidebar.button("Logout", use_container_width=True):
            st.session_state.is_admin = False
            st.rerun()

    st.sidebar.divider()
    
    menu = {
        "🏠 Home": comps.show_home,
        "👥 Patients": comps.show_patients,
        "👨‍⚕️ Doctors": comps.show_doctors,
        "📅 Appointments": comps.show_appointments,
        "💳 Billing": comps.show_billing,
        "💰 Doctor Salaries": comps.show_salaries,
        "📈 Financial Insights": comps.show_financials,
        "📊 Reports": comps.show_reports
    }
    
    # If no choice is made yet (first load), default to Home
    if 'menu_choice' not in st.session_state:
        st.session_state.menu_choice = "🏠 Home"

    choice = st.sidebar.radio("Navigation", list(menu.keys()), index=list(menu.keys()).index(st.session_state.menu_choice))
    
    if choice != st.session_state.menu_choice:
        st.session_state.menu_choice = choice
        st.rerun()
    
    st.sidebar.divider()
    if st.sidebar.button("About"):
        st.sidebar.info("Hospital Management System v3.0 (Advanced)")
    
    # Execute the selected module function
    menu[choice]()

if __name__ == "__main__":
    main()
