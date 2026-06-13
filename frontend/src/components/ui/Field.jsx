export function Input({ label, ...props }) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <input className="uis-input" {...props} />
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <select className="uis-select" {...props}>
        {children}
      </select>
    </label>
  );
}
