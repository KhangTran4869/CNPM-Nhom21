const fallback = "Chưa cập nhật";

/**
 * Component hiển thị 1 ô thông tin nhãn - giá trị
 */
export function InfoCell({ label, value }) {
  return (
    <div className="info-cell">
      <span>{label}</span>
      <strong>{value || fallback}</strong>
    </div>
  );
}
