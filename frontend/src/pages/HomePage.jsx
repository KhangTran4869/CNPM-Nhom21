import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const fallback = "Chưa cập nhật";

export function HomePage({ user, navigate }) {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const isAdmin = user?.role === "ADMIN";
  const isHead = user?.role === "HEAD";

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Chào mừng {user?.name || user?.username || "người dùng"}</h1>
        <span>{today}</span>
      </div>

      {isAdmin ? (
        <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
          <Card title="Thông tin tài khoản Quản trị">
            <div className="profile-grid">
              <div className="profile-avatar">{user?.username?.slice(0, 1)?.toUpperCase()}</div>
              <Info label="Tài khoản" value={user?.username} />
              <Info label="Mã quản trị viên" value={`ADM-${user?.id?.slice(-6)?.toUpperCase() || "ROOT"}`} />
              <Info label="Vai trò" value={<Badge>ADMIN</Badge>} />
              <Info label="Trạng thái" value={<Badge>{user?.status}</Badge>} />
            </div>
          </Card>

          <Card title="Hướng dẫn hệ thống cho Admin">
            <div style={{ padding: "8px 0", lineHeight: "1.6" }}>
              <p>⚡ Bạn đang truy cập với tư cách **Quản trị viên hệ thống**.</p>
              <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                <li>Sử dụng menu bên trái để quản lý danh mục cốt lõi: **Môn học, Học kỳ, Phòng học, Tài khoản**.</li>
                <li>Hỗ trợ Trưởng bộ môn khởi tạo dữ liệu lớp tín chỉ đầu mỗi học kỳ.</li>
                <li>Giám sát toàn bộ tiến độ phân công giảng dạy toàn trường.</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid-stack" style={{ display: "grid", gap: "20px" }}>
          <Card title={isHead ? "Hồ sơ Trưởng bộ môn" : "Hồ sơ Giảng viên"}>
            <div className="profile-grid profile-grid-lecturer">
              <div className="profile-avatar">
                {user?.name?.slice(0, 1)?.toUpperCase() || user?.username?.slice(0, 1)?.toUpperCase()}
              </div>
              <Info label="Mã giảng viên" value={user?.code} />
              <Info label="Họ và tên" value={user?.name || user?.username} />
              <Info label="Tài khoản hệ thống" value={user?.username} />
              <Info label="Vai trò nghiệp vụ" value={<Badge>{user?.role}</Badge>} />
              <Info label="Đơn vị bộ môn" value={user?.department} />
              <Info label="Học hàm / Học vị" value={user?.degree} />
              <Info label="Định mức giờ dạy" value={user?.max_hours ? `${user.max_hours} giờ / kỳ` : fallback} />
              <Info label="Trạng thái giảng dạy" value={<Badge>{user?.lecturer_status || user?.status}</Badge>} />
              <Info label="Số điện thoại" value={user?.phone} />
              <Info className="wide" label="Email liên hệ" value={user?.email} />
            </div>
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed #e5e7eb" }}>
              <Button onClick={() => navigate?.("/profile")} style={{ width: "100%" }}>
                ✏️ Chỉnh sửa thông tin cá nhân & Liên hệ
              </Button>
            </div>
          </Card>

          <Card title="Nhiệm vụ & Chức năng nhanh">
            <div style={{ padding: "8px 0", lineHeight: "1.6" }}>
              {isHead ? (
                <>
                  <p>👑 **Quyền hạn Trưởng bộ môn:**</p>
                  <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    <li>Thực hiện **Phân công giảng viên** vào các lớp tín chỉ thuộc bộ môn mình quản lý.</li>
                    <li>Tự động kiểm tra xung đột lịch và cảnh báo lố giờ dạy của giảng viên trong bộ môn.</li>
                    <li>Duyệt các thay đổi phân công và xem thống kê tổng hợp.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>👨‍🏫 **Chức năng dành cho Giảng viên:**</p>
                  <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    <li>Chủ động khai báo **Lịch rảnh / Lịch bận** hàng tuần để Trưởng bộ môn xếp lịch hợp lý.</li>
                    <li>Xem Thời khóa biểu giảng dạy và danh sách lớp tín chỉ được phân công.</li>
                    <li>Theo dõi tổng khối lượng giờ dạy thực tế của bản thân.</li>
                  </ul>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={`info-cell ${className}`}>
      <span>{label}</span>
      <strong>{value || fallback}</strong>
    </div>
  );
}
