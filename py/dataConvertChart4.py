import pandas as pd

# Đọc dữ liệu từ tệp CSV
file_path = 'temp.csv'  # Đường dẫn đến tệp dữ liệu
data = pd.read_csv(file_path)  # Dùng hàm read_csv để đọc dữ liệu từ file

# Kiểm tra và xử lý các giá trị thiếu nếu có
data.fillna({
    'Brand': 'Unknown',
    'Display size': 'Unknown'
}, inplace=True)

# Nhóm dữ liệu theo 'Brand' và 'Display size' và đếm số lượng sản phẩm trong mỗi nhóm
brand_display_counts = data.groupby(['Brand', 'Display Size (inch)']).size().reset_index(name='Product Count')

# Lưu kết quả ra một tệp CSV mới
output_path = 'csv/chart4_with_brand_display_counts.csv'
brand_display_counts.to_csv(output_path, index=False)

# Thông báo hoàn tất
print(f"Data has been saved to: {output_path}")
