#!/usr/bin/env python3
"""Data visualization utility for SQL query results.

Supports bar, line, pie, scatter charts using matplotlib.
Usage:
    python visualize.py --input data.json --type bar --x category --y value --output chart.png
    python visualize.py --input data.json --type line --x date --y revenue --title "Revenue Trend"
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.font_manager import FontProperties
except ImportError:
    print("Error: matplotlib is required. Install with: pip install matplotlib", file=sys.stderr)
    sys.exit(1)

try:
    import numpy as np
except ImportError:
    print("Error: numpy is required. Install with: pip install numpy", file=sys.stderr)
    sys.exit(1)


def setup_chinese_font():
    """Try to set up Chinese font support."""
    try:
        # Try common Chinese fonts
        for font_name in ["SimHei", "Microsoft YaHei", "WenQuanYi Micro Hei", "PingFang SC"]:
            try:
                plt.rcParams["font.sans-serif"] = [font_name]
                plt.rcParams["axes.unicode_minus"] = False
                return True
            except Exception:
                continue
    except Exception:
        pass
    return False


def load_data(input_path):
    """Load JSON data from file."""
    with open(input_path, "r") as f:
        data = json.load(f)
    
    # Support both {columns, rows} format and list of dicts
    if "columns" in data and "rows" in data:
        columns = data["columns"]
        rows = data["rows"]
        return columns, rows
    elif isinstance(data, list) and len(data) > 0:
        columns = list(data[0].keys())
        rows = [[row.get(col) for col in columns] for row in data]
        return columns, rows
    else:
        raise ValueError("Unsupported data format")


def get_column_index(columns, col_name):
    """Get column index by name."""
    for i, col in enumerate(columns):
        if col.lower() == col_name.lower():
            return i
    raise ValueError(f"Column '{col_name}' not found. Available: {columns}")


def create_bar_chart(columns, rows, x_col, y_col, title, output_path, color="steelblue"):
    """Create a bar chart."""
    x_idx = get_column_index(columns, x_col)
    y_idx = get_column_index(columns, y_col)
    
    labels = [str(row[x_idx]) for row in rows]
    values = [float(row[y_idx]) for row in rows]
    
    fig, ax = plt.subplots(figsize=(12, 6))
    x = np.arange(len(labels))
    ax.bar(x, values, color=color)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.set_title(title, fontsize=14, fontweight="bold")
    ax.set_ylabel(y_col)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path


def create_line_chart(columns, rows, x_col, y_col, title, output_path, color="steelblue"):
    """Create a line chart."""
    x_idx = get_column_index(columns, x_col)
    y_idx = get_column_index(columns, y_col)
    
    x_values = [str(row[x_idx]) for row in rows]
    y_values = [float(row[y_idx]) for row in rows]
    
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(range(len(x_values)), y_values, marker="o", color=color, linewidth=2)
    ax.set_xticks(range(len(x_values)))
    ax.set_xticklabels(x_values, rotation=45, ha="right")
    ax.set_title(title, fontsize=14, fontweight="bold")
    ax.set_ylabel(y_col)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path


def create_pie_chart(columns, rows, x_col, y_col, title, output_path):
    """Create a pie chart."""
    x_idx = get_column_index(columns, x_col)
    y_idx = get_column_index(columns, y_col)
    
    labels = [str(row[x_idx]) for row in rows]
    values = [float(row[y_idx]) for row in rows]
    
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.pie(values, labels=labels, autopct="%1.1f%%", startangle=90)
    ax.set_title(title, fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path


def create_scatter_chart(columns, rows, x_col, y_col, title, output_path, color="steelblue"):
    """Create a scatter plot."""
    x_idx = get_column_index(columns, x_col)
    y_idx = get_column_index(columns, y_col)
    
    x_values = [float(row[x_idx]) for row in rows]
    y_values = [float(row[y_idx]) for row in rows]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.scatter(x_values, y_values, color=color, alpha=0.7)
    ax.set_title(title, fontsize=14, fontweight="bold")
    ax.set_xlabel(x_col)
    ax.set_ylabel(y_col)
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Data visualization utility")
    parser.add_argument("--input", required=True, help="Input JSON file path")
    parser.add_argument("--type", choices=["bar", "line", "pie", "scatter"], required=True)
    parser.add_argument("--x", required=True, help="X-axis column name")
    parser.add_argument("--y", required=True, help="Y-axis column name")
    parser.add_argument("--title", default="Chart", help="Chart title")
    parser.add_argument("--output", default="chart.png", help="Output file path")
    parser.add_argument("--color", default="steelblue", help="Chart color")
    
    args = parser.parse_args()
    
    try:
        setup_chinese_font()
        columns, rows = load_data(args.input)
        
        if args.type == "bar":
            output = create_bar_chart(columns, rows, args.x, args.y, args.title, args.output, args.color)
        elif args.type == "line":
            output = create_line_chart(columns, rows, args.x, args.y, args.title, args.output, args.color)
        elif args.type == "pie":
            output = create_pie_chart(columns, rows, args.x, args.y, args.title, args.output)
        elif args.type == "scatter":
            output = create_scatter_chart(columns, rows, args.x, args.y, args.title, args.output, args.color)
        
        print(json.dumps({"status": "success", "output": output}, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
