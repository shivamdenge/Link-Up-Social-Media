import React, { isValidElement } from 'react';

/**
 * Empty state component with icon, title, and description.
 * Defensively renders icon whether provided as a JSX element or component reference.
 */
export function EmptyState({ icon, title, description, action }) {
  let renderedIcon = null;
  if (isValidElement(icon)) {
    renderedIcon = icon;
  } else if (typeof icon === 'function') {
    renderedIcon = React.createElement(icon, { size: 32 });
  } else if (icon) {
    renderedIcon = icon;
  }

  return (
    <div className="empty-state animate-fade-in">
      {renderedIcon && (
        <div className="empty-state-icon">
          {renderedIcon}
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

