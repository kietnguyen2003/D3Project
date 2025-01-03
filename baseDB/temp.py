import pandas as pd

# Load the provided data file
file_path = './check.xlsx'
data = pd.read_excel(file_path)

# Replace unwanted values (' ', 'NIL', 'NaN') with '0' for numeric conversion
data.replace({' ': '0', 'NIL': '0', 'NaN': '0'}, inplace=True)

# Process the data according to the requirements
data['Actual price'] = data['Actual price'].str.replace('₹', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(float)
data['Discount price'] = data['Discount price'].str.replace('₹', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(float)
data['Rating'] = data['Rating'].str.replace(' Ratings', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(int)
data['Reviews'] = data['Reviews'].str.replace(' Reviews', '', regex=False).str.replace(',', '', regex=False).fillna(0).astype(int)

# Fill any remaining empty or NaN fields with 0
data.fillna(0, inplace=True)

# Xuất thêm dữ liệu ra file CSV
csv_file_path = 'temp.csv'
data.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

# Kết quả
print(f"CSV file exported to: {csv_file_path}")