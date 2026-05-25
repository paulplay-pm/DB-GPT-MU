---
name: sql-data-analysis
description: >
  Execute SQL queries against databases, analyze results, and generate visualizations.
  Use when the user needs to: (1) Query a database with SQL, (2) Analyze query results
  with statistics or aggregations, (3) Create charts from database data (bar, line, pie,
  scatter), (4) Explore database schema or table structures, (5) Generate data analysis
  reports from SQL query results. Supports MySQL, PostgreSQL, SQLite.
---

# SQL Data Analysis Skill

## Quick Start

1. Query the database using `sql_query.py`
2. Analyze results or pass to visualization
3. Generate charts using `visualize.py`
4. Present findings in HTML report

## Scripts

### db_connect.py

Test database connectivity and list tables.

```bash
python db_connect.py --db-type mysql --host localhost --port 3306 --user root --password pass --database mydb --action test
```

Output: JSON with `status`, `tables` list, and connection info.

### sql_query.py

Execute SQL queries and save results.

```bash
python sql_query.py --db-type mysql --host localhost --port 3306 --user root --password pass \
  --database mydb --query "SELECT * FROM orders LIMIT 10" \
  --format json
```

Output: JSON with `columns` and `rows` arrays.

### visualize.py

Create charts from query results.

```bash
python visualize.py --input results.json --type bar \
  --x category --y total --title "Sales by Category" \
  --output chart.png
```

Supported types: `bar`, `line`, `pie`, `scatter`.

## Workflow

### Step 1: Explore Schema

Run `db_connect.py` with `--action tables` to verify connection and list available tables.

### Step 2: Write Query

Construct SQL based on user requirements. Reference [sql_patterns.md](references/sql_patterns.md) for common patterns.

**Important**: Always use `LIMIT` for exploratory queries. Never run `UPDATE`/`DELETE`/`INSERT`.

### Step 3: Execute Query

Run `sql_query.py` with the query. Check row count:
- 0 rows: Query returned no data — inform user
- 1-50 rows: Good for analysis
- 50+ rows: Consider aggregation or sampling

### Step 4: Visualize (if requested)

Choose chart type based on data:
- **Bar**: Categorical comparison
- **Line**: Time series trends
- **Pie**: Proportions (≤8 categories)
- **Scatter**: Correlation between two numeric variables

See [visualization_guide.md](references/visualization_guide.md) for detailed guidance.

### Step 5: Generate Report

Use `html_interpreter` to present results:
- Include query used
- Show key statistics (count, sum, avg, min, max)
- Embed chart images
- Provide analysis insights

## Chart Type Selection

| Scenario | Chart Type |
|----------|------------|
| Compare categories | bar |
| Show trend over time | line |
| Show proportions | pie |
| Show correlation | scatter |

## Error Handling

- **Connection failed**: Verify host/port/credentials
- **Column not found**: Check column names in error message
- **No data**: Adjust query filters or date range
- **Too many rows**: Add LIMIT or use aggregation

## Notes

- All scripts output JSON to stdout for easy parsing
- Chinese font support is auto-detected in visualize.py
- Use `--format json` for programmatic consumption
- For large datasets, aggregate in SQL before visualization
