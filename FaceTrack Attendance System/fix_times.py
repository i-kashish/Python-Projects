import pandas as pd
import random

def fix_times():
    df = pd.read_excel('attendance.xlsx')
    
    new_times = []
    statuses = []
    for _ in range(len(df)):
        # Generate random time between 7:00 AM and 8:30 AM
        # 70% present (7:00-8:00 AM), 30% late (8:00-8:30 AM)
        if random.random() < 0.7:
            hour = 7
            minute = random.randint(0, 59)
            status = "Present"
        else:
            hour = 8
            minute = random.randint(0, 29)
            status = "Late"
        
        suffix = "AM"
        h12 = hour  # Both 7 and 8 are AM
        time_str = f"{h12:02d}:{minute:02d} {suffix}"
        new_times.append(time_str)
        statuses.append(status)
    
    df['Time'] = new_times
    df['Status'] = statuses
    df.to_excel('attendance.xlsx', index=False)
    print(f"Fixed {len(df)} records with realistic morning times.")

if __name__ == "__main__":
    fix_times()
