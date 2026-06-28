import { AdminHome } from "./home/AdminHome";
import { HeadHome } from "./home/HeadHome";
import { LecturerHome } from "./home/LecturerHome";

/**
 * Điều phối viên Trang chủ (Home Dispatcher)
 * Tự động phân chia hiển thị đúng component theo role: ADMIN, HEAD, LECTURER
 */
export function HomePage({ user, navigate }) {
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const role = user?.role;

  return (
    <div className="page-stack">
      <div className="page-title">
        <h1>Chào mừng {user?.name || user?.username || "người dùng"}</h1>
        <span>{today}</span>
      </div>

      {role === "ADMIN" && <AdminHome user={user} navigate={navigate} />}
      {role === "HEAD" && <HeadHome user={user} navigate={navigate} />}
      {(role === "LECTURER" || (!role || (role !== "ADMIN" && role !== "HEAD"))) && (
        <LecturerHome user={user} navigate={navigate} />
      )}
    </div>
  );
}
