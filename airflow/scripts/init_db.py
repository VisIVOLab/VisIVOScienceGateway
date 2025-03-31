import os
import psycopg2

# Get DB credentials from environment variables
DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_DB_HOST")
DB_PORT = os.getenv("POSTGRES_DB_PORT", "5432")  # Default to 5432 if not provided


# Connect to PostgreSQL
try:
    conn = psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Create user_dags table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_dags (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            dag_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, dag_id)
        );
    """)

    print("Table 'user_dags' created successfully (if not exists).")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error initializing database: {e}")