// =========================================================================
// TRANG DUYỆT PHÂN CÔNG GIẢNG VIÊN (Admin Assignments Page)
// Vai trò: Dành cho Phòng Đào Tạo (ADMIN)
// Nghiệp vụ: Xem, Duyệt hoặc Từ chối các đề xuất phân công từ Trưởng Khoa.
// Tích hợp: Ant Design Components (Table, Modal, Tag, Alert, Input.TextArea)
// =========================================================================

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Input, message, Tag, Card, Typography, Alert, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AdminAssignments = () => {
    // 1. DỮ LIỆU GIẢ LẬP ĐỂ HIỂN THỊ (Mock Data phục vụ thuyết trình)
    const [pendingAssignments, setPendingAssignments] = useState([
        {
            key: '1',
            classCode: 'IT001',
            subjectName: 'Lập trình Java Cơ Sở',
            proposer: 'Trưởng khoa CNTT - TS. Trần Văn Đạt',
            lecturerName: 'Nguyễn Văn A',
            currentHours: 42,
            maxHours: 90,
            semester: 'Học kỳ 2025-1',
            department: 'Công nghệ thông tin'
        },
        {
            key: '2',
            classCode: 'IT002',
            subjectName: 'Cơ sở dữ liệu',
            proposer: 'Trưởng khoa CNTT - TS. Trần Văn Đạt',
            lecturerName: 'Trần Thị B',
            currentHours: 78,
            maxHours: 90,
            semester: 'Học kỳ 2025-1',
            department: 'Công nghệ thông tin'
        },
        {
            key: '3',
            classCode: 'NET01',
            subjectName: 'Lập trình C# Nâng Cao',
            proposer: 'Trưởng khoa An toàn thông tin',
            lecturerName: 'Phạm Minh C',
            currentHours: 54,
            maxHours: 90,
            semester: 'Học kỳ 2025-1',
            department: 'An toàn thông tin'
        },
        {
            key: '4',
            classCode: 'AI102',
            subjectName: 'Trí tuệ nhân tạo nâng cao',
            proposer: 'Trưởng khoa CNTT - TS. Trần Văn Đạt',
            lecturerName: 'TS. Lê Hoàng D',
            currentHours: 86, // Gần quá tải tối đa 90h
            maxHours: 90,
            semester: 'Học kỳ 2025-1',
            department: 'Công nghệ thông tin'
        }
    ]);

    // Các trạng thái của Modal Từ chối
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // 2. XỬ LÝ DUYỆT PHÂN CÔNG (handleApprove)
    const handleApprove = (record) => {
        Modal.confirm({
            title: 'Xác nhận duyệt phân công?',
            icon: <ExclamationCircleOutlined style={{ color: '#52c41a' }} />,
            content: `Bạn có chắc chắn muốn duyệt giảng viên [${record.lecturerName}] phụ trách lớp [${record.classCode} - ${record.subjectName}]?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
            onOk() {
                // Xử lý xóa dòng đã duyệt khỏi danh sách chờ (Giả lập gọi API thành công)
                setPendingAssignments(prev => prev.filter(item => item.key !== record.key));
                message.success(`Đã DUYỆT phân công lớp ${record.classCode} thành công!`);
                
                // Ở dự án thực tế, bạn sẽ gọi API tại đây:
                // axios.post('/api/assignments/approve', { classCode: record.classCode })
            }
        });
    };

    // 3. XỬ LÝ MỞ MODAL TỪ CHỐI
    const showRejectModal = (record) => {
        setSelectedRecord(record);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    // 4. XỬ LÝ SUBMIT TỪ CHỐI PHÂN CÔNG (handleReject gửi lý do xuống Backend)
    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) {
            message.warning('Vui lòng nhập lý do từ chối phân công!');
            return;
        }

        // Thực hiện cập nhật danh sách (Giả lập API thành công)
        setPendingAssignments(prev => prev.filter(item => item.key !== selectedRecord.key));
        setIsRejectModalOpen(false);
        
        message.error(`Đã TỪ CHỐI đề xuất lớp ${selectedRecord.classCode}. Lý do: ${rejectReason}`);

        // Ở dự án thực tế, bạn sẽ gửi lý do từ chối lên API tại đây:
        // axios.post('/api/assignments/reject', { classCode: selectedRecord.classCode, reason: rejectReason })
    };

    // 5. ĐỊNH NGHĨA CÁC CỘT CỦA BẢNG TABLE ANTD
    const columns = [
        {
            title: 'Mã Lớp',
            dataIndex: 'classCode',
            key: 'classCode',
            render: (text) => <Text strong style={{ color: '#1e3a8a' }}>{text}</Text>,
            width: '10%'
        },
        {
            title: 'Tên Môn Học',
            dataIndex: 'subjectName',
            key: 'subjectName',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <div style={{ fontSize: '11px', color: '#888' }}>{record.semester} | {record.department}</div>
                </div>
            ),
            width: '25%'
        },
        {
            title: 'Người Đề Xuất',
            dataIndex: 'proposer',
            key: 'proposer',
            render: (text) => <Tag color="blue">{text}</Tag>,
            width: '25%'
        },
        {
            title: 'Giảng Viên Đề Xuất',
            dataIndex: 'lecturerName',
            key: 'lecturerName',
            render: (text) => <span style={{ fontWeight: 600, color: '#4b5563' }}>{text}</span>,
            width: '15%'
        },
        {
            title: 'Số Giờ Hiện Tại / Định Mức',
            key: 'hours',
            render: (_, record) => {
                const ratio = record.currentHours / record.maxHours;
                let color = 'green';
                if (ratio > 0.9) color = 'red';
                else if (ratio > 0.7) color = 'orange';

                return (
                    <Space direction="vertical" size={0}>
                        <span>
                            <Badge color={color} />
                            <strong>{record.currentHours}h</strong> / {record.maxHours}h
                        </span>
                        {ratio > 0.9 && (
                            <Text type="danger" style={{ fontSize: '10px' }}>⚠️ Sắp quá tải định mức</Text>
                        )}
                    </Space>
                );
            },
            width: '15%'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<CheckOutlined />} 
                        onClick={() => handleApprove(record)}
                        style={{ 
                            backgroundColor: '#10b981', 
                            borderColor: '#10b981',
                            borderRadius: '6px',
                            fontWeight: 600
                        }}
                    >
                        Duyệt
                    </Button>
                    <Button 
                        type="primary" 
                        danger 
                        icon={<CloseOutlined />} 
                        onClick={() => showRejectModal(record)}
                        style={{ 
                            borderRadius: '6px',
                            fontWeight: 600
                        }}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
            width: '10%'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Trang */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                        📋 Quản lý Đề xuất Phân công
                    </Title>
                    <Text type="secondary">Xem xét và phê duyệt danh sách giảng viên phụ trách các lớp tín chỉ được đề xuất bởi Trưởng khoa</Text>
                </div>
                <Tag color="gold" style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                    Trạng thái: PENDING ({pendingAssignments.length})
                </Tag>
            </div>

            {/* Thông báo hướng dẫn nhanh */}
            <Alert
                message="Lưu ý dành cho Admin Phòng Đào Tạo"
                description="Hệ thống đã tự động liên kết cơ sở dữ liệu để hiển thị số giờ giảng dạy hiện tại của Giảng viên so với định mức 90 giờ tối đa. Vui lòng không duyệt cho giảng viên đã quá tải (hiển thị cảnh báo màu đỏ) trừ trường hợp đặc biệt."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ borderRadius: '10px' }}
            />

            {/* Bảng danh sách đề xuất */}
            <Card 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    border: '1px solid #e5e7eb' 
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={pendingAssignments} 
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: '🎉 Tuyệt vời! Không còn đề xuất nào đang chờ duyệt.' }}
                    style={{ borderRadius: '16px', overflow: 'hidden' }}
                />
            </Card>

            {/* MODAL TỪ CHỐI (Nhập lý do từ chối - Bắt buộc) */}
            <Modal
                title={
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>
                        <CloseOutlined /> Từ chối Đề xuất Phân công
                    </span>
                }
                open={isRejectModalOpen}
                onOk={handleRejectSubmit}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="Gửi Từ chối"
                cancelText="Hủy bỏ"
                okButtonProps={{ danger: true }}
                style={{ top: 150 }}
            >
                {selectedRecord && (
                    <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                        <p>Bạn đang từ chối đề xuất phân công giảng viên <strong>{selectedRecord.lecturerName}</strong> dạy lớp <strong>{selectedRecord.classCode} - {selectedRecord.subjectName}</strong>.</p>
                        <Text strong style={{ color: '#dc2626' }}>Lý do từ chối (Bắt buộc):</Text>
                        <TextArea
                            rows={4}
                            placeholder="Nhập lý do từ chối chi tiết (Ví dụ: Giảng viên đã quá số giờ quy định, Trùng lịch dạy lớp khác...)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{ marginTop: '8px', borderRadius: '8px' }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminAssignments;
