import os
import pandas as pd

# Path to the temp.csv file
file_path = r'c:\Users\Asus\Desktop\TQHDL\D3\baseDB\temp.csv'

if not os.path.exists(file_path):
    print(f"Error: File not found at {file_path}. Please verify the file location.")
else:
    data = pd.read_csv(file_path)
    print("File successfully loaded from temp.csv.")

# Ensure columns are properly cleaned and processed
data.replace({' ': '0', 'NIL': '0', 'NaN': '0'}, inplace=True)

# Convert Actual price and Discount price to numeric, coercing errors
data['Actual price'] = pd.to_numeric(
    data['Actual price'], errors='coerce'
).fillna(0)

data['Discount price'] = pd.to_numeric(
    data['Discount price'], errors='coerce'
).fillna(0)

# Process Rating and Reviews columns
data['Rating'] = pd.to_numeric(data['Rating'], errors='coerce').fillna(0).astype(int)
data['Reviews'] = pd.to_numeric(data['Reviews'], errors='coerce').fillna(0).astype(int)

# Calculate total ratings and reviews
data['total_ratings_reviews'] = data['Rating'] + data['Reviews']

# Define thresholds
low_threshold = 50
high_threshold = 200

# Define the classification logic
def classify_brand(row):
    if row['total_ratings_reviews'] < low_threshold:
        if row['Stars'] < 4.0:
            return 'Low popularity and low ratings'
        elif row['Stars'] >= 4.5:
            return 'Lower popularity but highly rated'
        else:
            return 'Lower popularity and moderate ratings'
    elif low_threshold <= row['total_ratings_reviews'] <= high_threshold:
        if row['Stars'] >= 4.5:
            return 'Medium popularity and highly rated'
        elif 4.0 <= row['Stars'] < 4.5:
            return 'Medium popularity and moderate ratings'
        else:
            return 'Medium popularity and low ratings'
    elif row['total_ratings_reviews'] > high_threshold:
        if row['Stars'] >= 4.5:
            return 'High popularity and highly rated'
        elif 4.0 <= row['Stars'] < 4.5:
            return 'High popularity and moderate ratings'
        else:
            return 'High popularity but low ratings'
    return 'Unclassified'

# Apply the classification logic
data['classification'] = data.apply(classify_brand, axis=1)

# Fill any remaining empty or NaN fields with 0
data.fillna(0, inplace=True)

# Export updated data back to temp.csv
csv_file_path = 'temp.csv'
data.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

print(f"CSV file updated and exported to: {csv_file_path}")
