# Tài liệu chi tiết đồ án CNPM - Nhóm 21

## 1. Tổng quan đồ án

Đồ án xây dựng hệ thống quản lý phân công giảng dạy cho môi trường khoa/bộ môn. Hệ thống hỗ trợ phòng đào tạo, trưởng bộ môn và giảng viên theo dõi lớp tín chỉ, lịch học, giảng viên, phòng học, tình trạng bận/rảnh, phân công giảng dạy và báo cáo khối lượng.

Mục tiêu chính:

- Quản lý danh mục phục vụ phân công giảng dạy: khoa/bộ môn, học phần, học kỳ, phòng học, lớp tín chỉ, giảng viên, người dùng và vai trò.
- Hỗ trợ đề xuất, kiểm tra, duyệt, từ chối và thay đổi giảng viên phụ trách lớp.
- Kiểm tra các ràng buộc nghiệp vụ trước khi phân công: trùng lịch giảng viên, trùng phòng, sức chứa phòng, định mức giờ dạy, lịch bận/rảnh của giảng viên.
- Cho phép giảng viên xem lịch dạy cá nhân và khai báo thời gian bận/rảnh.
- Cung cấp báo cáo phân công và khối lượng giảng dạy.

Tên thư mục dự án: `CNPM-Nhom21`.

## 2. Công nghệ sử dụng

### Backend

- Node.js.
- Express 5.
- MongoDB.
- Mongoose.
- CORS.
- dotenv.
- Node test runner (`node --test`).

### Frontend

- React 19.
- React DOM.
- Vite.
- ESLint.
- CSS thuần theo các file giao diện trong `src`.

### DevOps và môi trường chạy

- Docker Compose.
- MongoDB container.
- Node 22 Alpine container cho backend và frontend.
- Hot reload cho backend bằng `node --watch`.
- Hot reload cho frontend bằng Vite dev server.

## 3. Cấu trúc thư mục

```text
CNPM-Nhom21/
├── backend/
│   ├── src/
│   │   ├── bootstrap/        # Khởi tạo dữ liệu mặc định
│   │   ├── config/           # Cấu hình database
│   │   ├── controllers/      # Xử lý request/response
│   │   ├── middlewares/      # Xác thực và phân quyền
│   │   ├── models/           # Schema MongoDB bằng Mongoose
│   │   ├── routes/           # Khai báo API routes
│   │   ├── services/         # Nghiệp vụ chính
│   │   ├── utils/            # Helper dùng chung
│   │   ├── server.js         # Entry point backend
│   │   └── seed*.js          # Script tạo dữ liệu mẫu
│   ├── test/                 # Kiểm thử backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Layout và UI component
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Các màn hình chức năng
│   │   ├── services/         # Gọi API backend
│   │   ├── utils/            # Hàm định dạng dữ liệu
│   │   ├── App.jsx           # Điều hướng và phân quyền frontend
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── DOCKER.md
└── PROJECT_DOCUMENTATION.md
```

## 4. Kiến trúc tổng thể

Hệ thống được chia thành 3 lớp chính:

1. Frontend React: cung cấp giao diện đăng nhập, quản trị danh mục, phân công, lịch dạy, báo cáo và hồ sơ cá nhân.
2. Backend Express: cung cấp REST API, xác thực token, phân quyền theo vai trò và xử lý nghiệp vụ phân công.
3. MongoDB: lưu trữ dữ liệu người dùng, vai trò, giảng viên, lớp học, học phần, lịch học, phòng học, phân công và lịch sử thay đổi.

Luồng hoạt động cơ bản:

1. Người dùng đăng nhập ở frontend.
2. Frontend gửi thông tin đăng nhập tới API `/api/v1/auth/login`.
3. Backend kiểm tra tài khoản, trả về access token và thông tin người dùng.
4. Frontend lưu token và tự động gửi token trong các request tiếp theo.
5. Backend dùng middleware `authenticate` để xác thực và `authorize` để kiểm tra quyền.
6. Controller gọi service/model để xử lý nghiệp vụ và trả kết quả về frontend.

## 5. Vai trò người dùng

Hệ thống đang sử dụng 3 vai trò chính:

| Vai trò | Mã | Mô tả |
|---|---|---|
| Phòng đào tạo / Quản trị | `ADMIN` | Có quyền cao nhất, quản lý danh mục, người dùng, phân công, duyệt/từ chối, báo cáo và seed dữ liệu. |
| Trưởng bộ môn | `HEAD` | Theo dõi giảng viên, lớp học, phân công, lịch sử và báo cáo; có quyền đề xuất phân công. |
| Giảng viên | `LECTURER` | Xem lịch dạy, lớp, phân công liên quan, báo cáo cá nhân và khai báo lịch bận/rảnh. |

Phân quyền được áp dụng ở cả frontend và backend:

- Frontend dùng `routeRoles` trong `frontend/src/App.jsx` để giới hạn màn hình.
- Backend dùng middleware `authenticate` và `authorize` trong `backend/src/middlewares/auth.js`.

## 6. Chức năng chính

### 6.1. Đăng nhập và quản lý phiên

Chức năng:

- Đăng nhập bằng `username` và `password`.
- Lấy thông tin người dùng hiện tại qua `/auth/me`.
- Đổi mật khẩu.
- Bắt buộc đổi mật khẩu khi tài khoản còn dùng mật khẩu mặc định `123456`.

Các file liên quan:

- `backend/src/controllers/authController.js`
- `backend/src/routes/authRouters.js`
- `backend/src/utils/jwt.js`
- `backend/src/utils/password.js`
- `frontend/src/services/authService.js`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/ProfilePage.jsx`

### 6.2. Quản lý người dùng

Chức năng:

- Xem danh sách người dùng.
- Tạo người dùng.
- Cập nhật thông tin người dùng.
- Xóa mềm người dùng.
- Gán vai trò thông qua `role_id`.
- Quản lý trạng thái `ACTIVE` hoặc `INACTIVE`.

Quyền truy cập:

- Backend: chỉ `ADMIN`.
- Frontend: chỉ `ADMIN`.

File liên quan:

- `backend/src/models/User.js`
- `backend/src/controllers/usersControllers.js`
- `backend/src/routes/usersRouters.js`
- `frontend/src/pages/UsersPage.jsx`

### 6.3. Quản lý vai trò

Chức năng:

- Tạo, xem, cập nhật, xóa mềm vai trò.
- Vai trò có `name` và `code`.

Quyền truy cập:

- Chỉ `ADMIN`.

File liên quan:

- `backend/src/models/Role.js`
- `backend/src/controllers/rolesControllers.js`
- `backend/src/routes/rolesRouters.js`

### 6.4. Quản lý khoa/bộ môn

Chức năng:

- Tạo khoa/bộ môn.
- Xem danh sách.
- Cập nhật thông tin.
- Xóa mềm.
- Quản lý trạng thái `active` hoặc `inactive`.

Dữ liệu chính:

- `code`: mã khoa/bộ môn.
- `name`: tên khoa/bộ môn.
- `description`: mô tả.
- `status`: trạng thái.

File liên quan:

- `backend/src/models/Department.js`
- `backend/src/controllers/departmentsControllers.js`
- `backend/src/routes/departmentsRouters.js`
- `frontend/src/pages/DepartmentsPage.jsx`

### 6.5. Quản lý giảng viên

Chức năng:

- Xem danh sách giảng viên.
- Tạo giảng viên.
- Cập nhật thông tin giảng viên.
- Xóa mềm.
- Cập nhật trạng thái giảng viên.
- Cập nhật định mức giờ dạy tối đa.
- Xem workload/khối lượng giảng dạy.
- Liên kết giảng viên với tài khoản người dùng.

Dữ liệu chính:

- `code`: mã giảng viên.
- `name`: họ tên.
- `email`, `phone`.
- `degree`: học vị.
- `faculty`: khoa.
- `department_id`: bộ môn.
- `user_id`: tài khoản đăng nhập liên kết.
- `max_hours`: định mức giờ dạy.
- `status`: `ACTIVE`, `BUSY`, `INACTIVE`.

Quyền truy cập:

- `ADMIN`, `HEAD` được xem danh sách.
- `ADMIN` được tạo, xóa, cập nhật trạng thái, cập nhật định mức.
- `ADMIN`, `LECTURER` được cập nhật một số thông tin giảng viên.

File liên quan:

- `backend/src/models/Lecturer.js`
- `backend/src/controllers/lecturersControllers.js`
- `backend/src/routes/lecturersRouters.js`
- `frontend/src/pages/LecturersPage.jsx`

### 6.6. Quản lý học phần

Chức năng:

- Tạo học phần.
- Xem danh sách.
- Cập nhật.
- Xóa mềm.
- Gắn học phần với bộ môn.

Dữ liệu chính:

- `code`: mã học phần.
- `name`: tên học phần.
- `credits`: số tín chỉ.
- `department_id`: bộ môn phụ trách.

File liên quan:

- `backend/src/models/Course.js`
- `backend/src/controllers/couresControllers.js`
- `backend/src/routes/CoursesRouters.js`
- `frontend/src/pages/CoursesPage.jsx`

### 6.7. Quản lý học kỳ

Chức năng:

- Tạo học kỳ.
- Xem danh sách.
- Cập nhật.
- Xóa mềm.

Dữ liệu chính:

- `name`: tên học kỳ.
- `start_date`: ngày bắt đầu.
- `end_date`: ngày kết thúc.

File liên quan:

- `backend/src/models/Semester.js`
- `backend/src/controllers/semestersControllers.js`
- `backend/src/routes/semestersRouters.js`
- `frontend/src/pages/SemestersPage.jsx`

### 6.8. Quản lý phòng học

Chức năng:

- Tạo phòng học.
- Xem danh sách.
- Cập nhật.
- Xóa mềm.
- Lưu sức chứa phòng để kiểm tra khi phân công.

Dữ liệu chính:

- `name`: tên phòng.
- `capacity`: sức chứa.

File liên quan:

- `backend/src/models/Room.js`
- `backend/src/controllers/roomsControllers.js`
- `backend/src/routes/roomsRouters.js`
- `frontend/src/pages/RoomsPage.jsx`

### 6.9. Quản lý lớp tín chỉ

Chức năng:

- Tạo lớp tín chỉ.
- Xem danh sách lớp.
- Cập nhật thông tin lớp.
- Cập nhật trạng thái lớp.
- Xóa mềm.
- Xem/tạo lịch học của lớp.
- Gợi ý giảng viên phù hợp cho lớp.

Dữ liệu chính:

- `code`: mã lớp tín chỉ.
- `course_id`: học phần.
- `semester_id`: học kỳ.
- `status`: `OPEN`, `ASSIGNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`.
- `max_students`: số sinh viên tối đa.

File liên quan:

- `backend/src/models/Class.js`
- `backend/src/controllers/classesControllers.js`
- `backend/src/routes/classesRouters.js`
- `frontend/src/pages/ClassesPage.jsx`

### 6.10. Quản lý lịch học

Chức năng:

- Tạo lịch học cho lớp.
- Xem lịch học.
- Cập nhật lịch.
- Xóa mềm lịch.
- Gắn lịch với phòng học.

Dữ liệu chính:

- `class_id`: lớp tín chỉ.
- `day_of_week`: thứ trong tuần.
- `start_period`: tiết bắt đầu.
- `end_period`: tiết kết thúc.
- `room_id`: phòng học.

Quyền truy cập:

- `ADMIN`, `HEAD`, `LECTURER` được xem.
- `ADMIN` được tạo, cập nhật và xóa.

File liên quan:

- `backend/src/models/Schedule.js`
- `backend/src/controllers/schedulesControllers.js`
- `backend/src/routes/schedulesRouters.js`
- `frontend/src/pages/WeeklySchedulePage.jsx`

### 6.11. Quản lý lịch bận/rảnh của giảng viên

Chức năng:

- Giảng viên hoặc admin khai báo thời gian bận/rảnh.
- Dữ liệu này được dùng khi kiểm tra điều kiện phân công.

Dữ liệu chính:

- `lecturer_id`: giảng viên.
- `day_of_week`: thứ trong tuần.
- `start_period`: tiết bắt đầu.
- `end_period`: tiết kết thúc.
- `status`: `BUSY` hoặc `FREE`.

Quyền truy cập:

- `ADMIN`, `HEAD`, `LECTURER` được xem.
- `ADMIN`, `LECTURER` được tạo, cập nhật và xóa.

File liên quan:

- `backend/src/models/LecturerAvailability.js`
- `backend/src/controllers/lecturerAvailabilityControllers.js`
- `backend/src/routes/lecturerAvailabilityRouters.js`
- `frontend/src/pages/AvailabilityPage.jsx`

### 6.12. Phân công giảng dạy

Đây là nghiệp vụ trung tâm của đồ án.

Chức năng:

- Xem danh sách phân công.
- Xem chi tiết phân công.
- Tạo phân công trực tiếp.
- Đề xuất phân công.
- Kiểm tra phân công trước khi lưu.
- Duyệt phân công.
- Từ chối phân công.
- Thay đổi giảng viên đã phân công.
- Xóa mềm phân công.
- Tự động cập nhật trạng thái lớp khi phân công được duyệt.

Trạng thái phân công:

- `PENDING`: đang chờ duyệt.
- `APPROVED`: đã duyệt.
- `REJECTED`: đã từ chối.

Quyền truy cập:

- `ADMIN`, `HEAD`, `LECTURER` được xem.
- `ADMIN`, `HEAD` được đề xuất và kiểm tra.
- `ADMIN` được tạo trực tiếp, duyệt, từ chối, đổi giảng viên, cập nhật và xóa.

File liên quan:

- `backend/src/models/Assignment.js`
- `backend/src/controllers/assignmentsControllers.js`
- `backend/src/routes/assignmentsRouters.js`
- `backend/src/services/assignmentService.js`
- `backend/src/services/conflictService.js`
- `frontend/src/pages/AssignmentsPage.jsx`
- `frontend/src/services/assignmentService.js`

## 7. Nghiệp vụ kiểm tra xung đột phân công

Các kiểm tra chính nằm trong `backend/src/services/conflictService.js`.

### 7.1. Kiểm tra lớp và giảng viên tồn tại

Nếu `class_id` hoặc `lecturer_id` không hợp lệ, hệ thống trả lỗi:

- `CLASS_NOT_FOUND`
- `LECTURER_NOT_FOUND`

### 7.2. Kiểm tra trạng thái lớp

Khi tạo phân công mới, lớp thường phải ở trạng thái `OPEN`.

Nếu lớp không hợp lệ, hệ thống trả lỗi:

- `INVALID_STATUS_TRANSITION`

### 7.3. Kiểm tra lớp đã có phân công được duyệt

Một lớp không được có nhiều phân công `APPROVED` đồng thời.

Lỗi có thể trả về:

- `CLASS_ALREADY_ASSIGNED`

### 7.4. Kiểm tra trạng thái giảng viên

Giảng viên phải ở trạng thái `ACTIVE` để được phân công.

Lỗi có thể trả về:

- `INVALID_STATUS_TRANSITION`

### 7.5. Kiểm tra lớp phải có lịch học

Lớp cần có ít nhất một lịch học trước khi phân công.

Lỗi có thể trả về:

- `SCHEDULE_REQUIRED`

### 7.6. Kiểm tra trùng lịch giảng viên

Hệ thống so sánh lịch lớp cần phân công với các lớp đã được duyệt của cùng giảng viên. Nếu cùng thứ và khoảng tiết giao nhau, hệ thống báo trùng lịch.

Lỗi có thể trả về:

- `SCHEDULE_CONFLICT`

### 7.7. Kiểm tra lịch bận/rảnh của giảng viên

Nếu giảng viên khai báo `BUSY`, hệ thống không cho phân công vào khung giờ giao với lịch bận.

Nếu giảng viên có khai báo các khung `FREE`, lịch lớp phải nằm trong một khung rảnh đã khai báo.

Lỗi có thể trả về:

- `LECTURER_BUSY`
- `LECTURER_NOT_AVAILABLE`

### 7.8. Kiểm tra định mức giờ dạy

Hệ thống tính số tiết của lớp bằng công thức:

```text
số tiết = end_period - start_period + 1
```

Sau đó cộng với tổng giờ đã được duyệt của giảng viên trong cùng học kỳ. Nếu vượt `max_hours`, hệ thống báo lỗi.

Lỗi có thể trả về:

- `MAX_HOURS_EXCEEDED`

### 7.9. Kiểm tra sức chứa phòng

Nếu `max_students` của lớp lớn hơn `capacity` của phòng học, hệ thống báo phòng không đủ sức chứa.

Lỗi có thể trả về:

- `ROOM_CAPACITY_INVALID`

### 7.10. Kiểm tra trùng phòng

Hệ thống so sánh lịch phòng của lớp cần phân công với các lớp đã có phân công `APPROVED`. Nếu cùng phòng, cùng thứ và khoảng tiết giao nhau, hệ thống báo trùng phòng.

Lỗi có thể trả về:

- `ROOM_CONFLICT`

### 7.11. Gợi ý giảng viên

API gợi ý giảng viên sẽ:

- Lấy lớp tín chỉ và học phần tương ứng.
- Ưu tiên giảng viên thuộc cùng bộ môn với học phần.
- Chỉ xét giảng viên `ACTIVE`.
- Chạy đầy đủ kiểm tra điều kiện phân công.
- Loại giảng viên không hợp lệ.
- Sắp xếp giảng viên hợp lệ theo `current_hours` tăng dần để cân bằng khối lượng.

File liên quan:

- `getSuggestedLecturers` trong `backend/src/services/conflictService.js`
- Route `/classes/:class_id/suggest-lecturers`
- Route `/classes/:class_id/suggested-lecturers`

## 8. Lịch sử thay đổi phân công

Khi thay đổi giảng viên phụ trách một phân công, hệ thống tạo bản ghi lịch sử gồm:

- `assignment_id`: phân công.
- `old_lecturer_id`: giảng viên cũ.
- `new_lecturer_id`: giảng viên mới.
- `changed_at`: thời điểm thay đổi.

Chức năng này giúp truy vết việc đổi giảng viên sau khi đã phân công.

Quyền truy cập:

- `ADMIN`, `HEAD` được xem.
- `ADMIN` được tạo, cập nhật và xóa.

File liên quan:

- `backend/src/models/AssignmentHistory.js`
- `backend/src/controllers/assignmentHistoryController.js`
- `backend/src/routes/assignmentHistoryRouters.js`
- `frontend/src/pages/AssignmentHistoryPage.jsx`

## 9. Báo cáo

Hệ thống có nhóm API báo cáo tại `/reports`.

Chức năng:

- Báo cáo khối lượng giảng dạy của giảng viên.
- Báo cáo phân công.
- Xuất danh sách phân công.

Quyền truy cập:

- `ADMIN`, `HEAD` được xem báo cáo chính.
- `ADMIN` được xuất báo cáo phân công.

File liên quan:

- `backend/src/controllers/reportsController.js`
- `backend/src/routes/reportsRouters.js`
- `frontend/src/pages/ReportsPage.jsx`
- `frontend/src/services/reportService.js`

## 10. Giao diện frontend

Frontend không dùng thư viện router bên ngoài. Việc điều hướng được xử lý thủ công trong `frontend/src/App.jsx` bằng `window.history.pushState`, `popstate` và biến trạng thái `path`.

Các màn hình chính:

| Đường dẫn | Màn hình | Vai trò được truy cập |
|---|---|---|
| `/login` | Đăng nhập | Chưa đăng nhập |
| `/home` | Trang chủ | `ADMIN`, `HEAD`, `LECTURER` |
| `/teaching-schedule/weekly` | Lịch dạy tuần | `ADMIN`, `HEAD`, `LECTURER` |
| `/teaching-schedule/semester` | Lịch học kỳ | `ADMIN`, `HEAD`, `LECTURER` |
| `/lecturers` | Quản lý giảng viên | `ADMIN`, `HEAD` |
| `/classes` | Quản lý lớp tín chỉ | `ADMIN`, `HEAD`, `LECTURER` |
| `/assignments` | Phân công giảng dạy | `ADMIN`, `HEAD`, `LECTURER` |
| `/availability` | Lịch bận/rảnh | `ADMIN`, `LECTURER` |
| `/reports` | Báo cáo | `ADMIN`, `HEAD`, `LECTURER` |
| `/users` | Quản lý người dùng | `ADMIN` |
| `/courses` | Quản lý học phần | `ADMIN` |
| `/semesters` | Quản lý học kỳ | `ADMIN` |
| `/rooms` | Quản lý phòng học | `ADMIN` |
| `/departments` | Quản lý khoa/bộ môn | `ADMIN` |
| `/assignment-history` | Lịch sử phân công | `ADMIN`, `HEAD` |
| `/profile` | Hồ sơ cá nhân | `HEAD`, `LECTURER` |

Các component dùng chung:

- `AppLayout`: bố cục tổng thể sau đăng nhập.
- `Header`: thanh tiêu đề.
- `Sidebar`: menu điều hướng.
- `Button`, `Card`, `Field`, `Modal`, `Table`, `Badge`: bộ UI component dùng lại.

## 11. API chính

Backend mount API ở cả hai prefix:

- `/api/v1`
- `/api`

Prefix nên dùng trong frontend là:

```text
http://localhost:5000/api/v1
```

### 11.1. Xác thực

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/auth/login` | Đăng nhập |
| `GET` | `/auth/me` | Lấy thông tin người dùng hiện tại |
| `POST` | `/auth/change-password` | Đổi mật khẩu |
| `POST/PUT/PATCH` | `/change-password` | Đổi mật khẩu qua endpoint cấp prefix |

### 11.2. Người dùng và vai trò

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/users` | Danh sách người dùng |
| `POST` | `/users` | Tạo người dùng |
| `PUT` | `/users/:id` | Cập nhật người dùng |
| `DELETE` | `/users/:id` | Xóa mềm người dùng |
| `GET` | `/roles` | Danh sách vai trò |
| `POST` | `/roles` | Tạo vai trò |
| `PUT` | `/roles/:id` | Cập nhật vai trò |
| `DELETE` | `/roles/:id` | Xóa mềm vai trò |

### 11.3. Danh mục đào tạo

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/departments` | Danh sách khoa/bộ môn |
| `POST` | `/departments` | Tạo khoa/bộ môn |
| `PUT` | `/departments/:id` | Cập nhật khoa/bộ môn |
| `DELETE` | `/departments/:id` | Xóa mềm khoa/bộ môn |
| `GET` | `/courses` | Danh sách học phần |
| `POST` | `/courses` | Tạo học phần |
| `PUT` | `/courses/:id` | Cập nhật học phần |
| `DELETE` | `/courses/:id` | Xóa mềm học phần |
| `GET` | `/semesters` | Danh sách học kỳ |
| `POST` | `/semesters` | Tạo học kỳ |
| `PUT` | `/semesters/:id` | Cập nhật học kỳ |
| `DELETE` | `/semesters/:id` | Xóa mềm học kỳ |
| `GET` | `/rooms` | Danh sách phòng học |
| `POST` | `/rooms` | Tạo phòng học |
| `PUT` | `/rooms/:id` | Cập nhật phòng học |
| `DELETE` | `/rooms/:id` | Xóa mềm phòng học |

### 11.4. Giảng viên và lịch bận/rảnh

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/lecturers` | Danh sách giảng viên |
| `POST` | `/lecturers` | Tạo giảng viên |
| `PUT` | `/lecturers/:id` | Cập nhật giảng viên |
| `PATCH` | `/lecturers/:id/max-hours` | Cập nhật định mức giờ |
| `PATCH` | `/lecturers/:id/status` | Cập nhật trạng thái |
| `DELETE` | `/lecturers/:id` | Xóa mềm giảng viên |
| `GET` | `/lecturers/:lecturer_id/availability` | Lịch bận/rảnh của giảng viên |
| `POST` | `/lecturers/:lecturer_id/availability` | Tạo lịch bận/rảnh |
| `GET` | `/lecturers/:lecturer_id/teaching-schedule` | Lịch dạy của giảng viên |
| `GET` | `/lecturers/:lecturer_id/workload` | Khối lượng dạy của giảng viên |
| `GET` | `/availability` | Danh sách lịch bận/rảnh |
| `POST` | `/availability` | Tạo lịch bận/rảnh |
| `PUT` | `/availability/:id` | Cập nhật lịch bận/rảnh |
| `DELETE` | `/availability/:id` | Xóa mềm lịch bận/rảnh |

### 11.5. Lớp, lịch học và phân công

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/classes` | Danh sách lớp tín chỉ |
| `POST` | `/classes` | Tạo lớp tín chỉ |
| `PUT` | `/classes/:id` | Cập nhật lớp tín chỉ |
| `PATCH` | `/classes/:id/status` | Cập nhật trạng thái lớp |
| `DELETE` | `/classes/:id` | Xóa mềm lớp |
| `GET` | `/classes/:class_id/schedules` | Lịch học của lớp |
| `POST` | `/classes/:class_id/schedules` | Tạo lịch học cho lớp |
| `GET` | `/classes/:class_id/suggest-lecturers` | Gợi ý giảng viên |
| `GET` | `/schedules` | Danh sách lịch học |
| `POST` | `/schedules` | Tạo lịch học |
| `PUT` | `/schedules/:id` | Cập nhật lịch học |
| `DELETE` | `/schedules/:id` | Xóa mềm lịch học |
| `GET` | `/assignments` | Danh sách phân công |
| `POST` | `/assignments` | Tạo phân công trực tiếp |
| `POST` | `/assignments/propose` | Đề xuất phân công |
| `POST` | `/assignments/check` | Kiểm tra điều kiện phân công |
| `GET` | `/assignments/:id` | Chi tiết phân công |
| `PUT` | `/assignments/:id` | Cập nhật phân công |
| `DELETE` | `/assignments/:id` | Xóa mềm phân công |
| `PATCH` | `/assignments/:id/approve` | Duyệt phân công |
| `PATCH` | `/assignments/:id/reject` | Từ chối phân công |
| `PATCH` | `/assignments/:id/change-lecturer` | Đổi giảng viên |
| `GET` | `/assignments/:assignment_id/history` | Lịch sử của một phân công |
| `GET` | `/assignment-history` | Danh sách lịch sử phân công |

### 11.6. Báo cáo và lịch dạy cá nhân

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/reports/lecturer-workloads` | Báo cáo khối lượng giảng viên |
| `GET` | `/reports/assignments` | Báo cáo phân công |
| `GET` | `/reports/assignments/export` | Xuất báo cáo phân công |
| `GET` | `/me/teaching-schedule` | Giảng viên xem lịch dạy cá nhân |

## 12. Cơ sở dữ liệu

Hệ thống dùng MongoDB. Mỗi model đều có trường `is_deleted` để hỗ trợ xóa mềm.

### 12.1. User

Lưu tài khoản đăng nhập:

- `username`
- `password_hash`
- `role_id`
- `status`
- `must_change_password`
- `is_deleted`

### 12.2. Role

Lưu vai trò:

- `name`
- `code`
- `is_deleted`

### 12.3. Department

Lưu khoa/bộ môn:

- `code`
- `name`
- `description`
- `status`
- `is_deleted`

### 12.4. Lecturer

Lưu thông tin giảng viên:

- `code`
- `name`
- `email`
- `phone`
- `degree`
- `faculty`
- `department_id`
- `user_id`
- `max_hours`
- `status`
- `is_deleted`

### 12.5. Course

Lưu học phần:

- `code`
- `name`
- `credits`
- `department_id`
- `is_deleted`

### 12.6. Semester

Lưu học kỳ:

- `name`
- `start_date`
- `end_date`
- `is_deleted`

### 12.7. Class

Lưu lớp tín chỉ:

- `code`
- `course_id`
- `semester_id`
- `status`
- `max_students`
- `is_deleted`

### 12.8. Room

Lưu phòng học:

- `name`
- `capacity`
- `is_deleted`

### 12.9. Schedule

Lưu lịch học:

- `class_id`
- `day_of_week`
- `start_period`
- `end_period`
- `room_id`
- `is_deleted`

### 12.10. LecturerAvailability

Lưu lịch bận/rảnh:

- `lecturer_id`
- `day_of_week`
- `start_period`
- `end_period`
- `status`
- `is_deleted`

### 12.11. Assignment

Lưu phân công:

- `class_id`
- `lecturer_id`
- `status`
- `assigned_by`
- `note`
- `is_deleted`

### 12.12. AssignmentHistory

Lưu lịch sử đổi giảng viên:

- `assignment_id`
- `old_lecturer_id`
- `new_lecturer_id`
- `changed_at`
- `is_deleted`

## 13. Cài đặt và chạy dự án

### 13.1. Chạy bằng Docker Compose

Vào thư mục dự án:

```bash
cd CNPM-Nhom21
```

Chạy toàn bộ hệ thống:

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:5000/api/v1
```

Seed dữ liệu mẫu:

```bash
docker compose --profile seed run --rm seed-admin
```

Tài khoản mẫu sau khi seed:

```text
admin / 123456
gv001 / 123456
```

Dừng container:

```bash
docker compose down
```

Dừng và xóa cả database/node_modules volumes:

```bash
docker compose down -v
```

### 13.2. Chạy thủ công backend

Vào thư mục backend:

```bash
cd CNPM-Nhom21/backend
npm install
```

Tạo file `.env`:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/cnpm21
PORT=5000
```

Chạy dev server:

```bash
npm run dev
```

Chạy production-like:

```bash
npm start
```

Seed dữ liệu:

```bash
npm run seed:admin
npm run seed:lecturer
npm run seed:assignment-data
```

### 13.3. Chạy thủ công frontend

Vào thư mục frontend:

```bash
cd CNPM-Nhom21/frontend
npm install
```

Tạo file `.env` từ `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Chạy dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## 14. Kiểm thử

Backend có script test:

```bash
cd CNPM-Nhom21/backend
npm test
```

Hiện tại test đang kiểm tra hàm `rangesOverlap` trong `backend/src/utils/time.js`, dùng để xác định hai khoảng tiết có giao nhau hay không.

File test:

- `backend/test/conflictService.test.js`

## 15. Dữ liệu mẫu

Dự án có các script seed:

- `backend/src/seedAdmin.js`
- `backend/src/seedLecturer.js`
- `backend/src/seedAssignmentData.js`

Ngoài ra thư mục `bootstrap` có logic tạo dữ liệu mặc định:

- Tạo vai trò `ADMIN`.
- Tạo tài khoản `admin`.
- Tạo một số bộ môn mặc định: `CNTT`, `KHMT`, `HTTT`.

Biến môi trường có thể tắt seed mặc định:

- `SEED_DEFAULT_ADMIN=false`
- `SEED_DEFAULT_DEPARTMENTS=false`

## 16. Bảo mật

Các điểm bảo mật đã có:

- Mật khẩu được lưu dưới dạng `password_hash`, không lưu plain text trong database.
- Backend xác thực bằng Bearer token.
- API quan trọng có middleware `authenticate`.
- Phân quyền bằng `authorize`.
- Người dùng dùng mật khẩu mặc định `123456` sẽ bị yêu cầu đổi mật khẩu.
- Không nên commit chuỗi kết nối database thật hoặc thông tin nhạy cảm vào repository.

Lưu ý cải thiện:

- Nên tạo file `.env.example` cho backend để mô tả biến môi trường cần thiết.
- Nên xoay/đổi mật khẩu database nếu chuỗi kết nối thật từng bị chia sẻ trong source.
- Nên bổ sung thời hạn token, refresh token hoặc cơ chế đăng xuất server-side nếu triển khai thực tế.

## 17. Quy ước dữ liệu và trạng thái

### Trạng thái lớp

```text
OPEN
ASSIGNED
ACTIVE
COMPLETED
CANCELLED
```

### Trạng thái phân công

```text
PENDING
APPROVED
REJECTED
```

### Trạng thái giảng viên

```text
ACTIVE
BUSY
INACTIVE
```

### Trạng thái lịch bận/rảnh

```text
BUSY
FREE
```

### Trạng thái người dùng

```text
ACTIVE
INACTIVE
```

## 18. Luồng nghiệp vụ tiêu biểu

### 18.1. Luồng tạo phân công trực tiếp

1. `ADMIN` tạo học kỳ, phòng học, bộ môn, học phần, lớp tín chỉ và lịch học.
2. `ADMIN` tạo hoặc cập nhật giảng viên, định mức giờ và trạng thái.
3. `ADMIN` chọn lớp và giảng viên để tạo phân công.
4. Backend kiểm tra điều kiện phân công.
5. Nếu hợp lệ, hệ thống tạo `Assignment`.
6. Nếu trạng thái là `APPROVED`, lớp được cập nhật thành `ASSIGNED`.

### 18.2. Luồng đề xuất và duyệt phân công

1. `ADMIN` hoặc `HEAD` gửi đề xuất phân công qua `/assignments/propose`.
2. Hệ thống kiểm tra điều kiện.
3. Nếu hợp lệ, phân công được tạo với trạng thái `PENDING`.
4. `ADMIN` duyệt qua `/assignments/:id/approve` hoặc từ chối qua `/assignments/:id/reject`.
5. Khi duyệt, lớp chuyển sang `ASSIGNED`.
6. Khi từ chối, phân công chuyển sang `REJECTED` và cần ghi chú lý do.

### 18.3. Luồng đổi giảng viên

1. `ADMIN` chọn phân công cần đổi.
2. `ADMIN` chọn giảng viên mới.
3. Backend kiểm tra điều kiện phân công với giảng viên mới.
4. Nếu hợp lệ, cập nhật `lecturer_id` trong phân công.
5. Hệ thống tạo bản ghi `AssignmentHistory`.

### 18.4. Luồng giảng viên xem lịch dạy

1. Giảng viên đăng nhập.
2. Frontend gọi API lịch dạy cá nhân.
3. Backend xác định giảng viên liên kết với tài khoản.
4. Trả về danh sách lớp, lịch học, phòng học và thông tin liên quan.

## 19. Điểm mạnh của đồ án

- Phân tách rõ frontend, backend và database.
- Có phân quyền theo vai trò.
- Có nghiệp vụ kiểm tra xung đột trước khi phân công.
- Có hỗ trợ lịch bận/rảnh của giảng viên.
- Có lịch sử thay đổi phân công để truy vết.
- Có Docker Compose giúp chạy dự án nhanh.
- Giao diện được chia thành nhiều trang và component dùng lại.
- Backend có service riêng cho nghiệp vụ phức tạp, giúp controller gọn hơn.

## 20. Hạn chế và hướng phát triển

Một số điểm có thể cải thiện:

- Bổ sung test cho toàn bộ service phân công, controller và API.
- Bổ sung backend `.env.example`.
- Chuẩn hóa lại tên file sai chính tả như `couresControllers.js`.
- Áp dụng router thư viện như React Router nếu số lượng màn hình tăng.
- Bổ sung phân quyền sâu hơn cho `HEAD` theo bộ môn phụ trách.
- Bổ sung import/export Excel cho danh mục và phân công.
- Bổ sung thông báo khi phân công được duyệt hoặc bị từ chối.
- Bổ sung audit log cho các thao tác quan trọng khác ngoài đổi giảng viên.
- Bổ sung kiểm tra trùng lịch ngay khi tạo/cập nhật lịch học.
- Bổ sung phân trang, tìm kiếm nâng cao và lọc dữ liệu theo học kỳ/bộ môn/trạng thái.
- Tách cấu hình production và development rõ ràng hơn.

## 21. Kết luận

Đồ án CNPM Nhóm 21 là một hệ thống quản lý phân công giảng dạy tương đối đầy đủ, có đủ các phân hệ chính từ danh mục, người dùng, giảng viên, lớp tín chỉ, lịch học đến phân công và báo cáo. Phần nghiệp vụ nổi bật nhất là cơ chế kiểm tra điều kiện phân công, giúp hạn chế các lỗi thường gặp như trùng lịch, trùng phòng, vượt định mức giờ dạy hoặc phân công vào thời gian giảng viên bận.

Với kiến trúc React + Express + MongoDB và Docker Compose, dự án có thể tiếp tục mở rộng thành hệ thống sử dụng thực tế bằng cách bổ sung kiểm thử, bảo mật môi trường, phân quyền chi tiết và các tính năng báo cáo/xuất dữ liệu chuyên sâu.
