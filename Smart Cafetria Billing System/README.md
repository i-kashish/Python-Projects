# Smart Cafeteria Dashboard

A professional Streamlit-based dashboard for managing a smart cafeteria. Features include employee management, attendance tracking, menu management, order processing, and salary calculations.

## Features

- **Dashboard**: Real-time visualization of revenue, tips, and order trends.
- **Attendance**: Track employee entry and exit times with status updates.
- **Menu Management**: Manage vegetarian menu items with nutritional information and images.
- **Order Processing**: Prepaid wallet system for seamless cafeteria transactions.
- **Salary Management**: Monthly salary calculation based on attendance and performance.
- **Digital Invoices**: Generate PDF bills for every transaction.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd scbc
   ```

2. **Install dependencies**:
   Ensure you have Python 3.8+ installed. Run:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

To run the application locally:
```bash
streamlit run app.py
```
The application will be accessible at `http://localhost:8501`.

## Database

The application uses SQLite for data storage. The database file is located in the `data/` directory as `smart_cafeteria.db`.

## License

MIT License.
