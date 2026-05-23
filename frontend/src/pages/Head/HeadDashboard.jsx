// =========================================================================
// BẢNG ĐIỀU KHIỂN TRƯỞNG KHOA / BỘ MÔN (Head Dashboard Page)
// Vai trò: Dành cho Trưởng Khoa (HEAD)
// Nghiệp vụ: Giúp Trưởng khoa xem thống kê nội bộ khoa, quản lý tải giảng dạy
//            của các thầy cô trực thuộc bộ môn và các đề xuất đang gửi.
// Tích hợp: Ant Design Grid, Card, Statistic, Table, Tag, Progress
// =========================================================================

import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Button, Space, Progress } from 'antd';
import { 
    BookOutlined, 
    UserOutlined, 
    SendOutlined, 
    AlertOutlined, 
    ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const HeadDashboard = () => {
    const navigate = useNavigate();

    // 1. DỮ LIỆU THỐNG KÊ KHOA (CNTT)
    const stats = [
        { 
            title: 'Lớp Bộ Môn Quản Lý', 
            value: 8, 
            suffix: 'lớp',
            icon: <BookOutlined style={{ fontSize: '26px', color: '#4f46e5' }} />, 
            color: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '#bfdbfe'
        },
        { 
            title: 'Giảng Viên Trực Thuộc', 
            value: 12, 
            suffix: 'giảng viên',
            icon: <UserOutlined style={{ fontSize: '26px', color: '#8b5cf6' }} />, 
            color: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '#ddd6fe'
        },
        { 
            title: 'Đề Xuất Đã Gửi', 
            value: 3, 
            suffix: 'đề xuất',
            icon: <SendOutlined style={{ fontSize: '26px', color: '#10b981' }} />, 
            color: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '#a7f3d0'
        },
        { 
            title: 'Lớp Chưa Phân Công', 
            value: 2, 
            suffix: 'lớp trống',
            icon: <AlertOutlined style={{ fontSize: '26px', color: '#f59e0b' }} />, 
            color: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '#fde68a'
        }
    ];

    // 2. DANH SÁCH ĐỀ XUẤT ĐANG CHỜ PHÊ DUYỆT (Mock Data)
    const proposalClasses = [
        { key: '1', code: 'CSDL02', course: 'Cơ sở dữ liệu phân tán', credits: 3, suggested: 'TS. Nguyễn Văn A', status: 'Pending', time: '10 phút trước' },
        { key: '2', code: 'AI_04', course: 'Trí tuệ nhân tạo cơ bản', credits: 4, suggested: 'ThS. Trần Thị C', status: 'Pending', time: '1 giờ trước' }
    ];

    // Định nghĩa cột bảng đề xuất nhanh
    const columns = [
        {
            title: 'Mã Lớp',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong style={{ color: '#4f46e5' }}>{text}</Text>,
            width: '15%'
        },
        {
            title: 'Tên Môn Học',
            dataIndex: 'course',
            key: 'course',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <div style={{ fontSize: '11px', color: '#888' }}>Số tín chỉ: {record.credits} tín chỉ</div>
                </div>
            ),
            width: '35%'
        },
        {
            title: 'Giảng Viên Được Đề Xuất',
            dataIndex: 'suggested',
            key: 'suggested',
            render: (text) => <span style={{ fontWeight: 600, color: '#374151' }}>{text}</span>,
            width: '25%'
        },
        {
            title: 'Thời gian gửi',
            dataIndex: 'time',
            key: 'time',
            render: (text) => <span style={{ color: '#6b7280', fontSize: '13px' }}>{text}</span>,
            width: '15%'
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: () => (
                <Tag color="gold" style={{ fontWeight: 'bold' }}>
                    Chờ Admin duyệt
                </Tag>
            ),
            width: '10%'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header thông tin chính */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                        📊 Bảng Điều Khiển Trưởng Bộ Môn
                    </Title>
                    <Text type="secondary">Quản lý lớp chuyên ngành thuộc Khoa Công Nghệ Thông Tin, đề xuất giảng dạy và kiểm tra mức tải dạy</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<ArrowRightOutlined />} 
                    onClick={() => navigate('/head/classes')}
                    style={{ 
                        borderRadius: '8px', 
                        fontWeight: 600,
                        backgroundColor: '#4f46e5',
                        borderColor: '#4f46e5'
                    }}
                >
                    Phân Công Ngay
                </Button>
            </div>

            {/* Grid Thống kê */}
            <Row gutter={[20, 20]}>
                {stats.map((stat, idx) => (
                    <Col xs={24} sm={12} md={6} key={idx}>
                        <Card
                            bordered
                            style={{
                                background: stat.color,
                                borderColor: stat.border,
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
                                        {stat.title}
                                    </span>
                                    <Statistic 
                                        value={stat.value} 
                                        suffix={<span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}> {stat.suffix}</span>}
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
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Bảng Đề Xuất Đang Chờ Phê Duyệt */}
            <Card 
                title={<span style={{ fontWeight: 800, color: '#1f2937' }}>✉️ Danh Sách Đề Xuất Đang Chờ Duyệt (Pending)</span>} 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                    border: '1px solid #e5e7eb'
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={proposalClasses} 
                    pagination={false}
                    style={{ borderRadius: '16px', overflow: 'hidden' }}
                />
            </Card>
        </div>
    );
};

export default HeadDashboard;
