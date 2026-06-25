import { Card } from "../components/ui/Card";

export function ForbiddenPage() {
  return (
    <Card title="403">
      <div className="empty-page">Bạn không có quyền truy cập chức năng này.</div>
    </Card>
  );
}

export function ComingSoonPage({ title = "Chức năng đang hoàn thiện" }) {
  return (
    <Card title={title}>
      <div className="empty-page">Màn hình này đã được đặt trong menu và sẵn sàng mở rộng.</div>
    </Card>
  );
}
