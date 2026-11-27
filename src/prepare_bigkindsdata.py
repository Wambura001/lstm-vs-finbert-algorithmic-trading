
"""
Prepare historical Korean news data exported from BIG KINDS.

Purpose
-------
1. Load a BIG KINDS Excel (.xlsx) or tab-separated text (.txt) export.
2. Standardize important columns.
3. Parse dates and remove invalid records.
4. Remove duplicate articles.
5. Flag potentially relevant financial/economic news.
6. Print a data-quality report.
7. Save a clean dataset for the sentiment-analysis stage.

This script prepares data only. It does not run KR-FinBERT-SC
or train the LSTM model.

Expected project structure
--------------------------
lstm-vs-finbert-algorithmic-trading/
├── data/
│   ├── raw/
│   │   └── your_bigkinds_export.xlsx
│   └── processed/
├── src/
│   └── prepare_bigkinds_data.py
└── ...

Run from the project root:
    python src/prepare_bigkinds_data.py
"""

from pathlib import Path
import pandas as pd


# ============================================================
# 1. CONFIGURATION
# ============================================================

# Find the project root from this script's location.
# This makes the paths work even if you run the script from
# another current directory, as long as the project structure
# remains unchanged.
PROJECT_ROOT = Path(__file__).resolve().parents[1]

# IMPORTANT:
# Change this filename to match your actual BIG KINDS export.
#
# Examples:
#   data/raw/bigkinds_news.xlsx
#   data/raw/bigkinds_news.txt
#
# The script supports .xlsx, .xls, and tab-separated .txt files.
INPUT_FILE = PROJECT_ROOT / "data" / "raw" / "bigkinds_news.xlsx"

# The cleaned data will be written to this location.
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "bigkinds_news_clean.csv"


# ============================================================
# 2. LOAD THE SOURCE FILE
# ============================================================

def load_bigkinds_file(file_path: Path) -> pd.DataFrame:
    """
    Load an Excel workbook or a tab-separated BIG KINDS text export.

    All columns are initially read as strings so identifiers,
    Korean text, and other values are not accidentally converted
    to numbers.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"Input file not found:\n{file_path}\n\n"
            "Check INPUT_FILE at the top of this script and make "
            "sure the original export is inside data/raw/."
        )

    suffix = file_path.suffix.lower()

    if suffix in {".xlsx", ".xls"}:
        # For Excel files, read the first worksheet by default.
        # If your data is on another sheet, specify sheet_name.
        df = pd.read_excel(
            file_path,
            dtype=str
        )

    elif suffix == ".txt":
        # BIG KINDS text exports are often tab-separated.
        # utf-8-sig also handles files containing a UTF-8 BOM.
        df = pd.read_csv(
            file_path,
            sep="\t",
            dtype=str,
            encoding="utf-8-sig",
            low_memory=False
        )

    else:
        raise ValueError(
            f"Unsupported file type: {suffix}. "
            "Use .xlsx, .xls, or .txt."
        )

    # Normalize column headers by removing accidental spaces.
    df.columns = df.columns.astype(str).str.strip()

    print(f"Loaded file: {file_path.name}")
    print(f"Original dataset shape: {df.shape}")

    return df


# ============================================================
# 3. VALIDATE REQUIRED COLUMNS
# ============================================================

def validate_columns(df: pd.DataFrame) -> None:
    """
    Confirm that the source contains the columns required below.

    BIG KINDS exports may differ depending on the selected export
    options. If a required column is missing, stop with a clear
    error rather than silently producing misleading results.
    """

    required_columns = [
        "뉴스 식별자",
        "일자",
        "언론사",
        "제목",
        "통합 분류1",
        "통합 분류2",
        "통합 분류3",
        "URL",
    ]

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "The following expected BIG KINDS columns are missing:\n"
            + "\n".join(f"- {col}" for col in missing_columns)
            + "\n\nCheck the export's column names before continuing."
        )


# ============================================================
# 4. STANDARDIZE IMPORTANT FIELDS
# ============================================================

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create consistent English-named columns for downstream code.

    The original Korean fields remain in df until the final
    selection of output columns.
    """

    df = df.copy()

    # Remove surrounding whitespace and convert missing text to
    # empty strings. This makes later filtering more predictable.
    for col in df.columns:
        df[col] = df[col].fillna("").astype(str).str.strip()

    # Create simpler names for the fields used in our pipeline.
    df["News_ID"] = df["뉴스 식별자"]
    df["Publisher"] = df["언론사"]
    df["Headline"] = df["제목"]
    df["URL"] = df["URL"]

    # BIG KINDS usually provides dates in YYYYMMDD format,
    # for example 20261028. Invalid dates become NaT.
    df["News_Date"] = pd.to_datetime(
        df["일자"],
        format="%Y%m%d",
        errors="coerce"
    )

    return df


# ============================================================
# 5. CLEAN INVALID RECORDS AND DUPLICATES
# ============================================================

def clean_records(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove records that cannot be used and identify duplicates.

    We retain one row per non-empty News_ID. Rows with no ID are
    not automatically treated as duplicates because a missing ID
    does not establish that two articles are the same.
    """

    original_count = len(df)

    # A valid article must have a recognizable date and a headline.
    valid_mask = (
        df["News_Date"].notna()
        & df["Headline"].ne("")
    )

    df = df.loc[valid_mask].copy()

    removed_invalid = original_count - len(df)

    # Only deduplicate records with a non-empty article identifier.
    # Otherwise, multiple articles with blank IDs could all be
    # incorrectly collapsed into a single row.
    has_id = df["News_ID"].ne("")

    identified_articles = df.loc[has_id].drop_duplicates(
        subset=["News_ID"],
        keep="first"
    )

    unidentified_articles = df.loc[~has_id]

    df = pd.concat(
        [identified_articles, unidentified_articles],
        axis=0
    ).sort_index()

    removed_duplicates = (
        original_count
        - removed_invalid
        - len(df)
    )

    print("\n--- Cleaning report ---")
    print(f"Rows removed for invalid date/headline: {removed_invalid}")
    print(f"Duplicate rows removed: {removed_duplicates}")
    print(f"Rows remaining: {len(df)}")

    return df


# ============================================================
# 6. FLAG POTENTIALLY RELEVANT FINANCIAL NEWS
# ============================================================

def flag_financial_news(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create a preliminary financial-news flag using BIG KINDS
    classification fields.

    This is a first-pass filter, not a perfect relevance detector.
    It may exclude useful articles or include irrelevant ones.

    We should inspect the category distribution and revise this
    rule based on the actual dataset and research question.
    """

    df = df.copy()

    category_columns = [
        "통합 분류1",
        "통합 분류2",
        "통합 분류3",
    ]

    # Combine all three classification fields into one searchable
    # string per article. Missing values are treated as empty text.
    category_text = (
        df[category_columns]
        .fillna("")
        .astype(str)
        .agg(" ".join, axis=1)
    )

    # Match selected BIG KINDS category labels.
    # The expression uses Korean category names as they appear
    # in the export.
    financial_pattern = (
        r"증권_증시|금융_재테크|경제일반|국제경제"
    )

    df["Is_Financial_News"] = category_text.str.contains(
        financial_pattern,
        regex=True,
        na=False
    )

    return df


# ============================================================
# 7. PRINT A DATA-QUALITY REPORT
# ============================================================

def report_data_quality(df: pd.DataFrame) -> None:
    """
    Summarize the cleaned dataset before saving it.

    These checks help us determine whether the historical dataset
    has sufficient dates and whether its contents look reasonable.
    """

    print("\n========== DATA QUALITY REPORT ==========")
    print(f"Total cleaned articles: {len(df):,}")

    if df.empty:
        print("WARNING: No valid articles remain after cleaning.")
        return

    print(
        "Date coverage: "
        f"{df['News_Date'].min().date()} to "
        f"{df['News_Date'].max().date()}"
    )

    print(
        "Number of unique publication dates: "
        f"{df['News_Date'].nunique():,}"
    )

    print(
        "Number of unique publishers: "
        f"{df['Publisher'].nunique():,}"
    )

    print(
        "Articles with an ID: "
        f"{df['News_ID'].ne('').sum():,}"
    )

    print(
        "Articles flagged as financial/economic: "
        f"{df['Is_Financial_News'].sum():,}"
    )

    print(
        "Articles not flagged: "
        f"{(~df['Is_Financial_News']).sum():,}"
    )

    # Show how many articles are available on each date.
    # This helps identify dates with little or no news coverage.
    daily_counts = (
        df.groupby(df["News_Date"].dt.date)
        .size()
        .sort_index()
    )

    print("\nArticle-count summary per date:")
    print(daily_counts.describe())

    # Display the most common publishers. A very concentrated
    # source distribution may affect the dataset's coverage.
    print("\nTop 10 publishers:")
    print(df["Publisher"].value_counts().head(10))

    # Inspect the most common classification labels.
    # This helps us refine the financial-news filter if needed.
    print("\nMost common primary categories:")
    print(df["통합 분류1"].value_counts().head(15))

    print("=========================================\n")


# ============================================================
# 8. SELECT OUTPUT COLUMNS AND SAVE THE CLEAN DATASET
# ============================================================

def save_clean_dataset(df: pd.DataFrame) -> None:
    """
    Save only the columns needed for the next stage.

    The cleaned file retains all valid articles, including those
    whose preliminary financial-news flag is False. This is
    intentional: we should inspect the distribution before
    permanently excluding any potentially useful news.
    """

    output_columns = [
        "News_ID",
        "News_Date",
        "Publisher",
        "Headline",
        "Is_Financial_News",
        "URL",
    ]

    # Create the output folder if it does not already exist.
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Sort by publication date to make the dataset easier to inspect.
    output_df = (
        df[output_columns]
        .sort_values("News_Date")
        .reset_index(drop=True)
    )

    # Save as UTF-8 CSV so Korean headlines remain readable.
    output_df.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    print(f"Clean dataset saved to:\n{OUTPUT_FILE}")
    print(f"Final output shape: {output_df.shape}")


# ============================================================
# 9. RUN THE PIPELINE
# ============================================================

def main() -> None:
    """Execute the data preparation stages in the correct order."""

    # Step 1: Load the raw BIG KINDS export.
    df = load_bigkinds_file(INPUT_FILE)

    # Step 2: Check that the required fields exist.
    validate_columns(df)

    # Step 3: Standardize important fields and parse dates.
    df = standardize_columns(df)

    # Step 4: Remove invalid rows and duplicate identified articles.
    df = clean_records(df)

    # Step 5: Flag potentially relevant financial/economic news.
    df = flag_financial_news(df)

    # Step 6: Print diagnostics so we can evaluate data quality.
    report_data_quality(df)

    # Step 7: Save the cleaned dataset for sentiment analysis.
    save_clean_dataset(df)


# This condition prevents the pipeline from running automatically
# if the file is imported into another Python script.
if __name__ == "__main__":
    main()
