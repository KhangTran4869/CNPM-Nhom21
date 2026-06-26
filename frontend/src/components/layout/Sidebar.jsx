const menu = {
  common: [
    { path: "/home", label: "Trang chủ" },
    { path: "/notifications", label: "Thông báo từ ban quản trị" },
  ],
  LECTURER: [
    { path: "/teaching-schedule/weekly", label: "Xem lịch dạy dạng tuần" },
    { path: "/teaching-schedule/semester", label: "Xem lịch dạy dạng học kỳ" },
    { path: "/availability", label: "Khai báo lịch bận / lịch rảnh" },
    { path: "/reports", label: "Tải giảng dạy của tôi" },
    { path: "/profile", label: "Cập nhật thông tin cá nhân" },
    { path: "/classes", label: "Danh sách lớp tín chỉ" },
    { path: "/assignments", label: "Phân công của tôi" },
  ],
  HEAD: [
    { path: "/lecturers", label: "Danh sách giảng viên" },
    { path: "/classes", label: "Danh sách lớp tín chỉ" },
    { path: "/assignments", label: "Đề xuất phân công" },
    { path: "/reports", label: "Theo dõi khối lượng giảng dạy" },
    { path: "/profile", label: "Cập nhật thông tin cá nhân" },
  ],
  ADMIN: [
    { path: "/users", label: "Quản lý tài khoản" },
    { path: "/departments", label: "Quản lý bộ môn" },
    { path: "/lecturers", label: "Quản lý giảng viên" },
    { path: "/courses", label: "Quản lý môn học" },
    { path: "/semesters", label: "Quản lý học kỳ" },
    { path: "/classes", label: "Quản lý lớp tín chỉ" },
    { path: "/rooms", label: "Quản lý phòng học" },
    { path: "/assignments", label: "Phân công giảng viên" },
    { path: "/assignments/approval", label: "Duyệt phân công" },
    { path: "/reports", label: "Báo cáo thống kê" },
    { path: "/assignment-history", label: "Lịch sử thay đổi phân công" },
  ],
};

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
        {items.map((item, index) => (
          <button
            key={`${item.path}-${index}`}
            className={`sidebar-item ${activePath === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
