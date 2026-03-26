import streamlit as st
import pandas as pd
import plotly.express as px
import os
from datetime import datetime

# Page Config
st.set_page_config(page_title="Attendance Analytics Pro", page_icon="📊", layout="wide")

# Theme / CSS
st.markdown("""
    <style>
    .main {
        background-color: #f8fafc;
    }
    .stMetric {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    </style>
    """, unsafe_allow_html=True)

st.title("📊 Attendance Analytics Dashboard")
st.markdown("---")

# Data Loading
def load_data():
    file_path = "attendance.xlsx"
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        # Ensure Status column exists (for older data)
        if 'Status' not in df.columns:
            df['Status'] = 'Present'
        return df
    return pd.DataFrame()

df = load_data()

if df.empty:
    st.warning("No attendance data found. Start marking attendance in the Tkinter app to see stats here!")
else:
    # Sidebar Filters
    st.sidebar.header("Filters")
    all_names = ["All"] + sorted(df['Name'].unique().tolist())
    selected_name = st.sidebar.selectbox("Filter by Student", all_names)
    
    date_range = st.sidebar.date_input("Date Range", 
                                     [df['Date'].min() if isinstance(df['Date'].min(), datetime) else datetime.now(), 
                                      datetime.now()])

    # Filtering Logic
    filtered_df = df.copy()
    if selected_name != "All":
        filtered_df = filtered_df[filtered_df['Name'] == selected_name]

    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Records", len(filtered_df))
    with col2:
        st.metric("Unique Students", filtered_df['Name'].nunique())
    with col3:
        late_count = len(filtered_df[filtered_df['Status'] == 'Late'])
        st.metric("Late Count", late_count, delta=f"{late_count/len(filtered_df)*100:.1f}% ratio", delta_color="inverse")
    with col4:
        st.metric("Last Updated", datetime.now().strftime("%I:%M %p"))

    st.markdown("### Visual Insights")
    
    c1, c2 = st.columns(2)
    
    with c1:
        # Status Distribution (Pie)
        fig_pie = px.pie(filtered_df, names='Status', title="Present vs Late Distribution",
                         color_discrete_sequence=['#6366f1', '#f43f5e', '#10b981'])
        fig_pie.update_traces(textposition='inside', textinfo='percent+label')
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with c2:
        # Daily Trend (Line)
        trend_df = filtered_df.groupby('Date').size().reset_index(name='Count')
        fig_line = px.line(trend_df, x='Date', y='Count', title="Daily Attendance Frequency",
                           line_shape='spline', render_mode='svg')
        fig_line.update_traces(line_color='#6366f1', line_width=3)
        st.plotly_chart(fig_line, use_container_width=True)

    # Raw Data
    with st.expander("View Raw Attendance Logs"):
        st.dataframe(filtered_df.sort_values(by=['Date', 'Time'], ascending=False), use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.info("This dashboard reads directly from your `attendance.xlsx` file.")
