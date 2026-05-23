// =========================================================================
// BẢNG ĐIỀU KHIỂN PHÒNG ĐÀO TẠO (Admin Dashboard Page)
// Vai trò: Dành cho Phòng Đào Tạo (ADMIN)
// Nghiệp vụ: Xem tổng quan thống kê lớp tín chỉ, số lượng giảng viên,
//            đề xuất chờ duyệt và trạng thái các lớp đang mở.
// Tích hợp: Ant Design Grid, Card, Statistic, Table, Tag, Button
// =========================================================================

import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Button, Space } from 'antd';
import { 
    BookOutlined, 
    UserOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    PlusOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    // 1. DỮ LIỆU THỐNG KÊ (Metrics Cards)
    const statCards = [
        { 
            title: 'Lớp Tín Chỉ Học Kỳ', 
            value: 18, 
            suffix: 'lớp',
            icon: <BookOutlined style={{ fontSize: '26px', color: '#3b82f6' }} />, 
            color: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '#bfdbfe'
        },
        { 
            title: 'Giảng Viên Đăng Ký', 
            value: 45, 
            suffix: 'giảng viên',
            icon: <UserOutlined style={{ fontSize: '26px', color: '#8b5cf6' }} />, 
            color: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '#ddd6fe'
        },
        { 
            title: 'Yêu Cầu Chờ Duyệt', 
            value: 5, 
            suffix: 'đề xuất',
            icon: <ClockCircleOutlined style={{ fontSize: '26px', color: '#f59e0b' }} />, 
            color: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '#fde68a'
        },
        { 
            title: 'Đã Duyệt Phân Công', 
            value: 13, 
            suffix: 'lớp học',
            icon: <CheckCircleOutlined style={{ fontSize: '26px', color: '#10b981' }} />, 
            color: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '#a7f3d0'
        }
    ];

    // 2. DỮ LIỆU BẢNG LỚP TÍN CHỈ NHANH (Mock Data)
    const sampleClasses = [
        { key: '1', code: 'JAVA01', course: 'Lập trình Java nâng cao', dept: 'Công nghệ thông tin', status: 'Assigned', lecturer: 'TS. Nguyễn Văn A' },
        { key: '2', code: 'CSDL02', course: 'Cơ sở dữ liệu phân tán', dept: 'Hệ thống thông tin', status: 'Open', lecturer: 'Chưa phân công' },
        { key: '3', code: 'MANG03', course: 'An toàn bảo mật mạng', dept: 'An toàn thông tin', status: 'Assigned', lecturer: 'ThS. Lê Thị B' },
        { key: '4', code: 'AI_04', course: 'Trí tuệ nhân tạo cơ bản', dept: 'Khoa học máy tính', status: 'Open', lecturer: 'Chưa phân công' },
        { key: '5', code: 'WEB05', course: 'Xây dựng web ReactJS', dept: 'Công nghệ phần mềm', status: 'Assigned', lecturer: 'TS. Trịnh Quang K' }
    ];

    // Định nghĩa cột của bảng lớp
    const columns = [
        {
            title: 'Mã Lớp',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong style={{ color: '#1e3a8a' }}>{text}</Text>,
            width: '15%'
        },
        {
            title: 'Tên Môn Học',
            dataIndex: 'course',
            key: 'course',
            render: (text) => <Text strong>{text}</Text>,
            width: '35%'
        },
        {
            title: 'Bộ Môn Quản Lý',
            dataIndex: 'dept',
            key: 'dept',
            width: '25%'
        },
        {
            title: 'Giảng Viên Phụ Trách',
            dataIndex: 'lecturer',
            key: 'lecturer',
            render: (lecturer) => (
                <span style={{ 
                    color: lecturer === 'Chưa phân công' ? '#9ca3af' : '#374151',
                    fontWeight: lecturer === 'Chưa phân công' ? 'normal' : 600
                }}>
                    {lecturer}
                </span>
            ),
            width: '25%'
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Assigned' ? 'success' : 'error'} style={{ fontWeight: 'bold' }}>
                    {status === 'Assigned' ? 'Đã phân công' : 'Đang mở (Open)'}
                </Tag>
            ),
            width: '15%'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header thông tin chính */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                        📊 Bảng Điều Khiển Phòng Đào Tạo
                    </Title>
                    <Text type="secondary">Tổng hợp số liệu phân công, tiến độ phê duyệt và mở lớp tín chỉ học kỳ hiện tại</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    style={{ 
                        borderRadius: '8px', 
                        fontWeight: 600,
                        backgroundColor: '#3b82f6',
                        borderColor: '#3b82f6'
                    }}
                >
                    Tạo Lớp Tín Chỉ
                </Button>
            </div>

            {/* Grid Thống kê (Metrics Cards Grid) */}
            <Row gutter={[20, 20]}>
                {statCards.map((card, idx) => (
                    <Col xs={24} sm={12} md={6} key={idx}>
                        <Card
                            bordered
                            style={{
                                background: card.color,
                                borderColor: card.border,
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                                transition: 'transform 0.2s ease',
                                cursor: 'default'
                            }}
                            bodyStyle={{ padding: '20px 24px' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500, marginBottom: '4px' }}>
                                        {card.title}
                                    </span>
                                    <Statistic 
                                        value={card.value} 
                                        suffix={<span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}> {card.suffix}</span>}
                                        valueStyle={{ fontWeight: 800, fontSize: '26px', color: '#111827' }} 
                                    />
                                </div>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '12px', 
                                    backgroundColor: '#ffffff', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                                }}>
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Khu vực Bảng Lớp Tín Chỉ */}
            <Card 
                title={<span style={{ fontWeight: 800, color: '#1f2937' }}>🏫 Tiến Độ Phân Công Các Lớp Học Phần</span>} 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                    border: '1px solid #e5e7eb'
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={sampleClasses} 
                    pagination={false}
                    style={{ borderRadius: '16px', overflow: 'hidden' }}
                />
            </Card>
        </div>
    );
};

export default AdminDashboard;
