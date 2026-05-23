// =========================================================================
// TRANG ĐĂNG NHẬP HỆ THỐNG (Login Page Component)
// Thiết kế: Premium Glassmorphism, nền chìm Gradient động, biểu mẫu nổi,
// hỗ trợ đăng nhập nhanh bằng các vai trò để trình bày báo cáo cực kỳ tiện lợi!
// =========================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // --- 🧪 CHỨC NĂNG GIẢ LẬP ĐỂ BÁO CÁO NHANH (MOCK LOGIN) ---
        // Giúp người dùng/giảng viên chấm bài kiểm tra 3 vai trò ngay lập tức!
        setTimeout(() => {
            let role = '';
            let nameDisplay = '';
            
            const lowerUser = username.trim().toLowerCase();

            if (lowerUser === 'admin') {
                role = 'ADMIN';
                nameDisplay = 'Nguyễn Đào Tạo (Đại diện PĐT)';
            } else if (lowerUser === 'head') {
                role = 'HEAD';
                nameDisplay = 'Trần Khoa Trưởng (Trưởng Khoa)';
            } else if (lowerUser === 'lecturer' || lowerUser === 'gv') {
                role = 'LECTURER';
                nameDisplay = 'Phạm Giảng Viên (Giảng Viên)';
            } else {
                setError('Tên đăng nhập không đúng! Dùng thử: admin, head, lecturer');
                setLoading(false);
                return;
            }

            // Lưu trữ thông tin đăng nhập vào localStorage
            localStorage.setItem('token', 'mock_jwt_token_for_assignment_system');
            localStorage.setItem('user', JSON.stringify({
                username: nameDisplay,
                role: role
            }));

            // Điều hướng đúng vai trò
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'HEAD') navigate('/head');
            else if (role === 'LECTURER') navigate('/lecturer');

            setLoading(false);
        }, 800);
    };

    return (
        <div style={styles.container}>
            {/* Vòng tròn trang trí phát sáng phía sau tạo độ sâu */}
            <div style={styles.circle1}></div>
            <div style={styles.circle2}></div>

            {/* Form đăng nhập mặt kính mờ */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>🏫</div>
                    <h2 style={styles.title}>Hệ Thống Phân Công</h2>
                    <p style={styles.subtitle}>Quản lý giảng dạy các lớp tín chỉ</p>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    {/* Ô nhập Tài khoản */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên đăng nhập</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} style={styles.inputIcon} />
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tài khoản (admin / head / lecturer)"
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Ô nhập Mật khẩu */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu bất kỳ"
                                required
                                style={styles.input}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Nút Đăng nhập */}
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập Hệ Thống'}
                    </button>
                </form>

                {/* Phần gợi ý tài khoản test (Cực kỳ chu đáo khi báo cáo đồ án) */}
                <div style={styles.helperSection}>
                    <span style={styles.helperTitle}>Tài khoản chạy thử nhanh (Báo cáo):</span>
                    <div style={styles.accountsGrid}>
                        <div onClick={() => { setUsername('admin'); setPassword('123456'); }} style={styles.accountBadge}>
                            🔑 admin
                        </div>
                        <div onClick={() => { setUsername('head'); setPassword('123456'); }} style={styles.accountBadge}>
                            🔑 head
                        </div>
                        <div onClick={() => { setUsername('lecturer'); setPassword('123456'); }} style={styles.accountBadge}>
                            🔑 lecturer
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLING CHO TRANG LOGIN PREMIUM ---
const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 10% 20%, #1e1b4b 0%, #09090b 100%)', // Nền sâu thẳm cực sang trọng
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', sans-serif"
    },
    // Vòng phát sáng màu tím
    circle1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
        top: '15%',
        left: '25%',
        filter: 'blur(30px)'
    },
    // Vòng phát sáng màu xanh dương
    circle2: {
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 70%)',
        bottom: '15%',
        right: '25%',
        filter: 'blur(40px)'
    },
    card: {
        width: '420px',
        padding: '40px',
        borderRadius: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    header: {
        textAlign: 'center'
    },
    logo: {
        fontSize: '44px',
        marginBottom: '10px'
    },
    title: {
        fontSize: '24px',
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.5px',
        marginBottom: '6px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#71717a'
    },
    errorAlert: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ef4444',
        padding: '12px',
        borderRadius: '10px',
        fontSize: '13px',
        textAlign: 'center',
        fontWeight: 500
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#a1a1aa',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '14px',
        color: '#71717a'
    },
    input: {
        width: '100%',
        padding: '14px 14px 14px 44px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        outline: 'none',
        ':focus': {
            border: '1px solid #3b82f6',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
    },
    eyeBtn: {
        position: 'absolute',
        right: '14px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#71717a',
        display: 'flex',
        alignItems: 'center'
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        color: '#ffffff',
        border: 'none',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
        transition: 'all 0.3s ease',
        marginTop: '10px',
        ':hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 25px rgba(59, 130, 246, 0.4)'
        }
    },
    helperSection: {
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    helperTitle: {
        fontSize: '11px',
        color: '#71717a',
        fontWeight: 600,
        textTransform: 'uppercase'
    },
    accountsGrid: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px'
    },
    accountBadge: {
        flex: 1,
        textAlign: 'center',
        padding: '8px 4px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#a1a1aa',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            color: '#3b82f6'
        }
    }
};

export default Login;
