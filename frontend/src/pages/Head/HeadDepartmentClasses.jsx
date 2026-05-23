// =========================================================================
// TRANG DANH SÁCH LỚP BỘ MÔN & ĐỀ XUẤT (Head Department Classes Page)
// Vai trò: Dành cho Trưởng Khoa / Trưởng Bộ Môn (HEAD)
// Nghiệp vụ: Xem danh sách lớp học của bộ môn, lọc đề xuất và chọn Giảng viên
//            gợi ý từ hệ thống (rảnh lịch, đúng chuyên môn, chưa lố tải dạy).
// Tích hợp: Ant Design Components (Table, Modal, Button, Tag, Space, Card, Progress)
// =========================================================================

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Tag, Card, Typography, message, Tooltip, Progress, Badge } from 'antd';
import { UserAddOutlined, CheckCircleOutlined, ClockCircleOutlined, SolutionOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const HeadDepartmentClasses = () => {
    // 1. DANH SÁCH CÁC LỚP TÍN CHỈ CỦA BỘ MÔN (Mock Data bộ môn Công Nghệ Thông Tin)
    const [classes, setClasses] = useState([
        {
            key: '1',
            classCode: 'IT001',
            subjectName: 'Lập trình Java Cơ Bản',
            credits: 3,
            semester: 'Học kỳ 2025-1',
            status: 'OPEN', // Trống giảng viên
            lecturer: null
        },
        {
            key: '2',
            classCode: 'NET01',
            subjectName: 'Lập trình C# Nâng Cao',
            credits: 3,
            semester: 'Học kỳ 2025-1',
            status: 'PENDING', // Đã gửi đề xuất lên Admin chờ duyệt
            lecturer: 'Phạm Minh C'
        },
        {
            key: '3',
            classCode: 'IT002',
            subjectName: 'Cơ sở dữ liệu',
            credits: 3,
            semester: 'Học kỳ 2025-1',
            status: 'ASSIGNED', // Đã được phân công chính thức
            lecturer: 'TS. Trần Thị B'
        },
        {
            key: '4',
            classCode: 'AI102',
            subjectName: 'Trí tuệ nhân tạo nâng cao',
            credits: 4,
            semester: 'Học kỳ 2025-1',
            status: 'OPEN',
            lecturer: null
        },
        {
            key: '5',
            classCode: 'WEB02',
            subjectName: 'Phát triển ứng dụng Web động',
            credits: 3,
            semester: 'Học kỳ 2025-1',
            status: 'ASSIGNED',
            lecturer: 'Nguyễn Văn A'
        }
    ]);

    // Các trạng thái của Modal Gợi ý Giảng viên
    const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    // 2. DANH SÁCH GIẢNG VIÊN ĐƯỢC BACKEND GỢI Ý (Đúng chuyên môn, rảnh lịch, chưa lố giờ)
    // Hệ thống tự động chấm điểm và gợi ý Giảng viên phù hợp nhất lên đầu
    const mockSuggestedLecturers = [
        {
            key: 'gv1',
            name: 'Nguyễn Văn A',
            degree: 'Thạc sĩ',
            matchSpecialty: true,
            freeSchedule: true,
            currentHours: 42,
            maxHours: 90,
            suitabilityScore: 95 // Điểm độ tương thích
        },
        {
            key: 'gv2',
            name: 'TS. Hoàng Văn Nam',
            degree: 'Tiến sĩ',
            matchSpecialty: true,
            freeSchedule: true,
            currentHours: 36,
            maxHours: 90,
            suitabilityScore: 90
        },
        {
            key: 'gv3',
            name: 'Phan Thị Hồng',
            degree: 'Thạc sĩ',
            matchSpecialty: true,
            freeSchedule: true,
            currentHours: 68,
            maxHours: 90,
            suitabilityScore: 78 // Điểm thấp hơn vì giờ giảng dạy đã khá nhiều (68h)
        }
    ];

    // 3. XỬ LÝ CLICK CHỌN GIẢNG VIÊN
    const handleOpenLecturerModal = (record) => {
        setSelectedClass(record);
        setIsLecturerModalOpen(true);
    };

    // 4. XỬ LÝ ĐỀ XUẤT GIẢNG VIÊN (handleProposeAssignment)
    const handleProposeAssignment = (lecturer) => {
        // Cập nhật trạng thái lớp thành PENDING (Chờ duyệt) và gắn giảng viên đề xuất
        setClasses(prev => prev.map(item => {
            if (item.key === selectedClass.key) {
                return {
                    ...item,
                    status: 'PENDING',
                    lecturer: lecturer.name
                };
            }
            return item;
        }));

        setIsLecturerModalOpen(false);
        message.success(`Đã gửi đề xuất phân công giảng viên [${lecturer.name}] cho lớp [${selectedClass.classCode}] lên Phòng Đào Tạo!`);

        // Ở dự án thực tế, bạn sẽ gọi API POST gửi đề xuất:
        // axios.post('/api/assignments/propose', { classId: selectedClass.key, lecturerId: lecturer.key })
    };

    // 5. ĐỊNH NGHĨA CÁC CỘT CỦA BẢNG LỚP TÍN CHỈ CHÍNH
    const mainColumns = [
        {
            title: 'Mã Lớp',
            dataIndex: 'classCode',
            key: 'classCode',
            render: (text) => <Text strong style={{ color: '#4f46e5' }}>{text}</Text>,
            width: '12%'
        },
        {
            title: 'Tên Môn Học',
            dataIndex: 'subjectName',
            key: 'subjectName',
            render: (text, record) => (
                <div>
                    <Text strong style={{ color: '#1f2937' }}>{text}</Text>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{record.semester} | {record.credits} Tín chỉ</div>
                </div>
            ),
            width: '30%'
        },
        {
            title: 'Giảng Viên Phụ Trách',
            key: 'lecturer',
            render: (_, record) => {
                if (record.status === 'OPEN') {
                    return <Text type="secondary" italic style={{ color: '#9ca3af' }}>Chưa phân công (Trống)</Text>;
                }
                return (
                    <Space size="small">
                        <SolutionOutlined style={{ color: '#4f46e5' }} />
                        <span style={{ fontWeight: 600, color: '#374151' }}>{record.lecturer}</span>
                    </Space>
                );
            },
            width: '25%'
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let label = 'Đang mở (Open)';
                
                if (status === 'ASSIGNED') {
                    color = 'success';
                    label = 'Đã phân công';
                } else if (status === 'PENDING') {
                    color = 'warning';
                    label = 'Đã gửi Admin (Pending)';
                }

                return <Tag color={color} style={{ fontWeight: 'bold', borderRadius: '4px' }}>{label}</Tag>;
            },
            width: '20%'
        },
        {
            title: 'Phân công',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'OPEN') {
                    return (
                        <Button 
                            type="primary" 
                            icon={<UserAddOutlined />}
                            onClick={() => handleOpenLecturerModal(record)}
                            style={{ 
                                backgroundColor: '#4f46e5', 
                                borderColor: '#4f46e5',
                                borderRadius: '8px',
                                fontWeight: 600
                            }}
                        >
                            Chọn GV
                        </Button>
                    );
                } else if (record.status === 'PENDING') {
                    return (
                        <Tooltip title="Đề xuất đang đợi Phòng Đào Tạo phê duyệt. Bạn không thể thay đổi lúc này.">
                            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                                <ClockCircleOutlined /> Đang chờ duyệt
                            </span>
                        </Tooltip>
                    );
                } else {
                    return (
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                            <CheckCircleOutlined /> Đã hoàn tất
                        </span>
                    );
                }
            },
            width: '13%'
        }
    ];

    // Cột của Table nhỏ gợi ý Giảng viên trong Modal
    const suggestedLecturerColumns = [
        {
            title: 'Học vị / Giảng viên',
            key: 'lecturer_info',
            render: (_, record) => (
                <div>
                    <strong>{record.name}</strong>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Chức danh: {record.degree}</div>
                </div>
            ),
            width: '35%'
        },
        {
            title: 'Tải Giảng Dạy Kỳ Này',
            key: 'workload',
            render: (_, record) => {
                const percent = Math.round((record.currentHours / record.maxHours) * 100);
                let color = '#10b981'; // Green
                if (percent > 85) color = '#ef4444'; // Red
                else if (percent > 70) color = '#f59e0b'; // Orange

                return (
                    <div style={{ width: '120px' }}>
                        <div style={{ fontSize: '11px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tải hiện tại:</span>
                            <strong>{record.currentHours}h / 90h</strong>
                        </div>
                        <Progress percent={percent} strokeColor={color} size="small" showInfo={false} />
                    </div>
                );
            },
            width: '35%'
        },
        {
            title: 'Độ Phù Hợp',
            dataIndex: 'suitabilityScore',
            key: 'suitabilityScore',
            render: (score) => {
                let color = 'green';
                if (score < 80) color = 'orange';
                return (
                    <Badge count={`${score}%`} style={{ backgroundColor: color === 'green' ? '#52c41a' : '#faad14' }} />
                );
            },
            width: '15%'
        },
        {
            title: 'Đề xuất',
            key: 'propose_btn',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleProposeAssignment(record)}
                    style={{ 
                        borderRadius: '6px',
                        backgroundColor: '#10b981',
                        borderColor: '#10b981',
                        fontWeight: 600
                    }}
                >
                    Đề xuất
                </Button>
            ),
            width: '15%'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Trang */}
            <div>
                <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                    📖 Quản Lý Lớp Tín Chỉ Bộ Môn
                </Title>
                <Text type="secondary">Xem danh sách lớp tín chỉ bộ môn CNTT, kiểm tra tải giảng dạy và gửi đề cử giảng viên phù hợp lên Phòng Đào Tạo</Text>
            </div>

            {/* Bảng danh sách lớp */}
            <Card 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    border: '1px solid #e5e7eb' 
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={mainColumns} 
                    dataSource={classes} 
                    pagination={{ pageSize: 5 }}
                    style={{ borderRadius: '16px', overflow: 'hidden' }}
                />
            </Card>

            {/* MODAL GỢI Ý GIẢNG VIÊN THÔNG MINH */}
            <Modal
                title={
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#4f46e5' }}>
                        💡 Hệ thống Gợi ý Giảng viên rảnh lịch & Đúng Chuyên môn
                    </span>
                }
                open={isLecturerModalOpen}
                onCancel={() => setIsLecturerModalOpen(false)}
                footer={null}
                width={700}
                style={{ top: 120 }}
            >
                {selectedClass && (
                    <div style={{ margin: '15px 0' }}>
                        <div style={{ 
                            backgroundColor: '#eff6ff', 
                            padding: '12px 16px', 
                            borderRadius: '10px', 
                            marginBottom: '20px',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <Text strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Lớp đang chọn:</Text>
                            <span style={{ marginLeft: '8px', fontWeight: 700 }}>
                                {selectedClass.classCode} - {selectedClass.subjectName} ({selectedClass.credits} tín chỉ)
                            </span>
                        </div>

                        <Text type="secondary" style={{ display: 'block', marginBottom: '10px' }}>
                            Danh sách các giảng viên thuộc tổ bộ môn đã được hệ thống tự động lọc theo điều kiện:
                            <br />
                            <strong>1. Đúng chuyên môn giảng dạy | 2. Rảnh lịch vào các ca của lớp | 3. Dưới định mức giờ tối đa.</strong>
                        </Text>

                        <Table 
                            columns={suggestedLecturerColumns}
                            dataSource={mockSuggestedLecturers}
                            pagination={false}
                            size="middle"
                            bordered
                            style={{ marginTop: '10px' }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HeadDepartmentClasses;
