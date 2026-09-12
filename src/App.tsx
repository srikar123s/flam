import React, { useState, useMemo } from 'react';
import { SAMPLE_ADS } from './data/adSpec';
import { PRESET_SURFACES } from './data/surfaces';
import { SurfaceProfile } from './engine/types';
import { createCustomSurface } from './engine/surfaces';
import { resolveLayout } from './engine/resolver';
import { Header } from './components/Header';
import { SurfaceSelector } from './components/SurfaceSelector';
import { ConstraintPanel } from './components/ConstraintPanel';
import { AdPreview } from './components/AdPreview';
import { ElementInspector } from './components/ElementInspector';
import { ResolutionLog } from './components/ResolutionLog';
import './styles.css';

export const App: React.FC = () => {
  const [selectedAdId, setSelectedAdId] = useState<string>(SAMPLE_ADS[0].id);
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>(PRESET_SURFACES[0].id);
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);

  const [customSurface, setCustomSurface] = useState<SurfaceProfile>(() =>
    createCustomSurface({
      name: 'Custom Surface',
      width: 500,
      height: 700,
      minTapTarget: 48,
      minTextSize: 16,
      safeArea: { top: 20, right: 20, bottom: 20, left: 20 },
    })
  );

  const activeAd = useMemo(() => {
    return SAMPLE_ADS.find((ad) => ad.id === selectedAdId) ?? SAMPLE_ADS[0];
  }, [selectedAdId]);

  const activeSurface = useMemo(() => {
    if (isCustomActive) {
      return customSurface;
    }
    return PRESET_SURFACES.find((s) => s.id === activeSurfaceId) ?? PRESET_SURFACES[0];
  }, [activeSurfaceId, isCustomActive, customSurface]);

  // Execute constraint resolution engine dynamically
  const resolvedLayout = useMemo(() => {
    return resolveLayout(activeAd, activeSurface);
  }, [activeAd, activeSurface]);

  const handleSelectPresetSurface = (surface: SurfaceProfile) => {
    setIsCustomActive(false);
    setActiveSurfaceId(surface.id);
  };

  const handleToggleCustom = () => {
    setIsCustomActive(true);
  };

  const handleReset = () => {
    setSelectedAdId(SAMPLE_ADS[0].id);
    setActiveSurfaceId(PRESET_SURFACES[0].id);
    setIsCustomActive(false);
  };

  return (
    <div className="app-container">
      <Header
        ads={SAMPLE_ADS}
        selectedAdId={selectedAdId}
        onSelectAd={setSelectedAdId}
        onReset={handleReset}
      />

      <SurfaceSelector
        surfaces={PRESET_SURFACES}
        activeSurfaceId={activeSurfaceId}
        isCustomActive={isCustomActive}
        onSelectSurface={handleSelectPresetSurface}
        onToggleCustom={handleToggleCustom}
      />

      <main className="dashboard-main">
        {isCustomActive && (
          <ConstraintPanel
            customSurface={customSurface}
            onChangeCustomSurface={setCustomSurface}
          />
        )}

        <div className="top-section-grid">
          <AdPreview layout={resolvedLayout} spec={activeAd} />
          <ElementInspector layout={resolvedLayout} spec={activeAd} />
        </div>

        <ResolutionLog
          decisions={resolvedLayout.decisions}
          warnings={resolvedLayout.warnings}
        />
      </main>
    </div>
  );
};

export default App;
