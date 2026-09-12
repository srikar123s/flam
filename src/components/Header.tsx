import React from 'react';
import { Layout, Cpu, RefreshCw } from 'lucide-react';
import { AdSpec } from '../engine/types';

interface HeaderProps {
  ads: AdSpec[];
  selectedAdId: string;
  onSelectAd: (adId: string) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ads,
  selectedAdId,
  onSelectAd,
  onReset,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <Layout size={20} className="logo-icon" />
        </div>
        <div className="brand-title-group">
          <div className="brand-title">
            <span>FLAM</span>
            <span className="divider">/</span>
            <span className="accent">Adaptive Layout Engine</span>
          </div>
          <p className="brand-subtitle">
            Constraint-Based Multi-Surface Ad Composer
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className="ad-selector">
          <label htmlFor="ad-spec-select">Ad Spec:</label>
          <select
            id="ad-spec-select"
            value={selectedAdId}
            onChange={(e) => onSelectAd(e.target.value)}
          >
            {ads.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title}
              </option>
            ))}
          </select>
        </div>

        <div className="version-badge">
          <Cpu size={14} />
          <span>TypeScript Engine v1.0</span>
        </div>

        <button className="icon-button" onClick={onReset} title="Reset Engine">
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
};
