import pandas as pd

# Đọc dữ liệu từ file Excel
df = pd.read_excel('check.xlsx')

# Lọc các cột cần thiết
filtered_data = df[['Stars','Rating', 'Reviews', 'Brand']].copy()

# Xử lý các giá trị null và ký tự đặc biệt
filtered_data['Stars'] = filtered_data['Stars'].fillna('0')
filtered_data['Rating'] = (
    filtered_data['Rating']
    .str.replace(',', '', regex=False)  # Loại bỏ dấu phẩy
    .str.replace(' Ratings', '', regex=False)
    .replace('', '0')
    .astype(int)
)
filtered_data['Reviews'] = (
    filtered_data['Reviews']
    .str.replace(',', '', regex=False)  # Loại bỏ dấu phẩy
    .str.replace(' Reviews', '', regex=False)
    .replace('', '0')
    .astype(int)
)

# Nhóm dữ liệu theo tên sản phẩm và tính trung bình các chỉ số
aggregated_data = (
    filtered_data.groupby(['Brand'], as_index=False)
    .agg({
        'Stars': 'mean',
        'Rating': 'sum',
        'Reviews': 'sum'
    })
)

# Sắp xếp dữ liệu theo mức độ tin cậy
sorted_data = aggregated_data.sort_values(by=['Stars','Rating', 'Reviews'], ascending=False)

# Xuất dữ liệu ra file JSON
output_file_path = 'data.json'
sorted_data.to_json(output_file_path, orient='records', force_ascii=False)

# Xuất thêm dữ liệu ra file CSV
csv_file_path = 'chart1.csv'
sorted_data.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

# Kết quả
print(f"JSON file exported to: {output_file_path}")
print(f"CSV file exported to: {csv_file_path}")
