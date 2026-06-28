import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { api } from "../services/api";
import { catalogService } from "../services/catalogService";
import { errorText } from "../utils/format";

const emptyForm = {
  username: "",
  password: "",
  role_id: "",
  status: "ACTIVE",
};

export function UsersPage({ user }) {
  const { filteredRows, keyword, setKeyword, loading, error, setError, load } = useResourceList("/users", {
    searchKeys: ["username", "role_id.code", "role", "status"],
  });
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    catalogService.getRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  const openCreate = () => {
    setError("");
    setMessage("");
    setSelectedUser(null);
    setForm({ ...emptyForm, role_id: roles[0]?._id || "" });
    setModal("Thêm tài khoản");
  };

  const openEdit = (row) => {
    setError("");
    setMessage("");
    setSelectedUser(row);
    setForm({
      username: row.username || "",
      password: "",
      role_id: row.role_id?._id || row.role_id || "",
      status: row.status || "ACTIVE",
    });
    setModal("Sửa tài khoản");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (selectedUser) {
        const payload = { role_id: form.role_id, status: form.status, username: form.username };
        if (form.password.trim()) payload.password = form.password;
        await api.put(`/users/${selectedUser._id}`, payload);
        setMessage("Cập nhật tài khoản thành công");
      } else {
        await api.post("/users", form);
        setMessage("Thêm mới tài khoản thành công");
      }
      setModal("");
      setSelectedUser(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(errorText(err, "Không thể lưu tài khoản"));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Xóa tài khoản ${row.username}?`)) return;
    setError("");
    setMessage("");
    try {
      await api.delete(`/users/${row._id}`);
      setMessage(`Đã xóa tài khoản ${row.username}`);
      load();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const columns = [
    { key: "username", title: "Username" },
    { key: "role", title: "Role", render: (row) => row.role || row.role_id?.code || "N/A" },
    { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => {
        const isCurrentAdmin = user && (row._id === user._id || row.id === user.id || row.username === user.username);
        if (isCurrentAdmin) {
          return <Badge>Đang đăng nhập</Badge>;
        }
        return (
          <div className="row-actions">
            <Button variant="outline" onClick={() => openEdit(row)}>Sửa</Button>
            <Button variant="danger" onClick={() => remove(row)}>Xóa</Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card
        title="Quản lý tài khoản"
        actions={
          <div className="row-actions">
            <Button onClick={openCreate}>Thêm mới</Button>
            <Button variant="outline" onClick={() => load()}>Làm mới</Button>
          </div>
        }
      >
        <div className="filter-row">
          <Input label="Tìm kiếm" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </div>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={filteredRows} loading={loading} />
      </Card>

      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Tên đăng nhập" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required placeholder="VD: giangvien_a" />
          <Input label={selectedUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!selectedUser} minLength={selectedUser && !form.password ? undefined : 6} placeholder="Ít nhất 6 ký tự" />
          <Select label="Vai trò" value={form.role_id} onChange={(event) => setForm({ ...form, role_id: event.target.value })} required>
            <option value="">Chọn vai trò</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name} ({role.code})</option>
            ))}
          </Select>
          <Select label="Trạng thái" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
