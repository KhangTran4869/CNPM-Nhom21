// =========================================================================
// THANH PHỤ TRÁI (Sidebar Navigation)
// Thiết kế: Tối giản, hiện đại, hỗ trợ đổi Menu động dựa theo vai trò (Role)
// của người đang đăng nhập. Rất tiện để Trình bày báo cáo!
// =========================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    Calendar, 
    FileSpreadsheet, 
    CheckSquare, 
    Clock 
} from 'lucide-react';

const Sidebar = () => {
    // Lấy thông tin vai trò người dùng hiện tại
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : { role: 'GUEST' };
    const role = user.role.toUpperCase();

    // 1. MENU CHO PHÒNG ĐÀO TẠO (ADMIN)
    const adminMenu = [
        { path: '/admin', name: 'Bảng Điều Khiển', icon: <LayoutDashboard size={18} /> },
        { path: '/admin/classes', name: 'Quản Lý Lớp Tín Chỉ', icon: <BookOpen size={18} /> },
        { path: '/admin/lecturers', name: 'Quản Lý Giảng Viên', icon: <Users size={18} /> },
        { path: '/admin/approve', name: 'Xét Duyệt Phân Công', icon: <CheckSquare size={18} /> },
        { path: '/admin/reports', name: 'Báo Cáo Thống Kê', icon: <FileSpreadsheet size={18} /> }
    ];

    // 2. MENU CHO TRƯỞNG KHOA (HEAD)
    const headMenu = [
        { path: '/head', name: 'Bảng Điều Khiển', icon: <LayoutDashboard size={18} /> },
        { path: '/head/propose', name: 'Đề Xuất Phân Công', icon: <CheckSquare size={18} /> },
        { path: '/head/lecturers', name: 'Theo Dõi Giờ Dạy', icon: <Clock size={18} /> },
        { path: '/head/calendar', name: 'Xem Lịch Bộ Môn', icon: <Calendar size={18} /> }
    ];

    // 3. MENU CHO GIẢNG VIÊN (LECTURER)
    const lecturerMenu = [
        { path: '/lecturer', name: 'Lịch Giảng Dạy', icon: <Calendar size={18} /> },
        { path: '/lecturer/availability', name: 'Báo Lịch Bận / Rảnh', icon: <Clock size={18} /> },
        { path: '/lecturer/workload', name: 'Khối Lượng Giảng Dạy', icon: <FileSpreadsheet size={18} /> }
    ];

    // Lựa chọn bộ menu phù hợp dựa trên Role
    let activeMenu = [];
    if (role === 'ADMIN') activeMenu = adminMenu;
    else if (role === 'HEAD') activeMenu = headMenu;
    else if (role === 'LECTURER') activeMenu = lecturerMenu;

    return (
        <aside style={styles.sidebar}>
            {/* Tiêu đề vai trò làm việc */}
            <div style={styles.roleHeader}>
                <span style={styles.roleSub}>Bảng điều khiển</span>
                <span style={styles.roleTitle}>
                    {role === 'ADMIN' ? 'Phòng Đào Tạo' : role === 'HEAD' ? 'Trưởng Bộ Môn' : 'Giảng Viên'}
                </span>
            </div>

            {/* Danh sách các nút chuyển trang */}
            <ul style={styles.menuList}>
                {activeMenu.map((item, index) => (
                    <li key={index} style={styles.menuItem}>
                        <NavLink 
                            to={item.path}
                            end
                            style={({ isActive }) => ({
                                ...styles.menuLink,
                                ...(isActive ? styles.activeLink : {})
                            })}
                        >
                            <span style={styles.iconWrapper}>{item.icon}</span>
                            <span style={styles.linkText}>{item.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

// --- STYLING SIDEBAR ---
const styles = {
    sidebar: {
        width: '260px',
        backgroundColor: '#1e293b', // Màu xám tối (slate-800) chuyên nghiệp
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #334155',
        height: 'calc(100vh - 70px)',
        position: 'sticky',
        top: '70px',
        fontFamily: "'Inter', sans-serif"
    },
    roleHeader: {
        padding: '24px 20px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    roleSub: {
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#64748b'
    },
    roleTitle: {
        fontSize: '16px',
        fontWeight: 700,
        color: '#f8fafc'
    },
    menuList: {
        listStyle: 'none',
        padding: '20px 10px',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    menuItem: {
        width: '100%'
    },
    menuLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    },
    activeLink: {
        backgroundColor: '#3b82f6', // Màu xanh chủ đạo khi active
        color: '#ffffff',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkText: {
        whiteSpace: 'nowrap'
    }
};

export default Sidebar;
