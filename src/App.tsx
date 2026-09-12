import React, { useState, useMemo } from 'react';
import { SAMPLE_ADS } from './data/adSpec';
import { PRESET_SURFACES } from './data/surfaces';
import { SurfaceProfile, AdSpec, AdElement, ResolvedLayout } from './engine/types';
import { createCustomSurface } from './engine/surfaces';
import { resolveLayout } from './engine/resolver';
import { Header } from './components/Header';
import { SurfaceSelector } from './components/SurfaceSelector';
import { ElementsSidebar } from './components/ElementsSidebar';
import { PropertiesSidebar } from './components/PropertiesSidebar';
import { AdPreview } from './components/AdPreview';
import { ResolutionLog } from './components/ResolutionLog';
import { ConstraintPanel } from './components/ConstraintPanel';
import { Sparkles } from 'lucide-react';
import './styles.css';

export const App: React.FC = () => {
  // Spec state
  const [adSpecs, setAdSpecs] = useState<AdSpec[]>(SAMPLE_ADS);
  const [selectedAdId, setSelectedAdId] = useState<string>(SAMPLE_ADS[0].id);

  // Surface state
  const surfaces = PRESET_SURFACES;
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

  // Interactive selection & manual geometry overrides state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [manualGeometry, setManualGeometry] = useState<
    Record<string, { x?: number; y?: number; width?: number; height?: number }>
  >({});

  // Re-adapt toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeAd = useMemo(() => {
    return adSpecs.find((ad) => ad.id === selectedAdId) ?? adSpecs[0];
  }, [adSpecs, selectedAdId]);

  const activeSurface = useMemo(() => {
    if (isCustomActive) {
      return customSurface;
    }
    return surfaces.find((s) => s.id === activeSurfaceId) ?? surfaces[0];
  }, [surfaces, activeSurfaceId, isCustomActive, customSurface]);

  // Execute engine resolution
  const resolvedLayout: ResolvedLayout = useMemo(() => {
    const rawLayout = resolveLayout(activeAd, activeSurface);

    // Apply manual geometry overrides if present
    if (Object.keys(manualGeometry).length === 0) {
      return rawLayout;
    }

    const updatedElements = rawLayout.elements.map((el) => {
      const override = manualGeometry[el.id];
      if (override) {
        return {
          ...el,
          x: override.x ?? el.x,
          y: override.y ?? el.y,
          width: override.width ?? el.width,
          height: override.height ?? el.height,
        };
      }
      return el;
    });

    return {
      ...rawLayout,
      elements: updatedElements,
    };
  }, [activeAd, activeSurface, manualGeometry]);

  const selectedAdElement = useMemo(() => {
    if (!selectedElementId) return null;
    return activeAd.elements.find((e) => e.id === selectedElementId) ?? null;
  }, [activeAd, selectedElementId]);

  const selectedResolvedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return resolvedLayout.elements.find((e) => e.id === selectedElementId) ?? null;
  }, [resolvedLayout, selectedElementId]);

  // Handlers
  const handleAdaptLayouts = () => {
    // Clear manual overrides and re-evaluate layout solver constraints
    setManualGeometry({});
    setToastMessage(`Layout Re-Adapted & Optimized for ${activeSurface.name}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReset = () => {
    setAdSpecs(SAMPLE_ADS);
    setSelectedAdId(SAMPLE_ADS[0].id);
    setActiveSurfaceId(PRESET_SURFACES[0].id);
    setIsCustomActive(false);
    setSelectedElementId(null);
    setManualGeometry({});
    setToastMessage('Reset demo creative spec and surface defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateElement = (updated: AdElement) => {
    setAdSpecs((prev) =>
      prev.map((ad) => {
        if (ad.id !== activeAd.id) return ad;
        return {
          ...ad,
          elements: ad.elements.map((el) => (el.id === updated.id ? updated : el)),
        };
      })
    );
  };

  const handleUpdateGeometry = (
    id: string,
    geom: { x?: number; y?: number; width?: number; height?: number }
  ) => {
    setManualGeometry((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...geom,
      },
    }));
  };

  const handleAddTextElement = () => {
    const newId = `subtext-${Date.now().toString().slice(-4)}`;
    const newElement: AdElement = {
      id: newId,
      type: 'text',
      role: 'branding',
      priority: 3,
      content: 'New supporting text',
      baseFontSize: 13,
      fontWeight: 'normal',
      color: '#94a3b8',
    };

    setAdSpecs((prev) =>
      prev.map((ad) => {
        if (ad.id !== activeAd.id) return ad;
        return {
          ...ad,
          elements: [...ad.elements, newElement],
        };
      })
    );
    setSelectedElementId(newId);
  };

  const handleDeleteElement = (id: string) => {
    setAdSpecs((prev) =>
      prev.map((ad) => {
        if (ad.id !== activeAd.id) return ad;
        return {
          ...ad,
          elements: ad.elements.filter((el) => el.id !== id),
        };
      })
    );
    setSelectedElementId(null);
  };

  return (
    <div className="app-container">
      <Header
        ads={adSpecs}
        selectedAdId={selectedAdId}
        surfaces={surfaces}
        activeSurfaceId={activeSurfaceId}
        onSelectAd={setSelectedAdId}
        onSelectSurfaceId={(id) => {
          setIsCustomActive(false);
          setActiveSurfaceId(id);
        }}
        onAdaptLayouts={handleAdaptLayouts}
        onReset={handleReset}
      />

      <SurfaceSelector
        surfaces={surfaces}
        activeSurfaceId={activeSurfaceId}
        isCustomActive={isCustomActive}
        onSelectSurface={(s) => {
          setIsCustomActive(false);
          setActiveSurfaceId(s.id);
        }}
        onToggleCustom={() => setIsCustomActive(true)}
      />

      {/* Toast Notification Banner when Adapt Layouts is clicked */}
      {toastMessage && (
        <div
          style={{
            margin: '8px 24px 0 24px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#a5b4fc',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <Sparkles size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {isCustomActive && (
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <ConstraintPanel
            customSurface={customSurface}
            onChangeCustomSurface={setCustomSurface}
          />
        </div>
      )}

      <div className="workspace-three-column">
        {/* Left Column: Elements Nav */}
        <ElementsSidebar
          spec={activeAd}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onAddTextElement={handleAddTextElement}
        />

        {/* Middle Column: Live Preview & Canvas */}
        <div className="center-stage">
          <AdPreview
            layout={resolvedLayout}
            spec={activeAd}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />

          <ResolutionLog
            decisions={resolvedLayout.decisions}
            warnings={resolvedLayout.warnings}
          />
        </div>

        {/* Right Column: Properties Inspector */}
        <PropertiesSidebar
          selectedElement={selectedAdElement}
          resolvedElement={selectedResolvedElement}
          onUpdateElement={handleUpdateElement}
          onUpdateGeometry={handleUpdateGeometry}
          onDeleteElement={handleDeleteElement}
        />
      </div>
    </div>
  );
};

export default App;
