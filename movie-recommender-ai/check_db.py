import pandas as pd
from sqlalchemy import create_engine

DB_URL = "postgresql+psycopg2://postgres.matjcxyattaokehxibbk:E%2C%21kA%40x65J%3F377f@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

def check_tables():
    engine = create_engine(DB_URL)
    try:
        query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        df = pd.read_sql(query, engine)
        print("Tables in public schema:")
        print(df['table_name'].tolist())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_tables()
