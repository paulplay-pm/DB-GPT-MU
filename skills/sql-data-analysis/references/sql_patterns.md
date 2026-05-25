# SQL Query Patterns

## Common Analysis Patterns

### 1. Aggregation
```sql
-- Count by category
SELECT category, COUNT(*) as count
FROM table_name
GROUP BY category
ORDER BY count DESC;

-- Sum with date grouping
SELECT DATE(created_at) as date, SUM(amount) as total
FROM orders
GROUP BY DATE(created_at)
ORDER BY date;
```

### 2. Filtering
```sql
-- Date range
SELECT * FROM table_name
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- Multiple conditions
SELECT * FROM table_name
WHERE status = 'active' AND amount > 100;
```

### 3. Joins
```sql
-- Inner join
SELECT a.*, b.name
FROM table_a a
JOIN table_b b ON a.b_id = b.id;

-- Left join with aggregation
SELECT a.name, COUNT(b.id) as count
FROM table_a a
LEFT JOIN table_b b ON a.id = b.a_id
GROUP BY a.name;
```

### 4. Window Functions
```sql
-- Running total
SELECT date, amount,
       SUM(amount) OVER (ORDER BY date) as running_total
FROM daily_sales;

-- Rank within group
SELECT name, department, salary,
       RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;
```

### 5. Subqueries
```sql
-- IN subquery
SELECT * FROM orders
WHERE customer_id IN (
    SELECT id FROM customers WHERE status = 'VIP'
);

-- Correlated subquery
SELECT * FROM orders o
WHERE amount > (
    SELECT AVG(amount) FROM orders
    WHERE customer_id = o.customer_id
);
```

## Performance Tips

- Use `EXPLAIN` to analyze query plans
- Add indexes on frequently filtered/joined columns
- Avoid `SELECT *` - specify needed columns
- Use `LIMIT` for exploratory queries
- Prefer `WHERE` over `HAVING` when possible
