# Visualization Guide

## Chart Selection

| Data Type | Recommended Chart | Use Case |
|-----------|------------------|----------|
| Categorical comparison | Bar chart | Compare values across categories |
| Time series | Line chart | Show trends over time |
| Proportions | Pie chart | Show part-to-whole relationships |
| Correlation | Scatter plot | Show relationship between two variables |

## Bar Chart

Best for: Comparing values across categories (e.g., sales by region, count by status).

```bash
python visualize.py --input data.json --type bar \
  --x category --y value \
  --title "Sales by Category" \
  --output bar_chart.png
```

Tips:
- Limit to 15 categories max for readability
- Sort values descending for easier comparison
- Use horizontal bars for long category names

## Line Chart

Best for: Showing trends over time (e.g., daily revenue, monthly users).

```bash
python visualize.py --input data.json --type line \
  --x date --y revenue \
  --title "Revenue Trend" \
  --output line_chart.png
```

Tips:
- Ensure X-axis is ordered chronologically
- Use markers for data points
- Add grid lines for easier reading

## Pie Chart

Best for: Showing proportions (e.g., market share, budget allocation).

```bash
python visualize.py --input data.json --type pie \
  --x category --y percentage \
  --title "Market Share" \
  --output pie_chart.png
```

Tips:
- Limit to 8 slices max
- Combine small slices into "Other"
- Sort slices by size

## Scatter Plot

Best for: Showing correlation (e.g., price vs. rating, age vs. income).

```bash
python visualize.py --input data.json --type scatter \
  --x price --y rating \
  --title "Price vs Rating" \
  --output scatter.png
```

Tips:
- Both axes must be numeric
- Use transparency for overlapping points
- Consider adding trend line

## Color Guidelines

- Use consistent colors across related charts
- Avoid red/green combinations (color blindness)
- Use sequential color schemes for ordered data
- Use diverging color schemes for positive/negative values
