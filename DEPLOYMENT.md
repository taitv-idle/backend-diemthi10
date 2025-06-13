# Hướng dẫn Deploy lên Vercel

## 🚀 Các bước triển khai

### 1. Cài đặt Vercel CLI (nếu chưa có)
```bash
npm install -g vercel
```

### 2. Đăng nhập Vercel
```bash
vercel login
```

### 3. Deploy từ terminal
```bash
# Tại thư mục root của project
vercel

# Hoặc deploy với tên project cụ thể
vercel --name diem-thi-api
```

### 4. Deploy qua Vercel Dashboard
1. Vào [vercel.com](https://vercel.com)
2. Đăng nhập và chọn "New Project"
3. Import repository từ GitHub/GitLab
4. Vercel sẽ tự động detect và deploy

## ⚙️ Cấu hình Environment Variables

Nếu cần thiết, thêm environment variables trong Vercel Dashboard:
- `NODE_ENV`: production
- `PORT`: (Vercel tự động xử lý)

## 📁 Cấu trúc file cho Vercel

```
backend/
├── api/
│   └── index.js          # Entry point cho Vercel
├── package.json          # Dependencies
├── server.js             # Main server file
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore
└── diem-thi-api.json    # Data file
```

## 🔧 Các file cấu hình quan trọng

### vercel.json
- Cấu hình routes và builds cho Vercel
- Set maxDuration để xử lý file JSON lớn

### api/index.js
- Entry point tương thích với Vercel serverless functions

### .vercelignore
- Loại bỏ các file không cần thiết khỏi deployment

## 🌐 Sau khi deploy

- URL sẽ có dạng: `https://your-project-name.vercel.app`
- Test các endpoints:
  - `GET /api/metadata`
  - `GET /api/student/020016`
  - `POST /api/students/search`

## ⚠️ Lưu ý quan trọng

1. **File size**: JSON file 7MB có thể gây chậm cold start
2. **Memory limit**: Vercel free plan có giới hạn memory
3. **Timeout**: Set maxDuration = 30s để xử lý requests lớn
4. **Cold start**: Lần đầu load có thể chậm do cần parse JSON

## 🔍 Troubleshooting

### Lỗi thường gặp:
- **Function timeout**: Tăng maxDuration trong vercel.json
- **Memory limit**: Optimize code hoặc upgrade plan
- **File too large**: Consider splitting data hoặc dùng database

### Debug:
```bash
# Xem logs
vercel logs

# Local test
vercel dev
```

## 📈 Tối ưu performance

1. **Cache response** cho metadata
2. **Lazy load** data nếu cần
3. **Consider database** thay vì JSON file
4. **Add compression** middleware (đã có) 