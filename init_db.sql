-- =========================================================================
-- KỊCH BẢN KHỞI TẠO CƠ SỞ DỮ LIỆU CHUẨN 12 BẢNG (Official 12-Table Schema)
-- Đề tài: Phần mềm phân công giảng viên giảng dạy lớp tín chỉ
-- Cơ sở dữ liệu: MySQL / MariaDB (Trích xuất từ thiết kế gốc tdk.sql của bạn)
-- Ý nghĩa: Khởi tạo cấu trúc 12 bảng, liên kết khóa ngoại chặt chẽ và nạp
--          đầy đủ dữ liệu mẫu (Seed Data) đồng bộ cho buổi thuyết trình đồ án!
-- =========================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU (Nếu chưa tồn tại)
CREATE DATABASE IF NOT EXISTS `cnpm_assignment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cnpm_assignment`;

-- Tắt kiểm tra khóa ngoại tạm thời để xóa các bảng cũ không bị lỗi ràng buộc
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `assignment_history`;
DROP TABLE IF EXISTS `assignment`;
DROP TABLE IF EXISTS `lecturer_availability`;
DROP TABLE IF EXISTS `schedules`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `semesters`;
DROP TABLE IF EXISTS `lecturers`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 2. TẠO CẤU TRÚC 12 BẢNG DỮ LIỆU THEO PHÂN TÍCH THIẾT KẾ GỐC
-- =========================================================================

-- BẢNG 1: VAI TRÒ (roles)
CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 2: BỘ MÔN / KHOA (departments)
CREATE TABLE `departments` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 3: HỌC KỲ (semesters)
CREATE TABLE `semesters` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 4: PHÒNG HỌC (rooms)
CREATE TABLE `rooms` (
  `id` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 5: TÀI KHOẢN ĐĂNG NHẬP (users)
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 6: GIẢNG VIÊN (lecturers)
CREATE TABLE `lecturers` (
  `id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `degree` varchar(50) DEFAULT 'Thạc sĩ',
  `department_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `max_hours` int(11) DEFAULT 90,
  `status` varchar(50) DEFAULT 'active',
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `lecturers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 7: MÔN HỌC / HỌC PHẦN (courses)
CREATE TABLE `courses` (
  `id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `credits` int(11) DEFAULT NULL,
  `department_id` varchar(50) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 8: LỚP TÍN CHỈ HỌC PHẦN (classes)
CREATE TABLE `classes` (
  `id` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `course_id` varchar(50) DEFAULT NULL,
  `semester_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'OPEN', -- OPEN, PENDING, ASSIGNED
  `max_students` int(11) DEFAULT 50,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `course_id` (`course_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 9: THỜI KHÓA BIỂU / CHI TIẾT LỚP (schedules)
CREATE TABLE `schedules` (
  `id` varchar(50) NOT NULL,
  `class_id` varchar(50) DEFAULT NULL,
  `day_of_week` int(11) DEFAULT NULL, -- 2 (Thứ 2) -> 8 (Chủ nhật)
  `start_period` int(11) DEFAULT NULL, -- Tiết bắt đầu (1 -> 15)
  `end_period` int(11) DEFAULT NULL, -- Tiết kết thúc
  `room_id` varchar(50) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 10: KHAI BÁO LỊCH BẬN GIẢNG VIÊN (lecturer_availability)
CREATE TABLE `lecturer_availability` (
  `id` varchar(50) NOT NULL,
  `lecturer_id` varchar(50) DEFAULT NULL,
  `day_of_week` int(11) DEFAULT NULL, -- 2 -> 8
  `start_period` int(11) DEFAULT NULL, -- Tiết bắt đầu bận
  `end_period` int(11) DEFAULT NULL, -- Tiết kết thúc bận
  `status` varchar(50) DEFAULT 'busy',
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `lecturer_id` (`lecturer_id`),
  CONSTRAINT `lecturer_availability_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 11: ĐỀ XUẤT PHÂN CÔNG GIẢNG DẠY (assignment)
CREATE TABLE `assignment` (
  `id` varchar(50) NOT NULL,
  `class_id` varchar(50) DEFAULT NULL,
  `lecturer_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  `assigned_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  KEY `lecturer_id` (`lecturer_id`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_ibfk_2` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- BẢNG 12: NHẬT KÝ / LỊCH SỬ THAY ĐỔI PHÂN CÔNG (assignment_history)
CREATE TABLE `assignment_history` (
  `id` varchar(50) NOT NULL,
  `assignment_id` varchar(50) DEFAULT NULL,
  `old_lecturer` varchar(50) DEFAULT NULL,
  `new_lecturer` varchar(50) DEFAULT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `assignment_history_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- =========================================================================
-- 3. NẠP DỮ LIỆU MẪU ĐỒNG BỘ VÀO 12 BẢNG (Seed Data)
-- Chú ý: Tất cả mật khẩu mẫu đều là: 123456
-- Mật khẩu đã được mã hóa BCrypt: $2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a
-- =========================================================================

-- Nạp Roles
INSERT INTO `roles` (`id`, `name`, `is_deleted`) VALUES
('ADMIN', 'Phòng Đào Tạo', 0),
('HEAD', 'Trưởng Khoa', 0),
('LECTURER', 'Giảng Viên', 0);

-- Nạp Departments (Bộ môn)
INSERT INTO `departments` (`id`, `name`, `is_deleted`) VALUES
('DEPT-CNTT', 'Công nghệ thông tin', 0),
('DEPT-HTTT', 'Hệ thống thông tin', 0),
('DEPT-ATTT', 'An toàn thông tin', 0),
('DEPT-CNPM', 'Công nghệ phần mềm', 0);

-- Nạp Semesters (Học kỳ)
INSERT INTO `semesters` (`id`, `name`, `start_date`, `end_date`, `is_deleted`) VALUES
('SEM-20251', 'Học kỳ 2025-1', '2025-09-05', '2026-01-15', 0);

-- Nạp Rooms (Phòng học)
INSERT INTO `rooms` (`id`, `name`, `capacity`, `is_deleted`) VALUES
('RM-A101', 'Phòng học A101', 80, 0),
('RM-B202', 'Phòng học B202', 60, 0),
('RM-C103', 'Phòng học C103', 100, 0),
('RM-LAB403', 'Phòng thực hành Lab 403', 45, 0);

-- Nạp Users
INSERT INTO `users` (`id`, `username`, `password`, `role_id`, `status`, `is_deleted`) VALUES
('usr-admin-01', 'admin', '$2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a', 'ADMIN', 'active', 0),
('usr-head-01', 'head', '$2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a', 'HEAD', 'active', 0),
('usr-gv-nguyenvana', 'gv_nguyenvana', '$2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a', 'LECTURER', 'active', 0),
('usr-gv-tranthib', 'gv_tranthib', '$2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a', 'LECTURER', 'active', 0),
('usr-gv-phamminhc', 'gv_phamminhc', '$2a$10$wN1k6K81WbWwO0xV79GgSu807Lz4q0Y7L0u2gT3N20Z9S/PqQhO2a', 'LECTURER', 'active', 0);

-- Nạp Lecturers (Thông tin Giảng viên chi tiết)
INSERT INTO `lecturers` (`id`, `code`, `name`, `email`, `phone`, `degree`, `department_id`, `user_id`, `max_hours`, `status`, `is_deleted`) VALUES
('gv-head-dat', 'HEAD01', 'TS. Trần Văn Đạt', 'dattv@school.edu.vn', '0901234567', 'Tiến sĩ', 'DEPT-CNTT', 'usr-head-01', 90, 'active', 0),
('gv-nguyenvana', 'GV001', 'Nguyễn Văn A', 'nguyenvana@school.edu.vn', '0912345678', 'Thạc sĩ', 'DEPT-CNTT', 'usr-gv-nguyenvana', 90, 'active', 0),
('gv-tranthib', 'GV002', 'TS. Trần Thị B', 'tranthib@school.edu.vn', '0987654321', 'Tiến sĩ', 'DEPT-CNTT', 'usr-gv-tranthib', 90, 'active', 0),
('gv-phamminhc', 'GV003', 'Phạm Minh C', 'phamminhc@school.edu.vn', '0909998887', 'Thạc sĩ', 'DEPT-ATTT', 'usr-gv-phamminhc', 90, 'active', 0);

-- Nạp Courses (Môn học)
INSERT INTO `courses` (`id`, `code`, `name`, `credits`, `department_id`, `is_deleted`) VALUES
('cour-java', 'IT001', 'Lập trình Java Cơ Bản', 3, 'DEPT-CNTT', 0),
('cour-csdl', 'IT002', 'Cơ sở dữ liệu', 3, 'DEPT-CNTT', 0),
('cour-csharp', 'NET01', 'Lập trình C# Nâng Cao', 3, 'DEPT-ATTT', 0),
('cour-ai', 'AI102', 'Trí tuệ nhân tạo nâng cao', 4, 'DEPT-CNTT', 0),
('cour-web', 'WEB02', 'Phát triển ứng dụng Web động', 3, 'DEPT-CNPM', 0);

-- Nạp Classes (Lớp tín chỉ)
INSERT INTO `classes` (`id`, `code`, `course_id`, `semester_id`, `status`, `max_students`, `is_deleted`) VALUES
('class-java-01', 'IT001-L01', 'cour-java', 'SEM-20251', 'OPEN', 60, 0),
('class-csharp-01', 'NET01-L01', 'cour-csharp', 'SEM-20251', 'PENDING', 45, 0),
('class-csdl-01', 'IT002-L01', 'cour-csdl', 'SEM-20251', 'ASSIGNED', 55, 0),
('class-ai-01', 'AI102-L01', 'cour-ai', 'SEM-20251', 'OPEN', 40, 0),
('class-web-01', 'WEB02-L01', 'cour-web', 'SEM-20251', 'ASSIGNED', 52, 0);

-- Nạp Schedules (Chi tiết Lịch học và Phòng học của từng Lớp tín chỉ)
INSERT INTO `schedules` (`id`, `class_id`, `day_of_week`, `start_period`, `end_period`, `room_id`, `is_deleted`) VALUES
-- Lớp Java: Học Thứ 2, tiết 1 đến tiết 6 (Ca Sáng) tại phòng A101
('sch-java-01', 'class-java-01', 2, 1, 6, 'RM-A101', 0),
-- Lớp C#: Học Thứ 4, tiết 7 đến tiết 12 (Ca Chiều) tại phòng B202
('sch-csharp-01', 'class-csharp-01', 4, 7, 12, 'RM-B202', 0),
-- Lớp CSDL: Học Thứ 3, tiết 1 đến tiết 6 (Ca Sáng) tại phòng C103
('sch-csdl-01', 'class-csdl-01', 3, 1, 6, 'RM-C103', 0),
-- Lớp AI: Học Thứ 5, tiết 7 đến tiết 12 (Ca Chiều) tại phòng LAB403
('sch-ai-01', 'class-ai-01', 5, 7, 12, 'RM-LAB403', 0),
-- Lớp Web: Học Thứ 6, tiết 7 đến tiết 12 (Ca Chiều) tại phòng LAB403
('sch-web-01', 'class-web-01', 6, 7, 12, 'RM-LAB403', 0);

-- Nạp Lecturer Availability (Khai báo lịch bận của Giảng viên)
INSERT INTO `lecturer_availability` (`id`, `lecturer_id`, `day_of_week`, `start_period`, `end_period`, `status`, `is_deleted`) VALUES
-- Thầy Nguyễn Văn A (gv-nguyenvana) bận cả ngày Thứ 2 (Tiết 1 -> Tiết 12)
('av-a-01', 'gv-nguyenvana', 2, 1, 12, 'busy', 0),
-- Thầy Nguyễn Văn A bận Chiều Thứ 4 (Tiết 7 -> Tiết 12)
('av-a-02', 'gv-nguyenvana', 4, 7, 12, 'busy', 0),
-- Cô Trần Thị B (gv-tranthib) bận Tối Thứ 6 (Tiết 13 -> Tiết 15)
('av-b-01', 'gv-tranthib', 6, 13, 15, 'busy', 0);

-- Nạp Đề xuất Phân công đang chờ duyệt (Đồng bộ với lớp C# ở trạng thái PENDING)
INSERT INTO `assignment` (`id`, `class_id`, `lecturer_id`, `status`, `assigned_by`, `note`, `is_deleted`) VALUES
('asg-csharp-01', 'class-csharp-01', 'gv-phamminhc', 'PENDING', 'HEAD01', 'Đề xuất phân công giảng dạy do đúng chuyên ngành ATTT', 0);

-- Nạp Lịch sử phân công (assignment_history)
INSERT INTO `assignment_history` (`id`, `assignment_id`, `old_lecturer`, `new_lecturer`, `is_deleted`) VALUES
('hist-01', 'asg-csharp-01', 'Chưa phân công', 'Phạm Minh C', 0);

-- Cập nhật thông số giờ dạy thực tế đã được gán của Giảng viên (để đồng bộ)
-- Lớp CSDL (IT002, 3 tín chỉ = 45 tiết) đã được phân chính thức cho TS. Trần Thị B (gv-tranthib)
-- Lớp Web (WEB02, 3 tín chỉ = 45 tiết) đã được phân chính thức cho Nguyễn Văn A (gv-nguyenvana)
UPDATE `lecturers` SET `current_hours` = 45 WHERE `id` = 'gv-tranthib';
UPDATE `lecturers` SET `current_hours` = 45 WHERE `id` = 'gv-nguyenvana';

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
