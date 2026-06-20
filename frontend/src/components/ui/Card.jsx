export function Card({ title, actions, children, className = "" }) {
  return (
    <section className={`uis-card ${className}`}>
      {(title || actions) && (
        <div className="uis-card-header">
          <h2>{title}</h2>
          <div className="card-actions">{actions}</div>
        </div>
      )}
      {children}
    </section>
  );
}
