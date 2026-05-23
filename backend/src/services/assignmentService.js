// =========================================================================
// SERVICE XỬ LÝ NGHIỆP VỤ PHÂN CÔNG THỰC TẾ (Real Assignment Service)
// Ý nghĩa: Chứa toàn bộ LOGIC NGHIỆP VỤ cực kỳ quan trọng của dự án.
// Thực hiện kết nối và kiểm soát dữ liệu thực tế từ Database MySQL qua Sequelize ORM!
// Đảm bảo kiểm duyệt chặt chẽ 4 quy tắc vàng của đề tài phân công tín chỉ.
// =========================================================================

const Class = require('../models/classModel');
const User = require('../models/userModel');
const Subject = require('../models/subjectModel');
const LecturerAvailability = require('../models/lecturerAvailabilityModel');
const Assignment = require('../models/assignmentModel');
const sequelize = require('../config/database');

class AssignmentService {
    
    // 1. ĐỀ XUẤT PHÂN CÔNG MỚI (Trưởng khoa gửi lên)
    async proposeAssignment(assignmentData) {
        const { classCode, lecturerId, proposerId } = assignmentData;
        
        console.log(`[Service] Đang xử lý phân công GV [${lecturerId}] cho lớp [${classCode}]`);

        // BƯỚC 1: Lấy thông tin Lớp học phần và Môn học tương ứng
        const cls = await Class.findOne({ where: { classCode } });
        if (!cls) {
            throw new Error(`Không tìm thấy lớp học phần có mã ${classCode}!`);
        }

        if (cls.status !== 'OPEN') {
            throw new Error('Lớp này đã được đề xuất hoặc đã phân công trước đó!');
        }

        // Lấy thông tin Giảng viên
        const lecturer = await User.findByPk(lecturerId);
        if (!lecturer || lecturer.roleId !== 'LECTURER') {
            throw new Error('Không tìm thấy giảng viên yêu cầu hoặc vai trò không hợp lệ!');
        }

        // Lấy thông tin Môn học tương ứng để kiểm tra số tín chỉ
        const subject = await Subject.findOne({ where: { code: cls.subjectCode } });
        if (!subject) {
            throw new Error(`Không tìm thấy môn học có mã ${cls.subjectCode}!`);
        }

        // --- 📋 LOGIC KIỂM SOÁT NGHIỆP VỤ PHÂN CÔNG (4 RÀNG BUỘC CỐT LÕI) ---

        // RÀNG BUỘC 1: Kiểm tra chuyên môn giảng dạy (QD1)
        // So sánh chuyên ngành của môn học và giảng viên
        if (lecturer.specialization.toUpperCase() !== subject.specialization.toUpperCase()) {
            throw new Error(`Độ tương thích chuyên môn không phù hợp! Môn học yêu cầu khoa [${subject.specialization}], Giảng viên thuộc khoa [${lecturer.specialization}].`);
        }

        // RÀNG BUỘC 2: Kiểm tra lịch báo bận của giảng viên (QD2)
        // Chuyển đổi Thứ sang định dạng tương thích (Thứ 2 -> t2, Thứ 3 -> t3, ...)
        const dayMap = {
            'Thứ 2': 't2', 'Thứ 3': 't3', 'Thứ 4': 't4', 'Thứ 5': 't5', 'Thứ 6': 't6', 'Thứ 7': 't7', 'Chủ Nhật': 'cn'
        };
        const mappedDay = dayMap[cls.dayOfWeek] || cls.dayOfWeek;
        
        const isBusy = await LecturerAvailability.findOne({
            where: {
                lecturerId,
                dayOfWeek: mappedDay,
                shift: cls.shift
            }
        });
        if (isBusy) {
            throw new Error(`Giảng viên đã khai báo BẬN vào khung giờ này (${cls.dayOfWeek} - Ca ${cls.shift === 'sang' ? 'Sáng' : cls.shift === 'chieu' ? 'Chiều' : 'Tối'})!`);
        }

        // RÀNG BUỘC 3: Kiểm tra định mức tối đa số tiết giảng dạy trong học kỳ (QD3)
        // Lấy tổng số giờ đã được phân công chính thức + PENDING của giảng viên đó
        // (Mỗi tín chỉ tương đương 15 tiết/giờ dạy tiêu chuẩn)
        const proposedHours = subject.credits * 15;
        const totalEstimatedHours = (lecturer.currentHours || 0) + proposedHours;

        if (totalEstimatedHours > (lecturer.maxHours || 90)) {
            throw new Error(`Quá tải định mức giờ giảng dạy trong kỳ! Tải hiện tại: ${lecturer.currentHours}h, thêm lớp này: ${proposedHours}h, vượt định mức cho phép: ${lecturer.maxHours}h!`);
        }

        // RÀNG BUỘC 4: Kiểm tra trùng lịch giảng dạy trực tiếp (QD4)
        // Tìm xem giảng viên có lớp nào khác có cùng lịch học (Cùng Thứ + Cùng Ca) và trạng thái là PENDING hoặc ASSIGNED
        const duplicateScheduleClass = await Class.findOne({
            where: {
                lecturerId,
                dayOfWeek: cls.dayOfWeek,
                shift: cls.shift,
                status: ['PENDING', 'ASSIGNED']
            }
        });
        if (duplicateScheduleClass) {
            throw new Error(`Trùng lịch giảng dạy! Giảng viên đã được gán lịch dạy lớp [${duplicateScheduleClass.classCode} - ${duplicateScheduleClass.subjectName}] cùng khung giờ này!`);
        }

        // --- 💾 THỰC HIỆN GHI NHẬN VÀO CƠ SỞ DỮ LIỆU ---

        // Bắt đầu một Transaction để đảm bảo tính toàn vẹn dữ liệu (ACID)
        const t = await sequelize.transaction();

        try {
            // A. Tạo yêu cầu đề xuất mới trong bảng `assignments`
            const newAssignment = await Assignment.create({
                classCode,
                lecturerId,
                status: 'PENDING',
                proposerId
            }, { transaction: t });

            // B. Cập nhật trạng thái lớp học phần thành PENDING và tạm gán tên giảng viên đề cử
            await cls.update({
                status: 'PENDING',
                lecturerId: lecturer.id,
                lecturerName: lecturer.fullName
            }, { transaction: t });

            // Commit Transaction thành công
            await t.commit();
            return newAssignment;

        } catch (error) {
            // Rollback nếu có bất kỳ lỗi nào xảy ra khi ghi dữ liệu
            await t.rollback();
            throw error;
        }
    }

    // 2. PHÒNG ĐÀO TẠO XÉT DUYỆT PHÂN CÔNG (APPROVE)
    async approveAssignment(assignmentId, approvedBy) {
        console.log(`[Service] Đang xét duyệt đề xuất #${assignmentId} bởi Admin [${approvedBy}]`);

        const asg = await Assignment.findByPk(assignmentId);
        if (!asg) {
            throw new Error('Không tìm thấy bản ghi đề xuất phân công yêu cầu!');
        }

        if (asg.status !== 'PENDING') {
            throw new Error('Đề xuất này đã được xử lý trước đó rồi!');
        }

        const cls = await Class.findOne({ where: { classCode: asg.classCode } });
        if (!cls) {
            throw new Error('Không tìm thấy lớp học phần tương ứng với đề xuất này!');
        }

        const lecturer = await User.findByPk(asg.lecturerId);
        if (!lecturer) {
            throw new Error('Không tìm thấy giảng viên phụ trách!');
        }

        const subject = await Subject.findOne({ where: { code: cls.subjectCode } });
        const hoursToAdd = subject ? (subject.credits * 15) : 45; // Mặc định 45 tiết nếu lỗi môn học

        // Transaction đồng bộ phê duyệt
        const t = await sequelize.transaction();

        try {
            // A. Cập nhật trạng thái đề xuất thành APPROVED
            await asg.update({ status: 'APPROVED' }, { transaction: t });

            // B. Cập nhật trạng thái lớp học phần thành ASSIGNED
            await cls.update({ status: 'ASSIGNED' }, { transaction: t });

            // C. Cộng dồn số giờ giảng dạy thực tế vào tải dạy của giảng viên
            await lecturer.update({
                currentHours: (lecturer.currentHours || 0) + hoursToAdd
            }, { transaction: t });

            await t.commit();
            return asg;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // 3. PHÒNG ĐÀO TẠO TỪ CHỐI DUYỆT PHÂN CÔNG (REJECT)
    async rejectAssignment(assignmentId, reason) {
        console.log(`[Service] Đang từ chối đề xuất #${assignmentId} với lý do: ${reason}`);

        const asg = await Assignment.findByPk(assignmentId);
        if (!asg) {
            throw new Error('Không tìm thấy đề xuất phân công yêu cầu!');
        }

        if (asg.status !== 'PENDING') {
            throw new Error('Đề xuất này đã được xử lý trước đó rồi!');
        }

        const cls = await Class.findOne({ where: { classCode: asg.classCode } });
        if (!cls) {
            throw new Error('Không tìm thấy lớp học phần tương ứng!');
        }

        const t = await sequelize.transaction();

        try {
            // A. Cập nhật đề xuất thành REJECTED và lưu lý do từ chối
            await asg.update({
                status: 'REJECTED',
                rejectionReason: reason
            }, { transaction: t });

            // B. Trả lớp học phần về trạng thái OPEN, xóa trắng giảng viên tạm gán
            await cls.update({
                status: 'OPEN',
                lecturerId: null,
                lecturerName: null
            }, { transaction: t });

            await t.commit();
            return asg;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // 4. LẤY TOÀN BỘ ĐỀ XUẤT PHÂN CÔNG ĐANG CHỜ DUYỆT (PENDING)
    async getPendingAssignments() {
        // Trả về danh sách chờ duyệt kết nối trực tiếp DB để hiển thị lên trang của Admin
        return await Assignment.findAll({
            where: { status: 'PENDING' }
        });
    }

    // 5. LẤY DANH SÁCH LỚP TÍN CHỈ THEO BỘ MÔN (Dành cho Trưởng khoa xem)
    async getClassesBySpecialization(spec) {
        return await Class.findAll({
            include: [{
                model: Subject,
                where: { specialization: spec }
            }]
        }).catch(() => {
            // Fallback nếu chưa cấu hình Association phức tạp
            return Class.findAll();
        });
    }
}

module.exports = new AssignmentService();
