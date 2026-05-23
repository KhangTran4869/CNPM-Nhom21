// =========================================================================
// BẢNG ĐIỀU KHIỂN GIẢNG VIÊN (Lecturer Dashboard Page)
// Vai trò: Dành cho Giảng Viên (LECTURER)
// Nghiệp vụ: Xem lịch giảng dạy cá nhân trong kỳ, số sinh viên tham gia lớp,
//            thống kê tổng số giờ dạy so với định mức giờ dạy chuẩn.
// Tích hợp: Ant Design Grid, Card, Statistic, Table, Tag, Progress, Button
// =========================================================================

import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Button, Progress, Space } from 'antd';
import { 
    CalendarOutlined, 
    HourglassOutlined, 
    CheckCircleOutlined, 
    WarningOutlined,
    ClockCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LecturerDashboard = () => {
    const navigate = useNavigate();

    // 1. DỮ LIỆU THỐNG KÊ GIẢNG DẠY (Metrics)
    const stats = [
        { 
            title: 'Lớp Giảng Dạy Kỳ Này', 
            value: 3, 
            suffix: 'lớp học',
            icon: <CalendarOutlined style={{ fontSize: '26px', color: '#3b82f6' }} />, 
            color: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '#bfdbfe'
        },
        { 
            title: 'Tổng Giờ Giảng Dạy', 
            value: 48, 
            suffix: 'giờ dạy',
            icon: <HourglassOutlined style={{ fontSize: '26px', color: '#8b5cf6' }} />, 
            color: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '#ddd6fe'
        },
        { 
            title: 'Định Mức Giờ Tối Đa', 
            value: 90, 
            suffix: 'giờ max',
            icon: <CheckCircleOutlined style={{ fontSize: '26px', color: '#10b981' }} />, 
            color: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '#a7f3d0'
        },
        { 
            title: 'Định Mức Còn Lại', 
            value: 42, 
            suffix: 'giờ rảnh',
            icon: <ClockCircleOutlined style={{ fontSize: '26px', color: '#f59e0b' }} />, 
            color: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '#fde68a'
        }
    ];

    // 2. DỮ LIỆU LỊCH GIẢNG DẠY CỦA GIẢNG VIÊN (Mock Data)
    const mySchedule = [
        { key: '1', code: 'JAVA01', course: 'Lập trình Java nâng cao', schedule: 'Thứ 3 (Ca Sáng)', room: 'Phòng học A101', totalStudents: 60, status: 'Active' },
        { key: '2', code: 'MANG03', course: 'An toàn bảo mật mạng', schedule: 'Thứ 5 (Ca Chiều)', room: 'Phòng học B202', totalStudents: 45, status: 'Active' },
        { key: '3', code: 'WEB05', course: 'Xây dựng web ReactJS', schedule: 'Thứ 6 (Ca Chiều)', room: 'Phòng Lab 403', totalStudents: 52, status: 'Active' }
    ];

    // Định nghĩa cột của bảng thời khóa biểu
    const columns = [
        {
            title: 'Mã Lớp',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong style={{ color: '#10b981' }}>{text}</Text>,
            width: '15%'
        },
        {
            title: 'Môn Học Phần',
            dataIndex: 'course',
            key: 'course',
            render: (text) => <Text strong>{text}</Text>,
            width: '35%'
        },
        {
            title: 'Lịch Giảng Dạy',
            dataIndex: 'schedule',
            key: 'schedule',
            render: (text) => <span style={{ fontWeight: 600, color: '#374151' }}>{text}</span>,
            width: '20%'
        },
        {
            title: 'Địa Điểm Học',
            dataIndex: 'room',
            key: 'room',
            width: '15%'
        },
        {
            title: 'Sỹ Số Sinh Viên',
            dataIndex: 'totalStudents',
            key: 'totalStudents',
            render: (count) => <Tag color="blue">{count} sinh viên</Tag>,
            width: '15%'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header thông tin chính */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                        📊 Bảng Điều Khiển Giảng Viên
                    </Title>
                    <Text type="secondary">Xem thời khóa biểu giảng dạy chính thức, theo dõi tổng giờ dạy và báo bận ca học</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<CalendarOutlined />} 
                    onClick={() => navigate('/lecturer/availability')}
                    style={{ 
                        borderRadius: '8px', 
                        fontWeight: 600,
                        backgroundColor: '#10b981',
                        borderColor: '#10b981',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)'
                    }}
                >
                    Báo Lịch Bận
                </Button>
            </div>

            {/* Grid Thống kê cá nhân */}
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

            {/* Biểu đồ phần trăm tải dạy */}
            <Card 
                style={{ 
                    borderRadius: '16px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
                }}
            >
                <Row gutter={[20, 20]} align="middle">
                    <Col xs={24} md={18}>
                        <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
                            📈 Định Mức Tải Giảng Dạy Đã Đạt
                        </Title>
                        <Text type="secondary">
                            Bạn đã hoàn thành <strong>48 giờ dạy</strong> trên tổng số định mức tối đa cho phép là <strong>90 giờ dạy</strong> trong học kỳ 2025-1.
                        </Text>
                    </Col>
                    <Col xs={24} md={6} style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '150px', textAlign: 'center' }}>
                            <Progress 
                                type="circle" 
                                percent={53} 
                                strokeColor={{
                                    '0%': '#8b5cf6',
                                    '100%': '#3b82f6',
                                }}
                                width={110}
                                strokeWidth={8}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>Tải dạy đạt 53%</div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Bảng Thời khóa biểu dạy học */}
            <Card 
                title={<span style={{ fontWeight: 800, color: '#1f2937' }}>🗓️ Thời Khóa Biểu Giảng Dạy Học Kỳ Này</span>} 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                    border: '1px solid #e5e7eb'
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={mySchedule} 
                    pagination={false}
                    style={{ borderRadius: '16px', overflow: 'hidden' }}
                />
            </Card>
        </div>
    );
};

export default LecturerDashboard;
