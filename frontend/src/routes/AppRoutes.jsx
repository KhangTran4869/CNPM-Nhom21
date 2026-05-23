// =========================================================================
// BẢN ĐỒ ĐƯỜNG DẪN HỆ THỐNG (App Routes Map)
// Ý nghĩa: Định nghĩa toàn bộ các liên kết trang của hệ thống, phân quyền
//          truy cập và bọc chung bằng khung giao diện MainLayout.jsx.
// =========================================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../components/MainLayout';

// Nhập các Component giao diện (Pages)
import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminAssignments from '../pages/Admin/AdminAssignments';
import HeadDashboard from '../pages/Head/HeadDashboard';
import HeadDepartmentClasses from '../pages/Head/HeadDepartmentClasses';
import LecturerDashboard from '../pages/Lecturer/LecturerDashboard';
import LecturerAvailability from '../pages/Lecturer/LecturerAvailability';

const AppRoutes = () => {
    return (
        <Routes>
            {/* 1. TRANG ĐĂNG NHẬP (Không bọc Layout) */}
            <Route path="/login" element={<Login />} />

            {/* =========================================================================
                2. PHÂN QUYỀN PHÒNG ĐÀO TẠO (ADMIN)
               ========================================================================= */}
            {/* Trang chính Dashboard */}
            <Route 
                path="/admin" 
                element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <MainLayout>
                            <AdminDashboard />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            {/* Trang duyệt đề xuất phân công */}
            <Route 
                path="/admin/approve" 
                element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <MainLayout>
                            <AdminAssignments />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            {/* Các trang giả lập khác (quay về trang chính hoặc thông báo để tránh lỗi đường dẫn) */}
            <Route 
                path="/admin/classes" 
                element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <MainLayout>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>📂 Quản Lý Lớp Tín Chỉ (Hệ thống đang phát triển thêm)</h3>
                                <p>Admin có thể xem thời khóa biểu các lớp tín chỉ tại đây.</p>
                                <a href="/admin">Quay lại Bảng điều khiển</a>
                            </div>
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/admin/reports" 
                element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <MainLayout>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>📊 Báo Cáo Thống Kê Giảng Dạy</h3>
                                <p>Thống kê số giờ dạy, tải giảng dạy chi tiết theo khoa/bộ môn.</p>
                                <a href="/admin">Quay lại Bảng điều khiển</a>
                            </div>
                        </MainLayout>
                    </PrivateRoute>
                } 
            />

            {/* =========================================================================
                3. PHÂN QUYỀN TRƯỞNG KHOA (HEAD)
               ========================================================================= */}
            {/* Trang chính Dashboard */}
            <Route 
                path="/head" 
                element={
                    <PrivateRoute allowedRoles={['HEAD']}>
                        <MainLayout>
                            <HeadDashboard />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            {/* Trang quản lý lớp bộ môn và đề xuất */}
            <Route 
                path="/head/classes" 
                element={
                    <PrivateRoute allowedRoles={['HEAD']}>
                        <MainLayout>
                            <HeadDepartmentClasses />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/head/propose" 
                element={
                    <PrivateRoute allowedRoles={['HEAD']}>
                        <MainLayout>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>✉️ Theo Dõi Đề Xuất Phân Công</h3>
                                <p>Xem các đề xuất đang chờ Admin duyệt hoặc đã bị từ chối kèm lý do.</p>
                                <a href="/head">Quay lại Bảng điều khiển</a>
                            </div>
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/head/calendar" 
                element={
                    <PrivateRoute allowedRoles={['HEAD']}>
                        <MainLayout>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>📅 Lịch Giảng Dạy Bộ Môn</h3>
                                <p>Xem trực quan thời khóa biểu các phòng học, lớp học của khoa.</p>
                                <a href="/head">Quay lại Bảng điều khiển</a>
                            </div>
                        </MainLayout>
                    </PrivateRoute>
                } 
            />

            {/* =========================================================================
                4. PHÂN QUYỀN GIẢNG VIÊN (LECTURER)
               ========================================================================= */}
            {/* Trang chính Dashboard (Lịch dạy) */}
            <Route 
                path="/lecturer" 
                element={
                    <PrivateRoute allowedRoles={['LECTURER']}>
                        <MainLayout>
                            <LecturerDashboard />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            {/* Trang khai báo lịch bận */}
            <Route 
                path="/lecturer/availability" 
                element={
                    <PrivateRoute allowedRoles={['LECTURER']}>
                        <MainLayout>
                            <LecturerAvailability />
                        </MainLayout>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/lecturer/workload" 
                element={
                    <PrivateRoute allowedRoles={['LECTURER']}>
                        <MainLayout>
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>📈 Chi Tiết Khối Lượng Giảng Dạy</h3>
                                <p>Xem bảng thống kê chi tiết các tiết dạy thực tế, hệ số và thù lao (nếu có).</p>
                                <a href="/lecturer">Quay lại Bảng điều khiển</a>
                            </div>
                        </MainLayout>
                    </PrivateRoute>
                } 
            />

            {/* 5. ĐIỀU HƯỚNG MẶC ĐỊNH KHI VÀO TRANG CHỦ */}
            <Route 
                path="/" 
                element={<Navigate to="/login" replace />} 
            />

            {/* 6. TRANG LỖI 404 (Không tìm thấy trang) */}
            <Route 
                path="*" 
                element={
                    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: "'Inter', sans-serif" }}>
                        <h1 style={{ fontSize: '72px', color: '#ff4d4f', margin: 0, fontWeight: 900 }}>404</h1>
                        <h2>Không tìm thấy trang yêu cầu!</h2>
                        <p style={{ color: '#6b7280' }}>Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang chủ.</p>
                        <a href="/" style={{ 
                            display: 'inline-block', 
                            marginTop: '15px', 
                            padding: '10px 20px', 
                            backgroundColor: '#3b82f6', 
                            color: '#fff', 
                            textDecoration: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold' 
                        }}> Quay lại Trang chủ </a>
                    </div>
                } 
            />
        </Routes>
    );
};

export default AppRoutes;
