const menu = {
  common: [
    { path: "/home", label: "Trang chủ" },
    { path: "/notifications", label: "Thông báo từ ban quản trị" },
  ],
  LECTURER: [
    { path: "/teaching-schedule/weekly", label: "Xem lịch dạy dạng tuần" },
    { path: "/teaching-schedule/semester", label: "Xem lịch dạy dạng học kỳ" },
    { path: "/availability", label: "Khai báo lịch bận" },
    { path: "/reports", label: "Khối lượng giảng dạy" },
  ],
  HEAD: [
    { path: "/lecturers", label: "Danh sách giảng viên" },
    { path: "/classes", label: "Danh sách lớp tín chỉ" },
    { path: "/assignments", label: "Đề xuất phân công" },
    { path: "/reports", label: "Khối lượng giảng dạy" },
  ],
  ADMIN: [
    { path: "/users", label: "Quản lý tài khoản" },
    { path: "/departments", label: "Quản lý bộ môn" },
    { path: "/lecturers", label: "Quản lý giảng viên" },
    { path: "/courses", label: "Quản lý môn học" },
    { path: "/semesters", label: "Quản lý học kỳ" },
    { path: "/classes", label: "Quản lý lớp tín chỉ" },
    { path: "/rooms", label: "Quản lý phòng học" },
    { path: "/assignments", label: "Phân công & Duyệt giảng dạy" },
    { path: "/reports", label: "Báo cáo thống kê" },
  ],
};

/**
 * Thanh điều hướng menu bên trái (Sidebar Navigation)
 * Hiển thị các chức năng tương ứng theo đúng vai trò nghiệp vụ (ADMIN, HEAD, LECTURER)
 */
export function Sidebar({ role, activePath, collapsed, navigate }) {
  const items = [...menu.common, ...(menu[role] || [])];
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">UIS</div>
        <div>
          <strong>PTIT HCM</strong>
          <span>Credit Class System</span>
        </div>
      </div>
      <nav>
        {items.map((item, index) => {
          const isActive =
            activePath === item.path ||
            (activePath?.startsWith("/assignments") && item.path === "/assignments");
          return (
            <button
              key={`${item.path}-${index}`}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
