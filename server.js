const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load data
let scoreData = null;
try {
  const dataPath = path.join(__dirname, 'diem-thi-api.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  scoreData = JSON.parse(rawData);
  console.log('✅ Đã tải dữ liệu thành công!');
  console.log(`📊 Tổng số học sinh: ${scoreData.metadata.total_students}`);
} catch (error) {
  console.error('❌ Lỗi khi tải dữ liệu:', error.message);
  process.exit(1);
}

// Routes

// 1. API lấy thông tin tổng quan
app.get('/api/metadata', (req, res) => {
  try {
    res.json({
      success: true,
      data: scoreData.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// 2. API tra cứu điểm theo SBD
app.get('/api/student/:sbd', (req, res) => {
  try {
    const { sbd } = req.params;
    
    if (!sbd) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số báo danh'
      });
    }

    const student = scoreData.students[sbd];
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thí sinh với số báo danh này'
      });
    }

    res.json({
      success: true,
      data: {
        sbd: sbd,
        ...student
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// 3. API tìm kiếm nhiều thí sinh
app.post('/api/students/search', (req, res) => {
  try {
    const { sbds } = req.body;
    
    if (!Array.isArray(sbds) || sbds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách số báo danh'
      });
    }

    const results = [];
    const notFound = [];

    sbds.forEach(sbd => {
      const student = scoreData.students[sbd];
      if (student) {
        results.push({
          sbd: sbd,
          ...student
        });
      } else {
        notFound.push(sbd);
      }
    });

    res.json({
      success: true,
      data: {
        found: results,
        notFound: notFound,
        total: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// 4. API thống kê theo khoảng điểm
app.get('/api/statistics/score-range', (req, res) => {
  try {
    const { min, max } = req.query;
    
    const minScore = parseFloat(min) || 0;
    const maxScore = parseFloat(max) || 30;

    const studentsInRange = [];
    
    Object.entries(scoreData.students).forEach(([sbd, student]) => {
      const totalScore = parseFloat(student.tong_diem);
      if (totalScore >= minScore && totalScore <= maxScore) {
        studentsInRange.push({
          sbd: sbd,
          ...student
        });
      }
    });

    res.json({
      success: true,
      data: {
        range: `${minScore} - ${maxScore}`,
        count: studentsInRange.length,
        students: studentsInRange
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// 5. API thống kê theo mã hội đồng
app.get('/api/statistics/by-council/:ma_hd', (req, res) => {
  try {
    const { ma_hd } = req.params;
    
    const studentsInCouncil = [];
    let totalScore = 0;
    let maxScore = 0;
    let minScore = 30;

    Object.entries(scoreData.students).forEach(([sbd, student]) => {
      if (student.ma_hd === ma_hd) {
        const score = parseFloat(student.tong_diem);
        studentsInCouncil.push({
          sbd: sbd,
          ...student
        });
        totalScore += score;
        maxScore = Math.max(maxScore, score);
        minScore = Math.min(minScore, score);
      }
    });

    const avgScore = studentsInCouncil.length > 0 ? (totalScore / studentsInCouncil.length).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        ma_hd: ma_hd,
        total_students: studentsInCouncil.length,
        avg_score: parseFloat(avgScore),
        max_score: maxScore > 0 ? maxScore : null,
        min_score: minScore < 30 ? minScore : null,
        students: studentsInCouncil
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// 6. API tìm kiếm top điểm cao
app.get('/api/top-scores', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const allStudents = Object.entries(scoreData.students).map(([sbd, student]) => ({
      sbd: sbd,
      ...student,
      tong_diem_num: parseFloat(student.tong_diem)
    }));

    const topStudents = allStudents
      .sort((a, b) => b.tong_diem_num - a.tong_diem_num)
      .slice(0, limitNum)
      .map(student => {
        const { tong_diem_num, ...rest } = student;
        return rest;
      });

    res.json({
      success: true,
      data: {
        limit: limitNum,
        students: topStudents
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Tra cứu điểm thi lớp 10',
    version: '1.0.0',
    endpoints: {
      metadata: 'GET /api/metadata',
      student_lookup: 'GET /api/student/:sbd',
      bulk_search: 'POST /api/students/search',
      score_range: 'GET /api/statistics/score-range?min=0&max=30',
      council_stats: 'GET /api/statistics/by-council/:ma_hd',
      top_scores: 'GET /api/top-scores?limit=10'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Lỗi:', error);
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
});

module.exports = app; 