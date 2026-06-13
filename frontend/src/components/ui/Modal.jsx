import { Button } from "./Button";

export function Modal({ title, children, onClose }) {
  if (!title) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        {children}
      </div>
    </div>
  );
}
