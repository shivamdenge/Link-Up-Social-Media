/**
 * Empty state component with icon, title, and description.
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state animate-fade-in">
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      <div>
        <p className="empty-state-title">{title}</p>
        {description && <p className="empty-state-desc">{description}</p>}
      </div>
      {action && action}
    </div>
  );
}
