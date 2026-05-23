// =========================================================================
// THANH DIỀU HƯỚNG TRÊN (Navbar Component)
// Thiết kế: Premium Glassmorphism (Kính mờ hiện đại), đổ bóng mịn màng,
// tích hợp hiệu ứng vi mô (micro-animations) khi rê chuột.
// =========================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    
    // Lấy thông tin người dùng hiện tại để hiển thị chào mừng
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : { username: 'Khách', role: 'GUEST' };

    const handleLogout = () => {
        localStorage.clear(); // Xóa sạch dữ liệu đăng nhập
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            {/* Logo hoặc Tên hệ thống */}
            <div style={styles.logoSection}>
                <div style={styles.logoIcon}>🎓</div>
                <span style={styles.logoText}>Hệ thống Phân Công Giảng Dạy</span>
            </div>

            {/* Khung chức năng người dùng */}
            <div style={styles.actions}>
                {/* Nút thông báo hoạt cảnh */}
                <button style={styles.iconButton} title="Thông báo">
                    <Bell size={20} />
                    <span style={styles.badge}></span>
                </button>

                {/* Thông tin hồ sơ nhanh */}
                <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                        <User size={16} color="#fff" />
                    </div>
                    <div style={styles.userText}>
                        <span style={styles.username}>{user.username}</span>
                        <span style={styles.roleTag}>{user.role.toUpperCase()}</span>
                    </div>
                </div>

                {/* Nút Đăng xuất */}
                <button onClick={handleLogout} style={styles.logoutButton} title="Đăng xuất">
                    <LogOut size={18} />
                    <span style={styles.logoutText}>Đăng xuất</span>
                </button>
            </div>
        </nav>
    );
};

// --- STYLING ĐỘC LẬP THEO PHONG CÁCH HIỆN ĐẠI (Premium HSL Palette & Blur) ---
const styles = {
    nav: {
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 30px',
        // Thiết kế mặt kính mờ (Glassmorphism)
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
        fontFamily: "'Inter', sans-serif"
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    logoIcon: {
        fontSize: '24px',
        animation: 'bounce 2s infinite'
    },
    logoText: {
        fontSize: '18px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', // Gradient thanh lịch
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    iconButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b',
        position: 'relative',
        padding: '8px',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ':hover': {
            backgroundColor: '#f1f5f9',
            color: '#3b82f6'
        }
    },
    badge: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        width: '8px',
        height: '8px',
        backgroundColor: '#ef4444',
        borderRadius: '50%',
        border: '2px solid #fff'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderRight: '1px solid #e2e8f0',
        paddingRight: '20px'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
    },
    userText: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    username: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#1e293b'
    },
    roleTag: {
        fontSize: '10px',
        fontWeight: 700,
        color: '#6366f1',
        textTransform: 'uppercase',
        backgroundColor: '#e0e7ff',
        padding: '2px 6px',
        borderRadius: '4px',
        marginTop: '2px'
    },
    logoutButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        color: '#ef4444',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ':hover': {
            backgroundColor: '#ef4444',
            color: '#fff',
            transform: 'translateY(-1px)'
        }
    },
    logoutText: {
        display: 'inline'
    }
};

export default Navbar;
