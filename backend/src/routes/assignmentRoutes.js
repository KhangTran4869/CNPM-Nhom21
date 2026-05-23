// =========================================================================
// ROUTER ĐỊNH NGHĨA API PHÂN CÔNG (Assignment Routes)
// Ý nghĩa: Khai báo các Endpoint URL và liên kết với các Middleware bảo mật,
//          cùng Controller xử lý tương ứng kết nối database MySQL.
// =========================================================================

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middlewares/auth');

// 1. LẤY DANH SÁCH CHỜ DUYỆT (Chỉ có PHÒNG ĐÀO TẠO - ADMIN mới xem được)
// GET /api/assignments/pending
router.get('/pending', authenticate, authorize(['ADMIN']), assignmentController.getPending);

// 2. ĐỀ XUẤT PHÂN CÔNG (Chỉ có TRƯỞNG KHOA - HEAD mới được đề xuất)
// POST /api/assignments/propose
router.post('/propose', authenticate, authorize(['HEAD']), assignmentController.propose);

// 3. XÉT DUYỆT PHÂN CÔNG (Chỉ có PHÒNG ĐÀO TẠO - ADMIN mới được duyệt)
// PUT /api/assignments/:id/approve
router.put('/:id/approve', authenticate, authorize(['ADMIN']), assignmentController.approve);

// 4. TỪ CHỐI PHÂN CÔNG (Chỉ có PHÒNG ĐÀO TẠO - ADMIN mới có quyền từ chối kèm lý do)
// PUT /api/assignments/:id/reject
router.put('/:id/reject', authenticate, authorize(['ADMIN']), assignmentController.reject);

module.exports = router;
