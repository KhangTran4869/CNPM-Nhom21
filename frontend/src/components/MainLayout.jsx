// =========================================================================
// KHUNG GIAO DIỆN CHUNG ANTD (MainLayout Component)
// Thiết kế: Sử dụng hệ thống Grid và Layout của Ant Design (antd).
// Menu thích ứng động theo vai trò (Role) của người đang đăng nhập.
// Tương thích hoàn hảo với thiết kế Dashboard hiện đại!
// =========================================================================

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Space, Typography, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    DashboardOutlined, 
    BookOutlined, 
    UserOutlined, 
    CheckSquareOutlined, 
    FileTextOutlined, 
    CalendarOutlined, 
    ClockCircleOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    
    // Đọc thông tin người dùng từ localStorage
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : { username: 'Khách', role: 'GUEST' };
    const role = user.role.toUpperCase();

    // Đồng bộ menu active key dựa trên đường dẫn hiện tại
    const [activeKey, setActiveKey] = useState(location.pathname);

    useEffect(() => {
        setActiveKey(location.pathname);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- 📋 THIẾT LẬP MENU THEO VAI TRÒ (DYNAMIC MENU ITEMS) ---
    const getMenuItems = () => {
        if (role === 'ADMIN') {
            return [
                {
                    key: '/admin',
                    icon: <DashboardOutlined />,
                    label: 'Bảng Điều Khiển',
                    onClick: () => navigate('/admin')
                },
                {
                    key: '/admin/classes',
                    icon: <BookOutlined />,
                    label: 'Quản Lý Lớp Tín Chỉ',
                    onClick: () => navigate('/admin/classes')
                },
                {
                    key: '/admin/approve',
                    icon: <CheckSquareOutlined />,
                    label: 'Duyệt Phân Công',
                    onClick: () => navigate('/admin/approve')
                },
                {
                    key: '/admin/reports',
                    icon: <FileTextOutlined />,
                    label: 'Báo Cáo Thống Kê',
                    onClick: () => navigate('/admin/reports')
                }
            ];
        } else if (role === 'HEAD') {
            return [
                {
                    key: '/head',
                    icon: <DashboardOutlined />,
                    label: 'Bảng Điều Khiển',
                    onClick: () => navigate('/head')
                },
                {
                    key: '/head/classes',
                    icon: <BookOutlined />,
                    label: 'Lớp Bộ Môn',
                    onClick: () => navigate('/head/classes')
                },
                {
                    key: '/head/propose',
                    icon: <CheckSquareOutlined />,
                    label: 'Theo Dõi Đề Xuất',
                    onClick: () => navigate('/head/propose')
                },
                {
                    key: '/head/calendar',
                    icon: <CalendarOutlined />,
                    label: 'Lịch Bộ Môn',
                    onClick: () => navigate('/head/calendar')
                }
            ];
        } else if (role === 'LECTURER') {
            return [
                {
                    key: '/lecturer',
                    icon: <CalendarOutlined />,
                    label: 'Lịch Giảng Dạy',
                    onClick: () => navigate('/lecturer')
                },
                {
                    key: '/lecturer/availability',
                    icon: <ClockCircleOutlined />,
                    label: 'Báo Lịch Bận',
                    onClick: () => navigate('/lecturer/availability')
                },
                {
                    key: '/lecturer/workload',
                    icon: <FileTextOutlined />,
                    label: 'Khối Lượng Dạy',
                    onClick: () => navigate('/lecturer/workload')
                }
            ];
        }
        return [];
    };

    return (
        <Layout style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* 1. THANH MENU BÊN TRÁI (SIDER) */}
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="dark"
                width={260}
                style={{
                    boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
                    backgroundColor: '#111827' // Xám đậm siêu sang trọng
                }}
            >
                {/* Logo Trường / Tên Ứng dụng */}
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: '0 24px',
                    borderBottom: '1px solid #1f2937',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '24px' }}>🎓</span>
                    {!collapsed && (
                        <Title level={5} style={{ margin: 0, color: '#ffffff', fontWeight: 800, fontSize: '15px' }}>
                            U-ASSIGNMENT
                        </Title>
                    )}
                </div>

                {/* Danh sách Menu */}
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={[activeKey]}
                    items={getMenuItems()}
                    style={{ 
                        padding: '16px 0',
                        backgroundColor: 'transparent'
                    }}
                />
            </Sider>

            {/* 2. KHU VỰC CHỨA HEADER VÀ NỘI DUNG CHÍNH */}
            <Layout>
                {/* THANH ĐẦU TRANG (HEADER) */}
                <Header style={{
                    background: '#ffffff',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    height: 64
                }}>
                    <Space size="middle">
                        <Text strong style={{ fontSize: '15px', color: '#111827' }}>
                            🏫 Hệ thống phân công giảng dạy tín chỉ
                        </Text>
                    </Space>

                    {/* Khối Thông tin User và nút Đăng xuất */}
                    <Space size="large" style={{ display: 'flex', alignItems: 'center' }}>
                        <Button 
                            type="text" 
                            icon={<BellOutlined style={{ fontSize: '18px', color: '#4b5563' }} />} 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                        
                        <Space style={{ 
                            borderLeft: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Avatar style={{ 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)' 
                            }} icon={<UserOutlined />} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <Text strong style={{ fontSize: '14px', color: '#111827' }}>{user.username}</Text>
                                <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                                    {role === 'ADMIN' ? 'Phòng Đào Tạo' : role === 'HEAD' ? 'Trưởng Khoa' : 'Giảng Viên'}
                                </Text>
                            </div>
                        </Space>

                        <Button 
                            type="primary" 
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{ 
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Đăng xuất
                        </Button>
                    </Space>
                </Header>

                {/* 3. NỘI DUNG TRANG HIỆN THỊ (CONTENT) */}
                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                    minHeight: 280,
                    overflowY: 'auto'
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
