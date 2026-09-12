import React from 'react';
import { Type, Image, Touchpad, Plus, Layers } from 'lucide-react';
import { AdSpec, AdElement } from '../engine/types';

interface ElementsSidebarProps {
  spec: AdSpec;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onAddTextElement: () => void;
}

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
  spec,
  selectedElementId,
  onSelectElement,
  onAddTextElement,
}) => {
  const getIcon = (type: AdElement['type']) => {
    switch (type) {
      case 'text':
        return <Type size={14} />;
      case 'image':
        return <Image size={14} />;
      case 'button':
        return <Touchpad size={14} />;
    }
  };

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

  return (
    <div className="elements-sidebar">
      <div className="sidebar-header">
        <div className="title-group">
          <Layers size={16} />
          <span>Elements</span>
        </div>
        <span className="subtitle">Click an element to edit it.</span>
      </div>

      <div className="elements-nav-list">
        {spec.elements.map((el) => {
          const isSelected = selectedElementId === el.id;
          const label = el.type === 'text' ? el.content : el.type === 'button' ? el.label : el.id;

          return (
            <button
              key={el.id}
              className={`element-item-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectElement(el.id)}
            >
              <div className="btn-left">
                <span className="type-icon">{getIcon(el.type)}</span>
                <span className="el-name" title={label}>
                  {el.id}
                </span>
              </div>
              <span className={`priority-pill p-${el.priority}`}>
                {getPriorityLabel(el.priority)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button className="add-text-btn" onClick={onAddTextElement}>
          <Plus size={14} />
          <span>Add text</span>
        </button>
      </div>
    </div>
  );
};
