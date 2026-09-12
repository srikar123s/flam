import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmptyState: React.FC<{ message?: string }> = ({
  message = 'No layout resolution available.',
}) => {
  return (
    <div className="empty-state">
      <AlertCircle size={32} className="empty-icon" />
      <p>{message}</p>
    </div>
  );
};
