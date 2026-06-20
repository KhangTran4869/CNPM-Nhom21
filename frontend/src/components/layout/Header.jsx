import { Button } from "../ui/Button";

export function Header({ user, onMenu, onLogout }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <Button variant="ghost-light" onClick={onMenu} aria-label="Toggle menu">☰</Button>
        <strong>Hệ thống phân công giảng viên</strong>
      </div>
      <div className="header-user">
        <span className="bell">🔔</span>
        <div className="avatar">{user?.username?.slice(0, 1)?.toUpperCase() || "U"}</div>
        <div className="user-meta">
          <strong>{user?.username || "Người dùng"}</strong>
          <span>{user?.role || "ROLE"}</span>
        </div>
        <Button variant="ghost-light" onClick={onLogout}>Đăng xuất</Button>
      </div>
    </header>
  );
}
