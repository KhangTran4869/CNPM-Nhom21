import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InfoCell } from "./InfoCell";
import { EditProfileModal } from "../../components/profile/EditProfileModal";

/**
 * Giao diện Trang chủ dành riêng cho Giảng viên (LECTURER)
 */
export function LecturerHome({ user, navigate, onUserChange }) {
  const [editModal, setEditModal] = useState(false);

  return (
    <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
      <Card title="Hồ sơ Giảng viên">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            alignItems: "start",
          }}
        >
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold" }}>
              {user?.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div>
              <h3 style={{ margin: 0, color: "#1e293b" }}>{user?.name || user?.username}</h3>
              <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Mã GV: {user?.code || "Chưa cập nhật"}</span>
            </div>
          </div>
          <InfoCell label="Mã giảng viên" value={user?.code} />
          <InfoCell label="Họ và tên" value={user?.name || user?.username} />
          <InfoCell label="Tài khoản hệ thống" value={user?.username} />
          <InfoCell label="Vai trò nghiệp vụ" value={<Badge>Giảng viên</Badge>} />
          <InfoCell label="Đơn vị bộ môn" value={user?.department} />
          <InfoCell label="Học hàm / Học vị" value={user?.degree} />
          <InfoCell label="Trạng thái" value={<Badge>{user?.lecturer_status || user?.status}</Badge>} />
          <InfoCell label="Số điện thoại" value={user?.phone} />
          <InfoCell label="Email liên hệ" value={user?.email} />
        </div>
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button onClick={() => setEditModal(true)} style={{ flex: 1, minWidth: "200px" }}>
            Cập nhật thông tin cá nhân
          </Button>
          <Button variant="outline" onClick={() => navigate?.("/availability")} style={{ flex: 1, minWidth: "200px" }}>
            Khai báo lịch bận giảng dạy
          </Button>
        </div>
      </Card>

      <Card title="Chức năng nghiệp vụ">
        <div style={{ padding: "8px 0", lineHeight: "1.7", color: "#334155" }}>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>Chủ động khai báo <strong>Lịch rảnh / Lịch bận</strong> trước mỗi học kỳ để hỗ trợ Trưởng bộ môn sắp xếp thời khóa biểu.</li>
            <li style={{ marginBottom: "8px" }}>Xem lịch giảng dạy cá nhân dạng tuần và dạng học kỳ theo thời gian thực.</li>
            <li>Theo dõi thông báo và các hướng dẫn nghiệp vụ từ Ban Quản trị học viện.</li>
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
