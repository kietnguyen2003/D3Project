import pandas as pd

# Đọc dữ liệu từ tệp CSV
file_path = 'temp.csv'  # Đường dẫn đến tệp dữ liệu
data = pd.read_csv(file_path)  # Dùng hàm read_csv để đọc dữ liệu từ file

# Kiểm tra và xử lý các giá trị thiếu
data.fillna({
    'Actual price': 0,
    'Discount price': 0,
    'classification': 'Unknown'  # Nếu cột classification thiếu, thay thế bằng "Unknown"
}, inplace=True)

# Nhóm dữ liệu theo 'classification' và tính giá trị trung bình cho 'Actual price' và 'Discount price'
avg_prices = data.groupby('classification')[['Actual price', 'Discount price']].mean()

# Lưu kết quả ra một tệp CSV mới
output_path = 'csv/chart3_with_avg_values.csv'
avg_prices.to_csv(output_path)

# Thông báo hoàn tất
print(f"Data has been saved to: {output_path}")
