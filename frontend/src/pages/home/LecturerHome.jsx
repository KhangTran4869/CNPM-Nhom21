import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InfoCell } from "./InfoCell";

/**
 * Giao diện Trang chủ dành riêng cho Giảng viên (LECTURER)
 */
export function LecturerHome({ user, navigate }) {
  return (
    <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
      <Card title="Hồ sơ Giảng viên">
        <div className="profile-grid">
          <div className="profile-avatar">
            {user?.name?.slice(0, 1)?.toUpperCase() || user?.username?.slice(0, 1)?.toUpperCase()}
          </div>
          <InfoCell label="Mã giảng viên" value={user?.code} />
          <InfoCell label="Họ và tên" value={user?.name || user?.username} />
          <InfoCell label="Tài khoản hệ thống" value={user?.username} />
          <InfoCell label="Vai trò nghiệp vụ" value={<Badge>LECTURER (Giảng viên)</Badge>} />
          <InfoCell label="Đơn vị bộ môn" value={user?.department} />
          <InfoCell label="Học hàm / Học vị" value={user?.degree} />
          <InfoCell
            label="Định mức giờ dạy"
            value={user?.max_hours ? `${user.max_hours} giờ / kỳ` : null}
          />
          <InfoCell label="Trạng thái giảng dạy" value={<Badge>{user?.lecturer_status || user?.status}</Badge>} />
          <InfoCell label="Số điện thoại" value={user?.phone} />
          <InfoCell label="Email liên hệ" value={user?.email} />
        </div>
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #e5e7eb" }}>
          <Button onClick={() => navigate?.("/profile")} style={{ width: "100%" }}>
            ✏️ Chỉnh sửa thông tin cá nhân & Liên hệ
          </Button>
        </div>
      </Card>

      <Card title="Chức năng dành cho Giảng viên">
        <div style={{ padding: "8px 0", lineHeight: "1.6" }}>
          <p>👨‍🏫 <strong>Chức năng dành cho Giảng viên:</strong></p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            <li>Chủ động khai báo <strong>Lịch rảnh / Lịch bận</strong> hàng tuần để Trưởng bộ môn thuận tiện xếp lịch.</li>
            <li>Xem Thời khóa biểu giảng dạy và danh sách các lớp tín chỉ được phân công phụ trách.</li>
            <li>Theo dõi tổng khối lượng giờ dạy thực tế của bản thân theo học kỳ.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
