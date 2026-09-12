import React from 'react';
import { Terminal, AlertTriangle } from 'lucide-react';
import { ResolutionDecision } from '../engine/types';

interface ResolutionLogProps {
  decisions: ResolutionDecision[];
  warnings: string[];
}

export const ResolutionLog: React.FC<ResolutionLogProps> = ({ decisions, warnings }) => {
  const getCategoryBadgeClass = (category: ResolutionDecision['category']) => {
    switch (category) {
      case 'composition':
        return 'badge-comp';
      case 'sizing':
        return 'badge-sizing';
      case 'placement':
        return 'badge-place';
      case 'degradation':
        return 'badge-deg';
      case 'validation':
        return 'badge-val';
      default:
        return '';
    }
  };

  return (
    <div className="resolution-log-panel">
      <div className="panel-header">
        <div className="header-title">
          <Terminal size={16} />
          <span>Resolution Decisions & Audit Log</span>
          <span className="log-count">{decisions.length} Steps Logged</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warnings-banner">
          <div className="banner-title">
            <AlertTriangle size={14} />
            <span>Resolution Warnings ({warnings.length})</span>
          </div>
          <ul className="warnings-list">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="log-entries">
        {decisions.map((entry, idx) => (
          <div key={idx} className="log-row">
            <span className="step-num">0{entry.step}</span>
            <span className={`cat-badge ${getCategoryBadgeClass(entry.category)}`}>
              {entry.category}
            </span>
            <div className="log-body">
              <span className="log-action">{entry.action}</span>
              <p className="log-reason">{entry.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
