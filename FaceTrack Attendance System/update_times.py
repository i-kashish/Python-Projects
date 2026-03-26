import pandas as pd
from datetime import datetime
import os

def update_times():
    if not os.path.exists('attendance.xlsx'):
        return
        
    try:
        df = pd.read_excel('attendance.xlsx')
        
        def convert_time(t_str):
            try:
                # Try parsing as HH:MM:SS
                return datetime.strptime(str(t_str), "%H:%M:%S").strftime("%I:%M %p")
            except:
                try:
                    # In case it's just HH:MM
                    return datetime.strptime(str(t_str), "%H:%M").strftime("%I:%M %p")
                except:
                    return t_str
                
        if 'Time' in df.columns:
            df['Time'] = df['Time'].apply(convert_time)
            df.to_excel('attendance.xlsx', index=False)
            print("Successfully updated times in attendance.xlsx.")
    except Exception as e:
        print(f"Error updating times: {e}")

if __name__ == "__main__":
    update_times()
