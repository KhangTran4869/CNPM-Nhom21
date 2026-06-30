import { AssignmentApprovalPage } from "../pages/AssignmentApprovalPage";
import { AssignmentHistoryPage } from "../pages/AssignmentHistoryPage";
import { AssignmentsPage } from "../pages/AssignmentsPage";
import { AvailabilityPage } from "../pages/AvailabilityPage";
import { ClassesPage } from "../pages/ClassesPage";
import { CoursesPage } from "../pages/CoursesPage";
import { DepartmentsPage } from "../pages/DepartmentsPage";
import { HomePage } from "../pages/HomePage";
import { LecturersPage } from "../pages/LecturersPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ReportsPage } from "../pages/ReportsPage";
import { RoomsPage } from "../pages/RoomsPage";
import { SemesterSchedulePage } from "../pages/SemesterSchedulePage";
import { SemestersPage } from "../pages/SemestersPage";
import { ComingSoonPage, ForbiddenPage } from "../pages/SimpleResourcePage";
import { UsersPage } from "../pages/UsersPage";
import { WeeklySchedulePage } from "../pages/WeeklySchedulePage";

// Phân quyền truy cập các đường dẫn theo Role
export const routeRoles = {
  "/home": ["ADMIN", "HEAD", "LECTURER"],
  "/teaching-schedule/weekly": ["LECTURER", "ADMIN", "HEAD"],
  "/teaching-schedule/semester": ["LECTURER", "ADMIN", "HEAD"],
  "/lecturers": ["ADMIN", "HEAD"],
  "/classes": ["ADMIN", "HEAD", "LECTURER"],
  "/assignments": ["ADMIN", "HEAD", "LECTURER"],
  "/assignments/approval": ["ADMIN"],
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
      return <HomePage user={user} navigate={navigate} onUserChange={setUser} />;
    case "/teaching-schedule/weekly":
      return <WeeklySchedulePage user={user} />;
    case "/teaching-schedule/semester":
      return <SemesterSchedulePage user={user} />;
    case "/lecturers":
      return <LecturersPage user={user} />;
    case "/classes":
      return <ClassesPage user={user} />;
    case "/assignments":
      return <AssignmentsPage user={user} navigate={navigate} />;
    case "/assignments/approval":
      return <AssignmentApprovalPage navigate={navigate} />;
    case "/availability":
      return <AvailabilityPage user={user} />;
    case "/reports":
      return <ReportsPage user={user} />;
    case "/users":
      return <UsersPage user={user} />;
    case "/departments":
      return <DepartmentsPage />;
    case "/courses":
      return <CoursesPage />;
    case "/semesters":
      return <SemestersPage />;
    case "/rooms":
      return <RoomsPage />;
    case "/assignment-history":
      return <AssignmentHistoryPage />;
    case "/notifications":
      return <NotificationsPage user={user} />;
    case "/profile":
      return <ProfilePage user={user} onUserChange={setUser} />;
    default:
      return <HomePage user={user} navigate={navigate} onUserChange={setUser} />;
  }
}
