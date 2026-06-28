import { AssignmentsPage } from "../pages/AssignmentsPage";
import { AvailabilityPage } from "../pages/AvailabilityPage";
import { ClassesPage } from "../pages/ClassesPage";
import { HomePage } from "../pages/HomePage";
import { LecturersPage } from "../pages/LecturersPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ReportsPage } from "../pages/ReportsPage";
import { ComingSoonPage, ForbiddenPage, SimpleResourcePage } from "../pages/SimpleResourcePage";
import { WeeklySchedulePage } from "../pages/WeeklySchedulePage";

// Phân quyền truy cập các đường dẫn theo Role
export const routeRoles = {
  "/home": ["ADMIN", "HEAD", "LECTURER"],
  "/teaching-schedule/weekly": ["LECTURER", "ADMIN", "HEAD"],
  "/teaching-schedule/semester": ["LECTURER", "ADMIN", "HEAD"],
  "/lecturers": ["ADMIN", "HEAD"],
  "/classes": ["ADMIN", "HEAD", "LECTURER"],
  "/assignments": ["ADMIN", "HEAD", "LECTURER"],
  "/availability": ["ADMIN", "LECTURER"],
  "/reports": ["ADMIN", "HEAD", "LECTURER"],
  "/users": ["ADMIN"],
  "/courses": ["ADMIN"],
  "/semesters": ["ADMIN"],
  "/rooms": ["ADMIN"],
  "/departments": ["ADMIN"],
  "/assignment-history": ["ADMIN", "HEAD"],
  "/notifications": ["ADMIN", "HEAD", "LECTURER"],
  "/profile": ["LECTURER", "HEAD"],
};

/**
 * Hàm trả về Component tương ứng với đường dẫn và quyền (Role) của người dùng
 */
export function renderPage({ path, user, navigate, setUser }) {
  if (!user && path !== "/login") return null;

  const allowed = routeRoles[path];
  if (allowed && !allowed.includes(user?.role)) {
    return <ForbiddenPage />;
  }

  switch (path) {
    case "/home":
      return <HomePage user={user} navigate={navigate} />;
    case "/teaching-schedule/weekly":
      return <WeeklySchedulePage user={user} />;
    case "/teaching-schedule/semester":
      return <ComingSoonPage title="Thời khóa biểu dạng học kỳ" />;
    case "/lecturers":
      return <LecturersPage user={user} />;
    case "/classes":
      return <ClassesPage user={user} />;
    case "/assignments":
      return <AssignmentsPage user={user} />;
    case "/availability":
      return <AvailabilityPage user={user} />;
    case "/reports":
      return <ReportsPage user={user} />;
    case "/users":
      return <SimpleResourcePage type="users" />;
    case "/departments":
      return <SimpleResourcePage type="departments" />;
    case "/courses":
      return <SimpleResourcePage type="courses" />;
    case "/semesters":
      return <SimpleResourcePage type="semesters" />;
    case "/rooms":
      return <SimpleResourcePage type="rooms" />;
    case "/assignment-history":
      return <SimpleResourcePage type="history" />;
    case "/notifications":
      return <ComingSoonPage title="Thông báo từ ban quản trị" />;
    case "/profile":
      return <ProfilePage user={user} onUserChange={setUser} />;
    default:
      return <HomePage user={user} navigate={navigate} />;
  }
}
