import sqlite3
import csv
import sys

# For converting the sqlite database (previous version) to csv (current version)
# Run this script using: python scripts/migrate_to_csv.py <path_to_db> > <path_to_csv>

def migrate():
    db_path = sys.argv[1]
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 1. Fetch Transactions
        # Map: date, name, amount, category(from buckets), category_limit(0), notes
        query_txns = """
        SELECT t.date, t.name, t.amount, b.category, t.notes
        FROM budget_transactions t
        JOIN budget_buckets b ON t.category_id = b.id
        """
        cursor.execute(query_txns)
        txns = cursor.fetchall()

        # 2. Fetch Buckets (as limit records)
        # Map: year-month-01, "", 0, category, amount(limit), ""
        query_buckets = """
        SELECT month, year, category, amount
        FROM budget_buckets
        """
        cursor.execute(query_buckets)
        buckets = cursor.fetchall()

        # 3. Write to stdout in CSV format
        writer = csv.writer(sys.stdout)
        
        # Header
        writer.writerow(['date', 'name', 'amount', 'category', 'category_limit', 'notes'])

        # Writing transactions
        for date, name, amount, category, notes in txns:
            writer.writerow([date, name, amount, category, "0", notes])

        # Writing bucket limits
        for month, year, category, limit in buckets:
            # We use the 1st of the month as the date for bucket definitions
            date = f"{year}-{month:02d}-01"
            writer.writerow([date, "", "0", category, limit, ""])

        conn.close()
    except sqlite3.Error as e:
        print(f"SQLite error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    migrate()
