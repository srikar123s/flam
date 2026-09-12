import React from 'react';
import { Sliders, Trash2 } from 'lucide-react';
import { AdElement, ResolvedElement } from '../engine/types';

interface PropertiesSidebarProps {
  selectedElement: AdElement | null;
  resolvedElement: ResolvedElement | null;
  onUpdateElement: (updated: AdElement) => void;
  onUpdateGeometry?: (id: string, geom: { x?: number; y?: number; width?: number; height?: number }) => void;
  onDeleteElement: (id: string) => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  selectedElement,
  resolvedElement,
  onUpdateElement,
  onUpdateGeometry,
  onDeleteElement,
}) => {
  if (!selectedElement) {
    return (
      <div className="properties-sidebar empty-props">
        <Sliders size={20} className="muted-icon" />
        <p className="empty-txt">Select an element to view and edit properties.</p>
      </div>
    );
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'PRIMARY';
      case 2:
        return 'SECONDARY';
      case 3:
      default:
        return 'TERTIARY';
    }
  };

  const handleContentChange = (val: string) => {
    if (selectedElement.type === 'text') {
      onUpdateElement({ ...selectedElement, content: val });
    } else if (selectedElement.type === 'button') {
      onUpdateElement({ ...selectedElement, label: val });
    }
  };

  return (
    <div className="properties-sidebar">
      <div className="props-header">
        <span className="props-title">Properties</span>
        <span className={`props-tag p-${selectedElement.priority}`}>
          {getPriorityLabel(selectedElement.priority)}
        </span>
      </div>

      <div className="props-body">
        <h3 className="element-display-title">{selectedElement.id}</h3>

        {/* Text Content / Label Edit */}
        {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
          <div className="prop-group">
            <label htmlFor="prop-label-input">Label / Text Content</label>
            <textarea
              id="prop-label-input"
              rows={3}
              value={
                selectedElement.type === 'text'
                  ? selectedElement.content
                  : selectedElement.label
              }
              onChange={(e) => handleContentChange(e.target.value)}
            />
          </div>
        )}

        {/* Priority & Role */}
        <div className="prop-row">
          <div className="prop-group">
            <label htmlFor="prop-priority-select">Priority</label>
            <select
              id="prop-priority-select"
              value={selectedElement.priority}
              onChange={(e) =>
                onUpdateElement({
                  ...selectedElement,
                  priority: parseInt(e.target.value) as any,
                })
              }
            >
              <option value={1}>Priority 1 (Primary)</option>
              <option value={2}>Priority 2 (Secondary)</option>
              <option value={3}>Priority 3 (Tertiary)</option>
            </select>
          </div>

          <div className="prop-group">
            <label htmlFor="prop-role-select">Role</label>
            <select
              id="prop-role-select"
              value={selectedElement.role}
              onChange={(e) =>
                onUpdateElement({
                  ...selectedElement,
                  role: e.target.value as any,
                })
              }
            >
              <option value="primary">Primary</option>
              <option value="hero">Hero</option>
              <option value="action">Action</option>
              <option value="secondary">Secondary</option>
              <option value="branding">Branding</option>
            </select>
          </div>
        </div>

        {/* Position X & Y */}
        <div className="section-divider">
          <span>POSITION</span>
        </div>

        <div className="prop-row">
          <div className="prop-group">
            <label htmlFor="prop-x-input">X</label>
            <input
              id="prop-x-input"
              type="number"
              value={resolvedElement?.x ?? 0}
              onChange={(e) =>
                onUpdateGeometry?.(selectedElement.id, {
                  x: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="prop-group">
            <label htmlFor="prop-y-input">Y</label>
            <input
              id="prop-y-input"
              type="number"
              value={resolvedElement?.y ?? 0}
              onChange={(e) =>
                onUpdateGeometry?.(selectedElement.id, {
                  y: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        {/* Dimensions Width & Height */}
        <div className="section-divider">
          <span>DIMENSIONS</span>
        </div>

        <div className="prop-row">
          <div className="prop-group">
            <label htmlFor="prop-width-input">Width</label>
            <input
              id="prop-width-input"
              type="number"
              value={resolvedElement?.width ?? 0}
              onChange={(e) =>
                onUpdateGeometry?.(selectedElement.id, {
                  width: parseInt(e.target.value) || 10,
                })
              }
            />
          </div>

          <div className="prop-group">
            <label htmlFor="prop-height-input">Height</label>
            <input
              id="prop-height-input"
              type="number"
              value={resolvedElement?.height ?? 0}
              onChange={(e) =>
                onUpdateGeometry?.(selectedElement.id, {
                  height: parseInt(e.target.value) || 10,
                })
              }
            />
          </div>
        </div>

        {/* Delete Element Button */}
        <div className="delete-action-container">
          <button
            className="delete-el-btn"
            onClick={() => onDeleteElement(selectedElement.id)}
          >
            <Trash2 size={14} />
            <span>Delete element</span>
          </button>
        </div>
      </div>
    </div>
  );
};
