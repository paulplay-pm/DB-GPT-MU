#!/usr/bin/env python3
"""Execute SQL queries and return results.

Usage:
    python sql_query.py --db-type sqlite --path db.sqlite --query "SELECT * FROM users LIMIT 10"
    python sql_query.py --db-type mysql --host localhost --user root --password pass --database mydb --query-file query.sql --format csv
"""

import argparse
import csv
import io
import json
import sys

try:
    from sqlalchemy import create_engine, text
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


def execute_query(engine, query, limit=None):
    """Execute a SQL query and return results."""
    # Apply limit if specified and not already in query
    if limit and "limit" not in query.lower():
        query = query.rstrip(";") + f" LIMIT {limit}"
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        columns = list(result.keys())
        rows = [list(row) for row in result]
    
    return {"columns": columns, "rows": rows, "row_count": len(rows)}


def format_json(data):
    """Format results as JSON."""
    return json.dumps(data, ensure_ascii=False, indent=2, default=str)


def format_csv(data):
    """Format results as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(data["columns"])
    writer.writerows(data["rows"])
    return output.getvalue()


def format_table(data):
    """Format results as a simple table."""
    columns = data["columns"]
    rows = data["rows"]
    
    if not rows:
        return "No results."
    
    # Calculate column widths
    widths = [len(str(col)) for col in columns]
    for row in rows:
        for i, val in enumerate(row):
            widths[i] = max(widths[i], len(str(val)))
    
    # Build table
    header = " | ".join(str(col).ljust(widths[i]) for i, col in enumerate(columns))
    separator = "-+-".join("-" * w for w in widths)
    lines = [header, separator]
    
    for row in rows:
        line = " | ".join(str(val).ljust(widths[i]) for i, val in enumerate(row))
        lines.append(line)
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Execute SQL queries")
    parser.add_argument("--db-type", choices=["mysql", "postgresql", "sqlite"], required=True)
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="")
    parser.add_argument("--path", help="SQLite database path")
    parser.add_argument("--driver", help="Database driver")
    parser.add_argument("--query", help="SQL query to execute")
    parser.add_argument("--query-file", help="Path to SQL file")
    parser.add_argument("--format", choices=["json", "csv", "table"], default="json")
    parser.add_argument("--limit", type=int, help="Limit number of rows")
    
    args = parser.parse_args()
    
    if not args.query and not args.query_file:
        print("Error: --query or --query-file is required", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Get query
        if args.query_file:
            with open(args.query_file, "r") as f:
                query = f.read()
        else:
            query = args.query
        
        # Connect and execute
        url = build_connection_url(args)
        engine = create_engine(url)
        data = execute_query(engine, query, limit=args.limit)
        
        # Format output
        if args.format == "json":
            print(format_json(data))
        elif args.format == "csv":
            print(format_csv(data))
        elif args.format == "table":
            print(format_table(data))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
