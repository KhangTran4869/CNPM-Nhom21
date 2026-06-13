import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const fallback = "Chưa cập nhật";

export function HomePage({ user }) {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Chào mừng {user?.username || "người dùng"}</h1>
        <span>{today}</span>
      </div>
      <Card title="Thông tin người dùng">
        <div className="profile-grid">
          <div className="profile-avatar">{user?.username?.slice(0, 1)?.toUpperCase()}</div>
          <Info label="Mã người dùng" value={user?.id} />
          <Info label="Họ tên" value={user?.name || user?.username} />
          <Info label="Ngày sinh" value={user?.birthday} />
          <Info label="Giới tính" value={user?.gender} />
          <Info label="Trạng thái" value={<Badge>{user?.status}</Badge>} />
          <Info label="Số điện thoại" value={user?.phone} />
          <Info label="Email" value={user?.email} />
          <Info label="Bộ môn" value={user?.department} />
          <Info label="Học vị" value={user?.degree} />
          <Info label="Vai trò" value={<Badge>{user?.role}</Badge>} />
          <Info label="Địa chỉ" value={user?.address} />
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-cell">
      <span>{label}</span>
      <strong>{value || fallback}</strong>
    </div>
  );
}
