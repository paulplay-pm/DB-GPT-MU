#!/usr/bin/env python3
"""Database connection utility for SQL data analysis.

Supports MySQL, PostgreSQL, SQLite with SQLAlchemy.
Usage:
    python db_connect.py --db-type mysql --host localhost --port 3306 --user root --password pass --database mydb
    python db_connect.py --db-type sqlite --path /path/to/db.sqlite
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import OperationalError
except ImportError:
    print("Error: sqlalchemy is required. Install with: pip install sqlalchemy", file=sys.stderr)
    sys.exit(1)


def build_connection_url(args):
    """Build SQLAlchemy connection URL from arguments."""
    if args.db_type == "sqlite":
        if not args.path:
            raise ValueError("--path is required for SQLite")
        return f"sqlite:///{args.path}"
    elif args.db_type == "mysql":
        driver = args.driver or "pymysql"
        return f"mysql+{driver}://{args.user}:{args.password}@{args.host}:{args.port}/{args.database}"
    elif args.db_type == "postgresql":
        driver = args.driver or "psycopg2"
        return f"postgresql+{driver}://{args.user}:{args.password}@{args.host}:{args.port}/{args.database}"
    else:
        raise ValueError(f"Unsupported database type: {args.db_type}")


def test_connection(engine):
    """Test database connection and return status info."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        return {"status": "success", "message": "Connection successful"}
    except OperationalError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_table_info(engine):
    """Get list of tables and their row counts."""
    tables = []
    try:
        with engine.connect() as conn:
            # Get table names
            result = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = DATABASE() ORDER BY table_name"
            ))
            table_names = [row[0] for row in result]
            
            for table_name in table_names:
                count_result = conn.execute(text(f"SELECT COUNT(*) FROM `{table_name}`"))
                count = count_result.fetchone()[0]
                tables.append({"table": table_name, "rows": count})
    except Exception:
        # Fallback for SQLite
        try:
            with engine.connect() as conn:
                result = conn.execute(text(
                    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
                ))
                table_names = [row[0] for row in result]
                for table_name in table_names:
                    count_result = conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"'))
                    count = count_result.fetchone()[0]
                    tables.append({"table": table_name, "rows": count})
        except Exception as e:
            return {"error": str(e)}
    return {"tables": tables}


def main():
    parser = argparse.ArgumentParser(description="Database connection utility")
    parser.add_argument("--db-type", choices=["mysql", "postgresql", "sqlite"], required=True)
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="")
    parser.add_argument("--path", help="SQLite database path")
    parser.add_argument("--driver", help="Database driver (e.g., pymysql, psycopg2)")
    parser.add_argument("--action", choices=["test", "tables"], default="test")
    
    args = parser.parse_args()
    
    try:
        url = build_connection_url(args)
        engine = create_engine(url)
        
        if args.action == "test":
            result = test_connection(engine)
        elif args.action == "tables":
            result = get_table_info(engine)
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
