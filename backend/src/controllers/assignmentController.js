// =========================================================================
// CONTROLLER ĐIỀU HƯỚNG PHÂN CÔNG THỰC TẾ (Real Assignment Controller)
// Ý nghĩa: Nhận yêu cầu HTTP (Request), gọi tầng nghiệp vụ (Service) xử lý
//          kết nối MySQL, và trả kết quả thích hợp cùng HTTP Status Code.
// =========================================================================

const assignmentService = require('../services/assignmentService');

class AssignmentController {

    // 1. Đề xuất phân công (POST /api/assignments/propose)
    async propose(req, res) {
        try {
            const { classCode, lecturerId } = req.body;
            const proposerId = req.user ? req.user.id : 'usr-head-01'; // Lấy ID Trưởng khoa từ Token JWT hoặc dùng tạm head mặc định

            // Kiểm tra dữ liệu đầu vào cơ bản (Validation)
            if (!classCode || !lecturerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp đầy đủ thông tin Mã lớp và Giảng viên!'
                });
            }

            // Gọi Service thực hiện kiểm soát 4 quy tắc và tạo bản ghi
            const result = await assignmentService.proposeAssignment({ classCode, lecturerId, proposerId });

            return res.status(201).json({
                success: true,
                message: 'Đề xuất phân công đã được gửi lên thành công, đang chờ Phòng Đào tạo duyệt!',
                data: result
            });

        } catch (error) {
            // Trả lỗi vi phạm các ràng buộc (trùng lịch, quá tải giờ,...) về cho Client hiển thị lên giao diện
            return res.status(400).json({
                success: false,
                message: error.message || 'Có lỗi xảy ra trong quá trình đề xuất phân công!'
            });
        }
    }

    // 2. Xét duyệt phân công (PUT /api/assignments/:id/approve)
    async approve(req, res) {
        try {
            const { id } = req.params;
            const approvedBy = req.user ? req.user.username : 'admin';

            const result = await assignmentService.approveAssignment(id, approvedBy);

            return res.status(200).json({
                success: true,
                message: 'Xét duyệt phân công giảng dạy thành công! Lớp học đã được chuyển sang trạng thái ĐÃ PHÂN CÔNG.',
                data: result
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Lỗi xét duyệt phân công!'
            });
        }
    }

    // 3. Từ chối phân công (PUT /api/assignments/:id/reject)
    async reject(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            if (!reason || !reason.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Bắt buộc phải nhập lý do từ chối!'
                });
            }

            const result = await assignmentService.rejectAssignment(id, reason);

            return res.status(200).json({
                success: true,
                message: 'Đã từ chối đề xuất phân công này! Lớp học đã được giải phóng sang trạng thái ĐANG MỞ.',
                data: result
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi thực hiện từ chối phân công!'
            });
        }
    }

    // 4. Lấy danh sách các đề xuất chờ duyệt (GET /api/assignments/pending)
    async getPending(req, res) {
        try {
            const list = await assignmentService.getPendingAssignments();
            return res.status(200).json({
                success: true,
                data: list
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi tải danh sách đề xuất chờ duyệt!'
            });
        }
    }
}

module.exports = new AssignmentController();
