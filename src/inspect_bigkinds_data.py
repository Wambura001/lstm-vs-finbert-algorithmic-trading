
from pathlib import Path
import pandas as pd

# Locate the cleaned dataset produced by the previous script.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "bigkinds_news_clean.csv"
)

# Load the cleaned CSV. BIG KINDS Korean text is preserved by utf-8-sig.
df = pd.read_csv(DATA_FILE, encoding="utf-8-sig")

# Convert dates back to pandas datetime values for date analysis.
df["News_Date"] = pd.to_datetime(df["News_Date"], errors="coerce")

print("\n1. Overall date coverage")
print("Earliest:", df["News_Date"].min())
print("Latest:", df["News_Date"].max())
print("Calendar dates:", df["News_Date"].dt.date.nunique())

print("\n2. Articles per date")
daily_counts = df.groupby(df["News_Date"].dt.date).size()
print(daily_counts.describe())

print("\n3. Financial flag distribution")
print(df["Is_Financial_News"].value_counts(dropna=False))

print("\n4. Articles per month")
print(df.groupby(df["News_Date"].dt.to_period("M")).size())

print("\n5. Most common headlines")
print(df["Headline"].value_counts().head(15))

print("\n6. Sample financial articles")
financial = df[df["Is_Financial_News"].astype(str).str.lower() == "true"]
print(financial[["News_Date", "Publisher", "Headline"]].head(20).to_string(index=False))
