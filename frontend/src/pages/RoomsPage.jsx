import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { useResourceList } from "../hooks/useResourceList";
import { api } from "../services/api";
import { errorText } from "../utils/format";

const emptyForm = {
  name: "",
  capacity: 80,
};

const toForm = (room) => ({
  name: room?.name || "",
  capacity: room?.capacity || 80,
});

export function RoomsPage() {
  const { filteredRows, keyword, setKeyword, loading, error, setError, load } = useResourceList("/rooms", {
    searchKeys: ["name", "capacity"],
  });
  const [modal, setModal] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setError("");
    setSelectedRoom(null);
    setForm(emptyForm);
    setModal("Thêm phòng học");
  };

  const openEdit = (room) => {
    setError("");
    setSelectedRoom(room);
    setForm(toForm(room));
    setModal("Sửa phòng học");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (isNaN(form.capacity) || Number(form.capacity) <= 0) {
      setError("Sức chứa phòng học phải là số dương lớn hơn 0");
      return;
    }
    try {
      if (selectedRoom) {
        await api.put(`/rooms/${selectedRoom._id}`, form);
      } else {
        await api.post("/rooms", form);
      }
      setModal("");
      setSelectedRoom(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.payload?.errors?.map((item) => item.message || item).join(", ") || err.message);
    }
  };

  const remove = async (room) => {
    if (window.confirm(`Xác nhận xóa phòng ${room.name}?`)) {
      await api.delete(`/rooms/${room._id}`);
      load();
    }
  };

  const columns = [
    { key: "name", title: "Tên phòng", render: (row) => row.name },
    { key: "capacity", title: "Sức chứa", render: (row) => `${row.capacity} chỗ` },
    {
      key: "actions",
      title: "Hành động",
      render: (row) => (
        <div className="row-actions">
          <Button variant="outline" onClick={() => openEdit(row)}>Sửa</Button>
          <Button variant="danger" onClick={() => remove(row)}>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Quản lý phòng học"
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
        {error && <div className="alert danger">{error}</div>}
        <Table columns={columns} rows={filteredRows} loading={loading} />
      </Card>

      <Modal title={modal} onClose={() => setModal("")}>
        <form className="form-grid" onSubmit={submit}>
          <Input label="Tên phòng" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Sức chứa" type="number" min={10} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} required />
          {error && <div className="alert danger">{error}</div>}
          <Button className="form-submit" type="submit">Lưu</Button>
        </form>
      </Modal>
    </>
  );
}
