import { Button } from "../ui/Button";

export function Header({ user, onMenu, onLogout }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <Button variant="ghost-light" onClick={onMenu} aria-label="Toggle menu">☰</Button>
        <strong>Hệ thống phân công giảng viên giảng dạy lớp tín chỉ</strong>
      </div>
      <div className="header-user">
        <div className="avatar">{user?.name?.slice(0, 1)?.toUpperCase() || user?.username?.slice(0, 1)?.toUpperCase() || "U"}</div>
        <div className="user-meta">
          <strong>{user?.name || user?.username || "Người dùng"}</strong>
          <span>{user?.role || "ROLE"}</span>
        </div>
        <Button variant="ghost-light" onClick={onLogout}>Đăng xuất</Button>
      </div>
    </header>
  );
}
