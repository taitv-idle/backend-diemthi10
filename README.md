# API Tra cứu Điểm Thi Lớp 10

Backend API cho hệ thống tra cứu điểm thi tuyển sinh lớp 10 THPT năm 2025.

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js >= 14.0.0
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy server
```bash
# Chế độ development
npm run dev

# Chế độ production
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### 1. Thông tin tổng quan
```
GET /api/metadata
```
Trả về thông tin thống kê tổng quan về kỳ thi.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_students": 39128,
    "present_students": 38986,
    "absent_students": 142,
    "max_score": 29.25,
    "min_score": 2.0,
    "avg_score": 17.59,
    "last_updated": "2025-06-13",
    "exam_type": "Tuyển sinh lớp 10 THPT năm 2025"
  }
}
```

### 2. Tra cứu điểm theo SBD
```
GET /api/student/:sbd
```
Tra cứu thông tin điểm của một thí sinh theo số báo danh.

**Ví dụ:** `GET /api/student/020016`

**Response:**
```json
{
  "success": true,
  "data": {
    "sbd": "020016",
    "stt": "1",
    "ma_hd": "02",
    "diem_van": "7",
    "diem_nn": "2.5",
    "diem_toan": "4.75",
    "tong_diem": "14.25"
  }
}
```

### 3. Tìm kiếm nhiều thí sinh
```
POST /api/students/search
```
Tìm kiếm thông tin điểm của nhiều thí sinh cùng lúc.

**Body:**
```json
{
  "sbds": ["020016", "020017", "020018"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "found": [
      {
        "sbd": "020016",
        "stt": "1",
        "ma_hd": "02",
        "diem_van": "7",
        "diem_nn": "2.5",
        "diem_toan": "4.75",
        "tong_diem": "14.25"
      }
    ],
    "notFound": ["020999"],
    "total": 1
  }
}
```

### 4. Thống kê theo khoảng điểm
```
GET /api/statistics/score-range?min=20&max=30
```
Lấy danh sách thí sinh trong khoảng điểm nhất định.

**Query Parameters:**
- `min`: Điểm tối thiểu (mặc định: 0)
- `max`: Điểm tối đa (mặc định: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "range": "20 - 30",
    "count": 150,
    "students": [...]
  }
}
```

### 5. Thống kê theo mã hội đồng
```
GET /api/statistics/by-council/:ma_hd
```
Lấy thống kê và danh sách thí sinh theo mã hội đồng.

**Ví dụ:** `GET /api/statistics/by-council/02`

**Response:**
```json
{
  "success": true,
  "data": {
    "ma_hd": "02",
    "total_students": 500,
    "avg_score": 17.5,
    "max_score": 29.25,
    "min_score": 5.5,
    "students": [...]
  }
}
```

### 6. Top điểm cao
```
GET /api/top-scores?limit=10
```
Lấy danh sách thí sinh có điểm cao nhất.

**Query Parameters:**
- `limit`: Số lượng thí sinh muốn lấy (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "limit": 10,
    "students": [...]
  }
}
```

### 7. Health Check
```
GET /health
```
Kiểm tra trạng thái hoạt động của API.

## 📖 Cấu trúc dữ liệu

### Student Object
```json
{
  "sbd": "020016",           // Số báo danh
  "stt": "1",                // Số thứ tự
  "ma_hd": "02",             // Mã hội đồng
  "diem_van": "7",           // Điểm môn Văn
  "diem_nn": "2.5",          // Điểm môn Ngoại ngữ
  "diem_toan": "4.75",       // Điểm môn Toán
  "tong_diem": "14.25"       // Tổng điểm
}
```

## 🛡️ Security Features

- **Helmet.js**: Bảo vệ ứng dụng bằng cách thiết lập các HTTP headers bảo mật
- **CORS**: Cho phép cross-origin requests
- **Compression**: Nén response để tối ưu hiệu suất
- **Error Handling**: Xử lý lỗi toàn cục và trả về response nhất quán

## 🔧 Môi trường phát triển

### Dependencies chính:
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **compression**: Response compression
- **dotenv**: Environment variables

### Dev Dependencies:
- **nodemon**: Auto-restart server khi code thay đổi

## 📝 Ghi chú

- Dữ liệu được load vào memory khi khởi động server để đảm bảo hiệu suất
- Tất cả endpoints đều trả về JSON response với format nhất quán
- Error handling toàn cục đảm bảo ứng dụng không bị crash
- Hỗ trợ cả tiếng Việt trong response messages 