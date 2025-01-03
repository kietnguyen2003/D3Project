import pandas as pd

# Load the data file
file_path = '../baseDB/temp.csv'
data = pd.read_csv(file_path)  # Dùng read_csv cho tệp CSV

# Kiểm tra và xử lý dữ liệu thiếu
data.fillna({'RAM (GB)': 0, 'Storage (GB)': 0, 'Actual price': 0, 'Discount price': 0, 'Rating': 0, 'Reviews': 0}, inplace=True)

# Group the data by configuration (RAM and Storage) and aggregate relevant statistics
grouped_data = data.groupby(['RAM (GB)', 'Storage (GB)']).agg({
    'Product Name': 'count',  # Count the number of products
    'Actual price': 'mean',  # Calculate the average Actual price
    'Discount price': 'mean',  # Calculate the average Discount price
    'Rating': 'sum',  # Sum of all ratings
    'Reviews': 'sum'  # Sum of all reviews
}).reset_index()

# Rename the aggregated columns for clarity
grouped_data.rename(columns={
    'Product Name': 'Product Count',
    'Actual price': 'Average Actual Price',
    'Discount price': 'Average Discount Price',
    'Rating': 'Total Ratings',
    'Reviews': 'Total Reviews'
}, inplace=True)

# Save the grouped data to a new CSV file
grouped_output_path = 'chart2_with_config.csv'
grouped_data.to_csv(grouped_output_path, index=False)  # Lưu tệp dưới dạng CSV

print(f"Grouped data saved to: {grouped_output_path}")
