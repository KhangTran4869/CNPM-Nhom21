import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { InfoCell } from "./InfoCell";

/**
 * Giao diện Trang chủ dành riêng cho Quản trị viên hệ thống (ADMIN)
 */
export function AdminHome({ user }) {
  return (
    <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
      <Card title="Thông tin tài khoản Quản trị">
        <div className="profile-grid">
          <div className="profile-avatar">
            {user?.username?.slice(0, 1)?.toUpperCase()}
          </div>
          <InfoCell label="Tài khoản" value={user?.username} />
          <InfoCell
            label="Mã quản trị viên"
            value={`ADM-${user?.id?.slice(-6)?.toUpperCase() || "ROOT"}`}
          />
          <InfoCell label="Vai trò" value={<Badge>ADMIN</Badge>} />
          <InfoCell label="Trạng thái" value={<Badge>{user?.status}</Badge>} />
        </div>
      </Card>

      <Card title="Hướng dẫn nghiệp vụ cho Quản trị viên">
        <div style={{ padding: "8px 0", lineHeight: "1.7", color: "#334155" }}>
          <p style={{ margin: "0 0 10px 0" }}>Bạn đang truy cập với tư cách <strong>Quản trị viên hệ thống (ADMIN)</strong>.</p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Sử dụng menu bên trái để khởi tạo và quản lý danh mục cốt lõi:{" "}
              <strong>Môn học, Học kỳ, Phòng học, Tài khoản, Bộ môn</strong>.
            </li>
            <li style={{ marginBottom: "8px" }}>Hỗ trợ Trưởng bộ môn khởi tạo dữ liệu lớp tín chỉ đầu mỗi học kỳ.</li>
            <li>Giám sát toàn bộ tiến độ phân công giảng dạy toàn trường.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
