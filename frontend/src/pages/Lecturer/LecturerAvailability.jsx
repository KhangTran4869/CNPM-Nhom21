// =========================================================================
// TRANG KHAI BÁO LỊCH BẬN GIẢNG VIÊN (Lecturer Availability Page)
// Vai trò: Dành cho Giảng Viên (LECTURER)
// Nghiệp vụ: Đăng ký các ca bận cá nhân (không thể dạy) trong tuần học tiêu chuẩn.
//            Giúp hệ thống tự động loại trừ khi Trưởng khoa phân công.
// Tích hợp: Ant Design Grid, Card, Button, Checkbox, Message, Space, Typography
// =========================================================================

import React, { useState } from 'react';
import { Card, Button, Space, Typography, message, Tag, Alert, Row, Col } from 'antd';
import { SaveOutlined, CalendarOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LecturerAvailability = () => {
    // 1. CẤU HÌNH THỜI KHÓA BIỂU TIÊU CHUẨN (Thứ 2 -> Chủ Nhật, Ca Sáng / Chiều / Tối)
    const daysOfWeek = [
        { key: 't2', label: 'Thứ 2' },
        { key: 't3', label: 'Thứ 3' },
        { key: 't4', label: 'Thứ 4' },
        { key: 't5', label: 'Thứ 5' },
        { key: 't6', label: 'Thứ 6' },
        { key: 't7', label: 'Thứ 7' },
        { key: 'cn', label: 'Chủ Nhật' }
    ];

    const shifts = [
        { key: 'sang', label: 'Sáng', time: 'Tiết 1 - Tiết 6 (07h00 - 12h00)' },
        { key: 'chieu', label: 'Chiều', time: 'Tiết 7 - Tiết 12 (12h30 - 17h30)' },
        { key: 'toi', label: 'Tối', time: 'Tiết 13 - Tiết 15 (18h00 - 20h30)' }
    ];

    // Lịch bận mặc định giả lập của Giảng viên (đang bận Sáng T2, Chiều T4, Chiều T5)
    // Cấu trúc state lưu trữ các ô bận dưới dạng key "DayKey-ShiftKey"
    const [busySlots, setBusySlots] = useState(new Set([
        't2-sang',
        't4-chieu',
        't5-chieu'
    ]));

    // 2. HÀM TOGGLE CLICK Ô LỊCH (Click chuyển Rảnh <-> BẬN)
    const toggleSlot = (dayKey, shiftKey) => {
        const slotKey = `${dayKey}-${shiftKey}`;
        setBusySlots(prev => {
            const newBusy = new Set(prev);
            if (newBusy.has(slotKey)) {
                newBusy.delete(slotKey); // Nếu đang bận -> chuyển thành rảnh
                message.info(`Đã đổi thành RẢNH vào ${getDayLabel(dayKey)} (${getShiftLabel(shiftKey)})`);
            } else {
                newBusy.add(slotKey);    // Nếu đang rảnh -> chuyển thành bận
                message.warning(`Đã đổi thành BẬN vào ${getDayLabel(dayKey)} (${getShiftLabel(shiftKey)})`);
            }
            return newBusy;
        });
    };

    // Helper lấy tên thứ từ Key
    const getDayLabel = (key) => daysOfWeek.find(d => d.key === key)?.label || key;
    // Helper lấy tên ca từ Key
    const getShiftLabel = (key) => shifts.find(s => s.key === key)?.label || key;

    // 3. XỬ LÝ LƯU LỊCH BẬN (handleSaveAvailability gửi danh sách lên Backend)
    const handleSaveAvailability = () => {
        const busyList = Array.from(busySlots);
        console.log('Danh sách lịch bận lưu API:', busyList);
        
        // Hiển thị thông báo lưu thành công
        message.success({
            content: `Đã lưu thành công ${busyList.length} ca báo bận lên hệ thống!`,
            duration: 3
        });

        // Dự án thực tế gọi API lưu lịch bận tại đây:
        // axios.post('/api/lecturers/availability', { busySlots: busyList })
    };

    // Hàm xóa sạch mọi lịch bận (Đặt lại rảnh hết)
    const handleResetAll = () => {
        setBusySlots(new Set());
        message.success('Đã đặt lại: Lịch của bạn hiện đang RẢNH toàn bộ tuần!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Trang */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                        📅 Khai Báo Lịch Bận Cá Nhân
                    </Title>
                    <Text type="secondary">Đánh dấu những ca giảng dạy bạn KHÔNG THỂ đứng lớp. Hệ thống sẽ tự động né tránh khi Trưởng khoa phân công.</Text>
                </div>
                
                {/* Thanh điều khiển chính */}
                <Space>
                    <Button onClick={handleResetAll} style={{ borderRadius: '8px', fontWeight: 600 }}>
                        Đặt lại rảnh hết
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={handleSaveAvailability}
                        style={{ 
                            backgroundColor: '#10b981', 
                            borderColor: '#10b981',
                            borderRadius: '8px',
                            fontWeight: 600,
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        LƯU LỊCH BẬN
                    </Button>
                </Space>
            </div>

            {/* Thanh tuần giả lập để tạo độ sinh động khi báo cáo */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '20px', 
                backgroundColor: '#f9fafb', 
                padding: '12px', 
                borderRadius: '10px',
                border: '1px solid #f3f4f6'
            }}>
                <Button type="text" icon={<LeftOutlined />} />
                <Text strong style={{ fontSize: '15px' }}>
                    📅 Áp dụng cho: Học Kỳ 2025-1 (Tuần học tiêu chuẩn)
                </Text>
                <Button type="text" icon={<RightOutlined />} />
            </div>

            <Alert
                message="Hướng dẫn khai báo lịch bận"
                description={
                    <span>
                        Hãy <strong>click chuột vào bất kỳ ô nào</strong> bên dưới để đổi trạng thái. 
                        Ô màu <span style={{ color: '#ef4444', fontWeight: 'bold' }}>ĐỎ (BẬN)</span> nghĩa là bạn không rảnh. 
                        Ô màu <span style={{ color: '#10b981', fontWeight: 'bold' }}>XANH LÁ (RẢNH)</span> nghĩa là bạn sẵn sàng dạy.
                    </span>
                }
                type="warning"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ borderRadius: '10px' }}
            />

            {/* BẢNG LƯỚI KHAI BÁO LỊCH BẬN CHUYÊN NGHIỆP */}
            <Card 
                style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)', 
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: '24px' }}
            >
                {/* Khung Grid chứa lịch */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        {/* Header của Table: Các Thứ trong Tuần */}
                        <thead>
                            <tr>
                                <th style={styles.thCorner}>Ca / Thứ</th>
                                {daysOfWeek.map(day => (
                                    <th key={day.key} style={styles.thDay}>
                                        {day.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        
                        {/* Body of Table: Các Ca Học Sáng, Chiều, Tối */}
                        <tbody>
                            {shifts.map(shift => (
                                <tr key={shift.key} style={styles.trRow}>
                                    {/* Cột hiển thị thông tin Ca */}
                                    <td style={styles.tdShift}>
                                        <Text strong style={{ color: '#1f2937' }}>Ca {shift.label}</Text>
                                        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                            {shift.time}
                                        </div>
                                    </td>
                                    
                                    {/* Các ô lịch rảnh/bận có thể Click */}
                                    {daysOfWeek.map(day => {
                                        const slotKey = `${day.key}-${shift.key}`;
                                        const isBusy = busySlots.has(slotKey);

                                        return (
                                            <td 
                                                key={slotKey} 
                                                onClick={() => toggleSlot(day.key, shift.key)}
                                                style={{
                                                    ...styles.calendarCell,
                                                    backgroundColor: isBusy ? '#fee2e2' : '#f9fafb',
                                                    borderColor: isBusy ? '#fca5a5' : '#e5e7eb',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '75px',
                                                    transition: 'all 0.2s ease',
                                                    borderRadius: '6px'
                                                }}>
                                                    {isBusy ? (
                                                        <Tag color="error" style={styles.busyTag}>BẬN</Tag>
                                                    ) : (
                                                        <Tag color="success" style={styles.freeTag}>RẢNH</Tag>
                                                    )}
                                                    <span style={{ fontSize: '9px', color: '#9ca3af', marginTop: '6px' }}>Click để đổi</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Styles thuần dành cho Bảng lịch báo bận
const styles = {
    thCorner: {
        padding: '16px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        width: '18%'
    },
    thDay: {
        padding: '16px',
        backgroundColor: '#f3f4f6',
        color: '#1f2937',
        fontWeight: '800',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        width: '11.7%',
        fontSize: '14px'
    },
    trRow: {
        borderBottom: '1px solid #e5e7eb'
    },
    tdShift: {
        padding: '16px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
    },
    calendarCell: {
        padding: '8px',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        transition: 'all 0.2s ease'
    },
    busyTag: {
        fontWeight: 900,
        padding: '4px 14px',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
        border: '1px solid #f87171'
    },
    freeTag: {
        fontWeight: 700,
        padding: '4px 14px',
        borderRadius: '6px',
        fontSize: '12px',
        backgroundColor: '#ecfdf5',
        color: '#10b981',
        border: '1px solid #a7f3d0'
    }
};

export default LecturerAvailability;
