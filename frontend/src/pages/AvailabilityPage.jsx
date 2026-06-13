import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Field";
import { Table } from "../components/ui/Table";
import { lecturerService } from "../services/lecturerService";

export function AvailabilityPage({ user }) {
  const [lecturers, setLecturers] = useState([]);
  const [lecturerId, setLecturerId] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ day_of_week: 2, start_period: 1, end_period: 3, status: "BUSY" });
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    lecturerService.getLecturers().then((data) => {
      setLecturers(data);
      setLecturerId(data[0]?._id || "");
    }).catch(() => setLecturers([]));
  }, []);

  useEffect(() => {
    if (lecturerId) lecturerService.getAvailability(lecturerId).then(setItems).catch(() => setItems([]));
  }, [lecturerId]);

  const submit = async (event) => {
    event.preventDefault();
    await lecturerService.createAvailability(lecturerId, form);
    const data = await lecturerService.getAvailability(lecturerId);
    setItems(data);
  };

  return (
    <Card title="Khai báo lịch bận / lịch rảnh">
      {isAdmin && (
        <Select label="Giảng viên" value={lecturerId} onChange={(e) => setLecturerId(e.target.value)}>
          {lecturers.map((item) => <option key={item._id} value={item._id}>{item.code} - {item.name}</option>)}
        </Select>
      )}
      <form className="filter-row" onSubmit={submit}>
        <Input label="Thứ" type="number" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} />
        <Input label="Tiết bắt đầu" type="number" value={form.start_period} onChange={(e) => setForm({ ...form, start_period: Number(e.target.value) })} />
        <Input label="Tiết kết thúc" type="number" value={form.end_period} onChange={(e) => setForm({ ...form, end_period: Number(e.target.value) })} />
        <Select label="Trạng thái" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="BUSY">BUSY</option>
          <option value="FREE">FREE</option>
        </Select>
        <Button type="submit">Lưu</Button>
      </form>
      <Table
        columns={[
          { key: "day_of_week", title: "Thứ" },
          { key: "start_period", title: "Tiết bắt đầu" },
          { key: "end_period", title: "Tiết kết thúc" },
          { key: "status", title: "Trạng thái", render: (row) => <Badge>{row.status}</Badge> },
        ]}
        rows={items}
      />
    </Card>
  );
}
