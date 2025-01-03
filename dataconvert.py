import pandas as pd

# Đọc dữ liệu từ file Excel
df = pd.read_excel('check.xlsx')

# Lọc các cột cần thiết
filtered_data = df[['Stars','Rating', 'Reviews', 'Brand']].copy()

# Xử lý các giá trị null và ký tự đặc biệt
filtered_data['Stars'] = filtered_data['Stars'].fillna('0').astype(float)
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

# Tính tổng rating và reviews kết hợp
aggregated_data['total_ratings_reviews'] = aggregated_data['Rating'] + aggregated_data['Reviews']

# Tính ngưỡng (thresholds)
low_threshold = aggregated_data['total_ratings_reviews'].quantile(0.33)
high_threshold = aggregated_data['total_ratings_reviews'].quantile(0.67)

# Hàm phân loại
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

# Áp dụng phân loại
aggregated_data['classification'] = aggregated_data.apply(classify_brand, axis=1)

# Sắp xếp dữ liệu theo mức độ tin cậy
sorted_data = aggregated_data.sort_values(by=['Stars', 'Rating', 'Reviews'], ascending=False)

# Xuất dữ liệu ra file JSON
output_file_path = 'data_with_classification.json'
sorted_data.to_json(output_file_path, orient='records', force_ascii=False)

# Xuất thêm dữ liệu ra file CSV
csv_file_path = 'chart_with_classification.csv'
sorted_data.to_csv(csv_file_path, index=False, encoding='utf-8-sig')

# Kết quả
print(f"JSON file exported to: {output_file_path}")
print(f"CSV file exported to: {csv_file_path}")
