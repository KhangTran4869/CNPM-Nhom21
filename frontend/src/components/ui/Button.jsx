export function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  return (
    <button className={`uis-btn uis-btn-${variant} ${className}`} type={type} {...props}>
      {children}
    </button>
  );
}
