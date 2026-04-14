import sqlalchemy
from sqlalchemy import create_engine, inspect
import traceback

try:
    engine = create_engine("postgresql+psycopg2://postgres:123456@localhost:5432/movie")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables in PostgreSQL:")
    for table in tables:
        print(f" - {table}")
except Exception as e:
    print("FATAL ERROR:")
    traceback.print_exc()
