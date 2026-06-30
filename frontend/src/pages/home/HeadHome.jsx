import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InfoCell } from "./InfoCell";
import { EditProfileModal } from "../../components/profile/EditProfileModal";

/**
 * Giao diện Trang chủ dành riêng cho Trưởng khoa (HEAD)
 */
export function HeadHome({ user, onUserChange }) {
  const [editModal, setEditModal] = useState(false);

  return (
    <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
      <Card title="Hồ sơ Trưởng khoa">
        <div className="profile-grid">
          <div className="profile-avatar">
            {user?.name?.slice(0, 1)?.toUpperCase() || user?.username?.slice(0, 1)?.toUpperCase()}
          </div>
          <InfoCell label="Họ và tên" value={user?.name || user?.username} />
          <InfoCell label="Tài khoản hệ thống" value={user?.username} />
          <InfoCell label="Vai trò nghiệp vụ" value={<Badge>Trưởng khoa</Badge>} />
          <InfoCell label="Đơn vị khoa" value={user?.faculty || user?.department} />
          <InfoCell label="Học hàm / Học vị" value={user?.degree} />
          <InfoCell label="Số điện thoại" value={user?.phone} />
          <InfoCell label="Email liên hệ" value={user?.email} />
        </div>
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setEditModal(true)} style={{ width: "100%" }}>
            Chỉnh sửa thông tin cá nhân & Liên hệ
          </Button>
        </div>
      </Card>

      <Card title="Quyền hạn & Nhiệm vụ Trưởng khoa">
        <div style={{ padding: "8px 0", lineHeight: "1.7", color: "#334155" }}>
          <p style={{ margin: "0 0 10px 0" }}><strong>Quyền hạn quản lý Trưởng khoa:</strong></p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>Quản lý toàn bộ các bộ môn, danh sách giảng viên trực thuộc và lớp tín chỉ trong Khoa.</li>
            <li style={{ marginBottom: "8px" }}>Thực hiện đề xuất <strong>Phân công giảng viên</strong> vào các lớp tín chỉ thuộc Khoa phụ trách để gửi lên Ban Quản trị phê duyệt.</li>
            <li>Tự động rà soát xung đột lịch giảng dạy, theo dõi khối lượng giảng dạy và báo cáo thống kê toàn Khoa.</li>
          </ul>
        </div>
      </Card>

      {editModal && (
        <EditProfileModal
          user={user}
          onClose={() => setEditModal(false)}
          onUserChange={onUserChange}
        />
      )}
    </div>
  );
}
